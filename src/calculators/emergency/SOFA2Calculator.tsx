import { useState, type FormEvent } from 'react'
import { ArrowLeft, BookOpen, RotateCcw, ShieldAlert, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { calculateSOFA2, type SOFA2Input, type SOFA2Result } from './sofa2'
import { SOFA2_REFERENCE } from './sofa2.reference'

const initial = {
  pao2:'', spo2:'', fio2:'', respiratorySupport:'', ecmo:'', platelets:'', bilirubin:'', map:'',
  norepinephrineEnabled:false, norepinephrineDose:'', epinephrineEnabled:false, epinephrineDose:'',
  dopamineEnabled:false, dopamineDose:'', otherVasoactive:false, mechanicalSupport:false, cardiovascularEcmo:false,
  vasoactiveAvailability:'', vasoactiveDurationConfirmed:false,
  gcs:'', motorScore:'', preSedationUnknown:false, deliriumMedication:false,
  creatinine:'', urineRate:'', urineDuration:'', rrtStatus:'', potassium:'', ph:'', bicarbonate:'',
}
type Values=typeof initial
function NumberField({label,unit,value,onChange,min,max,step='any'}:{label:string;unit:string;value:string;onChange:(v:string)=>void;min:number;max?:number;step?:string}) {
  return <label className="calc-field"><span>{label} <small>{unit}</small></span><input type="number" inputMode="decimal" min={min} max={max} step={step} placeholder="Введите значение" value={value} onChange={e=>onChange(e.target.value)} /></label>
}
export default function SOFA2Calculator() {
  const [values,setValues]=useState<Values>(initial)
  const [result,setResult]=useState<SOFA2Result|null>(null)
  const [error,setError]=useState('')
  const hasVasoactiveMedication=values.norepinephrineEnabled||values.epinephrineEnabled||values.dopamineEnabled||values.otherVasoactive
  const hasCardiovascularSupport=hasVasoactiveMedication||values.mechanicalSupport||values.cardiovascularEcmo
  function update<K extends keyof Values>(key:K,value:Values[K]) {
    setValues(current=>({...current,[key]:value,...((key==='norepinephrineDose'||key==='epinephrineDose'||key==='dopamineDose')?{vasoactiveDurationConfirmed:false}:{})})); setResult(null); setError('')
  }
  function reset(){setValues(initial);setResult(null);setError('')}
  function updateRRTStatus(value:string){
    setValues(current=>({...current,rrtStatus:value,...(value==='unavailableOrDelayed'?{}:{potassium:'',ph:'',bicarbonate:''})}));
    setResult(null);setError('')
  }
  function updateVasoactiveFlag(key:'norepinephrineEnabled'|'epinephrineEnabled'|'dopamineEnabled'|'otherVasoactive',checked:boolean){
    setValues(current=>{
      const next={...current,[key]:checked}
      const hasMedication=next.norepinephrineEnabled||next.epinephrineEnabled||next.dopamineEnabled||next.otherVasoactive
      return {...next,
        ...(key==='norepinephrineEnabled'&&!checked?{norepinephrineDose:''}:{}),
        ...(key==='epinephrineEnabled'&&!checked?{epinephrineDose:''}:{}),
        ...(key==='dopamineEnabled'&&!checked?{dopamineDose:''}:{}),
        vasoactiveDurationConfirmed:hasMedication?current.vasoactiveDurationConfirmed:false,
      }
    })
    setResult(null);setError('')
  }
  function handleCalculate(event:FormEvent<HTMLFormElement>){
    event.preventDefault()
    const hasVasoactiveMedication=values.norepinephrineEnabled||values.epinephrineEnabled||values.dopamineEnabled||values.otherVasoactive
    const hasCardiovascularSupport=hasVasoactiveMedication||values.mechanicalSupport||values.cardiovascularEcmo
    if((values.ecmo!=='yes'&&!values.cardiovascularEcmo&&values.fio2==='')||(values.ecmo!=='yes'&&!values.cardiovascularEcmo&&values.respiratorySupport==='')||values.platelets===''||values.bilirubin===''||(!hasCardiovascularSupport&&values.map==='')||
      (values.ecmo!=='yes'&&!values.cardiovascularEcmo&&values.pao2===''&&values.spo2==='')||
      (values.gcs===''&&values.motorScore===''&&!values.preSedationUnknown)||
      (values.creatinine===''&&values.urineRate===''&&!['receiving','intermittentOffDay'].includes(values.rrtStatus))){
      setError('Заполните обязательные параметры. Для дыхательной системы укажите PaO₂ или допустимое SpO₂; для мозга — GCS, двигательную реакцию или отметьте неизвестную GCS до седации; для почек — креатинин, диурез или RRT.')
      setResult(null);return
    }
    if(hasVasoactiveMedication&&values.vasoactiveAvailability!=='available'){
      setError('При введении вазоактивных препаратов укажите доступность терапии как «Доступна». Нельзя одновременно указывать введение препаратов и их недоступность/ограничение целями лечения.');setResult(null);return
    }
    if(hasVasoactiveMedication&&!values.vasoactiveDurationConfirmed){
      setError('Подтвердите, что вазоактивные препараты вводились не менее 1 часа, как предусмотрено методикой SOFA-2.');setResult(null);return
    }
    const numeric=[...(values.fio2!==''?[values.fio2]:[]),values.platelets,values.bilirubin,...(values.map!==''?[values.map]:[]),
      ...(values.pao2!==''?[values.pao2]:[]),...(values.spo2!==''?[values.spo2]:[]),
      ...(values.norepinephrineEnabled?[values.norepinephrineDose]:[]),
      ...(values.epinephrineEnabled?[values.epinephrineDose]:[]),...(values.dopamineEnabled?[values.dopamineDose]:[]),
      ...(values.creatinine!==''?[values.creatinine]:[]),...(values.urineRate!==''?[values.urineRate]:[]),...(values.potassium!==''?[values.potassium]:[]),...(values.ph!==''?[values.ph]:[]),...(values.bicarbonate!==''?[values.bicarbonate]:[])]
    if(numeric.some(v=>v.trim()===''||!Number.isFinite(Number(v)))){
      setError('Проверьте числовые поля и дозы выбранных препаратов.');setResult(null);return
    }
    if((values.fio2!==''&&(Number(values.fio2)<21||Number(values.fio2)>100))||
      (values.pao2!==''&&(Number(values.pao2)<1||Number(values.pao2)>800))||
      (values.spo2!==''&&(Number(values.spo2)<1||Number(values.spo2)>100))||
      Number(values.platelets)<0||Number(values.platelets)>1000||
      Number(values.bilirubin)<0||Number(values.bilirubin)>2000||
      (values.map!==''&&(Number(values.map)<1||Number(values.map)>250))||
      (values.norepinephrineEnabled&&Number(values.norepinephrineDose)<=0)||
      (values.epinephrineEnabled&&Number(values.epinephrineDose)<=0)||
      (values.dopamineEnabled&&Number(values.dopamineDose)<=0)||
      (values.creatinine!==''&&(Number(values.creatinine)<1||Number(values.creatinine)>3000))||
      (values.urineRate!==''&&(Number(values.urineRate)<0||Number(values.urineRate)>20))||
      (values.potassium!==''&&(Number(values.potassium)<0||Number(values.potassium)>20))||
      (values.ph!==''&&(Number(values.ph)<6||Number(values.ph)>8))||
      (values.bicarbonate!==''&&(Number(values.bicarbonate)<0||Number(values.bicarbonate)>100))){
      setError('Проверьте диапазоны и точность введённых значений. Дозы выбранных норэпинефрина, эпинефрина и дофамина должны быть больше 0 мкг/кг/мин.');setResult(null);return
    }
    if(values.gcs!==''&&values.motorScore!==''){
      setError('Укажите GCS или лучшую двигательную реакцию, но не оба значения одновременно.');setResult(null);return
    }
    if(values.preSedationUnknown&&(values.gcs!==''||values.motorScore!=='')){
      setError('Если GCS до седации неизвестна, не вводите GCS или двигательную реакцию.');setResult(null);return
    }
    if(values.pao2!==''&&values.spo2!==''){
      setError('Укажите только один показатель оксигенации: PaO₂/FiO₂ предпочтителен; SpO₂/FiO₂ применяется только если PaO₂ недоступно.');setResult(null);return
    }
    if(values.ecmo!=='yes'&&values.pao2===''&&Number(values.spo2)>=98){
      setError('SpO₂/FiO₂ допускается только при SpO₂ ниже 98% и отсутствии PaO₂.');setResult(null);return
    }
    if(values.urineRate!==''&&values.urineDuration===''){
      setError('Для диуреза обязательно укажите длительность периода олигурии/анурии.');setResult(null);return
    }
    if(values.urineDuration==='anuria12'&&values.urineRate!==''&&Number(values.urineRate)!==0){
      setError('Для категории «анурия ≥12 часов» скорость диуреза должна быть 0 мл/кг/ч.');setResult(null);return
    }
    if(values.rrtStatus===''){setError('Укажите статус заместительной почечной терапии.');setResult(null);return}
    const rrtTrigger=(values.creatinine!==''&&Number(values.creatinine)>110)||(values.urineRate!==''&&Number(values.urineRate)<0.3&&['6-12','12+','24+'].includes(values.urineDuration));
    if(values.rrtStatus==='unavailableOrDelayed'&&rrtTrigger&&values.potassium===''&&values.ph===''&&values.bicarbonate===''){setError('Для оценки критериев RRT укажите калий или одновременно pH и бикарбонат.');setResult(null);return}
    if(values.rrtStatus==='unavailableOrDelayed'&&rrtTrigger&&((values.ph==='')!==(values.bicarbonate===''))){setError('Для оценки ацидоза необходимо указать одновременно pH и бикарбонат.');setResult(null);return}
    if(values.urineRate===''&&values.urineDuration!==''){
      setError('Укажите скорость диуреза или очистите период диуреза.');setResult(null);return
    }
    const input:SOFA2Input={
      pao2:values.pao2===''?null:Number(values.pao2),fio2:values.fio2===''?null:Number(values.fio2),
      spo2:values.spo2===''?null:Number(values.spo2),
      respiratorySupport:values.respiratorySupport as SOFA2Input['respiratorySupport'],
      ecmoForRespiratoryFailure:values.ecmo==='yes',platelets:Number(values.platelets),
      bilirubin:Number(values.bilirubin),map:values.map===''?null:Number(values.map),
      norepinephrineDose:values.norepinephrineEnabled?Number(values.norepinephrineDose):0,
      epinephrineDose:values.epinephrineEnabled?Number(values.epinephrineDose):0,
      dopamineDose:values.dopamineEnabled?Number(values.dopamineDose):null,
      vasoactiveAvailability:values.vasoactiveAvailability as SOFA2Input['vasoactiveAvailability'],
      ecmoForCardiovascularIndication:values.cardiovascularEcmo,
      otherVasoactiveOrInotrope:values.otherVasoactive,mechanicalCirculatorySupport:values.mechanicalSupport||values.cardiovascularEcmo,
      gcs:values.gcs===''?null:Number(values.gcs),motorScore:values.motorScore===''?null:Number(values.motorScore),
      preSedationGcsUnknown:values.preSedationUnknown,deliriumMedication:values.deliriumMedication,
      creatinine:values.creatinine===''?null:Number(values.creatinine),
      urineOutputMlKgH:values.urineRate===''?null:Number(values.urineRate),
      urineOutputDuration:values.urineDuration as SOFA2Input['urineOutputDuration'],rrtStatus:values.rrtStatus as SOFA2Input['rrtStatus'],potassium:values.potassium===''?null:Number(values.potassium),ph:values.ph===''?null:Number(values.ph),bicarbonate:values.bicarbonate===''?null:Number(values.bicarbonate),
    }
    setResult(calculateSOFA2(input));setError('')
  }
  return <main className="app-shell calculator-shell">
    <div className="calculator-topline"><Link className="back-link" to="/"><ArrowLeft size={16}/> Все калькуляторы</Link><span className="version-label">НЕОТЛОЖНАЯ МЕДИЦИНА · SOFA-2</span></div>
    <section className="calculator-heading"><div className="eyebrow"><span className="pulse-dot"/> ОЦЕНКА ОРГАННОЙ ДИСФУНКЦИИ</div><h1>SOFA-2</h1><p>Обновлённая шкала Sequential Organ Failure Assessment для оценки шести систем органов у взрослых пациентов ОРИТ.</p></section>
    <div className="calculator-layout sofa-layout">
      <form className="calculator-panel" onSubmit={handleCalculate}>
        <div className="panel-heading"><div><span className="panel-kicker">ШАГ 1</span><h2>Параметры шести систем органов</h2></div><span className="points-label">0–24 балла</span></div>
        <section className="sofa-section"><h3>1. Дыхательная система</h3>
          <div className="field-grid"><NumberField label="PaO₂" unit="мм рт. ст. · предпочтительно" value={values.pao2} onChange={v=>update('pao2',v)} min={1} max={800}/><NumberField label="SpO₂" unit="% · только если PaO₂ недоступно" value={values.spo2} onChange={v=>update('spo2',v)} min={1} max={100}/></div>
          <NumberField label="FiO₂" unit="% · например, 40" value={values.fio2} onChange={v=>update('fio2',v)} min={21} max={100}/>
          <label className="calc-field"><span>Респираторная поддержка</span><select required={values.ecmo!=='yes'&&!values.cardiovascularEcmo} value={values.respiratorySupport} onChange={e=>update('respiratorySupport',e.target.value)}><option value="">Выберите</option><option value="none">Нет</option><option value="advanced">HFNC / CPAP / BiPAP / NIV / ИВЛ / домашняя вентиляция</option><option value="unavailable">Поддержка недоступна (ресурсное ограничение)</option><option value="ceiling">Поддержка ограничена целями лечения</option></select></label>
          <label className="sofa-check"><input type="checkbox" checked={values.ecmo==='yes'} onChange={e=>update('ecmo',e.target.checked?'yes':'no')}/> ECMO при дыхательной недостаточности</label>
          <p className="field-hint">SpO₂/FiO₂ можно использовать только при отсутствии PaO₂/FiO₂ и SpO₂ &lt;98%. Без расширенной поддержки обычно максимум 2 балла; при недоступности поддержки или ограничении уровня лечения оценка определяется отношением. ECMO при дыхательной недостаточности — 4 балла. Изменения PaO₂/FiO₂ или SpO₂/FiO₂ в пределах 1 часа (например, после санации дыхательных путей) не учитываются.</p>
        </section>
        <section className="sofa-section"><h3>2. Гемостаз</h3><NumberField label="Тромбоциты" unit="×10⁹/л" value={values.platelets} onChange={v=>update('platelets',v)} min={0} max={1000}/></section>
        <section className="sofa-section"><h3>3. Печень</h3><NumberField label="Общий билирубин" unit="мкмоль/л" value={values.bilirubin} onChange={v=>update('bilirubin',v)} min={0} max={2000} step="0.1"/></section>
        <section className="sofa-section"><h3>4. Сердечно-сосудистая система</h3>
          <NumberField label="Среднее АД (MAP)" unit={hasCardiovascularSupport?'мм рт. ст. · не требуется при поддержке':'мм рт. ст. · обязательно без поддержки'} value={values.map} onChange={v=>update('map',v)} min={1} max={250}/>
          <label className="calc-field"><span>Доступность вазоактивной терапии, если препараты не вводятся</span><select required={!hasVasoactiveMedication&&!values.mechanicalSupport&&!values.cardiovascularEcmo} value={values.vasoactiveAvailability} onChange={e=>update('vasoactiveAvailability',e.target.value)}><option value="">Не выбрано</option><option value="available">Доступна</option><option value="unavailable">Недоступна (ресурсное ограничение)</option><option value="ceiling">Ограничена целями лечения</option></select></label>
          <div className="field-grid"><label className="sofa-check"><input type="checkbox" checked={values.norepinephrineEnabled} onChange={e=>updateVasoactiveFlag('norepinephrineEnabled',e.target.checked)}/> Норэпинефрин</label><label className="sofa-check"><input type="checkbox" checked={values.epinephrineEnabled} onChange={e=>updateVasoactiveFlag('epinephrineEnabled',e.target.checked)}/> Эпинефрин</label></div>
          {values.norepinephrineEnabled&&<NumberField label="Доза норэпинефрина (в пересчёте на основание)" unit="мкг/кг/мин" value={values.norepinephrineDose} onChange={v=>update('norepinephrineDose',v)} min={0.01} step="any"/>}
          {values.epinephrineEnabled&&<NumberField label="Доза эпинефрина" unit="мкг/кг/мин" value={values.epinephrineDose} onChange={v=>update('epinephrineDose',v)} min={0.01} step="any"/>}
          <label className="sofa-check"><input type="checkbox" checked={values.dopamineEnabled} onChange={e=>updateVasoactiveFlag('dopamineEnabled',e.target.checked)}/> Дофамин как единственный вазопрессор</label>
          {values.dopamineEnabled&&<NumberField label="Доза дофамина" unit="мкг/кг/мин" value={values.dopamineDose} onChange={v=>update('dopamineDose',v)} min={0.01} step="any"/>}
          <label className="sofa-check"><input type="checkbox" checked={values.otherVasoactive} onChange={e=>updateVasoactiveFlag('otherVasoactive',e.target.checked)}/> Другой вазопрессор или инотроп (любая доза)</label>
          {hasVasoactiveMedication&&<label className="sofa-check"><input type="checkbox" checked={values.vasoactiveDurationConfirmed} onChange={e=>update('vasoactiveDurationConfirmed',e.target.checked)}/> Подтверждаю: непрерывная внутривенная инфузия вазоактивных препаратов длилась не менее 1 часа</label>}
          <label className="sofa-check"><input type="checkbox" checked={values.cardiovascularEcmo} onChange={e=>update('cardiovascularEcmo',e.target.checked)}/> ECMO по сердечно-сосудистым показаниям (любой тип; учитывается в обоих компонентах)</label>
          <label className="sofa-check"><input type="checkbox" checked={values.mechanicalSupport} onChange={e=>update('mechanicalSupport',e.target.checked)}/> Другая механическая поддержка кровообращения (ВАБК / VAD / microaxial pump)</label>
          <p className="field-hint">Суммируются дозы норэпинефрина и эпинефрина в пересчёте на основание. Для дофамина применяются отдельные пороги только при его использовании как единственного вазопрессора. ECMO любого типа по сердечно-сосудистым показаниям даёт 4 балла обоим компонентам; ECMO по дыхательной недостаточности — 4 балла дыхательному компоненту.</p>
        </section>
        <section className="sofa-section"><h3>5. Головной мозг</h3>
          <label className="calc-field"><span>GCS до седации / текущая GCS</span><select value={values.gcs} onChange={e=>update('gcs',e.target.value)}><option value="">Не выбрано</option>{Array.from({length:13},(_,i)=>15-i).map(v=><option key={v} value={String(v)}>{v}</option>)}</select></label>
          <label className="calc-field"><span>Если полную GCS оценить нельзя — лучшая двигательная реакция</span><select value={values.motorScore} onChange={e=>update('motorScore',e.target.value)}><option value="">Не выбрано</option>{Array.from({length:6},(_,i)=>6-i).map(v=><option key={v} value={String(v)}>{v}</option>)}</select></label>
          <label className="sofa-check"><input type="checkbox" checked={values.preSedationUnknown} onChange={e=>update('preSedationUnknown',e.target.checked)}/> Пациент седирован; предшествующая GCS неизвестна (по правилу SOFA-2 — 0 баллов)</label>
          <label className="sofa-check"><input type="checkbox" checked={values.deliriumMedication} onChange={e=>update('deliriumMedication',e.target.checked)}/> Получает лекарственную терапию делирия</label>
          <p className="field-hint">У седированного пациента используйте последнюю GCS до седации. Если невозможно оценить все три компонента, используйте лучшую двигательную реакцию. Терапия делирия даёт 1 балл даже при GCS 15.</p>
        </section>
        <section className="sofa-section"><h3>6. Почки</h3>
          <NumberField label="Креатинин" unit="мкмоль/л" value={values.creatinine} onChange={v=>update('creatinine',v)} min={1} max={3000} step="0.1"/>
          <div className="field-grid"><NumberField label="Диурез" unit="мл/кг/ч" value={values.urineRate} onChange={v=>update('urineRate',v)} min={0} max={20} step="0.01"/>
            <label className="calc-field"><span>Длительность олигурии / анурии</span><select value={values.urineDuration} onChange={e=>update('urineDuration',e.target.value)}><option value="">Не выбрано</option><option value="6">6 часов</option><option value="6-12">&gt;6–12 часов</option><option value="12+">≥12 часов</option><option value="24+">≥24 часов</option><option value="anuria12">Анурия ≥12 часов</option></select></label></div>
          <label className="calc-field"><span>Статус заместительной почечной терапии (RRT)</span><select required value={values.rrtStatus} onChange={e=>updateRRTStatus(e.target.value)}><option value="">Не выбрано</option><option value="none">Не проводится</option><option value="receiving">Проводится сейчас или хроническая RRT</option><option value="intermittentOffDay">Интермиттирующая RRT: день без процедуры, курс продолжается</option><option value="nonrenalOnly">Проводится исключительно по непочечным показаниям</option><option value="unavailableOrDelayed">Не проводится из-за недоступности, отсрочки или ограничения лечения</option></select></label>
          {values.rrtStatus==='unavailableOrDelayed'&&<div className="field-grid"><NumberField label="Калий" unit="ммоль/л" value={values.potassium} onChange={v=>update('potassium',v)} min={0} max={20} step="0.1"/><NumberField label="pH" unit="" value={values.ph} onChange={v=>update('ph',v)} min={6} max={8} step="0.01"/><NumberField label="Бикарбонат" unit="ммоль/л" value={values.bicarbonate} onChange={v=>update('bicarbonate',v)} min={0} max={100} step="0.1"/></div>}
          <p className="field-hint">RRT учитывается при почечных показаниях; исключительно непочечная RRT не даёт 4 балла. Если RRT не проводится из-за недоступности, отсрочки или ограничения лечения, 4 балла возможны при креатинине &gt;110 мкмоль/л или диурезе &lt;0,3 мл/кг/ч более 6 часов, плюс калий ≥6,0 ммоль/л либо одновременно pH ≤7,20 и HCO₃⁻ ≤12 ммоль/л. В день без интермиттирующей процедуры 4 балла сохраняются, пока курс RRT не прекращён.</p>
        </section>
        {error&&<p className="form-error" role="alert">{error}</p>}
        <div className="calculator-actions"><button className="primary-button" type="submit">Рассчитать SOFA-2</button><button className="reset-button" type="button" onClick={reset}><RotateCcw size={15}/> Сбросить</button></div>
        <p className="privacy-note"><ShieldCheck size={14}/> Данные не отправляются на сервер и не сохраняются.</p>
      </form>
      <aside className="calculator-aside">
        <div className="info-panel"><div className="info-icon"><BookOpen size={18}/></div><h3>Шесть систем органов</h3><ul><li>Головной мозг</li><li>Дыхательная система</li><li>Сердечно-сосудистая</li><li>Печень</li><li>Почки</li><li>Гемостаз</li></ul><p>Каждая система оценивается от 0 до 4 баллов. Общий диапазон — 0–24.</p></div>
        <div className="threshold-panel"><h3>Важные ограничения</h3><p>SOFA-2 разработана и валидирована у взрослых пациентов ОРИТ. Переносимость на пациентов вне ОРИТ и детей требует отдельного подтверждения.</p><p>В пределах 24 часов для каждой системы учитывается максимальный балл. Не подставляйте отсутствующие значения автоматически.</p><p>Это SOFA-2, а не оригинальная SOFA-1. Не смешивайте критерии разных версий.</p></div>
      </aside>
    </div>
    {result&&<section className="result-panel" aria-live="polite">
      <div className="result-topline"><span className="panel-kicker">РЕЗУЛЬТАТ ОЦЕНКИ</span><span className={result.hasUntestableComponent?'risk-tag risk-high':'risk-tag risk-low'}>{result.hasUntestableComponent?'Есть компонент NT':'Все компоненты оценены'}</span></div>
      <div className="score-display"><strong>{result.total??'NT'}</strong><span>{result.total===null?'общий балл не рассчитывается':'/ 24 балла'}</span></div>
      <h3>Разбор компонентов</h3><div className="criteria-list">{result.components.map(item=><div className="criterion-row" key={item.key}><span className="criterion-point active">{item.points??'NT'}</span><span><b>{item.label}</b><small>{item.detail}</small></span><span className="criterion-status">{item.points===null?'NT':'балла'}</span></div>)}</div>
      <p className="clinical-warning"><ShieldAlert size={14}/> SOFA-2 описывает органную дисфункцию у критически больных взрослых; не является самостоятельным диагнозом или инструментом выбора лечения.</p>
    </section>}
    <section className="reference-panel"><div><span className="panel-kicker">ИСТОЧНИК И МЕТОДИКА</span><h2>{SOFA2_REFERENCE.title}</h2><p>{SOFA2_REFERENCE.originalSource}</p></div><a href={SOFA2_REFERENCE.originalUrl} target="_blank" rel="noreferrer">Оригинальная публикация ↗</a><small>{SOFA2_REFERENCE.organisation}. Проверено: {SOFA2_REFERENCE.accessed}. {SOFA2_REFERENCE.notes[0]}</small></section>
    <p className="calculator-disclaimer">Образовательный инструмент для взрослых пациентов ОРИТ. Не заменяет клиническую оценку, локальные протоколы и решение специалиста.</p>
  </main>
}
