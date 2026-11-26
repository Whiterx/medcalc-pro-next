import { describe, expect, it } from 'vitest'
import { calculateTIMI, type TIMIInput } from './timi'

const base: TIMIInput = {
  ageYears: 64,
  coronaryRiskFactorCount: 0,
  priorCoronaryStenosisAtLeast50: false,
  stDeviationAtLeast05mm: false,
  anginalEpisodesLast24h: 0,
  aspirinUseLast7d: false,
  elevatedCardiacBiomarkers: false,
  assessmentConfirmed: true,
}
const calc = (overrides: Partial<TIMIInput>) => calculateTIMI({ ...base, ...overrides })

describe('calculateTIMI — UA/NSTEMI', () => {
  it('returns zero points and the original 4.7% event rate for a score of 0', () => {
    const result = calc({})
    expect(result.score).toBe(0)
    expect(result.eventRatePercent).toBe(4.7)
    expect(result.riskCategory).toBe('low')
  })

  it('applies the age threshold at 65 years', () => {
    expect(calc({ ageYears: 64 }).components[0].points).toBe(0)
    expect(calc({ ageYears: 65 }).components[0].points).toBe(1)
  })

  it('scores three or more traditional CAD risk factors', () => {
    expect(calc({ coronaryRiskFactorCount: 2 }).components[1].points).toBe(0)
    expect(calc({ coronaryRiskFactorCount: 3 }).components[1].points).toBe(1)
    expect(calc({ coronaryRiskFactorCount: 5 }).components[1].points).toBe(1)
  })

  it('uses the inclusive prior coronary stenosis threshold of 50%', () => {
    expect(calc({ priorCoronaryStenosisAtLeast50: false }).components[2].points).toBe(0)
    expect(calc({ priorCoronaryStenosisAtLeast50: true }).components[2].points).toBe(1)
  })

  it('scores documented ST deviation of at least 0.5 mm', () => {
    expect(calc({ stDeviationAtLeast05mm: false }).components[3].points).toBe(0)
    expect(calc({ stDeviationAtLeast05mm: true }).components[3].points).toBe(1)
  })

  it('applies the threshold of two anginal episodes in the preceding 24 hours', () => {
    expect(calc({ anginalEpisodesLast24h: 1 }).components[4].points).toBe(0)
    expect(calc({ anginalEpisodesLast24h: 2 }).components[4].points).toBe(1)
  })

  it('scores aspirin use in the preceding 7 days and elevated initial biomarkers', () => {
    expect(calc({ aspirinUseLast7d: true }).components[5].points).toBe(1)
    expect(calc({ elevatedCardiacBiomarkers: true }).components[6].points).toBe(1)
  })

  it('reaches the maximum score of 7 and the original 40.9% event rate', () => {
    const result = calc({
      ageYears: 65,
      coronaryRiskFactorCount: 3,
      priorCoronaryStenosisAtLeast50: true,
      stDeviationAtLeast05mm: true,
      anginalEpisodesLast24h: 2,
      aspirinUseLast7d: true,
      elevatedCardiacBiomarkers: true,
    })
    expect(result.score).toBe(7)
    expect(result.eventRatePercent).toBe(40.9)
    expect(result.riskCategory).toBe('high')
  })

  it('uses the original 14-day event rates for every score', () => {
    const expected = [4.7, 4.7, 8.3, 13.2, 19.9, 26.2, 40.9, 40.9]
    for (let score = 0; score <= 7; score++) {
      const result = calc({
        ageYears: score >= 1 ? 65 : 64,
        coronaryRiskFactorCount: score >= 2 ? 3 : 0,
        priorCoronaryStenosisAtLeast50: score >= 3,
        stDeviationAtLeast05mm: score >= 4,
        anginalEpisodesLast24h: score >= 5 ? 2 : 0,
        aspirinUseLast7d: score >= 6,
        elevatedCardiacBiomarkers: score >= 7,
      })
      expect(result.score).toBe(score)
      expect(result.eventRatePercent).toBe(expected[score])
    }
  })

  it('requires explicit confirmation that all factors have been assessed', () => {
    expect(() => calc({ assessmentConfirmed: false })).toThrow()
  })

  it('rejects invalid ages, risk-factor counts and angina episode counts', () => {
    expect(() => calc({ ageYears: 17 })).toThrow()
    expect(() => calc({ ageYears: 64.5 })).toThrow()
    expect(() => calc({ coronaryRiskFactorCount: -1 })).toThrow()
    expect(() => calc({ coronaryRiskFactorCount: 5.5 })).toThrow()
    expect(() => calc({ coronaryRiskFactorCount: 6 })).toThrow()
    expect(() => calc({ anginalEpisodesLast24h: -1 })).toThrow()
    expect(() => calc({ anginalEpisodesLast24h: 1.5 })).toThrow()
  })
})
