import {useState,type FormEvent} from 'react'
import {ArrowLeft,BookOpen,RotateCcw,ShieldAlert,ShieldCheck} from 'lucide-react'
import {Link} from 'react-router-dom'
import {calculateAPACHE2,type APACHE2Input,type APACHE2Result} from './apache2'
import {APACHE2_REFERENCE} from './apache2.reference'
const initial={temperature:'',map:'',heartRate:'',respiratoryRate:'',fio2:'',oxygenMode:'',pao2:'',aaGradient:'',acidMode:'',ph:'',bicarbonate:'',sodium:'',potassium:'',creatinine:'',acuteRenalFailure:false,hematocrit:'',whiteBloodCells:'',gcs:'',age:'',chronicHealth:''}
type Values=typeof initial
function Field({label,unit,value,onChange,min,max,step='1'}:{label:string;unit:string;value:string;onChange:(v:string)=>void;min:number;max:number;step?:string}){return <label className="calc-field"><span>{label} <small>{unit}</small></span><input type="number" inputMode="decimal" min={min} max={max} step={step} placeholder="Введите значение" value={value} onChange={e=>onChange(e.target.value)}/></label>}
export default function APACHE2Calculator(){
 const [v,setV]=useState<Values>(initial);const [result,setResult]=useState<APACHE2Result|null>(null);const [error,setError]=useState('')
 function update<K extends keyof Values>(k:K,value:Values[K]){setV(s=>({...s,[k]:value}));setResult(null);setError('')}
 function reset(){setV(initial);setResult(null);setError('')}
 function calculate(e:FormEvent<HTMLFormElement>){e.preventDefault()
  const required=['temperature','map','heartRate','respiratoryRate','fio2','oxygenMode','acidMode','sodium','potassium','creatinine','hematocrit','whiteBloodCells','gcs','age','chronicHealth'] as const
  if(required.some(k=>String(v[k]).trim()==='')||(v.oxygenMode==='pao2'&&v.pao2==='')||(v.oxygenMode==='gradient'&&v.aaGradient==='')||(v.acidMode==='ph'&&v.ph==='')||(v.acidMode==='bicarbonate'&&v.bicarbonate==='')){setError('Заполните все обязательные поля и выберите вариант оценки оксигенации и кислотно-основного состояния.');setResult(null);return}
  const nums=[v.temperature,v.map,v.heartRate,v.respiratoryRate,v.fio2,v.sodium,v.potassium,v.creatinine,v.hematocrit,v.whiteBloodCells,v.gcs,v.age,...(v.pao2!==''?[v.pao2]:[]),...(v.aaGradient!==''?[v.aaGradient]:[]),...(v.ph!==''?[v.ph]:[]),...(v.bicarbonate!==''?[v.bicarbonate]:[])]
  if(nums.some(s=>!Number.isFinite(Number(s)))){setError('Проверьте числовые поля.');return}
  const n=Object.fromEntries(nums.map((s)=>[s,Number(s)]))
  const ranges:[[string,number,number]]|any=[
   ['temperature',20,45],['map',1,250],['heartRate',1,300],['respiratoryRate',1,100],['fio2',21,100],['sodium',50,250],['potassium',0.1,15],['creatinine',1,3000],['hematocrit',1,80],['whiteBloodCells',0,200],['gcs',3,15],['age',18,120],['pao2',1,800],['aaGradient',0,1000],['ph',6,8.5],['bicarbonate',1,100]]
  if(ranges.some(([k,min,max]:[string,number,number])=>v[k as keyof Values]!==''&&(n[k]<min||n[k]>max))||!Number.isInteger(Number(v.map))||!Number.isInteger(Number(v.heartRate))||!Number.isInteger(Number(v.respiratoryRate))||!Number.isInteger(Number(v.gcs))||!Number.isInteger(Number(v.age))||!Number.isInteger(Number(v.fio2))|| (v.oxygenMode==='pao2'&&Number(v.fio2)>=50)||(v.oxygenMode==='gradient'&&Number(v.fio2)<50)){
   setError('Проверьте допустимые диапазоны. FiO₂ ≥50% требует A–aDO₂, а FiO₂ <50% требует PaO₂.');setResult(null);return
  }
  const input:APACHE2Input={temperature:Number(v.temperature),map:Number(v.map),heartRate:Number(v.heartRate),respiratoryRate:Number(v.respiratoryRate),fio2:Number(v.fio2),pao2:v.oxygenMode==='pao2'?Number(v.pao2):null,aaGradient:v.oxygenMode==='gradient'?Number(v.aaGradient):null,ph:v.acidMode==='ph'?Number(v.ph):null,bicarbonate:v.acidMode==='bicarbonate'?Number(v.bicarbonate):null,sodium:Number(v.sodium),potassium:Number(v.potassium),creatinine:Number(v.creatinine),acuteRenalFailure:v.acuteRenalFailure,hematocrit:Number(v.hematocrit),whiteBloodCells:Number(v.whiteBloodCells),gcs:Number(v.gcs),age:Number(v.age),chronicHealth:v.chronicHealth as APACHE2Input['chronicHealth']}
  setResult(calculateAPACHE2(input));setError('')
 }
 return <main className="app-shell calculator-shell">
  <div className="calculator-topline"><Link className="back-link" to="/"><ArrowLeft size={16}/> Все калькуляторы</Link><span className="version-label">НЕОТЛОЖНАЯ МЕДИЦИНА · APACHE II</span></div>
  <section className="calculator-heading"><div className="eyebrow"><span className="pulse-dot"/> ОЦЕНКА ТЯЖЕСТИ СОСТОЯНИЯ</div><h1>APACHE II</h1><p>Acute Physiology and Chronic Health Evaluation II — оценка тяжести состояния взрослых пациентов отделения интенсивной терапии.</p></section>
  <div className="calculator-layout sofa-layout"><form className="calculator-panel" onSubmit={calculate}>
   <div className="panel-heading"><div><span className="panel-kicker">ШАГ 1</span><h2>Физиологические показатели</h2></div><span className="points-label">12 показателей</span></div>
   <section className="sofa-section"><h3>1. Основные показатели</h3><div className="field-grid">
    <Field label="Температура тела" unit="°C · центральная" value={v.temperature} onChange={x=>update('temperature',x)} min={20} max={45} step="0.1"/>
    <Field label="Среднее АД (MAP)" unit="мм рт. ст." value={v.map} onChange={x=>update('map',x)} min={1} max={250}/>
    <Field label="Частота сердечных сокращений" unit="/мин" value={v.heartRate} onChange={x=>update('heartRate',x)} min={1} max={300}/>
    <Field label="Частота дыхания" unit="/мин" value={v.respiratoryRate} onChange={x=>update('respiratoryRate',x)} min={1} max={100}/>
   </div></section>
   <section className="sofa-section"><h3>2. Оксигенация</h3><Field label="FiO₂" unit="% · 21–100" value={v.fio2} onChange={x=>update('fio2',x)} min={21} max={100}/>
    <label className="calc-field"><span>Показатель по FiO₂</span><select value={v.oxygenMode} onChange={e=>update('oxygenMode',e.target.value as Values['oxygenMode'])}><option value="">Выберите вариант</option><option value="pao2">FiO₂ &lt;50% — PaO₂</option><option value="gradient">FiO₂ ≥50% — A–aDO₂</option></select></label>
    {v.oxygenMode==='pao2'&&<Field label="PaO₂" unit="мм рт. ст." value={v.pao2} onChange={x=>update('pao2',x)} min={1} max={800}/>}
    {v.oxygenMode==='gradient'&&<Field label="A–aDO₂" unit="мм рт. ст." value={v.aaGradient} onChange={x=>update('aaGradient',x)} min={0} max={1000}/>}
    <p className="field-hint">При FiO₂ ровно 0,5 и выше используется альвеолярно-артериальный градиент; ниже 0,5 — PaO₂.</p>
   </section>
   <section className="sofa-section"><h3>3. Кислотно-основное состояние</h3><label className="calc-field"><span>Метод оценки</span><select value={v.acidMode} onChange={e=>update('acidMode',e.target.value as Values['acidMode'])}><option value="">Выберите вариант</option><option value="ph">Есть артериальные газы — pH</option><option value="bicarbonate">Нет ABG — бикарбонат HCO₃⁻</option></select></label>
    {v.acidMode==='ph'&&<Field label="Артериальный pH" unit="ед." value={v.ph} onChange={x=>update('ph',x)} min={6} max={8.5} step="0.01"/>}
    {v.acidMode==='bicarbonate'&&<Field label="Бикарбонат" unit="ммоль/л · венозный" value={v.bicarbonate} onChange={x=>update('bicarbonate',x)} min={1} max={100} step="0.1"/>}
   </section>
   <section className="sofa-section"><h3>4. Лабораторные показатели</h3><div className="field-grid">
    <Field label="Натрий" unit="ммоль/л" value={v.sodium} onChange={x=>update('sodium',x)} min={50} max={250}/>
    <Field label="Калий" unit="ммоль/л" value={v.potassium} onChange={x=>update('potassium',x)} min={0.1} max={15} step="0.1"/>
    <Field label="Креатинин" unit="мкмоль/л" value={v.creatinine} onChange={x=>update('creatinine',x)} min={1} max={3000} step="0.1"/>
    <Field label="Гематокрит" unit="%" value={v.hematocrit} onChange={x=>update('hematocrit',x)} min={1} max={80} step="0.1"/>
    <Field label="Лейкоциты" unit="×10⁹/л" value={v.whiteBloodCells} onChange={x=>update('whiteBloodCells',x)} min={0} max={200} step="0.1"/>
   </div><label className="sofa-check"><input type="checkbox" checked={v.acuteRenalFailure} onChange={e=>update('acuteRenalFailure',e.target.checked)}/> Острая почечная недостаточность — удвоить баллы креатинина</label></section>
   <section className="sofa-section"><h3>5. Неврологический статус</h3><Field label="Шкала комы Глазго (GCS)" unit="3–15" value={v.gcs} onChange={x=>update('gcs',x)} min={3} max={15}/><p className="field-hint">Неврологический компонент = 15 − GCS. Используйте наиболее отклонённую достоверную оценку за первые 24 часа.</p></section>
   <section className="sofa-section"><h3>6. Возраст и хроническое состояние здоровья</h3><div className="field-grid"><Field label="Возраст" unit="лет" value={v.age} onChange={x=>update('age',x)} min={18} max={120}/></div>
    <label className="calc-field"><span>Хроническое состояние здоровья до текущей госпитализации</span><select value={v.chronicHealth} onChange={e=>update('chronicHealth',e.target.value as Values['chronicHealth'])}><option value="">Выберите</option><option value="none">Нет тяжёлой хронической органной недостаточности / иммунокомпрометации</option><option value="elective">Есть; плановый послеоперационный пациент (+2)</option><option value="nonoperative">Есть; неоперированный пациент (+5)</option><option value="emergency">Есть; экстренный послеоперационный пациент (+5)</option></select></label>
    <p className="field-hint">Учитывается только тяжёлая органная недостаточность или иммунокомпрометированное состояние, существовавшие до текущей госпитализации.</p>
   </section>
   {error&&<p className="form-error" role="alert">{error}</p>}<div className="calculator-actions"><button className="primary-button" type="submit">Рассчитать APACHE II</button><button className="reset-button" type="button" onClick={reset}><RotateCcw size={15}/> Сбросить</button></div><p className="privacy-note"><ShieldCheck size={14}/> Данные не отправляются на сервер и не сохраняются.</p>
  </form><aside className="calculator-aside"><div className="info-panel"><div className="info-icon"><BookOpen size={18}/></div><h3>Из чего складывается балл?</h3><ul><li>12 физиологических показателей</li><li>Возраст: 0–6 баллов</li><li>Хроническое здоровье: 0, 2 или 5 баллов</li></ul><p>Итоговый диапазон — 0–71 балл.</p></div><div className="threshold-panel"><h3>Окно оценки</h3><p>Используются наиболее отклонённые значения каждого физиологического показателя за первые 24 часа в ОРИТ.</p><p>Более высокий балл связан с большей госпитальной летальностью, но не является индивидуальной вероятностью смерти.</p></div></aside></div>
  {result&&<section className="result-panel" aria-live="polite"><div className="result-topline"><span className="panel-kicker">РЕЗУЛЬТАТ РАСЧЁТА</span><span className="risk-tag risk-low">Оценка APACHE II</span></div><div className="score-display"><strong>{result.total}</strong><span>/ 71 балл</span></div><div className="score-breakdown"><p>Острые физиологические показатели: <b>{result.acutePhysiology}</b></p><p>Возраст: <b>{result.agePoints}</b></p><p>Хроническое состояние здоровья: <b>{result.chronicPoints}</b></p></div><h3>Разбор 12 физиологических показателей</h3><div className="criteria-list">{result.items.map(i=><div className="criterion-row" key={i.key}><span className={i.points?'criterion-point active':'criterion-point'}>{i.points?i.points:0}</span><span><b>{i.label}</b><small>{i.detail}</small></span><span className="criterion-status">{i.points} балл.</span></div>)}</div><p className="clinical-warning"><ShieldAlert size={14}/> APACHE II — инструмент оценки тяжести группы пациентов ОРИТ, не самостоятельный диагноз и не индивидуальный прогноз. Клиническое решение принимается с учётом контекста.</p></section>}
  <section className="reference-panel"><div><span className="panel-kicker">ИСТОЧНИК И МЕТОДИКА</span><h2>{APACHE2_REFERENCE.title}</h2><p>{APACHE2_REFERENCE.originalSource}</p></div><a href={APACHE2_REFERENCE.originalUrl} target="_blank" rel="noreferrer">Оригинальная публикация ↗</a><a href={APACHE2_REFERENCE.scoringUrl} target="_blank" rel="noreferrer">Таблица баллов ↗</a><small>{APACHE2_REFERENCE.organisation}. Проверено: {APACHE2_REFERENCE.accessed}. {APACHE2_REFERENCE.notes[0]}</small></section><p className="calculator-disclaimer">Образовательный инструмент для взрослых пациентов ОРИТ. Не заменяет клиническую оценку, локальные протоколы и решение специалиста.</p>
 </main>
}
