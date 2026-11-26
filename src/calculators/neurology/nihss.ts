export type NIHSSValue = number | 'UN'
export type NIHSSItemKey = 'loc1a' | 'loc1b' | 'loc1c' | 'gaze' | 'visual' | 'facial' | 'leftArm' | 'rightArm' | 'leftLeg' | 'rightLeg' | 'ataxia' | 'sensory' | 'language' | 'dysarthria' | 'neglect'
export type NIHSSInput = Record<NIHSSItemKey, NIHSSValue | ''> & { untestableReasons: Partial<Record<NIHSSItemKey, string>> }
export type NIHSSSeverity = 'none' | 'minor' | 'moderate' | 'moderate-severe' | 'severe' | 'incomplete'
export interface NIHSSResult { total: number; untestableItems: NIHSSItemKey[]; severity: NIHSSSeverity; severityLabel: string; isComplete: boolean; scoredItems: number }

const limits: Record<NIHSSItemKey, number> = { loc1a:3, loc1b:2, loc1c:2, gaze:2, visual:3, facial:3, leftArm:4, rightArm:4, leftLeg:4, rightLeg:4, ataxia:2, sensory:2, language:3, dysarthria:2, neglect:2 }
const untestableAllowed: NIHSSItemKey[] = ['leftArm','rightArm','leftLeg','rightLeg','ataxia','dysarthria']

export function classifyNIHSS(total: number): Pick<NIHSSResult, 'severity' | 'severityLabel'> {
  if (!Number.isInteger(total) || total < 0 || total > 42) throw new Error('Сумма NIHSS должна быть целым числом от 0 до 42.')
  if (total === 0) return { severity:'none', severityLabel:'Дефицит по шкале NIHSS не выявлен' }
  if (total <= 4) return { severity:'minor', severityLabel:'Небольшая выраженность неврологического дефицита (1–4)' }
  if (total <= 15) return { severity:'moderate', severityLabel:'Умеренная выраженность неврологического дефицита (5–15)' }
  if (total <= 20) return { severity:'moderate-severe', severityLabel:'Умеренно тяжёлый неврологический дефицит (16–20)' }
  return { severity:'severe', severityLabel:'Тяжёлый неврологический дефицит (21–42)' }
}

export function calculateNIHSS(input: NIHSSInput): NIHSSResult {
  const keys = Object.keys(limits) as NIHSSItemKey[]
  if (keys.some((key) => input[key] === '')) throw new Error('Выберите оценку для каждого пункта NIHSS. Неоцениваемые пункты отмечайте только как UN при предусмотренных шкалой условиях.')
  let total = 0
  const untestableItems: NIHSSItemKey[] = []
  for (const key of keys) {
    const value = input[key]
    if (value === 'UN') {
      if (!untestableAllowed.includes(key)) throw new Error('Для выбранного пункта NIHSS вариант UN не предусмотрен.')
      if (!input.untestableReasons[key]?.trim()) throw new Error('Для каждого пункта UN укажите причину неоцениваемости.')
      untestableItems.push(key)
    } else {
      if (typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value > limits[key]) throw new Error('Проверьте выбранные баллы NIHSS: значение вне допустимого диапазона.')
      total += value
    }
  }
  const isComplete = untestableItems.length === 0
  const severity = isComplete ? classifyNIHSS(total) : { severity:'incomplete' as const, severityLabel:'Есть неоцениваемые пункты — интерпретация общей тяжести ограничена' }
  return { total, untestableItems, isComplete, scoredItems:keys.length-untestableItems.length, ...severity }
}
