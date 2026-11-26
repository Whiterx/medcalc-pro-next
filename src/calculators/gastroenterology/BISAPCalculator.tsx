import { useState, type FormEvent } from 'react'
import { ArrowLeft, BookOpen, RotateCcw, ShieldAlert, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { calculateBISAP, type BISAPInput, type BISAPResult } from './bisap'
import { BISAP_REFERENCE } from './bisap.reference'

type CriterionKey = 'bunAbove25' | 'impairedMentalStatus' | 'sirs' | 'ageAbove60' | 'pleuralEffusion'

const initialValues = {
  bunAbove25: '',
  impairedMentalStatus: '',
  sirs: '',
  ageAbove60: '',
  pleuralEffusion: '',
  first24HoursConfirmed: false,
}

const questions: { key: CriterionKey; title: string; detail: string }[] = [
  { key: 'bunAbove25', title: 'BUN >25 мг/дл', detail: 'Если лаборатория сообщает общую мочевину, ориентировочный эквивалент порога — >8,9 ммоль/л. Не используйте значение мочевины в мг/дл как BUN.' },
  { key: 'impairedMentalStatus', title: 'Нарушение психического статуса', detail: 'Нарушение сознания; в клинической практике обычно соответствует GCS <15.' },
  { key: 'sirs', title: 'Системный воспалительный ответ (СИРС)', detail: 'Не менее 2 критериев: температура <36 или >38 °C; ЧСС >90/мин; ЧДД >20/мин или PaCO₂ <32 мм рт. ст.; лейкоциты <4 или >12 ×10⁹/л либо палочкоядерные формы >10%.' },
  { key: 'ageAbove60', title: 'Возраст >60 лет', detail: 'Учитывается строгое условие «старше 60», а не «60 лет и старше».' },
  { key: 'pleuralEffusion', title: 'Плевральный выпот', detail: 'Наличие выпота по данным рентгенографии, УЗИ или другой выполненной визуализации.' },
]

export default function BISAPCalculator() {
  const [values, setValues] = useState(initialValues)
  const [result, setResult] = useState<BISAPResult | null>(null)
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
    if (questions.some(({ key }) => values[key] === '')) {
      setError('Выберите «Да» или «Нет» для каждого из пяти компонентов BISAP.')
      setResult(null)
      return
    }
    try {
      const input: BISAPInput = {
        bunAbove25: values.bunAbove25 === 'yes',
        impairedMentalStatus: values.impairedMentalStatus === 'yes',
        sirs: values.sirs === 'yes',
        ageAbove60: values.ageAbove60 === 'yes',
        pleuralEffusion: values.pleuralEffusion === 'yes',
        first24HoursConfirmed: values.first24HoursConfirmed,
      }
      setResult(calculateBISAP(input))
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
        <span className="version-label">ГАСТРОЭНТЕРОЛОГИЯ · BISAP</span>
      </div>

      <section className="calculator-heading">
        <div className="eyebrow"><span className="pulse-dot" /> РАННЯЯ ПРОГНОСТИЧЕСКАЯ ОЦЕНКА</div>
        <h1>BISAP</h1>
        <p>Bedside Index for Severity in Acute Pancreatitis — пятикомпонентная шкала для оценки риска внутрибольничной летальности при остром панкреатите. Каждый критерий даёт 1 балл; диапазон — 0–5.</p>
      </section>

      <div className="calculator-layout">
        <form className="calculator-panel" onSubmit={handleCalculate}>
          <div className="panel-heading">
            <div><span className="panel-kicker">ОЦЕНКА ПЯТИ КРИТЕРИЕВ</span><h2>Данные пациента</h2></div>
            <span className="points-label">0–5 баллов</span>
          </div>

          {questions.map((question, index) => (
            <div className="news2-section" key={question.key}>
              <div className="panel-heading panel-subheading">
                <div><span className="panel-kicker">КРИТЕРИЙ {index + 1}</span><h2>{question.title}</h2></div>
                <span className="points-label">+1 балл</span>
              </div>
              <p className="field-hint">{question.detail}</p>
              <label className="calc-field field-full">
                <span>Критерий присутствует?</span>
                <select required value={values[question.key]} onChange={(event) => update(question.key, event.target.value as '' | 'yes' | 'no')}>
                  <option value="">Выберите ответ</option>
                  <option value="yes">Да — присутствует (+1)</option>
                  <option value="no">Нет — отсутствует (0)</option>
                </select>
              </label>
            </div>
          ))}

          <label className="check-field">
            <input type="checkbox" checked={values.first24HoursConfirmed} onChange={(event) => update('first24HoursConfirmed', event.target.checked)} />
            <span>Подтверждаю, что компоненты оценены по данным первых 24 часов госпитализации</span>
          </label>
          <p className="field-hint">Если данные отсутствуют или критерий не был оценён, не выбирайте «Нет»: сначала уточните информацию. Шкала предназначена для ранней оценки в первые 24 часа госпитализации.</p>

          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="calculator-actions">
            <button className="primary-button" type="submit">Рассчитать BISAP</button>
            <button className="reset-button" type="button" onClick={reset}><RotateCcw size={15} /> Сбросить</button>
          </div>
          <p className="privacy-note"><ShieldCheck size={14} /> Данные не отправляются на сервер и не сохраняются.</p>
        </form>

        <aside className="calculator-aside">
          <div className="info-panel">
            <div className="info-icon"><BookOpen size={18} /></div>
            <h3>Что оценивает BISAP</h3>
            <p>Шкала разработана для раннего прогнозирования внутрибольничной летальности при остром панкреатите. Она не подтверждает диагноз панкреатита и не заменяет оценку органной недостаточности.</p>
          </div>
          <div className="threshold-panel">
            <h3>Важные ограничения</h3>
            <p><b>≥3 баллов:</b> часто рассматривается как маркер повышенного риска, но чувствительность шкалы ограничена.</p>
            <p><b>0–2 балла:</b> не исключают тяжёлого течения.</p>
            <p>Плевральный выпот может появиться позднее; ранняя оценка способна недооценить риск.</p>
          </div>
        </aside>
      </div>

      {result && (
        <section className="result-panel" aria-live="polite">
          <div className="result-topline"><span className="panel-kicker">РЕЗУЛЬТАТ РАСЧЁТА</span><span className="risk-tag risk-moderate">Прогностический индекс</span></div>
          <div className="score-display"><strong>{result.score}</strong><span>из 5 баллов BISAP</span></div>
          <div className="result-summary"><b>{result.riskStatement}</b></div>
          <h3>Разбор компонентов</h3>
          <div className="criteria-list">
            {result.criteria.map((item) => (
              <div className="criterion-row" key={item.key}>
                <span className={item.points > 0 ? 'criterion-point active' : 'criterion-point'}>{item.points ? '+1' : '0'}</span>
                <span><b>{item.label}</b><small>{item.explanation}</small></span>
                <span className="criterion-status">{item.points} б.</span>
              </div>
            ))}
          </div>
          <p className="clinical-warning"><ShieldAlert size={14} /> BISAP — прогностическая шкала, а не диагностический инструмент и не самостоятельный критерий тяжести по Revised Atlanta Classification. Не используйте балл отдельно для решения о переводе в ОРИТ, интенсивности инфузии или иной тактики. Тяжесть определяется прежде всего наличием и длительностью органной недостаточности; клиническое ухудшение требует немедленной оценки независимо от BISAP.</p>
        </section>
      )}

      <section className="reference-panel">
        <div><span className="panel-kicker">ИСТОЧНИК И МЕТОДИКА</span><h2>{BISAP_REFERENCE.title}</h2><p>{BISAP_REFERENCE.originalSource}</p></div>
        <a href={BISAP_REFERENCE.url} target="_blank" rel="noreferrer">Открыть оригинальную публикацию ↗</a>
        <small>{BISAP_REFERENCE.supportingSource} · <a href={BISAP_REFERENCE.supportingUrl} target="_blank" rel="noreferrer">Рекомендации 2025 ↗</a> Проверено: {BISAP_REFERENCE.accessed}. {BISAP_REFERENCE.notes[1]}</small>
      </section>
      <p className="calculator-disclaimer">Образовательный инструмент для взрослых пациентов с острым панкреатитом. Не заменяет клиническую оценку, локальные протоколы или экстренную помощь.</p>
    </main>
  )
}
