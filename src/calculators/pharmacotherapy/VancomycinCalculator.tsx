import { useState, type FormEvent } from 'react'
import { ArrowLeft, BookOpen, RotateCcw, ShieldAlert, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { calculateVancomycinInitialDose, type VancomycinResult } from './vancomycin'
import { VANCOMYCIN_REFERENCE } from './vancomycin.reference'

export default function VancomycinCalculator() {
  const [weight, setWeight] = useState('')
  const [result, setResult] = useState<VancomycinResult | null>(null)
  const [error, setError] = useState('')

  function reset() {
    setWeight('')
    setResult(null)
    setError('')
  }
  function handleCalculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (weight.trim() === '') {
      setError('Введите фактическую массу тела.')
      setResult(null)
      return
    }
    try {
      setResult(calculateVancomycinInitialDose({ actualBodyWeightKg: Number(weight) }))
      setError('')
    } catch (caught) {
      setResult(null)
      setError(caught instanceof Error ? caught.message : 'Проверьте массу тела.')
    }
  }

  return (
    <main className="app-shell calculator-shell">
      <div className="calculator-topline">
        <Link className="back-link" to="/"><ArrowLeft size={16} /> Все калькуляторы</Link>
        <span className="version-label">ФАРМАКОТЕРАПИЯ · ВАНКОМИЦИН</span>
      </div>
      <section className="calculator-heading">
        <div className="eyebrow"><span className="pulse-dot" /> НАЧАЛЬНЫЙ РАСЧЁТ ДОЗЫ У ВЗРОСЛЫХ</div>
        <h1>Ванкомицин</h1>
        <p>Ориентировочные весовые диапазоны нагрузочной и начальной поддерживающей дозы с акцентом на AUC-мониторинг.</p>
      </section>
      <div className="calculator-layout">
        <form className="calculator-panel" onSubmit={handleCalculate}>
          <div className="panel-heading"><div><span className="panel-kicker">ОДИН ПАРАМЕТР</span><h2>Фактическая масса тела</h2></div><span className="points-label">20–300 кг</span></div>
          <label className="calc-field field-full"><span>Масса тела, кг</span><input type="number" min="20" max="300" step="0.1" required value={weight} onChange={(event) => { setWeight(event.target.value); setResult(null); setError('') }} placeholder="Введите фактическую массу тела" /></label>
          <p className="field-hint">Используется фактическая масса тела. При ожирении и критическом состоянии необходимы индивидуальные фармакокинетические расчёты.</p>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="calculator-actions">
            <button className="primary-button" type="submit">Рассчитать диапазоны доз</button>
            <button className="reset-button" type="button" onClick={reset}><RotateCcw size={15} /> Сбросить</button>
          </div>
          <p className="privacy-note"><ShieldCheck size={14} /> Данные не отправляются на сервер и не сохраняются.</p>
        </form>
        <aside className="calculator-aside">
          <div className="info-panel"><div className="info-icon"><BookOpen size={18} /></div><h3>Актуальный подход</h3><p>Для серьёзных MRSA-инфекций предпочтителен AUC24/MIC 400–600 мг·ч/л, а не подбор терапии только по остаточной концентрации.</p></div>
          <div className="threshold-panel"><h3>Что не рассчитывается</h3><p>Интервал между введениями, поддерживающая суточная доза, клиренс ванкомицина и AUC требуют оценки функции почек и фармакокинетического мониторинга.</p></div>
        </aside>
      </div>
      {result && (
        <section className="result-panel" aria-live="polite">
          <div className="result-topline"><span className="panel-kicker">ОРИЕНТИРОВОЧНЫЕ ДИАПАЗОНЫ</span><span className="risk-tag risk-moderate">Не готовое назначение</span></div>
          <div className="result-summary"><b>Нагрузочная доза: {Math.round(result.loadingDoseMinMg)}–{Math.round(result.loadingDoseMaxMg)} мг однократно</b><p>20–25 мг/кг фактической массы тела, максимальная доза 3000 мг.</p></div>
          <div className="result-summary"><b>Начальная поддерживающая доза: {Math.round(result.maintenanceDoseMinMg)}–{Math.round(result.maintenanceDoseMaxMg)} мг на одно введение</b><p>15–20 мг/кг для большинства пациентов с нормальной функцией почек. Интервал не рассчитывается.</p></div>
          {result.loadingDoseCapped && <p className="field-hint">Нагрузочный диапазон ограничен максимальной дозой 3000 мг.</p>}
          <div className="threshold-panel"><h3>Мониторинг</h3><p>{result.aucTarget}</p><p>Целевое воздействие следует оценить в первые 24–48 часов. Используйте Bayesian-подход или две концентрации по локальному протоколу.</p></div>
          <p className="clinical-warning"><ShieldAlert size={14} /> Не назначайте интервал и последующие дозы только по этому расчёту. При ОПП, сниженной/нестабильной функции почек, ожирении, диализе или критическом состоянии требуется индивидуальный AUC-ориентированный подбор. Традиционная цель trough 15–20 мг/л для серьёзных MRSA-инфекций больше не рекомендуется.</p>
        </section>
      )}
      <section className="reference-panel">
        <div><span className="panel-kicker">ИСТОЧНИК И МЕТОДИКА</span><h2>{VANCOMYCIN_REFERENCE.title}</h2><p>{VANCOMYCIN_REFERENCE.guideline}</p></div>
        <a href={VANCOMYCIN_REFERENCE.guidelineUrl} target="_blank" rel="noreferrer">Открыть руководство IDSA ↗</a>
        <small><a href={VANCOMYCIN_REFERENCE.publicationUrl} target="_blank" rel="noreferrer">Публикация консенсуса 2020 ↗</a> Проверено: {VANCOMYCIN_REFERENCE.accessed}.</small>
      </section>
      <p className="calculator-disclaimer">Образовательный расчёт начальных весовых диапазонов для взрослых. Не заменяет индивидуальный фармакокинетический подбор и мониторинг концентрации ванкомицина.</p>
    </main>
  )
}
