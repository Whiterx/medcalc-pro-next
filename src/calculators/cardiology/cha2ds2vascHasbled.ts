export interface AFCombinedInput {
  ageYears: number
  heartFailure: boolean
  hypertension: boolean
  diabetes: boolean
  priorStrokeTIAOrEmbolism: boolean
  vascularDisease: boolean
  femaleSex: boolean
  uncontrolledSystolicBPOver160: boolean
  abnormalRenalFunction: boolean
  abnormalLiverFunction: boolean
  priorStrokeForBleedingScore: boolean
  bleedingHistoryOrPredisposition: boolean
  labileINR: boolean
  bleedingRiskDrugs: boolean
  excessiveAlcohol: boolean
  assessmentConfirmed: boolean
}

export interface ScoreComponent {
  key: string
  label: string
  value: string
  points: number
}

export interface AFCombinedResult {
  cha2ds2VascScore: number
  cha2ds2VascCategory: 'low' | 'consider' | 'recommended'
  cha2ds2VascGuidance: string
  hasBledScore: number
  hasBledHighRisk: boolean
  chaComponents: ScoreComponent[]
  hasBledComponents: ScoreComponent[]
}

export function calculateAFCombined(input: AFCombinedInput): AFCombinedResult {
  if (!input.assessmentConfirmed) {
    throw new Error('Подтвердите, что все факторы обеих шкал оценены; неотмеченные признаки действительно отсутствуют.')
  }
  if (!Number.isInteger(input.ageYears) || input.ageYears < 18 || input.ageYears > 120) {
    throw new Error('Возраст должен быть целым числом от 18 до 120 лет.')
  }

  const ageChaPoints = input.ageYears >= 75 ? 2 : input.ageYears >= 65 ? 1 : 0
  const ageHasBledPoints = input.ageYears > 65 ? 1 : 0
  const chaComponents: ScoreComponent[] = [
    { key: 'heartFailure', label: 'C — Сердечная недостаточность / дисфункция ЛЖ', value: input.heartFailure ? 'Да' : 'Нет', points: input.heartFailure ? 1 : 0 },
    { key: 'hypertension', label: 'H — Артериальная гипертензия', value: input.hypertension ? 'Да' : 'Нет', points: input.hypertension ? 1 : 0 },
    { key: 'age', label: 'A₂ — Возраст', value: `${input.ageYears} лет`, points: ageChaPoints },
    { key: 'diabetes', label: 'D — Сахарный диабет', value: input.diabetes ? 'Да' : 'Нет', points: input.diabetes ? 1 : 0 },
    { key: 'stroke', label: 'S₂ — Инсульт / ТИА / системная эмболия в анамнезе', value: input.priorStrokeTIAOrEmbolism ? 'Да' : 'Нет', points: input.priorStrokeTIAOrEmbolism ? 2 : 0 },
    { key: 'vascular', label: 'V — Сосудистое заболевание', value: input.vascularDisease ? 'Да' : 'Нет', points: input.vascularDisease ? 1 : 0 },
    { key: 'sex', label: 'Sc — Женский пол (модификатор риска)', value: input.femaleSex ? 'Да' : 'Нет', points: input.femaleSex ? 1 : 0 },
  ]
  const cha2ds2VascScore = chaComponents.reduce((sum, component) => sum + component.points, 0)
  const considerThreshold = input.femaleSex ? 2 : 1
  const recommendThreshold = input.femaleSex ? 3 : 2
  const cha2ds2VascCategory = cha2ds2VascScore >= recommendThreshold
    ? 'recommended'
    : cha2ds2VascScore >= considerThreshold ? 'consider' : 'low'
  const cha2ds2VascGuidance = cha2ds2VascCategory === 'low'
    ? `CHA₂DS₂-VASc = ${cha2ds2VascScore}: низкий риск по порогам КР РФ 2025; антикоагуляция только на основании этого балла обычно не показана. Продолжайте периодическую переоценку риска и учитывайте особые состояния.`
    : cha2ds2VascCategory === 'consider'
      ? `CHA₂DS₂-VASc = ${cha2ds2VascScore}: промежуточная категория риска по КР РФ 2025 (${input.femaleSex ? 'женщина, 2 балла' : 'мужчина, 1 балл'}); пероральную антикоагуляцию следует рассмотреть индивидуально с учётом соотношения пользы и риска и предпочтений пациента.`
      : `CHA₂DS₂-VASc = ${cha2ds2VascScore}: высокий риск по КР РФ 2025 (${input.femaleSex ? 'женщина, ≥3 баллов' : 'мужчина, ≥2 баллов'}); пероральная антикоагуляция рекомендуется при отсутствии противопоказаний.`

  const hasBledComponents: ScoreComponent[] = [
    { key: 'hypertension', label: 'H — Неконтролируемая гипертензия (САД >160 мм рт. ст.)', value: input.uncontrolledSystolicBPOver160 ? 'Да' : 'Нет', points: input.uncontrolledSystolicBPOver160 ? 1 : 0 },
    { key: 'renal', label: 'A — Нарушение функции почек', value: input.abnormalRenalFunction ? 'Да' : 'Нет', points: input.abnormalRenalFunction ? 1 : 0 },
    { key: 'liver', label: 'A — Нарушение функции печени', value: input.abnormalLiverFunction ? 'Да' : 'Нет', points: input.abnormalLiverFunction ? 1 : 0 },
    { key: 'stroke', label: 'S — Инсульт в анамнезе', value: input.priorStrokeForBleedingScore ? 'Да' : 'Нет', points: input.priorStrokeForBleedingScore ? 1 : 0 },
    { key: 'bleeding', label: 'B — Кровотечение в анамнезе / предрасположенность', value: input.bleedingHistoryOrPredisposition ? 'Да' : 'Нет', points: input.bleedingHistoryOrPredisposition ? 1 : 0 },
    { key: 'labileINR', label: 'L — Лабильное МНО (TTR <60% при терапии АВК)', value: input.labileINR ? 'Да' : 'Нет', points: input.labileINR ? 1 : 0 },
    { key: 'age', label: 'E — Возраст >65 лет', value: `${input.ageYears} лет`, points: ageHasBledPoints },
    { key: 'drugs', label: 'D — Антиагреганты / НПВП', value: input.bleedingRiskDrugs ? 'Да' : 'Нет', points: input.bleedingRiskDrugs ? 1 : 0 },
    { key: 'alcohol', label: 'D — Избыточное употребление алкоголя', value: input.excessiveAlcohol ? 'Да' : 'Нет', points: input.excessiveAlcohol ? 1 : 0 },
  ]
  const hasBledScore = hasBledComponents.reduce((sum, component) => sum + component.points, 0)

  return {
    cha2ds2VascScore,
    cha2ds2VascCategory,
    cha2ds2VascGuidance,
    hasBledScore,
    hasBledHighRisk: hasBledScore >= 3,
    chaComponents,
    hasBledComponents,
  }
}
