import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { initializePageScripts } from '../../utils/initScripts';
import Reveal from '../../components/public/Reveal';
import RevealText from '../../components/public/RevealText';
import Decor from '../../components/public/Decor';

const bloques = [
  {
    eyebrow: '¿Qué es?',
    icon: 'bi-mortarboard',
    titulo: 'Evaluación Psicológica Universitaria',
    intro: 'Un proceso claro, confidencial y alineado con los requerimientos de cada universidad. Contamos con psicólogos colegiados y capacitados en evaluación vocacional, emocional y cognitiva, garantizando un diagnóstico ético y confiable.',
    imagen: '/assets/img/servicios/queesevaluacionuniversidad.webp',
    puntos: [
      'Psicólogos colegiados y capacitados.',
      'Proceso confidencial y ético.',
      'Alineado con los requisitos de cada institución.',
    ],
    nota: 'Orientamos tu futuro con respaldo profesional.',
    rev: false,
  },
  {
    eyebrow: '¿Cuándo?',
    icon: 'bi-clipboard-check',
    titulo: '¿Cuándo solicitar este servicio?',
    intro: 'Este servicio es ideal en casos como:',
    imagen: '/assets/img/servicios/cuandoirevapsicouniversidad.webp',
    puntos: [
      'Para cumplir un requisito de ingreso a la universidad.',
      'Cuando la universidad solicita una evaluación académica o emocional.',
      'Para decidir sobre cambio de carrera, manejo del estrés u organización del tiempo.',
    ],
    rev: true,
  },
  {
    eyebrow: 'Incluye',
    icon: 'bi-card-checklist',
    titulo: '¿Qué incluye?',
    intro: 'El paquete de evaluación contempla:',
    imagen: '/assets/img/servicios/incluyeevapsicouniversidad.webp',
    puntos: [
      'Entrevista clínica.',
      'Pruebas psicológicas actualizadas.',
      'Informe psicológico oficial.',
      'Recomendaciones personalizadas.',
    ],
    rev: false,
  },
  {
    eyebrow: 'Ventajas',
    icon: 'bi-patch-check',
    titulo: '¿Por qué elegirnos?',
    intro: 'Nos distingue el acompañamiento cercano y profesional:',
    imagen: '/assets/img/servicios/porqueelegirnospsicouniversidad.webp',
    puntos: [
      'Atención rápida y empática.',
      'Informes con estándares profesionales.',
      'Acompañamiento durante todo el proceso.',
    ],
    nota: 'Agenda tu cita y prepárate para tu futuro universitario con seguridad.',
    rev: true,
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

const AdultoEvalPsicolUniverPage = () => {
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
            <span className="cx-eyebrow"><i className="bi bi-mortarboard" /> Área Adultos</span>
            <RevealText as="h1" text="Evaluación Psicológica Universitaria" />
            <p>
              Evaluación para ingreso o permanencia universitaria, con informes que cumplen
              los requisitos institucionales y respaldo de profesionales colegiados.
            </p>
            <nav className="cx-breadcrumb">
              <Link to="/">Inicio</Link>
              <i className="bi bi-chevron-right" />
              <Link to="/servicios">Servicios</Link>
              <i className="bi bi-chevron-right" />
              <span>Evaluación Psicológica Universitaria</span>
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
            <p>Conoce a la especialista encargada de realizar las evaluaciones.</p>
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
              <span className="cx-cta-eyebrow"><i className="bi bi-mortarboard" /> Estamos para ayudarte</span>
              <RevealText as="h2" text="Prepárate para tu futuro universitario" />
              <p>Escríbenos y agenda tu evaluación. Te entregamos un informe con validez oficial y acompañamiento en todo el proceso.</p>
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

export default AdultoEvalPsicolUniverPage;
