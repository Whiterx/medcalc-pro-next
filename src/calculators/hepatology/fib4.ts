export interface FIB4Input {
  ageYears: number
  astUL: number
  altUL: number
  platelets10e9L: number
}

export type FIB4Category = 'low' | 'intermediate' | 'high' | 'limited-accuracy'

export interface FIB4Result {
  value: number
  category: FIB4Category
  categoryLabel: string
  lowerRiskCutoff: number
  upperRiskCutoff: number
}

export function classifyFIB4(value: number, ageYears: number): Pick<FIB4Result, 'category' | 'categoryLabel' | 'lowerRiskCutoff' | 'upperRiskCutoff'> {
  if (!Number.isFinite(value) || value < 0) throw new Error('Значение FIB-4 должно быть неотрицательным числом.')
  if (!Number.isInteger(ageYears) || ageYears < 18 || ageYears > 120) {
    throw new Error('Возраст должен быть целым числом от 18 до 120 лет.')
  }

  const lowerRiskCutoff = ageYears >= 65 ? 2.0 : 1.3
  const upperRiskCutoff = 2.67

  if (ageYears < 35) {
    return {
      category: 'limited-accuracy',
      categoryLabel: 'Низкая точность FIB-4 в возрасте младше 35 лет',
      lowerRiskCutoff,
      upperRiskCutoff,
    }
  }
  if (value < lowerRiskCutoff) {
    return { category: 'low', categoryLabel: 'Низкая вероятность выраженного фиброза F3–F4', lowerRiskCutoff, upperRiskCutoff }
  }
  if (value <= upperRiskCutoff) {
    return { category: 'intermediate', categoryLabel: 'Промежуточный результат — требуется дальнейшая оценка', lowerRiskCutoff, upperRiskCutoff }
  }
  return { category: 'high', categoryLabel: 'Высокий риск выраженного фиброза F3–F4', lowerRiskCutoff, upperRiskCutoff }
}

export function calculateFIB4(input: FIB4Input): FIB4Result {
  if (!Number.isInteger(input.ageYears) || input.ageYears < 18 || input.ageYears > 120) {
    throw new Error('Возраст должен быть целым числом от 18 до 120 лет.')
  }
  if (!Number.isFinite(input.astUL) || input.astUL <= 0 || input.astUL > 1000) {
    throw new Error('АСТ должна быть больше 0 и не превышать 1000 Ед/л.')
  }
  if (!Number.isFinite(input.altUL) || input.altUL <= 0 || input.altUL > 1000) {
    throw new Error('АЛТ должна быть больше 0 и не превышать 1000 Ед/л.')
  }
  if (!Number.isFinite(input.platelets10e9L) || input.platelets10e9L <= 0 || input.platelets10e9L > 2000) {
    throw new Error('Количество тромбоцитов должно быть больше 0 и не превышать 2000 ×10⁹/л.')
  }

  const value = (input.ageYears * input.astUL) / (input.platelets10e9L * Math.sqrt(input.altUL))
  const classification = classifyFIB4(value, input.ageYears)
  return { value, ...classification }
}
