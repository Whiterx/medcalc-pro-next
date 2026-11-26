import { describe, expect, it } from 'vitest'
import { calculateQTC, type QTCInput } from './qtc'

const base: QTCInput = { qtMs: 400, rrMs: 1000, formula: 'bazett', sex: 'male' }
const calc = (overrides: Partial<QTCInput>) => calculateQTC({ ...base, ...overrides })

describe('calculateQTC', () => {
  it('calculates Bazett, Fridericia and Hodges correctly at 60 bpm', () => {
    expect(calc({ formula: 'bazett' }).qtcMs).toBeCloseTo(400, 8)
    expect(calc({ formula: 'fridericia' }).qtcMs).toBeCloseTo(400, 8)
    expect(calc({ formula: 'hodges' }).qtcMs).toBeCloseTo(400, 8)
  })

  it('uses the correct formula at a faster heart rate', () => {
    expect(calc({ qtMs: 360, rrMs: 500, formula: 'bazett' }).qtcMs).toBeCloseTo(509.1169, 3)
    expect(calc({ qtMs: 360, rrMs: 500, formula: 'fridericia' }).qtcMs).toBeCloseTo(453.543, 2)
    expect(calc({ qtMs: 360, rrMs: 500, formula: 'hodges' }).qtcMs).toBeCloseTo(465, 8)
    expect(calc({ qtMs: 360, rrMs: 500 }).heartRateBpm).toBe(120)
  })

  it('applies the male prolonged-QTc threshold strictly above 450 ms', () => {
    expect(calc({ qtMs: 450 }).category).toBe('normal')
    expect(calc({ qtMs: 450.1 }).category).toBe('prolonged')
  })

  it('applies the female prolonged-QTc threshold at 460 ms', () => {
    expect(calc({ sex: 'female', qtMs: 459.9 }).category).toBe('normal')
    expect(calc({ sex: 'female', qtMs: 460 }).category).toBe('prolonged')
  })

  it('identifies the sex-specific 99th-percentile upper limits', () => {
    expect(calc({ qtMs: 469.9 }).above99thPercentile).toBe(false)
    expect(calc({ qtMs: 470 }).above99thPercentile).toBe(true)
    expect(calc({ sex: 'female', qtMs: 479.9 }).above99thPercentile).toBe(false)
    expect(calc({ sex: 'female', qtMs: 480 }).above99thPercentile).toBe(true)
  })

  it('marks QTc above 500 ms as markedly prolonged', () => {
    expect(calc({ qtMs: 499.9 }).category).toBe('prolonged')
    expect(calc({ qtMs: 500 }).category).toBe('prolonged')
    expect(calc({ qtMs: 500.1 }).category).toBe('markedly-prolonged')
    expect(calc({ sex: 'female', qtMs: 500.1 }).category).toBe('markedly-prolonged')
  })

  it('rejects invalid ranges and missing categorical choices', () => {
    expect(() => calc({ qtMs: 99.9 })).toThrow()
    expect(() => calc({ qtMs: 1000.1 })).toThrow()
    expect(() => calc({ rrMs: 199.9 })).toThrow()
    expect(() => calc({ rrMs: 3000.1 })).toThrow()
    expect(() => calculateQTC({ ...base, formula: '' as QTCInput['formula'] })).toThrow()
    expect(() => calculateQTC({ ...base, sex: '' as QTCInput['sex'] })).toThrow()
  })
})
