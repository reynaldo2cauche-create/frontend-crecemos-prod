import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { initializePageScripts } from '../../utils/initScripts';
import Reveal from '../../components/public/Reveal';
import RevealText from '../../components/public/RevealText';
import Decor from '../../components/public/Decor';

const tratamientos = [
  {
    imagen: '/assets/img/servicios/1.webp',
    titulo: 'Tratamiento de trastornos del habla',
    descripcion: 'Intervención para corregir dificultades en la pronunciación, fluidez o producción de sonidos.',
  },
  {
    imagen: '/assets/img/servicios/2.webp',
    titulo: 'Terapia del lenguaje receptivo y expresivo',
    descripcion: 'Mejora de la comprensión y expresión verbal en casos de retrasos del lenguaje.',
  },
  {
    imagen: '/assets/img/servicios/3.webp',
    titulo: 'Rehabilitación de trastornos de la comunicación',
    descripcion: 'Ayuda en casos de afasia, apraxia o disartria, como resultado de condiciones neurológicas.',
  },
  {
    imagen: '/assets/img/servicios/4.webp',
    titulo: 'Estimulación del lenguaje en niños pequeños',
    descripcion: 'Fomento del desarrollo del lenguaje desde edades tempranas para prevenir retrasos.',
  },
];

const indicadores = [
  'Tiene dificultad en la comunicación verbal o gestual',
  'Ha sido diagnosticado con Trastorno del Espectro Autista (TEA)',
  'Ha sido diagnosticado con TDAH (déficit de atención e hiperactividad)',
  'Presenta Síndrome de Down',
  'Tiene 2 años y aún no habla',
  'Tiene 3 años, habla y no se le entiende',
  'Tiene 4 años y no estructura oraciones largas',
  'Tiene 5 años y aún presenta muchos problemas de articulación',
];

const profesionales = [
  {
    nombre: 'Lic. Merlín Fernández',
    cargo: 'Terapeuta de Lenguaje',
    ctmp: '12937',
    imagen: '/assets/img/servicios/merlin.webp',
  },
];

const TerapiaLenguajePage = () => {
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
            <span className="cx-eyebrow"><i className="bi bi-chat-dots" /> Área Infantil y Adolescentes</span>
            <RevealText as="h1" text="Terapia de Lenguaje" />
            <p>
              Terapias especializadas para mejorar el habla, el lenguaje y la comunicación
              en cada etapa del desarrollo, con profesionales altamente calificados.
            </p>
            <nav className="cx-breadcrumb">
              <Link to="/">Inicio</Link>
              <i className="bi bi-chevron-right" />
              <Link to="/servicios">Servicios</Link>
              <i className="bi bi-chevron-right" />
              <span>Terapia de Lenguaje</span>
            </nav>
          </Reveal>
        </div>
      </section>

      {/* ============================ TRATAMIENTOS ======================== */}
      <section className="cx-section cx-section--soft">
        <div className="cx-container">
          <Reveal className="cx-section-head">
            <span className="cx-eyebrow"><i className="bi bi-stars" /> Lo que trabajamos</span>
            <RevealText as="h2" text="Principales tratamientos" />
            <p>Terapias especializadas para mejorar el habla, el lenguaje y la comunicación en cada caso.</p>
          </Reveal>

          <div className="cx-trats">
            {tratamientos.map((t, i) => (
              <Reveal className="cx-trat" key={t.titulo} delay={0.08 * i} y={22}>
                <div className="cx-trat-media">
                  <img src={t.imagen} alt={t.titulo} loading="lazy" />
                </div>
                <div className="cx-trat-body">
                  <h3>{t.titulo}</h3>
                  <p>{t.descripcion}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== ¿CUÁNDO PASAR POR TERAPIA? ================== */}
      <section className="cx-section cx-section--deco">
        <Decor variant="b" />
        <div className="cx-container">
          <div className="cx-split">
            <Reveal className="cx-media" direction="right" y={0}>
              <img
                src="/assets/img/servicios/terapia de lenguaje.webp"
                alt="Sesión de terapia de lenguaje infantil"
              />
            </Reveal>

            <Reveal className="cx-split-body" direction="left" y={0} delay={0.1}>
              <span className="cx-eyebrow"><i className="bi bi-clipboard-check" /> Señales de alerta</span>
              <RevealText as="h2" text="¿Cuándo pasar por terapia de lenguaje?" />
              <p>Considera una evaluación si tu niño o niña:</p>
              <ul className="cx-checks">
                {indicadores.map((item) => (
                  <li key={item}><i className="bi bi-check-circle-fill" /><span>{item}</span></li>
                ))}
              </ul>
              <Link to="/contactanos" className="cx-btn cx-btn-primary">
                Agendar evaluación <i className="bi bi-arrow-right" />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============================ PROFESIONALES ======================= */}
      <section className="cx-section cx-section--tight cx-section--alt">
        <Decor variant="b" />
        <div className="cx-container">
          <Reveal className="cx-section-head">
            <span className="cx-eyebrow"><i className="bi bi-person-badge" /> Nuestro equipo</span>
            <RevealText as="h2" text="Profesionales" />
            <p>Conoce a la especialista encargada de brindar las terapias de lenguaje.</p>
          </Reveal>

          <div className="cx-pros">
            {profesionales.map((p, i) => (
              <Reveal className="cx-pro" key={p.ctmp} delay={0.08 * i} y={22}>
                <div className="cx-pro-media">
                  <img src={p.imagen} alt={p.nombre} loading="lazy" />
                </div>
                <span className="cx-pro-hint"><i className="bi bi-hand-index-thumb" /> Ver información</span>
                <div className="cx-pro-panel">
                  <span className="cx-pro-role"><i className="bi bi-chat-dots" /> {p.cargo}</span>
                  <h3>{p.nombre}</h3>
                  <span className="cx-pro-cred">
                    <i className="bi bi-award-fill" /> CTMP <b>{p.ctmp}</b>
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
              <RevealText as="h2" text="Da el primer paso hacia una mejor comunicación" />
              <p>Escríbenos y coordina una evaluación inicial. Te orientamos según el caso de tu niño, sin compromiso.</p>
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

export default TerapiaLenguajePage;
