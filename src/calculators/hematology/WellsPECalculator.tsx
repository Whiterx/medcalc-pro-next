import { useState, type FormEvent } from 'react'
import { ArrowLeft, BookOpen, RotateCcw, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { calculateWellsPE, type WellsPEResult } from './wellsPE'
import { WELLS_PE_REFERENCE } from './wellsPE.reference'

const initialValues = {
  clinicalSignsOfDVT: false,
  pulmonaryEmbolismMoreLikelyThanAlternative: false,
  heartRateOver100: false,
  immobilisationOver3DaysOrSurgeryWithin4Weeks: false,
  previousDVTOrPE: false,
  haemoptysis: false,
  activeCancer: false,
  assessmentConfirmed: false,
}

export default function WellsPECalculator() {
  const [values, setValues] = useState(initialValues)
  const [result, setResult] = useState<WellsPEResult | null>(null)
  const [error, setError] = useState('')

  function updateField<K extends keyof typeof initialValues>(field: K, value: typeof initialValues[K]) {
    setValues((current) => ({ ...current, [field]: value }))
    setResult(null)
    setError('')
  }

  function handleCalculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      setResult(calculateWellsPE(values))
      setError('')
    } catch (caught) {
      setResult(null)
      setError(caught instanceof Error ? caught.message : 'Проверьте оценку критериев.')
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
        <span className="version-label">ГЕМАТОЛОГИЯ · ТРОМБОЭМБОЛИЯ</span>
      </div>

      <section className="calculator-heading">
        <div className="eyebrow"><span className="pulse-dot" /> КЛИНИЧЕСКАЯ ВЕРОЯТНОСТЬ ТЭЛА</div>
        <h1>Wells Score — ТЭЛА</h1>
        <p>Двухуровневая шкала для оценки клинической вероятности тромбоэмболии лёгочной артерии у небеременных взрослых при уже возникшем подозрении на ТЭЛА.</p>
      </section>

      <div className="calculator-layout">
        <form className="calculator-panel" onSubmit={handleCalculate}>
          <div className="panel-heading">
            <div><span className="panel-kicker">7 КРИТЕРИЕВ</span><h2>Клиническая оценка</h2></div>
            <span className="points-label">0–12,5 балла</span>
          </div>

          <label className="check-field">
            <input type="checkbox" checked={values.clinicalSignsOfDVT} onChange={(event) => updateField('clinicalSignsOfDVT', event.target.checked)} />
            <span>Клинические признаки ТГВ: как минимум отёк ноги и болезненность при пальпации глубоких вен (+3)</span>
          </label>
          <label className="check-field">
            <input type="checkbox" checked={values.pulmonaryEmbolismMoreLikelyThanAlternative} onChange={(event) => updateField('pulmonaryEmbolismMoreLikelyThanAlternative', event.target.checked)} />
            <span>ТЭЛА более вероятна, чем альтернативный диагноз (+3; требует клинического суждения)</span>
          </label>
          <label className="check-field">
            <input type="checkbox" checked={values.heartRateOver100} onChange={(event) => updateField('heartRateOver100', event.target.checked)} />
            <span>ЧСС строго &gt;100 уд/мин (+1,5)</span>
          </label>
          <label className="check-field">
            <input type="checkbox" checked={values.immobilisationOver3DaysOrSurgeryWithin4Weeks} onChange={(event) => updateField('immobilisationOver3DaysOrSurgeryWithin4Weeks', event.target.checked)} />
            <span>Иммобилизация более 3 дней или операция в предыдущие 4 недели (+1,5)</span>
          </label>
          <label className="check-field">
            <input type="checkbox" checked={values.previousDVTOrPE} onChange={(event) => updateField('previousDVTOrPE', event.target.checked)} />
            <span>ТГВ или ТЭЛА в анамнезе (+1,5)</span>
          </label>
          <label className="check-field">
            <input type="checkbox" checked={values.haemoptysis} onChange={(event) => updateField('haemoptysis', event.target.checked)} />
            <span>Кровохарканье (+1)</span>
          </label>
          <label className="check-field">
            <input type="checkbox" checked={values.activeCancer} onChange={(event) => updateField('activeCancer', event.target.checked)} />
            <span>Активное злокачественное новообразование: лечение сейчас, в последние 6 месяцев или паллиативное лечение (+1)</span>
          </label>

          <label className="check-field">
            <input type="checkbox" checked={values.assessmentConfirmed} onChange={(event) => updateField('assessmentConfirmed', event.target.checked)} />
            <span>Подтверждаю, что все 7 критериев оценены; неотмеченные признаки действительно отсутствуют</span>
          </label>
          <p className="field-hint">Каждый флажок соответствует наличию критерия. Неотмеченный пункт означает отсутствие признака только после его клинической оценки. Все поля изначально пусты.</p>

          {error && <p className="form-error" role="alert">{error}</p>}

          <div className="calculator-actions">
            <button className="primary-button" type="submit">Рассчитать Wells PE</button>
            <button className="reset-button" type="button" onClick={reset}><RotateCcw size={15} /> Сбросить</button>
          </div>
          <p className="privacy-note"><ShieldCheck size={14} /> Данные не отправляются на сервер и не сохраняются.</p>
        </form>

        <aside className="calculator-aside">
          <div className="info-panel">
            <div className="info-icon"><BookOpen size={18} /></div>
            <h3>Для чего используется?</h3>
            <p>Шкала оценивает предтестовую клиническую вероятность у взрослых, у которых уже заподозрена ТЭЛА. Она применяется как часть диагностического алгоритма вместе с D-димером и визуализацией, а не вместо них.</p>
          </div>
          <div className="threshold-panel">
            <h3>Двухуровневая модель Wells</h3>
            <p>≤4 баллов: <b>ТЭЛА маловероятна</b></p>
            <p>&gt;4 баллов: <b>ТЭЛА вероятна</b></p><p>Двухуровневая категория не равна трёхуровневой высокой вероятности. Следующий тест определяется полной клинической вероятностью по КР РФ 2025.</p>
            <p>Максимум: <b>12,5 балла</b></p>
          </div>
        </aside>
      </div>

      {result && (
        <section className="result-panel" aria-live="polite">
          <div className="result-topline"><span className="panel-kicker">РЕЗУЛЬТАТ РАСЧЁТА</span><span className={`risk-tag ${result.category === 'unlikely' ? 'risk-low' : 'risk-high'}`}>{result.categoryLabel}</span></div>
          <div className="score-display"><strong>{result.score}</strong><span>балла из 12,5</span></div>
          <p className="result-summary">{result.category === 'likely' ? 'Сумма строго больше 4 баллов.' : 'Сумма 4 балла или меньше.'} {result.categoryLabel} по оригинальной двухуровневой модели Wells.</p>
          <div className="result-breakdown">
            {result.components.map((component) => <p key={component.key}>{component.label}: <b>{component.present ? 'Да' : 'Нет'}</b> <span>— {component.present ? `+${component.points} балл(а)` : '0 баллов'}</span></p>)}
          </div>
          <div className="threshold-panel"><h3>Диагностический контекст по КР РФ 2025</h3><p>{result.pathway}</p></div>
          <p className="clinical-warning">Wells не подтверждает и не исключает ТЭЛА самостоятельно. Шкалы Wells/Geneva не валидированы при беременности и в послеродовом периоде: в этих ситуациях нужен отдельный диагностический алгоритм. Не задерживайте неотложную помощь при гемодинамической нестабильности или высокой клинической настороженности.</p>
        </section>
      )}

      <section className="reference-panel">
        <div><span className="panel-kicker">ИСТОЧНИК И МЕТОДИКА</span><h2>{WELLS_PE_REFERENCE.title}</h2><p>{WELLS_PE_REFERENCE.guideline} · {WELLS_PE_REFERENCE.section}</p></div>
        <a href={WELLS_PE_REFERENCE.url} target="_blank" rel="noreferrer">КР Минздрава РФ 2025 ↗</a><a href={WELLS_PE_REFERENCE.originalUrl} target="_blank" rel="noreferrer">Первоисточник Wells 2000 ↗</a><a href={WELLS_PE_REFERENCE.niceUrl} target="_blank" rel="noreferrer">Двухуровневая версия NICE ↗</a>
        <small>Публикация: {WELLS_PE_REFERENCE.published}. Проверено: {WELLS_PE_REFERENCE.accessed}. {WELLS_PE_REFERENCE.notes[0]} {WELLS_PE_REFERENCE.notes[5]}</small>
      </section>
      <p className="calculator-disclaimer">Образовательный инструмент. Не заменяет клиническую оценку и не предназначен для самостоятельной диагностики или выбора лечения.</p>
    </main>
  )
}
