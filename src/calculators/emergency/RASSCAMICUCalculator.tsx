import { useState, type FormEvent } from 'react'
import { ArrowLeft, BookOpen, RotateCcw, ShieldAlert, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { calculateRASSCAMICU, RASS_LABELS, type RASSCAMICUResult } from './rassCamIcu'
import { RASS_CAM_ICU_REFERENCE } from './rassCamIcu.reference'

const initialValues = {
  rass: '',
  acuteChangeOrFluctuation: '' as '' | 'yes' | 'no',
  inattentionErrors: '',
  disorganizedThinkingErrors: '',
}
const rassOptions = [4, 3, 2, 1, 0, -1, -2, -3, -4, -5] as const

export default function RASSCAMICUCalculator() {
  const [values, setValues] = useState(initialValues)
  const [result, setResult] = useState<RASSCAMICUResult | null>(null)
  const [error, setError] = useState('')

  function updateField<K extends keyof typeof initialValues>(key: K, value: typeof initialValues[K]) {
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
    if (values.rass === '') {
      setError('Выберите значение RASS.')
      setResult(null)
      return
    }
    const rass = Number(values.rass)
    if (rass > -4 && (values.acuteChangeOrFluctuation === '' || values.inattentionErrors === '' || values.disorganizedThinkingErrors === '')) {
      setError('Для CAM-ICU заполните Feature 1 и количество ошибок в Feature 2 и Feature 4.')
      setResult(null)
      return
    }
    try {
      setResult(calculateRASSCAMICU({
        rass,
        acuteChangeOrFluctuation: values.acuteChangeOrFluctuation === '' ? null : values.acuteChangeOrFluctuation === 'yes',
        inattentionErrors: values.inattentionErrors === '' ? null : Number(values.inattentionErrors),
        disorganizedThinkingErrors: values.disorganizedThinkingErrors === '' ? null : Number(values.disorganizedThinkingErrors),
      }))
      setError('')
    } catch (caught) {
      setResult(null)
      setError(caught instanceof Error ? caught.message : 'Проверьте введённые значения.')
    }
  }

  const camCanBeAssessed = values.rass !== '' && Number(values.rass) > -4

  return (
    <main className="app-shell calculator-shell">
      <div className="calculator-topline">
        <Link className="back-link" to="/"><ArrowLeft size={16} /> Все калькуляторы</Link>
        <span className="version-label">ОРИТ · RASS / CAM-ICU</span>
      </div>
      <section className="calculator-heading">
        <div className="eyebrow"><span className="pulse-dot" /> ОЦЕНКА СЕДАЦИИ И ДЕЛИРИЯ</div>
        <h1>RASS / CAM-ICU</h1>
        <p>Оценка уровня возбуждения/седации и регистрация результата стандартизированной оценки делирия в ОРИТ.</p>
      </section>
      <div className="calculator-layout">
        <form className="calculator-panel" onSubmit={handleCalculate}>
          <div className="panel-heading"><div><span className="panel-kicker">ШАГ 1</span><h2>Richmond Agitation-Sedation Scale</h2></div><span className="points-label">+4…−5</span></div>
          <label className="calc-field field-full">
            <span>Выберите уровень RASS</span>
            <select required value={values.rass} onChange={(event) => updateField('rass', event.target.value)}>
              <option value="">Выберите значение</option>
              {rassOptions.map((score) => <option key={score} value={score}>{score > 0 ? '+' : ''}{score} — {RASS_LABELS[score]}</option>)}
            </select>
          </label>
          <div className="news2-section">
            <div className="panel-heading panel-subheading"><div><span className="panel-kicker">ШАГ 2</span><h2>CAM-ICU — четыре признака</h2></div></div>
            {camCanBeAssessed ? (
              <>
                <p className="field-hint">Заполните поля по результатам стандартизированного CAM-ICU flowsheet. В этом интерфейсе не воспроизводятся тестовые стимулы и формулировки вопросов.</p>
                <label className="calc-field field-full">
                  <span>Feature 1 — острое изменение психического статуса или флуктуация за последние 24 часа</span>
                  <select required value={values.acuteChangeOrFluctuation} onChange={(event) => updateField('acuteChangeOrFluctuation', event.target.value as '' | 'yes' | 'no')}>
                    <option value="">Выберите</option><option value="yes">Присутствует</option><option value="no">Отсутствует</option>
                  </select>
                </label>
                <label className="calc-field field-full">
                  <span>Feature 2 — количество ошибок в стандартизированном тесте внимания (0–10)</span>
                  <input type="number" min="0" max="10" step="1" required value={values.inattentionErrors} onChange={(event) => updateField('inattentionErrors', event.target.value)} placeholder="Количество ошибок" />
                  <small className="field-hint">Feature 2 положителен при более чем 2 ошибках.</small>
                </label>
                <label className="calc-field field-full">
                  <span>Feature 4 — суммарное количество ошибок в стандартизированных вопросах и команде (0–5)</span>
                  <input type="number" min="0" max="5" step="1" required value={values.disorganizedThinkingErrors} onChange={(event) => updateField('disorganizedThinkingErrors', event.target.value)} placeholder="Количество ошибок" />
                  <small className="field-hint">Feature 4 положителен при более чем 1 ошибке. Feature 3 определяется автоматически по RASS.</small>
                </label>
              </>
            ) : values.rass !== '' ? (
              <p className="clinical-warning"><ShieldAlert size={14} /> При RASS −4 или −5 CAM-ICU не проводится: пациент не пробуждается для выполнения тестов. Это «не подлежит оценке», а не отрицательный результат.</p>
            ) : (
              <p className="field-hint">Сначала выберите RASS. При RASS −4 или −5 CAM-ICU не подлежит оценке.</p>
            )}
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="calculator-actions">
            <button className="primary-button" type="submit">Рассчитать RASS / CAM-ICU</button>
            <button className="reset-button" type="button" onClick={reset}><RotateCcw size={15} /> Сбросить</button>
          </div>
          <p className="privacy-note"><ShieldCheck size={14} /> Данные не отправляются на сервер и не сохраняются.</p>
        </form>
        <aside className="calculator-aside">
          <div className="info-panel"><div className="info-icon"><BookOpen size={18} /></div><h3>Алгоритм CAM-ICU</h3><p>Положительный результат требует Feature 1 и Feature 2, а также Feature 3 или Feature 4. Feature 3 — любое значение RASS, отличное от 0.</p></div>
          <div className="threshold-panel"><h3>Пороговые значения</h3><p>Feature 2: более 2 ошибок в тесте внимания.</p><p>Feature 4: более 1 ошибки в оценке мышления.</p><p>RASS −4/−5: CAM-ICU не подлежит оценке.</p></div>
        </aside>
      </div>
      {result && (
        <section className="result-panel" aria-live="polite">
          <div className="result-topline"><span className="panel-kicker">РЕЗУЛЬТАТ ОЦЕНКИ</span><span className="risk-tag risk-moderate">RASS / CAM-ICU</span></div>
          <div className="score-display"><strong>{result.rass > 0 ? '+' : ''}{result.rass}</strong><span>RASS · {result.rassLabel}</span></div>
          <div className="result-summary"><b>{result.camICULabel}</b></div>
          {result.camICUStatus !== 'unable-to-assess' && (
            <>
              <h3>Разбор CAM-ICU</h3>
              <div className="criteria-list">
                <div className="criterion-row"><span className="criterion-point">{result.feature1 ? 'Да' : 'Нет'}</span><span><b>Feature 1 — острое изменение/флуктуация</b><small>Изменение от исходного состояния или флуктуация за последние 24 часа.</small></span></div>
                <div className="criterion-row"><span className="criterion-point">{result.feature2 ? 'Да' : 'Нет'}</span><span><b>Feature 2 — невнимательность</b><small>{result.inattentionErrors} ошибок; положителен при более чем 2.</small></span></div>
                <div className="criterion-row"><span className="criterion-point">{result.feature3 ? 'Да' : 'Нет'}</span><span><b>Feature 3 — изменённый уровень сознания</b><small>RASS {result.rass > 0 ? '+' : ''}{result.rass}; положителен при любом значении, кроме 0.</small></span></div>
                <div className="criterion-row"><span className="criterion-point">{result.feature4 ? 'Да' : 'Нет'}</span><span><b>Feature 4 — дезорганизованное мышление</b><small>{result.disorganizedThinkingErrors} ошибок; положителен при более чем 1.</small></span></div>
              </div>
            </>
          )}
          <p className="clinical-warning"><ShieldAlert size={14} /> CAM-ICU — скрининговый инструмент, а не самостоятельная диагностика причины делирия. Следуйте официальному обучению и локальному протоколу; положительный результат требует клинической оценки.</p>
        </section>
      )}
      <section className="reference-panel">
        <div><span className="panel-kicker">ИСТОЧНИК И МЕТОДИКА</span><h2>{RASS_CAM_ICU_REFERENCE.title}</h2><p>{RASS_CAM_ICU_REFERENCE.rassSource}</p></div>
        <a href={RASS_CAM_ICU_REFERENCE.rassUrl} target="_blank" rel="noreferrer">Открыть публикацию RASS ↗</a>
        <small>{RASS_CAM_ICU_REFERENCE.camIcuSource} · <a href={RASS_CAM_ICU_REFERENCE.worksheetUrl} target="_blank" rel="noreferrer">CAM-ICU worksheet SCCM ↗</a> · <a href={RASS_CAM_ICU_REFERENCE.guidelineUrl} target="_blank" rel="noreferrer">PADIS update ↗</a> Проверено: {RASS_CAM_ICU_REFERENCE.accessed}.</small>
      </section>
      <p className="calculator-disclaimer">Образовательный инструмент для взрослых пациентов ОРИТ. Не заменяет официальное обучение, стандартизированное тестирование и клиническое решение.</p>
    </main>
  )
}
