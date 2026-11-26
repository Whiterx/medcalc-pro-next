import { describe, expect, it } from 'vitest'
import { calculateChildPugh, classifyChildPugh, type ChildPughInput } from './childPugh'
const base: ChildPughInput = { bilirubin: 1, albumin: 1, inr: 1, ascites: 1, encephalopathy: 1 }
describe('calculateChildPugh', () => {
  it('calculates minimum score and class A', () => {
    const result = calculateChildPugh(base)
    expect(result.score).toBe(5)
    expect(result.classification).toBe('A')
    expect(result.criteria).toHaveLength(5)
  })
  it('calculates class A upper boundary at six points', () => {
    expect(calculateChildPugh({ ...base, bilirubin: 2 }).classification).toBe('A')
  })
  it('calculates class B boundaries', () => {
    expect(classifyChildPugh(7).classification).toBe('B')
    expect(classifyChildPugh(9).classification).toBe('B')
  })
  it('calculates class C boundaries', () => {
    expect(classifyChildPugh(10).classification).toBe('C')
    expect(classifyChildPugh(15).classification).toBe('C')
  })
  it('calculates maximum score', () => {
    expect(calculateChildPugh({ bilirubin: 3, albumin: 3, inr: 3, ascites: 3, encephalopathy: 3 }).score).toBe(15)
  })
  it('adds each parameter independently', () => {
    const keys = ['bilirubin', 'albumin', 'inr', 'ascites', 'encephalopathy'] as const
    for (const key of keys) expect(calculateChildPugh({ ...base, [key]: 3 }).score).toBe(7)
  })
  it('rejects missing, null, non-integer and out-of-range values', () => {
    expect(() => calculateChildPugh({ ...base, bilirubin: undefined })).toThrow()
    expect(() => calculateChildPugh({ ...base, albumin: null })).toThrow()
    expect(() => calculateChildPugh({ ...base, inr: 2.5 })).toThrow()
    expect(() => calculateChildPugh({ ...base, ascites: 0 })).toThrow()
    expect(() => calculateChildPugh({ ...base, encephalopathy: 4 })).toThrow()
  })
  it('rejects totals outside the possible score range', () => {
    expect(() => classifyChildPugh(4)).toThrow()
    expect(() => classifyChildPugh(16)).toThrow()
    expect(() => classifyChildPugh(7.5)).toThrow()
  })
})
