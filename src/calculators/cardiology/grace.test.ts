import { describe, expect, it } from 'vitest'
import { calculateGRACE, getGRACERiskCategory, type GRACEInput } from './grace'

const base: GRACEInput = {
  ageYears: 30,
  heartRate: 50,
  systolicBP: 200,
  creatinineUmolL: 0,
  killipClass: 1,
  cardiacArrestAtAdmission: false,
  stSegmentDeviation: false,
  elevatedCardiacBiomarkers: false,
}
const calc = (overrides: Partial<GRACEInput>) => calculateGRACE({ ...base, ...overrides })

describe('calculateGRACE — original GRACE in-hospital mortality score', () => {
  it('calculates the minimum component score for valid adult inputs', () => {
    const result = calc({})
    expect(result.score).toBe(1)
    expect(result.riskCategory).toBe('low')
  })

  it('applies every age band at its boundaries', () => {
    expect(calc({ ageYears: 30 }).components[0].points).toBe(0)
    expect(calc({ ageYears: 31 }).components[0].points).toBe(8)
    expect(calc({ ageYears: 40 }).components[0].points).toBe(25)
    expect(calc({ ageYears: 50 }).components[0].points).toBe(41)
    expect(calc({ ageYears: 60 }).components[0].points).toBe(58)
    expect(calc({ ageYears: 70 }).components[0].points).toBe(75)
    expect(calc({ ageYears: 80 }).components[0].points).toBe(91)
    expect(calc({ ageYears: 90 }).components[0].points).toBe(100)
  })

  it('applies every heart-rate band at its boundaries', () => {
    expect(calc({ heartRate: 50 }).components[1].points).toBe(0)
    expect(calc({ heartRate: 51 }).components[1].points).toBe(3)
    expect(calc({ heartRate: 70 }).components[1].points).toBe(9)
    expect(calc({ heartRate: 90 }).components[1].points).toBe(15)
    expect(calc({ heartRate: 110 }).components[1].points).toBe(24)
    expect(calc({ heartRate: 150 }).components[1].points).toBe(38)
    expect(calc({ heartRate: 200 }).components[1].points).toBe(46)
  })

  it('applies every systolic blood-pressure band at its boundaries', () => {
    expect(calc({ systolicBP: 80 }).components[2].points).toBe(58)
    expect(calc({ systolicBP: 81 }).components[2].points).toBe(53)
    expect(calc({ systolicBP: 100 }).components[2].points).toBe(43)
    expect(calc({ systolicBP: 120 }).components[2].points).toBe(34)
    expect(calc({ systolicBP: 140 }).components[2].points).toBe(24)
    expect(calc({ systolicBP: 160 }).components[2].points).toBe(10)
    expect(calc({ systolicBP: 200 }).components[2].points).toBe(0)
  })

  it('applies converted SI creatinine thresholds, including the >4 mg/dL band', () => {
    expect(calc({ creatinineUmolL: 35.35 }).components[3].points).toBe(1)
    expect(calc({ creatinineUmolL: 35.36 }).components[3].points).toBe(4)
    expect(calc({ creatinineUmolL: 70.72 }).components[3].points).toBe(7)
    expect(calc({ creatinineUmolL: 106.08 }).components[3].points).toBe(10)
    expect(calc({ creatinineUmolL: 141.44 }).components[3].points).toBe(13)
    expect(calc({ creatinineUmolL: 176.8 }).components[3].points).toBe(21)
    expect(calc({ creatinineUmolL: 353.6 }).components[3].points).toBe(21)
    expect(calc({ creatinineUmolL: 353.7 }).components[3].points).toBe(28)
  })

  it('scores Killip classes and the three additional binary predictors independently', () => {
    expect(calc({ killipClass: 1 }).components[4].points).toBe(0)
    expect(calc({ killipClass: 2 }).components[4].points).toBe(20)
    expect(calc({ killipClass: 3 }).components[4].points).toBe(39)
    expect(calc({ killipClass: 4 }).components[4].points).toBe(59)
    expect(calc({ cardiacArrestAtAdmission: true }).components[5].points).toBe(39)
    expect(calc({ stSegmentDeviation: true }).components[6].points).toBe(28)
    expect(calc({ elevatedCardiacBiomarkers: true }).components[7].points).toBe(14)
  })

  it('does not confuse cardiac arrest with Killip IV cardiogenic shock', () => {
    expect(calc({ killipClass: 4, cardiacArrestAtAdmission: false }).score).toBe(60)
    expect(calc({ killipClass: 1, cardiacArrestAtAdmission: true }).score).toBe(40)
  })

  it('classifies the published risk bands at 108, 109, 140 and 141 points', () => {
    expect(getGRACERiskCategory(108)).toBe('low')
    expect(getGRACERiskCategory(109)).toBe('intermediate')
    expect(getGRACERiskCategory(140)).toBe('intermediate')
    expect(getGRACERiskCategory(141)).toBe('high')
  })

  it('rejects missing input and invalid binary predictors', () => {
    expect(() => calculateGRACE(null as unknown as GRACEInput)).toThrow()
    expect(() => calc({ cardiacArrestAtAdmission: 'yes' as never })).toThrow()
    expect(() => calc({ stSegmentDeviation: 1 as never })).toThrow()
    expect(() => calc({ elevatedCardiacBiomarkers: undefined as never })).toThrow()
  })

  it('rejects invalid total scores in the category helper', () => {
    expect(() => getGRACERiskCategory(-1)).toThrow()
    expect(() => getGRACERiskCategory(1.5)).toThrow()
    expect(() => getGRACERiskCategory(373)).toThrow()
  })

  it('rejects impossible or non-integer demographic and vital inputs', () => {
    expect(() => calc({ ageYears: 17 })).toThrow()
    expect(() => calc({ ageYears: 121 })).toThrow()
    expect(() => calc({ ageYears: 30.5 })).toThrow()
    expect(() => calc({ heartRate: 0 })).toThrow()
    expect(() => calc({ heartRate: 50.5 })).toThrow()
    expect(() => calc({ systolicBP: 0 })).toThrow()
    expect(() => calc({ systolicBP: 200.5 })).toThrow()
    expect(() => calc({ creatinineUmolL: 0 })).toThrow()
    expect(() => calc({ creatinineUmolL: -1 })).toThrow()
    expect(() => calc({ creatinineUmolL: 2000.1 })).toThrow()
  })
})
