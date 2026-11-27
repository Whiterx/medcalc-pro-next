export type NEWS2SpO2Scale = 1 | 2
export type NEWS2Consciousness = 'alert' | 'new-confusion' | 'voice' | 'pain' | 'unresponsive'
export type NEWS2MissingDataReason = 'equipment-unavailable' | 'unobtainable-despite-equipment'

export interface NEWS2Input {
  respiratoryRate: number | null
  spo2: number | null
  spo2Scale: NEWS2SpO2Scale | null
  supplementalOxygen: boolean | null
  systolicBP: number | null
  pulse: number | null
  temperature: number | null
  consciousness: NEWS2Consciousness | null
  missingDataReason?: NEWS2MissingDataReason | null
}

export interface NEWS2Criterion {
  key: 'respiratoryRate' | 'spo2' | 'oxygen' | 'systolicBP' | 'pulse' | 'consciousness' | 'temperature'
  label: string
  value: string
  points: number | null
  explanation: string
}

export interface NEWS2Result {
  score: number | null
  highestSingleParameter: number
  hasSingleRedScore: boolean
  riskLevel: 'routine' | 'low' | 'medium' | 'high' | 'incomplete'
  riskLabel: string
  monitoringFrequency: string
  criteria: NEWS2Criterion[]
  interpretation: string
  suggestedResponse: string
  isIncomplete: boolean
  missingParameters: string[]
  requiresImmediateResponse: boolean
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
  const spo2CanBeScored = input.spo2 !== null && input.spo2Scale !== null &&
    (input.spo2Scale === 1 || input.supplementalOxygen !== null)
  const spo2Description = input.spo2Scale === null ? 'шкала не выбрана' :
    input.spo2Scale === 1 ? 'Шкала 1' :
      input.supplementalOxygen === null ? 'статус O₂ не указан' :
        input.supplementalOxygen ? 'Шкала 2, на кислороде' : 'Шкала 2, на воздухе'

  const criteria: NEWS2Criterion[] = [
    { key: 'respiratoryRate', label: 'Частота дыхания', value: input.respiratoryRate === null ? 'Не измерено' : `${input.respiratoryRate}/мин`, points: input.respiratoryRate === null ? null : scoreRespiratoryRate(input.respiratoryRate), explanation: 'Пороговые значения ЧДД NEWS2' },
    { key: 'spo2', label: 'Сатурация SpO₂', value: input.spo2 === null ? `Не измерено · ${spo2Description}` : `${input.spo2}% · ${spo2Description}`, points: spo2CanBeScored ? scoreSpO2(input.spo2 as number, input.spo2Scale as NEWS2SpO2Scale, input.supplementalOxygen === true) : null, explanation: input.spo2Scale === 2 ? 'Шкала 2 — только при подтверждённой газами крови гиперкапнической дыхательной недостаточности и назначенной целевой SpO₂ 88–92%' : 'Стандартная шкала SpO₂' },
    { key: 'oxygen', label: 'Дополнительный кислород', value: input.supplementalOxygen === null ? 'Не указано' : input.supplementalOxygen ? 'Да' : 'Нет', points: input.supplementalOxygen === null ? null : input.supplementalOxygen ? 2 : 0, explanation: 'Дополнительные 2 балла при получении кислорода' },
    { key: 'systolicBP', label: 'Систолическое АД', value: input.systolicBP === null ? 'Не измерено' : `${input.systolicBP} мм рт. ст.`, points: input.systolicBP === null ? null : scoreSystolicBP(input.systolicBP), explanation: 'Оценивается только систолическое давление' },
    { key: 'pulse', label: 'Частота пульса', value: input.pulse === null ? 'Не измерено' : `${input.pulse}/мин`, points: input.pulse === null ? null : scorePulse(input.pulse), explanation: 'Пороговые значения частоты пульса NEWS2' },
    { key: 'consciousness', label: 'Сознание (ACVPU)', value: input.consciousness === null ? 'Не оценено' : input.consciousness === 'alert' ? 'Бодрствует / обычное состояние' : ({ 'new-confusion': 'Новое спутанное сознание', voice: 'Реакция на голос', pain: 'Реакция на боль', unresponsive: 'Нет реакции' }[input.consciousness]), points: input.consciousness === null ? null : input.consciousness === 'alert' ? 0 : 3, explanation: 'Новое спутанное сознание, острое изменение ментального статуса или любой уровень V, P, U — 3 балла' },
    { key: 'temperature', label: 'Температура', value: input.temperature === null ? 'Не измерено' : `${input.temperature.toFixed(1)} °C`, points: input.temperature === null ? null : scoreTemperature(input.temperature), explanation: 'Пороговые значения температуры NEWS2' },
  ]

  const knownPoints = criteria.flatMap((item) => item.points === null ? [] : [item.points])
  const score = knownPoints.length ? knownPoints.reduce((sum, value) => sum + value, 0) : null
  const highestSingleParameter = knownPoints.length ? Math.max(...knownPoints) : 0
  const hasSingleRedScore = highestSingleParameter === 3
  const missingParameters = criteria.filter((item) => item.points === null).map((item) => item.label)
  const isIncomplete = missingParameters.length > 0
  const requiresImmediateResponse = isIncomplete && input.missingDataReason === 'unobtainable-despite-equipment'

  let riskLevel: NEWS2Result['riskLevel']
  let riskLabel: string
  let interpretation: string
  let suggestedResponse: string
  let monitoringFrequency: string

  if (score === null) {
    riskLevel = 'incomplete'
    riskLabel = 'Неполный NEWS2 — нет оцениваемых параметров'
    interpretation = 'Не удалось рассчитать даже частичный балл: ни один физиологический параметр не оценён.'
    monitoringFrequency = 'Частоту мониторинга нельзя определить по отсутствующим данным; требуется клиническая оценка.'
    suggestedResponse = 'Незамедлительно организовать клиническую оценку и получить необходимые показатели; не трактовать отсутствие балла как нулевой риск.'
  } else if (score === 0 && isIncomplete) {
    riskLevel = 'incomplete'
    riskLabel = 'Неполный NEWS2 — 0 баллов по доступным данным'
    interpretation = 'По измеренным параметрам баллы не начислены, но результат неполный и не подтверждает низкий риск.'
    monitoringFrequency = 'Не назначать рутинную 12-часовую частоту по неполному результату; получить недостающие показатели и оценить пациента клинически.'
    suggestedResponse = 'Не использовать частичный нулевой балл для снижения наблюдения. Повторить отсутствующие измерения и сопоставить с клиническим состоянием.'
  } else if (score === 0) {
    riskLevel = 'routine'
    riskLabel = '0 баллов · рутинный мониторинг'
    interpretation = 'По введённым параметрам баллы NEWS2 не начислены. Это не отменяет клиническую оценку и повторное наблюдение.'
    monitoringFrequency = 'Не реже 1 раза в 12 часов (стационарный контекст; ориентир RCP).'
    suggestedResponse = 'Зарегистрированная медсестра должна оценить пациента; затем продолжать рутинный мониторинг NEWS в соответствии с локальным протоколом.'
  } else if (score <= 4 && isIncomplete) {
    riskLevel = 'incomplete'
    riskLabel = `Неполный NEWS2 — ${score} балла по доступным данным`
    interpretation = 'Частичный балл находится ниже порога суммарного срочного реагирования, однако отсутствующие параметры могут изменить итог; низкий риск не подтверждён.'
    monitoringFrequency = 'Не назначать стандартную частоту мониторинга по неполному баллу; требуется клиническая оценка и получение недостающих показателей.'
    suggestedResponse = 'Не использовать частичный балл для снижения уровня наблюдения. Повторить измерения и руководствоваться клинической оценкой.'
  } else if (score <= 4) {
    riskLevel = 'low'
    riskLabel = 'Низкий риск по сумме'
    interpretation = 'Суммарный балл находится в диапазоне 1–4. Проверьте каждый параметр и динамику состояния.'
    monitoringFrequency = 'Не реже 1 раза в 4–6 часов (стационарный контекст; ориентир RCP).'
    suggestedResponse = 'Зарегистрированная медсестра должна оценить пациента и сообщить медицинской команде; медицинская команда оценивает пациента и решает, требуется ли увеличение частоты мониторинга или эскалация помощи.'
  } else if (score <= 6) {
    riskLevel = 'medium'
    riskLabel = isIncomplete ? 'Средний риск по доступным данным · неполный результат' : 'Средний риск'
    interpretation = 'Сумма 5–6 баллов достигает порога срочного клинического реагирования.'
    monitoringFrequency = 'Не реже 1 раза в час первоначально (стационарный контекст; ориентир RCP).'
    suggestedResponse = 'Немедленно уведомить медицинскую команду и запросить срочную оценку клиницистом, компетентным в ведении остро заболевших пациентов; ориентир RCP — оценка в течение 60 минут. Рассмотреть наблюдение в условиях мониторинга.'
  } else {
    riskLevel = 'high'
    riskLabel = isIncomplete ? 'Высокий риск по доступным данным · неполный результат' : 'Высокий риск'
    interpretation = 'Сумма 7 баллов и более соответствует высокому уровню клинического риска.'
    monitoringFrequency = 'Непрерывный мониторинг жизненных показателей; срочная клиническая оценка в течение 30 минут (стационарный контекст; ориентир RCP).'
    suggestedResponse = 'Немедленно активировать экстренную команду для экстренной оценки пациента с компетенциями интенсивной терапии, включая специалиста с навыками расширенного обеспечения проходимости дыхательных путей; ориентир RCP — оценка в течение 30 минут. При отсутствии улучшения требуется старший клинический пересмотр в течение 60 минут; рассмотреть перевод в подразделение более высокого уровня наблюдения.'
  }

  if (hasSingleRedScore) {
    interpretation += ' Один из параметров получил 3 балла — самостоятельный триггер клинического реагирования независимо от суммы.'
    if (score !== null && score < 5) {
      riskLevel = isIncomplete ? 'incomplete' : 'low'
      riskLabel = isIncomplete ? 'Неполный NEWS2: один параметр 3 балла' : 'Низкий–средний риск: один параметр 3 балла'
      monitoringFrequency = 'Не реже 1 раза в час первоначально (самостоятельный триггер 3 балла за один параметр; ориентир RCP).'
      suggestedResponse = 'Медсестра немедленно информирует медицинскую команду; команда оценивает пациента и решает, требуется ли эскалация помощи.'
    }
  }

  if (isIncomplete) {
    interpretation += ` Неполный результат: ${missingParameters.join(', ')} не оценены. Сумма отражает только доступные параметры; отсутствующие показатели могут увеличить балл.`
    if (score !== null && score >= 5) {
      suggestedResponse += ' Результат неполный: недостающие параметры могут изменить сумму; получение данных и клиническая оценка не должны задерживать реагирование.'
    }
  }

  if (requiresImmediateResponse) {
    interpretation += ' Один или несколько показателей невозможно получить несмотря на использование оборудования; дополнительное руководство RCP рекомендует немедленное реагирование.'
    if (score !== null && score >= 5) {
      monitoringFrequency = `Немедленная активация клинического ответа; ${monitoringFrequency}`
      suggestedResponse = `${suggestedResponse} Невозможность получить показатель несмотря на оборудование сама по себе требует немедленного ответа по RCP; активируйте локальный протокол без задержки.`
    } else {
      monitoringFrequency = 'Немедленная клиническая оценка и реагирование по локальному протоколу.'
      suggestedResponse = `Немедленно активировать локальный протокол клинического реагирования; отсутствие измеряемого показателя несмотря на использование оборудования само по себе требует срочного ответа по RCP. ${suggestedResponse}`
    }
  }

  return { score, highestSingleParameter, hasSingleRedScore, riskLevel, riskLabel, monitoringFrequency, criteria, interpretation, suggestedResponse, isIncomplete, missingParameters, requiresImmediateResponse }
}
