import { describe, expect, it } from 'vitest'
import { calculateGlasgowBlatchford, type GlasgowBlatchfordInput } from './glasgowBlatchford'

const base: GlasgowBlatchfordInput = {
  ureaMmolL: 5, hemoglobinGL: 140, hemoglobinSex: 'male', systolicBP: 120, pulseBpm: 80,
  melena: false, syncope: false, hepaticDisease: false, heartFailure: false,
}

describe('calculateGlasgowBlatchford', () => {
  it('returns zero for normal admission markers and no clinical features', () => {
    const result = calculateGlasgowBlatchford(base)
    expect(result.score).toBe(0)
    expect(result.lowRisk).toBe(true)
    expect(result.components).toHaveLength(8)
  })

  it.each([
    [6.49, 0], [6.5, 2], [7.99, 2], [8, 3], [9.99, 3], [10, 4], [24.99, 4], [25, 6],
  ])('scores urea %s mmol/L as %s points', (urea, points) => {
    expect(calculateGlasgowBlatchford({ ...base, ureaMmolL: urea }).components[0].points).toBe(points)
  })

  it.each([
    [130, 0], [129, 1], [120, 1], [119, 3], [100, 3], [99, 6],
  ])('scores male hemoglobin %s g/L as %s points', (hemoglobin, points) => {
    expect(calculateGlasgowBlatchford({ ...base, hemoglobinGL: hemoglobin }).components[1].points).toBe(points)
  })

  it.each([
    [120, 0], [119, 1], [100, 1], [99, 6],
  ])('scores female hemoglobin %s g/L as %s points', (hemoglobin, points) => {
    expect(calculateGlasgowBlatchford({ ...base, hemoglobinSex: 'female', hemoglobinGL: hemoglobin }).components[1].points).toBe(points)
  })

  it.each([
    [110, 0], [109, 1], [100, 1], [99, 2], [90, 2], [89, 3],
  ])('scores systolic BP %s mmHg as %s points', (bp, points) => {
    expect(calculateGlasgowBlatchford({ ...base, systolicBP: bp }).components[2].points).toBe(points)
  })

  it('scores pulse at the exact threshold of 100 bpm', () => {
    expect(calculateGlasgowBlatchford({ ...base, pulseBpm: 99 }).components[3].points).toBe(0)
    expect(calculateGlasgowBlatchford({ ...base, pulseBpm: 100 }).components[3].points).toBe(1)
  })

  it('adds all clinical markers with their original weights', () => {
    const result = calculateGlasgowBlatchford({
      ...base, ureaMmolL: 25, hemoglobinGL: 50, systolicBP: 60, pulseBpm: 100,
      melena: true, syncope: true, hepaticDisease: true, heartFailure: true,
    })
    expect(result.score).toBe(23)
    expect(result.lowRisk).toBe(false)
  })

  it('uses the recommended very-low-risk threshold of 0–1', () => {
    expect(calculateGlasgowBlatchford({ ...base, pulseBpm: 100 }).lowRisk).toBe(true)
    expect(calculateGlasgowBlatchford({ ...base, melena: true, syncope: true }).lowRisk).toBe(false)
  })

  it('rejects invalid numeric values and missing sex', () => {
    expect(() => calculateGlasgowBlatchford({ ...base, ureaMmolL: 0 })).toThrow()
    expect(() => calculateGlasgowBlatchford({ ...base, hemoglobinGL: Number.NaN })).toThrow()
    expect(() => calculateGlasgowBlatchford({ ...base, hemoglobinSex: '' as 'male' })).toThrow()
    expect(() => calculateGlasgowBlatchford({ ...base, systolicBP: 89.5 })).toThrow()
    expect(() => calculateGlasgowBlatchford({ ...base, pulseBpm: 19 })).toThrow()
  })
})
