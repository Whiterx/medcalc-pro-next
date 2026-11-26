export type LabAnalyte = 'creatinine' | 'urea' | 'bun' | 'glucose' | 'bilirubin' | 'albumin' | 'crp'
export type ConversionDirection = 'si-to-conventional' | 'conventional-to-si'

export interface LabAnalyteDefinition {
  id: LabAnalyte
  label: string
  siUnit: string
  conventionalUnit: string
  siToConventionalMultiplier: number
  note?: string
}

export const LAB_ANALYTES: readonly LabAnalyteDefinition[] = [
  { id: 'creatinine', label: 'Креатинин', siUnit: 'мкмоль/л', conventionalUnit: 'мг/дл', siToConventionalMultiplier: 1 / 88.4 },
  { id: 'urea', label: 'Мочевина', siUnit: 'ммоль/л', conventionalUnit: 'мг/дл', siToConventionalMultiplier: 6.0 },
  { id: 'bun', label: 'Мочевина → BUN', siUnit: 'ммоль/л мочевины', conventionalUnit: 'мг/дл BUN', siToConventionalMultiplier: 2.8, note: 'BUN — азот мочевины, а не концентрация всей мочевины. Не путайте с предыдущей строкой.' },
  { id: 'glucose', label: 'Глюкоза', siUnit: 'ммоль/л', conventionalUnit: 'мг/дл', siToConventionalMultiplier: 18.0 },
  { id: 'bilirubin', label: 'Билирубин', siUnit: 'мкмоль/л', conventionalUnit: 'мг/дл', siToConventionalMultiplier: 1 / 17.1 },
  { id: 'albumin', label: 'Альбумин', siUnit: 'г/л', conventionalUnit: 'г/дл', siToConventionalMultiplier: 0.1 },
  { id: 'crp', label: 'С-реактивный белок (СРБ)', siUnit: 'мг/л', conventionalUnit: 'мг/дл', siToConventionalMultiplier: 0.1 },
] as const

export function parseLabValue(value: string): number | null {
  if (typeof value !== 'string' || value.trim() === '') return null
  const normalized = value.trim().replace(',', '.')
  if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) {
    throw new Error('Введите неотрицательное число.')
  }
  const parsed = Number(normalized)
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1_000_000_000) {
    throw new Error('Значение должно быть от 0 до 1 000 000 000.')
  }
  return parsed
}

export function convertLabValue(
  value: number,
  analyte: LabAnalyte,
  direction: ConversionDirection,
): number {
  if (!Number.isFinite(value) || value < 0 || value > 1_000_000_000) {
    throw new Error('Значение должно быть конечным неотрицательным числом.')
  }
  const definition = LAB_ANALYTES.find((item) => item.id === analyte)
  if (!definition) throw new Error('Неизвестный показатель.')
  const converted = direction === 'si-to-conventional'
    ? value * definition.siToConventionalMultiplier
    : value / definition.siToConventionalMultiplier
  if (!Number.isFinite(converted)) throw new Error('Результат преобразования выходит за допустимый диапазон.')
  return Math.round((converted + Number.EPSILON) * 100) / 100
}

export function formatLabValue(value: number): string {
  return String(Number(value.toFixed(2)))
}
