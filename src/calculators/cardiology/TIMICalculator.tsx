import { useState, type FormEvent } from 'react'
import { ArrowLeft, BookOpen, RotateCcw, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { calculateTIMI, type TIMIResult } from './timi'
import { TIMI_REFERENCE } from './timi.reference'

const initialValues = {
  ageYears: '',
  coronaryRiskFactorCount: '',
  priorCoronaryStenosisAtLeast50: false,
  stDeviationAtLeast05mm: false,
  anginalEpisodesLast24h: '',
  aspirinUseLast7d: false,
  elevatedCardiacBiomarkers: false,
  assessmentConfirmed: false,
}

export default function TIMICalculator() {
  const [values, setValues] = useState(initialValues)
  const [result, setResult] = useState<TIMIResult | null>(null)
  const [error, setError] = useState('')

  function updateField<K extends keyof typeof initialValues>(field: K, value: typeof initialValues[K]) {
    setValues((current) => ({ ...current, [field]: value }))
    setResult(null)
    setError('')
  }

  function handleCalculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (values.ageYears === '' || values.coronaryRiskFactorCount === '' || values.anginalEpisodesLast24h === '') {
      setError('Заполните возраст, число факторов риска ИБС и число эпизодов стенокардии.')
      setResult(null)
      return
    }
    try {
      setResult(calculateTIMI({
        ageYears: Number(values.ageYears),
        coronaryRiskFactorCount: Number(values.coronaryRiskFactorCount),
        priorCoronaryStenosisAtLeast50: values.priorCoronaryStenosisAtLeast50,
        stDeviationAtLeast05mm: values.stDeviationAtLeast05mm,
        anginalEpisodesLast24h: Number(values.anginalEpisodesLast24h),
        aspirinUseLast7d: values.aspirinUseLast7d,
        elevatedCardiacBiomarkers: values.elevatedCardiacBiomarkers,
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
        <span className="version-label">КАРДИОЛОГИЯ · TIMI UA/NSTEMI</span>
      </div>

      <section className="calculator-heading">
        <div className="eyebrow"><span className="pulse-dot" /> РИСК ПРИ ОКС БЕЗ ПОДЪЁМА ST</div>
        <h1>TIMI Risk Score</h1>
        <p>Семь факторов риска для оценки 14-дневного комбинированного исхода при нестабильной стенокардии и NSTEMI. Диапазон — 0–7 баллов.</p>
      </section>

      <div className="calculator-layout">
        <form className="calculator-panel" onSubmit={handleCalculate}>
          <div className="panel-heading">
            <div><span className="panel-kicker">ШАГ 1</span><h2>Клинические факторы</h2></div>
            <span className="points-label">3 критерия</span>
          </div>

          <div className="field-grid">
            <label className="calc-field">
              <span>Возраст <small>лет; 1 балл при ≥65</small></span>
              <input type="number" min="18" max="120" step="1" inputMode="numeric" placeholder="Введите возраст" value={values.ageYears} onChange={(event) => updateField('ageYears', event.target.value)} />
            </label>
            <label className="calc-field">
              <span>Традиционные факторы риска ИБС <small>количество, 0–5</small></span>
              <input type="number" min="0" max="5" step="1" inputMode="numeric" placeholder="Введите количество" value={values.coronaryRiskFactorCount} onChange={(event) => updateField('coronaryRiskFactorCount', event.target.value)} />
            </label>
            <label className="calc-field field-full">
              <span>Эпизоды стенокардии за последние 24 часа <small>количество</small></span>
              <input type="number" min="0" max="100" step="1" inputMode="numeric" placeholder="Введите количество" value={values.anginalEpisodesLast24h} onChange={(event) => updateField('anginalEpisodesLast24h', event.target.value)} />
            </label>
          </div>
          <p className="field-hint">В число пяти традиционных факторов риска входят: семейный анамнез преждевременной ИБС, артериальная гипертензия, дислипидемия, сахарный диабет и текущее курение. Возраст учитывается отдельно.</p>

          <div className="panel-heading panel-subheading">
            <div><span className="panel-kicker">ШАГ 2</span><h2>Анамнез, ЭКГ и биомаркеры</h2></div>
            <span className="points-label">4 критерия</span>
          </div>

          <label className="check-field">
            <input type="checkbox" checked={values.priorCoronaryStenosisAtLeast50} onChange={(event) => updateField('priorCoronaryStenosisAtLeast50', event.target.checked)} />
            <span>Ранее документированный стеноз коронарной артерии ≥50%</span>
          </label>
          <label className="check-field">
            <input type="checkbox" checked={values.stDeviationAtLeast05mm} onChange={(event) => updateField('stDeviationAtLeast05mm', event.target.checked)} />
            <span>Отклонение сегмента ST ≥0,5 мм на исходной ЭКГ</span>
          </label>
          <label className="check-field">
            <input type="checkbox" checked={values.aspirinUseLast7d} onChange={(event) => updateField('aspirinUseLast7d', event.target.checked)} />
            <span>Приём аспирина в течение последних 7 дней</span>
          </label>
          <label className="check-field">
            <input type="checkbox" checked={values.elevatedCardiacBiomarkers} onChange={(event) => updateField('elevatedCardiacBiomarkers', event.target.checked)} />
            <span>Повышение исходных кардиальных биомаркеров</span>
          </label>

          <label className="check-field">
            <input type="checkbox" checked={values.assessmentConfirmed} onChange={(event) => updateField('assessmentConfirmed', event.target.checked)} />
            <span>Подтверждаю, что все семь факторов оценены; неотмеченные признаки отсутствуют</span>
          </label>
          <p className="field-hint">Не оставляйте неотмеченный фактор без оценки: флажок подтверждает полноту сбора анамнеза, ЭКГ и лабораторных данных. Шкала предназначена для нестабильной стенокардии/NSTEMI, не для STEMI.</p>
          {error && <p className="form-error" role="alert">{error}</p>}

          <div className="calculator-actions">
            <button className="primary-button" type="submit">Рассчитать TIMI</button>
            <button className="reset-button" type="button" onClick={reset}><RotateCcw size={15} /> Сбросить</button>
          </div>
          <p className="privacy-note"><ShieldCheck size={14} /> Данные не отправляются на сервер и не сохраняются.</p>
        </form>

        <aside className="calculator-aside">
          <div className="info-panel">
            <div className="info-icon"><BookOpen size={18} /></div>
            <h3>Что прогнозирует TIMI?</h3>
            <p>Комбинированный исход в течение 14 дней после рандомизации в исходном исследовании: смерть от любой причины, новый/повторный инфаркт миокарда или тяжёлая рецидивирующая ишемия, потребовавшая срочной реваскуляризации.</p>
          </div>
          <div className="threshold-panel">
            <h3>Категории риска</h3>
            <p>0–2 балла: <b>низкий</b></p>
            <p>3–4 балла: <b>промежуточный</b></p>
            <p>5–7 баллов: <b>высокий</b></p>
            <p>Максимум: <b>7 баллов</b></p>
          </div>
        </aside>
      </div>

      {result && (
        <section className="result-panel" aria-live="polite">
          <div className="result-topline"><span className="panel-kicker">РЕЗУЛЬТАТ РАСЧЁТА</span><span className={`risk-tag ${result.riskCategory === 'low' ? 'risk-low' : result.riskCategory === 'intermediate' ? 'risk-moderate' : 'risk-high'}`}>{result.riskLabel}</span></div>
          <div className="score-display"><strong>{result.score}</strong><span>из 7 баллов</span></div>
          <p className="result-summary">Частота комбинированного исхода в исходной исследовательской когорте за 14 дней: <b>{result.eventRatePercent.toFixed(1)}%</b>.</p>
          <div className="result-breakdown">
            {result.components.map((component) => <p key={component.key}>{component.label}: <b>{component.value}</b> <span>— {component.points > 0 ? '+1 балл' : '0 баллов'}</span></p>)}
          </div>
          <p className="clinical-warning">Это частота событий в исходной популяции исследования, а не индивидуально откалиброванный прогноз. Результат не заменяет клиническую оценку, серийные ЭКГ/биомаркеры и действующие рекомендации по ОКС.</p>
        </section>
      )}

      <section className="reference-panel">
        <div><span className="panel-kicker">ИСТОЧНИК И МЕТОДИКА</span><h2>{TIMI_REFERENCE.title}</h2><p>{TIMI_REFERENCE.guideline} · {TIMI_REFERENCE.section}</p></div>
        <a href={TIMI_REFERENCE.russianGuidelineUrl} target="_blank" rel="noreferrer">КР Минздрава РФ 2024 ↗</a><a href={TIMI_REFERENCE.url} target="_blank" rel="noreferrer">Исходная публикация Antman 2000 ↗</a>
        <small>Публикация: {TIMI_REFERENCE.published}. Проверено: {TIMI_REFERENCE.accessed}. {TIMI_REFERENCE.notes[7]}</small>
      </section>
      <p className="calculator-disclaimer">Образовательный инструмент. Не заменяет клиническую оценку и не предназначен для самостоятельного выбора тактики лечения.</p>
    </main>
  )
}
