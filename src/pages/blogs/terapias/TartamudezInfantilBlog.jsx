import React from 'react';

export default function TartamudezInfantilBlog() {
  return (
    <>
      {/* Introducción principal */}
      <div className="lead mb-5" style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#555' }}>
        Soy terapeuta de lenguaje infantil y, en consulta, una de las frases que más escucho de los padres es:
        <strong> "A veces se traba al hablar… ¿es normal o puede ser tartamudez?"</strong>
      </div>

      <p className="mb-4">
        Esta duda es muy frecuente, especialmente entre los 2 y 4 años, una etapa en la que el lenguaje del
        niño se desarrolla de forma intensa y rápida. En este artículo quiero ayudarte a entender qué es
        esperable, qué señales requieren atención y cuándo es importante buscar una evaluación especializada,
        siempre desde la evidencia científica y con un enfoque tranquilo para las familias.
      </p>

      {/* Imagen hero 1 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/tartamudez-infantil-1.webp"
          alt="Niño hablando con terapeuta de lenguaje"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <hr className="my-5" />

      {/* Sección 1: Por qué aparecen disfluencias */}
      <h2 className="section-title" data-aos="fade-up">
        <i className="bi bi-graph-up-arrow me-2" style={{ color: '#1976d2' }}></i>
        ¿Por qué aparecen disfluencias entre los 2 y 4 años?
      </h2>

      <p className="mb-4">
        Entre los 2 y 4 años ocurre lo que llamamos una <strong>"explosión del lenguaje"</strong>:
      </p>

      <div className="row gy-4 mb-5">
        <div className="col-md-4" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card">
            <div className="benefit-icon" style={{ background: '#bbdefb', color: '#0d47a1', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-bar-chart-fill"></i>
            </div>
            <h3 style={{ fontSize: '1.1rem' }}>Vocabulario en expansión</h3>
            <p>El vocabulario crece rápidamente, con nuevas palabras cada día.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card">
            <div className="benefit-icon" style={{ background: '#bbdefb', color: '#0d47a1', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-chat-left-text-fill"></i>
            </div>
            <h3 style={{ fontSize: '1.1rem' }}>Frases más largas</h3>
            <p>Aparecen frases completas y estructuras gramaticales más complejas.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card">
            <div className="benefit-icon" style={{ background: '#bbdefb', color: '#0d47a1', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-lightning-charge-fill"></i>
            </div>
            <h3 style={{ fontSize: '1.1rem' }}>Pensamiento acelerado</h3>
            <p>El pensamiento del niño va más rápido que su capacidad para expresarse.</p>
          </div>
        </div>
      </div>

      <div className="tips-box mb-5" data-aos="fade-up" style={{
        background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
        borderLeft: '4px solid #1976d2',
        padding: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <i className="bi bi-book-fill" style={{ fontSize: '2rem', color: '#0d47a1', flexShrink: 0 }}></i>
          <div>
            <h4 style={{ color: '#0d47a1', marginBottom: '1rem' }}>Evidencia científica</h4>
            <p style={{ marginBottom: '0', lineHeight: '1.8' }}>
              Según los investigadores <strong>Yairi y Ambrose</strong>, especialistas en fluidez del habla infantil,
              en esta etapa es común que aparezcan <strong>disfluencias del desarrollo</strong>, especialmente cuando
              el niño está emocionado, cansado o quiere decir muchas cosas a la vez.
            </p>
          </div>
        </div>
      </div>

      <div className="alert-info mb-5" data-aos="fade-up">
        <i className="bi bi-check-circle-fill me-2"></i>
        <strong>No toda disfluencia es tartamudez.</strong>
      </div>

      <hr className="my-5" />

      {/* Sección 2: Disfluencias esperables */}
      <h2 className="section-title" data-aos="fade-up">
        <i className="bi bi-check2-circle me-2" style={{ color: '#2e7d32' }}></i>
        ¿Qué disfluencias son esperables durante el desarrollo del lenguaje?
      </h2>

      <p className="mb-4">
        De acuerdo con la <strong>American Speech-Language-Hearing Association (ASHA)</strong> y los estudios
        de <strong>Yairi & Ambrose</strong>, se consideran disfluencias normales cuando:
      </p>

      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card" style={{ borderLeft: '4px solid #2e7d32' }}>
            <div className="benefit-icon" style={{ background: '#c8e6c9', color: '#1b5e20', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-arrow-repeat"></i>
            </div>
            <h3>Repite palabras completas</h3>
            <p><em>"yo quiero, yo quiero galleta"</em></p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card" style={{ borderLeft: '4px solid #2e7d32' }}>
            <div className="benefit-icon" style={{ background: '#c8e6c9', color: '#1b5e20', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-pause-circle-fill"></i>
            </div>
            <h3>Pausas ocasionales</h3>
            <p>Hace pausas o vacilaciones ocasionales mientras habla.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card" style={{ borderLeft: '4px solid #2e7d32' }}>
            <div className="benefit-icon" style={{ background: '#c8e6c9', color: '#1b5e20', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-calendar-check-fill"></i>
            </div>
            <h3>Aparecen y desaparecen</h3>
            <p>Las disfluencias son intermitentes, no constantes.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
          <div className="benefit-card" style={{ borderLeft: '4px solid #2e7d32' }}>
            <div className="benefit-icon" style={{ background: '#c8e6c9', color: '#1b5e20', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-emoji-smile-fill"></i>
            </div>
            <h3>Sin tensión visible</h3>
            <p>No hay tensión en el rostro, cuello o mandíbula al hablar.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="500">
          <div className="benefit-card" style={{ borderLeft: '4px solid #2e7d32' }}>
            <div className="benefit-icon" style={{ background: '#c8e6c9', color: '#1b5e20', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-heart-fill"></i>
            </div>
            <h3>Sin frustración</h3>
            <p>El niño no se frustra ni evita hablar.</p>
          </div>
        </div>
      </div>

      {/* Imagen 2 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/tartamudez-infantil-2.webp"
          alt="Desarrollo normal del habla en niños pequeños"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <div className="warning-box mb-5" data-aos="fade-up">
        <i className="bi bi-clock-history"></i>
        <div>
          <p className="mb-2"><strong>¿Hasta cuándo es esperable que aparezcan disfluencias?</strong></p>
          <p className="mb-0">
            Estas disfluencias pueden aparecer de forma intermitente <strong>hasta los 4 años</strong>, e incluso
            en algunos niños hasta los 5 años, siempre que no aumenten en intensidad ni frecuencia.
          </p>
        </div>
      </div>

      <hr className="my-5" />

      {/* Sección 3: Señales de alerta */}
      <h2 className="section-title" data-aos="fade-up">
        <i className="bi bi-exclamation-triangle-fill me-2" style={{ color: '#c62828' }}></i>
        Señales de alerta: ¿cuándo es momento de consultar?
      </h2>

      <p className="mb-4">
        Las investigaciones indican <strong>mayor riesgo de tartamudez</strong> cuando se observan una o varias
        de las siguientes señales:
      </p>

      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card" style={{ borderLeft: '4px solid #c62828' }}>
            <div className="benefit-icon" style={{ background: '#ffcdd2', color: '#b71c1c', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-hourglass-split"></i>
            </div>
            <h3>Persistencia prolongada</h3>
            <p>Los bloqueos y repeticiones persisten más de <strong>6 meses consecutivos</strong> sin periodos de mejora.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card" style={{ borderLeft: '4px solid #c62828' }}>
            <div className="benefit-icon" style={{ background: '#ffcdd2', color: '#b71c1c', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-graph-up"></i>
            </div>
            <h3>Aumento con el tiempo</h3>
            <p>Las disfluencias aumentan en frecuencia o intensidad.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card" style={{ borderLeft: '4px solid #c62828' }}>
            <div className="benefit-icon" style={{ background: '#ffcdd2', color: '#b71c1c', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-skip-forward-fill"></i>
            </div>
            <h3>Repetición de sonidos o sílabas</h3>
            <p><em>"p-p-p-perro"</em>, <em>"ma-ma-ma-mamá"</em></p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
          <div className="benefit-card" style={{ borderLeft: '4px solid #c62828' }}>
            <div className="benefit-icon" style={{ background: '#ffcdd2', color: '#b71c1c', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-stop-circle-fill"></i>
            </div>
            <h3>Bloqueos</h3>
            <p>El niño quiere hablar, pero el sonido no sale.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="500">
          <div className="benefit-card" style={{ borderLeft: '4px solid #c62828' }}>
            <div className="benefit-icon" style={{ background: '#ffcdd2', color: '#b71c1c', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-dash-lg"></i>
            </div>
            <h3>Prolongaciones de sonidos</h3>
            <p><em>"ssssapo"</em></p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="600">
          <div className="benefit-card" style={{ borderLeft: '4px solid #c62828' }}>
            <div className="benefit-icon" style={{ background: '#ffcdd2', color: '#b71c1c', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-body-text"></i>
            </div>
            <h3>Tensión física</h3>
            <p>Tensión visible en labios, mandíbula, cuello o rostro al hablar.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="700">
          <div className="benefit-card" style={{ borderLeft: '4px solid #c62828' }}>
            <div className="benefit-icon" style={{ background: '#ffcdd2', color: '#b71c1c', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-emoji-frown-fill"></i>
            </div>
            <h3>Frustración o evitación</h3>
            <p>El niño se frustra, evita hablar o cambia palabras.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="800">
          <div className="benefit-card" style={{ borderLeft: '4px solid #c62828' }}>
            <div className="benefit-icon" style={{ background: '#ffcdd2', color: '#b71c1c', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-people-fill"></i>
            </div>
            <h3>Antecedentes familiares</h3>
            <p>Antecedentes familiares de tartamudez.</p>
          </div>
        </div>
      </div>

      <div className="alert-info mb-5" data-aos="fade-up" style={{ background: '#fff3e0', borderLeft: '4px solid #e65100' }}>
        <i className="bi bi-shield-exclamation me-2" style={{ color: '#e65100' }}></i>
        En estos casos, <strong>esperar sin orientación profesional no es recomendable.</strong>
      </div>

      <hr className="my-5" />

      {/* Sección 4: Qué SÍ hacer */}
      <h2 className="section-title" data-aos="fade-up">
        <i className="bi bi-check-circle-fill me-2" style={{ color: '#6a1b9a' }}></i>
        Qué SÍ hacer como padres (basado en evidencia)
      </h2>

      <p className="mb-4">
        Las investigaciones coinciden en que el entorno familiar influye directamente en la evolución de la fluidez.
        Por ello, se recomienda:
      </p>

      {/* Imagen 3 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/tartamudez-infantil-3.webp"
          alt="Padre escuchando atentamente a su hijo pequeño"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card" style={{ borderLeft: '4px solid #6a1b9a' }}>
            <div className="benefit-icon" style={{ background: '#e1bee7', color: '#4a148c', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-ear-fill"></i>
            </div>
            <h3>Escuchar con atención</h3>
            <p>Escuchar con atención y sin apuro, dándole tiempo.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card" style={{ borderLeft: '4px solid #6a1b9a' }}>
            <div className="benefit-icon" style={{ background: '#e1bee7', color: '#4a148c', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-eye-fill"></i>
            </div>
            <h3>Contacto visual natural</h3>
            <p>Mantener contacto visual natural mientras habla.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card" style={{ borderLeft: '4px solid #6a1b9a' }}>
            <div className="benefit-icon" style={{ background: '#e1bee7', color: '#4a148c', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-chat-dots-fill"></i>
            </div>
            <h3>Responder al contenido</h3>
            <p>Responder a lo que dice, no a cómo lo dice.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
          <div className="benefit-card" style={{ borderLeft: '4px solid #6a1b9a' }}>
            <div className="benefit-icon" style={{ background: '#e1bee7', color: '#4a148c', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-speedometer2"></i>
            </div>
            <h3>Hablar más despacio</h3>
            <p>Hablar más despacio, con pausas (modelar calma).</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="500">
          <div className="benefit-card" style={{ borderLeft: '4px solid #6a1b9a' }}>
            <div className="benefit-icon" style={{ background: '#e1bee7', color: '#4a148c', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-heart-pulse-fill"></i>
            </div>
            <h3>Validar emocionalmente</h3>
            <p><em>"te escucho"</em>, <em>"tómate tu tiempo"</em></p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="600">
          <div className="benefit-card" style={{ borderLeft: '4px solid #6a1b9a' }}>
            <div className="benefit-icon" style={{ background: '#e1bee7', color: '#4a148c', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-house-heart-fill"></i>
            </div>
            <h3>Rutinas tranquilas</h3>
            <p>Mantener rutinas comunicativas tranquilas en casa.</p>
          </div>
        </div>
      </div>

      <div className="tips-box mb-5" data-aos="fade-up" style={{
        background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
        borderLeft: '4px solid #6a1b9a',
        padding: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <i className="bi bi-lightbulb-fill" style={{ fontSize: '2rem', color: '#4a148c', flexShrink: 0 }}></i>
          <div>
            <h4 style={{ color: '#4a148c', marginBottom: '1rem' }}>Clave</h4>
            <p style={{ marginBottom: '0', lineHeight: '1.8' }}>
              Estas acciones reducen la <strong>presión comunicativa</strong>, uno de los factores más importantes
              en la fluidez infantil.
            </p>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      {/* Sección 5: Qué NO hacer */}
      <h2 className="section-title" data-aos="fade-up">
        <i className="bi bi-x-circle-fill me-2" style={{ color: '#d32f2f' }}></i>
        Qué NO hacer (aunque parezca ayudar)
      </h2>

      <p className="mb-4">
        La evidencia muestra que estas conductas pueden <strong>incrementar la disfluencia</strong>:
      </p>

      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card" style={{ borderLeft: '4px solid #d32f2f' }}>
            <div className="benefit-icon" style={{ background: '#ffebee', color: '#c62828', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-mic-mute-fill"></i>
            </div>
            <h3>No dar instrucciones verbales</h3>
            <p>Decir "habla bien", "respira", "tranquilo"</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card" style={{ borderLeft: '4px solid #d32f2f' }}>
            <div className="benefit-icon" style={{ background: '#ffebee', color: '#c62828', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-fast-forward-fill"></i>
            </div>
            <h3>No apresurarlo</h3>
            <p>Apresurarlo o terminarle las frases</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card" style={{ borderLeft: '4px solid #d32f2f' }}>
            <div className="benefit-icon" style={{ background: '#ffebee', color: '#c62828', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-pencil-fill"></i>
            </div>
            <h3>No corregir</h3>
            <p>Corregir su forma de hablar constantemente</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
          <div className="benefit-card" style={{ borderLeft: '4px solid #d32f2f' }}>
            <div className="benefit-icon" style={{ background: '#ffebee', color: '#c62828', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-emoji-frown"></i>
            </div>
            <h3>No mostrar ansiedad</h3>
            <p>Mostrar preocupación excesiva frente al niño</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="500">
          <div className="benefit-card" style={{ borderLeft: '4px solid #d32f2f' }}>
            <div className="benefit-icon" style={{ background: '#ffebee', color: '#c62828', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-people"></i>
            </div>
            <h3>No comparar</h3>
            <p>Compararlo con otros niños o hermanos</p>
          </div>
        </div>
      </div>

      <div className="alert-info mb-5" data-aos="fade-up">
        <i className="bi bi-bullseye me-2"></i>
        El objetivo no es que "hable perfecto", sino que <strong>se sienta seguro al comunicarse.</strong>
      </div>

      <hr className="my-5" />

      {/* Sección 6: Cuándo buscar evaluación */}
      <h2 className="section-title" data-aos="fade-up">
        <i className="bi bi-clipboard2-pulse-fill me-2" style={{ color: '#00838f' }}></i>
        ¿Cuándo buscar una evaluación especializada?
      </h2>

      <p className="mb-4">
        Se recomienda acudir a un <strong>Tecnólogo Médico en Terapia de Lenguaje</strong> cuando:
      </p>

      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card" style={{ borderLeft: '4px solid #00838f' }}>
            <div className="benefit-icon" style={{ background: '#b2ebf2', color: '#006064', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-calendar-range-fill"></i>
            </div>
            <h3>Duración prolongada</h3>
            <p>Las disfluencias duran más de 6 meses</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card" style={{ borderLeft: '4px solid #00838f' }}>
            <div className="benefit-icon" style={{ background: '#b2ebf2', color: '#006064', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-stop-fill"></i>
            </div>
            <h3>Bloqueos y tensión</h3>
            <p>Aparecen bloqueos y tensión física</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card" style={{ borderLeft: '4px solid #00838f' }}>
            <div className="benefit-icon" style={{ background: '#b2ebf2', color: '#006064', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-emoji-dizzy-fill"></i>
            </div>
            <h3>Frustración evidente</h3>
            <p>El niño se frustra o evita hablar</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
          <div className="benefit-card" style={{ borderLeft: '4px solid #00838f' }}>
            <div className="benefit-icon" style={{ background: '#b2ebf2', color: '#006064', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-shield-fill-exclamation"></i>
            </div>
            <h3>Preocupación persistente</h3>
            <p>Los padres sienten preocupación persistente</p>
          </div>
        </div>
      </div>

      <div className="warning-box mb-5" data-aos="fade-up">
        <i className="bi bi-graph-up-arrow"></i>
        <div>
          <p className="mb-2"><strong>Intervención temprana:</strong></p>
          <p className="mb-0">
            La evidencia demuestra que la <strong>intervención temprana mejora significativamente el pronóstico.</strong>
          </p>
        </div>
      </div>

      <hr className="my-5" />

      {/* Conclusión */}
      <div className="tips-box mb-5" data-aos="fade-up" style={{
        background: 'linear-gradient(135deg, #f5f3ff 0%, #e8e0ff 100%)',
        borderLeft: '4px solid #9B59B6',
        padding: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <i className="bi bi-heart-fill" style={{ fontSize: '2.5rem', color: '#6a1b9a', flexShrink: 0 }}></i>
          <div>
            <h3 style={{ color: '#6a1b9a', marginBottom: '1rem' }}>La tartamudez no es culpa del niño ni de los padres</h3>
            <p style={{ marginBottom: '1rem', lineHeight: '1.8' }}>
              En muchos casos, una <strong>orientación temprana y un acompañamiento adecuado</strong> marcan
              una gran diferencia en la seguridad, fluidez y bienestar emocional del niño.
            </p>
            <p style={{ marginBottom: '0', lineHeight: '1.8', fontWeight: '500' }}>
              Si tienes dudas, <strong>consultar a tiempo siempre será una buena decisión.</strong>
            </p>
          </div>
        </div>
      </div>

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
