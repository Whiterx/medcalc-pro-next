import { useState, type FormEvent } from 'react'
import { ArrowLeft, BookOpen, RotateCcw, ShieldAlert, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { calculateRASSCAMICU, RASS_LABELS, type RASSCAMICUResult } from './rassCamIcu'
import { RASS_CAM_ICU_REFERENCE } from './rassCamIcu.reference'
const initialValues = { rass: '', acuteChangeOrFluctuation: '' as '' | 'yes' | 'no', inattentionErrors: '', disorganizedThinkingErrors: '' }
const rassOptions = [4, 3, 2, 1, 0, -1, -2, -3, -4, -5] as const
export default function RASSCAMICUCalculator() {
  const [values, setValues] = useState(initialValues)
  const [result, setResult] = useState<RASSCAMICUResult | null>(null)
  const [error, setError] = useState('')
  function updateField<K extends keyof typeof initialValues>(key: K, value: typeof initialValues[K]) {
    setValues((current) => {
      if (key === 'rass') return { ...initialValues, rass: value as string }
      if (key === 'acuteChangeOrFluctuation') return { ...current, acuteChangeOrFluctuation: value as '' | 'yes' | 'no', inattentionErrors: '', disorganizedThinkingErrors: '' }
      if (key === 'inattentionErrors') return { ...current, inattentionErrors: value as string, disorganizedThinkingErrors: '' }
      return { ...current, disorganizedThinkingErrors: value as string }
    })
    setResult(null); setError('')
  }
  function reset() { setValues(initialValues); setResult(null); setError('') }
  function handleCalculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (values.rass === '') { setError('Выберите значение RASS.'); setResult(null); return }
    try {
      setResult(calculateRASSCAMICU({
        rass: Number(values.rass),
        acuteChangeOrFluctuation: values.acuteChangeOrFluctuation === '' ? null : values.acuteChangeOrFluctuation === 'yes',
        inattentionErrors: values.inattentionErrors === '' ? null : Number(values.inattentionErrors),
        disorganizedThinkingErrors: values.disorganizedThinkingErrors === '' ? null : Number(values.disorganizedThinkingErrors),
      }))
      setError('')
    } catch (caught) { setResult(null); setError(caught instanceof Error ? caught.message : 'Проверьте введённые значения.') }
  }
  const rassSelected = values.rass !== ''
  const rass = rassSelected ? Number(values.rass) : null
  const camCanBeAssessed = rass !== null && rass > -4
  const feature1Present = values.acuteChangeOrFluctuation === 'yes'
  const feature2Positive = values.inattentionErrors !== '' && Number(values.inattentionErrors) > 2
  const showFeature2 = camCanBeAssessed && feature1Present
  const showFeature4 = showFeature2 && feature2Positive && rass === 0
  const canCalculate = rassSelected && (!camCanBeAssessed || (values.acuteChangeOrFluctuation !== '' && (
    values.acuteChangeOrFluctuation === 'no' || (values.inattentionErrors !== '' && (Number(values.inattentionErrors) <= 2 || rass !== 0 || values.disorganizedThinkingErrors !== ''))
  )))
  return (
    <main className="app-shell calculator-shell">
      <div className="calculator-topline"><Link className="back-link" to="/"><ArrowLeft size={16} /> Все калькуляторы</Link><span className="version-label">ОРИТ · RASS / CAM-ICU</span></div>
      <section className="calculator-heading"><div className="eyebrow"><span className="pulse-dot" /> ОЦЕНКА СЕДАЦИИ И ДЕЛИРИЯ</div><h1>RASS / CAM-ICU</h1><p>Оценка уровня возбуждения/седации и последовательная регистрация стандартизированного скрининга делирия в ОРИТ у взрослых.</p></section>
      <div className="calculator-layout">
        <form className="calculator-panel" onSubmit={handleCalculate}>
          <div className="panel-heading"><div><span className="panel-kicker">ШАГ 1</span><h2>Richmond Agitation-Sedation Scale</h2></div><span className="points-label">+4…−5</span></div>
          <label className="calc-field field-full"><span>Выберите уровень RASS</span><select required value={values.rass} onChange={(event) => updateField('rass', event.target.value)}><option value="">Выберите значение</option>{rassOptions.map((score) => <option key={score} value={score}>{score > 0 ? '+' : ''}{score} — {RASS_LABELS[score]}</option>)}</select></label>
          <div className="news2-section">
            <div className="panel-heading panel-subheading"><div><span className="panel-kicker">ШАГ 2</span><h2>CAM-ICU — последовательный алгоритм</h2></div></div>
            {!rassSelected ? <p className="field-hint">Сначала выберите уровень RASS.</p> : !camCanBeAssessed ? <p className="clinical-warning"><ShieldAlert size={14} /> При RASS −4 или −5 CAM-ICU не подлежит оценке. Это не отрицательный результат.</p> : <>
              <label className="calc-field field-full"><span>Feature 1 — острое изменение психического статуса или флуктуация за последние 24 часа</span><select required value={values.acuteChangeOrFluctuation} onChange={(event) => updateField('acuteChangeOrFluctuation', event.target.value as '' | 'yes' | 'no')}><option value="">Выберите</option><option value="yes">Присутствует</option><option value="no">Отсутствует</option></select></label>
              {values.acuteChangeOrFluctuation === 'no' && <p className="field-hint">Feature 1 отсутствует: по алгоритму CAM-ICU скрининг отрицательный. Следующие признаки не оцениваются.</p>}
              {showFeature2 && <label className="calc-field field-full"><span>Feature 2 — количество ошибок в стандартизированном тесте внимания (0–10)</span><input type="number" min="0" max="10" step="1" required value={values.inattentionErrors} onChange={(event) => updateField('inattentionErrors', event.target.value)} placeholder="Количество ошибок" /><small className="field-hint">Более 2 ошибок — Feature 2 присутствует. При 0–2 ошибках алгоритм завершает оценку отрицательным результатом.</small></label>}
              {showFeature2 && values.inattentionErrors !== '' && Number(values.inattentionErrors) <= 2 && <p className="field-hint">Feature 2 отсутствует: по алгоритму CAM-ICU скрининг отрицательный. Feature 3 и 4 не требуются.</p>}
              {showFeature4 && <label className="calc-field field-full"><span>Feature 4 — суммарное количество ошибок в стандартизированных вопросах и команде (0–5)</span><input type="number" min="0" max="5" step="1" required value={values.disorganizedThinkingErrors} onChange={(event) => updateField('disorganizedThinkingErrors', event.target.value)} placeholder="Количество ошибок" /><small className="field-hint">Feature 4 присутствует при более чем 1 ошибке. Выполняется только если RASS = 0 и Feature 1 и 2 положительны.</small></label>}
              {showFeature2 && feature2Positive && rass !== 0 && <p className="field-hint">Feature 3 присутствует, так как RASS отличается от 0. CAM-ICU положительный; Feature 4 не требуется.</p>}
            </>}
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="calculator-actions"><button className="primary-button" type="submit" disabled={!canCalculate}>Рассчитать RASS / CAM-ICU</button><button className="reset-button" type="button" onClick={reset}><RotateCcw size={15} /> Сбросить</button></div>
          <p className="privacy-note"><ShieldCheck size={14} /> Данные не отправляются на сервер и не сохраняются.</p>
        </form>
        <aside className="calculator-aside">
          <div className="info-panel"><div className="info-icon"><BookOpen size={18} /></div><h3>Алгоритм CAM-ICU</h3><p>Сначала Feature 1. При отсутствии — отрицательный скрининг. Если Feature 1 присутствует, оценивают Feature 2. При 0–2 ошибках — отрицательный скрининг. При более чем 2 ошибках оценивают Feature 3; Feature 4 требуется только при RASS = 0.</p></div>
          <div className="threshold-panel"><h3>Пороговые значения</h3><p>Feature 2: более 2 ошибок в тесте внимания.</p><p>Feature 4: более 1 ошибки в оценке мышления.</p><p>RASS −4/−5: CAM-ICU не подлежит оценке.</p></div>
        </aside>
      </div>
      {result && <section className="result-panel" aria-live="polite">
        <div className="result-topline"><span className="panel-kicker">РЕЗУЛЬТАТ ОЦЕНКИ</span><span className="risk-tag risk-moderate">RASS / CAM-ICU</span></div>
        <div className="score-display"><strong>{result.rass > 0 ? '+' : ''}{result.rass}</strong><span>RASS · {result.rassLabel}</span></div><div className="result-summary"><b>{result.camICULabel}</b></div>
        {result.camICUStatus !== 'unable-to-assess' && <><h3>Разбор CAM-ICU</h3><div className="criteria-list">
          {result.feature1 !== null && <div className="criterion-row"><span className="criterion-point">{result.feature1 ? 'Да' : 'Нет'}</span><span><b>Feature 1 — острое изменение/флуктуация</b><small>Изменение от исходного состояния или флуктуация за последние 24 часа.</small></span></div>}
          {result.feature2 !== null && <div className="criterion-row"><span className="criterion-point">{result.feature2 ? 'Да' : 'Нет'}</span><span><b>Feature 2 — невнимательность</b><small>{result.inattentionErrors} ошибок; положителен при более чем 2.</small></span></div>}
          {result.feature3 !== null && <div className="criterion-row"><span className="criterion-point">{result.feature3 ? 'Да' : 'Нет'}</span><span><b>Feature 3 — изменённый уровень сознания</b><small>RASS {result.rass > 0 ? '+' : ''}{result.rass}; положителен при любом значении, кроме 0.</small></span></div>}
          {result.feature4 !== null && <div className="criterion-row"><span className="criterion-point">{result.feature4 ? 'Да' : 'Нет'}</span><span><b>Feature 4 — дезорганизованное мышление</b><small>{result.disorganizedThinkingErrors} ошибок; положителен при более чем 1.</small></span></div>}
        </div></>}
        <p className="clinical-warning"><ShieldAlert size={14} /> CAM-ICU — скрининговый инструмент, а не самостоятельная диагностика причины делирия. Следуйте официальному обучению и локальному протоколу; положительный результат требует клинической оценки.</p>
      </section>}
      <section className="reference-panel"><div><span className="panel-kicker">ИСТОЧНИК И МЕТОДИКА</span><h2>{RASS_CAM_ICU_REFERENCE.title}</h2><p>{RASS_CAM_ICU_REFERENCE.rassSource}</p></div><a href={RASS_CAM_ICU_REFERENCE.rassUrl} target="_blank" rel="noreferrer">Открыть публикацию RASS ↗</a><small>{RASS_CAM_ICU_REFERENCE.camIcuSource} · <a href={RASS_CAM_ICU_REFERENCE.camIcuUrl} target="_blank" rel="noreferrer">Публикация CAM-ICU ↗</a> · <a href={RASS_CAM_ICU_REFERENCE.worksheetUrl} target="_blank" rel="noreferrer">CAM-ICU worksheet SCCM ↗</a> · <a href={RASS_CAM_ICU_REFERENCE.flowsheetUrl} target="_blank" rel="noreferrer">CAM-ICU flowsheet SCCM ↗</a> · <a href={RASS_CAM_ICU_REFERENCE.guidelineUrl} target="_blank" rel="noreferrer">PADIS update ↗</a> Проверено: {RASS_CAM_ICU_REFERENCE.accessed}.</small></section>
      <p className="calculator-disclaimer">Образовательный инструмент для взрослых пациентов ОРИТ. Не заменяет официальное обучение, стандартизированное тестирование и клиническое решение.</p>
    </main>
  )
}