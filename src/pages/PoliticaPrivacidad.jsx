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
        /* Header con imagen de fondo */
        .page-header-custom {
          position: relative;
          background: linear-gradient(135deg, rgba(45, 70, 94, 0.5), rgba(13, 131, 253, 0.9)),
                      url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070') center/cover no-repeat;
          padding: 150px 20px 80px;
          color: #fff;
          overflow: hidden;
        }

        .page-header-custom::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.2);
          z-index: 1;
        }

        .page-header-custom .container {
          position: relative;
          z-index: 2;
          max-width: 1100px;
        }

        .page-header-custom h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 10px;
          color: #fff;
          line-height: 1.2;
        }

        .page-header-custom .subtitle {
          font-size: 1rem;
          margin-bottom: 5px;
          color: #fff;
          opacity: 0.95;
        }

        .page-header-custom .update-date {
          font-size: 0.9rem;
          opacity: 0.85;
          color: #fff;
        }

        /* Sección de contenido */
        .politica-section {
          padding: 40px 0;
          background-color: #ffffff;
        }

        .content-wrapper {
          max-width: 1100px;
          margin: 0 auto;
        }

        /* Intro */
        .intro-text {
          font-size: 0.95rem;
          line-height: 1.6;
          color: #333;
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 1px solid #e0e0e0;
        }

        .intro-text p {
          margin: 0;
        }

        .intro-text strong {
          font-weight: 600;
          color: #000;
        }

        /* Items de política */
        .politica-item {
          margin-bottom: 25px;
        }

        .politica-item h3 {
          color: #000;
          font-size: 1.15rem;
          font-weight: 700;
          margin-bottom: 8px;
          line-height: 1.3;
        }

        .politica-item h3::before {
          content: attr(data-numero) ". ";
          color: #000;
        }

        .politica-item p {
          color: #333;
          font-size: 0.95rem;
          line-height: 1.6;
          margin-bottom: 8px;
        }

        /* Lista */
        .politica-list {
          list-style: none;
          padding: 0;
          margin: 10px 0 10px 20px;
        }

        .politica-list li {
          padding: 3px 0;
          position: relative;
          color: #333;
          font-size: 0.95rem;
          line-height: 1.6;
          padding-left: 15px;
        }

        .politica-list li::before {
          content: "•";
          position: absolute;
          left: 0;
          color: #000;
          font-size: 1rem;
        }

        /* Nota */
        .nota-text {
          margin-top: 8px;
          padding-left: 15px;
          border-left: 2px solid #ccc;
          font-style: italic;
          color: #666;
          font-size: 0.9rem;
        }

        /* Info box */
        .info-box {
          margin-top: 8px;
          padding: 10px 0 10px 15px;
          border-left: 3px solid var(--accent-color);
        }

        .info-box p {
          margin: 0;
          font-weight: 500;
          color: #000;
          font-size: 0.95rem;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .page-header-custom {
            padding: 120px 20px 60px;
          }

          .page-header-custom h1 {
            font-size: 1.8rem;
          }

          .politica-item h3 {
            font-size: 1.1rem;
          }
        }
      `}</style>

      <main className="main">
        {/* Header con imagen de fondo */}
        <div className="page-header-custom">
          <div className="container text-center">
            <h1 data-aos="fade-down">
              Política de Privacidad y Tratamiento de Datos Personales
            </h1>
            <p className="subtitle" data-aos="fade-up" data-aos-delay="100">
              Crecemos – Centro Integral de Terapias
            </p>
            <p className="update-date" data-aos="fade-up" data-aos-delay="150">
              Última actualización: 15 de enero de 2026
            </p>
          </div>
        </div>

        {/* Contenido */}
        <section className="politica-section">
          <div className="container">
            <div className="content-wrapper">
              
              {/* Intro */}
              <div className="intro-text" data-aos="fade-up">
                <p>
                  <strong>CONTIGO CRECEMOS E.I.R.L.</strong>, en adelante <strong>Crecemos – Centro Integral de Terapias</strong>, 
                  se compromete con la protección de los datos personales de sus pacientes y usuarios, conforme a lo establecido 
                  en la <strong>Ley N.º 29733 - Ley de Protección de Datos Personales</strong>, su reglamento, y demás normativa 
                  aplicable en la República del Perú.
                </p>
              </div>

              {/* Items de política */}
              {politicas.map((politica, index) => (
                <div 
                  key={politica.numero} 
                  className="politica-item" 
                  data-aos="fade-up" 
                  data-aos-delay={100 + (index * 20)}
                >
                  <h3 data-numero={politica.numero}>{politica.titulo}</h3>
                  
                  {politica.contenido && <p>{politica.contenido}</p>}
                  
                  {politica.lista && (
                    <ul className="politica-list">
                      {politica.lista.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  )}

                  {politica.nota && (
                    <div className="nota-text">
                      <strong>Nota:</strong> {politica.nota}
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

            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default PoliticaPrivacidad;