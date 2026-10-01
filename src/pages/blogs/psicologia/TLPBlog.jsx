import React from 'react';

const PRIMARY = '#7B1FA2';
const GREEN = '#A3C644';

const imgStyle = { width: '100%', height: '460px', objectFit: 'cover', borderRadius: '12px' };
const hideOnError = (e) => { e.target.style.display = 'none'; };

export default function TLPBlog() {
  return (
    <>
      {/* Introducción */}
      <div className="lead mb-5" style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#555' }}>
        ¿Y si no fuera simplemente una etapa? Hay días en los que parece que todo está bien y, de
        pronto, una discusión puede convertirse en una intensa respuesta emocional. Pueden aparecer
        cambios bruscos en la forma de relacionarse, impulsividad o una sensación profunda de vacío.
        Conocer estas señales no significa diagnosticar: significa <strong>ayudar a través de una
        intervención temprana</strong>.
      </div>


      {/* ¿Qué es el TLP? */}
      <h2 className="section-title">¿Qué es el TLP?</h2>
      <p className="mb-4">
        El <strong>Trastorno Límite de la Personalidad (TLP)</strong> se caracteriza por conductas
        constantes de inestabilidad emocional, social y consigo mismo, impulsividad y una autoimagen
        inestable. Se puede diagnosticar en personas mayores de 18 años; sin embargo, existen
        adolescentes que presentan algunas señales, por eso <strong>intervenir a tiempo es clave</strong>
        {' '}(Toyosato &amp; Ferrufino-Borja, 2023).
      </p>

      <div className="recipe-image-placeholder mb-5">
        <img src="/assets/img/blog/tlp1.webp" alt="Inestabilidad emocional en el TLP" style={imgStyle} onError={hideOnError} />
      </div>

      <hr className="my-5" />

      {/* Signos de alerta */}
      <h2 className="section-title">Signos de alerta</h2>
      <p className="mb-4">
        Para la Asociación Americana de Psiquiatría (2014), el TLP se caracteriza por el cumplimiento de
        al menos <strong>5 de las siguientes características</strong>:
      </p>
      <div className="row gy-4 mb-5">
        {[
          ['bi-person-x', 'Miedo al abandono', 'Gran temor a la soledad y hacer lo posible por evitarla.'],
          ['bi-heartbreak', 'Relaciones inestables', 'Querer mucho a una persona y luego sentirse muy molesta con ella.'],
          ['bi-lightning-charge', 'Conductas impulsivas', 'Conducir de forma peligrosa, comer sin control, etc., sin pensar en las consecuencias.'],
          ['bi-bandaid', 'Conductas de hacerse daño', 'Amenazar con hacerse daño o autolesionarse.'],
          ['bi-fire', 'Enojo difícil de controlar', 'Reaccionar con mucha ira en situaciones del día a día.'],
          ['bi-arrow-repeat', 'Cambios bruscos de humor', 'Pasar de una emoción a otra opuesta en cuestión de horas o pocos días.'],
          ['bi-person-bounding-box', 'Cambios en la imagen personal', 'Dudar constantemente de lo que quiere, desea o de su identidad.'],
          ['bi-cloud', 'Sensación de vacío', 'Sentir con frecuencia un vacío del que resulta difícil encontrar salida.'],
        ].map(([icon, title, text], i) => (
          <div className="col-md-6" key={i}>
            <div className="benefit-card" style={{ borderLeft: `4px solid ${PRIMARY}` }}>
              <div className="benefit-icon"><i className={`bi ${icon}`}></i></div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="recipe-image-placeholder mb-5">
        <img src="/assets/img/blog/tlp2.webp" alt="Relaciones y emociones intensas" style={imgStyle} onError={hideOnError} />
      </div>

      <hr className="my-5" />

      {/* Causas */}
      <h2 className="section-title">Causas</h2>
      <p className="mb-4">
        Las personas con TLP tienden a tener antecedentes de experiencias negativas durante la infancia,
        como:
      </p>
      <div className="alert-info mb-5" style={{ background: 'linear-gradient(135deg, #f3e9f7 0%, #e9dcf0 100%)', border: `2px solid ${PRIMARY}`, padding: '2rem', borderRadius: '12px' }}>
        <ul style={{ lineHeight: 1.9, marginBottom: 0 }}>
          <li>Difíciles relaciones parentales.</li>
          <li>Críticas, hostilidad y rechazo.</li>
          <li>Abuso emocional, físico y sexual.</li>
        </ul>
      </div>

      {/* Factores de riesgo */}
      <h2 className="section-title">Factores de riesgo</h2>
      <p className="mb-4">
        Según la Fundación AMAI TLP (s. f.), el trastorno comprende aspectos biológicos, genéticos y
        ambientales, pero también existen situaciones que refuerzan e intensifican el problema:
      </p>
      <div className="row gy-4 mb-5">
        {[
          ['bi-person-dash', 'Abandono en la niñez o adolescencia'],
          ['bi-house-exclamation', 'Vida familiar inestable'],
          ['bi-chat-square-dots', 'Mala comunicación en la familia'],
          ['bi-shield-x', 'Abuso sexual, físico o emocional'],
          ['bi-emoji-frown', 'Bullying'],
        ].map(([icon, text], i) => (
          <div className="col-md-4" key={i}>
            <div className="benefit-card" style={{ borderLeft: `4px solid ${GREEN}` }}>
              <div className="benefit-icon"><i className={`bi ${icon}`}></i></div>
              <p className="mb-0" style={{ fontSize: '1.02rem' }}>{text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="recipe-image-placeholder mb-5">
        <img src="/assets/img/blog/tlp3.webp" alt="Experiencias tempranas y factores de riesgo" style={imgStyle} onError={hideOnError} />
      </div>

      <hr className="my-5" />

      {/* Señales que deberían llamar la atención */}
      <h2 className="section-title">¿Qué señales deberían llamar nuestra atención?</h2>
      <p className="mb-4">
        Según la Dra. Spelman (2024), conviene prestar atención a este conjunto de comportamientos:
      </p>
      <div className="alert-info mb-5" style={{ background: 'linear-gradient(135deg, #f3f8e8 0%, #eaf2d4 100%)', border: `2px solid ${GREEN}`, padding: '2rem', borderRadius: '12px' }}>
        <ul style={{ lineHeight: 1.9, marginBottom: 0 }}>
          <li>Relaciones inestables (sentimentales y sociales).</li>
          <li>Decisiones impulsivas.</li>
          <li>Autolesiones.</li>
          <li>Sentimiento de soledad, insatisfacción y tristeza frecuente.</li>
          <li>Sensación de desconexión con el mundo exterior.</li>
        </ul>
      </div>

      <div className="warning-box mb-5">
        <i className="bi bi-exclamation-circle-fill"></i>
        <div>
          <p className="mb-0">
            <strong>Ojo:</strong> no todo es TLP. Tener algunos de estos síntomas en momentos difíciles,
            asociados al estrés o a la adolescencia, es comprensible. Por eso importa la
            <strong> intensidad, la frecuencia y el malestar</strong>. Ante dudas, acude a un profesional
            de la salud mental (psicólogo) para una evaluación y un diagnóstico correcto.
          </p>
        </div>
      </div>

      <hr className="my-5" />

      {/* Por qué acudir a un profesional */}
      <h2 className="section-title">¿Por qué es importante acudir a un profesional?</h2>
      <p className="mb-4">
        Si crees que alguien cercano puede estar en riesgo, uno de los primeros pasos es acudir a un
        psicólogo o psiquiatra, ya que conocen el tema en profundidad (Instituto Nacional de la Salud
        Mental, 2025). Recuerda que, aunque dos personas tengan el mismo diagnóstico,
        <strong> no tendrán el mismo camino de acompañamiento clínico</strong>.
      </p>

      <div className="recipe-image-placeholder mb-5">
        <img src="/assets/img/blog/tlp4.webp" alt="Acompañamiento psicológico profesional" style={imgStyle} onError={hideOnError} />
      </div>

      <p className="mb-4">La evaluación profesional suele incluir:</p>
      <div className="row gy-4 mb-5">
        {[
          ['bi-clipboard2-pulse', 'Síntomas'],
          ['bi-people', 'Antecedentes personales y familiares'],
          ['bi-journal-medical', 'Historial de enfermedades mentales'],
          ['bi-heart-pulse', 'Un examen médico'],
        ].map(([icon, text], i) => (
          <div className="col-md-3 col-sm-6" key={i}>
            <div className="benefit-card" style={{ borderLeft: `4px solid ${PRIMARY}`, textAlign: 'center' }}>
              <div className="benefit-icon"><i className={`bi ${icon}`}></i></div>
              <p className="mb-0" style={{ fontSize: '1rem' }}>{text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="tips-box mb-5" style={{ background: 'linear-gradient(135deg, #f3e9f7 0%, #eaf2d4 100%)', borderLeft: `4px solid ${PRIMARY}` }}>
        <i className="bi bi-stars"></i>
        <div>
          <p className="mb-0">
            <strong>Importante:</strong> ir al psicólogo debería ser una prioridad cuando nuestras
            emociones nos abruman, y aceptar que necesitamos ayuda es el primer paso.
          </p>
        </div>
      </div>

      <hr className="my-5" />

      {/* Terapias */}
      <h2 className="section-title">Tipos de terapias para abordar el TLP</h2>
      <p className="mb-4">
        Actualmente existen diversas psicoterapias para el tratamiento del TLP, respaldadas por estudios
        con buenos resultados (Armijos &amp; Polo, 2022).
      </p>

      <div className="recipe-image-placeholder mb-5">
        <img src="/assets/img/blog/tlp5.webp" alt="Terapias para el TLP: TCC y TDC" style={imgStyle} onError={hideOnError} />
      </div>

      {/* TCC */}
      <div className="alert-info mb-4" style={{ background: 'linear-gradient(135deg, #f3e9f7 0%, #e9dcf0 100%)', border: `2px solid ${PRIMARY}`, padding: '2rem', borderRadius: '12px' }}>
        <h4 style={{ color: PRIMARY, fontWeight: 700, marginBottom: '1rem' }}>
          <i className="bi bi-diagram-3 me-2"></i>Terapia Cognitivo-Conductual (TCC)
        </h4>
        <p className="mb-3">
          El pensamiento, la emoción y la conducta están relacionados y funcionan como un equipo. Se
          trabaja en identificar y modificar pensamientos poco funcionales, como el pensamiento
          dicotómico o extremo de "blanco y negro", donde una situación se interpreta como totalmente
          buena o totalmente mala, sin puntos intermedios.
        </p>
        <p className="mb-0" style={{ fontStyle: 'italic', color: '#555' }}>
          <strong>Ejemplo:</strong> alguien comete un error en el trabajo y piensa "soy un fracaso,
          siempre hago todo mal". En terapia se busca reemplazar ese pensamiento extremo por uno más
          equilibrado: "me equivoqué en esta tarea, pero eso no significa que haga todo mal; puedo
          revisar qué pasó y aprender de ello".
        </p>
      </div>

      {/* TDC */}
      <div className="alert-info mb-5" style={{ background: 'linear-gradient(135deg, #f3f8e8 0%, #eaf2d4 100%)', border: `2px solid ${GREEN}`, padding: '2rem', borderRadius: '12px' }}>
        <h4 style={{ color: PRIMARY, fontWeight: 700, marginBottom: '1rem' }}>
          <i className="bi bi-yin-yang me-2"></i>Terapia Dialéctico-Conductual (TDC)
        </h4>
        <p className="mb-3">
          Se centra en reducir los síntomas y desarrollar habilidades para aceptar lo que ocurre sin
          dejar de trabajar para generar cambios. Fortalece la toma de conciencia, la tolerancia al
          malestar y la regulación emocional (Mendoza et al., 2024).
        </p>
        <p className="mb-0" style={{ fontStyle: 'italic', color: '#555' }}>
          <strong>Ejemplo:</strong> ante una crítica, en lugar de reaccionar impulsivamente, se trabaja
          primero en reconocer y aceptar la emoción ("estoy molesto y puedo sentir esto sin actuar
          impulsivamente") y luego en estrategias para bajar la intensidad: respirar, esperar unos
          minutos y después conversar sobre lo ocurrido.
        </p>
      </div>

      {/* Cita Linehan */}
      <div className="mb-5" style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, #6A1B9A 100%)`, borderRadius: '16px', padding: '2.5rem', textAlign: 'center' }}>
        <i className="bi bi-quote" style={{ fontSize: '2.5rem', color: 'rgba(255,255,255,0.6)' }}></i>
        <p style={{ color: '#fff', fontSize: '1.15rem', lineHeight: 1.8, fontStyle: 'italic', maxWidth: 820, margin: '0.5rem auto 1rem' }}>
          "Las personas con trastorno límite de la personalidad son como las personas con quemaduras de
          tercer grado en el 90% de su cuerpo. Al carecer de piel emocional, sienten una agonía
          insoportable ante el más mínimo roce o movimiento."
        </p>
        <p style={{ color: GREEN, fontWeight: 700, marginBottom: 0 }}>— Marsha M. Linehan</p>
      </div>

      <hr className="my-5" />

      {/* Referencias */}
      <div className="mb-5" style={{ background: 'var(--cx-surface)', border: '1px solid var(--cx-line)', borderRadius: 'var(--cx-r-lg)', padding: '2rem' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '1.5rem', color: 'var(--cx-ink)' }}>Referencias</h3>
        <div style={{ fontSize: '0.95rem', lineHeight: 1.8, color: 'var(--cx-ink-2)' }}>
          <p className="mb-3"><strong>Asociación Americana de Psiquiatría.</strong> (2014). <em>Manual diagnóstico y estadístico de los trastornos mentales (DSM-5)</em> (5.ª ed.). Editorial Médica Panamericana.</p>
          <p className="mb-3"><strong>Armijos Piedra, T. R., &amp; Polo Martínez, E. M.</strong> (2022). Terapia cognitivo conductual en el pensamiento dicotómico del TLP. <em>Centros: Revista Científica Universitaria, 11</em>(1), 189–208.</p>
          <p className="mb-3"><strong>Fundación AMAI TLP.</strong> (s. f.). <em>Causas del Trastorno Límite de Personalidad y factores de riesgo</em>.</p>
          <p className="mb-3"><strong>Instituto Nacional de la Salud Mental.</strong> (2025). <em>Trastorno límite de la personalidad</em>. NIH.</p>
          <p className="mb-3"><strong>Mendoza Belmares, C., Reyna Martínez, M., &amp; González Tovar, J.</strong> (2024). Intervención cognitivo-conductual y dialéctico-conductual en el TLP. <em>Revista de Psicología de la UAEM, 13</em>(36), 120–144.</p>
          <p className="mb-3"><strong>Spelman, B.</strong> (2024). <em>9 señales del trastorno límite de la personalidad</em>. The Private Therapy Clinic.</p>
          <p className="mb-0"><strong>Toyosato, K. C. F., &amp; Ferrufino-Borja, D.</strong> (2023). Trastorno Límite de la Personalidad: características, causas, prevención y comorbilidad. <em>Revista de Estudiantes de Psicología, 11</em>(2), 105–111.</p>
        </div>
      </div>

      {/* Autor */}
      <div className="author-credits">
        <div className="d-flex align-items-center gap-3">
          <div className="author-avatar">
            <i className="bi bi-person-circle" style={{ fontSize: '4rem', color: 'var(--cx-primary)' }}></i>
          </div>
          <div>
            <h4 style={{ marginBottom: '0.25rem' }}>Centro Crecemos</h4>
            <p style={{ marginBottom: '0.4rem', color: 'var(--cx-muted)', fontSize: '0.95rem' }}>
              <strong>Centro Integral de Terapias</strong>
            </p>
            <a href="https://www.crecemos.com.pe" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--cx-primary-700)', fontWeight: 600, fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center' }}>
              <i className="bi bi-globe me-2"></i> www.crecemos.com.pe
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
