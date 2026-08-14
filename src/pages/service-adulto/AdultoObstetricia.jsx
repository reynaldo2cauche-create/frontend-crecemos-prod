import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { initializePageScripts } from '../../utils/initScripts';
import Reveal from '../../components/public/Reveal';
import RevealText from '../../components/public/RevealText';
import Decor from '../../components/public/Decor';

const bloques = [
  {
    eyebrow: '¿Qué es?',
    icon: 'bi-heart-pulse',
    titulo: 'Obstetricia',
    intro: 'Promovemos la salud integral de la mujer en las diferentes etapas de su vida, con énfasis en el embarazo, el posparto y los primeros meses del bebé. Trabajamos de manera interdisciplinaria con Psicología, Terapia de Lenguaje y Terapia Ocupacional para el bienestar de la madre, el bebé y la familia.',
    imagen: '/assets/img/servicios/queesobstetricia.webp',
    puntos: [
      'Atención enfocada en prevención, educación y acompañamiento.',
      'Trabajo interdisciplinario con otras áreas.',
      'Bienestar de la madre, el bebé y la familia.',
    ],
    nota: 'Crecemos contigo desde el inicio de la vida.',
    rev: false,
  },
  {
    eyebrow: '¿A quién?',
    icon: 'bi-people',
    titulo: '¿A quién está dirigido?',
    intro: 'Nuestro servicio acompaña a:',
    imagen: '/assets/img/servicios/dirigidoobstetricia.webp',
    puntos: [
      'Mujeres que desean planificar un embarazo.',
      'Gestantes en cualquier etapa del embarazo.',
      'Madres en el periodo posparto.',
      'Familias que buscan orientación en los cuidados del recién nacido.',
      'Mujeres que requieren consejería en salud sexual y reproductiva.',
    ],
    rev: true,
  },
  {
    eyebrow: 'Servicios',
    icon: 'bi-card-checklist',
    titulo: 'Nuestros servicios',
    intro: 'Un acompañamiento completo en cada etapa:',
    imagen: '/assets/img/servicios/incluyeobstetricia.webp',
    puntos: [
      'Control y orientación durante el embarazo.',
      'Psicoprofilaxis obstétrica (preparación para el parto).',
      'Estimulación prenatal.',
      'Consejería en lactancia materna.',
      'Preparación para la maternidad y paternidad.',
      'Educación sobre cuidados del recién nacido.',
      'Seguimiento del desarrollo del bebé en sus primeros meses.',
      'Consejería en salud sexual y reproductiva.',
      'Planificación familiar.',
      'Orientación durante el puerperio y recuperación posparto.',
      'Tamizaje y detección temprana de depresión posparto, con derivación a Psicología.',
    ],
    rev: false,
  },
  {
    eyebrow: 'Beneficios',
    icon: 'bi-stars',
    titulo: 'Beneficios de una atención temprana',
    intro: 'Una atención oportuna marca la diferencia:',
    imagen: '/assets/img/servicios/beneficiosobstetricia.webp',
    puntos: [
      'Favorece un embarazo saludable.',
      'Fortalece el vínculo entre la madre y el bebé desde la gestación.',
      'Promueve una lactancia materna exitosa.',
      'Brinda herramientas para afrontar con seguridad el parto y el posparto.',
      'Detecta oportunamente factores de riesgo y permite derivaciones.',
      'Contribuye al desarrollo físico, emocional y neuroevolutivo del bebé.',
    ],
    nota: 'Crecemos contigo desde el inicio de la vida: agenda tu cita.',
    rev: true,
  },
];

const AdultoObstetriciaPage = () => {
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
            <span className="cx-eyebrow"><i className="bi bi-heart-pulse" /> Área Adultos</span>
            <RevealText as="h1" text="Obstetricia" />
            <p>
              Acompañamiento integral para la mujer, la gestante y el desarrollo temprano del bebé,
              durante el embarazo, el posparto y los primeros meses de vida.
            </p>
            <nav className="cx-breadcrumb">
              <Link to="/">Inicio</Link>
              <i className="bi bi-chevron-right" />
              <Link to="/servicios">Servicios</Link>
              <i className="bi bi-chevron-right" />
              <span>Obstetricia</span>
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

      {/* Profesionales: sección oculta en el original (placeholder "Nombre de la Obstetra",
          foto: /assets/img/servicios/Lic-Obstetra.webp, COP). Reactivar con el bloque
          .cx-pros / .cx-pro cuando se tenga la data real. */}

      {/* ============================== CTA FINAL ========================= */}
      <section className="cx-section cx-section--pt-sm">
        <div className="cx-container">
          <Reveal className="cx-cta-band" y={30}>
            <span className="cx-cta-glow" aria-hidden="true" />
            <span className="cx-cta-glow cx-cta-glow--2" aria-hidden="true" />
            <div className="cx-cta-content">
              <span className="cx-cta-eyebrow"><i className="bi bi-heart-pulse" /> Estamos para ayudarte</span>
              <RevealText as="h2" text="Te acompañamos desde el inicio de la vida" />
              <p>Escríbenos y coordina tu cita. Cuidamos tu embarazo, tu posparto y los primeros meses de tu bebé con acompañamiento profesional.</p>
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

export default AdultoObstetriciaPage;
