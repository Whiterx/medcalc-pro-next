import { describe, expect, it } from 'vitest'
import { calculateISS, type ISSInput } from './iss'

const none: ISSInput = {
  headNeck: 0, face: 0, chest: 0, abdomenPelvicContents: 0, extremitiesPelvicGirdle: 0, external: 0,
}

describe('calculateISS', () => {
  it('returns zero when all six regions have AIS 0', () => {
    const result = calculateISS(none)
    expect(result.score).toBe(0)
    expect(result.topThree).toHaveLength(3)
    expect(result.hasAIS6).toBe(false)
  })

  it('sums the squares of the three highest regional AIS values', () => {
    const result = calculateISS({ ...none, headNeck: 4, chest: 3, extremitiesPelvicGirdle: 2, face: 1 })
    expect(result.score).toBe(29)
    expect(result.topThree.map((region) => region.ais)).toEqual([4, 3, 2])
  })

  it('uses only the highest AIS value in each body region', () => {
    const result = calculateISS({ ...none, headNeck: 5, chest: 3, abdomenPelvicContents: 2 })
    expect(result.score).toBe(38)
    expect(result.topThree.map((region) => region.ais)).toEqual([5, 3, 2])
  })

  it('sets ISS to 75 when any region has AIS 6', () => {
    const result = calculateISS({ ...none, face: 6, chest: 1 })
    expect(result.score).toBe(75)
    expect(result.hasAIS6).toBe(true)
  })

  it('returns a score of 75 for three AIS 5 regions even without AIS 6', () => {
    const result = calculateISS({ ...none, headNeck: 5, chest: 5, abdomenPelvicContents: 5 })
    expect(result.score).toBe(75)
    expect(result.hasAIS6).toBe(false)
  })

  it('does not count the fourth and subsequent regions', () => {
    const result = calculateISS({ ...none, headNeck: 4, face: 3, chest: 2, external: 1 })
    expect(result.score).toBe(29)
  })

  it('rejects missing, fractional and out-of-range AIS codes', () => {
    expect(() => calculateISS({ ...none, face: undefined as unknown as number })).toThrow()
    expect(() => calculateISS({ ...none, face: 2.5 })).toThrow()
    expect(() => calculateISS({ ...none, face: -1 })).toThrow()
    expect(() => calculateISS({ ...none, face: 7 })).toThrow()
    expect(() => calculateISS({ ...none, face: 9 })).toThrow()
  })
})
