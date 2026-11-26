import { useState, type FormEvent } from 'react'
import { ArrowLeft, BookOpen, RotateCcw, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { calculateBODE, type BODEResult } from './bode'
import { BODE_REFERENCE } from './bode.reference'

const initialValues = { fev1Percent: '', sixMinuteWalkMeters: '', mmrc: '', bmi: '' }

const mmrcOptions = [
  'Одышка только при значительной физической нагрузке',
  'Одышка при быстрой ходьбе по ровной местности или подъёме на небольшой холм',
  'Иду медленнее сверстников из-за одышки или останавливаюсь при ходьбе в обычном темпе',
  'Останавливаюсь из-за одышки примерно через 100 м или через несколько минут ходьбы',
  'Одышка не позволяет выходить из дома или возникает при одевании/раздевании',
]

export default function BODECalculator() {
  const [values, setValues] = useState(initialValues)
  const [result, setResult] = useState<BODEResult | null>(null)
  const [error, setError] = useState('')

  function updateField(field: keyof typeof initialValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setResult(null)
    setError('')
  }

  function handleCalculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (Object.values(values).some((value) => value.trim() === '')) {
      setError('Заполните все четыре показателя перед расчётом.')
      setResult(null)
      return
    }
    const input = {
      fev1Percent: Number(values.fev1Percent),
      sixMinuteWalkMeters: Number(values.sixMinuteWalkMeters),
      mmrc: Number(values.mmrc),
      bmi: Number(values.bmi),
    }
    try {
      setResult(calculateBODE(input))
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
        <span className="version-label">ПУЛЬМОНОЛОГИЯ · BODE</span>
      </div>

      <section className="calculator-heading">
        <div className="eyebrow"><span className="pulse-dot" /> МНОГОМЕРНАЯ ОЦЕНКА ХОБЛ</div>
        <h1>BODE Index</h1>
        <p>Индекс объединяет индекс массы тела, степень бронхиальной обструкции, одышку и переносимость физической нагрузки. Диапазон — 0–10 баллов.</p>
      </section>

      <div className="calculator-layout">
        <form className="calculator-panel" onSubmit={handleCalculate}>
          <div className="panel-heading">
            <div><span className="panel-kicker">ШАГ 1</span><h2>Клинические показатели</h2></div>
            <span className="points-label">4 компонента</span>
          </div>

          <div className="field-grid">
            <label className="calc-field">
              <span>ОФВ₁ <small>% от должного, после бронходилататора</small></span>
              <input type="number" min="1" max="200" step="1" inputMode="numeric" placeholder="Например, 55" value={values.fev1Percent} onChange={(event) => updateField('fev1Percent', event.target.value)} />
            </label>
            <label className="calc-field">
              <span>Дистанция 6-минутной ходьбы <small>метры</small></span>
              <input type="number" min="0" max="1000" step="1" inputMode="numeric" placeholder="Например, 320" value={values.sixMinuteWalkMeters} onChange={(event) => updateField('sixMinuteWalkMeters', event.target.value)} />
            </label>
            <label className="calc-field field-full">
              <span>Индекс массы тела (ИМТ) <small>кг/м²</small></span>
              <input type="number" min="5" max="100" step="0.1" inputMode="decimal" placeholder="Например, 22.5" value={values.bmi} onChange={(event) => updateField('bmi', event.target.value)} />
            </label>
          </div>

          <label className="calc-field field-full">
            <span>Одышка по mMRC <small>выберите одно наиболее подходящее описание</small></span>
            <select value={values.mmrc} onChange={(event) => updateField('mmrc', event.target.value)}>
              <option value="">Не выбрано</option>
              {mmrcOptions.map((description, index) => <option value={String(index)} key={index}>Степень {index} — {description}</option>)}
            </select>
          </label>

          <p className="field-hint">Используйте постбронходилатационный ОФВ₁ (% от должного) и результат стандартного 6-минутного теста ходьбы. Для mMRC отметьте один вариант, наиболее точно описывающий обычную одышку.</p>
          {error && <p className="form-error" role="alert">{error}</p>}

          <div className="calculator-actions">
            <button className="primary-button" type="submit">Рассчитать BODE</button>
            <button className="reset-button" type="button" onClick={reset}><RotateCcw size={15} /> Сбросить</button>
          </div>
          <p className="privacy-note"><ShieldCheck size={14} /> Данные не отправляются на сервер и не сохраняются.</p>
        </form>

        <aside className="calculator-aside">
          <div className="info-panel">
            <div className="info-icon"><BookOpen size={18} /></div>
            <h3>Что оценивает BODE?</h3>
            <p>B — индекс массы тела; O — обструкция по ОФВ₁; D — одышка по mMRC; E — переносимость нагрузки по 6-минутному тесту ходьбы. Более высокий балл отражает более выраженное ограничение и связан с худшим прогнозом в исходных когортах ХОБЛ.</p>
          </div>
          <div className="threshold-panel">
            <h3>Шкала баллов</h3>
            <p>ОФВ₁: <b>0–3 балла</b></p>
            <p>6-минутная ходьба: <b>0–3 балла</b></p>
            <p>mMRC: <b>0–3 балла</b></p>
            <p>ИМТ: <b>0–1 балл</b></p>
            <p>Общий диапазон: <b>0–10 баллов</b></p>
          </div>
        </aside>
      </div>

      {result && (
        <section className="result-panel" aria-live="polite">
          <div className="result-topline"><span className="panel-kicker">РЕЗУЛЬТАТ РАСЧЁТА</span><span className="risk-tag risk-low">{result.quartileLabel}</span></div>
          <div className="score-display"><strong>{result.score}</strong><span>из 10 баллов</span></div>
          <div className="result-breakdown">
            {result.components.map((component) => <p key={component.key}>{component.label}: <b>{component.points} балл.</b> <span>({component.explanation})</span></p>)}
          </div>
          <p className="clinical-warning">BODE — прогностический индекс для ХОБЛ, а не диагностический критерий и не инструмент оценки острого состояния. Балл не является индивидуальной вероятностью исхода и не заменяет клиническую оценку.</p>
        </section>
      )}

      <section className="reference-panel">
        <div><span className="panel-kicker">ИСТОЧНИК И МЕТОДИКА</span><h2>{BODE_REFERENCE.title}</h2><p>{BODE_REFERENCE.guideline} · {BODE_REFERENCE.section}</p></div>
        <a href={BODE_REFERENCE.url} target="_blank" rel="noreferrer">Открыть источник ↗</a>
        <small>Публикация: {BODE_REFERENCE.published}. Проверено: {BODE_REFERENCE.accessed}. {BODE_REFERENCE.notes[4]}</small>
      </section>
      <p className="calculator-disclaimer">Образовательный инструмент. Не заменяет клиническую оценку и не предназначен для самостоятельного выбора лечебной тактики.</p>
    </main>
  )
}
