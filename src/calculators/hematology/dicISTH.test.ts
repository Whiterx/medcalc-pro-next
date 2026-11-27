import { describe, expect, it } from 'vitest'
import { calculateISTHDIC, type DICInput } from './dicISTH'

const base: DICInput = {
  version: 'classic2001',
  underlyingDisorderPresent: true,
  plateletCount: 150,
  ptProlongationSeconds: 2.9,
  fibrinogenGPerL: 2,
  dDimerCategory: 'none',
  assessmentConfirmed: true,
}
const calc = (overrides: Partial<DICInput>) => calculateISTHDIC({ ...base, ...overrides })

describe('calculateISTHDIC — classic ISTH overt DIC score', () => {
  it('returns zero when all parameters are normal', () => {
    expect(calc({}).score).toBe(0)
  })

  it('scores platelet thresholds around 50 and 100 for classic criteria', () => {
    expect(calc({ plateletCount: 49.9 }).components[0].points).toBe(2)
    expect(calc({ plateletCount: 50 }).components[0].points).toBe(1)
    expect(calc({ plateletCount: 100 }).components[0].points).toBe(1)
    expect(calc({ plateletCount: 100.1 }).components[0].points).toBe(0)
  })

  it('scores PT prolongation at 3 and strictly above 6 seconds in the classic version', () => {
    expect(calc({ ptProlongationSeconds: 2.99 }).components[2].points).toBe(0)
    expect(calc({ ptProlongationSeconds: 3 }).components[2].points).toBe(1)
    expect(calc({ ptProlongationSeconds: 6 }).components[2].points).toBe(1)
    expect(calc({ ptProlongationSeconds: 6.01 }).components[2].points).toBe(2)
  })

  it('scores fibrinogen strictly below 1 g/L', () => {
    expect(calc({ fibrinogenGPerL: 0.99 }).components[3].points).toBe(1)
    expect(calc({ fibrinogenGPerL: 1 }).components[3].points).toBe(0)
  })

  it('scores qualitative fibrin-related markers as 0, 2, or 3', () => {
    expect(calc({ dDimerCategory: 'none' }).components[1].points).toBe(0)
    expect(calc({ dDimerCategory: 'moderate' }).components[1].points).toBe(2)
    expect(calc({ dDimerCategory: 'strong' }).components[1].points).toBe(3)
  })

  it('requires an underlying disorder associated with DIC', () => {
    expect(() => calc({ underlyingDisorderPresent: false })).toThrow()
  })

  it('requires confirmation and rejects negative or non-finite laboratory values', () => {
    expect(() => calc({ assessmentConfirmed: false })).toThrow()
    expect(() => calc({ plateletCount: -1 })).toThrow()
    expect(() => calc({ plateletCount: Number.NaN })).toThrow()
    expect(() => calc({ ptProlongationSeconds: Number.POSITIVE_INFINITY })).toThrow()
    expect(() => calc({ fibrinogenGPerL: -0.1 })).toThrow()
  })

  it('does not impose unsupported upper limits on laboratory values', () => {
    expect(calc({ plateletCount: 2500 }).components[0].points).toBe(0)
    expect(calc({ ptProlongationSeconds: 31 }).components[2].points).toBe(2)
    expect(calc({ fibrinogenGPerL: 21 }).components[3].points).toBe(0)
  })

  it('marks a score of exactly 5 as compatible with overt DIC', () => {
    const result = calc({ plateletCount: 40, ptProlongationSeconds: 7, fibrinogenGPerL: 0.8 })
    expect(result.score).toBe(5)
    expect(result.overtDICCompatible).toBe(true)
  })
})

describe('calculateISTHDIC — 2025 updated overt DIC score', () => {
  const updated = (overrides: Partial<DICInput>) => calculateISTHDIC({
    ...base,
    version: 'updated2025',
    plateletCount: 150,
    ptProlongationSeconds: 2.9,
    fibrinogenGPerL: 2,
    dDimerCategory: undefined,
    dDimerMultipleOfULN: 0,
    ...overrides,
  })

  it('uses ≥50 and <100 platelet threshold in the 2025 version', () => {
    expect(updated({ plateletCount: 49.9 }).components[0].points).toBe(2)
    expect(updated({ plateletCount: 50 }).components[0].points).toBe(1)
    expect(updated({ plateletCount: 99.9 }).components[0].points).toBe(1)
    expect(updated({ plateletCount: 100 }).components[0].points).toBe(0)
  })

  it('uses ≥6 seconds as the 2-point PT threshold in the 2025 version', () => {
    expect(updated({ ptProlongationSeconds: 5.99 }).components[2].points).toBe(1)
    expect(updated({ ptProlongationSeconds: 6 }).components[2].points).toBe(2)
  })

  it('uses strict >3x and >7x ULN D-dimer thresholds', () => {
    expect(updated({ dDimerMultipleOfULN: 3 }).components[1].points).toBe(0)
    expect(updated({ dDimerMultipleOfULN: 3.01 }).components[1].points).toBe(2)
    expect(updated({ dDimerMultipleOfULN: 7 }).components[1].points).toBe(2)
    expect(updated({ dDimerMultipleOfULN: 7.01 }).components[1].points).toBe(3)
  })

  it('requires numeric D-dimer relative to the local ULN and accepts high valid multiples', () => {
    expect(() => updated({ dDimerMultipleOfULN: undefined })).toThrow()
    expect(updated({ dDimerMultipleOfULN: 1001 }).components[1].points).toBe(3)
    expect(() => updated({ dDimerMultipleOfULN: Number.NaN })).toThrow()
  })
})
