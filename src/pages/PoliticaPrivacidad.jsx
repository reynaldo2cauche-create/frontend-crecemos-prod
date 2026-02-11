import React, { useEffect } from 'react';
import { initializePageScripts } from '../utils/initScripts';

const PoliticaPrivacidad = () => {
  useEffect(() => {
    initializePageScripts();
  }, []);

  const politicas = [
    {
      numero: 1,
      titulo: "Identificación del Responsable del Tratamiento de Datos",
      lista: [
        "Nombre Comercial: Crecemos – Centro Integral de Terapias",
        "Razón Social: CONTIGO CRECEMOS E.I.R.L.",
        "RUC: 20601074380",
        "Página web: www.crecemos.com.pe"
      ],
      contenido: "CONTIGO CRECEMOS E.I.R.L., en adelante Crecemos – Centro Integral de Terapias, es responsable del tratamiento de los datos personales proporcionados por sus usuarios, pacientes y representantes legales."
    },
    {
      numero: 2,
      titulo: "Marco Legal",
      contenido: "La presente Política de Privacidad se rige por lo dispuesto en:",
      lista: [
        "La Ley N.º 29733 – Ley de Protección de Datos Personales",
        "Su Reglamento aprobado por el D.S. N.º 003-2013-JUS",
        "Demás normas complementarias vigentes en la República del Perú"
      ]
    },
    {
      numero: 3,
      titulo: "Datos Personales que se Recopilan",
      contenido: "Crecemos podrá recopilar y tratar los siguientes datos personales:",
      lista: [
        "Datos de identificación (nombres, apellidos, DNI, fecha de nacimiento)",
        "Datos de contacto (dirección, teléfono, correo electrónico)",
        "Datos del representante legal (en caso de menores de edad)",
        "Información clínica y terapéutica necesaria para la atención del paciente",
        "Información administrativa y de facturación"
      ],
      nota: "El suministro de estos datos es necesario para la correcta prestación de los servicios terapéuticos."
    },
    {
      numero: 4,
      titulo: "Finalidad del Tratamiento de los Datos",
      contenido: "Los datos personales serán utilizados exclusivamente para:",
      lista: [
        "Brindar evaluaciones, terapias y seguimiento profesional",
        "Elaborar historias clínicas, informes terapéuticos y registros internos",
        "Gestionar citas, pagos, reprogramaciones y comunicaciones administrativas",
        "Cumplir obligaciones legales, regulatorias y contractuales",
        "Mejorar la calidad del servicio y la experiencia del usuario"
      ]
    },
    {
      numero: 5,
      titulo: "Datos Sensibles",
      contenido: "Crecemos podrá tratar datos personales sensibles, como información relacionada con la salud física y mental del paciente, únicamente con el consentimiento expreso del titular o su representante legal, y solo para fines estrictamente terapéuticos y profesionales."
    },
    {
      numero: 6,
      titulo: "Confidencialidad y Seguridad de la Información",
      contenido: "Crecemos garantiza la confidencialidad de los datos personales y adopta medidas técnicas, organizativas y legales razonables para prevenir:",
      lista: [
        "Accesos no autorizados",
        "Uso indebido",
        "Pérdida o alteración de la información"
      ],
      nota: "El acceso a la información está restringido únicamente al personal autorizado."
    },
    {
      numero: 7,
      titulo: "Conservación de los Datos",
      contenido: "Los datos personales serán conservados únicamente durante el tiempo necesario para cumplir las finalidades para las cuales fueron recopilados, o mientras exista una relación terapéutica, contractual o una obligación legal vigente."
    },
    {
      numero: 8,
      titulo: "Compartición de Información",
      contenido: "Crecemos no comparte ni comercializa los datos personales con terceros, salvo en los siguientes casos:",
      lista: [
        "Autorización expresa del titular o representante legal",
        "Requerimiento de autoridad competente conforme a ley",
        "Coordinación interdisciplinaria con profesionales de la salud, únicamente con fines terapéuticos y bajo confidencialidad"
      ]
    },
    {
      numero: 9,
      titulo: "Derechos del Titular de los Datos (Derechos ARCO)",
      contenido: "El titular de los datos personales o su representante legal puede ejercer en cualquier momento sus derechos de:",
      lista: [
        "Acceso",
        "Rectificación",
        "Cancelación",
        "Oposición"
      ],
      nota: "Para ello, deberá presentar una solicitud por escrito a través de los canales oficiales de Crecemos – Centro Integral de Terapias."
    },
    {
      numero: 10,
      titulo: "Uso de Material Audiovisual",
      contenido: "Cualquier registro fotográfico, audiovisual o digital con fines terapéuticos, educativos o institucionales será realizado únicamente con autorización previa y expresa del titular de los datos o su representante legal."
    },
    {
      numero: 11,
      titulo: "Consentimiento",
      contenido: "El usuario, paciente o representante legal declara haber leído y comprendido la presente Política de Privacidad y otorga su consentimiento libre, previo, informado e inequívoco para el tratamiento de sus datos personales.",
      infoBox: true
    },
    {
      numero: 12,
      titulo: "Modificaciones de la Política de Privacidad",
      contenido: "Crecemos – Centro Integral de Terapias se reserva el derecho de modificar la presente Política de Privacidad cuando sea necesario. Las modificaciones serán comunicadas a través de sus canales oficiales."
    },
    {
      numero: 13,
      titulo: "Autoridad Competente",
      contenido: "En caso de controversias relacionadas con el tratamiento de datos personales, será competente la Autoridad Nacional de Protección de Datos Personales del Perú."
    }
  ];

  return (
    <>
      <style>{`
        .page-title-custom {
          background: linear-gradient(135deg, #2d465e, #0d83fd);
          padding: 140px 20px 80px;
          color: #fff;
          position: relative;
          overflow: hidden;
        }

        .page-title-custom h1 {
          font-size: 2.8rem;
          font-weight: 700;
          margin-bottom: 15px;
          color: var(--contrast-color);
        }

        .page-title-custom .subtitle {
          font-size: 1.1rem;
          opacity: 0.95;
          max-width: 800px;
          margin: 0 auto 15px;
        }

        .page-title-custom .update-date {
          font-size: 0.95rem;
          opacity: 0.85;
          font-style: italic;
        }

        .politica-section {
          padding: 80px 0;
          background-color: var(--background-color);
        }

        .intro-box {
          background: color-mix(in srgb, var(--accent-color), transparent 95%);
          border-left: 5px solid var(--accent-color);
          border-radius: 10px;
          padding: 30px;
          margin-bottom: 50px;
          box-shadow: 0 3px 15px rgba(0, 0, 0, 0.06);
        }

        .intro-box p {
          font-size: 1.05rem;
          line-height: 1.8;
          margin: 0;
          color: var(--default-color);
        }

        .intro-box strong {
          color: var(--heading-color);
          font-weight: 700;
        }

        .politica-item {
          background: var(--surface-color);
          border-radius: 15px;
          padding: 40px;
          margin-bottom: 30px;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          border-left: 5px solid var(--accent-color);
        }

        .politica-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
        }

        .politica-number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 50px;
          height: 50px;
          background: var(--accent-color);
          color: var(--contrast-color);
          border-radius: 50%;
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 20px;
        }

        .politica-item h3 {
          color: var(--heading-color);
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 25px;
          font-family: var(--heading-font);
        }

        .politica-item p {
          color: var(--default-color);
          font-size: 1.05rem;
          line-height: 1.8;
          margin-bottom: 20px;
        }

        .politica-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .politica-list li {
          padding: 12px 0 12px 40px;
          position: relative;
          color: var(--default-color);
          font-size: 1.05rem;
          line-height: 1.7;
        }

        .politica-list li:before {
          content: "•";
          position: absolute;
          left: 15px;
          color: var(--accent-color);
          font-size: 1.5rem;
          font-weight: bold;
        }

        .info-box {
          background: color-mix(in srgb, var(--accent-color), transparent 92%);
          border-radius: 10px;
          padding: 25px;
          margin: 20px 0;
        }

        .info-box p {
          margin: 0;
          color: var(--heading-color);
          font-weight: 500;
          font-size: 1.05rem;
        }

        .nota-box {
          background: color-mix(in srgb, var(--accent-color), transparent 97%);
          border-left: 3px solid var(--accent-color);
          padding: 15px 20px;
          margin-top: 15px;
          border-radius: 5px;
        }

        .nota-box p {
          margin: 0;
          font-size: 0.95rem;
          font-style: italic;
          color: var(--default-color);
        }

        .empresa-info {
          background: var(--heading-color);
          color: var(--contrast-color);
          border-radius: 15px;
          padding: 35px;
          margin-bottom: 40px;
          text-align: center;
        }

        .empresa-info h4 {
          color: var(--contrast-color);
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 20px;
        }

        .empresa-info p {
          color: var(--contrast-color);
          font-size: 1.05rem;
          margin: 8px 0;
          line-height: 1.8;
        }

        .empresa-info strong {
          font-weight: 600;
        }

        .alert-section {
          background: color-mix(in srgb, var(--accent-color), transparent 90%);
          border-radius: 15px;
          padding: 30px;
          margin: 40px 0;
          text-align: center;
          border: 2px dashed var(--accent-color);
        }

        .alert-section i {
          font-size: 3rem;
          color: var(--accent-color);
          margin-bottom: 15px;
        }

        .alert-section h4 {
          color: var(--heading-color);
          font-size: 1.6rem;
          margin-bottom: 15px;
          font-weight: 700;
        }

        .alert-section p {
          color: var(--default-color);
          font-size: 1.1rem;
          margin: 0;
          line-height: 1.7;
        }

        .cta-section {
          background: color-mix(in srgb, var(--accent-color), transparent 95%);
          padding: 60px 20px;
          text-align: center;
          margin-top: 40px;
          border-radius: 15px;
        }

        .cta-section h3 {
          color: var(--heading-color);
          font-size: 2rem;
          margin-bottom: 20px;
          font-family: var(--heading-font);
        }

        .cta-section p {
          font-size: 1.1rem;
          color: var(--default-color);
          margin-bottom: 30px;
        }

        .btn-custom {
          background: var(--accent-color);
          border: none;
          color: var(--contrast-color);
          padding: 15px 40px;
          border-radius: 50px;
          font-weight: 600;
          text-decoration: none;
          display: inline-block;
          transition: all 0.3s ease;
          font-size: 1.1rem;
        }

        .btn-custom:hover {
          background: color-mix(in srgb, var(--accent-color), black 15%);
          color: var(--contrast-color);
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(194, 99, 249, 0.4);
        }

        @media (max-width: 768px) {
          .page-title-custom h1 {
            font-size: 2rem;
          }

          .politica-item {
            padding: 25px;
          }

          .politica-item h3 {
            font-size: 1.5rem;
          }

          .politica-list li {
            font-size: 1rem;
          }

          .empresa-info {
            padding: 25px;
          }
        }
      `}</style>

      <main className="main">
        <div className="page-title-custom">
          <div className="container text-center">
            <h1 data-aos="fade-down">Política de Privacidad y Tratamiento de Datos Personales</h1>
            <p className="subtitle" data-aos="fade-up" data-aos-delay="100">
              Crecemos – Centro Integral de Terapias
            </p>
            <p className="update-date" data-aos="fade-up" data-aos-delay="150">
              Fecha de actualización: 15/01/2026
            </p>
          </div>
        </div>

        <section className="politica-section">
          <div className="container">
            <div className="empresa-info" data-aos="fade-up">
              <h4>
                <i className="bi bi-building me-2"></i>
                Responsable del Tratamiento
              </h4>
              <p><strong>CONTIGO CRECEMOS E.I.R.L.</strong></p>
              <p>Nombre Comercial: <strong>Crecemos – Centro Integral de Terapias</strong></p>
              <p><strong>RUC:</strong> 20601074380</p>
              <p><strong>Web:</strong> www.crecemos.com.pe</p>
            </div>

            <div className="intro-box" data-aos="fade-up" data-aos-delay="100">
              <p>
                <strong>CONTIGO CRECEMOS E.I.R.L.</strong>, en adelante <strong>Crecemos – Centro Integral de Terapias</strong>, 
                se compromete con la protección de los datos personales de sus pacientes y usuarios, conforme a lo establecido 
                en la <strong>Ley N.º 29733 - Ley de Protección de Datos Personales</strong>, su reglamento, y demás normativa aplicable.
              </p>
            </div>

            {politicas.map((politica, index) => (
              <div 
                key={politica.numero} 
                className="politica-item" 
                data-aos="fade-up" 
                data-aos-delay={150 + (index * 50)}
              >
                <span className="politica-number">{politica.numero}</span>
                <h3>{politica.titulo}</h3>
                
                {politica.contenido && <p>{politica.contenido}</p>}
                
                {politica.lista && (
                  <ul className="politica-list">
                    {politica.lista.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                )}

                {politica.nota && (
                  <div className="nota-box">
                    <p>{politica.nota}</p>
                  </div>
                )}
                
                {politica.infoBox && (
                  <div className="info-box">
                    <p>
                      <i className="bi bi-check-circle-fill me-2"></i>
                      El uso de nuestros servicios implica la aceptación de esta política de privacidad.
                    </p>
                  </div>
                )}
              </div>
            ))}

            <div className="alert-section" data-aos="fade-up" data-aos-delay="700">
              <i className="bi bi-shield-check"></i>
              <h4>Tu privacidad es nuestra prioridad</h4>
              <p>
                Cumplimos estrictamente con la Ley N.º 29733 de Protección de Datos Personales del Perú.
                Tus datos están seguros con nosotros.
              </p>
            </div>

            <div className="cta-section" data-aos="fade-up" data-aos-delay="750">
              <h3>¿Tienes dudas sobre tus datos?</h3>
              <p>Contáctanos si necesitas ejercer tus derechos o tienes consultas sobre esta política.</p>
              <a href="contactanos" className="btn-custom">
                <i className="bi bi-envelope me-2"></i>
                Contactar
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default PoliticaPrivacidad;