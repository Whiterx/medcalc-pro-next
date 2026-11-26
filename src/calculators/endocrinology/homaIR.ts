export interface HOMAIRInput {
  fastingGlucoseMmolL: number
  fastingInsulinMicroIUml: number
  fastingSamplesConfirmed: boolean
  noExogenousInsulin: boolean
}

export interface HOMAIRResult {
  value: number
  formula: string
  glucoseContribution: number
  insulinContribution: number
}

export function calculateHOMA1IR(input: HOMAIRInput): HOMAIRResult {
  if (!input.fastingSamplesConfirmed) {
    throw new Error('Для расчёта нужны одновременные анализы крови натощак после ночного голодания.')
  }
  if (!input.noExogenousInsulin) {
    throw new Error('Классический HOMA1-IR не следует интерпретировать при терапии экзогенным инсулином.')
  }
  if (!Number.isFinite(input.fastingGlucoseMmolL) || input.fastingGlucoseMmolL <= 0 || input.fastingGlucoseMmolL > 60) {
    throw new Error('Глюкоза натощак должна быть числом больше 0 и не более 60 ммоль/л.')
  }
  if (!Number.isFinite(input.fastingInsulinMicroIUml) || input.fastingInsulinMicroIUml <= 0 || input.fastingInsulinMicroIUml > 1000) {
    throw new Error('Инсулин натощак должен быть числом больше 0 и не более 1000 мкЕд/мл.')
  }

  const value = (input.fastingGlucoseMmolL * input.fastingInsulinMicroIUml) / 22.5
  return {
    value,
    formula: '(глюкоза натощак, ммоль/л × инсулин натощак, мкЕд/мл) / 22,5',
    glucoseContribution: input.fastingGlucoseMmolL,
    insulinContribution: input.fastingInsulinMicroIUml,
  }
}
