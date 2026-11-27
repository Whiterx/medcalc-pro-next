import { useState, type FormEvent } from 'react'
import { ArrowLeft, BookOpen, RotateCcw, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { calculateHEART, type HEARTResult } from './heart'
import { HEART_REFERENCE } from './heart.reference'

const initialValues = {
  historyScore: '',
  ecgScore: '',
  ageYears: '',
  coronaryRiskFactorCount: '',
  knownAtheroscleroticDisease: false,
  troponinMultipleOfULN: '',
}

export default function HEARTCalculator() {
  const [values, setValues] = useState(initialValues)
  const [result, setResult] = useState<HEARTResult | null>(null)
  const [error, setError] = useState('')

  function updateField<K extends keyof typeof initialValues>(field: K, value: typeof initialValues[K]) {
    setValues((current) => ({ ...current, [field]: value }))
    setResult(null)
    setError('')
  }

  function handleCalculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if ([values.historyScore, values.ecgScore, values.ageYears, values.troponinMultipleOfULN].some((value) => value === '') || (!values.knownAtheroscleroticDisease && values.coronaryRiskFactorCount === '')) {
      setError('Заполните все пять компонентов HEART и укажите тропонин относительно ВГН.')
      setResult(null)
      return
    }
    try {
      setResult(calculateHEART({
        historyScore: Number(values.historyScore),
        ecgScore: Number(values.ecgScore),
        ageYears: Number(values.ageYears),
        coronaryRiskFactorCount: values.coronaryRiskFactorCount === '' ? 0 : Number(values.coronaryRiskFactorCount),
        knownAtheroscleroticDisease: values.knownAtheroscleroticDisease,
        troponinMultipleOfULN: Number(values.troponinMultipleOfULN),
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
        <span className="version-label">КАРДИОЛОГИЯ · HEART</span>
      </div>

      <section className="calculator-heading">
        <div className="eyebrow"><span className="pulse-dot" /> ОЦЕНКА БОЛИ В ГРУДИ В ОТДЕЛЕНИИ НЕОТЛОЖНОЙ ПОМОЩИ</div>
        <h1>HEART Score</h1>
        <p>Оценка риска крупных неблагоприятных сердечно-сосудистых событий у взрослых пациентов с болью в груди. Пять компонентов, 0–10 баллов.</p>
      </section>

      <div className="calculator-layout">
        <form className="calculator-panel" onSubmit={handleCalculate}>
          <div className="panel-heading">
            <div><span className="panel-kicker">КОМПОНЕНТЫ HEART</span><h2>Анамнез и ЭКГ</h2></div>
            <span className="points-label">H + E</span>
          </div>

          <label className="calc-field field-full">
            <span>H — History: подозрительность анамнеза</span>
            <select value={values.historyScore} onChange={(event) => updateField('historyScore', event.target.value)}>
              <option value="">Не выбрано</option>
              <option value="0">Слабо подозрительный — 0 баллов</option>
              <option value="1">Умеренно подозрительный — 1 балл</option>
              <option value="2">Сильно подозрительный — 2 балла</option>
            </select>
          </label>

          <label className="calc-field field-full">
            <span>E — ECG: изменения на ЭКГ</span>
            <select value={values.ecgScore} onChange={(event) => updateField('ecgScore', event.target.value)}>
              <option value="">Не выбрано</option>
              <option value="0">Нормальная ЭКГ — 0 баллов</option>
              <option value="1">Неспецифические изменения реполяризации — 1 балл</option>
              <option value="2">Значимая депрессия ST — 2 балла</option>
            </select>
          </label>

          <div className="panel-heading panel-subheading">
            <div><span className="panel-kicker">A + R</span><h2>Возраст и факторы риска</h2></div>
            <span className="points-label">2 компонента</span>
          </div>

          <div className="field-grid">
            <label className="calc-field">
              <span>A — Age <small>лет; ≤45 = 0, 46–64 = 1, ≥65 = 2</small></span>
              <input type="number" min="18" max="120" step="1" inputMode="numeric" placeholder="Введите возраст" value={values.ageYears} onChange={(event) => updateField('ageYears', event.target.value)} />
            </label>
            <label className="calc-field">
              <span>Традиционные факторы риска ИБС <small>количество, 0–6</small></span>
              <input type="number" min="0" max="6" step="1" inputMode="numeric" placeholder={values.knownAtheroscleroticDisease ? 'Не требуется при известном атеросклерозе' : 'Введите количество'} value={values.coronaryRiskFactorCount} onChange={(event) => updateField('coronaryRiskFactorCount', event.target.value)} />
            </label>
          </div>
          <label className="check-field">
            <input type="checkbox" checked={values.knownAtheroscleroticDisease} onChange={(event) => updateField('knownAtheroscleroticDisease', event.target.checked)} />
            <span>Известное атеросклеротическое заболевание (например, ИБС, перенесённый ИМ, реваскуляризация, инсульт или заболевание периферических артерий) — компонент R = 2</span>
          </label>
          <p className="field-hint">Традиционные факторы: артериальная гипертензия, дислипидемия, сахарный диабет, ожирение, курение и семейный анамнез преждевременной ИБС. При ≥3 факторах или известном атеросклеротическом заболевании компонент R = 2. Если известное атеросклеротическое заболевание отмечено выше, количество факторов риска можно не заполнять.</p>

          <div className="panel-heading panel-subheading">
            <div><span className="panel-kicker">T — TROPONIN</span><h2>Кардиальный тропонин</h2></div>
            <span className="points-label">0–2 балла</span>
          </div>
          <label className="calc-field field-full">
            <span>Результат тропонина относительно ВГН <small>кратность верхней границы нормы (ВГН) данного анализа</small></span>
            <input type="number" min="0" step="any" inputMode="decimal" placeholder="Например, 1.4" value={values.troponinMultipleOfULN} onChange={(event) => updateField('troponinMultipleOfULN', event.target.value)} />
          </label>
          <p className="field-hint">≤1× ВГН = 0; &gt;1× и &lt;3× ВГН = 1; ≥3× ВГН = 2. Используйте assay-specific верхнюю границу нормы лаборатории, для hs-cTn — 99-й перцентиль конкретного анализа.</p>
          {error && <p className="form-error" role="alert">{error}</p>}

          <div className="calculator-actions">
            <button className="primary-button" type="submit">Рассчитать HEART</button>
            <button className="reset-button" type="button" onClick={reset}><RotateCcw size={15} /> Сбросить</button>
          </div>
          <p className="privacy-note"><ShieldCheck size={14} /> Данные не отправляются на сервер и не сохраняются.</p>
        </form>

        <aside className="calculator-aside">
          <div className="info-panel">
            <div className="info-icon"><BookOpen size={18} /></div>
            <h3>Что прогнозирует HEART?</h3>
            <p>Шестинедельный риск крупных неблагоприятных сердечно-сосудистых событий (MACE) у пациентов с болью в груди в отделении неотложной помощи. Это не диагностический тест на инфаркт.</p>
          </div>
          <div className="threshold-panel">
            <h3>Категории риска</h3>
            <p>0–3 балла: <b>низкий</b></p>
            <p>4–6 баллов: <b>промежуточный</b></p>
            <p>7–10 баллов: <b>высокий</b></p>
            <p>Максимум: <b>10 баллов</b></p>
          </div>
        </aside>
      </div>

      {result && (
        <section className="result-panel" aria-live="polite">
          <div className="result-topline"><span className="panel-kicker">РЕЗУЛЬТАТ РАСЧЁТА</span><span className={`risk-tag ${result.riskCategory === 'low' ? 'risk-low' : result.riskCategory === 'intermediate' ? 'risk-moderate' : 'risk-high'}`}>{result.riskLabel}</span></div>
          <div className="score-display"><strong>{result.score}</strong><span>из 10 баллов</span></div>
          <p className="result-summary">MACE в течение 6 недель в проспективной валидационной когорте: <b>{result.sixWeekMacePercent.toFixed(1)}%</b>.</p>
          <div className="result-breakdown">
            {result.components.map((component) => <p key={component.key}>{component.label}: <b>{component.value}</b> <span>— {component.points} балл(а)</span></p>)}
          </div>
          <p className="clinical-warning">HEART Score не равен HEART Pathway. Не принимайте решение о выписке только по одному баллу: учитывайте динамику симптомов, повторные ЭКГ и серийные тропонины по локальному протоколу. Для пациентов с установленным ОКСбпST российские КР рекомендуют GRACE; HEART не заменяет GRACE и не определяет инвазивную стратегию. Показатели MACE взяты из конкретной исследовательской когорты и не являются индивидуальным прогнозом.</p>
        </section>
      )}

      <section className="reference-panel">
        <div><span className="panel-kicker">ИСТОЧНИК И МЕТОДИКА</span><h2>{HEART_REFERENCE.title}</h2><p>{HEART_REFERENCE.guideline} · {HEART_REFERENCE.section}</p></div>
        <a href={HEART_REFERENCE.originalUrl} target="_blank" rel="noreferrer">Оригинальная публикация 2008 ↗</a><a href={HEART_REFERENCE.url} target="_blank" rel="noreferrer">Проспективная валидация 2013 ↗</a><a href={HEART_REFERENCE.russianGuidelineUrl} target="_blank" rel="noreferrer">КР Минздрава РФ 2024 ↗</a>
        <small>Проверено: {HEART_REFERENCE.accessed}. {HEART_REFERENCE.notes[4]} {HEART_REFERENCE.notes[6]} {HEART_REFERENCE.notes[7]}</small>
      </section>
      <p className="calculator-disclaimer">Образовательный инструмент. Не заменяет клиническую оценку, повторные ЭКГ и серийные измерения тропонина.</p>
    </main>
  )
}
