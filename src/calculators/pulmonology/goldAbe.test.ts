import { describe, expect, it } from 'vitest'
import { calculateGOLDABE, type GOLDABEInput } from './goldAbe'

const base: GOLDABEInput = {
  fev1FvcPercent: 60,
  fev1PercentPredicted: 80,
  moderateOrSevereExacerbations: 0,
  symptomMethod: 'mmrc',
  symptomScore: 0,
}
const calc = (overrides: Partial<GOLDABEInput>) => calculateGOLDABE({ ...base, ...overrides })

describe('calculateGOLDABE — GOLD 2027', () => {
  it('classifies Group A when obstruction is confirmed, no exacerbations and low symptoms', () => {
    expect(calc({}).group).toBe('A')
  })

  it('classifies Group B at the mMRC threshold and above', () => {
    expect(calc({ symptomScore: 1 }).group).toBe('A')
    expect(calc({ symptomScore: 2 }).group).toBe('B')
    expect(calc({ symptomScore: 4 }).group).toBe('B')
  })

  it('classifies Group B at the CAAT threshold and above', () => {
    expect(calc({ symptomMethod: 'caat', symptomScore: 9 }).group).toBe('A')
    expect(calc({ symptomMethod: 'caat', symptomScore: 10 }).group).toBe('B')
    expect(calc({ symptomMethod: 'caat', symptomScore: 40 }).group).toBe('B')
  })

  it('classifies Group E after one or more moderate or severe exacerbations, regardless of symptoms', () => {
    expect(calc({ moderateOrSevereExacerbations: 1, symptomScore: 0 }).group).toBe('E')
    expect(calc({ moderateOrSevereExacerbations: 4, symptomScore: 4 }).group).toBe('E')
    expect(calc({ moderateOrSevereExacerbations: 1, symptomMethod: 'caat', symptomScore: 0 }).group).toBe('E')
  })

  it('does not confirm obstruction when post-bronchodilator FEV1/FVC is 0.70 or higher', () => {
    expect(calc({ fev1FvcPercent: 69.9 }).spirometricObstruction).toBe(true)
    expect(calc({ fev1FvcPercent: 70 }).spirometricObstruction).toBe(false)
    expect(calc({ fev1FvcPercent: 70 }).group).toBeNull()
    expect(calc({ fev1FvcPercent: 70 }).grade).toBeNull()
  })

  it('assigns spirometric grades at each FEV1 threshold', () => {
    expect(calc({ fev1PercentPredicted: 80 }).grade).toBe(1)
    expect(calc({ fev1PercentPredicted: 79.9 }).grade).toBe(2)
    expect(calc({ fev1PercentPredicted: 50 }).grade).toBe(2)
    expect(calc({ fev1PercentPredicted: 49.9 }).grade).toBe(3)
    expect(calc({ fev1PercentPredicted: 30 }).grade).toBe(3)
    expect(calc({ fev1PercentPredicted: 29.9 }).grade).toBe(4)
  })

  it('rejects invalid ranges, non-integer counts and invalid symptom scores', () => {
    expect(() => calc({ fev1FvcPercent: 9.9 })).toThrow()
    expect(() => calc({ fev1FvcPercent: 150.1 })).toThrow()
    expect(() => calc({ fev1PercentPredicted: 0 })).toThrow()
    expect(() => calc({ fev1PercentPredicted: 200.1 })).toThrow()
    expect(() => calc({ moderateOrSevereExacerbations: -1 })).toThrow()
    expect(() => calc({ moderateOrSevereExacerbations: 1.5 })).toThrow()
    expect(() => calc({ symptomScore: -1 })).toThrow()
    expect(() => calc({ symptomScore: 4.1 })).toThrow()
    expect(() => calc({ symptomMethod: 'caat', symptomScore: 41 })).toThrow()
  })
})
