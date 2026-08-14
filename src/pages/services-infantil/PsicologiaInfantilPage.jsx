import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { initializePageScripts } from '../../utils/initScripts';
import Reveal from '../../components/public/Reveal';
import RevealText from '../../components/public/RevealText';
import Decor from '../../components/public/Decor';

const tratamientos = [
  {
    imagen: '/assets/img/servicios/1.webp',
    titulo: 'Terapia Cognitivo-Conductual (TCC)',
    descripcion: 'Ayuda a modificar patrones de pensamiento y conducta en niños con ansiedad, depresión o problemas de comportamiento.',
  },
  {
    imagen: '/assets/img/servicios/2.webp',
    titulo: 'Terapia de Juego',
    descripcion: 'Usa el juego para que los niños expresen emociones, superen traumas y desarrollen habilidades sociales.',
  },
  {
    imagen: '/assets/img/servicios/3.webp',
    titulo: 'Intervención en Problemas de Aprendizaje',
    descripcion: 'Estrategias para superar dificultades como dislexia, déficit de atención o problemas de memoria.',
  },
  {
    imagen: '/assets/img/servicios/4.webp',
    titulo: 'Orientación y Apoyo Familiar',
    descripcion: 'Herramientas para que los padres entiendan y manejen las necesidades emocionales y conductuales de sus hijos.',
  },
];

const indicadores = [
  'Tiene dificultades para gestionar emociones como tristeza, ira o ansiedad',
  'Presenta problemas de conducta: agresividad, desobediencia o aislamiento',
  'Le cuesta relacionarse con otros niños o expresar lo que piensa',
  'Ha pasado por cambios importantes (separación, pérdida o mudanza)',
  'Tiene diagnóstico de TEA, TDAH o señales de baja autoestima',
  'Muestra miedos excesivos o recurrentes que afectan su día a día',
];

const profesionales = [
  {
    nombre: 'Lic. Cherly Quiquia',
    cargo: 'Psicología',
    credLabel: 'CPsP',
    credNumero: '34980',
    imagen: '/assets/img/servicios/terapeutica-cherQui.webp',
  },
  {
    nombre: 'Lic. Giselle Burgos',
    cargo: 'Psicología',
    credLabel: 'CPsP',
    credNumero: '66683',
    imagen: '/assets/img/servicios/Lic. Giselle (1).webp',
  },
];

const PsicologiaInfantilPage = () => {
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
            <span className="cx-eyebrow"><i className="bi bi-heart" /> Área Infantil y Adolescentes</span>
            <RevealText as="h1" text="Psicología Infantil" />
            <p>
              Apoyo emocional y conductual para niños y adolescentes, favoreciendo su desarrollo
              integral, autoestima y bienestar psicológico, junto a sus familias.
            </p>
            <nav className="cx-breadcrumb">
              <Link to="/">Inicio</Link>
              <i className="bi bi-chevron-right" />
              <Link to="/servicios">Servicios</Link>
              <i className="bi bi-chevron-right" />
              <span>Psicología Infantil</span>
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
            <p>Terapias especializadas para el manejo emocional, las habilidades sociales y el fortalecimiento familiar.</p>
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

      {/* ===================== ¿CUÁNDO ACUDIR? ============================ */}
      <section className="cx-section cx-section--deco">
        <Decor variant="b" />
        <div className="cx-container">
          <div className="cx-split">
            <Reveal className="cx-media" direction="right" y={0}>
              <img
                src="/assets/img/servicios/psicologia.webp"
                alt="Sesión de psicología infantil"
              />
            </Reveal>

            <Reveal className="cx-split-body" direction="left" y={0} delay={0.1}>
              <span className="cx-eyebrow"><i className="bi bi-clipboard-check" /> Señales de alerta</span>
              <RevealText as="h2" text="¿Cuándo acudir a psicología infantil?" />
              <p>Considera una evaluación si tu niño o niña:</p>
              <ul className="cx-checks">
                {indicadores.map((item) => (
                  <li key={item}><i className="bi bi-check-circle-fill" /><span>{item}</span></li>
                ))}
              </ul>
              <p>
                La psicología infantil brinda apoyo emocional, herramientas de afrontamiento
                y estrategias para fortalecer la autoestima y un desarrollo emocional saludable.
              </p>
              <Link to="/contactanos" className="cx-btn cx-btn-primary" style={{ marginTop: 22 }}>
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
            <p>Conoce a las especialistas encargadas de brindar la psicología infantil.</p>
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
              <span className="cx-cta-eyebrow"><i className="bi bi-emoji-smile" /> Estamos para ayudarte</span>
              <RevealText as="h2" text="Acompañamos el bienestar de tu niño" />
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

export default PsicologiaInfantilPage;
