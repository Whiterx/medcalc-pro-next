import { describe, expect, it } from 'vitest'
import {
  calculateSOFA, scoreCardiovascular, scoreCoagulation, scoreLiver,
  scoreNeurologic, scoreRenal, scoreRespiratory,
} from './sofa'

describe('SOFA respiratory thresholds', () => {
  it.each([
    [400, false, 0], [399, false, 1], [300, false, 1], [299, false, 2],
    [199, false, 2], [199, true, 3], [100, true, 3], [99, true, 4], [99, false, 2],
  ])('ratio %i, support %s => %i', (ratio, support, expected) => {
    expect(scoreRespiratory(ratio, support)).toBe(expected)
  })
})

describe('SOFA coagulation thresholds', () => {
  it.each([[150,0],[149,1],[100,1],[99,2],[50,2],[49,3],[20,3],[19,4]])(
    'platelets %i => %i', (value, expected) => expect(scoreCoagulation(value)).toBe(expected))
})

describe('SOFA liver thresholds', () => {
  it.each([[19,0],[20,1],[32,1],[33,2],[101,2],[102,3],[204,3],[205,4]])(
    'bilirubin %i => %i', (value, expected) => expect(scoreLiver(value)).toBe(expected))
})

describe('SOFA cardiovascular thresholds', () => {
  const base = { map: 70, vasoactiveStatus: 'receiving' as const, dopamineDose: null, dobutamine: false, epinephrineDose: null, norepinephrineDose: null }
  it('scores MAP below 70 without vasoactive drugs as 1', () => {
    expect(scoreCardiovascular({ ...base, map: 69, vasoactiveStatus: 'none' })).toBe(1)
    expect(scoreCardiovascular({ ...base, map: 70, vasoactiveStatus: 'none' })).toBe(0)
  })
  it.each([[5,2],[5.1,3],[15,3],[15.1,4]])(
    'dopamine %s mcg/kg/min => %i', (dose, expected) =>
      expect(scoreCardiovascular({ ...base, dopamineDose: dose })).toBe(expected))
  it('scores dobutamine at any dose as 2', () => {
    expect(scoreCardiovascular({ ...base, dobutamine: true })).toBe(2)
  })
  it.each([[0.1,3],[0.11,4]])('epinephrine %s => %i', (dose, expected) => {
    expect(scoreCardiovascular({ ...base, epinephrineDose: dose })).toBe(expected)
    expect(scoreCardiovascular({ ...base, norepinephrineDose: dose })).toBe(expected)
  })
})

describe('SOFA neurologic thresholds', () => {
  it.each([[15,0],[14,1],[13,1],[12,2],[10,2],[9,3],[6,3],[5,4],[3,4]])(
    'GCS %i => %i', (value, expected) => expect(scoreNeurologic(value)).toBe(expected))
})

describe('SOFA renal thresholds', () => {
  it.each([[109,0],[110,1],[170,1],[171,2],[299,2],[300,3],[440,3],[441,4]])(
    'creatinine %i => %i', (value, expected) => expect(scoreRenal(value, null)).toBe(expected))
  it.each([[500,0],[499,3],[200,3],[199,4],[0,4]])(
    'urine output %i => %i', (value, expected) => expect(scoreRenal(null, value)).toBe(expected))
  it('uses the highest score from creatinine and urine output', () => {
    expect(scoreRenal(110, 100)).toBe(4)
  })
})

describe('calculateSOFA', () => {
  const normal = {
    pao2: 100, fio2: 25, respiratorySupport: false, platelets: 200, bilirubin: 10,
    map: 75, vasoactiveStatus: 'none' as const, dopamineDose: null, dobutamine: false,
    epinephrineDose: null, norepinephrineDose: null, gcs: 15, creatinine: 80, urineOutput: 1000,
  }
  it('returns zero for normal organ parameters', () => {
    expect(calculateSOFA(normal).total).toBe(0)
  })
  it('sums six organ subscores to a maximum of 24', () => {
    const severe = { ...normal, pao2: 50, fio2: 100, respiratorySupport: true, platelets: 10,
      bilirubin: 300, map: 60, vasoactiveStatus: 'receiving' as const, norepinephrineDose: 0.2,
      gcs: 3, creatinine: 500, urineOutput: 100 }
    expect(calculateSOFA(severe).total).toBe(24)
  })
  it('does not report a total when GCS is not testable', () => {
    const result = calculateSOFA({ ...normal, gcs: null })
    expect(result.total).toBeNull()
    expect(result.hasUntestableComponent).toBe(true)
  })
  it('calculates delta only when baseline is provided', () => {
    expect(calculateSOFA(normal).delta).toBeNull()
    expect(calculateSOFA({ ...normal, platelets: 90 }, 0).delta).toBe(2)
  })
})
