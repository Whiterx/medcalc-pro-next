export interface PerformanceStatusInput {
  ecog?: number | null
  karnofsky?: number | null
}

export interface PerformanceStatusResult {
  ecog: { score: number; label: string } | null
  karnofsky: { score: number; label: string } | null
}

export const ECOG_LABELS: Record<number, string> = {
  0: 'Полностью активен, ограничений повседневной активности нет',
  1: 'Ограничена тяжёлая физическая активность; ходит и может выполнять лёгкую/сидячую работу',
  2: 'Способен к самообслуживанию и ходит, но не работает; вне постели более половины времени бодрствования',
  3: 'Ограниченное самообслуживание; в постели или кресле более половины времени бодрствования',
  4: 'Полностью нетрудоспособен; не способен к самообслуживанию, постоянно в постели или кресле',
  5: 'Смерть (ретроспективная регистрация; не оценка живого пациента)',
}

export const KARNOFSKY_LABELS: Record<number, string> = {
  100: 'Норма, жалоб нет, признаков заболевания нет',
  90: 'Обычная активность сохранена, имеются минимальные симптомы',
  80: 'Обычная активность возможна с усилием, есть симптомы',
  70: 'Обслуживает себя, но не способен к обычной активности или работе',
  60: 'Периодически нуждается в помощи, большинство потребностей обслуживает самостоятельно',
  50: 'Нуждается в значительной помощи и частом медицинском уходе',
  40: 'Инвалидизирован, требуется специальный уход и помощь',
  30: 'Тяжёлая инвалидизация; показана госпитализация, смерть не ожидается немедленно',
  20: 'Тяжёлое состояние; необходимы госпитализация и активная поддерживающая помощь',
  10: 'Агония, быстрое прогрессирование фатального процесса',
  0: 'Смерть',
}

export function calculatePerformanceStatus(input: PerformanceStatusInput): PerformanceStatusResult {
  if (!input || typeof input !== 'object') throw new Error('Выберите ECOG и/или Karnofsky.')
  const hasEcog = input.ecog !== undefined && input.ecog !== null
  const hasKarnofsky = input.karnofsky !== undefined && input.karnofsky !== null
  if (!hasEcog && !hasKarnofsky) throw new Error('Выберите хотя бы одну шкалу: ECOG или Karnofsky.')

  if (hasEcog && (!Number.isInteger(input.ecog) || (input.ecog as number) < 0 || (input.ecog as number) > 5)) {
    throw new Error('ECOG должен быть целым числом от 0 до 5.')
  }
  if (hasKarnofsky && (!Number.isInteger(input.karnofsky) || (input.karnofsky as number) < 0 || (input.karnofsky as number) > 100 || (input.karnofsky as number) % 10 !== 0)) {
    throw new Error('Karnofsky должен быть значением от 0 до 100 с шагом 10.')
  }
  if (hasEcog && hasKarnofsky) {
    const ecogDead = input.ecog === 5
    const karnofskyDead = input.karnofsky === 0
    if (ecogDead !== karnofskyDead) {
      throw new Error('ECOG 5 и Karnofsky 0 оба означают смерть. Проверьте, что значения не противоречат друг другу.')
    }
  }

  return {
    ecog: hasEcog ? { score: input.ecog as number, label: ECOG_LABELS[input.ecog as number] } : null,
    karnofsky: hasKarnofsky ? { score: input.karnofsky as number, label: KARNOFSKY_LABELS[input.karnofsky as number] } : null,
  }
}
