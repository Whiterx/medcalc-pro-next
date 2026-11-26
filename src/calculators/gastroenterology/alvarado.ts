export interface AlvaradoInput {
  migration: boolean
  anorexia: boolean
  nauseaVomiting: boolean
  rightLowerQuadrantTenderness: boolean
  reboundTenderness: boolean
  elevatedTemperature: boolean
  leukocytosis: boolean
  leftShift: boolean
}

export type AlvaradoCategory = 'low' | 'intermediate' | 'high'

export interface AlvaradoCriterion {
  key: keyof AlvaradoInput
  label: string
  present: boolean
  points: 0 | 1 | 2
  interpretation: string
}

export interface AlvaradoResult {
  score: number
  maxScore: 10
  category: AlvaradoCategory
  categoryLabel: string
  criteria: AlvaradoCriterion[]
}

export function classifyAlvarado(score: number): Pick<AlvaradoResult, 'category' | 'categoryLabel'> {
  if (!Number.isInteger(score) || score < 0 || score > 10) {
    throw new Error('Сумма Alvarado должна быть целым числом от 0 до 10.')
  }
  if (score <= 4) return { category: 'low', categoryLabel: 'Низкая вероятность (0–4 балла)' }
  if (score <= 6) return { category: 'intermediate', categoryLabel: 'Промежуточная вероятность (5–6 баллов)' }
  return { category: 'high', categoryLabel: 'Повышенная вероятность (7–10 баллов)' }
}

export function calculateAlvarado(input: AlvaradoInput): AlvaradoResult {
  if (!input || typeof input !== 'object') throw new Error('Оцените все восемь критериев Alvarado.')
  const keys: (keyof AlvaradoInput)[] = [
    'migration', 'anorexia', 'nauseaVomiting', 'rightLowerQuadrantTenderness',
    'reboundTenderness', 'elevatedTemperature', 'leukocytosis', 'leftShift',
  ]
  if (keys.some((key) => typeof input[key] !== 'boolean')) {
    throw new Error('Каждый критерий должен иметь однозначное значение: присутствует или отсутствует.')
  }

  const criteria: AlvaradoCriterion[] = [
    { key: 'migration', label: 'Миграция боли в правую подвздошную область', present: input.migration, points: input.migration ? 1 : 0, interpretation: '1 балл при миграции боли в правую подвздошную область.' },
    { key: 'anorexia', label: 'Анорексия или кетонурия', present: input.anorexia, points: input.anorexia ? 1 : 0, interpretation: '1 балл при снижении аппетита или наличии ацетона/кетонов в моче.' },
    { key: 'nauseaVomiting', label: 'Тошнота или рвота', present: input.nauseaVomiting, points: input.nauseaVomiting ? 1 : 0, interpretation: '1 балл при тошноте или рвоте.' },
    { key: 'rightLowerQuadrantTenderness', label: 'Болезненность при пальпации в правой подвздошной области', present: input.rightLowerQuadrantTenderness, points: input.rightLowerQuadrantTenderness ? 2 : 0, interpretation: '2 балла при локальной болезненности в правой подвздошной области.' },
    { key: 'reboundTenderness', label: 'Боль при быстром отпускании руки (симптом отдачи)', present: input.reboundTenderness, points: input.reboundTenderness ? 1 : 0, interpretation: '1 балл при наличии симптома отдачи.' },
    { key: 'elevatedTemperature', label: 'Повышение температуры тела ≥37,3 °C', present: input.elevatedTemperature, points: input.elevatedTemperature ? 1 : 0, interpretation: '1 балл при температуре ≥37,3 °C (в оригинальной шкале — оральное измерение).' },
    { key: 'leukocytosis', label: 'Лейкоцитоз >10 × 10⁹/л', present: input.leukocytosis, points: input.leukocytosis ? 2 : 0, interpretation: '2 балла при количестве лейкоцитов >10 × 10⁹/л.' },
    { key: 'leftShift', label: 'Сдвиг лейкоцитарной формулы влево (>75% нейтрофилов)', present: input.leftShift, points: input.leftShift ? 1 : 0, interpretation: '1 балл при сдвиге влево; в распространённой операционализации — нейтрофилы >75%.' },
  ]
  const score = criteria.reduce((sum, item) => sum + item.points, 0)
  return { score, maxScore: 10, ...classifyAlvarado(score), criteria }
}
