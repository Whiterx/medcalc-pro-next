import { useState, type FormEvent } from 'react'
import { ArrowLeft, BookOpen, RotateCcw, ShieldAlert, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { calculateRTS, type RTSResult } from './rts'
import { RTS_REFERENCE } from './rts.reference'

const initialValues = { gcs: '', systolicBP: '', respiratoryRate: '' }

export default function RTSCalculator() {
  const [values, setValues] = useState(initialValues)
  const [result, setResult] = useState<RTSResult | null>(null)
  const [error, setError] = useState('')

  function updateField(key: keyof typeof initialValues, value: string) {
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
    if ([values.gcs, values.systolicBP, values.respiratoryRate].some((value) => value === '')) {
      setError('Заполните GCS, систолическое АД и частоту дыхания.')
      setResult(null)
      return
    }
    try {
      setResult(calculateRTS({
        gcs: Number(values.gcs), systolicBP: Number(values.systolicBP), respiratoryRate: Number(values.respiratoryRate),
      }))
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
        <span className="version-label">НЕОТЛОЖНАЯ МЕДИЦИНА · RTS</span>
      </div>
      <section className="calculator-heading">
        <div className="eyebrow"><span className="pulse-dot" /> ФИЗИОЛОГИЧЕСКАЯ ОЦЕНКА ТРАВМЫ</div>
        <h1>Revised Trauma Score</h1>
        <p>Взвешенная шкала RTS по GCS, систолическому артериальному давлению и частоте дыхания.</p>
      </section>
      <div className="calculator-layout">
        <form className="calculator-panel" onSubmit={handleCalculate}>
          <div className="panel-heading"><div><span className="panel-kicker">ТРИ ПАРАМЕТРА</span><h2>Первичная физиологическая оценка</h2></div><span className="points-label">0–7,8408</span></div>
          <div className="news2-section">
            <label className="calc-field field-full"><span>Шкала комы Глазго (GCS), баллы</span><input type="number" min="3" max="15" step="1" required value={values.gcs} onChange={(event) => updateField('gcs', event.target.value)} placeholder="3–15" /></label>
            <p className="field-hint">Коды: 13–15 = 4; 9–12 = 3; 6–8 = 2; 4–5 = 1; 3 = 0.</p>
          </div>
          <div className="news2-section">
            <label className="calc-field field-full"><span>Систолическое АД, мм рт. ст.</span><input type="number" min="0" max="300" step="1" required value={values.systolicBP} onChange={(event) => updateField('systolicBP', event.target.value)} placeholder="0–300" /></label>
            <p className="field-hint">Коды: >89 = 4; 76–89 = 3; 50–75 = 2; 1–49 = 1; 0 = 0.</p>
          </div>
          <div className="news2-section">
            <label className="calc-field field-full"><span>Частота дыхания, в минуту</span><input type="number" min="0" max="100" step="1" required value={values.respiratoryRate} onChange={(event) => updateField('respiratoryRate', event.target.value)} placeholder="0–100" /></label>
            <p className="field-hint">Коды: 10–29 = 4; >29 = 3; 6–9 = 2; 1–5 = 1; 0 = 0.</p>
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="calculator-actions">
            <button className="primary-button" type="submit">Рассчитать RTS</button>
            <button className="reset-button" type="button" onClick={reset}><RotateCcw size={15} /> Сбросить</button>
          </div>
          <p className="privacy-note"><ShieldCheck size={14} /> Данные не отправляются на сервер и не сохраняются.</p>
        </form>
        <aside className="calculator-aside">
          <div className="info-panel"><div className="info-icon"><BookOpen size={18} /></div><h3>Взвешенная версия RTS</h3><p>Коды трёх параметров умножаются на коэффициенты 0,9368; 0,7326 и 0,2908 соответственно.</p></div>
          <div className="threshold-panel"><h3>Диапазон</h3><p><b>7,8408:</b> максимальное значение при коде 4 по всем параметрам.</p><p><b>0:</b> минимальное значение при коде 0 по всем параметрам.</p><p>Чем ниже RTS, тем тяжелее физиологические нарушения. Универсального порога лечения нет.</p></div>
        </aside>
      </div>
      {result && (
        <section className="result-panel" aria-live="polite">
          <div className="result-topline"><span className="panel-kicker">РЕЗУЛЬТАТ РАСЧЁТА</span><span className="risk-tag risk-moderate">RTS · Взвешенная версия</span></div>
          <div className="score-display"><strong>{result.score.toFixed(4)}</strong><span>из 7,8408 балла</span></div>
          <div className="result-summary"><b>{result.interpretation}</b><p>Сумма кодов T-RTS (не взвешенная) для справки: {result.codedSum} из 12. Это отдельная шкала и не подменяет рассчитанный RTS.</p></div>
          <h3>Разбор компонентов</h3>
          <div className="criteria-list">{result.components.map((item) => (
            <div className="criterion-row" key={item.label}><span className="criterion-point">{item.codedValue}</span><span><b>{item.label}</b><small>Исходное значение: {item.rawValue}; код {item.codedValue}; коэффициент {item.weight}.</small></span><span className="criterion-status">{item.weightedPoints.toFixed(4)}</span></div>
          ))}</div>
          <p className="clinical-warning"><ShieldAlert size={14} /> RTS не определяет самостоятельно прогноз выживаемости, необходимость ОРИТ или лечебную тактику. При отсутствии достоверного значения любого компонента не подставляйте условную норму.</p>
        </section>
      )}
      <section className="reference-panel">
        <div><span className="panel-kicker">ИСТОЧНИК И МЕТОДИКА</span><h2>{RTS_REFERENCE.title}</h2><p>{RTS_REFERENCE.originalSource}</p></div>
        <a href={RTS_REFERENCE.originalUrl} target="_blank" rel="noreferrer">Открыть оригинальную публикацию ↗</a>
        <small>{RTS_REFERENCE.supportingSource} · <a href={RTS_REFERENCE.supportingUrl} target="_blank" rel="noreferrer">Методология RTS и T-RTS ↗</a> Проверено: {RTS_REFERENCE.accessed}.</small>
      </section>
      <p className="calculator-disclaimer">Образовательный инструмент для оценки тяжести травмы у взрослых. Не заменяет травматологическую сортировку и клиническое решение.</p>
    </main>
  )
}
