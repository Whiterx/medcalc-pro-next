import { useState, type FormEvent } from 'react'
import { ArrowLeft, BookOpen, RotateCcw, ShieldAlert, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { calculatePadua, type PaduaInput, type PaduaResult } from './padua'
import { PADUA_REFERENCE } from './padua.reference'

const initialValues: PaduaInput = {
  activeCancer: false, previousVTE: false, reducedMobility: false, knownThrombophilia: false,
  recentTraumaOrSurgery: false, age70OrOlder: false, heartOrRespiratoryFailure: false,
  acuteMIOrIschemicStroke: false, acuteInfectionOrRheumatologicDisease: false,
  obesityBMI30OrMore: false, ongoingHormonalTreatment: false,
}
const fields: { key: keyof PaduaInput; label: string; points: number; detail: string }[] = [
  { key: 'activeCancer', label: 'Активное онкологическое заболевание', points: 3, detail: 'Метастазы и/или химиотерапия или лучевая терапия в последние 6 месяцев.' },
  { key: 'previousVTE', label: 'ТГВ или ТЭЛА в анамнезе', points: 3, detail: 'Ранее подтверждённое ВТЭО; поверхностный тромбофлебит не учитывается.' },
  { key: 'reducedMobility', label: 'Сниженная подвижность', points: 3, detail: 'Ожидаемый постельный режим с возможностью посещать туалет не менее 3 дней.' },
  { key: 'knownThrombophilia', label: 'Известная тромбофилия', points: 3, detail: 'Дефицит антитромбина, протеинов C/S, фактор V Leiden, G20210A или АФС.' },
  { key: 'recentTraumaOrSurgery', label: 'Травма и/или операция в течение последнего месяца', points: 2, detail: '≤1 месяца.' },
  { key: 'age70OrOlder', label: 'Возраст ≥70 лет', points: 1, detail: '70 лет или старше.' },
  { key: 'heartOrRespiratoryFailure', label: 'Сердечная и/или дыхательная недостаточность', points: 1, detail: 'Наличие сердечной или дыхательной недостаточности.' },
  { key: 'acuteMIOrIschemicStroke', label: 'Острый инфаркт миокарда или ишемический инсульт', points: 1, detail: 'Текущий острый эпизод.' },
  { key: 'acuteInfectionOrRheumatologicDisease', label: 'Острая инфекция и/или ревматологическое заболевание', points: 1, detail: 'Острая инфекция или активное ревматологическое заболевание.' },
  { key: 'obesityBMI30OrMore', label: 'Ожирение (ИМТ ≥30 кг/м²)', points: 1, detail: 'Индекс массы тела 30 кг/м² или выше.' },
  { key: 'ongoingHormonalTreatment', label: 'Продолжающаяся гормональная терапия', points: 1, detail: 'Текущая гормональная терапия.' },
]

export default function PaduaCalculator() {
  const [values, setValues] = useState<PaduaInput>(initialValues)
  const [result, setResult] = useState<PaduaResult | null>(null)
  const [error, setError] = useState('')

  function updateField(key: keyof PaduaInput, checked: boolean) {
    setValues((current) => ({ ...current, [key]: checked }))
    setResult(null)
    setError('')
  }
  function reset() {
    setValues(initialValues)
    setResult(null)
    setError('')
  }
  function handleCalculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      setResult(calculatePadua(values))
      setError('')
    } catch (caught) {
      setResult(null)
      setError(caught instanceof Error ? caught.message : 'Проверьте выбранные факторы.')
    }
  }

  return (
    <main className="app-shell calculator-shell">
      <div className="calculator-topline">
        <Link className="back-link" to="/"><ArrowLeft size={16} /> Все калькуляторы</Link>
        <span className="version-label">ГЕМАТОЛОГИЯ · PADUA</span>
      </div>
      <section className="calculator-heading">
        <div className="eyebrow"><span className="pulse-dot" /> РИСК ВЕНОЗНЫХ ТРОМБОЭМБОЛИЙ</div>
        <h1>Padua Prediction Score</h1>
        <p>Оценка риска ВТЭО у госпитализированных пациентов с острыми терапевтическими заболеваниями.</p>
      </section>
      <div className="calculator-layout">
        <form className="calculator-panel" onSubmit={handleCalculate}>
          <div className="panel-heading"><div><span className="panel-kicker">11 ФАКТОРОВ РИСКА</span><h2>Отметьте присутствующие факторы</h2></div><span className="points-label">0–20 баллов</span></div>
          <p className="field-hint">Каждый пункт должен быть оценён. Неотмеченный флажок означает, что фактор оценён и отсутствует; не оставляйте факторы без клинической оценки.</p>
          {fields.map((field, index) => (
            <div className="news2-section" key={field.key}>
              <label className="form-check">
                <input type="checkbox" className="form-check__input" checked={values[field.key]} onChange={(event) => updateField(field.key, event.target.checked)} />
                <span className="form-check__label"><b>{index + 1}. {field.label}</b><small>{field.detail}</small></span>
                <span className="form-check__score">+{field.points}</span>
              </label>
            </div>
          ))}
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="calculator-actions">
            <button className="primary-button" type="submit">Рассчитать Padua</button>
            <button className="reset-button" type="button" onClick={reset}><RotateCcw size={15} /> Сбросить</button>
          </div>
          <p className="privacy-note"><ShieldCheck size={14} /> Данные не отправляются на сервер и не сохраняются.</p>
        </form>
        <aside className="calculator-aside">
          <div className="info-panel"><div className="info-icon"><BookOpen size={18} /></div><h3>Для госпитализированных терапевтических пациентов</h3><p>Исходная модель разработана для пациентов с острыми нехирургическими заболеваниями, находящихся в стационаре.</p></div>
          <div className="threshold-panel"><h3>Порог риска ВТЭО</h3><p><b>≥4 баллов:</b> высокий риск.</p><p><b>&lt;4 баллов:</b> низкий риск по исходной модели.</p><p>Оценка риска кровотечения проводится отдельно.</p></div>
        </aside>
      </div>
      {result && (
        <section className="result-panel" aria-live="polite">
          <div className="result-topline"><span className="panel-kicker">РЕЗУЛЬТАТ РАСЧЁТА</span><span className="risk-tag risk-moderate">Padua Prediction Score</span></div>
          <div className="score-display"><strong>{result.score}</strong><span>из 20 баллов</span></div>
          <div className="result-summary"><b>{result.categoryLabel}</b></div>
          <h3>Разбор факторов</h3>
          <div className="criteria-list">{result.criteria.map((item) => (
            <div className="criterion-row" key={item.key}><span className="criterion-point">{item.points}</span><span><b>{item.label}</b><small>{item.present ? item.interpretation : 'Фактор не отмечен'}</small></span><span className="criterion-status">{item.points} б.</span></div>
          ))}</div>
          <p className="clinical-warning"><ShieldAlert size={14} /> Высокий балл не является автоматическим назначением антикоагулянта. Учитывайте риск кровотечения, противопоказания, клиническую ситуацию и локальный протокол профилактики ВТЭО.</p>
        </section>
      )}
      <section className="reference-panel">
        <div><span className="panel-kicker">ИСТОЧНИК И МЕТОДИКА</span><h2>{PADUA_REFERENCE.title}</h2><p>{PADUA_REFERENCE.originalSource}</p></div>
        <a href={PADUA_REFERENCE.originalUrl} target="_blank" rel="noreferrer">Открыть оригинальную публикацию ↗</a>
        <small>{PADUA_REFERENCE.guideline} · <a href={PADUA_REFERENCE.guidelineUrl} target="_blank" rel="noreferrer">Рекомендации ASH ↗</a> Проверено: {PADUA_REFERENCE.accessed}.</small>
      </section>
      <p className="calculator-disclaimer">Образовательный инструмент для госпитализированных терапевтических пациентов. Не заменяет оценку риска кровотечения и клиническое решение.</p>
    </main>
  )
}
