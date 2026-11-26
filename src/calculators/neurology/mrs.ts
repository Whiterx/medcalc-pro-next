export type MRSScore = 0 | 1 | 2 | 3 | 4 | 5 | 6
export type MRSAssessmentContext = 'baseline' | 'current' | 'follow-up'
export interface MRSResult { score: MRSScore; label: string; description: string; functionalGroup: string }

export const MRS_LEVELS: { score: MRSScore; label: string; description: string }[] = [
  { score: 0, label: 'Нет симптомов', description: 'Нет каких-либо симптомов.' },
  { score: 1, label: 'Нет значимой инвалидизации', description: 'Несмотря на симптомы, пациент способен выполнять все обычные обязанности и повседневные занятия.' },
  { score: 2, label: 'Лёгкая инвалидизация', description: 'Не может выполнять все прежние занятия, но способен самостоятельно заботиться о собственных делах без посторонней помощи.' },
  { score: 3, label: 'Умеренная инвалидизация', description: 'Нуждается в некоторой помощи, но способен ходить самостоятельно, без помощи другого человека.' },
  { score: 4, label: 'Умеренно тяжёлая инвалидизация', description: 'Не способен ходить без помощи другого человека и не может самостоятельно удовлетворять основные физиологические потребности.' },
  { score: 5, label: 'Тяжёлая инвалидизация', description: 'Прикован к постели, может быть инконтинентен, нуждается в постоянном уходе и внимании.' },
  { score: 6, label: 'Смерть', description: 'Пациент умер.' },
]

export function calculateMRS(score: unknown): MRSResult {
  if (typeof score !== 'number' || !Number.isInteger(score) || score < 0 || score > 6) {
    throw new Error('Выберите значение mRS от 0 до 6.')
  }
  const level = MRS_LEVELS[score]
  if (!level || level.score !== score) throw new Error('Недопустимое значение mRS.')
  const functionalGroup = score <= 2 ? 'Самостоятельность в повседневной жизни (mRS 0–2)' : score <= 5 ? 'Зависимость от посторонней помощи (mRS 3–5)' : 'Смерть (mRS 6)'
  return { ...level, functionalGroup }
}
