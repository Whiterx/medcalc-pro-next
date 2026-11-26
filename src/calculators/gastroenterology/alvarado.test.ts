import { describe, expect, it } from 'vitest'
import { calculateAlvarado, classifyAlvarado, type AlvaradoInput } from './alvarado'

const none: AlvaradoInput = {
  migration: false, anorexia: false, nauseaVomiting: false, rightLowerQuadrantTenderness: false,
  reboundTenderness: false, elevatedTemperature: false, leukocytosis: false, leftShift: false,
}

describe('calculateAlvarado', () => {
  it('returns zero when all assessed criteria are absent', () => {
    const result = calculateAlvarado(none)
    expect(result.score).toBe(0)
    expect(result.category).toBe('low')
    expect(result.criteria).toHaveLength(8)
  })

  it('applies the original weights and reaches the maximum of 10', () => {
    const result = calculateAlvarado({
      migration: true, anorexia: true, nauseaVomiting: true, rightLowerQuadrantTenderness: true,
      reboundTenderness: true, elevatedTemperature: true, leukocytosis: true, leftShift: true,
    })
    expect(result.score).toBe(10)
    expect(result.maxScore).toBe(10)
    expect(result.category).toBe('high')
  })

  it('weights RLQ tenderness and leukocytosis as two points each', () => {
    expect(calculateAlvarado({ ...none, rightLowerQuadrantTenderness: true }).score).toBe(2)
    expect(calculateAlvarado({ ...none, leukocytosis: true }).score).toBe(2)
  })

  it('adds every one-point criterion independently', () => {
    const keys: (keyof AlvaradoInput)[] = ['migration', 'anorexia', 'nauseaVomiting', 'reboundTenderness', 'elevatedTemperature', 'leftShift']
    for (const key of keys) expect(calculateAlvarado({ ...none, [key]: true }).score).toBe(1)
  })

  it.each([
    [0, 'low'], [4, 'low'], [5, 'intermediate'], [6, 'intermediate'], [7, 'high'], [10, 'high'],
  ] as const)('classifies score %s correctly', (score, expected) => {
    expect(classifyAlvarado(score).category).toBe(expected)
  })

  it('rejects missing or non-boolean criteria', () => {
    expect(() => calculateAlvarado({ ...none, migration: undefined as unknown as boolean })).toThrow()
    expect(() => calculateAlvarado({ ...none, leukocytosis: 1 as unknown as boolean })).toThrow()
  })

  it('rejects scores outside the possible range', () => {
    expect(() => classifyAlvarado(-1)).toThrow()
    expect(() => classifyAlvarado(11)).toThrow()
    expect(() => classifyAlvarado(5.5)).toThrow()
  })
})
