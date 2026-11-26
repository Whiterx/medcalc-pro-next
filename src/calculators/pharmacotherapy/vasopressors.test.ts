import { describe, expect, it } from 'vitest'
import { calculateVasoactiveRate } from './vasopressors'

describe('calculateVasoactiveRate', () => {
  it('calculates norepinephrine rate from mcg/kg/min and mg in final volume', () => {
    const result = calculateVasoactiveRate({
      drug: 'norepinephrine', dose: 0.1, weightKg: 70, drugAmount: 4, finalVolumeMl: 50,
    })
    expect(result.concentration).toBe(80)
    expect(result.concentrationUnit).toBe('мкг/мл')
    expect(result.deliveredDosePerMinute).toBe(7)
    expect(result.infusionRateMlH).toBeCloseTo(5.25, 8)
    expect(result.infusionRateMlMin).toBeCloseTo(0.0875, 8)
  })

  it('uses the same weight-based formula for epinephrine, dopamine and dobutamine', () => {
    for (const drug of ['epinephrine', 'dopamine', 'dobutamine'] as const) {
      const result = calculateVasoactiveRate({ drug, dose: 2, weightKg: 50, drugAmount: 10, finalVolumeMl: 100 })
      expect(result.deliveredDosePerMinute).toBe(100)
      expect(result.infusionRateMlH).toBeCloseTo(60, 8)
    }
  })

  it('calculates vasopressin in units/min without requiring body weight', () => {
    const result = calculateVasoactiveRate({ drug: 'vasopressin', dose: 0.03, drugAmount: 20, finalVolumeMl: 50 })
    expect(result.concentration).toBe(0.4)
    expect(result.concentrationUnit).toBe('Ед/мл')
    expect(result.infusionRateMlH).toBeCloseTo(4.5, 8)
    expect(result.deliveredDoseUnit).toBe('Ед/мин')
    expect(result.weightKg).toBeNull()
  })

  it('flags an unusually high infusion rate without changing the calculated value', () => {
    const result = calculateVasoactiveRate({ drug: 'norepinephrine', dose: 3, weightKg: 100, drugAmount: 1, finalVolumeMl: 50 })
    expect(result.highInfusionRateWarning).toBe(true)
    expect(result.infusionRateMlH).toBeGreaterThan(99)
  })

  it('rejects missing weight for weight-based drugs', () => {
    expect(() => calculateVasoactiveRate({ drug: 'norepinephrine', dose: 0.1, drugAmount: 4, finalVolumeMl: 50 })).toThrow()
  })

  it('rejects invalid dose, concentration amount and final volume', () => {
    expect(() => calculateVasoactiveRate({ drug: 'norepinephrine', dose: 0, weightKg: 70, drugAmount: 4, finalVolumeMl: 50 })).toThrow()
    expect(() => calculateVasoactiveRate({ drug: 'vasopressin', dose: 0.03, drugAmount: 0, finalVolumeMl: 50 })).toThrow()
    expect(() => calculateVasoactiveRate({ drug: 'vasopressin', dose: 0.03, drugAmount: 20, finalVolumeMl: 0 })).toThrow()
    expect(() => calculateVasoactiveRate({ drug: 'dobutamine', dose: 1, weightKg: 501, drugAmount: 10, finalVolumeMl: 50 })).toThrow()
  })
})
