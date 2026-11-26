import { useState, type FormEvent } from 'react'
import { ArrowLeft, BookOpen, RotateCcw, ShieldAlert, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { calculateNEWS2, type NEWS2Input, type NEWS2Result } from './news2'
import { NEWS2_REFERENCE } from './news2.reference'

const initialValues = {
  respiratoryRate: '', spo2: '', spo2Scale: '' as '' | '1' | '2',
  supplementalOxygen: '' as '' | 'no' | 'yes', systolicBP: '', pulse: '',
  temperature: '', consciousness: '' as '' | NEWS2Input['consciousness'],
}

function NumberField({ label, unit, value, onChange, min, max, step = '1' }: {
  label: string; unit: string; value: string; onChange: (value: string) => void
  min: number; max: number; step?: string
}) {
  return <label className="calc-field"><span>{label} <small>{unit}</small></span>
    <input type="number" inputMode="decimal" min={min} max={max} step={step} placeholder={`Введите значение`} value={value} onChange={(event) => onChange(event.target.value)} required />
  </label>
}

export default function NEWS2Calculator() {
  const [values, setValues] = useState(initialValues)
  const [result, setResult] = useState<NEWS2Result | null>(null)
  const [error, setError] = useState('')

  function update<K extends keyof typeof initialValues>(key: K, value: typeof initialValues[K]) {
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
    if (Object.values(values).some((value) => value.trim() === '')) {
      setError('Заполните все числовые поля и выберите значения для шкалы SpO₂, кислородной поддержки и уровня сознания.')
      setResult(null)
      return
    }
    const numeric = [values.respiratoryRate, values.spo2, values.systolicBP, values.pulse, values.temperature].map(Number)
    if (numeric.some((value) => !Number.isFinite(value)) ||
      Number(values.respiratoryRate) < 0 || Number(values.respiratoryRate) > 100 ||
      Number(values.spo2) < 0 || Number(values.spo2) > 100 ||
      Number(values.systolicBP) < 0 || Number(values.systolicBP) > 300 ||
      Number(values.pulse) < 0 || Number(values.pulse) > 300 ||
      Number(values.temperature) < 25 || Number(values.temperature) > 45) {
      setError('Проверьте значения. Температура должна быть в диапазоне 25–45 °C, SpO₂ — 0–100%.')
      setResult(null)
      return
    }
    const input: NEWS2Input = {
      respiratoryRate: Number(values.respiratoryRate),
      spo2: Number(values.spo2),
      spo2Scale: values.spo2Scale === '2' ? 2 : 1,
      supplementalOxygen: values.supplementalOxygen === 'yes',
      systolicBP: Number(values.systolicBP),
      pulse: Number(values.pulse),
      temperature: Number(values.temperature),
      consciousness: values.consciousness,
    }
    setResult(calculateNEWS2(input))
    setError('')
  }

  return (
    <main className="app-shell calculator-shell">
      <div className="calculator-topline">
        <Link className="back-link" to="/"><ArrowLeft size={16} /> Все калькуляторы</Link>
        <span className="version-label">НЕОТЛОЖНАЯ МЕДИЦИНА · NEWS2</span>
      </div>
      <section className="calculator-heading">
        <div className="eyebrow"><span className="pulse-dot" /> РАННЕЕ ВЫЯВЛЕНИЕ УХУДШЕНИЯ</div>
        <h1>NEWS2</h1>
        <p>National Early Warning Score 2 — оценка физиологических параметров для выявления риска клинического ухудшения у взрослых.</p>
      </section>

      <div className="calculator-layout">
        <form className="calculator-panel" onSubmit={handleCalculate}>
          <div className="panel-heading">
            <div><span className="panel-kicker">ШАГ 1</span><h2>Физиологические параметры</h2></div>
            <span className="points-label">6 параметров + кислород</span>
          </div>
          <div className="field-grid">
            <NumberField label="Частота дыхания" unit="/мин" value={values.respiratoryRate} onChange={(v) => update('respiratoryRate', v)} min={0} max={100} />
            <NumberField label="SpO₂" unit="%" value={values.spo2} onChange={(v) => update('spo2', v)} min={0} max={100} />
            <NumberField label="Систолическое АД" unit="мм рт. ст." value={values.systolicBP} onChange={(v) => update('systolicBP', v)} min={0} max={300} />
            <NumberField label="Частота пульса" unit="/мин" value={values.pulse} onChange={(v) => update('pulse', v)} min={0} max={300} />
            <NumberField label="Температура" unit="°C" value={values.temperature} onChange={(v) => update('temperature', v)} min={25} max={45} step="0.1" />
          </div>

          <div className="news2-section">
            <div className="panel-heading"><div><span className="panel-kicker">ОЦЕНКА ОКСИГЕНАЦИИ</span><h2>Кислородная поддержка</h2></div></div>
            <div className="field-grid">
              <label className="calc-field"><span>Шкала SpO₂</span>
                <select required value={values.spo2Scale} onChange={(e) => update('spo2Scale', e.target.value as '1' | '2')}>
                  <option value="">Выберите шкалу</option>
                  <option value="1">Шкала 1 — стандартная</option>
                  <option value="2">Шкала 2 — целевая SpO₂ 88–92%</option>
                </select>
              </label>
              <label className="calc-field"><span>Дополнительный кислород</span>
                <select required value={values.supplementalOxygen} onChange={(e) => update('supplementalOxygen', e.target.value as 'no' | 'yes')}>
                  <option value="">Укажите вариант</option>
                  <option value="no">Нет — дыхание воздухом</option>
                  <option value="yes">Да — получает кислород</option>
                </select>
              </label>
            </div>
            <p className="field-hint">Все параметры и варианты кислородной поддержки необходимо указать вручную — калькулятор не подставляет значения пациента автоматически.</p>
            {values.spo2Scale === '2' && <p className="clinical-warning"><ShieldAlert size={14} /> Шкалу 2 применять только по решению квалифицированного специалиста при подтверждённой гиперкапнической дыхательной недостаточности и целевой SpO₂ 88–92%. Само наличие ХОБЛ не является достаточным основанием.</p>}
          </div>

          <div className="news2-section">
            <div className="panel-heading"><div><span className="panel-kicker">НЕВРОЛОГИЧЕСКИЙ СТАТУС</span><h2>Сознание (ACVPU)</h2></div><span className="points-label">0 или 3 балла</span></div>
            <label className="calc-field"><span>Уровень сознания</span>
              <select required value={values.consciousness} onChange={(e) => update('consciousness', e.target.value as NEWS2Input['consciousness'])}>
                <option value="">Выберите состояние</option>
                <option value="alert">A — бодрствует / обычное состояние (0)</option>
                <option value="new-confusion">Новое спутанное сознание (3)</option>
                <option value="voice">V — реагирует на голос (3)</option>
                <option value="pain">P — реагирует на боль (3)</option>
                <option value="unresponsive">U — не реагирует (3)</option>
              </select>
            </label>
            <p className="field-hint">Учитывается новое изменение сознания, включая спутанность, дезориентацию или возбуждение. Хроническое спутанное состояние без новых изменений не следует автоматически считать новым нарушением.</p>
          </div>

          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="calculator-actions">
            <button className="primary-button" type="submit">Рассчитать NEWS2</button>
            <button className="reset-button" type="button" onClick={reset}><RotateCcw size={15} /> Сбросить</button>
          </div>
          <p className="privacy-note"><ShieldCheck size={14} /> Данные не отправляются на сервер и не сохраняются.</p>
        </form>

        <aside className="calculator-aside">
          <div className="info-panel">
            <div className="info-icon"><BookOpen size={18} /></div>
            <h3>Что входит в NEWS2</h3>
            <ul>
              <li>Частота дыхания</li><li>Сатурация SpO₂</li><li>Систолическое АД</li><li>Частота пульса</li><li>Сознание / новое спутанное состояние</li><li>Температура</li><li>+2 балла за дополнительный кислород</li>
            </ul>
            <p>Каждый параметр оценивается отдельно. Баллы суммируются.</p>
          </div>
          <div className="threshold-panel">
            <h3>Пороговые значения</h3>
            <p><b>0:</b> рутинное наблюдение.</p>
            <p><b>1–4:</b> низкий риск по сумме.</p>
            <p><b>5–6:</b> средний риск, срочная клиническая оценка.</p>
            <p><b>≥7:</b> высокий риск, экстренная оценка.</p>
            <p><b>Любой отдельный параметр = 3:</b> требует срочного внимания независимо от суммы.</p>
          </div>
        </aside>
      </div>

      {result && <section className="result-panel" aria-live="polite">
        <div className="result-topline"><span className="panel-kicker">РЕЗУЛЬТАТ РАСЧЁТА</span><span className={`risk-tag ${result.riskLevel === 'high' ? 'risk-high' : result.riskLevel === 'medium' || result.hasSingleRedScore ? 'risk-intermediate' : 'risk-low'}`}>{result.riskLabel}</span></div>
        <div className="score-display"><strong>{result.score}</strong><span>баллов NEWS2</span></div>
        <div className="risk-meter"><span style={{ width: `${Math.min(result.score, 20) / 20 * 100}%` }} /></div>
        <div className={`care-context ${result.riskLevel === 'high' || result.hasSingleRedScore ? 'qsofa-positive' : ''}`}>
          <b>{result.hasSingleRedScore ? 'Есть критическое отклонение по одному параметру (3 балла)' : result.riskLabel}</b>
          <p>{result.interpretation}</p>
          <p><b>Предлагаемое реагирование:</b> {result.suggestedResponse}</p>
        </div>
        <h3>Разбор начисленных баллов</h3>
        <div className="criteria-list">
          {result.criteria.map((item) => <div className="criterion-row" key={item.key}>
            <span className={item.points > 0 ? 'criterion-point active' : 'criterion-point'}>{item.points ? `+${item.points}` : '0'}</span>
            <span><b>{item.label}</b><small>{item.value} · {item.explanation}</small></span>
            <span className="criterion-status">{item.points} б.</span>
          </div>)}
        </div>
        <p className="clinical-warning"><ShieldAlert size={14} /> NEWS2 — инструмент раннего выявления ухудшения, а не диагноз. Клиническое беспокойство должно иметь приоритет над числом баллов. Следуйте локальному протоколу эскалации; NEWS2 не заменяет клиническую оценку.</p>
      </section>}

      <section className="reference-panel">
        <div><span className="panel-kicker">ИСТОЧНИК И МЕТОДИКА</span><h2>{NEWS2_REFERENCE.title}</h2><p>{NEWS2_REFERENCE.originalSource}</p></div>
        <a href={NEWS2_REFERENCE.url} target="_blank" rel="noreferrer">Открыть материалы RCP ↗</a>
        <small>{NEWS2_REFERENCE.notes.join(' ')}</small>
      </section>
      <p className="calculator-disclaimer">Образовательный инструмент для взрослых пациентов. Не заменяет локальные протоколы наблюдения, клиническое решение или экстренную помощь.</p>
    </main>
  )
}
