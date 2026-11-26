export interface ISSInput {
  headNeck: number
  face: number
  chest: number
  abdomenPelvicContents: number
  extremitiesPelvicGirdle: number
  external: number
}

export interface ISSRegion {
  key: keyof ISSInput
  label: string
  ais: number
}

export interface ISSResult {
  score: number
  maximum: 75
  regions: ISSRegion[]
  topThree: ISSRegion[]
  hasAIS6: boolean
  interpretation: string
}

export function calculateISS(input: ISSInput): ISSResult {
  if (!input || typeof input !== 'object') throw new Error('Введите максимальный AIS-код для всех шести регионов.')
  const keys: (keyof ISSInput)[] = [
    'headNeck', 'face', 'chest', 'abdomenPelvicContents', 'extremitiesPelvicGirdle', 'external',
  ]
  const labels: Record<keyof ISSInput, string> = {
    headNeck: 'Голова и шея',
    face: 'Лицо',
    chest: 'Грудная клетка',
    abdomenPelvicContents: 'Живот и органы таза',
    extremitiesPelvicGirdle: 'Конечности и тазовый пояс',
    external: 'Наружные повреждения',
  }
  if (keys.some((key) => !Number.isInteger(input[key]) || input[key] < 0 || input[key] > 6)) {
    throw new Error('Для каждого региона укажите целый AIS-код от 0 до 6. Неизвестный код нельзя заменять нулём.')
  }

  const regions = keys.map((key) => ({ key, label: labels[key], ais: input[key] }))
  const hasAIS6 = regions.some((region) => region.ais === 6)
  const topThree = [...regions].sort((a, b) => b.ais - a.ais).slice(0, 3)
  const score = hasAIS6 ? 75 : topThree.reduce((sum, region) => sum + region.ais ** 2, 0)

  return {
    score,
    maximum: 75,
    regions,
    topThree,
    hasAIS6,
    interpretation: hasAIS6
      ? 'ISS = 75: в одном из регионов присвоен AIS 6'
      : `ISS рассчитан по трём наиболее тяжело повреждённым регионам: ${topThree.map((region) => region.ais).join(', ')}`,
  }
}
