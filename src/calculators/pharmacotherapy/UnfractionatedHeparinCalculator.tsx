import { useState, type FormEvent } from 'react'
import { ArrowLeft, BookOpen, RotateCcw, ShieldAlert, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { calculateUFHInitialDosing, type UFHIndication, type UFHResult } from './unfractionatedHeparin'
import { UFH_REFERENCE } from './unfractionatedHeparin.reference'

const initialValues = { weight: '', indication: '' as '' | UFHIndication, adultConfirmed: false }

function formatDose(value: number) {
  return value.toLocaleString('ru-RU', { maximumFractionDigits: 1 })
}

function formatDoseRange(min: number, max: number) {
  return min === max ? formatDose(min) : `${formatDose(min)}–${formatDose(max)}`
}

export default function UnfractionatedHeparinCalculator() {
  const [values, setValues] = useState(initialValues)
  const [result, setResult] = useState<UFHResult | null>(null)
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
    if (values.weight === '' || values.indication === '' || !values.adultConfirmed) {
      setError('Введите массу тела, подтвердите взрослый возраст пациента и выберите клинический сценарий.')
      setResult(null)
      return
    }
    try {
      setResult(calculateUFHInitialDosing({ bodyWeightKg: Number(values.weight), indication: values.indication, adultConfirmed: values.adultConfirmed }))
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
        <span className="version-label">ФАРМАКОТЕРАПИЯ · UFH</span>
      </div>
      <section className="calculator-heading">
        <div className="eyebrow"><span className="pulse-dot" /> НАЧАЛЬНЫЙ РАСЧЁТ ДОЗЫ</div>
        <h1>Нефракционированный гепарин</h1>
        <p>Расчёт стартового болюса и скорости инфузии по действующим клиническим рекомендациям Минздрава РФ.</p>
      </section>
      <div className="calculator-layout">
        <form className="calculator-panel" onSubmit={handleCalculate}>
          <div className="panel-heading"><div><span className="panel-kicker">ПАРАМЕТРЫ ПАЦИЕНТА</span><h2>Масса тела и клинический сценарий</h2></div><span className="points-label">Ед.</span></div>
          <p className="clinical-warning"><ShieldAlert size={14} /> Важно: внутривенный НФГ не является универсальной начальной терапией любого ВТЭО. По КР 960_1 он применяется в отдельных ситуациях, включая критическое состояние, ТЭЛА высокого риска с возможной реперфузией или необходимость срочного вмешательства. Для стабильных пациентов обычно предпочтительны другие антикоагулянты. Выберите сценарий только после клинического решения о применении именно внутривенного НФГ.</p>
          <label className="calc-field field-full"><span>Масса тела, кг</span><input type="number" min="20" max="300" step="0.1" required value={values.weight} onChange={(event) => updateField('weight', event.target.value)} placeholder="Введите массу тела" /><small>20–300 кг — технический диапазон ввода, а не подтверждённый диапазон клинической валидации.</small></label>
          <label className="calc-field field-full"><span><input type="checkbox" required checked={values.adultConfirmed} onChange={(event) => updateField('adultConfirmed', event.target.checked)} /> Пациент взрослый: возраст 18 лет или старше</span></label>
          <label className="calc-field field-full">
            <span>Клинический сценарий</span>
            <select required value={values.indication} onChange={(event) => updateField('indication', event.target.value as '' | UFHIndication)}>
              <option value="">Выберите сценарий</option>
              <option value="vte">ТГВ — внутривенный НФГ по КР Минздрава РФ 960_1 (80 ЕД/кг + 18 ЕД/кг/ч)</option>
              <option value="acs">ОКС без подъёма ST — КР Минздрава РФ 154_4 (60–70 ЕД/кг + 12–15 ЕД/кг/ч)</option>
            </select>
          </label>
          <p className="field-hint">Для ТГВ/ВТЭО по КР 960_1 расчёт 80 ЕД/кг + 18 ЕД/кг/ч не ограничивается максимумами ASHP: в таблице 9 российской КР такие максимумы не указаны. Для ОКС без подъёма ST КР 154_4 задаёт диапазоны доз, поэтому результат выводится диапазоном с максимумами 5 000 ЕД для болюса и 1 000 ЕД/ч для инфузии. Расчёт не предназначен для ЧКВ, ТЛТ, детей, беременности или самостоятельного выбора показаний. Титрование и последующий лабораторный контроль выполняются по КР и локальному протоколу.</p>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="calculator-actions">
            <button className="primary-button" type="submit">Рассчитать начальную дозу</button>
            <button className="reset-button" type="button" onClick={reset}><RotateCcw size={15} /> Сбросить</button>
          </div>
          <p className="privacy-note"><ShieldCheck size={14} /> Данные не отправляются на сервер и не сохраняются.</p>
        </form>
        <aside className="calculator-aside">
          <div className="info-panel"><div className="info-icon"><BookOpen size={18} /></div><h3>Российские клинические рекомендации</h3><p>ТГВ: КР Минздрава РФ 960_1 (2025). ОКС без подъёма ST: КР Минздрава РФ 154_4 (2024).</p></div>
          <div className="threshold-panel"><h3>Мониторинг</h3><p>ТГВ/ВТЭО: АЧТВ 1,5–2,3 от верхней границы нормы конкретной лаборатории; повторный контроль через 6 ч после коррекции дозы. Тромбоциты — до начала лечения и далее по графику КР 960_1.</p><p>ОКС без подъёма ST: подбор дозы по АЧТВ 1,5–2,5 от контрольной величины конкретной лаборатории. Автоматическое титрование в калькуляторе отсутствует.</p></div>
        </aside>
      </div>
      {result && (
        <section className="result-panel" aria-live="polite">
          <div className="result-topline"><span className="panel-kicker">НАЧАЛЬНЫЙ РЕЖИМ</span><span className="risk-tag risk-moderate">UFH · {result.indication === 'vte' ? 'ТГВ' : 'ОКСбпST'}</span></div>
          <div className="result-summary"><b>{result.indicationLabel}</b></div>
          <div className="score-display"><strong>{formatDoseRange(result.bolusMinUnits, result.bolusMaxUnits)}</strong><span>Ед. болюс</span></div>
          <div className="result-summary"><b>Начальная инфузия: {formatDoseRange(result.infusionMinUnitsPerHour, result.infusionMaxUnitsPerHour)} Ед/ч</b><p>Масса тела: {result.weightKg} кг.</p></div>
          {(result.bolusCapApplied || result.infusionCapApplied) && <p className="field-hint">Применены максимумы российской КР: {result.bolusCapApplied ? 'болюс ограничен 5 000 ЕД' : ''}{result.bolusCapApplied && result.infusionCapApplied ? '; ' : ''}{result.infusionCapApplied ? 'скорость инфузии ограничена 1 000 ЕД/ч' : ''}.</p>}
          <div className="threshold-panel"><h3>Контроль антикоагуляции</h3><p>{result.monitoring}</p></div>
          <p className="clinical-warning"><ShieldAlert size={14} /> Это только стартовый расчёт. Не заменяет оценку риска кровотечения, тромбоцитов, противопоказаний и клинического контекста. Не рассчитывает титрование. При подозрении на ГИТ требуется исключить дальнейшее применение НФГ и выбрать альтернативную тактику. Перед введением сверьте расчёт с действующей КР и локальным протоколом.</p>
        </section>
      )}
      <section className="reference-panel">
        <div><span className="panel-kicker">ИСТОЧНИК И МЕТОДИКА</span><h2>{UFH_REFERENCE.title}</h2><p>{UFH_REFERENCE.vteGuideline}</p><p>{UFH_REFERENCE.acsGuideline}</p></div>
        <a href={UFH_REFERENCE.vteGuidelineUrl} target="_blank" rel="noreferrer">Открыть КР по ТГВ ↗</a>
        <a href={UFH_REFERENCE.acsGuidelineUrl} target="_blank" rel="noreferrer">Открыть КР по ОКСбпST ↗</a>
        <small>{UFH_REFERENCE.monitoringNote} Проверено: {UFH_REFERENCE.accessed}.</small>
      </section>
      <p className="calculator-disclaimer">Справочный инструмент расчёта стартового режима внутривенного НФГ у взрослых в ограниченных клинических сценариях. Не заменяет клиническое решение, лабораторный мониторинг и локальную номограмму.</p>
    </main>
  )
}
