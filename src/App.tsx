import { Activity, ArrowRight, BookOpen, Calculator, Search, ShieldCheck, Smartphone } from 'lucide-react'
import { Link, Route, Routes } from 'react-router-dom'
import CURB65Calculator from './calculators/pulmonology/CURB65Calculator'
import QSOFACalculator from './calculators/emergency/QSOFACalculator'
import NEWS2Calculator from './calculators/emergency/NEWS2Calculator'
import GCSCalculator from './calculators/emergency/GCSCalculator'
import SOFACalculator from './calculators/emergency/SOFACalculator'
import SOFA2Calculator from './calculators/emergency/SOFA2Calculator'
import APACHE2Calculator from './calculators/emergency/APACHE2Calculator'

const categories = [
  { title: 'Кардиология', description: 'Шкалы и расчёты для оценки сердечно-сосудистого риска', count: 'Скоро' },
  { title: 'Пульмонология', description: 'Респираторные шкалы и показатели', count: '1 калькулятор', active: true },
  { title: 'Нефрология', description: 'Функция почек и связанные расчёты', count: 'Скоро' },
  { title: 'Неотложная медицина', description: 'Оценка тяжести состояния и клинические шкалы', count: '6 калькуляторов', active: true },
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
              {item.title === 'Пульмонология' ? <Link className="category-link" to="/calculators/curb-65">Открыть CURB-65 <ArrowRight size={14} /></Link> : item.title === 'Неотложная медицина' ? <div className="category-links"><Link className="category-link" to="/calculators/qsofa">Открыть qSOFA <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/news2">Открыть NEWS2 <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/gcs">Открыть GCS <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/sofa">Открыть SOFA <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/sofa-2">Открыть SOFA-2 <ArrowRight size={14} /></Link><Link className="category-link" to="/calculators/apache-ii">Открыть APACHE II <ArrowRight size={14} /></Link></div> : <span className="coming-soon">{item.count}</span>}
            </article>
          ))}
        </div>
      </section>
      <footer className="footer"><span>© 2026 MediCalc Pro</span><span>Образовательный инструмент. Не заменяет клиническое решение специалиста.</span></footer>
    </main>
  )
}

function App() {
  return <Routes><Route path="/" element={<HomePage />} /><Route path="/calculators/curb-65" element={<CURB65Calculator />} /><Route path="/calculators/qsofa" element={<QSOFACalculator />} /><Route path="/calculators/news2" element={<NEWS2Calculator />} /><Route path="/calculators/gcs" element={<GCSCalculator />} /><Route path="/calculators/sofa" element={<SOFACalculator />} /><Route path="/calculators/sofa-2" element={<SOFA2Calculator />} /><Route path="/calculators/apache-ii" element={<APACHE2Calculator />} /><Route path="*" element={<HomePage />} /></Routes>
}

export default App
