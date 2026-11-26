export type VasoactiveDrug = 'norepinephrine' | 'epinephrine' | 'dopamine' | 'dobutamine' | 'vasopressin'

export interface VasoactiveInput {
  drug: VasoactiveDrug
  dose: number
  weightKg?: number | null
  drugAmount: number
  finalVolumeMl: number
}

export interface VasoactiveResult {
  drug: VasoactiveDrug
  drugLabel: string
  dose: number
  doseUnit: string
  weightKg: number | null
  concentration: number
  concentrationUnit: string
  infusionRateMlH: number
  infusionRateMlMin: number
  deliveredDosePerMinute: number
  deliveredDoseUnit: string
  highInfusionRateWarning: boolean
}

const drugLabels: Record<VasoactiveDrug, string> = {
  norepinephrine: 'Норадреналин',
  epinephrine: 'Адреналин',
  dopamine: 'Допамин',
  dobutamine: 'Добутамин',
  vasopressin: 'Вазопрессин',
}

export function calculateVasoactiveRate(input: VasoactiveInput): VasoactiveResult {
  if (!input || !Object.prototype.hasOwnProperty.call(drugLabels, input.drug)) {
    throw new Error('Выберите препарат.')
  }
  if (!Number.isFinite(input.dose) || input.dose <= 0 || input.dose > 1000) {
    throw new Error('Введите положительную дозу не более 1000 в соответствующих единицах.')
  }
  if (!Number.isFinite(input.drugAmount) || input.drugAmount <= 0 || input.drugAmount > 100000) {
    throw new Error('Количество препарата в растворе должно быть больше 0 и не выше 100 000.')
  }
  if (!Number.isFinite(input.finalVolumeMl) || input.finalVolumeMl <= 0 || input.finalVolumeMl > 1000) {
    throw new Error('Конечный объём раствора должен быть больше 0 и не выше 1000 мл.')
  }

  const isVasopressin = input.drug === 'vasopressin'
  let weightKg: number | null = null
  let concentration: number
  let concentrationUnit: string
  let infusionRateMlH: number
  let deliveredDosePerMinute: number
  let deliveredDoseUnit: string
  const doseUnit = isVasopressin ? 'Ед/мин' : 'мкг/кг/мин'

  if (isVasopressin) {
    concentration = input.drugAmount / input.finalVolumeMl
    concentrationUnit = 'Ед/мл'
    infusionRateMlH = (input.dose * 60) / concentration
    deliveredDosePerMinute = input.dose
    deliveredDoseUnit = 'Ед/мин'
  } else {
    if (!Number.isFinite(input.weightKg) || (input.weightKg as number) <= 0 || (input.weightKg as number) > 500) {
      throw new Error('Для выбранного препарата введите массу тела от 0 до 500 кг.')
    }
    weightKg = input.weightKg as number
    concentration = (input.drugAmount * 1000) / input.finalVolumeMl
    concentrationUnit = 'мкг/мл'
    deliveredDosePerMinute = input.dose * weightKg
    deliveredDoseUnit = 'мкг/мин'
    infusionRateMlH = (deliveredDosePerMinute * 60) / concentration
  }

  if (!Number.isFinite(infusionRateMlH) || infusionRateMlH <= 0) {
    throw new Error('Не удалось рассчитать скорость инфузии. Проверьте дозу и концентрацию.')
  }

  return {
    drug: input.drug,
    drugLabel: drugLabels[input.drug],
    dose: input.dose,
    doseUnit,
    weightKg,
    concentration,
    concentrationUnit,
    infusionRateMlH,
    infusionRateMlMin: infusionRateMlH / 60,
    deliveredDosePerMinute,
    deliveredDoseUnit,
    highInfusionRateWarning: infusionRateMlH > 99,
  }
}
