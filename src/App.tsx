import { Activity, ArrowRight, BookOpen, Calculator, Search, ShieldCheck, Smartphone } from 'lucide-react'
import { Link, Route, Routes } from 'react-router-dom'
import CURB65Calculator from './calculators/pulmonology/CURB65Calculator'
import PFRatioCalculator from './calculators/pulmonology/PFRatioCalculator'
import BODECalculator from './calculators/pulmonology/BODECalculator'
import PSICalculator from './calculators/pulmonology/PSICalculator'
import GOLDABECalculator from './calculators/pulmonology/GOLDABECalculator'
import H2FPEFCalculator from './calculators/cardiology/H2FPEFCalculator'
import GRACECalculator from './calculators/cardiology/GRACECalculator'
import TIMICalculator from './calculators/cardiology/TIMICalculator'
import QTCCalculator from './calculators/cardiology/QTCCalculator'
import HEARTCalculator from './calculators/cardiology/HEARTCalculator'
import CHA2DS2VAScHASBLEDCalculator from './calculators/cardiology/CHA2DS2VAScHASBLEDCalculator'
import WellsPECalculator from './calculators/hematology/WellsPECalculator'
import FourTsCalculator from './calculators/hematology/FourTsCalculator'
import DICISTHCalculator from './calculators/hematology/DICISTHCalculator'
import HOMAIRCalculator from './calculators/endocrinology/HOMAIRCalculator'
import BMICalculator from './calculators/endocrinology/BMICalculator'
import EGFRCalculator from './calculators/nephrology/EGFRCalculator'
import FIB4Calculator from './calculators/hepatology/FIB4Calculator'
import NIHSSCalculator from './calculators/neurology/NIHSSCalculator'
import MRSCalculator from './calculators/neurology/MRSCalculator'
import QSOFACalculator from './calculators/emergency/QSOFACalculator'
import NEWS2Calculator from './calculators/emergency/NEWS2Calculator'
import GCSCalculator from './calculators/emergency/GCSCalculator'
import SOFACalculator from './calculators/emergency/SOFACalculator'
import SOFA2Calculator from './calculators/emergency/SOFA2Calculator'
import APACHE2Calculator from './calculators/emergency/APACHE2Calculator'
import SAPS2Calculator from './calculators/emergency/SAPS2Calculator'
import VentilationBasicsCalculator from './calculators/pulmonology/VentilationBasicsCalculator'

const categories = [
  { title: 'Кардиология', description: 'Шкалы и расчёты для оценки сердечно-сосудистого риска', count: '6 калькуляторов', active: true },
  { title: 'Гематология', description: 'Оценка тромбоэмболического риска и нарушений гемостаза', count: '3 калькулятора', active: true },
  { title: 'Эндокринология', description: 'Метаболические показатели и оценка инсулинорезистентности', count: '2 калькулятора', active: true },
  { title: 'Пульмонология', description: 'Респираторные шкалы и показатели', count: '6 калькуляторов', active: true },
  { title: 'Нефрология', description: 'Функция почек и связанные расчёты', count: '1 калькулятор', active: true },
  { title: 'Гепатология', description: 'Неинвазивная оценка риска заболеваний печени', count: '1 калькулятор', active: true },
  { title: 'Неврология', description: 'Шкалы оценки неврологического дефицита и функционального исхода', count: '2 калькулятора', active: true },
  { title: 'Неотложная медицина', description: 'Оценка тяжести состояния и клинические шкалы', count: '7 калькуляторов', active: true },
]

function HomePage() {
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
      <section className="catalog" id="categories">
        <div className="section-heading">
          <div><div className="eyebrow">БИБЛИОТЕКА ИНСТРУМЕНТОВ</div><h2>Категории</h2></div>
          <span className="catalog-hint"><Search size={15} /> Каталог будет пополняться</span>
        </div>
        <div className="category-grid">
          {categories.map((item, index) => (
            <article className={`category-card ${item.active ? 'category-card-active' : ''}`} key={item.title}>
              <div className="category-index">0{index + 1}</div><h3>{item.title}</h3><p>{item.description}</p>
              {item.title === 'Кардиология' ? <div className="category-links"><Link className="category-link" to="/calculators/h2fpef">H₂FPEF Score <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/grace">GRACE Score <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/timi">TIMI Risk <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/qtc">Корригированный QT (QTc) <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/heart">HEART Score <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/cha2ds2vasc-hasbled">CHA₂DS₂-VASc + HAS-BLED <ArrowRight size={14} /></Link></div> : item.title === 'Гематология' ? <div className="category-links"><Link className="category-link" to="/calculators/wells-pe">Wells Score — ТЭЛА <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/4ts">4Ts Score — ГИТ <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/dic-isth">ISTH DIC Score <ArrowRight size={14} /></Link></div> : item.title === 'Эндокринология' ? <div className="category-links"><Link className="category-link" to="/calculators/homa-ir">HOMA1-IR <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/bmi">Калькулятор ИМТ <ArrowRight size={14} /></Link></div> : item.title === 'Пульмонология' ? <div className="category-links"><Link className="category-link" to="/calculators/curb-65">Открыть CURB-65 <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/pf-ratio">PaO₂/FiO₂ <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/bode">BODE Index <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/psi">PSI / PORT <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/ventilation-basics">PBW и дыхательный объём <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/gold-abe">GOLD ABE <ArrowRight size={14} /></Link></div> : item.title === 'Неотложная медицина' ? <div className="category-links"><Link className="category-link" to="/calculators/qsofa">Открыть qSOFA <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/news2">Открыть NEWS2 <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/gcs">Открыть GCS <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/sofa">Открыть SOFA <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/sofa-2">Открыть SOFA-2 <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/apache-ii">Открыть APACHE II <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/saps-ii">Открыть SAPS II <ArrowRight size={14} /></Link></div>  : item.title === 'Нефрология' ? <div className="category-links"><Link className="category-link" to="/calculators/egfr">eGFR · CKD-EPI 2021 <ArrowRight size={14} /></Link></div> : item.title === 'Гепатология' ? <div className="category-links"><Link className="category-link" to="/calculators/fib-4">FIB-4 · Фиброз печени <ArrowRight size={14} /></Link></div> : item.title === 'Неврология' ? <div className="category-links"><Link className="category-link" to="/calculators/nihss">NIHSS · Шкала инсульта <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/mrs">mRS · Шкала Рэнкина <ArrowRight size={14} /></Link></div> : <span className="coming-soon">{item.count}</span>}
            </article>
          ))}
        </div>
      </section>
      <footer className="footer"><span>© 2026 MediCalc Pro</span><span>Образовательный инструмент. Не заменяет клиническое решение специалиста.</span></footer>
    </main>
  )
}

function App() {
  return <Routes><Route path="/" element={<HomePage />} /><Route path="/calculators/curb-65" element={<CURB65Calculator />} /><Route path="/calculators/pf-ratio" element={<PFRatioCalculator />} /><Route path="/calculators/bode" element={<BODECalculator />} /><Route path="/calculators/psi" element={<PSICalculator />} /><Route path="/calculators/gold-abe" element={<GOLDABECalculator />} /><Route path="/calculators/h2fpef" element={<H2FPEFCalculator />} /><Route path="/calculators/grace" element={<GRACECalculator />} /><Route path="/calculators/timi" element={<TIMICalculator />} /><Route path="/calculators/qtc" element={<QTCCalculator />} /><Route path="/calculators/heart" element={<HEARTCalculator />} /><Route path="/calculators/cha2ds2vasc-hasbled" element={<CHA2DS2VAScHASBLEDCalculator />} /><Route path="/calculators/wells-pe" element={<WellsPECalculator />} /><Route path="/calculators/4ts" element={<FourTsCalculator />} /><Route path="/calculators/dic-isth" element={<DICISTHCalculator />} /><Route path="/calculators/homa-ir" element={<HOMAIRCalculator />} /><Route path="/calculators/bmi" element={<BMICalculator />} /><Route path="/calculators/egfr" element={<EGFRCalculator />} /><Route path="/calculators/fib-4" element={<FIB4Calculator />} /><Route path="/calculators/nihss" element={<NIHSSCalculator />} /><Route path="/calculators/mrs" element={<MRSCalculator />} /><Route path="/calculators/ventilation-basics" element={<VentilationBasicsCalculator />} /><Route path="/calculators/qsofa" element={<QSOFACalculator />} /><Route path="/calculators/news2" element={<NEWS2Calculator />} /><Route path="/calculators/gcs" element={<GCSCalculator />} /><Route path="/calculators/sofa" element={<SOFACalculator />} /><Route path="/calculators/sofa-2" element={<SOFA2Calculator />} /><Route path="/calculators/apache-ii" element={<APACHE2Calculator />} /><Route path="/calculators/saps-ii" element={<SAPS2Calculator />} /><Route path="*" element={<HomePage />} /></Routes>
}

export default App
