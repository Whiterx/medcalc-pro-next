export type RespiratorySupport = 'none' | 'advanced' | 'unavailable' | 'ceiling';
export interface SOFA2Input {
  pao2: number | null;
  fio2: number | null;
  spo2: number | null;
  respiratorySupport: RespiratorySupport;
  ecmoForRespiratoryFailure: boolean;
  platelets: number;
  bilirubin: number;
  map: number | null;
  vasoactiveAvailability: 'available' | 'unavailable' | 'ceiling' | '';
  dopamineDose: number | null;
  ecmoForCardiovascularIndication: boolean;
  norepinephrineDose: number;
  epinephrineDose: number;
  otherVasoactiveOrInotrope: boolean;
  mechanicalCirculatorySupport: boolean;
  gcs: number | null;
  motorScore: number | null;
  preSedationGcsUnknown: boolean;
  deliriumMedication: boolean;
  creatinine: number | null;
  urineOutputMlKgH: number | null;
  urineOutputDuration: 'none' | '6-12' | '12+' | '24+' | 'anuria12';
  rrtStatus: 'none' | 'receiving' | 'intermittentOffDay' | 'nonrenalOnly' | 'unavailableOrDelayed';
  potassium: number | null;
  ph: number | null;
  bicarbonate: number | null;
}
export interface SOFA2Component {
  key: 'brain' | 'respiratory' | 'cardiovascular' | 'liver' | 'kidney' | 'hemostasis';
  label: string;
  points: number | null;
  detail: string;
}
export interface SOFA2Result {
  total: number | null;
  components: SOFA2Component[];
  respiratoryRatio: number | null;
  respiratoryRatioType: 'PaO₂/FiO₂' | 'SpO₂/FiO₂' | null;
  hasUntestableComponent: boolean;
}
export function scoreSOFA2Respiratory(input: Pick<SOFA2Input, 'pao2'|'fio2'|'spo2'|'respiratorySupport'|'ecmoForRespiratoryFailure'|'ecmoForCardiovascularIndication'>): {points:number|null;ratio:number|null;type:'PaO₂/FiO₂'|'SpO₂/FiO₂'|null} {
  if (input.ecmoForRespiratoryFailure || input.ecmoForCardiovascularIndication) return {points:4,ratio:null,type:null};
  if (input.fio2 === null) return {points:null,ratio:null,type:null};
  let ratio:number;
  let type:'PaO₂/FiO₂'|'SpO₂/FiO₂';
  if (input.pao2 !== null) {
    ratio=input.pao2/(input.fio2/100); type='PaO₂/FiO₂';
  } else {
    if (input.spo2 === null || input.spo2 >= 98) return {points:null,ratio:null,type:null};
    ratio=input.spo2/(input.fio2/100); type='SpO₂/FiO₂';
  }
  let score = type === 'PaO₂/FiO₂'
    ? ratio <= 75 ? 4 : ratio <= 150 ? 3 : ratio <= 225 ? 2 : ratio <= 300 ? 1 : 0
    : ratio <= 120 ? 4 : ratio <= 200 ? 3 : ratio <= 250 ? 2 : ratio <= 300 ? 1 : 0;
  if (input.respiratorySupport === 'none' && score > 2) score=2;
  return {points:score,ratio,type};
}
export function scoreSOFA2Hemostasis(platelets:number):number {
  if (platelets <= 50) return 4;
  if (platelets <= 80) return 3;
  if (platelets <= 100) return 2;
  if (platelets <= 150) return 1;
  return 0;
}
export function scoreSOFA2Liver(bilirubin:number):number {
  if (bilirubin > 205) return 4;
  if (bilirubin > 102.6) return 3;
  if (bilirubin > 51.3) return 2;
  if (bilirubin > 20.6) return 1;
  return 0;
}
export function scoreSOFA2Cardiovascular(input:Pick<SOFA2Input,'map'|'vasoactiveAvailability'|'dopamineDose'|'norepinephrineDose'|'epinephrineDose'|'otherVasoactiveOrInotrope'|'mechanicalCirculatorySupport'>):number|null {
  const catecholamineSum=input.norepinephrineDose+input.epinephrineDose;
  if (input.mechanicalCirculatorySupport) return 4;
  const hasCatecholamine=catecholamineSum > 0;
  const hasOtherAgent=input.otherVasoactiveOrInotrope || input.dopamineDose !== null;
  if (input.dopamineDose !== null && !hasCatecholamine && !input.otherVasoactiveOrInotrope) {
    return input.dopamineDose <= 20 ? 2 : input.dopamineDose <= 40 ? 3 : 4;
  }
  if (catecholamineSum > 0.4) return 4;
  if (catecholamineSum > 0.2) return hasOtherAgent ? 4 : 3;
  if (hasCatecholamine) return hasOtherAgent ? 3 : 2;
  if (hasOtherAgent) return 2;
  if (input.map === null) return null;
  if (input.vasoactiveAvailability === 'unavailable' || input.vasoactiveAvailability === 'ceiling') {
    return input.map >= 70 ? 0 : input.map >= 60 ? 1 : input.map >= 50 ? 2 : input.map >= 40 ? 3 : 4;
  }
  if (input.vasoactiveAvailability === 'available') return input.map < 70 ? 1 : 0;
  return null;
}
export function scoreSOFA2Brain(input:Pick<SOFA2Input,'gcs'|'motorScore'|'preSedationGcsUnknown'|'deliriumMedication'>):number|null {
  const observed=input.gcs ?? input.motorScore;
  if (observed === null) return input.preSedationGcsUnknown ? (input.deliriumMedication ? 1 : 0) : null;
  const score=input.gcs !== null
    ? (observed >= 15 ? 0 : observed >= 13 ? 1 : observed >= 9 ? 2 : observed >= 6 ? 3 : 4)
    : (observed === 6 ? 0 : observed === 5 ? 1 : observed === 4 ? 2 : observed === 3 ? 3 : 4);
  return input.deliriumMedication ? Math.max(score,1) : score;
}
export function scoreSOFA2Kidney(input:Pick<SOFA2Input,'creatinine'|'urineOutputMlKgH'|'urineOutputDuration'|'rrtStatus'|'potassium'|'ph'|'bicarbonate'>):number|null {
  if (input.rrtStatus === 'receiving' || input.rrtStatus === 'intermittentOffDay') return 4;
  if (input.creatinine === null && input.urineOutputMlKgH === null) return null;
  if ((input.urineOutputMlKgH === null && input.urineOutputDuration !== 'none') ||
      (input.urineOutputMlKgH !== null && input.urineOutputDuration === 'none') ||
      (input.urineOutputDuration === 'anuria12' && input.urineOutputMlKgH !== 0)) return null;
  const hasRRTTrigger = (input.creatinine !== null && input.creatinine > 110) ||
    (input.urineOutputMlKgH !== null && input.urineOutputMlKgH < 0.3 &&
      ['6-12','12+','24+'].includes(input.urineOutputDuration));
  if (input.rrtStatus === 'unavailableOrDelayed' && hasRRTTrigger) {
    const hyperkalemia = input.potassium !== null && input.potassium >= 6.0;
    const acidosisKnown = input.ph !== null && input.bicarbonate !== null;
    const severeAcidosis = input.ph !== null && input.bicarbonate !== null && input.ph <= 7.20 && input.bicarbonate <= 12;
    if (hyperkalemia || severeAcidosis) return 4;
    if (input.potassium === null || (!acidosisKnown && input.potassium < 6.0)) return null;
  }
  let score=0;
  if (input.creatinine !== null) score=Math.max(score,input.creatinine > 300 ? 3 : input.creatinine > 170 ? 2 : input.creatinine > 110 ? 1 : 0);
  if (input.urineOutputMlKgH !== null) {
    if (input.urineOutputDuration === 'anuria12' && input.urineOutputMlKgH === 0) score=Math.max(score,3);
    else if (input.urineOutputDuration === '24+' && input.urineOutputMlKgH < 0.3) score=Math.max(score,3);
    else if ((input.urineOutputDuration === '12+' || input.urineOutputDuration === '24+') && input.urineOutputMlKgH < 0.5) score=Math.max(score,2);
    else if (input.urineOutputDuration === '6-12' && input.urineOutputMlKgH < 0.5) score=Math.max(score,1);
  }
  return score;
}

export function calculateSOFA2(input:SOFA2Input):SOFA2Result {
  const respiratory=scoreSOFA2Respiratory(input);
  const brain=scoreSOFA2Brain(input);
  const cardiovascular=scoreSOFA2Cardiovascular(input);
  const liver=scoreSOFA2Liver(input.bilirubin);
  const kidney=scoreSOFA2Kidney(input);
  const hemostasis=scoreSOFA2Hemostasis(input.platelets);
  const components:SOFA2Component[]=[
    {key:'brain',label:'Головной мозг',points:brain,detail:input.gcs!==null?`GCS: ${input.gcs}`:input.motorScore!==null?`Лучшая двигательная реакция: ${input.motorScore}`:input.preSedationGcsUnknown?'GCS до седации неизвестна; по правилу SOFA-2 — 0':'Невозможно оценить GCS и двигательную реакцию'},
    {key:'respiratory',label:'Дыхательная система',points:respiratory.points,detail:(input.ecmoForRespiratoryFailure||input.ecmoForCardiovascularIndication)?'ECMO при дыхательной или сердечно-сосудистой недостаточности':respiratory.ratio===null?'Недостаточно данных для расчёта отношения':`${respiratory.type}: ${respiratory.ratio.toFixed(1)}`},
    {key:'cardiovascular',label:'Сердечно-сосудистая система',points:cardiovascular,detail:`MAP ${input.map === null ? 'не указан' : `${input.map} мм рт. ст.`}; сумма норэпинефрина и эпинефрина ${(input.norepinephrineDose+input.epinephrineDose).toFixed(3)} мкг/кг/мин`},
    {key:'liver',label:'Печень',points:liver,detail:`Общий билирубин: ${input.bilirubin} мкмоль/л`},
    {key:'kidney',label:'Почки',points:kidney,detail:input.rrtStatus==='receiving'||input.rrtStatus==='intermittentOffDay'?'Проводится/продолжается заместительная почечная терапия':input.rrtStatus==='unavailableOrDelayed'?'RRT не проводится: оценены критерии её необходимости':input.rrtStatus==='nonrenalOnly'?'RRT проводится исключительно по непочечным показаниям':[input.creatinine!==null?`креатинин ${input.creatinine} мкмоль/л`:'',input.urineOutputMlKgH!==null?`диурез ${input.urineOutputMlKgH} мл/кг/ч, период ${input.urineOutputDuration}`:''].filter(Boolean).join('; ')},
    {key:'hemostasis',label:'Гемостаз',points:hemostasis,detail:`Тромбоциты: ${input.platelets} ×10⁹/л`},
  ];
  const hasUntestableComponent=components.some(c=>c.points===null);
  return {total:hasUntestableComponent?null:components.reduce((s,c)=>s+(c.points??0),0),components,respiratoryRatio:respiratory.ratio,respiratoryRatioType:respiratory.type,hasUntestableComponent};
}
