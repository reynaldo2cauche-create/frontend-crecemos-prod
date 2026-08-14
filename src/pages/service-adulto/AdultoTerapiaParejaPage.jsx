import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { initializePageScripts } from '../../utils/initScripts';
import Reveal from '../../components/public/Reveal';
import RevealText from '../../components/public/RevealText';
import Decor from '../../components/public/Decor';

const bloques = [
  {
    eyebrow: '¿Qué es?',
    icon: 'bi-heart-fill',
    titulo: '¿Qué es la terapia de pareja?',
    intro: 'La relación de pareja enfrenta desafíos a lo largo del tiempo, desde problemas de comunicación hasta conflictos emocionales o cambios en la dinámica familiar. Nuestra terapia ayuda a fortalecer el vínculo, mejorar la convivencia y construir una relación más saludable.',
    imagen: '/assets/img/servicios/queesterapiapeareja.webp',
    puntos: [
      'Sesiones presenciales y virtuales disponibles.',
      'Acompañamiento de especialistas en terapia de pareja.',
      'Un espacio neutral, empático y confidencial.',
    ],
    nota: 'No esperes a que los problemas se agraven: fortalece tu relación hoy.',
    rev: false,
  },
  {
    eyebrow: 'Señales',
    icon: 'bi-clipboard-check',
    titulo: '¿Cuándo acudir a terapia de pareja?',
    intro: 'Es un buen momento para acudir si notan:',
    imagen: '/assets/img/servicios/cuandoirterapiaparema.webp',
    puntos: [
      'Dificultades en la comunicación y malentendidos frecuentes.',
      'Conflictos constantes sin solución efectiva.',
      'Falta de confianza o situaciones de infidelidad.',
      'Pérdida de conexión emocional o afectiva.',
      'Estrés por cambios familiares o laborales.',
      'Diferencias en la crianza o en la toma de decisiones.',
      'Sensación de estancamiento en la relación.',
    ],
    rev: true,
  },
  {
    eyebrow: 'Nuestro enfoque',
    icon: 'bi-signpost-2',
    titulo: '¿Cómo trabajamos?',
    intro: 'Acompañamos a la pareja con un proceso claro y práctico:',
    imagen: '/assets/img/servicios/procesoterapiapareja.webp',
    puntos: [
      'Evaluación inicial: identificamos los principales problemas y necesidades.',
      'Técnicas efectivas de comunicación y resolución de conflictos.',
      'Estrategias para fortalecer la relación y recuperar la confianza.',
      'Espacios de escucha activa y empatía para mejorar la convivencia.',
    ],
    nota: 'Reserven su cita y comiencen su proceso de cambio.',
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

const AdultoTerapiaParejaPage = () => {
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
            <span className="cx-eyebrow"><i className="bi bi-heart-fill" /> Área Adultos</span>
            <RevealText as="h1" text="Terapia de Pareja" />
            <p>
              Acompañamos a las parejas a mejorar su comunicación, fortalecer la confianza
              y resolver conflictos, promoviendo relaciones saludables y duraderas.
            </p>
            <nav className="cx-breadcrumb">
              <Link to="/">Inicio</Link>
              <i className="bi bi-chevron-right" />
              <Link to="/servicios">Servicios</Link>
              <i className="bi bi-chevron-right" />
              <span>Terapia de Pareja</span>
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
                  <p><i className="bi bi-heart" style={{ color: 'var(--cx-primary)' }} /> {b.nota}</p>
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
            <p>Conoce a la especialista encargada de brindar la terapia de pareja.</p>
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
              <span className="cx-cta-eyebrow"><i className="bi bi-heart-fill" /> Estamos para ayudarte</span>
              <RevealText as="h2" text="Fortalezcan su relación juntos" />
              <p>Escríbenos y coordina su primera sesión, presencial o virtual. Un espacio neutral y confidencial para reconectar.</p>
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

export default AdultoTerapiaParejaPage;
