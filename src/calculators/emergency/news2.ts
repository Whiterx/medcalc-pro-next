export type NEWS2SpO2Scale = 1 | 2
export type NEWS2Consciousness = 'alert' | 'new-confusion' | 'voice' | 'pain' | 'unresponsive'

export interface NEWS2Input {
  respiratoryRate: number
  spo2: number
  spo2Scale: NEWS2SpO2Scale
  supplementalOxygen: boolean
  systolicBP: number
  pulse: number
  temperature: number
  consciousness: NEWS2Consciousness
}

export interface NEWS2Criterion {
  key: keyof NEWS2Input | 'oxygen'
  label: string
  value: string
  points: number
  explanation: string
}

export interface NEWS2Result {
  score: number
  highestSingleParameter: number
  hasSingleRedScore: boolean
  riskLevel: 'routine' | 'low' | 'medium' | 'high'
  riskLabel: string
  criteria: NEWS2Criterion[]
  interpretation: string
  suggestedResponse: string
}

function scoreRespiratoryRate(value: number): number {
  if (value <= 8 || value >= 25) return 3
  if (value >= 21) return 2
  if (value >= 9 && value <= 11) return 1
  return 0
}

function scoreSpO2(value: number, scale: NEWS2SpO2Scale, oxygen: boolean): number {
  if (scale === 1) {
    if (value <= 91) return 3
    if (value <= 93) return 2
    if (value <= 95) return 1
    return 0
  }
  if (value <= 83) return 3
  if (value <= 85) return 2
  if (value <= 87) return 1
  if (value <= 92) return 0
  if (value <= 94) return 1
  if (value <= 96) return 2
  return 3
}

function scoreSystolicBP(value: number): number {
  if (value <= 90 || value >= 220) return 3
  if (value <= 100) return 2
  if (value <= 110) return 1
  return 0
}

function scorePulse(value: number): number {
  if (value <= 40 || value >= 131) return 3
  if (value <= 50) return 1
  if (value <= 90) return 0
  if (value <= 110) return 1
  return 2
}

function scoreTemperature(value: number): number {
  if (value <= 35) return 3
  if (value <= 36) return 1
  if (value <= 38) return 0
  if (value <= 39) return 1
  return 2
}

export function calculateNEWS2(input: NEWS2Input): NEWS2Result {
  const spo2Description = input.spo2Scale === 1
    ? 'Шкала 1'
    : input.supplementalOxygen ? 'Шкала 2, на кислороде' : 'Шкала 2, на воздухе'

  const criteria: NEWS2Criterion[] = [
    { key: 'respiratoryRate', label: 'Частота дыхания', value: `${input.respiratoryRate}/мин`, points: scoreRespiratoryRate(input.respiratoryRate), explanation: 'Пороговые значения ЧДД NEWS2' },
    { key: 'spo2', label: 'Сатурация SpO₂', value: `${input.spo2}% · ${spo2Description}`, points: scoreSpO2(input.spo2, input.spo2Scale, input.supplementalOxygen), explanation: input.spo2Scale === 2 ? 'Шкала 2 применяется только по назначению квалифицированного специалиста при целевой SpO₂ 88–92%' : 'Стандартная шкала SpO₂' },
    { key: 'oxygen', label: 'Дополнительный кислород', value: input.supplementalOxygen ? 'Да' : 'Нет', points: input.supplementalOxygen ? 2 : 0, explanation: 'Дополнительные 2 балла при получении кислорода' },
    { key: 'systolicBP', label: 'Систолическое АД', value: `${input.systolicBP} мм рт. ст.`, points: scoreSystolicBP(input.systolicBP), explanation: 'Оценивается только систолическое давление' },
    { key: 'pulse', label: 'Частота пульса', value: `${input.pulse}/мин`, points: scorePulse(input.pulse), explanation: 'Пороговые значения частоты пульса NEWS2' },
    { key: 'consciousness', label: 'Сознание (ACVPU)', value: input.consciousness === 'alert' ? 'Бодрствует / обычное состояние' : ({ 'new-confusion': 'Новое спутанное сознание', voice: 'Реакция на голос', pain: 'Реакция на боль', unresponsive: 'Нет реакции' }[input.consciousness]), points: input.consciousness === 'alert' ? 0 : 3, explanation: 'Новое спутанное сознание или любой уровень V, P, U — 3 балла' },
    { key: 'temperature', label: 'Температура', value: `${input.temperature.toFixed(1)} °C`, points: scoreTemperature(input.temperature), explanation: 'Пороговые значения температуры NEWS2' },
  ]

  const score = criteria.reduce((sum, item) => sum + item.points, 0)
  const highestSingleParameter = Math.max(...criteria.map((item) => item.points))
  const hasSingleRedScore = highestSingleParameter === 3

  let riskLevel: NEWS2Result['riskLevel']
  let riskLabel: string
  let interpretation: string
  let suggestedResponse: string

  if (score === 0) {
    riskLevel = 'routine'
    riskLabel = '0 баллов · без отклонений'
    interpretation = 'По введённым параметрам баллы NEWS2 не начислены. Это не отменяет клиническую оценку и повторное наблюдение.'
    suggestedResponse = 'Продолжать рутинное наблюдение по локальному протоколу.'
  } else if (score <= 4) {
    riskLevel = 'low'
    riskLabel = 'Низкий риск по сумме'
    interpretation = 'Суммарный балл находится в диапазоне 1–4. Проверьте каждый параметр и динамику состояния.'
    suggestedResponse = 'Оценка компетентным медицинским работником; частота мониторинга определяется клинической ситуацией и локальным протоколом.'
  } else if (score <= 6) {
    riskLevel = 'medium'
    riskLabel = 'Средний риск'
    interpretation = 'Сумма 5–6 баллов достигает порога срочного клинического реагирования.'
    suggestedResponse = 'Срочная оценка клиницистом, компетентным в ведении остро заболевших пациентов; усилить мониторинг согласно локальному протоколу.'
  } else {
    riskLevel = 'high'
    riskLabel = 'Высокий риск'
    interpretation = 'Сумма 7 баллов и более соответствует высокому уровню клинического риска.'
    suggestedResponse = 'Экстренная оценка командой с компетенциями интенсивной терапии и непрерывный мониторинг согласно локальному протоколу.'
  }

  if (hasSingleRedScore && score < 5) {
    interpretation += ' Несмотря на сумму менее 5, один из параметров получил 3 балла — это самостоятельный повод для срочной клинической оценки.'
    suggestedResponse = 'Срочная оценка врачом/клиницистом, компетентным в ведении остро заболевших пациентов; пересмотреть частоту мониторинга.'
  }

  return { score, highestSingleParameter, hasSingleRedScore, riskLevel, riskLabel, criteria, interpretation, suggestedResponse }
}
