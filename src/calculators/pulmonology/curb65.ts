export interface CURB65Input {
  age: number
  urea: number
  respiratoryRate: number
  systolicBP: number
  diastolicBP: number
  confusion: boolean
}

export interface CURB65Criterion {
  key: 'confusion' | 'urea' | 'respiratoryRate' | 'bloodPressure' | 'age'
  label: string
  met: boolean
  points: 0 | 1
  explanation: string
}

export type CURB65Risk = 'low' | 'intermediate' | 'high'

export interface CURB65Result {
  score: number
  risk: CURB65Risk
  riskLabel: string
  mortality: string
  criteria: CURB65Criterion[]
  careContext: string
}

export function calculateCURB65(input: CURB65Input): CURB65Result {
  const criteria: CURB65Criterion[] = [
    {
      key: 'confusion',
      label: 'Нарушение сознания',
      met: input.confusion,
      points: input.confusion ? 1 : 0,
      explanation: 'Новое нарушение сознания: AMTS ≤8 или новая дезориентация',
    },
    {
      key: 'urea',
      label: 'Мочевина',
      met: input.urea > 7,
      points: input.urea > 7 ? 1 : 0,
      explanation: 'Мочевина крови >7 ммоль/л',
    },
    {
      key: 'respiratoryRate',
      label: 'Частота дыхания',
      met: input.respiratoryRate >= 30,
      points: input.respiratoryRate >= 30 ? 1 : 0,
      explanation: 'ЧДД ≥30 в минуту',
    },
    {
      key: 'bloodPressure',
      label: 'Артериальное давление',
      met: input.systolicBP < 90 || input.diastolicBP <= 60,
      points: input.systolicBP < 90 || input.diastolicBP <= 60 ? 1 : 0,
      explanation: 'САД <90 мм рт. ст. или ДАД ≤60 мм рт. ст.',
    },
    {
      key: 'age',
      label: 'Возраст',
      met: input.age >= 65,
      points: input.age >= 65 ? 1 : 0,
      explanation: 'Возраст ≥65 лет',
    },
  ]

  const score = criteria.reduce((total, criterion) => total + criterion.points, 0)

  if (score <= 1) {
    return {
      score,
      risk: 'low',
      riskLabel: 'Низкий риск',
      mortality: 'Менее 3%',
      criteria,
      careContext: 'При оценке в стационаре NICE рекомендует рассмотреть выписку домой с передачей под наблюдение первичной медицинской помощи и рекомендациями по повторному обращению.',
    }
  }

  if (score === 2) {
    return {
      score,
      risk: 'intermediate',
      riskLabel: 'Промежуточный риск',
      mortality: '3–15%',
      criteria,
      careContext: 'Может рассматриваться лечение в стационаре, отделение неотложной помощи с последующим наблюдением, виртуальная палата или программа «стационар на дому» — с учётом клинической картины.',
    }
  }

  return {
    score,
    risk: 'high',
    riskLabel: 'Высокий риск',
    mortality: 'Более 15%',
    criteria,
    careContext: 'При оценке в стационаре NICE рекомендует госпитализацию; при необходимости следует рассмотреть консультацию специалистов интенсивной терапии.',
  }
}
