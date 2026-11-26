import { describe, expect, it } from 'vitest'
import { calculateBODE, type BODEInput } from './bode'

const base: BODEInput = { fev1Percent: 65, sixMinuteWalkMeters: 350, mmrc: 0, bmi: 21.1 }
const withValues = (overrides: Partial<BODEInput>) => calculateBODE({ ...base, ...overrides })

describe('calculateBODE', () => {
  it('returns zero for the lowest-point combination', () => {
    const result = calculateBODE(base)
    expect(result.score).toBe(0)
    expect(result.quartile).toBe(1)
    expect(result.components.map((item) => item.points)).toEqual([0, 0, 0, 0])
  })

  it('scores FEV1 boundaries exactly', () => {
    expect(withValues({ fev1Percent: 65 }).components[0].points).toBe(0)
    expect(withValues({ fev1Percent: 64 }).components[0].points).toBe(1)
    expect(withValues({ fev1Percent: 50 }).components[0].points).toBe(1)
    expect(withValues({ fev1Percent: 49 }).components[0].points).toBe(2)
    expect(withValues({ fev1Percent: 36 }).components[0].points).toBe(2)
    expect(withValues({ fev1Percent: 35 }).components[0].points).toBe(3)
  })

  it('scores six-minute walk distance boundaries exactly', () => {
    expect(withValues({ sixMinuteWalkMeters: 350 }).components[1].points).toBe(0)
    expect(withValues({ sixMinuteWalkMeters: 349 }).components[1].points).toBe(1)
    expect(withValues({ sixMinuteWalkMeters: 250 }).components[1].points).toBe(1)
    expect(withValues({ sixMinuteWalkMeters: 249 }).components[1].points).toBe(2)
    expect(withValues({ sixMinuteWalkMeters: 150 }).components[1].points).toBe(2)
    expect(withValues({ sixMinuteWalkMeters: 149 }).components[1].points).toBe(3)
  })

  it('scores mMRC 0–1 as zero and 2–4 as 1–3 points', () => {
    expect(withValues({ mmrc: 0 }).components[2].points).toBe(0)
    expect(withValues({ mmrc: 1 }).components[2].points).toBe(0)
    expect(withValues({ mmrc: 2 }).components[2].points).toBe(1)
    expect(withValues({ mmrc: 3 }).components[2].points).toBe(2)
    expect(withValues({ mmrc: 4 }).components[2].points).toBe(3)
  })

  it('scores BMI >21 as zero and BMI ≤21 as one point', () => {
    expect(withValues({ bmi: 21.1 }).components[3].points).toBe(0)
    expect(withValues({ bmi: 21 }).components[3].points).toBe(1)
    expect(withValues({ bmi: 20.9 }).components[3].points).toBe(1)
  })

  it('sums to a maximum of 10 and assigns the published score quartiles', () => {
    const result = calculateBODE({ fev1Percent: 35, sixMinuteWalkMeters: 149, mmrc: 4, bmi: 21 })
    expect(result.score).toBe(10)
    expect(result.quartile).toBe(4)
    expect(withValues({ fev1Percent: 50, sixMinuteWalkMeters: 350, mmrc: 0, bmi: 22 }).quartile).toBe(1)
    expect(calculateBODE({ fev1Percent: 50, sixMinuteWalkMeters: 250, mmrc: 2, bmi: 22 }).quartile).toBe(2)
    expect(calculateBODE({ fev1Percent: 49, sixMinuteWalkMeters: 150, mmrc: 3, bmi: 22 }).quartile).toBe(3)
  })

  it('rejects non-integer or out-of-range physiological inputs', () => {
    expect(() => withValues({ fev1Percent: 64.5 })).toThrow()
    expect(() => withValues({ fev1Percent: 0 })).toThrow()
    expect(() => withValues({ fev1Percent: 201 })).toThrow()
    expect(() => withValues({ sixMinuteWalkMeters: 10.5 })).toThrow()
    expect(() => withValues({ sixMinuteWalkMeters: 1001 })).toThrow()
    expect(() => withValues({ mmrc: 5 })).toThrow()
    expect(() => withValues({ bmi: 4.9 })).toThrow()
    expect(() => withValues({ bmi: 100.1 })).toThrow()
  })
})
