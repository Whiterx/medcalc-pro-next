export const CHILD_PUGH_REFERENCE = {
  title: 'Child–Turcotte–Pugh classification of cirrhosis severity',
  originalSource: 'Pugh RNH et al. Transection of the oesophagus for bleeding oesophageal varices. Br J Surg. 1973;60:646–649.',
  source: 'HCV Guidance — Table 4. Child-Turcotte-Pugh (CTP) Classification of the Severity of Cirrhosis',
  url: 'https://www.hcvguidelines.org/guidance/methods/table-4-child-turcotte-pugh-ctp-classification-of-cirrhosis-severity/',
  supportingSource: 'NHS Specialist Pharmacy Service — Calculating and using the Child-Pugh score',
  supportingUrl: 'https://sps.nhs.uk/articles/calculating-and-using-the-child-pugh-score/',
  accessed: '2026-11-26',
  notes: [
    'Пять компонентов оцениваются по 1–3 балла: общий билирубин, альбумин, МНО, асцит и печёночная энцефалопатия. Сумма — 5–15 баллов; классы A: 5–6, B: 7–9, C: 10–15.',
    'Использованы стандартные пороги билирубина (<34, 34–50, >50 мкмоль/л), альбумина (>35, 28–35, <28 г/л) и МНО (<1,7; 1,7–2,3; >2,3). Для билиарного холестатического заболевания могут применяться иные пороги билирубина; данный калькулятор их не реализует.',
    'Асцит и энцефалопатия оцениваются клинически и содержат субъективный компонент. При сомнении требуется клиническая оценка, а не автоматическое присвоение меньшего балла.',
    'МНО может быть изменено антагонистами витамина K и другими факторами, не отражающими только синтетическую функцию печени. Интерпретируйте результат с учётом антикоагулянтной терапии и клинического контекста.',
    'Классы A/B/C являются категориями Child–Pugh, а не самостоятельным решением о хирургическом риске, трансплантации, дозе лекарства или тактике лечения.',
    'Шкала не учитывает функцию почек, натрий и ряд других важных факторов; она не заменяет MELD, оценку декомпенсации или комплексное обследование.',
    'Образовательный инструмент для взрослых с циррозом печени. Не предназначен для диагностики цирроза.',
  ],
} as const
