import { describe, expect, it } from 'vitest'
import { calculateEGFR2021, classifyEGFRCategory } from './egfr'

describe('calculateEGFR2021', () => {
  it('uses the 2021 CKD-EPI creatinine equation for a male adult', () => {
    const result = calculateEGFR2021({ ageYears: 40, sex: 'male', creatinineUmolL: 88.4 })
    expect(result.creatinineMgDl).toBeCloseTo(1, 10)
    expect(result.value).toBeCloseTo(97.5751, 3)
    expect(result.category).toBe('G1')
  })

  it('applies the female kappa, alpha and sex factor', () => {
    const result = calculateEGFR2021({ ageYears: 40, sex: 'female', creatinineUmolL: 88.4 })
    expect(result.creatinineMgDl).toBeCloseTo(1, 10)
    expect(result.value).toBeGreaterThan(70)
    expect(result.value).toBeLessThan(80)
  })

  it('classifies all G categories at exact KDIGO eGFR boundaries', () => {
    expect(classifyEGFRCategory(90).category).toBe('G1')
    expect(classifyEGFRCategory(89.99).category).toBe('G2')
    expect(classifyEGFRCategory(60).category).toBe('G2')
    expect(classifyEGFRCategory(59.99).category).toBe('G3a')
    expect(classifyEGFRCategory(45).category).toBe('G3a')
    expect(classifyEGFRCategory(44.99).category).toBe('G3b')
    expect(classifyEGFRCategory(30).category).toBe('G3b')
    expect(classifyEGFRCategory(29.99).category).toBe('G4')
    expect(classifyEGFRCategory(15).category).toBe('G4')
    expect(classifyEGFRCategory(14.99).category).toBe('G5')
  })

  it('rejects invalid values for category classification', () => {
    expect(() => classifyEGFRCategory(Number.NaN)).toThrow()
    expect(() => classifyEGFRCategory(-1)).toThrow()
  })

  it('rejects invalid ages', () => {
    for (const ageYears of [17, 121, 18.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => calculateEGFR2021({ ageYears, sex: 'male', creatinineUmolL: 88.4 })).toThrow()
    }
  })

  it('rejects invalid creatinine values', () => {
    for (const creatinineUmolL of [0, 9.9, 2000.1, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => calculateEGFR2021({ ageYears: 40, sex: 'male', creatinineUmolL })).toThrow()
    }
  })

  it('rejects an unsupported sex value', () => {
    expect(() => calculateEGFR2021({ ageYears: 40, sex: 'other' as 'male', creatinineUmolL: 88.4 })).toThrow()
  })
})
