export interface BISAPInput {
  bunAbove25: unknown
  impairedMentalStatus: unknown
  sirs: unknown
  ageAbove60: unknown
  pleuralEffusion: unknown
  first24HoursConfirmed: unknown
}

export interface BISAPCriterion {
  key: keyof Pick<BISAPInput, 'bunAbove25' | 'impairedMentalStatus' | 'sirs' | 'ageAbove60' | 'pleuralEffusion'>
  label: string
  present: boolean
  points: 0 | 1
  explanation: string
}

export interface BISAPResult {
  score: number
  maxScore: 5
  criteria: BISAPCriterion[]
  riskStatement: string
}

export function calculateBISAP(input: BISAPInput): BISAPResult {
  if (!input || typeof input !== 'object') {
    throw new Error('Заполните все пять компонентов BISAP.')
  }

  const keys = ['bunAbove25', 'impairedMentalStatus', 'sirs', 'ageAbove60', 'pleuralEffusion'] as const
  if (keys.some((key) => typeof input[key] !== 'boolean')) {
    throw new Error('Для каждого из пяти компонентов выберите «Да» или «Нет».')
  }
  if (input.first24HoursConfirmed !== true) {
    throw new Error('Подтвердите, что оценка основана на данных первых 24 часов госпитализации.')
  }

  const flags = {
    bunAbove25: flags.bunAbove25 as boolean,
    impairedMentalStatus: flags.impairedMentalStatus as boolean,
    sirs: flags.sirs as boolean,
    ageAbove60: flags.ageAbove60 as boolean,
    pleuralEffusion: flags.pleuralEffusion as boolean,
  }

  const criteria: BISAPCriterion[] = [
    {
      key: 'bunAbove25',
      label: 'Азот мочевины крови (BUN) >25 мг/дл',
      present: flags.bunAbove25,
      points: flags.bunAbove25 ? 1 : 0,
      explanation: 'Эквивалентно мочевине сыворотки примерно >8,9 ммоль/л; не путать BUN с общей мочевиной в мг/дл.',
    },
    {
      key: 'impairedMentalStatus',
      label: 'Нарушение психического статуса',
      present: flags.impairedMentalStatus,
      points: flags.impairedMentalStatus ? 1 : 0,
      explanation: 'В исходном определении — нарушение сознания, обычно операционализированное как GCS <15.',
    },
    {
      key: 'sirs',
      label: 'Системный воспалительный ответ (СИРС)',
      present: flags.sirs,
      points: flags.sirs ? 1 : 0,
      explanation: 'СИРС: не менее 2 критериев — температура <36 или >38 °C; ЧСС >90/мин; ЧДД >20/мин или PaCO₂ <32 мм рт. ст.; лейкоциты <4 или >12 ×10⁹/л либо палочкоядерные формы >10%.',
    },
    {
      key: 'ageAbove60',
      label: 'Возраст >60 лет',
      present: flags.ageAbove60,
      points: flags.ageAbove60 ? 1 : 0,
      explanation: 'Строгий порог исходной шкалы — старше 60 лет.',
    },
    {
      key: 'pleuralEffusion',
      label: 'Плевральный выпот',
      present: flags.pleuralEffusion,
      points: flags.pleuralEffusion ? 1 : 0,
      explanation: 'Выявлен при визуализации грудной клетки.',
    },
  ]

  const score = criteria.reduce((sum, criterion) => sum + criterion.points, 0)
  return {
    score,
    maxScore: 5,
    criteria,
    riskStatement: score >= 3
      ? 'BISAP ≥3 обычно рассматривают как признак повышенного риска неблагоприятного исхода. Чувствительность шкалы ограничена; результат требует сопоставления с клинической картиной и динамикой органной функции.'
      : 'Значение BISAP <3 не исключает тяжёлое течение острого панкреатита и не заменяет повторную клиническую оценку.',
  }
}
