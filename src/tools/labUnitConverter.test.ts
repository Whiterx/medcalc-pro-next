import { describe, expect, it } from 'vitest'
import { convertLabValue, formatLabValue, parseLabValue } from './labUnitConverter'

describe('laboratory unit conversion', () => {
  it('converts creatinine between µmol/L and mg/dL', () => {
    expect(convertLabValue(88.4, 'creatinine', 'si-to-conventional')).toBe(1)
    expect(convertLabValue(1, 'creatinine', 'conventional-to-si')).toBe(88.4)
  })

  it('keeps urea and BUN as distinct conversions', () => {
    expect(convertLabValue(10, 'urea', 'si-to-conventional')).toBe(60)
    expect(convertLabValue(10, 'bun', 'si-to-conventional')).toBe(28)
    expect(convertLabValue(60, 'urea', 'conventional-to-si')).toBe(10)
    expect(convertLabValue(28, 'bun', 'conventional-to-si')).toBe(10)
  })

  it('converts glucose, bilirubin, albumin and CRP', () => {
    expect(convertLabValue(5.5, 'glucose', 'si-to-conventional')).toBe(99)
    expect(convertLabValue(17.1, 'bilirubin', 'si-to-conventional')).toBe(1)
    expect(convertLabValue(40, 'albumin', 'si-to-conventional')).toBe(4)
    expect(convertLabValue(10, 'crp', 'si-to-conventional')).toBe(1)
  })

  it('rounds to two decimal places and formats without unnecessary zeroes', () => {
    expect(convertLabValue(100, 'creatinine', 'si-to-conventional')).toBe(1.13)
    expect(formatLabValue(1.5)).toBe('1.5')
    expect(formatLabValue(2)).toBe('2')
  })

  it('parses decimal commas and rejects invalid input', () => {
    expect(parseLabValue('5,5')).toBe(5.5)
    expect(parseLabValue('')).toBeNull()
    expect(() => parseLabValue('-1')).toThrow()
    expect(() => parseLabValue('abc')).toThrow()
    expect(() => parseLabValue('Infinity')).toThrow()
  })

  it('rejects invalid numeric values', () => {
    expect(() => convertLabValue(-1, 'glucose', 'si-to-conventional')).toThrow()
    expect(() => convertLabValue(Number.NaN, 'creatinine', 'si-to-conventional')).toThrow()
    expect(() => convertLabValue(1, 'unknown' as 'glucose', 'si-to-conventional')).toThrow()
  })
})
