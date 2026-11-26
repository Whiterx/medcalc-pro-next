import { describe, expect, it } from 'vitest'
import { calculateHEART, getHEARTRiskCategory, type HEARTInput } from './heart'

const base: HEARTInput = {
  historyScore: 0,
  ecgScore: 0,
  ageYears: 44,
  coronaryRiskFactorCount: 0,
  knownAtheroscleroticDisease: false,
  troponinMultipleOfULN: 1,
}
const calc = (overrides: Partial<HEARTInput>) => calculateHEART({ ...base, ...overrides })

describe('calculateHEART', () => {
  it('calculates the minimum score and low-risk six-week event rate', () => {
    const result = calc({})
    expect(result.score).toBe(0)
    expect(result.riskCategory).toBe('low')
    expect(result.sixWeekMacePercent).toBe(1.7)
  })

  it('scores history suspicion in the correct direction', () => {
    expect(calc({ historyScore: 0 }).components[0].points).toBe(0)
    expect(calc({ historyScore: 1 }).components[0].points).toBe(1)
    expect(calc({ historyScore: 2 }).components[0].points).toBe(2)
  })

  it('scores ECG normal, nonspecific changes and significant ST depression', () => {
    expect(calc({ ecgScore: 0 }).components[1].points).toBe(0)
    expect(calc({ ecgScore: 1 }).components[1].points).toBe(1)
    expect(calc({ ecgScore: 2 }).components[1].points).toBe(2)
  })

  it('applies age thresholds at 45 and 65 years', () => {
    expect(calc({ ageYears: 44 }).components[2].points).toBe(0)
    expect(calc({ ageYears: 45 }).components[2].points).toBe(1)
    expect(calc({ ageYears: 64 }).components[2].points).toBe(1)
    expect(calc({ ageYears: 65 }).components[2].points).toBe(2)
  })

  it('scores traditional risk factors and known atherosclerotic disease', () => {
    expect(calc({ coronaryRiskFactorCount: 0 }).components[3].points).toBe(0)
    expect(calc({ coronaryRiskFactorCount: 1 }).components[3].points).toBe(1)
    expect(calc({ coronaryRiskFactorCount: 2 }).components[3].points).toBe(1)
    expect(calc({ coronaryRiskFactorCount: 3 }).components[3].points).toBe(2)
    expect(calc({ coronaryRiskFactorCount: 6 }).components[3].points).toBe(2)
    expect(calc({ coronaryRiskFactorCount: 0, knownAtheroscleroticDisease: true }).components[3].points).toBe(2)
  })

  it('applies troponin multiples of the assay upper reference limit', () => {
    expect(calc({ troponinMultipleOfULN: 1 }).components[4].points).toBe(0)
    expect(calc({ troponinMultipleOfULN: 1.01 }).components[4].points).toBe(1)
    expect(calc({ troponinMultipleOfULN: 3 }).components[4].points).toBe(1)
    expect(calc({ troponinMultipleOfULN: 3.01 }).components[4].points).toBe(2)
  })

  it('reaches the maximum score of 10', () => {
    const result = calc({
      historyScore: 2,
      ecgScore: 2,
      ageYears: 65,
      coronaryRiskFactorCount: 3,
      troponinMultipleOfULN: 3.1,
    })
    expect(result.score).toBe(10)
    expect(result.riskCategory).toBe('high')
    expect(result.sixWeekMacePercent).toBe(50.1)
  })

  it('classifies risk bands at 3, 4, 6 and 7 points', () => {
    expect(getHEARTRiskCategory(3)).toBe('low')
    expect(getHEARTRiskCategory(4)).toBe('intermediate')
    expect(getHEARTRiskCategory(6)).toBe('intermediate')
    expect(getHEARTRiskCategory(7)).toBe('high')
  })

  it('rejects invalid categorical and numeric inputs', () => {
    expect(() => calc({ historyScore: -1 })).toThrow()
    expect(() => calc({ historyScore: 2.5 })).toThrow()
    expect(() => calc({ ecgScore: 3 })).toThrow()
    expect(() => calc({ ageYears: 17 })).toThrow()
    expect(() => calc({ ageYears: 44.5 })).toThrow()
    expect(() => calc({ coronaryRiskFactorCount: 6 })).toThrow()
    expect(() => calc({ coronaryRiskFactorCount: 1.5 })).toThrow()
    expect(() => calc({ troponinMultipleOfULN: -0.1 })).toThrow()
    expect(() => calc({ troponinMultipleOfULN: 100.1 })).toThrow()
    expect(() => getHEARTRiskCategory(11)).toThrow()
  })
})
