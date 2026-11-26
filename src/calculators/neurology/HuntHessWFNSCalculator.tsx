import { useState, type FormEvent } from 'react'
import { ArrowLeft, BookOpen, RotateCcw, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { calculateHuntHessWFNS, type HuntHessWFNSResult, type MotorDeficit } from './huntHessWFNS'
import { HUNT_HESS_WFNS_REFERENCE } from './huntHessWFNS.reference'

const huntHessOptions = [
  'I — Бессимптомное течение или лёгкая головная боль, небольшая ригидность затылочных мышц',
  'II — Умеренная/сильная головная боль, менингизм; нет дефицита, кроме возможного поражения черепных нервов',
  'III — Сонливость, спутанность сознания или лёгкий очаговый дефицит',
  'IV — Сопор или умеренный/тяжёлый гемипарез',
  'V — Глубокая кома, децеребрационная поза или крайне тяжёлое состояние',
]

export default function HuntHessWFNSCalculator() {
  const [hh, setHh] = useState('')
  const [gcs, setGcs] = useState('')
  const [motor, setMotor] = useState<MotorDeficit | ''>('')
  const [result, setResult] = useState<HuntHessWFNSResult | null>(null)
  const [error, setError] = useState('')
  function reset() { setHh(''); setGcs(''); setMotor(''); setResult(null); setError('') }
  function handleCalculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!hh || !gcs || !motor) { setError('Заполните все три поля: Hunt–Hess, GCS и моторный дефицит.'); setResult(null); return }
    try { setResult(calculateHuntHessWFNS({ huntHessGrade: Number(hh), gcs: Number(gcs), motorDeficit: motor })); setError('') }
    catch (e) { setResult(null); setError(e instanceof Error ? e.message : 'Проверьте введённые значения.') }
  }
  return (
    <main className="app-shell calculator-shell">
      <div className="calculator-topline"><Link className="back-link" to="/"><ArrowLeft size={16}/> Все калькуляторы</Link><span className="version-label">НЕВРОЛОГИЯ · SAH</span></div>
      <section className="calculator-heading"><div className="eyebrow"><span className="pulse-dot"/> ТЯЖЕСТЬ СУБАРАХНОИДАЛЬНОГО КРОВОИЗЛИЯНИЯ</div><h1>Hunt–Hess / WFNS</h1><p>Две независимые клинические шкалы для описания исходной тяжести аневризматического субарахноидального кровоизлияния (аСАК).</p></section>
      <div className="calculator-layout">
        <form className="calculator-panel" onSubmit={handleCalculate}>
          <div className="panel-heading"><div><span className="panel-kicker">КЛИНИЧЕСКАЯ ОЦЕНКА</span><h2>Введите данные осмотра</h2></div><span className="points-label">Две шкалы</span></div>
          <div className="field-grid">
            <label className="calc-field"><span>Hunt–Hess</span><small>Выберите клиническую степень по состоянию пациента.</small><select required value={hh} onChange={e=>{setHh(e.target.value);setResult(null);setError('')}}><option value="">Выберите степень</option>{huntHessOptions.map((label,i)=><option key={i+1} value={i+1}>{label}</option>)}</select></label>
            <label className="calc-field"><span>Суммарный балл GCS</span><small>Используйте фактически оценённую сумму по шкале комы Глазго (3–15), а не отдельный компонент.</small><select required value={gcs} onChange={e=>{setGcs(e.target.value);setResult(null);setError('')}}><option value="">Выберите GCS</option>{Array.from({length:13},(_,i)=>15-i).map(value=><option key={value} value={value}>{value}</option>)}</select></label>
            <label className="calc-field"><span>Выраженный очаговый моторный дефицит</span><small>Для WFNS: учитывайте значимый очаговый дефицит; афазия обычно рассматривается как эквивалент.</small><select required value={motor} onChange={e=>{setMotor(e.target.value as MotorDeficit|'');setResult(null);setError('')}}><option value="">Выберите</option><option value="absent">Отсутствует</option><option value="present">Присутствует</option></select></label>
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="calculator-actions"><button className="primary-button" type="submit">Рассчитать шкалы</button><button className="reset-button" type="button" onClick={reset}><RotateCcw size={15}/> Сбросить</button></div>
          <p className="privacy-note"><ShieldCheck size={14}/> Данные не отправляются на сервер и не сохраняются.</p>
        </form>
        <aside className="calculator-aside">
          <div className="info-panel"><div className="info-icon"><BookOpen size={18}/></div><h3>Hunt–Hess</h3>{huntHessOptions.map((label,i)=><p key={i}><b>{label}</b></p>)}</div>
          <div className="info-panel"><h3>WFNS</h3><p><b>I:</b> GCS 15, без выраженного моторного дефицита.</p><p><b>II:</b> GCS 13–14, без выраженного моторного дефицита.</p><p><b>III:</b> GCS 13–14, с выраженным моторным дефицитом.</p><p><b>IV:</b> GCS 7–12, с дефицитом или без него.</p><p><b>V:</b> GCS 3–6, с дефицитом или без него.</p></div>
          <div className="threshold-panel"><h3>Важные ограничения</h3><p>Hunt–Hess и WFNS — разные шкалы; их баллы не складывают и не усредняют.</p><p>Шкалы помогают стандартизировать описание тяжести и прогнозирование при аСАК, но не подтверждают диагноз и не заменяют нейровизуализацию и оценку специалиста.</p><p>Не используйте отдельную категорию как единственное основание для отказа от лечения, ограничения терапии или прогноза для конкретного пациента.</p><p>В этой версии Hunt–Hess показан без автоматического повышения степени при системном заболевании или ангиографическом вазоспазме.</p></div>
        </aside>
      </div>
      {result && <section className="result-panel" aria-live="polite"><div className="result-topline"><span className="panel-kicker">РЕЗУЛЬТАТ ОЦЕНКИ</span><span className="risk-tag">Hunt–Hess {result.huntHess.grade} · WFNS {result.wfns.grade ?? '—'}</span></div><div className="result-breakdown"><p><b>Hunt–Hess {result.huntHess.grade}:</b> {result.huntHess.label}</p><p>{result.huntHess.description}</p><p><b>{result.wfns.label}</b></p><p>{result.wfns.description}</p></div>{!result.wfns.classifiable && <p className="clinical-warning">WFNS не присвоена автоматически из-за нестандартного сочетания признаков. Проверьте оценку GCS и очаговый статус.</p>}</section>}
      <section className="reference-panel"><div><span className="panel-kicker">ИСТОЧНИКИ И МЕТОДИКА</span><h2>{HUNT_HESS_WFNS_REFERENCE.title}</h2><p>{HUNT_HESS_WFNS_REFERENCE.organization} · {HUNT_HESS_WFNS_REFERENCE.version}</p></div><div>{HUNT_HESS_WFNS_REFERENCE.urls.map((url)=><p key={url}><a href={url} target="_blank" rel="noreferrer">{url.includes('ahajournals')?'AHA/ASA Guideline 2023':url.includes('neurocriticalcare')?'Neurocritical Care Society · ENLS':'NINDS / NIH Common Data Elements'} ↗</a></p>)}</div><small>Проверено: {HUNT_HESS_WFNS_REFERENCE.accessed}. {HUNT_HESS_WFNS_REFERENCE.notes[0]}</small></section>
      <p className="calculator-disclaimer">Образовательный инструмент. Не предназначен для диагностики САК, самостоятельного прогноза или выбора лечения; не заменяет оценку нейрохирурга/нейрореаниматолога и специализированную помощь.</p>
    </main>
  )
}
