import { useState, type FormEvent } from 'react'
import { ArrowLeft, BookOpen, RotateCcw, ShieldAlert, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { calculateKDIGOAKI, type CreatinineUnit, type KDIGOAKIResult } from './kdigoAKI'
import { KDIGO_AKI_REFERENCE } from './kdigoAKI.reference'

const initialValues = {
  creatinineBaseline: '', creatinineCurrent: '', creatinineUnit: 'µmol/L' as CreatinineUnit, creatinineIntervalHours: '',
  bodyWeightKg: '', urineVolumeMl: '', urineIntervalHours: '', renalReplacementTherapyStarted: false,
}

export default function KDIGOAKICalculator() {
  const [values, setValues] = useState(initialValues)
  const [result, setResult] = useState<KDIGOAKIResult | null>(null)
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
    const numericKeys = ['creatinineBaseline', 'creatinineCurrent', 'creatinineIntervalHours', 'bodyWeightKg', 'urineVolumeMl', 'urineIntervalHours'] as const
    const parsed = Object.fromEntries(numericKeys.map((key) => [key, values[key] === '' ? null : Number(values[key])]))
    try {
      setResult(calculateKDIGOAKI({
        creatinineBaseline: parsed.creatinineBaseline,
        creatinineCurrent: parsed.creatinineCurrent,
        creatinineUnit: values.creatinineUnit,
        creatinineIntervalHours: parsed.creatinineIntervalHours,
        bodyWeightKg: parsed.bodyWeightKg,
        urineVolumeMl: parsed.urineVolumeMl,
        urineIntervalHours: parsed.urineIntervalHours,
        renalReplacementTherapyStarted: values.renalReplacementTherapyStarted,
      }))
      setError('')
    } catch (caught) {
      setResult(null)
      setError(caught instanceof Error ? caught.message : 'Проверьте введённые значения.')
    }
  }

  const stageLabel = (stage: number | null) => stage === null ? 'Не оценивалось' : stage === 0 ? 'Критерии ОПП не выявлены' : `Стадия ${stage}`

  return (
    <main className="app-shell calculator-shell">
      <div className="calculator-topline">
        <Link className="back-link" to="/"><ArrowLeft size={16} /> Все калькуляторы</Link>
        <span className="version-label">НЕФРОЛОГИЯ · KDIGO AKI</span>
      </div>
      <section className="calculator-heading">
        <div className="eyebrow"><span className="pulse-dot" /> СТАДИРОВАНИЕ ОСТРОГО ПОВРЕЖДЕНИЯ ПОЧЕК</div>
        <h1>KDIGO — ОПП</h1>
        <p>Стадирование ОПП у взрослых по динамике креатинина, диурезу и началу заместительной почечной терапии. Итоговая стадия определяется по наиболее тяжёлому из доступных критериев.</p>
      </section>
      <div className="calculator-layout">
        <form className="calculator-panel" onSubmit={handleCalculate}>
          <div className="panel-heading"><div><span className="panel-kicker">КРИТЕРИЙ 1</span><h2>Креатинин сыворотки</h2></div><span className="points-label">1–3</span></div>
          <div className="form-row">
            <label className="calc-field"><span>Исходный креатинин</span><input type="number" min="0.01" step="any" value={values.creatinineBaseline} onChange={(event) => updateField('creatinineBaseline', event.target.value)} placeholder="Исходное значение" /></label>
            <label className="calc-field"><span>Текущий креатинин</span><input type="number" min="0.01" step="any" value={values.creatinineCurrent} onChange={(event) => updateField('creatinineCurrent', event.target.value)} placeholder="Текущее значение" /></label>
          </div>
          <div className="form-row">
            <label className="calc-field"><span>Единицы измерения</span><select value={values.creatinineUnit} onChange={(event) => updateField('creatinineUnit', event.target.value as CreatinineUnit)}><option value="µmol/L">мкмоль/л</option><option value="mg/dL">мг/дл</option></select></label>
            <label className="calc-field"><span>Интервал между анализами, ч</span><input type="number" min="1" max="168" step="1" value={values.creatinineIntervalHours} onChange={(event) => updateField('creatinineIntervalHours', event.target.value)} placeholder="1–168 часов" /></label>
          </div>
          <p className="field-hint">Для применения критерия 1,5× интервал между исходным и текущим измерениями должен быть ≤7 суток; прирост ≥0,3 мг/дл (≥26,5 мкмоль/л) учитывается только при интервале ≤48 часов. Не подставляйте расчётный исходный креатинин.</p>
          <div className="news2-section">
            <div className="panel-heading panel-subheading"><div><span className="panel-kicker">КРИТЕРИЙ 2</span><h2>Диурез</h2></div><span className="points-label">1–3</span></div>
            <div className="form-row">
              <label className="calc-field"><span>Масса тела, кг</span><input type="number" min="0.5" max="500" step="any" value={values.bodyWeightKg} onChange={(event) => updateField('bodyWeightKg', event.target.value)} placeholder="Масса тела" /></label>
              <label className="calc-field"><span>Объём мочи за период, мл</span><input type="number" min="0" max="50000" step="any" value={values.urineVolumeMl} onChange={(event) => updateField('urineVolumeMl', event.target.value)} placeholder="Объём мочи" /></label>
            </div>
            <label className="calc-field field-full"><span>Длительность периода, часов</span><input type="number" min="1" max="168" step="any" value={values.urineIntervalHours} onChange={(event) => updateField('urineIntervalHours', event.target.value)} placeholder="Длительность наблюдения" /></label>
            <p className="field-hint">Заполните все три поля вместе. Калькулятор рассчитает средний диурез в мл/кг/ч за непрерывный период. Используйте полные почасовые измерения; не объединяйте разрозненные интервалы. Для анурии укажите объём мочи 0 мл.</p>
          </div>
          <div className="news2-section">
            <label className="form-check">
              <input type="checkbox" className="form-check__input" checked={values.renalReplacementTherapyStarted} onChange={(event) => updateField('renalReplacementTherapyStarted', event.target.checked)} />
              <span className="form-check__label">Начата заместительная почечная терапия в текущем эпизоде ОПП</span>
              <span className="form-check__score">Стадия 3</span>
            </label>
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="calculator-actions">
            <button className="primary-button" type="submit">Определить стадию ОПП</button>
            <button className="reset-button" type="button" onClick={reset}><RotateCcw size={15} /> Сбросить</button>
          </div>
          <p className="privacy-note"><ShieldCheck size={14} /> Данные не отправляются на сервер и не сохраняются.</p>
        </form>
        <aside className="calculator-aside">
          <div className="info-panel"><div className="info-icon"><BookOpen size={18} /></div><h3>Два независимых критерия</h3><p>Креатинин и диурез оцениваются отдельно. Итоговая стадия — наиболее высокая из выявленных по любому критерию.</p></div>
          <div className="threshold-panel"><h3>Критерии диуреза</h3><p><b>Стадия 1:</b> &lt;0,5 мл/кг/ч в течение 6–&lt;12 часов.</p><p><b>Стадия 2:</b> &lt;0,5 мл/кг/ч ≥12 часов.</p><p><b>Стадия 3:</b> &lt;0,3 мл/кг/ч ≥24 часов или анурия ≥12 часов.</p></div>
        </aside>
      </div>
      {result && (
        <section className="result-panel" aria-live="polite">
          <div className="result-topline"><span className="panel-kicker">РЕЗУЛЬТАТ СТАДИРОВАНИЯ</span><span className="risk-tag risk-moderate">KDIGO 2012</span></div>
          <div className="score-display"><strong>{result.overallStage === 0 ? '—' : result.overallStage}</strong><span>{result.overallStage === 0 ? 'критерии ОПП по введённым данным не выявлены' : 'итоговая стадия ОПП'}</span></div>
          <div className="result-summary"><b>{result.interpretation}</b></div>
          <div className="criteria-list">
            <div className="criterion-row"><span className="criterion-point">{result.creatinineStage === null || result.creatinineStage === 0 ? '—' : result.creatinineStage}</span><span><b>Критерий креатинина</b><small>{stageLabel(result.creatinineStage)}</small></span></div>
            <div className="criterion-row"><span className="criterion-point">{result.urineOutputStage === null || result.urineOutputStage === 0 ? '—' : result.urineOutputStage}</span><span><b>Критерий диуреза</b><small>{stageLabel(result.urineOutputStage)}{result.urineOutputRate !== null ? ` · ${result.urineOutputRate.toFixed(3)} мл/кг/ч` : ''}</small></span></div>
            <div className="criterion-row"><span className="criterion-point">{result.renalReplacementTherapyStarted ? 'Да' : 'Нет'}</span><span><b>Начало ЗПТ</b><small>{result.renalReplacementTherapyStarted ? 'Критерий стадии 3' : 'Не отмечено'}</small></span></div>
          </div>
          {result.details.map((detail) => <p className="field-hint" key={detail}>{detail}</p>)}
          <p className="clinical-warning"><ShieldAlert size={14} /> Если по введённым данным критерии не выявлены, это не исключает ОПП: исходный креатинин может быть неизвестен, а диурез — неполно измерен. Стадия не определяет причину ОПП и сама по себе не является показанием к ЗПТ.</p>
        </section>
      )}
      <section className="reference-panel">
        <div><span className="panel-kicker">ИСТОЧНИК И МЕТОДИКА</span><h2>{KDIGO_AKI_REFERENCE.title}</h2><p>{KDIGO_AKI_REFERENCE.guideline}</p></div>
        <a href={KDIGO_AKI_REFERENCE.guidelineUrl} target="_blank" rel="noreferrer">Открыть руководство KDIGO ↗</a>
        <small>{KDIGO_AKI_REFERENCE.currentUpdate} · <a href={KDIGO_AKI_REFERENCE.currentUpdateUrl} target="_blank" rel="noreferrer">Статус обновления KDIGO ↗</a> Проверено: {KDIGO_AKI_REFERENCE.accessed}.</small>
      </section>
      <p className="calculator-disclaimer">Стадирование по KDIGO 2012 у взрослых. Нулевой результат означает, что по введённым данным критерии не выявлены, а не официальную «стадию 0». Отсутствие критериев по неполным данным не исключает ОПП. Не заменяет клиническую оценку и решение о лечении.</p>
    </main>
  )
}
