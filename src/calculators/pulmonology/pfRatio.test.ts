import { describe, expect, it } from 'vitest'
import { calculatePFRatio, type PFRatioInput } from './pfRatio'
const withRatio = (ratio: number): PFRatioInput => ({ pao2: ratio * 0.5, fio2: 0.5 })
describe('calculatePFRatio — exact oxygenation bands', () => {
  it('returns the expected range at P/F 400 and above', () => {
    expect(calculatePFRatio(withRatio(400)).category).toBe('expected')
    expect(calculatePFRatio(withRatio(450)).category).toBe('expected')
  })
  it('distinguishes reduced ratios above 300 from Berlin ARDS oxygenation bands', () => {
    expect(calculatePFRatio(withRatio(399.8)).category).toBe('reduced')
    expect(calculatePFRatio(withRatio(300.1)).category).toBe('reduced')
  })
  it('uses the exact Berlin mild boundary: >200 to 300 inclusive', () => {
    expect(calculatePFRatio(withRatio(300)).category).toBe('mild')
    expect(calculatePFRatio(withRatio(200.1)).category).toBe('mild')
    expect(calculatePFRatio(withRatio(200)).category).toBe('moderate')
  })
  it('uses the exact Berlin moderate boundary: >100 to 200 inclusive', () => {
    expect(calculatePFRatio(withRatio(200)).category).toBe('moderate')
    expect(calculatePFRatio(withRatio(100.1)).category).toBe('moderate')
  })
  it('uses Berlin severe band at 100 and below and exposes the Russian 2025 boundary discrepancy', () => {
    expect(calculatePFRatio(withRatio(100)).category).toBe('severe')
    expect(calculatePFRatio(withRatio(100)).interpretation).toContain('ФАР 2025')
    expect(calculatePFRatio(withRatio(99.9)).category).toBe('severe')
  })
  it('returns the unrounded ratio and uses full precision for classification', () => {
    expect(calculatePFRatio({ pao2: 80, fio2: 0.4 }).ratio).toBe(200)
    expect(calculatePFRatio({ pao2: 83.3, fio2: 0.4 }).ratio).toBeCloseTo(208.25)
    expect(calculatePFRatio({ pao2: 100.05, fio2: 1 }).category).toBe('moderate')
  })
})
describe('calculatePFRatio — input validation', () => {
  it('rejects missing, non-finite, zero or negative PaO2', () => {
    expect(() => calculatePFRatio(null as unknown as PFRatioInput)).toThrow()
    expect(() => calculatePFRatio({ pao2: 0, fio2: 0.21 })).toThrow()
    expect(() => calculatePFRatio({ pao2: -1, fio2: 0.21 })).toThrow()
    expect(() => calculatePFRatio({ pao2: Number.NaN, fio2: 0.21 })).toThrow()
    expect(() => calculatePFRatio({ pao2: Number.POSITIVE_INFINITY, fio2: 0.21 })).toThrow()
  })
  it('rejects FiO2 outside 0.21–1.00 and non-finite values', () => {
    for (const fio2 of [0, 0.2, 1.01, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => calculatePFRatio({ pao2: 80, fio2 })).toThrow()
    }
  })
})