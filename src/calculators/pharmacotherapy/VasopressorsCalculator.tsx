import { useState, type FormEvent } from 'react'
import { ArrowLeft, BookOpen, RotateCcw, ShieldAlert, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { calculateVasoactiveRate, type VasoactiveDrug, type VasoactiveResult } from './vasopressors'
import { VASOPRESSORS_REFERENCE } from './vasopressors.reference'

const initialValues = { drug: '' as '' | VasoactiveDrug, dose: '', weightKg: '', concentration: '' }

const drugOptions: { value: VasoactiveDrug; label: string }[] = [
  { value: 'norepinephrine', label: 'Норадреналин' },
  { value: 'epinephrine', label: 'Адреналин' },
  { value: 'dopamine', label: 'Допамин' },
  { value: 'dobutamine', label: 'Добутамин' },
  { value: 'vasopressin', label: 'Вазопрессин' },
]

export default function VasopressorsCalculator() {
  const [values, setValues] = useState(initialValues)
  const [result, setResult] = useState<VasoactiveResult | null>(null)
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
    if (values.drug === '' || values.dose === '' || values.concentration === '') {
      setError('Выберите препарат и заполните назначенную дозу и концентрацию готового раствора.')
      setResult(null)
      return
    }
    const isVasopressin = values.drug === 'vasopressin'
    const isEpinephrine = values.drug === 'epinephrine'
    if (!isVasopressin && !isEpinephrine && values.weightKg === '') {
      setError('Для выбранного препарата введите массу тела.')
      setResult(null)
      return
    }
    try {
      setResult(calculateVasoactiveRate({
        drug: values.drug,
        dose: Number(values.dose),
        weightKg: isVasopressin || isEpinephrine ? null : Number(values.weightKg),
        concentration: Number(values.concentration),
      }))
      setError('')
    } catch (caught) {
      setResult(null)
      setError(caught instanceof Error ? caught.message : 'Проверьте введённые значения.')
    }
  }

  const isVasopressin = values.drug === 'vasopressin'
  const isEpinephrine = values.drug === 'epinephrine'

  return (
    <main className="app-shell calculator-shell">
      <div className="calculator-topline">
        <Link className="back-link" to="/"><ArrowLeft size={16} /> Все калькуляторы</Link>
        <span className="version-label">ФАРМАКОТЕРАПИЯ · ВАЗОАКТИВНЫЕ ПРЕПАРАТЫ</span>
      </div>
      <section className="calculator-heading">
        <div className="eyebrow"><span className="pulse-dot" /> РАСЧЁТ СКОРОСТИ ИНФУЗИИ</div>
        <h1>Вазопрессоры и инотропы</h1>
        <p>Пересчёт уже назначенной дозы в мл/ч по фактической концентрации приготовленного раствора.</p>
      </section>
      <div className="calculator-layout">
        <form className="calculator-panel" onSubmit={handleCalculate}>
          <div className="panel-heading"><div><span className="panel-kicker">ПРЕПАРАТ И ДОЗА</span><h2>Параметры инфузии</h2></div><span className="points-label">мл/ч</span></div>
          <label className="calc-field field-full">
            <span>Препарат</span>
            <select required value={values.drug} onChange={(event) => updateField('drug', event.target.value as '' | VasoactiveDrug)}>
              <option value="">Выберите препарат</option>
              {drugOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          {values.drug !== '' && (
            <>
              {!isVasopressin && !isEpinephrine && (
                <label className="calc-field field-full"><span>Фактическая масса тела, кг</span><input type="number" min="0.1" max="500" step="any" required value={values.weightKg} onChange={(event) => updateField('weightKg', event.target.value)} placeholder="Введите массу тела" /></label>
              )}
              <label className="calc-field field-full">
                <span>Назначенная доза, {isVasopressin ? 'Ед/мин' : isEpinephrine ? 'мкг/мин' : 'мкг/кг/мин'}</span>
                <input type="number" min="0.0001" max="1000" step="any" required value={values.dose} onChange={(event) => updateField('dose', event.target.value)} placeholder={isVasopressin ? 'Например, 0,03' : isEpinephrine ? 'Например, 1' : 'Введите назначенную дозу'} />
              </label>
              <label className="calc-field field-full"><span>Концентрация готового раствора, {isVasopressin ? 'Ед/мл' : 'мкг/мл'}</span><input type="number" min="0.0001" max="100000" step="any" required value={values.concentration} onChange={(event) => updateField('concentration', event.target.value)} placeholder={isVasopressin ? 'Ед/мл' : 'мкг/мл'} /></label>
              <p className="field-hint">Введите концентрацию готового раствора по маркировке шприца/пакета. Для катехоламинов она должна быть выражена в том же эквиваленте действующего вещества, к которому относится назначенная доза. Соль и активное основание не взаимозаменяемы: не выполняйте пересчёт самостоятельно. Если эквивалент неясен, уточните его у аптеки/фармацевта и не используйте расчёт.</p>
            </>
          )}
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="calculator-actions">
            <button className="primary-button" type="submit">Рассчитать скорость</button>
            <button className="reset-button" type="button" onClick={reset}><RotateCcw size={15} /> Сбросить</button>
          </div>
          <p className="privacy-note"><ShieldCheck size={14} /> Данные не отправляются на сервер и не сохраняются.</p>
        </form>
        <aside className="calculator-aside">
          <div className="info-panel"><div className="info-icon"><BookOpen size={18} /></div><h3>Только пересчёт единиц</h3><p>Калькулятор не подбирает дозу и не титрует препарат. Вводите уже назначенную дозу и проверенную концентрацию раствора.</p></div>
          <div className="threshold-panel"><h3>Формулы</h3><p>Для норадреналина, допамина и добутамина: [мкг/кг/мин × кг × 60] ÷ [мкг/мл].</p><p>Для адреналина: [мкг/мин × 60] ÷ [мкг/мл].</p><p>Для вазопрессина: [Ед/мин × 60] ÷ [Ед/мл].</p></div>
        </aside>
      </div>
      {result && (
        <section className="result-panel" aria-live="polite">
          <div className="result-topline"><span className="panel-kicker">РАСЧЁТНАЯ СКОРОСТЬ</span><span className="risk-tag risk-moderate">Проверьте независимо</span></div>
          <div className="score-display"><strong>{result.infusionRateMlH.toFixed(2)}</strong><span>мл/ч</span></div>
          <div className="result-summary"><b>{result.drugLabel}</b><p>Назначенная доза: {result.dose} {result.doseUnit}{result.weightKg !== null ? ` × ${result.weightKg} кг` : ''}.</p><p>Концентрация: {result.concentration.toFixed(3)} {result.concentrationUnit}.</p><p>Скорость: {result.infusionRateMlMin.toFixed(3)} мл/мин.</p></div>
          <p className="clinical-warning"><ShieldAlert size={14} /> До подключения независимо проверьте расчёт, концентрацию и настройки инфузионного насоса по локальному протоколу. Это не рекомендация по выбору препарата или дозы.</p>
        </section>
      )}
      <section className="reference-panel">
        <div><span className="panel-kicker">ИСТОЧНИК И МЕТОДИКА</span><h2>{VASOPRESSORS_REFERENCE.title}</h2><p>{VASOPRESSORS_REFERENCE.guideline}</p></div>
        <a href={VASOPRESSORS_REFERENCE.guidelineUrl} target="_blank" rel="noreferrer">Открыть клинические рекомендации Минздрава РФ ↗</a>
        <small>{VASOPRESSORS_REFERENCE.supportingGuideline} · <a href={VASOPRESSORS_REFERENCE.supportingUrl} target="_blank" rel="noreferrer">Инструкция FDA для допамина ↗</a> Проверено: {VASOPRESSORS_REFERENCE.accessed}.</small>
      </section>
      <p className="calculator-disclaimer">Калькулятор пересчёта скорости инфузии у взрослых. Не заменяет независимую двойную проверку и локальный протокол.</p>
    </main>
  )
}
