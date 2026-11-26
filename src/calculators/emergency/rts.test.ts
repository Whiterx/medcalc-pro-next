import { describe, expect, it } from 'vitest'
import { calculateRTS } from './rts'

describe('calculateRTS', () => {
  it('returns maximum 7.8408 for normal coded values', () => {
    const result = calculateRTS({ gcs: 15, systolicBP: 90, respiratoryRate: 10 })
    expect(result.score).toBeCloseTo(7.8408, 8)
    expect(result.codedSum).toBe(12)
  })

  it('returns zero for the lowest coded values', () => {
    const result = calculateRTS({ gcs: 3, systolicBP: 0, respiratoryRate: 0 })
    expect(result.score).toBe(0)
    expect(result.codedSum).toBe(0)
  })

  it.each([
    [15, 4], [13, 4], [12, 3], [9, 3], [8, 2], [6, 2], [5, 1], [4, 1], [3, 0],
  ])('codes GCS %s as %s', (gcs, code) => {
    expect(calculateRTS({ gcs, systolicBP: 90, respiratoryRate: 10 }).components[0].codedValue).toBe(code)
  })

  it.each([
    [90, 4], [89, 3], [76, 3], [75, 2], [50, 2], [49, 1], [1, 1], [0, 0],
  ])('codes SBP %s as %s', (sbp, code) => {
    expect(calculateRTS({ gcs: 15, systolicBP: sbp, respiratoryRate: 10 }).components[1].codedValue).toBe(code)
  })

  it.each([
    [30, 3], [29, 4], [10, 4], [9, 2], [6, 2], [5, 1], [1, 1], [0, 0],
  ])('codes respiratory rate %s as %s', (rr, code) => {
    expect(calculateRTS({ gcs: 15, systolicBP: 90, respiratoryRate: rr }).components[2].codedValue).toBe(code)
  })

  it('calculates the weighted RTS, not the unweighted triage RTS', () => {
    const result = calculateRTS({ gcs: 10, systolicBP: 80, respiratoryRate: 32 })
    expect(result.codedSum).toBe(3 + 3 + 3)
    expect(result.score).toBeCloseTo(0.9368 * 3 + 0.7326 * 3 + 0.2908 * 3, 8)
    expect(result.score).not.toBe(result.codedSum)
  })

  it('rejects missing, non-integer and out-of-range values', () => {
    expect(() => calculateRTS({ gcs: 0, systolicBP: 90, respiratoryRate: 10 })).toThrow()
    expect(() => calculateRTS({ gcs: 15, systolicBP: -1, respiratoryRate: 10 })).toThrow()
    expect(() => calculateRTS({ gcs: 15, systolicBP: 90, respiratoryRate: 101 })).toThrow()
    expect(() => calculateRTS({ gcs: 15.5, systolicBP: 90, respiratoryRate: 10 })).toThrow()
  })
})
