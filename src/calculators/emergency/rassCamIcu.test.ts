import { describe, expect, it } from 'vitest'
import { calculateRASSCAMICU, RASS_LABELS } from './rassCamIcu'
describe('RASS scale', () => {
  it('contains all ten RASS levels from +4 to -5', () => {
    expect(Object.keys(RASS_LABELS)).toHaveLength(10)
    expect(calculateRASSCAMICU({ rass: 4 }).rass).toBe(4)
    expect(calculateRASSCAMICU({ rass: -5 }).rass).toBe(-5)
  })
  it.each([-5, -4])('marks CAM-ICU as unable to assess at RASS %s', (rass) => {
    const result = calculateRASSCAMICU({ rass })
    expect(result.camICUStatus).toBe('unable-to-assess')
    expect(result.feature1).toBeNull()
    expect(result.feature2).toBeNull()
    expect(result.feature3).toBeNull()
    expect(result.feature4).toBeNull()
  })
  it('rejects RASS values outside the scale', () => {
    expect(() => calculateRASSCAMICU({ rass: -6 })).toThrow()
    expect(() => calculateRASSCAMICU({ rass: 5 })).toThrow()
  })
})
describe('sequential CAM-ICU algorithm', () => {
  it('stops negative when Feature 1 is absent; later features are unassessed', () => {
    const r = calculateRASSCAMICU({ rass: -1, acuteChangeOrFluctuation: false })
    expect(r.camICUStatus).toBe('negative')
    expect(r.feature1).toBe(false)
    expect(r.feature2).toBeNull()
    expect(r.feature3).toBeNull()
    expect(r.feature4).toBeNull()
    expect(r.inattentionErrors).toBeNull()
  })
  it('stops negative when Feature 2 has 0–2 errors', () => {
    for (const errors of [0, 1, 2]) {
      const r = calculateRASSCAMICU({ rass: -1, acuteChangeOrFluctuation: true, inattentionErrors: errors })
      expect(r.camICUStatus).toBe('negative')
      expect(r.feature2).toBe(false)
      expect(r.feature3).toBeNull()
      expect(r.feature4).toBeNull()
      expect(r.disorganizedThinkingErrors).toBeNull()
    }
  })
  it('is positive at RASS other than zero when Features 1 and 2 are present, without Feature 4', () => {
    const r = calculateRASSCAMICU({ rass: -1, acuteChangeOrFluctuation: true, inattentionErrors: 3 })
    expect(r.camICUStatus).toBe('positive')
    expect(r.feature1).toBe(true)
    expect(r.feature2).toBe(true)
    expect(r.feature3).toBe(true)
    expect(r.feature4).toBeNull()
    expect(r.disorganizedThinkingErrors).toBeNull()
  })
  it('requires Feature 4 only when RASS is zero and Features 1 and 2 are present', () => {
    expect(() => calculateRASSCAMICU({ rass: 0, acuteChangeOrFluctuation: true, inattentionErrors: 3 })).toThrow()
    const negative = calculateRASSCAMICU({ rass: 0, acuteChangeOrFluctuation: true, inattentionErrors: 3, disorganizedThinkingErrors: 1 })
    expect(negative.camICUStatus).toBe('negative')
    expect(negative.feature3).toBe(false)
    expect(negative.feature4).toBe(false)
    const positive = calculateRASSCAMICU({ rass: 0, acuteChangeOrFluctuation: true, inattentionErrors: 3, disorganizedThinkingErrors: 2 })
    expect(positive.camICUStatus).toBe('positive')
    expect(positive.feature4).toBe(true)
  })
  it('uses strict thresholds and validates integer ranges', () => {
    expect(calculateRASSCAMICU({ rass: 0, acuteChangeOrFluctuation: true, inattentionErrors: 2, disorganizedThinkingErrors: 2 }).camICUStatus).toBe('negative')
    expect(calculateRASSCAMICU({ rass: 0, acuteChangeOrFluctuation: true, inattentionErrors: 3, disorganizedThinkingErrors: 1 }).camICUStatus).toBe('negative')
    expect(() => calculateRASSCAMICU({ rass: 0, acuteChangeOrFluctuation: true, inattentionErrors: 11 })).toThrow()
    expect(() => calculateRASSCAMICU({ rass: 0, acuteChangeOrFluctuation: true, inattentionErrors: 3, disorganizedThinkingErrors: 6 })).toThrow()
    expect(() => calculateRASSCAMICU({ rass: 0, acuteChangeOrFluctuation: true, inattentionErrors: 1.5 })).toThrow()
  })
  it('rejects missing required data only for the reached step', () => {
    expect(() => calculateRASSCAMICU({ rass: -1 })).toThrow()
    expect(() => calculateRASSCAMICU({ rass: -1, acuteChangeOrFluctuation: true })).toThrow()
    expect(calculateRASSCAMICU({ rass: -1, acuteChangeOrFluctuation: false }).camICUStatus).toBe('negative')
    expect(calculateRASSCAMICU({ rass: -1, acuteChangeOrFluctuation: true, inattentionErrors: 0 }).camICUStatus).toBe('negative')
  })
})