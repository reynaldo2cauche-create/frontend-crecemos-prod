import React, { useEffect } from 'react';
import { initializePageScripts } from '../utils/initScripts';

export const TerminosCondiciones = () => {
  useEffect(() => {
    initializePageScripts();
  }, []);

  const terminos = [
    {
      numero: 1,
      titulo: "Identificación de la Empresa",
      lista: [
        "Nombre Comercial: Crecemos – Centro Integral de Terapias",
        "Razón Social: CONTIGO CRECEMOS E.I.R.L.",
        "RUC: 20601074380",
        "Actividad Económica: Prestación de servicios terapéuticos especializados en desarrollo humano y salud integral",
        "Servicios: Terapia de lenguaje, terapia ocupacional, psicología infantil, adolescente y adulto, y servicios afines",
        "Página web: www.crecemos.com.pe"
      ],
      contenido: "CONTIGO CRECEMOS E.I.R.L., que opera bajo el nombre comercial Crecemos – Centro Integral de Terapias, es una institución privada dedicada a la atención terapéutica integral. El acceso y uso de sus servicios implica la aceptación expresa de los presentes Términos y Condiciones."
    },
    {
      numero: 2,
      titulo: "Aceptación de los Términos",
      contenido: "La contratación de cualquiera de los servicios ofrecidos por Crecemos – Centro Integral de Terapias supone la lectura, comprensión y aceptación total de los presentes Términos y Condiciones por parte del paciente o de su padre, madre o representante legal."
    },
    {
      numero: 3,
      titulo: "Alcance de los Servicios",
      contenido: "Los servicios brindados por Crecemos – Centro Integral de Terapias son de carácter terapéutico, preventivo y de orientación profesional. No sustituyen diagnósticos ni tratamientos médicos especializados, los cuales deben ser realizados por profesionales de la salud correspondientes.",
      nota: "Los planes terapéuticos son personalizados y su evolución depende de múltiples factores individuales, por lo que no se garantizan resultados específicos ni plazos determinados."
    },
    {
      numero: 4,
      titulo: "Evaluaciones Terapéuticas",
      contenido: "Las evaluaciones tienen como finalidad identificar áreas de fortaleza y dificultad para la elaboración de un plan de intervención. Los informes emitidos son de uso terapéutico y educativo y no constituyen diagnóstico médico, salvo indicación expresa."
    },
    {
      numero: 5,
      titulo: "Programación, Asistencia y Puntualidad",
      lista: [
        "Las sesiones se realizan únicamente con cita previa",
        "Los retrasos del paciente no generan ampliación del tiempo de atención",
        "La inasistencia sin aviso previo será considerada como sesión realizada"
      ]
    },
    {
      numero: 6,
      titulo: "Política de Reprogramación de Citas",
      contenido: "La cita pagada podrá ser reprogramada una sola vez, dentro de un plazo máximo de treinta (30) días calendario, contados desde la fecha originalmente programada.",
      nota: "Vencido dicho plazo, la sesión se considerará realizada y no será recuperable."
    },
    {
      numero: 7,
      titulo: "Política de Cancelaciones y Devoluciones",
      contenido: "Crecemos – Centro Integral de Terapias no realiza devoluciones de dinero por sesiones no asistidas o canceladas, debido a que el cupo fue reservado, el profesional asignado y se incurrió en costos administrativos y operativos."
    },
    {
      numero: 8,
      titulo: "Crédito a Favor",
      contenido: "Como alternativa a la devolución, el monto abonado podrá mantenerse como crédito a favor, sujeto a las siguientes condiciones:",
      lista: [
        "Uso dentro del plazo máximo de 30 días calendario",
        "No acumulable ni prorrogable",
        "No canjeable por dinero en efectivo"
      ]
    },
    {
      numero: 9,
      titulo: "Casos Excepcionales",
      contenido: "De manera extraordinaria, y previa evaluación administrativa, se podrá considerar una devolución o modalidad alternativa únicamente en los siguientes casos:",
      lista: [
        "Hospitalización del paciente (con sustento documentado)",
        "Emergencia médica grave",
        "Situaciones de fuerza mayor debidamente comprobadas"
      ],
      nota: "En estos casos, Crecemos – Centro Integral de Terapias se reserva el derecho de: (a) Retener un porcentaje administrativo entre 10% y 20%, o (b) Convertir el monto en crédito transferible."
    },
    {
      numero: 10,
      titulo: "Falta de Reprogramación",
      contenido: "Si el usuario no solicita la reprogramación dentro del plazo establecido:",
      lista: [
        "La sesión se considerará realizada",
        "El monto no será reembolsable",
        "El cupo será liberado automáticamente"
      ]
    },
    {
      numero: 11,
      titulo: "Responsabilidad del Usuario",
      contenido: "El paciente o su representante legal se compromete a brindar información veraz, cumplir con las recomendaciones terapéuticas y mantener un trato respetuoso con el personal y demás usuarios del centro."
    },
    {
      numero: 12,
      titulo: "Consentimiento Informado",
      contenido: "La atención terapéutica se realiza únicamente con el consentimiento informado del paciente o de su representante legal, quien declara haber recibido información clara y suficiente sobre el proceso terapéutico."
    },
    {
      numero: 13,
      titulo: "Confidencialidad y Protección de Datos",
      contenido: "Toda la información personal y clínica del paciente es confidencial y será tratada conforme a la normativa peruana vigente sobre protección de datos personales, siendo utilizada exclusivamente para fines terapéuticos y administrativos."
    },
    {
      numero: 14,
      titulo: "Normas de Conducta",
      contenido: "Crecemos – Centro Integral de Terapias se reserva el derecho de suspender o finalizar la atención ante conductas inapropiadas que afecten la integridad del personal, pacientes o instalaciones."
    },
    {
      numero: 15,
      titulo: "Modificación de los Términos",
      contenido: "CONTIGO CRECEMOS E.I.R.L. podrá modificar los presentes Términos y Condiciones, comunicándolo oportunamente a través de sus canales oficiales."
    },
    {
      numero: 16,
      titulo: "Legislación Aplicable",
      contenido: "Los presentes Términos y Condiciones se rigen por las leyes de la República del Perú. Cualquier controversia será resuelta conforme a la normativa vigente."
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

        .terminos-section {
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

        .terminos-item {
          background: var(--surface-color);
          border-radius: 15px;
          padding: 40px;
          margin-bottom: 30px;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          border-left: 5px solid var(--accent-color);
        }

        .terminos-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
        }

        .terminos-number {
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

        .terminos-item h3 {
          color: var(--heading-color);
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 25px;
          font-family: var(--heading-font);
        }

        .terminos-item p {
          color: var(--default-color);
          font-size: 1.05rem;
          line-height: 1.8;
          margin-bottom: 20px;
        }

        .terminos-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .terminos-list li {
          padding: 12px 0 12px 40px;
          position: relative;
          color: var(--default-color);
          font-size: 1.05rem;
          line-height: 1.7;
        }

        .terminos-list li:before {
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

          .terminos-item {
            padding: 25px;
          }

          .terminos-item h3 {
            font-size: 1.5rem;
          }

          .terminos-list li {
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
            <h1 data-aos="fade-down">Términos y Condiciones</h1>
            <p className="subtitle" data-aos="fade-up" data-aos-delay="100">
              Crecemos – Centro Integral de Terapias
            </p>
            <p className="update-date" data-aos="fade-up" data-aos-delay="150">
              Fecha de actualización: 29/09/2025
            </p>
          </div>
        </div>

        <section className="terminos-section">
          <div className="container">
            <div className="empresa-info" data-aos="fade-up">
              <h4>
                <i className="bi bi-building me-2"></i>
                Responsable del Servicio
              </h4>
              <p><strong>CONTIGO CRECEMOS E.I.R.L.</strong></p>
              <p>Nombre Comercial: <strong>Crecemos – Centro Integral de Terapias</strong></p>
              <p><strong>RUC:</strong> 20601074380</p>
              <p><strong>Web:</strong> www.crecemos.com.pe</p>
            </div>

            <div className="intro-box" data-aos="fade-up" data-aos-delay="100">
              <p>
                <strong>CONTIGO CRECEMOS E.I.R.L.</strong>, que opera bajo el nombre comercial 
                <strong> Crecemos – Centro Integral de Terapias</strong>, es una institución privada 
                dedicada a la atención terapéutica integral. El acceso y uso de sus servicios implica 
                la aceptación expresa de los presentes Términos y Condiciones.
              </p>
            </div>

            <div className="alert-section" data-aos="fade-up" data-aos-delay="150">
              <i className="bi bi-exclamation-triangle"></i>
              <h4>Importante</h4>
              <p>
                La contratación de cualquier servicio supone la lectura, comprensión y aceptación 
                total de estos términos por parte del paciente o su representante legal.
              </p>
            </div>

            {terminos.map((termino, index) => (
              <div 
                key={termino.numero} 
                className="terminos-item" 
                data-aos="fade-up" 
                data-aos-delay={200 + (index * 50)}
              >
                <span className="terminos-number">{termino.numero}</span>
                <h3>{termino.titulo}</h3>
                
                {termino.contenido && <p>{termino.contenido}</p>}
                
                {termino.lista && (
                  <ul className="terminos-list">
                    {termino.lista.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                )}
                
                {termino.nota && (
                  <div className="info-box">
                    <p>
                      <i className="bi bi-info-circle-fill me-2"></i>
                      <strong>Nota:</strong> {termino.nota}
                    </p>
                  </div>
                )}
              </div>
            ))}

            <div className="alert-section" data-aos="fade-up" data-aos-delay="900">
              <i className="bi bi-shield-check"></i>
              <h4>Compromiso con la Excelencia</h4>
              <p>
                Nuestros términos están diseñados para garantizar la mejor atención terapéutica 
                y proteger los derechos de todos nuestros pacientes.
              </p>
            </div>

            <div className="cta-section" data-aos="fade-up" data-aos-delay="950">
              <h3>¿Necesitas ayuda?</h3>
              <p>Estamos aquí para resolver tus dudas sobre nuestros términos y condiciones.</p>
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