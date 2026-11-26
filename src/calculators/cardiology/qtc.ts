export type QTCFormula = 'bazett' | 'fridericia' | 'hodges'
export type QTCSex = 'male' | 'female'
export type QTCCategory = 'normal' | 'prolonged' | 'markedly-prolonged'

export interface QTCInput {
  qtMs: number
  rrMs: number
  formula: QTCFormula
  sex: QTCSex
}

export interface QTCResult {
  qtcMs: number
  heartRateBpm: number
  formula: QTCFormula
  formulaLabel: string
  category: QTCCategory
  categoryLabel: string
  prolongedThresholdMs: number
  above99thPercentile: boolean
  explanation: string
}

export function calculateQTC(input: QTCInput): QTCResult {
  if (!Number.isFinite(input.qtMs) || input.qtMs < 100 || input.qtMs > 1000) {
    throw new Error('Интервал QT должен находиться в диапазоне 100–1000 мс.')
  }
  if (!Number.isFinite(input.rrMs) || input.rrMs < 200 || input.rrMs > 3000) {
    throw new Error('Интервал RR должен находиться в диапазоне 200–3000 мс.')
  }
  if (input.formula !== 'bazett' && input.formula !== 'fridericia' && input.formula !== 'hodges') {
    throw new Error('Выберите формулу коррекции QT.')
  }
  if (input.sex !== 'male' && input.sex !== 'female') {
    throw new Error('Выберите пол для интерпретации QTc.')
  }

  const rrSeconds = input.rrMs / 1000
  const heartRateBpm = 60000 / input.rrMs
  const formulaLabel = input.formula === 'bazett' ? 'Bazett'
    : input.formula === 'fridericia' ? 'Fridericia' : 'Hodges'
  const qtcMs = input.formula === 'bazett'
    ? input.qtMs / Math.sqrt(rrSeconds)
    : input.formula === 'fridericia'
      ? input.qtMs / Math.cbrt(rrSeconds)
      : input.qtMs + 1.75 * (heartRateBpm - 60)

  // AHA/ACCF/HRS practical limits: men >450 ms; women >=460 ms.
  const prolongedThresholdMs = input.sex === 'male' ? 450 : 460
  const isProlonged = input.sex === 'male' ? qtcMs > 450 : qtcMs >= 460
  const upper99thPercentile = input.sex === 'male' ? 470 : 480
  const above99thPercentile = qtcMs >= upper99thPercentile
  const category: QTCCategory = qtcMs >= 500 ? 'markedly-prolonged' : isProlonged ? 'prolonged' : 'normal'
  const categoryLabel = category === 'markedly-prolonged' ? 'Выраженное удлинение QTc (≥500 мс)'
    : category === 'prolonged' ? 'Удлинение QTc'
      : 'Ниже порога удлинения QTc'

  const explanation = category === 'markedly-prolonged'
    ? 'QTc ≥500 мс считается выраженным удлинением и связано с повышенным риском torsades de pointes. Требуется срочная клиническая оценка с учётом симптомов, лекарств, электролитов и ЭКГ.'
    : above99thPercentile
      ? 'QTc достигает или превышает ориентировочную верхнюю границу 99-го перцентиля для данного пола (470 мс у мужчин, 480 мс у женщин).'
      : isProlonged
        ? 'QTc превышает практический клинический порог удлинения (мужчины >450 мс, женщины ≥460 мс), но не достигает 99-го перцентиля.'
        : 'QTc не превышает практический клинический порог удлинения для указанного пола. Это не означает отсутствия проаритмического риска.'

  return {
    qtcMs,
    heartRateBpm,
    formula: input.formula,
    formulaLabel,
    category,
    categoryLabel,
    prolongedThresholdMs,
    above99thPercentile,
    explanation,
  }
}
