export type GBSHemoglobinSex = 'male' | 'female'

export interface GlasgowBlatchfordInput {
  ureaMmolL: number
  hemoglobinGL: number
  hemoglobinSex: GBSHemoglobinSex
  systolicBP: number
  pulseBpm: number
  melena: boolean
  syncope: boolean
  hepaticDisease: boolean
  heartFailure: boolean
}

export interface GBSComponent {
  key: keyof GlasgowBlatchfordInput
  label: string
  value: string
  points: number
  interpretation: string
}

export interface GlasgowBlatchfordResult {
  score: number
  maxScore: 23
  lowRisk: boolean
  interpretation: string
  components: GBSComponent[]
}

export function calculateGlasgowBlatchford(input: GlasgowBlatchfordInput): GlasgowBlatchfordResult {
  if (!input || typeof input !== 'object') throw new Error('Заполните все лабораторные и клинические параметры.')
  if (!Number.isFinite(input.ureaMmolL) || input.ureaMmolL <= 0 || input.ureaMmolL > 200) {
    throw new Error('Мочевина должна быть больше 0 и не превышать 200 ммоль/л.')
  }
  if (!Number.isFinite(input.hemoglobinGL) || input.hemoglobinGL <= 0 || input.hemoglobinGL > 300) {
    throw new Error('Гемоглобин должен быть больше 0 и не превышать 300 г/л.')
  }
  if (input.hemoglobinSex !== 'male' && input.hemoglobinSex !== 'female') {
    throw new Error('Выберите пол для применения порогов гемоглобина.')
  }
  if (!Number.isInteger(input.systolicBP) || input.systolicBP < 40 || input.systolicBP > 300) {
    throw new Error('Систолическое АД должно быть целым числом от 40 до 300 мм рт. ст.')
  }
  if (!Number.isInteger(input.pulseBpm) || input.pulseBpm < 20 || input.pulseBpm > 300) {
    throw new Error('ЧСС должна быть целым числом от 20 до 300 в минуту.')
  }
  const flags: (keyof GlasgowBlatchfordInput)[] = ['melena', 'syncope', 'hepaticDisease', 'heartFailure']
  if (flags.some((key) => typeof input[key] !== 'boolean')) {
    throw new Error('Проверьте клинические признаки: каждый должен иметь значение да или нет.')
  }

  let ureaPoints = 0
  if (input.ureaMmolL >= 25) ureaPoints = 6
  else if (input.ureaMmolL >= 10) ureaPoints = 4
  else if (input.ureaMmolL >= 8) ureaPoints = 3
  else if (input.ureaMmolL >= 6.5) ureaPoints = 2

  let hemoglobinPoints = 0
  if (input.hemoglobinGL < 100) hemoglobinPoints = 6
  else if (input.hemoglobinSex === 'male') {
    if (input.hemoglobinGL < 120) hemoglobinPoints = 3
    else if (input.hemoglobinGL < 130) hemoglobinPoints = 1
  } else if (input.hemoglobinGL < 120) {
    hemoglobinPoints = 1
  }

  let systolicPoints = 0
  if (input.systolicBP < 90) systolicPoints = 3
  else if (input.systolicBP < 100) systolicPoints = 2
  else if (input.systolicBP < 110) systolicPoints = 1

  const components: GBSComponent[] = [
    { key: 'ureaMmolL', label: 'Мочевина', value: `${input.ureaMmolL} ммоль/л`, points: ureaPoints, interpretation: '<6,5 = 0; 6,5–<8 = 2; 8–<10 = 3; 10–<25 = 4; ≥25 = 6.' },
    { key: 'hemoglobinGL', label: 'Гемоглобин', value: `${input.hemoglobinGL} г/л (${input.hemoglobinSex === 'male' ? 'мужские' : 'женские'} пороги)`, points: hemoglobinPoints, interpretation: input.hemoglobinSex === 'male' ? '≥130 = 0; 120–<130 = 1; 100–<120 = 3; <100 = 6.' : '≥120 = 0; 100–<120 = 1; <100 = 6.' },
    { key: 'systolicBP', label: 'Систолическое АД', value: `${input.systolicBP} мм рт. ст.`, points: systolicPoints, interpretation: '≥110 = 0; 100–109 = 1; 90–99 = 2; <90 = 3.' },
    { key: 'pulseBpm', label: 'Частота пульса', value: `${input.pulseBpm}/мин`, points: input.pulseBpm >= 100 ? 1 : 0, interpretation: '≥100/мин = 1 балл.' },
    { key: 'melena', label: 'Мелена', value: input.melena ? 'Да' : 'Нет', points: input.melena ? 1 : 0, interpretation: 'Наличие мелены = 1 балл.' },
    { key: 'syncope', label: 'Синкопе при поступлении', value: input.syncope ? 'Да' : 'Нет', points: input.syncope ? 2 : 0, interpretation: 'Синкопе = 2 балла.' },
    { key: 'hepaticDisease', label: 'Заболевание печени', value: input.hepaticDisease ? 'Да' : 'Нет', points: input.hepaticDisease ? 2 : 0, interpretation: 'Заболевание печени = 2 балла.' },
    { key: 'heartFailure', label: 'Сердечная недостаточность', value: input.heartFailure ? 'Да' : 'Нет', points: input.heartFailure ? 2 : 0, interpretation: 'Сердечная недостаточность = 2 балла.' },
  ]
  const score = components.reduce((sum, item) => sum + item.points, 0)
  const lowRisk = score <= 1
  return {
    score,
    maxScore: 23,
    lowRisk,
    interpretation: lowRisk
      ? 'Очень низкий риск по GBS (0–1 балл)'
      : 'Выше порога очень низкого риска (≥2 баллов)',
    components,
  }
}
