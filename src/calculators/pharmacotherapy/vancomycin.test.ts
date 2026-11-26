import { describe, expect, it } from 'vitest'
import { calculateVancomycinInitialDose } from './vancomycin'

describe('calculateVancomycinInitialDose', () => {
  it('calculates loading and initial maintenance ranges using actual body weight', () => {
    const result = calculateVancomycinInitialDose({ actualBodyWeightKg: 70 })
    expect(result.loadingDoseMinMg).toBe(1400)
    expect(result.loadingDoseMaxMg).toBe(1750)
    expect(result.maintenanceDoseMinMg).toBe(1050)
    expect(result.maintenanceDoseMaxMg).toBe(1400)
    expect(result.loadingDoseCapped).toBe(false)
  })

  it('caps the loading dose at 3000 mg for high body weight', () => {
    const result = calculateVancomycinInitialDose({ actualBodyWeightKg: 150 })
    expect(result.loadingDoseMinMg).toBe(3000)
    expect(result.loadingDoseMaxMg).toBe(3000)
    expect(result.loadingDoseCapped).toBe(true)
    expect(result.maintenanceDoseMinMg).toBe(2250)
    expect(result.maintenanceDoseMaxMg).toBe(3000)
  })

  it('does not cap the maintenance dose range using the loading-dose cap', () => {
    const result = calculateVancomycinInitialDose({ actualBodyWeightKg: 120 })
    expect(result.loadingDoseMaxMg).toBe(3000)
    expect(result.maintenanceDoseMaxMg).toBe(2400)
  })

  it('rejects non-finite and out-of-range weights', () => {
    expect(() => calculateVancomycinInitialDose({ actualBodyWeightKg: 0 })).toThrow()
    expect(() => calculateVancomycinInitialDose({ actualBodyWeightKg: 19.9 })).toThrow()
    expect(() => calculateVancomycinInitialDose({ actualBodyWeightKg: 300.1 })).toThrow()
    expect(() => calculateVancomycinInitialDose({ actualBodyWeightKg: Number.NaN })).toThrow()
  })
})
