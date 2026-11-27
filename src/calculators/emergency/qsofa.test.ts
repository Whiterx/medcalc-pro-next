import { describe, expect, it } from 'vitest'
import { calculateGCSTotal, calculateQSOFA, type QSOFAInput } from './qsofa'

const baseline: QSOFAInput = {
  respiratoryRate: 18,
  systolicBP: 120,
  gcs: 15,
}

describe('calculateGCSTotal', () => {
  it('sums valid eye, verbal, and motor scores', () => {
    expect(calculateGCSTotal('4', '5', '6')).toBe(15)
    expect(calculateGCSTotal('1', '1', '1')).toBe(3)
  })

  it('returns null when a component is not testable or missing', () => {
    expect(calculateGCSTotal('4', 'NT', '6')).toBeNull()
    expect(calculateGCSTotal('', '5', '6')).toBeNull()
  })

  it('rejects component values outside their valid ranges', () => {
    expect(calculateGCSTotal('5', '5', '6')).toBeNull()
    expect(calculateGCSTotal('4', '5', '7')).toBeNull()
  })
})

describe('calculateQSOFA', () => {
  it('returns zero for normal values', () => {
    const result = calculateQSOFA(baseline)
    expect(result.score).toBe(0)
    expect(result.positive).toBe(false)
  })

  it('awards a point at respiratory rate 22', () => {
    expect(calculateQSOFA({ ...baseline, respiratoryRate: 22 }).score).toBe(1)
  })

  it('awards a point at systolic blood pressure 100', () => {
    expect(calculateQSOFA({ ...baseline, systolicBP: 100 }).score).toBe(1)
  })

  it('awards a point when GCS is below 15', () => {
    expect(calculateQSOFA({ ...baseline, gcs: 14 }).score).toBe(1)
  })

  it('does not classify a single criterion as qSOFA positive', () => {
    const result = calculateQSOFA({ ...baseline, gcs: 14 })
    expect(result.score).toBe(1)
    expect(result.positive).toBe(false)
  })

  it('does not award points immediately below respiratory rate and blood pressure thresholds', () => {
    expect(calculateQSOFA({ ...baseline, respiratoryRate: 21 }).score).toBe(0)
    expect(calculateQSOFA({ ...baseline, systolicBP: 101 }).score).toBe(0)
  })

  it('classifies two or more criteria as qSOFA positive', () => {
    expect(calculateQSOFA({ ...baseline, respiratoryRate: 22, systolicBP: 100 }).positive).toBe(true)
    expect(calculateQSOFA({ ...baseline, respiratoryRate: 22, systolicBP: 100, gcs: 14 }).score).toBe(3)
  })

  it('includes the Russian CPG next steps for a positive qSOFA with suspected infection', () => {
    const result = calculateQSOFA({ ...baseline, respiratoryRate: 22, systolicBP: 100 })
    expect(result.positive).toBe(true)
    expect(result.interpretation).toContain('госпитализация')
    expect(result.interpretation).toContain('анестезиолога-реаниматолога')
  })

  it('does not label a negative qSOFA as ruling out sepsis', () => {
    expect(calculateQSOFA(baseline).interpretation).toMatch(/не исключают сепсис/i)
  })
})
