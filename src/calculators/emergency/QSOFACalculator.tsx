import { useState, type FormEvent } from 'react'
import { ArrowLeft, BookOpen, RotateCcw, ShieldAlert, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { calculateQSOFA, type QSOFAInput, type QSOFAResult } from './qsofa'
import { QSOFA_REFERENCE } from './qsofa.reference'

const initialValues = { respiratoryRate: '', systolicBP: '', eye: '', verbal: '', motor: '' }

const gcsOptions = {
  eye: [
    { value: '4', label: '4 — спонтанно' },
    { value: '3', label: '3 — на обращение' },
    { value: '2', label: '2 — на давление' },
    { value: '1', label: '1 — отсутствует' },
  ],
  verbal: [
    { value: '5', label: '5 — ориентирован' },
    { value: '4', label: '4 — спутанная речь' },
    { value: '3', label: '3 — отдельные слова' },
    { value: '2', label: '2 — нечленораздельные звуки' },
    { value: '1', label: '1 — отсутствует' },
  ],
  motor: [
    { value: '6', label: '6 — выполняет команды' },
    { value: '5', label: '5 — локализует давление' },
    { value: '4', label: '4 — отдёргивает конечность' },
    { value: '3', label: '3 — патологическое сгибание' },
    { value: '2', label: '2 — разгибание' },
    { value: '1', label: '1 — отсутствует' },
  ],
}

export default function QSOFACalculator() {
  const [values, setValues] = useState(initialValues)
  const [result, setResult] = useState<QSOFAResult | null>(null)
  const [error, setError] = useState('')

  const gcs = values.eye && values.verbal && values.motor ? Number(values.eye) + Number(values.verbal) + Number(values.motor) : null

  function updateField(field: keyof typeof initialValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setResult(null)
    setError('')
  }

  function handleCalculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (values.respiratoryRate.trim() === '' || values.systolicBP.trim() === '') {
      setError('Заполните частоту дыхания и систолическое давление.')
      setResult(null)
      return
    }

    if (gcs === null) {
      setError('Оцените все три компонента GCS: открывание глаз, речевую и двигательную реакцию.')
      setResult(null)
      return
    }

    const input: QSOFAInput = {
      respiratoryRate: Number(values.respiratoryRate),
      systolicBP: Number(values.systolicBP),
      gcs,
    }
    if (!Number.isInteger(input.respiratoryRate) || !Number.isInteger(input.systolicBP)) {
      setError('Частота дыхания и систолическое давление должны быть указаны целыми числами.')
      setResult(null)
      return
    }
    if (!Number.isFinite(input.respiratoryRate) || !Number.isFinite(input.systolicBP)
      || input.respiratoryRate < 1 || input.respiratoryRate > 100
      || input.systolicBP < 1 || input.systolicBP > 300
      || input.gcs < 3 || input.gcs > 15) {
      setError('Проверьте введённые значения.')
      setResult(null)
      return
    }

    setResult(calculateQSOFA(input))
    setError('')
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
        <span className="version-label">НЕОТЛОЖНАЯ МЕДИЦИНА · qSOFA</span>
      </div>

      <section className="calculator-heading">
        <div className="eyebrow"><span className="pulse-dot" /> КЛИНИЧЕСКАЯ ШКАЛА</div>
        <h1>qSOFA</h1>
        <p>Быстрая оценка риска неблагоприятного исхода у взрослых пациентов с подозреваемой инфекцией.</p>
      </section>

      <div className="calculator-layout">
        <form className="calculator-panel" onSubmit={handleCalculate}>
          <div className="panel-heading">
            <div><span className="panel-kicker">ШАГ 1</span><h2>Клинические параметры</h2></div>
            <span className="points-label">3 критерия · 3 балла</span>
          </div>

          <div className="field-grid">
            <label className="calc-field">
              <span>Частота дыхания <small>в минуту</small></span>
              <input type="number" min="1" max="100" step="1" inputMode="numeric" placeholder="Например, 24" value={values.respiratoryRate} onChange={(event) => updateField('respiratoryRate', event.target.value)} />
            </label>
            <label className="calc-field">
              <span>Систолическое АД <small>мм рт. ст.</small></span>
              <input type="number" min="1" max="300" step="1" inputMode="numeric" placeholder="Например, 95" value={values.systolicBP} onChange={(event) => updateField('systolicBP', event.target.value)} />
            </label>
          </div>

          <div className="gcs-entry">
            <div className="panel-heading">
              <div><span className="panel-kicker">ОЦЕНКА СОЗНАНИЯ</span><h2>Шкала комы Глазго (GCS)</h2></div>
              <span className="points-label">E + V + M</span>
            </div>
            <p className="field-hint">Выберите наиболее выраженную реакцию пациента в каждом из трёх компонентов.</p>
            <div className="field-grid">
              <label className="calc-field">
                <span>Открывание глаз <small>E · 1–4</small></span>
                <select required value={values.eye} onChange={(event) => updateField('eye', event.target.value)}>
                  <option value="">Выберите реакцию</option>
                  {gcsOptions.eye.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
                </select>
              </label>
              <label className="calc-field">
                <span>Речевая реакция <small>V · 1–5</small></span>
                <select required value={values.verbal} onChange={(event) => updateField('verbal', event.target.value)}>
                  <option value="">Выберите реакцию</option>
                  {gcsOptions.verbal.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
                </select>
              </label>
              <label className="calc-field">
                <span>Двигательная реакция <small>M · 1–6</small></span>
                <select required value={values.motor} onChange={(event) => updateField('motor', event.target.value)}>
                  <option value="">Выберите реакцию</option>
                  {gcsOptions.motor.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
                </select>
              </label>
            </div>
            <div className="gcs-total">
              <span>Сумма GCS</span>
              <strong>{gcs ?? '—'}<small> / 15</small></strong>
              <span className={gcs === null ? 'gcs-status' : gcs === 15 ? 'gcs-status normal' : 'gcs-status altered'}>{gcs === null ? 'Оцените все компоненты' : gcs === 15 ? 'Максимальная оценка' : 'Есть снижение GCS'}</span>
            </div>
            <p className="field-hint">Для qSOFA: GCS 15 = 0 баллов; GCS менее 15 = 1 балл независимо от степени снижения. Сумма рассчитывается после выбора всех компонентов.</p>
            <p className="field-hint">Если компонент невозможно достоверно оценить (например, речевую реакцию у интубированного пациента), не подставляйте автоматически 1 балл: отметьте компонент как неоцениваемый и интерпретируйте результат с учётом ограничений.</p>
          </div>

          {error && <p className="form-error" role="alert">{error}</p>}

          <div className="calculator-actions">
            <button className="primary-button" type="submit">Рассчитать qSOFA</button>
            <button className="reset-button" type="button" onClick={reset}><RotateCcw size={15} /> Сбросить</button>
          </div>
          <p className="privacy-note"><ShieldCheck size={14} /> Данные не отправляются на сервер и не сохраняются.</p>
        </form>

        <aside className="calculator-aside">
          <div className="info-panel">
            <div className="info-icon"><BookOpen size={18} /></div>
            <h3>Три критерия qSOFA</h3>
            <ul>
              <li><b>R</b> — ЧДД ≥22/мин</li>
              <li><b>B</b> — САД ≤100 мм рт. ст.</li>
              <li><b>M</b> — изменение сознания, GCS &lt;15</li>
            </ul>
            <p>Каждый выполненный критерий добавляет 1 балл. Максимум — 3 балла.</p>
            <p>Не используйте qSOFA как единственный инструмент скрининга сепсиса. SSC 2026 рекомендует NEWS/NEWS2, MEWS или SIRS для госпитализированных остро заболевших взрослых.</p>
          </div>
          <div className="threshold-panel">
            <h3>Как трактовать результат</h3>
            <p><b>0–1 балл:</b> критериев меньше двух; сепсис не исключён.</p>
            <p><b>2–3 балла:</b> повышенный риск неблагоприятного исхода при подозреваемой инфекции; нужна дальнейшая клиническая оценка.</p>
          </div>
        </aside>
      </div>

      {result && (
        <section className="result-panel" aria-live="polite">
          <div className="result-topline"><span className="panel-kicker">РЕЗУЛЬТАТ РАСЧЁТА</span><span className={`risk-tag ${result.positive ? 'risk-high' : 'risk-low'}`}>{result.riskLabel}</span></div>
          <div className="score-display"><strong>{result.score}</strong><span>/ 3 балла</span></div>
          <div className="risk-meter" aria-label={`Набрано ${result.score} из 3 баллов`}><span style={{ width: `${result.score / 3 * 100}%` }} /></div>
          <div className={`care-context ${result.positive ? 'qsofa-positive' : ''}`}>
            <b>{result.positive ? 'Два или более критерия присутствуют' : 'Менее двух критериев присутствуют'}</b>
            <p>{result.interpretation}</p>
          </div>
          <h3>Разбор критериев</h3>
          <div className="criteria-list">
            {result.criteria.map((criterion) => <div className="criterion-row" key={criterion.key}><span className={criterion.met ? 'criterion-point active' : 'criterion-point'}>{criterion.points ? '+1' : '0'}</span><span><b>{criterion.label}</b><small>{criterion.explanation}</small></span><span className="criterion-status">{criterion.met ? 'Критерий есть' : 'Нет'}</span></div>)}
          </div>
          <p className="clinical-warning"><ShieldAlert size={14} /> qSOFA не является самостоятельным скрининговым тестом на сепсис. Руководство Surviving Sepsis Campaign 2026 рекомендует NEWS/NEWS2, MEWS или SIRS вместо qSOFA в качестве единственного инструмента скрининга у госпитализированных остро заболевших взрослых. Отрицательный qSOFA не исключает сепсис.</p>
        </section>
      )}

      <section className="reference-panel">
        <div><span className="panel-kicker">ИСТОЧНИК И МЕТОДИКА</span><h2>{QSOFA_REFERENCE.title}</h2><p>{QSOFA_REFERENCE.definition} · {QSOFA_REFERENCE.guideline}</p></div>
        <a href={QSOFA_REFERENCE.url} target="_blank" rel="noreferrer">Открыть руководство SSC 2026 ↗</a>
        <small>{QSOFA_REFERENCE.originalSource}. Проверено: {QSOFA_REFERENCE.accessed}. {QSOFA_REFERENCE.notes[0]}</small>
      </section>
      <p className="calculator-disclaimer">Образовательный инструмент. qSOFA не устанавливает и не исключает диагноз сепсиса и не заменяет клиническую оценку.</p>
    </main>
  )
}
