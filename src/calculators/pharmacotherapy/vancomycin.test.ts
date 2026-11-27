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

  it('accepts both technical weight boundaries', () => {
    const minimum = calculateVancomycinInitialDose({ actualBodyWeightKg: 20 })
    expect(minimum.loadingDoseMinMg).toBe(400)
    expect(minimum.loadingDoseMaxMg).toBe(500)
    expect(minimum.maintenanceDoseMinMg).toBe(300)
    expect(minimum.maintenanceDoseMaxMg).toBe(400)

    const maximum = calculateVancomycinInitialDose({ actualBodyWeightKg: 300 })
    expect(maximum.loadingDoseMinMg).toBe(3000)
    expect(maximum.loadingDoseMaxMg).toBe(3000)
    expect(maximum.loadingDoseCapped).toBe(true)
    expect(maximum.maintenanceDoseMinMg).toBe(4500)
    expect(maximum.maintenanceDoseMaxMg).toBe(6000)
  })

  it('activates the loading-dose cap only when the uncapped upper bound exceeds 3000 mg', () => {
    const atBoundary = calculateVancomycinInitialDose({ actualBodyWeightKg: 120 })
    expect(atBoundary.loadingDoseMaxMg).toBe(3000)
    expect(atBoundary.loadingDoseCapped).toBe(false)

    const aboveBoundary = calculateVancomycinInitialDose({ actualBodyWeightKg: 120.1 })
    expect(aboveBoundary.loadingDoseMaxMg).toBe(3000)
    expect(aboveBoundary.loadingDoseCapped).toBe(true)
  })

  it('rejects non-finite and out-of-range weights', () => {
    expect(() => calculateVancomycinInitialDose({ actualBodyWeightKg: 0 })).toThrow()
    expect(() => calculateVancomycinInitialDose({ actualBodyWeightKg: 19.9 })).toThrow()
    expect(() => calculateVancomycinInitialDose({ actualBodyWeightKg: 300.1 })).toThrow()
    expect(() => calculateVancomycinInitialDose({ actualBodyWeightKg: Number.NaN })).toThrow()
    expect(() => calculateVancomycinInitialDose({ actualBodyWeightKg: Number.POSITIVE_INFINITY })).toThrow()
    expect(() => calculateVancomycinInitialDose({ actualBodyWeightKg: Number.NEGATIVE_INFINITY })).toThrow()
  })
})
