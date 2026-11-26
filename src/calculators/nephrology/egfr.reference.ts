export const EGFR_REFERENCE = {
  title: '2021 CKD-EPI creatinine equation',
  guideline: 'National Institute of Diabetes and Digestive and Kidney Diseases (NIDDK); National Kidney Foundation (NKF)',
  section: 'Race-free adult eGFR equations',
  published: '2021 equation; NIDDK adult eGFR equations page',
  url: 'https://www.niddk.nih.gov/research-funding/research-programs/kidney-clinical-research-epidemiology/laboratory/glomerular-filtration-rate-equations/adults',
  secondaryUrl: 'https://www.kidney.org/professionals/ckd-epi-creatinine-equation-2021',
  accessed: '2026-11-26',
  notes: [
    'Формула: eGFR = 142 × min(SCr/κ, 1)^α × max(SCr/κ, 1)^−1,200 × 0,9938^возраст × 1,012 (для женщин). SCr — стандартизированный креатинин в мг/дл; κ = 0,7 для женщин и 0,9 для мужчин; α = −0,241 для женщин и −0,302 для мужчин.',
    'Перевод креатинина: мкмоль/л ÷ 88,4 = мг/дл. Результат выражается в мл/мин/1,73 м².',
    'Категории G1–G5 описывают диапазон расчётной СКФ, но сами по себе не устанавливают диагноз хронической болезни почек. Для диагноза учитываются маркеры повреждения почек и/или снижение СКФ, сохраняющиеся не менее 3 месяцев.',
    'Оценка по креатинину может быть неточной при остром повреждении почек или нестабильном креатинине, необычной мышечной массе, ампутациях, беременности и других состояниях, влияющих на креатинин. При клинически значимых решениях может потребоваться цистатин C или комбинированная формула.',
    'eGFR индексирована к площади поверхности тела 1,73 м². Для дозирования отдельных препаратов следуйте инструкции к препарату и принятому в клинической ситуации методу оценки функции почек; не подменяйте автоматически требуемый метод этим результатом.',
  ],
} as const
