export interface SPESIInput {
  age: number
  historyOfCancer: boolean
  chronicCardiopulmonaryDisease: boolean
  heartRate: number
  systolicBP: number
  oxygenSaturation: number
}

export interface SPESICriterion {
  key: keyof SPESIInput
  label: string
  present: boolean
  points: 0 | 1
  value: string
}

export interface SPESIResult {
  score: number
  maximum: 6
  lowRisk: boolean
  categoryLabel: string
  criteria: SPESICriterion[]
}

export function calculateSPESI(input: SPESIInput): SPESIResult {
  if (!input || typeof input !== 'object') throw new Error('Заполните все четыре числовых и два клинических параметра.')
  if (!Number.isInteger(input.age) || input.age < 18 || input.age > 120) {
    throw new Error('Возраст должен быть целым числом от 18 до 120 лет.')
  }
  if (typeof input.historyOfCancer !== 'boolean' || typeof input.chronicCardiopulmonaryDisease !== 'boolean') {
    throw new Error('Оцените анамнез рака и хроническое кардиопульмональное заболевание.')
  }
  if (!Number.isInteger(input.heartRate) || input.heartRate < 20 || input.heartRate > 300) {
    throw new Error('ЧСС должна быть целым числом от 20 до 300 в минуту.')
  }
  if (!Number.isInteger(input.systolicBP) || input.systolicBP < 0 || input.systolicBP > 300) {
    throw new Error('Систолическое АД должно быть целым числом от 0 до 300 мм рт. ст.')
  }
  if (!Number.isFinite(input.oxygenSaturation) || input.oxygenSaturation < 0 || input.oxygenSaturation > 100) {
    throw new Error('SpO₂ должна находиться в диапазоне 0–100%.')
  }

  const criteria: SPESICriterion[] = [
    { key: 'age', label: 'Возраст >80 лет', present: input.age > 80, points: input.age > 80 ? 1 : 0, value: `${input.age} лет` },
    { key: 'historyOfCancer', label: 'Онкологическое заболевание в анамнезе', present: input.historyOfCancer, points: input.historyOfCancer ? 1 : 0, value: input.historyOfCancer ? 'Да' : 'Нет' },
    { key: 'chronicCardiopulmonaryDisease', label: 'Хроническое кардиопульмональное заболевание', present: input.chronicCardiopulmonaryDisease, points: input.chronicCardiopulmonaryDisease ? 1 : 0, value: input.chronicCardiopulmonaryDisease ? 'Да' : 'Нет' },
    { key: 'heartRate', label: 'ЧСС ≥110/мин', present: input.heartRate >= 110, points: input.heartRate >= 110 ? 1 : 0, value: `${input.heartRate}/мин` },
    { key: 'systolicBP', label: 'Систолическое АД <100 мм рт. ст.', present: input.systolicBP < 100, points: input.systolicBP < 100 ? 1 : 0, value: `${input.systolicBP} мм рт. ст.` },
    { key: 'oxygenSaturation', label: 'SpO₂ <90%', present: input.oxygenSaturation < 90, points: input.oxygenSaturation < 90 ? 1 : 0, value: `${input.oxygenSaturation}%` },
  ]
  const score = criteria.reduce((sum, item) => sum + item.points, 0)
  const lowRisk = score === 0
  return {
    score,
    maximum: 6,
    lowRisk,
    categoryLabel: lowRisk ? 'Низкий риск ранней смертности (0 баллов)' : 'Повышенный риск ранней смертности (≥1 балла)',
    criteria,
  }
}
