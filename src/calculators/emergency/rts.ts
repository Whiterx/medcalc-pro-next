export interface RTSInput {
  gcs: number
  systolicBP: number
  respiratoryRate: number
}

export interface RTSComponent {
  label: string
  rawValue: number
  codedValue: 0 | 1 | 2 | 3 | 4
  weight: number
  weightedPoints: number
  rangeDescription: string
}

export interface RTSResult {
  score: number
  maximum: 7.8408
  codedSum: number
  components: RTSComponent[]
  interpretation: string
}

function codeGCS(value: number): 0 | 1 | 2 | 3 | 4 {
  if (value === 3) return 0
  if (value <= 5) return 1
  if (value <= 8) return 2
  if (value <= 12) return 3
  return 4
}
function codeSBP(value: number): 0 | 1 | 2 | 3 | 4 {
  if (value === 0) return 0
  if (value < 50) return 1
  if (value <= 75) return 2
  if (value <= 89) return 3
  return 4
}
function codeRR(value: number): 0 | 1 | 2 | 3 | 4 {
  if (value === 0) return 0
  if (value <= 5) return 1
  if (value <= 9) return 2
  if (value <= 29) return 4
  return 3
}

export function calculateRTS(input: RTSInput): RTSResult {
  if (!input || typeof input !== 'object') throw new Error('Заполните все три физиологических параметра.')
  if (!Number.isInteger(input.gcs) || input.gcs < 3 || input.gcs > 15) {
    throw new Error('ШКГ должна быть целым числом от 3 до 15.')
  }
  if (!Number.isInteger(input.systolicBP) || input.systolicBP < 0 || input.systolicBP > 300) {
    throw new Error('Систолическое АД должно быть целым числом от 0 до 300 мм рт. ст.')
  }
  if (!Number.isInteger(input.respiratoryRate) || input.respiratoryRate < 0 || input.respiratoryRate > 100) {
    throw new Error('Частота дыхания должна быть целым числом от 0 до 100 в минуту.')
  }

  const components: RTSComponent[] = [
    {
      label: 'Шкала комы Глазго (GCS)', rawValue: input.gcs, codedValue: codeGCS(input.gcs),
      weight: 0.9368, weightedPoints: 0.9368 * codeGCS(input.gcs), rangeDescription: '13–15 = 4; 9–12 = 3; 6–8 = 2; 4–5 = 1; 3 = 0.',
    },
    {
      label: 'Систолическое АД', rawValue: input.systolicBP, codedValue: codeSBP(input.systolicBP),
      weight: 0.7326, weightedPoints: 0.7326 * codeSBP(input.systolicBP), rangeDescription: '>89 = 4; 76–89 = 3; 50–75 = 2; 1–49 = 1; 0 = 0.',
    },
    {
      label: 'Частота дыхания', rawValue: input.respiratoryRate, codedValue: codeRR(input.respiratoryRate),
      weight: 0.2908, weightedPoints: 0.2908 * codeRR(input.respiratoryRate), rangeDescription: '10–29 = 4; >29 = 3; 6–9 = 2; 1–5 = 1; 0 = 0.',
    },
  ]
  const score = components.reduce((sum, item) => sum + item.weightedPoints, 0)
  const codedSum = components.reduce((sum, item) => sum + item.codedValue, 0)

  return {
    score,
    maximum: 7.8408,
    codedSum,
    components,
    interpretation: score === 7.8408
      ? 'Максимальный RTS: все три кодируемых показателя находятся в наилучших диапазонах'
      : 'Чем ниже RTS, тем тяжелее физиологические нарушения; универсального порога для самостоятельного решения о лечении нет',
  }
}
