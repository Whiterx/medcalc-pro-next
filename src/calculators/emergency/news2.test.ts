import { describe, expect, it } from 'vitest'
import { calculateNEWS2, type NEWS2Input } from './news2'

const normal: NEWS2Input = {
  respiratoryRate: 16, spo2: 98, spo2Scale: 1, supplementalOxygen: false,
  systolicBP: 120, pulse: 80, temperature: 37, consciousness: 'alert',
}

const points = (patch: Partial<NEWS2Input>, key: string) =>
  calculateNEWS2({ ...normal, ...patch }).criteria.find((item) => item.key === key)?.points

describe('NEWS2 scoring against RCP chart 1 / chart 3', () => {
  it('scores every respiratory-rate band', () => {
    for (const [value, expected] of [[8,3],[9,1],[11,1],[12,0],[20,0],[21,2],[24,2],[25,3]] as const)
      expect(points({ respiratoryRate: value }, 'respiratoryRate')).toBe(expected)
  })

  it('scores every SpO2 Scale 1 band and boundaries', () => {
    for (const [value, expected] of [[91,3],[92,2],[93,2],[94,1],[95,1],[96,0]] as const)
      expect(points({ spo2: value }, 'spo2')).toBe(expected)
  })

  it('scores every SpO2 Scale 2 band on air', () => {
    for (const [value, expected] of [[83,3],[84,2],[85,2],[86,1],[87,1],[88,0],[92,0],[93,0],[97,0]] as const)
      expect(points({ spo2Scale: 2, spo2: value, supplementalOxygen: false }, 'spo2')).toBe(expected)
  })

  it('scores every SpO2 Scale 2 band on supplemental oxygen', () => {
    for (const [value, expected] of [[83,3],[84,2],[85,2],[86,1],[87,1],[88,0],[92,0],[93,1],[94,1],[95,2],[96,2],[97,3]] as const)
      expect(points({ spo2Scale: 2, spo2: value, supplementalOxygen: true }, 'spo2')).toBe(expected)
  })

  it('adds exactly two points for supplemental oxygen', () => {
    expect(points({ supplementalOxygen: true }, 'oxygen')).toBe(2)
    expect(points({ supplementalOxygen: false }, 'oxygen')).toBe(0)
  })

  it('scores every systolic blood-pressure band', () => {
    for (const [value, expected] of [[50,3],[90,3],[91,2],[100,2],[101,1],[110,1],[111,0],[219,0],[220,3]] as const)
      expect(points({ systolicBP: value }, 'systolicBP')).toBe(expected)
  })

  it('scores every pulse band', () => {
    for (const [value, expected] of [[30,3],[40,3],[41,1],[50,1],[51,0],[90,0],[91,1],[110,1],[111,2],[130,2],[131,3]] as const)
      expect(points({ pulse: value }, 'pulse')).toBe(expected)
  })

  it('scores alert as zero and new confusion / V / P / U as three', () => {
    expect(points({ consciousness: 'alert' }, 'consciousness')).toBe(0)
    for (const consciousness of ['new-confusion','voice','pain','unresponsive'] as const)
      expect(points({ consciousness }, 'consciousness')).toBe(3)
  })

  it('scores every temperature band at tenth-degree boundaries', () => {
    for (const [value, expected] of [[35.0,3],[35.1,1],[36.0,1],[36.1,0],[38.0,0],[38.1,1],[39.0,1],[39.1,2]] as const)
      expect(points({ temperature: value }, 'temperature')).toBe(expected)
  })
})

describe('NEWS2 aggregate and response triggers', () => {
  it('returns zero and the RCP routine monitoring guidance for normal observations', () => {
    const result = calculateNEWS2(normal)
    expect(result.score).toBe(0)
    expect(result.riskLevel).toBe('routine')
    expect(result.monitoringFrequency).toContain('12 часов')
    expect(result.suggestedResponse).toContain('Продолжать рутинный мониторинг NEWS')
    expect(result.suggestedResponse).not.toContain('должна оценить пациента')
  })

  it('uses the 1–4 low aggregate band and 4–6 hourly monitoring interval', () => {
    const result = calculateNEWS2({ ...normal, temperature: 38.5 })
    expect(result.score).toBe(1)
    expect(result.riskLevel).toBe('low')
    expect(result.monitoringFrequency).toContain('4–6 часов')
  })

  it('flags a single parameter score of three and requires at least hourly monitoring even below five', () => {
    const result = calculateNEWS2({ ...normal, respiratoryRate: 8 })
    expect(result.score).toBe(3)
    expect(result.hasSingleRedScore).toBe(true)
    expect(result.monitoringFrequency).toContain('1 раза в час')
    expect(result.riskLabel).toContain('Низкий–средний риск')
    expect(result.suggestedResponse).toMatch(/информирует медицинскую команду/i)
  })

  it('uses the 5–6 urgent response band', () => {
    const result = calculateNEWS2({ ...normal, respiratoryRate: 22, supplementalOxygen: true, temperature: 38.5 })
    expect(result.score).toBe(5)
    expect(result.riskLevel).toBe('medium')
    expect(result.monitoringFrequency).toContain('1 раза в час')
    expect(result.suggestedResponse).toMatch(/60 минут/)
  })

  it('uses the 7+ emergency response band', () => {
    const result = calculateNEWS2({ ...normal, respiratoryRate: 25, systolicBP: 90, supplementalOxygen: true })
    expect(result.score).toBe(8)
    expect(result.riskLevel).toBe('high')
    expect(result.monitoringFrequency).toContain('30 минут')
    expect(result.suggestedResponse).toMatch(/экстренную оценку/i)
  })

  it('does not downgrade the aggregate response when a single red parameter is also present', () => {
    const result = calculateNEWS2({ ...normal, respiratoryRate: 25, supplementalOxygen: true })
    expect(result.score).toBe(5)
    expect(result.hasSingleRedScore).toBe(true)
    expect(result.monitoringFrequency).toContain('1 раза в час')
    expect(result.suggestedResponse).toMatch(/60 минут/)
  })
})
