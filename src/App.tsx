import { Activity, ArrowRight, BookOpen, Calculator, Search, ShieldCheck, Smartphone } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import { clearRecentCalculatorPaths, readRecentCalculatorPaths, recordRecentCalculatorPath, type StorageLike } from './catalogHistory'
import { addCalculationHistory, addRiskBasketItem, clearCalculationHistory, clearRiskBasket, readCalculationHistory, readRiskBasket, type NewCalculationResult, type SavedCalculationResult } from './resultCollections'
import CURB65Calculator from './calculators/pulmonology/CURB65Calculator'
import PFRatioCalculator from './calculators/pulmonology/PFRatioCalculator'
import BODECalculator from './calculators/pulmonology/BODECalculator'
import PSICalculator from './calculators/pulmonology/PSICalculator'
import GOLDABECalculator from './calculators/pulmonology/GOLDABECalculator'
import SPESICalculator from './calculators/pulmonology/SPESICalculator'
import H2FPEFCalculator from './calculators/cardiology/H2FPEFCalculator'
import GRACECalculator from './calculators/cardiology/GRACECalculator'
import TIMICalculator from './calculators/cardiology/TIMICalculator'
import QTCCalculator from './calculators/cardiology/QTCCalculator'
import HEARTCalculator from './calculators/cardiology/HEARTCalculator'
import CHA2DS2VAScHASBLEDCalculator from './calculators/cardiology/CHA2DS2VAScHASBLEDCalculator'
import WellsPECalculator from './calculators/hematology/WellsPECalculator'
import WellsDVTCalculator from './calculators/hematology/WellsDVTCalculator'
import PaduaCalculator from './calculators/hematology/PaduaCalculator'
import FourTsCalculator from './calculators/hematology/FourTsCalculator'
import DICISTHCalculator from './calculators/hematology/DICISTHCalculator'
import HOMAIRCalculator from './calculators/endocrinology/HOMAIRCalculator'
import BMICalculator from './calculators/endocrinology/BMICalculator'
import EGFRCalculator from './calculators/nephrology/EGFRCalculator'
import KDIGOAKICalculator from './calculators/nephrology/KDIGOAKICalculator'
import CockcroftGaultCalculator from './calculators/nephrology/CockcroftGaultCalculator'
import FIB4Calculator from './calculators/hepatology/FIB4Calculator'
import ChildPughCalculator from './calculators/hepatology/ChildPughCalculator'
import MELDNaCalculator from './calculators/hepatology/MELDNaCalculator'
import NIHSSCalculator from './calculators/neurology/NIHSSCalculator'
import MRSCalculator from './calculators/neurology/MRSCalculator'
import ABCD2Calculator from './calculators/neurology/ABCD2Calculator'
import HuntHessWFNSCalculator from './calculators/neurology/HuntHessWFNSCalculator'
import QSOFACalculator from './calculators/emergency/QSOFACalculator'
import NEWS2Calculator from './calculators/emergency/NEWS2Calculator'
import GCSCalculator from './calculators/emergency/GCSCalculator'
import SOFACalculator from './calculators/emergency/SOFACalculator'
import SOFA2Calculator from './calculators/emergency/SOFA2Calculator'
import APACHE2Calculator from './calculators/emergency/APACHE2Calculator'
import SAPS2Calculator from './calculators/emergency/SAPS2Calculator'
import RASSCAMICUCalculator from './calculators/emergency/RASSCAMICUCalculator'
import RTSCalculator from './calculators/emergency/RTSCalculator'
import ISSCalculator from './calculators/emergency/ISSCalculator'
import PerformanceStatusCalculator from './calculators/oncology/PerformanceStatusCalculator'
import VancomycinCalculator from './calculators/pharmacotherapy/VancomycinCalculator'
import VasopressorsCalculator from './calculators/pharmacotherapy/VasopressorsCalculator'
import UnfractionatedHeparinCalculator from './calculators/pharmacotherapy/UnfractionatedHeparinCalculator'
import VentilationBasicsCalculator from './calculators/pulmonology/VentilationBasicsCalculator'
import BISAPCalculator from './calculators/gastroenterology/BISAPCalculator'
import AlvaradoCalculator from './calculators/gastroenterology/AlvaradoCalculator'
import GlasgowBlatchfordCalculator from './calculators/gastroenterology/GlasgowBlatchfordCalculator'

const categories = [
  { title: 'Кардиология', description: 'Шкалы и расчёты для оценки сердечно-сосудистого риска', count: '6 калькуляторов', active: true },
  { title: 'Гематология', description: 'Оценка тромбоэмболического риска и нарушений гемостаза', count: '5 калькуляторов', active: true },
  { title: 'Онкология', description: 'Оценка функционального статуса', count: '1 калькулятор', active: true },
  { title: 'Фармакотерапия', description: 'Расчёты начальных доз и лекарственного мониторинга', count: '3 калькулятора', active: true },
  { title: 'Эндокринология', description: 'Метаболические показатели и оценка инсулинорезистентности', count: '2 калькулятора', active: true },
  { title: 'Пульмонология', description: 'Респираторные шкалы и показатели', count: '7 калькуляторов', active: true },
  { title: 'Нефрология', description: 'Функция почек и связанные расчёты', count: '3 калькулятора', active: true },
  { title: 'Гепатология', description: 'Оценка функции печени и тяжести цирроза', count: '3 калькулятора', active: true },
  { title: 'Гастроэнтерология', description: 'Шкалы и инструменты оценки заболеваний ЖКТ', count: '3 калькулятора', active: true },
  { title: 'Неврология', description: 'Шкалы оценки неврологического дефицита и функционального исхода', count: '4 калькулятора', active: true },
  { title: 'Неотложная медицина', description: 'Оценка тяжести состояния и клинические шкалы', count: '10 калькуляторов', active: true },
]

const calculatorCatalog = [
  { title: 'CURB-65', category: 'Пульмонология', path: '/calculators/curb-65', keywords: 'пневмония внебольничная тяжесть госпитализация' },
  { title: 'PaO₂/FiO₂', category: 'Пульмонология', path: '/calculators/pf-ratio', keywords: 'индекс оксигенации парциальное давление кислород артериальная кровь' },
  { title: 'BODE Index', category: 'Пульмонология', path: '/calculators/bode', keywords: 'хобл прогноз индекс масса тела обструкция одышка нагрузка' },
  { title: 'PSI / PORT', category: 'Пульмонология', path: '/calculators/psi', keywords: 'пневмония pneumonia severity index риск' },
  { title: 'GOLD ABE', category: 'Пульмонология', path: '/calculators/gold-abe', keywords: 'хобл обострения симптомы классификация' },
  { title: 'sPESI', category: 'Пульмонология', path: '/calculators/spesi', keywords: 'тэла тэпэ тромбоэмболия легочной артерии прогноз' },
  { title: 'PBW и дыхательный объём', category: 'Пульмонология', path: '/calculators/ventilation-basics', keywords: 'predicted body weight tidal volume вентиляция мл кг' },
  { title: 'H₂FPEF Score', category: 'Кардиология', path: '/calculators/h2fpef', keywords: 'сердечная недостаточность сохраненная фракция выброса hfpef' },
  { title: 'GRACE Score', category: 'Кардиология', path: '/calculators/grace', keywords: 'острый коронарный синдром инфаркт риск' },
  { title: 'TIMI Risk', category: 'Кардиология', path: '/calculators/timi', keywords: 'ишемия миокарда нестабильная стенокардия инфаркт' },
  { title: 'Корригированный QT (QTc)', category: 'Кардиология', path: '/calculators/qtc', keywords: 'электрокардиограмма экг интервал qtc bazett fridericia' },
  { title: 'HEART Score', category: 'Кардиология', path: '/calculators/heart', keywords: 'боль в груди острый коронарный синдром' },
  { title: 'CHA₂DS₂-VASc + HAS-BLED', category: 'Кардиология', path: '/calculators/cha2ds2vasc-hasbled', keywords: 'фибрилляция предсердий инсульт кровотечение антикоагуляция' },
  { title: 'Wells Score — ТЭЛА', category: 'Гематология', path: '/calculators/wells-pe', keywords: 'тэла тэпэ тромбоэмболия легочной артерии pulmonary embolism' },
  { title: 'Wells Score — ТГВ', category: 'Гематология', path: '/calculators/wells-dvt', keywords: 'тгв тромбоз глубоких вен deep vein thrombosis' },
  { title: 'Padua Prediction Score', category: 'Гематология', path: '/calculators/padua', keywords: 'венозная тромбоэмболия профилактика стационар' },
  { title: '4Ts Score — ГИТ', category: 'Гематология', path: '/calculators/4ts', keywords: 'гепарин индуцированная тромбоцитопения hit' },
  { title: 'ISTH DIC Score', category: 'Гематология', path: '/calculators/dic-isth', keywords: 'диссеминированное внутрисосудистое свертывание дсв синдром коагулопатия' },
  { title: 'HOMA1-IR', category: 'Эндокринология', path: '/calculators/homa-ir', keywords: 'инсулинорезистентность глюкоза инсулин сахар диабет' },
  { title: 'Калькулятор ИМТ', category: 'Эндокринология', path: '/calculators/bmi', keywords: 'индекс массы тела bmi вес рост ожирение' },
  { title: 'eGFR · CKD-EPI 2021', category: 'Нефрология', path: '/calculators/egfr', keywords: 'скф скорость клубочковой фильтрации почки креатинин' },
  { title: 'KDIGO · Стадирование ОПП', category: 'Нефрология', path: '/calculators/kdigo-aki', keywords: 'острое повреждение почек aki acute kidney injury диурез' },
  { title: 'Cockcroft–Gault · CrCl', category: 'Нефрология', path: '/calculators/cockcroft-gault', keywords: 'клиренс креатинина дозирование лекарств почки' },
  { title: 'FIB-4', category: 'Гепатология', path: '/calculators/fib-4', keywords: 'фиброз печени аст алт тромбоциты цирроз' },
  { title: 'Child–Pugh', category: 'Гепатология', path: '/calculators/child-pugh', keywords: 'цирроз печени билирубин альбумин асцит энцефалопатия' },
  { title: 'MELD-Na', category: 'Гепатология', path: '/calculators/meld-na', keywords: 'цирроз печень натрий билирубин креатинин трансплантация' },
  { title: 'NIHSS', category: 'Неврология', path: '/calculators/nihss', keywords: 'инсульт неврологический дефицит шкала инсульта' },
  { title: 'mRS · Шкала Рэнкина', category: 'Неврология', path: '/calculators/mrs', keywords: 'модифицированная шкала рэнкина инвалидизация исход' },
  { title: 'ABCD²', category: 'Неврология', path: '/calculators/abcd2', keywords: 'тиа транзиторная ишемическая атака инсульт риск' },
  { title: 'Hunt–Hess / WFNS', category: 'Неврология', path: '/calculators/hunt-hess-wfns', keywords: 'субарахноидальное кровоизлияние сак аневризма' },
  { title: 'qSOFA', category: 'Неотложная медицина', path: '/calculators/qsofa', keywords: 'сепсис инфекция органная дисфункция' },
  { title: 'NEWS2', category: 'Неотложная медицина', path: '/calculators/news2', keywords: 'раннее предупреждение ухудшение состояния витальные показатели' },
  { title: 'GCS · Шкала комы Глазго', category: 'Неотложная медицина', path: '/calculators/gcs', keywords: 'сознание кома глазго неврология' },
  { title: 'SOFA', category: 'Неотложная медицина', path: '/calculators/sofa', keywords: 'сепсис органная недостаточность интенсивная терапия' },
  { title: 'SOFA-2', category: 'Неотложная медицина', path: '/calculators/sofa-2', keywords: 'сепсис органная дисфункция новая шкала интенсивная терапия' },
  { title: 'APACHE II', category: 'Неотложная медицина', path: '/calculators/apache-ii', keywords: 'реанимация тяжесть состояния прогноз' },
  { title: 'SAPS II', category: 'Неотложная медицина', path: '/calculators/saps-ii', keywords: 'реанимация физиология прогноз тяжесть' },
  { title: 'RASS / CAM-ICU', category: 'Неотложная медицина', path: '/calculators/rass-cam-icu', keywords: 'седация возбуждение делирий реанимация сознание' },
  { title: 'RTS', category: 'Неотложная медицина', path: '/calculators/rts', keywords: 'травма trauma revised trauma score' },
  { title: 'ISS', category: 'Неотложная медицина', path: '/calculators/iss', keywords: 'травма injury severity score анатомическая тяжесть' },
  { title: 'ECOG / Karnofsky', category: 'Онкология', path: '/calculators/performance-status', keywords: 'функциональный статус онкология работоспособность' },
  { title: 'Ванкомицин · AUC', category: 'Фармакотерапия', path: '/calculators/vancomycin', keywords: 'антибиотик терапевтический лекарственный мониторинг auc антибиотики' },
  { title: 'Вазопрессоры · Скорость инфузии', category: 'Фармакотерапия', path: '/calculators/vasopressors', keywords: 'норадреналин адреналин допамин добутамин вазопрессин шприцевой насос' },
  { title: 'Нефракционированный гепарин', category: 'Фармакотерапия', path: '/calculators/unfractionated-heparin', keywords: 'ufh антикоагулянт болюс инфузия тромбоз окс' },
  { title: 'BISAP', category: 'Гастроэнтерология', path: '/calculators/bisap', keywords: 'острый панкреатит тяжесть' },
  { title: 'Alvarado Score', category: 'Гастроэнтерология', path: '/calculators/alvarado', keywords: 'аппендицит аппендикс боль живот' },
  { title: 'Glasgow-Blatchford', category: 'Гастроэнтерология', path: '/calculators/glasgow-blatchford', keywords: 'желудочно кишечное кровотечение жкк верхнее' },
]

const calculatorPaths = calculatorCatalog.map((item) => item.path)

function getRecentStorage(): StorageLike | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null
  } catch {
    return null
  }
}

function normalizeSearchText(value: string) {
  return value.toLocaleLowerCase('ru').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ё/g, 'е').trim()
}

function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [recentPaths, setRecentPaths] = useState<string[]>([])
  const [savedHistory, setSavedHistory] = useState<SavedCalculationResult[]>([])
  const [riskBasket, setRiskBasket] = useState<SavedCalculationResult[]>([])
  useEffect(() => { setRecentPaths(readRecentCalculatorPaths(calculatorPaths, getRecentStorage())) }, [])
  useEffect(() => {
    const storage = getRecentStorage()
    setSavedHistory(readCalculationHistory(calculatorPaths, storage))
    setRiskBasket(readRiskBasket(calculatorPaths, storage))
  }, [])
  const recentCalculators = useMemo(() => recentPaths.map((path) => calculatorCatalog.find((item) => item.path === path)).filter((item): item is (typeof calculatorCatalog)[number] => Boolean(item)), [recentPaths])
  function clearRecent() {
    clearRecentCalculatorPaths(getRecentStorage())
    setRecentPaths([])
  }
  function clearSavedHistory() {
    clearCalculationHistory(getRecentStorage())
    setSavedHistory([])
  }
  function clearBasket() {
    clearRiskBasket(getRecentStorage())
    setRiskBasket([])
  }
  const normalizedQuery = normalizeSearchText(searchQuery)
  const searchTerms = normalizedQuery.split(/\s+/).filter(Boolean)
  const filteredCalculators = useMemo(() => calculatorCatalog.filter((item) => {
    const searchable = normalizeSearchText(item.title + ' ' + item.category + ' ' + item.keywords)
    return searchTerms.every((term) => searchable.includes(term))
  }), [normalizedQuery])
  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="MediCalc Pro">
          <span className="brand-mark"><Activity size={21} /></span>
          <span>MediCalc <b>Pro</b></span>
        </a>
        <span className="version-label">NEXT · PREVIEW</span>
      </header>
      <section className="hero" id="home">
        <div className="hero-copy">
          <div className="eyebrow"><span className="pulse-dot" /> МЕДИЦИНСКАЯ ОБРАЗОВАТЕЛЬНАЯ ПЛАТФОРМА</div>
          <h1>Клинические решения<br /><em>начинаются с понимания.</em></h1>
          <p className="hero-description">Медицинские калькуляторы, клинические шкалы и понятные объяснения — в одном удобном пространстве для обучения.</p>
          <div className="hero-actions">
            <a className="primary-button" href="#categories"><Calculator size={17} /> Открыть калькуляторы</a>
            <span className="local-note"><ShieldCheck size={16} /> Данные остаются на устройстве</span>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="orbit orbit-one" /><div className="orbit orbit-two" />
          <div className="visual-card">
            <div className="visual-card-top"><span>MEDICAL KNOWLEDGE</span><Activity size={17} /></div>
            <div className="visual-number">M<span>+</span></div>
            <div className="visual-caption">CALCULATE · LEARN · UNDERSTAND</div>
            <div className="visual-bars"><i /><i /><i /><i /><i /><i /><i /></div>
          </div>
          <div className="floating-chip chip-top"><Activity size={15} /> Clinical scores</div>
          <div className="floating-chip chip-bottom"><BookOpen size={15} /> Learn the logic</div>
        </div>
      </section>
      <section className="features" aria-label="Возможности платформы">
        <div className="feature"><Calculator /><div><b>Калькуляторы</b><span>Проверяемые формулы</span></div></div>
        <div className="feature"><BookOpen /><div><b>Обучение</b><span>Объяснение каждого шага</span></div></div>
        <div className="feature"><Smartphone /><div><b>Любое устройство</b><span>Телефон, планшет, компьютер</span></div></div>
      </section>
      {recentCalculators.length > 0 && (
        <section className="recent-section" aria-label="Недавно открытые калькуляторы">
          <div className="recent-heading">
            <div><h2>Недавно открывали</h2><p>Здесь сохраняются только названия открытых инструментов, без введённых данных и результатов.</p></div>
            <button type="button" className="recent-clear" onClick={clearRecent}>Очистить историю</button>
          </div>
          <div className="recent-grid">
            {recentCalculators.map((item) => <Link className="recent-card" key={item.path} to={item.path}><span>{item.category}</span><b>{item.title}</b><ArrowRight size={15} /></Link>)}
          </div>
        </section>
      )}
      {savedHistory.length > 0 && (
        <section className="saved-results-section" aria-label="История расчётов">
          <div className="recent-heading">
            <div><h2>История расчётов</h2><p>Сохраняются только название инструмента, итог и интерпретация — без исходных полей и идентификаторов.</p></div>
            <button type="button" className="recent-clear" onClick={clearSavedHistory}>Очистить историю</button>
          </div>
          <div className="saved-results-list">
            {savedHistory.slice(0, 5).map((item) => <Link className="saved-result-row" key={item.id} to={item.path}><span><b>{item.name}</b><small>{new Date(item.createdAt).toLocaleString('ru-RU')}</small></span><strong>{item.score}</strong><em>{item.interpretation}</em></Link>)}
          </div>
        </section>
      )}
      {riskBasket.length > 0 && (
        <section className="saved-results-section risk-basket-section" aria-label="Корзина риска" id="risk-basket">
          <div className="recent-heading">
            <div><h2>Корзина риска</h2><p>Сводка сохранённых результатов разных шкал. Данные хранятся только в этом браузере.</p></div>
            <button type="button" className="recent-clear" onClick={clearBasket}>Очистить корзину</button>
          </div>
          <div className="risk-basket-grid">
            {riskBasket.map((item) => <Link className="risk-basket-card" key={item.id} to={item.path}><span>{item.name}</span><b>{item.score}</b><small>{item.interpretation}</small><time>{new Date(item.createdAt).toLocaleString('ru-RU')}</time></Link>)}
          </div>
        </section>
      )}
      <section className="catalog" id="categories">
        <div className="section-heading">
          <div><div className="eyebrow">БИБЛИОТЕКА ИНСТРУМЕНТОВ</div><h2>Каталог калькуляторов</h2></div>
          <span className="catalog-hint"><Search size={15} /> Поиск по названию, аббревиатуре и специализации</span>
        </div>
        <div className="catalog-search">
          <Search size={18} aria-hidden="true" />
          <input type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Например: NEWS2, почки, ТЭЛА, гепарин…" aria-label="Поиск медицинских калькуляторов" aria-controls="catalog-results" />
          {searchQuery && <button type="button" className="search-clear" onClick={() => setSearchQuery('')}>Очистить</button>}
        </div>
        {normalizedQuery ? (
          <div id="catalog-results" className="search-results" aria-live="polite">
            <p className="search-count">Найдено: {filteredCalculators.length} из {calculatorCatalog.length}</p>
            {filteredCalculators.length ? (
              <div className="search-result-grid">
                {filteredCalculators.map((item) => (
                  <Link className="search-result-card" key={item.path} to={item.path}>
                    <span>{item.category}</span><b>{item.title}</b><ArrowRight size={16} aria-hidden="true" />
                  </Link>
                ))}
              </div>
            ) : <div className="search-empty">По этому запросу ничего не найдено. Попробуйте другое название или аббревиатуру.</div>}
          </div>
        ) : <div className="category-grid">
          {categories.map((item, index) => (
            <article className={`category-card ${item.active ? 'category-card-active' : ''}`} key={item.title}>
              <div className="category-index">0{index + 1}</div><h3>{item.title}</h3><p>{item.description}</p>
              {item.title === 'Кардиология' ? <div className="category-links"><Link className="category-link" to="/calculators/h2fpef">H₂FPEF Score <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/grace">GRACE Score <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/timi">TIMI Risk <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/qtc">Корригированный QT (QTc) <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/heart">HEART Score <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/cha2ds2vasc-hasbled">CHA₂DS₂-VASc + HAS-BLED <ArrowRight size={14} /></Link></div> : item.title === 'Гематология' ? <div className="category-links"><Link className="category-link" to="/calculators/wells-pe">Wells Score — ТЭЛА <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/4ts">4Ts Score — ГИТ <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/dic-isth">ISTH DIC Score <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/wells-dvt">Wells Score — ТГВ <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/padua">Padua Prediction Score · ВТЭО <ArrowRight size={14} /></Link></div> : item.title === 'Эндокринология' ? <div className="category-links"><Link className="category-link" to="/calculators/homa-ir">HOMA1-IR <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/bmi">Калькулятор ИМТ <ArrowRight size={14} /></Link></div> : item.title === 'Пульмонология' ? <div className="category-links"><Link className="category-link" to="/calculators/curb-65">Открыть CURB-65 <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/pf-ratio">PaO₂/FiO₂ <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/bode">BODE Index <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/psi">PSI / PORT <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/ventilation-basics">PBW и дыхательный объём <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/gold-abe">GOLD ABE <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/spesi">sPESI · Прогноз при ТЭЛА <ArrowRight size={14} /></Link></div> : item.title === 'Неотложная медицина' ? <div className="category-links"><Link className="category-link" to="/calculators/qsofa">Открыть qSOFA <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/news2">Открыть NEWS2 <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/gcs">Открыть GCS <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/sofa">Открыть SOFA <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/sofa-2">Открыть SOFA-2 <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/apache-ii">Открыть APACHE II <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/saps-ii">Открыть SAPS II <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/rass-cam-icu">RASS / CAM-ICU · Седация и делирий <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/rts">RTS · Травматологическая оценка <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/iss">ISS · Тяжесть травмы <ArrowRight size={14} /></Link></div>  : item.title === 'Нефрология' ? <div className="category-links"><Link className="category-link" to="/calculators/egfr">eGFR · CKD-EPI 2021 <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/kdigo-aki">KDIGO · Стадирование ОПП <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/cockcroft-gault">Cockcroft–Gault · CrCl <ArrowRight size={14} /></Link></div> : item.title === 'Гепатология' ? <div className="category-links"><Link className="category-link" to="/calculators/fib-4">FIB-4 · Фиброз печени <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/child-pugh">Child–Pugh · Цирроз печени <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/meld-na">MELD-Na · Историческая модель <ArrowRight size={14} /></Link></div> : item.title === 'Гастроэнтерология' ? <div className="category-links"><Link className="category-link" to="/calculators/bisap">BISAP · Острый панкреатит <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/alvarado">Alvarado · Аппендицит <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/glasgow-blatchford">Glasgow-Blatchford · ЖКК <ArrowRight size={14} /></Link></div> : item.title === 'Онкология' ? <div className="category-links"><Link className="category-link" to="/calculators/performance-status">ECOG / Karnofsky · Функциональный статус <ArrowRight size={14} /></Link></div> : item.title === 'Фармакотерапия' ? <div className="category-links"><Link className="category-link" to="/calculators/vancomycin">Ванкомицин · AUC-ориентированный подход <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/vasopressors">Вазопрессоры · Скорость инфузии <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/unfractionated-heparin">Нефракционированный гепарин · UFH <ArrowRight size={14} /></Link></div> : item.title === 'Неврология' ? <div className="category-links"><Link className="category-link" to="/calculators/nihss">NIHSS · Шкала инсульта <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/mrs">mRS · Шкала Рэнкина <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/abcd2">ABCD² · Риск после ТИА <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/hunt-hess-wfns">Hunt–Hess / WFNS · аСАК <ArrowRight size={14} /></Link></div> : <span className="coming-soon">{item.count}</span>}
            </article>
          ))}
        </div>}
      </section>
      <footer className="footer"><span>© 2026 MediCalc Pro</span><span>Образовательный инструмент. Не заменяет клиническое решение специалиста.</span></footer>
    </main>
  )
}

function readVisibleResult(path: string): NewCalculationResult | null {
  const calculator = calculatorCatalog.find((item) => item.path === path)
  const panel = document.querySelector('.result-panel')
  if (!calculator || !panel) return null
  const scoreNode = panel.querySelector('.score-display strong')
  const unitNode = panel.querySelector('.score-display span')
  const fallbackNode = panel.querySelector('.result-summary b')
  const rawScore = scoreNode?.textContent?.trim() || fallbackNode?.textContent?.trim()
  if (!rawScore) return null
  const score = scoreNode && unitNode?.textContent?.trim()
    ? rawScore + ' ' + unitNode.textContent.trim()
    : rawScore
  const interpretationNode = panel.querySelector('.care-context b, .mortality-estimate b, .result-summary b')
  const riskNode = panel.querySelector('.risk-tag')
  const interpretation = interpretationNode?.textContent?.trim() || riskNode?.textContent?.trim() || 'Результат рассчитан'
  const riskClass = riskNode?.className || ''
  const riskLevel = riskClass.includes('risk-high') ? 'high'
    : riskClass.includes('risk-low') ? 'low' : 'moderate'
  return { path, name: calculator.title, score, interpretation, riskLevel }
}

function ResultActions() {
  const location = useLocation()
  const [hasResult, setHasResult] = useState(false)
  const [message, setMessage] = useState('')
  const [historyCount, setHistoryCount] = useState(0)
  const [basketCount, setBasketCount] = useState(0)

  useEffect(() => {
    setMessage('')
    const update = () => setHasResult(Boolean(readVisibleResult(location.pathname)))
    update()
    const observer = new MutationObserver(update)
    observer.observe(document.body, { childList: true, subtree: true, characterData: true })
    return () => observer.disconnect()
  }, [location.pathname])

  useEffect(() => {
    const storage = getRecentStorage()
    setHistoryCount(readCalculationHistory(calculatorPaths, storage).length)
    setBasketCount(readRiskBasket(calculatorPaths, storage).length)
  }, [location.pathname])

  if (!location.pathname.startsWith('/calculators/') || !hasResult) return null

  function saveResult(target: 'history' | 'basket') {
    const entry = readVisibleResult(location.pathname)
    const storage = getRecentStorage()
    if (!entry) {
      setMessage('Сначала выполните расчёт и убедитесь, что результат отображается.')
      return
    }
    if (!storage) {
      setMessage('Локальное хранилище недоступно. Результат не сохранён.')
      return
    }
    if (target === 'history') {
      const next = addCalculationHistory(entry, calculatorPaths, storage)
      setHistoryCount(next.length)
      setMessage('Результат сохранён в историю.')
    } else {
      const next = addRiskBasketItem(entry, calculatorPaths, storage)
      setBasketCount(next.length)
      setMessage('Результат добавлен в корзину риска.')
    }
  }

  return (
    <aside className="result-actions-dock" aria-label="Сохранение результата">
      <div><b>Сохранить результат?</b><span>Только итог и интерпретация, без введённых данных и персональных идентификаторов.</span></div>
      <button type="button" onClick={() => saveResult('history')}>В историю ({historyCount})</button>
      <button type="button" onClick={() => saveResult('basket')}>В корзину ({basketCount})</button>
      {message && <small role="status">{message}</small>}
    </aside>
  )
}

function App() {
  const location = useLocation()
  useEffect(() => {
    recordRecentCalculatorPath(location.pathname, calculatorPaths, getRecentStorage())
  }, [location.pathname])
  return <><Routes><Route path="/" element={<HomePage />} /><Route path="/calculators/curb-65" element={<CURB65Calculator />} /><Route path="/calculators/pf-ratio" element={<PFRatioCalculator />} /><Route path="/calculators/bode" element={<BODECalculator />} /><Route path="/calculators/psi" element={<PSICalculator />} /><Route path="/calculators/gold-abe" element={<GOLDABECalculator />} /><Route path="/calculators/spesi" element={<SPESICalculator />} /><Route path="/calculators/h2fpef" element={<H2FPEFCalculator />} /><Route path="/calculators/grace" element={<GRACECalculator />} /><Route path="/calculators/timi" element={<TIMICalculator />} /><Route path="/calculators/qtc" element={<QTCCalculator />} /><Route path="/calculators/heart" element={<HEARTCalculator />} /><Route path="/calculators/cha2ds2vasc-hasbled" element={<CHA2DS2VAScHASBLEDCalculator />} /><Route path="/calculators/wells-pe" element={<WellsPECalculator />} /><Route path="/calculators/wells-dvt" element={<WellsDVTCalculator />} /><Route path="/calculators/padua" element={<PaduaCalculator />} /><Route path="/calculators/4ts" element={<FourTsCalculator />} /><Route path="/calculators/dic-isth" element={<DICISTHCalculator />} /><Route path="/calculators/homa-ir" element={<HOMAIRCalculator />} /><Route path="/calculators/bmi" element={<BMICalculator />} /><Route path="/calculators/egfr" element={<EGFRCalculator />} /><Route path="/calculators/kdigo-aki" element={<KDIGOAKICalculator />} /><Route path="/calculators/cockcroft-gault" element={<CockcroftGaultCalculator />} /><Route path="/calculators/fib-4" element={<FIB4Calculator />} /><Route path="/calculators/child-pugh" element={<ChildPughCalculator />} /><Route path="/calculators/meld-na" element={<MELDNaCalculator />} /><Route path="/calculators/nihss" element={<NIHSSCalculator />} /><Route path="/calculators/mrs" element={<MRSCalculator />} /><Route path="/calculators/abcd2" element={<ABCD2Calculator />} /><Route path="/calculators/hunt-hess-wfns" element={<HuntHessWFNSCalculator />} /><Route path="/calculators/ventilation-basics" element={<VentilationBasicsCalculator />} /><Route path="/calculators/bisap" element={<BISAPCalculator />} /><Route path="/calculators/alvarado" element={<AlvaradoCalculator />} /><Route path="/calculators/glasgow-blatchford" element={<GlasgowBlatchfordCalculator />} /><Route path="/calculators/qsofa" element={<QSOFACalculator />} /><Route path="/calculators/news2" element={<NEWS2Calculator />} /><Route path="/calculators/gcs" element={<GCSCalculator />} /><Route path="/calculators/sofa" element={<SOFACalculator />} /><Route path="/calculators/sofa-2" element={<SOFA2Calculator />} /><Route path="/calculators/apache-ii" element={<APACHE2Calculator />} /><Route path="/calculators/saps-ii" element={<SAPS2Calculator />} /><Route path="/calculators/rass-cam-icu" element={<RASSCAMICUCalculator />} /><Route path="/calculators/rts" element={<RTSCalculator />} /><Route path="/calculators/iss" element={<ISSCalculator />} /><Route path="/calculators/performance-status" element={<PerformanceStatusCalculator />} /><Route path="/calculators/vancomycin" element={<VancomycinCalculator />} /><Route path="/calculators/vasopressors" element={<VasopressorsCalculator />} /><Route path="/calculators/unfractionated-heparin" element={<UnfractionatedHeparinCalculator />} /><Route path="*" element={<HomePage />} /></Routes><ResultActions /></>
}

export default App
