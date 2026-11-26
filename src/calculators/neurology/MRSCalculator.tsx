import { useState, type FormEvent } from 'react'
import { ArrowLeft, BookOpen, RotateCcw, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { calculateMRS, type MRSAssessmentContext, type MRSResult } from './mrs'
import { MRS_REFERENCE } from './mrs.reference'

const contexts: { value: MRSAssessmentContext; label: string; description: string }[] = [
  { value: 'baseline', label: 'Исходный статус до события', description: 'Функциональное состояние до текущего острого события (например, до инсульта).' },
  { value: 'current', label: 'Текущее состояние', description: 'Функциональное состояние на момент осмотра.' },
  { value: 'follow-up', label: 'Отдалённый результат / наблюдение', description: 'Функциональный исход на заранее определённом сроке наблюдения (например, 90 дней).' },
]

export default function MRSCalculator() {
  const [context, setContext] = useState<MRSAssessmentContext | ''>('')
  const [score, setScore] = useState('')
  const [result, setResult] = useState<MRSResult | null>(null)
  const [error, setError] = useState('')
  function reset() { setContext(''); setScore(''); setResult(null); setError('') }
  function handleCalculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!context) { setError('Укажите, к какому моменту времени относится оценка mRS.'); setResult(null); return }
    try { setResult(calculateMRS(score === '' ? undefined : Number(score))); setError('') }
    catch (e) { setResult(null); setError(e instanceof Error ? e.message : 'Проверьте выбранную оценку.') }
  }
  const selectedContext = contexts.find((item) => item.value === context)
  return (
    <main className="app-shell calculator-shell">
      <div className="calculator-topline"><Link className="back-link" to="/"><ArrowLeft size={16}/> Все калькуляторы</Link><span className="version-label">НЕВРОЛОГИЯ · mRS</span></div>
      <section className="calculator-heading"><div className="eyebrow"><span className="pulse-dot"/> ФУНКЦИОНАЛЬНЫЙ ИСХОД</div><h1>mRS</h1><p>Модифицированная шкала Рэнкина — оценка глобального уровня функциональной независимости и инвалидизации по семи категориям.</p></section>
      <div className="calculator-layout">
        <form className="calculator-panel" onSubmit={handleCalculate}>
          <div className="panel-heading"><div><span className="panel-kicker">ОЦЕНКА ФУНКЦИОНАЛЬНОГО СТАТУСА</span><h2>Выберите контекст и категорию</h2></div><span className="points-label">0–6 баллов</span></div>
          <div className="field-grid">
            <label className="calc-field"><span>Момент оценки</span><small>Всегда фиксируйте, к какому периоду относится результат.</small><select required value={context} onChange={(e) => { setContext(e.target.value as MRSAssessmentContext | ''); setResult(null); setError('') }}><option value="">Выберите контекст</option>{contexts.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
            {selectedContext && <p className="field-hint">{selectedContext.description}</p>}
            <label className="calc-field"><span>Степень функциональной инвалидизации</span><small>Выберите одну категорию, наиболее точно отражающую состояние пациента в указанный период.</small><select required value={score} onChange={(e) => { setScore(e.target.value); setResult(null); setError('') }}><option value="">Выберите категорию mRS</option>{[0,1,2,3,4,5,6].map((value) => <option key={value} value={value}>{value} — {['Нет симптомов','Нет значимой инвалидизации','Лёгкая инвалидизация','Умеренная инвалидизация','Умеренно тяжёлая инвалидизация','Тяжёлая инвалидизация','Смерть'][value]}</option>)}</select></label>
          </div>
          <div className="calculator-actions"><button className="primary-button" type="submit">Показать результат</button><button className="reset-button" type="button" onClick={reset}><RotateCcw size={15}/> Сбросить</button></div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <p className="privacy-note"><ShieldCheck size={14}/> Данные не отправляются на сервер и не сохраняются.</p>
        </form>
        <aside className="calculator-aside">
          <div className="info-panel"><div className="info-icon"><BookOpen size={18}/></div><h3>Категории mRS</h3>{[0,1,2,3,4,5,6].map((value) => <p key={value}><b>{value} — {['Нет симптомов','Нет значимой инвалидизации','Лёгкая инвалидизация','Умеренная инвалидизация','Умеренно тяжёлая инвалидизация','Тяжёлая инвалидизация','Смерть'][value]}.</b> {['Нет каких-либо симптомов.','Обычные обязанности и занятия доступны несмотря на симптомы.','Не все прежние занятия доступны, но собственные дела выполняет без помощи.','Нуждается в некоторой помощи, но ходит самостоятельно.','Не ходит без помощи и не может самостоятельно удовлетворять основные физиологические потребности.','Прикован к постели, нуждается в постоянном уходе и внимании.','Пациент умер.'][value]}</p>)}</div>
          <div className="threshold-panel"><h3>Важные ограничения</h3><p>mRS — порядковая, а не интервальная шкала: разница между соседними баллами не является одинаковой по величине.</p><p>Для снижения вариабельности предпочтительны стандартизированное интервью и обученный оценщик.</p><p>В исследованиях часто сравнивают 0–2 и 3–6, но не применяйте это разделение автоматически как индивидуальное клиническое решение.</p><p>Балл 6 — отдельная категория смерти, а не уровень инвалидизации живого пациента.</p></div>
        </aside>
      </div>
      {result && <section className="result-panel" aria-live="polite"><div className="result-topline"><span className="panel-kicker">РЕЗУЛЬТАТ ОЦЕНКИ</span><span className="risk-tag risk-low">{result.score} / 6</span></div><div className="score-display"><strong>{result.score}</strong><span>из 6 баллов</span></div><p className="result-summary">{result.label}</p><p>{result.description}</p><div className="result-breakdown"><p>Контекст: <b>{selectedContext?.label}</b></p><p>{result.functionalGroup}</p></div>{result.score === 6 && <p className="clinical-warning">Категория 6 означает смерть пациента. Она не должна интерпретироваться как функциональный статус живого пациента.</p>}</section>}
      <section className="reference-panel"><div><span className="panel-kicker">ИСТОЧНИКИ И МЕТОДИКА</span><h2>{MRS_REFERENCE.title}</h2><p>{MRS_REFERENCE.organization} · {MRS_REFERENCE.version}</p></div><div>{MRS_REFERENCE.urls.map((url) => <p key={url}><a href={url} target="_blank" rel="noreferrer">{url.includes('jointcommission') ? 'Joint Commission 2026' : url.includes('ahajournals') ? 'Stroke 2021: стандартизированная терминология' : 'NCBI Bookshelf: определения mRS'} ↗</a></p>)}</div><small>Проверено: {MRS_REFERENCE.accessed}. {MRS_REFERENCE.notes[0]}</small></section>
      <p className="calculator-disclaimer">Образовательный инструмент. Не заменяет стандартизированное интервью, функциональную оценку и клиническое решение специалиста.</p>
    </main>
  )
}
