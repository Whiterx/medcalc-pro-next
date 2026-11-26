export type GRACEKillipClass = 1 | 2 | 3 | 4
export type GRACERiskCategory = 'low' | 'intermediate' | 'high'

export interface GRACEInput {
  ageYears: number
  heartRate: number
  systolicBP: number
  creatinineUmolL: number
  killipClass: GRACEKillipClass
  cardiacArrestAtAdmission: boolean
  stSegmentDeviation: boolean
  elevatedCardiacBiomarkers: boolean
}

export interface GRACEComponent {
  key: string
  label: string
  value: string
  points: number
  explanation: string
}

export interface GRACEResult {
  score: number
  riskCategory: GRACERiskCategory
  riskLabel: string
  riskDescription: string
  components: GRACEComponent[]
}

export function getGRACERiskCategory(score: number): GRACERiskCategory {
  if (!Number.isFinite(score) || score < 0) throw new Error('Балльная сумма GRACE должна быть неотрицательным числом.')
  return score <= 108 ? 'low' : score <= 140 ? 'intermediate' : 'high'
}

export function calculateGRACE(input: GRACEInput): GRACEResult {
  if (!Number.isInteger(input.ageYears) || input.ageYears < 18 || input.ageYears > 120) {
    throw new Error('Возраст должен быть целым числом от 18 до 120 лет.')
  }
  if (!Number.isInteger(input.heartRate) || input.heartRate < 1 || input.heartRate > 300) {
    throw new Error('ЧСС должна быть целым числом от 1 до 300 в минуту.')
  }
  if (!Number.isInteger(input.systolicBP) || input.systolicBP < 1 || input.systolicBP > 300) {
    throw new Error('Систолическое АД должно быть целым числом от 1 до 300 мм рт. ст.')
  }
  if (!Number.isFinite(input.creatinineUmolL) || input.creatinineUmolL < 0 || input.creatinineUmolL > 2000) {
    throw new Error('Креатинин должен быть в диапазоне 0–2000 мкмоль/л.')
  }
  if (![1, 2, 3, 4].includes(input.killipClass)) {
    throw new Error('Выберите класс Killip I–IV.')
  }

  const agePoints = input.ageYears <= 30 ? 0 : input.ageYears <= 39 ? 8 : input.ageYears <= 49 ? 25
    : input.ageYears <= 59 ? 41 : input.ageYears <= 69 ? 58 : input.ageYears <= 79 ? 75
      : input.ageYears <= 89 ? 91 : 100
  const heartRatePoints = input.heartRate <= 50 ? 0 : input.heartRate <= 69 ? 3 : input.heartRate <= 89 ? 9
    : input.heartRate <= 109 ? 15 : input.heartRate <= 149 ? 24 : input.heartRate <= 199 ? 38 : 46
  const systolicBPPoints = input.systolicBP <= 80 ? 58 : input.systolicBP <= 99 ? 53 : input.systolicBP <= 119 ? 43
    : input.systolicBP <= 139 ? 34 : input.systolicBP <= 159 ? 24 : input.systolicBP <= 199 ? 10 : 0

  // GRACE creatinine bands are published in mg/dL; converted using 1 mg/dL = 88.4 µmol/L.
  const creatininePoints = input.creatinineUmolL < 35.36 ? 1
    : input.creatinineUmolL < 70.72 ? 4
      : input.creatinineUmolL < 106.08 ? 7
        : input.creatinineUmolL < 141.44 ? 10
          : input.creatinineUmolL < 176.8 ? 13
            : input.creatinineUmolL <= 353.6 ? 21 : 28

  const killipPoints: Record<GRACEKillipClass, number> = { 1: 0, 2: 20, 3: 39, 4: 59 }
  const components: GRACEComponent[] = [
    { key: 'age', label: 'Возраст', value: `${input.ageYears} лет`, points: agePoints, explanation: 'Баллы по возрастной категории GRACE' },
    { key: 'heartRate', label: 'Частота сердечных сокращений', value: `${input.heartRate}/мин`, points: heartRatePoints, explanation: 'Баллы по категории ЧСС GRACE' },
    { key: 'systolicBP', label: 'Систолическое артериальное давление', value: `${input.systolicBP} мм рт. ст.`, points: systolicBPPoints, explanation: 'Баллы по категории САД GRACE' },
    { key: 'creatinine', label: 'Креатинин', value: `${input.creatinineUmolL} мкмоль/л`, points: creatininePoints, explanation: 'Баллы по категории креатинина GRACE' },
    { key: 'killip', label: 'Класс Killip', value: `Класс ${input.killipClass}`, points: killipPoints[input.killipClass], explanation: 'I: 0; II: 20; III: 39; IV: 59 баллов' },
    { key: 'cardiacArrest', label: 'Остановка сердца при поступлении', value: input.cardiacArrestAtAdmission ? 'Да' : 'Нет', points: input.cardiacArrestAtAdmission ? 39 : 0, explanation: '+39 при наличии' },
    { key: 'stDeviation', label: 'Отклонение сегмента ST на ЭКГ', value: input.stSegmentDeviation ? 'Да' : 'Нет', points: input.stSegmentDeviation ? 28 : 0, explanation: '+28 при наличии' },
    { key: 'biomarkers', label: 'Повышение исходных кардиальных биомаркеров', value: input.elevatedCardiacBiomarkers ? 'Да' : 'Нет', points: input.elevatedCardiacBiomarkers ? 14 : 0, explanation: '+14 при наличии' },
  ]
  const score = components.reduce((sum, component) => sum + component.points, 0)
  const riskCategory = getGRACERiskCategory(score)
  const riskLabel = riskCategory === 'low' ? 'Низкий риск (≤108 баллов)'
    : riskCategory === 'intermediate' ? 'Промежуточный риск (109–140 баллов)'
      : 'Высокий риск (>140 баллов)'
  const riskDescription = riskCategory === 'low'
    ? 'Низкая категория риска госпитальной летальности по исходной шкале GRACE.'
    : riskCategory === 'intermediate'
      ? 'Промежуточная категория риска госпитальной летальности по исходной шкале GRACE.'
      : 'Высокая категория риска госпитальной летальности по исходной шкале GRACE.'

  return { score, riskCategory, riskLabel, riskDescription, components }
}
