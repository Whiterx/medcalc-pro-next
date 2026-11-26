import { describe, expect, it } from 'vitest'
import { calculateEGFR2021 } from './egfr'

describe('calculateEGFR2021', () => {
  it('uses the 2021 CKD-EPI creatinine equation for a male adult', () => {
    const result = calculateEGFR2021({ ageYears: 40, sex: 'male', creatinineUmolL: 88.4 })
    expect(result.creatinineMgDl).toBeCloseTo(1, 10)
    expect(result.value).toBeCloseTo(99.0, 0)
    expect(result.category).toBe('G1')
  })

  it('applies the female kappa, alpha and sex factor', () => {
    const result = calculateEGFR2021({ ageYears: 40, sex: 'female', creatinineUmolL: 88.4 })
    expect(result.creatinineMgDl).toBeCloseTo(1, 10)
    expect(result.value).toBeGreaterThan(70)
    expect(result.value).toBeLessThan(80)
  })

  it('uses the correct category boundaries', () => {
    const ageYears = 40
    const sex = 'male' as const
    const creatinineForEgfr = (target: number) => {
      let low = 10
      let high = 2000
      for (let i = 0; i < 100; i += 1) {
        const mid = (low + high) / 2
        const value = calculateEGFR2021({ ageYears, sex, creatinineUmolL: mid }).value
        if (value > target) low = mid
        else high = mid
      }
      return (low + high) / 2
    }

    expect(calculateEGFR2021({ ageYears, sex, creatinineUmolL: creatinineForEgfr(90) }).category).toBe('G1')
    expect(calculateEGFR2021({ ageYears, sex, creatinineUmolL: creatinineForEgfr(60) }).category).toBe('G2')
    expect(calculateEGFR2021({ ageYears, sex, creatinineUmolL: creatinineForEgfr(45) }).category).toBe('G3a')
    expect(calculateEGFR2021({ ageYears, sex, creatinineUmolL: creatinineForEgfr(30) }).category).toBe('G3b')
    expect(calculateEGFR2021({ ageYears, sex, creatinineUmolL: creatinineForEgfr(15) }).category).toBe('G4')
    expect(calculateEGFR2021({ ageYears, sex, creatinineUmolL: 2000 }).category).toBe('G5')
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
