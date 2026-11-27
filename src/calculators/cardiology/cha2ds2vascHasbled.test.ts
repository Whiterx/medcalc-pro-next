import { describe, expect, it } from 'vitest'
import { calculateAFCombined, type AFCombinedInput } from './cha2ds2vascHasbled'

const base: AFCombinedInput = {
  ageYears: 64,
  heartFailure: false,
  hypertension: false,
  diabetes: false,
  priorStrokeTIAOrEmbolism: false,
  vascularDisease: false,
  femaleSex: false,
  uncontrolledSystolicBPOver160: false,
  abnormalRenalFunction: false,
  abnormalLiverFunction: false,
  priorStrokeForBleedingScore: false,
  bleedingHistoryOrPredisposition: false,
  labileINR: false,
  bleedingRiskDrugs: false,
  excessiveAlcohol: false,
  assessmentConfirmed: true,
}
const calc = (overrides: Partial<AFCombinedInput>) => calculateAFCombined({ ...base, ...overrides })

describe('calculateAFCombined — CHA2DS2-VASc / HAS-BLED', () => {
  it('returns zero scores for a low-risk adult without criteria', () => {
    const result = calc({})
    expect(result.cha2ds2VascScore).toBe(0)
    expect(result.hasBledScore).toBe(0)
    expect(result.cha2ds2VascCategory).toBe('low')
  })

  it('calculates CHA2DS2-VASc age categories at 65 and 75 years', () => {
    expect(calc({ ageYears: 64 }).cha2ds2VascScore).toBe(0)
    expect(calc({ ageYears: 65 }).cha2ds2VascScore).toBe(1)
    expect(calc({ ageYears: 74 }).cha2ds2VascScore).toBe(1)
    expect(calc({ ageYears: 75 }).cha2ds2VascScore).toBe(2)
  })

  it('applies female sex as a CHA2DS2-VASc modifier and preserves low risk for sex alone', () => {
    const result = calc({ femaleSex: true })
    expect(result.cha2ds2VascScore).toBe(1)
    expect(result.cha2ds2VascCategory).toBe('low')
  })

  it('adds all CHA2DS2-VASc factors including the sex modifier', () => {
    const result = calc({
      ageYears: 75,
      heartFailure: true,
      hypertension: true,
      diabetes: true,
      priorStrokeTIAOrEmbolism: true,
      vascularDisease: true,
      femaleSex: true,
    })
    expect(result.cha2ds2VascScore).toBe(9)
  })

  it('uses Russian 2025 sex-specific CHA2DS2-VASc thresholds', () => {
    expect(calc({}).cha2ds2VascCategory).toBe('low')
    expect(calc({ ageYears: 65 }).cha2ds2VascCategory).toBe('consider')
    expect(calc({ ageYears: 75 }).cha2ds2VascCategory).toBe('recommended')
    expect(calc({ femaleSex: true }).cha2ds2VascCategory).toBe('low')
    expect(calc({ femaleSex: true, hypertension: true }).cha2ds2VascCategory).toBe('consider')
    expect(calc({ femaleSex: true, hypertension: true, diabetes: true }).cha2ds2VascCategory).toBe('recommended')
  })

  it('applies HAS-BLED age criterion strictly above 65 years', () => {
    expect(calc({ ageYears: 65 }).hasBledScore).toBe(0)
    expect(calc({ ageYears: 66 }).hasBledScore).toBe(1)
  })

  it('scores renal and liver dysfunction separately', () => {
    expect(calc({ abnormalRenalFunction: true }).hasBledScore).toBe(1)
    expect(calc({ abnormalLiverFunction: true }).hasBledScore).toBe(1)
    expect(calc({ abnormalRenalFunction: true, abnormalLiverFunction: true }).hasBledScore).toBe(2)
  })

  it('scores each HAS-BLED domain independently, including drugs and alcohol', () => {
    const result = calc({
      uncontrolledSystolicBPOver160: true,
      abnormalRenalFunction: true,
      abnormalLiverFunction: true,
      priorStrokeForBleedingScore: true,
      bleedingHistoryOrPredisposition: true,
      labileINR: true,
      bleedingRiskDrugs: true,
      excessiveAlcohol: true,
    })
    expect(result.hasBledScore).toBe(8)
    expect(result.hasBledHighRisk).toBe(true)
  })

  it('reaches the maximum HAS-BLED score of 9', () => {
    const result = calc({
      ageYears: 66,
      uncontrolledSystolicBPOver160: true,
      abnormalRenalFunction: true,
      abnormalLiverFunction: true,
      priorStrokeForBleedingScore: true,
      bleedingHistoryOrPredisposition: true,
      labileINR: true,
      bleedingRiskDrugs: true,
      excessiveAlcohol: true,
    })
    expect(result.hasBledScore).toBe(9)
  })

  it('flags HAS-BLED ≥3 as high bleeding risk', () => {
    expect(calc({ uncontrolledSystolicBPOver160: true, priorStrokeForBleedingScore: true, bleedingHistoryOrPredisposition: true }).hasBledHighRisk).toBe(true)
    expect(calc({ uncontrolledSystolicBPOver160: true, priorStrokeForBleedingScore: true }).hasBledHighRisk).toBe(false)
  })

  it('requires explicit confirmation that both scales were fully assessed', () => {
    expect(() => calc({ assessmentConfirmed: false })).toThrow()
  })

  it('rejects invalid ages', () => {
    expect(() => calc({ ageYears: 17 })).toThrow()
    expect(() => calc({ ageYears: 65.5 })).toThrow()
    expect(() => calc({ ageYears: 121 })).toThrow()
  })
})
