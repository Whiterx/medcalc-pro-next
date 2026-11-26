import {describe,expect,it} from 'vitest'
import {calculateSOFA2,scoreSOFA2Brain,scoreSOFA2Cardiovascular,scoreSOFA2Hemostasis,scoreSOFA2Kidney,scoreSOFA2Liver,scoreSOFA2Respiratory,type SOFA2Input} from './sofa2'

describe('SOFA-2 respiratory thresholds',()=>{
  const cases:[number,number][]=[[301,0],[300,1],[226,1],[225,2],[151,2],[150,3],[76,3],[75,4]]
  cases.forEach(([ratio,expected])=>it(`PaO2/FiO2 ${ratio} => ${expected}`,()=>{
    expect(scoreSOFA2Respiratory({pao2:ratio,fio2:100,spo2:null,respiratorySupport:'advanced',ecmoForRespiratoryFailure:false}).points).toBe(expected)
  }))
  it('caps score at 2 without advanced support unless support is unavailable or limited',()=>{
    expect(scoreSOFA2Respiratory({pao2:50,fio2:100,spo2:null,respiratorySupport:'none',ecmoForRespiratoryFailure:false}).points).toBe(2)
    expect(scoreSOFA2Respiratory({pao2:50,fio2:100,spo2:null,respiratorySupport:'ceiling',ecmoForRespiratoryFailure:false}).points).toBe(4)
  })
  it('uses SpO2/FiO2 only when SpO2 is below 98 and PaO2 is unavailable',()=>{
    expect(scoreSOFA2Respiratory({pao2:null,fio2:50,spo2:97,respiratorySupport:'advanced',ecmoForRespiratoryFailure:false}).points).toBe(3)
    expect(scoreSOFA2Respiratory({pao2:null,fio2:50,spo2:98,respiratorySupport:'advanced',ecmoForRespiratoryFailure:false}).points).toBeNull()
  })
  it('scores respiratory ECMO as 4 regardless of ratio',()=>{
    expect(scoreSOFA2Respiratory({pao2:null,fio2:null,spo2:null,respiratorySupport:'none',ecmoForRespiratoryFailure:true}).points).toBe(4)
  })
})
describe('SOFA-2 hemostasis and liver',()=>{
  const platelets:[number,number][]=[[151,0],[150,1],[101,1],[100,2],[81,2],[80,3],[51,3],[50,4]]
  platelets.forEach(([v,s])=>it(`platelets ${v} => ${s}`,()=>expect(scoreSOFA2Hemostasis(v)).toBe(s)))
  const bilirubin:[number,number][]=[[20.6,0],[20.7,1],[51.3,1],[51.4,2],[102.6,2],[102.7,3],[205,3],[205.1,4]]
  bilirubin.forEach(([v,s])=>it(`bilirubin ${v} => ${s}`,()=>expect(scoreSOFA2Liver(v)).toBe(s)))
})
describe('SOFA-2 cardiovascular',()=>{
  const base={map:70,norepinephrineDose:0,epinephrineDose:0,otherVasoactiveOrInotrope:false,mechanicalCirculatorySupport:false}
  const cases:[number,number][]=[[0,0],[0.1,2],[0.2,2],[0.201,3],[0.4,3],[0.401,4]]
  cases.forEach(([dose,score])=>it(`catecholamine sum ${dose} => ${score}`,()=>expect(scoreSOFA2Cardiovascular({...base,norepinephrineDose:dose})).toBe(score)))
  it('adds one severity category for other vasoactive/inotropic agents with low or medium catecholamine dose',()=>{
    expect(scoreSOFA2Cardiovascular({...base,otherVasoactiveOrInotrope:true})).toBe(2)
    expect(scoreSOFA2Cardiovascular({...base,norepinephrineDose:0.1,otherVasoactiveOrInotrope:true})).toBe(3)
    expect(scoreSOFA2Cardiovascular({...base,norepinephrineDose:0.3,otherVasoactiveOrInotrope:true})).toBe(4)
  })
  it('mechanical circulatory support scores 4',()=>expect(scoreSOFA2Cardiovascular({...base,mechanicalCirculatorySupport:true})).toBe(4))
  it('uses MAP only when no vasoactive support is used',()=>{
    expect(scoreSOFA2Cardiovascular({...base,map:69})).toBe(1)
  })
})
describe('SOFA-2 brain',()=>{
  const cases:[number,number][]=[[15,0],[14,1],[13,1],[12,2],[9,2],[8,3],[6,3],[5,4],[3,4]]
  cases.forEach(([gcs,s])=>it(`GCS ${gcs} => ${s}`,()=>expect(scoreSOFA2Brain({gcs,motorScore:null,preSedationGcsUnknown:false,deliriumMedication:false})).toBe(s)))
  it('scores delirium treatment as at least 1 even with GCS 15 or unknown pre-sedation GCS',()=>{
    expect(scoreSOFA2Brain({gcs:15,motorScore:null,preSedationGcsUnknown:false,deliriumMedication:true})).toBe(1)
    expect(scoreSOFA2Brain({gcs:null,motorScore:null,preSedationGcsUnknown:true,deliriumMedication:true})).toBe(1)
  })
  it('uses motor response if full GCS unavailable and 0 if pre-sedation GCS unknown',()=>{
    expect(scoreSOFA2Brain({gcs:null,motorScore:5,preSedationGcsUnknown:false,deliriumMedication:false})).toBe(1)
    expect(scoreSOFA2Brain({gcs:null,motorScore:null,preSedationGcsUnknown:true,deliriumMedication:false})).toBe(0)
    expect(scoreSOFA2Brain({gcs:null,motorScore:null,preSedationGcsUnknown:false,deliriumMedication:false})).toBeNull()
  })
})
describe('SOFA-2 kidney',()=>{
  const base={creatinine:null,urineOutputMlKgH:null,urineOutputDuration:'none' as const,receivingRRT:false}
  const cr:[number,number][]=[[110,0],[111,1],[170,1],[171,2],[300,2],[301,3]]
  cr.forEach(([v,s])=>it(`creatinine ${v} => ${s}`,()=>expect(scoreSOFA2Kidney({...base,creatinine:v})).toBe(s)))
  it('scores oliguria by duration and anuria separately',()=>{
    expect(scoreSOFA2Kidney({...base,urineOutputMlKgH:0.4,urineOutputDuration:'6-12'})).toBe(1)
    expect(scoreSOFA2Kidney({...base,urineOutputMlKgH:0.4,urineOutputDuration:'12+'})).toBe(2)
    expect(scoreSOFA2Kidney({...base,urineOutputMlKgH:0.2,urineOutputDuration:'24+'})).toBe(3)
    expect(scoreSOFA2Kidney({...base,urineOutputMlKgH:0,urineOutputDuration:'anuria12'})).toBe(3)
    expect(scoreSOFA2Kidney({...base,receivingRRT:true})).toBe(4)
  })
})
describe('calculateSOFA2',()=>{
  const normal:SOFA2Input={pao2:100,fio2:30,spo2:null,respiratorySupport:'none',ecmoForRespiratoryFailure:false,platelets:200,bilirubin:10,map:80,norepinephrineDose:0,epinephrineDose:0,otherVasoactiveOrInotrope:false,mechanicalCirculatorySupport:false,gcs:15,motorScore:null,preSedationGcsUnknown:false,deliriumMedication:false,creatinine:80,urineOutputMlKgH:null,urineOutputDuration:'none',receivingRRT:false}
  it('returns 0 for normal parameters',()=>expect(calculateSOFA2(normal).total).toBe(0))
  it('returns null total if a component cannot be assessed',()=>expect(calculateSOFA2({...normal,gcs:null}).total).toBeNull())
  it('sums six maximum components to 24',()=>{
    const severe={...normal,pao2:50,fio2:100,respiratorySupport:'advanced' as const,platelets:20,bilirubin:300,map:60,norepinephrineDose:0.5,gcs:3,creatinine:400,receivingRRT:true}
    expect(calculateSOFA2(severe).total).toBe(24)
  })
})
