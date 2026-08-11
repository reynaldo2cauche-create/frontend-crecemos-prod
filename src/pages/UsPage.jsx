import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { initializePageScripts } from '../utils/initScripts';
import Reveal from '../components/public/Reveal';
import RevealText from '../components/public/RevealText';
import Decor from '../components/public/Decor';
import Counter from '../components/public/Counter';

const stats = [
  { to: 1000, suffix: '+', sep: true, label: 'Pacientes atendidos' },
  { to: 30000, suffix: '+', sep: true, label: 'Sesiones de terapia' },
  { to: 8, suffix: '+', sep: false, label: 'Años de experiencia' },
  { to: 100, suffix: '%', sep: false, label: 'Compromiso con la excelencia' },
];

const valores = [
  { icon: 'bi-heart-fill', title: 'Compromiso', desc: 'Nos dedicamos por completo al bienestar y progreso de cada paciente, con atención personalizada y de calidad.' },
  { icon: 'bi-people-fill', title: 'Profesionalismo', desc: 'Equipo altamente capacitado y en constante actualización para ofrecer las mejores terapias.' },
  { icon: 'bi-shield-fill-check', title: 'Confianza', desc: 'Relaciones sólidas basadas en transparencia, honestidad y respeto con pacientes y familias.' },
  { icon: 'bi-lightbulb-fill', title: 'Innovación', desc: 'Incorporamos nuevas metodologías y tecnologías para mejorar la efectividad de los tratamientos.' },
  { icon: 'bi-hand-thumbs-up-fill', title: 'Excelencia', desc: 'Superamos expectativas en cada servicio, con los más altos estándares de calidad.' },
  { icon: 'bi-emoji-smile-fill', title: 'Calidez humana', desc: 'Tratamos a cada paciente con cariño, respeto y comprensión, en un ambiente acogedor y seguro.' },
];

const UsPage = () => {
  useEffect(() => {
    initializePageScripts();
  }, []);

  return (
    <main className="cx-page">
      {/* ============================ ENCABEZADO =========================== */}
      <section className="cx-subhero">
        <Decor variant="b" />
        <div className="cx-container">
          <Reveal className="cx-subhero-inner">
            <span className="cx-eyebrow"><i className="bi bi-buildings" /> Quiénes somos</span>
            <RevealText as="h1" text="Conoce nuestra institución" />
            <p>Más de 8 años transformando vidas a través de terapias especializadas.</p>
            <nav className="cx-breadcrumb">
              <Link to="/">Inicio</Link>
              <i className="bi bi-chevron-right" />
              <span>Nosotros</span>
            </nav>
          </Reveal>
        </div>
      </section>

      {/* ============================= HISTORIA ============================ */}
      <section className="cx-section cx-section--deco">
        <Decor variant="a" />
        <div className="cx-container">
          <div className="cx-split">
            <Reveal className="cx-split-media" direction="right">
              <div className="cx-media">
                <img src="/assets/img/nosotros/historia.webp" alt="Centro de Terapias Crecemos" />
              </div>
            </Reveal>
            <div className="cx-split-body">
              <span className="cx-eyebrow"><i className="bi bi-clock-history" /> Nuestra trayectoria</span>
              <RevealText as="h2" text="Nuestra Historia" />
              <Reveal delay={0.1}>
                <p>
                  Somos una institución que desde su fundación en el <strong>2016</strong> ha
                  logrado una trayectoria exitosa en beneficio de todos sus pacientes.
                </p>
                <p>
                  Nos hemos especializado en terapias de rehabilitación para niños, adolescentes
                  y adultos, con más de <strong>2,000 pacientes atendidos y más de 30 mil sesiones
                  de terapia realizadas.</strong>
                </p>
                <p>
                  Nos caracteriza una atención confiable con <strong>profesionales capacitados y
                  actualizados</strong> en cada área, que brindan una <strong>terapia efectiva y,
                  sobre todo, un trato humano y cálido.</strong>
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ============================= MÉTRICAS =========================== */}
      <section className="cx-section cx-section--brand">
        <Decor variant="hero" />
        <div className="cx-container">
          <Reveal className="cx-section-head">
            <span className="cx-eyebrow"><i className="bi bi-graph-up-arrow" /> En números</span>
            <RevealText as="h2" text="Resultados que hablan por nosotros" />
          </Reveal>
          <div className="cx-mstats">
            {stats.map((s, i) => (
              <Reveal className="cx-mstat" key={s.label} delay={0.08 * i} y={22}>
                <span className="num">
                  <Counter to={s.to} suffix={s.suffix} separator={s.sep} />
                </span>
                <p>{s.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ========================= MISIÓN Y VISIÓN ======================== */}
      <section className="cx-section cx-section--deco cx-section--deco-r">
        <Decor variant="a" />
        <div className="cx-container">
          <div className="cx-mv">
            <Reveal className="cx-mv-card cx-mv-card--a" direction="right">
              <span className="ic"><i className="bi bi-bullseye" /></span>
              <h3>Misión</h3>
              <p>
                Brindar rehabilitación terapéutica integral a niños y adultos mediante terapias
                efectivas con profesionales actualizados en cada área.
              </p>
            </Reveal>
            <Reveal className="cx-mv-card cx-mv-card--b" direction="left" delay={0.1}>
              <span className="ic"><i className="bi bi-eye-fill" /></span>
              <h3>Visión</h3>
              <p>
                Ser la institución líder e innovadora en tratamiento terapéutico para niños y
                adultos en Lima Norte.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* =============================== ÁREAS ============================ */}
      <section className="cx-section cx-section--deco">
        <Decor variant="c" />
        <div className="cx-container">
          <Reveal className="cx-section-head">
            <span className="cx-eyebrow"><i className="bi bi-diagram-3" /> A quién acompañamos</span>
            <RevealText as="h2" text="Áreas que atendemos" />
            <p>Terapias especializadas para cada etapa de la vida, con un enfoque cálido y profesional.</p>
          </Reveal>
          <div className="cx-imgcards">
            {[
              { img: '/assets/img/index/Psicologia Infantil.webp', tag: 'Niños', title: 'Área Infantil', desc: 'Lenguaje, aprendizaje, terapia ocupacional y psicología infantil.' },
              { img: '/assets/img/index/area_adolescentes.webp', tag: 'Adolescentes', title: 'Área Adolescentes', desc: 'Acompañamiento emocional, conductual y orientación vocacional.' },
              { img: '/assets/img/index/area_adultos.webp', tag: 'Adultos', title: 'Área Adultos', desc: 'Psicoterapia, terapia de pareja, familiar y rehabilitación del habla.' },
            ].map((a, i) => (
              <Reveal className="cx-imgcard" key={a.title} delay={0.1 * i} y={24}>
                <img
                  src={a.img}
                  alt={a.title}
                  loading="lazy"
                  onError={(e) => { e.target.onerror = null; e.target.src = '/assets/img/about-2.webp'; }}
                />
                <div className="cx-imgcard-body">
                  <span className="cx-imgcard-tag">{a.tag}</span>
                  <h3>{a.title}</h3>
                  <p>{a.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== VALORES =========================== */}
      <section className="cx-section cx-section--deco">
        <Decor variant="b" />
        <div className="cx-container">
          <Reveal className="cx-section-head">
            <span className="cx-eyebrow"><i className="bi bi-gem" /> Lo que nos define</span>
            <RevealText as="h2" text="Nuestros Valores" />
            <p>Los principios que guían nuestro trabajo diario y nos comprometen con la excelencia en el cuidado de cada paciente.</p>
          </Reveal>
          <div className="cx-cards cx-cards--tint">
            {valores.map((v, i) => (
              <Reveal className="cx-card" key={v.title} delay={0.06 * i} y={18}>
                <span className="ic"><i className={`bi ${v.icon}`} /></span>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== CTA FINAL ========================= */}
      <section className="cx-section">
        <div className="cx-container">
          <Reveal className="cx-cta-band" y={30}>
            <span className="cx-cta-glow" aria-hidden="true" />
            <span className="cx-cta-glow cx-cta-glow--2" aria-hidden="true" />
            <div className="cx-cta-content">
              <span className="cx-cta-eyebrow"><i className="bi bi-stars" /> Da el primer paso</span>
              <RevealText as="h2" text="¿Listo para comenzar tu rehabilitación?" />
              <p>Estamos comprometidos con nuestros pacientes y sus familias. Este modelo de atención integral es el que vivimos cada día.</p>
              <div className="cx-cta-actions">
                <Link to="/contactanos" className="cx-btn cx-cta-btn">
                  <span>Contáctanos</span>
                  <i className="bi bi-arrow-right" />
                </Link>
                <Link to="/servicios" className="cx-btn cx-cta-btn-ghost">
                  Ver servicios
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
};

export default UsPage;
