import { describe, expect, it } from 'vitest'
import { calculatePerformanceStatus } from './performanceStatus'

describe('calculatePerformanceStatus', () => {
  it('calculates ECOG alone', () => {
    const result = calculatePerformanceStatus({ ecog: 2 })
    expect(result.ecog?.score).toBe(2)
    expect(result.karnofsky).toBeNull()
  })

  it('calculates Karnofsky alone', () => {
    const result = calculatePerformanceStatus({ karnofsky: 70 })
    expect(result.ecog).toBeNull()
    expect(result.karnofsky?.score).toBe(70)
  })

  it('returns both scales independently without converting one to the other', () => {
    const result = calculatePerformanceStatus({ ecog: 1, karnofsky: 80 })
    expect(result.ecog?.score).toBe(1)
    expect(result.karnofsky?.score).toBe(80)
  })

  it('supports the full ECOG range including retrospective death code', () => {
    expect(calculatePerformanceStatus({ ecog: 0 }).ecog?.label).toContain('Полностью активен')
    expect(calculatePerformanceStatus({ ecog: 5 }).ecog?.label).toContain('Смерть')
  })

  it('supports all Karnofsky deciles from 0 to 100', () => {
    for (let score = 0; score <= 100; score += 10) {
      expect(calculatePerformanceStatus({ karnofsky: score }).karnofsky?.score).toBe(score)
    }
  })

  it('rejects missing values, out-of-range values and non-decile Karnofsky scores', () => {
    expect(() => calculatePerformanceStatus({})).toThrow()
    expect(() => calculatePerformanceStatus({ ecog: -1 })).toThrow()
    expect(() => calculatePerformanceStatus({ ecog: 6 })).toThrow()
    expect(() => calculatePerformanceStatus({ karnofsky: 55 })).toThrow()
    expect(() => calculatePerformanceStatus({ karnofsky: 110 })).toThrow()
  })

  it('rejects inconsistent death entries when both scales are entered', () => {
    expect(() => calculatePerformanceStatus({ ecog: 5, karnofsky: 80 })).toThrow()
    expect(() => calculatePerformanceStatus({ ecog: 2, karnofsky: 0 })).toThrow()
    expect(calculatePerformanceStatus({ ecog: 5, karnofsky: 0 }).ecog?.score).toBe(5)
  })
})
