import {describe,expect,it} from 'vitest'
import {calculateSOFA2,scoreSOFA2Brain,scoreSOFA2Cardiovascular,scoreSOFA2Hemostasis,scoreSOFA2Kidney,scoreSOFA2Liver,scoreSOFA2Respiratory,type SOFA2Input} from './sofa2'

describe('SOFA-2 respiratory thresholds',()=>{
  const cases:[number,number][]=[[301,0],[300,1],[226,1],[225,2],[151,2],[150,3],[76,3],[75,4]]
  cases.forEach(([ratio,expected])=>it(`PaO2/FiO2 ${ratio} => ${expected}`,()=>{
    expect(scoreSOFA2Respiratory({pao2:ratio,fio2:100,spo2:null,respiratorySupport:'advanced',ecmoForRespiratoryFailure:false,vaEcmoForCardiovascularFailure:false}).points).toBe(expected)
  }))
  it('caps score at 2 without advanced support unless support is unavailable or limited',()=>{
    expect(scoreSOFA2Respiratory({pao2:50,fio2:100,spo2:null,respiratorySupport:'none',ecmoForRespiratoryFailure:false,vaEcmoForCardiovascularFailure:false}).points).toBe(2)
    expect(scoreSOFA2Respiratory({pao2:50,fio2:100,spo2:null,respiratorySupport:'ceiling',ecmoForRespiratoryFailure:false,vaEcmoForCardiovascularFailure:false}).points).toBe(4)
  })
  it('uses SpO2/FiO2 only when SpO2 is below 98 and PaO2 is unavailable',()=>{
    expect(scoreSOFA2Respiratory({pao2:null,fio2:50,spo2:97,respiratorySupport:'advanced',ecmoForRespiratoryFailure:false,vaEcmoForCardiovascularFailure:false}).points).toBe(3)
    expect(scoreSOFA2Respiratory({pao2:null,fio2:50,spo2:98,respiratorySupport:'advanced',ecmoForRespiratoryFailure:false,vaEcmoForCardiovascularFailure:false}).points).toBeNull()
  })
  it('checks SpO2/FiO2 boundaries at 300, 250, 200 and 120',()=>{
    const score=(spo2:number,fio2:number,support:'advanced'|'none'|'ceiling'='advanced')=>scoreSOFA2Respiratory({pao2:null,fio2,spo2,respiratorySupport:support,ecmoForRespiratoryFailure:false,vaEcmoForCardiovascularFailure:false}).points
    expect(score(90,30)).toBe(1) // 300
    expect(score(75,30)).toBe(2) // 250
    expect(score(60,30)).toBe(3) // 200
    expect(score(72,60)).toBe(4) // 120
    expect(score(60,30,'none')).toBe(2)
    expect(score(60,30,'ceiling')).toBe(3)
  })
  it('scores respiratory ECMO as 4 regardless of ratio',()=>{
    expect(scoreSOFA2Respiratory({pao2:null,fio2:null,spo2:null,respiratorySupport:'none',ecmoForRespiratoryFailure:true,vaEcmoForCardiovascularFailure:false}).points).toBe(4)
  })
  it('scores VA-ECMO for cardiovascular indication in both components',()=>{
    expect(scoreSOFA2Respiratory({pao2:null,fio2:null,spo2:null,respiratorySupport:'none',ecmoForRespiratoryFailure:false,vaEcmoForCardiovascularFailure:true}).points).toBe(4)
    expect(scoreSOFA2Cardiovascular({map:null,vasoactiveAvailability:'available',dopamineDose:null,norepinephrineDose:0,epinephrineDose:0,otherVasoactiveOrInotrope:false,mechanicalCirculatorySupport:true})).toBe(4)
  })
})
describe('SOFA-2 hemostasis and liver',()=>{
  const platelets:[number,number][]=[[151,0],[150,1],[101,1],[100,2],[81,2],[80,3],[51,3],[50,4]]
  platelets.forEach(([v,s])=>it(`platelets ${v} => ${s}`,()=>expect(scoreSOFA2Hemostasis(v)).toBe(s)))
  const bilirubin:[number,number][]=[[20.6,0],[20.7,1],[51.3,1],[51.4,2],[102.6,2],[102.7,3],[205,3],[205.1,4]]
  bilirubin.forEach(([v,s])=>it(`bilirubin ${v} => ${s}`,()=>expect(scoreSOFA2Liver(v)).toBe(s)))
})
describe('SOFA-2 cardiovascular',()=>{
  const base={map:70,vasoactiveAvailability:'available' as const,dopamineDose:null,norepinephrineDose:0,epinephrineDose:0,otherVasoactiveOrInotrope:false,mechanicalCirculatorySupport:false}
  const cases:[number,number][]=[[0,0],[0.1,2],[0.2,2],[0.201,3],[0.4,3],[0.401,4]]
  cases.forEach(([dose,score])=>it(`catecholamine sum ${dose} => ${score}`,()=>expect(scoreSOFA2Cardiovascular({...base,norepinephrineDose:dose})).toBe(score)))
  it('adds one severity category for other vasoactive/inotropic agents with low or medium catecholamine dose',()=>{
    expect(scoreSOFA2Cardiovascular({...base,otherVasoactiveOrInotrope:true})).toBe(2)
    expect(scoreSOFA2Cardiovascular({...base,norepinephrineDose:0.1,otherVasoactiveOrInotrope:true})).toBe(3)
    expect(scoreSOFA2Cardiovascular({...base,norepinephrineDose:0.3,otherVasoactiveOrInotrope:true})).toBe(4)
  })
  it('sums norepinephrine and epinephrine doses before assigning the category',()=>{
    expect(scoreSOFA2Cardiovascular({...base,norepinephrineDose:0.1,epinephrineDose:0.1})).toBe(2)
    expect(scoreSOFA2Cardiovascular({...base,norepinephrineDose:0.1,epinephrineDose:0.11})).toBe(3)
    expect(scoreSOFA2Cardiovascular({...base,norepinephrineDose:0.1,epinephrineDose:0.1,otherVasoactiveOrInotrope:true})).toBe(3)
    expect(scoreSOFA2Cardiovascular({...base,norepinephrineDose:0.15,epinephrineDose:0.1,otherVasoactiveOrInotrope:true})).toBe(4)
  })
  it('mechanical circulatory support scores 4',()=>expect(scoreSOFA2Cardiovascular({...base,mechanicalCirculatorySupport:true})).toBe(4))
  it('scores dopamine as a single vasopressor using its specific cutoffs',()=>{
    expect(scoreSOFA2Cardiovascular({...base,dopamineDose:20})).toBe(2)
    expect(scoreSOFA2Cardiovascular({...base,dopamineDose:20.1})).toBe(3)
    expect(scoreSOFA2Cardiovascular({...base,dopamineDose:40})).toBe(3)
    expect(scoreSOFA2Cardiovascular({...base,dopamineDose:40.1})).toBe(4)
  })
  it('uses specific MAP thresholds when vasopressors are unavailable or precluded by treatment ceiling',()=>{
    const score=(map:number,vasoactiveAvailability:'unavailable'|'ceiling')=>scoreSOFA2Cardiovascular({...base,map,vasoactiveAvailability})
    expect(score(70,'unavailable')).toBe(0)
    expect(score(69,'unavailable')).toBe(1)
    expect(score(60,'unavailable')).toBe(1)
    expect(score(59,'unavailable')).toBe(2)
    expect(score(50,'ceiling')).toBe(2)
    expect(score(49,'ceiling')).toBe(3)
    expect(score(40,'ceiling')).toBe(3)
    expect(score(39,'ceiling')).toBe(4)
  })
  it('uses MAP only when no vasoactive support is used and treats missing MAP as untestable',()=>{
    expect(scoreSOFA2Cardiovascular({...base,map:69})).toBe(1)
    expect(scoreSOFA2Cardiovascular({...base,map:null})).toBeNull()
    expect(scoreSOFA2Cardiovascular({...base,map:null,norepinephrineDose:0.1})).toBe(2)
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
  const base={creatinine:null,urineOutputMlKgH:null,urineOutputDuration:'none' as const,rrtStatus:'none' as const,potassium:null,ph:null,bicarbonate:null}
  const cr:[number,number][]=[[110,0],[110.1,1],[170,1],[170.1,2],[300,2],[300.1,3]]
  cr.forEach(([v,s])=>it(`creatinine ${v} => ${s}`,()=>expect(scoreSOFA2Kidney({...base,creatinine:v})).toBe(s)))
  it('does not treat absent creatinine and urine output as normal',()=>expect(scoreSOFA2Kidney(base)).toBeNull())
  it('scores urine output by threshold and duration',()=>{
    expect(scoreSOFA2Kidney({...base,urineOutputMlKgH:0.4,urineOutputDuration:'6-12'})).toBe(1)
    expect(scoreSOFA2Kidney({...base,urineOutputMlKgH:0.5,urineOutputDuration:'6-12'})).toBe(0)
    expect(scoreSOFA2Kidney({...base,urineOutputMlKgH:0.4,urineOutputDuration:'12+'})).toBe(2)
    expect(scoreSOFA2Kidney({...base,urineOutputMlKgH:0.49,urineOutputDuration:'24+'})).toBe(2)
    expect(scoreSOFA2Kidney({...base,urineOutputMlKgH:0.29,urineOutputDuration:'24+'})).toBe(3)
    expect(scoreSOFA2Kidney({...base,urineOutputMlKgH:0,urineOutputDuration:'anuria12'})).toBe(3)
  })
  it('scores renal RRT and ongoing intermittent RRT off-days as 4',()=>{
    expect(scoreSOFA2Kidney({...base,rrtStatus:'receiving'})).toBe(4)
    expect(scoreSOFA2Kidney({...base,rrtStatus:'intermittentOffDay'})).toBe(4)
  })
  it('does not count RRT exclusively for nonrenal indications',()=>{
    expect(scoreSOFA2Kidney({...base,creatinine:150,rrtStatus:'nonrenalOnly'})).toBe(1)
  })
  it('scores RRT criteria when treatment is unavailable or delayed',()=>{
    expect(scoreSOFA2Kidney({...base,creatinine:150,rrtStatus:'unavailableOrDelayed',potassium:6})).toBe(4)
    expect(scoreSOFA2Kidney({...base,creatinine:150,rrtStatus:'unavailableOrDelayed',potassium:5.9,ph:7.2,bicarbonate:12})).toBe(4)
    expect(scoreSOFA2Kidney({...base,creatinine:150,rrtStatus:'unavailableOrDelayed',potassium:5.9,ph:7.21,bicarbonate:12})).toBe(1)
    expect(scoreSOFA2Kidney({...base,creatinine:100,urineOutputMlKgH:0.29,urineOutputDuration:'6-12',rrtStatus:'unavailableOrDelayed',potassium:6})).toBe(4)
  })
  it('returns NT if RRT criteria may be met but required biochemical data are incomplete',()=>{
    expect(scoreSOFA2Kidney({...base,creatinine:150,rrtStatus:'unavailableOrDelayed',potassium:null,ph:null,bicarbonate:null})).toBeNull()
    expect(scoreSOFA2Kidney({...base,creatinine:150,rrtStatus:'unavailableOrDelayed',potassium:5.9,ph:null,bicarbonate:null})).toBeNull()
  })
  it('returns NT for inconsistent urine duration data',()=>{
    expect(scoreSOFA2Kidney({...base,urineOutputMlKgH:0.4,urineOutputDuration:'none'})).toBeNull()
    expect(scoreSOFA2Kidney({...base,urineOutputMlKgH:null,urineOutputDuration:'12+'})).toBeNull()
  })
})
describe('calculateSOFA2',()=>{
  const normal:SOFA2Input={pao2:100,fio2:30,spo2:null,respiratorySupport:'none',ecmoForRespiratoryFailure:false,vaEcmoForCardiovascularFailure:false,platelets:200,bilirubin:10,map:80,vasoactiveAvailability:'available',dopamineDose:null,norepinephrineDose:0,epinephrineDose:0,otherVasoactiveOrInotrope:false,mechanicalCirculatorySupport:false,gcs:15,motorScore:null,preSedationGcsUnknown:false,deliriumMedication:false,creatinine:80,urineOutputMlKgH:null,urineOutputDuration:'none',rrtStatus:'none',potassium:null,ph:null,bicarbonate:null}
  it('returns 0 for normal parameters',()=>expect(calculateSOFA2(normal).total).toBe(0))
  it('returns null total if a component cannot be assessed',()=>expect(calculateSOFA2({...normal,gcs:null}).total).toBeNull())
  it('returns null total when MAP is missing without cardiovascular support',()=>expect(calculateSOFA2({...normal,map:null}).total).toBeNull())
  it('returns null total when both kidney inputs are missing',()=>expect(calculateSOFA2({...normal,creatinine:null,urineOutputMlKgH:null}).total).toBeNull())
  it('sums six maximum components to 24',()=>{
    const severe={...normal,pao2:50,fio2:100,respiratorySupport:'advanced' as const,platelets:20,bilirubin:300,map:60,norepinephrineDose:0.5,gcs:3,creatinine:400,rrtStatus:'receiving'}
    expect(calculateSOFA2(severe).total).toBe(24)
  })
})
