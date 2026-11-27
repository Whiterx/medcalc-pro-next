export type RASSScore = -5 | -4 | -3 | -2 | -1 | 0 | 1 | 2 | 3 | 4
export type CAMICUStatus = 'positive' | 'negative' | 'unable-to-assess'
export interface RASSCAMICUInput {
  rass: number
  acuteChangeOrFluctuation?: boolean | null
  inattentionErrors?: number | null
  disorganizedThinkingErrors?: number | null
}
export interface RASSCAMICUResult {
  rass: RASSScore
  rassLabel: string
  camICUStatus: CAMICUStatus
  camICULabel: string
  feature1: boolean | null
  feature2: boolean | null
  feature3: boolean | null
  feature4: boolean | null
  inattentionErrors: number | null
  disorganizedThinkingErrors: number | null
}
export const RASS_LABELS: Record<RASSScore, string> = {
  4: 'Агрессивен — непосредственная опасность для персонала',
  3: 'Очень возбуждён — удаляет трубки/катетеры, агрессивен',
  2: 'Возбуждён — частые бесцельные движения, сопротивляется ИВЛ',
  1: 'Беспокоен — тревожен, движения неагрессивны',
  0: 'Бодр, спокоен',
  '-1': 'Сонлив — устойчивый контакт глазами на голос более 10 секунд',
  '-2': 'Лёгкая седация — кратковременный контакт глазами на голос менее 10 секунд',
  '-3': 'Умеренная седация — движение/открывание глаз на голос без контакта глазами',
  '-4': 'Глубокая седация — нет реакции на голос, есть движение на физическую стимуляцию',
  '-5': 'Не пробуждается — нет реакции на голос и физическую стимуляцию',
}
function makeResult(rass: RASSScore, camICUStatus: CAMICUStatus, feature1: boolean | null, feature2: boolean | null, feature3: boolean | null, feature4: boolean | null, inattentionErrors: number | null, disorganizedThinkingErrors: number | null): RASSCAMICUResult {
  const camICULabel = camICUStatus === 'positive'
    ? 'CAM-ICU положительный — критерии скрининга делирия выполнены'
    : camICUStatus === 'negative'
      ? 'CAM-ICU отрицательный — критерии скрининга делирия не выполнены'
      : 'CAM-ICU не подлежит оценке при RASS −4 или −5'
  return { rass, rassLabel: RASS_LABELS[rass], camICUStatus, camICULabel, feature1, feature2, feature3, feature4, inattentionErrors, disorganizedThinkingErrors }
}
export function calculateRASSCAMICU(input: RASSCAMICUInput): RASSCAMICUResult {
  if (!input || typeof input !== 'object') throw new Error('Выберите уровень RASS.')
  if (!Number.isInteger(input.rass) || input.rass < -5 || input.rass > 4) throw new Error('RASS должен быть целым числом от −5 до +4.')
  const rass = input.rass as RASSScore
  if (rass <= -4) return makeResult(rass, 'unable-to-assess', null, null, null, null, null, null)
  if (typeof input.acuteChangeOrFluctuation !== 'boolean') throw new Error('Оцените острое изменение психического статуса или флуктуацию за последние 24 часа.')
  const feature1 = input.acuteChangeOrFluctuation
  if (!feature1) return makeResult(rass, 'negative', false, null, null, null, null, null)
  if (!Number.isInteger(input.inattentionErrors) || (input.inattentionErrors as number) < 0 || (input.inattentionErrors as number) > 10) throw new Error('Количество ошибок теста внимания должно быть целым числом от 0 до 10.')
  const inattentionErrors = input.inattentionErrors as number
  const feature2 = inattentionErrors > 2
  if (!feature2) return makeResult(rass, 'negative', true, false, null, null, inattentionErrors, null)
  const feature3 = rass !== 0
  if (feature3) return makeResult(rass, 'positive', true, true, true, null, inattentionErrors, null)
  if (!Number.isInteger(input.disorganizedThinkingErrors) || (input.disorganizedThinkingErrors as number) < 0 || (input.disorganizedThinkingErrors as number) > 5) throw new Error('Количество ошибок оценки дезорганизованного мышления должно быть целым числом от 0 до 5.')
  const disorganizedThinkingErrors = input.disorganizedThinkingErrors as number
  const feature4 = disorganizedThinkingErrors > 1
  return makeResult(rass, feature4 ? 'positive' : 'negative', true, true, false, feature4, inattentionErrors, disorganizedThinkingErrors)
}