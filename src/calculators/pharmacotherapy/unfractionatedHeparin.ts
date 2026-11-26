export type UFHIndication = 'vte' | 'acs'

export interface UFHInput {
  actualBodyWeightKg: number
  indication: UFHIndication
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
  if (input.indication !== 'vte' && input.indication !== 'acs') {
    throw new Error('Выберите показание: лечение ВТЭО или начальная терапия ОКС.')
  }

  const weight = input.actualBodyWeightKg
  if (input.indication === 'vte') {
    const calculatedBolusUnits = 80 * weight
    const calculatedInfusionUnitsPerHour = 18 * weight
    return {
      indication: 'vte',
      indicationLabel: 'Лечение острого венозного тромбоэмболического события (ТГВ/ТЭЛА)',
      weightKg: weight,
      calculatedBolusUnits,
      bolusUnits: Math.min(calculatedBolusUnits, 10000),
      bolusCapped: calculatedBolusUnits > 10000,
      calculatedInfusionUnitsPerHour,
      infusionUnitsPerHour: Math.min(calculatedInfusionUnitsPerHour, 2000),
      infusionCapped: calculatedInfusionUnitsPerHour > 2000,
      monitoring: 'Контроль анти-Xa (часто используемый целевой диапазон 0,30–0,70 МЕ/мл) либо АЧТВ по локальному лабораторному терапевтическому диапазону.',
    }
  }

  const calculatedBolusUnits = 60 * weight
  const calculatedInfusionUnitsPerHour = 12 * weight
  return {
    indication: 'acs',
    indicationLabel: 'Начальная терапия острого коронарного синдрома (ОКС)',
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
