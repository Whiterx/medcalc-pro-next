export const QSOFA_REFERENCE = {
  title: 'qSOFA: quick Sequential Organ Failure Assessment',
  definition: 'Sepsis-3 consensus definition',
  originalSource: 'Singer M, et al. JAMA. 2016;315(8):801–810. doi:10.1001/jama.2016.0287',
  russianGuideline: 'Клинические рекомендации Минздрава РФ «Сепсис (у взрослых)», 2024, ID 898_1; приложения Б.1 и Г.2.',
  russianGuidelineUrl: 'https://cr.minzdrav.gov.ru/preview-cr/898_1',
  guideline: 'Surviving Sepsis Campaign International Guidelines 2026',
  url: 'https://www.sccm.org/clinical-resources/guidelines/guidelines/surviving-sepsis-campaign-international-guidelines-for-management-of-sepsis-and-septic-shock-2026',
  accessed: '2026-11-27',
  notes: [
    'qSOFA включает три критерия: ЧДД ≥22/мин, САД ≤100 мм рт. ст. и изменение сознания (GCS <15). Каждый критерий даёт 1 балл.',
    'КР Минздрава РФ «Сепсис (у взрослых)» 2024 (ID 898_1) используют qSOFA для первичного скрининга вне ОРИТ и вне стационара; при ≥2 баллах и наличии очага инфекции требуется дальнейшая оценка органной дисфункции.',
    'Порог ≥2 критериев указывает на повышенный риск неблагоприятного исхода у пациентов с подозреваемой инфекцией и служит поводом для дальнейшей оценки, а не самостоятельным диагнозом.',
    'qSOFA не является диагностическим критерием сепсиса и не должен использоваться как единственный инструмент скрининга или исключения сепсиса.',
    'SSC 2026 рекомендует NEWS/NEWS2, MEWS или SIRS вместо qSOFA как единственного инструмента скрининга у госпитализированных остро заболевших взрослых. Это международная рекомендация для указанного контекста; российские КР 2024 отдельно включают qSOFA в первичный скрининг вне ОРИТ/стационара.',
  ],
} as const
