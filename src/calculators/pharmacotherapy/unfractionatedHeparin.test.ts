import { describe, expect, it } from 'vitest'
import { calculateUFHInitialDosing } from './unfractionatedHeparin'

describe('calculateUFHInitialDosing', () => {
  it('calculates the VTE protocol at 80 units/kg bolus and 18 units/kg/h', () => {
    const result = calculateUFHInitialDosing({ adultConfirmed: true, actualBodyWeightKg: 70, indication: 'vte' })
    expect(result.bolusUnits).toBe(5600)
    expect(result.infusionUnitsPerHour).toBe(1260)
    expect(result.bolusCapped).toBe(false)
    expect(result.infusionCapped).toBe(false)
    expect(result.indicationLabel).toContain('ASHP')
  })

  it('applies the suggested VTE protocol caps', () => {
    const result = calculateUFHInitialDosing({ adultConfirmed: true, actualBodyWeightKg: 150, indication: 'vte' })
    expect(result.calculatedBolusUnits).toBe(12000)
    expect(result.bolusUnits).toBe(10000)
    expect(result.bolusCapped).toBe(true)
    expect(result.calculatedInfusionUnitsPerHour).toBe(2700)
    expect(result.infusionUnitsPerHour).toBe(2000)
    expect(result.infusionCapped).toBe(true)
    expect(result.indicationLabel).toContain('ASHP')
  })

  it('calculates the 2025 ACS protocol and caps', () => {
    const result = calculateUFHInitialDosing({ adultConfirmed: true, actualBodyWeightKg: 70, indication: 'acs' })
    expect(result.calculatedBolusUnits).toBe(4200)
    expect(result.bolusUnits).toBe(4000)
    expect(result.bolusCapped).toBe(true)
    expect(result.infusionUnitsPerHour).toBe(840)
    expect(result.infusionCapped).toBe(false)
    expect(result.indicationLabel).toContain('ACC/AHA 2025')
  })

  it('applies the ACS infusion maximum at high body weight', () => {
    const result = calculateUFHInitialDosing({ adultConfirmed: true, actualBodyWeightKg: 100, indication: 'acs' })
    expect(result.bolusUnits).toBe(4000)
    expect(result.infusionUnitsPerHour).toBe(1000)
    expect(result.infusionCapped).toBe(true)
    expect(result.indicationLabel).toContain('ACC/AHA 2025')
  })

  it('does not flag the VTE bolus cap at its exact threshold', () => {
    const result = calculateUFHInitialDosing({ adultConfirmed: true, actualBodyWeightKg: 125, indication: 'vte' })
    expect(result.bolusUnits).toBe(10000)
    expect(result.bolusCapped).toBe(false)
    expect(result.infusionCapped).toBe(true)
  })

  it('does not flag the VTE infusion cap at its exact threshold', () => {
    const thresholdWeight = 2000 / 18
    const result = calculateUFHInitialDosing({ adultConfirmed: true, actualBodyWeightKg: thresholdWeight, indication: 'vte' })
    expect(result.calculatedInfusionUnitsPerHour).toBeCloseTo(2000)
    expect(result.infusionUnitsPerHour).toBeCloseTo(2000)
    expect(result.infusionCapped).toBe(false)
  })

  it('flags the VTE infusion cap immediately above its threshold', () => {
    const result = calculateUFHInitialDosing({ adultConfirmed: true, actualBodyWeightKg: 111.2, indication: 'vte' })
    expect(result.calculatedInfusionUnitsPerHour).toBeCloseTo(2001.6)
    expect(result.infusionUnitsPerHour).toBe(2000)
    expect(result.infusionCapped).toBe(true)
  })

  it('distinguishes the ACS bolus cap boundary', () => {
    const below = calculateUFHInitialDosing({ adultConfirmed: true, actualBodyWeightKg: 66.6, indication: 'acs' })
    const above = calculateUFHInitialDosing({ adultConfirmed: true, actualBodyWeightKg: 66.7, indication: 'acs' })
    expect(below.bolusCapped).toBe(false)
    expect(above.bolusCapped).toBe(true)
    expect(above.bolusUnits).toBe(4000)
  })

  it('respects the ACS infusion cap at the 0.1 kg UI input boundary', () => {
    const below = calculateUFHInitialDosing({ adultConfirmed: true, actualBodyWeightKg: 83.3, indication: 'acs' })
    const above = calculateUFHInitialDosing({ adultConfirmed: true, actualBodyWeightKg: 83.4, indication: 'acs' })
    expect(below.calculatedInfusionUnitsPerHour).toBeCloseTo(999.6)
    expect(below.infusionUnitsPerHour).toBeCloseTo(999.6)
    expect(below.infusionCapped).toBe(false)
    expect(above.calculatedInfusionUnitsPerHour).toBeCloseTo(1000.8)
    expect(above.infusionUnitsPerHour).toBe(1000)
    expect(above.infusionCapped).toBe(true)
  })

  it('requires confirmation that the patient is an adult', () => {
    expect(() => calculateUFHInitialDosing({ actualBodyWeightKg: 70, indication: 'vte', adultConfirmed: false })).toThrow('взрослый')
  })

  it('accepts technical weight boundaries and rejects values outside them', () => {
    expect(() => calculateUFHInitialDosing({ actualBodyWeightKg: 20, indication: 'vte', adultConfirmed: true })).not.toThrow()
    expect(() => calculateUFHInitialDosing({ actualBodyWeightKg: 300, indication: 'vte', adultConfirmed: true })).not.toThrow()
    expect(() => calculateUFHInitialDosing({ actualBodyWeightKg: 19.9, indication: 'vte', adultConfirmed: true })).toThrow()
    expect(() => calculateUFHInitialDosing({ actualBodyWeightKg: 300.1, indication: 'vte', adultConfirmed: true })).toThrow()
  })

  it('rejects invalid weight and unsupported indication', () => {
    expect(() => calculateUFHInitialDosing({ adultConfirmed: true, actualBodyWeightKg: 0, indication: 'vte' })).toThrow()
    expect(() => calculateUFHInitialDosing({ adultConfirmed: true, actualBodyWeightKg: 301, indication: 'vte' })).toThrow()
    expect(() => calculateUFHInitialDosing({ adultConfirmed: true, actualBodyWeightKg: 70, indication: 'stroke' as 'vte' })).toThrow()
  })
})
