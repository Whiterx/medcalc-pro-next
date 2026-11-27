export interface SOFAInput {
  pao2: number;
  fio2: number;
  respiratorySupport: boolean;
  platelets: number;
  bilirubin: number;
  map: number;
  vasoactiveStatus: 'none' | 'receiving';
  dopamineDose: number | null;
  dobutamine: boolean;
  epinephrineDose: number | null;
  norepinephrineDose: number | null;
  gcs: number | null;
  creatinine: number | null;
  urineOutput: number | null;
}

export interface SOFAComponent {
  key: 'respiratory' | 'coagulation' | 'liver' | 'cardiovascular' | 'neurologic' | 'renal';
  label: string;
  points: number | null;
  detail: string;
}

export interface SOFAResult {
  total: number | null;
  components: SOFAComponent[];
  pao2Fio2Ratio: number;
  hasUntestableComponent: boolean;
  baseline: number | null;
  delta: number | null;
}

export function scoreRespiratory(ratio: number, support: boolean): number {
  if (support && ratio < 100) return 4;
  if (support && ratio < 200) return 3;
  if (ratio < 300) return 2;
  if (ratio < 400) return 1;
  return 0;
}

export function scoreCoagulation(platelets: number): number {
  if (platelets < 20) return 4;
  if (platelets < 50) return 3;
  if (platelets < 100) return 2;
  if (platelets < 150) return 1;
  return 0;
}

export function scoreLiver(bilirubin: number): number {
  if (bilirubin > 204) return 4;
  if (bilirubin >= 102) return 3;
  if (bilirubin >= 33) return 2;
  if (bilirubin >= 20) return 1;
  return 0;
}

export function scoreCardiovascular(input: Pick<SOFAInput, 'map' | 'vasoactiveStatus' | 'dopamineDose' | 'dobutamine' | 'epinephrineDose' | 'norepinephrineDose'>): number {
  let score = input.map < 70 ? 1 : 0;
  if (input.vasoactiveStatus === 'receiving') {
    if (input.dopamineDose !== null) {
      score = Math.max(score, input.dopamineDose < 5 ? 2 : input.dopamineDose <= 15 ? 3 : 4);
    }
    if (input.dobutamine) score = Math.max(score, 2);
    if (input.epinephrineDose !== null) score = Math.max(score, input.epinephrineDose <= 0.1 ? 3 : 4);
    if (input.norepinephrineDose !== null) score = Math.max(score, input.norepinephrineDose <= 0.1 ? 3 : 4);
  }
  return score;
}

export function scoreNeurologic(gcs: number): number {
  if (gcs < 6) return 4;
  if (gcs <= 9) return 3;
  if (gcs <= 12) return 2;
  if (gcs <= 14) return 1;
  return 0;
}

export function scoreRenal(creatinine: number | null, urineOutput: number | null): number | null {
  if (creatinine === null && urineOutput === null) return null;
  let score = 0;
  if (creatinine !== null) {
    score = Math.max(score,
      creatinine > 440 ? 4 :
      creatinine >= 300 ? 3 :
      creatinine >= 171 ? 2 :
      creatinine >= 110 ? 1 : 0);
  }
  if (urineOutput !== null) {
    score = Math.max(score, urineOutput < 200 ? 4 : urineOutput < 500 ? 3 : 0);
  }
  return score;
}

export function calculateSOFA(input: SOFAInput, baseline: number | null = null): SOFAResult {
  const ratio = input.pao2 / (input.fio2 / 100);
  const respiratory = scoreRespiratory(ratio, input.respiratorySupport);
  const coagulation = scoreCoagulation(input.platelets);
  const liver = scoreLiver(input.bilirubin);
  const cardiovascular = scoreCardiovascular(input);
  const neurologic = input.gcs === null ? null : scoreNeurologic(input.gcs);
  const renal = scoreRenal(input.creatinine, input.urineOutput);
  const components: SOFAComponent[] = [
    { key: 'respiratory', label: 'Дыхательная система', points: respiratory, detail: `PaO₂/FiO₂ = ${ratio.toFixed(1)} мм рт. ст.${input.respiratorySupport ? ' · респираторная поддержка' : ''}` },
    { key: 'coagulation', label: 'Коагуляция', points: coagulation, detail: `Тромбоциты: ${input.platelets} ×10⁹/л` },
    { key: 'liver', label: 'Печень', points: liver, detail: `Билирубин: ${input.bilirubin} мкмоль/л` },
    { key: 'cardiovascular', label: 'Сердечно-сосудистая система', points: cardiovascular, detail: `MAP: ${input.map} мм рт. ст.; вазоактивная поддержка: ${input.vasoactiveStatus === 'receiving' ? 'да' : 'нет'}` },
    { key: 'neurologic', label: 'Центральная нервная система', points: neurologic, detail: input.gcs === null ? 'GCS: NT — не оценивается' : `GCS: ${input.gcs}` },
    { key: 'renal', label: 'Почки', points: renal, detail: [input.creatinine !== null ? `креатинин ${input.creatinine} мкмоль/л` : '', input.urineOutput !== null ? `диурез ${input.urineOutput} мл/24 ч` : ''].filter(Boolean).join(' · ') || 'Нет данных для оценки почечного компонента' },
  ];
  const hasUntestableComponent = components.some((component) => component.points === null);
  const total = hasUntestableComponent ? null : components.reduce((sum, component) => sum + component.points!, 0);
  return {
    total,
    components,
    pao2Fio2Ratio: ratio,
    hasUntestableComponent,
    baseline,
    delta: total !== null && baseline !== null ? total - baseline : null,
  };
}
