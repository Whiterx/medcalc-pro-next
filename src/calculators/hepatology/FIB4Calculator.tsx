import { useState, type FormEvent } from 'react'
import { ArrowLeft, BookOpen, RotateCcw, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { calculateFIB4, type FIB4Result } from './fib4'
import { FIB4_REFERENCE } from './fib4.reference'

const initialValues = { ageYears: '', astUL: '', altUL: '', platelets10e9L: '' }

export default function FIB4Calculator() {
  const [values, setValues] = useState(initialValues)
  const [result, setResult] = useState<FIB4Result | null>(null)
  const [error, setError] = useState('')

  function updateField(field: keyof typeof initialValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setResult(null)
    setError('')
  }

  function handleCalculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (Object.values(values).some((value) => value.trim() === '')) {
      setError('Заполните возраст, АСТ, АЛТ и количество тромбоцитов.')
      setResult(null)
      return
    }
    try {
      setResult(calculateFIB4({
        ageYears: Number(values.ageYears),
        astUL: Number(values.astUL),
        altUL: Number(values.altUL),
        platelets10e9L: Number(values.platelets10e9L),
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
        <span className="version-label">ГЕПАТОЛОГИЯ · ФИБРОЗ ПЕЧЕНИ</span>
      </div>

      <section className="calculator-heading">
        <div className="eyebrow"><span className="pulse-dot" /> НЕИНВАЗИВНАЯ ОЦЕНКА РИСКА ФИБРОЗА</div>
        <h1>FIB-4</h1>
        <p>Расчёт индекса FIB-4 по возрасту, АСТ, АЛТ и количеству тромбоцитов.</p>
      </section>

      <div className="calculator-layout">
        <form className="calculator-panel" onSubmit={handleCalculate}>
          <div className="panel-heading">
            <div><span className="panel-kicker">ЛАБОРАТОРНЫЕ И ДЕМОГРАФИЧЕСКИЕ ДАННЫЕ</span><h2>Параметры расчёта</h2></div>
          </div>
          <div className="field-grid">
            <label className="calc-field">
              <span>Возраст <small>полных лет</small></span>
              <input type="number" min="18" max="120" step="1" inputMode="numeric" placeholder="Введите возраст" value={values.ageYears} onChange={(event) => updateField('ageYears', event.target.value)} />
            </label>
            <label className="calc-field">
              <span>АСТ <small>Ед/л</small></span>
              <input type="number" min="0.1" max="1000" step="0.1" inputMode="decimal" placeholder="Введите АСТ" value={values.astUL} onChange={(event) => updateField('astUL', event.target.value)} />
            </label>
            <label className="calc-field">
              <span>АЛТ <small>Ед/л</small></span>
              <input type="number" min="0.1" max="1000" step="0.1" inputMode="decimal" placeholder="Введите АЛТ" value={values.altUL} onChange={(event) => updateField('altUL', event.target.value)} />
            </label>
            <label className="calc-field">
              <span>Тромбоциты <small>×10⁹/л</small></span>
              <input type="number" min="0.1" max="2000" step="0.1" inputMode="decimal" placeholder="Введите количество" value={values.platelets10e9L} onChange={(event) => updateField('platelets10e9L', event.target.value)} />
            </label>
          </div>
          <p className="field-hint">Используйте результаты анализов, выраженные в указанных единицах. Формула предназначена для взрослых; у пациентов младше 35 лет точность индекса ограничена.</p>
          {error && <p className="form-error" role="alert">{error}</p>}

          <div className="calculator-actions">
            <button className="primary-button" type="submit">Рассчитать FIB-4</button>
            <button className="reset-button" type="button" onClick={reset}><RotateCcw size={15} /> Сбросить</button>
          </div>
          <p className="privacy-note"><ShieldCheck size={14} /> Данные не отправляются на сервер и не сохраняются.</p>
        </form>

        <aside className="calculator-aside">
          <div className="info-panel">
            <div className="info-icon"><BookOpen size={18} /></div>
            <h3>Формула</h3>
            <p>FIB-4 = возраст × АСТ / (тромбоциты × √АЛТ).</p>
            <p>Возраст — годы; АСТ и АЛТ — Ед/л; тромбоциты — ×10⁹/л.</p>
          </div>
          <div className="threshold-panel">
            <h3>Пороги интерпретации</h3>
            <p>35–64 года: менее 1,3 — низкий риск; 1,3–2,67 — промежуточный; более 2,67 — высокий.</p>
            <p>От 65 лет: нижний порог низкого риска — 2,0; верхний порог — 2,67.</p>
            <p>До 35 лет стандартные пороги ненадёжны.</p>
          </div>
        </aside>
      </div>

      {result && (
        <section className="result-panel" aria-live="polite">
          <div className="result-topline"><span className="panel-kicker">РЕЗУЛЬТАТ РАСЧЁТА</span><span className="risk-tag risk-moderate">FIB-4</span></div>
          <div className="score-display"><strong>{result.value.toFixed(2)}</strong><span>индекс FIB-4</span></div>
          <p className="result-summary">{result.categoryLabel}</p>
          <div className="result-breakdown">
            <p>Возраст: <b>{values.ageYears} лет</b></p>
            <p>АСТ / АЛТ: <b>{values.astUL} / {values.altUL} Ед/л</b></p>
            <p>Тромбоциты: <b>{values.platelets10e9L} ×10⁹/л</b></p>
            <p>Порог низкого риска для возраста: <b>{result.lowerRiskCutoff.toLocaleString('ru-RU')}</b></p>
            <p>Порог высокого риска: <b>{result.upperRiskCutoff.toLocaleString('ru-RU')}</b></p>
          </div>
          {result.category === 'limited-accuracy' ? (
            <p className="clinical-warning">У взрослых младше 35 лет FIB-4 обладает низкой точностью. Низкое значение не исключает выраженный фиброз; при наличии факторов риска или повышенных печёночных ферментов рассмотрите вторичную оценку.</p>
          ) : result.category === 'low' ? (
            <p className="clinical-warning">Низкий FIB-4 снижает вероятность выраженного фиброза, но не исключает заболевание печени и не заменяет клиническую оценку. Учитывайте исходный риск и динамику показателей.</p>
          ) : (
            <p className="clinical-warning">Результат не устанавливает диагноз или стадию фиброза. Рассмотрите дополнительную оценку (например, эластографию VCTE или ELF) и клиническую интерпретацию. При значении выше 2,67 целесообразна специализированная оценка.</p>
          )}
        </section>
      )}

      <section className="reference-panel">
        <div><span className="panel-kicker">ИСТОЧНИК И МЕТОДИКА</span><h2>{FIB4_REFERENCE.title}</h2><p>{FIB4_REFERENCE.guideline} · {FIB4_REFERENCE.section}</p></div>
        <a href={FIB4_REFERENCE.url} target="_blank" rel="noreferrer">Открыть AASLD ↗</a>
        <small>Публикации: {FIB4_REFERENCE.published}. Проверено: {FIB4_REFERENCE.accessed}. {FIB4_REFERENCE.notes[4]}</small>
      </section>
      <p className="calculator-disclaimer">Образовательный инструмент. Не заменяет диагностику и клиническое решение специалиста.</p>
    </main>
  )
}
