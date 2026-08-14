import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { initializePageScripts } from '../../utils/initScripts';
import Reveal from '../../components/public/Reveal';
import RevealText from '../../components/public/RevealText';
import Decor from '../../components/public/Decor';

const bloques = [
  {
    eyebrow: '¿Qué es?',
    icon: 'bi-mic',
    titulo: '¿Qué es la terapia de lenguaje en adultos?',
    intro: 'Está dirigida a personas con dificultades en la comunicación por trastornos neurológicos, accidentes cerebrovasculares, enfermedades degenerativas o problemas adquiridos.',
    imagen: '/assets/img/servicios/queeslenguajeadulto.webp',
    puntos: [
      'Sesiones presenciales y virtuales disponibles.',
      'Acompañamiento de terapeutas especializados.',
      'Plan de rehabilitación adaptado a cada caso.',
    ],
    nota: 'Mejora tu comunicación y tu calidad de vida.',
    rev: false,
  },
  {
    eyebrow: 'Señales',
    icon: 'bi-clipboard-check',
    titulo: '¿Cuándo acudir a terapia?',
    intro: 'Considera una evaluación si presentas:',
    imagen: '/assets/img/servicios/cuandoirlenguajeadulto.webp',
    puntos: [
      'Dificultades en la pronunciación o articulación.',
      'Problemas en la fluidez verbal (tartamudez).',
      'Trastornos del lenguaje por ACV o traumatismos.',
      'Dificultades en la comprensión y expresión del lenguaje.',
      'Pérdida de la voz o alteraciones en la comunicación.',
      'Problemas de deglución o disfagia.',
    ],
    rev: true,
  },
  {
    eyebrow: 'Nuestro enfoque',
    icon: 'bi-activity',
    titulo: '¿Cómo te ayudamos?',
    intro: 'Trabajamos la rehabilitación con ejercicios y estrategias específicas:',
    imagen: '/assets/img/servicios/procesorlenguajeadulto.webp',
    puntos: [
      'Rehabilitación del habla y la comunicación.',
      'Ejercicios para mejorar la articulación y fluidez verbal.',
      'Estrategias para recuperar y fortalecer la voz.',
      'Apoyo en la comprensión y producción del lenguaje.',
      'Terapia para mejorar la deglución.',
    ],
    nota: 'Reserva tu cita y comienza tu recuperación.',
    rev: false,
  },
];

const profesionales = [
  {
    nombre: 'Lic. Merlín Fernández',
    cargo: 'Terapeuta de Lenguaje',
    credLabel: 'CTMP',
    credNumero: '12937',
    imagen: '/assets/img/servicios/merlin.webp',
  },
];

const AdultoTerapiaLenguajePage = () => {
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
            <span className="cx-eyebrow"><i className="bi bi-mic" /> Área Adultos</span>
            <RevealText as="h1" text="Terapia de Lenguaje en Adultos" />
            <p>
              Para personas con dificultades de comunicación por trastornos neurológicos, ACV
              o enfermedades degenerativas, con un plan de rehabilitación personalizado.
            </p>
            <nav className="cx-breadcrumb">
              <Link to="/">Inicio</Link>
              <i className="bi bi-chevron-right" />
              <Link to="/servicios">Servicios</Link>
              <i className="bi bi-chevron-right" />
              <span>Terapia de Lenguaje en Adultos</span>
            </nav>
          </Reveal>
        </div>
      </section>

      {/* ===================== BLOQUES (inline, sin tabs) ================= */}
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
                  <p><i className="bi bi-chat-dots" style={{ color: 'var(--cx-primary)' }} /> {b.nota}</p>
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
            <p>Conoce a la especialista encargada de brindar la terapia de lenguaje.</p>
          </Reveal>

          <div className="cx-pros">
            {profesionales.map((p, i) => (
              <Reveal className="cx-pro" key={p.credNumero} delay={0.08 * i} y={22}>
                <div className="cx-pro-media">
                  <img src={p.imagen} alt={p.nombre} loading="lazy" />
                </div>
                <span className="cx-pro-hint"><i className="bi bi-hand-index-thumb" /> Ver información</span>
                <div className="cx-pro-panel">
                  <span className="cx-pro-role"><i className="bi bi-chat-dots" /> {p.cargo}</span>
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
              <span className="cx-cta-eyebrow"><i className="bi bi-mic" /> Estamos para ayudarte</span>
              <RevealText as="h2" text="Recupera tu comunicación" />
              <p>Escríbenos y coordina una evaluación, presencial o virtual. Diseñamos un plan de rehabilitación a tu medida.</p>
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

export default AdultoTerapiaLenguajePage;
