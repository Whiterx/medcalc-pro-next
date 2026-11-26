import { describe, expect, it } from 'vitest'
import { calculateHOMA1IR, type HOMAIRInput } from './homaIR'

const base: HOMAIRInput = {
  fastingGlucoseMmolL: 4.5,
  fastingInsulinMicroIUml: 5,
  fastingSamplesConfirmed: true,
  noExogenousInsulin: true,
}
const calc = (overrides: Partial<HOMAIRInput>) => calculateHOMA1IR({ ...base, ...overrides })

describe('calculateHOMA1IR — original HOMA1 approximation', () => {
  it('returns 1.00 for the original reference combination 4.5 mmol/L and 5 µU/mL', () => {
    expect(calc({}).value).toBe(1)
  })

  it('calculates the product divided by 22.5', () => {
    expect(calc({ fastingGlucoseMmolL: 5.2, fastingInsulinMicroIUml: 10 }).value).toBeCloseTo(2.311111, 5)
  })

  it('does not impose a universal insulin resistance cutoff', () => {
    const result = calc({ fastingGlucoseMmolL: 6, fastingInsulinMicroIUml: 10 })
    expect(result.value).toBeCloseTo(2.666667, 5)
    expect(result).not.toHaveProperty('riskCategory')
  })

  it('requires confirmation of fasting samples and no exogenous insulin', () => {
    expect(() => calc({ fastingSamplesConfirmed: false })).toThrow()
    expect(() => calc({ noExogenousInsulin: false })).toThrow()
  })

  it('rejects zero, negative, non-finite, and out-of-range glucose values', () => {
    expect(() => calc({ fastingGlucoseMmolL: 0 })).toThrow()
    expect(() => calc({ fastingGlucoseMmolL: -1 })).toThrow()
    expect(() => calc({ fastingGlucoseMmolL: 61 })).toThrow()
    expect(() => calc({ fastingGlucoseMmolL: Number.NaN })).toThrow()
  })

  it('rejects zero, negative, non-finite, and out-of-range insulin values', () => {
    expect(() => calc({ fastingInsulinMicroIUml: 0 })).toThrow()
    expect(() => calc({ fastingInsulinMicroIUml: -1 })).toThrow()
    expect(() => calc({ fastingInsulinMicroIUml: 1001 })).toThrow()
    expect(() => calc({ fastingInsulinMicroIUml: Number.POSITIVE_INFINITY })).toThrow()
  })
})
