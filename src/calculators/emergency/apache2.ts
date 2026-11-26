export type APACHE2Input = {
  temperature:number; map:number; heartRate:number; respiratoryRate:number;
  fio2:number; pao2:number|null; aaGradient:number|null;
  ph:number|null; bicarbonate:number|null;
  sodium:number; potassium:number; creatinine:number; acuteRenalFailure:boolean;
  hematocrit:number; whiteBloodCells:number; gcs:number; age:number;
  chronicHealth:'none'|'elective'|'nonoperative'|'emergency';
}
export type APACHE2Item={key:string;label:string;points:number;detail:string}
export type APACHE2Result={acutePhysiology:number;agePoints:number;chronicPoints:number;total:number;items:APACHE2Item[]}
const item=(key:string,label:string,points:number,detail:string):APACHE2Item=>({key,label,points,detail})
export function scoreTemperature(v:number){return v>=41?4:v>=39?3:v>=38.5?1:v>=36?0:v>=34?1:v>=32?2:v>=30?3:4}
export function scoreMAP(v:number){return v>=160?4:v>=130?3:v>=110?2:v>=70?0:v>=50?2:4}
export function scoreHeartRate(v:number){return v>=180?4:v>=140?3:v>=110?2:v>=70?0:v>=55?2:v>=40?3:4}
export function scoreRespiratoryRate(v:number){return v>=50?4:v>=35?3:v>=25?1:v>=12?0:v>=10?1:v>=6?2:4}
export function scoreOxygenation(fio2:number,pao2:number|null,aaGradient:number|null){
  if(fio2>=50){if(aaGradient===null)return null;return aaGradient>=500?4:aaGradient>=350?3:aaGradient>=200?2:0}
  if(pao2===null)return null
  return pao2>70?0:pao2>=61?1:pao2>=55?3:4
}
export function scorePH(v:number){return v>=7.7?4:v>=7.6?3:v>=7.5?1:v>=7.33?0:v>=7.25?2:v>=7.15?3:4}
export function scoreBicarbonate(v:number){return v>=52?4:v>=41?3:v>=32?1:v>=22?0:v>=18?2:v>=15?3:4}
export function scoreSodium(v:number){return v>=180?4:v>=160?3:v>=155?2:v>=150?1:v>=130?0:v>=120?2:v>=111?3:4}
export function scorePotassium(v:number){return v>=7?4:v>=6?3:v>=5.5?1:v>=3.5?0:v>=3?1:v>=2.5?2:4}
export function scoreCreatinineUmol(v:number,acute:boolean){
  // Exact SI equivalents of the APACHE II mg/dL cutoffs (1 mg/dL = 88.4 µmol/L).
  const points=v>=309.4?4:v>=176.8?3:v>=132.6?2:v>=53.04?0:2
  return acute?points*2:points
}
export function scoreHematocrit(v:number){return v>=60?4:v>=50?2:v>=46?1:v>=30?0:v>=20?2:4}
export function scoreWBC(v:number){return v>=40?4:v>=20?2:v>=15?1:v>=3?0:v>=1?2:4}
export function scoreGCS(v:number){return 15-v}
export function scoreAge(v:number){return v>=75?6:v>=65?5:v>=55?3:v>=45?2:0}
export function calculateAPACHE2(x:APACHE2Input):APACHE2Result{
  const oxy=scoreOxygenation(x.fio2,x.pao2,x.aaGradient)
  const acid=x.ph!==null?scorePH(x.ph):x.bicarbonate!==null?scoreBicarbonate(x.bicarbonate):null
  if(oxy===null||acid===null)throw new Error('Не хватает данных для оценки оксигенации или кислотно-основного состояния.')
  const items=[
    item('temperature','Температура тела',scoreTemperature(x.temperature),`${x.temperature} °C`),
    item('map','Среднее АД',scoreMAP(x.map),`${x.map} мм рт. ст.`),
    item('heartRate','Частота сердечных сокращений',scoreHeartRate(x.heartRate),`${x.heartRate} /мин`),
    item('respiratoryRate','Частота дыхания',scoreRespiratoryRate(x.respiratoryRate),`${x.respiratoryRate} /мин`),
    item('oxygenation','Оксигенация',oxy,x.fio2>=50?`A–aDO₂ ${x.aaGradient} мм рт. ст. при FiO₂ ${x.fio2}%`:`PaO₂ ${x.pao2} мм рт. ст. при FiO₂ ${x.fio2}%`),
    item('acidBase','Кислотно-основное состояние',acid,x.ph!==null?`pH ${x.ph}`:`HCO₃⁻ ${x.bicarbonate} ммоль/л (без ABG)`),
    item('sodium','Натрий',scoreSodium(x.sodium),`${x.sodium} ммоль/л`),
    item('potassium','Калий',scorePotassium(x.potassium),`${x.potassium} ммоль/л`),
    item('creatinine','Креатинин',scoreCreatinineUmol(x.creatinine,x.acuteRenalFailure),`${x.creatinine} мкмоль/л${x.acuteRenalFailure?' · баллы удвоены при острой почечной недостаточности':''}`),
    item('hematocrit','Гематокрит',scoreHematocrit(x.hematocrit),`${x.hematocrit}%`),
    item('wbc','Лейкоциты',scoreWBC(x.whiteBloodCells),`${x.whiteBloodCells} ×10⁹/л`),
    item('gcs','Шкала комы Глазго',scoreGCS(x.gcs),`15 − GCS ${x.gcs}`),
  ]
  const acutePhysiology=items.reduce((sum,v)=>sum+v.points,0)
  const agePoints=scoreAge(x.age)
  const chronicPoints=x.chronicHealth==='elective'?2:x.chronicHealth==='none'?0:5
  return {acutePhysiology,agePoints,chronicPoints,total:acutePhysiology+agePoints+chronicPoints,items}
}
