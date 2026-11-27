export function calculateGCSTotal(eye: string, verbal: string, motor: string): number | null {
  const components = [eye, verbal, motor]
  if (components.some((component) => component === '' || component === 'NT')) return null

  const [eyeScore, verbalScore, motorScore] = components.map(Number)
  if (!Number.isInteger(eyeScore) || eyeScore < 1 || eyeScore > 4
    || !Number.isInteger(verbalScore) || verbalScore < 1 || verbalScore > 5
    || !Number.isInteger(motorScore) || motorScore < 1 || motorScore > 6) return null

  return eyeScore + verbalScore + motorScore
}

export interface QSOFAInput {
  respiratoryRate: number
  systolicBP: number
  gcs: number
}

export interface QSOFACriterion {
  key: 'respiratoryRate' | 'systolicBP' | 'mentalStatus'
  label: string
  met: boolean
  points: 0 | 1
  explanation: string
}

export interface QSOFAResult {
  score: number
  positive: boolean
  riskLabel: string
  criteria: QSOFACriterion[]
  interpretation: string
}

export function calculateQSOFA(input: QSOFAInput): QSOFAResult {
  const criteria: QSOFACriterion[] = [
    {
      key: 'respiratoryRate',
      label: 'Частота дыхания',
      met: input.respiratoryRate >= 22,
      points: input.respiratoryRate >= 22 ? 1 : 0,
      explanation: 'ЧДД ≥22 в минуту',
    },
    {
      key: 'systolicBP',
      label: 'Систолическое артериальное давление',
      met: input.systolicBP <= 100,
      points: input.systolicBP <= 100 ? 1 : 0,
      explanation: 'САД ≤100 мм рт. ст.',
    },
    {
      key: 'mentalStatus',
      label: 'Изменение сознания',
      met: input.gcs < 15,
      points: input.gcs < 15 ? 1 : 0,
      explanation: 'ШКГ (GCS) <15 баллов',
    },
  ]

  const score = criteria.reduce((sum, criterion) => sum + criterion.points, 0)
  const positive = score >= 2

  return {
    score,
    positive,
    riskLabel: positive ? 'qSOFA ≥2' : 'qSOFA <2',
    criteria,
    interpretation: positive
      ? 'Наличие ≥2 критериев связано с высоким риском органной дисфункции и неблагоприятного исхода при подозреваемой инфекции. По КР Минздрава РФ «Сепсис (у взрослых)» 2024 при наличии очага инфекции требуется дальнейшая оценка: вне стационара — госпитализация, в профильном отделении — консультация врача-анестезиолога-реаниматолога. qSOFA не устанавливает диагноз сепсиса.'
      : 'Менее 2 критериев не исключают сепсис и не должны использоваться для прекращения обследования или наблюдения. Оценивайте клиническую картину и применяйте локальный протокол.',
  }
}
