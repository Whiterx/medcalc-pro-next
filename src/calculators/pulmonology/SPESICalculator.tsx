import { useState, type FormEvent } from 'react'
import { ArrowLeft, BookOpen, RotateCcw, ShieldAlert, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { calculateSPESI, type SPESIInput, type SPESIResult } from './spesi'
import { SPESI_REFERENCE } from './spesi.reference'

const initialValues = {
  age: '', historyOfCancer: false, chronicCardiopulmonaryDisease: false,
  heartRate: '', systolicBP: '', oxygenSaturation: '',
}

export default function SPESICalculator() {
  const [values, setValues] = useState(initialValues)
  const [result, setResult] = useState<SPESIResult | null>(null)
  const [error, setError] = useState('')

  function updateField<K extends keyof typeof initialValues>(key: K, value: typeof initialValues[K]) {
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
    if ([values.age, values.heartRate, values.systolicBP, values.oxygenSaturation].some((value) => value === '')) {
      setError('Заполните возраст, ЧСС, систолическое АД и SpO₂.')
      setResult(null)
      return
    }
    try {
      const input: SPESIInput = {
        age: Number(values.age), historyOfCancer: values.historyOfCancer,
        chronicCardiopulmonaryDisease: values.chronicCardiopulmonaryDisease,
        heartRate: Number(values.heartRate), systolicBP: Number(values.systolicBP),
        oxygenSaturation: Number(values.oxygenSaturation),
      }
      setResult(calculateSPESI(input))
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
        <span className="version-label">ПУЛЬМОНОЛОГИЯ · sPESI</span>
      </div>
      <section className="calculator-heading">
        <div className="eyebrow"><span className="pulse-dot" /> ПРОГНОСТИЧЕСКАЯ ОЦЕНКА ПРИ ОСТРОЙ ТЭЛА</div>
        <h1>Simplified PESI (sPESI)</h1>
        <p>Оценка 30-дневного риска смертности у взрослых пациентов с острой симптоматической ТЭЛА.</p>
      </section>
      <div className="calculator-layout">
        <form className="calculator-panel" onSubmit={handleCalculate}>
          <div className="panel-heading"><div><span className="panel-kicker">ЧЕТЫРЕ ЧИСЛОВЫХ ПАРАМЕТРА</span><h2>Показатели при оценке</h2></div><span className="points-label">0–6 баллов</span></div>
          <div className="form-row">
            <label className="calc-field"><span>Возраст, лет</span><input type="number" min="18" max="120" step="1" required value={values.age} onChange={(event) => updateField('age', event.target.value)} placeholder="Возраст" /></label>
            <label className="calc-field"><span>ЧСС, в минуту</span><input type="number" min="20" max="300" step="1" required value={values.heartRate} onChange={(event) => updateField('heartRate', event.target.value)} placeholder="ЧСС" /></label>
          </div>
          <div className="form-row">
            <label className="calc-field"><span>Систолическое АД, мм рт. ст.</span><input type="number" min="0" max="300" step="1" required value={values.systolicBP} onChange={(event) => updateField('systolicBP', event.target.value)} placeholder="САД" /></label>
            <label className="calc-field"><span>SpO₂, %</span><input type="number" min="0" max="100" step="any" required value={values.oxygenSaturation} onChange={(event) => updateField('oxygenSaturation', event.target.value)} placeholder="Сатурация" /></label>
          </div>
          <div className="news2-section">
            <div className="panel-heading panel-subheading"><div><span className="panel-kicker">АНАМНЕЗ</span><h2>Клинические факторы</h2></div></div>
            <label className="form-check">
              <input type="checkbox" className="form-check__input" checked={values.historyOfCancer} onChange={(event) => updateField('historyOfCancer', event.target.checked)} />
              <span className="form-check__label">Онкологическое заболевание в анамнезе</span><span className="form-check__score">+1</span>
            </label>
            <label className="form-check">
              <input type="checkbox" className="form-check__input" checked={values.chronicCardiopulmonaryDisease} onChange={(event) => updateField('chronicCardiopulmonaryDisease', event.target.checked)} />
              <span className="form-check__label">Хроническая сердечная недостаточность или хроническое заболевание лёгких</span><span className="form-check__score">+1</span>
            </label>
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="calculator-actions">
            <button className="primary-button" type="submit">Рассчитать sPESI</button>
            <button className="reset-button" type="button" onClick={reset}><RotateCcw size={15} /> Сбросить</button>
          </div>
          <p className="privacy-note"><ShieldCheck size={14} /> Данные не отправляются на сервер и не сохраняются.</p>
        </form>
        <aside className="calculator-aside">
          <div className="info-panel"><div className="info-icon"><BookOpen size={18} /></div><h3>Шесть критериев</h3><p>Каждый критерий добавляет 1 балл. Шкала применяется для прогностической оценки острой ТЭЛА, а не для её диагностики.</p></div>
          <div className="threshold-panel"><h3>Интерпретация</h3><p><b>0 баллов:</b> низкий риск ранней смертности.</p><p><b>≥1 балла:</b> повышенный риск ранней смертности.</p><p>При шоке или стойкой гипотонии пациент высокорисковый независимо от результата.</p></div>
        </aside>
      </div>
      {result && (
        <section className="result-panel" aria-live="polite">
          <div className="result-topline"><span className="panel-kicker">РЕЗУЛЬТАТ РАСЧЁТА</span><span className="risk-tag risk-moderate">sPESI</span></div>
          <div className="score-display"><strong>{result.score}</strong><span>из 6 баллов</span></div>
          <div className="result-summary"><b>{result.categoryLabel}</b></div>
          <h3>Разбор критериев</h3>
          <div className="criteria-list">{result.criteria.map((item) => (
            <div className="criterion-row" key={item.key}><span className="criterion-point">{item.points}</span><span><b>{item.label}</b><small>{item.value}</small></span><span className="criterion-status">{item.points} б.</span></div>
          ))}</div>
          <p className="clinical-warning"><ShieldAlert size={14} /> При гемодинамической нестабильности/шоке sPESI не должен задерживать неотложную оценку: пациент относится к высокорисковой категории независимо от суммы баллов. Нулевой балл не означает автоматическую выписку.</p>
        </section>
      )}
      <section className="reference-panel">
        <div><span className="panel-kicker">ИСТОЧНИК И МЕТОДИКА</span><h2>{SPESI_REFERENCE.title}</h2><p>{SPESI_REFERENCE.originalSource}</p></div>
        <a href={SPESI_REFERENCE.originalUrl} target="_blank" rel="noreferrer">Открыть оригинальную публикацию ↗</a>
        <small>{SPESI_REFERENCE.guideline} · <a href={SPESI_REFERENCE.guidelineUrl} target="_blank" rel="noreferrer">Рекомендации ESC ↗</a> Проверено: {SPESI_REFERENCE.accessed}.</small>
      </section>
      <p className="calculator-disclaimer">Образовательный инструмент для прогностической оценки взрослых пациентов с острой ТЭЛА. Не диагностирует ТЭЛА и не заменяет клиническое решение.</p>
    </main>
  )
}
