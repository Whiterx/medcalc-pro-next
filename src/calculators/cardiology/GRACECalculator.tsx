import { useState, type FormEvent } from 'react'
import { ArrowLeft, BookOpen, RotateCcw, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { calculateGRACE, type GRACEResult } from './grace'
import { GRACE_REFERENCE } from './grace.reference'

const initialValues = {
  ageYears: '',
  heartRate: '',
  systolicBP: '',
  creatinineUmolL: '',
  killipClass: '',
  cardiacArrestAtAdmission: false,
  stSegmentDeviation: false,
  elevatedCardiacBiomarkers: false,
}

export default function GRACECalculator() {
  const [values, setValues] = useState(initialValues)
  const [result, setResult] = useState<GRACEResult | null>(null)
  const [error, setError] = useState('')

  function updateField<K extends keyof typeof initialValues>(field: K, value: typeof initialValues[K]) {
    setValues((current) => ({ ...current, [field]: value }))
    setResult(null)
    setError('')
  }

  function handleCalculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if ([values.ageYears, values.heartRate, values.systolicBP, values.creatinineUmolL, values.killipClass].some((value) => value === '')) {
      setError('Заполните все пять обязательных показателей и выберите класс Killip.')
      setResult(null)
      return
    }
    try {
      setResult(calculateGRACE({
        ageYears: Number(values.ageYears),
        heartRate: Number(values.heartRate),
        systolicBP: Number(values.systolicBP),
        creatinineUmolL: Number(values.creatinineUmolL),
        killipClass: Number(values.killipClass) as 1 | 2 | 3 | 4,
        cardiacArrestAtAdmission: values.cardiacArrestAtAdmission,
        stSegmentDeviation: values.stSegmentDeviation,
        elevatedCardiacBiomarkers: values.elevatedCardiacBiomarkers,
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
        <span className="version-label">КАРДИОЛОГИЯ · GRACE</span>
      </div>

      <section className="calculator-heading">
        <div className="eyebrow"><span className="pulse-dot" /> РИСК ПРИ ОСТРОМ КОРОНАРНОМ СИНДРОМЕ</div>
        <h1>GRACE Score</h1>
        <p>Балльная оценка риска госпитальной летальности при остром коронарном синдроме. Восемь исходных предикторов, включая клинические, ЭКГ- и лабораторные данные.</p>
      </section>

      <div className="calculator-layout">
        <form className="calculator-panel" onSubmit={handleCalculate}>
          <div className="panel-heading">
            <div><span className="panel-kicker">ШАГ 1</span><h2>Показатели при поступлении</h2></div>
            <span className="points-label">5 параметров</span>
          </div>

          <div className="field-grid">
            <label className="calc-field">
              <span>Возраст <small>лет</small></span>
              <input type="number" min="18" max="120" step="1" inputMode="numeric" placeholder="Введите возраст" value={values.ageYears} onChange={(event) => updateField('ageYears', event.target.value)} />
            </label>
            <label className="calc-field">
              <span>Частота сердечных сокращений <small>уд/мин</small></span>
              <input type="number" min="1" max="300" step="1" inputMode="numeric" placeholder="Введите ЧСС" value={values.heartRate} onChange={(event) => updateField('heartRate', event.target.value)} />
            </label>
            <label className="calc-field">
              <span>Систолическое АД <small>мм рт. ст.</small></span>
              <input type="number" min="1" max="300" step="1" inputMode="numeric" placeholder="Введите САД" value={values.systolicBP} onChange={(event) => updateField('systolicBP', event.target.value)} />
            </label>
            <label className="calc-field">
              <span>Креатинин <small>мкмоль/л</small></span>
              <input type="number" min="0" max="2000" step="0.1" inputMode="decimal" placeholder="Введите креатинин" value={values.creatinineUmolL} onChange={(event) => updateField('creatinineUmolL', event.target.value)} />
            </label>
          </div>

          <label className="calc-field field-full">
            <span>Класс Killip <small>сердечная недостаточность при поступлении</small></span>
            <select value={values.killipClass} onChange={(event) => updateField('killipClass', event.target.value)}>
              <option value="">Не выбрано</option>
              <option value="1">I — нет клинических признаков СН</option>
              <option value="2">II — хрипы в нижних отделах лёгких и/или S₃</option>
              <option value="3">III — отёк лёгких</option>
              <option value="4">IV — кардиогенный шок</option>
            </select>
          </label>

          <div className="panel-heading panel-subheading">
            <div><span className="panel-kicker">ШАГ 2</span><h2>Дополнительные предикторы</h2></div>
            <span className="points-label">3 параметра</span>
          </div>

          <label className="check-field">
            <input type="checkbox" checked={values.cardiacArrestAtAdmission} onChange={(event) => updateField('cardiacArrestAtAdmission', event.target.checked)} />
            <span>Остановка сердца при поступлении / во время презентации (+39)</span>
          </label>
          <label className="check-field">
            <input type="checkbox" checked={values.stSegmentDeviation} onChange={(event) => updateField('stSegmentDeviation', event.target.checked)} />
            <span>Отклонение сегмента ST на исходной ЭКГ (+28)</span>
          </label>
          <label className="check-field">
            <input type="checkbox" checked={values.elevatedCardiacBiomarkers} onChange={(event) => updateField('elevatedCardiacBiomarkers', event.target.checked)} />
            <span>Повышение исходных кардиальных биомаркеров / ферментов (+14)</span>
          </label>
          <p className="field-hint">Отмечайте только подтверждённые признаки. Выключенный флажок означает отсутствие соответствующего предиктора. Остановка сердца — отдельный критерий и не заменяет класс Killip IV.</p>
          {error && <p className="form-error" role="alert">{error}</p>}

          <div className="calculator-actions">
            <button className="primary-button" type="submit">Рассчитать GRACE</button>
            <button className="reset-button" type="button" onClick={reset}><RotateCcw size={15} /> Сбросить</button>
          </div>
          <p className="privacy-note"><ShieldCheck size={14} /> Данные не отправляются на сервер и не сохраняются.</p>
        </form>

        <aside className="calculator-aside">
          <div className="info-panel">
            <div className="info-icon"><BookOpen size={18} /></div>
            <h3>Что оценивает GRACE?</h3>
            <p>Исходная модель GRACE разработана для оценки госпитальной летальности при всём спектре ОКС. Она объединяет возраст, ЧСС, САД, креатинин, Killip, остановку сердца, отклонение ST и исходные кардиальные биомаркеры.</p>
          </div>
          <div className="threshold-panel">
            <h3>Категории балльного риска</h3>
            <p>≤108 баллов: <b>низкий</b></p>
            <p>109–140 баллов: <b>промежуточный</b></p>
            <p>&gt;140 баллов: <b>высокий</b></p>
            <p>Речь идёт о <b>госпитальной летальности</b>, не о шестимесячном риске.</p>
          </div>
        </aside>
      </div>

      {result && (
        <section className="result-panel" aria-live="polite">
          <div className="result-topline"><span className="panel-kicker">РЕЗУЛЬТАТ РАСЧЁТА</span><span className={`risk-tag ${result.riskCategory === 'low' ? 'risk-low' : result.riskCategory === 'intermediate' ? 'risk-moderate' : 'risk-high'}`}>{result.riskLabel}</span></div>
          <div className="score-display"><strong>{result.score}</strong><span>баллов GRACE</span></div>
          <p className="result-summary">{result.riskDescription}</p>
          <div className="result-breakdown">
            {result.components.map((component) => <p key={component.key}>{component.label}: <b>{component.value}</b> <span>— {component.points > 0 ? `+${component.points}` : '0'} баллов</span></p>)}
          </div>
          <p className="clinical-warning">Это балльная категория риска госпитальной летальности по исходной модели GRACE. Процент риска и шестимесячная летальность здесь не рассчитываются: для них применяются отдельные модели/номограммы. Результат не заменяет клиническую оценку и действующие рекомендации по ОКС.</p>
        </section>
      )}

      <section className="reference-panel">
        <div><span className="panel-kicker">ИСТОЧНИК И МЕТОДИКА</span><h2>{GRACE_REFERENCE.title}</h2><p>{GRACE_REFERENCE.guideline} · {GRACE_REFERENCE.section}</p></div>
        <a href={GRACE_REFERENCE.url} target="_blank" rel="noreferrer">Открыть источник ↗</a>
        <small>Публикация: {GRACE_REFERENCE.published}. Проверено: {GRACE_REFERENCE.accessed}. {GRACE_REFERENCE.notes[4]}</small>
      </section>
      <p className="calculator-disclaimer">Образовательный инструмент. Не заменяет клиническую оценку и не предназначен для самостоятельного выбора тактики лечения.</p>
    </main>
  )
}
