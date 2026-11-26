export const QSOFA_REFERENCE = {
  title: 'qSOFA: quick Sequential Organ Failure Assessment',
  definition: 'Sepsis-3 consensus definition',
  originalSource: 'Singer M, et al. JAMA. 2016;315(8):801–810. doi:10.1001/jama.2016.0287',
  guideline: 'Surviving Sepsis Campaign International Guidelines 2026',
  url: 'https://www.sccm.org/clinical-resources/guidelines/guidelines/surviving-sepsis-campaign-international-guidelines-for-management-of-sepsis-and-septic-shock-2026',
  accessed: '2026-11-26',
  notes: [
    'qSOFA включает три критерия: ЧДД ≥22/мин, САД ≤100 мм рт. ст. и изменение сознания (GCS <15). Каждый критерий даёт 1 балл.',
    'Порог ≥2 критериев указывает на повышенный риск неблагоприятного исхода у пациентов с подозреваемой инфекцией и служит поводом для дальнейшей оценки.',
    'qSOFA не является диагностическим критерием сепсиса и не должен использоваться как единственный инструмент скрининга или исключения сепсиса.',
    'Рекомендации Surviving Sepsis Campaign 2026 отдают предпочтение NEWS/NEWS2, MEWS или SIRS перед qSOFA в качестве единственного инструмента скрининга сепсиса у госпитализированных остро заболевших взрослых.',
  ],
} as const
