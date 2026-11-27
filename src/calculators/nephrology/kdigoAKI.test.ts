import { describe, expect, it } from 'vitest'
import { calculateKDIGOAKI, type KDIGOAKIInput } from './kdigoAKI'

const noData: KDIGOAKIInput = { renalReplacementTherapyStarted: false }

describe('calculateKDIGOAKI', () => {
  it('requires at least one complete criterion', () => {
    expect(() => calculateKDIGOAKI(noData)).toThrow()
  })

  it('does not classify stable creatinine as AKI', () => {
    const result = calculateKDIGOAKI({ ...noData, creatinineBaseline: 100, creatinineCurrent: 100, creatinineIntervalHours: 24 })
    expect(result.creatinineStage).toBe(0)
    expect(result.overallStage).toBe(0)
  })

  it('stages a creatinine rise of at least 26.5 µmol/L within 48 hours as stage 1', () => {
    const result = calculateKDIGOAKI({ ...noData, creatinineBaseline: 100, creatinineCurrent: 126.5, creatinineIntervalHours: 48 })
    expect(result.creatinineStage).toBe(1)
  })

  it('does not apply the 0.3 mg/dL rise criterion after 48 hours', () => {
    const result = calculateKDIGOAKI({ ...noData, creatinineBaseline: 1, creatinineCurrent: 1.3, creatinineUnit: 'mg/dL', creatinineIntervalHours: 49 })
    expect(result.creatinineStage).toBe(0)
  })

  it('stages 1.5, 2 and 3 times baseline at the exact boundaries', () => {
    expect(calculateKDIGOAKI({ ...noData, creatinineBaseline: 100, creatinineCurrent: 150, creatinineIntervalHours: 168 }).creatinineStage).toBe(1)
    expect(calculateKDIGOAKI({ ...noData, creatinineBaseline: 100, creatinineCurrent: 200, creatinineIntervalHours: 168 }).creatinineStage).toBe(2)
    expect(calculateKDIGOAKI({ ...noData, creatinineBaseline: 100, creatinineCurrent: 300, creatinineIntervalHours: 168 }).creatinineStage).toBe(3)
  })

  it('applies the 4 mg/dL stage-3 threshold only after an AKI creatinine definition is met', () => {
    expect(calculateKDIGOAKI({ ...noData, creatinineBaseline: 3.7, creatinineCurrent: 4, creatinineUnit: 'mg/dL', creatinineIntervalHours: 48 }).creatinineStage).toBe(3)
    expect(calculateKDIGOAKI({ ...noData, creatinineBaseline: 3.99, creatinineCurrent: 4, creatinineUnit: 'mg/dL', creatinineIntervalHours: 24 }).creatinineStage).toBe(0)
    expect(calculateKDIGOAKI({ ...noData, creatinineBaseline: 4, creatinineCurrent: 4.3, creatinineUnit: 'mg/dL', creatinineIntervalHours: 24 }).creatinineStage).toBe(3)
  })

  it('uses the highest stage when multiple criteria are present', () => {
    const result = calculateKDIGOAKI({
      ...noData, creatinineBaseline: 100, creatinineCurrent: 150, creatinineIntervalHours: 24,
      idealBodyWeightKg: 70, urineVolumeMl: 600, urineIntervalHours: 24,
    })
    expect(result.creatinineStage).toBe(1)
    expect(result.urineOutputStage).toBe(2)
    expect(result.overallStage).toBe(2)
  })

  it('stages urine output <0.5 mL/kg/h for 6 to <12 hours as stage 1', () => {
    const result = calculateKDIGOAKI({ ...noData, idealBodyWeightKg: 70, urineVolumeMl: 200, urineIntervalHours: 6 })
    expect(result.urineOutputRate).toBeCloseTo(0.476, 3)
    expect(result.urineOutputStage).toBe(1)
  })

  it('stages urine output <0.5 mL/kg/h for at least 12 hours as stage 2', () => {
    const result = calculateKDIGOAKI({ ...noData, idealBodyWeightKg: 70, urineVolumeMl: 400, urineIntervalHours: 12 })
    expect(result.urineOutputRate).toBeCloseTo(0.476, 3)
    expect(result.urineOutputStage).toBe(2)
  })

  it('stages urine output <0.3 mL/kg/h for at least 24 hours as stage 3', () => {
    const result = calculateKDIGOAKI({ ...noData, idealBodyWeightKg: 70, urineVolumeMl: 400, urineIntervalHours: 24 })
    expect(result.urineOutputRate).toBeCloseTo(0.238, 3)
    expect(result.urineOutputStage).toBe(3)
  })

  it('does not cross strict urine-output thresholds at exactly 0.5 or 0.3 mL/kg/h', () => {
    const exactHalf = calculateKDIGOAKI({ ...noData, idealBodyWeightKg: 70, urineVolumeMl: 210, urineIntervalHours: 6 })
    expect(exactHalf.urineOutputStage).toBe(0)
    const exactPointThree = calculateKDIGOAKI({ ...noData, idealBodyWeightKg: 70, urineVolumeMl: 504, urineIntervalHours: 24 })
    expect(exactPointThree.urineOutputRate).toBeCloseTo(0.3, 10)
    expect(exactPointThree.urineOutputStage).toBe(2)
  })

  it('stages anuria for at least 12 hours as stage 3', () => {
    const result = calculateKDIGOAKI({ ...noData, idealBodyWeightKg: 70, urineVolumeMl: 0, urineIntervalHours: 12 })
    expect(result.urineOutputStage).toBe(3)
  })

  it('stages initiation of renal replacement therapy as stage 3', () => {
    const result = calculateKDIGOAKI({ renalReplacementTherapyStarted: true })
    expect(result.overallStage).toBe(3)
  })

  it('rejects partial input sections and values outside technical input bounds', () => {
    expect(() => calculateKDIGOAKI({ ...noData, creatinineBaseline: 100 })).toThrow()
    expect(() => calculateKDIGOAKI({ ...noData, idealBodyWeightKg: 70, urineVolumeMl: 200 })).toThrow()
    expect(() => calculateKDIGOAKI({ ...noData, creatinineBaseline: 0, creatinineCurrent: 100, creatinineIntervalHours: 24 })).toThrow()
    expect(() => calculateKDIGOAKI({ ...noData, creatinineBaseline: 0.009, creatinineCurrent: 0.02, creatinineIntervalHours: 24 })).toThrow()
    expect(() => calculateKDIGOAKI({ ...noData, idealBodyWeightKg: 0.4, urineVolumeMl: 0, urineIntervalHours: 6 })).toThrow()
    expect(() => calculateKDIGOAKI({ ...noData, idealBodyWeightKg: 70, urineVolumeMl: -1, urineIntervalHours: 12 })).toThrow()
    expect(() => calculateKDIGOAKI({ ...noData, creatinineBaseline: 100, creatinineCurrent: 200, creatinineIntervalHours: 169 })).toThrow()
  })
})
