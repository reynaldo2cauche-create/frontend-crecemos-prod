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
        .page-header-custom {
          position: relative;
          background: linear-gradient(135deg, rgba(45, 70, 94, 0.5), rgba(13, 131, 253, 0.9)),
                      url('https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070') center/cover no-repeat;
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

        .terminos-section {
          padding: 40px 0;
          background-color: #ffffff;
        }

        .content-wrapper {
          max-width: 1100px;
          margin: 0 auto;
        }

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

        .terminos-item {
          margin-bottom: 25px;
        }

        .terminos-item h3 {
          color: #000;
          font-size: 1.15rem;
          font-weight: 700;
          margin-bottom: 8px;
          line-height: 1.3;
        }

        .terminos-item h3::before {
          content: attr(data-numero) ". ";
          color: #000;
        }

        .terminos-item p {
          color: #333;
          font-size: 0.95rem;
          line-height: 1.6;
          margin-bottom: 8px;
        }

        .terminos-list {
          list-style: none;
          padding: 0;
          margin: 10px 0 10px 20px;
        }

        .terminos-list li {
          padding: 3px 0;
          position: relative;
          color: #333;
          font-size: 0.95rem;
          line-height: 1.6;
          padding-left: 15px;
        }

        .terminos-list li::before {
          content: "•";
          position: absolute;
          left: 0;
          color: #000;
          font-size: 1rem;
        }

        .nota-text {
          margin-top: 8px;
          padding-left: 15px;
          border-left: 2px solid #ccc;
          font-style: italic;
          color: #666;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .page-header-custom {
            padding: 120px 20px 60px;
          }

          .page-header-custom h1 {
            font-size: 1.8rem;
          }

          .terminos-item h3 {
            font-size: 1.1rem;
          }
        }
      `}</style>

      <main className="main">
        <div className="page-header-custom">
          <div className="container text-center">
            <h1 data-aos="fade-down">
              Términos y Condiciones
            </h1>
            <p className="subtitle" data-aos="fade-up" data-aos-delay="100">
              Crecemos – Centro Integral de Terapias
            </p>
            <p className="update-date" data-aos="fade-up" data-aos-delay="150">
              Última actualización: 29 de septiembre de 2025
            </p>
          </div>
        </div>

        <section className="terminos-section">
          <div className="container">
            <div className="content-wrapper">
              
              <div className="intro-text" data-aos="fade-up">
                <p>
                  <strong>CONTIGO CRECEMOS E.I.R.L.</strong>, que opera bajo el nombre comercial 
                  <strong> Crecemos – Centro Integral de Terapias</strong>, es una institución privada 
                  dedicada a la atención terapéutica integral. El acceso y uso de sus servicios implica 
                  la aceptación expresa de los presentes Términos y Condiciones.
                </p>
              </div>

              {terminos.map((termino, index) => (
                <div 
                  key={termino.numero} 
                  className="terminos-item" 
                  data-aos="fade-up" 
                  data-aos-delay={100 + (index * 20)}
                >
                  <h3 data-numero={termino.numero}>{termino.titulo}</h3>
                  
                  {termino.contenido && <p>{termino.contenido}</p>}
                  
                  {termino.lista && (
                    <ul className="terminos-list">
                      {termino.lista.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  )}

                  {termino.nota && (
                    <div className="nota-text">
                      <strong>Nota:</strong> {termino.nota}
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