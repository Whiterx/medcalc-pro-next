import { describe, expect, it } from 'vitest'
import { calculateFourTs, type FourTsInput } from './fourTs'

const base: FourTsInput = {
  thrombocytopenia: 0,
  timing: 0,
  thrombosisOrSequelae: 0,
  otherCauses: 0,
  assessmentConfirmed: true,
}
const calc = (overrides: Partial<FourTsInput>) => calculateFourTs({ ...base, ...overrides })

describe('calculateFourTs — Russian CPG 2025 / Lo 2006 4Ts score', () => {
  it('returns low probability at 0 points', () => {
    const result = calc({})
    expect(result.score).toBe(0)
    expect(result.category).toBe('low')
  })

  it('classifies 3 points as low probability', () => {
    const result = calc({ thrombocytopenia: 1, timing: 1, thrombosisOrSequelae: 1 })
    expect(result.score).toBe(3)
    expect(result.category).toBe('low')
  })

  it('classifies 4 and 5 points as intermediate probability', () => {
    expect(calc({ thrombocytopenia: 2, timing: 2 }).category).toBe('intermediate')
    const five = calc({ thrombocytopenia: 2, timing: 2, thrombosisOrSequelae: 1 })
    expect(five.score).toBe(5)
    expect(five.category).toBe('intermediate')
  })

  it('classifies 6 and 8 points as high probability', () => {
    const six = calc({ thrombocytopenia: 2, timing: 2, thrombosisOrSequelae: 2 })
    expect(six.score).toBe(6)
    expect(six.category).toBe('high')
    const eight = calc({ thrombocytopenia: 2, timing: 2, thrombosisOrSequelae: 2, otherCauses: 2 })
    expect(eight.score).toBe(8)
    expect(eight.category).toBe('high')
  })

  it('uses the Russian CPG 2025 / Lo 2006 timing windows', () => {
    const two = calc({ timing: 2 })
    const one = calc({ timing: 1 })
    const zero = calc({ timing: 0 })
    expect(two.components[1].interpretation).toContain('5–10-й день')
    expect(one.components[1].interpretation).toContain('после 10-го дня')
    expect(zero.components[1].interpretation).toContain('<4 дней')
  })

  it('uses the Russian CPG diagnostic pathway rather than ASH-specific labels', () => {
    expect(calc({}).pathway).toContain('КР РФ 2025')
    expect(calc({ thrombocytopenia: 2, timing: 2 }).pathway).toContain('КР РФ 2025')
    expect(calc({ thrombocytopenia: 2, timing: 2, thrombosisOrSequelae: 2 }).pathway).toContain('КР РФ 2025')
  })

  it('returns four scoring component explanations', () => {
    const result = calc({ thrombocytopenia: 2, timing: 1, thrombosisOrSequelae: 0, otherCauses: 2 })
    expect(result.components).toHaveLength(4)
    expect(result.components.map((component) => component.points)).toEqual([2, 1, 0, 2])
  })

  it('requires explicit confirmation of complete assessment', () => {
    expect(() => calc({ assessmentConfirmed: false })).toThrow()
  })

  it('rejects out-of-range point values', () => {
    expect(() => calculateFourTs({ ...base, thrombocytopenia: 3 as 0 | 1 | 2 })).toThrow()
    expect(() => calculateFourTs({ ...base, timing: -1 as 0 | 1 | 2 })).toThrow()
  })
})
