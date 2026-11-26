import { describe, expect, it } from 'vitest'
import { calculateFIB4, classifyFIB4 } from './fib4'

describe('calculateFIB4', () => {
  it('calculates the published example (45 × 110) / (99 × √100) = 5', () => {
    const result = calculateFIB4({ ageYears: 45, astUL: 110, altUL: 100, platelets10e9L: 99 })
    expect(result.value).toBeCloseTo(5, 10)
    expect(result.category).toBe('high')
  })

  it('uses the age-adjusted lower-risk threshold from age 65', () => {
    expect(classifyFIB4(1.99, 65).category).toBe('low')
    expect(classifyFIB4(2.0, 65).category).toBe('intermediate')
    expect(classifyFIB4(1.99, 64).category).toBe('intermediate')
  })

  it.each([
    [1.299, 'low'],
    [1.3, 'intermediate'],
    [2.67, 'intermediate'],
    [2.671, 'high'],
  ] as const)('classifies age 35–64 score %s correctly', (value, expected) => {
    expect(classifyFIB4(value, 50).category).toBe(expected)
  })

  it('does not apply standard cutoffs below age 35', () => {
    expect(classifyFIB4(0.5, 34).category).toBe('limited-accuracy')
    expect(classifyFIB4(9, 18).category).toBe('limited-accuracy')
  })

  it('validates age, enzymes and platelet count', () => {
    expect(() => calculateFIB4({ ageYears: 17, astUL: 20, altUL: 20, platelets10e9L: 200 })).toThrow()
    expect(() => calculateFIB4({ ageYears: 35.5, astUL: 20, altUL: 20, platelets10e9L: 200 })).toThrow()
    expect(() => calculateFIB4({ ageYears: 50, astUL: 0, altUL: 20, platelets10e9L: 200 })).toThrow()
    expect(() => calculateFIB4({ ageYears: 50, astUL: 20, altUL: 0, platelets10e9L: 200 })).toThrow()
    expect(() => calculateFIB4({ ageYears: 50, astUL: 20, altUL: 20, platelets10e9L: 0 })).toThrow()
    expect(() => calculateFIB4({ ageYears: 50, astUL: Number.NaN, altUL: 20, platelets10e9L: 200 })).toThrow()
  })
})
