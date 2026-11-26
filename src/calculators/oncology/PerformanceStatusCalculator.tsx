import { useState, type FormEvent } from 'react'
import { ArrowLeft, BookOpen, RotateCcw, ShieldAlert, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { calculatePerformanceStatus, ECOG_LABELS, KARNOFSKY_LABELS, type PerformanceStatusResult } from './performanceStatus'
import { PERFORMANCE_STATUS_REFERENCE } from './performanceStatus.reference'

const initialValues = { ecog: '', karnofsky: '' }

export default function PerformanceStatusCalculator() {
  const [values, setValues] = useState(initialValues)
  const [result, setResult] = useState<PerformanceStatusResult | null>(null)
  const [error, setError] = useState('')

  function updateField(key: keyof typeof initialValues, value: string) {
    setValues((current) => ({ ...current, [key]: value }))
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
      setResult(calculatePerformanceStatus({
        ecog: values.ecog === '' ? null : Number(values.ecog),
        karnofsky: values.karnofsky === '' ? null : Number(values.karnofsky),
      }))
      setError('')
    } catch (caught) {
      setResult(null)
      setError(caught instanceof Error ? caught.message : 'Проверьте введённые значения.')
    }
  }

  return (
    <main className="app-shell calculator-shell">
      <div className="calculator-topline">
        <Link className="back-link" to="/"><ArrowLeft size={16} /> Все калькуляторы</Link>
        <span className="version-label">ОНКОЛОГИЯ · ECOG / KARNOFSKY</span>
      </div>
      <section className="calculator-heading">
        <div className="eyebrow"><span className="pulse-dot" /> ОЦЕНКА ФУНКЦИОНАЛЬНОГО СТАТУСА</div>
        <h1>ECOG / Karnofsky</h1>
        <p>Независимая оценка функционального статуса по двум клиническим шкалам.</p>
      </section>
      <div className="calculator-layout">
        <form className="calculator-panel" onSubmit={handleCalculate}>
          <div className="panel-heading"><div><span className="panel-kicker">ШКАЛА 1</span><h2>ECOG Performance Status</h2></div><span className="points-label">0–5</span></div>
          <label className="calc-field field-full">
            <span>Функциональный статус ECOG</span>
            <select value={values.ecog} onChange={(event) => updateField('ecog', event.target.value)}>
              <option value="">Не оценивать ECOG</option>
              {Object.entries(ECOG_LABELS).map(([score, label]) => <option key={score} value={score}>{score} — {label}</option>)}
            </select>
          </label>
          <div className="news2-section">
            <div className="panel-heading panel-subheading"><div><span className="panel-kicker">ШКАЛА 2</span><h2>Karnofsky Performance Status</h2></div><span className="points-label">0–100%</span></div>
            <label className="calc-field field-full">
              <span>Функциональный статус Karnofsky</span>
              <select value={values.karnofsky} onChange={(event) => updateField('karnofsky', event.target.value)}>
                <option value="">Не оценивать Karnofsky</option>
                {Object.entries(KARNOFSKY_LABELS).sort(([a], [b]) => Number(b) - Number(a)).map(([score, label]) => <option key={score} value={score}>{score}% — {label}</option>)}
              </select>
            </label>
          </div>
          <p className="field-hint">Можно рассчитать одну шкалу или обе. Выбирайте значения по непосредственной клинической оценке, а не путём автоматического перевода между шкалами.</p>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="calculator-actions">
            <button className="primary-button" type="submit">Рассчитать статус</button>
            <button className="reset-button" type="button" onClick={reset}><RotateCcw size={15} /> Сбросить</button>
          </div>
          <p className="privacy-note"><ShieldCheck size={14} /> Данные не отправляются на сервер и не сохраняются.</p>
        </form>
        <aside className="calculator-aside">
          <div className="info-panel"><div className="info-icon"><BookOpen size={18} /></div><h3>Две независимые шкалы</h3><p>ECOG: 0–4 для живого пациента. Karnofsky: 0–100%, чем выше балл, тем выше функциональная самостоятельность.</p></div>
          <div className="threshold-panel"><h3>Не переводить автоматически</h3><p>Между ECOG и Karnofsky нет точного математического соответствия. При необходимости фиксируйте обе оценки независимо.</p><p>ECOG 5 и Karnofsky 0 обозначают смерть и не являются оценкой функционального статуса живого пациента.</p></div>
        </aside>
      </div>
      {result && (
        <section className="result-panel" aria-live="polite">
          <div className="result-topline"><span className="panel-kicker">РЕЗУЛЬТАТ ОЦЕНКИ</span><span className="risk-tag risk-moderate">Performance status</span></div>
          {result.ecog && (
            <div className="result-summary"><b>ECOG {result.ecog.score}</b><p>{result.ecog.label}</p></div>
          )}
          {result.karnofsky && (
            <div className="result-summary"><b>Karnofsky {result.karnofsky.score}%</b><p>{result.karnofsky.label}</p></div>
          )}
          <p className="clinical-warning"><ShieldAlert size={14} /> Это описание функционального статуса, а не автоматическая рекомендация по назначению/отмене лечения или прогноз выживаемости. Оценку следует интерпретировать с учётом клинического контекста и динамики.</p>
        </section>
      )}
      <section className="reference-panel">
        <div><span className="panel-kicker">ИСТОЧНИК И МЕТОДИКА</span><h2>{PERFORMANCE_STATUS_REFERENCE.title}</h2><p>{PERFORMANCE_STATUS_REFERENCE.ecogSource}</p></div>
        <a href={PERFORMANCE_STATUS_REFERENCE.scaleUrl} target="_blank" rel="noreferrer">Открыть шкалы ECOG-ACRIN ↗</a>
        <small>{PERFORMANCE_STATUS_REFERENCE.karnofskySource} · <a href={PERFORMANCE_STATUS_REFERENCE.nciUrl} target="_blank" rel="noreferrer">Определение Karnofsky в NCI ↗</a> Проверено: {PERFORMANCE_STATUS_REFERENCE.accessed}.</small>
      </section>
      <p className="calculator-disclaimer">Образовательный инструмент для регистрации функционального статуса. Не заменяет клиническую оценку.</p>
    </main>
  )
}
