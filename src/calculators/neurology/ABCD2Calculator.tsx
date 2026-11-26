import { useState, type FormEvent } from 'react'
import { ArrowLeft, BookOpen, RotateCcw, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { calculateABCD2, type ABCD2ClinicalFeature, type ABCD2Duration, type ABCD2Result } from './abcd2'
import { ABCD2_REFERENCE } from './abcd2.reference'

export default function ABCD2Calculator() {
  const [age, setAge] = useState('')
  const [bp, setBp] = useState('')
  const [clinical, setClinical] = useState<ABCD2ClinicalFeature | ''>('')
  const [duration, setDuration] = useState<ABCD2Duration | ''>('')
  const [diabetes, setDiabetes] = useState('')
  const [result, setResult] = useState<ABCD2Result | null>(null)
  const [error, setError] = useState('')
  function reset() { setAge(''); setBp(''); setClinical(''); setDuration(''); setDiabetes(''); setResult(null); setError('') }
  function calculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!age || !bp || !clinical || !duration || !diabetes) { setError('Заполните все пять компонентов шкалы.'); setResult(null); return }
    try {
      setResult(calculateABCD2({ age60OrOlder: age === 'yes', bloodPressure140Or90OrHigher: bp === 'yes', clinicalFeature: clinical as ABCD2ClinicalFeature, symptomDuration: duration as ABCD2Duration, diabetes: diabetes === 'yes' }))
      setError('')
    } catch (e) { setResult(null); setError(e instanceof Error ? e.message : 'Проверьте введённые данные.') }
  }
  return (
    <main className="app-shell calculator-shell">
      <div className="calculator-topline"><Link className="back-link" to="/"><ArrowLeft size={16}/> Все калькуляторы</Link><span className="version-label">НЕВРОЛОГИЯ · ABCD²</span></div>
      <section className="calculator-heading"><div className="eyebrow"><span className="pulse-dot"/> ОЦЕНКА ПОСЛЕ ТИА</div><h1>ABCD² Score</h1><p>Классическая шкала из пяти компонентов для описания клинических факторов после транзиторной ишемической атаки. Максимум — 7 баллов.</p></section>
      <div className="calculator-layout">
        <form className="calculator-panel" onSubmit={calculate}>
          <div className="panel-heading"><div><span className="panel-kicker">ПЯТЬ КОМПОНЕНТОВ ШКАЛЫ</span><h2>Данные при первичной оценке</h2></div><span className="points-label">0–7 баллов</span></div>
          <div className="field-grid">
            <label className="calc-field"><span>Возраст</span><select required value={age} onChange={e=>{setAge(e.target.value);setResult(null)}}><option value="">Выберите</option><option value="no">Младше 60 лет — 0</option><option value="yes">60 лет и старше — 1</option></select></label>
            <label className="calc-field"><span>Артериальное давление при первом обращении</span><select required value={bp} onChange={e=>{setBp(e.target.value);setResult(null)}}><option value="">Выберите</option><option value="no">САД &lt;140 И ДАД &lt;90 мм рт. ст. — 0</option><option value="yes">САД ≥140 ИЛИ ДАД ≥90 мм рт. ст. — 1</option></select></label>
            <label className="calc-field"><span>Клинические признаки во время эпизода</span><select required value={clinical} onChange={e=>{setClinical(e.target.value as ABCD2ClinicalFeature | '');setResult(null)}}><option value="">Выберите</option><option value="none">Нет односторонней слабости и нарушения речи — 0</option><option value="speech">Нарушение речи без односторонней слабости — 1</option><option value="weakness">Односторонняя слабость (с нарушением речи или без) — 2</option></select><small>Если одновременно были слабость и нарушение речи, учитывается только 2 балла за слабость.</small></label>
            <label className="calc-field"><span>Длительность симптомов</span><select required value={duration} onChange={e=>{setDuration(e.target.value as ABCD2Duration | '');setResult(null)}}><option value="">Выберите</option><option value="under10">Менее 10 минут — 0</option><option value="10to59">10–59 минут — 1</option><option value="60plus">60 минут и более — 2</option></select></label>
            <label className="calc-field"><span>Сахарный диабет</span><select required value={diabetes} onChange={e=>{setDiabetes(e.target.value);setResult(null)}}><option value="">Выберите</option><option value="no">Нет — 0</option><option value="yes">Да — 1</option></select></label>
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="calculator-actions"><button className="primary-button" type="submit">Рассчитать ABCD²</button><button className="reset-button" type="button" onClick={reset}><RotateCcw size={15}/> Сбросить</button></div>
          <p className="privacy-note"><ShieldCheck size={14}/> Данные не отправляются на сервер и не сохраняются.</p>
        </form>
        <aside className="calculator-aside">
          <div className="info-panel"><div className="info-icon"><BookOpen size={18}/></div><h3>Компоненты и баллы</h3><p><b>Возраст:</b> ≥60 лет — 1.</p><p><b>АД:</b> САД ≥140 или ДАД ≥90 мм рт. ст. — 1.</p><p><b>Клиника:</b> односторонняя слабость — 2; нарушение речи без слабости — 1; иные симптомы — 0.</p><p><b>Длительность:</b> ≥60 мин — 2; 10–59 мин — 1; &lt;10 мин — 0.</p><p><b>Диабет:</b> наличие сахарного диабета — 1.</p></div>
          <div className="threshold-panel"><h3>Критически важное ограничение</h3><p>Не используйте ABCD² для решения, насколько срочно направлять пациента, и не откладывайте обследование из-за низкого балла.</p><p>NICE рекомендует при подозрении на ТИА немедленное направление для специализированной оценки с осмотром в пределах 24 часов от начала симптомов.</p><p>Шкала не учитывает некоторые опасные признаки и механизмы, включая симптомы задней циркуляции, фибрилляцию предсердий и стеноз крупных артерий.</p></div>
        </aside>
      </div>
      {result && <section className="result-panel" aria-live="polite"><div className="result-topline"><span className="panel-kicker">РЕЗУЛЬТАТ РАСЧЁТА</span><span className="risk-tag">{result.total} / 7</span></div><div className="score-display"><strong>{result.total}</strong><span>из 7 баллов</span></div><p className="result-summary">Традиционная группа шкалы: {result.bandLabel}</p><div className="result-breakdown">{result.components.map(item=><p key={item.key}>{item.label}: <b>+{item.points}</b></p>)}</div><p className="clinical-warning">Этот балл не определяет срочность направления, госпитализацию или лечение. Даже при ABCD² 0–3 возможен ранний инсульт. При подозрении на ТИА требуется немедленная специализированная оценка; не откладывайте её ради расчёта.</p></section>}
      <section className="reference-panel"><div><span className="panel-kicker">ИСТОЧНИКИ И ОГРАНИЧЕНИЯ</span><h2>{ABCD2_REFERENCE.title}</h2><p>{ABCD2_REFERENCE.organization} · {ABCD2_REFERENCE.version}</p></div><div>{ABCD2_REFERENCE.urls.map(url=><p key={url}><a href={url} target="_blank" rel="noreferrer">{url.includes('nice')?'NICE NG128':url.includes('eso')?'European Stroke Organisation':'AHA Scientific Statement 2023'} ↗</a></p>)}</div><small>Проверено: {ABCD2_REFERENCE.accessed}. Шкала не должна применяться изолированно для сортировки или принятия решений.</small></section>
      <p className="calculator-disclaimer">Образовательный инструмент. Не предназначен для самостоятельной диагностики или исключения ТИА/инсульта и не заменяет срочную медицинскую оценку.</p>
    </main>
  )
}
