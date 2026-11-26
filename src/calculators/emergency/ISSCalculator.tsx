import { useState, type FormEvent } from 'react'
import { ArrowLeft, BookOpen, RotateCcw, ShieldAlert, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { calculateISS, type ISSInput, type ISSResult } from './iss'
import { ISS_REFERENCE } from './iss.reference'

const initialValues: Record<keyof ISSInput, string> = {
  headNeck: '', face: '', chest: '', abdomenPelvicContents: '', extremitiesPelvicGirdle: '', external: '',
}
const fields: { key: keyof ISSInput; label: string }[] = [
  { key: 'headNeck', label: 'Голова и шея' },
  { key: 'face', label: 'Лицо' },
  { key: 'chest', label: 'Грудная клетка' },
  { key: 'abdomenPelvicContents', label: 'Живот и органы таза' },
  { key: 'extremitiesPelvicGirdle', label: 'Конечности и тазовый пояс' },
  { key: 'external', label: 'Наружные повреждения' },
]

export default function ISSCalculator() {
  const [values, setValues] = useState(initialValues)
  const [result, setResult] = useState<ISSResult | null>(null)
  const [error, setError] = useState('')

  function updateField(key: keyof ISSInput, value: string) {
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
    if (fields.some((field) => values[field.key] === '')) {
      setError('Укажите максимальный AIS-код для каждого из шести регионов. Неизвестные значения не следует считать нулевыми.')
      setResult(null)
      return
    }
    try {
      const input = Object.fromEntries(fields.map((field) => [field.key, Number(values[field.key])])) as unknown as ISSInput
      setResult(calculateISS(input))
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
        <span className="version-label">НЕОТЛОЖНАЯ МЕДИЦИНА · ISS</span>
      </div>
      <section className="calculator-heading">
        <div className="eyebrow"><span className="pulse-dot" /> АНАТОМИЧЕСКАЯ ОЦЕНКА ТЯЖЕСТИ ТРАВМЫ</div>
        <h1>Injury Severity Score</h1>
        <p>Расчёт ISS по максимальным AIS-кодам в шести анатомических регионах.</p>
      </section>
      <div className="calculator-layout">
        <form className="calculator-panel" onSubmit={handleCalculate}>
          <div className="panel-heading"><div><span className="panel-kicker">ШЕСТЬ РЕГИОНОВ</span><h2>Максимальный AIS в каждом регионе</h2></div><span className="points-label">0–75 баллов</span></div>
          <p className="field-hint">Введите уже присвоенный максимальный AIS-код для каждого региона. При нескольких повреждениях в одном регионе укажите только наибольший код.</p>
          {fields.map((field, index) => (
            <div className="news2-section" key={field.key}>
              <label className="calc-field field-full">
                <span>{index + 1}. {field.label}</span>
                <select required value={values[field.key]} onChange={(event) => updateField(field.key, event.target.value)}>
                  <option value="">Выберите AIS</option>
                  {[0, 1, 2, 3, 4, 5, 6].map((score) => <option key={score} value={score}>{score}</option>)}
                </select>
              </label>
            </div>
          ))}
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="calculator-actions">
            <button className="primary-button" type="submit">Рассчитать ISS</button>
            <button className="reset-button" type="button" onClick={reset}><RotateCcw size={15} /> Сбросить</button>
          </div>
          <p className="privacy-note"><ShieldCheck size={14} /> Данные не отправляются на сервер и не сохраняются.</p>
        </form>
        <aside className="calculator-aside">
          <div className="info-panel"><div className="info-icon"><BookOpen size={18} /></div><h3>Формула ISS</h3><p>Сумма квадратов трёх наибольших региональных AIS-кодов. При AIS 6 в любом регионе итоговый ISS = 75.</p></div>
          <div className="threshold-panel"><h3>Важно о кодировании AIS</h3><p>Калькулятор не присваивает AIS-коды и не содержит словарь AIS. Используйте только коды из разрешённого источника, присвоенные квалифицированным специалистом.</p></div>
        </aside>
      </div>
      {result && (
        <section className="result-panel" aria-live="polite">
          <div className="result-topline"><span className="panel-kicker">РЕЗУЛЬТАТ РАСЧЁТА</span><span className="risk-tag risk-moderate">ISS</span></div>
          <div className="score-display"><strong>{result.score}</strong><span>из 75 баллов</span></div>
          <div className="result-summary"><b>{result.interpretation}</b></div>
          <h3>Региональные коды</h3>
          <div className="criteria-list">{result.regions.map((region) => (
            <div className="criterion-row" key={region.key}><span className="criterion-point">{region.ais}</span><span><b>{region.label}</b><small>{result.topThree.some((item) => item.key === region.key) ? 'Учтён в трёх наибольших значениях' : 'Не вошёл в три наибольших значения'}</small></span></div>
          ))}</div>
          <p className="clinical-warning"><ShieldAlert size={14} /> ISS 75 не означает автоматически несовместимую с жизнью травму: этот результат возможен и при трёх AIS 5. ISS не определяет лечение или прогноз конкретного пациента самостоятельно.</p>
        </section>
      )}
      <section className="reference-panel">
        <div><span className="panel-kicker">ИСТОЧНИК И МЕТОДИКА</span><h2>{ISS_REFERENCE.title}</h2><p>{ISS_REFERENCE.originalSource}</p></div>
        <a href={ISS_REFERENCE.originalUrl} target="_blank" rel="noreferrer">Открыть оригинальную публикацию ↗</a>
        <small>{ISS_REFERENCE.supportingSource} · <a href={ISS_REFERENCE.supportingUrl} target="_blank" rel="noreferrer">Условия использования AIS ↗</a> Проверено: {ISS_REFERENCE.accessed}.</small>
      </section>
      <p className="calculator-disclaimer">Образовательный калькулятор ISS. Не присваивает AIS-коды и не заменяет квалифицированное кодирование травм.</p>
    </main>
  )
}
