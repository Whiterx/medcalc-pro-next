import { describe, expect, it } from 'vitest'
import { calculateSPESI, type SPESIInput } from './spesi'

const base: SPESIInput = {
  age: 80, historyOfCancer: false, chronicCardiopulmonaryDisease: false,
  heartRate: 109, systolicBP: 100, oxygenSaturation: 90,
}

describe('calculateSPESI', () => {
  it('returns zero and low risk at all normal threshold values', () => {
    const result = calculateSPESI(base)
    expect(result.score).toBe(0)
    expect(result.lowRisk).toBe(true)
    expect(result.criteria).toHaveLength(6)
  })

  it('uses strict age threshold greater than 80 years', () => {
    expect(calculateSPESI({ ...base, age: 80 }).criteria[0].points).toBe(0)
    expect(calculateSPESI({ ...base, age: 81 }).criteria[0].points).toBe(1)
  })

  it('scores cancer and chronic cardiopulmonary disease independently', () => {
    expect(calculateSPESI({ ...base, historyOfCancer: true }).score).toBe(1)
    expect(calculateSPESI({ ...base, chronicCardiopulmonaryDisease: true }).score).toBe(1)
  })

  it('uses exact heart rate threshold of 110 bpm', () => {
    expect(calculateSPESI({ ...base, heartRate: 109 }).criteria[3].points).toBe(0)
    expect(calculateSPESI({ ...base, heartRate: 110 }).criteria[3].points).toBe(1)
  })

  it('uses strict systolic blood pressure threshold below 100 mmHg', () => {
    expect(calculateSPESI({ ...base, systolicBP: 100 }).criteria[4].points).toBe(0)
    expect(calculateSPESI({ ...base, systolicBP: 99 }).criteria[4].points).toBe(1)
  })

  it('uses strict oxygen saturation threshold below 90 percent', () => {
    expect(calculateSPESI({ ...base, oxygenSaturation: 90 }).criteria[5].points).toBe(0)
    expect(calculateSPESI({ ...base, oxygenSaturation: 89 }).criteria[5].points).toBe(1)
  })

  it('classifies one or more points as increased risk', () => {
    expect(calculateSPESI({ ...base, historyOfCancer: true }).lowRisk).toBe(false)
  })

  it('reaches the maximum score of 6', () => {
    const result = calculateSPESI({
      age: 81, historyOfCancer: true, chronicCardiopulmonaryDisease: true,
      heartRate: 110, systolicBP: 99, oxygenSaturation: 89,
    })
    expect(result.score).toBe(6)
    expect(result.lowRisk).toBe(false)
  })

  it('rejects missing, non-integer and out-of-range numeric values', () => {
    expect(() => calculateSPESI({ ...base, age: 17 })).toThrow()
    expect(() => calculateSPESI({ ...base, age: 80.5 })).toThrow()
    expect(() => calculateSPESI({ ...base, heartRate: 301 })).toThrow()
    expect(() => calculateSPESI({ ...base, systolicBP: -1 })).toThrow()
    expect(() => calculateSPESI({ ...base, oxygenSaturation: 101 })).toThrow()
  })
})
