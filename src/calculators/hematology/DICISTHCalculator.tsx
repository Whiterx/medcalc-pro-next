import { useState, type FormEvent } from 'react'
import { ArrowLeft, BookOpen, RotateCcw, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { calculateISTHDIC, type DICResult, type DICVersion, type DimerCategory } from './dicISTH'
import { DIC_ISTH_REFERENCE } from './dicISTH.reference'

const initialValues = {
  version: 'classic2001' as DICVersion,
  underlyingDisorderPresent: false,
  plateletCount: '',
  ptProlongationSeconds: '',
  fibrinogenGPerL: '',
  dDimerCategory: '' as '' | DimerCategory,
  dDimerMultipleOfULN: '',
  assessmentConfirmed: false,
}

export default function DICISTHCalculator() {
  const [values, setValues] = useState(initialValues)
  const [result, setResult] = useState<DICResult | null>(null)
  const [error, setError] = useState('')

  function updateField<K extends keyof typeof initialValues>(field: K, value: typeof initialValues[K]) {
    setValues((current) => ({ ...current, [field]: value }))
    setResult(null)
    setError('')
  }

  function handleCalculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (values.plateletCount === '' || values.ptProlongationSeconds === '' || values.fibrinogenGPerL === '') {
      setError('Введите тромбоциты, удлинение ПВ и фибриноген.')
      setResult(null)
      return
    }
    if (values.version === 'classic2001' && !values.dDimerCategory) {
      setError('Выберите степень повышения D-димера/ФДП.')
      setResult(null)
      return
    }
    if (values.version === 'updated2025' && values.dDimerMultipleOfULN === '') {
      setError('Введите отношение D-димера к верхней границе нормы.')
      setResult(null)
      return
    }
    try {
      setResult(calculateISTHDIC({
        version: values.version,
        underlyingDisorderPresent: values.underlyingDisorderPresent,
        plateletCount: Number(values.plateletCount),
        ptProlongationSeconds: Number(values.ptProlongationSeconds),
        fibrinogenGPerL: Number(values.fibrinogenGPerL),
        dDimerCategory: values.version === 'classic2001' ? values.dDimerCategory as DimerCategory : undefined,
        dDimerMultipleOfULN: values.version === 'updated2025' ? Number(values.dDimerMultipleOfULN) : undefined,
        assessmentConfirmed: values.assessmentConfirmed,
      }))
      setError('')
    } catch (caught) {
      setResult(null)
      setError(caught instanceof Error ? caught.message : 'Проверьте лабораторные показатели.')
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
        <span className="version-label">ГЕМАТОЛОГИЯ · ДВС</span>
      </div>

      <section className="calculator-heading">
        <div className="eyebrow"><span className="pulse-dot" /> ОЦЕНКА ЯВНОГО ДВС-СИНДРОМА</div>
        <h1>ISTH DIC Score</h1>
        <p>Лабораторная шкала для оценки overt ДВС при наличии основного заболевания, ассоциированного с ДВС. Доступны классические критерии и обновление ISTH SSC 2025.</p>
      </section>

      <div className="calculator-layout">
        <form className="calculator-panel" onSubmit={handleCalculate}>
          <div className="panel-heading">
            <div><span className="panel-kicker">ВЕРСИЯ КРИТЕРИЕВ</span><h2>Выберите алгоритм</h2></div>
          </div>
          <label className="calc-field field-full">
            <span>Версия ISTH</span>
            <select value={values.version} onChange={(event) => updateField('version', event.target.value as DICVersion)}>
              <option value="classic2001">Классические критерии ISTH (2001) — основной вариант</option>
              <option value="updated2025">Обновлённые критерии ISTH SSC 2025 — дополнительный вариант</option>
            </select>
          </label>
          <p className="field-hint">По умолчанию используется классическая версия ISTH 2001. КР РФ по сепсису 2024 рекомендуют лабораторную оценку ДВС; КР РФ по внематочной беременности приводят ISTH 2001. Обновление ISTH SSC 2025 — дополнительное международное предложение, пока не отражённое в этих российских КР.</p>
          <label className="check-field">
            <input type="checkbox" checked={values.underlyingDisorderPresent} onChange={(event) => updateField('underlyingDisorderPresent', event.target.checked)} />
            <span>У пациента имеется основное заболевание, ассоциированное с ДВС (обязательное условие применения score)</span>
          </label>

          <div className="panel-heading panel-subheading">
            <div><span className="panel-kicker">ЛАБОРАТОРНЫЕ ДАННЫЕ</span><h2>Показатели коагуляции</h2></div>
            <span className="points-label">Максимум 8 баллов</span>
          </div>
          <div className="field-grid">
            <label className="calc-field">
              <span>Тромбоциты <small>×10⁹/л</small></span>
              <input type="number" min="0" step="1" inputMode="numeric" placeholder="Введите значение" value={values.plateletCount} onChange={(event) => updateField('plateletCount', event.target.value)} />
            </label>
            <label className="calc-field">
              <span>Удлинение ПВ <small>секунд относительно контроля</small></span>
              <input type="number" min="0" step="0.1" inputMode="decimal" placeholder="Введите секунды" value={values.ptProlongationSeconds} onChange={(event) => updateField('ptProlongationSeconds', event.target.value)} />
            </label>
            <label className="calc-field">
              <span>Фибриноген <small>г/л</small></span>
              <input type="number" min="0" step="0.01" inputMode="decimal" placeholder="Введите значение" value={values.fibrinogenGPerL} onChange={(event) => updateField('fibrinogenGPerL', event.target.value)} />
            </label>
            {values.version === 'classic2001' ? (
              <label className="calc-field">
                <span>D-димер / ФДП <small>по референсам лабораторного метода</small></span>
                <select value={values.dDimerCategory} onChange={(event) => updateField('dDimerCategory', event.target.value as '' | DimerCategory)}>
                  <option value="">Выберите категорию</option>
                  <option value="none">Повышения нет (0)</option>
                  <option value="moderate">Умеренное повышение (2)</option>
                  <option value="strong">Значительное повышение (3)</option>
                </select>
              </label>
            ) : (
              <label className="calc-field">
                <span>D-димер <small>кратность верхней границы нормы (ВГН)</small></span>
                <input type="number" min="0" step="0.01" inputMode="decimal" placeholder="Например, 4.5" value={values.dDimerMultipleOfULN} onChange={(event) => updateField('dDimerMultipleOfULN', event.target.value)} />
              </label>
            )}
          </div>
          <p className="field-hint">Для версии 2025 используйте результат D-димера, выраженный как кратность ВГН именно этого лабораторного метода. Порог &gt;3×ВГН — 2 балла; &gt;7×ВГН — 3 балла. Не смешивайте FEU и DDU без корректного пересчёта.</p>

          <label className="check-field">
            <input type="checkbox" checked={values.assessmentConfirmed} onChange={(event) => updateField('assessmentConfirmed', event.target.checked)} />
            <span>Подтверждаю, что все лабораторные показатели получены и относятся к одному клиническому периоду</span>
          </label>
          <p className="field-hint">Все числовые поля изначально пусты. При отсутствии основного заболевания, ассоциированного с ДВС, этот алгоритм применять нельзя.</p>
          {error && <p className="form-error" role="alert">{error}</p>}

          <div className="calculator-actions">
            <button className="primary-button" type="submit">Рассчитать ISTH DIC</button>
            <button className="reset-button" type="button" onClick={reset}><RotateCcw size={15} /> Сбросить</button>
          </div>
          <p className="privacy-note"><ShieldCheck size={14} /> Данные не отправляются на сервер и не сохраняются.</p>
        </form>

        <aside className="calculator-aside">
          <div className="info-panel">
            <div className="info-icon"><BookOpen size={18} /></div>
            <h3>Кому подходит score?</h3>
            <p>Только пациентам с основным заболеванием, ассоциированным с ДВС. Оценивается overt (явный) ДВС; низкая сумма не исключает раннюю фазу коагулопатии.</p>
          </div>
          <div className="threshold-panel">
            <h3>Порог overt ДВС</h3>
            <p>≥5 баллов: <b>совместимо с overt ДВС</b></p>
            <p>&lt;5 баллов: <b>критерии overt ДВС не достигнуты</b></p>
            <p>Повторная оценка: <b>по динамике</b>, обычно ежедневно при overt ДВС.</p>
          </div>
        </aside>
      </div>

      {result && (
        <section className="result-panel" aria-live="polite">
          <div className="result-topline"><span className="panel-kicker">РЕЗУЛЬТАТ РАСЧЁТА · {result.version === 'updated2025' ? 'ISTH 2025' : 'ISTH 2001'}</span><span className={`risk-tag ${result.overtDICCompatible ? 'risk-high' : 'risk-moderate'}`}>{result.overtDICCompatible ? 'Совместимо с overt ДВС' : 'Порог overt ДВС не достигнут'}</span></div>
          <div className="score-display"><strong>{result.score}</strong><span>из 8 баллов</span></div>
          <p className="result-summary">{result.interpretation}</p>
          <div className="result-breakdown">
            {result.components.map((component) => <p key={component.key}>{component.label}: <b>{component.value}</b> — {component.points} балл(а)</p>)}
          </div>
          <div className="threshold-panel"><h3>Динамическая оценка</h3><p>{result.repeatGuidance}</p></div>
          <p className="clinical-warning">Score не является самостоятельным диагнозом и не определяет лечение. Учитывайте основное заболевание, клинический фенотип, динамику анализов и локальные лабораторные методы. Не назначайте трансфузии или антикоагулянты только по сумме баллов.</p>
        </section>
      )}

      <section className="reference-panel">
        <div><span className="panel-kicker">ИСТОЧНИК И МЕТОДИКА</span><h2>{DIC_ISTH_REFERENCE.title}</h2><p>{DIC_ISTH_REFERENCE.guideline} · {DIC_ISTH_REFERENCE.section}</p></div>
        <a href={DIC_ISTH_REFERENCE.russianSepsisUrl} target="_blank" rel="noreferrer">КР РФ «Сепсис», 2024 ↗</a><a href={DIC_ISTH_REFERENCE.russianObstetricUrl} target="_blank" rel="noreferrer">КР РФ «Внематочная беременность», 2024 ↗</a><a href={DIC_ISTH_REFERENCE.classicUrl} target="_blank" rel="noreferrer">ISTH 2001 ↗</a><a href={DIC_ISTH_REFERENCE.updated2025Url} target="_blank" rel="noreferrer">ISTH SSC 2025 ↗</a>
        <small>{DIC_ISTH_REFERENCE.published}. Проверено: {DIC_ISTH_REFERENCE.accessed}. {DIC_ISTH_REFERENCE.notes[0]} {DIC_ISTH_REFERENCE.notes[4]}</small>
      </section>
      <p className="calculator-disclaimer">Образовательный инструмент. Не заменяет клиническую оценку и не предназначен для самостоятельного назначения лечения.</p>
    </main>
  )
}
