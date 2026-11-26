export interface BODEInput {
  fev1Percent: number
  sixMinuteWalkMeters: number
  mmrc: number
  bmi: number
}

export interface BODEComponent {
  key: 'fev1' | 'walk' | 'mmrc' | 'bmi'
  label: string
  value: number
  points: number
  explanation: string
}

export interface BODEResult {
  score: number
  components: BODEComponent[]
  quartile: 1 | 2 | 3 | 4
  quartileLabel: string
}

export function calculateBODE(input: BODEInput): BODEResult {
  const { fev1Percent, sixMinuteWalkMeters, mmrc, bmi } = input
  if (!Number.isFinite(fev1Percent) || !Number.isInteger(fev1Percent) || fev1Percent <= 0 || fev1Percent > 200) {
    throw new Error('ОФВ₁ должен быть целым числом от 1 до 200% от должного.')
  }
  if (!Number.isFinite(sixMinuteWalkMeters) || !Number.isInteger(sixMinuteWalkMeters) || sixMinuteWalkMeters < 0 || sixMinuteWalkMeters > 1000) {
    throw new Error('Дистанция 6-минутной ходьбы должна быть целым числом от 0 до 1000 м.')
  }
  if (!Number.isFinite(mmrc) || !Number.isInteger(mmrc) || mmrc < 0 || mmrc > 4) {
    throw new Error('Оценка mMRC должна быть целым числом от 0 до 4.')
  }
  if (!Number.isFinite(bmi) || bmi < 5 || bmi > 100) {
    throw new Error('ИМТ должен находиться в диапазоне 5–100 кг/м².')
  }

  const fev1Points = fev1Percent >= 65 ? 0 : fev1Percent >= 50 ? 1 : fev1Percent >= 36 ? 2 : 3
  const walkPoints = sixMinuteWalkMeters >= 350 ? 0 : sixMinuteWalkMeters >= 250 ? 1 : sixMinuteWalkMeters >= 150 ? 2 : 3
  const mmrcPoints = mmrc <= 1 ? 0 : mmrc === 2 ? 1 : mmrc === 3 ? 2 : 3
  const bmiPoints = bmi > 21 ? 0 : 1

  const components: BODEComponent[] = [
    { key: 'fev1', label: 'ОФВ₁ (% от должного)', value: fev1Percent, points: fev1Points, explanation: fev1Points === 0 ? '≥65%' : fev1Points === 1 ? '50–64%' : fev1Points === 2 ? '36–49%' : '≤35%' },
    { key: 'walk', label: 'Дистанция 6-минутной ходьбы', value: sixMinuteWalkMeters, points: walkPoints, explanation: walkPoints === 0 ? '≥350 м' : walkPoints === 1 ? '250–349 м' : walkPoints === 2 ? '150–249 м' : '≤149 м' },
    { key: 'mmrc', label: 'Одышка mMRC', value: mmrc, points: mmrcPoints, explanation: mmrcPoints === 0 ? '0–1' : String(mmrc) },
    { key: 'bmi', label: 'Индекс массы тела', value: bmi, points: bmiPoints, explanation: bmiPoints === 0 ? '>21 кг/м²' : '≤21 кг/м²' },
  ]
  const score = components.reduce((sum, component) => sum + component.points, 0)
  const quartile: BODEResult['quartile'] = score <= 2 ? 1 : score <= 4 ? 2 : score <= 6 ? 3 : 4
  return {
    score,
    components,
    quartile,
    quartileLabel: `Квартиль ${quartile} (диапазон ${quartile === 1 ? '0–2' : quartile === 2 ? '3–4' : quartile === 3 ? '5–6' : '7–10'} балла)`,
  }
}
