import { describe, expect, it } from 'vitest'
import { calculateMRS } from './mrs'

describe('calculateMRS', () => {
  it('returns the exact description for each of the seven ordinal categories', () => {
    for (let score = 0; score <= 6; score += 1) {
      const result = calculateMRS(score)
      expect(result.score).toBe(score)
      expect(result.label.length).toBeGreaterThan(0)
      expect(result.description.length).toBeGreaterThan(0)
    }
  })
  it('groups scores 0–2 as independent and 3–5 as dependent', () => {
    expect(calculateMRS(0).functionalGroup).toContain('0–2')
    expect(calculateMRS(2).functionalGroup).toContain('0–2')
    expect(calculateMRS(3).functionalGroup).toContain('3–5')
    expect(calculateMRS(5).functionalGroup).toContain('3–5')
  })
  it('keeps death as a separate terminal category', () => {
    const result = calculateMRS(6)
    expect(result.label).toBe('Смерть')
    expect(result.functionalGroup).toContain('mRS 6')
  })
  it('rejects missing, fractional, string and out-of-range values', () => {
    for (const value of [undefined, null, '', '2', 1.5, -1, 7, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => calculateMRS(value)).toThrow()
    }
  })
})
