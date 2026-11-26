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
      ? 'Наличие ≥2 критериев связано с повышенным риском неблагоприятного исхода у пациентов с подозреваемой инфекцией. Требуется незамедлительная клиническая оценка на органную дисфункцию и другие признаки тяжёлого состояния.'
      : 'Менее 2 критериев не исключают сепсис и не должны использоваться для прекращения обследования или наблюдения. Оценивайте клиническую картину и применяйте локальный протокол.',
  }
}
