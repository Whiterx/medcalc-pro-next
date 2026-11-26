import { describe, expect, it } from 'vitest'
import { calculatePadua, type PaduaInput } from './padua'

const none: PaduaInput = {
  activeCancer: false, previousVTE: false, reducedMobility: false, knownThrombophilia: false,
  recentTraumaOrSurgery: false, age70OrOlder: false, heartOrRespiratoryFailure: false,
  acuteMIOrIschemicStroke: false, acuteInfectionOrRheumatologicDisease: false,
  obesityBMI30OrMore: false, ongoingHormonalTreatment: false,
}

describe('calculatePadua', () => {
  it('returns zero and low risk when all assessed factors are absent', () => {
    const result = calculatePadua(none)
    expect(result.score).toBe(0)
    expect(result.highRisk).toBe(false)
    expect(result.criteria).toHaveLength(11)
  })

  it('assigns three points to each major risk factor', () => {
    const keys: (keyof PaduaInput)[] = ['activeCancer', 'previousVTE', 'reducedMobility', 'knownThrombophilia']
    for (const key of keys) expect(calculatePadua({ ...none, [key]: true }).score).toBe(3)
  })

  it('assigns two points to recent trauma or surgery', () => {
    expect(calculatePadua({ ...none, recentTraumaOrSurgery: true }).score).toBe(2)
  })

  it('assigns one point to each minor risk factor', () => {
    const keys: (keyof PaduaInput)[] = [
      'age70OrOlder', 'heartOrRespiratoryFailure', 'acuteMIOrIschemicStroke',
      'acuteInfectionOrRheumatologicDisease', 'obesityBMI30OrMore', 'ongoingHormonalTreatment',
    ]
    for (const key of keys) expect(calculatePadua({ ...none, [key]: true }).score).toBe(1)
  })

  it('classifies a score of 3 as low risk and 4 as high risk', () => {
    expect(calculatePadua({ ...none, activeCancer: true }).highRisk).toBe(false)
    expect(calculatePadua({ ...none, activeCancer: true, age70OrOlder: true }).highRisk).toBe(true)
  })

  it('reaches the maximum score of 20', () => {
    const result = calculatePadua({
      activeCancer: true, previousVTE: true, reducedMobility: true, knownThrombophilia: true,
      recentTraumaOrSurgery: true, age70OrOlder: true, heartOrRespiratoryFailure: true,
      acuteMIOrIschemicStroke: true, acuteInfectionOrRheumatologicDisease: true,
      obesityBMI30OrMore: true, ongoingHormonalTreatment: true,
    })
    expect(result.score).toBe(20)
    expect(result.highRisk).toBe(true)
  })

  it('rejects missing or non-boolean criteria', () => {
    expect(() => calculatePadua({ ...none, previousVTE: undefined as unknown as boolean })).toThrow()
    expect(() => calculatePadua({ ...none, activeCancer: 1 as unknown as boolean })).toThrow()
  })
})
