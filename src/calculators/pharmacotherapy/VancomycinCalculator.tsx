import { ArrowLeft, BookOpen, ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { VANCOMYCIN_CALCULATOR_STATUS } from './vancomycin'
import { VANCOMYCIN_REFERENCE } from './vancomycin.reference'

export default function VancomycinCalculator() {
  return (
    <main className="app-shell calculator-shell">
      <div className="calculator-topline">
        <Link className="back-link" to="/"><ArrowLeft size={16} /> Все калькуляторы</Link>
        <span className="version-label">ФАРМАКОТЕРАПИЯ · ВАНКОМИЦИН</span>
      </div>
      <section className="calculator-heading">
        <div className="eyebrow"><span className="pulse-dot" /> AUC-ОРИЕНТИРОВАННЫЙ МОНИТОРИНГ</div>
        <h1>Ванкомицин</h1>
        <p>Справочная информация по терапевтическому лекарственному мониторингу. Расчёт дозы временно отключён до уточнения клинической популяции и сценария применения.</p>
      </section>
      <section className="result-panel" aria-live="polite">
        <div className="result-topline">
          <span className="panel-kicker">СТАТУС ИНСТРУМЕНТА</span>
          <span className="risk-tag risk-moderate">Расчёт временно отключён</span>
        </div>
        <div className="clinical-warning">
          <ShieldAlert size={16} />
          <span>{VANCOMYCIN_CALCULATOR_STATUS.reason} Не используйте прежние весовые диапазоны как готовое назначение.</span>
        </div>
        <div className="threshold-panel">
          <h3>Почему расчёт отключён</h3>
          <p>Консенсус ASHP/IDSA/PIDS/SIDP 2020 не устанавливает один универсальный весовой режим для всех взрослых. Нагрузочные дозы 20–25 мг/кг (максимум 3000 мг) и 20–35 мг/кг относятся к разным описанным клиническим контекстам; поддерживающая схема зависит от функции почек и индивидуальной фармакокинетики.</p>
          <p>Российские клинические рекомендации содержат режимы для отдельных заболеваний и популяций. Их нельзя объединять в одну общую схему ванкомицина.</p>
        </div>
        <div className="info-panel">
          <div className="info-icon"><BookOpen size={18} /></div>
          <h3>Целевой AUC — только в определённом контексте</h3>
          <p>AUC24/MIC 400–600 мг·ч/л при MIC 1 мг/л относится к серьёзным инвазивным MRSA-инфекциям. Это справочная цель мониторинга, а не рассчитанный результат данного инструмента.</p>
          <p>Для оценки экспозиции используют валидированный Bayesian-подход или фармакокинетическую оценку по концентрациям препарата. Данный экран AUC не рассчитывает.</p>
        </div>
      </section>
      <section className="reference-panel">
        <div><span className="panel-kicker">ИСТОЧНИК И МЕТОДИКА</span><h2>{VANCOMYCIN_REFERENCE.title}</h2><p>{VANCOMYCIN_REFERENCE.guideline}</p></div>
        <a href={VANCOMYCIN_REFERENCE.guidelineUrl} target="_blank" rel="noreferrer">Открыть руководство IDSA ↗</a>
        <small><a href={VANCOMYCIN_REFERENCE.publicationUrl} target="_blank" rel="noreferrer">Публикация консенсуса 2020 ↗</a> Проверено: {VANCOMYCIN_REFERENCE.accessed}.</small>
      </section>
      <p className="calculator-disclaimer">Информационный экран не рассчитывает нагрузочную или поддерживающую дозу, интервал, клиренс либо AUC. Не является назначением лечения. Применяйте действующие российские клинические рекомендации для конкретного показания и популяции; индивидуальный режим и мониторинг определяет лечащая команда с участием клинического фармаколога.</p>
    </main>
  )
}
