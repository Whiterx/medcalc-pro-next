import { describe, expect, it } from 'vitest'
import { calculateMELDNa, type MELDNaInput } from './meldNa'

const base: MELDNaInput = {
  bilirubin: 1,
  bilirubinUnit: 'mg/dL',
  creatinine: 1,
  creatinineUnit: 'mg/dL',
  inr: 1,
  sodium: 137,
  recentDialysis: false,
}

describe('calculateMELDNa', () => {
  it('returns the minimum MELD score of 6 when all values are at the formula floor', () => {
    const result = calculateMELDNa(base)
    expect(result.meld).toBe(6)
    expect(result.meldNa).toBe(6)
    expect(result.sodiumAdjusted).toBe(false)
  })

  it('applies sodium adjustment only when the rounded base MELD is greater than 11', () => {
    const low = calculateMELDNa({ ...base, bilirubin: 1.5 })
    expect(low.meld).toBe(8)
    expect(low.sodiumAdjusted).toBe(false)
    const higher = calculateMELDNa({ ...base, bilirubin: 3, creatinine: 1.5, inr: 1.5, sodium: 125 })
    expect(higher.meld).toBeGreaterThan(11)
    expect(higher.sodiumAdjusted).toBe(true)
    expect(higher.meldNa).toBeGreaterThan(higher.meld)
  })

  it('uses sodium floor and ceiling inclusively', () => {
    const below = calculateMELDNa({ ...base, bilirubin: 3, creatinine: 2, inr: 2, sodium: 110 })
    const atFloor = calculateMELDNa({ ...base, bilirubin: 3, creatinine: 2, inr: 2, sodium: 125 })
    expect(below.effectiveSodium).toBe(125)
    expect(below.meldNa).toBe(atFloor.meldNa)
    const above = calculateMELDNa({ ...base, bilirubin: 3, creatinine: 2, inr: 2, sodium: 150 })
    const atCeiling = calculateMELDNa({ ...base, bilirubin: 3, creatinine: 2, inr: 2, sodium: 137 })
    expect(above.effectiveSodium).toBe(137)
    expect(above.meldNa).toBe(atCeiling.meldNa)
  })

  it('applies laboratory floors for bilirubin, INR and creatinine', () => {
    const result = calculateMELDNa({ ...base, bilirubin: 0.5, creatinine: 0.5, inr: 0.8 })
    expect(result.effectiveBilirubinMgDl).toBe(1)
    expect(result.effectiveCreatinineMgDl).toBe(1)
    expect(result.effectiveINR).toBe(1)
    expect(result.adjustments).toHaveLength(3)
    expect(result.meld).toBe(6)
  })

  it('caps creatinine at 4 mg/dL, including an exact value of 4', () => {
    const atCap = calculateMELDNa({ ...base, creatinine: 4 })
    const aboveCap = calculateMELDNa({ ...base, creatinine: 8 })
    expect(atCap.effectiveCreatinineMgDl).toBe(4)
    expect(aboveCap.effectiveCreatinineMgDl).toBe(4)
    expect(aboveCap.meld).toBe(atCap.meld)
  })

  it('sets creatinine to 4 mg/dL for the defined recent dialysis condition', () => {
    const result = calculateMELDNa({ ...base, creatinine: 1.2, recentDialysis: true })
    expect(result.effectiveCreatinineMgDl).toBe(4)
    expect(result.adjustments.some((item) => item.key === 'dialysis')).toBe(true)
  })

  it('converts SI bilirubin and creatinine units to mg/dL', () => {
    const conventional = calculateMELDNa({ ...base, bilirubin: 2, creatinine: 2 })
    const si = calculateMELDNa({
      ...base,
      bilirubin: 34.2,
      bilirubinUnit: 'µmol/L',
      creatinine: 176.8,
      creatinineUnit: 'µmol/L',
    })
    expect(si.effectiveBilirubinMgDl).toBeCloseTo(conventional.effectiveBilirubinMgDl, 10)
    expect(si.effectiveCreatinineMgDl).toBeCloseTo(conventional.effectiveCreatinineMgDl, 10)
    expect(si.meld).toBe(conventional.meld)
  })

  it('rounds the base MELD before applying sodium and caps the final score at 40', () => {
    const result = calculateMELDNa({ ...base, bilirubin: 40, creatinine: 4, inr: 5, sodium: 125 })
    expect(Number.isInteger(result.meld)).toBe(true)
    expect(result.meldNa).toBe(40)
  })

  it('rejects missing, non-finite, zero and out-of-range laboratory values', () => {
    expect(() => calculateMELDNa({ ...base, bilirubin: 0 })).toThrow()
    expect(() => calculateMELDNa({ ...base, bilirubin: Number.NaN })).toThrow()
    expect(() => calculateMELDNa({ ...base, creatinine: Number.POSITIVE_INFINITY })).toThrow()
    expect(() => calculateMELDNa({ ...base, inr: 0.4 })).toThrow()
    expect(() => calculateMELDNa({ ...base, sodium: 99 })).toThrow()
    expect(() => calculateMELDNa({ ...base, sodium: 201 })).toThrow()
  })
})
