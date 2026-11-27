import { useState, type FormEvent } from 'react'
import { ArrowLeft, BookOpen, RotateCcw, ShieldAlert, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { calculateSOFA, type SOFAInput, type SOFAResult } from './sofa'
import { SOFA_REFERENCE } from './sofa.reference'

const initial = {
  pao2: '', fio2: '', respiratorySupport: '',
  platelets: '', bilirubin: '', map: '', vasoactiveStatus: '',
  dopamineEnabled: false, dopamineDose: '', dobutamine: false, vasoactiveAtLeastOneHour: false,
  epinephrineEnabled: false, epinephrineDose: '',
  norepinephrineEnabled: false, norepinephrineDose: '',
  gcs: '', creatinine: '', urineOutput: '', baseline: '',
}

type Values = typeof initial

function NumberField({ label, unit, value, onChange, min, max, step = '1' }: {
  label: string; unit: string; value: string; onChange: (value: string) => void
  min: number; max?: number; step?: string
}) {
  return <label className="calc-field"><span>{label} <small>{unit}</small></span>
    <input type="number" inputMode="decimal" min={min} max={max} step={step} placeholder="Введите значение" value={value} onChange={(event) => onChange(event.target.value)} />
  </label>
}

export default function SOFACalculator() {
  const [values, setValues] = useState<Values>(initial)
  const [result, setResult] = useState<SOFAResult | null>(null)
  const [error, setError] = useState('')

  function update<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((current) => ({ ...current, [key]: value }))
    setResult(null)
    setError('')
  }

  function reset() {
    setValues(initial)
    setResult(null)
    setError('')
  }

  function updateVasoactiveStatus(value: string) {
    setValues((current) => value === 'none'
      ? { ...current, vasoactiveStatus: value, dopamineEnabled: false, dopamineDose: '', dobutamine: false, vasoactiveAtLeastOneHour: false, epinephrineEnabled: false, epinephrineDose: '', norepinephrineEnabled: false, norepinephrineDose: '' }
      : { ...current, vasoactiveStatus: value })
    setResult(null)
    setError('')
  }

  function handleCalculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const required = [values.pao2, values.fio2, values.respiratorySupport, values.platelets,
      values.bilirubin, values.map, values.vasoactiveStatus, values.gcs]
    if (required.some((value) => value === '')) {
      setError('Заполните обязательные параметры всех систем органов. Для GCS выберите NT, если оценка невозможна.')
      setResult(null)
      return
    }
    if (values.creatinine === '' && values.urineOutput === '') {
      setError('Для почечного компонента укажите креатинин и/или диурез за 24 часа.')
      setResult(null)
      return
    }

    const numericValues = [values.pao2, values.fio2, values.platelets, values.bilirubin, values.map,
      ...(values.dopamineEnabled ? [values.dopamineDose] : []),
      ...(values.epinephrineEnabled ? [values.epinephrineDose] : []),
      ...(values.norepinephrineEnabled ? [values.norepinephrineDose] : []),
      ...(values.creatinine !== '' ? [values.creatinine] : []),
      ...(values.urineOutput !== '' ? [values.urineOutput] : []),
      ...(values.baseline !== '' ? [values.baseline] : [])]
    if (numericValues.some((value) => value.trim() === '' || !Number.isFinite(Number(value)))) {
      setError('Проверьте числовые поля: все выбранные препараты должны иметь указанную дозу.')
      setResult(null)
      return
    }

    const ints = [values.platelets, values.bilirubin, values.map, values.pao2, values.fio2,
      ...(values.creatinine !== '' ? [values.creatinine] : []),
      ...(values.urineOutput !== '' ? [values.urineOutput] : []),
      ...(values.baseline !== '' ? [values.baseline] : [])]
    if (ints.some((value) => !Number.isInteger(Number(value))) ||
      Number(values.pao2) < 1 || Number(values.pao2) > 800 ||
      Number(values.fio2) < 21 || Number(values.fio2) > 100 ||
      Number(values.platelets) < 0 || Number(values.platelets) > 1000 ||
      Number(values.bilirubin) < 0 || Number(values.bilirubin) > 2000 ||
      Number(values.map) < 1 || Number(values.map) > 250 ||
      (values.creatinine !== '' && (Number(values.creatinine) < 1 || Number(values.creatinine) > 3000)) ||
      (values.urineOutput !== '' && (Number(values.urineOutput) < 0 || Number(values.urineOutput) > 20000)) ||
      (values.baseline !== '' && (Number(values.baseline) < 0 || Number(values.baseline) > 24))) {
      setError('Проверьте диапазоны и точность: лабораторные и гемодинамические значения должны быть целыми; дозы препаратов могут быть десятичными.')
      setResult(null)
      return
    }

    const vasoactive = values.vasoactiveStatus === 'receiving'
    if (vasoactive && !values.dopamineEnabled && !values.dobutamine && !values.epinephrineEnabled && !values.norepinephrineEnabled) {
      setError('Укажите хотя бы один применяемый вазопрессор/инотроп или выберите «Не получает».')
      setResult(null)
      return
    }
    if (!vasoactive && (values.dopamineEnabled || values.dobutamine || values.epinephrineEnabled || values.norepinephrineEnabled)) {
      setError('Проверьте статус вазоактивной поддержки и выбранные препараты.')
      setResult(null)
      return
    }
    if (vasoactive && !values.vasoactiveAtLeastOneHour) {
      setError('Для расчёта SOFA подтвердите, что выбранные адренергические/дофаминергические препараты вводились не менее 1 часа.')
      setResult(null)
      return
    }
    const doses = [values.dopamineEnabled ? Number(values.dopamineDose) : null,
      values.epinephrineEnabled ? Number(values.epinephrineDose) : null,
      values.norepinephrineEnabled ? Number(values.norepinephrineDose) : null].filter((dose): dose is number => dose !== null)
    if (doses.some((dose) => dose <= 0)) {
      setError('Дозы вазоактивных препаратов должны быть больше 0. Проверьте единицы измерения (мкг/кг/мин).')
      setResult(null)
      return
    }

    const input: SOFAInput = {
      pao2: Number(values.pao2), fio2: Number(values.fio2),
      respiratorySupport: values.respiratorySupport === 'yes',
      platelets: Number(values.platelets), bilirubin: Number(values.bilirubin), map: Number(values.map),
      vasoactiveStatus: vasoactive ? 'receiving' : 'none',
      dopamineDose: values.dopamineEnabled ? Number(values.dopamineDose) : null,
      dobutamine: values.dobutamine,
      epinephrineDose: values.epinephrineEnabled ? Number(values.epinephrineDose) : null,
      norepinephrineDose: values.norepinephrineEnabled ? Number(values.norepinephrineDose) : null,
      gcs: values.gcs === 'NT' ? null : Number(values.gcs),
      creatinine: values.creatinine === '' ? null : Number(values.creatinine),
      urineOutput: values.urineOutput === '' ? null : Number(values.urineOutput),
    }
    const calculated = calculateSOFA(input, values.baseline === '' ? null : Number(values.baseline))
    setResult(calculated)
    setError('')
  }

  return (
    <main className="app-shell calculator-shell">
      <div className="calculator-topline">
        <Link className="back-link" to="/"><ArrowLeft size={16} /> Все калькуляторы</Link>
        <span className="version-label">НЕОТЛОЖНАЯ МЕДИЦИНА · SOFA</span>
      </div>
      <section className="calculator-heading">
        <div className="eyebrow"><span className="pulse-dot" /> ОЦЕНКА ОРГАННОЙ ДИСФУНКЦИИ</div>
        <h1>SOFA</h1>
        <p>Оригинальная шкала Sequential Organ Failure Assessment для структурированной оценки шести систем органов у взрослых. Для каждого компонента используйте наихудшее значение за оцениваемые сутки.</p>
      </section>

      <div className="calculator-layout sofa-layout">
        <form className="calculator-panel" onSubmit={handleCalculate}>
          <div className="panel-heading"><div><span className="panel-kicker">ШАГ 1</span><h2>Параметры шести систем органов</h2></div><span className="points-label">0–24 балла</span></div>

          <section className="sofa-section">
            <h3>1. Дыхательная система</h3>
            <div className="field-grid">
              <NumberField label="PaO₂" unit="мм рт. ст." value={values.pao2} onChange={(v) => update('pao2', v)} min={1} max={800} />
              <NumberField label="FiO₂" unit="%" value={values.fio2} onChange={(v) => update('fio2', v)} min={21} max={100} />
            </div>
            <label className="calc-field"><span>Респираторная поддержка</span><select required value={values.respiratorySupport} onChange={(e) => update('respiratorySupport', e.target.value)}><option value="">Выберите</option><option value="no">Нет</option><option value="yes">Да</option></select></label>
            <p className="field-hint">FiO₂ вводится в процентах: например, 40, а не 0,40. Баллы 3–4 требуют респираторной поддержки.</p>
          </section>

          <section className="sofa-section">
            <h3>2. Коагуляция</h3>
            <NumberField label="Тромбоциты" unit="×10⁹/л" value={values.platelets} onChange={(v) => update('platelets', v)} min={0} max={1000} />
          </section>

          <section className="sofa-section">
            <h3>3. Печень</h3>
            <NumberField label="Общий билирубин" unit="мкмоль/л" value={values.bilirubin} onChange={(v) => update('bilirubin', v)} min={0} max={2000} />
          </section>

          <section className="sofa-section">
            <h3>4. Сердечно-сосудистая система</h3>
            <NumberField label="Среднее АД (MAP)" unit="мм рт. ст." value={values.map} onChange={(v) => update('map', v)} min={1} max={250} />
            <label className="calc-field"><span>Вазопрессоры / инотропы</span><select required value={values.vasoactiveStatus} onChange={(e) => updateVasoactiveStatus(e.target.value)}><option value="">Выберите</option><option value="none">Не получает</option><option value="receiving">Получает</option></select></label>
            {values.vasoactiveStatus === 'receiving' && <div className="sofa-drugs">
              <p className="field-hint">Отметьте все применяемые препараты; дозы — мкг/кг/мин. Для исходной SOFA учитывается введение не менее 1 часа.</p>
              <label className="sofa-check"><input type="checkbox" checked={values.vasoactiveAtLeastOneHour} onChange={(e) => update('vasoactiveAtLeastOneHour', e.target.checked)} /> Выбранные препараты вводились не менее 1 часа</label>
              <label className="sofa-check"><input type="checkbox" checked={values.dopamineEnabled} onChange={(e) => { const checked = e.target.checked; setValues((current) => ({ ...current, dopamineEnabled: checked, dopamineDose: checked ? current.dopamineDose : '' })); setResult(null); setError('') }} /> Дофамин</label>
              {values.dopamineEnabled && <NumberField label="Доза дофамина" unit="мкг/кг/мин" value={values.dopamineDose} onChange={(v) => update('dopamineDose', v)} min={0.1} step="0.1" />}
              <label className="sofa-check"><input type="checkbox" checked={values.dobutamine} onChange={(e) => { setValues((current) => ({ ...current, dobutamine: e.target.checked })); setResult(null); setError('') }} /> Добутамин (любая доза)</label>
              <label className="sofa-check"><input type="checkbox" checked={values.epinephrineEnabled} onChange={(e) => { const checked = e.target.checked; setValues((current) => ({ ...current, epinephrineEnabled: checked, epinephrineDose: checked ? current.epinephrineDose : '' })); setResult(null); setError('') }} /> Эпинефрин</label>
              {values.epinephrineEnabled && <NumberField label="Доза эпинефрина" unit="мкг/кг/мин" value={values.epinephrineDose} onChange={(v) => update('epinephrineDose', v)} min={0.01} step="0.01" />}
              <label className="sofa-check"><input type="checkbox" checked={values.norepinephrineEnabled} onChange={(e) => { const checked = e.target.checked; setValues((current) => ({ ...current, norepinephrineEnabled: checked, norepinephrineDose: checked ? current.norepinephrineDose : '' })); setResult(null); setError('') }} /> Норэпинефрин</label>
              {values.norepinephrineEnabled && <NumberField label="Доза норэпинефрина" unit="мкг/кг/мин" value={values.norepinephrineDose} onChange={(v) => update('norepinephrineDose', v)} min={0.01} max={10} step="0.01" />}
            </div>}
          </section>

          <section className="sofa-section">
            <h3>5. Центральная нервная система</h3>
            <label className="calc-field"><span>Шкала комы Глазго (GCS)</span><select required value={values.gcs} onChange={(e) => update('gcs', e.target.value)}><option value="">Выберите GCS</option>{Array.from({ length: 13 }, (_, index) => 15 - index).map((value) => <option value={String(value)} key={value}>{value}</option>)}<option value="NT">NT — не оценивается</option></select></label>
            <p className="field-hint">Учитывайте влияние седации, интубации и других факторов на возможность достоверной оценки GCS.</p>
          </section>

          <section className="sofa-section">
            <h3>6. Почки</h3>
            <div className="field-grid">
              <NumberField label="Креатинин" unit="мкмоль/л" value={values.creatinine} onChange={(v) => update('creatinine', v)} min={1} max={3000} />
              <NumberField label="Диурез за 24 часа" unit="мл/24 ч" value={values.urineOutput} onChange={(v) => update('urineOutput', v)} min={0} max={20000} />
            </div>
            <p className="field-hint">Укажите хотя бы один показатель. Если доступны оба, для почечного компонента учитывается более высокий балл.</p>
          </section>

          <section className="sofa-section">
            <h3>Дополнительно: исходный SOFA</h3>
            <NumberField label="Исходный балл (если известен)" unit="0–24" value={values.baseline} onChange={(v) => update('baseline', v)} min={0} max={24} />
            <p className="field-hint">Необязательное поле для расчёта ΔSOFA. Не вводите 0 автоматически, если у пациента могла быть предшествующая органная дисфункция.</p>
          </section>

          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="calculator-actions"><button className="primary-button" type="submit">Рассчитать SOFA</button><button className="reset-button" type="button" onClick={reset}><RotateCcw size={15} /> Сбросить</button></div>
          <p className="privacy-note"><ShieldCheck size={14} /> Данные не отправляются на сервер и не сохраняются.</p>
        </form>

        <aside className="calculator-aside">
          <div className="info-panel"><div className="info-icon"><BookOpen size={18} /></div><h3>Шесть систем органов</h3><ul><li>Дыхательная</li><li>Коагуляция</li><li>Печень</li><li>Сердечно-сосудистая</li><li>Центральная нервная система</li><li>Почки</li></ul><p>Каждая система оценивается от 0 до 4 баллов. Общий диапазон — 0–24.</p></div>
          <div className="threshold-panel"><h3>Важные ограничения</h3><p>Оригинальная SOFA предназначена для последовательного описания органной дисфункции. Для каждого компонента регистрируют наихудшее значение за сутки; показатели не обязаны быть получены в один момент времени.</p><p>ΔSOFA ≥2 при подозреваемой инфекции используется в Sepsis-3 как операциональный критерий органной дисфункции, но не является самостоятельным диагнозом сепсиса.</p><p>Это SOFA-1, не SOFA-2. Не смешивайте версии.</p></div>
        </aside>
      </div>

      {result && <section className="result-panel" aria-live="polite">
        <div className="result-topline"><span className="panel-kicker">РЕЗУЛЬТАТ ОЦЕНКИ</span><span className={result.hasUntestableComponent ? 'risk-tag risk-high' : 'risk-tag risk-low'}>{result.hasUntestableComponent ? 'Есть NT-компонент' : 'Все компоненты оценены'}</span></div>
        <div className="score-display"><strong>{result.total ?? 'NT'}</strong><span>{result.total === null ? 'общий балл не рассчитывается' : '/ 24 балла'}</span></div>
        {result.delta !== null && <div className="care-context"><b>ΔSOFA: {result.delta > 0 ? '+' : ''}{result.delta}</b><p>Разница между текущим и указанным исходным баллом. Интерпретируйте только с учётом клинического контекста.</p></div>}
        <h3>Разбор компонентов</h3>
        <div className="criteria-list">{result.components.map((item) => <div className="criterion-row" key={item.key}><span className="criterion-point active">{item.points ?? 'NT'}</span><span><b>{item.label}</b><small>{item.detail}</small></span><span className="criterion-status">{item.points === null ? 'NT' : 'балла'}</span></div>)}</div>
        <p className="clinical-warning"><ShieldAlert size={14} /> SOFA описывает степень органной дисфункции и динамику; не является самостоятельным инструментом диагностики или лечения.</p>
      </section>}

      <section className="reference-panel"><div><span className="panel-kicker">ИСТОЧНИК И МЕТОДИКА</span><h2>{SOFA_REFERENCE.title}</h2><p>{SOFA_REFERENCE.originalSource}</p></div><a href={SOFA_REFERENCE.originalUrl} target="_blank" rel="noreferrer">Оригинальная публикация ↗</a><small>{SOFA_REFERENCE.organisation}. Проверено: {SOFA_REFERENCE.accessed}. {SOFA_REFERENCE.notes[0]}</small></section>
      <p className="calculator-disclaimer">Образовательный инструмент для взрослых. Не заменяет клиническую оценку, локальные протоколы и решение специалиста.</p>
    </main>
  )
}
