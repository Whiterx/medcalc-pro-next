export const ISS_REFERENCE = {
  title: 'Injury Severity Score (ISS)',
  originalSource: 'Baker SP, O’Neill B, Haddon W Jr, Long WB. The Injury Severity Score: a method for describing patients with multiple injuries and evaluating emergency care. J Trauma. 1974;14:187–196.',
  originalUrl: 'https://pubmed.ncbi.nlm.nih.gov/4814394/',
  supportingSource: 'Association for the Advancement of Automotive Medicine (AAAM) — AIS licensing and terms of use',
  supportingUrl: 'https://www.aaam.org/ais/terms-use',
  methodologySource: 'The Injury Severity Score: an operations perspective',
  methodologyUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8858478/',
  accessed: '2026-11-26',
  notes: [
    'ISS рассчитывается по максимальному AIS-коду в каждом из шести регионов: голова/шея, лицо, грудная клетка, живот/органы таза, конечности/тазовый пояс, наружные повреждения.',
    'Формула: сумма квадратов трёх наибольших региональных AIS-кодов. Если хотя бы в одном регионе AIS = 6, итоговый ISS автоматически равен 75.',
    'В каждом регионе учитывается только наибольший AIS-код; несколько повреждений одного региона не суммируются.',
    'Калькулятор выполняет только арифметику ISS. Он не кодирует травмы, не воспроизводит описания/словарь AIS и не заменяет обучение. AIS — защищённая авторским правом и лицензируемая система; коды должны быть получены из разрешённого источника и присвоены квалифицированным специалистом.',
    'ISS 75 может возникнуть как при одном AIS 6, так и при трёх AIS 5; поэтому значение 75 нельзя автоматически интерпретировать как несовместимое с жизнью или как нулевую вероятность выживания.',
    'ISS не учитывает четвёртый и последующие регионы, имеет ограничения при множественных повреждениях в одном регионе и не заменяет клиническую оценку или другие модели травматологического риска.',
  ],
} as const
