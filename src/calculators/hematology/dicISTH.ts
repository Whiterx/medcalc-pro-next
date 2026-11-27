export type DICVersion = 'classic2001' | 'updated2025'
export type DimerCategory = 'none' | 'moderate' | 'strong'

export interface DICInput {
  version: DICVersion
  underlyingDisorderPresent: boolean
  plateletCount: number
  ptProlongationSeconds: number
  fibrinogenGPerL: number
  dDimerCategory?: DimerCategory
  dDimerMultipleOfULN?: number
  assessmentConfirmed: boolean
}

export interface DICComponent {
  key: string
  label: string
  value: string
  points: number
}

export interface DICResult {
  version: DICVersion
  score: number
  overtDICCompatible: boolean
  interpretation: string
  repeatGuidance: string
  components: DICComponent[]
}

export function calculateISTHDIC(input: DICInput): DICResult {
  if (!input || typeof input !== 'object') throw new Error('Введите лабораторные показатели.')
  if (input.version !== 'classic2001' && input.version !== 'updated2025') throw new Error('Выберите версию критериев ISTH.')
  if (input.underlyingDisorderPresent !== true) {
    throw new Error('Классический overt DIC score применяют только при наличии основного заболевания, ассоциированного с ДВС.')
  }
  if (input.assessmentConfirmed !== true) {
    throw new Error('Подтвердите, что все лабораторные показатели оценены и относятся к одному клиническому периоду.')
  }
  if (!Number.isFinite(input.plateletCount) || input.plateletCount < 0) {
    throw new Error('Тромбоциты должны быть конечным неотрицательным числом ×10⁹/л.')
  }
  if (!Number.isFinite(input.ptProlongationSeconds) || input.ptProlongationSeconds < 0) {
    throw new Error('Удлинение ПВ должно быть конечным неотрицательным числом секунд.')
  }
  if (!Number.isFinite(input.fibrinogenGPerL) || input.fibrinogenGPerL < 0) {
    throw new Error('Фибриноген должен быть конечным неотрицательным числом г/л.')
  }

  const plateletPoints = input.plateletCount < 50
    ? 2
    : input.version === 'classic2001'
      ? input.plateletCount <= 100 ? 1 : 0
      : input.plateletCount < 100 ? 1 : 0

  const ptPoints = input.version === 'classic2001'
    ? input.ptProlongationSeconds > 6 ? 2 : input.ptProlongationSeconds >= 3 ? 1 : 0
    : input.ptProlongationSeconds >= 6 ? 2 : input.ptProlongationSeconds >= 3 ? 1 : 0

  const fibrinogenPoints = input.fibrinogenGPerL < 1 ? 1 : 0

  let dDimerPoints: number
  let dDimerValue: string
  if (input.version === 'classic2001') {
    if (!input.dDimerCategory || !['none', 'moderate', 'strong'].includes(input.dDimerCategory)) {
      throw new Error('Выберите категорию повышения D-димера/ФДП по референсам используемого лабораторного метода.')
    }
    dDimerPoints = input.dDimerCategory === 'strong' ? 3 : input.dDimerCategory === 'moderate' ? 2 : 0
    dDimerValue = input.dDimerCategory === 'strong' ? 'Значительное повышение' : input.dDimerCategory === 'moderate' ? 'Умеренное повышение' : 'Повышения нет'
  } else {
    if (!Number.isFinite(input.dDimerMultipleOfULN) || (input.dDimerMultipleOfULN as number) < 0) {
      throw new Error('Укажите конечное неотрицательное отношение D-димера к ВГН.')
    }
    const multiple = input.dDimerMultipleOfULN as number
    dDimerPoints = multiple > 7 ? 3 : multiple > 3 ? 2 : 0
    dDimerValue = `${multiple} × ВГН`
  }

  const components: DICComponent[] = [
    { key: 'platelets', label: 'Тромбоциты', value: `${input.plateletCount} ×10⁹/л`, points: plateletPoints },
    { key: 'dDimer', label: 'D-димер / ФДП', value: dDimerValue, points: dDimerPoints },
    { key: 'pt', label: 'Удлинение протромбинового времени', value: `${input.ptProlongationSeconds} с`, points: ptPoints },
    { key: 'fibrinogen', label: 'Фибриноген', value: `${input.fibrinogenGPerL} г/л`, points: fibrinogenPoints },
  ]
  const score = components.reduce<number>((sum, component) => sum + component.points, 0)
  const overtDICCompatible = score >= 5
  const interpretation = overtDICCompatible
    ? 'Сумма ≥5 баллов: результат совместим с overt ДВС по выбранной версии критериев ISTH. Интерпретировать вместе с клинической картиной.'
    : input.version === 'classic2001'
      ? 'Сумма <5 баллов: критерии overt ДВС не достигнуты; результат может соответствовать раннему/неявному ДВС, но сам по себе этого не подтверждает.'
      : 'Сумма <5 баллов: критерии overt ДВС 2025 не достигнуты. Ранняя коагулопатия требует оценки с учётом основного заболевания и соответствующих disease-specific критериев.'

  return {
    version: input.version,
    score,
    overtDICCompatible,
    interpretation,
    repeatGuidance: overtDICCompatible
      ? 'Оценивать динамику лабораторных показателей и клинического состояния; классический ISTH score обычно повторяют ежедневно.'
      : input.version === 'classic2001'
        ? 'При сохраняющемся подозрении повторить оценку через 1–2 дня или раньше при клиническом ухудшении.'
        : 'Не исключает раннюю фазу ДВС. Рассмотреть подходящие для основного заболевания критерии ранней коагулопатии и повторять исследования по клинической динамике.',
    components,
  }
}
