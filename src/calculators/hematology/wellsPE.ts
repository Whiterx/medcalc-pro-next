export interface WellsPEInput {
  clinicalSignsOfDVT: boolean
  pulmonaryEmbolismMoreLikelyThanAlternative: boolean
  heartRateOver100: boolean
  immobilisationOver3DaysOrSurgeryWithin4Weeks: boolean
  previousDVTOrPE: boolean
  haemoptysis: boolean
  activeCancer: boolean
  assessmentConfirmed: boolean
}

export interface WellsPEComponent {
  key: keyof Omit<WellsPEInput, 'assessmentConfirmed'>
  label: string
  present: boolean
  points: number
}

export interface WellsPEResult {
  score: number
  category: 'likely' | 'unlikely'
  categoryLabel: 'ТЭЛА вероятна' | 'ТЭЛА маловероятна'
  pathway: string
  components: WellsPEComponent[]
}

export function calculateWellsPE(input: WellsPEInput): WellsPEResult {
  if (!input.assessmentConfirmed) {
    throw new Error('Подтвердите, что все 7 критериев оценены; неотмеченные признаки действительно отсутствуют.')
  }

  const components: WellsPEComponent[] = [
    { key: 'clinicalSignsOfDVT', label: 'Клинические признаки ТГВ: минимум отёк ноги и болезненность при пальпации глубоких вен', present: input.clinicalSignsOfDVT, points: 3 },
    { key: 'pulmonaryEmbolismMoreLikelyThanAlternative', label: 'ТЭЛА более вероятна, чем альтернативный диагноз (клиническое суждение)', present: input.pulmonaryEmbolismMoreLikelyThanAlternative, points: 3 },
    { key: 'heartRateOver100', label: 'ЧСС >100 уд/мин', present: input.heartRateOver100, points: 1.5 },
    { key: 'immobilisationOver3DaysOrSurgeryWithin4Weeks', label: 'Иммобилизация >3 дней или операция в предыдущие 4 недели', present: input.immobilisationOver3DaysOrSurgeryWithin4Weeks, points: 1.5 },
    { key: 'previousDVTOrPE', label: 'ТГВ или ТЭЛА в анамнезе', present: input.previousDVTOrPE, points: 1.5 },
    { key: 'haemoptysis', label: 'Кровохарканье', present: input.haemoptysis, points: 1 },
    { key: 'activeCancer', label: 'Активное злокачественное новообразование: лечение сейчас, в последние 6 месяцев или паллиативное лечение', present: input.activeCancer, points: 1 },
  ]

  const score = components.reduce((total, item) => total + (item.present ? item.points : 0), 0)
  const likely = score > 4

  return {
    score,
    category: likely ? 'likely' : 'unlikely',
    categoryLabel: likely ? 'ТЭЛА вероятна' : 'ТЭЛА маловероятна',
    pathway: likely
      ? 'По двухуровневому алгоритму NICE: срочно организовать визуализацию — обычно КТ-ангиографию лёгочных артерий (КТЛА/CTPA). При противопоказаниях к контрасту или другим ограничениям рассмотреть альтернативную визуализацию (например, V/Q). Если визуализация не может быть выполнена немедленно, следовать протоколу временной лечебной антикоагуляции и оценить риск кровотечения.'
      : 'По двухуровневому алгоритму NICE: выполнить D-димер (предпочтительно с быстрым получением результата). При положительном результате перейти к визуализации; при отрицательном — ТЭЛА маловероятна в рамках данного диагностического алгоритма, оценить альтернативные диагнозы и дать инструкции по повторному обращению при ухудшении.',
    components,
  }
}
