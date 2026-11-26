export type CockcroftGaultSex = 'male' | 'female'

export interface CockcroftGaultInput {
  age: number
  weightKg: number
  serumCreatinineUmolL: number
  sex: CockcroftGaultSex
}

export interface CockcroftGaultResult {
  creatinineClearance: number
  serumCreatinineMgDl: number
  weightKg: number
  age: number
  sex: CockcroftGaultSex
  formula: string
}

export function calculateCockcroftGault(input: CockcroftGaultInput): CockcroftGaultResult {
  if (!input || typeof input !== 'object') throw new Error('Заполните возраст, массу тела, креатинин и половой коэффициент.')
  if (!Number.isInteger(input.age) || input.age < 18 || input.age > 120) {
    throw new Error('Возраст должен быть целым числом от 18 до 120 лет.')
  }
  if (!Number.isFinite(input.weightKg) || input.weightKg < 20 || input.weightKg > 300) {
    throw new Error('Масса тела, используемая в формуле, должна быть от 20 до 300 кг.')
  }
  if (!Number.isFinite(input.serumCreatinineUmolL) || input.serumCreatinineUmolL < 10 || input.serumCreatinineUmolL > 2000) {
    throw new Error('Креатинин должен быть в диапазоне 10–2000 мкмоль/л.')
  }
  if (input.sex !== 'male' && input.sex !== 'female') {
    throw new Error('Выберите половой коэффициент формулы.')
  }

  const serumCreatinineMgDl = input.serumCreatinineUmolL / 88.4
  const femaleFactor = input.sex === 'female' ? 0.85 : 1
  const creatinineClearance = ((140 - input.age) * input.weightKg) / (72 * serumCreatinineMgDl) * femaleFactor

  if (!Number.isFinite(creatinineClearance) || creatinineClearance <= 0) {
    throw new Error('Не удалось рассчитать клиренс креатинина. Проверьте исходные значения.')
  }

  return {
    creatinineClearance,
    serumCreatinineMgDl,
    weightKg: input.weightKg,
    age: input.age,
    sex: input.sex,
    formula: `[(140 − ${input.age}) × ${input.weightKg} кг] ÷ [72 × ${serumCreatinineMgDl.toFixed(3)} мг/дл]${input.sex === 'female' ? ' × 0,85' : ''}`,
  }
}
