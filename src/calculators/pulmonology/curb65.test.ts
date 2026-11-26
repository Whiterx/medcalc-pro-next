import { describe, expect, it } from 'vitest'
import { calculateCURB65, type CURB65Input } from './curb65'

const baseline: CURB65Input = {
  age: 40,
  urea: 5,
  respiratoryRate: 18,
  systolicBP: 120,
  diastolicBP: 80,
  confusion: false,
}

describe('calculateCURB65', () => {
  it('returns zero points and low risk when no criteria are met', () => {
    const result = calculateCURB65(baseline)
    expect(result.score).toBe(0)
    expect(result.risk).toBe('low')
  })

  it('awards a point at age 65', () => {
    expect(calculateCURB65({ ...baseline, age: 65 }).score).toBe(1)
  })

  it('uses a strict urea threshold greater than 7 mmol/L', () => {
    expect(calculateCURB65({ ...baseline, urea: 7 }).score).toBe(0)
    expect(calculateCURB65({ ...baseline, urea: 7.1 }).score).toBe(1)
  })

  it('awards a point at respiratory rate 30', () => {
    expect(calculateCURB65({ ...baseline, respiratoryRate: 30 }).score).toBe(1)
  })

  it('awards a point for systolic pressure below 90', () => {
    expect(calculateCURB65({ ...baseline, systolicBP: 89 }).score).toBe(1)
  })

  it('awards a point for diastolic pressure 60 or lower', () => {
    expect(calculateCURB65({ ...baseline, diastolicBP: 60 }).score).toBe(1)
  })

  it('awards a point for confusion', () => {
    expect(calculateCURB65({ ...baseline, confusion: true }).score).toBe(1)
  })

  it('classifies scores 0–1, 2, and 3–5 into NICE risk groups', () => {
    expect(calculateCURB65({ ...baseline, age: 65 }).risk).toBe('low')
    expect(calculateCURB65({ ...baseline, age: 65, confusion: true }).risk).toBe('intermediate')
    expect(calculateCURB65({ ...baseline, age: 65, confusion: true, urea: 8 }).risk).toBe('high')
  })

  it('can return the maximum score of five', () => {
    const result = calculateCURB65({
      age: 65,
      urea: 8,
      respiratoryRate: 30,
      systolicBP: 85,
      diastolicBP: 55,
      confusion: true,
    })
    expect(result.score).toBe(5)
    expect(result.risk).toBe('high')
  })
})
