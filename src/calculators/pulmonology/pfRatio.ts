export interface PFRatioInput {
  pao2: number
  fio2: number
}
export type PFRatioCategory = 'expected' | 'reduced' | 'mild' | 'moderate' | 'severe'
export interface PFRatioResult {
  ratio: number
  category: PFRatioCategory
  categoryLabel: string
  interpretation: string
}
export function calculatePFRatio(input: PFRatioInput): PFRatioResult {
  if (!input || typeof input !== 'object') throw new Error('Введите PaO₂ и FiO₂.')
  if (!Number.isFinite(input.pao2) || input.pao2 < 1) throw new Error('PaO₂ должно быть конечным положительным числом не менее 1 мм рт. ст.')
  if (!Number.isFinite(input.fio2) || input.fio2 < 0.21 || input.fio2 > 1) throw new Error('FiO₂ должна быть в диапазоне 0,21–1,00.')
  const ratio = input.pao2 / input.fio2
  if (!Number.isFinite(ratio)) throw new Error('Не удалось рассчитать отношение PaO₂/FiO₂. Проверьте введённые значения.')
  if (ratio >= 400) return {
    ratio, category: 'expected', categoryLabel: '≥400 — без выраженного снижения',
    interpretation: 'Отношение PaO₂/FiO₂ находится в диапазоне ≥400 мм рт. ст.; это не исключает клинически значимую патологию.',
  }
  if (ratio > 300) return {
    ratio, category: 'reduced', categoryLabel: '>300 и <400 — сниженное отношение',
    interpretation: 'Отношение снижено относительно диапазона ≥400, но не входит в категории оксигенации ОРДС по Berlin.',
  }
  if (ratio > 200) return {
    ratio, category: 'mild', categoryLabel: '>200–300 — диапазон лёгкой степени по Berlin',
    interpretation: 'Диапазон оксигенации лёгкой степени по Berlin. Для классификации ОРДС необходимы все остальные диагностические критерии и PEEP/CPAP ≥5 см вод. ст.',
  }
  if (ratio > 100) return {
    ratio, category: 'moderate', categoryLabel: '>100–200 — диапазон умеренной степени по Berlin',
    interpretation: 'Диапазон оксигенации умеренной степени по Berlin. Для классификации ОРДС необходимы все остальные диагностические критерии и PEEP ≥5 см вод. ст.',
  }
  return {
    ratio, category: 'severe', categoryLabel: '≤100 — диапазон тяжёлой степени по Berlin',
    interpretation: ratio === 100
      ? 'По Berlin значение 100 мм рт. ст. включено в тяжёлую степень (≤100). В основной таблице глобального определения ОРДС в российских рекомендациях ФАР 2025 для тяжёлой степени указано строго <100, тогда как в приложении с критериями Berlin — ≤100. На точной границе 100 имеется расхождение формулировок источника.'
      : 'Диапазон оксигенации тяжёлой степени по Berlin. Для классификации ОРДС необходимы все остальные диагностические критерии и PEEP ≥5 см вод. ст.',
  }
}