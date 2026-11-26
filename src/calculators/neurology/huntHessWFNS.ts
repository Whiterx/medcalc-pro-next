export type MotorDeficit = 'present' | 'absent'
export type HuntHessGrade = 1 | 2 | 3 | 4 | 5
export type WFNSGrade = 1 | 2 | 3 | 4 | 5

export interface HuntHessWFNSInput {
  huntHessGrade: unknown
  gcs: unknown
  motorDeficit: unknown
}
export interface HuntHessWFNSResult {
  huntHess: { grade: HuntHessGrade; label: string; description: string }
  wfns: { grade: WFNSGrade | null; label: string; description: string; classifiable: boolean }
}

const HUNT_HESS: Record<HuntHessGrade, { label: string; description: string }> = {
  1: { label: 'I — Минимальные проявления', description: 'Бессимптомное течение или лёгкая головная боль и небольшая ригидность затылочных мышц.' },
  2: { label: 'II — Выраженная головная боль и менингизм', description: 'Умеренная или сильная головная боль, ригидность затылочных мышц; нет очагового неврологического дефицита, кроме возможного поражения черепных нервов.' },
  3: { label: 'III — Сонливость или лёгкий дефицит', description: 'Сонливость, спутанность сознания или лёгкий очаговый неврологический дефицит.' },
  4: { label: 'IV — Сопор или выраженный дефицит', description: 'Сопор или умеренный/тяжёлый гемипарез; возможно раннее децеребрационное ригидное состояние.' },
  5: { label: 'V — Глубокая кома', description: 'Глубокая кома, децеребрационная поза или крайне тяжёлое состояние (moribund).' },
}

export function calculateHuntHessWFNS(input: HuntHessWFNSInput): HuntHessWFNSResult {
  if (!input || typeof input !== 'object') throw new Error('Заполните все компоненты шкал.')
  if (typeof input.huntHessGrade !== 'number' || !Number.isInteger(input.huntHessGrade) || input.huntHessGrade < 1 || input.huntHessGrade > 5) {
    throw new Error('Выберите степень Hunt–Hess от I до V.')
  }
  if (typeof input.gcs !== 'number' || !Number.isInteger(input.gcs) || input.gcs < 3 || input.gcs > 15) {
    throw new Error('Укажите сумму GCS от 3 до 15 баллов.')
  }
  if (input.motorDeficit !== 'present' && input.motorDeficit !== 'absent') {
    throw new Error('Укажите наличие или отсутствие выраженного очагового моторного дефицита.')
  }
  const hhGrade = input.huntHessGrade as HuntHessGrade
  const hh = HUNT_HESS[hhGrade]
  let wfnsGrade: WFNSGrade | null = null
  let wfnsLabel = ''
  let wfnsDescription = ''
  let classifiable = true

  if (input.gcs === 15 && input.motorDeficit === 'absent') {
    wfnsGrade = 1
  } else if (input.gcs === 13 || input.gcs === 14) {
    wfnsGrade = input.motorDeficit === 'present' ? 3 : 2
  } else if (input.gcs >= 7 && input.gcs <= 12) {
    wfnsGrade = 4
  } else if (input.gcs >= 3 && input.gcs <= 6) {
    wfnsGrade = 5
  } else {
    classifiable = false
    wfnsDescription = 'Сочетание GCS 15 и выраженного очагового моторного дефицита не соответствует стандартным категориям WFNS I–V. Проверьте оценку GCS и неврологический статус; не присваивайте категорию автоматически.'
  }
  if (classifiable && wfnsGrade !== null) {
    wfnsLabel = ['I', 'II', 'III', 'IV', 'V'][wfnsGrade - 1]
    wfnsDescription = wfnsGrade === 1 ? 'GCS 15, выраженного очагового моторного дефицита нет.'
      : wfnsGrade === 2 ? 'GCS 13–14, выраженного очагового моторного дефицита нет.'
      : wfnsGrade === 3 ? 'GCS 13–14, выраженный очаговый моторный дефицит присутствует.'
      : wfnsGrade === 4 ? 'GCS 7–12, моторный дефицит может присутствовать или отсутствовать.'
      : 'GCS 3–6, моторный дефицит может присутствовать или отсутствовать.'
  }
  return {
    huntHess: { grade: hhGrade, label: hh.label, description: hh.description },
    wfns: { grade: wfnsGrade, label: classifiable ? `WFNS ${wfnsLabel}` : 'WFNS: категория не определяется', description: wfnsDescription, classifiable },
  }
}
