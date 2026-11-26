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
  const ratio = input.pao2 / input.fio2

  if (ratio >= 400) {
    return {
      ratio,
      category: 'expected',
      categoryLabel: '≥400 — без выраженного снижения',
      interpretation: 'Отношение PaO₂/FiO₂ находится в диапазоне ≥400 мм рт. ст.',
    }
  }

  if (ratio > 300) {
    return {
      ratio,
      category: 'reduced',
      categoryLabel: '301–399 — сниженное отношение',
      interpretation: 'Отношение снижено относительно диапазона ≥400, но само по себе не соответствует диапазонам оксигенации, используемым для классификации ОРДС.',
    }
  }

  if (ratio > 200) {
    return {
      ratio,
      category: 'mild',
      categoryLabel: '201–300 — диапазон лёгкой степени',
      interpretation: 'Диапазон оксигенации, соответствующий лёгкой степени по Berlin, только если выполнены остальные диагностические критерии ОРДС и PEEP/CPAP ≥5 см вод. ст.',
    }
  }

  if (ratio > 100) {
    return {
      ratio,
      category: 'moderate',
      categoryLabel: '101–200 — диапазон умеренной степени',
      interpretation: 'Диапазон оксигенации, соответствующий умеренной степени по Berlin, только если выполнены остальные диагностические критерии ОРДС и PEEP ≥5 см вод. ст.',
    }
  }

  return {
    ratio,
    category: 'severe',
    categoryLabel: '≤100 — диапазон тяжёлой степени',
    interpretation: 'Диапазон оксигенации, соответствующий тяжёлой степени по Berlin, только если выполнены остальные диагностические критерии ОРДС и PEEP ≥5 см вод. ст.',
  }
}
