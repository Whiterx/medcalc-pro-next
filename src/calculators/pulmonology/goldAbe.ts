export type GOLDSymptomMethod = 'mmrc' | 'caat'
export type GOLDGroup = 'A' | 'B' | 'E'
export type GOLDGrade = 1 | 2 | 3 | 4

export interface GOLDABEInput {
  fev1FvcPercent: number
  fev1PercentPredicted: number
  moderateOrSevereExacerbations: number
  symptomMethod: GOLDSymptomMethod
  symptomScore: number
}

export interface GOLDABEResult {
  spirometricObstruction: boolean
  grade: GOLDGrade | null
  group: GOLDGroup | null
  symptomsHigh: boolean
  exacerbations: number
  components: { label: string; value: string; interpretation: string }[]
  explanation: string
}

export function calculateGOLDABE(input: GOLDABEInput): GOLDABEResult {
  if (!Number.isFinite(input.fev1FvcPercent) || input.fev1FvcPercent < 10 || input.fev1FvcPercent > 150) {
    throw new Error('ОФВ₁/ФЖЕЛ должно быть в диапазоне 10–150%. Используйте постбронходилатационное значение.')
  }
  if (!Number.isFinite(input.fev1PercentPredicted) || input.fev1PercentPredicted < 1 || input.fev1PercentPredicted > 200) {
    throw new Error('ОФВ₁ должен быть в диапазоне 1–200% от должного.')
  }
  if (!Number.isInteger(input.moderateOrSevereExacerbations) || input.moderateOrSevereExacerbations < 0 || input.moderateOrSevereExacerbations > 100) {
    throw new Error('Количество умеренных или тяжёлых обострений должно быть целым числом от 0 до 100.')
  }
  if (input.symptomMethod === 'mmrc') {
    if (!Number.isInteger(input.symptomScore) || input.symptomScore < 0 || input.symptomScore > 4) {
      throw new Error('Оценка mMRC должна быть целым числом от 0 до 4.')
    }
  } else if (input.symptomMethod === 'caat') {
    if (!Number.isInteger(input.symptomScore) || input.symptomScore < 0 || input.symptomScore > 40) {
      throw new Error('Оценка CAAT должна быть целым числом от 0 до 40.')
    }
  } else {
    throw new Error('Выберите метод оценки симптомов: mMRC или CAAT.')
  }

  const spirometricObstruction = input.fev1FvcPercent < 70
  const grade: GOLDGrade | null = !spirometricObstruction
    ? null
    : input.fev1PercentPredicted >= 80 ? 1
      : input.fev1PercentPredicted >= 50 ? 2
        : input.fev1PercentPredicted >= 30 ? 3 : 4

  const symptomsHigh = input.symptomMethod === 'mmrc'
    ? input.symptomScore >= 2
    : input.symptomScore >= 10

  const group: GOLDGroup | null = !spirometricObstruction
    ? null
    : input.moderateOrSevereExacerbations >= 1 ? 'E' : symptomsHigh ? 'B' : 'A'

  const symptomValue = input.symptomMethod === 'mmrc'
    ? `mMRC ${input.symptomScore}`
    : `CAAT ${input.symptomScore}/40`

  const components = [
    {
      label: 'Постбронходилатационное ОФВ₁/ФЖЕЛ',
      value: `${input.fev1FvcPercent}%`,
      interpretation: spirometricObstruction ? '<70% — критерий стойкой бронхиальной обструкции выполнен' : '≥70% — критерий стойкой бронхиальной обструкции по GOLD не выполнен',
    },
    {
      label: 'Постбронходилатационный ОФВ₁',
      value: `${input.fev1PercentPredicted}% от должного`,
      interpretation: grade === null ? 'Степень GOLD 1–4 не присваивается без подтверждённой обструкции' : `GOLD ${grade}`,
    },
    {
      label: 'Умеренные или тяжёлые обострения за последние 12 месяцев',
      value: String(input.moderateOrSevereExacerbations),
      interpretation: input.moderateOrSevereExacerbations >= 1 ? '≥1 — критерий группы E' : '0 — группа определяется по выраженности симптомов',
    },
    {
      label: 'Выраженность симптомов',
      value: symptomValue,
      interpretation: symptomsHigh ? 'Высокая симптомная нагрузка' : 'Низкая симптомная нагрузка',
    },
  ]

  return {
    spirometricObstruction,
    grade,
    group,
    symptomsHigh,
    exacerbations: input.moderateOrSevereExacerbations,
    components,
    explanation: !spirometricObstruction
      ? 'Постбронходилатационное ОФВ₁/ФЖЕЛ не ниже 0,70: спирометрический критерий обструкции по GOLD не подтверждён. Группа A/B/E и степень GOLD 1–4 не присваиваются этим калькулятором.'
      : group === 'E'
        ? 'Группа E: в предыдущие 12 месяцев было не менее одного умеренного или тяжёлого обострения, независимо от выраженности симптомов.'
        : group === 'B'
          ? 'Группа B: умеренных или тяжёлых обострений за предыдущие 12 месяцев не было, симптомная нагрузка высокая.'
          : 'Группа A: умеренных или тяжёлых обострений за предыдущие 12 месяцев не было, симптомная нагрузка низкая.',
  }
}
