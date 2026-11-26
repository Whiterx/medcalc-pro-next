import { useState, type FormEvent } from 'react'
import { ArrowLeft, BookOpen, RotateCcw, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { calculateHOMA1IR, type HOMAIRResult } from './homaIR'
import { HOMA_IR_REFERENCE } from './homaIR.reference'

const initialValues = {
  fastingGlucoseMmolL: '',
  fastingInsulinMicroIUml: '',
  fastingSamplesConfirmed: false,
  noExogenousInsulin: false,
}

export default function HOMAIRCalculator() {
  const [values, setValues] = useState(initialValues)
  const [result, setResult] = useState<HOMAIRResult | null>(null)
  const [error, setError] = useState('')

  function updateField<K extends keyof typeof initialValues>(field: K, value: typeof initialValues[K]) {
    setValues((current) => ({ ...current, [field]: value }))
    setResult(null)
    setError('')
  }

  function handleCalculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (values.fastingGlucoseMmolL === '' || values.fastingInsulinMicroIUml === '') {
      setError('Введите глюкозу и инсулин натощак.')
      setResult(null)
      return
    }
    try {
      setResult(calculateHOMA1IR({
        fastingGlucoseMmolL: Number(values.fastingGlucoseMmolL),
        fastingInsulinMicroIUml: Number(values.fastingInsulinMicroIUml),
        fastingSamplesConfirmed: values.fastingSamplesConfirmed,
        noExogenousInsulin: values.noExogenousInsulin,
      }))
      setError('')
    } catch (caught) {
      setResult(null)
      setError(caught instanceof Error ? caught.message : 'Проверьте введённые значения.')
    }
  }

  function reset() {
    setValues(initialValues)
    setResult(null)
    setError('')
  }

  return (
    <main className="app-shell calculator-shell">
      <div className="calculator-topline">
        <Link className="back-link" to="/"><ArrowLeft size={16} /> Все калькуляторы</Link>
        <span className="version-label">ЭНДОКРИНОЛОГИЯ · МЕТАБОЛИЗМ</span>
      </div>

      <section className="calculator-heading">
        <div className="eyebrow"><span className="pulse-dot" /> ИНДЕКС ИНСУЛИНОРЕЗИСТЕНТНОСТИ</div>
        <h1>HOMA1-IR</h1>
        <p>Суррогатный индекс, рассчитываемый по одновременным значениям глюкозы и инсулина натощак. Это классическая формула HOMA1, не HOMA2.</p>
      </section>

      <div className="calculator-layout">
        <form className="calculator-panel" onSubmit={handleCalculate}>
          <div className="panel-heading">
            <div><span className="panel-kicker">ЛАБОРАТОРНЫЕ ДАННЫЕ</span><h2>Показатели натощак</h2></div>
          </div>
          <div className="field-grid">
            <label className="calc-field">
              <span>Глюкоза плазмы <small>ммоль/л</small></span>
              <input type="number" min="0.01" max="60" step="0.01" inputMode="decimal" placeholder="Введите значение" value={values.fastingGlucoseMmolL} onChange={(event) => updateField('fastingGlucoseMmolL', event.target.value)} />
            </label>
            <label className="calc-field">
              <span>Инсулин <small>мкЕд/мл (мЕд/л)</small></span>
              <input type="number" min="0.01" max="1000" step="0.01" inputMode="decimal" placeholder="Введите значение" value={values.fastingInsulinMicroIUml} onChange={(event) => updateField('fastingInsulinMicroIUml', event.target.value)} />
            </label>
          </div>
          <label className="check-field">
            <input type="checkbox" checked={values.fastingSamplesConfirmed} onChange={(event) => updateField('fastingSamplesConfirmed', event.target.checked)} />
            <span>Оба образца получены одновременно после ночного голодания</span>
          </label>
          <label className="check-field">
            <input type="checkbox" checked={values.noExogenousInsulin} onChange={(event) => updateField('noExogenousInsulin', event.target.checked)} />
            <span>Пациент не получает экзогенный инсулин</span>
          </label>
          <p className="field-hint">Все поля изначально пусты. Не рассчитывайте HOMA1-IR по не натощак значениям или на фоне терапии экзогенным инсулином.</p>
          {error && <p className="form-error" role="alert">{error}</p>}

          <div className="calculator-actions">
            <button className="primary-button" type="submit">Рассчитать HOMA1-IR</button>
            <button className="reset-button" type="button" onClick={reset}><RotateCcw size={15} /> Сбросить</button>
          </div>
          <p className="privacy-note"><ShieldCheck size={14} /> Данные не отправляются на сервер и не сохраняются.</p>
        </form>

        <aside className="calculator-aside">
          <div className="info-panel">
            <div className="info-icon"><BookOpen size={18} /></div>
            <h3>Формула</h3>
            <p>HOMA1-IR = глюкоза натощак × инсулин натощак / 22,5. При глюкозе 4,5 ммоль/л и инсулине 5 мкЕд/мл индекс равен 1,0.</p>
          </div>
          <div className="threshold-panel">
            <h3>Важно об интерпретации</h3>
            <p>Универсального диагностического порога <b>не существует</b>.</p>
            <p>Результат зависит от популяции, возраста и метода определения инсулина.</p>
            <p>Не использовать как самостоятельный диагноз инсулинорезистентности или диабета.</p>
          </div>
        </aside>
      </div>

      {result && (
        <section className="result-panel" aria-live="polite">
          <div className="result-topline"><span className="panel-kicker">РЕЗУЛЬТАТ РАСЧЁТА</span><span className="risk-tag risk-moderate">Числовой индекс</span></div>
          <div className="score-display"><strong>{result.value.toFixed(2)}</strong><span>HOMA1-IR</span></div>
          <p className="result-summary">{result.formula}</p>
          <div className="result-breakdown">
            <p>Глюкоза натощак: <b>{result.glucoseContribution} ммоль/л</b></p>
            <p>Инсулин натощак: <b>{result.insulinContribution} мкЕд/мл</b></p>
          </div>
          <p className="clinical-warning">Числовой результат не имеет универсального порога, позволяющего самостоятельно подтвердить или исключить инсулинорезистентность. Интерпретируйте его только в контексте популяционных референсов и метода анализа.</p>
        </section>
      )}

      <section className="reference-panel">
        <div><span className="panel-kicker">ИСТОЧНИК И МЕТОДИКА</span><h2>{HOMA_IR_REFERENCE.title}</h2><p>{HOMA_IR_REFERENCE.guideline} · {HOMA_IR_REFERENCE.section}</p></div>
        <a href={HOMA_IR_REFERENCE.url} target="_blank" rel="noreferrer">Открыть источник ↗</a>
        <small>Публикация: {HOMA_IR_REFERENCE.published}. Проверено: {HOMA_IR_REFERENCE.accessed}. {HOMA_IR_REFERENCE.notes[3]}</small>
      </section>
      <p className="calculator-disclaimer">Образовательный инструмент. Не заменяет клиническую оценку и не предназначен для самостоятельной диагностики инсулинорезистентности.</p>
    </main>
  )
}
