import { describe, expect, it } from 'vitest'
import { calculateBMI } from './bmi'

describe('calculateBMI — adult BMI', () => {
  it('calculates BMI using kg / m²', () => {
    expect(calculateBMI({ heightCm: 175, weightKg: 80 }).value).toBeCloseTo(26.1224, 3)
  })

  it.each([
    [18.49, 'underweight'],
    [18.5, 'normal'],
    [24.99, 'normal'],
    [25, 'overweight'],
    [29.99, 'overweight'],
    [30, 'obesity-class-1'],
    [34.99, 'obesity-class-1'],
    [35, 'obesity-class-2'],
    [39.99, 'obesity-class-2'],
    [40, 'obesity-class-3'],
  ] as const)('assigns the correct category at BMI %s', (bmi, expected) => {
    const heightCm = 200
    const weightKg = (bmi * (heightCm / 100) ** 2)
    expect(calculateBMI({ heightCm, weightKg }).category).toBe(expected)
  })

  it('returns the adult healthy-weight reference interval for the entered height', () => {
    const result = calculateBMI({ heightCm: 170, weightKg: 70 })
    expect(result.lowerHealthyWeightKg).toBeCloseTo(53.465)
    expect(result.upperHealthyWeightKg).toBeCloseTo(71.961)
  })

  it('rejects implausible or non-finite height values', () => {
    expect(() => calculateBMI({ heightCm: 0, weightKg: 70 })).toThrow()
    expect(() => calculateBMI({ heightCm: 99.9, weightKg: 70 })).toThrow()
    expect(() => calculateBMI({ heightCm: 250.1, weightKg: 70 })).toThrow()
    expect(() => calculateBMI({ heightCm: Number.NaN, weightKg: 70 })).toThrow()
  })

  it('rejects implausible or non-finite weight values', () => {
    expect(() => calculateBMI({ heightCm: 170, weightKg: 0 })).toThrow()
    expect(() => calculateBMI({ heightCm: 170, weightKg: 19.9 })).toThrow()
    expect(() => calculateBMI({ heightCm: 170, weightKg: 500.1 })).toThrow()
    expect(() => calculateBMI({ heightCm: 170, weightKg: Number.POSITIVE_INFINITY })).toThrow()
  })
})
