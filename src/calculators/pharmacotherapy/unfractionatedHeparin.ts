export type UFHIndication = 'vte' | 'acs'

export interface UFHInput {
  actualBodyWeightKg: number
  indication: UFHIndication
  adultConfirmed: boolean
}

export interface UFHResult {
  indication: UFHIndication
  indicationLabel: string
  weightKg: number
  calculatedBolusUnits: number
  bolusUnits: number
  bolusCapped: boolean
  calculatedInfusionUnitsPerHour: number
  infusionUnitsPerHour: number
  infusionCapped: boolean
  monitoring: string
}

export function calculateUFHInitialDosing(input: UFHInput): UFHResult {
  if (!input || !Number.isFinite(input.actualBodyWeightKg) || input.actualBodyWeightKg < 20 || input.actualBodyWeightKg > 300) {
    throw new Error('Введите фактическую массу тела от 20 до 300 кг.')
  }
  if (input.adultConfirmed !== true) {
    throw new Error('Подтвердите, что пациент взрослый (18 лет или старше).')
  }
  if (input.indication !== 'vte' && input.indication !== 'acs') {
    throw new Error('Выберите показание: лечение ВТЭО или начальная терапия ОКС.')
  }

  const weight = input.actualBodyWeightKg
  if (input.indication === 'vte') {
    const calculatedBolusUnits = 80 * weight
    const calculatedInfusionUnitsPerHour = 18 * weight
    return {
      indication: 'vte',
      indicationLabel: 'ВТЭО — стартовая схема ASHP (80 ЕД/кг + 18 ЕД/кг/ч; suggested caps)',
      weightKg: weight,
      calculatedBolusUnits,
      bolusUnits: Math.min(calculatedBolusUnits, 10000),
      bolusCapped: calculatedBolusUnits > 10000,
      calculatedInfusionUnitsPerHour,
      infusionUnitsPerHour: Math.min(calculatedInfusionUnitsPerHour, 2000),
      infusionCapped: calculatedInfusionUnitsPerHour > 2000,
      monitoring: 'ISTH 2026: anti-Xa 0,30–0,70 ЕД/мл предлагается для большинства терапевтических показаний; anti-Xa предпочтителен, АЧТВ допустимо только с локально определённым терапевтическим диапазоном. Для данной схемы титрование не рассчитывается.',
    }
  }

  const calculatedBolusUnits = 60 * weight
  const calculatedInfusionUnitsPerHour = 12 * weight
  return {
    indication: 'acs',
    indicationLabel: 'ОКС — стартовая схема ACC/AHA 2025 (не схема ЧКВ)',
    weightKg: weight,
    calculatedBolusUnits,
    bolusUnits: Math.min(calculatedBolusUnits, 4000),
    bolusCapped: calculatedBolusUnits > 4000,
    calculatedInfusionUnitsPerHour,
    infusionUnitsPerHour: Math.min(calculatedInfusionUnitsPerHour, 1000),
    infusionCapped: calculatedInfusionUnitsPerHour > 1000,
    monitoring: 'Руководство ACC/AHA 2025 указывает начальную коррекцию по АЧТВ с целевым диапазоном 60–80 секунд; далее — по локальному протоколу.',
  }
}
