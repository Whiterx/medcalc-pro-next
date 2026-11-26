export type FourTsPoints = 0 | 1 | 2
export type FourTsCategory = 'low' | 'intermediate' | 'high'

export interface FourTsInput {
  thrombocytopenia: FourTsPoints
  timing: FourTsPoints
  thrombosisOrSequelae: FourTsPoints
  otherCauses: FourTsPoints
  assessmentConfirmed: boolean
}

export interface FourTsComponent {
  key: keyof Omit<FourTsInput, 'assessmentConfirmed'>
  label: string
  points: FourTsPoints
  interpretation: string
}

export interface FourTsResult {
  score: number
  category: FourTsCategory
  categoryLabel: string
  pathway: string
  components: FourTsComponent[]
}

const validPoints = (value: number): value is FourTsPoints => value === 0 || value === 1 || value === 2

export function calculateFourTs(input: FourTsInput): FourTsResult {
  if (!input.assessmentConfirmed) {
    throw new Error('Подтвердите, что все 4 компонента оценены по достоверным данным.')
  }

  const values = [input.thrombocytopenia, input.timing, input.thrombosisOrSequelae, input.otherCauses]
  if (!values.every(validPoints)) {
    throw new Error('Для каждого компонента выберите оценку 0, 1 или 2 балла.')
  }

  const components: FourTsComponent[] = [
    {
      key: 'thrombocytopenia',
      label: 'Thrombocytopenia — степень снижения тромбоцитов',
      points: input.thrombocytopenia,
      interpretation: input.thrombocytopenia === 2
        ? 'Снижение >50% и минимальное число тромбоцитов ≥20 ×10⁹/л'
        : input.thrombocytopenia === 1
          ? 'Снижение 30–50% или минимальное число 10–19 ×10⁹/л'
          : 'Снижение <30% или минимальное число <10 ×10⁹/л',
    },
    {
      key: 'timing',
      label: 'Timing — сроки снижения тромбоцитов',
      points: input.timing,
      interpretation: input.timing === 2
        ? 'Чёткое начало на 5–14-й день или ≤1 дня при экспозиции гепарина в последние 30 дней'
        : input.timing === 1
          ? 'Неясное начало на 5–14-й день, начало после 14-го дня или ≤1 дня при экспозиции 30–100 дней назад'
          : 'Снижение ≤4 дней без недавней экспозиции гепарина',
    },
    {
      key: 'thrombosisOrSequelae',
      label: 'Thrombosis — тромбозы и другие последствия',
      points: input.thrombosisOrSequelae,
      interpretation: input.thrombosisOrSequelae === 2
        ? 'Новый подтверждённый тромбоз, некроз кожи в месте инъекции, острая системная реакция после болюса гепарина или инфаркт надпочечников'
        : input.thrombosisOrSequelae === 1
          ? 'Прогрессирующий/рецидивирующий тромбоз, подозрение на тромбоз или эритематозные кожные поражения'
          : 'Нет тромбоза и других характерных последствий',
    },
    {
      key: 'otherCauses',
      label: 'oTher causes — другие причины тромбоцитопении',
      points: input.otherCauses,
      interpretation: input.otherCauses === 2
        ? 'Другие причины не выявлены'
        : input.otherCauses === 1
          ? 'Возможна другая причина'
          : 'Имеется определённая альтернативная причина',
    },
  ]

  const score = values.reduce<number>((sum, value) => sum + value, 0)
  const category: FourTsCategory = score <= 3 ? 'low' : score <= 5 ? 'intermediate' : 'high'
  const categoryLabel = category === 'low'
    ? 'Низкая вероятность ГИТ'
    : category === 'intermediate'
      ? 'Промежуточная вероятность ГИТ'
      : 'Высокая вероятность ГИТ'

  const pathway = category === 'low'
    ? 'ASH: при низкой вероятности ГИТ не рекомендуется эмпирически отменять гепарин и начинать негепариновый антикоагулянт. Обычно лабораторное тестирование на ГИТ не требуется. Если данные неполные/недостоверные или клиническая картина меняется, повторно оцените 4Ts и рассмотрите тестирование.'
    : category === 'intermediate'
      ? 'ASH: требуется иммунологическое исследование на антитела к PF4/гепарину. При подозрении на ГИТ гепарин отменяют; выбор и интенсивность негепариновой антикоагуляции определяют срочно с учётом риска кровотечения и наличия других показаний к лечебной антикоагуляции. При положительном иммунологическом тесте выполняют функциональный тест, если доступен.'
      : 'ASH: при высокой вероятности ГИТ гепарин отменяют и начинают негепариновую антикоагуляцию лечебной интенсивности, если нет индивидуальных противопоказаний. Необходимо иммунологическое исследование на антитела к PF4/гепарину; при положительном результате — функциональный тест, если доступен.'

  return { score, category, categoryLabel, pathway, components }
}
