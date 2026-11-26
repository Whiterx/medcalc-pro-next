import { useState, type FormEvent } from 'react'
import { ArrowLeft, BookOpen, RotateCcw, ShieldAlert, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { calculateVentilationBasics, type PBWFormulaSex, type VentilationBasicsResult } from './ventilationBasics'
import { VENTILATION_BASICS_REFERENCE } from './ventilationBasics.reference'

const initialValues = { height: '', formulaSex: '', tidalVolume: '' }

export default function VentilationBasicsCalculator() {
  const [values, setValues] = useState(initialValues)
  const [result, setResult] = useState<VentilationBasicsResult | null>(null)
  const [error, setError] = useState('')

  function update(field: keyof typeof initialValues, value: string) {
    setValues(current => ({ ...current, [field]: value }))
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
    if (!values.height.trim() || !values.formulaSex) {
      setError('Укажите рост и выберите вариант формулы PBW.')
      setResult(null)
      return
    }
    const height = Number(values.height)
    const tidalVolume = values.tidalVolume.trim() ? Number(values.tidalVolume) : null
    if (!Number.isFinite(height) || (tidalVolume !== null && !Number.isFinite(tidalVolume))) {
      setError('Проверьте введённые значения.')
      setResult(null)
      return
    }
    try {
      const next = calculateVentilationBasics({
        heightCm: height,
        formulaSex: values.formulaSex as PBWFormulaSex,
        tidalVolumeMl: tidalVolume,
      })
      setResult(next)
      setError('')
    } catch (e) {
      setResult(null)
      setError(e instanceof Error ? e.message : 'Не удалось выполнить расчёт.')
    }
  }

  const rangeText = result?.measuredRange === 'below'
    ? 'Ниже ориентира 4–8 мл/кг PBW'
    : result?.measuredRange === 'above'
      ? 'Выше ориентира 4–8 мл/кг PBW'
      : 'В пределах ориентира 4–8 мл/кг PBW'

  return (
    <main className="app-shell calculator-shell">
      <div className="calculator-topline">
        <Link className="back-link" to="/"><ArrowLeft size={16} /> Все калькуляторы</Link>
        <span className="version-label">ПУЛЬМОНОЛОГИЯ · ИВЛ</span>
      </div>

      <section className="calculator-heading">
        <div className="eyebrow"><span className="pulse-dot" /> РЕСПИРАТОРНАЯ ПОДДЕРЖКА</div>
        <h1>PBW и дыхательный объём</h1>
        <p>Расчёт предсказанной массы тела и ориентиров дыхательного объёма для взрослых пациентов на искусственной вентиляции лёгких.</p>
      </section>

      <div className="calculator-layout">
        <form className="calculator-panel" onSubmit={handleCalculate}>
          <div className="panel-heading">
            <div><span className="panel-kicker">ШАГ 1</span><h2>Исходные данные</h2></div>
            <span className="points-label">Взрослые пациенты</span>
          </div>
          <div className="field-grid">
            <label className="calc-field">
              <span>Рост <small>см</small></span>
              <input type="number" min="120" max="230" step="0.1" inputMode="decimal" placeholder="Например, 170" value={values.height} onChange={e => update('height', e.target.value)} />
            </label>
            <label className="calc-field">
              <span>Вариант формулы PBW</span>
              <select value={values.formulaSex} onChange={e => update('formulaSex', e.target.value)}>
                <option value="">Выберите вариант</option>
                <option value="male">Мужская формула</option>
                <option value="female">Женская формула</option>
              </select>
            </label>
            <label className="calc-field">
              <span>Введённый дыхательный объём <small>мл · необязательно</small></span>
              <input type="number" min="50" max="2000" step="1" inputMode="numeric" placeholder="Например, 400" value={values.tidalVolume} onChange={e => update('tidalVolume', e.target.value)} />
            </label>
          </div>

          <p className="field-hint">Фактическая масса тела для расчёта PBW не используется. Если хотите проверить уже установленный Vₜ, укажите его в третьем поле.</p>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="calculator-actions">
            <button className="primary-button" type="submit">Рассчитать PBW и Vₜ</button>
            <button className="reset-button" type="button" onClick={reset}><RotateCcw size={15} /> Сбросить</button>
          </div>
          <p className="privacy-note"><ShieldCheck size={14} /> Данные не отправляются на сервер и не сохраняются.</p>
        </form>

        <aside className="calculator-aside">
          <div className="info-panel">
            <div className="info-icon"><BookOpen size={18} /></div>
            <h3>Что такое PBW?</h3>
            <p>Предсказанная масса тела рассчитывается по росту и варианту формулы. При подборе дыхательного объёма ориентируются на PBW, а не на фактическую массу тела.</p>
            <ul>
              <li>Мужская формула: 50 + 0,91 × (рост − 152,4)</li>
              <li>Женская формула: 45,5 + 0,91 × (рост − 152,4)</li>
            </ul>
          </div>
          <div className="threshold-panel">
            <h3>Клинический контекст</h3>
            <p><b>4–8 мл/кг PBW</b> — рекомендуемый диапазон оценки дыхательного объёма в руководстве AARC 2024.</p>
            <p><b>6 мл/кг PBW</b> — исходная точка стратегии низкого дыхательного объёма при ОРДС; далее параметры индивидуализируют.</p>
          </div>
        </aside>
      </div>

      {result && (
        <section className="result-panel" aria-live="polite">
          <div className="result-topline"><span className="panel-kicker">РЕЗУЛЬТАТ РАСЧЁТА</span><span className="risk-tag risk-low">PBW</span></div>
          <div className="score-display"><strong>{result.pbwKg.toFixed(1)}</strong><span>кг · предсказанная масса тела</span></div>
          <h3>Расчётные ориентиры дыхательного объёма</h3>
          <div className="score-breakdown">
            <p>4 мл/кг PBW: <b>{result.tidalVolume4Ml} мл</b></p>
            <p>6 мл/кг PBW: <b>{result.tidalVolume6Ml} мл</b> <span className="field-hint">· исходный ориентир при ОРДС</span></p>
            <p>8 мл/кг PBW: <b>{result.tidalVolume8Ml} мл</b></p>
          </div>
          {result.measuredTidalVolumeMl !== null && result.measuredMlKg !== null && (
            <>
              <h3>Проверка введённого дыхательного объёма</h3>
              <div className="score-display"><strong>{result.measuredMlKg.toFixed(1)}</strong><span>мл/кг PBW · {result.measuredTidalVolumeMl} мл</span></div>
              <p className="field-hint">{rangeText}</p>
            </>
          )}
          <p className="clinical-warning"><ShieldAlert size={14} /> Это расчётные ориентиры, а не готовое назначение параметров ИВЛ. При ОРДС учитывайте давление плато (цель <30 см вод. ст.), механику дыхания, газообмен, синхронизацию с аппаратом и клиническую ситуацию. Не изменяйте настройки ИВЛ только на основании этого калькулятора.</p>
        </section>
      )}

      <section className="reference-panel">
        <div><span className="panel-kicker">ИСТОЧНИК И МЕТОДИКА</span><h2>{VENTILATION_BASICS_REFERENCE.title}</h2><p>{VENTILATION_BASICS_REFERENCE.primarySource}</p></div>
        <a href={VENTILATION_BASICS_REFERENCE.primaryUrl} target="_blank" rel="noreferrer">Руководство ATS ↗</a>
        <a href={VENTILATION_BASICS_REFERENCE.supportingUrl} target="_blank" rel="noreferrer">Руководство AARC 2024 ↗</a>
        <small>Проверено: {VENTILATION_BASICS_REFERENCE.accessed}. {VENTILATION_BASICS_REFERENCE.notes[0]} {VENTILATION_BASICS_REFERENCE.notes[4]}</small>
      </section>
      <p className="calculator-disclaimer">Образовательный инструмент для взрослых пациентов. Не заменяет оценку специалиста и локальные протоколы респираторной поддержки.</p>
    </main>
  )
}
