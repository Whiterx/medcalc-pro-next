import { describe, expect, it } from 'vitest'
import { calculateUFHInitialDosing } from './unfractionatedHeparin'

describe('calculateUFHInitialDosing — Russian clinical recommendations', () => {
  it('calculates the Russian CPG 960_1 weight-based IV UFH regimen without ASHP caps', () => {
    const result = calculateUFHInitialDosing({ adultConfirmed: true, bodyWeightKg: 70, indication: 'vte' })
    expect(result.bolusMinUnits).toBe(5600)
    expect(result.bolusMaxUnits).toBe(5600)
    expect(result.infusionMinUnitsPerHour).toBe(1260)
    expect(result.infusionMaxUnitsPerHour).toBe(1260)
    expect(result.bolusCapApplied).toBe(false)
    expect(result.infusionCapApplied).toBe(false)
    expect(result.indicationLabel).toContain('960_1')
  })

  it('does not apply ASHP maximums to the Russian CPG 960_1 regimen at high weight', () => {
    const result = calculateUFHInitialDosing({ adultConfirmed: true, bodyWeightKg: 150, indication: 'vte' })
    expect(result.bolusMinUnits).toBe(12000)
    expect(result.infusionMinUnitsPerHour).toBe(2700)
    expect(result.bolusCapApplied).toBe(false)
    expect(result.infusionCapApplied).toBe(false)
  })

  it('documents both Russian CPG 960_1 aPTT reference formulations without hard-coded seconds', () => {
    const result = calculateUFHInitialDosing({ adultConfirmed: true, bodyWeightKg: 70, indication: 'vte' })
    expect(result.monitoring).toContain('контрольной величины')
    expect(result.monitoring).toContain('верхней границы нормы')
    expect(result.monitoring).toContain('через 6 ч')
  })

  it('calculates the full recommended dose ranges for NSTE-ACS under Russian CPG 154_4', () => {
    const result = calculateUFHInitialDosing({ adultConfirmed: true, bodyWeightKg: 70, indication: 'acs' })
    expect(result.bolusMinUnits).toBe(4200)
    expect(result.bolusMaxUnits).toBe(4900)
    expect(result.infusionMinUnitsPerHour).toBe(840)
    expect(result.infusionMaxUnitsPerHour).toBe(1000)
    expect(result.bolusCapApplied).toBe(false)
    expect(result.infusionCapApplied).toBe(true)
    expect(result.indicationLabel).toContain('154_4')
    expect(result.monitoring).toContain('1,5–2,5')
  })

  it('applies the Russian CPG bolus and infusion maxima independently', () => {
    const result = calculateUFHInitialDosing({ adultConfirmed: true, bodyWeightKg: 100, indication: 'acs' })
    expect(result.bolusMinUnits).toBe(5000)
    expect(result.bolusMaxUnits).toBe(5000)
    expect(result.infusionMinUnitsPerHour).toBe(1000)
    expect(result.infusionMaxUnitsPerHour).toBe(1000)
    expect(result.bolusCapApplied).toBe(true)
    expect(result.infusionCapApplied).toBe(true)
  })

  it('does not flag the NSTE-ACS bolus cap when the upper dose is exactly at the cap', () => {
    const result = calculateUFHInitialDosing({ adultConfirmed: true, bodyWeightKg: 5000 / 70, indication: 'acs' })
    expect(result.bolusMaxUnits).toBeCloseTo(5000)
    expect(result.bolusCapApplied).toBe(false)
  })

  it('flags the NSTE-ACS bolus cap immediately above its threshold', () => {
    const result = calculateUFHInitialDosing({ adultConfirmed: true, bodyWeightKg: 71.5, indication: 'acs' })
    expect(result.bolusMinUnits).toBe(4290)
    expect(result.bolusMaxUnits).toBe(5000)
    expect(result.bolusCapApplied).toBe(true)
  })

  it('does not flag the NSTE-ACS infusion cap when the upper dose is exactly at the cap', () => {
    const result = calculateUFHInitialDosing({ adultConfirmed: true, bodyWeightKg: 1000 / 15, indication: 'acs' })
    expect(result.infusionMaxUnitsPerHour).toBeCloseTo(1000)
    expect(result.infusionCapApplied).toBe(false)
  })

  it('flags the NSTE-ACS infusion cap immediately above its threshold', () => {
    const result = calculateUFHInitialDosing({ adultConfirmed: true, bodyWeightKg: 66.7, indication: 'acs' })
    expect(result.infusionMinUnitsPerHour).toBeCloseTo(800.4)
    expect(result.infusionMaxUnitsPerHour).toBe(1000)
    expect(result.infusionCapApplied).toBe(true)
  })

  it('requires confirmation that the patient is an adult', () => {
    expect(() => calculateUFHInitialDosing({ bodyWeightKg: 70, indication: 'vte', adultConfirmed: false })).toThrow('взрослый')
  })

  it('accepts technical weight boundaries and rejects values outside them', () => {
    expect(() => calculateUFHInitialDosing({ bodyWeightKg: 20, indication: 'vte', adultConfirmed: true })).not.toThrow()
    expect(() => calculateUFHInitialDosing({ bodyWeightKg: 300, indication: 'vte', adultConfirmed: true })).not.toThrow()
    expect(() => calculateUFHInitialDosing({ bodyWeightKg: 19.9, indication: 'vte', adultConfirmed: true })).toThrow()
    expect(() => calculateUFHInitialDosing({ bodyWeightKg: 300.1, indication: 'vte', adultConfirmed: true })).toThrow()
  })

  it('rejects invalid weight and unsupported indication', () => {
    expect(() => calculateUFHInitialDosing({ bodyWeightKg: 0, indication: 'vte', adultConfirmed: true })).toThrow()
    expect(() => calculateUFHInitialDosing({ bodyWeightKg: 301, indication: 'vte', adultConfirmed: true })).toThrow()
    expect(() => calculateUFHInitialDosing({ bodyWeightKg: 70, indication: 'stroke' as 'vte', adultConfirmed: true })).toThrow()
  })
})
