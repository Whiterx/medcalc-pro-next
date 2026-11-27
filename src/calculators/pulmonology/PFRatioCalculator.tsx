import { useState, type FormEvent } from 'react'
import { ArrowLeft, BookOpen, RotateCcw, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { calculatePFRatio, type PFRatioResult } from './pfRatio'
import { PF_RATIO_REFERENCE } from './pfRatio.reference'

const initialValues = { pao2: '', fio2: '' }

export default function PFRatioCalculator() {
  const [values, setValues] = useState(initialValues)
  const [result, setResult] = useState<PFRatioResult | null>(null)
  const [error, setError] = useState('')

  function updateField(field: keyof typeof initialValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setResult(null)
    setError('')
  }

  function handleCalculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (values.pao2.trim() === '' || values.fio2.trim() === '') {
      setError('Введите PaO₂ и FiO₂, чтобы выполнить расчёт.')
      setResult(null)
      return
    }

    const pao2 = Number(values.pao2)
    const fio2 = Number(values.fio2)
    if (!Number.isFinite(pao2) || !Number.isFinite(fio2)) {
      setError('Проверьте числовые значения.')
      return
    }
    if (pao2 < 1 || fio2 < 0.21 || fio2 > 1) {
      setError('Допустимые значения: PaO₂ ≥1 мм рт. ст.; FiO₂ 0,21–1,00.')
      return
    }

    setResult(calculatePFRatio({ pao2, fio2 }))
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
        <span className="version-label">ПУЛЬМОНОЛОГИЯ · PaO₂/FiO₂</span>
      </div>

      <section className="calculator-heading">
        <div className="eyebrow"><span className="pulse-dot" /> РЕСПИРАТОРНЫЙ ПОКАЗАТЕЛЬ</div>
        <h1>PaO₂/FiO₂</h1>
        <p>Расчёт индекса оксигенации (индекса Горовица) по парциальному давлению кислорода в артериальной крови и доле кислорода во вдыхаемой смеси.</p>
      </section>

      <div className="calculator-layout">
        <form className="calculator-panel" onSubmit={handleCalculate}>
          <div className="panel-heading">
            <div><span className="panel-kicker">ШАГ 1</span><h2>Параметры газообмена</h2></div>
            <span className="points-label">2 показателя</span>
          </div>

          <div className="field-grid">
            <label className="calc-field">
              <span>PaO₂ <small>мм рт. ст.</small></span>
              <input type="number" min="1" step="any" inputMode="decimal" placeholder="Например, 80" value={values.pao2} onChange={(event) => updateField('pao2', event.target.value)} />
            </label>
            <label className="calc-field">
              <span>FiO₂ <small>доля от 1,0</small></span>
              <input type="number" min="0.21" max="1" step="any" inputMode="decimal" placeholder="Например, 0.40" value={values.fio2} onChange={(event) => updateField('fio2', event.target.value)} />
            </label>
          </div>

          <p className="field-hint">FiO₂ вводится десятичной долей, а не процентом: 21% = 0,21; 40% = 0,40; 100% = 1,00.</p>
          {error && <p className="form-error" role="alert">{error}</p>}

          <div className="calculator-actions">
            <button className="primary-button" type="submit">Рассчитать P/F</button>
            <button className="reset-button" type="button" onClick={reset}><RotateCcw size={15} /> Сбросить</button>
          </div>
          <p className="privacy-note"><ShieldCheck size={14} /> Данные не отправляются на сервер и не сохраняются.</p>
        </form>

        <aside className="calculator-aside">
          <div className="info-panel">
            <div className="info-icon"><BookOpen size={18} /></div>
            <h3>Как интерпретировать индекс?</h3>
            <p>P/F — отношение PaO₂ к FiO₂. Чем ниже значение, тем выраженнее нарушение оксигенации. Результат нужно интерпретировать с учётом способа респираторной поддержки и клинического контекста.</p>
          </div>
          <div className="threshold-panel">
            <h3>Ориентиры Berlin Definition</h3>
            <p>Лёгкая степень: <b>200 &lt; P/F ≤300</b></p>
            <p>Умеренная: <b>100 &lt; P/F ≤200</b></p>
            <p>Тяжёлая: <b>P/F ≤100</b></p>
            <p>Для классификации по Berlin необходимы остальные критерии ОРДС и PEEP/CPAP ≥5 см вод. ст.</p>
          </div>
        </aside>
      </div>

      {result && (
        <section className="result-panel" aria-live="polite">
          <div className="result-topline"><span className="panel-kicker">РЕЗУЛЬТАТ РАСЧЁТА</span><span className={`risk-tag risk-${result.category === 'expected' ? 'low' : result.category === 'reduced' ? 'low' : result.category === 'mild' ? 'moderate' : 'high'}`}>{result.categoryLabel}</span></div>
          <div className="score-display"><strong>{result.ratio.toFixed(1)}</strong><span>мм рт. ст.</span></div>
          <p className="mortality-estimate">{result.interpretation}</p>
          <p className="clinical-warning">Важно: индекс P/F сам по себе не диагностирует ОРДС и не является самостоятельным основанием для выбора кислородотерапии, НИВЛ, интубации или других лечебных вмешательств. Классификация зависит от типа респираторной поддержки и остальных критериев; этот калькулятор не собирает их.</p>
          {result.ratio === 100 && <p className="clinical-warning">Граничное значение: в российских рекомендациях ФАР 2025 основная таблица глобального определения использует для тяжёлой степени &lt;100, а приложение с критериями Berlin — ≤100. Сверьте применяемое определение и клинический контекст.</p>}
        </section>
      )}

      <section className="reference-panel">
        <div><span className="panel-kicker">ИСТОЧНИК И МЕТОДИКА</span><h2>{PF_RATIO_REFERENCE.title}</h2><p>{PF_RATIO_REFERENCE.guideline} · {PF_RATIO_REFERENCE.section}</p></div>
        <a href={PF_RATIO_REFERENCE.url} target="_blank" rel="noreferrer">Глобальное определение ОРДС 2023 ↗</a><a href={PF_RATIO_REFERENCE.russianGuidelineUrl} target="_blank" rel="noreferrer">КР ФАР РФ 2025 ↗</a>
        <small>Публикации: {PF_RATIO_REFERENCE.published}. Проверено: {PF_RATIO_REFERENCE.accessed}. {PF_RATIO_REFERENCE.notes[5]}</small>
      </section>
      <p className="calculator-disclaimer">Образовательный инструмент. Не заменяет клиническую оценку и не предназначен для самостоятельного выбора лечебной тактики.</p>
    </main>
  )
}
