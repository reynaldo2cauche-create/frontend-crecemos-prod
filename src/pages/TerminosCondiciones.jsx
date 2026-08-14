import React from 'react';
import { Link } from 'react-router-dom';
import Reveal from '../components/public/Reveal';
import RevealText from '../components/public/RevealText';
import Decor from '../components/public/Decor';

const terminos = [
  {
    numero: 1,
    titulo: 'Identificación de la Empresa',
    contenido: 'CONTIGO CRECEMOS E.I.R.L., que opera bajo el nombre comercial Crecemos – Centro Integral de Terapias, es una institución privada dedicada a la atención terapéutica integral. El acceso y uso de sus servicios implica la aceptación expresa de los presentes Términos y Condiciones.',
    lista: [
      'Nombre Comercial: Crecemos – Centro Integral de Terapias',
      'Razón Social: CONTIGO CRECEMOS E.I.R.L.',
      'RUC: 20601074380',
      'Actividad Económica: Prestación de servicios terapéuticos especializados en desarrollo humano y salud integral',
      'Servicios: Terapia de lenguaje, terapia ocupacional, psicología infantil, adolescente y adulto, y servicios afines',
      'Página web: www.crecemos.com.pe',
    ],
  },
  {
    numero: 2,
    titulo: 'Aceptación de los Términos',
    contenido: 'La contratación de cualquiera de los servicios ofrecidos por Crecemos – Centro Integral de Terapias supone la lectura, comprensión y aceptación total de los presentes Términos y Condiciones por parte del paciente o de su padre, madre o representante legal.',
  },
  {
    numero: 3,
    titulo: 'Alcance de los Servicios',
    contenido: 'Los servicios brindados por Crecemos – Centro Integral de Terapias son de carácter terapéutico, preventivo y de orientación profesional. No sustituyen diagnósticos ni tratamientos médicos especializados, los cuales deben ser realizados por profesionales de la salud correspondientes.',
    nota: 'Los planes terapéuticos son personalizados y su evolución depende de múltiples factores individuales, por lo que no se garantizan resultados específicos ni plazos determinados.',
  },
  {
    numero: 4,
    titulo: 'Evaluaciones Terapéuticas',
    contenido: 'Las evaluaciones tienen como finalidad identificar áreas de fortaleza y dificultad para la elaboración de un plan de intervención. Los informes emitidos son de uso terapéutico y educativo y no constituyen diagnóstico médico, salvo indicación expresa.',
  },
  {
    numero: 5,
    titulo: 'Programación, Asistencia y Puntualidad',
    lista: [
      'Las sesiones se realizan únicamente con cita previa',
      'Los retrasos del paciente no generan ampliación del tiempo de atención',
      'La inasistencia sin aviso previo será considerada como sesión realizada',
    ],
  },
  {
    numero: 6,
    titulo: 'Política de Reprogramación de Citas',
    contenido: 'La cita pagada podrá ser reprogramada una sola vez, dentro de un plazo máximo de treinta (30) días calendario, contados desde la fecha originalmente programada.',
    nota: 'Vencido dicho plazo, la sesión se considerará realizada y no será recuperable.',
  },
  {
    numero: 7,
    titulo: 'Política de Cancelaciones y Devoluciones',
    contenido: 'Crecemos – Centro Integral de Terapias no realiza devoluciones de dinero por sesiones no asistidas o canceladas, debido a que el cupo fue reservado, el profesional asignado y se incurrió en costos administrativos y operativos.',
  },
  {
    numero: 8,
    titulo: 'Crédito a Favor',
    contenido: 'Como alternativa a la devolución, el monto abonado podrá mantenerse como crédito a favor, sujeto a las siguientes condiciones:',
    lista: [
      'Uso dentro del plazo máximo de 30 días calendario',
      'No acumulable ni prorrogable',
      'No canjeable por dinero en efectivo',
    ],
  },
  {
    numero: 9,
    titulo: 'Casos Excepcionales',
    contenido: 'De manera extraordinaria, y previa evaluación administrativa, se podrá considerar una devolución o modalidad alternativa únicamente en los siguientes casos:',
    lista: [
      'Hospitalización del paciente (con sustento documentado)',
      'Emergencia médica grave',
      'Situaciones de fuerza mayor debidamente comprobadas',
    ],
    nota: 'En estos casos, Crecemos – Centro Integral de Terapias se reserva el derecho de: (a) Retener un porcentaje administrativo entre 10% y 20%, o (b) Convertir el monto en crédito transferible.',
  },
  {
    numero: 10,
    titulo: 'Falta de Reprogramación',
    contenido: 'Si el usuario no solicita la reprogramación dentro del plazo establecido:',
    lista: [
      'La sesión se considerará realizada',
      'El monto no será reembolsable',
      'El cupo será liberado automáticamente',
    ],
  },
  {
    numero: 11,
    titulo: 'Responsabilidad del Usuario',
    contenido: 'El paciente o su representante legal se compromete a brindar información veraz, cumplir con las recomendaciones terapéuticas y mantener un trato respetuoso con el personal y demás usuarios del centro.',
  },
  {
    numero: 12,
    titulo: 'Consentimiento Informado',
    contenido: 'La atención terapéutica se realiza únicamente con el consentimiento informado del paciente o de su representante legal, quien declara haber recibido información clara y suficiente sobre el proceso terapéutico.',
  },
  {
    numero: 13,
    titulo: 'Confidencialidad y Protección de Datos',
    contenido: 'Toda la información personal y clínica del paciente es confidencial y será tratada conforme a la normativa peruana vigente sobre protección de datos personales, siendo utilizada exclusivamente para fines terapéuticos y administrativos.',
  },
  {
    numero: 14,
    titulo: 'Normas de Conducta',
    contenido: 'Crecemos – Centro Integral de Terapias se reserva el derecho de suspender o finalizar la atención ante conductas inapropiadas que afecten la integridad del personal, pacientes o instalaciones.',
  },
  {
    numero: 15,
    titulo: 'Modificación de los Términos',
    contenido: 'CONTIGO CRECEMOS E.I.R.L. podrá modificar los presentes Términos y Condiciones, comunicándolo oportunamente a través de sus canales oficiales.',
  },
  {
    numero: 16,
    titulo: 'Legislación Aplicable',
    contenido: 'Los presentes Términos y Condiciones se rigen por las leyes de la República del Perú. Cualquier controversia será resuelta conforme a la normativa vigente.',
  },
];

export const TerminosCondiciones = () => {
  return (
    <main className="cx-page trm-page">
      {/* ===== Hero ===== */}
      <section className="cx-subhero trm-hero">
        <Decor variant="a" />
        <div className="cx-container">
          <Reveal className="cx-subhero-inner">
            <span className="cx-eyebrow"><i className="bi bi-file-earmark-text-fill" /> Uso de nuestros servicios</span>
            <RevealText as="h1" text="Términos y Condiciones" />
            <p>
              Crecemos – Centro Integral de Terapias. Condiciones que rigen la contratación y uso de
              nuestros servicios terapéuticos.
            </p>
            <span className="trm-updated">
              <i className="bi bi-calendar-check" /> Última actualización: 29 de septiembre de 2025
            </span>
          </Reveal>
        </div>
      </section>

      {/* ===== Contenido ===== */}
      <section className="cx-section trm-body">
        <Decor variant="b" />
        <div className="cx-container trm-wrap">

          <Reveal className="trm-note" y={16}>
            <i className="bi bi-info-circle-fill" />
            <p>
              <strong>CONTIGO CRECEMOS E.I.R.L.</strong>, que opera bajo el nombre comercial
              <strong> Crecemos – Centro Integral de Terapias</strong>, es una institución privada dedicada
              a la atención terapéutica integral. El acceso y uso de sus servicios implica la aceptación
              expresa de los presentes Términos y Condiciones.
            </p>
          </Reveal>

          <div className="trm-panel">
            {terminos.map((t) => (
              <Reveal className="trm-art" key={t.numero} y={16}>
                <div className="trm-art-head">
                  <span className="trm-num">{t.numero}</span>
                  <h3>{t.titulo}</h3>
                </div>

                {t.contenido && <p className="trm-p">{t.contenido}</p>}

                {t.lista && (
                  <ul className="trm-list">
                    {t.lista.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                )}

                {t.nota && (
                  <div className="trm-nota">
                    <strong>Nota:</strong> {t.nota}
                  </div>
                )}
              </Reveal>
            ))}
          </div>

          {/* CTA */}
          <Reveal className="cx-cta-band trm-cta" y={30}>
            <span className="cx-cta-glow" aria-hidden="true" />
            <span className="cx-cta-glow cx-cta-glow--2" aria-hidden="true" />
            <div className="cx-cta-content">
              <span className="cx-cta-eyebrow"><i className="bi bi-patch-question" /> ¿Tienes dudas?</span>
              <RevealText as="h2" text="Estamos aquí para ayudarte" />
              <p>Si tienes alguna consulta sobre estos términos o nuestros servicios, contáctanos y con gusto te orientamos.</p>
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
        .cx-site .cx-page.trm-page {
          position: relative;
          background:
            radial-gradient(96% 54% at 50% -8%, rgba(194, 99, 249, .13) 0%, transparent 58%),
            radial-gradient(80% 46% at 50% 108%, rgba(61, 123, 214, .10) 0%, transparent 60%),
            var(--cx-bg);
        }
        .cx-page.trm-page::after {
          content: ''; position: fixed; inset: 0; z-index: 50; pointer-events: none;
          opacity: .05; mix-blend-mode: soft-light;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }
        .cx-page.trm-page .trm-body { background: transparent; }

        /* ===== Hero ===== */
        .trm-hero { padding-bottom: clamp(14px, 2.4vw, 24px); }
        .cx-site .trm-hero .cx-subhero-inner { text-align: center; }
        .cx-site .trm-hero .cx-subhero-inner > p {
          color: var(--cx-ink-2); text-align: center; max-width: 640px; margin-left: auto; margin-right: auto;
        }
        .trm-updated {
          display: inline-flex; align-items: center; gap: 8px; margin-top: 14px;
          padding: 7px 16px; border-radius: 999px; font-size: .85rem; font-weight: 600;
          color: var(--cx-primary-700); background: var(--cx-primary-050); border: 1px solid var(--cx-primary-100);
        }
        .trm-updated i { font-size: .95rem; }

        /* ===== Cuerpo ===== */
        .cx-page .trm-body { position: relative; z-index: 1; padding-top: clamp(24px, 3vw, 40px); padding-bottom: clamp(48px, 7vw, 88px); }
        .trm-wrap { max-width: 900px; }

        /* Nota intro */
        .trm-note {
          display: flex; gap: 14px; align-items: flex-start;
          padding: 18px 22px; border-radius: var(--cx-r-md);
          background: var(--cx-primary-050); border: 1px solid var(--cx-primary-100);
          margin-bottom: clamp(24px, 3vw, 36px);
        }
        .trm-note i { color: var(--cx-primary-700); font-size: 1.4rem; flex: 0 0 auto; line-height: 1.4; }
        .trm-note p { margin: 0; color: var(--cx-ink-2); font-size: .96rem; line-height: 1.65; }
        .trm-note strong { color: var(--cx-ink); font-weight: 700; }

        /* ===== Panel único (documento) ===== */
        .trm-panel {
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
        .trm-art { padding-top: clamp(24px, 3vw, 34px); margin-top: clamp(24px, 3vw, 34px); border-top: 1px solid var(--cx-line); }
        .trm-art:first-child { padding-top: 0; margin-top: 0; border-top: 0; }
        .trm-art-head { display: flex; align-items: center; gap: 13px; margin-bottom: 14px; }
        .trm-num {
          flex: 0 0 auto; width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center;
          background: linear-gradient(135deg, var(--cx-primary), var(--cx-primary-600)); color: #fff; font-weight: 800; font-size: 1.05rem;
          box-shadow: 0 10px 20px -8px rgba(169, 62, 240, .55);
        }
        .cx-site .trm-art-head h3 { font-family: var(--cx-font); color: var(--cx-ink); font-size: clamp(1.15rem, 2vw, 1.32rem); font-weight: 700; margin: 0; line-height: 1.25; }
        .trm-p { color: var(--cx-ink-2); font-size: .98rem; line-height: 1.75; margin: 0 0 10px; }
        .trm-p:last-child { margin-bottom: 0; }

        .trm-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
        .trm-list > li { position: relative; padding-left: 22px; color: var(--cx-ink-2); font-size: .96rem; line-height: 1.7; }
        .trm-list > li::before {
          content: ''; position: absolute; left: 2px; top: 10px; width: 8px; height: 8px; border-radius: 50%;
          background: linear-gradient(135deg, var(--cx-primary), var(--cx-primary-600));
        }

        .trm-nota {
          margin-top: 14px; padding-left: 16px; border-left: 2px solid var(--cx-line);
          color: var(--cx-muted); font-size: .9rem; line-height: 1.6; font-style: italic;
        }
        .trm-nota strong { color: var(--cx-ink-2); font-style: normal; font-weight: 700; }

        .trm-cta { margin-top: 0; }
        @media (max-width: 768px) {
          .trm-num { width: 36px; height: 36px; font-size: .98rem; }
        }
      `}</style>
    </main>
  );
};

export default TerminosCondiciones;