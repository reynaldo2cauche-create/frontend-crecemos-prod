import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { initializePageScripts } from '../../utils/initScripts';
import Reveal from '../../components/public/Reveal';
import RevealText from '../../components/public/RevealText';
import Decor from '../../components/public/Decor';

const tratamientos = [
  {
    imagen: '/assets/img/servicios/1.webp',
    titulo: 'Estrategias para la atención y concentración',
    descripcion: 'Técnicas para mejorar el enfoque y reducir las distracciones durante el estudio.',
  },
  {
    imagen: '/assets/img/servicios/2.webp',
    titulo: 'Estimulación de la memoria y el razonamiento',
    descripcion: 'Actividades para fortalecer la retención y el pensamiento lógico.',
  },
  {
    imagen: '/assets/img/servicios/3.webp',
    titulo: 'Desarrollo de habilidades de lectoescritura',
    descripcion: 'Apoyo en la lectura, la comprensión y la escritura.',
  },
  {
    imagen: '/assets/img/servicios/4.webp',
    titulo: 'Técnicas para el aprendizaje autónomo',
    descripcion: 'Métodos para organizar y gestionar el estudio de manera efectiva.',
  },
];

const indicadores = [
  'Tiene dificultades para leer, escribir o comprender textos',
  'Presenta problemas de atención y concentración en clase',
  'Se le dificulta organizar sus tareas y recordar información',
  'Muestra bajo rendimiento escolar a pesar del esfuerzo',
  'Le cuesta seguir instrucciones o resolver problemas matemáticos',
];

const profesionales = [
  {
    nombre: 'Lic. Cherly Quiquia',
    cargo: 'Psicología',
    credLabel: 'CPsP',
    credNumero: '34980',
    imagen: '/assets/img/servicios/terapeutica-cherQui.webp',
  },
];

const TerapiaAprendizajePage = () => {
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
            <span className="cx-eyebrow"><i className="bi bi-book" /> Área Infantil y Adolescentes</span>
            <RevealText as="h1" text="Terapia de Aprendizaje" />
            <p>
              Estrategias y actividades para mejorar la atención, la memoria y las habilidades
              de aprendizaje en niños y adolescentes, guiados por profesionales especializados.
            </p>
            <nav className="cx-breadcrumb">
              <Link to="/">Inicio</Link>
              <i className="bi bi-chevron-right" />
              <Link to="/servicios">Servicios</Link>
              <i className="bi bi-chevron-right" />
              <span>Terapia de Aprendizaje</span>
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
            <p>Estrategias y actividades para mejorar la comunicación, la memoria y las habilidades de aprendizaje.</p>
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
                src="/assets/img/servicios/terapia de aprendizaje.webp"
                alt="Sesión de terapia de aprendizaje"
              />
            </Reveal>

            <Reveal className="cx-split-body" direction="left" y={0} delay={0.1}>
              <span className="cx-eyebrow"><i className="bi bi-clipboard-check" /> Señales de alerta</span>
              <RevealText as="h2" text="¿Cuándo llevar terapia de aprendizaje?" />
              <p>Se recomienda una evaluación si el niño o adolescente:</p>
              <ul className="cx-checks">
                {indicadores.map((item) => (
                  <li key={item}><i className="bi bi-check-circle-fill" /><span>{item}</span></li>
                ))}
              </ul>
              <p>
                La terapia de aprendizaje fortalece las habilidades cognitivas, académicas
                y de organización para mejorar el desempeño escolar y la confianza.
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
            <p>Conoce a la especialista encargada de brindar las terapias de aprendizaje.</p>
          </Reveal>

          <div className="cx-pros">
            {profesionales.map((p, i) => (
              <Reveal className="cx-pro" key={p.credNumero} delay={0.08 * i} y={22}>
                <div className="cx-pro-media">
                  <img src={p.imagen} alt={p.nombre} loading="lazy" />
                </div>
                <span className="cx-pro-hint"><i className="bi bi-hand-index-thumb" /> Ver información</span>
                <div className="cx-pro-panel">
                  <span className="cx-pro-role"><i className="bi bi-mortarboard" /> {p.cargo}</span>
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
              <span className="cx-cta-eyebrow"><i className="bi bi-lightbulb" /> Estamos para ayudarte</span>
              <RevealText as="h2" text="Ayúdalo a aprender con confianza" />
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

export default TerapiaAprendizajePage;
