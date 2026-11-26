export type MELDNaBilirubinUnit = 'mg/dL' | 'µmol/L'
export type MELDNaCreatinineUnit = 'mg/dL' | 'µmol/L'

export interface MELDNaInput {
  bilirubin: number
  bilirubinUnit: MELDNaBilirubinUnit
  creatinine: number
  creatinineUnit: MELDNaCreatinineUnit
  inr: number
  sodium: number
  recentDialysis: boolean
}

export interface MELDNaAdjustment {
  key: 'bilirubin' | 'creatinine' | 'inr' | 'sodium' | 'dialysis'
  description: string
}

export interface MELDNaResult {
  meldRaw: number
  meld: number
  meldNaRaw: number
  meldNa: number
  sodiumAdjusted: boolean
  effectiveBilirubinMgDl: number
  effectiveCreatinineMgDl: number
  effectiveINR: number
  effectiveSodium: number
  adjustments: MELDNaAdjustment[]
}

function requireFinitePositive(value: number, label: string, maximum: number): void {
  if (!Number.isFinite(value) || value <= 0 || value > maximum) {
    throw new Error(`${label}: введите число больше 0 и не выше ${maximum}.`)
  }
}

/**
 * Historical OPTN/UNOS MELD-Na (pre-MELD 3.0), for educational use.
 * The base MELD is rounded to the nearest integer before the sodium adjustment.
 */
export function calculateMELDNa(input: MELDNaInput): MELDNaResult {
  if (!input || typeof input !== 'object') throw new Error('Заполните все лабораторные показатели.')
  requireFinitePositive(input.bilirubin, 'Билирубин', input.bilirubinUnit === 'mg/dL' ? 100 : 1710)
  requireFinitePositive(input.creatinine, 'Креатинин', input.creatinineUnit === 'mg/dL' ? 30 : 2652)
  requireFinitePositive(input.inr, 'МНО (INR)', 20)
  if (input.inr < 0.5) throw new Error('МНО (INR) должно быть не менее 0,5.')
  if (!Number.isFinite(input.sodium) || input.sodium < 100 || input.sodium > 200) {
    throw new Error('Натрий должен находиться в диапазоне 100–200 ммоль/л.')
  }
  if (typeof input.recentDialysis !== 'boolean') throw new Error('Укажите статус диализа.')

  const adjustments: MELDNaAdjustment[] = []
  const bilirubinMgDl = input.bilirubinUnit === 'mg/dL' ? input.bilirubin : input.bilirubin / 17.1
  const creatinineMgDl = input.creatinineUnit === 'mg/dL' ? input.creatinine : input.creatinine / 88.4

  const effectiveBilirubinMgDl = Math.max(1, bilirubinMgDl)
  const effectiveINR = Math.max(1, input.inr)
  let effectiveCreatinineMgDl = Math.min(4, Math.max(1, creatinineMgDl))
  let effectiveSodium = Math.min(137, Math.max(125, input.sodium))

  if (bilirubinMgDl < 1) adjustments.push({ key: 'bilirubin', description: 'Билирубин ниже 1,0 мг/дл принят равным 1,0 мг/дл.' })
  if (input.inr < 1) adjustments.push({ key: 'inr', description: 'МНО ниже 1,0 принято равным 1,0.' })
  if (creatinineMgDl < 1) adjustments.push({ key: 'creatinine', description: 'Креатинин ниже 1,0 мг/дл принят равным 1,0 мг/дл.' })
  if (creatinineMgDl >= 4) adjustments.push({ key: 'creatinine', description: 'Креатинин 4,0 мг/дл или выше ограничен значением 4,0 мг/дл.' })
  if (input.recentDialysis) {
    effectiveCreatinineMgDl = 4
    adjustments.push({ key: 'dialysis', description: 'При ≥2 сеансах диализа или ≥24 ч CVVHD за последние 7 дней креатинин принят равным 4,0 мг/дл.' })
  }
  if (input.sodium < 125) adjustments.push({ key: 'sodium', description: 'Натрий ниже 125 ммоль/л принят равным 125 ммоль/л.' })
  if (input.sodium > 137) adjustments.push({ key: 'sodium', description: 'Натрий выше 137 ммоль/л принят равным 137 ммоль/л.' })

  const meldRaw = 3.78 * Math.log(effectiveBilirubinMgDl)
    + 11.2 * Math.log(effectiveINR)
    + 9.57 * Math.log(effectiveCreatinineMgDl)
    + 6.43
  const meld = Math.min(40, Math.max(6, Math.round(meldRaw)))
  const sodiumAdjusted = meld > 11
  const meldNaRaw = sodiumAdjusted
    ? meld + 1.32 * (137 - effectiveSodium) - (0.033 * meld * (137 - effectiveSodium))
    : meld
  const meldNa = Math.min(40, Math.max(6, Math.round(meldNaRaw)))

  return {
    meldRaw,
    meld,
    meldNaRaw,
    meldNa,
    sodiumAdjusted,
    effectiveBilirubinMgDl,
    effectiveCreatinineMgDl,
    effectiveINR,
    effectiveSodium,
    adjustments,
  }
}
