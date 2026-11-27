export interface WellsDVTInput {
  activeCancer: boolean
  paralysisOrCast: boolean
  bedriddenOrSurgery: boolean
  deepVenousTenderness: boolean
  entireLegSwollen: boolean
  calfDifferenceAtLeast3cm: boolean
  pittingEdema: boolean
  collateralVeins: boolean
  previousDVT: boolean
  alternativeDiagnosisAtLeastAsLikely: boolean
  assessmentConfirmed: boolean
}

export type WellsDVTCategory = 'unlikely' | 'likely'

export interface WellsDVTCriterion {
  key: keyof Omit<WellsDVTInput, 'assessmentConfirmed'>
  label: string
  present: boolean
  points: -2 | 0 | 1
  interpretation: string
}

export interface WellsDVTResult {
  score: number
  minScore: -2
  maxScore: 9
  category: WellsDVTCategory
  categoryLabel: string
  criteria: WellsDVTCriterion[]
}

export function classifyWellsDVT(score: number): Pick<WellsDVTResult, 'category' | 'categoryLabel'> {
  if (!Number.isInteger(score) || score < -2 || score > 9) {
    throw new Error('Сумма Wells DVT должна быть целым числом от −2 до 9.')
  }
  return score >= 2
    ? { category: 'likely', categoryLabel: 'ТГВ вероятен (≥2 баллов)' }
    : { category: 'unlikely', categoryLabel: 'ТГВ маловероятен (≤1 балла)' }
}

export function calculateWellsDVT(input: WellsDVTInput): WellsDVTResult {
  if (!input || typeof input !== 'object') throw new Error('Оцените все десять критериев Wells DVT.')
  if (input.assessmentConfirmed !== true) throw new Error('Подтвердите, что все 10 критериев оценены и неотмеченные признаки действительно отсутствуют.')
  const keys: (keyof Omit<WellsDVTInput, 'assessmentConfirmed'>)[] = [
    'activeCancer', 'paralysisOrCast', 'bedriddenOrSurgery', 'deepVenousTenderness',
    'entireLegSwollen', 'calfDifferenceAtLeast3cm', 'pittingEdema', 'collateralVeins',
    'previousDVT', 'alternativeDiagnosisAtLeastAsLikely',
  ]
  if (keys.some((key) => typeof input[key] !== 'boolean')) {
    throw new Error('Каждый критерий должен иметь однозначное значение: присутствует или отсутствует.')
  }
  const criteria: WellsDVTCriterion[] = [
    { key: 'activeCancer', label: 'Активное онкологическое заболевание', present: input.activeCancer, points: input.activeCancer ? 1 : 0, interpretation: 'Лечение продолжается, проводилось в последние 6 месяцев или заболевание находится в паллиативной стадии.' },
    { key: 'paralysisOrCast', label: 'Парез/паралич или недавняя иммобилизация нижней конечности гипсовой повязкой', present: input.paralysisOrCast, points: input.paralysisOrCast ? 1 : 0, interpretation: '1 балл при наличии любого из указанных признаков.' },
    { key: 'bedriddenOrSurgery', label: 'Постельный режим ≥3 дней или большая операция в последние 12 недель', present: input.bedriddenOrSurgery, points: input.bedriddenOrSurgery ? 1 : 0, interpretation: 'Операция должна требовать общей или регионарной анестезии.' },
    { key: 'deepVenousTenderness', label: 'Локальная болезненность по ходу глубокой венозной системы', present: input.deepVenousTenderness, points: input.deepVenousTenderness ? 1 : 0, interpretation: 'Клиническая болезненность при пальпации по ходу глубоких вен.' },
    { key: 'entireLegSwollen', label: 'Отёк всей ноги', present: input.entireLegSwollen, points: input.entireLegSwollen ? 1 : 0, interpretation: 'Отёк всей симптомной нижней конечности.' },
    { key: 'calfDifferenceAtLeast3cm', label: 'Разница окружности голеней ≥3 см', present: input.calfDifferenceAtLeast3cm, points: input.calfDifferenceAtLeast3cm ? 1 : 0, interpretation: 'Измерять на 10 см ниже бугристости большеберцовой кости; сравнивать с бессимптомной ногой.' },
    { key: 'pittingEdema', label: 'Ямочный отёк, ограниченный симптомной ногой', present: input.pittingEdema, points: input.pittingEdema ? 1 : 0, interpretation: 'Отёк должен быть односторонним и ограниченным симптомной конечностью.' },
    { key: 'collateralVeins', label: 'Коллатеральные поверхностные вены (не варикозные)', present: input.collateralVeins, points: input.collateralVeins ? 1 : 0, interpretation: 'Новые/расширенные поверхностные коллатерали, не являющиеся варикозными венами.' },
    { key: 'previousDVT', label: 'Ранее документированный тромбоз глубоких вен', present: input.previousDVT, points: input.previousDVT ? 1 : 0, interpretation: 'Подтверждённый ранее эпизод ТГВ.' },
    { key: 'alternativeDiagnosisAtLeastAsLikely', label: 'Альтернативный диагноз как минимум столь же вероятен, как ТГВ', present: input.alternativeDiagnosisAtLeastAsLikely, points: input.alternativeDiagnosisAtLeastAsLikely ? -2 : 0, interpretation: 'При наличии альтернативного диагноза вычитаются 2 балла.' },
  ]
  const score = criteria.reduce((sum, item) => sum + item.points, 0)
  return { score, minScore: -2, maxScore: 9, ...classifyWellsDVT(score), criteria }
}
