import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { initializePageScripts } from '../../utils/initScripts';
import Reveal from '../../components/public/Reveal';
import RevealText from '../../components/public/RevealText';
import Decor from '../../components/public/Decor';

const planes = [
  {
    titulo: 'Perfil Integral del Desarrollo Infantil',
    original: 'S/. 400.00',
    monto: '370.00',
    edad: '4 a 17 años',
    descripcion: 'Ideal para niños y adolescentes de 4 a 17 años. Evaluación completa del desarrollo cognitivo, emocional y social.',
    incluye: 'Incluye 6 citas:',
    features: [
      { t: '1 Entrevista inicial (solo padres)' },
      { t: '4 Sesiones evaluativas:' },
      { t: 'Cognitiva', sub: true },
      { t: 'Emocional', sub: true },
      { t: 'Social', sub: true },
      { t: '1 Sesión de entrega de informe verbal (solo padres), donde se explican los resultados.' },
      { t: 'Informe físico y digital sin costo adicional, ideal para el colegio.', gift: true },
    ],
    popular: false,
  },
  {
    titulo: 'Perfil Integral y Escolar del Desarrollo Infantil',
    original: 'S/. 460.00',
    monto: '420.00',
    edad: '5 a 17 años',
    descripcion: 'Recomendado para niños y adolescentes de 5 a 17 años. Evaluación integral incluyendo preparación escolar y habilidades académicas.',
    incluye: 'Incluye 7 citas:',
    features: [
      { t: '1 Entrevista inicial (solo padres)' },
      { t: '5 Sesiones evaluativas:' },
      { t: 'Cognitiva', sub: true },
      { t: 'Emocional', sub: true },
      { t: 'Social', sub: true },
      { t: 'Aprestamiento escolar', sub: true },
      { t: '1 Sesión de entrega de informe verbal (solo padres), donde se explican los resultados.' },
      { t: 'Informe físico y digital sin costo adicional, ideal para el colegio.', gift: true },
    ],
    popular: true,
  },
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

const EvaluacionPsicologicaColegioPage = () => {
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
            <span className="cx-eyebrow"><i className="bi bi-clipboard-data" /> Área Infantil y Adolescentes</span>
            <RevealText as="h1" text="Evaluación Psicológica para el Colegio" />
            <p>
              Evaluación integral del desarrollo cognitivo, emocional, social y escolar,
              con informes listos para presentar en la institución educativa.
            </p>
            <nav className="cx-breadcrumb">
              <Link to="/">Inicio</Link>
              <i className="bi bi-chevron-right" />
              <Link to="/servicios">Servicios</Link>
              <i className="bi bi-chevron-right" />
              <span>Evaluación Psicológica</span>
            </nav>
          </Reveal>
        </div>
      </section>

      {/* ============================== PLANES ============================ */}
      <section className="cx-section cx-section--soft">
        <div className="cx-container">
          <Reveal className="cx-section-head">
            <span className="cx-eyebrow"><i className="bi bi-tags" /> Nuestros paquetes</span>
            <RevealText as="h2" text="Elige la evaluación ideal" />
            <p>Paquetes completos con sesiones evaluativas e informe incluido, sin costo adicional.</p>
          </Reveal>

          <div className="cx-plans">
            {planes.map((plan, i) => (
              <Reveal className={`cx-plan ${plan.popular ? 'cx-plan--popular' : ''}`} key={plan.titulo} delay={0.1 * i} y={24}>
                {plan.popular && <span className="cx-plan-badge">Más completo</span>}
                <h3>{plan.titulo}</h3>
                <div className="cx-plan-price">
                  <span className="cx-plan-orig">{plan.original}</span>
                  <span className="cx-plan-now">
                    <span className="cx-plan-cur">S/.</span>
                    <span className="cx-plan-amt">{plan.monto}</span>
                  </span>
                </div>
                <p className="cx-plan-desc">{plan.descripcion}</p>
                <p className="cx-plan-inc">{plan.incluye}</p>
                <ul className="cx-plan-feats">
                  {plan.features.map((f, j) => (
                    <li key={j} className={`${f.sub ? 'sub' : ''} ${f.gift ? 'gift' : ''}`}>
                      <i className={`bi ${f.gift ? 'bi-gift-fill' : f.sub ? 'bi-dot' : 'bi-check-circle-fill'}`} />
                      <span>{f.t}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/contactanos" className="cx-btn cx-btn-primary">
                  {plan.edad} <i className="bi bi-arrow-right" />
                </Link>
              </Reveal>
            ))}
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
            <p>Conoce a las especialistas encargadas de realizar las evaluaciones psicológicas.</p>
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
              <span className="cx-cta-eyebrow"><i className="bi bi-clipboard-check" /> Estamos para ayudarte</span>
              <RevealText as="h2" text="Agenda la evaluación de tu hijo" />
              <p>Escríbenos y coordina la primera cita. Te explicamos el proceso y resolvemos todas tus dudas, sin compromiso.</p>
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

export default EvaluacionPsicologicaColegioPage;
