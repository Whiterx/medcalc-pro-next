import { describe, expect, it } from 'vitest'
import { calculateHuntHessWFNS } from './huntHessWFNS'

describe('calculateHuntHessWFNS', () => {
  it('returns Hunt–Hess grade I and WFNS I for GCS 15 without motor deficit', () => {
    const result = calculateHuntHessWFNS({ huntHessGrade: 1, gcs: 15, motorDeficit: 'absent' })
    expect(result.huntHess.grade).toBe(1)
    expect(result.wfns.grade).toBe(1)
  })
  it('distinguishes WFNS II and III for GCS 13–14 by motor deficit', () => {
    expect(calculateHuntHessWFNS({ huntHessGrade: 2, gcs: 14, motorDeficit: 'absent' }).wfns.grade).toBe(2)
    expect(calculateHuntHessWFNS({ huntHessGrade: 2, gcs: 13, motorDeficit: 'present' }).wfns.grade).toBe(3)
  })
  it('assigns WFNS IV for GCS 7–12 regardless of motor deficit', () => {
    expect(calculateHuntHessWFNS({ huntHessGrade: 4, gcs: 12, motorDeficit: 'absent' }).wfns.grade).toBe(4)
    expect(calculateHuntHessWFNS({ huntHessGrade: 4, gcs: 7, motorDeficit: 'present' }).wfns.grade).toBe(4)
  })
  it('assigns WFNS V for GCS 3–6 regardless of motor deficit', () => {
    expect(calculateHuntHessWFNS({ huntHessGrade: 5, gcs: 6, motorDeficit: 'absent' }).wfns.grade).toBe(5)
    expect(calculateHuntHessWFNS({ huntHessGrade: 5, gcs: 3, motorDeficit: 'present' }).wfns.grade).toBe(5)
  })
  it('does not silently classify GCS 15 with a major motor deficit', () => {
    const result = calculateHuntHessWFNS({ huntHessGrade: 1, gcs: 15, motorDeficit: 'present' })
    expect(result.wfns.classifiable).toBe(false)
    expect(result.wfns.grade).toBeNull()
  })
  it('validates Hunt–Hess and GCS boundaries', () => {
    expect(() => calculateHuntHessWFNS({ huntHessGrade: 0, gcs: 15, motorDeficit: 'absent' })).toThrow()
    expect(() => calculateHuntHessWFNS({ huntHessGrade: 6, gcs: 15, motorDeficit: 'absent' })).toThrow()
    expect(() => calculateHuntHessWFNS({ huntHessGrade: 1, gcs: 2, motorDeficit: 'absent' })).toThrow()
    expect(() => calculateHuntHessWFNS({ huntHessGrade: 1, gcs: 16, motorDeficit: 'absent' })).toThrow()
    expect(() => calculateHuntHessWFNS({ huntHessGrade: 1, gcs: 15, motorDeficit: '' })).toThrow()
  })
  it('rejects missing input', () => { expect(() => calculateHuntHessWFNS(undefined as never)).toThrow() })
})
