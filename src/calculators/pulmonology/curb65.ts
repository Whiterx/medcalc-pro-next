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
  if (!input || typeof input !== 'object') throw new Error('Введите все параметры CURB-65.')
  if (!Number.isInteger(input.age) || input.age < 18 || input.age > 120) throw new Error('Возраст должен быть целым числом от 18 до 120 лет.')
  if (!Number.isFinite(input.urea) || input.urea < 0 || input.urea > 100) throw new Error('Мочевина должна быть в диапазоне 0–100 ммоль/л.')
  if (!Number.isInteger(input.respiratoryRate) || input.respiratoryRate < 1 || input.respiratoryRate > 100) throw new Error('ЧДД должна быть целым числом от 1 до 100 в минуту.')
  if (!Number.isInteger(input.systolicBP) || input.systolicBP < 1 || input.systolicBP > 300) throw new Error('САД должно быть целым числом от 1 до 300 мм рт. ст.')
  if (!Number.isInteger(input.diastolicBP) || input.diastolicBP < 1 || input.diastolicBP > 200) throw new Error('ДАД должно быть целым числом от 1 до 200 мм рт. ст.')
  if (typeof input.confusion !== 'boolean') throw new Error('Укажите, присутствует ли новое нарушение сознания.')
  const criteria: CURB65Criterion[] = [
    { key: 'confusion', label: 'Новое нарушение сознания', met: input.confusion, points: input.confusion ? 1 : 0, explanation: 'Нарушение сознания, обусловленное внебольничной пневмонией: AMTS ≤8 или новая дезориентация' },
    { key: 'urea', label: 'Мочевина', met: input.urea > 7, points: input.urea > 7 ? 1 : 0, explanation: 'Мочевина крови >7 ммоль/л' },
    { key: 'respiratoryRate', label: 'Частота дыхания', met: input.respiratoryRate >= 30, points: input.respiratoryRate >= 30 ? 1 : 0, explanation: 'ЧДД ≥30 в минуту' },
    { key: 'bloodPressure', label: 'Артериальное давление', met: input.systolicBP < 90 || input.diastolicBP <= 60, points: input.systolicBP < 90 || input.diastolicBP <= 60 ? 1 : 0, explanation: 'САД <90 мм рт. ст. или ДАД ≤60 мм рт. ст.' },
    { key: 'age', label: 'Возраст', met: input.age >= 65, points: input.age >= 65 ? 1 : 0, explanation: 'Возраст ≥65 лет' },
  ]
  const score = criteria.reduce((total, criterion) => total + criterion.points, 0)
  if (score <= 1) return {
    score, risk: 'low', riskLabel: 'Низкий риск', mortality: 'Менее 3%', criteria,
    careContext: 'По NICE NG250 (2025) при 0–1 балле можно рассмотреть выписку домой с передачей под наблюдение первичной медицинской помощи и инструкциями по повторному обращению. КР Минздрава РФ по ВП (ID 654_2, 2024) рекомендуют CURB/CRB-65 для амбулаторных пациентов; низкий риск не отменяет клиническую оценку и другие показания к госпитализации.',
  }
  if (score === 2) return {
    score, risk: 'intermediate', riskLabel: 'Промежуточный риск', mortality: '3–15%', criteria,
    careContext: 'По NICE NG250 (2025) можно рассмотреть стационар, отделение неотложной помощи в день обращения, виртуальную палату или стационар на дому. По КР РФ по ВП (ID 654_2, 2024) у госпитализированных пациентов для оценки прогноза используют CURB/CRB-65 или PORT. Решение зависит от клинической картины и сопутствующих факторов.',
  }
  if (score === 3) return {
    score, risk: 'high', riskLabel: 'Высокий риск', mortality: 'Более 15%', criteria,
    careContext: 'По NICE NG250 (2025) рекомендуется стационарное лечение; консультация интенсивной терапии — при соответствующих показаниях. КР РФ по ВП (ID 654_2, 2024) отдельно указывают критерии АТО/АОИБ или SMART-COP для оценки показаний к ОРИТ; 3 балла CURB-65 сами по себе не заменяют эту оценку.',
  }
  return {
    score, risk: 'high', riskLabel: 'Высокий риск', mortality: 'Более 15%', criteria,
    careContext: 'КР Минздрава РФ по ВП (ID 654_2, 2024) указывают, что при >3 баллах по CURB/CRB-65 прогноз чрезвычайно неблагоприятный и требуется обязательная неотложная госпитализация в ОРИТ. NICE NG250 (2025) также относит 3–5 баллов к высокому риску; место лечения определяется совместно с клинической оценкой.',
  }
}