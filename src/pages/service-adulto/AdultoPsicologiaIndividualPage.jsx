import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { initializePageScripts } from '../../utils/initScripts';
import Reveal from '../../components/public/Reveal';
import RevealText from '../../components/public/RevealText';
import Decor from '../../components/public/Decor';

const bloques = [
  {
    eyebrow: '¿Qué es?',
    icon: 'bi-chat-heart',
    titulo: '¿Qué es la psicoterapia individual?',
    intro: 'Un espacio seguro y confidencial donde puedes expresar tus emociones, comprender tus pensamientos y trabajar en tu bienestar emocional.',
    imagen: '/assets/img/servicios/queespsicoterapia.webp',
    puntos: [
      'Sesiones presenciales y virtuales disponibles.',
      'Acompañamiento de psicólogos especializados.',
      'Total confidencialidad y sin juicios.',
    ],
    nota: 'Prioriza tu bienestar: da el primer paso hacia tu equilibrio emocional.',
    rev: false,
  },
  {
    eyebrow: 'Señales',
    icon: 'bi-clipboard-check',
    titulo: '¿Cuándo acudir a terapia?',
    intro: 'Considera iniciar un proceso si presentas:',
    imagen: '/assets/img/servicios/cuandoirapsicoterapia.webp',
    puntos: [
      'Ansiedad, estrés o depresión.',
      'Dificultades en la toma de decisiones.',
      'Problemas de autoestima o inseguridad.',
      'Procesos de duelo o cambios importantes.',
      'Manejo de emociones y relaciones personales.',
    ],
    rev: true,
  },
  {
    eyebrow: 'Nuestro enfoque',
    icon: 'bi-heart-pulse',
    titulo: '¿Cómo te ayudamos?',
    intro: 'Trabajamos contigo con herramientas prácticas y acompañamiento cercano:',
    imagen: '/assets/img/servicios/comoloayudamos.webp',
    puntos: [
      'Técnicas para gestionar emociones y pensamientos negativos.',
      'Desarrollo de habilidades para afrontar desafíos personales.',
      'Apoyo en la resolución de conflictos y toma de decisiones.',
      'Acompañamiento en procesos de crecimiento personal.',
    ],
    nota: 'Reserva tu cita y comienza tu proceso de cambio.',
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

export const AdultoPsicologiaIndividualPage = () => {
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
            <span className="cx-eyebrow"><i className="bi bi-person-check" /> Área Adultos</span>
            <RevealText as="h1" text="Psicoterapia Individual" />
            <p>
              Un espacio seguro y confidencial para explorar tus emociones, pensamientos y conductas,
              fortaleciendo tu bienestar y tu capacidad de afrontar los retos de la vida.
            </p>
            <nav className="cx-breadcrumb">
              <Link to="/">Inicio</Link>
              <i className="bi bi-chevron-right" />
              <Link to="/servicios">Servicios</Link>
              <i className="bi bi-chevron-right" />
              <span>Psicoterapia Individual</span>
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
                  <p><i className="bi bi-stars" style={{ color: 'var(--cx-primary)' }} /> {b.nota}</p>
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
            <p>Conoce a la especialista encargada de brindar la psicoterapia individual.</p>
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
              <span className="cx-cta-eyebrow"><i className="bi bi-chat-heart" /> Estamos para ayudarte</span>
              <RevealText as="h2" text="Da el primer paso hacia tu bienestar" />
              <p>Escríbenos y coordina tu primera sesión, presencial o virtual. Te acompañamos sin juicios y con total confidencialidad.</p>
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

export default AdultoPsicologiaIndividualPage;
