export interface BMIInput {
  heightCm: number
  weightKg: number
}

export type BMICategory =
  | 'underweight'
  | 'normal'
  | 'overweight'
  | 'obesity-class-1'
  | 'obesity-class-2'
  | 'obesity-class-3'

export interface BMIResult {
  value: number
  category: BMICategory
  categoryLabel: string
  lowerHealthyWeightKg: number
  upperHealthyWeightKg: number
}

export function calculateBMI(input: BMIInput): BMIResult {
  if (!Number.isFinite(input.heightCm) || input.heightCm < 100 || input.heightCm > 250) {
    throw new Error('Рост должен быть числом от 100 до 250 см.')
  }
  if (!Number.isFinite(input.weightKg) || input.weightKg < 20 || input.weightKg > 500) {
    throw new Error('Масса тела должна быть числом от 20 до 500 кг.')
  }

  const heightM = input.heightCm / 100
  const value = input.weightKg / (heightM * heightM)
  let category: BMICategory
  let categoryLabel: string

  if (value < 18.5) {
    category = 'underweight'
    categoryLabel = 'Недостаточная масса тела'
  } else if (value < 25) {
    category = 'normal'
    categoryLabel = 'Нормальная масса тела'
  } else if (value < 30) {
    category = 'overweight'
    categoryLabel = 'Избыточная масса тела'
  } else if (value < 35) {
    category = 'obesity-class-1'
    categoryLabel = 'Ожирение I степени'
  } else if (value < 40) {
    category = 'obesity-class-2'
    categoryLabel = 'Ожирение II степени'
  } else {
    category = 'obesity-class-3'
    categoryLabel = 'Ожирение III степени'
  }

  const heightSquared = heightM * heightM
  return {
    value,
    category,
    categoryLabel,
    lowerHealthyWeightKg: 18.5 * heightSquared,
    upperHealthyWeightKg: 24.9 * heightSquared,
  }
}
