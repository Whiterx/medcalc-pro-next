export type PBWFormulaSex = 'male' | 'female'

export type VentilationBasicsInput = {
  heightCm: number
  formulaSex: PBWFormulaSex
  tidalVolumeMl: number | null
}

export type VentilationBasicsResult = {
  heightCm: number
  formulaSex: PBWFormulaSex
  pbwKg: number
  tidalVolume4Ml: number
  tidalVolume6Ml: number
  tidalVolume8Ml: number
  measuredTidalVolumeMl: number | null
  measuredMlKg: number | null
  measuredRange: 'below' | 'within' | 'above' | null
}

export function calculatePBW(heightCm: number, formulaSex: PBWFormulaSex): number {
  if (!Number.isFinite(heightCm) || heightCm < 120 || heightCm > 230) {
    throw new Error('Рост должен быть в диапазоне 120–230 см.')
  }
  if (formulaSex !== 'male' && formulaSex !== 'female') {
    throw new Error('Выберите вариант формулы PBW.')
  }

  // Metric form used in ATS/ARDS guidance; PBW is not actual body weight.
  return (formulaSex === 'male' ? 50 : 45.5) + 0.91 * (heightCm - 152.4)
}

export function classifyTidalVolumePerKg(value: number): 'below' | 'within' | 'above' {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error('Дыхательный объём должен быть положительным числом.')
  }
  if (value < 4) return 'below'
  if (value > 8) return 'above'
  return 'within'
}

export function calculateVentilationBasics(input: VentilationBasicsInput): VentilationBasicsResult {
  const pbwKg = calculatePBW(input.heightCm, input.formulaSex)
  if (input.tidalVolumeMl !== null &&
      (!Number.isInteger(input.tidalVolumeMl) || input.tidalVolumeMl < 50 || input.tidalVolumeMl > 2000)) {
    throw new Error('Укажите дыхательный объём целым числом от 50 до 2000 мл.')
  }

  const measuredMlKg = input.tidalVolumeMl === null ? null : input.tidalVolumeMl / pbwKg
  return {
    heightCm: input.heightCm,
    formulaSex: input.formulaSex,
    pbwKg,
    tidalVolume4Ml: Math.round(pbwKg * 4),
    tidalVolume6Ml: Math.round(pbwKg * 6),
    tidalVolume8Ml: Math.round(pbwKg * 8),
    measuredTidalVolumeMl: input.tidalVolumeMl,
    measuredMlKg,
    measuredRange: measuredMlKg === null ? null : classifyTidalVolumePerKg(measuredMlKg),
  }
}
