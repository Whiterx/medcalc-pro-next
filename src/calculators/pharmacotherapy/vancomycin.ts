export interface VancomycinInput {
  actualBodyWeightKg: number
}

export interface VancomycinResult {
  weightKg: number
  loadingDoseMinMg: number
  loadingDoseMaxMg: number
  loadingDoseCapped: boolean
  maintenanceDoseMinMg: number
  maintenanceDoseMaxMg: number
  maintenanceDoseScope: string
  aucTarget: string
}

export function calculateVancomycinInitialDose(input: VancomycinInput): VancomycinResult {
  if (!input || !Number.isFinite(input.actualBodyWeightKg) || input.actualBodyWeightKg < 20 || input.actualBodyWeightKg > 300) {
    throw new Error('Введите фактическую массу тела взрослого пациента от 20 до 300 кг.')
  }
  const weight = input.actualBodyWeightKg
  const uncappedLoadingMin = weight * 20
  const uncappedLoadingMax = weight * 25
  const loadingDoseMinMg = Math.min(3000, uncappedLoadingMin)
  const loadingDoseMaxMg = Math.min(3000, uncappedLoadingMax)
  return {
    weightKg: weight,
    loadingDoseMinMg,
    loadingDoseMaxMg,
    loadingDoseCapped: uncappedLoadingMax > 3000,
    maintenanceDoseMinMg: weight * 15,
    maintenanceDoseMaxMg: weight * 20,
    maintenanceDoseScope: 'Только ориентировочный диапазон на одно введение при нормальной функции почек; интервал и последующие дозы здесь не рассчитываются.',
    aucTarget: 'AUC24/MIC 400–600 мг·ч/л при MIC 1 мг/л для серьёзных MRSA-инфекций.',
  }
}
