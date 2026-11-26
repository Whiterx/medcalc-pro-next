export type PSISex = 'male' | 'female'
export type PSIClass = 'I' | 'II' | 'III' | 'IV' | 'V'

export interface PSIInput {
  age: number
  sex?: PSISex
  respiratoryRate: number
  systolicBP: number
  heartRate: number
  temperatureC: number
  nursingHome: boolean
  neoplasticDisease: boolean
  liverDisease: boolean
  heartFailure: boolean
  cerebrovascularDisease: boolean
  renalDisease: boolean
  alteredMentalStatus: boolean
  bunUreaMmol?: number
  sodiumMmol?: number
  glucoseMmol?: number
  hematocritPercent?: number
  arterialPH?: number
  hypoxemia: boolean
  pleuralEffusion: boolean
}

export interface PSIComponent {
  key: string
  label: string
  points: number
  detail: string
}

export interface PSIResult {
  riskClass: PSIClass
  score: number | null
  classLabel: string
  mortalityEstimate: string
  suggestedSetting: string
  stepOneTriggers: string[]
  components: PSIComponent[]
}

function validateStepOne(input: PSIInput): void {
  if (!Number.isInteger(input.age) || input.age < 18 || input.age > 120) throw new Error('Возраст должен быть целым числом от 18 до 120 лет. PSI предназначен для взрослых.')
  if (!Number.isInteger(input.respiratoryRate) || input.respiratoryRate < 1 || input.respiratoryRate > 100) throw new Error('ЧДД должна быть целым числом от 1 до 100 в минуту.')
  if (!Number.isInteger(input.systolicBP) || input.systolicBP < 1 || input.systolicBP > 300) throw new Error('Систолическое АД должно быть целым числом от 1 до 300 мм рт. ст.')
  if (!Number.isInteger(input.heartRate) || input.heartRate < 1 || input.heartRate > 300) throw new Error('ЧСС должна быть целым числом от 1 до 300 в минуту.')
  if (!Number.isFinite(input.temperatureC) || input.temperatureC < 25 || input.temperatureC > 45) throw new Error('Температура должна быть в диапазоне 25–45 °C.')
}

function validateStepTwo(input: PSIInput): asserts input is PSIInput & { sex: PSISex; bunUreaMmol: number; sodiumMmol: number; glucoseMmol: number; hematocritPercent: number; arterialPH: number } {
  if (input.sex !== 'male' && input.sex !== 'female') throw new Error('Выберите пол для расчёта балла PSI.')
  if (!Number.isFinite(input.bunUreaMmol) || input.bunUreaMmol! < 0 || input.bunUreaMmol! > 100) throw new Error('Мочевина должна быть в диапазоне 0–100 ммоль/л.')
  if (!Number.isFinite(input.sodiumMmol) || input.sodiumMmol! < 80 || input.sodiumMmol! > 200) throw new Error('Натрий должен быть в диапазоне 80–200 ммоль/л.')
  if (!Number.isFinite(input.glucoseMmol) || input.glucoseMmol! < 0 || input.glucoseMmol! > 100) throw new Error('Глюкоза должна быть в диапазоне 0–100 ммоль/л.')
  if (!Number.isFinite(input.hematocritPercent) || input.hematocritPercent! < 0 || input.hematocritPercent! > 80) throw new Error('Гематокрит должен быть в диапазоне 0–80%.')
  if (!Number.isFinite(input.arterialPH) || input.arterialPH! < 6.8 || input.arterialPH! > 7.8) throw new Error('Артериальный pH должен быть в диапазоне 6,80–7,80.')
}

export function calculatePSI(input: PSIInput): PSIResult {
  validateStepOne(input)

  const triggers: string[] = []
  if (input.age > 50) triggers.push('Возраст >50 лет')
  if (input.neoplasticDisease) triggers.push('Онкологическое заболевание')
  if (input.liverDisease) triggers.push('Заболевание печени')
  if (input.heartFailure) triggers.push('Хроническая сердечная недостаточность')
  if (input.cerebrovascularDisease) triggers.push('Цереброваскулярное заболевание')
  if (input.renalDisease) triggers.push('Заболевание почек')
  if (input.alteredMentalStatus) triggers.push('Нарушение сознания')
  if (input.respiratoryRate >= 30) triggers.push('ЧДД ≥30/мин')
  if (input.systolicBP < 90) triggers.push('Систолическое АД <90 мм рт. ст.')
  if (input.temperatureC < 35 || input.temperatureC >= 40) triggers.push('Температура <35 или ≥40 °C')
  if (input.heartRate >= 125) triggers.push('ЧСС ≥125/мин')

  if (triggers.length === 0) {
    return {
      riskClass: 'I',
      score: null,
      classLabel: 'Класс I — очень низкий риск',
      mortalityEstimate: 'В исходной валидационной когорте риск смерти был около 0,1–0,4%.',
      suggestedSetting: 'Амбулаторное лечение может быть рассмотрено при отсутствии других клинических или социальных противопоказаний.',
      stepOneTriggers: [],
      components: [],
    }
  }

  validateStepTwo(input)

  const components: PSIComponent[] = []
  const add = (key: string, label: string, points: number, detail: string) => {
    if (points !== 0) components.push({ key, label, points, detail })
  }

  const agePoints = input.sex === 'female' ? input.age - 10 : input.age
  add('age', 'Возраст', agePoints, input.sex === 'female' ? `${input.age} лет − 10 за женский пол` : `${input.age} лет, мужской пол`)
  add('nursingHome', 'Проживание в учреждении длительного ухода', input.nursingHome ? 10 : 0, ' +10')
  add('neoplasticDisease', 'Онкологическое заболевание', input.neoplasticDisease ? 30 : 0, '+30')
  add('liverDisease', 'Заболевание печени', input.liverDisease ? 20 : 0, '+20')
  add('heartFailure', 'Хроническая сердечная недостаточность', input.heartFailure ? 10 : 0, '+10')
  add('cerebrovascularDisease', 'Цереброваскулярное заболевание', input.cerebrovascularDisease ? 10 : 0, '+10')
  add('renalDisease', 'Заболевание почек', input.renalDisease ? 10 : 0, '+10')
  add('alteredMentalStatus', 'Нарушение сознания', input.alteredMentalStatus ? 20 : 0, '+20')
  add('respiratoryRate', 'ЧДД ≥30/мин', input.respiratoryRate >= 30 ? 20 : 0, `${input.respiratoryRate}/мин`)
  add('systolicBP', 'Систолическое АД <90 мм рт. ст.', input.systolicBP < 90 ? 20 : 0, `${input.systolicBP} мм рт. ст.`)
  add('temperature', 'Температура <35 или ≥40 °C', input.temperatureC < 35 || input.temperatureC >= 40 ? 15 : 0, `${input.temperatureC} °C`)
  add('heartRate', 'ЧСС ≥125/мин', input.heartRate >= 125 ? 10 : 0, `${input.heartRate}/мин`)
  add('arterialPH', 'Артериальный pH <7,35', input.arterialPH < 7.35 ? 30 : 0, `pH ${input.arterialPH}`)
  add('bunUrea', 'Мочевина ≥11 ммоль/л', input.bunUreaMmol >= 11 ? 20 : 0, `${input.bunUreaMmol} ммоль/л`)
  add('sodium', 'Натрий <130 ммоль/л', input.sodiumMmol < 130 ? 20 : 0, `${input.sodiumMmol} ммоль/л`)
  add('glucose', 'Глюкоза ≥14 ммоль/л', input.glucoseMmol >= 14 ? 10 : 0, `${input.glucoseMmol} ммоль/л`)
  add('hematocrit', 'Гематокрит <30%', input.hematocritPercent < 30 ? 10 : 0, `${input.hematocritPercent}%`)
  add('hypoxemia', 'PaO₂ <60 мм рт. ст. или SpO₂ <90%', input.hypoxemia ? 10 : 0, input.hypoxemia ? 'Гипоксемия присутствует' : 'Гипоксемия отсутствует')
  add('pleuralEffusion', 'Плевральный выпот', input.pleuralEffusion ? 10 : 0, input.pleuralEffusion ? 'Есть' : 'Нет')

  const score = components.reduce((sum, component) => sum + component.points, 0)
  let riskClass: PSIClass
  let mortalityEstimate: string
  let suggestedSetting: string
  if (score <= 70) {
    riskClass = 'II'
    mortalityEstimate = 'Ориентировочная летальность в исходных когортах — около 0,6–0,7% (низкий риск, <1%).'
    suggestedSetting = 'Амбулаторное лечение может быть рассмотрено при клинической стабильности и отсутствии противопоказаний к выписке.'
  } else if (score <= 90) {
    riskClass = 'III'
    mortalityEstimate = 'Ориентировочная летальность в исходных когортах — около 0,9–2,8%.'
    suggestedSetting = 'Рассмотреть краткосрочное наблюдение или госпитализацию; решение зависит от клинической оценки.'
  } else if (score <= 130) {
    riskClass = 'IV'
    mortalityEstimate = 'Ориентировочная летальность в исходных когортах — около 8,2–9,3%.'
    suggestedSetting = 'Как правило, требуется госпитализация.'
  } else {
    riskClass = 'V'
    mortalityEstimate = 'Ориентировочная летальность в исходных когортах — около 27–31%.'
    suggestedSetting = 'Как правило, требуется госпитализация и тщательная оценка тяжести состояния.'
  }

  return {
    riskClass,
    score,
    classLabel: `Класс ${riskClass}`,
    mortalityEstimate,
    suggestedSetting,
    stepOneTriggers: triggers,
    components,
  }
}
