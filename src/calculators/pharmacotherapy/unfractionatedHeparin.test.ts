import { describe, expect, it } from 'vitest'
import { calculateUFHInitialDosing } from './unfractionatedHeparin'

describe('calculateUFHInitialDosing', () => {
  it('calculates the VTE protocol at 80 units/kg bolus and 18 units/kg/h', () => {
    const result = calculateUFHInitialDosing({ actualBodyWeightKg: 70, indication: 'vte' })
    expect(result.bolusUnits).toBe(5600)
    expect(result.infusionUnitsPerHour).toBe(1260)
    expect(result.bolusCapped).toBe(false)
    expect(result.infusionCapped).toBe(false)
  })

  it('applies the suggested VTE protocol caps', () => {
    const result = calculateUFHInitialDosing({ actualBodyWeightKg: 150, indication: 'vte' })
    expect(result.calculatedBolusUnits).toBe(12000)
    expect(result.bolusUnits).toBe(10000)
    expect(result.bolusCapped).toBe(true)
    expect(result.calculatedInfusionUnitsPerHour).toBe(2700)
    expect(result.infusionUnitsPerHour).toBe(2000)
    expect(result.infusionCapped).toBe(true)
  })

  it('calculates the 2025 ACS protocol and caps', () => {
    const result = calculateUFHInitialDosing({ actualBodyWeightKg: 70, indication: 'acs' })
    expect(result.calculatedBolusUnits).toBe(4200)
    expect(result.bolusUnits).toBe(4000)
    expect(result.bolusCapped).toBe(true)
    expect(result.infusionUnitsPerHour).toBe(840)
    expect(result.infusionCapped).toBe(false)
  })

  it('applies the ACS infusion maximum at high body weight', () => {
    const result = calculateUFHInitialDosing({ actualBodyWeightKg: 100, indication: 'acs' })
    expect(result.bolusUnits).toBe(4000)
    expect(result.infusionUnitsPerHour).toBe(1000)
    expect(result.infusionCapped).toBe(true)
  })

  it('rejects invalid weight and unsupported indication', () => {
    expect(() => calculateUFHInitialDosing({ actualBodyWeightKg: 0, indication: 'vte' })).toThrow()
    expect(() => calculateUFHInitialDosing({ actualBodyWeightKg: 301, indication: 'vte' })).toThrow()
    expect(() => calculateUFHInitialDosing({ actualBodyWeightKg: 70, indication: 'stroke' as 'vte' })).toThrow()
  })
})
