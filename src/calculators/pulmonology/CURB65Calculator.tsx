import { useState, type FormEvent } from 'react'
import { ArrowLeft, BookOpen, RotateCcw, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { calculateCURB65, type CURB65Input, type CURB65Result } from './curb65'
import { CURB65_REFERENCE } from './curb65.reference'

const initialValues = {
  age: '',
  urea: '',
  respiratoryRate: '',
  systolicBP: '',
  diastolicBP: '',
}

export default function CURB65Calculator() {
  const [values, setValues] = useState(initialValues)
  const [confusion, setConfusion] = useState(false)
  const [result, setResult] = useState<CURB65Result | null>(null)
  const [error, setError] = useState('')

  function updateField(field: keyof typeof initialValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setResult(null)
    setError('')
  }

  function handleCalculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const required = Object.entries(values)
    if (required.some(([, value]) => value.trim() === '')) {
      setError('Заполните все числовые поля, чтобы рассчитать шкалу.')
      setResult(null)
      return
    }

    const parsed = Object.fromEntries(required.map(([key, value]) => [key, Number(value)]))
    if (Object.values(parsed).some((value) => !Number.isFinite(value))) {
      setError('Проверьте введённые значения.')
      return
    }
    if (![parsed.age, parsed.respiratoryRate, parsed.systolicBP, parsed.diastolicBP].every(Number.isInteger)) {
      setError('Возраст, частота дыхания и показатели артериального давления должны быть указаны целыми числами.');
      return;
    }
    if (parsed.age < 18 || parsed.age > 120 || parsed.urea < 0 || parsed.urea > 100 || parsed.respiratoryRate < 1 || parsed.respiratoryRate > 100 || parsed.systolicBP < 1 || parsed.systolicBP > 300 || parsed.diastolicBP < 1 || parsed.diastolicBP > 200) {
      setError('Проверьте диапазоны значений. Эта версия шкалы предназначена для взрослых.')
      return
    }

    const input: CURB65Input = {
      age: parsed.age,
      urea: parsed.urea,
      respiratoryRate: parsed.respiratoryRate,
      systolicBP: parsed.systolicBP,
      diastolicBP: parsed.diastolicBP,
      confusion,
    }
    setResult(calculateCURB65(input))
    setError('')
  }

  function reset() {
    setValues(initialValues)
    setConfusion(false)
    setResult(null)
    setError('')
  }

  return (
    <main className="app-shell calculator-shell">
      <div className="calculator-topline">
        <Link className="back-link" to="/"><ArrowLeft size={16} /> Все калькуляторы</Link>
        <span className="version-label">ПУЛЬМОНОЛОГИЯ · CURB-65</span>
      </div>

      <section className="calculator-heading">
        <div className="eyebrow"><span className="pulse-dot" /> КЛИНИЧЕСКАЯ ШКАЛА</div>
        <h1>CURB-65</h1>
        <p>Оценка тяжести внебольничной пневмонии у взрослых в стационаре и риска 30-дневной смертности. Для первичной медицинской помощи NICE рекомендует шкалу CRB-65.</p>
      </section>

      <div className="calculator-layout">
        <form className="calculator-panel" onSubmit={handleCalculate}>
          <div className="panel-heading">
            <div><span className="panel-kicker">ШАГ 1</span><h2>Данные пациента</h2></div>
            <span className="points-label">5 критериев · 5 баллов</span>
          </div>

          <div className="field-grid">
            <label className="calc-field">
              <span>Возраст <small>лет</small></span>
              <input type="number" min="18" max="120" step="1" inputMode="numeric" placeholder="Например, 67" value={values.age} onChange={(event) => updateField('age', event.target.value)} />
            </label>
            <label className="calc-field">
              <span>Мочевина <small>ммоль/л</small></span>
              <input type="number" min="0" max="100" step="0.1" inputMode="decimal" placeholder="Например, 8.2" value={values.urea} onChange={(event) => updateField('urea', event.target.value)} />
            </label>
            <label className="calc-field">
              <span>Частота дыхания <small>в минуту</small></span>
              <input type="number" min="0" max="100" step="1" inputMode="numeric" placeholder="Например, 32" value={values.respiratoryRate} onChange={(event) => updateField('respiratoryRate', event.target.value)} />
            </label>
            <label className="calc-field">
              <span>Систолическое АД <small>мм рт. ст.</small></span>
              <input type="number" min="0" max="300" step="1" inputMode="numeric" placeholder="Например, 88" value={values.systolicBP} onChange={(event) => updateField('systolicBP', event.target.value)} />
            </label>
            <label className="calc-field">
              <span>Диастолическое АД <small>мм рт. ст.</small></span>
              <input type="number" min="0" max="200" step="1" inputMode="numeric" placeholder="Например, 58" value={values.diastolicBP} onChange={(event) => updateField('diastolicBP', event.target.value)} />
            </label>
          </div>

          <label className="confusion-option">
            <input type="checkbox" checked={confusion} onChange={(event) => { setConfusion(event.target.checked); setResult(null) }} />
            <span className="custom-check" />
            <span className="confusion-copy"><b>Новое нарушение сознания</b><small>AMTS ≤8 или новая дезориентация в месте, времени или собственной личности</small></span>
            <strong>+1</strong>
          </label>

          {error && <p className="form-error" role="alert">{error}</p>}

          <div className="calculator-actions">
            <button className="primary-button" type="submit">Рассчитать CURB-65</button>
            <button className="reset-button" type="button" onClick={reset}><RotateCcw size={15} /> Сбросить</button>
          </div>
          <p className="privacy-note"><ShieldCheck size={14} /> Данные не отправляются на сервер и не сохраняются.</p>
        </form>

        <aside className="calculator-aside">
          <div className="info-panel">
            <div className="info-icon"><BookOpen size={18} /></div>
            <h3>Что оценивает CURB-65?</h3>
            <p>Пять клинических критериев, каждый из которых добавляет один балл. Чем выше сумма, тем выше группа риска.</p>
            <ul><li><b>C</b> — Confusion, нарушение сознания</li><li><b>U</b> — Urea, мочевина</li><li><b>R</b> — Respiratory rate, ЧДД</li><li><b>B</b> — Blood pressure, артериальное давление</li><li><b>65</b> — возраст 65 лет и старше</li></ul>
          </div>
          <div className="threshold-panel">
            <h3>Пороговые значения</h3>
            <p>Мочевина <b>&gt;7 ммоль/л</b></p>
            <p>ЧДД <b>≥30/мин</b></p>
            <p>САД <b>&lt;90</b> или ДАД <b>≤60 мм рт. ст.</b></p>
            <p>Возраст <b>≥65 лет</b></p>
          </div>
        </aside>
      </div>

      {result && (
        <section className="result-panel" aria-live="polite">
          <div className="result-topline"><span className="panel-kicker">РЕЗУЛЬТАТ РАСЧЁТА</span><span className={`risk-tag risk-${result.risk}`}>{result.riskLabel}</span></div>
          <div className="score-display"><strong>{result.score}</strong><span>/ 5 баллов</span></div>
          <div className="risk-meter" aria-label={`Набрано ${result.score} из 5 баллов`}><span style={{ width: `${result.score * 20}%` }} /></div>
          <p className="mortality-estimate">Группа риска 30-дневной смертности по NICE: <b>{result.mortality}</b></p>
          <h3>Разбор критериев</h3>
          <div className="criteria-list">
            {result.criteria.map((criterion) => <div className="criterion-row" key={criterion.key}><span className={criterion.met ? 'criterion-point active' : 'criterion-point'}>{criterion.points ? '+1' : '0'}</span><span><b>{criterion.label}</b><small>{criterion.explanation}</small></span><span className="criterion-status">{criterion.met ? 'Критерий есть' : 'Нет'}</span></div>)}
          </div>
          <div className="care-context"><b>Контекст тактики по NICE</b><p>{result.careContext}</p></div>
          <p className="clinical-warning">Шкала не заменяет клиническую оценку. При дыхательной или гемодинамической нестабильности, сепсисе либо иных признаках тяжёлого состояния необходима срочная клиническая оценка независимо от балла.</p>
        </section>
      )}

      <section className="reference-panel">
        <div><span className="panel-kicker">ИСТОЧНИК И МЕТОДИКА</span><h2>{CURB65_REFERENCE.title}</h2><p>{CURB65_REFERENCE.guideline} · {CURB65_REFERENCE.section}</p></div>
        <a href={CURB65_REFERENCE.url} target="_blank" rel="noreferrer">Открыть руководство NICE ↗</a>
        <small>Версия источника: {CURB65_REFERENCE.published}. Проверено: {CURB65_REFERENCE.accessed}. {CURB65_REFERENCE.notes[0]}</small>
      </section>
      <p className="calculator-disclaimer">Образовательный инструмент. Результат предназначен для поддержки обучения и не является самостоятельным основанием для выбора места лечения.</p>
    </main>
  )
}
