import { describe, expect, it } from 'vitest'
import { calculateCockcroftGault } from './cockcroftGault'

describe('calculateCockcroftGault', () => {
  it('calculates male creatinine clearance using the original formula', () => {
    const result = calculateCockcroftGault({ age: 60, weightKg: 70, serumCreatinineUmolL: 100, sex: 'male' })
    const expected = (80 * 70) / (72 * (100 / 88.4))
    expect(result.creatinineClearance).toBeCloseTo(expected, 8)
    expect(result.serumCreatinineMgDl).toBeCloseTo(100 / 88.4, 8)
  })

  it('applies the 0.85 female factor', () => {
    const male = calculateCockcroftGault({ age: 60, weightKg: 70, serumCreatinineUmolL: 100, sex: 'male' })
    const female = calculateCockcroftGault({ age: 60, weightKg: 70, serumCreatinineUmolL: 100, sex: 'female' })
    expect(female.creatinineClearance).toBeCloseTo(male.creatinineClearance * 0.85, 8)
  })

  it('returns creatinine clearance in mL/min, not indexed to body surface area', () => {
    const result = calculateCockcroftGault({ age: 40, weightKg: 80, serumCreatinineUmolL: 90, sex: 'male' })
    expect(result.creatinineClearance).toBeGreaterThan(0)
    expect(result.formula).toContain('мг/дл')
  })

  it('rejects invalid age, weight, creatinine and sex', () => {
    expect(() => calculateCockcroftGault({ age: 17, weightKg: 70, serumCreatinineUmolL: 100, sex: 'male' })).toThrow()
    expect(() => calculateCockcroftGault({ age: 121, weightKg: 70, serumCreatinineUmolL: 100, sex: 'male' })).toThrow()
    expect(() => calculateCockcroftGault({ age: 60, weightKg: 19, serumCreatinineUmolL: 100, sex: 'male' })).toThrow()
    expect(() => calculateCockcroftGault({ age: 60, weightKg: 70, serumCreatinineUmolL: 0, sex: 'male' })).toThrow()
    expect(() => calculateCockcroftGault({ age: 60, weightKg: 70, serumCreatinineUmolL: 100, sex: '' as 'male' })).toThrow()
  })
})
