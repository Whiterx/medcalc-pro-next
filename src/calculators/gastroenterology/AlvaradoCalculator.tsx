import { useState, type FormEvent } from 'react'
import { ArrowLeft, BookOpen, RotateCcw, ShieldAlert, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { calculateAlvarado, type AlvaradoInput, type AlvaradoResult } from './alvarado'
import { ALVARADO_REFERENCE } from './alvarado.reference'

const initialValues: AlvaradoInput = {
  migration: false, anorexia: false, nauseaVomiting: false, rightLowerQuadrantTenderness: false,
  reboundTenderness: false, elevatedTemperature: false, leukocytosis: false, leftShift: false,
}

const fields: { key: keyof AlvaradoInput; label: string; points: number; detail: string }[] = [
  { key: 'migration', label: 'Миграция боли в правую подвздошную область', points: 1, detail: 'Боль первоначально была в эпигастрии/околопупочной области, затем сместилась вправо вниз.' },
  { key: 'anorexia', label: 'Анорексия или кетонурия', points: 1, detail: 'Снижение аппетита или наличие ацетона/кетонов в моче.' },
  { key: 'nauseaVomiting', label: 'Тошнота или рвота', points: 1, detail: 'Достаточно одного из признаков.' },
  { key: 'rightLowerQuadrantTenderness', label: 'Болезненность при пальпации в правой подвздошной области', points: 2, detail: 'Оценивается при физикальном обследовании.' },
  { key: 'reboundTenderness', label: 'Боль при быстром отпускании руки (симптом отдачи)', points: 1, detail: 'Оценивается при физикальном обследовании.' },
  { key: 'elevatedTemperature', label: 'Температура тела ≥37,3 °C', points: 1, detail: 'Порог оригинальной шкалы; в исходном описании указано оральное измерение.' },
  { key: 'leukocytosis', label: 'Лейкоциты >10 × 10⁹/л', points: 2, detail: 'Строго больше 10 × 10⁹/л.' },
  { key: 'leftShift', label: 'Сдвиг лейкоцитарной формулы влево', points: 1, detail: 'В распространённой операционализации — нейтрофилы >75%.' },
]

export default function AlvaradoCalculator() {
  const [values, setValues] = useState<AlvaradoInput>(initialValues)
  const [result, setResult] = useState<AlvaradoResult | null>(null)
  const [error, setError] = useState('')

  function updateField(key: keyof AlvaradoInput, checked: boolean) {
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
      setResult(calculateAlvarado(values))
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
        <span className="version-label">ГАСТРОЭНТЕРОЛОГИЯ · ALVARADO</span>
      </div>
      <section className="calculator-heading">
        <div className="eyebrow"><span className="pulse-dot" /> ОЦЕНКА ПРИ ПОДОЗРЕНИИ НА АППЕНДИЦИТ</div>
        <h1>Alvarado Score</h1>
        <p>Оригинальная 10-балльная шкала MANTRELS: симптомы, данные осмотра и лабораторные критерии.</p>
      </section>
      <div className="calculator-layout">
        <form className="calculator-panel" onSubmit={handleCalculate}>
          <div className="panel-heading"><div><span className="panel-kicker">ВОСЕМЬ КРИТЕРИЕВ</span><h2>Отметьте присутствующие признаки</h2></div><span className="points-label">0–10 баллов</span></div>
          <p className="field-hint">Каждый пункт должен быть оценён. Неотмеченный флажок означает, что признак оценён и отсутствует; не оставляйте критерии без клинической оценки.</p>
          {fields.map((field, index) => (
            <div className="news2-section" key={field.key}>
              <label className="form-check">
                <input type="checkbox" className="form-check__input" checked={values[field.key]} onChange={(event) => updateField(field.key, event.target.checked)} />
                <span className="form-check__label"><b>{index + 1}. {field.label}</b><small>{field.detail}</small></span>
                <span className="form-check__score">+{field.points}</span>
              </label>
            </div>
          ))}
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="calculator-actions">
            <button className="primary-button" type="submit">Рассчитать Alvarado</button>
            <button className="reset-button" type="button" onClick={reset}><RotateCcw size={15} /> Сбросить</button>
          </div>
          <p className="privacy-note"><ShieldCheck size={14} /> Данные не отправляются на сервер и не сохраняются.</p>
        </form>
        <aside className="calculator-aside">
          <div className="info-panel"><div className="info-icon"><BookOpen size={18} /></div><h3>Шкала MANTRELS</h3><p>Два критерия дают по 2 балла: болезненность в правой подвздошной области и лейкоцитоз. Остальные шесть критериев дают по 1 баллу.</p></div>
          <div className="threshold-panel"><h3>Интерпретация</h3><p><b>0–4:</b> низкая вероятность; порог ниже 5 обладает высокой чувствительностью для исключения аппендицита в соответствующем клиническом контексте.</p><p><b>5–6:</b> промежуточная вероятность; требуется дальнейшая оценка.</p><p><b>7–10:</b> повышенная вероятность, но шкала не обладает достаточной специфичностью для подтверждения диагноза.</p></div>
        </aside>
      </div>
      {result && (
        <section className="result-panel" aria-live="polite">
          <div className="result-topline"><span className="panel-kicker">РЕЗУЛЬТАТ РАСЧЁТА</span><span className="risk-tag risk-moderate">Alvarado / MANTRELS</span></div>
          <div className="score-display"><strong>{result.score}</strong><span>из 10 баллов</span></div>
          <div className="result-summary"><b>{result.categoryLabel}</b></div>
          <h3>Разбор критериев</h3>
          <div className="criteria-list">{result.criteria.map((item) => (
            <div className="criterion-row" key={item.key}><span className="criterion-point">{item.points}</span><span><b>{item.label}</b><small>{item.interpretation}</small></span><span className="criterion-status">{item.points} б.</span></div>
          ))}</div>
          <p className="clinical-warning"><ShieldAlert size={14} /> Alvarado не подтверждает диагноз и не заменяет осмотр, повторную оценку, лабораторные исследования и визуализацию. При сохраняющейся/усиливающейся боли низкий балл не должен прекращать обследование. Особая осторожность нужна при беременности, в пожилом возрасте и при ВИЧ.</p>
        </section>
      )}
      <section className="reference-panel">
        <div><span className="panel-kicker">ИСТОЧНИК И МЕТОДИКА</span><h2>{ALVARADO_REFERENCE.title}</h2><p>{ALVARADO_REFERENCE.originalSource}</p></div>
        <a href={ALVARADO_REFERENCE.originalUrl} target="_blank" rel="noreferrer">Открыть оригинальную публикацию ↗</a>
        <small>{ALVARADO_REFERENCE.guideline} · <a href={ALVARADO_REFERENCE.guidelineUrl} target="_blank" rel="noreferrer">Рекомендации WSES 2020 ↗</a> Проверено: {ALVARADO_REFERENCE.accessed}.</small>
      </section>
      <p className="calculator-disclaimer">Образовательный инструмент для пациентов с подозрением на острый аппендицит. Не предназначен для самостоятельной диагностики или выбора лечения.</p>
    </main>
  )
}
