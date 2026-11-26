export type SAPS2Input={
 age:number;heartRate:number;systolicBP:number;temperature:number;
 ventilated:boolean;pao2Fio2:number|null;urineOutput:number;urea:number;
 whiteBloodCells:number;potassium:number;sodium:number;bicarbonate:number;
 bilirubin:number;gcs:number;
 admissionType:'scheduled'|'medical'|'unscheduled';
 chronicDisease:'none'|'metastaticCancer'|'hematologicMalignancy'|'aids';
}
export type SAPS2Item={key:string;label:string;points:number;detail:string}
export type SAPS2Result={physiologyPoints:number;agePoints:number;admissionPoints:number;chronicPoints:number;total:number;logit:number;mortalityProbability:number;items:SAPS2Item[]}
const item=(key:string,label:string,points:number,detail:string):SAPS2Item=>({key,label,points,detail})
export function scoreSAPS2Age(v:number){return v>=80?18:v>=75?16:v>=70?15:v>=60?12:v>=40?7:0}
export function scoreSAPS2HeartRate(v:number){return v>=160?7:v>=120?4:v>=70?0:v>=40?2:11}
export function scoreSAPS2SystolicBP(v:number){return v>=200?2:v>=100?0:v>=70?5:13}
export function scoreSAPS2Temperature(v:number){return v>=39?3:0}
export function scoreSAPS2Oxygenation(ratio:number|null,ventilated:boolean){if(!ventilated)return 0;if(ratio===null)throw new Error('Для пациента на ИВЛ/CPAP необходимо указать PaO₂/FiO₂.');return ratio>=200?6:ratio>=100?9:11}
export function scoreSAPS2UrineOutput(v:number){return v>=1000?0:v>=500?4:11}
export function scoreSAPS2Urea(v:number){return v>=30?10:v>=10?6:0}
export function scoreSAPS2WBC(v:number){return v>=20?3:v>=1?0:12}
export function scoreSAPS2Potassium(v:number){return v>=5||v<3?3:0}
export function scoreSAPS2Sodium(v:number){return v>=145?1:v>=125?0:5}
export function scoreSAPS2Bicarbonate(v:number){return v>=20?0:v>=15?3:6}
export function scoreSAPS2Bilirubin(v:number){return v>=102.6?9:v>=68.4?4:0}
export function scoreSAPS2GCS(v:number){return v>=14?0:v>=11?5:v>=9?7:v>=6?13:26}
export function scoreSAPS2Admission(v:SAPS2Input['admissionType']){return v==='scheduled'?0:v==='medical'?6:8}
export function scoreSAPS2Chronic(v:SAPS2Input['chronicDisease']){return v==='aids'?17:v==='hematologicMalignancy'?10:v==='metastaticCancer'?9:0}
export function calculateSAPS2(x:SAPS2Input):SAPS2Result{
 const oxygen=scoreSAPS2Oxygenation(x.pao2Fio2,x.ventilated)
 const items=[
  item('heartRate','Частота сердечных сокращений',scoreSAPS2HeartRate(x.heartRate),`${x.heartRate} /мин`),
  item('systolicBP','Систолическое АД',scoreSAPS2SystolicBP(x.systolicBP),`${x.systolicBP} мм рт. ст.`),
  item('temperature','Температура тела',scoreSAPS2Temperature(x.temperature),`${x.temperature} °C`),
  item('oxygenation','Оксигенация',oxygen,x.ventilated?`PaO₂/FiO₂: ${x.pao2Fio2}`:'Без ИВЛ/CPAP: 0 баллов'),
  item('urineOutput','Диурез за 24 часа',scoreSAPS2UrineOutput(x.urineOutput),`${x.urineOutput} мл/24 ч`),
  item('urea','Мочевина',scoreSAPS2Urea(x.urea),`${x.urea} ммоль/л`),
  item('wbc','Лейкоциты',scoreSAPS2WBC(x.whiteBloodCells),`${x.whiteBloodCells} ×10⁹/л`),
  item('potassium','Калий',scoreSAPS2Potassium(x.potassium),`${x.potassium} ммоль/л`),
  item('sodium','Натрий',scoreSAPS2Sodium(x.sodium),`${x.sodium} ммоль/л`),
  item('bicarbonate','Бикарбонат',scoreSAPS2Bicarbonate(x.bicarbonate),`${x.bicarbonate} ммоль/л`),
  item('bilirubin','Билирубин',scoreSAPS2Bilirubin(x.bilirubin),`${x.bilirubin} мкмоль/л`),
  item('gcs','Шкала комы Глазго',scoreSAPS2GCS(x.gcs),`GCS ${x.gcs}`),
 ]
 const physiologyPoints=items.reduce((s,i)=>s+i.points,0)
 const agePoints=scoreSAPS2Age(x.age),admissionPoints=scoreSAPS2Admission(x.admissionType),chronicPoints=scoreSAPS2Chronic(x.chronicDisease)
 const total=physiologyPoints+agePoints+admissionPoints+chronicPoints
 const logit=-7.7631+0.0737*total+0.9971*Math.log(total+1)
 const mortalityProbability=100/(1+Math.exp(-logit))
 return {physiologyPoints,agePoints,admissionPoints,chronicPoints,total,logit,mortalityProbability,items}
}
