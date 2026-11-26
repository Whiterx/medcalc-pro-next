import { describe, expect, it } from 'vitest'
import { calculateH2FPEF, type H2FPEFInput } from './h2fpef'

const base: H2FPEFInput = {
  ageYears: 60,
  bmi: 30,
  antihypertensiveCount: 1,
  atrialFibrillation: 'none',
  paspMmHg: 35,
  eOverEPrime: 9,
  lvefAtLeast50: true,
}
const calc = (overrides: Partial<H2FPEFInput>) => calculateH2FPEF({ ...base, ...overrides })

describe('calculateH2FPEF', () => {
  it('returns zero points when all criteria are below their strict thresholds', () => {
    const result = calc({})
    expect(result.score).toBe(0)
    expect(result.category).toBe('low')
  })

  it('applies the BMI threshold strictly above 30', () => {
    expect(calc({ bmi: 30 }).components[0].points).toBe(0)
    expect(calc({ bmi: 30.1 }).components[0].points).toBe(2)
  })

  it('applies one point for two or more antihypertensive medicines', () => {
    expect(calc({ antihypertensiveCount: 1 }).components[1].points).toBe(0)
    expect(calc({ antihypertensiveCount: 2 }).components[1].points).toBe(1)
  })

  it('assigns three points for paroxysmal or persistent atrial fibrillation', () => {
    expect(calc({ atrialFibrillation: 'none' }).components[2].points).toBe(0)
    expect(calc({ atrialFibrillation: 'paroxysmal' }).components[2].points).toBe(3)
    expect(calc({ atrialFibrillation: 'persistent' }).components[2].points).toBe(3)
  })

  it('applies the PASP threshold strictly above 35 mmHg', () => {
    expect(calc({ paspMmHg: 35 }).components[3].points).toBe(0)
    expect(calc({ paspMmHg: 35.1 }).components[3].points).toBe(1)
  })

  it('applies the age threshold strictly above 60 years', () => {
    expect(calc({ ageYears: 60 }).components[4].points).toBe(0)
    expect(calc({ ageYears: 61 }).components[4].points).toBe(1)
  })

  it('applies the E/e′ threshold strictly above 9', () => {
    expect(calc({ eOverEPrime: 9 }).components[5].points).toBe(0)
    expect(calc({ eOverEPrime: 9.1 }).components[5].points).toBe(1)
  })

  it('classifies low, intermediate and high probability bands', () => {
    expect(calc({ bmi: 30.1 }).category).toBe('intermediate')
    expect(calc({ atrialFibrillation: 'paroxysmal', bmi: 30.1, antihypertensiveCount: 2 }).category).toBe('high')
    expect(calc({ atrialFibrillation: 'paroxysmal', bmi: 30.1, antihypertensiveCount: 2 }).score).toBe(6)
  })

  it('requires documented LVEF of at least 50%', () => {
    expect(() => calc({ lvefAtLeast50: false })).toThrow()
  })

  it('rejects invalid numeric inputs and non-integer counts', () => {
    expect(() => calc({ ageYears: 17 })).toThrow()
    expect(() => calc({ ageYears: 60.5 })).toThrow()
    expect(() => calc({ bmi: 9.9 })).toThrow()
    expect(() => calc({ bmi: 100.1 })).toThrow()
    expect(() => calc({ antihypertensiveCount: -1 })).toThrow()
    expect(() => calc({ antihypertensiveCount: 1.5 })).toThrow()
    expect(() => calc({ paspMmHg: 0 })).toThrow()
    expect(() => calc({ paspMmHg: 150.1 })).toThrow()
    expect(() => calc({ eOverEPrime: 0 })).toThrow()
    expect(() => calc({ eOverEPrime: 50.1 })).toThrow()
  })
})
