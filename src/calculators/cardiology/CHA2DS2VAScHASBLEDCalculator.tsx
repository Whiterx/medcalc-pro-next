import { useState, type FormEvent } from 'react'
import { ArrowLeft, BookOpen, RotateCcw, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { calculateAFCombined, type AFCombinedResult } from './cha2ds2vascHasbled'
import { CHA2DS2_VASc_HASBLED_REFERENCE } from './cha2ds2vascHasbled.reference'

const initialValues = {
  ageYears: '',
  heartFailure: false,
  hypertension: false,
  diabetes: false,
  priorStrokeTIAOrEmbolism: false,
  vascularDisease: false,
  femaleSex: false,
  uncontrolledSystolicBPOver160: false,
  abnormalRenalFunction: false,
  abnormalLiverFunction: false,
  priorStrokeForBleedingScore: false,
  bleedingHistoryOrPredisposition: false,
  labileINR: false,
  bleedingRiskDrugs: false,
  excessiveAlcohol: false,
  assessmentConfirmed: false,
}

export default function CHA2DS2VAScHASBLEDCalculator() {
  const [values, setValues] = useState(initialValues)
  const [result, setResult] = useState<AFCombinedResult | null>(null)
  const [error, setError] = useState('')

  function updateField<K extends keyof typeof initialValues>(field: K, value: typeof initialValues[K]) {
    setValues((current) => ({ ...current, [field]: value }))
    setResult(null)
    setError('')
  }

  function handleCalculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (values.ageYears === '') {
      setError('Введите возраст.')
      setResult(null)
      return
    }
    try {
      setResult(calculateAFCombined({
        ageYears: Number(values.ageYears),
        heartFailure: values.heartFailure,
        hypertension: values.hypertension,
        diabetes: values.diabetes,
        priorStrokeTIAOrEmbolism: values.priorStrokeTIAOrEmbolism,
        vascularDisease: values.vascularDisease,
        femaleSex: values.femaleSex,
        uncontrolledSystolicBPOver160: values.uncontrolledSystolicBPOver160,
        abnormalRenalFunction: values.abnormalRenalFunction,
        abnormalLiverFunction: values.abnormalLiverFunction,
        priorStrokeForBleedingScore: values.priorStrokeForBleedingScore,
        bleedingHistoryOrPredisposition: values.bleedingHistoryOrPredisposition,
        labileINR: values.labileINR,
        bleedingRiskDrugs: values.bleedingRiskDrugs,
        excessiveAlcohol: values.excessiveAlcohol,
        assessmentConfirmed: values.assessmentConfirmed,
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
        <span className="version-label">КАРДИОЛОГИЯ · ФП</span>
      </div>

      <section className="calculator-heading">
        <div className="eyebrow"><span className="pulse-dot" /> РИСК ИНСУЛЬТА И КРОВОТЕЧЕНИЯ ПРИ ФП</div>
        <h1>CHA₂DS₂-VASc + HAS-BLED</h1>
        <p>Комбинированная оценка тромбоэмболического риска и факторов риска кровотечения у взрослых пациентов с фибрилляцией предсердий.</p>
      </section>

      <div className="calculator-layout">
        <form className="calculator-panel" onSubmit={handleCalculate}>
          <div className="panel-heading">
            <div><span className="panel-kicker">ШКАЛА 1</span><h2>CHA₂DS₂-VASc</h2></div>
            <span className="points-label">0–9 баллов</span>
          </div>

          <label className="calc-field field-full">
            <span>Возраст <small>лет; ≥75 = 2 балла, 65–74 = 1 балл</small></span>
            <input type="number" min="18" max="120" step="1" inputMode="numeric" placeholder="Введите возраст" value={values.ageYears} onChange={(event) => updateField('ageYears', event.target.value)} />
          </label>

          <label className="check-field">
            <input type="checkbox" checked={values.heartFailure} onChange={(event) => updateField('heartFailure', event.target.checked)} />
            <span>Сердечная недостаточность: клинические симптомы/признаки независимо от ФВ или бессимптомная ФВ ЛЖ ≤40% (+1)</span>
          </label>
          <label className="check-field">
            <input type="checkbox" checked={values.hypertension} onChange={(event) => updateField('hypertension', event.target.checked)} />
            <span>Артериальная гипертензия / антигипертензивная терапия (+1)</span>
          </label>
          <label className="check-field">
            <input type="checkbox" checked={values.diabetes} onChange={(event) => updateField('diabetes', event.target.checked)} />
            <span>Сахарный диабет (+1)</span>
          </label>
          <label className="check-field">
            <input type="checkbox" checked={values.priorStrokeTIAOrEmbolism} onChange={(event) => updateField('priorStrokeTIAOrEmbolism', event.target.checked)} />
            <span>Инсульт, ТИА или системная артериальная эмболия в анамнезе (+2)</span>
          </label>
          <label className="check-field">
            <input type="checkbox" checked={values.vascularDisease} onChange={(event) => updateField('vascularDisease', event.target.checked)} />
            <span>Сосудистое заболевание: перенесённый ИМ, заболевание периферических артерий или аортальная бляшка (+1)</span>
          </label>
          <label className="check-field">
            <input type="checkbox" checked={values.femaleSex} onChange={(event) => updateField('femaleSex', event.target.checked)} />
            <span>Женский пол — модификатор риска в CHA₂DS₂-VASc (+1)</span>
          </label>
          <p className="field-hint">КР Минздрава РФ 2025 используют CHA₂DS₂-VASc. Шкала CHA₂DS₂-VA из ESC 2024 не валидирована в РФ и не используется здесь для клинической интерпретации.</p>

          <div className="panel-heading panel-subheading">
            <div><span className="panel-kicker">ШКАЛА 2</span><h2>HAS-BLED</h2></div>
            <span className="points-label">0–9 баллов</span>
          </div>

          <label className="check-field">
            <input type="checkbox" checked={values.uncontrolledSystolicBPOver160} onChange={(event) => updateField('uncontrolledSystolicBPOver160', event.target.checked)} />
            <span>H — неконтролируемое САД &gt;160 мм рт. ст. (+1)</span>
          </label>
          <label className="check-field">
            <input type="checkbox" checked={values.abnormalRenalFunction} onChange={(event) => updateField('abnormalRenalFunction', event.target.checked)} />
            <span>A — нарушение функции почек: диализ, трансплантация или креатинин ≥200 мкмоль/л (+1)</span>
          </label>
          <label className="check-field">
            <input type="checkbox" checked={values.abnormalLiverFunction} onChange={(event) => updateField('abnormalLiverFunction', event.target.checked)} />
            <span>A — нарушение функции печени: цирроз или билирубин ≥2×ВГН вместе с AST/ALT/ALP &gt;3×ВГН (+1)</span>
          </label>
          <label className="check-field">
            <input type="checkbox" checked={values.priorStrokeForBleedingScore} onChange={(event) => updateField('priorStrokeForBleedingScore', event.target.checked)} />
            <span>S — инсульт в анамнезе (+1)</span>
          </label>
          <label className="check-field">
            <input type="checkbox" checked={values.bleedingHistoryOrPredisposition} onChange={(event) => updateField('bleedingHistoryOrPredisposition', event.target.checked)} />
            <span>B — крупное кровотечение в анамнезе или предрасположенность к кровотечению (+1)</span>
          </label>
          <label className="check-field">
            <input type="checkbox" checked={values.labileINR} onChange={(event) => updateField('labileINR', event.target.checked)} />
            <span>L — лабильное МНО: TTR &lt;60% при приёме антагониста витамина K (+1)</span>
          </label>
          <p className="field-hint">E — возраст &gt;65 лет учитывается автоматически из поля возраста: {values.ageYears === '' ? 'не указан' : Number(values.ageYears) > 65 ? '1 балл' : '0 баллов'}.</p>
          <label className="check-field">
            <input type="checkbox" checked={values.bleedingRiskDrugs} onChange={(event) => updateField('bleedingRiskDrugs', event.target.checked)} />
            <span>D — сопутствующий приём антиагрегантов или НПВП (+1)</span>
          </label>
          <label className="check-field">
            <input type="checkbox" checked={values.excessiveAlcohol} onChange={(event) => updateField('excessiveAlcohol', event.target.checked)} />
            <span>D — избыточное употребление алкоголя (обычно ≥8 стандартных доз в неделю по исходной операционализации) (+1)</span>
          </label>

          <label className="check-field">
            <input type="checkbox" checked={values.assessmentConfirmed} onChange={(event) => updateField('assessmentConfirmed', event.target.checked)} />
            <span>Подтверждаю, что все критерии обеих шкал оценены; неотмеченные признаки отсутствуют</span>
          </label>
          <p className="field-hint">Лабильное МНО оценивается только у пациентов, получающих антагонист витамина K. Все флажки по умолчанию сняты.</p>
          {error && <p className="form-error" role="alert">{error}</p>}

          <div className="calculator-actions">
            <button className="primary-button" type="submit">Рассчитать обе шкалы</button>
            <button className="reset-button" type="button" onClick={reset}><RotateCcw size={15} /> Сбросить</button>
          </div>
          <p className="privacy-note"><ShieldCheck size={14} /> Данные не отправляются на сервер и не сохраняются.</p>
        </form>

        <aside className="calculator-aside">
          <div className="info-panel">
            <div className="info-icon"><BookOpen size={18} /></div>
            <h3>Как читать результаты?</h3>
            <p>CHA₂DS₂-VASc оценивает риск инсульта и системной эмболии при ФП; пороги антикоагуляции зависят от пола согласно КР РФ 2025. HAS-BLED выявляет факторы риска кровотечения, многие из которых можно модифицировать.</p>
          </div>
          <div className="threshold-panel">
            <h3>КР РФ 2025 — CHA₂DS₂-VASc</h3>
            <p>Мужчины: 0 — низкий риск; 1 — рассмотреть антикоагуляцию; ≥2 — антикоагуляция рекомендована.</p>
            
            <p>Женщины: 1 — низкий риск; 2 — рассмотреть антикоагуляцию; ≥3 — антикоагуляция рекомендована.</p>
            <p>HAS-BLED ≥3: <b>повышенный риск кровотечения</b>; требуется оценка модифицируемых факторов, но не автоматический отказ от антикоагуляции.</p>
          </div>
        </aside>
      </div>

      {result && (
        <section className="result-panel" aria-live="polite">
          <div className="result-topline"><span className="panel-kicker">РЕЗУЛЬТАТ РАСЧЁТА</span><span className={`risk-tag ${result.cha2ds2VascCategory === 'low' ? 'risk-low' : result.cha2ds2VascCategory === 'consider' ? 'risk-moderate' : 'risk-high'}`}>CHA₂DS₂-VASc: {result.cha2ds2VascScore}</span></div>
          <div className="score-display"><strong>{result.cha2ds2VascScore}</strong><span>CHA₂DS₂-VASc</span></div>
          <p className="result-summary">{result.cha2ds2VascGuidance}</p>
          <div className="result-breakdown">
            <p><b>HAS-BLED: {result.hasBledScore}/9</b> — {result.hasBledHighRisk ? 'повышенный риск кровотечения (≥3)' : 'менее 3 баллов'}</p>
            <p>Интерпретация соответствует половым порогам CHA₂DS₂-VASc в КР РФ 2025.</p>
          </div>
          <div className="result-columns">
            <div><h3>CHA₂DS₂-VASc</h3>{result.chaComponents.map((component) => <p key={component.key}>{component.label}: <b>{component.value}</b> — {component.points} балл(а)</p>)}</div>
            <div><h3>HAS-BLED</h3>{result.hasBledComponents.map((component) => <p key={component.key}>{component.label}: <b>{component.value}</b> — {component.points} балл(а)</p>)}</div>
          </div>
          <p className="clinical-warning">HAS-BLED ≥3 не является противопоказанием к антикоагуляции и не должен использоваться для автоматического отказа или отмены лечения. Устраните модифицируемые факторы риска и проводите повторную оценку. КР РФ 2025 указывают, что HAS-BLED ≥3 — высокий риск кровотечения, но это не должно быть единственным ограничением к назначению антикоагулянтов. Корректируйте модифицируемые факторы риска и оценивайте источники кровотечения.</p>
        </section>
      )}

      <section className="reference-panel">
        <div><span className="panel-kicker">ИСТОЧНИК И МЕТОДИКА</span><h2>{CHA2DS2_VASc_HASBLED_REFERENCE.title}</h2><p>{CHA2DS2_VASc_HASBLED_REFERENCE.guideline} · {CHA2DS2_VASc_HASBLED_REFERENCE.section}</p></div>
        <a href={CHA2DS2_VASc_HASBLED_REFERENCE.url} target="_blank" rel="noreferrer">КР Минздрава РФ 2025 ↗</a><a href={CHA2DS2_VASc_HASBLED_REFERENCE.chaSourceUrl} target="_blank" rel="noreferrer">Валидация CHA₂DS₂-VASc ↗</a><a href={CHA2DS2_VASc_HASBLED_REFERENCE.hasBledSourceUrl} target="_blank" rel="noreferrer">Первоисточник HAS-BLED ↗</a>
        <small>Проверено: {CHA2DS2_VASc_HASBLED_REFERENCE.accessed}. {CHA2DS2_VASc_HASBLED_REFERENCE.notes[4]} {CHA2DS2_VASc_HASBLED_REFERENCE.notes[6]}</small>
      </section>
      <p className="calculator-disclaimer">Образовательный инструмент. Не заменяет индивидуальную оценку риска, противопоказаний и совместное принятие решений.</p>
    </main>
  )
}
