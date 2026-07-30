import React from 'react';

export default function ApraxiaHablaTeaQueEsBlog() {
  return (
    <>
      {/* Introducción principal */}
      <div className="lead mb-5" style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#555' }}>
        Muchos padres notan que su hijo comprende lo que le dicen e intenta comunicarse, pero
        <strong> las palabras no salen con claridad</strong>. En algunos niños esto puede deberse a un trastorno
        llamado Apraxia del Habla Infantil (AHI).
      </div>

      <p className="mb-4">
        Cuando además el niño tiene un diagnóstico de Trastorno del Espectro Autista (TEA), identificar la apraxia es
        aún más importante, ya que <strong>ambos trastornos pueden coexistir</strong> y requerir un abordaje
        terapéutico específico.
      </p>

      {/* Imagen hero 1 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/apraxia-que-es-1.webp"
          alt="Niño esforzándose por pronunciar una palabra junto a su terapeuta"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <hr className="my-5" />

      {/* Sección 1: Qué es */}
      <h2 className="section-title" data-aos="fade-up">
        <i className="bi bi-diagram-3-fill me-2" style={{ color: '#1976d2' }}></i>
        ¿Qué es la Apraxia del Habla Infantil?
      </h2>

      <p className="mb-4">
        La Apraxia del Habla Infantil (AHI) es un <strong>trastorno neurológico de la planificación y programación</strong>
        de los movimientos necesarios para hablar. El problema no está en la fuerza de los músculos, sino en que el
        cerebro tiene dificultad para organizar correctamente los movimientos de labios, lengua, mandíbula y paladar
        para producir las palabras.
      </p>

      <div className="tips-box mb-5" data-aos="fade-up" style={{
        background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
        borderLeft: '4px solid #1976d2',
        padding: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <i className="bi bi-lightbulb-fill" style={{ fontSize: '2rem', color: '#0d47a1', flexShrink: 0 }}></i>
          <div>
            <h4 style={{ color: '#0d47a1', marginBottom: '1rem' }}>Ejemplo sencillo</h4>
            <p style={{ marginBottom: '0.75rem', lineHeight: '1.8' }}>
              Imagina que el cerebro quiere decir la palabra <em>"pelota"</em>. Los músculos funcionan bien, pero el
              cerebro envía las instrucciones en un <strong>orden incorrecto</strong>. Como resultado, el niño puede decir:
            </p>
            <p style={{ marginBottom: '0.75rem', lineHeight: '1.8' }}>
              <em>"pe…"</em> · <em>"peta"</em> · <em>"pota"</em> · <em>"pelo"</em> · o simplemente no lograr producirla.
            </p>
            <p style={{ marginBottom: '0', lineHeight: '1.8', fontWeight: '500' }}>
              Cada intento puede sonar diferente.
            </p>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      {/* Sección 2: Señales */}
      <h2 className="section-title" data-aos="fade-up">
        <i className="bi bi-exclamation-triangle-fill me-2" style={{ color: '#e65100' }}></i>
        ¿Cuáles son las principales señales?
      </h2>

      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card" style={{ borderLeft: '4px solid #e65100' }}>
            <div className="benefit-icon" style={{ background: '#ffe0b2', color: '#e65100', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-chat-square-text-fill"></i>
            </div>
            <h3>Pocas palabras para su edad</h3>
            <p>Dice muy pocas palabras en comparación con lo esperado para su edad.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card" style={{ borderLeft: '4px solid #e65100' }}>
            <div className="benefit-icon" style={{ background: '#ffe0b2', color: '#e65100', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-shuffle"></i>
            </div>
            <h3>Errores que cambian</h3>
            <p>Los errores varían cada vez que intenta decir la misma palabra.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card" style={{ borderLeft: '4px solid #e65100' }}>
            <div className="benefit-icon" style={{ background: '#ffe0b2', color: '#e65100', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-ear-fill"></i>
            </div>
            <h3>Comprende más de lo que expresa</h3>
            <p>Entiende mucho más de lo que logra decir con palabras.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
          <div className="benefit-card" style={{ borderLeft: '4px solid #e65100' }}>
            <div className="benefit-icon" style={{ background: '#ffe0b2', color: '#e65100', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-search"></i>
            </div>
            <h3>Esfuerzo visible</h3>
            <p>Busca con la boca cómo producir el sonido, con esfuerzo evidente.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="500">
          <div className="benefit-card" style={{ borderLeft: '4px solid #e65100' }}>
            <div className="benefit-icon" style={{ background: '#ffe0b2', color: '#e65100', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-arrow-repeat"></i>
            </div>
            <h3>Dificultad para imitar</h3>
            <p>Le cuesta imitar palabras o sonidos cuando se le pide.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="600">
          <div className="benefit-card" style={{ borderLeft: '4px solid #e65100' }}>
            <div className="benefit-icon" style={{ background: '#ffe0b2', color: '#e65100', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-volume-down-fill"></i>
            </div>
            <h3>Habla poco clara</h3>
            <p>Su habla resulta difícil de entender para los demás.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="700">
          <div className="benefit-card" style={{ borderLeft: '4px solid #e65100' }}>
            <div className="benefit-icon" style={{ background: '#ffe0b2', color: '#e65100', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-link-45deg"></i>
            </div>
            <h3>Le cuesta unir sílabas</h3>
            <p>Tiene dificultad para unir sílabas y formar palabras largas.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="800">
          <div className="benefit-card" style={{ borderLeft: '4px solid #e65100' }}>
            <div className="benefit-icon" style={{ background: '#ffe0b2', color: '#e65100', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-music-note-beamed"></i>
            </div>
            <h3>Alteración del ritmo</h3>
            <p>Presenta alteraciones en la entonación o el ritmo del habla.</p>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      {/* Sección 3: Coexistencia con TEA */}
      <h2 className="section-title" data-aos="fade-up">
        <i className="bi bi-people-fill me-2" style={{ color: '#6a1b9a' }}></i>
        ¿Puede presentarse junto con el TEA?
      </h2>

      <div className="alert-info mb-4" data-aos="fade-up">
        <i className="bi bi-check-circle-fill me-2"></i>
        <strong>Sí.</strong> Un niño puede tener TEA y Apraxia del Habla Infantil al mismo tiempo.
      </div>

      <p className="mb-4">
        No todos los niños con TEA tienen apraxia, pero algunos presentan ambas condiciones. Cuando esto ocurre, el
        niño enfrenta <strong>dos desafíos diferentes</strong>:
      </p>

      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card" style={{ borderLeft: '4px solid #6a1b9a' }}>
            <div className="benefit-icon" style={{ background: '#e1bee7', color: '#4a148c', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-people"></i>
            </div>
            <h3>TEA</h3>
            <p>Dificultades en la comunicación social y la interacción. Puede presentar intereses restringidos o conductas repetitivas.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card" style={{ borderLeft: '4px solid #6a1b9a' }}>
            <div className="benefit-icon" style={{ background: '#e1bee7', color: '#4a148c', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-mic-fill"></i>
            </div>
            <h3>Apraxia del Habla</h3>
            <p>Dificultad para planificar los movimientos del habla. Los músculos funcionan, pero el cerebro no organiza adecuadamente esos movimientos.</p>
          </div>
        </div>
      </div>

      <div className="warning-box mb-5" data-aos="fade-up">
        <i className="bi bi-info-circle-fill"></i>
        <div>
          <p className="mb-0">
            Es importante entender que son <strong>trastornos distintos, aunque pueden coexistir</strong>.
          </p>
        </div>
      </div>

      <hr className="my-5" />

      {/* Sección 4: Impacto en la comunicación */}
      <h2 className="section-title" data-aos="fade-up">
        <i className="bi bi-chat-dots-fill me-2" style={{ color: '#00838f' }}></i>
        ¿La Apraxia hace más difícil la comunicación en niños con TEA?
      </h2>

      <div className="alert-info mb-4" data-aos="fade-up">
        <i className="bi bi-check-circle-fill me-2"></i>
        <strong>Sí.</strong>
      </div>

      <p className="mb-4">
        La apraxia <strong>no hace que el autismo sea más severo</strong>. Sin embargo, cuando ambas condiciones están
        presentes, la comunicación puede verse más afectada, ya que el niño enfrenta simultáneamente dificultades para
        comunicarse socialmente y para producir el habla.
      </p>

      <div className="tips-box mb-5" data-aos="fade-up" style={{
        background: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)',
        borderLeft: '4px solid #00838f',
        padding: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <i className="bi bi-clipboard2-pulse-fill" style={{ fontSize: '2rem', color: '#006064', flexShrink: 0 }}></i>
          <div>
            <p style={{ marginBottom: '0', lineHeight: '1.8' }}>
              Por ello es fundamental realizar una <strong>evaluación especializada</strong> para identificar todas las
              necesidades del niño y diseñar un tratamiento adecuado.
            </p>
          </div>
        </div>
      </div>

      {/* Imagen 2 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/apraxia-que-es-2.webp"
          alt="Sesión de terapia de lenguaje especializada con un niño"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <hr className="my-5" />

      {/* Sección 5: Tratamiento */}
      <h2 className="section-title" data-aos="fade-up">
        <i className="bi bi-clipboard2-check-fill me-2" style={{ color: '#2e7d32' }}></i>
        ¿Cómo se trata?
      </h2>

      <p className="mb-4">
        El tratamiento debe ser <strong>individualizado, intensivo y basado en evidencia científica</strong>.
      </p>

      {/* 1. Terapia de Lenguaje especializada */}
      <div className="recipe-section mb-5" data-aos="fade-up">
        <div className="recipe-number">1</div>
        <h3 className="recipe-title">Terapia de Lenguaje especializada en Apraxia</h3>
        <div className="recipe-content">
          <p className="mb-3">
            El objetivo es enseñar al cerebro a <strong>planificar correctamente los movimientos del habla</strong>.
            Durante la terapia se trabaja:
          </p>
          <ul className="feature-list mb-3">
            <li><i className="bi bi-check-circle-fill"></i> Producción de sonidos</li>
            <li><i className="bi bi-check-circle-fill"></i> Sílabas</li>
            <li><i className="bi bi-check-circle-fill"></i> Palabras funcionales</li>
            <li><i className="bi bi-check-circle-fill"></i> Coordinación de labios, lengua y mandíbula</li>
            <li><i className="bi bi-check-circle-fill"></i> Precisión en los movimientos del habla</li>
            <li><i className="bi bi-check-circle-fill"></i> Generalización al habla espontánea</li>
          </ul>
          <p className="mb-0">
            La <strong>práctica repetitiva y estructurada</strong> es fundamental para lograr avances.
          </p>
        </div>
      </div>

      {/* 2. Motricidad Orofacial */}
      <div className="recipe-section mb-5" data-aos="fade-up">
        <div className="recipe-number">2</div>
        <h3 className="recipe-title">Terapia de Motricidad Orofacial</h3>
        <div className="recipe-content">
          <p className="mb-3">
            En algunos niños con apraxia también pueden existir dificultades asociadas en:
          </p>
          <ul className="feature-list mb-0">
            <li><i className="bi bi-check-circle-fill"></i> Control mandibular</li>
            <li><i className="bi bi-check-circle-fill"></i> Movimientos linguales</li>
            <li><i className="bi bi-check-circle-fill"></i> Coordinación labial</li>
            <li><i className="bi bi-check-circle-fill"></i> Alimentación, masticación y deglución</li>
          </ul>
        </div>
      </div>

      {/* 3. Comunicación funcional */}
      <div className="recipe-section mb-5" data-aos="fade-up">
        <div className="recipe-number">3</div>
        <h3 className="recipe-title">Intervención centrada en la comunicación</h3>
        <div className="recipe-content">
          <p className="mb-3">
            Cuando el niño presenta TEA, además del trabajo motor del habla, es esencial fortalecer la comunicación
            funcional. Programas basados en evidencia como el <strong>Modelo Denver de Atención Temprana (ESDM)</strong>
            promueven:
          </p>
          <ul className="feature-list mb-3">
            <li><i className="bi bi-check-circle-fill"></i> Atención conjunta</li>
            <li><i className="bi bi-check-circle-fill"></i> Imitación</li>
            <li><i className="bi bi-check-circle-fill"></i> Juego compartido</li>
            <li><i className="bi bi-check-circle-fill"></i> Comunicación espontánea</li>
            <li><i className="bi bi-check-circle-fill"></i> Lenguaje funcional</li>
            <li><i className="bi bi-check-circle-fill"></i> Interacción con la familia</li>
          </ul>
          <p className="mb-0">
            El objetivo no es solo que el niño pronuncie palabras, sino que las <strong>utilice para comunicarse en su
            vida diaria</strong>.
          </p>
        </div>
      </div>

      <hr className="my-5" />

      {/* Sección 6: Quién debe tratarlo */}
      <h2 className="section-title" data-aos="fade-up">
        <i className="bi bi-person-badge-fill me-2" style={{ color: '#1976d2' }}></i>
        ¿Quién debe realizar el tratamiento?
      </h2>

      <p className="mb-4">
        El tratamiento debe ser realizado por un <strong>Tecnólogo Médico en Terapia de Lenguaje</strong> con
        formación en:
      </p>

      <ul className="feature-list mb-5">
        <li><i className="bi bi-check-circle-fill"></i> Apraxia del Habla Infantil</li>
        <li><i className="bi bi-check-circle-fill"></i> Motricidad Orofacial</li>
        <li><i className="bi bi-check-circle-fill"></i> Desarrollo del lenguaje</li>
        <li><i className="bi bi-check-circle-fill"></i> Comunicación en niños con TEA</li>
      </ul>

      <hr className="my-5" />

      {/* Sección 7: Cuándo buscar evaluación */}
      <h2 className="section-title" data-aos="fade-up">
        <i className="bi bi-clipboard2-pulse-fill me-2" style={{ color: '#c62828' }}></i>
        ¿Cuándo buscar una evaluación?
      </h2>

      <p className="mb-4">
        Solicita una evaluación con un Tecnólogo Médico en Terapia de Lenguaje si tu hijo:
      </p>

      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card" style={{ borderLeft: '4px solid #c62828' }}>
            <div className="benefit-icon" style={{ background: '#ffcdd2', color: '#b71c1c', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-calendar-event-fill"></i>
            </div>
            <h3>Pocas palabras a los 18 meses</h3>
            <p>A los 18 meses dice muy pocas palabras.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card" style={{ borderLeft: '4px solid #c62828' }}>
            <div className="benefit-icon" style={{ background: '#ffcdd2', color: '#b71c1c', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-ear-fill"></i>
            </div>
            <h3>Comprende pero le cuesta hablar</h3>
            <p>Entiende lo que le dicen, pero le cuesta expresarse verbalmente.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card" style={{ borderLeft: '4px solid #c62828' }}>
            <div className="benefit-icon" style={{ background: '#ffcdd2', color: '#b71c1c', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-shuffle"></i>
            </div>
            <h3>Errores que cambian</h3>
            <p>Sus errores al hablar cambian constantemente.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
          <div className="benefit-card" style={{ borderLeft: '4px solid #c62828' }}>
            <div className="benefit-icon" style={{ background: '#ffcdd2', color: '#b71c1c', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-arrow-repeat"></i>
            </div>
            <h3>Dificultad para imitar</h3>
            <p>Tiene dificultades para imitar palabras o sonidos.</p>
          </div>
        </div>

        <div className="col-md-12" data-aos="fade-up" data-aos-delay="500">
          <div className="benefit-card" style={{ borderLeft: '4px solid #c62828' }}>
            <div className="benefit-icon" style={{ background: '#ffcdd2', color: '#b71c1c', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-people-fill"></i>
            </div>
            <h3>TEA sin habla funcional</h3>
            <p>Presenta un diagnóstico de TEA y aún no desarrolla un habla funcional.</p>
          </div>
        </div>
      </div>

      <div className="warning-box mb-5" data-aos="fade-up">
        <i className="bi bi-graph-up-arrow"></i>
        <div>
          <p className="mb-0">
            Una <strong>evaluación temprana</strong> permite iniciar el tratamiento oportunamente y potenciar las
            oportunidades de comunicación.
          </p>
        </div>
      </div>

      <hr className="my-5" />

      {/* Mensaje final */}
      <div className="tips-box mb-5" data-aos="fade-up" style={{
        background: 'linear-gradient(135deg, #f5f3ff 0%, #e8e0ff 100%)',
        borderLeft: '4px solid #9B59B6',
        padding: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <i className="bi bi-heart-fill" style={{ fontSize: '2.5rem', color: '#6a1b9a', flexShrink: 0 }}></i>
          <div>
            <h3 style={{ color: '#6a1b9a', marginBottom: '1rem' }}>Mensaje final</h3>
            <p style={{ marginBottom: '0', lineHeight: '1.8' }}>
              Cada palabra que tu hijo logra decir es el resultado de un gran esfuerzo. Con una
              <strong> evaluación adecuada, un tratamiento especializado y el apoyo de la familia</strong>, es posible
              fortalecer su comunicación y ayudarlo a desarrollar todo su potencial.
            </p>
          </div>
        </div>
      </div>

      {/* Referencias */}
      <h2 className="section-title" data-aos="fade-up">
        <i className="bi bi-book-fill me-2" style={{ color: '#455a64' }}></i>
        Referencias científicas
      </h2>

      <ul className="feature-list mb-5">
        <li><i className="bi bi-journal-text"></i> American Speech-Language-Hearing Association (ASHA). <em>Childhood Apraxia of Speech</em>.</li>
        <li><i className="bi bi-journal-text"></i> Murray E, McCabe P, Ballard KJ. <em>A Systematic Review of Treatment Outcomes for Childhood Apraxia of Speech</em>.</li>
        <li><i className="bi bi-journal-text"></i> Strand EA. <em>Dynamic Temporal and Tactile Cueing (DTTC)</em>.</li>
        <li><i className="bi bi-journal-text"></i> Hayden D. <em>PROMPT: A Tactile-Kinesthetic Approach to Speech Production Disorders</em>.</li>
        <li><i className="bi bi-journal-text"></i> Rogers SJ, Dawson G. <em>Early Start Denver Model for Young Children with Autism</em>.</li>
      </ul>

      {/* Autor */}
      <div className="author-credits" data-aos="fade-up">
        <div className="d-flex align-items-center gap-3">
          <div className="author-avatar">
            <i className="bi bi-person-circle" style={{ fontSize: '4rem', color: '#9B59B6' }}></i>
          </div>
          <div>
            <h4 style={{ marginBottom: '0.25rem', color: '#333' }}>Lic. Merlin Fernández Guadalupe</h4>
            <p style={{ marginBottom: '0.25rem', color: '#666', fontSize: '0.95rem' }}>
              <strong>Tecnóloga Médica en Terapia de Lenguaje</strong>
            </p>
            <p style={{ marginBottom: '0', color: '#888', fontSize: '0.9rem' }}>
              Coordinadora y Fundadora – Centro Crecemos
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
