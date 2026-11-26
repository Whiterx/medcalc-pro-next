export type TIMIRiskCategory = 'low' | 'intermediate' | 'high'

export interface TIMIInput {
  ageYears: number
  coronaryRiskFactorCount: number
  priorCoronaryStenosisAtLeast50: boolean
  stDeviationAtLeast05mm: boolean
  anginalEpisodesLast24h: number
  aspirinUseLast7d: boolean
  elevatedCardiacBiomarkers: boolean
  assessmentConfirmed: boolean
}

export interface TIMIComponent {
  key: string
  label: string
  value: string
  points: number
}

export interface TIMIResult {
  score: number
  riskCategory: TIMIRiskCategory
  riskLabel: string
  eventRatePercent: number
  components: TIMIComponent[]
}

export function calculateTIMI(input: TIMIInput): TIMIResult {
  if (!input.assessmentConfirmed) {
    throw new Error('Подтвердите, что все семь факторов TIMI оценены и неотмеченные признаки действительно отсутствуют.')
  }
  if (!Number.isInteger(input.ageYears) || input.ageYears < 18 || input.ageYears > 120) {
    throw new Error('Возраст должен быть целым числом от 18 до 120 лет.')
  }
  if (!Number.isInteger(input.coronaryRiskFactorCount) || input.coronaryRiskFactorCount < 0 || input.coronaryRiskFactorCount > 5) {
    throw new Error('Количество традиционных факторов риска ИБС должно быть целым числом от 0 до 5.')
  }
  if (!Number.isInteger(input.anginalEpisodesLast24h) || input.anginalEpisodesLast24h < 0 || input.anginalEpisodesLast24h > 100) {
    throw new Error('Количество эпизодов стенокардии за последние 24 часа должно быть целым числом от 0 до 100.')
  }

  const components: TIMIComponent[] = [
    { key: 'age', label: 'Возраст ≥65 лет', value: `${input.ageYears} лет`, points: input.ageYears >= 65 ? 1 : 0 },
    { key: 'riskFactors', label: '≥3 традиционных фактора риска ИБС', value: `${input.coronaryRiskFactorCount} из 5`, points: input.coronaryRiskFactorCount >= 3 ? 1 : 0 },
    { key: 'stenosis', label: 'Ранее документированный стеноз коронарной артерии ≥50%', value: input.priorCoronaryStenosisAtLeast50 ? 'Да' : 'Нет', points: input.priorCoronaryStenosisAtLeast50 ? 1 : 0 },
    { key: 'stDeviation', label: 'Отклонение ST ≥0,5 мм на исходной ЭКГ', value: input.stDeviationAtLeast05mm ? 'Да' : 'Нет', points: input.stDeviationAtLeast05mm ? 1 : 0 },
    { key: 'angina', label: '≥2 эпизода стенокардии за последние 24 часа', value: `${input.anginalEpisodesLast24h} эпизодов`, points: input.anginalEpisodesLast24h >= 2 ? 1 : 0 },
    { key: 'aspirin', label: 'Приём аспирина в течение последних 7 дней', value: input.aspirinUseLast7d ? 'Да' : 'Нет', points: input.aspirinUseLast7d ? 1 : 0 },
    { key: 'biomarkers', label: 'Повышение исходных кардиальных биомаркеров', value: input.elevatedCardiacBiomarkers ? 'Да' : 'Нет', points: input.elevatedCardiacBiomarkers ? 1 : 0 },
  ]
  const score = components.reduce((sum, component) => sum + component.points, 0)
  const riskCategory: TIMIRiskCategory = score <= 2 ? 'low' : score <= 4 ? 'intermediate' : 'high'
  const riskLabel = riskCategory === 'low' ? 'Низкий риск (0–2 балла)'
    : riskCategory === 'intermediate' ? 'Промежуточный риск (3–4 балла)'
      : 'Высокий риск (5–7 баллов)'
  const eventRates = [4.7, 4.7, 8.3, 13.2, 19.9, 26.2, 40.9, 40.9]
  return { score, riskCategory, riskLabel, eventRatePercent: eventRates[score], components }
}
