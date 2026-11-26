export const BISAP_REFERENCE = {
  title: 'BISAP — Bedside Index for Severity in Acute Pancreatitis',
  originalSource: 'Wu BU et al. The early prediction of mortality in acute pancreatitis: a large population-based study. Gut. 2008;57:1698–1703.',
  doi: '10.1136/gut.2008.152702',
  url: 'https://gut.bmj.com/content/57/12/1698',
  supportingSource: 'International Association of Pancreatology Revised Guidelines on Acute Pancreatitis 2025.',
  supportingUrl: 'https://doi.org/10.1016/j.pan.2025.04.020',
  accessed: '2026-11-26',
  notes: [
    'BISAP assigns one point for each of five variables assessed during the first 24 hours of hospitalisation: BUN >25 mg/dL, impaired mental status, SIRS, age >60 years, and pleural effusion. Total range: 0–5.',
    'The original population-based derivation and validation study included 17,922 and 18,256 acute pancreatitis cases, respectively. BISAP was developed to predict in-hospital mortality; it is not a diagnostic score and does not define severity under the Revised Atlanta Classification.',
    'A score ≥3 is commonly used as a marker of increased risk, but BISAP has limited sensitivity and must not be used alone to rule out severe acute pancreatitis, determine level of care, or direct treatment.',
    'SIRS is present when at least two criteria are met: temperature <36 °C or >38 °C; heart rate >90/min; respiratory rate >20/min or PaCO₂ <32 mmHg; white blood cell count <4 or >12 ×10⁹/L, or >10% immature (band) forms.',
    'The BUN threshold is >25 mg/dL. This corresponds to serum urea approximately >8.9 mmol/L; BUN and total serum urea are different measurements and their units must not be confused.',
    'Pleural effusion may not be evident early and the score may underestimate risk when calculated before it develops. Reassess the patient and organ function over time.',
    'The 2025 IAP guideline emphasises SIRS at admission and persistent SIRS at 48 hours, while persistent organ failure for >48 hours remains the key determinant of severe acute pancreatitis. BISAP does not replace these assessments.',
    'Educational implementation. No mortality percentage, severity category, admission decision, ICU recommendation, or treatment instruction is generated from the total score.',
  ],
} as const
