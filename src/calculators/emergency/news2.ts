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
  monitoringFrequency: string
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

  // NEWS2 Scale 2 is conditional on whether the patient is breathing air or receiving oxygen.
  // On air, SpO2 >=93% scores 0; on supplemental oxygen, 93–94/95–96/>=97 score 1/2/3.
  if (value <= 83) return 3
  if (value <= 85) return 2
  if (value <= 87) return 1
  if (value <= 92) return 0
  if (!oxygen) return 0
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
  let monitoringFrequency: string

  if (score === 0) {
    riskLevel = 'routine'
    riskLabel = '0 баллов · рутинный мониторинг'
    interpretation = 'По введённым параметрам баллы NEWS2 не начислены. Это не отменяет клиническую оценку и повторное наблюдение.'
    monitoringFrequency = 'Не реже 1 раза в 12 часов (стационарный контекст; ориентир RCP).'
    suggestedResponse = 'Продолжать рутинный мониторинг NEWS; зарегистрированная медсестра должна оценить пациента.'
  } else if (score <= 4) {
    riskLevel = 'low'
    riskLabel = 'Низкий риск по сумме'
    interpretation = 'Суммарный балл находится в диапазоне 1–4. Проверьте каждый параметр и динамику состояния.'
    monitoringFrequency = 'Не реже 1 раза в 4–6 часов (стационарный контекст; ориентир RCP).'
    suggestedResponse = 'Зарегистрированная медсестра оценивает пациента, решает, нужно ли увеличить частоту мониторинга или эскалировать помощь, и информирует медицинскую команду.'
  } else if (score <= 6) {
    riskLevel = 'medium'
    riskLabel = 'Средний риск'
    interpretation = 'Сумма 5–6 баллов достигает порога срочного клинического реагирования.'
    monitoringFrequency = 'Не реже 1 раза в час первоначально (стационарный контекст; ориентир RCP).'
    suggestedResponse = 'Немедленно уведомить медицинскую команду и запросить срочную оценку клиницистом, компетентным в ведении остро заболевших пациентов; ориентир RCP — оценка в течение 60 минут. Рассмотреть наблюдение в условиях мониторинга.'
  } else {
    riskLevel = 'high'
    riskLabel = 'Высокий риск'
    interpretation = 'Сумма 7 баллов и более соответствует высокому уровню клинического риска.'
    monitoringFrequency = 'Непрерывный мониторинг жизненных показателей; срочная клиническая оценка в течение 30 минут (стационарный контекст; ориентир RCP).'
    suggestedResponse = 'Немедленно уведомить медицинскую команду и запросить экстренную оценку клиницистом, компетентным в ведении остро заболевших пациентов; ориентир RCP — оценка в течение 30 минут. При отсутствии улучшения требуется старший клинический пересмотр в течение 60 минут; рассмотреть перевод в подразделение более высокого уровня наблюдения.'
  }

  if (hasSingleRedScore) {
    interpretation += ' Один из параметров получил 3 балла — самостоятельный триггер клинического реагирования независимо от суммы.'
    if (score < 5) {
      monitoringFrequency = 'Не реже 1 раза в час первоначально (самостоятельный триггер 3 балла за один параметр; ориентир RCP).'
      suggestedResponse = 'Медсестра должна немедленно уведомить медицинскую команду; компетентный клиницист оценивает пациента и определяет необходимость дальнейшей эскалации.'
    }
  }

  return { score, highestSingleParameter, hasSingleRedScore, riskLevel, riskLabel, monitoringFrequency, criteria, interpretation, suggestedResponse }
}
