import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { initializePageScripts } from '../../utils/initScripts';
import Reveal from '../../components/public/Reveal';
import RevealText from '../../components/public/RevealText';
import Decor from '../../components/public/Decor';

const tratamientos = [
  {
    imagen: '/assets/img/servicios/1.webp',
    titulo: 'Terapia de Integración Sensorial',
    descripcion: 'Ayuda a niños con dificultades para procesar estímulos como sonidos, texturas, movimientos o luces, favoreciendo su adaptación al entorno.',
  },
  {
    imagen: '/assets/img/servicios/2.webp',
    titulo: 'Rehabilitación Motriz Fina y Gruesa',
    descripcion: 'Mejora la coordinación necesaria para escribir, cortar con tijeras, saltar o mantener el equilibrio.',
  },
  {
    imagen: '/assets/img/servicios/3.webp',
    titulo: 'Entrenamiento en Habilidades de Vida Diaria',
    descripcion: 'Fortalece habilidades básicas como vestirse, comer de forma independiente y mantener la higiene personal.',
  },
  {
    imagen: '/assets/img/servicios/4.webp',
    titulo: 'Habilidades Sociales y Adaptativas',
    descripcion: 'Promueve interacciones positivas y ayuda a los niños a adaptarse a distintos contextos sociales y escolares.',
  },
];

const indicadores = [
  'Tiene dificultad para vestirse, comer o escribir por sí mismo',
  'Presenta problemas de coordinación motriz fina o gruesa',
  'Muestra sensibilidad extrema a ruidos, texturas o luces',
  'Ha sido diagnosticado con TEA, TDAH, parálisis cerebral o Síndrome de Down',
  'Tiene problemas para mantener la atención o seguir rutinas',
  'Presenta dificultades para interactuar socialmente o adaptarse a su entorno',
];

const TerapiaOcupacionalPage = () => {
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
            <span className="cx-eyebrow"><i className="bi bi-person-workspace" /> Área Infantil y Adolescentes</span>
            <RevealText as="h1" text="Terapia Ocupacional e Integración Sensorial" />
            <p>
              Favorecemos la autonomía y el desarrollo de habilidades motoras, sociales
              y de vida diaria en niños y adolescentes, guiados por profesionales especializados.
            </p>
            <nav className="cx-breadcrumb">
              <Link to="/">Inicio</Link>
              <i className="bi bi-chevron-right" />
              <Link to="/servicios">Servicios</Link>
              <i className="bi bi-chevron-right" />
              <span>Terapia Ocupacional</span>
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
            <p>Terapias especializadas para favorecer la autonomía, las habilidades motoras y la adaptación en la vida diaria.</p>
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
                src="/assets/img/servicios/terapia ocupacional.webp"
                alt="Sesión de terapia ocupacional infantil"
              />
            </Reveal>

            <Reveal className="cx-split-body" direction="left" y={0} delay={0.1}>
              <span className="cx-eyebrow"><i className="bi bi-clipboard-check" /> Señales de alerta</span>
              <RevealText as="h2" text="¿Cuándo pasar por terapia ocupacional?" />
              <p>Considera una evaluación si tu niño o niña:</p>
              <ul className="cx-checks">
                {indicadores.map((item) => (
                  <li key={item}><i className="bi bi-check-circle-fill" /><span>{item}</span></li>
                ))}
              </ul>
              <p>
                La terapia ocupacional mejora estas áreas, promoviendo la independencia
                y un desarrollo integral.
              </p>
              <Link to="/contactanos" className="cx-btn cx-btn-primary" style={{ marginTop: 22 }}>
                Agendar evaluación <i className="bi bi-arrow-right" />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============================ PROFESIONALES =======================
          Sección oculta en el original (Lic. Daniela Calle — Terapeuta de
          Integración Sensorial, foto: /assets/img/servicios/terapuet-danielac.webp).
          Para reactivarla, replica el bloque .cx-pros / .cx-pro de TerapiaLenguajePage. */}

      {/* ============================== CTA FINAL ========================= */}
      <section className="cx-section cx-section--pt-sm">
        <div className="cx-container">
          <Reveal className="cx-cta-band" y={30}>
            <span className="cx-cta-glow" aria-hidden="true" />
            <span className="cx-cta-glow cx-cta-glow--2" aria-hidden="true" />
            <div className="cx-cta-content">
              <span className="cx-cta-eyebrow"><i className="bi bi-hand-thumbs-up" /> Estamos para ayudarte</span>
              <RevealText as="h2" text="Impulsa la autonomía de tu niño" />
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

export default TerapiaOcupacionalPage;
