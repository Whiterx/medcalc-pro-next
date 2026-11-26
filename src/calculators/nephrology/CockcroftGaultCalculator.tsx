import { useState, type FormEvent } from 'react'
import { ArrowLeft, BookOpen, RotateCcw, ShieldAlert, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { calculateCockcroftGault, type CockcroftGaultResult } from './cockcroftGault'
import { COCKCROFT_GAULT_REFERENCE } from './cockcroftGault.reference'

const initialValues = { age: '', weightKg: '', serumCreatinineUmolL: '', sex: '' as '' | 'male' | 'female' }

export default function CockcroftGaultCalculator() {
  const [values, setValues] = useState(initialValues)
  const [result, setResult] = useState<CockcroftGaultResult | null>(null)
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
    if ([values.age, values.weightKg, values.serumCreatinineUmolL, values.sex].some((value) => value === '')) {
      setError('Заполните возраст, массу тела, креатинин и половой коэффициент.')
      setResult(null)
      return
    }
    try {
      setResult(calculateCockcroftGault({
        age: Number(values.age), weightKg: Number(values.weightKg),
        serumCreatinineUmolL: Number(values.serumCreatinineUmolL),
        sex: values.sex as 'male' | 'female',
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
        <span className="version-label">НЕФРОЛОГИЯ · COCKCROFT–GAULT</span>
      </div>
      <section className="calculator-heading">
        <div className="eyebrow"><span className="pulse-dot" /> ОЦЕНКА КЛИРЕНСА КРЕАТИНИНА</div>
        <h1>Cockcroft–Gault</h1>
        <p>Расчёт абсолютного клиренса креатинина для задач, где дозирование препарата основано на CrCl.</p>
      </section>
      <div className="calculator-layout">
        <form className="calculator-panel" onSubmit={handleCalculate}>
          <div className="panel-heading"><div><span className="panel-kicker">ЧЕТЫРЕ ПАРАМЕТРА</span><h2>Исходные данные</h2></div><span className="points-label">мл/мин</span></div>
          <div className="form-row">
            <label className="calc-field"><span>Возраст, лет</span><input type="number" min="18" max="120" step="1" required value={values.age} onChange={(event) => updateField('age', event.target.value)} placeholder="Возраст" /></label>
            <label className="calc-field"><span>Масса для формулы, кг</span><input type="number" min="20" max="300" step="0.1" required value={values.weightKg} onChange={(event) => updateField('weightKg', event.target.value)} placeholder="Масса тела" /></label>
          </div>
          <div className="form-row">
            <label className="calc-field"><span>Креатинин, мкмоль/л</span><input type="number" min="10" max="2000" step="any" required value={values.serumCreatinineUmolL} onChange={(event) => updateField('serumCreatinineUmolL', event.target.value)} placeholder="Креатинин" /></label>
            <label className="calc-field"><span>Половой коэффициент</span><select required value={values.sex} onChange={(event) => updateField('sex', event.target.value as '' | 'male' | 'female')}><option value="">Выберите</option><option value="male">Мужской — ×1,0</option><option value="female">Женский — ×0,85</option></select></label>
          </div>
          <p className="field-hint">Укажите массу, которую предписывает использовать конкретная инструкция/протокол. При ожирении выбор фактической, идеальной или скорректированной массы зависит от препарата; калькулятор не выбирает её автоматически.</p>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="calculator-actions">
            <button className="primary-button" type="submit">Рассчитать CrCl</button>
            <button className="reset-button" type="button" onClick={reset}><RotateCcw size={15} /> Сбросить</button>
          </div>
          <p className="privacy-note"><ShieldCheck size={14} /> Данные не отправляются на сервер и не сохраняются.</p>
        </form>
        <aside className="calculator-aside">
          <div className="info-panel"><div className="info-icon"><BookOpen size={18} /></div><h3>Для дозирования лекарств</h3><p>CrCl по Cockcroft–Gault — абсолютное значение в мл/мин, не нормированное на площадь поверхности тела.</p></div>
          <div className="threshold-panel"><h3>Не путать с eGFR</h3><p>Это не CKD-EPI и не стадия ХБП. Используйте метод, указанный в инструкции конкретного препарата.</p></div>
        </aside>
      </div>
      {result && (
        <section className="result-panel" aria-live="polite">
          <div className="result-topline"><span className="panel-kicker">РЕЗУЛЬТАТ РАСЧЁТА</span><span className="risk-tag risk-moderate">Cockcroft–Gault</span></div>
          <div className="score-display"><strong>{result.creatinineClearance.toFixed(1)}</strong><span>мл/мин · CrCl</span></div>
          <div className="result-summary"><b>Креатинин: {result.serumCreatinineMgDl.toFixed(2)} мг/дл</b><p>{result.formula}</p></div>
          <p className="clinical-warning"><ShieldAlert size={14} /> Не интерпретируйте CrCl как eGFR или стадию ХБП. При ОПП/нестабильном креатинине, ожирении, низкой мышечной массе или необычном размере тела расчёт может быть неточным. Не меняйте дозу препарата без проверки его инструкции и клинического контекста.</p>
        </section>
      )}
      <section className="reference-panel">
        <div><span className="panel-kicker">ИСТОЧНИК И МЕТОДИКА</span><h2>{COCKCROFT_GAULT_REFERENCE.title}</h2><p>{COCKCROFT_GAULT_REFERENCE.originalSource}</p></div>
        <a href={COCKCROFT_GAULT_REFERENCE.originalUrl} target="_blank" rel="noreferrer">Открыть оригинальную публикацию ↗</a>
        <small>{COCKCROFT_GAULT_REFERENCE.supportingSource} · <a href={COCKCROFT_GAULT_REFERENCE.supportingUrl} target="_blank" rel="noreferrer">Рекомендации NIDDK ↗</a> Проверено: {COCKCROFT_GAULT_REFERENCE.accessed}.</small>
      </section>
      <p className="calculator-disclaimer">Образовательный расчёт CrCl для взрослых. Не заменяет выбор метода оценки функции почек и дозы по инструкции конкретного препарата.</p>
    </main>
  )
}
