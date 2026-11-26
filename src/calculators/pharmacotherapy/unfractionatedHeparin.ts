export type UFHIndication = 'vte' | 'acs'

export interface UFHInput {
  bodyWeightKg: number
  indication: UFHIndication
  adultConfirmed: boolean
}

export interface UFHResult {
  indication: UFHIndication
  indicationLabel: string
  weightKg: number
  bolusMinUnits: number
  bolusMaxUnits: number
  infusionMinUnitsPerHour: number
  infusionMaxUnitsPerHour: number
  bolusCapApplied: boolean
  infusionCapApplied: boolean
  monitoring: string
}

export function calculateUFHInitialDosing(input: UFHInput): UFHResult {
  if (!input || !Number.isFinite(input.bodyWeightKg) || input.bodyWeightKg < 20 || input.bodyWeightKg > 300) {
    throw new Error('Введите массу тела от 20 до 300 кг.')
  }
  if (input.adultConfirmed !== true) {
    throw new Error('Подтвердите, что пациент взрослый (18 лет или старше).')
  }
  if (input.indication !== 'vte' && input.indication !== 'acs') {
    throw new Error('Выберите клинический сценарий.')
  }

  const weight = input.bodyWeightKg

  if (input.indication === 'vte') {
    return {
      indication: 'vte',
      indicationLabel: 'ТГВ — внутривенный НФГ по КР Минздрава РФ 960_1 (80 ЕД/кг + 18 ЕД/кг/ч)',
      weightKg: weight,
      bolusMinUnits: 80 * weight,
      bolusMaxUnits: 80 * weight,
      infusionMinUnitsPerHour: 18 * weight,
      infusionMaxUnitsPerHour: 18 * weight,
      bolusCapApplied: false,
      infusionCapApplied: false,
      monitoring: 'КР Минздрава РФ 960_1: таблица 10 задаёт целевой диапазон АЧТВ 1,5–2,3 от контрольной величины; текст раздела 3.2.5.1 описывает его как превышение верхней границы нормы конкретной лаборатории в 1,5–2,3 раза. Следует использовать локальную контрольную величину лаборатории, не универсальное значение в секундах. По таблице 10 коррекция скорости и повторный контроль АЧТВ выполняются через 6 ч; при необходимости предусмотрены дополнительные болюсы и временная остановка инфузии. Контроль тромбоцитов — до начала терапии и на 1, 3, 5, 7, 9, 11–14-й дни. Титрование этим калькулятором не рассчитывается.',
    }
  }

  const rawBolusMin = 60 * weight
  const rawBolusMax = 70 * weight
  const rawInfusionMin = 12 * weight
  const rawInfusionMax = 15 * weight

  return {
    indication: 'acs',
    indicationLabel: 'ОКС без подъёма ST — КР Минздрава РФ 154_4 (60–70 ЕД/кг + 12–15 ЕД/кг/ч)',
    weightKg: weight,
    bolusMinUnits: Math.min(rawBolusMin, 5000),
    bolusMaxUnits: Math.min(rawBolusMax, 5000),
    infusionMinUnitsPerHour: Math.min(rawInfusionMin, 1000),
    infusionMaxUnitsPerHour: Math.min(rawInfusionMax, 1000),
    bolusCapApplied: rawBolusMax > 5000 + 1e-9,
    infusionCapApplied: rawInfusionMax > 1000 + 1e-9,
    monitoring: 'КР Минздрава РФ 154_4: последующий подбор дозы — для достижения АЧТВ в 1,5–2,5 раза выше контрольной величины для конкретной лаборатории. Титрование этим калькулятором не рассчитывается. При ЧКВ используется отдельное процедурное дозирование НФГ с контролем АВС; этот расчёт не предназначен для ЧКВ.',
  }
}
