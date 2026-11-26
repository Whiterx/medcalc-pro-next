import { useState, type FormEvent } from 'react'
import { ArrowLeft, BookOpen, RotateCcw, ShieldAlert, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { calculateChildPugh, type ChildPughInput, type ChildPughResult } from './childPugh'
import { CHILD_PUGH_REFERENCE } from './childPugh.reference'

type FieldKey = keyof ChildPughInput
const initialValues = { bilirubin: '', albumin: '', inr: '', ascites: '', encephalopathy: '' }
const fields: { key: FieldKey; title: string; options: { value: string; label: string }[]; hint: string }[] = [
  { key: 'bilirubin', title: 'Общий билирубин', hint: 'Стандартные пороги для цирроза; при холестатических заболеваниях печени пороги могут отличаться.', options: [{ value: '1', label: '<34 мкмоль/л — 1 балл' }, { value: '2', label: '34–50 мкмоль/л — 2 балла' }, { value: '3', label: '>50 мкмоль/л — 3 балла' }] },
  { key: 'albumin', title: 'Альбумин сыворотки', hint: 'Используйте концентрацию альбумина в г/л.', options: [{ value: '1', label: '>35 г/л — 1 балл' }, { value: '2', label: '28–35 г/л — 2 балла' }, { value: '3', label: '<28 г/л — 3 балла' }] },
  { key: 'inr', title: 'МНО (INR)', hint: 'Оценка по МНО; альтернативный вариант с удлинением протромбинового времени здесь не используется.', options: [{ value: '1', label: '<1,7 — 1 балл' }, { value: '2', label: '1,7–2,3 — 2 балла' }, { value: '3', label: '>2,3 — 3 балла' }] },
  { key: 'ascites', title: 'Асцит', hint: 'Оцените выраженность и ответ на стандартную терапию.', options: [{ value: '1', label: 'Отсутствует — 1 балл' }, { value: '2', label: 'Небольшой / контролируемый диуретиками — 2 балла' }, { value: '3', label: 'Умеренный или выраженный, плохо контролируемый — 3 балла' }] },
  { key: 'encephalopathy', title: 'Печёночная энцефалопатия', hint: 'Оценка по клинической степени West Haven.', options: [{ value: '1', label: 'Отсутствует — 1 балл' }, { value: '2', label: 'I–II степень — 2 балла' }, { value: '3', label: 'III–IV степень — 3 балла' }] },
]
export default function ChildPughCalculator() {
  const [values, setValues] = useState(initialValues)
  const [result, setResult] = useState<ChildPughResult | null>(null)
  const [error, setError] = useState('')
  function updateField(key: FieldKey, value: string) {
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
    if (Object.values(values).some((value) => value === '')) {
      setError('Выберите значение для каждого из пяти компонентов Child–Pugh.')
      setResult(null)
      return
    }
    try {
      const input: ChildPughInput = {
        bilirubin: Number(values.bilirubin), albumin: Number(values.albumin), inr: Number(values.inr),
        ascites: Number(values.ascites), encephalopathy: Number(values.encephalopathy),
      }
      setResult(calculateChildPugh(input))
      setError('')
    } catch (caught) {
      setResult(null)
      setError(caught instanceof Error ? caught.message : 'Проверьте выбранные значения.')
    }
  }
  return (
    <main className="app-shell calculator-shell">
      <div className="calculator-topline">
        <Link className="back-link" to="/"><ArrowLeft size={16} /> Все калькуляторы</Link>
        <span className="version-label">ГЕПАТОЛОГИЯ · CHILD–PUGH</span>
      </div>
      <section className="calculator-heading">
        <div className="eyebrow"><span className="pulse-dot" /> КЛАССИФИКАЦИЯ ТЯЖЕСТИ ЦИРРОЗА</div>
        <h1>Child–Pugh</h1>
        <p>Классификация Child–Turcotte–Pugh оценивает пять лабораторных и клинических параметров. Каждый компонент даёт от 1 до 3 баллов; общая сумма — от 5 до 15.</p>
      </section>
      <div className="calculator-layout">
        <form className="calculator-panel" onSubmit={handleCalculate}>
          <div className="panel-heading"><div><span className="panel-kicker">ПЯТЬ КОМПОНЕНТОВ</span><h2>Параметры оценки</h2></div><span className="points-label">5–15 баллов</span></div>
          {fields.map((field, index) => (
            <div className="news2-section" key={field.key}>
              <div className="panel-heading panel-subheading"><div><span className="panel-kicker">ПАРАМЕТР {index + 1}</span><h2>{field.title}</h2></div></div>
              <p className="field-hint">{field.hint}</p>
              <label className="calc-field field-full">
                <span>{field.title} — выберите категорию</span>
                <select required value={values[field.key]} onChange={(event) => updateField(field.key, event.target.value)}>
                  <option value="">Выберите значение</option>
                  {field.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
            </div>
          ))}
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="calculator-actions">
            <button className="primary-button" type="submit">Рассчитать Child–Pugh</button>
            <button className="reset-button" type="button" onClick={reset}><RotateCcw size={15} /> Сбросить</button>
          </div>
          <p className="privacy-note"><ShieldCheck size={14} /> Данные не отправляются на сервер и не сохраняются.</p>
        </form>
        <aside className="calculator-aside">
          <div className="info-panel"><div className="info-icon"><BookOpen size={18} /></div><h3>Пять компонентов</h3><p>Билирубин, альбумин и МНО дополняются клинической оценкой асцита и печёночной энцефалопатии. Последние два компонента требуют профессиональной клинической оценки.</p></div>
          <div className="threshold-panel"><h3>Классы Child–Pugh</h3><p><b>A — 5–6 баллов:</b> класс A.</p><p><b>B — 7–9 баллов:</b> класс B.</p><p><b>C — 10–15 баллов:</b> класс C.</p><p>Класс не является самостоятельной рекомендацией по лечению или операции.</p></div>
        </aside>
      </div>
      {result && (
        <section className="result-panel" aria-live="polite">
          <div className="result-topline"><span className="panel-kicker">РЕЗУЛЬТАТ РАСЧЁТА</span><span className="risk-tag risk-moderate">Классификация Child–Pugh</span></div>
          <div className="score-display"><strong>{result.score}</strong><span>из 15 баллов · класс {result.classification}</span></div>
          <div className="result-summary"><b>{result.classLabel}</b></div>
          <h3>Разбор компонентов</h3>
          <div className="criteria-list">{result.criteria.map((item) => (
            <div className="criterion-row" key={item.key}><span className="criterion-point">{item.points}</span><span><b>{item.label}</b><small>{item.interpretation}</small></span><span className="criterion-status">{item.points} б.</span></div>
          ))}</div>
          <p className="clinical-warning"><ShieldAlert size={14} /> Child–Pugh не учитывает все аспекты функции печени и не заменяет оценку MELD, функции почек, осложнений цирроза и клинической динамики. Не используйте класс отдельно для определения прогноза конкретного пациента, допуска к операции или назначения/коррекции лекарств.</p>
        </section>
      )}
      <section className="reference-panel">
        <div><span className="panel-kicker">ИСТОЧНИК И МЕТОДИКА</span><h2>{CHILD_PUGH_REFERENCE.title}</h2><p>{CHILD_PUGH_REFERENCE.originalSource}</p></div>
        <a href={CHILD_PUGH_REFERENCE.url} target="_blank" rel="noreferrer">Открыть таблицу критериев ↗</a>
        <small>{CHILD_PUGH_REFERENCE.supportingSource} · <a href={CHILD_PUGH_REFERENCE.supportingUrl} target="_blank" rel="noreferrer">Методика расчёта ↗</a> Проверено: {CHILD_PUGH_REFERENCE.accessed}. {CHILD_PUGH_REFERENCE.notes[2]}</small>
      </section>
      <p className="calculator-disclaimer">Образовательный инструмент для взрослых с циррозом печени. Не заменяет клиническую оценку и локальные протоколы.</p>
    </main>
  )
}
