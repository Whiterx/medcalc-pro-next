import { describe, expect, it } from 'vitest'
import { calculateWellsDVT, classifyWellsDVT, type WellsDVTInput } from './wellsDVT'

const none: WellsDVTInput = {
  activeCancer: false, paralysisOrCast: false, bedriddenOrSurgery: false, deepVenousTenderness: false,
  entireLegSwollen: false, calfDifferenceAtLeast3cm: false, pittingEdema: false, collateralVeins: false,
  previousDVT: false, alternativeDiagnosisAtLeastAsLikely: false, assessmentConfirmed: true,
}

describe('calculateWellsDVT', () => {
  it('requires explicit confirmation that all ten criteria were assessed', () => {
    expect(() => calculateWellsDVT({ ...none, assessmentConfirmed: false })).toThrow()
    expect(() => calculateWellsDVT({ ...none, assessmentConfirmed: undefined as unknown as boolean })).toThrow()
  })

  it('returns zero and unlikely when all criteria are absent after confirmation', () => {
    const result = calculateWellsDVT(none)
    expect(result.score).toBe(0)
    expect(result.category).toBe('unlikely')
    expect(result.criteria).toHaveLength(10)
  })

  it('adds one point independently for each positive risk criterion', () => {
    const keys: (keyof WellsDVTInput)[] = [
      'activeCancer', 'paralysisOrCast', 'bedriddenOrSurgery', 'deepVenousTenderness',
      'entireLegSwollen', 'calfDifferenceAtLeast3cm', 'pittingEdema', 'collateralVeins', 'previousDVT',
    ]
    for (const key of keys) expect(calculateWellsDVT({ ...none, [key]: true }).score).toBe(1)
  })

  it('subtracts two points when an alternative diagnosis is at least as likely', () => {
    const result = calculateWellsDVT({ ...none, alternativeDiagnosisAtLeastAsLikely: true })
    expect(result.score).toBe(-2)
    expect(result.category).toBe('unlikely')
  })

  it('classifies the two-level boundary correctly', () => {
    expect(classifyWellsDVT(1).category).toBe('unlikely')
    expect(classifyWellsDVT(2).category).toBe('likely')
  })

  it('combines positive criteria and the alternative diagnosis deduction', () => {
    const result = calculateWellsDVT({
      ...none, activeCancer: true, previousDVT: true, deepVenousTenderness: true,
      alternativeDiagnosisAtLeastAsLikely: true,
    })
    expect(result.score).toBe(1)
    expect(result.category).toBe('unlikely')
  })

  it('reaches the maximum score of 9', () => {
    const result = calculateWellsDVT({
      activeCancer: true, paralysisOrCast: true, bedriddenOrSurgery: true, deepVenousTenderness: true,
      entireLegSwollen: true, calfDifferenceAtLeast3cm: true, pittingEdema: true, collateralVeins: true,
      previousDVT: true, alternativeDiagnosisAtLeastAsLikely: false, assessmentConfirmed: true,
    })
    expect(result.score).toBe(9)
    expect(result.category).toBe('likely')
  })

  it('rejects missing or non-boolean criteria and impossible scores', () => {
    expect(() => calculateWellsDVT({ ...none, previousDVT: undefined as unknown as boolean })).toThrow()
    expect(() => calculateWellsDVT({ ...none, activeCancer: 1 as unknown as boolean })).toThrow()
    expect(() => classifyWellsDVT(-3)).toThrow()
    expect(() => classifyWellsDVT(10)).toThrow()
    expect(() => classifyWellsDVT(2.5)).toThrow()
  })
})
