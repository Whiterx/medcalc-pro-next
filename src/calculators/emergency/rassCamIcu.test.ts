import { describe, expect, it } from 'vitest'
import { calculateRASSCAMICU, RASS_LABELS } from './rassCamIcu'

describe('calculateRASSCAMICU', () => {
  it('contains all ten RASS levels from +4 to -5', () => {
    expect(Object.keys(RASS_LABELS)).toHaveLength(10)
    expect(calculateRASSCAMICU({ rass: 4, acuteChangeOrFluctuation: false, inattentionErrors: 0, disorganizedThinkingErrors: 0 }).rass).toBe(4)
    expect(calculateRASSCAMICU({ rass: -5 }).rass).toBe(-5)
  })

  it.each([-5, -4])('marks CAM-ICU as unable to assess at RASS %s', (rass) => {
    const result = calculateRASSCAMICU({ rass })
    expect(result.camICUStatus).toBe('unable-to-assess')
    expect(result.feature1).toBeNull()
    expect(result.feature2).toBeNull()
    expect(result.feature4).toBeNull()
  })

  it('is CAM-ICU positive when features 1, 2 and 3 are present', () => {
    const result = calculateRASSCAMICU({ rass: -1, acuteChangeOrFluctuation: true, inattentionErrors: 3, disorganizedThinkingErrors: 0 })
    expect(result.feature1).toBe(true)
    expect(result.feature2).toBe(true)
    expect(result.feature3).toBe(true)
    expect(result.camICUStatus).toBe('positive')
  })

  it('is CAM-ICU positive when features 1, 2 and 4 are present', () => {
    const result = calculateRASSCAMICU({ rass: 0, acuteChangeOrFluctuation: true, inattentionErrors: 3, disorganizedThinkingErrors: 2 })
    expect(result.feature3).toBe(false)
    expect(result.feature4).toBe(true)
    expect(result.camICUStatus).toBe('positive')
  })

  it('requires both feature 1 and feature 2', () => {
    expect(calculateRASSCAMICU({ rass: 1, acuteChangeOrFluctuation: false, inattentionErrors: 5, disorganizedThinkingErrors: 5 }).camICUStatus).toBe('negative')
    expect(calculateRASSCAMICU({ rass: 0, acuteChangeOrFluctuation: true, inattentionErrors: 2, disorganizedThinkingErrors: 5 }).camICUStatus).toBe('negative')
  })

  it('uses exact CAM-ICU error thresholds', () => {
    expect(calculateRASSCAMICU({ rass: 0, acuteChangeOrFluctuation: true, inattentionErrors: 2, disorganizedThinkingErrors: 1 }).feature2).toBe(false)
    expect(calculateRASSCAMICU({ rass: 0, acuteChangeOrFluctuation: true, inattentionErrors: 3, disorganizedThinkingErrors: 1 }).feature2).toBe(true)
    expect(calculateRASSCAMICU({ rass: 0, acuteChangeOrFluctuation: true, inattentionErrors: 3, disorganizedThinkingErrors: 1 }).feature4).toBe(false)
    expect(calculateRASSCAMICU({ rass: 0, acuteChangeOrFluctuation: true, inattentionErrors: 3, disorganizedThinkingErrors: 2 }).feature4).toBe(true)
  })

  it('does not classify CAM-ICU positive when only feature 1 and 2 are present at RASS 0', () => {
    expect(calculateRASSCAMICU({ rass: 0, acuteChangeOrFluctuation: true, inattentionErrors: 3, disorganizedThinkingErrors: 0 }).camICUStatus).toBe('negative')
  })

  it('rejects invalid RASS and incomplete CAM-ICU assessment', () => {
    expect(() => calculateRASSCAMICU({ rass: -6 })).toThrow()
    expect(() => calculateRASSCAMICU({ rass: 5 })).toThrow()
    expect(() => calculateRASSCAMICU({ rass: 0 })).toThrow()
    expect(() => calculateRASSCAMICU({ rass: 0, acuteChangeOrFluctuation: true, inattentionErrors: 11, disorganizedThinkingErrors: 0 })).toThrow()
    expect(() => calculateRASSCAMICU({ rass: 0, acuteChangeOrFluctuation: true, inattentionErrors: 1, disorganizedThinkingErrors: 6 })).toThrow()
  })
})
