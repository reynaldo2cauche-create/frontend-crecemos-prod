import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { initializePageScripts } from '../../utils/initScripts';
import Reveal from '../../components/public/Reveal';
import RevealText from '../../components/public/RevealText';
import Decor from '../../components/public/Decor';

const bloques = [
  {
    eyebrow: '¿Qué es?',
    icon: 'bi-people-fill',
    titulo: '¿Qué es la terapia familiar?',
    intro: 'La terapia familiar ayuda a fortalecer los lazos, mejorar la comunicación y resolver conflictos que afectan la convivencia. Es un espacio seguro donde cada miembro puede expresar sus emociones y trabajar en soluciones conjuntas.',
    imagen: '/assets/img/servicios/queesterapiafamiliar.webp',
    puntos: [
      'Sesiones presenciales y virtuales disponibles.',
      'Acompañamiento de especialistas en terapia familiar.',
      'Un espacio neutral donde todos son escuchados.',
    ],
    nota: 'Fortalezcamos juntos los lazos familiares.',
    rev: false,
  },
  {
    eyebrow: 'Señales',
    icon: 'bi-clipboard-check',
    titulo: '¿Cuándo acudir a terapia familiar?',
    intro: 'Es un buen momento para acudir si en casa hay:',
    imagen: '/assets/img/servicios/cuandoirterapiafamiliar.webp',
    puntos: [
      'Problemas de comunicación o discusiones frecuentes.',
      'Cambios importantes: divorcio, mudanza o pérdida de un ser querido.',
      'Dificultades en la crianza de los hijos.',
      'Conflictos entre hermanos o familiares cercanos.',
      'Estrés, ansiedad o depresión en algún miembro de la familia.',
    ],
    rev: true,
  },
  {
    eyebrow: 'Nuestro enfoque',
    icon: 'bi-signpost-2',
    titulo: '¿Cómo trabajamos?',
    intro: 'Acompañamos a la familia con un proceso claro y empático:',
    imagen: '/assets/img/servicios/procesoterapiafamiliar.webp',
    puntos: [
      'Evaluación de la dinámica familiar y sus desafíos.',
      'Técnicas para mejorar la comunicación y resolver conflictos.',
      'Estrategias para fortalecer la unión y la empatía.',
      'Acompañamiento emocional para adaptarse a los cambios.',
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

const AdultoTerapiaFamiliarPage = () => {
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
            <span className="cx-eyebrow"><i className="bi bi-people-fill" /> Área Adultos</span>
            <RevealText as="h1" text="Terapia Familiar" />
            <p>
              Un espacio seguro para familias con dificultades en la comunicación o conflictos
              internos, para fortalecer los lazos y promover una convivencia armoniosa.
            </p>
            <nav className="cx-breadcrumb">
              <Link to="/">Inicio</Link>
              <i className="bi bi-chevron-right" />
              <Link to="/servicios">Servicios</Link>
              <i className="bi bi-chevron-right" />
              <span>Terapia Familiar</span>
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
            <p>Conoce a la especialista encargada de brindar la terapia familiar.</p>
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
              <span className="cx-cta-eyebrow"><i className="bi bi-people-fill" /> Estamos para ayudarte</span>
              <RevealText as="h2" text="Reconstruyan lazos en familia" />
              <p>Escríbenos y coordina la primera sesión, presencial o virtual. Un espacio neutral donde toda la familia es escuchada.</p>
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

export default AdultoTerapiaFamiliarPage;
