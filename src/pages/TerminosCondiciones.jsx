import React from 'react';
import { Link } from 'react-router-dom';
import Reveal from '../components/public/Reveal';
import RevealText from '../components/public/RevealText';
import Decor from '../components/public/Decor';

const terminos = [
  {
    numero: 1,
    titulo: 'Disposiciones Generales',
    lista: [
      'Los presentes Términos y Condiciones regulan la contratación, programación y prestación de los servicios ofrecidos por el Centro Integral de Terapias Crecemos, en adelante «el Centro».',
      'Son aplicables a todos los pacientes, padres de familia, apoderados y representantes legales que contraten o utilicen los servicios del Centro.',
      'El Centro se compromete a brindar una atención profesional, respetuosa, confidencial y orientada al bienestar integral de sus pacientes.',
      'Antes de contratar, el paciente o su responsable recibirá información clara sobre tarifas, horarios, duración de las sesiones, condiciones de pago, reprogramaciones, cancelaciones y devoluciones.',
      'La contratación de los servicios implica la aceptación de las condiciones previamente informadas y válidamente acordadas, sin perjuicio de los derechos reconocidos por la legislación peruana vigente.',
    ],
  },
  {
    numero: 2,
    titulo: 'Servicios Terapéuticos',
    contenido: 'El Centro brinda servicios especializados de evaluación, orientación, intervención y seguimiento terapéutico, entre los cuales se encuentran:',
    lista: [
      'Terapia de Lenguaje.',
      'Terapia Ocupacional e Integración Sensorial.',
      'Psicología Infantil y Adolescente.',
      'Psicología para Adultos.',
      'Psicoterapia y orientación familiar.',
      'Estimulación Temprana.',
      'Evaluaciones psicológicas y terapéuticas.',
      'Otros servicios especializados disponibles en el Centro.',
    ],
    nota: 'Los servicios serán brindados por profesionales habilitados. La frecuencia, duración y objetivos de las intervenciones dependerán de las necesidades del paciente y las recomendaciones profesionales. Los resultados pueden variar según cada caso; el Centro no garantiza resultados específicos.',
  },
  {
    numero: 3,
    titulo: 'Reservas y Programación de Citas',
    lista: [
      'Las citas serán programadas por el área de Admisión según la disponibilidad de horarios, profesionales y ambientes terapéuticos.',
      'La reserva se confirmará una vez cumplidas las condiciones de contratación y pago anticipado.',
      'Los horarios asignados serán respetados durante el periodo de programación confirmado.',
      'La contratación de un paquete no garantiza la conservación indefinida de un horario fijo.',
      'Toda solicitud de modificación de horarios deberá coordinarse previamente con el área de Admisión.',
      'El Centro podrá realizar modificaciones justificadas en la programación, informando oportunamente y ofreciendo alternativas razonables de atención.',
    ],
  },
  {
    numero: 4,
    titulo: 'Pagos y Modalidades de Contratación',
    lista: [
      'Los servicios se brindan bajo la modalidad de pago anticipado.',
      'Se podrán contratar sesiones individuales o paquetes terapéuticos, de acuerdo con el tarifario vigente.',
      'El pago de un paquete comprende únicamente la cantidad de sesiones y los servicios expresamente indicados al momento de su contratación.',
      'Los pagos se realizarán mediante los medios autorizados por el Centro.',
      'Por cada operación se emitirá el comprobante de pago correspondiente, conforme a la normativa tributaria vigente.',
      'Las tarifas podrán actualizarse, sin modificar retroactivamente las condiciones económicas de servicios ya contratados.',
      'Los descuentos y promociones no son acumulables, salvo indicación expresa en contrario.',
      'La renovación de paquetes deberá realizarse antes del inicio de las nuevas sesiones. La falta de renovación podrá ocasionar la suspensión de futuras reservas, previa comunicación, sin afectar las atenciones ya pagadas.',
    ],
  },
  {
    numero: 5,
    titulo: 'Puntualidad y Duración de las Sesiones',
    lista: [
      'Los pacientes deberán asistir puntualmente a sus citas programadas.',
      'La duración de cada sesión depende del servicio contratado y será informada previamente.',
      'Si el paciente llega tarde, la atención podrá desarrollarse únicamente durante el tiempo restante, siempre que sea clínicamente apropiado.',
      'Las tardanzas no generan automáticamente una ampliación del horario, debido a la programación de otros pacientes.',
      'Cuando el retraso sea atribuible al Centro, se procurará garantizar el tiempo de atención contratado o coordinar una alternativa equivalente.',
    ],
  },
  {
    numero: 6,
    titulo: 'Reprogramaciones e Inasistencias',
    lista: [
      { lead: 'Inasistencia sin previo aviso', texto: 'Si el paciente no asiste sin comunicar previamente su ausencia, la sesión se considerará SESIÓN DICTADA, debido a que el horario y el profesional fueron reservados exclusivamente para su atención.' },
      { lead: 'Aviso durante el horario de la cita', texto: 'Si la inasistencia se comunica a la hora exacta de inicio de la sesión o después de esta, también se considerará SESIÓN DICTADA, sin derecho a reprogramación, salvo las excepciones justificadas de estos términos y las que correspondan por ley.' },
      { lead: 'Cancelaciones anticipadas', texto: 'Toda cancelación o reprogramación deberá comunicarse a Admisión con la anticipación mínima informada por el Centro. La aprobación está sujeta a las condiciones del servicio contratado.' },
      { lead: 'Excepciones por motivos de salud', texto: 'Se permite reprogramar por motivos de salud debidamente justificados, incluso cuando el aviso se realice el mismo día, presentando constancia de atención médica, comprobante de cita atendida, documento de tratamiento u otro sustento equivalente.' },
      { lead: 'Verificación de documentos', texto: 'El Centro podrá solicitar y verificar razonablemente la documentación presentada, respetando la confidencialidad de los datos personales y de salud, sin exigir información médica innecesaria.' },
      { lead: 'Disponibilidad de horarios', texto: 'Las reprogramaciones autorizadas están sujetas a la disponibilidad de horarios y profesionales, sin costos adicionales por el cambio de fecha.' },
      { lead: 'Cancelaciones por parte del Centro', texto: 'Cuando la sesión no pueda realizarse por motivos atribuibles al Centro o al profesional asignado, se ofrecerá una reprogramación sin costo o la devolución correspondiente, según corresponda.' },
      { lead: 'Registro de inasistencias', texto: 'La denominación «sesión dictada» es una clasificación administrativa y contractual de la cita reservada; no significa que se haya realizado una intervención clínica. Los registros asistenciales reflejarán la inasistencia real del paciente.' },
      { lead: 'Circunstancias excepcionales', texto: 'El Centro evaluará individualmente los casos de fuerza mayor, emergencias u otras circunstancias justificadas, conforme a la normativa aplicable.' },
    ],
  },
  {
    numero: 7,
    titulo: 'Cancelaciones y Devoluciones',
    lista: [
      { lead: 'Cancelación de sesiones', texto: 'Las cancelaciones se comunicarán oportunamente a Admisión. Las inasistencias sin previo aviso o comunicadas a la hora de inicio o posteriormente serán consideradas SESIÓN DICTADA, conforme al numeral 6.' },
      { lead: 'Cancelación de paquetes terapéuticos', texto: 'El paciente o su responsable podrá solicitar la cancelación de un paquete previamente contratado mediante comunicación al área administrativa.' },
      { lead: 'Devolución por decisión del paciente', texto: 'Ante la cancelación definitiva del tratamiento, el Centro evaluará la devolución del importe correspondiente a las sesiones pendientes, considerando los servicios efectivamente prestados, las condiciones económicas acordadas y la normativa vigente.' },
      { lead: 'Sesiones consideradas dictadas', texto: 'No serán reembolsables cuando dicha condición haya sido informada previamente, resulte legalmente aplicable y no exista una circunstancia justificada que corresponda evaluar.' },
      { lead: 'Cancelaciones por motivos de salud', texto: 'Por motivos de salud debidamente acreditados podrá solicitarse la reprogramación de las sesiones pendientes. Si la continuidad del tratamiento resulta imposible, se evaluará la devolución que corresponda.' },
      { lead: 'Cancelaciones por parte del Centro', texto: 'Si el Centro cancela o no puede continuar el servicio por causas atribuibles a la institución, el paciente podrá optar por la reprogramación sin costo o la devolución del importe del servicio no prestado.' },
      { lead: 'Solicitud de devolución', texto: 'Se presentará por los canales oficiales, indicando los datos del paciente, el servicio contratado, el motivo y la información necesaria para identificar el pago.' },
      { lead: 'Evaluación y respuesta', texto: 'El Centro evaluará las solicitudes y comunicará su respuesta dentro de un plazo razonable, respetando los plazos establecidos legalmente.' },
      { lead: 'Medio de devolución', texto: 'Las devoluciones aprobadas se efectuarán preferentemente mediante transferencia bancaria u otro medio acordado, dejando constancia de la operación.' },
      { lead: 'Derechos del paciente', texto: 'Estas disposiciones no restringen los derechos del consumidor ni las devoluciones que legalmente correspondan.' },
    ],
  },
  {
    numero: 8,
    titulo: 'Renovación de Paquetes y Conservación de Horarios',
    lista: [
      { lead: 'Renovación y conservación', texto: 'Para mantener sus horarios habituales, el paciente o su responsable deberá realizar la renovación y el pago correspondiente de su paquete al finalizar las sesiones contratadas.' },
      { lead: 'Plazo de reserva del horario', texto: 'Culminado el paquete, el Centro otorga un plazo máximo de 12 horas calendario, contadas desde la finalización de la última sesión contratada, para renovar y conservar los horarios habituales.' },
      { lead: 'Liberación de horarios', texto: 'Transcurridas las 12 horas sin confirmar la renovación y el pago, los horarios quedarán automáticamente disponibles para otros pacientes, sin necesidad de notificación adicional.' },
      { lead: 'Renovación fuera del plazo', texto: 'Si se renueva después del plazo, la continuidad de los horarios habituales estará sujeta a la disponibilidad existente. El Centro no garantiza la recuperación de horarios ya asignados a otros pacientes.' },
      { lead: 'Confirmación de renovación', texto: 'La conservación de los horarios habituales está condicionada a la confirmación del pago y el registro de la renovación por parte de Admisión.' },
      { lead: 'Comunicación de condiciones', texto: 'Esta política se informa al paciente o responsable antes de la contratación, para garantizar una adecuada organización de la agenda terapéutica.' },
    ],
  },
  {
    numero: 9,
    titulo: 'Evaluaciones e Informes Terapéuticos',
    lista: [
      'Las evaluaciones serán realizadas por el profesional correspondiente, con procedimientos e instrumentos adecuados a las necesidades del paciente.',
      'Los informes de evaluación, evolución o seguimiento podrán tener costos diferenciados, comunicados antes de su contratación.',
      'El plazo referencial para elaborar informes terapéuticos es de 3 a 7 días hábiles, según su complejidad, salvo otro plazo legal o acordado.',
      'Los informes serán elaborados y suscritos por el profesional competente.',
      'Los informes de evolución reflejan los avances del periodo evaluado; el Centro podrá recomendar su actualización después de seis meses, sin que ello invalide el documento original.',
      'Los documentos emitidos no sustituyen certificados médicos ni otros documentos que deban expedir profesionales de distinta competencia.',
      'El acceso y entrega de copias de la historia clínica se realizará conforme a los derechos del paciente y la normativa vigente.',
    ],
  },
  {
    numero: 10,
    titulo: 'Responsabilidades de los Padres y Apoderados',
    lista: [
      { lead: 'Información del paciente', texto: 'Proporcionar información veraz y relevante sobre los antecedentes médicos, psicológicos, conductuales y terapéuticos del paciente.' },
      { lead: 'Autorización de atención', texto: 'Para la atención de menores se requiere la autorización de quien legalmente corresponda, respetando los derechos del menor y su participación progresiva en las decisiones.' },
      { lead: 'Comunicación permanente', texto: 'Los padres o apoderados deberán permanecer localizables durante las sesiones y cumplir las indicaciones de acompañamiento comunicadas por el Centro.' },
      { lead: 'Recojo puntual', texto: 'Los padres, apoderados o adultos autorizados deberán recoger puntualmente a los menores al finalizar sus sesiones terapéuticas.' },
      { lead: 'Continuidad terapéutica', texto: 'Se recomienda cumplir las actividades y orientaciones del profesional para favorecer la continuidad del tratamiento.' },
      { lead: 'Información sobre cambios de salud', texto: 'Informar oportunamente cualquier cambio relevante en el estado de salud o comportamiento del paciente.' },
      { lead: 'Permanencia y supervisión de menores', texto: 'Los menores deberán permanecer bajo la responsabilidad de sus padres, apoderados o adultos autorizados antes y después de sus sesiones. Queda prohibido dejar a menores solos en las instalaciones, salvo durante la atención terapéutica cuando corresponda.' },
      { lead: 'Responsabilidad de los padres o apoderados', texto: 'Deberán garantizar el acompañamiento del menor y su recojo puntual. El personal no brinda servicios de guardería ni de cuidado o supervisión fuera de los horarios de atención contratados.' },
      { lead: 'Incumplimiento reiterado', texto: 'Ante el abandono o el incumplimiento reiterado del recojo, el Centro emitirá una advertencia formal; de reincidir, podrá disponer la no renovación o finalización de los servicios, previa comunicación y respetando los derechos del paciente.' },
      { lead: 'Protección del menor', texto: 'Si un menor permanece sin acompañamiento, el Centro adoptará medidas razonables para su seguridad y se comunicará con sus padres, apoderados o contactos de emergencia, sin dejarlo desatendido ni exponerlo a riesgo.' },
      { lead: 'Personas autorizadas para el recojo', texto: 'El Centro podrá solicitar la identificación de quien recoge al menor y verificar que cuente con la autorización correspondiente, para garantizar su seguridad.' },
    ],
  },
  {
    numero: 11,
    titulo: 'Conducta y Convivencia',
    lista: [
      'Pacientes, familiares, acompañantes y trabajadores deberán mantener un trato respetuoso dentro de las instalaciones.',
      'No se permiten actos de violencia, amenazas, discriminación, hostigamiento ni conductas que comprometan la seguridad de otras personas.',
      'Los materiales terapéuticos, mobiliario y equipos deberán utilizarse adecuadamente.',
      'Los padres o responsables deberán supervisar a los menores a su cuidado en las áreas comunes del Centro.',
      'Ante situaciones de riesgo, el Centro podrá adoptar medidas de seguridad proporcionales, respetando los derechos del paciente y la continuidad asistencial.',
    ],
  },
  {
    numero: 12,
    titulo: 'Seguridad y Salud',
    lista: [
      'El Centro mantiene medidas de limpieza, higiene y seguridad para proteger a sus pacientes y trabajadores.',
      'Los padres o responsables deberán informar si el paciente presenta enfermedades contagiosas, síntomas relevantes u otras condiciones que requieran precauciones especiales.',
      'Ante una emergencia durante la atención, el personal aplicará las medidas correspondientes y procurará comunicarse con el contacto de emergencia registrado.',
      'El Centro no garantiza resultados terapéuticos específicos, debido a que dependen de múltiples factores individuales y clínicos.',
      'Ninguna disposición de estos términos excluye o limita la responsabilidad legal que pudiera corresponder al Centro o a sus profesionales.',
    ],
  },
  {
    numero: 13,
    titulo: 'Protección de Datos Personales y Confidencialidad',
    lista: [
      'El Centro trata los datos personales y la información de salud conforme a la Ley N.° 29733, Ley de Protección de Datos Personales, y su reglamento vigente.',
      'La información se utiliza para finalidades asistenciales, administrativas y legales, respetando las bases de legitimación aplicables.',
      'El acceso a la información se limita al personal autorizado, según sus funciones.',
      'Las fotografías, grabaciones y testimonios destinados a publicidad, redes sociales u otros fines distintos de la atención requieren la autorización correspondiente.',
      'Los titulares podrán ejercer sus derechos de acceso, rectificación, cancelación y oposición, cuando resulten aplicables, a través de los canales habilitados.',
      'La información clínica se conservará durante los plazos exigidos por la normativa vigente.',
    ],
  },
  {
    numero: 14,
    titulo: 'Historia Clínica y Documentación',
    lista: [
      'Las atenciones se registran conforme a los procedimientos asistenciales y las disposiciones legales aplicables.',
      'Los pacientes o sus representantes legalmente autorizados podrán solicitar acceso o copias de su documentación clínica conforme a ley.',
      'La entrega está sujeta a la verificación de identidad y legitimidad del solicitante, para proteger la confidencialidad de la información.',
      'La emisión de constancias, informes adicionales u otros documentos no incluidos en el servicio podrá tener un costo previamente informado, cuando la ley lo permita.',
    ],
  },
  {
    numero: 15,
    titulo: 'Suspensión o Finalización del Tratamiento',
    lista: [
      'El paciente o su representante podrá solicitar la interrupción del tratamiento, comunicándolo al área administrativa.',
      'El Centro podrá recomendar la derivación a otro profesional o establecimiento cuando las necesidades del paciente excedan sus competencias o capacidad de atención.',
      'El Centro podrá evaluar la finalización de la relación contractual ante incumplimientos graves o reiterados, incluyendo las obligaciones de supervisión y recojo de menores, con justificación objetiva y respetando los derechos del paciente.',
      'Antes de finalizar el servicio por incumplimientos de los padres o apoderados, se comunicará formalmente la situación y se evaluarán medidas para evitar una interrupción asistencial perjudicial.',
      'Las sesiones pendientes serán evaluadas para determinar las alternativas de reprogramación o devolución que correspondan.',
    ],
  },
  {
    numero: 16,
    titulo: 'Reclamos y Sugerencias',
    lista: [
      'Los pacientes y sus representantes podrán presentar consultas, sugerencias, quejas o reclamos mediante los canales oficiales del Centro.',
      'El Centro cuenta con los mecanismos de recepción y atención de reclamos exigidos por la normativa aplicable.',
      'Los reclamos serán atendidos dentro de los plazos establecidos legalmente.',
      'Los usuarios podrán acudir a las autoridades competentes, incluyendo SUSALUD cuando corresponda, para ejercer sus derechos.',
    ],
  },
  {
    numero: 17,
    titulo: 'Modificaciones de los Términos y Condiciones',
    lista: [
      'El Centro podrá actualizar los presentes Términos y Condiciones por razones operativas, administrativas, asistenciales o legales.',
      'Las modificaciones serán comunicadas mediante los canales oficiales del Centro.',
      'Los cambios no se aplicarán retroactivamente en perjuicio de los derechos adquiridos por los pacientes.',
    ],
  },
  {
    numero: 18,
    titulo: 'Aceptación de los Términos y Condiciones',
    lista: [
      'El paciente o su representante declara haber recibido información clara sobre los servicios contratados, tarifas, duración, programación, reprogramación, cancelación, devolución y responsabilidades durante su permanencia en las instalaciones.',
      'La aceptación podrá registrarse mediante firma física o mecanismos electrónicos válidos.',
      'La aceptación de estos términos administrativos no sustituye el consentimiento informado que corresponda para las evaluaciones o intervenciones clínicas.',
      'El padre, madre o apoderado de un menor reconoce su obligación de garantizar el acompañamiento y recojo oportuno del menor, así como las consecuencias contractuales de incumplimientos reiterados.',
    ],
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
              Centro Integral de Terapias Crecemos. Condiciones que rigen la contratación, programación
              y prestación de nuestros servicios terapéuticos.
            </p>
            <span className="trm-updated">
              <i className="bi bi-calendar-check" /> Última actualización: 06 de noviembre de 2026
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
              El <strong>Centro Integral de Terapias Crecemos</strong> regula mediante los presentes
              Términos y Condiciones la contratación, programación y prestación de sus servicios. La
              contratación implica la aceptación de las condiciones previamente informadas y válidamente
              acordadas, sin perjuicio de los derechos reconocidos por la legislación peruana vigente.
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
                      <li key={idx}>
                        {typeof item === 'string' ? (
                          item
                        ) : (
                          <>
                            <strong className="trm-lead">{item.lead}:</strong> {item.texto}
                          </>
                        )}
                      </li>
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
        .trm-lead { color: var(--cx-ink); font-weight: 700; }

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
