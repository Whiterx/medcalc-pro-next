export type ABCD2ClinicalFeature = 'none' | 'speech' | 'weakness'
export type ABCD2Duration = 'under10' | '10to59' | '60plus'
export interface ABCD2Input {
  age60OrOlder: boolean
  bloodPressure140Or90OrHigher: boolean
  clinicalFeature: ABCD2ClinicalFeature
  symptomDuration: ABCD2Duration
  diabetes: boolean
}
export interface ABCD2Result {
  total: number
  components: { key: string; label: string; points: number }[]
  maxScore: 7
  band: 'low' | 'moderate' | 'high'
  bandLabel: string
}
export function calculateABCD2(input: ABCD2Input): ABCD2Result {
  if (!input || typeof input !== 'object') throw new Error('Заполните все пункты ABCD².')
  if (typeof input.age60OrOlder !== 'boolean' || typeof input.bloodPressure140Or90OrHigher !== 'boolean' || typeof input.diabetes !== 'boolean') {
    throw new Error('Укажите возраст, артериальное давление и наличие сахарного диабета.')
  }
  if (!['none', 'speech', 'weakness'].includes(input.clinicalFeature)) throw new Error('Выберите клинический признак.')
  if (!['under10', '10to59', '60plus'].includes(input.symptomDuration)) throw new Error('Выберите длительность симптомов.')
  const clinicalPoints = input.clinicalFeature === 'weakness' ? 2 : input.clinicalFeature === 'speech' ? 1 : 0
  const durationPoints = input.symptomDuration === '60plus' ? 2 : input.symptomDuration === '10to59' ? 1 : 0
  const components = [
    { key: 'age', label: 'Возраст ≥60 лет', points: input.age60OrOlder ? 1 : 0 },
    { key: 'bloodPressure', label: 'АД ≥140 мм рт. ст. систолическое ИЛИ ≥90 мм рт. ст. диастолическое', points: input.bloodPressure140Or90OrHigher ? 1 : 0 },
    { key: 'clinical', label: input.clinicalFeature === 'weakness' ? 'Односторонняя слабость' : input.clinicalFeature === 'speech' ? 'Нарушение речи без слабости' : 'Нет слабости или нарушения речи', points: clinicalPoints },
    { key: 'duration', label: input.symptomDuration === '60plus' ? 'Длительность ≥60 минут' : input.symptomDuration === '10to59' ? 'Длительность 10–59 минут' : 'Длительность <10 минут', points: durationPoints },
    { key: 'diabetes', label: 'Сахарный диабет', points: input.diabetes ? 1 : 0 },
  ]
  const total = components.reduce((sum, item) => sum + item.points, 0)
  const band = total <= 3 ? 'low' : total <= 5 ? 'moderate' : 'high'
  const bandLabel = band === 'low' ? '0–3 балла' : band === 'moderate' ? '4–5 баллов' : '6–7 баллов'
  return { total, components, maxScore: 7, band, bandLabel }
}
