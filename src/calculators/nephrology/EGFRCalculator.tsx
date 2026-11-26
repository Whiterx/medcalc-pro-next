import { useState, type FormEvent } from 'react'
import { ArrowLeft, BookOpen, RotateCcw, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { calculateEGFR2021, type EGFRResult, type EGFRSex } from './egfr'
import { EGFR_REFERENCE } from './egfr.reference'

const initialValues = { creatinineUmolL: '', ageYears: '', sex: '' as EGFRSex | '' }

export default function EGFRCalculator() {
  const [values, setValues] = useState(initialValues)
  const [result, setResult] = useState<EGFRResult | null>(null)
  const [error, setError] = useState('')

  function updateField<K extends keyof typeof initialValues>(field: K, value: typeof initialValues[K]) {
    setValues((current) => ({ ...current, [field]: value }))
    setResult(null)
    setError('')
  }

  function handleCalculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (values.creatinineUmolL.trim() === '' || values.ageYears.trim() === '' || values.sex === '') {
      setError('Заполните креатинин, возраст и пол.')
      setResult(null)
      return
    }
    try {
      setResult(calculateEGFR2021({
        creatinineUmolL: Number(values.creatinineUmolL),
        ageYears: Number(values.ageYears),
        sex: values.sex,
      }))
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
        <span className="version-label">НЕФРОЛОГИЯ · ФУНКЦИЯ ПОЧЕК</span>
      </div>

      <section className="calculator-heading">
        <div className="eyebrow"><span className="pulse-dot" /> РАСЧЁТНАЯ СКОРОСТЬ КЛУБОЧКОВОЙ ФИЛЬТРАЦИИ</div>
        <h1>eGFR · CKD-EPI 2021</h1>
        <p>Расчёт СКФ по стандартизированному креатинину сыворотки, возрасту и полу — без расового коэффициента.</p>
      </section>

      <div className="calculator-layout">
        <form className="calculator-panel" onSubmit={handleCalculate}>
          <div className="panel-heading">
            <div><span className="panel-kicker">ЛАБОРАТОРНЫЕ И ДЕМОГРАФИЧЕСКИЕ ДАННЫЕ</span><h2>Параметры расчёта</h2></div>
          </div>
          <div className="field-grid">
            <label className="calc-field">
              <span>Креатинин сыворотки <small>мкмоль/л</small></span>
              <input type="number" min="10" max="2000" step="0.1" inputMode="decimal" placeholder="Введите значение" value={values.creatinineUmolL} onChange={(event) => updateField('creatinineUmolL', event.target.value)} />
            </label>
            <label className="calc-field">
              <span>Возраст <small>полных лет</small></span>
              <input type="number" min="18" max="120" step="1" inputMode="numeric" placeholder="От 18 лет" value={values.ageYears} onChange={(event) => updateField('ageYears', event.target.value)} />
            </label>
          </div>
          <label className="calc-field">
            <span>Пол, используемый формулой</span>
            <select value={values.sex} onChange={(event) => updateField('sex', event.target.value as EGFRSex | '')}>
              <option value="">Выберите</option>
              <option value="female">Женский</option>
              <option value="male">Мужской</option>
            </select>
          </label>
          <p className="field-hint">Используйте результат лабораторного анализа креатинина. Формула предназначена для взрослых от 18 лет; для возраста 18–25 лет может быть полезно сопоставление с педиатрической формулой CKiD U25.</p>
          {error && <p className="form-error" role="alert">{error}</p>}

          <div className="calculator-actions">
            <button className="primary-button" type="submit">Рассчитать eGFR</button>
            <button className="reset-button" type="button" onClick={reset}><RotateCcw size={15} /> Сбросить</button>
          </div>
          <p className="privacy-note"><ShieldCheck size={14} /> Данные не отправляются на сервер и не сохраняются.</p>
        </form>

        <aside className="calculator-aside">
          <div className="info-panel">
            <div className="info-icon"><BookOpen size={18} /></div>
            <h3>Формула</h3>
            <p>CKD-EPI 2021 (креатинин): 142 × min(SCr/κ, 1)^α × max(SCr/κ, 1)^−1,2 × 0,9938^возраст × 1,012 (для женщин).</p>
            <p>Креатинин в мкмоль/л переводится в мг/дл делением на 88,4.</p>
          </div>
          <div className="threshold-panel">
            <h3>Ограничения</h3>
            <p>Это расчётная, а не измеренная СКФ. Точность снижается при нестабильном креатинине и состояниях, изменяющих его образование или выведение.</p>
            <p>Для более точной оценки в ряде ситуаций используют цистатин C или комбинированную формулу CKD-EPI.</p>
          </div>
        </aside>
      </div>

      {result && (
        <section className="result-panel" aria-live="polite">
          <div className="result-topline"><span className="panel-kicker">РЕЗУЛЬТАТ РАСЧЁТА</span><span className="risk-tag risk-moderate">CKD-EPI 2021</span></div>
          <div className="score-display"><strong>{result.value.toFixed(1)}</strong><span>мл/мин/1,73 м²</span></div>
          <p className="result-summary">{result.categoryLabel}</p>
          <div className="result-breakdown">
            <p>Креатинин: <b>{Number(values.creatinineUmolL).toLocaleString('ru-RU')} мкмоль/л ({result.creatinineMgDl.toFixed(2)} мг/дл)</b></p>
            <p>Возраст: <b>{values.ageYears} лет</b></p>
            <p>Формула: <b>CKD-EPI 2021, без расового коэффициента</b></p>
          </div>
          <p className="clinical-warning">Категория G по СКФ не является самостоятельным диагнозом ХБП. Для диагностики учитывают стойкость изменений не менее 3 месяцев, альбуминурию и другие маркеры поражения почек. При остром или быстро меняющемся креатинине расчёт может быть ненадёжен.</p>
        </section>
      )}

      <section className="reference-panel">
        <div><span className="panel-kicker">ИСТОЧНИК И МЕТОДИКА</span><h2>{EGFR_REFERENCE.title}</h2><p>{EGFR_REFERENCE.guideline} · {EGFR_REFERENCE.section}</p></div>
        <a href={EGFR_REFERENCE.url} target="_blank" rel="noreferrer">Открыть NIDDK ↗</a>
        <small>Публикация: {EGFR_REFERENCE.published}. Проверено: {EGFR_REFERENCE.accessed}. {EGFR_REFERENCE.notes[2]}</small>
      </section>
      <p className="calculator-disclaimer">Образовательный инструмент. Не заменяет лабораторную оценку и клиническое решение специалиста.</p>
    </main>
  )
}
