export interface PaduaInput {
  activeCancer: boolean
  previousVTE: boolean
  reducedMobility: boolean
  knownThrombophilia: boolean
  recentTraumaOrSurgery: boolean
  age70OrOlder: boolean
  heartOrRespiratoryFailure: boolean
  acuteMIOrIschemicStroke: boolean
  acuteInfectionOrRheumatologicDisease: boolean
  obesityBMI30OrMore: boolean
  ongoingHormonalTreatment: boolean
}

export interface PaduaCriterion {
  key: keyof PaduaInput
  label: string
  present: boolean
  points: 0 | 1 | 2 | 3
  interpretation: string
}

export interface PaduaResult {
  score: number
  maximum: 20
  highRisk: boolean
  categoryLabel: string
  criteria: PaduaCriterion[]
}

export function calculatePadua(input: PaduaInput): PaduaResult {
  if (!input || typeof input !== 'object') throw new Error('Оцените все 11 факторов риска Padua.')
  const keys: (keyof PaduaInput)[] = [
    'activeCancer', 'previousVTE', 'reducedMobility', 'knownThrombophilia',
    'recentTraumaOrSurgery', 'age70OrOlder', 'heartOrRespiratoryFailure',
    'acuteMIOrIschemicStroke', 'acuteInfectionOrRheumatologicDisease',
    'obesityBMI30OrMore', 'ongoingHormonalTreatment',
  ]
  if (keys.some((key) => typeof input[key] !== 'boolean')) {
    throw new Error('Каждый фактор должен иметь однозначное значение: присутствует или отсутствует.')
  }
  const criteria: PaduaCriterion[] = [
    { key: 'activeCancer', label: 'Активное онкологическое заболевание', present: input.activeCancer, points: input.activeCancer ? 3 : 0, interpretation: 'Метастазы и/или химиотерапия или лучевая терапия в последние 6 месяцев.' },
    { key: 'previousVTE', label: 'Тромбоэмболия венозной системы в анамнезе', present: input.previousVTE, points: input.previousVTE ? 3 : 0, interpretation: 'Ранее подтверждённый ТГВ или ТЭЛА; поверхностный тромбофлебит не учитывается.' },
    { key: 'reducedMobility', label: 'Сниженная подвижность', present: input.reducedMobility, points: input.reducedMobility ? 3 : 0, interpretation: 'Ожидаемый постельный режим с разрешением посещать туалет не менее 3 дней.' },
    { key: 'knownThrombophilia', label: 'Известное тромбофилическое состояние', present: input.knownThrombophilia, points: input.knownThrombophilia ? 3 : 0, interpretation: 'Дефицит антитромбина, протеинов C/S, фактор V Leiden, мутация протромбина G20210A или антифосфолипидный синдром.' },
    { key: 'recentTraumaOrSurgery', label: 'Недавняя травма и/или операция (≤1 месяца)', present: input.recentTraumaOrSurgery, points: input.recentTraumaOrSurgery ? 2 : 0, interpretation: 'Травма или хирургическое вмешательство в течение последнего месяца.' },
    { key: 'age70OrOlder', label: 'Возраст ≥70 лет', present: input.age70OrOlder, points: input.age70OrOlder ? 1 : 0, interpretation: 'Возраст 70 лет или старше.' },
    { key: 'heartOrRespiratoryFailure', label: 'Сердечная и/или дыхательная недостаточность', present: input.heartOrRespiratoryFailure, points: input.heartOrRespiratoryFailure ? 1 : 0, interpretation: 'Острая или хроническая сердечная и/или дыхательная недостаточность.' },
    { key: 'acuteMIOrIschemicStroke', label: 'Острый инфаркт миокарда или ишемический инсульт', present: input.acuteMIOrIschemicStroke, points: input.acuteMIOrIschemicStroke ? 1 : 0, interpretation: 'Текущий острый эпизод инфаркта миокарда или ишемического инсульта.' },
    { key: 'acuteInfectionOrRheumatologicDisease', label: 'Острая инфекция и/или ревматологическое заболевание', present: input.acuteInfectionOrRheumatologicDisease, points: input.acuteInfectionOrRheumatologicDisease ? 1 : 0, interpretation: 'Острая инфекция или активное ревматологическое заболевание.' },
    { key: 'obesityBMI30OrMore', label: 'Ожирение (ИМТ ≥30 кг/м²)', present: input.obesityBMI30OrMore, points: input.obesityBMI30OrMore ? 1 : 0, interpretation: 'Индекс массы тела 30 кг/м² или выше.' },
    { key: 'ongoingHormonalTreatment', label: 'Продолжающаяся гормональная терапия', present: input.ongoingHormonalTreatment, points: input.ongoingHormonalTreatment ? 1 : 0, interpretation: 'Текущая гормональная терапия, учитываемая как фактор риска в Padua.' },
  ]
  const score = criteria.reduce((sum, item) => sum + item.points, 0)
  const highRisk = score >= 4
  return {
    score,
    maximum: 20,
    highRisk,
    categoryLabel: highRisk ? 'Высокий риск ВТЭО (≥4 баллов)' : 'Низкий риск ВТЭО (<4 баллов)',
    criteria,
  }
}
