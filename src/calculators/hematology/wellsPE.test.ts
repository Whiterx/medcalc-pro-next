import { describe, expect, it } from 'vitest'
import { calculateWellsPE, type WellsPEInput } from './wellsPE'

const base: WellsPEInput = {
  clinicalSignsOfDVT: false,
  pulmonaryEmbolismMoreLikelyThanAlternative: false,
  heartRateOver100: false,
  immobilisationOver3DaysOrSurgeryWithin4Weeks: false,
  previousDVTOrPE: false,
  haemoptysis: false,
  activeCancer: false,
  assessmentConfirmed: true,
}
const calc = (overrides: Partial<WellsPEInput>) => calculateWellsPE({ ...base, ...overrides })

describe('calculateWellsPE — two-level Wells score', () => {
  it('returns 0 and PE unlikely when no criteria are present', () => {
    const result = calc({})
    expect(result.score).toBe(0)
    expect(result.category).toBe('unlikely')
    expect(result.categoryLabel).toBe('ТЭЛА маловероятна')
  })

  it('scores all seven criteria with the original weights', () => {
    const result = calc({
      clinicalSignsOfDVT: true,
      pulmonaryEmbolismMoreLikelyThanAlternative: true,
      heartRateOver100: true,
      immobilisationOver3DaysOrSurgeryWithin4Weeks: true,
      previousDVTOrPE: true,
      haemoptysis: true,
      activeCancer: true,
    })
    expect(result.score).toBe(12.5)
    expect(result.category).toBe('likely')
  })

  it('uses the strict heart rate threshold >100, not ≥100', () => {
    expect(calc({ heartRateOver100: false }).score).toBe(0)
    expect(calc({ heartRateOver100: true }).score).toBe(1.5)
  })

  it('classifies exactly 4 points as PE unlikely', () => {
    const result = calc({ clinicalSignsOfDVT: true, haemoptysis: true })
    expect(result.score).toBe(4)
    expect(result.category).toBe('unlikely')
  })

  it('classifies any score above 4 as PE likely', () => {
    const result = calc({ clinicalSignsOfDVT: true, heartRateOver100: true })
    expect(result.score).toBe(4.5)
    expect(result.category).toBe('likely')
  })

  it('scores immobilisation/surgery and previous VTE separately', () => {
    const result = calc({
      immobilisationOver3DaysOrSurgeryWithin4Weeks: true,
      previousDVTOrPE: true,
    })
    expect(result.score).toBe(3)
  })

  it('requires confirmation that every criterion was assessed', () => {
    expect(() => calc({ assessmentConfirmed: false })).toThrow()
  })
})
