import { describe, expect, it } from 'vitest'
import { calculateGCS } from './gcs'

describe('calculateGCS', () => {
  it('calculates the maximum and minimum total scores', () => {
    expect(calculateGCS({ eye: '4', verbal: '5', motor: '6' })?.total).toBe(15)
    expect(calculateGCS({ eye: '1', verbal: '1', motor: '1' })?.total).toBe(3)
  })

  it('sums valid component scores and preserves component notation', () => {
    const result = calculateGCS({ eye: '3', verbal: '4', motor: '5' })
    expect(result?.total).toBe(12)
    expect(result?.notation).toBe('E3 V4 M5')
    expect(result?.components.map((component) => component.response)).toEqual([
      'На звук', 'Спутанная речь', 'Локализует давление',
    ])
  })

  it('uses the current standardized terms for verbal and motor responses', () => {
    const result = calculateGCS({ eye: '4', verbal: '3', motor: '4' })
    expect(result?.components.map((component) => component.response)).toEqual([
      'Спонтанно', 'Отдельные слова', 'Нормальное сгибание',
    ])
    const sounds = calculateGCS({ eye: '4', verbal: '2', motor: '6' })
    expect(sounds?.components[1].response).toBe('Звуки')
  })

  it('does not calculate a total when any of the three components is NT', () => {
    const cases = [
      { eye: 'NT', verbal: '5', motor: '6' },
      { eye: '4', verbal: 'NT', motor: '6' },
      { eye: '4', verbal: '5', motor: 'NT' },
    ]
    for (const input of cases) {
      const result = calculateGCS(input)
      expect(result?.total).toBeNull()
      expect(result?.hasUntestableComponent).toBe(true)
    }
  })

  it('does not calculate a total if any component is not testable', () => {
    const result = calculateGCS({ eye: '4', verbal: 'NT', motor: '6' })
    expect(result?.total).toBeNull()
    expect(result?.hasUntestableComponent).toBe(true)
    expect(result?.notation).toBe('E4 VNT M6')
  })

  it('returns null when a component is missing', () => {
    expect(calculateGCS({ eye: '', verbal: '5', motor: '6' })).toBeNull()
  })

  it('rejects values outside each component range', () => {
    expect(calculateGCS({ eye: '5', verbal: '5', motor: '6' })).toBeNull()
    expect(calculateGCS({ eye: '4', verbal: '6', motor: '6' })).toBeNull()
    expect(calculateGCS({ eye: '4', verbal: '5', motor: '7' })).toBeNull()
    expect(calculateGCS({ eye: '0', verbal: '5', motor: '6' })).toBeNull()
  })

  it('does not silently convert invalid strings to a score', () => {
    expect(calculateGCS({ eye: 'abc', verbal: '5', motor: '6' })).toBeNull()
  })
})
