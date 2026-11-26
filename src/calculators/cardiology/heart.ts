export type HEARTRiskCategory = 'low' | 'intermediate' | 'high'

export interface HEARTInput {
  historyScore: number
  ecgScore: number
  ageYears: number
  coronaryRiskFactorCount: number
  knownAtheroscleroticDisease: boolean
  troponinMultipleOfULN: number
}

export interface HEARTComponent {
  key: string
  label: string
  value: string
  points: number
}

export interface HEARTResult {
  score: number
  riskCategory: HEARTRiskCategory
  riskLabel: string
  sixWeekMacePercent: number
  components: HEARTComponent[]
}

export function getHEARTRiskCategory(score: number): HEARTRiskCategory {
  if (!Number.isInteger(score) || score < 0 || score > 10) {
    throw new Error('Сумма HEART должна быть целым числом от 0 до 10.')
  }
  return score <= 3 ? 'low' : score <= 6 ? 'intermediate' : 'high'
}

export function calculateHEART(input: HEARTInput): HEARTResult {
  if (!Number.isInteger(input.historyScore) || input.historyScore < 0 || input.historyScore > 2) {
    throw new Error('Оценка анамнеза должна быть 0, 1 или 2 балла.')
  }
  if (!Number.isInteger(input.ecgScore) || input.ecgScore < 0 || input.ecgScore > 2) {
    throw new Error('Оценка ЭКГ должна быть 0, 1 или 2 балла.')
  }
  if (!Number.isInteger(input.ageYears) || input.ageYears < 18 || input.ageYears > 120) {
    throw new Error('Возраст должен быть целым числом от 18 до 120 лет.')
  }
  if (!Number.isInteger(input.coronaryRiskFactorCount) || input.coronaryRiskFactorCount < 0 || input.coronaryRiskFactorCount > 6) {
    throw new Error('Количество традиционных факторов риска ИБС должно быть целым числом от 0 до 6.')
  }
  if (!Number.isFinite(input.troponinMultipleOfULN) || input.troponinMultipleOfULN < 0 || input.troponinMultipleOfULN > 100) {
    throw new Error('Тропонин относительно верхней границы нормы должен быть в диапазоне 0–100.')
  }

  const agePoints = input.ageYears < 45 ? 0 : input.ageYears < 65 ? 1 : 2
  const riskFactorPoints = input.knownAtheroscleroticDisease || input.coronaryRiskFactorCount >= 3
    ? 2 : input.coronaryRiskFactorCount >= 1 ? 1 : 0
  const troponinPoints = input.troponinMultipleOfULN <= 1 ? 0
    : input.troponinMultipleOfULN <= 3 ? 1 : 2

  const components: HEARTComponent[] = [
    { key: 'history', label: 'Анамнез', value: input.historyScore === 2 ? 'Сильно подозрительный' : input.historyScore === 1 ? 'Умеренно подозрительный' : 'Слабо подозрительный', points: input.historyScore },
    { key: 'ecg', label: 'ЭКГ', value: input.ecgScore === 2 ? 'Значимая депрессия ST' : input.ecgScore === 1 ? 'Неспецифические изменения реполяризации' : 'Норма', points: input.ecgScore },
    { key: 'age', label: 'Возраст', value: `${input.ageYears} лет`, points: agePoints },
    { key: 'riskFactors', label: 'Факторы риска ИБС / известный атеросклероз', value: input.knownAtheroscleroticDisease ? 'Известное атеросклеротическое заболевание' : `${input.coronaryRiskFactorCount} традиционных факторов риска`, points: riskFactorPoints },
    { key: 'troponin', label: 'Тропонин относительно ВГН', value: `${input.troponinMultipleOfULN} × ВГН`, points: troponinPoints },
  ]

  const score = components.reduce((sum, component) => sum + component.points, 0)
  const riskCategory = getHEARTRiskCategory(score)
  const riskLabel = riskCategory === 'low' ? 'Низкий риск (0–3 балла)'
    : riskCategory === 'intermediate' ? 'Промежуточный риск (4–6 баллов)'
      : 'Высокий риск (7–10 баллов)'
  const sixWeekMacePercent = riskCategory === 'low' ? 1.7 : riskCategory === 'intermediate' ? 16.6 : 50.1

  return { score, riskCategory, riskLabel, sixWeekMacePercent, components }
}
