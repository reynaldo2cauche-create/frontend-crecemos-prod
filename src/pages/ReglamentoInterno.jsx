import React from 'react';
import { Link } from 'react-router-dom';
import Reveal from '../components/public/Reveal';
import RevealText from '../components/public/RevealText';
import Decor from '../components/public/Decor';

const reglamentos = [
  {
    numero: 1,
    titulo: 'Objetivo',
    contenido: 'Establecer normas claras que promuevan una relación transparente y respetuosa entre el cliente y el centro, asegurando un servicio de calidad, ordenado y continuo.',
  },
  {
    numero: 2,
    titulo: 'Horarios de Atención',
    lista: [
      'Las sesiones se realizarán en el horario previamente coordinado.',
      'La puntualidad es fundamental para el adecuado desarrollo de las terapias.',
      'El retraso por parte del paciente no será compensado con tiempo adicional.',
    ],
  },
  {
    numero: 3,
    titulo: 'Asistencia y Puntualidad',
    lista: [
      'El paciente debe presentarse con mínimo 5 minutos de anticipación.',
      'La inasistencia sin previo aviso con al menos 24 horas será considerada como sesión tomada.',
      'Se permite reprogramar solo una vez por cada paquete de sesiones, siempre que se avise con anticipación mínima de 24 horas.',
    ],
  },
  {
    numero: 4,
    titulo: 'Pagos y Facturación',
    lista: [
      'Los pagos deben realizarse por adelantado, ya sea por paquete o sesión individual.',
      'Se entregará comprobante de pago (boleta/factura) a solicitud del cliente.',
      'Las promociones y descuentos aplican solo durante el tiempo establecido y no son acumulables.',
    ],
  },
  {
    numero: 5,
    titulo: 'Devoluciones',
    lista: [
      'No se realizan devoluciones por inasistencias, tardanzas o cancelaciones fuera del plazo permitido.',
      {
        texto: 'En caso de retiro voluntario del programa terapéutico, el cliente podrá solicitar una devolución dentro de los 3 días hábiles posteriores al pago, siempre que:',
        sublista: [
          'No se haya iniciado ninguna sesión.',
          'No se haya generado informe ni evaluación.',
          'El paquete no haya sido usado parcial o totalmente.',
        ],
      },
      'La solicitud debe ser por escrito al área administrativa.',
      'El reembolso, si aplica, se realizará dentro de un plazo de 15 días hábiles, por el mismo medio en que se realizó el pago.',
    ],
  },
  {
    numero: 6,
    titulo: 'Compromiso Terapéutico',
    lista: [
      'Los resultados de las terapias dependen del cumplimiento del plan terapéutico, la frecuencia de sesiones y la colaboración de los padres/tutores.',
      'El seguimiento del paciente incluye entrevistas, evaluaciones periódicas y coordinación con los padres.',
      'En caso de requerir derivación a otro profesional, se informará oportunamente.',
    ],
  },
  {
    numero: 7,
    titulo: 'Conducta y Respeto',
    lista: [
      'Se espera una actitud respetuosa hacia el personal del centro.',
      'No se permitirá el ingreso a personas en estado inconveniente.',
      'No se permiten grabaciones de sesiones sin autorización previa.',
    ],
  },
  {
    numero: 8,
    titulo: 'Información y Privacidad',
    lista: [
      'Los datos personales y clínicos del paciente son confidenciales.',
      'El centro cumple con la Ley N° 29733 de Protección de Datos Personales.',
      'El uso de la información se limita únicamente a fines terapéuticos, administrativos y legales.',
    ],
  },
  {
    numero: 9,
    titulo: 'Comunicación',
    lista: [
      'Toda coordinación se realiza a través del área de admisión o vía WhatsApp oficial.',
      'Cualquier cambio de horario, terapeuta o tipo de servicio será comunicado con anticipación.',
      'Se recomienda mantener contacto activo con el centro para el seguimiento continuo del paciente.',
    ],
  },
  {
    numero: 10,
    titulo: 'Evaluaciones e Informes',
    lista: [
      'Las evaluaciones se entregan en un plazo de 5 a 10 días hábiles luego de concluido el proceso evaluativo.',
      'Se pueden entregar en formato físico o digital, según requerimiento del cliente.',
      'El informe es válido por un tiempo determinado (usualmente 3 a 6 meses).',
    ],
  },
];

const renderListItem = (item, idx) => {
  if (typeof item === 'string') {
    return <li key={idx}>{item}</li>;
  }
  return (
    <li key={idx}>
      {item.texto}
      {item.sublista && (
        <ul className="rgl-sublist">
          {item.sublista.map((subitem, i) => (
            <li key={i}>{subitem}</li>
          ))}
        </ul>
      )}
    </li>
  );
};

const ReglamentoInterno = () => {
  return (
    <main className="cx-page rgl-page">
      {/* ===== Hero ===== */}
      <section className="cx-subhero rgl-hero">
        <Decor variant="a" />
        <div className="cx-container">
          <Reveal className="cx-subhero-inner">
            <span className="cx-eyebrow"><i className="bi bi-shield-shaded" /> Normas para clientes</span>
            <RevealText as="h1" text="Reglamento Interno" />
            <p>Centro de Terapias Crecemos. Normas de cumplimiento obligatorio para brindarte un servicio de calidad, seguro y ordenado.</p>
          </Reveal>
        </div>
      </section>

      {/* ===== Contenido ===== */}
      <section className="cx-section rgl-body">
        <Decor variant="b" />
        <div className="cx-container rgl-wrap">

          <Reveal className="rgl-note" y={16}>
            <i className="bi bi-info-circle-fill" />
            <p>
              El <strong>Centro de Terapias Crecemos</strong> agradece la confianza de sus pacientes y familias.
              Con el fin de brindar un servicio terapéutico de calidad, seguro y ordenado, se establece el siguiente
              reglamento interno de cumplimiento obligatorio.
            </p>
          </Reveal>

          <Reveal className="rgl-panel" y={22}>
            {reglamentos.map((r) => (
              <div className="rgl-art" key={r.numero}>
                <div className="rgl-art-head">
                  <span className="rgl-num">{r.numero}</span>
                  <h3>{r.titulo}</h3>
                </div>
                {r.contenido && <p className="rgl-p">{r.contenido}</p>}
                {r.lista && (
                  <ul className="rgl-list">
                    {r.lista.map((item, idx) => renderListItem(item, idx))}
                  </ul>
                )}
              </div>
            ))}
          </Reveal>

          {/* CTA */}
          <Reveal className="cx-cta-band rgl-cta" y={30}>
            <span className="cx-cta-glow" aria-hidden="true" />
            <span className="cx-cta-glow cx-cta-glow--2" aria-hidden="true" />
            <div className="cx-cta-content">
              <span className="cx-cta-eyebrow"><i className="bi bi-patch-question" /> ¿Tienes dudas?</span>
              <RevealText as="h2" text="Estamos aquí para ayudarte" />
              <p>Si tienes alguna consulta sobre nuestro reglamento o servicios, contáctanos y con gusto te orientamos.</p>
              <div className="cx-cta-actions">
                <Link to="/contactanos" className="cx-btn cx-cta-btn">
                  <span>Contactar</span>
                  <i className="bi bi-arrow-right" />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <style>{`
        /* ===== Fondo continuo tintado + grano ===== */
        .cx-site .cx-page.rgl-page {
          position: relative;
          background:
            radial-gradient(96% 54% at 50% -8%, rgba(194, 99, 249, .13) 0%, transparent 58%),
            radial-gradient(80% 46% at 50% 108%, rgba(61, 123, 214, .10) 0%, transparent 60%),
            var(--cx-bg);
        }
        .cx-page.rgl-page::after {
          content: ''; position: fixed; inset: 0; z-index: 50; pointer-events: none;
          opacity: .05; mix-blend-mode: soft-light;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }
        .cx-page.rgl-page .rgl-body { background: transparent; }

        /* ===== Hero ===== */
        .rgl-hero { padding-bottom: clamp(18px, 3vw, 30px); }
        .cx-site .rgl-hero .cx-subhero-inner { text-align: center; }
        .cx-site .rgl-hero .cx-subhero-inner > p {
          color: var(--cx-ink-2); text-align: center; max-width: 640px; margin-left: auto; margin-right: auto;
        }

        /* ===== Cuerpo ===== */
        .cx-page .rgl-body { position: relative; z-index: 1; padding-top: clamp(24px, 3vw, 40px); padding-bottom: clamp(48px, 7vw, 88px); }
        .rgl-wrap { max-width: 900px; }

        /* Nota intro */
        .rgl-note {
          display: flex; gap: 14px; align-items: flex-start;
          padding: 18px 22px; border-radius: var(--cx-r-md);
          background: var(--cx-primary-050); border: 1px solid var(--cx-primary-100);
          margin-bottom: clamp(24px, 3vw, 36px);
        }
        .rgl-note i { color: var(--cx-primary-700); font-size: 1.4rem; flex: 0 0 auto; line-height: 1.4; }
        .rgl-note p { margin: 0; color: var(--cx-ink-2); font-size: .96rem; line-height: 1.65; }
        .rgl-note strong { color: var(--cx-ink); font-weight: 700; }

        /* ===== Panel único (documento) ===== */
        .rgl-panel {
          position: relative; overflow: hidden; margin-bottom: clamp(32px, 4vw, 52px);
          background:
            radial-gradient(120% 45% at 50% -4%, rgba(194, 99, 249, .14), transparent 58%),
            radial-gradient(120% 70% at 0% 100%, rgba(61, 123, 214, .1), transparent 60%),
            linear-gradient(180deg, rgba(255, 255, 255, .42), rgba(247, 243, 251, .5));
          -webkit-backdrop-filter: saturate(180%) blur(20px); backdrop-filter: saturate(180%) blur(20px);
          border: 1px solid rgba(255, 255, 255, .6); border-radius: var(--cx-r-xl);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, .7), 0 40px 84px -36px rgba(90, 70, 110, .3);
          padding: clamp(24px, 3.5vw, 44px);
        }
        /* Artículos = secciones del mismo documento, con divisor sutil */
        .rgl-art { padding-top: clamp(24px, 3vw, 34px); margin-top: clamp(24px, 3vw, 34px); border-top: 1px solid var(--cx-line); }
        .rgl-art:first-child { padding-top: 0; margin-top: 0; border-top: 0; }
        .rgl-art-head { display: flex; align-items: center; gap: 13px; margin-bottom: 14px; }
        .rgl-num {
          flex: 0 0 auto; width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center;
          background: linear-gradient(135deg, var(--cx-primary), var(--cx-primary-600)); color: #fff; font-weight: 800; font-size: 1.05rem;
          box-shadow: 0 10px 20px -8px rgba(169, 62, 240, .55);
        }
        .cx-site .rgl-art-head h3 { font-family: var(--cx-font); color: var(--cx-ink); font-size: clamp(1.15rem, 2vw, 1.32rem); font-weight: 700; margin: 0; line-height: 1.25; }
        .rgl-p { color: var(--cx-ink-2); font-size: .98rem; line-height: 1.75; margin: 0; }

        .rgl-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
        .rgl-list > li { position: relative; padding-left: 22px; color: var(--cx-ink-2); font-size: .96rem; line-height: 1.7; }
        .rgl-list > li::before {
          content: ''; position: absolute; left: 2px; top: 10px; width: 8px; height: 8px; border-radius: 50%;
          background: linear-gradient(135deg, var(--cx-primary), var(--cx-primary-600));
        }
        .rgl-sublist { list-style: none; padding: 10px 0 2px; margin: 0 0 0 4px; display: flex; flex-direction: column; gap: 7px; }
        .rgl-sublist li { position: relative; padding-left: 20px; color: var(--cx-muted); font-size: .92rem; line-height: 1.6; }
        .rgl-sublist li::before { content: ''; position: absolute; left: 3px; top: 8px; width: 7px; height: 7px; border-radius: 50%; border: 1.5px solid var(--cx-primary-600); }

        .rgl-cta { margin-top: 0; }
        @media (max-width: 768px) {
          .rgl-num { width: 36px; height: 36px; font-size: .98rem; }
        }
      `}</style>
    </main>
  );
};

export default ReglamentoInterno;
