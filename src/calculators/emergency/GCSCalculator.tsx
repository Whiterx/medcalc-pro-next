import { useState, type FormEvent } from 'react'
import { ArrowLeft, BookOpen, RotateCcw, ShieldAlert, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { calculateGCS, type GCSResult } from './gcs'
import { GCS_REFERENCE } from './gcs.reference'

const initialValues = { eye: '', verbal: '', motor: '' }

const options = {
  eye: [
    { value: '4', label: '4 — спонтанно' },
    { value: '3', label: '3 — на звук' },
    { value: '2', label: '2 — на давление' },
    { value: '1', label: '1 — отсутствует' },
    { value: 'NT', label: 'NT — не оценивается' },
  ],
  verbal: [
    { value: '5', label: '5 — ориентирован' },
    { value: '4', label: '4 — спутанная речь' },
    { value: '3', label: '3 — отдельные слова' },
    { value: '2', label: '2 — звуки' },
    { value: '1', label: '1 — отсутствует' },
    { value: 'NT', label: 'NT — не оценивается' },
  ],
  motor: [
    { value: '6', label: '6 — выполняет команды' },
    { value: '5', label: '5 — локализует давление' },
    { value: '4', label: '4 — нормальное сгибание' },
    { value: '3', label: '3 — патологическое сгибание' },
    { value: '2', label: '2 — разгибание' },
    { value: '1', label: '1 — отсутствует' },
    { value: 'NT', label: 'NT — не оценивается' },
  ],
}

export default function GCSCalculator() {
  const [values, setValues] = useState(initialValues)
  const [result, setResult] = useState<GCSResult | null>(null)
  const [error, setError] = useState('')

  function updateField(field: keyof typeof initialValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
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
    if (Object.values(values).some((value) => value === '')) {
      setError('Выберите реакцию для каждого компонента: открывание глаз, речь и движение. Если компонент оценить невозможно, выберите NT.')
      setResult(null)
      return
    }
    const calculated = calculateGCS(values)
    if (!calculated) {
      setError('Проверьте выбранные значения компонентов GCS.')
      setResult(null)
      return
    }
    setResult(calculated)
    setError('')
  }

  return (
    <main className="app-shell calculator-shell">
      <div className="calculator-topline">
        <Link className="back-link" to="/"><ArrowLeft size={16} /> Все калькуляторы</Link>
        <span className="version-label">НЕОТЛОЖНАЯ МЕДИЦИНА · GCS</span>
      </div>

      <section className="calculator-heading">
        <div className="eyebrow"><span className="pulse-dot" /> КЛИНИЧЕСКАЯ ШКАЛА</div>
        <h1>GCS</h1>
        <p>Шкала комы Глазго — структурированная оценка открывания глаз, речевой и двигательной реакции.</p>
      </section>

      <div className="calculator-layout">
        <form className="calculator-panel" onSubmit={handleCalculate}>
          <div className="panel-heading">
            <div><span className="panel-kicker">ШАГ 1</span><h2>Оценка трёх компонентов</h2></div>
            <span className="points-label">E + V + M · 3–15</span>
          </div>
          <p className="field-hint">Оцените наилучшую наблюдаемую реакцию отдельно для каждого компонента. Перед оценкой проверьте факторы, которые могут мешать ответу.</p>

          <div className="gcs-entry">
            <div className="field-grid">
              <label className="calc-field">
                <span>Открывание глаз <small>E · 1–4</small></span>
                <select required value={values.eye} onChange={(event) => updateField('eye', event.target.value)}>
                  <option value="">Выберите реакцию</option>
                  {options.eye.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
                </select>
              </label>
              <label className="calc-field">
                <span>Речевая реакция <small>V · 1–5</small></span>
                <select required value={values.verbal} onChange={(event) => updateField('verbal', event.target.value)}>
                  <option value="">Выберите реакцию</option>
                  {options.verbal.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
                </select>
              </label>
              <label className="calc-field">
                <span>Двигательная реакция <small>M · 1–6</small></span>
                <select required value={values.motor} onChange={(event) => updateField('motor', event.target.value)}>
                  <option value="">Выберите реакцию</option>
                  {options.motor.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
                </select>
              </label>
            </div>
          </div>

          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="calculator-actions">
            <button className="primary-button" type="submit">Рассчитать GCS</button>
            <button className="reset-button" type="button" onClick={reset}><RotateCcw size={15} /> Сбросить</button>
          </div>
          <p className="privacy-note"><ShieldCheck size={14} /> Данные не отправляются на сервер и не сохраняются.</p>
        </form>

        <aside className="calculator-aside">
          <div className="info-panel">
            <div className="info-icon"><BookOpen size={18} /></div>
            <h3>Компоненты шкалы</h3>
            <ul>
              <li><b>E</b> — открывание глаз (1–4)</li>
              <li><b>V</b> — речевая реакция (1–5)</li>
              <li><b>M</b> — двигательная реакция (1–6)</li>
            </ul>
            <p>Общий балл — сумма трёх компонентов (3–15), если каждый из них можно оценить.</p>
          </div>
          <div className="threshold-panel">
            <h3>Важные ограничения</h3>
            <p>При интубации речевой компонент обычно отмечают NT, если речь оценить невозможно. Не заменяйте NT на 1.</p>
            <p>Учитывайте седацию, нейромышечную блокаду, языковые и коммуникативные барьеры, нарушения слуха/речи (включая афазию), травмы глаз/лица и повреждение спинного мозга. При мешающем факторе используйте NT для соответствующего компонента. У детей младше 5 лет нужна педиатрическая модификация.</p>
          </div>
        </aside>
      </div>

      {result && (
        <section className="result-panel" aria-live="polite">
          <div className="result-topline"><span className="panel-kicker">РЕЗУЛЬТАТ ОЦЕНКИ</span><span className="risk-tag">{result.hasUntestableComponent ? 'Есть NT-компонент' : 'Все компоненты оценены'}</span></div>
          <div className="score-display"><strong>{result.total ?? 'NT'}</strong><span>{result.total === null ? 'общий балл не рассчитывается' : '/ 15 баллов'}</span></div>
          <div className="care-context">
            <b>Компоненты: {result.notation}</b>
            <p>{result.total === null
              ? 'Один или несколько компонентов не поддаются оценке. Зафиксируйте доступные компоненты отдельно; общий балл не указывается.'
              : 'Запишите компоненты E, V и M вместе с суммой. Одна сумма не заменяет описание наблюдаемых реакций.'}</p>
          </div>
          <h3>Разбор компонентов</h3>
          <div className="criteria-list">
            {result.components.map((component) => <div className="criterion-row" key={component.key}><span className="criterion-point active">{component.display}</span><span><b>{component.label}</b><small>{component.response}</small></span><span className="criterion-status">{component.value === null ? 'NT' : 'Оценено'}</span></div>)}
          </div>
          <p className="clinical-warning"><ShieldAlert size={14} /> GCS — инструмент описания уровня сознания и динамики реакции, а не самостоятельный диагноз. Учитывайте клинический контекст и фиксируйте каждый компонент отдельно.</p>
        </section>
      )}

      <section className="reference-panel">
        <div><span className="panel-kicker">ИСТОЧНИК И МЕТОДИКА</span><h2>{GCS_REFERENCE.title}</h2><p>{GCS_REFERENCE.originalSource}</p></div>
        <a href={GCS_REFERENCE.url} target="_blank" rel="noreferrer">Официальная методика ↗</a><a href={GCS_REFERENCE.assessmentAidUrl} target="_blank" rel="noreferrer">Памятка по стандартизированной оценке ↗</a><a href={GCS_REFERENCE.faqUrl} target="_blank" rel="noreferrer">FAQ: NT и мешающие факторы ↗</a><a href={GCS_REFERENCE.russianGuidelineUrl} target="_blank" rel="noreferrer">КР РФ по очаговой травме мозга ↗</a>
        <small>{GCS_REFERENCE.organisation}. Проверено: {GCS_REFERENCE.accessed}. {GCS_REFERENCE.notes[1]} {GCS_REFERENCE.notes[6]} {GCS_REFERENCE.notes[7]}</small>
      </section>
      <p className="calculator-disclaimer">Образовательный инструмент. Не заменяет стандартизированную клиническую оценку, обучение и клиническое решение специалиста.</p>
    </main>
  )
}
