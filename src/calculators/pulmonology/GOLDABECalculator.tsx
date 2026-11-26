import { useState, type FormEvent } from 'react'
import { ArrowLeft, BookOpen, RotateCcw, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { calculateGOLDABE, type GOLDABEResult, type GOLDSymptomMethod } from './goldAbe'
import { GOLD_ABE_REFERENCE } from './goldAbe.reference'

const initialValues = {
  fev1FvcPercent: '',
  fev1PercentPredicted: '',
  moderateOrSevereExacerbations: '',
  symptomMethod: '' as '' | GOLDSymptomMethod,
  symptomScore: '',
}

const mmrcOptions = [
  'Одышка только при значительной физической нагрузке',
  'Одышка при быстрой ходьбе по ровной местности или подъёме на небольшой холм',
  'Иду медленнее сверстников из-за одышки или останавливаюсь при ходьбе в обычном темпе',
  'Останавливаюсь из-за одышки примерно через 100 м или через несколько минут ходьбы',
  'Одышка не позволяет выходить из дома или возникает при одевании/раздевании',
]

export default function GOLDABECalculator() {
  const [values, setValues] = useState(initialValues)
  const [result, setResult] = useState<GOLDABEResult | null>(null)
  const [error, setError] = useState('')

  function updateField<K extends keyof typeof initialValues>(field: K, value: typeof initialValues[K]) {
    setValues((current) => ({ ...current, [field]: value }))
    setResult(null)
    setError('')
  }

  function handleCalculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (Object.values(values).some((value) => value.trim() === '')) {
      setError('Заполните все поля и выберите метод оценки симптомов.')
      setResult(null)
      return
    }
    try {
      setResult(calculateGOLDABE({
        fev1FvcPercent: Number(values.fev1FvcPercent),
        fev1PercentPredicted: Number(values.fev1PercentPredicted),
        moderateOrSevereExacerbations: Number(values.moderateOrSevereExacerbations),
        symptomMethod: values.symptomMethod as GOLDSymptomMethod,
        symptomScore: Number(values.symptomScore),
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
        <span className="version-label">ПУЛЬМОНОЛОГИЯ · GOLD ABE</span>
      </div>

      <section className="calculator-heading">
        <div className="eyebrow"><span className="pulse-dot" /> КЛАССИФИКАЦИЯ ХОБЛ</div>
        <h1>GOLD ABE</h1>
        <p>Раздельная оценка спирометрической степени ограничения воздушного потока (GOLD 1–4) и клинической группы A/B/E по симптомам и обострениям. Методика GOLD 2027.</p>
      </section>

      <div className="calculator-layout">
        <form className="calculator-panel" onSubmit={handleCalculate}>
          <div className="panel-heading">
            <div><span className="panel-kicker">ШАГ 1</span><h2>Постбронходилатационная спирометрия</h2></div>
            <span className="points-label">2 показателя</span>
          </div>

          <div className="field-grid">
            <label className="calc-field">
              <span>ОФВ₁/ФЖЕЛ <small>% после бронходилататора</small></span>
              <input type="number" min="10" max="150" step="0.1" inputMode="decimal" placeholder="Например, 62.5" value={values.fev1FvcPercent} onChange={(event) => updateField('fev1FvcPercent', event.target.value)} />
            </label>
            <label className="calc-field">
              <span>ОФВ₁ <small>% от должного, после бронходилататора</small></span>
              <input type="number" min="1" max="200" step="0.1" inputMode="decimal" placeholder="Например, 55" value={values.fev1PercentPredicted} onChange={(event) => updateField('fev1PercentPredicted', event.target.value)} />
            </label>
          </div>

          <div className="panel-heading panel-subheading">
            <div><span className="panel-kicker">ШАГ 2</span><h2>Симптомы и обострения за 12 месяцев</h2></div>
            <span className="points-label">2 показателя</span>
          </div>

          <label className="calc-field field-full">
            <span>Метод оценки симптомов</span>
            <select value={values.symptomMethod} onChange={(event) => {
              const method = event.target.value as '' | GOLDSymptomMethod
              setValues((current) => ({ ...current, symptomMethod: method, symptomScore: '' }))
              setResult(null)
              setError('')
            }}>
              <option value="">Не выбрано</option>
              <option value="mmrc">mMRC (степень одышки 0–4)</option>
              <option value="caat">CAAT™ (ранее CAT, 0–40 баллов)</option>
            </select>
          </label>

          {values.symptomMethod === 'mmrc' && (
            <label className="calc-field field-full">
              <span>Оценка одышки по mMRC</span>
              <select value={values.symptomScore} onChange={(event) => updateField('symptomScore', event.target.value)}>
                <option value="">Не выбрано</option>
                {mmrcOptions.map((description, index) => <option value={String(index)} key={index}>Степень {index} — {description}</option>)}
              </select>
            </label>
          )}

          {values.symptomMethod === 'caat' && (
            <label className="calc-field field-full">
              <span>Общий балл CAAT™ <small>0–40 баллов</small></span>
              <input type="number" min="0" max="40" step="1" inputMode="numeric" placeholder="Введите итоговый балл" value={values.symptomScore} onChange={(event) => updateField('symptomScore', event.target.value)} />
            </label>
          )}

          <label className="calc-field field-full">
            <span>Умеренные или тяжёлые обострения за последние 12 месяцев <small>Количество эпизодов, 0–100</small></span>
            <input type="number" min="0" max="100" step="1" inputMode="numeric" placeholder="Например, 1" value={values.moderateOrSevereExacerbations} onChange={(event) => updateField('moderateOrSevereExacerbations', event.target.value)} />
          </label>

          <p className="field-hint">Для группы E по GOLD 2027 достаточно ≥1 умеренного или тяжёлого обострения за предыдущие 12 месяцев — независимо от симптомов. Используйте клинически классифицированные эпизоды, а не только факт госпитализации или назначенное лечение.</p>
          {error && <p className="form-error" role="alert">{error}</p>}

          <div className="calculator-actions">
            <button className="primary-button" type="submit">Рассчитать GOLD ABE</button>
            <button className="reset-button" type="button" onClick={reset}><RotateCcw size={15} /> Сбросить</button>
          </div>
          <p className="privacy-note"><ShieldCheck size={14} /> Данные не отправляются на сервер и не сохраняются.</p>
        </form>

        <aside className="calculator-aside">
          <div className="info-panel">
            <div className="info-icon"><BookOpen size={18} /></div>
            <h3>Два независимых результата</h3>
            <p>GOLD 1–4 описывает степень ограничения воздушного потока по ОФВ₁. Группа A/B/E определяется симптомной нагрузкой и историей умеренных/тяжёлых обострений. Степень GOLD не участвует в присвоении группы A/B/E.</p>
          </div>
          <div className="threshold-panel">
            <h3>Пороговые значения</h3>
            <p>Обструкция: <b>ОФВ₁/ФЖЕЛ &lt;0,70</b></p>
            <p>GOLD 1: <b>ОФВ₁ ≥80%</b></p>
            <p>GOLD 2: <b>50–79%</b></p>
            <p>GOLD 3: <b>30–49%</b></p>
            <p>GOLD 4: <b>&lt;30%</b></p>
            <p>Высокая симптомная нагрузка: <b>mMRC ≥2 или CAAT ≥10</b></p>
          </div>
        </aside>
      </div>

      {result && (
        <section className="result-panel" aria-live="polite">
          <div className="result-topline"><span className="panel-kicker">РЕЗУЛЬТАТ РАСЧЁТА</span><span className={`risk-tag ${!result.spirometricObstruction ? 'risk-moderate' : result.group === 'E' ? 'risk-high' : result.group === 'B' ? 'risk-moderate' : 'risk-low'}`}>{!result.spirometricObstruction ? 'Обструкция не подтверждена' : `Группа ${result.group}`}</span></div>
          {result.spirometricObstruction && <div className="score-display"><strong>GOLD {result.grade}</strong><span>степень ограничения воздушного потока</span></div>}
          {!result.spirometricObstruction && <p className="clinical-warning">{result.explanation}</p>}
          {result.spirometricObstruction && <p className="result-summary">{result.explanation}</p>}
          <div className="result-breakdown">
            {result.components.map((component) => <p key={component.label}>{component.label}: <b>{component.value}</b> <span>— {component.interpretation}</span></p>)}
          </div>
          <p className="clinical-warning">Группа A/B/E предназначена для комбинированной первоначальной оценки и не является самостоятельным алгоритмом назначения лечения. Учитывайте клиническую картину, коморбидность, предшествующую терапию и актуальные локальные рекомендации.</p>
        </section>
      )}

      <section className="reference-panel">
        <div><span className="panel-kicker">ИСТОЧНИК И МЕТОДИКА</span><h2>{GOLD_ABE_REFERENCE.title}</h2><p>{GOLD_ABE_REFERENCE.guideline} · {GOLD_ABE_REFERENCE.section}</p></div>
        <a href={GOLD_ABE_REFERENCE.url} target="_blank" rel="noreferrer">Открыть источник ↗</a>
        <small>Публикация: {GOLD_ABE_REFERENCE.published}. Проверено: {GOLD_ABE_REFERENCE.accessed}. {GOLD_ABE_REFERENCE.notes[4]}</small>
      </section>
      <p className="calculator-disclaimer">Образовательный инструмент. Не заменяет клиническую оценку и не предназначен для самостоятельного выбора лечебной тактики.</p>
    </main>
  )
}
