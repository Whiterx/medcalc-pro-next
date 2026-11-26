export type H2FPEFAF = 'none' | 'paroxysmal' | 'persistent'

export interface H2FPEFInput {
  ageYears: number
  bmi: number
  antihypertensiveCount: number
  atrialFibrillation: H2FPEFAF
  paspMmHg: number
  eOverEPrime: number
  lvefAtLeast50: boolean
}

export interface H2FPEFComponent {
  key: string
  label: string
  value: string
  points: number
  criterion: string
}

export interface H2FPEFResult {
  score: number
  category: 'low' | 'intermediate' | 'high'
  categoryLabel: string
  interpretation: string
  components: H2FPEFComponent[]
}

export function calculateH2FPEF(input: H2FPEFInput): H2FPEFResult {
  if (!input.lvefAtLeast50) {
    throw new Error('Подтвердите, что фракция выброса левого желудочка составляет ≥50%. Шкала разработана для оценки вероятности СНсФВ.')
  }
  if (!Number.isInteger(input.ageYears) || input.ageYears < 18 || input.ageYears > 120) {
    throw new Error('Возраст должен быть целым числом от 18 до 120 лет.')
  }
  if (!Number.isFinite(input.bmi) || input.bmi < 10 || input.bmi > 100) {
    throw new Error('ИМТ должен находиться в диапазоне 10–100 кг/м².')
  }
  if (!Number.isInteger(input.antihypertensiveCount) || input.antihypertensiveCount < 0 || input.antihypertensiveCount > 30) {
    throw new Error('Количество антигипертензивных препаратов должно быть целым числом от 0 до 30.')
  }
  if (input.atrialFibrillation !== 'none' && input.atrialFibrillation !== 'paroxysmal' && input.atrialFibrillation !== 'persistent') {
    throw new Error('Укажите тип фибрилляции предсердий.')
  }
  if (!Number.isFinite(input.paspMmHg) || input.paspMmHg < 1 || input.paspMmHg > 150) {
    throw new Error('СДЛА по данным ЭхоКГ должна быть в диапазоне 1–150 мм рт. ст.')
  }
  if (!Number.isFinite(input.eOverEPrime) || input.eOverEPrime < 0.1 || input.eOverEPrime > 50) {
    throw new Error('Отношение E/e′ должно быть в диапазоне 0,1–50.')
  }

  const components: H2FPEFComponent[] = [
    { key: 'bmi', label: 'ИМТ', value: `${input.bmi} кг/м²`, points: input.bmi > 30 ? 2 : 0, criterion: '>30 кг/м²' },
    { key: 'antihypertensives', label: 'Антигипертензивная терапия', value: `${input.antihypertensiveCount} препаратов`, points: input.antihypertensiveCount >= 2 ? 1 : 0, criterion: '≥2 препарата' },
    { key: 'atrialFibrillation', label: 'Фибрилляция предсердий', value: input.atrialFibrillation === 'none' ? 'Нет' : input.atrialFibrillation === 'paroxysmal' ? 'Пароксизмальная' : 'Персистирующая', points: input.atrialFibrillation === 'none' ? 0 : 3, criterion: 'Пароксизмальная или персистирующая — 3 балла' },
    { key: 'pasp', label: 'Систолическое давление в лёгочной артерии (СДЛА)', value: `${input.paspMmHg} мм рт. ст.`, points: input.paspMmHg > 35 ? 1 : 0, criterion: '>35 мм рт. ст. по ЭхоКГ' },
    { key: 'age', label: 'Возраст', value: `${input.ageYears} лет`, points: input.ageYears > 60 ? 1 : 0, criterion: '>60 лет' },
    { key: 'fillingPressure', label: 'Отношение E/e′', value: String(input.eOverEPrime), points: input.eOverEPrime > 9 ? 1 : 0, criterion: '>9 по допплер-ЭхоКГ' },
  ]

  const score = components.reduce((sum, component) => sum + component.points, 0)
  const category = score <= 1 ? 'low' : score <= 5 ? 'intermediate' : 'high'
  const categoryLabel = category === 'low' ? 'Низкая вероятность (0–1 балл)' : category === 'intermediate' ? 'Промежуточная вероятность (2–5 баллов)' : 'Высокая вероятность (6–9 баллов)'
  const interpretation = category === 'low'
    ? 'СНсФВ маловероятна по шкале H₂FPEF. Низкий балл не исключает диагноз при высокой клинической вероятности.'
    : category === 'intermediate'
      ? 'Промежуточная вероятность СНсФВ. Для уточнения диагноза может потребоваться дополнительное функциональное тестирование.'
      : 'Высокая вероятность СНсФВ по шкале H₂FPEF. Требуется клиническая оценка и подтверждение диагноза; балл сам по себе не устанавливает диагноз.'

  return { score, category, categoryLabel, interpretation, components }
}
