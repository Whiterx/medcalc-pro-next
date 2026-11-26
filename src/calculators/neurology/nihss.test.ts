import { describe, expect, it } from 'vitest'
import { calculateNIHSS, classifyNIHSS, type NIHSSInput, type NIHSSItemKey } from './nihss'
const keys: NIHSSItemKey[] = ['loc1a','loc1b','loc1c','gaze','visual','facial','leftArm','rightArm','leftLeg','rightLeg','ataxia','sensory','language','dysarthria','neglect']
const normalInput = (): NIHSSInput => ({ loc1a:0,loc1b:0,loc1c:0,gaze:0,visual:0,facial:0,leftArm:0,rightArm:0,leftLeg:0,rightLeg:0,ataxia:0,sensory:0,language:0,dysarthria:0,neglect:0,untestableReasons:{} })

describe('calculateNIHSS', () => {
  it('returns zero for a fully assessed normal examination', () => {
    const r=calculateNIHSS(normalInput()); expect(r.total).toBe(0); expect(r.isComplete).toBe(true); expect(r.severity).toBe('none'); expect(r.scoredItems).toBe(15)
  })
  it('sums both arms and both legs independently; maximum is 42', () => {
    const i=normalInput(); const max={loc1a:3,loc1b:2,loc1c:2,gaze:2,visual:3,facial:3,leftArm:4,rightArm:4,leftLeg:4,rightLeg:4,ataxia:2,sensory:2,language:3,dysarthria:2,neglect:2}
    for(const k of keys) i[k]=max[k]; const r=calculateNIHSS(i); expect(r.total).toBe(42); expect(r.severity).toBe('severe')
  })
  it('excludes UN items from arithmetic total and marks result incomplete', () => {
    const i=normalInput(); i.leftArm='UN'; i.untestableReasons.leftArm='Ампутация в плечевом суставе'; i.rightArm=2
    const r=calculateNIHSS(i); expect(r.total).toBe(2); expect(r.isComplete).toBe(false); expect(r.untestableItems).toEqual(['leftArm']); expect(r.severity).toBe('incomplete'); expect(r.scoredItems).toBe(14)
  })
  it('requires a reason for every UN value', () => {
    const i=normalInput(); i.dysarthria='UN'; expect(()=>calculateNIHSS(i)).toThrow('укажите причину'); i.untestableReasons.dysarthria='Интубация'; expect(calculateNIHSS(i).untestableItems).toEqual(['dysarthria'])
  })
  it('allows UN only for specified limb, ataxia and dysarthria items', () => {
    const i=normalInput(); i.neglect='UN'; i.untestableReasons.neglect='Невозможно оценить'; expect(()=>calculateNIHSS(i)).toThrow('не предусмотрен')
  })
  it('requires every assessment item', () => { const i=normalInput(); i.visual=''; expect(()=>calculateNIHSS(i)).toThrow('каждого пункта') })
  it('classifies conventional severity boundaries exactly', () => {
    expect(classifyNIHSS(0).severity).toBe('none'); expect(classifyNIHSS(1).severity).toBe('minor'); expect(classifyNIHSS(4).severity).toBe('minor'); expect(classifyNIHSS(5).severity).toBe('moderate'); expect(classifyNIHSS(15).severity).toBe('moderate'); expect(classifyNIHSS(16).severity).toBe('moderate-severe'); expect(classifyNIHSS(20).severity).toBe('moderate-severe'); expect(classifyNIHSS(21).severity).toBe('severe'); expect(classifyNIHSS(42).severity).toBe('severe'); expect(()=>classifyNIHSS(43)).toThrow()
  })
})
