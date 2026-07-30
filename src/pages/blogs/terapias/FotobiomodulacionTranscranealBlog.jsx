import React from 'react';

export default function FotobiomodulacionTranscranealBlog() {
  return (
    <>
      {/* Introducción principal */}
      <div className="lead mb-5" style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#555' }}>
        Durante los últimos años, la investigación en neurorehabilitación ha avanzado de manera sorprendente.
        Una de las tecnologías que más interés ha despertado es la <strong>fotobiomodulación transcraneal</strong>,
        una técnica no invasiva que utiliza luz láser o LED de baja intensidad para estimular determinadas áreas del cerebro.
      </div>

      <p className="mb-4">
        Aunque no reemplaza las terapias convencionales, diversos estudios científicos sugieren que podría convertirse
        en un <strong>tratamiento complementario importante</strong> para algunos niños con Trastorno del Espectro
        Autista (TEA).
      </p>

      {/* Imagen hero 1 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/fotobiomodulacion-1.webp"
          alt="Aplicación de fotobiomodulación transcraneal en un niño"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <hr className="my-5" />

      {/* Sección 1: Qué es */}
      <h2 className="section-title" data-aos="fade-up">
        <i className="bi bi-lightbulb-fill me-2" style={{ color: '#1976d2' }}></i>
        ¿Qué es la fotobiomodulación transcraneal?
      </h2>

      <p className="mb-4">
        Consiste en aplicar luz de determinadas longitudes de onda sobre el cuero cabelludo. Parte de esa energía
        luminosa atraviesa los tejidos superficiales y alcanza la corteza cerebral, donde interactúa con las
        <strong> mitocondrias de las neuronas</strong>.
      </p>

      <div className="tips-box mb-5" data-aos="fade-up" style={{
        background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
        borderLeft: '4px solid #1976d2',
        padding: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <i className="bi bi-info-circle-fill" style={{ fontSize: '2rem', color: '#0d47a1', flexShrink: 0 }}></i>
          <div>
            <h4 style={{ color: '#0d47a1', marginBottom: '1rem' }}>Idea clave</h4>
            <p style={{ marginBottom: '0', lineHeight: '1.8' }}>
              El objetivo <strong>no es "estimular" el cerebro de manera eléctrica</strong>, sino favorecer el
              metabolismo celular y crear condiciones que faciliten el funcionamiento neuronal.
            </p>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      {/* Sección 2: Qué ocurre en el cerebro */}
      <h2 className="section-title" data-aos="fade-up">
        <i className="bi bi-diagram-3-fill me-2" style={{ color: '#00838f' }}></i>
        ¿Qué ocurre en el cerebro?
      </h2>

      <p className="mb-4">
        La principal molécula que absorbe la energía del láser es una enzima llamada <strong>citocromo c oxidasa</strong>,
        ubicada dentro de las mitocondrias. Cuando esta molécula absorbe la luz, se desencadenan varios efectos:
      </p>

      {/* Imagen 2 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/fotobiomodulacion-2.webp"
          alt="Representación de mitocondrias y actividad neuronal"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <div className="row gy-4 mb-5">
        <div className="col-md-4" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card" style={{ borderLeft: '4px solid #00838f' }}>
            <div className="benefit-icon" style={{ background: '#b2ebf2', color: '#006064', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-battery-charging"></i>
            </div>
            <h3 style={{ fontSize: '1.1rem' }}>Más energía celular</h3>
            <p>Aumenta la producción de ATP, la principal fuente de energía de la célula.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card" style={{ borderLeft: '4px solid #00838f' }}>
            <div className="benefit-icon" style={{ background: '#b2ebf2', color: '#006064', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-lungs-fill"></i>
            </div>
            <h3 style={{ fontSize: '1.1rem' }}>Mejor uso del oxígeno</h3>
            <p>Mejora el consumo de oxígeno y favorece el flujo sanguíneo cerebral.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card" style={{ borderLeft: '4px solid #00838f' }}>
            <div className="benefit-icon" style={{ background: '#b2ebf2', color: '#006064', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-droplet-half"></i>
            </div>
            <h3 style={{ fontSize: '1.1rem' }}>Vasodilatación</h3>
            <p>Incrementa la liberación de óxido nítrico, promoviendo la vasodilatación.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="fade-up" data-aos-delay="400">
          <div className="benefit-card" style={{ borderLeft: '4px solid #00838f' }}>
            <div className="benefit-icon" style={{ background: '#b2ebf2', color: '#006064', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-shield-check"></i>
            </div>
            <h3 style={{ fontSize: '1.1rem' }}>Menos estrés oxidativo</h3>
            <p>Reduce el estrés oxidativo y disminuye ciertos procesos inflamatorios.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="fade-up" data-aos-delay="500">
          <div className="benefit-card" style={{ borderLeft: '4px solid #00838f' }}>
            <div className="benefit-icon" style={{ background: '#b2ebf2', color: '#006064', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-arrow-repeat"></i>
            </div>
            <h3 style={{ fontSize: '1.1rem' }}>Neuroplasticidad</h3>
            <p>Favorece la neuroplasticidad, base del aprendizaje y la adaptación cerebral.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="fade-up" data-aos-delay="600">
          <div className="benefit-card" style={{ borderLeft: '4px solid #00838f' }}>
            <div className="benefit-icon" style={{ background: '#b2ebf2', color: '#006064', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-diagram-2-fill"></i>
            </div>
            <h3 style={{ fontSize: '1.1rem' }}>Mejores redes neuronales</h3>
            <p>Puede mejorar redes ligadas a la comunicación, la atención y otras funciones cognitivas.</p>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      {/* Sección 3: Beneficios en TEA */}
      <h2 className="section-title" data-aos="fade-up">
        <i className="bi bi-stars me-2" style={{ color: '#2e7d32' }}></i>
        ¿Qué beneficios se han observado en niños con TEA?
      </h2>

      <p className="mb-4">
        Los estudios publicados hasta la fecha muestran resultados alentadores, aunque
        <strong> no todos los niños responden de la misma manera</strong>. Entre las mejoras reportadas se encuentran:
      </p>

      <div className="row gy-4 mb-5">
        <div className="col-md-4" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card" style={{ borderLeft: '4px solid #2e7d32' }}>
            <div className="benefit-icon" style={{ background: '#c8e6c9', color: '#1b5e20', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-eye-fill"></i>
            </div>
            <h3 style={{ fontSize: '1.1rem' }}>Mayor contacto visual</h3>
            <p>Se observa mayor contacto visual e incremento de la atención conjunta.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card" style={{ borderLeft: '4px solid #2e7d32' }}>
            <div className="benefit-icon" style={{ background: '#c8e6c9', color: '#1b5e20', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-emoji-smile-fill"></i>
            </div>
            <h3 style={{ fontSize: '1.1rem' }}>Mejor regulación emocional</h3>
            <p>Mejor regulación emocional y reducción de la irritabilidad.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card" style={{ borderLeft: '4px solid #2e7d32' }}>
            <div className="benefit-icon" style={{ background: '#c8e6c9', color: '#1b5e20', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-moon-stars-fill"></i>
            </div>
            <h3 style={{ fontSize: '1.1rem' }}>Mejor calidad del sueño</h3>
            <p>Reportes de mejor descanso nocturno en algunos niños.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="fade-up" data-aos-delay="400">
          <div className="benefit-card" style={{ borderLeft: '4px solid #2e7d32' }}>
            <div className="benefit-icon" style={{ background: '#c8e6c9', color: '#1b5e20', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-arrow-repeat"></i>
            </div>
            <h3 style={{ fontSize: '1.1rem' }}>Menos conductas repetitivas</h3>
            <p>Disminución de conductas repetitivas en algunos casos.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="fade-up" data-aos-delay="500">
          <div className="benefit-card" style={{ borderLeft: '4px solid #2e7d32' }}>
            <div className="benefit-icon" style={{ background: '#c8e6c9', color: '#1b5e20', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-people-fill"></i>
            </div>
            <h3 style={{ fontSize: '1.1rem' }}>Mayor interacción social</h3>
            <p>Mayor interacción social y mejor disposición para participar en terapia.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="fade-up" data-aos-delay="600">
          <div className="benefit-card" style={{ borderLeft: '4px solid #2e7d32' }}>
            <div className="benefit-icon" style={{ background: '#c8e6c9', color: '#1b5e20', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-chat-heart-fill"></i>
            </div>
            <h3 style={{ fontSize: '1.1rem' }}>Comunicación espontánea</h3>
            <p>Incremento de la comunicación espontánea del niño.</p>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      {/* Sección 4: Ventajas */}
      <h2 className="section-title" data-aos="fade-up">
        <i className="bi bi-check-circle-fill me-2" style={{ color: '#6a1b9a' }}></i>
        Ventajas de la fotobiomodulación en niños con TEA
      </h2>

      {/* Imagen 3 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/fotobiomodulacion-3.webp"
          alt="Niño tranquilo durante una sesión de terapia con luz"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card" style={{ borderLeft: '4px solid #6a1b9a' }}>
            <div className="benefit-icon" style={{ background: '#e1bee7', color: '#4a148c', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-hand-thumbs-up-fill"></i>
            </div>
            <h3>Técnica no invasiva</h3>
            <p>No requiere agujas, incisiones, anestesia ni estimulación eléctrica directa.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card" style={{ borderLeft: '4px solid #6a1b9a' }}>
            <div className="benefit-icon" style={{ background: '#e1bee7', color: '#4a148c', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-volume-mute-fill"></i>
            </div>
            <h3>Es silenciosa</h3>
            <p>No genera sonidos intensos ni pulsos acústicos, ideal ante hipersensibilidad auditiva.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card" style={{ borderLeft: '4px solid #6a1b9a' }}>
            <div className="benefit-icon" style={{ background: '#e1bee7', color: '#4a148c', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-thermometer-half"></i>
            </div>
            <h3>Calentamiento mínimo</h3>
            <p>Trabaja por efectos fotoquímicos y metabólicos, no por calor. El profesional controla potencia y temperatura.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
          <div className="benefit-card" style={{ borderLeft: '4px solid #6a1b9a' }}>
            <div className="benefit-icon" style={{ background: '#e1bee7', color: '#4a148c', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-chat-square-dots-fill"></i>
            </div>
            <h3>No exige respuesta verbal</h3>
            <p>Puede aplicarse aunque el niño tenga lenguaje limitado, sea no verbal o le cueste seguir instrucciones complejas.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="500">
          <div className="benefit-card" style={{ borderLeft: '4px solid #6a1b9a' }}>
            <div className="benefit-icon" style={{ background: '#e1bee7', color: '#4a148c', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-emoji-neutral-fill"></i>
            </div>
            <h3>Poca participación activa</h3>
            <p>El niño no necesita resolver actividades cognitivas, solo tolerar el contacto del dispositivo sobre la cabeza.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="600">
          <div className="benefit-card" style={{ borderLeft: '4px solid #6a1b9a' }}>
            <div className="benefit-icon" style={{ background: '#e1bee7', color: '#4a148c', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-book-half"></i>
            </div>
            <h3>Compatible con actividades tranquilas</h3>
            <p>Según el equipo y protocolo, el niño puede permanecer sentado, mirar un cuento o hacer una actividad calmada.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="700">
          <div className="benefit-card" style={{ borderLeft: '4px solid #6a1b9a' }}>
            <div className="benefit-icon" style={{ background: '#e1bee7', color: '#4a148c', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-shield-fill-check"></i>
            </div>
            <h3>Perfil de tolerabilidad favorable</h3>
            <p>Los pequeños estudios en TEA no han informado eventos adversos graves ni interrupciones sistemáticas.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="800">
          <div className="benefit-card" style={{ borderLeft: '4px solid #6a1b9a' }}>
            <div className="benefit-icon" style={{ background: '#e1bee7', color: '#4a148c', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-capsule"></i>
            </div>
            <h3>No es farmacológica</h3>
            <p>No implica administrar medicamentos ni sus efectos sistémicos. Aun así, requiere precauciones.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="900">
          <div className="benefit-card" style={{ borderLeft: '4px solid #6a1b9a' }}>
            <div className="benefit-icon" style={{ background: '#e1bee7', color: '#4a148c', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-activity"></i>
            </div>
            <h3>Podría regular la actividad cerebral</h3>
            <p>Algunos estudios observaron cambios electroencefalográficos, aún sin confirmar beneficios clínicos duraderos.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="1000">
          <div className="benefit-card" style={{ borderLeft: '4px solid #6a1b9a' }}>
            <div className="benefit-icon" style={{ background: '#e1bee7', color: '#4a148c', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-people"></i>
            </div>
            <h3>Podría facilitar otras terapias</h3>
            <p>Al mejorar regulación, sueño o atención, el niño podría estar más disponible para terapia de lenguaje u ocupacional.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="1100">
          <div className="benefit-card" style={{ borderLeft: '4px solid #6a1b9a' }}>
            <div className="benefit-icon" style={{ background: '#e1bee7', color: '#4a148c', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-clipboard-data-fill"></i>
            </div>
            <h3>Sesiones estructuradas y repetibles</h3>
            <p>Longitud de onda, potencia, energía, tiempo y zonas pueden registrarse con protocolos claros y equipos calibrados.</p>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      {/* Sección 5: Quién debe aplicarla */}
      <h2 className="section-title" data-aos="fade-up">
        <i className="bi bi-person-badge-fill me-2" style={{ color: '#1976d2' }}></i>
        ¿Quién debe aplicarla?
      </h2>

      <p className="mb-4">
        La fotobiomodulación transcraneal debe ser realizada <strong>únicamente por profesionales de la salud
        capacitados</strong> en:
      </p>

      <ul className="feature-list mb-4">
        <li><i className="bi bi-check-circle-fill"></i> Física del láser</li>
        <li><i className="bi bi-check-circle-fill"></i> Dosimetría</li>
        <li><i className="bi bi-check-circle-fill"></i> Neuroanatomía</li>
        <li><i className="bi bi-check-circle-fill"></i> Neurofisiología</li>
      </ul>

      <div className="alert-info mb-5" data-aos="fade-up">
        <i className="bi bi-check-circle-fill me-2"></i>
        El profesional debe conocer las <strong>indicaciones y contraindicaciones</strong> del equipo utilizado y
        seguir protocolos basados en la evidencia científica.
      </div>

      <hr className="my-5" />

      {/* Sección 6: Contraindicaciones */}
      <h2 className="section-title" data-aos="fade-up">
        <i className="bi bi-exclamation-triangle-fill me-2" style={{ color: '#c62828' }}></i>
        ¿Existen contraindicaciones?
      </h2>

      <p className="mb-4">
        Aunque la tPBM se considera segura cuando se aplica correctamente, existen situaciones en las que
        <strong> debe evitarse o utilizarse con especial precaución</strong>:
      </p>

      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card" style={{ borderLeft: '4px solid #c62828' }}>
            <div className="benefit-icon" style={{ background: '#ffcdd2', color: '#b71c1c', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-bandaid-fill"></i>
            </div>
            <h3>Lesiones o infecciones</h3>
            <p>Lesiones o infecciones activas en el cuero cabelludo en la zona de aplicación.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card" style={{ borderLeft: '4px solid #c62828' }}>
            <div className="benefit-icon" style={{ background: '#ffcdd2', color: '#b71c1c', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-x-octagon-fill"></i>
            </div>
            <h3>Tumores en la zona</h3>
            <p>Sospecha o presencia de tumores en el área a tratar.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card" style={{ borderLeft: '4px solid #c62828' }}>
            <div className="benefit-icon" style={{ background: '#ffcdd2', color: '#b71c1c', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-lightning-fill"></i>
            </div>
            <h3>Epilepsia no controlada</h3>
            <p>Requiere valoración médica individual antes de considerar la técnica.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
          <div className="benefit-card" style={{ borderLeft: '4px solid #c62828' }}>
            <div className="benefit-icon" style={{ background: '#ffcdd2', color: '#b71c1c', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-brightness-high-fill"></i>
            </div>
            <h3>Hipersensibilidad a la luz</h3>
            <p>Hipersensibilidad extrema a la luz o uso de medicamentos fotosensibilizantes.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="500">
          <div className="benefit-card" style={{ borderLeft: '4px solid #c62828' }}>
            <div className="benefit-icon" style={{ background: '#ffcdd2', color: '#b71c1c', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-clipboard2-x-fill"></i>
            </div>
            <h3>Otras situaciones médicas</h3>
            <p>Condiciones que el profesional tratante considere incompatibles con la aplicación.</p>
          </div>
        </div>
      </div>

      <div className="warning-box mb-5" data-aos="fade-up">
        <i className="bi bi-clipboard2-pulse-fill"></i>
        <div>
          <p className="mb-2"><strong>Antes de iniciar el tratamiento:</strong></p>
          <p className="mb-0">
            Siempre es recomendable realizar una <strong>evaluación clínica completa</strong>.
          </p>
        </div>
      </div>

      <hr className="my-5" />

      {/* Sección 7: Evidencia */}
      <h2 className="section-title" data-aos="fade-up">
        <i className="bi bi-journal-medical me-2" style={{ color: '#00838f' }}></i>
        ¿Qué dice la evidencia científica?
      </h2>

      <p className="mb-4">
        Durante la última década se han publicado <strong>estudios piloto, series de casos y ensayos clínicos</strong>
        que muestran resultados prometedores en niños y adolescentes con TEA.
      </p>

      <div className="tips-box mb-5" data-aos="fade-up" style={{
        background: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)',
        borderLeft: '4px solid #00838f',
        padding: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <i className="bi bi-search" style={{ fontSize: '2rem', color: '#006064', flexShrink: 0 }}></i>
          <div>
            <h4 style={{ color: '#006064', marginBottom: '1rem' }}>Una intervención en desarrollo</h4>
            <p style={{ marginBottom: '0', lineHeight: '1.8' }}>
              La comunidad científica considera que la tPBM es una <strong>intervención prometedora</strong>, pero que
              todavía continúa en desarrollo. La revisión disponible incluye pocos estudios, con protocolos y diseños
              diferentes, por lo que estos resultados aún deben confirmarse.
            </p>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      {/* Conclusión: mensaje para las familias */}
      <div className="tips-box mb-5" data-aos="fade-up" style={{
        background: 'linear-gradient(135deg, #f5f3ff 0%, #e8e0ff 100%)',
        borderLeft: '4px solid #9B59B6',
        padding: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <i className="bi bi-heart-fill" style={{ fontSize: '2.5rem', color: '#6a1b9a', flexShrink: 0 }}></i>
          <div>
            <h3 style={{ color: '#6a1b9a', marginBottom: '1rem' }}>Un mensaje para las familias</h3>
            <p style={{ marginBottom: '1rem', lineHeight: '1.8' }}>
              La fotobiomodulación transcraneal representa uno de los avances más interesantes en neurorehabilitación.
              <strong> No es una cura para el autismo ni reemplaza las terapias convencionales</strong>, pero la
              evidencia disponible sugiere que, en algunos niños, puede potenciar la atención, la regulación emocional
              y la participación en los procesos terapéuticos.
            </p>
            <p style={{ marginBottom: '0', lineHeight: '1.8', fontWeight: '500' }}>
              La ciencia avanza, pero el mejor tratamiento sigue siendo aquel que combina
              <strong> innovación, evidencia y un equipo de profesionales capacitados</strong> y comprometidos con el
              desarrollo de cada niño.
            </p>
          </div>
        </div>
      </div>

      {/* Bibliografía */}
      <h2 className="section-title" data-aos="fade-up">
        <i className="bi bi-book-fill me-2" style={{ color: '#455a64' }}></i>
        Bibliografía recomendada
      </h2>

      <ul className="feature-list mb-5">
        <li><i className="bi bi-journal-text"></i> Hamblin MR. <em>Photobiomodulation for traumatic brain injury and neurodegenerative diseases</em>. Progress in Brain Research.</li>
        <li><i className="bi bi-journal-text"></i> Salehpour F, Cassano P, Henderson TA, Hamblin MR. <em>Near-Infrared Photobiomodulation in Autism Spectrum Disorder</em>. Frontiers in Neurology.</li>
        <li><i className="bi bi-journal-text"></i> Caldieraro MA, Cassano P. <em>Transcranial Photobiomodulation for Psychiatric Disorders</em>. CNS Spectrums.</li>
        <li><i className="bi bi-journal-text"></i> World Association for Laser Therapy (WALT). <em>Recomendaciones internacionales sobre dosimetría en fotobiomodulación</em>.</li>
        <li><i className="bi bi-journal-text"></i> Hamblin MR. <em>Mechanisms and applications of photobiomodulation</em>. AIMS Biophysics.</li>
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
