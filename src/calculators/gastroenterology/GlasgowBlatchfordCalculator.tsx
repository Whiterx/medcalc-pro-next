import { useState, type FormEvent } from 'react'
import { ArrowLeft, BookOpen, RotateCcw, ShieldAlert, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { calculateGlasgowBlatchford, type GlasgowBlatchfordInput, type GlasgowBlatchfordResult } from './glasgowBlatchford'
import { GLASGOW_BLATCHFORD_REFERENCE } from './glasgowBlatchford.reference'

const initialValues = {
  ureaMmolL: '', hemoglobinGL: '', hemoglobinSex: '' as '' | 'male' | 'female',
  systolicBP: '', pulseBpm: '', melena: false, syncope: false, hepaticDisease: false, heartFailure: false,
}

export default function GlasgowBlatchfordCalculator() {
  const [values, setValues] = useState(initialValues)
  const [result, setResult] = useState<GlasgowBlatchfordResult | null>(null)
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
    if ([values.ureaMmolL, values.hemoglobinGL, values.hemoglobinSex, values.systolicBP, values.pulseBpm].some((value) => value === '')) {
      setError('Заполните мочевину, гемоглобин, пол для порогов гемоглобина, систолическое АД и ЧСС.')
      setResult(null)
      return
    }
    try {
      const input: GlasgowBlatchfordInput = {
        ureaMmolL: Number(values.ureaMmolL), hemoglobinGL: Number(values.hemoglobinGL),
        hemoglobinSex: values.hemoglobinSex as 'male' | 'female',
        systolicBP: Number(values.systolicBP), pulseBpm: Number(values.pulseBpm),
        melena: values.melena, syncope: values.syncope, hepaticDisease: values.hepaticDisease, heartFailure: values.heartFailure,
      }
      setResult(calculateGlasgowBlatchford(input))
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
        <span className="version-label">ГАСТРОЭНТЕРОЛОГИЯ · GBS</span>
      </div>
      <section className="calculator-heading">
        <div className="eyebrow"><span className="pulse-dot" /> ПРЕДЭНДОСКОПИЧЕСКАЯ ОЦЕНКА ЖКК</div>
        <h1>Glasgow-Blatchford Score</h1>
        <p>Оценка вероятности необходимости вмешательства при остром кровотечении из верхних отделов желудочно-кишечного тракта до эндоскопии.</p>
      </section>
      <div className="calculator-layout">
        <form className="calculator-panel" onSubmit={handleCalculate}>
          <div className="panel-heading"><div><span className="panel-kicker">ЛАБОРАТОРНЫЕ И ВИТАЛЬНЫЕ ПОКАЗАТЕЛИ</span><h2>Параметры при поступлении</h2></div><span className="points-label">0–23 балла</span></div>
          <div className="form-row">
            <label className="calc-field"><span>Мочевина, ммоль/л</span><input type="number" min="0.01" max="200" step="any" required value={values.ureaMmolL} onChange={(event) => updateField('ureaMmolL', event.target.value)} placeholder="Введите мочевину" /></label>
            <label className="calc-field"><span>Гемоглобин, г/л</span><input type="number" min="0.1" max="300" step="any" required value={values.hemoglobinGL} onChange={(event) => updateField('hemoglobinGL', event.target.value)} placeholder="Введите Hb" /></label>
          </div>
          <div className="form-row">
            <label className="calc-field"><span>Пол (для порогов Hb)</span><select required value={values.hemoglobinSex} onChange={(event) => updateField('hemoglobinSex', event.target.value as '' | 'male' | 'female')}><option value="">Выберите</option><option value="male">Мужской</option><option value="female">Женский</option></select></label>
            <label className="calc-field"><span>Систолическое АД, мм рт. ст.</span><input type="number" min="40" max="300" step="1" required value={values.systolicBP} onChange={(event) => updateField('systolicBP', event.target.value)} placeholder="Введите САД" /></label>
          </div>
          <label className="calc-field field-full"><span>Частота пульса, в минуту</span><input type="number" min="20" max="300" step="1" required value={values.pulseBpm} onChange={(event) => updateField('pulseBpm', event.target.value)} placeholder="Введите ЧСС" /></label>
          <div className="news2-section">
            <div className="panel-heading panel-subheading"><div><span className="panel-kicker">КЛИНИЧЕСКИЕ ПРИЗНАКИ</span><h2>Дополнительные параметры</h2></div></div>
            {([
              ['melena', 'Мелена', 1],
              ['syncope', 'Синкопе при поступлении', 2],
              ['hepaticDisease', 'Заболевание печени', 2],
              ['heartFailure', 'Сердечная недостаточность', 2],
            ] as const).map(([key, label, points]) => (
              <label className="form-check" key={key}>
                <input type="checkbox" className="form-check__input" checked={values[key]} onChange={(event) => updateField(key, event.target.checked)} />
                <span className="form-check__label">{label}</span>
                <span className="form-check__score">+{points}</span>
              </label>
            ))}
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="calculator-actions">
            <button className="primary-button" type="submit">Рассчитать GBS</button>
            <button className="reset-button" type="button" onClick={reset}><RotateCcw size={15} /> Сбросить</button>
          </div>
          <p className="privacy-note"><ShieldCheck size={14} /> Данные не отправляются на сервер и не сохраняются.</p>
        </form>
        <aside className="calculator-aside">
          <div className="info-panel"><div className="info-icon"><BookOpen size={18} /></div><h3>Предэндоскопическая шкала</h3><p>GBS использует данные первичной оценки до эндоскопии. Для гемоглобина применяются разные пороги в зависимости от пола.</p></div>
          <div className="threshold-panel"><h3>Порог очень низкого риска</h3><p><b>0–1 балл:</b> очень низкий риск по ACG 2021; у подходящих пациентов может рассматриваться амбулаторное ведение после клинической оценки.</p><p><b>≥2 баллов:</b> выше порога очень низкого риска; это не самостоятельная категория высокого риска.</p></div>
        </aside>
      </div>
      {result && (
        <section className="result-panel" aria-live="polite">
          <div className="result-topline"><span className="panel-kicker">РЕЗУЛЬТАТ РАСЧЁТА</span><span className="risk-tag risk-moderate">Glasgow-Blatchford</span></div>
          <div className="score-display"><strong>{result.score}</strong><span>из 23 баллов</span></div>
          <div className="result-summary"><b>{result.interpretation}</b></div>
          <h3>Разбор компонентов</h3>
          <div className="criteria-list">{result.components.map((item) => (
            <div className="criterion-row" key={item.key}><span className="criterion-point">{item.points}</span><span><b>{item.label}</b><small>{item.value} · {item.interpretation}</small></span><span className="criterion-status">{item.points} б.</span></div>
          ))}</div>
          <p className="clinical-warning"><ShieldAlert size={14} /> GBS не оценивает летальность и не заменяет оценку гемодинамики, продолжающегося кровотечения и сопутствующих причин госпитализации. Балл 0–1 не означает автоматическую выписку; балл ≥2 не означает автоматически необходимость трансфузии или интенсивной терапии.</p>
        </section>
      )}
      <section className="reference-panel">
        <div><span className="panel-kicker">ИСТОЧНИК И МЕТОДИКА</span><h2>{GLASGOW_BLATCHFORD_REFERENCE.title}</h2><p>{GLASGOW_BLATCHFORD_REFERENCE.originalSource}</p></div>
        <a href={GLASGOW_BLATCHFORD_REFERENCE.originalUrl} target="_blank" rel="noreferrer">Открыть оригинальную публикацию ↗</a>
        <small>{GLASGOW_BLATCHFORD_REFERENCE.guideline} · <a href={GLASGOW_BLATCHFORD_REFERENCE.guidelineUrl} target="_blank" rel="noreferrer">Рекомендации ACG ↗</a> Проверено: {GLASGOW_BLATCHFORD_REFERENCE.accessed}.</small>
      </section>
      <p className="calculator-disclaimer">Образовательный инструмент для оценки острого кровотечения из верхних отделов ЖКТ до эндоскопии. Не заменяет клиническое решение.</p>
    </main>
  )
}
