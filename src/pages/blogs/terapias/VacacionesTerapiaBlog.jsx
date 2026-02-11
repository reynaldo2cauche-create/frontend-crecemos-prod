import React from 'react';

export default function VacacionesTerapiaBlog() {
  return (
    <>
      {/* Introducción principal */}
      <div className="lead mb-5" style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#555' }}>
        Las vacaciones no solo representan descanso y tiempo en familia. Desde la experiencia clínica en
        terapia de lenguaje, también son una de las <strong>mejores oportunidades para evaluar el desarrollo
        del lenguaje e iniciar un proceso terapéutico</strong> de manera más efectiva y tranquila.
      </div>

      <p className="mb-4">
        Muchos padres esperan el inicio del año escolar para consultar, sin saber que enero ofrece condiciones
        ideales para lograr mejores resultados en menos tiempo y con mayor participación familiar.
      </p>

      {/* Imagen hero 1 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/vacaciones-terapia-1.webp"
          alt="Niño feliz en terapia de lenguaje durante vacaciones"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <hr className="my-5" />

      {/* Sección 1: Por qué favorecen las vacaciones */}
      <h2 className="section-title" data-aos="fade-up">
        <i className="bi bi-sun-fill me-2" style={{ color: '#f57c00' }}></i>
        ¿Por qué las vacaciones favorecen la evaluación del lenguaje?
      </h2>

      <p className="mb-4">
        Durante el año escolar, los niños suelen estar expuestos a:
      </p>

      <div className="row gy-4 mb-4">
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card" style={{ borderLeft: '4px solid #d32f2f' }}>
            <div className="benefit-icon" style={{ background: '#ffcdd2', color: '#b71c1c', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-calendar-week-fill"></i>
            </div>
            <h3>Rutinas exigentes</h3>
            <p>Horarios rígidos y actividades programadas que dejan poco margen.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card" style={{ borderLeft: '4px solid #d32f2f' }}>
            <div className="benefit-icon" style={{ background: '#ffcdd2', color: '#b71c1c', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-clock-fill"></i>
            </div>
            <h3>Horarios ajustados</h3>
            <p>Poco tiempo libre entre actividades escolares y extraescolares.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card" style={{ borderLeft: '4px solid #d32f2f' }}>
            <div className="benefit-icon" style={{ background: '#ffcdd2', color: '#b71c1c', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-book-fill"></i>
            </div>
            <h3>Demandas académicas</h3>
            <p>Tareas, evaluaciones y exigencias cognitivas constantes.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
          <div className="benefit-card" style={{ borderLeft: '4px solid #d32f2f' }}>
            <div className="benefit-icon" style={{ background: '#ffcdd2', color: '#b71c1c', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-battery-charging"></i>
            </div>
            <h3>Cansancio acumulado</h3>
            <p>Fatiga física y emocional por el ritmo escolar sostenido.</p>
          </div>
        </div>
      </div>

      <h3 className="mb-4" style={{ color: '#2e7d32', fontSize: '1.4rem' }} data-aos="fade-up">
        <i className="bi bi-arrow-right-circle-fill me-2"></i>
        En cambio, en vacaciones:
      </h3>

      <div className="row gy-4 mb-5">
        <div className="col-md-4" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card" style={{ borderLeft: '4px solid #2e7d32' }}>
            <div className="benefit-icon" style={{ background: '#c8e6c9', color: '#1b5e20', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-emoji-smile-fill"></i>
            </div>
            <h3 style={{ fontSize: '1.1rem' }}>Niño relajado</h3>
            <p>Sin presión académica ni estrés escolar.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card" style={{ borderLeft: '4px solid #2e7d32' }}>
            <div className="benefit-icon" style={{ background: '#c8e6c9', color: '#1b5e20', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-hand-thumbs-up-fill"></i>
            </div>
            <h3 style={{ fontSize: '1.1rem' }}>Mayor disponibilidad</h3>
            <p>Más dispuesto a interactuar y participar.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card" style={{ borderLeft: '4px solid #2e7d32' }}>
            <div className="benefit-icon" style={{ background: '#c8e6c9', color: '#1b5e20', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-chat-heart-fill"></i>
            </div>
            <h3 style={{ fontSize: '1.1rem' }}>Mejor respuesta</h3>
            <p>Responde mejor a evaluaciones y juegos terapéuticos.</p>
          </div>
        </div>
      </div>

      <div className="tips-box mb-5" data-aos="fade-up" style={{
        background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
        borderLeft: '4px solid #2e7d32',
        padding: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <i className="bi bi-clipboard2-check-fill" style={{ fontSize: '2.5rem', color: '#1b5e20', flexShrink: 0 }}></i>
          <div>
            <h4 style={{ color: '#1b5e20', marginBottom: '1rem' }}>Evaluación más precisa</h4>
            <p style={{ marginBottom: '0', lineHeight: '1.8' }}>
              Esto permite que la evaluación del lenguaje sea más precisa, ya que el niño
              <strong> se expresa con mayor naturalidad y sin presión.</strong>
            </p>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      {/* Sección 2: Más tiempo para reforzar */}
      <h2 className="section-title" data-aos="fade-up">
        <i className="bi bi-house-heart-fill me-2" style={{ color: '#6a1b9a' }}></i>
        Más tiempo para reforzar en casa
      </h2>

      <p className="mb-4">
        Uno de los pilares fundamentales del éxito terapéutico es el <strong>acompañamiento familiar</strong>.
      </p>

      {/* Imagen 2 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/vacaciones-terapia-2.webp"
          alt="Familia practicando ejercicios de lenguaje en casa"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <h3 className="mb-4" style={{ color: '#6a1b9a' }} data-aos="fade-up">
        Durante las vacaciones:
      </h3>

      <div className="row gy-4 mb-5">
        <div className="col-md-4" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card" style={{ borderLeft: '4px solid #6a1b9a' }}>
            <div className="benefit-icon" style={{ background: '#e1bee7', color: '#4a148c', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-clock-history"></i>
            </div>
            <h3 style={{ fontSize: '1.1rem' }}>Tiempo disponible</h3>
            <p>Los padres disponen de más tiempo para practicar pautas en casa.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card" style={{ borderLeft: '4px solid #6a1b9a' }}>
            <div className="benefit-icon" style={{ background: '#e1bee7', color: '#4a148c', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-arrow-repeat"></i>
            </div>
            <h3 style={{ fontSize: '1.1rem' }}>Práctica sin apuro</h3>
            <p>Se pueden repetir actividades sin presión de tiempo.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card" style={{ borderLeft: '4px solid #6a1b9a' }}>
            <div className="benefit-icon" style={{ background: '#e1bee7', color: '#4a148c', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-graph-up-arrow"></i>
            </div>
            <h3 style={{ fontSize: '1.1rem' }}>Refuerzo constante</h3>
            <p>El refuerzo es más constante y significativo.</p>
          </div>
        </div>
      </div>

      <div className="warning-box mb-5" data-aos="fade-up">
        <i className="bi bi-mortarboard-fill"></i>
        <div>
          <p className="mb-2"><strong>Evidencia clínica:</strong></p>
          <p className="mb-0">
            La evidencia y la práctica clínica coinciden en que cuando la familia participa activamente,
            <strong> los avances se consolidan con mayor rapidez.</strong>
          </p>
        </div>
      </div>

      <hr className="my-5" />

      {/* Sección 3: Menos carga escolar */}
      <h2 className="section-title" data-aos="fade-up">
        <i className="bi bi-backpack-fill me-2" style={{ color: '#0277bd' }}></i>
        Menos carga escolar, más disposición al aprendizaje
      </h2>

      <p className="mb-4">
        Durante el año escolar, muchos niños llegan a terapia:
      </p>

      <div className="row gy-4 mb-4">
        <div className="col-md-4" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card" style={{ borderLeft: '4px solid #d32f2f' }}>
            <div className="benefit-icon" style={{ background: '#ffebee', color: '#c62828', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-emoji-frown-fill"></i>
            </div>
            <h3 style={{ fontSize: '1.1rem' }}>Cansados</h3>
            <p>Después del colegio, con energía limitada.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card" style={{ borderLeft: '4px solid #d32f2f' }}>
            <div className="benefit-icon" style={{ background: '#ffebee', color: '#c62828', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-battery-half"></i>
            </div>
            <h3 style={{ fontSize: '1.1rem' }}>Poca tolerancia</h3>
            <p>Con poca tolerancia a nuevas demandas.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card" style={{ borderLeft: '4px solid #d32f2f' }}>
            <div className="benefit-icon" style={{ background: '#ffebee', color: '#c62828', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-hand-thumbs-down-fill"></i>
            </div>
            <h3 style={{ fontSize: '1.1rem' }}>Menos motivados</h3>
            <p>Menos motivados para participar activamente.</p>
          </div>
        </div>
      </div>

      <h3 className="mb-4" style={{ color: '#0277bd', fontSize: '1.4rem' }} data-aos="fade-up">
        <i className="bi bi-arrow-right-circle-fill me-2"></i>
        En vacaciones:
      </h3>

      <div className="row gy-4 mb-5">
        <div className="col-md-4" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card" style={{ borderLeft: '4px solid #0277bd' }}>
            <div className="benefit-icon" style={{ background: '#b3e5fc', color: '#01579b', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-battery-full"></i>
            </div>
            <h3 style={{ fontSize: '1.1rem' }}>Sin sobrecarga</h3>
            <p>El niño no está sobrecargado de tareas escolares.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card" style={{ borderLeft: '4px solid #0277bd' }}>
            <div className="benefit-icon" style={{ background: '#b3e5fc', color: '#01579b', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-heart-fill"></i>
            </div>
            <h3 style={{ fontSize: '1.1rem' }}>Mejor disposición</h3>
            <p>Llega con mejor disposición emocional.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card" style={{ borderLeft: '4px solid #0277bd' }}>
            <div className="benefit-icon" style={{ background: '#b3e5fc', color: '#01579b', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-controller"></i>
            </div>
            <h3 style={{ fontSize: '1.1rem' }}>Disfruta el juego</h3>
            <p>Disfruta más del juego terapéutico.</p>
          </div>
        </div>
      </div>

      <div className="tips-box mb-5" data-aos="fade-up" style={{
        background: 'linear-gradient(135deg, #e1f5fe 0%, #b3e5fc 100%)',
        borderLeft: '4px solid #0277bd',
        padding: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <i className="bi bi-star-fill" style={{ fontSize: '2.5rem', color: '#01579b', flexShrink: 0 }}></i>
          <div>
            <h4 style={{ color: '#01579b', marginBottom: '1rem' }}>Mejor aprendizaje</h4>
            <p style={{ marginBottom: '0', lineHeight: '1.8' }}>
              Esto favorece una <strong>mejor conexión terapeuta–niño</strong> y un aprendizaje más fluido.
            </p>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      {/* Sección 4: Mayor predisposición */}
      <h2 className="section-title" data-aos="fade-up">
        <i className="bi bi-stars me-2" style={{ color: '#f57c00' }}></i>
        Mayor predisposición del niño a las sesiones
      </h2>

      <p className="mb-4">
        Cuando el niño no siente que la terapia compite con el colegio:
      </p>

      {/* Imagen 3 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/vacaciones-terapia-3.webp"
          alt="Niño motivado participando en terapia de lenguaje"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <div className="row gy-4 mb-5">
        <div className="col-md-4" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card" style={{ borderLeft: '4px solid #f57c00' }}>
            <div className="benefit-icon" style={{ background: '#ffe0b2', color: '#e65100', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-fire"></i>
            </div>
            <h3 style={{ fontSize: '1.1rem' }}>Mayor interés</h3>
            <p>Se involucra con mayor interés y curiosidad.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card" style={{ borderLeft: '4px solid #f57c00' }}>
            <div className="benefit-icon" style={{ background: '#ffe0b2', color: '#e65100', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-check-circle-fill"></i>
            </div>
            <h3 style={{ fontSize: '1.1rem' }}>Sin resistencia</h3>
            <p>Participa sin resistencia ni oposición.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card" style={{ borderLeft: '4px solid #f57c00' }}>
            <div className="benefit-icon" style={{ background: '#ffe0b2', color: '#e65100', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-balloon-heart-fill"></i>
            </div>
            <h3 style={{ fontSize: '1.1rem' }}>Experiencia positiva</h3>
            <p>Vive la sesión como un espacio de juego y descubrimiento.</p>
          </div>
        </div>
      </div>

      <div className="alert-info mb-5" data-aos="fade-up">
        <i className="bi bi-info-circle-fill me-2"></i>
        Esto es especialmente importante en niños pequeños, donde el lenguaje se desarrolla a través del
        <strong> juego, la interacción y la experiencia positiva.</strong>
      </div>

      <hr className="my-5" />

      {/* Sección 5: Evaluar a tiempo */}
      <h2 className="section-title" data-aos="fade-up">
        <i className="bi bi-calendar-check-fill me-2" style={{ color: '#00838f' }}></i>
        Evaluar a tiempo marca la diferencia
      </h2>

      <p className="mb-4">
        Iniciar la evaluación y terapia en vacaciones permite:
      </p>

      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card" style={{ borderLeft: '4px solid #00838f' }}>
            <div className="benefit-icon" style={{ background: '#b2ebf2', color: '#006064', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-search"></i>
            </div>
            <h3>Detección temprana</h3>
            <p>Detectar dificultades de forma temprana, antes de que impacten el rendimiento escolar.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card" style={{ borderLeft: '4px solid #00838f' }}>
            <div className="benefit-icon" style={{ background: '#b2ebf2', color: '#006064', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-play-circle-fill"></i>
            </div>
            <h3>Inicio sin presión</h3>
            <p>Iniciar intervención sin presión académica ni estrés escolar.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card" style={{ borderLeft: '4px solid #00838f' }}>
            <div className="benefit-icon" style={{ background: '#b2ebf2', color: '#006064', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-trophy-fill"></i>
            </div>
            <h3>Mejores herramientas</h3>
            <p>Llegar al año escolar con mayores herramientas comunicativas ya instaladas.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
          <div className="benefit-card" style={{ borderLeft: '4px solid #00838f' }}>
            <div className="benefit-icon" style={{ background: '#b2ebf2', color: '#006064', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-rocket-takeoff-fill"></i>
            </div>
            <h3>Avances consolidados</h3>
            <p>Aprovechar el tiempo de calidad para consolidar aprendizajes.</p>
          </div>
        </div>
      </div>

      <div className="tips-box mb-5" data-aos="fade-up" style={{
        background: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)',
        borderLeft: '4px solid #00838f',
        padding: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <i className="bi bi-arrow-up-circle-fill" style={{ fontSize: '2.5rem', color: '#006064', flexShrink: 0 }}></i>
          <div>
            <h4 style={{ color: '#006064', marginBottom: '1rem' }}>Tiempo bien aprovechado</h4>
            <p style={{ marginBottom: '0', lineHeight: '1.8' }}>
              En muchos casos, <strong>unos meses bien aprovechados en vacaciones pueden significar
              grandes avances durante el año.</strong>
            </p>
          </div>
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
          <i className="bi bi-check2-all" style={{ fontSize: '2.5rem', color: '#6a1b9a', flexShrink: 0 }}></i>
          <div>
            <h3 style={{ color: '#6a1b9a', marginBottom: '1rem' }}>No es necesario esperar a que empiecen las clases</h3>
            <p style={{ marginBottom: '1rem', lineHeight: '1.8' }}>
              Si tienes dudas sobre el lenguaje de tu hijo, <strong>no es necesario esperar a que empiecen las clases.</strong>
            </p>
            <p style={{ marginBottom: '1rem', lineHeight: '1.8' }}>
              Las vacaciones ofrecen el tiempo, la calma y la disposición que el proceso terapéutico necesita.
            </p>
            <p style={{ marginBottom: '0', lineHeight: '1.8', fontWeight: '500' }}>
              Por eso, <strong>elegir enero como mes de evaluación e inicio de terapia es una decisión acertada
              y preventiva</strong>, pensada en el bienestar y desarrollo de tu niño.
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
