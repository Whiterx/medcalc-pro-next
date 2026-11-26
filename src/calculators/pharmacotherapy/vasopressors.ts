export type VasoactiveDrug = 'norepinephrine' | 'epinephrine' | 'dopamine' | 'dobutamine' | 'vasopressin'

export interface VasoactiveInput {
  drug: VasoactiveDrug
  dose: number
  weightKg?: number | null
  concentration: number
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
}

const drugLabels: Record<VasoactiveDrug, string> = {
  norepinephrine: 'Норадреналин',
  epinephrine: 'Адреналин',
  dopamine: 'Допамин',
  dobutamine: 'Добутамин',
  vasopressin: 'Вазопрессин',
}

export function calculateVasoactiveRate(input: VasoactiveInput): VasoactiveResult {
  if (!input || !Object.prototype.hasOwnProperty.call(drugLabels, input.drug)) throw new Error('Выберите препарат.')
  if (!Number.isFinite(input.dose) || input.dose <= 0 || input.dose > 1000) throw new Error('Введите положительную назначенную дозу в соответствующих единицах.')
  if (!Number.isFinite(input.concentration) || input.concentration <= 0 || input.concentration > 100000) throw new Error('Концентрация должна быть больше 0 и не выше 100 000 в указанных единицах.')

  const isVasopressin = input.drug === 'vasopressin'
  const isEpinephrine = input.drug === 'epinephrine'
  let weightKg: number | null = null
  let doseUnit: string
  let concentrationUnit: string
  let deliveredDosePerMinute: number
  let deliveredDoseUnit: string

  if (isVasopressin) {
    doseUnit = 'Ед/мин'
    concentrationUnit = 'Ед/мл'
    deliveredDosePerMinute = input.dose
    deliveredDoseUnit = 'Ед/мин'
  } else if (isEpinephrine) {
    doseUnit = 'мкг/мин'
    concentrationUnit = 'мкг/мл'
    deliveredDosePerMinute = input.dose
    deliveredDoseUnit = 'мкг/мин'
  } else {
    if (!Number.isFinite(input.weightKg) || (input.weightKg as number) <= 0 || (input.weightKg as number) > 500) {
      throw new Error('Для выбранного препарата введите массу тела больше 0 и не более 500 кг.')
    }
    weightKg = input.weightKg as number
    doseUnit = 'мкг/кг/мин'
    concentrationUnit = 'мкг/мл'
    deliveredDosePerMinute = input.dose * weightKg
    deliveredDoseUnit = 'мкг/мин'
  }

  const infusionRateMlH = (deliveredDosePerMinute * 60) / input.concentration
  if (!Number.isFinite(infusionRateMlH) || infusionRateMlH <= 0) throw new Error('Не удалось рассчитать скорость инфузии. Проверьте дозу и концентрацию.')

  return {
    drug: input.drug,
    drugLabel: drugLabels[input.drug],
    dose: input.dose,
    doseUnit,
    weightKg,
    concentration: input.concentration,
    concentrationUnit,
    infusionRateMlH,
    infusionRateMlMin: infusionRateMlH / 60,
    deliveredDosePerMinute,
    deliveredDoseUnit,
  }
}
