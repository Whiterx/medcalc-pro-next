export type EGFRSex = 'female' | 'male'
export type EGFRCategory = 'G1' | 'G2' | 'G3a' | 'G3b' | 'G4' | 'G5'

export interface EGFRInput {
  ageYears: number
  sex: EGFRSex
  creatinineUmolL: number
}

export interface EGFRResult {
  value: number
  creatinineMgDl: number
  category: EGFRCategory
  categoryLabel: string
}

export function calculateEGFR2021(input: EGFRInput): EGFRResult {
  if (!Number.isInteger(input.ageYears) || input.ageYears < 18 || input.ageYears > 120) {
    throw new Error('Возраст должен быть целым числом от 18 до 120 лет.')
  }
  if (input.sex !== 'female' && input.sex !== 'male') {
    throw new Error('Выберите пол для расчёта по формуле CKD-EPI 2021.')
  }
  if (!Number.isFinite(input.creatinineUmolL) || input.creatinineUmolL < 10 || input.creatinineUmolL > 2000) {
    throw new Error('Креатинин должен быть числом от 10 до 2000 мкмоль/л.')
  }

  const creatinineMgDl = input.creatinineUmolL / 88.4
  const kappa = input.sex === 'female' ? 0.7 : 0.9
  const alpha = input.sex === 'female' ? -0.241 : -0.302
  const sexFactor = input.sex === 'female' ? 1.012 : 1
  const ratio = creatinineMgDl / kappa

  const value =
    142 *
    Math.pow(Math.min(ratio, 1), alpha) *
    Math.pow(Math.max(ratio, 1), -1.2) *
    Math.pow(0.9938, input.ageYears) *
    sexFactor

  let category: EGFRCategory
  let categoryLabel: string

  if (value >= 90) {
    category = 'G1'
    categoryLabel = 'G1 — нормальная или высокая расчётная СКФ'
  } else if (value >= 60) {
    category = 'G2'
    categoryLabel = 'G2 — незначительно сниженная расчётная СКФ'
  } else if (value >= 45) {
    category = 'G3a'
    categoryLabel = 'G3a — умеренно сниженная расчётная СКФ'
  } else if (value >= 30) {
    category = 'G3b'
    categoryLabel = 'G3b — умеренно и значительно сниженная расчётная СКФ'
  } else if (value >= 15) {
    category = 'G4'
    categoryLabel = 'G4 — резко сниженная расчётная СКФ'
  } else {
    category = 'G5'
    categoryLabel = 'G5 — почечная недостаточность по категории СКФ'
  }

  return { value, creatinineMgDl, category, categoryLabel }
}
