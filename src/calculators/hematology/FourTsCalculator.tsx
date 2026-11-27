import { useState, type FormEvent } from 'react'
import { ArrowLeft, BookOpen, RotateCcw, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { calculateFourTs, type FourTsResult, type FourTsPoints } from './fourTs'
import { FOUR_TS_REFERENCE } from './fourTs.reference'

const initialValues = {
  thrombocytopenia: '',
  timing: '',
  thrombosisOrSequelae: '',
  otherCauses: '',
  assessmentConfirmed: false,
}

export default function FourTsCalculator() {
  const [values, setValues] = useState(initialValues)
  const [result, setResult] = useState<FourTsResult | null>(null)
  const [error, setError] = useState('')

  function updateField<K extends keyof typeof initialValues>(field: K, value: typeof initialValues[K]) {
    setValues((current) => ({ ...current, [field]: value }))
    setResult(null)
    setError('')
  }

  function handleCalculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!values.thrombocytopenia || !values.timing || !values.thrombosisOrSequelae || !values.otherCauses) {
      setError('Оцените все четыре компонента 4Ts.')
      setResult(null)
      return
    }
    try {
      setResult(calculateFourTs({
        thrombocytopenia: Number(values.thrombocytopenia) as FourTsPoints,
        timing: Number(values.timing) as FourTsPoints,
        thrombosisOrSequelae: Number(values.thrombosisOrSequelae) as FourTsPoints,
        otherCauses: Number(values.otherCauses) as FourTsPoints,
        assessmentConfirmed: values.assessmentConfirmed,
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
        <span className="version-label">ГЕМАТОЛОГИЯ · ГИТ</span>
      </div>

      <section className="calculator-heading">
        <div className="eyebrow"><span className="pulse-dot" /> ПРЕДТЕСТОВАЯ ВЕРОЯТНОСТЬ ГИТ</div>
        <h1>4Ts Score</h1>
        <p>Структурированная оценка клинической вероятности гепарин-индуцированной тромбоцитопении у пациента с подозрением на ГИТ II типа. Четыре компонента, максимум 8 баллов.</p>
      </section>

      <div className="calculator-layout">
        <form className="calculator-panel" onSubmit={handleCalculate}>
          <div className="panel-heading">
            <div><span className="panel-kicker">КОМПОНЕНТ 1</span><h2>Thrombocytopenia — тромбоцитопения</h2></div>
            <span className="points-label">0–2 балла</span>
          </div>
          <label className="calc-field field-full">
            <span>Степень снижения тромбоцитов и минимальный уровень</span>
            <select value={values.thrombocytopenia} onChange={(event) => updateField('thrombocytopenia', event.target.value)}>
              <option value="">Выберите категорию</option>
              <option value="2">2 — снижение &gt;50% и nadir ≥20 ×10⁹/л</option>
              <option value="1">1 — снижение 30–50% или nadir 10–19 ×10⁹/л</option>
              <option value="0">0 — снижение &lt;30% или nadir &lt;10 ×10⁹/л</option>
            </select>
          </label>

          <div className="panel-heading panel-subheading">
            <div><span className="panel-kicker">КОМПОНЕНТ 2</span><h2>Timing — сроки</h2></div>
            <span className="points-label">0–2 балла</span>
          </div>
          <label className="calc-field field-full">
            <span>Время начала снижения тромбоцитов относительно экспозиции гепарина</span>
            <select value={values.timing} onChange={(event) => updateField('timing', event.target.value)}>
              <option value="">Выберите категорию</option>
              <option value="2">2 — чётко на 5–10-й день или ≤1 дня при экспозиции в последние 30 дней</option>
              <option value="1">1 — неясно на 5–10-й день, после 10-го дня или ≤1 дня при экспозиции 30–100 дней назад</option>
              <option value="0">0 — &lt;4 дней без недавней экспозиции гепарина</option>
            </select>
          </label>

          <div className="panel-heading panel-subheading">
            <div><span className="panel-kicker">КОМПОНЕНТ 3</span><h2>Thrombosis — тромбозы и последствия</h2></div>
            <span className="points-label">0–2 балла</span>
          </div>
          <label className="calc-field field-full">
            <span>Тромботические события или характерные реакции</span>
            <select value={values.thrombosisOrSequelae} onChange={(event) => updateField('thrombosisOrSequelae', event.target.value)}>
              <option value="">Выберите категорию</option>
              <option value="2">2 — новый подтверждённый тромбоз, некроз кожи, острая системная реакция после болюса или инфаркт надпочечников</option>
              <option value="1">1 — прогрессирующий/рецидивирующий или подозреваемый тромбоз, эритематозные кожные поражения</option>
              <option value="0">0 — отсутствуют</option>
            </select>
          </label>

          <div className="panel-heading panel-subheading">
            <div><span className="panel-kicker">КОМПОНЕНТ 4</span><h2>Other causes — другие причины</h2></div>
            <span className="points-label">0–2 балла</span>
          </div>
          <label className="calc-field field-full">
            <span>Наличие альтернативной причины тромбоцитопении</span>
            <select value={values.otherCauses} onChange={(event) => updateField('otherCauses', event.target.value)}>
              <option value="">Выберите категорию</option>
              <option value="2">2 — другие причины не выявлены</option>
              <option value="1">1 — возможна другая причина</option>
              <option value="0">0 — имеется определённая альтернативная причина</option>
            </select>
          </label>

          <label className="check-field">
            <input type="checkbox" checked={values.assessmentConfirmed} onChange={(event) => updateField('assessmentConfirmed', event.target.checked)} />
            <span>Подтверждаю, что все четыре компонента оценены по полным и достоверным данным</span>
          </label>
          <p className="field-hint">Для оценки важны падение от максимального числа тромбоцитов после начала гепарина и точная дата начала падения; день первой экспозиции гепарина — день 0, оценивайте начало падения, а не достижение надира. При неполных данных не подставляйте предположения: восстановите анамнез и повторите оценку.</p>
          {error && <p className="form-error" role="alert">{error}</p>}

          <div className="calculator-actions">
            <button className="primary-button" type="submit">Рассчитать 4Ts</button>
            <button className="reset-button" type="button" onClick={reset}><RotateCcw size={15} /> Сбросить</button>
          </div>
          <p className="privacy-note"><ShieldCheck size={14} /> Данные не отправляются на сервер и не сохраняются.</p>
        </form>

        <aside className="calculator-aside">
          <div className="info-panel">
            <div className="info-icon"><BookOpen size={18} /></div>
            <h3>Как интерпретировать?</h3>
            <p>4Ts оценивает предтестовую вероятность ГИТ и помогает определить необходимость лабораторного исследования. Результат не является подтверждением диагноза.</p>
          </div>
          <div className="threshold-panel">
            <h3>Категории вероятности</h3>
            <p>0–3 балла: <b>низкая</b></p>
            <p>4–5 баллов: <b>промежуточная</b></p>
            <p>6–8 баллов: <b>высокая</b></p>
            <p>Максимум: <b>8 баллов</b></p>
          </div>
        </aside>
      </div>

      {result && (
        <section className="result-panel" aria-live="polite">
          <div className="result-topline"><span className="panel-kicker">РЕЗУЛЬТАТ РАСЧЁТА</span><span className={`risk-tag ${result.category === 'low' ? 'risk-low' : result.category === 'intermediate' ? 'risk-moderate' : 'risk-high'}`}>{result.categoryLabel}</span></div>
          <div className="score-display"><strong>{result.score}</strong><span>из 8 баллов</span></div>
          <p className="result-summary">Предтестовая категория: <b>{result.categoryLabel}</b>.</p>
          <div className="result-breakdown">
            {result.components.map((component) => <p key={component.key}>{component.label}: <b>{component.points} балла</b> — {component.interpretation}</p>)}
          </div>
          <div className="threshold-panel"><h3>Диагностический маршрут по КР РФ 2025</h3><p>{result.pathway}</p></div>
          <p className="clinical-warning">Не начинайте и не отменяйте антикоагулянт только на основании этого калькулятора. При клиническом подозрении на ГИТ требуется срочная оценка лечащей командой, лабораторная диагностика и выбор альтернативной антикоагуляции с учётом риска кровотечения и показаний.</p>
        </section>
      )}

      <section className="reference-panel">
        <div><span className="panel-kicker">ИСТОЧНИК И МЕТОДИКА</span><h2>{FOUR_TS_REFERENCE.title}</h2><p>{FOUR_TS_REFERENCE.guideline} · {FOUR_TS_REFERENCE.section}</p></div>
        <a href={FOUR_TS_REFERENCE.russianGuidelineUrl} target="_blank" rel="noreferrer">КР Минздрава РФ 2025 ↗</a><a href={FOUR_TS_REFERENCE.originalUrl} target="_blank" rel="noreferrer">Первоисточник 4Ts 2006 ↗</a><a href={FOUR_TS_REFERENCE.ashUrl} target="_blank" rel="noreferrer">ASH 2018 ↗</a>
        <small>Публикация: {FOUR_TS_REFERENCE.published}. Проверено: {FOUR_TS_REFERENCE.accessed}. {FOUR_TS_REFERENCE.notes[0]} {FOUR_TS_REFERENCE.notes[7]}</small>
      </section>
      <p className="calculator-disclaimer">Образовательный инструмент. Не заменяет клиническую оценку и лабораторное подтверждение ГИТ.</p>
    </main>
  )
}
