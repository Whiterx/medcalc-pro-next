import { useState, type FormEvent } from 'react'
import { ArrowLeft, BookOpen, RotateCcw, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { calculateH2FPEF, type H2FPEFResult } from './h2fpef'
import { H2FPEF_REFERENCE } from './h2fpef.reference'

const initialValues = {
  ageYears: '',
  bmi: '',
  antihypertensiveCount: '',
  atrialFibrillation: '' as '' | 'none' | 'paroxysmal' | 'persistent',
  paspMmHg: '',
  eOverEPrime: '',
  lvefAtLeast50: false,
}

export default function H2FPEFCalculator() {
  const [values, setValues] = useState(initialValues)
  const [result, setResult] = useState<H2FPEFResult | null>(null)
  const [error, setError] = useState('')

  function updateField<K extends keyof typeof initialValues>(field: K, value: typeof initialValues[K]) {
    setValues((current) => ({ ...current, [field]: value }))
    setResult(null)
    setError('')
  }

  function handleCalculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if ([values.ageYears, values.bmi, values.antihypertensiveCount, values.atrialFibrillation, values.paspMmHg, values.eOverEPrime].some((value) => value === '')) {
      setError('Заполните все показатели и укажите статус фибрилляции предсердий.')
      setResult(null)
      return
    }
    try {
      setResult(calculateH2FPEF({
        ageYears: Number(values.ageYears),
        bmi: Number(values.bmi),
        antihypertensiveCount: Number(values.antihypertensiveCount),
        atrialFibrillation: values.atrialFibrillation as 'none' | 'paroxysmal' | 'persistent',
        paspMmHg: Number(values.paspMmHg),
        eOverEPrime: Number(values.eOverEPrime),
        lvefAtLeast50: values.lvefAtLeast50,
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
        <span className="version-label">КАРДИОЛОГИЯ · H₂FPEF</span>
      </div>

      <section className="calculator-heading">
        <div className="eyebrow"><span className="pulse-dot" /> ОЦЕНКА ВЕРОЯТНОСТИ СНсФВ</div>
        <h1>H₂FPEF Score</h1>
        <p>Оценка вероятности сердечной недостаточности с сохранённой фракцией выброса у пациентов с необъяснимой одышкой. Шесть критериев, 0–9 баллов.</p>
      </section>

      <div className="calculator-layout">
        <form className="calculator-panel" onSubmit={handleCalculate}>
          <div className="panel-heading">
            <div><span className="panel-kicker">ШАГ 1</span><h2>Клинические показатели</h2></div>
            <span className="points-label">4 критерия</span>
          </div>

          <div className="field-grid">
            <label className="calc-field">
              <span>Возраст <small>лет; балл при возрасте &gt;60</small></span>
              <input type="number" min="18" max="120" step="1" inputMode="numeric" placeholder="Введите возраст" value={values.ageYears} onChange={(event) => updateField('ageYears', event.target.value)} />
            </label>
            <label className="calc-field">
              <span>Индекс массы тела <small>кг/м²; 2 балла при ИМТ &gt;30</small></span>
              <input type="number" min="10" max="100" step="0.1" inputMode="decimal" placeholder="Введите ИМТ" value={values.bmi} onChange={(event) => updateField('bmi', event.target.value)} />
            </label>
            <label className="calc-field field-full">
              <span>Количество антигипертензивных препаратов <small>1 балл при ≥2 препаратах</small></span>
              <input type="number" min="0" max="30" step="1" inputMode="numeric" placeholder="Введите количество" value={values.antihypertensiveCount} onChange={(event) => updateField('antihypertensiveCount', event.target.value)} />
            </label>
          </div>

          <label className="calc-field field-full">
            <span>Фибрилляция предсердий <small>3 балла при пароксизмальной или персистирующей ФП</small></span>
            <select value={values.atrialFibrillation} onChange={(event) => updateField('atrialFibrillation', event.target.value as typeof initialValues.atrialFibrillation)}>
              <option value="">Не выбрано</option>
              <option value="none">Нет</option>
              <option value="paroxysmal">Пароксизмальная</option>
              <option value="persistent">Персистирующая</option>
            </select>
          </label>

          <div className="panel-heading panel-subheading">
            <div><span className="panel-kicker">ШАГ 2</span><h2>Эхокардиографические показатели</h2></div>
            <span className="points-label">2 критерия</span>
          </div>

          <div className="field-grid">
            <label className="calc-field">
              <span>СДЛА по ЭхоКГ <small>мм рт. ст.; балл при &gt;35</small></span>
              <input type="number" min="1" max="150" step="0.1" inputMode="decimal" placeholder="Введите СДЛА" value={values.paspMmHg} onChange={(event) => updateField('paspMmHg', event.target.value)} />
            </label>
            <label className="calc-field">
              <span>Отношение E/e′ <small>по допплер-ЭхоКГ; балл при &gt;9</small></span>
              <input type="number" min="0.1" max="50" step="0.1" inputMode="decimal" placeholder="Введите E/e′" value={values.eOverEPrime} onChange={(event) => updateField('eOverEPrime', event.target.value)} />
            </label>
          </div>

          <label className="check-field">
            <input type="checkbox" checked={values.lvefAtLeast50} onChange={(event) => updateField('lvefAtLeast50', event.target.checked)} />
            <span>Фракция выброса ЛЖ документирована и составляет ≥50%</span>
          </label>
          <p className="field-hint">Подтверждение ФВ ЛЖ ≥50% — обязательное условие применения шкалы, а не балльный критерий. Значения СДЛА и E/e′ берите из эхокардиографического заключения.</p>
          {error && <p className="form-error" role="alert">{error}</p>}

          <div className="calculator-actions">
            <button className="primary-button" type="submit">Рассчитать H₂FPEF</button>
            <button className="reset-button" type="button" onClick={reset}><RotateCcw size={15} /> Сбросить</button>
          </div>
          <p className="privacy-note"><ShieldCheck size={14} /> Данные не отправляются на сервер и не сохраняются.</p>
        </form>

        <aside className="calculator-aside">
          <div className="info-panel">
            <div className="info-icon"><BookOpen size={18} /></div>
            <h3>Что означает H₂FPEF?</h3>
            <p>Шкала объединяет клинические факторы и два показателя ЭхоКГ. Она помогает оценить вероятность СНсФВ и определить, нужна ли дальнейшая диагностика при необъяснимой одышке. Это не самостоятельный диагностический тест.</p>
          </div>
          <div className="threshold-panel">
            <h3>Интерпретация баллов</h3>
            <p>0–1 балл: <b>низкая вероятность</b></p>
            <p>2–5 баллов: <b>промежуточная вероятность</b></p>
            <p>6–9 баллов: <b>высокая вероятность</b></p>
            <p>Максимум: <b>9 баллов</b></p>
          </div>
        </aside>
      </div>

      {result && (
        <section className="result-panel" aria-live="polite">
          <div className="result-topline"><span className="panel-kicker">РЕЗУЛЬТАТ РАСЧЁТА</span><span className={`risk-tag ${result.category === 'low' ? 'risk-low' : result.category === 'intermediate' ? 'risk-moderate' : 'risk-high'}`}>{result.categoryLabel}</span></div>
          <div className="score-display"><strong>{result.score}</strong><span>из 9 баллов</span></div>
          <p className="result-summary">{result.interpretation}</p>
          <div className="result-breakdown">
            {result.components.map((component) => <p key={component.key}>{component.label}: <b>{component.value}</b> <span>— {component.points > 0 ? `+${component.points}` : '0'} баллов; критерий: {component.criterion}</span></p>)}
          </div>
          <p className="clinical-warning">Низкий балл не исключает СНсФВ при высокой клинической вероятности. При промежуточном результате может потребоваться дополнительное функциональное тестирование. Высокий балл не заменяет подтверждение диагноза. Учитывайте альтернативные причины одышки и ограничения исходной когорты.</p>
        </section>
      )}

      <section className="reference-panel">
        <div><span className="panel-kicker">ИСТОЧНИК И МЕТОДИКА</span><h2>{H2FPEF_REFERENCE.title}</h2><p>{H2FPEF_REFERENCE.guideline} · {H2FPEF_REFERENCE.section}</p></div>
        <a href={H2FPEF_REFERENCE.url} target="_blank" rel="noreferrer">Открыть источник ↗</a>
        <small>Публикация: {H2FPEF_REFERENCE.published}. Проверено: {H2FPEF_REFERENCE.accessed}. {H2FPEF_REFERENCE.notes[4]}</small>
      </section>
      <p className="calculator-disclaimer">Образовательный инструмент. Не заменяет клиническую оценку и не предназначен для самостоятельного установления диагноза.</p>
    </main>
  )
}
