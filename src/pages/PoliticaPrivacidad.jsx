import React from 'react';
import { Link } from 'react-router-dom';
import Reveal from '../components/public/Reveal';
import RevealText from '../components/public/RevealText';
import Decor from '../components/public/Decor';

const politicas = [
  {
    numero: 1,
    titulo: 'Identificación del Responsable del Tratamiento de Datos',
    contenido: 'CONTIGO CRECEMOS E.I.R.L., en adelante Crecemos – Centro Integral de Terapias, es responsable del tratamiento de los datos personales proporcionados por sus usuarios, pacientes y representantes legales.',
    lista: [
      'Nombre Comercial: Crecemos – Centro Integral de Terapias',
      'Razón Social: CONTIGO CRECEMOS E.I.R.L.',
      'RUC: 20601074380',
      'Página web: www.crecemos.com.pe',
    ],
  },
  {
    numero: 2,
    titulo: 'Marco Legal',
    contenido: 'La presente Política de Privacidad se rige por lo dispuesto en:',
    lista: [
      'La Ley N.º 29733 – Ley de Protección de Datos Personales',
      'Su Reglamento aprobado por el D.S. N.º 003-2013-JUS',
      'Demás normas complementarias vigentes en la República del Perú',
    ],
  },
  {
    numero: 3,
    titulo: 'Datos Personales que se Recopilan',
    contenido: 'Crecemos podrá recopilar y tratar los siguientes datos personales:',
    lista: [
      'Datos de identificación (nombres, apellidos, DNI, fecha de nacimiento)',
      'Datos de contacto (dirección, teléfono, correo electrónico)',
      'Datos del representante legal (en caso de menores de edad)',
      'Información clínica y terapéutica necesaria para la atención del paciente',
      'Información administrativa y de facturación',
    ],
    nota: 'El suministro de estos datos es necesario para la correcta prestación de los servicios terapéuticos.',
  },
  {
    numero: 4,
    titulo: 'Finalidad del Tratamiento de los Datos',
    contenido: 'Los datos personales serán utilizados exclusivamente para:',
    lista: [
      'Brindar evaluaciones, terapias y seguimiento profesional',
      'Elaborar historias clínicas, informes terapéuticos y registros internos',
      'Gestionar citas, pagos, reprogramaciones y comunicaciones administrativas',
      'Cumplir obligaciones legales, regulatorias y contractuales',
      'Mejorar la calidad del servicio y la experiencia del usuario',
    ],
  },
  {
    numero: 5,
    titulo: 'Datos Sensibles',
    contenido: 'Crecemos podrá tratar datos personales sensibles, como información relacionada con la salud física y mental del paciente, únicamente con el consentimiento expreso del titular o su representante legal, y solo para fines estrictamente terapéuticos y profesionales.',
  },
  {
    numero: 6,
    titulo: 'Confidencialidad y Seguridad de la Información',
    contenido: 'Crecemos garantiza la confidencialidad de los datos personales y adopta medidas técnicas, organizativas y legales razonables para prevenir:',
    lista: [
      'Accesos no autorizados',
      'Uso indebido',
      'Pérdida o alteración de la información',
    ],
    nota: 'El acceso a la información está restringido únicamente al personal autorizado.',
  },
  {
    numero: 7,
    titulo: 'Conservación de los Datos',
    contenido: 'Los datos personales serán conservados únicamente durante el tiempo necesario para cumplir las finalidades para las cuales fueron recopilados, o mientras exista una relación terapéutica, contractual o una obligación legal vigente.',
  },
  {
    numero: 8,
    titulo: 'Compartición de Información',
    contenido: 'Crecemos no comparte ni comercializa los datos personales con terceros, salvo en los siguientes casos:',
    lista: [
      'Autorización expresa del titular o representante legal',
      'Requerimiento de autoridad competente conforme a ley',
      'Coordinación interdisciplinaria con profesionales de la salud, únicamente con fines terapéuticos y bajo confidencialidad',
    ],
  },
  {
    numero: 9,
    titulo: 'Derechos del Titular de los Datos (Derechos ARCO)',
    contenido: 'El titular de los datos personales o su representante legal puede ejercer en cualquier momento sus derechos de:',
    lista: ['Acceso', 'Rectificación', 'Cancelación', 'Oposición'],
    nota: 'Para ello, deberá presentar una solicitud por escrito a través de los canales oficiales de Crecemos – Centro Integral de Terapias.',
  },
  {
    numero: 10,
    titulo: 'Uso de Material Audiovisual',
    contenido: 'Cualquier registro fotográfico, audiovisual o digital con fines terapéuticos, educativos o institucionales será realizado únicamente con autorización previa y expresa del titular de los datos o su representante legal.',
  },
  {
    numero: 11,
    titulo: 'Consentimiento',
    contenido: 'El usuario, paciente o representante legal declara haber leído y comprendido la presente Política de Privacidad y otorga su consentimiento libre, previo, informado e inequívoco para el tratamiento de sus datos personales.',
    infoBox: 'El uso de nuestros servicios implica la aceptación de esta política de privacidad.',
  },
  {
    numero: 12,
    titulo: 'Modificaciones de la Política de Privacidad',
    contenido: 'Crecemos – Centro Integral de Terapias se reserva el derecho de modificar la presente Política de Privacidad cuando sea necesario. Las modificaciones serán comunicadas a través de sus canales oficiales.',
  },
  {
    numero: 13,
    titulo: 'Autoridad Competente',
    contenido: 'En caso de controversias relacionadas con el tratamiento de datos personales, será competente la Autoridad Nacional de Protección de Datos Personales del Perú.',
  },
];

const PoliticaPrivacidad = () => {
  return (
    <main className="cx-page ppv-page">
      {/* ===== Hero ===== */}
      <section className="cx-subhero ppv-hero">
        <Decor variant="a" />
        <div className="cx-container">
          <Reveal className="cx-subhero-inner">
            <span className="cx-eyebrow"><i className="bi bi-lock-fill" /> Protección de datos personales</span>
            <RevealText as="h1" text="Política de Privacidad" />
            <p>
              Crecemos – Centro Integral de Terapias. Cómo recopilamos, usamos y protegemos tu información,
              conforme a la Ley N.º 29733.
            </p>
            <span className="ppv-updated">
              <i className="bi bi-calendar-check" /> Última actualización: 15 de enero de 2026
            </span>
          </Reveal>
        </div>
      </section>

      {/* ===== Contenido ===== */}
      <section className="cx-section ppv-body">
        <Decor variant="b" />
        <div className="cx-container ppv-wrap">

          <Reveal className="ppv-note" y={16}>
            <i className="bi bi-shield-lock-fill" />
            <p>
              <strong>CONTIGO CRECEMOS E.I.R.L.</strong>, en adelante <strong>Crecemos – Centro Integral de Terapias</strong>,
              se compromete con la protección de los datos personales de sus pacientes y usuarios, conforme a lo establecido
              en la <strong>Ley N.º 29733 – Ley de Protección de Datos Personales</strong>, su reglamento y demás normativa
              aplicable en la República del Perú.
            </p>
          </Reveal>

          <Reveal className="ppv-panel" y={22}>
            {politicas.map((p) => (
              <div className="ppv-art" key={p.numero}>
                <div className="ppv-art-head">
                  <span className="ppv-num">{p.numero}</span>
                  <h3>{p.titulo}</h3>
                </div>

                {p.contenido && <p className="ppv-p">{p.contenido}</p>}

                {p.lista && (
                  <ul className="ppv-list">
                    {p.lista.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                )}

                {p.nota && (
                  <div className="ppv-nota">
                    <strong>Nota:</strong> {p.nota}
                  </div>
                )}

                {p.infoBox && (
                  <div className="ppv-infobox">
                    <i className="bi bi-check-circle-fill" />
                    <p>{p.infoBox}</p>
                  </div>
                )}
              </div>
            ))}
          </Reveal>

          {/* CTA */}
          <Reveal className="cx-cta-band ppv-cta" y={30}>
            <span className="cx-cta-glow" aria-hidden="true" />
            <span className="cx-cta-glow cx-cta-glow--2" aria-hidden="true" />
            <div className="cx-cta-content">
              <span className="cx-cta-eyebrow"><i className="bi bi-patch-question" /> ¿Tienes dudas?</span>
              <RevealText as="h2" text="Ejerce tus derechos ARCO" />
              <p>Si deseas acceder, rectificar, cancelar u oponerte al uso de tus datos, contáctanos y te orientamos.</p>
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
        .cx-site .cx-page.ppv-page {
          position: relative;
          background:
            radial-gradient(96% 54% at 50% -8%, rgba(61, 123, 214, .13) 0%, transparent 58%),
            radial-gradient(80% 46% at 50% 108%, rgba(194, 99, 249, .10) 0%, transparent 60%),
            var(--cx-bg);
        }
        .cx-page.ppv-page::after {
          content: ''; position: fixed; inset: 0; z-index: 50; pointer-events: none;
          opacity: .05; mix-blend-mode: soft-light;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }
        .cx-page.ppv-page .ppv-body { background: transparent; }

        /* ===== Hero ===== */
        .ppv-hero { padding-bottom: clamp(14px, 2.4vw, 24px); }
        .cx-site .ppv-hero .cx-subhero-inner { text-align: center; }
        .cx-site .ppv-hero .cx-subhero-inner > p {
          color: var(--cx-ink-2); text-align: center; max-width: 640px; margin-left: auto; margin-right: auto;
        }
        .ppv-updated {
          display: inline-flex; align-items: center; gap: 8px; margin-top: 14px;
          padding: 7px 16px; border-radius: 999px; font-size: .85rem; font-weight: 600;
          color: var(--cx-primary-700); background: var(--cx-primary-050); border: 1px solid var(--cx-primary-100);
        }
        .ppv-updated i { font-size: .95rem; }

        /* ===== Cuerpo ===== */
        .cx-page .ppv-body { position: relative; z-index: 1; padding-top: clamp(24px, 3vw, 40px); padding-bottom: clamp(48px, 7vw, 88px); }
        .ppv-wrap { max-width: 900px; }

        /* Nota intro */
        .ppv-note {
          display: flex; gap: 14px; align-items: flex-start;
          padding: 18px 22px; border-radius: var(--cx-r-md);
          background: var(--cx-primary-050); border: 1px solid var(--cx-primary-100);
          margin-bottom: clamp(24px, 3vw, 36px);
        }
        .ppv-note i { color: var(--cx-primary-700); font-size: 1.4rem; flex: 0 0 auto; line-height: 1.4; }
        .ppv-note p { margin: 0; color: var(--cx-ink-2); font-size: .96rem; line-height: 1.65; }
        .ppv-note strong { color: var(--cx-ink); font-weight: 700; }

        /* ===== Panel único (documento) ===== */
        .ppv-panel {
          position: relative; overflow: hidden; margin-bottom: clamp(32px, 4vw, 52px);
          background:
            radial-gradient(120% 45% at 50% -4%, rgba(61, 123, 214, .14), transparent 58%),
            radial-gradient(120% 70% at 0% 100%, rgba(194, 99, 249, .1), transparent 60%),
            linear-gradient(180deg, rgba(255, 255, 255, .42), rgba(247, 243, 251, .5));
          -webkit-backdrop-filter: saturate(180%) blur(20px); backdrop-filter: saturate(180%) blur(20px);
          border: 1px solid rgba(255, 255, 255, .6); border-radius: var(--cx-r-xl);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, .7), 0 40px 84px -36px rgba(90, 70, 110, .3);
          padding: clamp(24px, 3.5vw, 44px);
        }
        /* Artículos = secciones del mismo documento, con divisor sutil */
        .ppv-art { padding-top: clamp(24px, 3vw, 34px); margin-top: clamp(24px, 3vw, 34px); border-top: 1px solid var(--cx-line); }
        .ppv-art:first-child { padding-top: 0; margin-top: 0; border-top: 0; }
        .ppv-art-head { display: flex; align-items: center; gap: 13px; margin-bottom: 14px; }
        .ppv-num {
          flex: 0 0 auto; width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center;
          background: linear-gradient(135deg, var(--cx-primary), var(--cx-primary-600)); color: #fff; font-weight: 800; font-size: 1.05rem;
          box-shadow: 0 10px 20px -8px rgba(61, 123, 214, .5);
        }
        .cx-site .ppv-art-head h3 { font-family: var(--cx-font); color: var(--cx-ink); font-size: clamp(1.15rem, 2vw, 1.32rem); font-weight: 700; margin: 0; line-height: 1.25; }
        .ppv-p { color: var(--cx-ink-2); font-size: .98rem; line-height: 1.75; margin: 0 0 10px; }
        .ppv-p:last-child { margin-bottom: 0; }

        .ppv-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
        .ppv-list > li { position: relative; padding-left: 22px; color: var(--cx-ink-2); font-size: .96rem; line-height: 1.7; }
        .ppv-list > li::before {
          content: ''; position: absolute; left: 2px; top: 10px; width: 8px; height: 8px; border-radius: 50%;
          background: linear-gradient(135deg, var(--cx-primary), var(--cx-primary-600));
        }

        .ppv-nota {
          margin-top: 14px; padding-left: 16px; border-left: 2px solid var(--cx-line);
          color: var(--cx-muted); font-size: .9rem; line-height: 1.6; font-style: italic;
        }
        .ppv-nota strong { color: var(--cx-ink-2); font-style: normal; font-weight: 700; }

        .ppv-infobox {
          display: flex; align-items: flex-start; gap: 10px; margin-top: 14px;
          padding: 12px 16px; border-radius: var(--cx-r-md);
          background: var(--cx-primary-050); border-left: 3px solid var(--cx-primary-600);
        }
        .ppv-infobox i { color: var(--cx-primary-700); font-size: 1.05rem; margin-top: 2px; flex: 0 0 auto; }
        .ppv-infobox p { margin: 0; color: var(--cx-ink); font-weight: 600; font-size: .95rem; line-height: 1.55; }

        .ppv-cta { margin-top: 0; }
        @media (max-width: 768px) {
          .ppv-num { width: 36px; height: 36px; font-size: .98rem; }
        }
      `}</style>
    </main>
  );
};

export default PoliticaPrivacidad;