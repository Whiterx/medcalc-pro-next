import { useState, type FormEvent } from 'react'
import { ArrowLeft, BookOpen, RotateCcw, ShieldAlert, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { calculateUFHInitialDosing, type UFHIndication, type UFHResult } from './unfractionatedHeparin'
import { UFH_REFERENCE } from './unfractionatedHeparin.reference'

const initialValues = { weight: '', indication: '' as '' | UFHIndication }

export default function UnfractionatedHeparinCalculator() {
  const [values, setValues] = useState(initialValues)
  const [result, setResult] = useState<UFHResult | null>(null)
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
    if (values.weight === '' || values.indication === '') {
      setError('Введите массу тела и выберите клиническое показание.')
      setResult(null)
      return
    }
    try {
      setResult(calculateUFHInitialDosing({ actualBodyWeightKg: Number(values.weight), indication: values.indication }))
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
        <span className="version-label">ФАРМАКОТЕРАПИЯ · UFH</span>
      </div>
      <section className="calculator-heading">
        <div className="eyebrow"><span className="pulse-dot" /> НАЧАЛЬНЫЙ РАСЧЁТ ДОЗЫ</div>
        <h1>Нефракционированный гепарин</h1>
        <p>Расчёт стартового болюса и скорости инфузии по выбранному протоколу и фактической массе тела.</p>
      </section>
      <div className="calculator-layout">
        <form className="calculator-panel" onSubmit={handleCalculate}>
          <div className="panel-heading"><div><span className="panel-kicker">ПАРАМЕТРЫ ПАЦИЕНТА</span><h2>Масса тела и показание</h2></div><span className="points-label">Ед.</span></div>
          <label className="calc-field field-full"><span>Фактическая масса тела, кг</span><input type="number" min="20" max="300" step="0.1" required value={values.weight} onChange={(event) => updateField('weight', event.target.value)} placeholder="Введите массу тела" /></label>
          <label className="calc-field field-full">
            <span>Показание / протокол</span>
            <select required value={values.indication} onChange={(event) => updateField('indication', event.target.value as '' | UFHIndication)}>
              <option value="">Выберите протокол</option>
              <option value="vte">Лечение острого ТГВ / ТЭЛА (80 Ед/кг болюс + 18 Ед/кг/ч)</option>
              <option value="acs">Начальная терапия ОКС (60 Ед/кг болюс + 12 Ед/кг/ч)</option>
            </select>
          </label>
          <p className="field-hint">Используются фактическая масса тела и протокольные максимумы. При переходе с другого антикоагулянта или индивидуальных ограничениях нужен отдельный алгоритм.</p>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="calculator-actions">
            <button className="primary-button" type="submit">Рассчитать начальную дозу</button>
            <button className="reset-button" type="button" onClick={reset}><RotateCcw size={15} /> Сбросить</button>
          </div>
          <p className="privacy-note"><ShieldCheck size={14} /> Данные не отправляются на сервер и не сохраняются.</p>
        </form>
        <aside className="calculator-aside">
          <div className="info-panel"><div className="info-icon"><BookOpen size={18} /></div><h3>Два разных протокола</h3><p>Дозы при ВТЭО и ОКС различаются. Не используйте один режим для другого показания.</p></div>
          <div className="threshold-panel"><h3>Мониторинг</h3><p>Для большинства терапевтических показаний ISTH 2026 предлагает анти-Xa 0,30–0,70 МЕ/мл. АЧТВ — по локальному лабораторному диапазону.</p><p>Для ОКС ACC/AHA 2025 указывает начальную цель АЧТВ 60–80 секунд.</p></div>
        </aside>
      </div>
      {result && (
        <section className="result-panel" aria-live="polite">
          <div className="result-topline"><span className="panel-kicker">НАЧАЛЬНЫЙ РЕЖИМ</span><span className="risk-tag risk-moderate">UFH · {result.indication === 'vte' ? 'ВТЭО' : 'ОКС'}</span></div>
          <div className="result-summary"><b>{result.indicationLabel}</b></div>
          <div className="score-display"><strong>{Math.round(result.bolusUnits).toLocaleString('ru-RU')}</strong><span>Ед. болюс</span></div>
          <div className="result-summary"><b>Начальная инфузия: {Math.round(result.infusionUnitsPerHour).toLocaleString('ru-RU')} Ед/ч</b><p>Масса тела: {result.weightKg} кг.</p></div>
          {(result.bolusCapped || result.infusionCapped) && <p className="field-hint">Применены протокольные максимумы: {result.bolusCapped ? 'болюс ограничен' : ''}{result.bolusCapped && result.infusionCapped ? '; ' : ''}{result.infusionCapped ? 'скорость инфузии ограничена' : ''}.</p>}
          <div className="threshold-panel"><h3>Контроль антикоагуляции</h3><p>{result.monitoring}</p></div>
          <p className="clinical-warning"><ShieldAlert size={14} /> Это только стартовый расчёт. Не заменяет оценку кровотечения, тромбоцитов и противопоказаний; не рассчитывает титрование. При подозрении на HIT не применять UFH — требуется альтернативный антикоагулянт. Перед введением сверьте режим с локальным протоколом.</p>
        </section>
      )}
      <section className="reference-panel">
        <div><span className="panel-kicker">ИСТОЧНИК И МЕТОДИКА</span><h2>{UFH_REFERENCE.title}</h2><p>{UFH_REFERENCE.acsGuideline}</p></div>
        <a href={UFH_REFERENCE.acsGuidelineUrl} target="_blank" rel="noreferrer">Открыть руководство ACC/AHA 2025 ↗</a>
        <small>{UFH_REFERENCE.monitoringGuideline} · <a href={UFH_REFERENCE.monitoringUrl} target="_blank" rel="noreferrer">Рекомендации ISTH ↗</a> Проверено: {UFH_REFERENCE.accessed}.</small>
      </section>
      <p className="calculator-disclaimer">Образовательный инструмент расчёта стартового режима UFH для взрослых. Не заменяет локальный номограммный протокол и лабораторный мониторинг.</p>
    </main>
  )
}
