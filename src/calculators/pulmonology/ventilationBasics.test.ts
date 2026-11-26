import { describe, expect, it } from 'vitest'
import { calculatePBW, calculateVentilationBasics, classifyTidalVolumePerKg } from './ventilationBasics'

describe('Predicted body weight', () => {
  it('uses the male and female metric formulas', () => {
    expect(calculatePBW(152.4, 'male')).toBeCloseTo(50, 8)
    expect(calculatePBW(152.4, 'female')).toBeCloseTo(45.5, 8)
    expect(calculatePBW(170, 'male')).toBeCloseTo(66.016, 3)
    expect(calculatePBW(170, 'female')).toBeCloseTo(61.516, 3)
  })

  it('rejects invalid height and missing formula selection', () => {
    expect(() => calculatePBW(119.9, 'male')).toThrow()
    expect(() => calculatePBW(230.1, 'female')).toThrow()
    expect(() => calculatePBW(170, '' as never)).toThrow()
    expect(() => calculatePBW(Number.NaN, 'male')).toThrow()
  })
})

describe('Tidal volume calculation', () => {
  it('calculates rounded 4, 6 and 8 mL/kg PBW reference volumes', () => {
    const result = calculateVentilationBasics({ heightCm: 170, formulaSex: 'male', tidalVolumeMl: null })
    expect(result.tidalVolume4Ml).toBe(264)
    expect(result.tidalVolume6Ml).toBe(396)
    expect(result.tidalVolume8Ml).toBe(528)
    expect(result.measuredMlKg).toBeNull()
    expect(result.measuredRange).toBeNull()
  })

  it('classifies the inclusive 4–8 mL/kg range correctly', () => {
    expect(classifyTidalVolumePerKg(3.99)).toBe('below')
    expect(classifyTidalVolumePerKg(4)).toBe('within')
    expect(classifyTidalVolumePerKg(6)).toBe('within')
    expect(classifyTidalVolumePerKg(8)).toBe('within')
    expect(classifyTidalVolumePerKg(8.01)).toBe('above')
  })

  it('evaluates a measured tidal volume relative to PBW', () => {
    const result = calculateVentilationBasics({ heightCm: 170, formulaSex: 'male', tidalVolumeMl: 396 })
    expect(result.measuredMlKg).toBeCloseTo(6, 2)
    expect(result.measuredRange).toBe('within')
  })

  it('rejects non-integer or implausible measured tidal volume', () => {
    expect(() => calculateVentilationBasics({ heightCm: 170, formulaSex: 'male', tidalVolumeMl: 0 })).toThrow()
    expect(() => calculateVentilationBasics({ heightCm: 170, formulaSex: 'male', tidalVolumeMl: 100.5 })).toThrow()
    expect(() => calculateVentilationBasics({ heightCm: 170, formulaSex: 'male', tidalVolumeMl: 2001 })).toThrow()
  })
})
