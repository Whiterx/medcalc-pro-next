export type CreatinineUnit = 'µmol/L' | 'mg/dL'

export interface KDIGOAKIInput {
  creatinineBaseline?: number | null
  creatinineCurrent?: number | null
  creatinineUnit?: CreatinineUnit
  creatinineIntervalHours?: number | null
  bodyWeightKg?: number | null
  urineVolumeMl?: number | null
  urineIntervalHours?: number | null
  renalReplacementTherapyStarted: boolean
}

export interface KDIGOAKIResult {
  overallStage: 0 | 1 | 2 | 3
  creatinineStage: 0 | 1 | 2 | 3 | null
  urineOutputStage: 0 | 1 | 2 | 3 | null
  creatinineRatio: number | null
  creatinineRise: number | null
  creatinineRiseUnit: CreatinineUnit | null
  urineOutputRate: number | null
  renalReplacementTherapyStarted: boolean
  interpretation: string
  details: string[]
}

function validatePositive(value: number, label: string, max: number): void {
  if (!Number.isFinite(value) || value <= 0 || value > max) {
    throw new Error(`${label}: значение должно быть больше 0 и не выше ${max}.`)
  }
}

export function calculateKDIGOAKI(input: KDIGOAKIInput): KDIGOAKIResult {
  if (!input || typeof input !== 'object') throw new Error('Введите данные для оценки ОПП.')
  if (typeof input.renalReplacementTherapyStarted !== 'boolean') {
    throw new Error('Укажите, начата ли заместительная почечная терапия в текущем эпизоде ОПП.')
  }

  const hasBaseline = input.creatinineBaseline !== undefined && input.creatinineBaseline !== null
  const hasCurrent = input.creatinineCurrent !== undefined && input.creatinineCurrent !== null
  const hasInterval = input.creatinineIntervalHours !== undefined && input.creatinineIntervalHours !== null
  if ((hasBaseline || hasCurrent || hasInterval) && !(hasBaseline && hasCurrent && hasInterval)) {
    throw new Error('Для креатининового критерия заполните исходный и текущий креатинин, а также интервал между измерениями.')
  }

  const hasWeight = input.bodyWeightKg !== undefined && input.bodyWeightKg !== null
  const hasUrineVolume = input.urineVolumeMl !== undefined && input.urineVolumeMl !== null
  const hasUrineInterval = input.urineIntervalHours !== undefined && input.urineIntervalHours !== null
  if ((hasWeight || hasUrineVolume || hasUrineInterval) && !(hasWeight && hasUrineVolume && hasUrineInterval)) {
    throw new Error('Для критерия диуреза заполните массу тела, объём мочи и длительность периода.')
  }

  if (!hasBaseline && !hasWeight && !input.renalReplacementTherapyStarted) {
    throw new Error('Введите креатинин и/или данные диуреза либо отметьте начало ЗПТ.')
  }

  let creatinineStage: 0 | 1 | 2 | 3 | null = null
  let creatinineRatio: number | null = null
  let creatinineRise: number | null = null
  let creatinineRiseUnit: CreatinineUnit | null = null
  const details: string[] = []

  if (hasBaseline && hasCurrent && hasInterval) {
    const baseline = input.creatinineBaseline as number
    const current = input.creatinineCurrent as number
    const interval = input.creatinineIntervalHours as number
    const unit = input.creatinineUnit ?? 'µmol/L'
    if (unit !== 'µmol/L' && unit !== 'mg/dL') throw new Error('Неизвестная единица измерения креатинина.')
    validatePositive(baseline, 'Исходный креатинин', unit === 'mg/dL' ? 30 : 2652)
    validatePositive(current, 'Текущий креатинин', unit === 'mg/dL' ? 30 : 2652)
    if (!Number.isFinite(interval) || interval < 1 || interval > 168) {
      throw new Error('Интервал между измерениями креатинина должен быть от 1 до 168 часов (7 суток).')
    }

    creatinineRatio = current / baseline
    creatinineRise = current - baseline
    creatinineRiseUnit = unit
    const absoluteRiseCriterion = interval <= 48 && (unit === 'mg/dL' ? creatinineRise >= 0.3 : creatinineRise >= 26.5)
    const reachedStage3Threshold = interval <= 168 && (
      unit === 'mg/dL'
        ? baseline < 4 && current >= 4
        : baseline < 353.6 && current >= 353.6
    )

    if (creatinineRatio >= 3 || reachedStage3Threshold) creatinineStage = 3
    else if (creatinineRatio >= 2) creatinineStage = 2
    else if (creatinineRatio >= 1.5 || absoluteRiseCriterion) creatinineStage = 1
    else creatinineStage = 0

    details.push(
      `Креатинин: ${baseline} → ${current} ${unit}; ×${creatinineRatio.toFixed(2)} от исходного; прирост ${creatinineRise.toFixed(2)} ${unit}; интервал ${interval} ч — стадия ${creatinineStage} по критерию креатинина.`
    )
  }

  let urineOutputStage: 0 | 1 | 2 | 3 | null = null
  let urineOutputRate: number | null = null
  if (hasWeight && hasUrineVolume && hasUrineInterval) {
    const weight = input.bodyWeightKg as number
    const volume = input.urineVolumeMl as number
    const duration = input.urineIntervalHours as number
    validatePositive(weight, 'Масса тела', 500)
    if (!Number.isFinite(volume) || volume < 0 || volume > 50000) {
      throw new Error('Объём мочи должен быть от 0 до 50 000 мл.')
    }
    if (!Number.isFinite(duration) || duration < 1 || duration > 168) {
      throw new Error('Длительность периода диуреза должна быть от 1 до 168 часов.')
    }
    urineOutputRate = volume / (weight * duration)
    if (volume === 0 && duration >= 12) urineOutputStage = 3
    else if (duration >= 24 && urineOutputRate < 0.3) urineOutputStage = 3
    else if (duration >= 12 && urineOutputRate < 0.5) urineOutputStage = 2
    else if (duration >= 6 && duration < 12 && urineOutputRate < 0.5) urineOutputStage = 1
    else urineOutputStage = 0

    details.push(
      `Диурез: ${volume} мл за ${duration} ч при массе ${weight} кг = ${urineOutputRate.toFixed(3)} мл/кг/ч; стадия ${urineOutputStage} по критерию диуреза.`
    )
  }

  if (input.renalReplacementTherapyStarted) details.push('Начата заместительная почечная терапия в текущем эпизоде ОПП — критерий стадии 3.')

  const stages = [creatinineStage, urineOutputStage, input.renalReplacementTherapyStarted ? 3 : null]
    .filter((stage): stage is 0 | 1 | 2 | 3 => stage !== null)
  const overallStage = Math.max(0, ...stages) as 0 | 1 | 2 | 3
  const interpretation = overallStage === 0
    ? 'Критерии ОПП по введённым данным не выявлены'
    : `Острое повреждение почек — стадия ${overallStage} по KDIGO`

  return {
    overallStage,
    creatinineStage,
    urineOutputStage,
    creatinineRatio,
    creatinineRise,
    creatinineRiseUnit,
    urineOutputRate,
    renalReplacementTherapyStarted: input.renalReplacementTherapyStarted,
    interpretation,
    details,
  }
}
