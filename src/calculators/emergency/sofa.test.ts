import { describe, expect, it } from 'vitest'
import {
  calculateSOFA, scoreCardiovascular, scoreCoagulation, scoreLiver,
  scoreNeurologic, scoreRenal, scoreRespiratory,
} from './sofa'

describe('SOFA respiratory thresholds', () => {
  const cases: [number, boolean, number][] = [
    [400, false, 0], [399, false, 1], [300, false, 1], [299, false, 2],
    [199, false, 2], [199, true, 3], [100, true, 3], [99, true, 4], [99, false, 2],
  ]
  cases.forEach(([ratio, support, expected]) => {
    it(`ratio ${ratio}, support ${support} => ${expected}`, () => {
      expect(scoreRespiratory(ratio, support)).toBe(expected)
    })
  })
})

describe('SOFA coagulation thresholds', () => {
  const cases: [number, number][] = [[150,0],[149,1],[100,1],[99,2],[50,2],[49,3],[20,3],[19,4]]
  cases.forEach(([value, expected]) => {
    it(`platelets ${value} => ${expected}`, () => expect(scoreCoagulation(value)).toBe(expected))
  })
})

describe('SOFA liver thresholds', () => {
  const cases: [number, number][] = [[19,0],[20,1],[32,1],[33,2],[101,2],[102,3],[204,3],[205,4]]
  cases.forEach(([value, expected]) => {
    it(`bilirubin ${value} => ${expected}`, () => expect(scoreLiver(value)).toBe(expected))
  })
})

describe('SOFA cardiovascular thresholds', () => {
  const base = { map: 70, vasoactiveStatus: 'receiving' as const, dopamineDose: null, dobutamine: false, epinephrineDose: null, norepinephrineDose: null }
  it('scores MAP below 70 without vasoactive drugs as 1', () => {
    expect(scoreCardiovascular({ ...base, map: 69, vasoactiveStatus: 'none' })).toBe(1)
    expect(scoreCardiovascular({ ...base, map: 70, vasoactiveStatus: 'none' })).toBe(0)
  })
  const dopamineCases: [number, number][] = [[0.05,2],[4.9,2],[5,3],[5.1,3],[15,3],[15.1,4]]
  dopamineCases.forEach(([dose, expected]) => {
    it(`dopamine ${dose} mcg/kg/min => ${expected}`, () => {
      expect(scoreCardiovascular({ ...base, dopamineDose: dose })).toBe(expected)
    })
  })
  it('scores dobutamine at any dose as 2', () => {
    expect(scoreCardiovascular({ ...base, dobutamine: true })).toBe(2)
  })
  const adrenergicCases: [number, number][] = [[0.005,3],[0.1,3],[0.11,4]]
  adrenergicCases.forEach(([dose, expected]) => {
    it(`epinephrine and norepinephrine ${dose} => ${expected}`, () => {
      expect(scoreCardiovascular({ ...base, epinephrineDose: dose })).toBe(expected)
      expect(scoreCardiovascular({ ...base, norepinephrineDose: dose })).toBe(expected)
    })
  })
})

describe('SOFA neurologic thresholds', () => {
  const cases: [number, number][] = [[15,0],[14,1],[13,1],[12,2],[10,2],[9,3],[6,3],[5,4],[3,4]]
  cases.forEach(([value, expected]) => {
    it(`GCS ${value} => ${expected}`, () => expect(scoreNeurologic(value)).toBe(expected))
  })
})

describe('SOFA renal thresholds', () => {
  const creatinineCases: [number, number][] = [[109,0],[110,1],[170,1],[171,2],[299,2],[300,3],[440,3],[441,4]]
  creatinineCases.forEach(([value, expected]) => {
    it(`creatinine ${value} => ${expected}`, () => expect(scoreRenal(value, null)).toBe(expected))
  })
  const urineCases: [number, number][] = [[500,0],[499,3],[200,3],[199,4],[0,4]]
  urineCases.forEach(([value, expected]) => {
    it(`urine output ${value} => ${expected}`, () => expect(scoreRenal(null, value)).toBe(expected))
  })
  it('uses the highest score from creatinine and urine output', () => {
    expect(scoreRenal(110, 100)).toBe(4)
  })
  it('does not score the renal component as normal when both inputs are missing', () => {
    expect(scoreRenal(null, null)).toBeNull()
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
  it('does not report a total or zero renal points when both renal inputs are missing', () => {
    const result = calculateSOFA({ ...normal, creatinine: null, urineOutput: null })
    expect(result.components.find((component) => component.key === 'renal')?.points).toBeNull()
    expect(result.total).toBeNull()
    expect(result.hasUntestableComponent).toBe(true)
  })
  it('calculates delta only when baseline is provided', () => {
    expect(calculateSOFA(normal).delta).toBeNull()
    expect(calculateSOFA({ ...normal, platelets: 90 }, 0).delta).toBe(2)
  })
})
