export const PERFORMANCE_STATUS_REFERENCE = {
  title: 'ECOG Performance Status and Karnofsky Performance Status (KPS)',
  ecogSource: 'Oken MM et al. Toxicity and response criteria of the Eastern Cooperative Oncology Group. Am J Clin Oncol. 1982;5(6):649–655.',
  ecogUrl: 'https://pubmed.ncbi.nlm.nih.gov/7165009/',
  scaleSource: 'ECOG-ACRIN Cancer Research Group — ECOG and Karnofsky Performance Status scales',
  scaleUrl: 'https://ecog-acrin.org/resources/ecog-performance-status/',
  karnofskySource: 'Karnofsky DA, Burchenal JH. The clinical evaluation of chemotherapeutic agents in cancer. 1949.',
  nciUrl: 'https://www.cancer.gov/publications/dictionaries/cancer-terms/def/karnofsky-performance-status',
  accessed: '2026-11-26',
  notes: [
    'ECOG оценивается от 0 до 4 у живого пациента; значение 5 соответствует смерти и может использоваться только для ретроспективной регистрации.',
    'Karnofsky Performance Status (KPS) оценивается от 100 до 0 с шагом 10; более высокий балл соответствует большей функциональной самостоятельности.',
    'ECOG и Karnofsky — отдельные шкалы. Они не являются математически взаимозаменяемыми; калькулятор не преобразует одну оценку в другую.',
    'Если введены обе шкалы, значения ECOG 5 и KPS 0 должны совпадать, поскольку оба обозначают смерть.',
    'Оценка зависит от клинического суждения и должна отражать функциональный статус за заранее определённый период. Не следует выводить её только из диагноза или возраста.',
    'Шкалы используются для описания функционального статуса, в том числе в онкологии и клинических исследованиях; сами по себе они не назначают и не исключают конкретное лечение.',
  ],
} as const
