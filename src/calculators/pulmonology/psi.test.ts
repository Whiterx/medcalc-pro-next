import { describe, expect, it } from 'vitest'
import { calculatePSI, type PSIInput } from './psi'

const base: PSIInput = {
  age: 50, sex: 'male', respiratoryRate: 20, systolicBP: 120, heartRate: 80, temperatureC: 37,
  nursingHome: false, neoplasticDisease: false, liverDisease: false, heartFailure: false,
  cerebrovascularDisease: false, renalDisease: false, alteredMentalStatus: false,
  bunUreaMmol: 5, sodiumMmol: 140, glucoseMmol: 5, hematocritPercent: 40, arterialPH: 7.4,
  hypoxemia: false, pleuralEffusion: false,
}
const calc = (overrides: Partial<PSIInput>) => calculatePSI({ ...base, ...overrides })

describe('calculatePSI', () => {
  it('assigns class I by step 1 when age is 50 or younger and no step-1 risk factors exist', () => {
    expect(calc({ age: 50 }).riskClass).toBe('I')
    expect(calc({ age: 18 }).score).toBeNull()
    expect(calc({ age: 50, nursingHome: true }).riskClass).toBe('I')
  })

  it('moves to step 2 for age over 50 and applies sex-adjusted age points', () => {
    expect(calc({ age: 51 }).score).toBe(51)
    expect(calc({ age: 51, sex: 'female' }).score).toBe(41)
  })

  it('checks step-1 thresholds at and around each boundary', () => {
    expect(calc({ age: 50 }).riskClass).toBe('I')
    expect(calc({ age: 51 }).riskClass).toBe('II')
    expect(calc({ respiratoryRate: 29 }).riskClass).toBe('I')
    expect(calc({ respiratoryRate: 30 }).score).toBe(70)
    expect(calc({ systolicBP: 90 }).riskClass).toBe('I')
    expect(calc({ systolicBP: 89 }).score).toBe(70)
    expect(calc({ heartRate: 124 }).riskClass).toBe('I')
    expect(calc({ heartRate: 125 }).score).toBe(60)
    expect(calc({ temperatureC: 35 }).riskClass).toBe('I')
    expect(calc({ temperatureC: 34.9 }).score).toBe(65)
    expect(calc({ temperatureC: 39.9 }).riskClass).toBe('I')
    expect(calc({ temperatureC: 40 }).score).toBe(65)
  })

  it('applies comorbidity points correctly', () => {
    expect(calc({ age: 51, neoplasticDisease: true }).score).toBe(81)
    expect(calc({ age: 51, liverDisease: true }).score).toBe(71)
    expect(calc({ age: 51, heartFailure: true }).score).toBe(61)
    expect(calc({ age: 51, cerebrovascularDisease: true }).score).toBe(61)
    expect(calc({ age: 51, renalDisease: true }).score).toBe(61)
    expect(calc({ age: 51, nursingHome: true }).score).toBe(61)
  })

  it('scores laboratory and radiology thresholds on exact boundaries', () => {
    expect(calc({ age: 51, arterialPH: 7.35 }).score).toBe(51)
    expect(calc({ age: 51, arterialPH: 7.34 }).score).toBe(81)
    expect(calc({ age: 51, bunUreaMmol: 10.9 }).score).toBe(51)
    expect(calc({ age: 51, bunUreaMmol: 11 }).score).toBe(71)
    expect(calc({ age: 51, sodiumMmol: 130 }).score).toBe(51)
    expect(calc({ age: 51, sodiumMmol: 129.9 }).score).toBe(71)
    expect(calc({ age: 51, glucoseMmol: 13.9 }).score).toBe(51)
    expect(calc({ age: 51, glucoseMmol: 14 }).score).toBe(61)
    expect(calc({ age: 51, hematocritPercent: 30 }).score).toBe(51)
    expect(calc({ age: 51, hematocritPercent: 29.9 }).score).toBe(61)
    expect(calc({ age: 51, hypoxemia: true }).score).toBe(61)
    expect(calc({ age: 51, pleuralEffusion: true }).score).toBe(61)
  })

  it('assigns classes II–V at published score cutoffs', () => {
    expect(calc({ age: 51 }).riskClass).toBe('II')
    expect(calc({ age: 70 }).riskClass).toBe('II')
    expect(calc({ age: 71 }).riskClass).toBe('III')
    expect(calc({ age: 90 }).riskClass).toBe('III')
    expect(calc({ age: 91 }).riskClass).toBe('IV')
    expect(calc({ age: 100, neoplasticDisease: true }).score).toBe(130)
    expect(calc({ age: 100, neoplasticDisease: true }).riskClass).toBe('IV')
    expect(calc({ age: 101, neoplasticDisease: true }).score).toBe(131)
    expect(calc({ age: 101, neoplasticDisease: true }).riskClass).toBe('V')
  })

  it('matches the legacy high-severity example with corrected sodium points', () => {
    const result = calc({
      age: 60, respiratoryRate: 32, systolicBP: 85, heartRate: 130, temperatureC: 34.5,
      bunUreaMmol: 12, sodiumMmol: 128, glucoseMmol: 15, hematocritPercent: 28, arterialPH: 7.3,
      hypoxemia: true, alteredMentalStatus: true,
    })
    expect(result.score).toBe(245)
    expect(result.riskClass).toBe('V')
  })

  it('does not require or substitute step-two laboratory values for class I, but requires them for classes II–V', () => {
    const stepOneOnly = {
      age: 50, respiratoryRate: 20, systolicBP: 120, heartRate: 80, temperatureC: 37,
      nursingHome: false, neoplasticDisease: false, liverDisease: false, heartFailure: false,
      cerebrovascularDisease: false, renalDisease: false, alteredMentalStatus: false,
      hypoxemia: false, pleuralEffusion: false,
    }
    expect(calculatePSI(stepOneOnly).riskClass).toBe('I')
    expect(() => calculatePSI({ ...stepOneOnly, age: 51 })).toThrow()
  })

  it('rejects invalid values and non-integer demographic/vital inputs', () => {
    expect(() => calc({ age: 17 })).toThrow()
    expect(() => calc({ age: 121 })).toThrow()
    expect(() => calc({ age: 50.5 })).toThrow()
    expect(() => calc({ respiratoryRate: 0 })).toThrow()
    expect(() => calc({ respiratoryRate: 30.5 })).toThrow()
    expect(() => calc({ systolicBP: 0 })).toThrow()
    expect(() => calc({ heartRate: 301 })).toThrow()
    expect(() => calc({ temperatureC: 24.9 })).toThrow()
    expect(() => calc({ age: 51, bunUreaMmol: -1 })).toThrow()
    expect(() => calc({ age: 51, sodiumMmol: 79 })).toThrow()
    expect(() => calc({ age: 51, glucoseMmol: 101 })).toThrow()
    expect(() => calc({ age: 51, hematocritPercent: 81 })).toThrow()
    expect(() => calc({ age: 51, arterialPH: 7.9 })).toThrow()
  })
})
