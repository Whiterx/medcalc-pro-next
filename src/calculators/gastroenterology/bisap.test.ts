import { describe, expect, it } from 'vitest'
import { calculateBISAP, type BISAPInput } from './bisap'

const base: BISAPInput = {
  bunAbove25: false,
  impairedMentalStatus: false,
  sirs: false,
  ageAbove60: false,
  pleuralEffusion: false,
  first24HoursConfirmed: true,
}

describe('calculateBISAP', () => {
  it('returns zero when all five assessed criteria are absent', () => {
    const result = calculateBISAP(base)
    expect(result.score).toBe(0)
    expect(result.maxScore).toBe(5)
    expect(result.criteria).toHaveLength(5)
  })

  it('assigns one point to each criterion independently', () => {
    const keys = ['bunAbove25', 'impairedMentalStatus', 'sirs', 'ageAbove60', 'pleuralEffusion'] as const
    for (const key of keys) {
      expect(calculateBISAP({ ...base, [key]: true }).score).toBe(1)
    }
  })

  it('sums all five criteria to a maximum of five', () => {
    expect(calculateBISAP({
      bunAbove25: true,
      impairedMentalStatus: true,
      sirs: true,
      ageAbove60: true,
      pleuralEffusion: true,
      first24HoursConfirmed: true,
    }).score).toBe(5)
  })

  it('uses the commonly cited ≥3 increased-risk flag without claiming a diagnosis', () => {
    const result = calculateBISAP({ ...base, bunAbove25: true, impairedMentalStatus: true, sirs: true })
    expect(result.score).toBe(3)
    expect(result.riskStatement).toContain('повышенного риска')
    expect(result.riskStatement).toContain('Чувствительность')
  })

  it('does not treat a score below 3 as excluding severe pancreatitis', () => {
    expect(calculateBISAP(base).riskStatement).toContain('не исключает тяжёлое течение')
  })

  it('rejects missing or non-boolean components rather than silently scoring them as zero', () => {
    expect(() => calculateBISAP({ ...base, sirs: undefined })).toThrow()
    expect(() => calculateBISAP({ ...base, bunAbove25: '' })).toThrow()
  })

  it('requires confirmation of the first-24-hour assessment window', () => {
    expect(() => calculateBISAP({ ...base, first24HoursConfirmed: false })).toThrow()
    expect(() => calculateBISAP({ ...base, first24HoursConfirmed: undefined })).toThrow()
  })

  it('rejects missing input', () => {
    expect(() => calculateBISAP(undefined as never)).toThrow()
  })
})
