import { useState, type FormEvent } from 'react'
import { ArrowLeft, BookOpen, RotateCcw, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { calculatePSI, type PSIInput, type PSIResult } from './psi'
import { PSI_REFERENCE } from './psi.reference'

const initialValues = {
  age: '', sex: '', respiratoryRate: '', systolicBP: '', heartRate: '', temperatureC: '',
  bunUreaMmol: '', sodiumMmol: '', glucoseMmol: '', hematocritPercent: '', arterialPH: '',
}
const initialChecks = {
  nursingHome: false, neoplasticDisease: false, liverDisease: false, heartFailure: false,
  cerebrovascularDisease: false, renalDisease: false, alteredMentalStatus: false,
  hypoxemia: false, pleuralEffusion: false,
}

type ValueKey = keyof typeof initialValues
type CheckKey = keyof typeof initialChecks

export default function PSICalculator() {
  const [values, setValues] = useState(initialValues)
  const [checks, setChecks] = useState(initialChecks)
  const [result, setResult] = useState<PSIResult | null>(null)
  const [error, setError] = useState('')

  function updateValue(field: ValueKey, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setResult(null)
    setError('')
  }
  function updateCheck(field: CheckKey, value: boolean) {
    setChecks((current) => ({ ...current, [field]: value }))
    setResult(null)
    setError('')
  }

  function handleCalculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const stepOneFields: ValueKey[] = ['age', 'respiratoryRate', 'systolicBP', 'heartRate', 'temperatureC']
    const missing = stepOneFields.filter((key) => values[key].trim() === '')
    if (missing.length) {
      setError('Для первого этапа заполните возраст, ЧДД, систолическое АД, ЧСС и температуру.')
      setResult(null)
      return
    }

    const stepOne = {
      age: Number(values.age),
      sex: values.sex === 'female' ? 'female' as const : 'male' as const,
      respiratoryRate: Number(values.respiratoryRate),
      systolicBP: Number(values.systolicBP),
      heartRate: Number(values.heartRate),
      temperatureC: Number(values.temperatureC),
      ...checks,
      bunUreaMmol: values.bunUreaMmol.trim() === '' ? 5 : Number(values.bunUreaMmol),
      sodiumMmol: values.sodiumMmol.trim() === '' ? 140 : Number(values.sodiumMmol),
      glucoseMmol: values.glucoseMmol.trim() === '' ? 5 : Number(values.glucoseMmol),
      hematocritPercent: values.hematocritPercent.trim() === '' ? 40 : Number(values.hematocritPercent),
      arterialPH: values.arterialPH.trim() === '' ? 7.4 : Number(values.arterialPH),
    }

    try {
      const preliminary = calculatePSI(stepOne)
      if (preliminary.riskClass !== 'I') {
        const stepTwoFields: ValueKey[] = ['sex', 'bunUreaMmol', 'sodiumMmol', 'glucoseMmol', 'hematocritPercent', 'arterialPH']
        const missingStepTwo = stepTwoFields.filter((key) => values[key].trim() === '')
        if (missingStepTwo.length) {
          setError('Есть критерий перехода ко второму этапу. Для расчёта классов II–V выберите пол и заполните все лабораторные показатели.')
          setResult(null)
          return
        }
        const completeInput: PSIInput = {
          ...stepOne,
          sex: values.sex as 'male' | 'female',
          bunUreaMmol: Number(values.bunUreaMmol),
          sodiumMmol: Number(values.sodiumMmol),
          glucoseMmol: Number(values.glucoseMmol),
          hematocritPercent: Number(values.hematocritPercent),
          arterialPH: Number(values.arterialPH),
        }
        setResult(calculatePSI(completeInput))
      } else {
        setResult(preliminary)
      }
      setError('')
    } catch (caught) {
      setResult(null)
      setError(caught instanceof Error ? caught.message : 'Проверьте введённые значения.')
    }
  }

  function reset() {
    setValues(initialValues)
    setChecks(initialChecks)
    setResult(null)
    setError('')
  }

  const check = (field: CheckKey, label: string, points?: string) => (
    <label className="form-check" key={field}>
      <input type="checkbox" className="form-check__input" checked={checks[field]} onChange={(event) => updateCheck(field, event.target.checked)} />
      <span className="form-check__label">{label}</span>
      {points && <span className="form-check__score">{points}</span>}
    </label>
  )

  return (
    <main className="app-shell calculator-shell">
      <div className="calculator-topline">
        <Link className="back-link" to="/"><ArrowLeft size={16} /> Все калькуляторы</Link>
        <span className="version-label">ПУЛЬМОНОЛОГИЯ · PSI / PORT</span>
      </div>

      <section className="calculator-heading">
        <div className="eyebrow"><span className="pulse-dot" /> ВНЕБОЛЬНИЧНАЯ ПНЕВМОНИЯ · ВЗРОСЛЫЕ</div>
        <h1>PSI / PORT</h1>
        <p>Двухэтапная оценка риска 30-дневной смертности при внебольничной пневмонии для поддержки решения о месте лечения.</p>
      </section>

      <div className="calculator-layout">
        <form className="calculator-panel" onSubmit={handleCalculate}>
          <div className="panel-heading">
            <div><span className="panel-kicker">ШАГ 1</span><h2>Возраст и клинические показатели</h2></div>
            <span className="points-label">5 показателей</span>
          </div>
          <div className="field-grid">
            <label className="calc-field"><span>Возраст <small>лет, только взрослые</small></span><input type="number" min="18" max="120" step="1" inputMode="numeric" placeholder="Например, 67" value={values.age} onChange={(e) => updateValue('age', e.target.value)} /></label>
            <label className="calc-field"><span>Пол <small>для возрастного балла шага 2</small></span><select value={values.sex} onChange={(e) => updateValue('sex', e.target.value)}><option value="">Не выбрано</option><option value="male">Мужской</option><option value="female">Женский (−10 баллов)</option></select></label>
            <label className="calc-field"><span>ЧДД <small>в минуту</small></span><input type="number" min="1" max="100" step="1" inputMode="numeric" placeholder="Например, 24" value={values.respiratoryRate} onChange={(e) => updateValue('respiratoryRate', e.target.value)} /></label>
            <label className="calc-field"><span>Систолическое АД <small>мм рт. ст.</small></span><input type="number" min="1" max="300" step="1" inputMode="numeric" placeholder="Например, 118" value={values.systolicBP} onChange={(e) => updateValue('systolicBP', e.target.value)} /></label>
            <label className="calc-field"><span>ЧСС <small>в минуту</small></span><input type="number" min="1" max="300" step="1" inputMode="numeric" placeholder="Например, 92" value={values.heartRate} onChange={(e) => updateValue('heartRate', e.target.value)} /></label>
            <label className="calc-field"><span>Температура <small>°C</small></span><input type="number" min="25" max="45" step="0.1" inputMode="decimal" placeholder="Например, 38.2" value={values.temperatureC} onChange={(e) => updateValue('temperatureC', e.target.value)} /></label>
          </div>

          <h3 className="form-section-title">Сопутствующие заболевания и состояние</h3>
          <p className="field-hint">Отметьте только присутствующие признаки. Неотмеченный пункт означает отсутствие соответствующего фактора.</p>
          {check('neoplasticDisease', 'Онкологическое заболевание', '+30')}
          {check('liverDisease', 'Заболевание печени', '+20')}
          {check('heartFailure', 'Хроническая сердечная недостаточность', '+10')}
          {check('cerebrovascularDisease', 'Цереброваскулярное заболевание', '+10')}
          {check('renalDisease', 'Заболевание почек', '+10')}
          {check('alteredMentalStatus', 'Нарушение сознания', '+20')}

          <div className="field-hint">Если на первом этапе нет ни одного критерия риска, присваивается класс I. Для классов II–V потребуется заполнить пол и лабораторно-рентгенологические показатели ниже.</div>

          <h3 className="form-section-title">Шаг 2 · Дополнительные факторы</h3>
          {check('nursingHome', 'Проживание в учреждении длительного ухода', '+10')}
          {check('hypoxemia', 'PaO₂ <60 мм рт. ст. или SpO₂ <90%', '+10')}
          {check('pleuralEffusion', 'Плевральный выпот на рентгенограмме', '+10')}

          <div className="field-grid">
            <label className="calc-field"><span>Мочевина <small>ммоль/л, порог ≥11</small></span><input type="number" min="0" max="100" step="0.1" inputMode="decimal" placeholder="Например, 6.2" value={values.bunUreaMmol} onChange={(e) => updateValue('bunUreaMmol', e.target.value)} /></label>
            <label className="calc-field"><span>Натрий <small>ммоль/л, порог &lt;130</small></span><input type="number" min="80" max="200" step="0.1" inputMode="decimal" placeholder="Например, 138" value={values.sodiumMmol} onChange={(e) => updateValue('sodiumMmol', e.target.value)} /></label>
            <label className="calc-field"><span>Глюкоза <small>ммоль/л, порог ≥14</small></span><input type="number" min="0" max="100" step="0.1" inputMode="decimal" placeholder="Например, 7.1" value={values.glucoseMmol} onChange={(e) => updateValue('glucoseMmol', e.target.value)} /></label>
            <label className="calc-field"><span>Гематокрит <small>%, порог &lt;30</small></span><input type="number" min="0" max="80" step="0.1" inputMode="decimal" placeholder="Например, 38" value={values.hematocritPercent} onChange={(e) => updateValue('hematocritPercent', e.target.value)} /></label>
            <label className="calc-field field-full"><span>Артериальный pH <small>порог &lt;7,35</small></span><input type="number" min="6.8" max="7.8" step="0.01" inputMode="decimal" placeholder="Например, 7.40" value={values.arterialPH} onChange={(e) => updateValue('arterialPH', e.target.value)} /></label>
          </div>

          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="calculator-actions">
            <button className="primary-button" type="submit">Рассчитать PSI</button>
            <button className="reset-button" type="button" onClick={reset}><RotateCcw size={15} /> Сбросить</button>
          </div>
          <p className="privacy-note"><ShieldCheck size={14} /> Данные не отправляются на сервер и не сохраняются.</p>
        </form>

        <aside className="calculator-aside">
          <div className="info-panel">
            <div className="info-icon"><BookOpen size={18} /></div>
            <h3>Как работает PSI?</h3>
            <p>Сначала проверяются 11 критериев шага 1. При отсутствии всех критериев пациент относится к классу I. При наличии хотя бы одного критерия рассчитывается балл шага 2 с учётом возраста, пола, сопутствующих заболеваний, физиологических и лабораторных показателей.</p>
          </div>
          <div className="threshold-panel">
            <h3>Классы риска</h3>
            <p>Класс I: <b>шаг 1, без балльной суммы</b></p>
            <p>Класс II: <b>≤70 баллов</b></p>
            <p>Класс III: <b>71–90 баллов</b></p>
            <p>Класс IV: <b>91–130 баллов</b></p>
            <p>Класс V: <b>&gt;130 баллов</b></p>
            <p>PSI оценивает риск смертности, а не необходимость ОРИТ.</p>
          </div>
        </aside>
      </div>

      {result && (
        <section className="result-panel" aria-live="polite">
          <div className="result-topline"><span className="panel-kicker">РЕЗУЛЬТАТ РАСЧЁТА</span><span className={`risk-tag risk-${result.riskClass === 'I' || result.riskClass === 'II' ? 'low' : result.riskClass === 'III' ? 'moderate' : 'high'}`}>{result.classLabel}</span></div>
          <div className="score-display"><strong>{result.score === null ? 'I' : result.score}</strong><span>{result.score === null ? 'класс I, без расчёта баллов' : `баллов · класс ${result.riskClass}`}</span></div>
          <p className="mortality-estimate">{result.mortalityEstimate}</p>
          <p className="clinical-warning">{result.suggestedSetting} PSI не является индивидуальной вероятностью исхода и не определяет необходимость перевода в ОРИТ. Клиническое решение должно учитывать стабильность пациента, сопутствующие заболевания и социальные условия.</p>
          {result.stepOneTriggers.length > 0 && <div className="result-breakdown"><p><b>Критерии перехода к шагу 2:</b></p>{result.stepOneTriggers.map((item) => <p key={item}>{item}</p>)}</div>}
          {result.components.length > 0 && <div className="result-breakdown"><p><b>Разбор начисленных баллов:</b></p>{result.components.map((item) => <p key={item.key}>{item.label}: <b>+{item.points}</b> <span>({item.detail})</span></p>)}</div>}
        </section>
      )}

      <section className="reference-panel">
        <div><span className="panel-kicker">ИСТОЧНИК И МЕТОДИКА</span><h2>{PSI_REFERENCE.title}</h2><p>{PSI_REFERENCE.guideline}</p></div>
        <a href={PSI_REFERENCE.url} target="_blank" rel="noreferrer">Открыть оригинальную публикацию ↗</a>
        <small>{PSI_REFERENCE.notes[4]} <a href={PSI_REFERENCE.guidelineUrl} target="_blank" rel="noreferrer">ATS/IDSA 2019 ↗</a> Проверено: {PSI_REFERENCE.accessed}.</small>
      </section>
      <p className="calculator-disclaimer">Образовательный инструмент. PSI предназначен для взрослых с внебольничной пневмонией; не используйте его изолированно для решения о выписке, госпитализации или переводе в ОРИТ.</p>
    </main>
  )
}
