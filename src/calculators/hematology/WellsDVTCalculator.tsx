import { useState, type FormEvent } from 'react'
import { ArrowLeft, BookOpen, RotateCcw, ShieldAlert, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { calculateWellsDVT, type WellsDVTInput, type WellsDVTResult } from './wellsDVT'
import { WELLS_DVT_REFERENCE } from './wellsDVT.reference'

const initialValues: WellsDVTInput = {
  activeCancer: false, paralysisOrCast: false, bedriddenOrSurgery: false, deepVenousTenderness: false,
  entireLegSwollen: false, calfDifferenceAtLeast3cm: false, pittingEdema: false, collateralVeins: false,
  previousDVT: false, alternativeDiagnosisAtLeastAsLikely: false,
}

const fields: { key: keyof Omit<WellsDVTInput, 'assessmentConfirmed'>; label: string; points: number; detail: string }[] = [
  { key: 'activeCancer', label: 'Активное онкологическое заболевание', points: 1, detail: 'Лечение продолжается, проводилось в последние 6 месяцев или заболевание находится в паллиативной стадии.' },
  { key: 'paralysisOrCast', label: 'Парез/паралич или недавняя иммобилизация нижней конечности гипсовой повязкой', points: 1, detail: 'Любой из перечисленных признаков.' },
  { key: 'bedriddenOrSurgery', label: 'Постельный режим ≥3 дней или большая операция в последние 12 недель', points: 1, detail: 'Операция под общей или регионарной анестезией.' },
  { key: 'deepVenousTenderness', label: 'Локальная болезненность по ходу глубокой венозной системы', points: 1, detail: 'Оценивается при физикальном обследовании.' },
  { key: 'entireLegSwollen', label: 'Отёк всей ноги', points: 1, detail: 'Отёк всей симптомной нижней конечности.' },
  { key: 'calfDifferenceAtLeast3cm', label: 'Разница окружности голеней ≥3 см', points: 1, detail: 'Измерение на 10 см ниже бугристости большеберцовой кости относительно бессимптомной ноги.' },
  { key: 'pittingEdema', label: 'Ямочный отёк, ограниченный симптомной ногой', points: 1, detail: 'Односторонний отёк.' },
  { key: 'collateralVeins', label: 'Коллатеральные поверхностные вены (не варикозные)', points: 1, detail: 'Невыраженные варикозные вены не учитываются.' },
  { key: 'previousDVT', label: 'Ранее документированный ТГВ', points: 1, detail: 'Подтверждённый эпизод ТГВ в анамнезе.' },
  { key: 'alternativeDiagnosisAtLeastAsLikely', label: 'Альтернативный диагноз как минимум столь же вероятен, как ТГВ', points: -2, detail: 'При наличии альтернативного диагноза вычитаются 2 балла.' },
]

export default function WellsDVTCalculator() {
  const [values, setValues] = useState<WellsDVTInput>(initialValues)
  const [result, setResult] = useState<WellsDVTResult | null>(null)
  const [error, setError] = useState('')

  function updateField(key: keyof WellsDVTInput, checked: boolean) {
    setValues((current) => ({ ...current, [key]: checked }))
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
    try {
      setResult(calculateWellsDVT(values))
      setError('')
    } catch (caught) {
      setResult(null)
      setError(caught instanceof Error ? caught.message : 'Проверьте выбранные критерии.')
    }
  }

  return (
    <main className="app-shell calculator-shell">
      <div className="calculator-topline">
        <Link className="back-link" to="/"><ArrowLeft size={16} /> Все калькуляторы</Link>
        <span className="version-label">ГЕМАТОЛОГИЯ · WELLS DVT</span>
      </div>
      <section className="calculator-heading">
        <div className="eyebrow"><span className="pulse-dot" /> ПРЕДТЕСТОВАЯ ВЕРОЯТНОСТЬ ТРОМБОЗА</div>
        <h1>Wells Score — ТГВ</h1>
        <p>Двухуровневая модель Wells для оценки клинической вероятности тромбоза глубоких вен нижней конечности.</p>
      </section>
      <div className="calculator-layout">
        <form className="calculator-panel" onSubmit={handleCalculate}>
          <div className="panel-heading"><div><span className="panel-kicker">ДЕСЯТЬ КРИТЕРИЕВ</span><h2>Отметьте выявленные признаки</h2></div><span className="points-label">−2…9 баллов</span></div>
          <p className="field-hint">Каждый пункт должен быть оценён. Неотмеченный флажок означает, что критерий оценён и отсутствует; не оставляйте пункты без клинической оценки.</p>
          {fields.map((field, index) => (
            <div className="news2-section" key={field.key}>
              <label className="form-check">
                <input type="checkbox" className="form-check__input" checked={values[field.key]} onChange={(event) => updateField(field.key, event.target.checked)} />
                <span className="form-check__label"><b>{index + 1}. {field.label}</b><small>{field.detail}</small></span>
                <span className="form-check__score">{field.points > 0 ? '+' : ''}{field.points}</span>
              </label>
            </div>
          ))}
          <div className="news2-section">
            <label className="form-check">
              <input type="checkbox" className="form-check__input" checked={values.assessmentConfirmed} onChange={(event) => updateField('assessmentConfirmed', event.target.checked)} />
              <span className="form-check__label"><b>Подтверждаю, что все 10 критериев оценены</b><small>Неотмеченные признаки действительно отсутствуют; это подтверждение не добавляет баллы.</small></span>
            </label>
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="calculator-actions">
            <button className="primary-button" type="submit">Рассчитать Wells DVT</button>
            <button className="reset-button" type="button" onClick={reset}><RotateCcw size={15} /> Сбросить</button>
          </div>
          <p className="privacy-note"><ShieldCheck size={14} /> Данные не отправляются на сервер и не сохраняются.</p>
        </form>
        <aside className="calculator-aside">
          <div className="info-panel"><div className="info-icon"><BookOpen size={18} /></div><h3>Двухуровневая модель</h3><p>Девять критериев добавляют по 1 баллу; альтернативный диагноз как минимум столь же вероятный вычитает 2 балла.</p></div>
          <div className="threshold-panel"><h3>КР РФ 2025 — Wells DVT</h3><p><b>≥2 баллов:</b> ТГВ вероятен.</p><p><b>≤1 балла:</b> ТГВ маловероятен.</p><p>При низкой вероятности можно рассмотреть D-димер вместо УЗИ. Если вероятность высокая и/или D-димер повышен, а первичное УЗИ отрицательно, КР РФ рекомендуют повторить исследование через 7 дней.</p></div>
        </aside>
      </div>
      {result && (
        <section className="result-panel" aria-live="polite">
          <div className="result-topline"><span className="panel-kicker">РЕЗУЛЬТАТ РАСЧЁТА</span><span className="risk-tag risk-moderate">Wells DVT · 2 уровня</span></div>
          <div className="score-display"><strong>{result.score}</strong><span>баллов</span></div>
          <div className="result-summary"><b>{result.categoryLabel}</b></div>
          <h3>Разбор критериев</h3>
          <div className="criteria-list">{result.criteria.map((item) => (
            <div className="criterion-row" key={item.key}><span className="criterion-point">{item.points > 0 ? '+' : ''}{item.points}</span><span><b>{item.label}</b><small>{item.interpretation}</small></span><span className="criterion-status">{item.points > 0 ? '+' : ''}{item.points} б.</span></div>
          ))}</div>
          <p className="clinical-warning"><ShieldAlert size={14} /> Шкала оценивает только предтестовую вероятность. По КР РФ 2025 при низкой вероятности можно рассмотреть D-димер как альтернативу УЗИ; при высокой вероятности и/или повышенном D-димере с отрицательным первичным УЗИ требуется повторное дуплексное/триплексное исследование через 7 дней. При беременности, рецидиве ТГВ, у детей и при тромбозе вен верхней конечности нужен отдельный алгоритм. Балл не подтверждает диагноз и не является основанием для назначения антикоагулянта.</p>
        </section>
      )}
      <section className="reference-panel">
        <div><span className="panel-kicker">ИСТОЧНИК И МЕТОДИКА</span><h2>{WELLS_DVT_REFERENCE.title}</h2><p>{WELLS_DVT_REFERENCE.originalSource}</p></div>
        <a href={WELLS_DVT_REFERENCE.guidelineUrl} target="_blank" rel="noreferrer">КР Минздрава РФ 2025 ↗</a><a href={WELLS_DVT_REFERENCE.originalUrl} target="_blank" rel="noreferrer">Первоисточник Wells 2003 ↗</a><a href={WELLS_DVT_REFERENCE.niceUrl} target="_blank" rel="noreferrer">NICE NG158 ↗</a>
        <small>{WELLS_DVT_REFERENCE.guideline} · Проверено: {WELLS_DVT_REFERENCE.accessed}. {WELLS_DVT_REFERENCE.notes[3]}</small>
      </section>
      <p className="calculator-disclaimer">Образовательный инструмент для взрослых с подозрением на ТГВ нижней конечности; не применять при беременности, у детей, при рецидиве ТГВ или тромбозе вен верхней конечности. Не предназначен для скрининга или самостоятельной диагностики.</p>
    </main>
  )
}
