export const VENTILATION_BASICS_REFERENCE = {
  title: 'Предсказанная масса тела и дыхательный объём при ИВЛ',
  primarySource: 'Fan E, Del Sorbo L, Goligher EC, et al. An Official ATS/ESICM/SCCM Clinical Practice Guideline: Mechanical Ventilation in Adult Patients with ARDS. Am J Respir Crit Care Med. 2017;195(9):1253–1263. doi:10.1164/rccm.201703-0548ST.',
  primaryUrl: 'https://academic.oup.com/ajrccm/article/195/9/1253/8500154',
  supportingSource: 'Goodfellow LT, Miller AG, Varekojis SM, et al. AARC Clinical Practice Guideline: Patient-Ventilator Assessment. Respir Care. 2024;69(8):1042–1054. doi:10.4187/respcare.12007.',
  supportingUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11298231/',
  protocolUrl: 'https://biolincc.nhlbi.nih.gov/media/studies/factt/Protocol.pdf',
  accessed: '2026-11-26',
  formula: {
    male: 'PBW (кг) = 50 + 0,91 × (рост в см − 152,4)',
    female: 'PBW (кг) = 45,5 + 0,91 × (рост в см − 152,4)',
  },
  notes: [
    'Формула PBW предназначена для взрослых и использует рост и вариант формулы, а не фактическую массу тела. В интерфейсе вариант формулы выбирается явно; это технический параметр исходной формулы, а не определение гендерной идентичности.',
    'Руководство ATS/ESICM/SCCM рекомендует при ОРДС дыхательный объём 4–8 мл/кг PBW и ограничение давления плато <30 см вод. ст.; исходная стратегия обычно начинает с 6 мл/кг PBW с последующей индивидуальной настройкой.',
    'Руководство AARC 2024 рекомендует оценивать дыхательный объём в диапазоне 4–8 мл/кг PBW и документировать его в мл/кг PBW. Это ориентир для оценки вентиляции, а не универсальное назначение параметров ИВЛ каждому пациенту.',
    'Значения 4, 6 и 8 мл/кг отображаются как расчётные ориентиры. Округление объёмов до целого миллилитра выполняется только для отображения; оценка введённого объёма проводится по неокруглённому PBW.',
    'Калькулятор предназначен для взрослых. Не предназначен для детей, новорождённых и пациентов, для которых стандартная формула PBW неприменима. Решение о настройках ИВЛ требует оценки механики дыхания, газообмена, давления плато, PEEP, синхронизации и клинического контекста.',
  ],
} as const
