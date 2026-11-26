import { describe, expect, it } from 'vitest'
import { calculateABCD2, type ABCD2Input } from './abcd2'
const base: ABCD2Input = { age60OrOlder: false, bloodPressure140Or90OrHigher: false, clinicalFeature: 'none', symptomDuration: 'under10', diabetes: false }
describe('calculateABCD2', () => {
  it('returns zero for all negative criteria', () => { expect(calculateABCD2(base).total).toBe(0) })
  it('scores age and blood pressure thresholds', () => {
    expect(calculateABCD2({ ...base, age60OrOlder: true }).total).toBe(1)
    expect(calculateABCD2({ ...base, bloodPressure140Or90OrHigher: true }).total).toBe(1)
  })
  it('scores clinical features mutually exclusively', () => {
    expect(calculateABCD2({ ...base, clinicalFeature: 'speech' }).total).toBe(1)
    expect(calculateABCD2({ ...base, clinicalFeature: 'weakness' }).total).toBe(2)
  })
  it('scores duration thresholds', () => {
    expect(calculateABCD2({ ...base, symptomDuration: 'under10' }).total).toBe(0)
    expect(calculateABCD2({ ...base, symptomDuration: '10to59' }).total).toBe(1)
    expect(calculateABCD2({ ...base, symptomDuration: '60plus' }).total).toBe(2)
  })
  it('scores diabetes and the maximum score of seven', () => {
    expect(calculateABCD2({ ...base, diabetes: true }).total).toBe(1)
    expect(calculateABCD2({ age60OrOlder:true, bloodPressure140Or90OrHigher:true, clinicalFeature:'weakness', symptomDuration:'60plus', diabetes:true }).total).toBe(7)
  })
  it('does not add speech points on top of weakness', () => {
    expect(calculateABCD2({ ...base, clinicalFeature: 'weakness' }).components.find(x => x.key === 'clinical')?.points).toBe(2)
  })
  it('returns conventional score bands without giving triage advice', () => {
    expect(calculateABCD2({ ...base, diabetes:true, age60OrOlder:true, bloodPressure140Or90OrHigher:true }).bandLabel).toBe('0–3 балла')
    expect(calculateABCD2({ ...base, clinicalFeature:'weakness', symptomDuration:'10to59', diabetes:true }).bandLabel).toBe('4–5 баллов')
    expect(calculateABCD2({ age60OrOlder:true, bloodPressure140Or90OrHigher:true, clinicalFeature:'weakness', symptomDuration:'60plus', diabetes:true }).bandLabel).toBe('6–7 баллов')
  })
  it('rejects missing or invalid categories', () => {
    expect(() => calculateABCD2(undefined as unknown as ABCD2Input)).toThrow()
    expect(() => calculateABCD2({ ...base, clinicalFeature:'unknown' as ABCD2Input['clinicalFeature'] })).toThrow()
    expect(() => calculateABCD2({ ...base, symptomDuration:'unknown' as ABCD2Input['symptomDuration'] })).toThrow()
  })
})
