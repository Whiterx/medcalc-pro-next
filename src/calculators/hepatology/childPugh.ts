export interface ChildPughInput {
  bilirubin: unknown
  albumin: unknown
  inr: unknown
  ascites: unknown
  encephalopathy: unknown
}
export type ChildPughKey = keyof ChildPughInput
export type ChildPughClass = 'A' | 'B' | 'C'
export interface ChildPughCriterion {
  key: ChildPughKey
  label: string
  points: 1 | 2 | 3
  interpretation: string
}
export interface ChildPughResult {
  score: number
  maxScore: 15
  minScore: 5
  classification: ChildPughClass
  classLabel: string
  criteria: ChildPughCriterion[]
}
export function classifyChildPugh(score: number): Pick<ChildPughResult, 'classification' | 'classLabel'> {
  if (!Number.isInteger(score) || score < 5 || score > 15) throw new Error('Сумма баллов Child–Pugh должна быть целым числом от 5 до 15.')
  if (score <= 6) return { classification: 'A', classLabel: 'Класс A (5–6 баллов)' }
  if (score <= 9) return { classification: 'B', classLabel: 'Класс B (7–9 баллов)' }
  return { classification: 'C', classLabel: 'Класс C (10–15 баллов)' }
}
export function calculateChildPugh(input: ChildPughInput): ChildPughResult {
  if (!input || typeof input !== 'object') throw new Error('Заполните все пять компонентов Child–Pugh.')
  const keys: ChildPughKey[] = ['bilirubin', 'albumin', 'inr', 'ascites', 'encephalopathy']
  if (keys.some((key) => ![1, 2, 3].includes(input[key] as number))) throw new Error('Для каждого из пяти компонентов выберите оценку от 1 до 3 баллов.')
  const criteria: ChildPughCriterion[] = [
    { key: 'bilirubin', label: 'Общий билирубин', points: input.bilirubin as 1 | 2 | 3, interpretation: '<34 мкмоль/л = 1; 34–50 мкмоль/л = 2; >50 мкмоль/л = 3.' },
    { key: 'albumin', label: 'Альбумин сыворотки', points: input.albumin as 1 | 2 | 3, interpretation: '>35 г/л = 1; 28–35 г/л = 2; <28 г/л = 3.' },
    { key: 'inr', label: 'МНО (INR)', points: input.inr as 1 | 2 | 3, interpretation: '<1,7 = 1; 1,7–2,3 = 2; >2,3 = 3.' },
    { key: 'ascites', label: 'Асцит', points: input.ascites as 1 | 2 | 3, interpretation: 'Нет = 1; небольшой или контролируемый терапией = 2; умеренный/выраженный, плохо контролируемый = 3.' },
    { key: 'encephalopathy', label: 'Печёночная энцефалопатия', points: input.encephalopathy as 1 | 2 | 3, interpretation: 'Нет = 1; степень I–II = 2; степень III–IV = 3.' },
  ]
  const score = criteria.reduce((sum, item) => sum + item.points, 0)
  return { score, minScore: 5, maxScore: 15, ...classifyChildPugh(score), criteria }
}
