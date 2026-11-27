import { describe, expect, it } from 'vitest'
import { calculateVasoactiveRate, createEmptyVasoactiveFormValues } from './vasopressors'

describe('createEmptyVasoactiveFormValues', () => {
  it('clears dose, weight and concentration whenever a new drug is selected', () => {
    for (const drug of ['norepinephrine', 'epinephrine', 'dopamine', 'dobutamine', 'vasopressin'] as const) {
      expect(createEmptyVasoactiveFormValues(drug)).toEqual({
        drug,
        dose: '',
        weightKg: '',
        concentration: '',
      })
    }
  })
})

describe('calculateVasoactiveRate', () => {
  it('calculates norepinephrine from mcg/kg/min and labeled mcg/ml concentration', () => {
    const result = calculateVasoactiveRate({ drug: 'norepinephrine', dose: 0.1, weightKg: 70, concentration: 80 })
    expect(result.deliveredDosePerMinute).toBe(7)
    expect(result.infusionRateMlH).toBeCloseTo(5.25, 8)
    expect(result.doseUnit).toBe('мкг/кг/мин')
  })

  it('calculates epinephrine in absolute mcg/min without body weight', () => {
    const result = calculateVasoactiveRate({ drug: 'epinephrine', dose: 1, concentration: 10 })
    expect(result.weightKg).toBeNull()
    expect(result.doseUnit).toBe('мкг/мин')
    expect(result.deliveredDosePerMinute).toBe(1)
    expect(result.infusionRateMlH).toBeCloseTo(6, 8)
  })

  it('calculates dopamine and dobutamine as weight-based doses', () => {
    for (const drug of ['dopamine', 'dobutamine'] as const) {
      const result = calculateVasoactiveRate({ drug, dose: 2, weightKg: 50, concentration: 100 })
      expect(result.deliveredDosePerMinute).toBe(100)
      expect(result.infusionRateMlH).toBeCloseTo(60, 8)
    }
  })

  it('calculates vasopressin in units/min without body weight', () => {
    const result = calculateVasoactiveRate({ drug: 'vasopressin', dose: 0.03, concentration: 0.4 })
    expect(result.concentrationUnit).toBe('Ед/мл')
    expect(result.infusionRateMlH).toBeCloseTo(4.5, 8)
    expect(result.deliveredDoseUnit).toBe('Ед/мин')
    expect(result.weightKg).toBeNull()
  })

  it('does not impose a universal high infusion-rate threshold', () => {
    const result = calculateVasoactiveRate({ drug: 'norepinephrine', dose: 3, weightKg: 100, concentration: 50 })
    expect(result.infusionRateMlH).toBeCloseTo(360, 8)
  })

  it('rejects missing weight for weight-based drugs', () => {
    expect(() => calculateVasoactiveRate({ drug: 'norepinephrine', dose: 0.1, concentration: 80 })).toThrow()
  })

  it('rejects invalid dose and concentration', () => {
    expect(() => calculateVasoactiveRate({ drug: 'norepinephrine', dose: 0, weightKg: 70, concentration: 80 })).toThrow()
    expect(() => calculateVasoactiveRate({ drug: 'vasopressin', dose: 0.03, concentration: 0 })).toThrow()
    expect(() => calculateVasoactiveRate({ drug: 'dobutamine', dose: 1, weightKg: 501, concentration: 100 })).toThrow()
  })
})
