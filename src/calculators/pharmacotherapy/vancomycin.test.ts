import { describe, expect, it } from 'vitest'
import { VANCOMYCIN_CALCULATOR_STATUS } from './vancomycin'

describe('vancomycin calculator safety gate', () => {
  it('keeps dose calculation disabled while the population and indication are unresolved', () => {
    expect(VANCOMYCIN_CALCULATOR_STATUS.calculationEnabled).toBe(false)
    expect(VANCOMYCIN_CALCULATOR_STATUS.status).toBe('blocked')
    expect(VANCOMYCIN_CALCULATOR_STATUS.reason).toContain('клинического сценария')
  })
})
