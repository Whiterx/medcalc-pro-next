import { useState, type FormEvent } from 'react'
import { ArrowLeft, BookOpen, RotateCcw, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { calculateQTC, type QTCResult } from './qtc'
import { QTC_REFERENCE } from './qtc.reference'

const initialValues = {
  qtMs: '',
  rrMs: '',
  formula: '' as '' | 'bazett' | 'fridericia' | 'hodges',
  sex: '' as '' | 'male' | 'female',
}

export default function QTCCalculator() {
  const [values, setValues] = useState(initialValues)
  const [result, setResult] = useState<QTCResult | null>(null)
  const [error, setError] = useState('')

  function updateField<K extends keyof typeof initialValues>(field: K, value: typeof initialValues[K]) {
    setValues((current) => ({ ...current, [field]: value }))
    setResult(null)
    setError('')
  }

  function handleCalculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (values.qtMs === '' || values.rrMs === '' || values.formula === '' || values.sex === '') {
      setError('Введите QT и RR, выберите формулу и пол.')
      setResult(null)
      return
    }
    try {
      setResult(calculateQTC({
        qtMs: Number(values.qtMs),
        rrMs: Number(values.rrMs),
        formula: values.formula as 'bazett' | 'fridericia' | 'hodges',
        sex: values.sex as 'male' | 'female',
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
        <span className="version-label">КАРДИОЛОГИЯ · QTc</span>
      </div>

      <section className="calculator-heading">
        <div className="eyebrow"><span className="pulse-dot" /> КОРРЕКЦИЯ ИНТЕРВАЛА QT</div>
        <h1>QTc Calculator</h1>
        <p>Расчёт скорректированного интервала QT по формулам Bazett, Fridericia или Hodges с интерпретацией по половым порогам AHA/ACCF/HRS.</p>
      </section>

      <div className="calculator-layout">
        <form className="calculator-panel" onSubmit={handleCalculate}>
          <div className="panel-heading">
            <div><span className="panel-kicker">ШАГ 1</span><h2>Измерения ЭКГ</h2></div>
            <span className="points-label">2 показателя</span>
          </div>

          <div className="field-grid">
            <label className="calc-field">
              <span>Интервал QT <small>мс</small></span>
              <input type="number" min="100" max="1000" step="0.1" inputMode="decimal" placeholder="Например, 400" value={values.qtMs} onChange={(event) => updateField('qtMs', event.target.value)} />
            </label>
            <label className="calc-field">
              <span>Интервал RR <small>мс</small></span>
              <input type="number" min="200" max="3000" step="0.1" inputMode="decimal" placeholder="Например, 1000" value={values.rrMs} onChange={(event) => updateField('rrMs', event.target.value)} />
            </label>
          </div>

          <div className="panel-heading panel-subheading">
            <div><span className="panel-kicker">ШАГ 2</span><h2>Метод коррекции и интерпретация</h2></div>
            <span className="points-label">2 выбора</span>
          </div>

          <div className="field-grid">
            <label className="calc-field">
              <span>Формула коррекции</span>
              <select value={values.formula} onChange={(event) => updateField('formula', event.target.value as typeof initialValues.formula)}>
                <option value="">Не выбрано</option>
                <option value="bazett">Bazett — QT / √RR</option>
                <option value="fridericia">Fridericia — QT / RR^(1/3)</option>
                <option value="hodges">Hodges — QT + 1,75 × (ЧСС − 60)</option>
              </select>
            </label>
            <label className="calc-field">
              <span>Пол <small>для референсных порогов QTc</small></span>
              <select value={values.sex} onChange={(event) => updateField('sex', event.target.value as typeof initialValues.sex)}>
                <option value="">Не выбрано</option>
                <option value="male">Мужской</option>
                <option value="female">Женский</option>
              </select>
            </label>
          </div>

          <p className="field-hint">QT измеряется от начала QRS до конца зубца T. RR — интервал между соседними зубцами R, соответствующий тому же циклу. Для Bazett и Fridericia RR переводится в секунды; Hodges использует ЧСС, рассчитанную из RR.</p>
          {error && <p className="form-error" role="alert">{error}</p>}

          <div className="calculator-actions">
            <button className="primary-button" type="submit">Рассчитать QTc</button>
            <button className="reset-button" type="button" onClick={reset}><RotateCcw size={15} /> Сбросить</button>
          </div>
          <p className="privacy-note"><ShieldCheck size={14} /> Данные не отправляются на сервер и не сохраняются.</p>
        </form>

        <aside className="calculator-aside">
          <div className="info-panel">
            <div className="info-icon"><BookOpen size={18} /></div>
            <h3>Как выбрать формулу?</h3>
            <p>Bazett широко используется, но может завышать QTc при высокой ЧСС и занижать при низкой. Fridericia и Hodges — альтернативные методы. Единственной универсально оптимальной формулы нет; указывайте метод при интерпретации и динамическом сравнении.</p>
          </div>
          <div className="threshold-panel">
            <h3>Пороговые значения</h3>
            <p>Мужчины: <b>QTc &gt;450 мс — удлинён</b></p>
            <p>Женщины: <b>QTc ≥460 мс — удлинён</b></p>
            <p>99-й перцентиль: <b>470 / 480 мс</b></p>
            <p>Выраженное удлинение: <b>QTc >500 мс</b></p>
          </div>
        </aside>
      </div>

      {result && (
        <section className="result-panel" aria-live="polite">
          <div className="result-topline"><span className="panel-kicker">РЕЗУЛЬТАТ РАСЧЁТА</span><span className={`risk-tag ${result.category === 'normal' ? 'risk-low' : result.category === 'prolonged' ? 'risk-moderate' : 'risk-high'}`}>{result.categoryLabel}</span></div>
          <div className="score-display"><strong>{result.qtcMs.toFixed(1)}</strong><span>мс · QTc {result.formulaLabel}</span></div>
          <div className="result-breakdown">
            <p>Исходный QT: <b>{Number(values.qtMs).toFixed(1)} мс</b></p>
            <p>RR: <b>{Number(values.rrMs).toFixed(1)} мс</b></p>
            <p>Расчётная ЧСС: <b>{result.heartRateBpm.toFixed(1)} уд/мин</b></p>
            <p>Практический порог удлинения: <b>{result.prolongedThresholdMs} мс</b></p>
            <p>Верхняя граница 99-го перцентиля: <b>{values.sex === 'male' ? '470' : '480'} мс</b> — {result.above99thPercentile ? 'достигнута/превышена' : 'не достигнута'}</p>
          </div>
          <p className="clinical-warning">{result.explanation} Не назначайте и не отменяйте препараты только по этому числу.</p>
        </section>
      )}

      <section className="reference-panel">
        <div><span className="panel-kicker">ИСТОЧНИК И МЕТОДИКА</span><h2>{QTC_REFERENCE.title}</h2><p>{QTC_REFERENCE.guideline} · {QTC_REFERENCE.section}</p></div>
        <a href={QTC_REFERENCE.url} target="_blank" rel="noreferrer">Открыть источник ↗</a>
        <small>Проверено: {QTC_REFERENCE.accessed}. {QTC_REFERENCE.notes[3]}</small>
      </section>
      <p className="calculator-disclaimer">Образовательный инструмент. Не заменяет визуальную проверку ЭКГ и клиническую оценку.</p>
    </main>
  )
}
