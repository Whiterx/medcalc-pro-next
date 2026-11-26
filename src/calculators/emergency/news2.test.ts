import { describe, expect, it } from 'vitest'
import { calculateNEWS2, type NEWS2Input } from './news2'

const normal: NEWS2Input = {
  respiratoryRate: 16,
  spo2: 98,
  spo2Scale: 1,
  supplementalOxygen: false,
  systolicBP: 120,
  pulse: 80,
  temperature: 37,
  consciousness: 'alert',
}

describe('calculateNEWS2', () => {
  it('returns zero for normal observations on air', () => {
    expect(calculateNEWS2(normal).score).toBe(0)
  })

  it('scores respiratory rate boundary values', () => {
    expect(calculateNEWS2({ ...normal, respiratoryRate: 8 }).criteria[0].points).toBe(3)
    expect(calculateNEWS2({ ...normal, respiratoryRate: 9 }).criteria[0].points).toBe(1)
    expect(calculateNEWS2({ ...normal, respiratoryRate: 21 }).criteria[0].points).toBe(2)
    expect(calculateNEWS2({ ...normal, respiratoryRate: 25 }).criteria[0].points).toBe(3)
  })

  it('adds two points for supplemental oxygen in addition to SpO2 score', () => {
    const result = calculateNEWS2({ ...normal, supplementalOxygen: true })
    expect(result.criteria.find((item) => item.key === 'oxygen')?.points).toBe(2)
    expect(result.score).toBe(2)
  })

  it('scores SpO2 scale 2 according to oxygen status', () => {
    expect(calculateNEWS2({ ...normal, spo2Scale: 2, spo2: 94, supplementalOxygen: false }).criteria[1].points).toBe(0)
    expect(calculateNEWS2({ ...normal, spo2Scale: 2, spo2: 94, supplementalOxygen: true }).criteria[1].points).toBe(1)
    expect(calculateNEWS2({ ...normal, spo2Scale: 2, spo2: 97, supplementalOxygen: true }).criteria[1].points).toBe(3)
  })

  it('scores new confusion or any V/P/U response as three points', () => {
    for (const consciousness of ['new-confusion', 'voice', 'pain', 'unresponsive'] as const) {
      expect(calculateNEWS2({ ...normal, consciousness }).criteria.find((item) => item.key === 'consciousness')?.points).toBe(3)
    }
  })

  it('flags a single parameter score of three even when total is below five', () => {
    const result = calculateNEWS2({ ...normal, respiratoryRate: 8 })
    expect(result.score).toBe(3)
    expect(result.hasSingleRedScore).toBe(true)
    expect(result.suggestedResponse).toMatch(/Срочная оценка/)
  })

  it('uses the 5–6 and 7+ escalation bands', () => {
    expect(calculateNEWS2({ ...normal, respiratoryRate: 22, supplementalOxygen: true }).riskLevel).toBe('medium')
    expect(calculateNEWS2({ ...normal, respiratoryRate: 25, supplementalOxygen: true, systolicBP: 90 }).riskLevel).toBe('high')
  })
})
