import { useState } from 'react'
import { ArrowLeft, RotateCcw, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { convertLabValue, formatLabValue, LAB_ANALYTES, parseLabValue, type LabAnalyte } from './labUnitConverter'

type ConverterValues = Record<LabAnalyte, { si: string; conventional: string; error: string }>

const emptyValues: ConverterValues = {
  creatinine: { si: '', conventional: '', error: '' },
  urea: { si: '', conventional: '', error: '' },
  bun: { si: '', conventional: '', error: '' },
  glucose: { si: '', conventional: '', error: '' },
  bilirubin: { si: '', conventional: '', error: '' },
  albumin: { si: '', conventional: '', error: '' },
  crp: { si: '', conventional: '', error: '' },
}

export default function LabUnitConverter() {
  const [values, setValues] = useState<ConverterValues>(emptyValues)

  function updateValue(id: LabAnalyte, side: 'si' | 'conventional', rawValue: string) {
    const definition = LAB_ANALYTES.find((item) => item.id === id)
    if (!definition) return
    const targetSide = side === 'si' ? 'conventional' : 'si'
    try {
      const parsed = parseLabValue(rawValue)
      const converted = parsed === null ? '' : formatLabValue(convertLabValue(
        parsed,
        id,
        side === 'si' ? 'si-to-conventional' : 'conventional-to-si',
      ))
      setValues((current) => ({
        ...current,
        [id]: { si: side === 'si' ? rawValue : converted, conventional: side === 'conventional' ? rawValue : converted, error: '' },
      }))
    } catch (error) {
      setValues((current) => ({
        ...current,
        [id]: { ...current[id], [side]: rawValue, [targetSide]: '', error: error instanceof Error ? error.message : 'Проверьте значение.' },
      }))
    }
  }

  return (
    <main className="app-shell calculator-shell">
      <div className="calculator-topline">
        <Link className="back-link" to="/"><ArrowLeft size={16} /> Все инструменты</Link>
        <span className="version-label">ИНСТРУМЕНТЫ · ЕДИНИЦЫ ИЗМЕРЕНИЯ</span>
      </div>
      <section className="calculator-heading">
        <div className="eyebrow"><span className="pulse-dot" /> КОНВЕРТЕР ЛАБОРАТОРНЫХ ЕДИНИЦ</div>
        <h1>Пересчёт лабораторных показателей</h1>
        <p>Введите значение в любой столбец — парное значение пересчитается автоматически. Все поля изначально пустые.</p>
      </section>
      <section className="converter-panel">
        <div className="converter-header"><div><span className="panel-kicker">7 ПОКАЗАТЕЛЕЙ</span><h2>Единицы SI и conventional</h2></div><button type="button" className="reset-button" onClick={() => setValues(emptyValues)}><RotateCcw size={15} /> Очистить всё</button></div>
        <div className="converter-table">
          {LAB_ANALYTES.map((item) => (
            <div className="converter-row" key={item.id}>
              <div className="converter-name"><b>{item.label}</b>{item.note && <small>{item.note}</small>}</div>
              <label className="converter-cell">
                <input type="text" inputMode="decimal" value={values[item.id].si} onChange={(event) => updateValue(item.id, 'si', event.target.value)} aria-label={item.label + ', ' + item.siUnit} placeholder="—" />
                <span>{item.siUnit}</span>
              </label>
              <span className="converter-arrow" aria-hidden="true">⇄</span>
              <label className="converter-cell">
                <input type="text" inputMode="decimal" value={values[item.id].conventional} onChange={(event) => updateValue(item.id, 'conventional', event.target.value)} aria-label={item.label + ', ' + item.conventionalUnit} placeholder="—" />
                <span>{item.conventionalUnit}</span>
              </label>
              {values[item.id].error && <p className="converter-error" role="alert">{values[item.id].error}</p>}
            </div>
          ))}
        </div>
        <div className="converter-footnote"><ShieldCheck size={15} /><span>Пересчёт выполняется локально в браузере. Значения не сохраняются и не отправляются на сервер.</span></div>
      </section>
      <section className="threshold-panel converter-note">
        <h3>Важное различие: мочевина и BUN</h3>
        <p>Мочевина и BUN — не одно и то же. BUN отражает массу азота в составе мочевины. Поэтому коэффициенты пересчёта отличаются: мочевина (ммоль/л) × 6,0 = мочевина (мг/дл); мочевина (ммоль/л) × 2,8 = BUN (мг/дл).</p>
        <p>Округление результата — до двух знаков после запятой. Для клинических решений сверяйте единицы и референсный диапазон с оригинальным лабораторным бланком.</p>
      </section>
      <p className="calculator-disclaimer">Конвертер выполняет только арифметическое преобразование единиц и не интерпретирует лабораторные результаты.</p>
    </main>
  )
}
