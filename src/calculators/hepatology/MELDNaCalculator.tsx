import { useState, type FormEvent } from 'react'
import { ArrowLeft, BookOpen, RotateCcw, ShieldAlert, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { calculateMELDNa, type MELDNaBilirubinUnit, type MELDNaCreatinineUnit, type MELDNaResult } from './meldNa'
import { MELD_NA_REFERENCE } from './meldNa.reference'

const initialValues = {
  bilirubin: '', bilirubinUnit: 'µmol/L' as MELDNaBilirubinUnit,
  creatinine: '', creatinineUnit: 'µmol/L' as MELDNaCreatinineUnit,
  inr: '', sodium: '', recentDialysis: false,
}

export default function MELDNaCalculator() {
  const [values, setValues] = useState(initialValues)
  const [result, setResult] = useState<MELDNaResult | null>(null)
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
    if ([values.bilirubin, values.creatinine, values.inr, values.sodium].some((value) => value.trim() === '')) {
      setError('Заполните билирубин, креатинин, МНО и натрий.')
      setResult(null)
      return
    }
    try {
      setResult(calculateMELDNa({
        bilirubin: Number(values.bilirubin), bilirubinUnit: values.bilirubinUnit,
        creatinine: Number(values.creatinine), creatinineUnit: values.creatinineUnit,
        inr: Number(values.inr), sodium: Number(values.sodium), recentDialysis: values.recentDialysis,
      }))
      setError('')
    } catch (caught) {
      setResult(null)
      setError(caught instanceof Error ? caught.message : 'Проверьте введённые значения.')
    }
  }

  const inputUnit = (unit: string) => (
    <span className="field-hint">Единицы: {unit}. Значения ниже/выше формульных границ корректируются по правилам MELD-Na.</span>
  )

  return (
    <main className="app-shell calculator-shell">
      <div className="calculator-topline">
        <Link className="back-link" to="/"><ArrowLeft size={16} /> Все калькуляторы</Link>
        <span className="version-label">ГЕПАТОЛОГИЯ · MELD-NA</span>
      </div>
      <section className="calculator-heading">
        <div className="eyebrow"><span className="pulse-dot" /> ИСТОРИЧЕСКАЯ МОДЕЛЬ ПРОГНОЗА</div>
        <h1>MELD-Na</h1>
        <p>Расчёт исторической версии MELD-Na по билирубину, креатинину, МНО и натрию с учётом формульных ограничений и диализа.</p>
      </section>
      <div className="calculator-layout">
        <form className="calculator-panel" onSubmit={handleCalculate}>
          <div className="panel-heading"><div><span className="panel-kicker">ЧЕТЫРЕ ПОКАЗАТЕЛЯ</span><h2>Лабораторные параметры</h2></div><span className="points-label">MELD 6–40</span></div>
          <div className="news2-section">
            <div className="panel-heading panel-subheading"><div><span className="panel-kicker">ПАРАМЕТР 1</span><h2>Общий билирубин</h2></div></div>
            <div className="form-row">
              <label className="calc-field"><span>Значение</span><input type="number" min="0.01" step="any" required value={values.bilirubin} onChange={(event) => updateField('bilirubin', event.target.value)} placeholder="Введите билирубин" /></label>
              <label className="calc-field"><span>Единицы</span><select value={values.bilirubinUnit} onChange={(event) => updateField('bilirubinUnit', event.target.value as MELDNaBilirubinUnit)}><option value="µmol/L">мкмоль/л</option><option value="mg/dL">мг/дл</option></select></label>
            </div>
            {inputUnit(values.bilirubinUnit === 'mg/dL' ? 'мг/дл' : 'мкмоль/л')}
          </div>
          <div className="news2-section">
            <div className="panel-heading panel-subheading"><div><span className="panel-kicker">ПАРАМЕТР 2</span><h2>Креатинин сыворотки</h2></div></div>
            <div className="form-row">
              <label className="calc-field"><span>Значение</span><input type="number" min="0.01" step="any" required value={values.creatinine} onChange={(event) => updateField('creatinine', event.target.value)} placeholder="Введите креатинин" /></label>
              <label className="calc-field"><span>Единицы</span><select value={values.creatinineUnit} onChange={(event) => updateField('creatinineUnit', event.target.value as MELDNaCreatinineUnit)}><option value="µmol/L">мкмоль/л</option><option value="mg/dL">мг/дл</option></select></label>
            </div>
            {inputUnit(values.creatinineUnit === 'mg/dL' ? 'мг/дл' : 'мкмоль/л')}
          </div>
          <div className="news2-section">
            <div className="panel-heading panel-subheading"><div><span className="panel-kicker">ПАРАМЕТР 3</span><h2>МНО (INR)</h2></div></div>
            <label className="calc-field field-full"><span>МНО</span><input type="number" min="0.5" max="20" step="any" required value={values.inr} onChange={(event) => updateField('inr', event.target.value)} placeholder="Введите INR" /></label>
            {inputUnit('без единиц измерения')}
          </div>
          <div className="news2-section">
            <div className="panel-heading panel-subheading"><div><span className="panel-kicker">ПАРАМЕТР 4</span><h2>Натрий сыворотки</h2></div></div>
            <label className="calc-field field-full"><span>Натрий, ммоль/л</span><input type="number" min="100" max="200" step="any" required value={values.sodium} onChange={(event) => updateField('sodium', event.target.value)} placeholder="Введите натрий" /></label>
            {inputUnit('ммоль/л')}
          </div>
          <label className="form-check">
            <input type="checkbox" className="form-check__input" checked={values.recentDialysis} onChange={(event) => updateField('recentDialysis', event.target.checked)} />
            <span className="form-check__label">≥2 сеанса диализа или ≥24 ч CVVHD за последние 7 дней</span>
            <span className="form-check__score">Cr = 4</span>
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="calculator-actions">
            <button className="primary-button" type="submit">Рассчитать MELD-Na</button>
            <button className="reset-button" type="button" onClick={reset}><RotateCcw size={15} /> Сбросить</button>
          </div>
          <p className="privacy-note"><ShieldCheck size={14} /> Данные не отправляются на сервер и не сохраняются.</p>
        </form>
        <aside className="calculator-aside">
          <div className="info-panel"><div className="info-icon"><BookOpen size={18} /></div><h3>Историческая формула</h3><p>Это версия MELD-Na, применявшаяся в OPTN/UNOS до июля 2023 года. Она не является текущей формулой распределения донорской печени в США.</p></div>
          <div className="threshold-panel"><h3>Формульные ограничения</h3><p>Билирубин и INR: минимум 1,0.</p><p>Креатинин: 1,0–4,0 мг/дл; при заданном диализе — 4,0 мг/дл.</p><p>Натрий: 125–137 ммоль/л.</p><p>Натриевая поправка в историческом OPTN-варианте применяется при базовом MELD &gt;11.</p></div>
        </aside>
      </div>
      {result && (
        <section className="result-panel" aria-live="polite">
          <div className="result-topline"><span className="panel-kicker">РЕЗУЛЬТАТ РАСЧЁТА</span><span className="risk-tag risk-moderate">Историческая модель MELD-Na</span></div>
          <div className="score-display"><strong>{result.meldNa}</strong><span>итоговый балл MELD-Na · максимум 40</span></div>
          <div className="result-summary"><b>Базовый MELD: {result.meld} баллов</b><p>Неокруглённое значение: {result.meldRaw.toFixed(2)}. {result.sodiumAdjusted ? `Натриевая поправка применена: ${result.meldNaRaw.toFixed(2)} до округления.` : 'Натриевая поправка не применялась, так как базовый MELD не превышает 11.'}</p></div>
          <h3>Эффективные значения для формулы</h3>
          <div className="criteria-list">
            <div className="criterion-row"><span className="criterion-point">1</span><span><b>Билирубин</b><small>{result.effectiveBilirubinMgDl.toFixed(2)} мг/дл</small></span></div>
            <div className="criterion-row"><span className="criterion-point">2</span><span><b>Креатинин</b><small>{result.effectiveCreatinineMgDl.toFixed(2)} мг/дл</small></span></div>
            <div className="criterion-row"><span className="criterion-point">3</span><span><b>МНО (INR)</b><small>{result.effectiveINR.toFixed(2)}</small></span></div>
            <div className="criterion-row"><span className="criterion-point">4</span><span><b>Натрий</b><small>{result.effectiveSodium.toFixed(1)} ммоль/л</small></span></div>
          </div>
          {result.adjustments.length > 0 && <div className="threshold-panel"><h3>Применённые ограничения</h3>{result.adjustments.map((item, index) => <p key={`${item.key}-${index}`}>{item.description}</p>)}</div>}
          <p className="clinical-warning"><ShieldAlert size={14} /> MELD-Na не является диагнозом и не определяет самостоятельно прогноз конкретного пациента или приоритет трансплантации. Для решений используйте актуальную национальную систему и локальные правила; INR может быть искажён антикоагулянтами.</p>
        </section>
      )}
      <section className="reference-panel">
        <div><span className="panel-kicker">ИСТОЧНИК И МЕТОДИКА</span><h2>{MELD_NA_REFERENCE.title}</h2><p>{MELD_NA_REFERENCE.originalSource}</p></div>
        <a href={MELD_NA_REFERENCE.originalUrl} target="_blank" rel="noreferrer">Открыть оригинальную публикацию ↗</a>
        <small>{MELD_NA_REFERENCE.formulaSource} · <a href={MELD_NA_REFERENCE.formulaUrl} target="_blank" rel="noreferrer">Формулы MELD/MELD-Na ↗</a><br />{MELD_NA_REFERENCE.currentPolicySource} · <a href={MELD_NA_REFERENCE.currentPolicyUrl} target="_blank" rel="noreferrer">Актуальный калькулятор OPTN ↗</a> Проверено: {MELD_NA_REFERENCE.accessed}.</small>
      </section>
      <p className="calculator-disclaimer">Образовательный калькулятор исторической версии MELD-Na. Не заменяет клиническую оценку и актуальные правила распределения органов.</p>
    </main>
  )
}
