import { useState, type FormEvent } from 'react'
import { ArrowLeft, BookOpen, RotateCcw, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { calculateBMI, type BMIResult } from './bmi'
import { BMI_REFERENCE } from './bmi.reference'

const initialValues = { heightCm: '', weightKg: '' }

export default function BMICalculator() {
  const [values, setValues] = useState(initialValues)
  const [result, setResult] = useState<BMIResult | null>(null)
  const [error, setError] = useState('')

  function updateField(field: keyof typeof initialValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setResult(null)
    setError('')
  }

  function handleCalculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (values.heightCm.trim() === '' || values.weightKg.trim() === '') {
      setError('Введите рост и массу тела.')
      setResult(null)
      return
    }
    try {
      setResult(calculateBMI({ heightCm: Number(values.heightCm), weightKg: Number(values.weightKg) }))
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
        <span className="version-label">ЭНДОКРИНОЛОГИЯ · АНТРОПОМЕТРИЯ</span>
      </div>

      <section className="calculator-heading">
        <div className="eyebrow"><span className="pulse-dot" /> АНТРОПОМЕТРИЧЕСКИЙ ПОКАЗАТЕЛЬ</div>
        <h1>Индекс массы тела</h1>
        <p>Расчёт ИМТ по массе тела и росту с классификацией для взрослых.</p>
      </section>

      <div className="calculator-layout">
        <form className="calculator-panel" onSubmit={handleCalculate}>
          <div className="panel-heading">
            <div><span className="panel-kicker">ИСХОДНЫЕ ДАННЫЕ</span><h2>Антропометрия</h2></div>
          </div>
          <div className="field-grid">
            <label className="calc-field">
              <span>Рост <small>см</small></span>
              <input type="number" min="100" max="250" step="0.1" inputMode="decimal" placeholder="Введите рост" value={values.heightCm} onChange={(event) => updateField('heightCm', event.target.value)} />
            </label>
            <label className="calc-field">
              <span>Масса тела <small>кг</small></span>
              <input type="number" min="20" max="500" step="0.1" inputMode="decimal" placeholder="Введите массу" value={values.weightKg} onChange={(event) => updateField('weightKg', event.target.value)} />
            </label>
          </div>
          <p className="field-hint">Калькулятор использует взрослую классификацию ИМТ. Не предназначен для детей и подростков, а также для оценки ИМТ во время беременности.</p>
          {error && <p className="form-error" role="alert">{error}</p>}

          <div className="calculator-actions">
            <button className="primary-button" type="submit">Рассчитать ИМТ</button>
            <button className="reset-button" type="button" onClick={reset}><RotateCcw size={15} /> Сбросить</button>
          </div>
          <p className="privacy-note"><ShieldCheck size={14} /> Данные не отправляются на сервер и не сохраняются.</p>
        </form>

        <aside className="calculator-aside">
          <div className="info-panel">
            <div className="info-icon"><BookOpen size={18} /></div>
            <h3>Формула</h3>
            <p>ИМТ = масса тела (кг) / рост² (м²).</p>
          </div>
          <div className="threshold-panel">
            <h3>Ограничения показателя</h3>
            <p>ИМТ — скрининговый показатель, а не прямое измерение жировой массы.</p>
            <p>Он не различает жировую и мышечную массу и не заменяет клиническую оценку.</p>
            <p>При интерпретации учитывайте возраст, состав тела, распределение жировой ткани и клинический контекст.</p>
          </div>
        </aside>
      </div>

      {result && (
        <section className="result-panel" aria-live="polite">
          <div className="result-topline"><span className="panel-kicker">РЕЗУЛЬТАТ РАСЧЁТА</span><span className="risk-tag risk-moderate">Скрининговый показатель</span></div>
          <div className="score-display"><strong>{result.value.toFixed(1)}</strong><span>кг/м²</span></div>
          <p className="result-summary">{result.categoryLabel}</p>
          <div className="result-breakdown">
            <p>Рост: <b>{Number(values.heightCm).toLocaleString('ru-RU')} см</b></p>
            <p>Масса тела: <b>{Number(values.weightKg).toLocaleString('ru-RU')} кг</b></p>
            <p>Математический диапазон массы тела при ИМТ 18,5–24,9: <b>{result.lowerHealthyWeightKg.toFixed(1)}–{result.upperHealthyWeightKg.toFixed(1)} кг</b></p>
          </div>
          <p className="clinical-warning">ИМТ не является самостоятельным диагнозом и не определяет индивидуальный риск. Учитывайте мышечную массу, окружность талии и другие клинические данные.</p>
        </section>
      )}

      <section className="reference-panel">
        <div><span className="panel-kicker">ИСТОЧНИК И МЕТОДИКА</span><h2>{BMI_REFERENCE.title}</h2><p>{BMI_REFERENCE.guideline} · {BMI_REFERENCE.section}</p></div>
        <a href={BMI_REFERENCE.url} target="_blank" rel="noreferrer">Открыть ВОЗ ↗</a>
        <small>Публикация: {BMI_REFERENCE.published}. Проверено: {BMI_REFERENCE.accessed}. {BMI_REFERENCE.notes[3]}</small>
      </section>
      <p className="calculator-disclaimer">Образовательный инструмент. Не заменяет клиническую оценку и не предназначен для самостоятельной диагностики.</p>
    </main>
  )
}
