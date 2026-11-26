import { describe, expect, it } from 'vitest'
import { calculateQSOFA, type QSOFAInput } from './qsofa'

const baseline: QSOFAInput = {
  respiratoryRate: 18,
  systolicBP: 120,
  gcs: 15,
}

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

  it('classifies two or more criteria as qSOFA positive', () => {
    expect(calculateQSOFA({ ...baseline, respiratoryRate: 22, systolicBP: 100 }).positive).toBe(true)
    expect(calculateQSOFA({ ...baseline, respiratoryRate: 22, systolicBP: 100, gcs: 14 }).score).toBe(3)
  })

  it('does not label a negative qSOFA as ruling out sepsis', () => {
    expect(calculateQSOFA(baseline).interpretation).toMatch(/не исключают сепсис/i)
  })
})
