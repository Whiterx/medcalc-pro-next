import { describe, expect, it } from 'vitest'
import { calculateCURB65, type CURB65Input } from './curb65'
const baseline: CURB65Input = { age: 40, urea: 5, respiratoryRate: 18, systolicBP: 120, diastolicBP: 80, confusion: false }
describe('calculateCURB65 — criteria and exact thresholds', () => {
  it('returns zero points when no criteria are met', () => {
    const result = calculateCURB65(baseline)
    expect(result.score).toBe(0)
    expect(result.risk).toBe('low')
  })
  it('awards a point at age 65, but not at 64', () => {
    expect(calculateCURB65({ ...baseline, age: 65 }).score).toBe(1)
    expect(calculateCURB65({ ...baseline, age: 64 }).score).toBe(0)
  })
  it('uses a strict urea threshold greater than 7 mmol/L', () => {
    expect(calculateCURB65({ ...baseline, urea: 7 }).score).toBe(0)
    expect(calculateCURB65({ ...baseline, urea: 7.001 }).score).toBe(1)
  })
  it('awards a point at respiratory rate 30, not 29', () => {
    expect(calculateCURB65({ ...baseline, respiratoryRate: 29 }).score).toBe(0)
    expect(calculateCURB65({ ...baseline, respiratoryRate: 30 }).score).toBe(1)
  })
  it('uses systolic <90 OR diastolic ≤60', () => {
    expect(calculateCURB65({ ...baseline, systolicBP: 89 }).score).toBe(1)
    expect(calculateCURB65({ ...baseline, systolicBP: 90 }).score).toBe(0)
    expect(calculateCURB65({ ...baseline, diastolicBP: 60 }).score).toBe(1)
    expect(calculateCURB65({ ...baseline, diastolicBP: 61 }).score).toBe(0)
  })
  it('awards a point for new confusion', () => {
    expect(calculateCURB65({ ...baseline, confusion: true }).score).toBe(1)
  })
  it('classifies all NICE NG250 mortality groups', () => {
    expect(calculateCURB65({ ...baseline, age: 65 }).risk).toBe('low')
    expect(calculateCURB65({ ...baseline, age: 65, confusion: true }).risk).toBe('intermediate')
    expect(calculateCURB65({ ...baseline, age: 65, confusion: true, urea: 8 }).risk).toBe('high')
    expect(calculateCURB65({ age: 65, urea: 8, respiratoryRate: 30, systolicBP: 85, diastolicBP: 55, confusion: true }).score).toBe(5)
  })
  it('distinguishes 3 points from >3 points in Russian CPG care context', () => {
    const three = calculateCURB65({ age: 65, urea: 8, respiratoryRate: 30, systolicBP: 120, diastolicBP: 80, confusion: false })
    const four = calculateCURB65({ age: 65, urea: 8, respiratoryRate: 30, systolicBP: 89, diastolicBP: 80, confusion: false })
    expect(three.score).toBe(3)
    expect(three.careContext).toContain('3 балла')
    expect(four.score).toBe(4)
    expect(four.careContext).toContain('ОРИТ')
  })
})
describe('calculateCURB65 — input validation', () => {
  it('rejects missing input and non-boolean confusion', () => {
    expect(() => calculateCURB65(null as unknown as CURB65Input)).toThrow()
    expect(() => calculateCURB65({ ...baseline, confusion: undefined as never })).toThrow()
  })
  it('rejects invalid age, urea, respiratory rate and blood pressure', () => {
    expect(() => calculateCURB65({ ...baseline, age: 17 })).toThrow()
    expect(() => calculateCURB65({ ...baseline, age: 65.5 })).toThrow()
    expect(() => calculateCURB65({ ...baseline, urea: Number.NaN })).toThrow()
    expect(() => calculateCURB65({ ...baseline, urea: -1 })).toThrow()
    expect(() => calculateCURB65({ ...baseline, respiratoryRate: 0 })).toThrow()
    expect(() => calculateCURB65({ ...baseline, respiratoryRate: 30.5 })).toThrow()
    expect(() => calculateCURB65({ ...baseline, systolicBP: 0 })).toThrow()
    expect(() => calculateCURB65({ ...baseline, diastolicBP: 201 })).toThrow()
  })
})