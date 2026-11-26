import { describe, expect, it } from 'vitest'
import { calculatePFRatio, type PFRatioInput } from './pfRatio'

const withRatio = (ratio: number): PFRatioInput => ({ pao2: ratio * 0.5, fio2: 0.5 })

describe('calculatePFRatio', () => {
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
  })

  it('uses the exact Berlin moderate boundary: >100 to 200 inclusive', () => {
    expect(calculatePFRatio(withRatio(200)).category).toBe('moderate')
    expect(calculatePFRatio(withRatio(100.1)).category).toBe('moderate')
  })

  it('classifies 100 and below in the severe oxygenation band', () => {
    expect(calculatePFRatio(withRatio(100)).category).toBe('severe')
    expect(calculatePFRatio(withRatio(99.9)).category).toBe('severe')
  })

  it('returns the unrounded ratio for transparent display', () => {
    expect(calculatePFRatio({ pao2: 80, fio2: 0.4 }).ratio).toBe(200)
    expect(calculatePFRatio({ pao2: 83.3, fio2: 0.4 }).ratio).toBeCloseTo(208.25)
  })
})
