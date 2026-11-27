import { useState, type FormEvent } from 'react'
import { ArrowLeft, BookOpen, RotateCcw, ShieldAlert, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { calculateNEWS2, type NEWS2Input, type NEWS2Result, type NEWS2MissingDataReason } from './news2'
import { NEWS2_REFERENCE } from './news2.reference'

const initialValues = {
  respiratoryRate: '', spo2: '', spo2Scale: '' as '' | '1' | '2',
  supplementalOxygen: '' as '' | 'no' | 'yes', systolicBP: '', pulse: '',
  temperature: '', consciousness: '' as '' | NEWS2Input['consciousness'],
  scale2Confirmed: false, missingDataReason: '' as '' | NEWS2MissingDataReason,
}

type NEWS2FormValues = typeof initialValues

function hasMissingValues(values: NEWS2FormValues): boolean {
  return values.respiratoryRate === '' || values.spo2 === '' || values.spo2Scale === '' ||
    values.supplementalOxygen === '' || values.systolicBP === '' || values.pulse === '' ||
    values.temperature === '' || values.consciousness === ''
}

function NumberField({ label, unit, value, onChange, min, max, step = '1' }: {
  label: string; unit: string; value: string; onChange: (value: string) => void
  min: number; max: number; step?: string
}) {
  return <label className="calc-field"><span>{label} <small>{unit}</small></span>
    <input type="number" inputMode="decimal" min={min} max={max} step={step} placeholder={`Введите значение`} value={value} onChange={(event) => onChange(event.target.value)} />
  </label>
}

export default function NEWS2Calculator() {
  const [values, setValues] = useState(initialValues)
  const [result, setResult] = useState<NEWS2Result | null>(null)
  const [error, setError] = useState('')

  function update<K extends keyof typeof initialValues>(key: K, value: typeof initialValues[K]) {
    setValues((current) => {
      const next = { ...current, [key]: value }
      return { ...next, missingDataReason: hasMissingValues(next) ? next.missingDataReason : '' }
    })
    setResult(null)
    setError('')
  }

  function updateScale(value: '' | '1' | '2') {
    setValues((current) => {
      const next = { ...current, spo2Scale: value, scale2Confirmed: value === '2' ? current.scale2Confirmed : false }
      return { ...next, missingDataReason: hasMissingValues(next) ? next.missingDataReason : '' }
    })
    setResult(null)
    setError('')
  }

  const hasMissing = hasMissingValues(values)

  function reset() {
    setValues(initialValues)
    setResult(null)
    setError('')
  }

  function handleCalculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (hasMissing && values.missingDataReason === '') {
      setError('Есть отсутствующие показатели. Укажите причину: оборудование/данные недоступны или показатель не удалось получить несмотря на использование оборудования.')
      setResult(null)
      return
    }
    if (values.spo2Scale === '2' && !values.scale2Confirmed) {
      setError('Для Scale 2 требуется подтверждение показаний и решения компетентного специалиста.')
      setResult(null)
      return
    }
    const raw = [values.respiratoryRate, values.spo2, values.systolicBP, values.pulse, values.temperature]
    const present = raw.filter((value) => value.trim() !== '')
    const numeric = present.map(Number)
    const integerValues = [values.respiratoryRate, values.spo2, values.systolicBP, values.pulse].filter((value) => value.trim() !== '').map(Number)
    const temperature = values.temperature === '' ? null : Number(values.temperature)
    const invalidRange =
      (values.respiratoryRate !== '' && (Number(values.respiratoryRate) < 0 || Number(values.respiratoryRate) > 100)) ||
      (values.spo2 !== '' && (Number(values.spo2) < 0 || Number(values.spo2) > 100)) ||
      (values.systolicBP !== '' && (Number(values.systolicBP) < 0 || Number(values.systolicBP) > 300)) ||
      (values.pulse !== '' && (Number(values.pulse) < 0 || Number(values.pulse) > 300)) ||
      (temperature !== null && (temperature < 25 || temperature > 45))
    if (numeric.some((value) => !Number.isFinite(value)) ||
      integerValues.some((value) => !Number.isInteger(value)) ||
      (temperature !== null && !Number.isInteger(temperature * 10)) || invalidRange) {
      setError('Проверьте введённые значения: ЧДД, SpO₂, систолическое АД и пульс должны быть целыми числами; температура — с точностью до 0,1 °C в диапазоне 25–45 °C.')
      setResult(null)
      return
    }
    const input: NEWS2Input = {
      respiratoryRate: values.respiratoryRate === '' ? null : Number(values.respiratoryRate),
      spo2: values.spo2 === '' ? null : Number(values.spo2),
      spo2Scale: values.spo2Scale === '' ? null : values.spo2Scale === '2' ? 2 : 1,
      supplementalOxygen: values.supplementalOxygen === '' ? null : values.supplementalOxygen === 'yes',
      systolicBP: values.systolicBP === '' ? null : Number(values.systolicBP),
      pulse: values.pulse === '' ? null : Number(values.pulse),
      temperature: values.temperature === '' ? null : Number(values.temperature),
      consciousness: values.consciousness === '' ? null : values.consciousness as NEWS2Input['consciousness'],
      missingDataReason: values.missingDataReason === '' ? null : values.missingDataReason,
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
                <select value={values.spo2Scale} onChange={(e) => updateScale(e.target.value as '' | '1' | '2')}>
                  <option value="">Выберите шкалу</option>
                  <option value="1">Шкала 1 — стандартная</option>
                  <option value="2">Шкала 2 — целевая SpO₂ 88–92%</option>
                </select>
              </label>
              <label className="calc-field"><span>Дополнительный кислород</span>
                <select value={values.supplementalOxygen} onChange={(e) => update('supplementalOxygen', e.target.value as 'no' | 'yes')}>
                  <option value="">Укажите вариант</option>
                  <option value="no">Нет — дыхание воздухом</option>
                  <option value="yes">Да — получает кислород</option>
                </select>
              </label>
            </div>
            <p className="field-hint">Все параметры вводятся вручную. Если показатель недоступен, оставьте поле пустым: NEWS2 будет рассчитан как неполный по доступным данным согласно дополнительному руководству RCP.</p>
            {values.spo2Scale === '2' && <><p className="clinical-warning"><ShieldAlert size={14} /> Шкалу 2 применять только при подтверждённой анализом газов крови гиперкапнической дыхательной недостаточности и назначенной целевой SpO₂ 88–92%; решение принимает компетентный специалист и документирует его. Само наличие ХОБЛ не является достаточным основанием.</p><label className="sofa-check"><input type="checkbox" checked={values.scale2Confirmed} onChange={(e) => update('scale2Confirmed', e.target.checked)} /> Подтверждаю: гиперкапническая дыхательная недостаточность подтверждена газовым анализом, целевой диапазон 88–92% назначен, выбор Scale 2 сделан компетентным специалистом и документирован.</label></>}
            {hasMissing && <label className="calc-field"><span>Причина отсутствия одного или нескольких показателей</span><select required value={values.missingDataReason} onChange={(e) => update('missingDataReason', e.target.value as '' | NEWS2MissingDataReason)}><option value="">Выберите причину</option><option value="equipment-unavailable">Нет оборудования / данные недоступны</option><option value="unobtainable-despite-equipment">Не удалось получить показатель несмотря на использование оборудования</option></select></label><p className="field-hint">Если хотя бы один отсутствующий показатель невозможно получить несмотря на использование оборудования, выберите второй вариант: по RCP это требует немедленного реагирования.</p>}
          </div>

          <div className="news2-section">
            <div className="panel-heading"><div><span className="panel-kicker">НЕВРОЛОГИЧЕСКИЙ СТАТУС</span><h2>Сознание (ACVPU)</h2></div><span className="points-label">0 или 3 балла</span></div>
            <label className="calc-field"><span>Уровень сознания</span>
              <select value={values.consciousness ?? ''} onChange={(e) => update('consciousness', e.target.value as NEWS2Input['consciousness'])}>
                <option value="">Выберите состояние</option>
                <option value="alert">A — бодрствует / обычное состояние (0)</option>
                <option value="new-confusion">Новое спутанное сознание / делирий / острое изменение ментального статуса, включая GCS &lt;15 (3)</option>
                <option value="voice">V — реагирует на голос (3)</option>
                <option value="pain">P — реагирует на боль (3)</option>
                <option value="unresponsive">U — не реагирует (3)</option>
              </select>
            </label>
            <p className="field-hint">Учитывается новое спутанное состояние, делирий или острое изменение ментального статуса, включая GCS &lt;15. Если неясно, является ли спутанность новой, RCP рекомендует считать её новой до уточнения; можно спросить пациента, родственников или персонал, стал ли он более спутанным, чем обычно. Подтверждённое стабильное состояние оценивается с учётом исходного уровня пациента.</p>
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
        <div className="result-topline"><span className="panel-kicker">РЕЗУЛЬТАТ РАСЧЁТА</span><span className={`risk-tag ${result.riskLevel === 'high' ? 'risk-high' : result.riskLevel === 'medium' || result.riskLevel === 'incomplete' || result.hasSingleRedScore ? 'risk-intermediate' : 'risk-low'}`}>{result.riskLabel}</span></div>
        <div className="score-display"><strong>{result.score === null ? '—' : result.score}</strong><span>баллов NEWS2</span></div>
        <div className="risk-meter"><span style={{ width: `${Math.min(result.score ?? 0, 20) / 20 * 100}%` }} /></div>
        <div className={`care-context ${result.riskLevel === 'high' || result.riskLevel === 'incomplete' || result.hasSingleRedScore ? 'qsofa-positive' : ''}`}>
          <b>{result.hasSingleRedScore ? 'Есть критическое отклонение по одному параметру (3 балла)' : result.riskLabel}</b>
          <p>{result.interpretation}</p>
          <p><b>Частота мониторинга (ориентир RCP):</b> {result.monitoringFrequency}</p>
          <p><b>Предлагаемое реагирование:</b> {result.suggestedResponse}</p>
        </div>
        {result.isIncomplete && <p className="clinical-warning"><ShieldAlert size={14} /> Неполный NEWS2. Не оценены: {result.missingParameters.join(', ')}. Сумма отражает только доступные параметры и не может использоваться для снижения уровня наблюдения. {result.requiresImmediateResponse ? 'RCP рекомендует немедленное реагирование, если показатель невозможно получить несмотря на использование оборудования.' : 'Повторите измерения и сопоставьте частичный балл с клиническим состоянием.'}</p>}
        <h3>Разбор начисленных баллов</h3>
        <div className="criteria-list">
          {result.criteria.map((item) => <div className="criterion-row" key={item.key}>
            <span className={item.points !== null && item.points > 0 ? 'criterion-point active' : 'criterion-point'}>{item.points === null ? '—' : item.points ? `+${item.points}` : '0'}</span>
            <span><b>{item.label}</b><small>{item.value} · {item.explanation}</small></span>
            <span className="criterion-status">{item.points === null ? 'не оценено' : `${item.points} б.`}</span>
          </div>)}
        </div>
        <p className="clinical-warning"><ShieldAlert size={14} /> NEWS2 — инструмент раннего выявления ухудшения, а не диагноз. Частота мониторинга и реагирование приведены как ориентиры RCP для стационарного контекста. Пороговые действия при сумме ≥5 или ≥7 относятся к новому для пациента результату, если заранее не установлен индивидуальный порог эскалации. Сопоставляйте результат с исходным состоянием и индивидуальным планом. Локальный протокол и клиническая оценка имеют приоритет. Для общественных/амбулаторных условий RCP не устанавливает универсальные пороги действий. Клиническое беспокойство должно иметь приоритет над числом баллов.</p>
      </section>}

      <section className="reference-panel">
        <div><span className="panel-kicker">ИСТОЧНИК И МЕТОДИКА</span><h2>{NEWS2_REFERENCE.title}</h2><p>{NEWS2_REFERENCE.originalSource}</p></div>
        <a href={NEWS2_REFERENCE.url} target="_blank" rel="noreferrer">Открыть материалы RCP ↗</a>
        <small>{NEWS2_REFERENCE.notes.join(' ')}</small>
      </section>
      <p className="calculator-disclaimer">Для взрослых от 16 лет. Не применять у детей младше 16 лет и беременных; при травме спинного мозга, особенно тетраплегии или высокой параплегии, NEWS2 может быть ненадёжной — использовать с осторожностью. Русский перевод не утверждён Royal College of Physicians; перед клиническим использованием сверяйтесь с англоязычной версией. NEWS2 не заменяет локальные протоколы, клиническое решение или экстренную помощь.</p>
    </main>
  )
}
