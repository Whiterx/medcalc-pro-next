import { useState, type FormEvent } from 'react'
import { ArrowLeft, BookOpen, RotateCcw, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { calculateNIHSS, type NIHSSInput, type NIHSSItemKey, type NIHSSResult } from './nihss'
import { NIHSS_REFERENCE } from './nihss.reference'

const itemDefinitions: { key: NIHSSItemKey; title: string; hint: string; options: { value: string; label: string }[]; untestableHint?: string }[] = [
{key:'loc1a',title:'1a. Уровень сознания',hint:'Ответ на стимуляцию',options:[{value:'0',label:'0 — Бодрствует, полностью реагирует'},{value:'1',label:'1 — Не бодрствует полностью, но пробуждается на слабую стимуляцию'},{value:'2',label:'2 — Требуется повторная/сильная или болевая стимуляция'},{value:'3',label:'3 — Только рефлекторные реакции или полная ареактивность'}]},
{key:'loc1b',title:'1b. Вопросы',hint:'Текущий месяц и возраст; оценивается первый ответ',options:[{value:'0',label:'0 — Оба ответа верны'},{value:'1',label:'1 — Верен один ответ'},{value:'2',label:'2 — Ни один ответ не верен'}]},
{key:'loc1c',title:'1c. Выполнение команд',hint:'Открыть/закрыть глаза; сжать/разжать непаретичную кисть (при необходимости — альтернативная команда)',options:[{value:'0',label:'0 — Выполняет обе команды'},{value:'1',label:'1 — Выполняет одну команду'},{value:'2',label:'2 — Не выполняет ни одной'}]},
{key:'gaze',title:'2. Взор',hint:'Только горизонтальные движения глаз',options:[{value:'0',label:'0 — Норма'},{value:'1',label:'1 — Частичный парез взора'},{value:'2',label:'2 — Форсированное отклонение или полный парез взора'}]},
{key:'visual',title:'3. Поля зрения',hint:'Конфронтационное исследование верхних и нижних квадрантов',options:[{value:'0',label:'0 — Выпадения зрения нет'},{value:'1',label:'1 — Частичная гемианопсия (включая квадрантанопсию)'},{value:'2',label:'2 — Полная гемианопсия'},{value:'3',label:'3 — Двусторонняя гемианопсия/слепота'}]},
{key:'facial',title:'4. Парез лицевой мускулатуры',hint:'Оскалить зубы/улыбнуться, поднять брови, закрыть глаза',options:[{value:'0',label:'0 — Симметричные движения'},{value:'1',label:'1 — Незначительный парез, сглаженность носогубной складки'},{value:'2',label:'2 — Частичный парез нижней половины лица'},{value:'3',label:'3 — Полный паралич одной или обеих половин лица'}]},
{key:'leftArm',title:'5a. Двигательная функция левой руки',hint:'Удержание 90° сидя или 45° лёжа в течение 10 секунд',options:[{value:'0',label:'0 — Нет дрейфа, удерживает 10 секунд'},{value:'1',label:'1 — Дрейф до 10 секунд, не касается опоры'},{value:'2',label:'2 — Некоторые усилия против силы тяжести'},{value:'3',label:'3 — Нет усилий против силы тяжести; конечность падает'},{value:'4',label:'4 — Движений нет'},{value:'UN',label:'UN — Ампутация или фиксация плечевого сустава'}],untestableHint:'UN допустим только при ампутации или фиксации плечевого сустава; укажите причину.'},
{key:'rightArm',title:'5b. Двигательная функция правой руки',hint:'Удержание 90° сидя или 45° лёжа в течение 10 секунд',options:[{value:'0',label:'0 — Нет дрейфа, удерживает 10 секунд'},{value:'1',label:'1 — Дрейф до 10 секунд, не касается опоры'},{value:'2',label:'2 — Некоторые усилия против силы тяжести'},{value:'3',label:'3 — Нет усилий против силы тяжести; конечность падает'},{value:'4',label:'4 — Движений нет'},{value:'UN',label:'UN — Ампутация или фиксация плечевого сустава'}],untestableHint:'UN допустим только при ампутации или фиксации плечевого сустава; укажите причину.'},
{key:'leftLeg',title:'6a. Двигательная функция левой ноги',hint:'Удержание ноги под углом 30° лёжа в течение 5 секунд',options:[{value:'0',label:'0 — Нет дрейфа, удерживает 5 секунд'},{value:'1',label:'1 — Дрейф, не касается кровати'},{value:'2',label:'2 — Некоторые усилия против силы тяжести'},{value:'3',label:'3 — Нет усилий против силы тяжести; конечность сразу падает'},{value:'4',label:'4 — Движений нет'},{value:'UN',label:'UN — Ампутация или фиксация тазобедренного сустава'}],untestableHint:'UN допустим только при ампутации или фиксации тазобедренного сустава; укажите причину.'},
{key:'rightLeg',title:'6b. Двигательная функция правой ноги',hint:'Удержание ноги под углом 30° лёжа в течение 5 секунд',options:[{value:'0',label:'0 — Нет дрейфа, удерживает 5 секунд'},{value:'1',label:'1 — Дрейф, не касается кровати'},{value:'2',label:'2 — Некоторые усилия против силы тяжести'},{value:'3',label:'3 — Нет усилий против силы тяжести; конечность сразу падает'},{value:'4',label:'4 — Движений нет'},{value:'UN',label:'UN — Ампутация или фиксация тазобедренного сустава'}],untestableHint:'UN допустим только при ампутации или фиксации тазобедренного сустава; укажите причину.'},
{key:'ataxia',title:'7. Атаксия конечностей',hint:'Пальце-носовая и пяточно-коленная пробы с открытыми глазами; учитывать только непропорциональную слабости атаксию',options:[{value:'0',label:'0 — Отсутствует (в том числе при параличе или непонимании задания)'},{value:'1',label:'1 — Присутствует в одной конечности'},{value:'2',label:'2 — Присутствует в двух конечностях'},{value:'UN',label:'UN — Ампутация или фиксация сустава, препятствующая оценке'}],untestableHint:'UN допустим только при ампутации или фиксации сустава; укажите причину.'},
{key:'sensory',title:'8. Чувствительность',hint:'Укол/болевой стимул: лицо, туловище, руки (кроме кистей), ноги',options:[{value:'0',label:'0 — Норма, потери чувствительности нет'},{value:'1',label:'1 — Лёгкая/умеренная потеря: ощущение снижено, но прикосновение распознаёт'},{value:'2',label:'2 — Тяжёлая/полная потеря: не осознаёт прикосновение'}]},
{key:'language',title:'9. Наилучшая языковая функция',hint:'Описание изображения, называние предметов, чтение предложений; при нарушении зрения — альтернативная проверка',options:[{value:'0',label:'0 — Афазии нет'},{value:'1',label:'1 — Лёгкая/умеренная афазия; смысл ответа в целом понятен'},{value:'2',label:'2 — Тяжёлая афазия; фрагментарная коммуникация, требуется догадка обследующего'},{value:'3',label:'3 — Мутизм/глобальная афазия, нет понятной речи или понимания'}]},
{key:'dysarthria',title:'10. Дизартрия',hint:'Попросить прочитать или повторить слова; при тяжёлой афазии оценить разборчивость спонтанной речи',options:[{value:'0',label:'0 — Нормальная артикуляция'},{value:'1',label:'1 — Лёгкая/умеренная дизартрия, речь понятна с некоторым усилием'},{value:'2',label:'2 — Тяжёлая дизартрия, речь неразборчива или анартрия'},{value:'UN',label:'UN — Интубация или иное физическое препятствие речи'}],untestableHint:'UN допустим только при интубации или физическом препятствии речи; укажите причину.'},
{key:'neglect',title:'11. Угасание и невнимание',hint:'Используйте данные предыдущих пунктов и двустороннюю одновременную стимуляцию',options:[{value:'0',label:'0 — Нарушений нет'},{value:'1',label:'1 — Невнимание/угасание в одной модальности'},{value:'2',label:'2 — Выраженное геминевнимание или угасание более чем в одной модальности'}]},
]
const initialValues = Object.fromEntries(itemDefinitions.map((item)=>[item.key,''])) as Record<NIHSSItemKey,string>
const initialReasons = {} as Partial<Record<NIHSSItemKey,string>>

export default function NIHSSCalculator() {
 const [values,setValues]=useState(initialValues)
 const [reasons,setReasons]=useState(initialReasons)
 const [result,setResult]=useState<NIHSSResult|null>(null)
 const [error,setError]=useState('')
 function updateValue(key:NIHSSItemKey,value:string){setValues((v)=>({...v,[key]:value}));if(value!=='UN')setReasons((r)=>({...r,[key]:''}));setResult(null);setError('')}
 function updateReason(key:NIHSSItemKey,value:string){setReasons((r)=>({...r,[key]:value}));setResult(null);setError('')}
 function reset(){setValues(initialValues);setReasons(initialReasons);setResult(null);setError('')}
 function handleCalculate(event:FormEvent<HTMLFormElement>){
  event.preventDefault()
  const input={...Object.fromEntries(Object.entries(values).map(([key,value])=>[key,value==='UN'?'UN':value===''?'':Number(value)])),untestableReasons:reasons} as NIHSSInput
  try{setResult(calculateNIHSS(input));setError('')}catch(e){setResult(null);setError(e instanceof Error?e.message:'Проверьте выбранные значения.')}
 }
 return (
  <main className="app-shell calculator-shell">
   <div className="calculator-topline"><Link className="back-link" to="/"><ArrowLeft size={16}/> Все калькуляторы</Link><span className="version-label">НЕВРОЛОГИЯ · NIHSS</span></div>
   <section className="calculator-heading"><div className="eyebrow"><span className="pulse-dot"/> СТАНДАРТИЗИРОВАННАЯ ОЦЕНКА ИНСУЛЬТА</div><h1>NIHSS</h1><p>Шкала инсульта Национального института здоровья США — оценка 11 пунктов неврологического статуса.</p></section>
   <div className="calculator-layout">
    <form className="calculator-panel" onSubmit={handleCalculate}>
     <div className="panel-heading"><div><span className="panel-kicker">ПОСЛЕДОВАТЕЛЬНОСТЬ ОБСЛЕДОВАНИЯ</span><h2>Оценка 15 компонентов шкалы</h2></div><span className="points-label">0–42 балла</span></div>
     <p className="field-hint">Заполняйте пункты по порядку 1a–11. Каждый обязательный пункт изначально не выбран. Оценивайте фактическую реакцию пациента, не подсказывая ответы, кроме случаев, предусмотренных официальной инструкцией.</p>
     <div className="field-grid nihss-grid">
      {itemDefinitions.map((item)=>(
       <div className="nihss-item" key={item.key}>
        <label className="calc-field"><span>{item.title}</span><small>{item.hint}</small><select required value={values[item.key]} onChange={(event)=>updateValue(item.key,event.target.value)}><option value="">Выберите оценку</option>{item.options.map((o)=><option key={o.value} value={o.value}>{o.label}</option>)}</select></label>
        {values[item.key]==='UN'&&<label className="calc-field nihss-reason"><span>Причина неоцениваемости <small>обязательно</small></span><input value={reasons[item.key]??''} onChange={(event)=>updateReason(item.key,event.target.value)} placeholder="Укажите причину"/><small>{item.untestableHint}</small></label>}
       </div>
      ))}
     </div>
     {error&&<p className="form-error" role="alert">{error}</p>}
     <div className="calculator-actions"><button className="primary-button" type="submit">Рассчитать NIHSS</button><button className="reset-button" type="button" onClick={reset}><RotateCcw size={15}/> Сбросить</button></div>
     <p className="privacy-note"><ShieldCheck size={14}/> Данные не отправляются на сервер и не сохраняются.</p>
    </form>
    <aside className="calculator-aside">
     <div className="info-panel"><div className="info-icon"><BookOpen size={18}/></div><h3>Структура шкалы</h3><p>11 пунктов, 15 отдельных оценок: уровень сознания (1a–1c), взор, поля зрения, лицевая мускулатура, четыре конечности, атаксия, чувствительность, язык, дизартрия и невнимание.</p><p>При полной оцениваемости сумма составляет 0–42 балла.</p></div>
     <div className="threshold-panel"><h3>Правила и ограничения</h3><p>Руки удерживают 10 секунд, ноги — 5 секунд. UN допустим только в специально предусмотренных шкалой ситуациях и требует пояснения.</p><p>Атаксию оценивают только если она непропорциональна слабости; при параличе или непонимании задания — 0.</p><p>Пункт 11 никогда не отмечают UN. При наличии UN итоговая сумма неполная и не получает категорию тяжести.</p><p>NIHSS не определяет самостоятельно показания к тромболизису или тромбэктомии. Низкий балл не исключает клинически значимый инсульт или окклюзию крупного сосуда.</p></div>
    </aside>
   </div>
   {result&&<section className="result-panel" aria-live="polite">
    <div className="result-topline"><span className="panel-kicker">РЕЗУЛЬТАТ ОЦЕНКИ</span><span className={result.isComplete?'risk-tag risk-low':'risk-tag risk-high'}>{result.isComplete?'Полная оценка':'Есть UN'}</span></div>
    <div className="score-display"><strong>{result.total}</strong><span>{result.isComplete?'из 42 баллов':'баллов; оцениваемых пунктов: '+result.scoredItems}</span></div>
    <p className="result-summary">{result.severityLabel}</p>
    <div className="result-breakdown"><p>Оценено пунктов: <b>{result.scoredItems} из 15</b></p>{result.untestableItems.length>0&&<p>UN: <b>{result.untestableItems.map((key)=>itemDefinitions.find((item)=>item.key===key)?.title).join('; ')}</b></p>}{result.untestableItems.map((key)=><p key={key}>Причина ({itemDefinitions.find((item)=>item.key===key)?.title}): <b>{reasons[key]}</b></p>)}</div>
    {!result.isComplete?<p className="clinical-warning">Сумма включает только оцениваемые пункты; пункты UN не добавлены как ноль. Это неполная оценка, её нельзя напрямую сравнивать с полной суммой NIHSS. Интерпретируйте клинически.</p>:<p className="clinical-warning">Категория выраженности — описательная. Балл NIHSS не является самостоятельным критерием выбора реперфузионной терапии и не заменяет оценку инвалидизирующего характера дефицита, нейровизуализацию и клиническое решение.</p>}
   </section>}
   <section className="reference-panel"><div><span className="panel-kicker">ОФИЦИАЛЬНАЯ МЕТОДИКА</span><h2>{NIHSS_REFERENCE.title}</h2><p>{NIHSS_REFERENCE.organization} · {NIHSS_REFERENCE.version}</p></div><a href={NIHSS_REFERENCE.url} target="_blank" rel="noreferrer">Открыть руководство NINDS ↗</a><small>Проверено: {NIHSS_REFERENCE.accessed}. {NIHSS_REFERENCE.notes[8]}</small></section>
   <p className="calculator-disclaimer">Образовательный инструмент. Не заменяет стандартизированное обучение и клиническое решение специалиста.</p>
  </main>
 )
}
