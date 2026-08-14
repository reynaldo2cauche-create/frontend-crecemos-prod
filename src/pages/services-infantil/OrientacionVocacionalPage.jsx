import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { initializePageScripts } from '../../utils/initScripts';
import Reveal from '../../components/public/Reveal';
import RevealText from '../../components/public/RevealText';
import Decor from '../../components/public/Decor';

const bloques = [
  {
    eyebrow: '¿Por qué es importante?',
    icon: 'bi-stars',
    titulo: '¿Por qué es importante?',
    intro: 'Elegir una carrera es una de las decisiones más importantes de la vida. Una buena orientación vocacional permite:',
    imagen: '/assets/img/servicios/porqueelegircarrera.webp',
    puntos: [
      'Identificar habilidades, intereses y valores personales.',
      'Explorar opciones de estudio y profesiones acordes al perfil.',
      'Evitar frustraciones y cambios de carrera innecesarios.',
      'Fomentar la motivación y seguridad en la elección profesional.',
    ],
    rev: false,
  },
  {
    eyebrow: '¿A quién está dirigido?',
    icon: 'bi-people',
    titulo: '¿A quién está dirigido?',
    intro: 'Nuestro servicio de orientación vocacional está diseñado para distintos perfiles:',
    imagen: '/assets/img/servicios/aquienorientacion.webp',
    puntos: [
      'Estudiantes de secundaria que aún no deciden qué carrera seguir.',
      'Jóvenes que desean confirmar si su elección es la adecuada.',
      'Personas que buscan cambiar de profesión o especializarse.',
    ],
    rev: true,
  },
  {
    eyebrow: '¿Cómo es el proceso?',
    icon: 'bi-signpost-2',
    titulo: '¿Cómo es el proceso?',
    intro: 'Ofrecemos un proceso integral y personalizado que incluye:',
    imagen: '/assets/img/servicios/procesoorientacion.webp',
    puntos: [
      'Evaluaciones psicométricas y test vocacionales.',
      'Análisis de intereses, habilidades y aptitudes.',
      'Asesoramiento individualizado con un especialista.',
      'Información sobre el campo laboral y tendencias del mercado.',
    ],
    nota: 'Toma una decisión informada y construye tu futuro con confianza.',
    rev: false,
  },
];

const profesionales = [
  {
    nombre: 'Lic. Giselle Burgos',
    cargo: 'Psicología',
    credLabel: 'CPsP',
    credNumero: '66683',
    imagen: '/assets/img/servicios/Lic. Giselle (1).webp',
  },
];

const OrientacionVocacionalPage = () => {
  useEffect(() => {
    initializePageScripts();
  }, []);

  return (
    <main className="cx-page">
      {/* ============================ ENCABEZADO =========================== */}
      <section className="cx-subhero">
        <Decor variant="a" />
        <div className="cx-container">
          <Reveal className="cx-subhero-inner">
            <span className="cx-eyebrow"><i className="bi bi-compass" /> Área Infantil y Adolescentes</span>
            <RevealText as="h1" text="Orientación Vocacional" />
            <p>
              Te ayudamos a descubrir tu vocación, intereses y habilidades para tomar decisiones
              acertadas sobre tu futuro académico y profesional, con especialistas calificados.
            </p>
            <nav className="cx-breadcrumb">
              <Link to="/">Inicio</Link>
              <i className="bi bi-chevron-right" />
              <Link to="/servicios">Servicios</Link>
              <i className="bi bi-chevron-right" />
              <span>Orientación Vocacional</span>
            </nav>
          </Reveal>
        </div>
      </section>

      {/* ===================== BLOQUES (antes tabs, ahora inline) ========== */}
      {bloques.map((b, i) => (
        <section
          key={b.titulo}
          className={`cx-section ${i % 2 === 0 ? 'cx-section--soft' : 'cx-section--deco'}`}
        >
          {i % 2 !== 0 && <Decor variant="b" />}
          <div className="cx-container">
            <div className={`cx-split ${b.rev ? 'cx-split--rev' : ''}`}>
              <Reveal className="cx-media" direction={b.rev ? 'left' : 'right'} y={0}>
                <img src={b.imagen} alt={b.titulo} loading="lazy" />
              </Reveal>

              <Reveal className="cx-split-body" direction={b.rev ? 'right' : 'left'} y={0} delay={0.1}>
                <span className="cx-eyebrow"><i className={`bi ${b.icon}`} /> {b.eyebrow}</span>
                <RevealText as="h2" text={b.titulo} />
                <p>{b.intro}</p>
                <ul className="cx-checks">
                  {b.puntos.map((pt) => (
                    <li key={pt}><i className="bi bi-check-circle-fill" /><span>{pt}</span></li>
                  ))}
                </ul>
                {b.nota && (
                  <p><i className="bi bi-lightbulb-fill" style={{ color: 'var(--cx-primary)' }} /> {b.nota}</p>
                )}
              </Reveal>
            </div>
          </div>
        </section>
      ))}

      {/* ============================ PROFESIONALES ======================= */}
      <section className="cx-section cx-section--tight cx-section--alt">
        <Decor variant="b" />
        <div className="cx-container">
          <Reveal className="cx-section-head">
            <span className="cx-eyebrow"><i className="bi bi-person-badge" /> Nuestro equipo</span>
            <RevealText as="h2" text="Profesionales" />
            <p>Conoce a la especialista encargada de brindar la orientación vocacional.</p>
          </Reveal>

          <div className="cx-pros">
            {profesionales.map((p, i) => (
              <Reveal className="cx-pro" key={p.credNumero} delay={0.08 * i} y={22}>
                <div className="cx-pro-media">
                  <img src={p.imagen} alt={p.nombre} loading="lazy" />
                </div>
                <span className="cx-pro-hint"><i className="bi bi-hand-index-thumb" /> Ver información</span>
                <div className="cx-pro-panel">
                  <span className="cx-pro-role"><i className="bi bi-heart-pulse" /> {p.cargo}</span>
                  <h3>{p.nombre}</h3>
                  <span className="cx-pro-cred">
                    <i className="bi bi-award-fill" /> {p.credLabel} <b>{p.credNumero}</b>
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== CTA FINAL ========================= */}
      <section className="cx-section cx-section--pt-sm">
        <div className="cx-container">
          <Reveal className="cx-cta-band" y={30}>
            <span className="cx-cta-glow" aria-hidden="true" />
            <span className="cx-cta-glow cx-cta-glow--2" aria-hidden="true" />
            <div className="cx-cta-content">
              <span className="cx-cta-eyebrow"><i className="bi bi-calendar-check" /> Estamos para ayudarte</span>
              <RevealText as="h2" text="Descubre tu carrera ideal" />
              <p>Agenda tu evaluación vocacional y toma una decisión informada sobre tu futuro, con acompañamiento profesional.</p>
              <div className="cx-cta-actions">
                <Link to="/contactanos" className="cx-btn cx-cta-btn">
                  <span>Reservar cita</span>
                  <i className="bi bi-arrow-right" />
                </Link>
                <Link to="/servicios" className="cx-btn cx-cta-btn-ghost">
                  Ver más servicios
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
};

export default OrientacionVocacionalPage;
