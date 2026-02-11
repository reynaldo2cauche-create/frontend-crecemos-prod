import React from 'react';

export default function TerapiaLenguajeBlog() {
  return (
    <>
      {/* Introducción principal */}
      <div className="lead mb-5" style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#555' }}>
        Como terapeuta de lenguaje infantil con más de 10 años de experiencia clínica, una de las
        preguntas más frecuentes que recibo de los padres es: <strong>"¿Será normal que mi hijo aún no hable?"</strong>
      </div>

      <p className="mb-4">
        Esta duda es totalmente comprensible. Cada niño tiene su propio ritmo de desarrollo, pero
        existen señales claras que nos indican cuándo es importante evaluar el lenguaje a tiempo.
        Detectarlas de forma temprana puede marcar una gran diferencia en el desarrollo comunicativo,
        emocional y social de tu hijo.
      </p>

      {/* Imagen hero 1 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/terapia-lenguaje-1.webp"
          alt="Niño en terapia de lenguaje con terapeuta"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <hr className="my-5" />

      {/* Sección 1: ¿Qué es el desarrollo del lenguaje? */}
      <h2 className="section-title" data-aos="fade-up">
        <i className="bi bi-chat-dots me-2" style={{ color: '#9B59B6' }}></i>
        ¿Qué es el desarrollo del lenguaje y por qué es tan importante?
      </h2>

      <p className="mb-4">
        El lenguaje no es solo "hablar". Incluye un conjunto complejo de habilidades comunicativas
        que se desarrollan desde los primeros meses de vida:
      </p>

      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card">
            <div className="benefit-icon" style={{ background: '#e8e0ff', color: '#4a148c', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-ear-fill"></i>
            </div>
            <h3>Comprender</h3>
            <p>Entender lo que se le dice, seguir instrucciones y reconocer palabras en contexto.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card">
            <div className="benefit-icon" style={{ background: '#e8e0ff', color: '#4a148c', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-megaphone-fill"></i>
            </div>
            <h3>Expresarse</h3>
            <p>Comunicarse con gestos, sonidos, palabras o frases para manifestar necesidades y emociones.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card">
            <div className="benefit-icon" style={{ background: '#e8e0ff', color: '#4a148c', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-people-fill"></i>
            </div>
            <h3>Interactuar</h3>
            <p>Establecer contacto visual, mantener turnos conversacionales y compartir experiencias.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
          <div className="benefit-card">
            <div className="benefit-icon" style={{ background: '#e8e0ff', color: '#4a148c', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-hand-index-fill"></i>
            </div>
            <h3>Comunicarse funcionalmente</h3>
            <p>Pedir, señalar, imitar, responder y usar el lenguaje con un propósito específico.</p>
          </div>
        </div>
      </div>

      <div className="alert-info mb-5" data-aos="fade-up">
        <i className="bi bi-lightbulb-fill me-2"></i>
        Las investigaciones actuales en neurodesarrollo coinciden en que los primeros años de vida
        son una <strong>etapa crítica</strong>, ya que el cerebro infantil tiene una alta capacidad
        de aprendizaje y adaptación. Por eso, intervenir a tiempo es clave.
      </div>

      <hr className="my-5" />

      {/* Sección 2: Señales de alerta */}
      <h2 className="section-title" data-aos="fade-up">
        <i className="bi bi-exclamation-triangle-fill me-2" style={{ color: '#E74C3C' }}></i>
        Señales tempranas de alerta según la edad
      </h2>

      <p className="mb-5">
        A continuación, te comparto signos basados en evidencia clínica que deben llamar tu atención:
      </p>

      {/* Imagen placeholder 2 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/terapia-lenguaje-2.webp"
          alt="Desarrollo del lenguaje por edades"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      {/* 12-18 meses */}
      <div className="recipe-section mb-5" data-aos="fade-up">
        <div className="recipe-number" style={{ background: '#9B59B6' }}>
          <i className="bi bi-person-fill"></i>
        </div>
        <h3 className="recipe-title" style={{ color: '#9B59B6' }}>Entre 12 y 18 meses</h3>
        <div className="recipe-content">
          <ul className="feature-list">
            <li><i className="bi bi-x-circle-fill" style={{ color: '#E74C3C' }}></i> No responde a su nombre</li>
            <li><i className="bi bi-x-circle-fill" style={{ color: '#E74C3C' }}></i> No señala objetos para pedir o mostrar</li>
            <li><i className="bi bi-x-circle-fill" style={{ color: '#E74C3C' }}></i> No imita sonidos o gestos</li>
            <li><i className="bi bi-x-circle-fill" style={{ color: '#E74C3C' }}></i> No dice palabras simples como "mamá" o "papá"</li>
          </ul>
        </div>
      </div>

      {/* 2-3 años */}
      <div className="recipe-section mb-5" data-aos="fade-up" data-aos-delay="100">
        <div className="recipe-number" style={{ background: '#9B59B6' }}>
          <i className="bi bi-person-fill"></i>
        </div>
        <h3 className="recipe-title" style={{ color: '#9B59B6' }}>Entre 2 y 3 años</h3>
        <div className="recipe-content">
          <ul className="feature-list">
            <li><i className="bi bi-x-circle-fill" style={{ color: '#E74C3C' }}></i> Dice muy pocas palabras o ninguna</li>
            <li><i className="bi bi-x-circle-fill" style={{ color: '#E74C3C' }}></i> No forma frases simples</li>
            <li><i className="bi bi-x-circle-fill" style={{ color: '#E74C3C' }}></i> Le cuesta entender instrucciones sencillas</li>
            <li><i className="bi bi-x-circle-fill" style={{ color: '#E74C3C' }}></i> Se frustra con facilidad al intentar comunicarse</li>
          </ul>
        </div>
      </div>

      {/* 4+ años */}
      <div className="recipe-section mb-5" data-aos="fade-up" data-aos-delay="200">
        <div className="recipe-number" style={{ background: '#9B59B6' }}>
          <i className="bi bi-person-fill"></i>
        </div>
        <h3 className="recipe-title" style={{ color: '#9B59B6' }}>A partir de los 4 años</h3>
        <div className="recipe-content">
          <ul className="feature-list">
            <li><i className="bi bi-x-circle-fill" style={{ color: '#E74C3C' }}></i> Su habla no se entiende con claridad</li>
            <li><i className="bi bi-x-circle-fill" style={{ color: '#E74C3C' }}></i> Presenta errores constantes en sonidos</li>
            <li><i className="bi bi-x-circle-fill" style={{ color: '#E74C3C' }}></i> Tiene dificultad para expresar ideas</li>
            <li><i className="bi bi-x-circle-fill" style={{ color: '#E74C3C' }}></i> Evita hablar o interactuar con otros niños</li>
          </ul>
        </div>
      </div>

      <div className="warning-box mb-5" data-aos="fade-up">
        <i className="bi bi-shield-exclamation"></i>
        <div>
          <p className="mb-2"><strong>Importante:</strong></p>
          <p className="mb-0">
            No es necesario que estén presentes todas las señales. <strong>Una sola dificultad persistente
            ya es motivo de evaluación.</strong>
          </p>
        </div>
      </div>

      <hr className="my-5" />

      {/* Sección 3: Factores que afectan el lenguaje */}
      <h2 className="section-title" data-aos="fade-up">
        <i className="bi bi-graph-down me-2" style={{ color: '#F39C12' }}></i>
        Factores que pueden afectar el lenguaje
      </h2>

      <p className="mb-4">
        En la práctica clínica, observamos que el retraso del lenguaje puede estar asociado a
        distintos factores:
      </p>

      {/* Imagen placeholder 3 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/terapia-lenguaje-3.webp"
          alt="Factores que afectan el desarrollo del lenguaje"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card" style={{ borderLeft: '4px solid #E74C3C' }}>
            <div className="benefit-icon" style={{ background: '#ffd4d4', color: '#c62828', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-volume-mute-fill"></i>
            </div>
            <h3>Falta de estimulación adecuada</h3>
            <p>Poco intercambio verbal, escasa interacción cara a cara o ausencia de juegos comunicativos.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card" style={{ borderLeft: '4px solid #E74C3C' }}>
            <div className="benefit-icon" style={{ background: '#ffd4d4', color: '#c62828', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-tv-fill"></i>
            </div>
            <h3>Exposición excesiva a pantallas</h3>
            <p>Estudios recientes confirman que el uso prolongado de pantallas en edades tempranas
            reduce las oportunidades de interacción verbal real, fundamentales para aprender a hablar.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card" style={{ borderLeft: '4px solid #E74C3C' }}>
            <div className="benefit-icon" style={{ background: '#ffd4d4', color: '#c62828', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-puzzle-fill"></i>
            </div>
            <h3>Trastornos del neurodesarrollo</h3>
            <p>Como el Trastorno del Espectro Autista (TEA), TDAH u otros, donde el lenguaje puede
            verse comprometido como parte del desarrollo global.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
          <div className="benefit-card" style={{ borderLeft: '4px solid #E74C3C' }}>
            <div className="benefit-icon" style={{ background: '#ffd4d4', color: '#c62828', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-heart-pulse-fill"></i>
            </div>
            <h3>Alteraciones físicas</h3>
            <p>Bajo tono muscular orofacial, incoordinación práxica, alteraciones en funciones orales
            (respiración oral, deglución, masticación).</p>
          </div>
        </div>
      </div>

      <div className="tips-box mb-5" data-aos="fade-up">
        <i className="bi bi-arrow-right-circle-fill"></i>
        <div>
          <p className="mb-0">
            Por esta razón, <strong>no es recomendable "esperar a ver qué pasa"</strong> sin una
            evaluación profesional.
          </p>
        </div>
      </div>

      <hr className="my-5" />

      {/* Sección 4: Siguiente paso */}
      <h2 className="section-title" data-aos="fade-up">
        <i className="bi bi-signpost-2-fill me-2" style={{ color: '#50C878' }}></i>
        ¿Cuál es el siguiente paso correcto?
      </h2>

      <p className="mb-4">
        El paso más importante, cuando existen dudas sobre el desarrollo del lenguaje de un niño,
        es buscar una <strong>evaluación especializada con un Tecnólogo Médico en Terapia de Lenguaje</strong>.
      </p>

      <p className="mb-5">
        Este profesional es el especialista clínico capacitado para evaluar, diagnosticar
        funcionalmente e intervenir las dificultades del lenguaje, habla y comunicación infantil.
      </p>

      {/* Imagen placeholder 4 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/terapia-lenguaje-4.webp"
          alt="Evaluación profesional del lenguaje infantil"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <h3 className="mb-4" style={{ color: '#9B59B6' }}>
        <i className="bi bi-person-badge-fill me-2"></i>
        ¿Por qué es fundamental acudir a un Tecnólogo Médico en Terapia de Lenguaje?
      </h3>

      <p className="mb-4">Porque su formación universitaria y clínica le permite:</p>

      {/* Evaluación integral */}
      <div className="recipe-section mb-5" data-aos="fade-up">
        <div className="recipe-number" style={{ background: '#50C878' }}>1</div>
        <h3 className="recipe-title" style={{ color: '#50C878' }}>
          <i className="bi bi-search me-2"></i>
          Evaluar de manera integral el lenguaje infantil
        </h3>
        <div className="recipe-content">
          <p className="mb-3">
            El Tecnólogo Médico en Terapia de Lenguaje no solo observa si el niño "habla o no habla",
            sino que evalúa de forma profesional:
          </p>
          <ul className="feature-list">
            <li><i className="bi bi-check-circle-fill"></i> <strong>Lenguaje comprensivo</strong> (qué tanto entiende el niño)</li>
            <li><i className="bi bi-check-circle-fill"></i> <strong>Lenguaje expresivo</strong> (cómo se comunica: gestos, sonidos, palabras)</li>
            <li><i className="bi bi-check-circle-fill"></i> <strong>Pronunciación y articulación</strong> de los sonidos</li>
            <li><i className="bi bi-check-circle-fill"></i> <strong>Interacción social</strong> y comunicación funcional</li>
            <li><i className="bi bi-check-circle-fill"></i> <strong>Habilidades prelingüísticas</strong> (atención conjunta, imitación, intención comunicativa)</li>
            <li><i className="bi bi-check-circle-fill"></i> <strong>Motricidad orofacial</strong></li>
          </ul>
          <p className="text-muted mt-3">
            <i className="bi bi-clipboard-data me-2"></i>
            Estas evaluaciones se realizan mediante instrumentos estandarizados y observación clínica
            especializada, basados en evidencia científica actual.
          </p>
        </div>
      </div>

      {/* Identificar la causa */}
      <div className="recipe-section mb-5" data-aos="fade-up" data-aos-delay="100">
        <div className="recipe-number" style={{ background: '#50C878' }}>2</div>
        <h3 className="recipe-title" style={{ color: '#50C878' }}>
          <i className="bi bi-stethoscope me-2"></i>
          Identificar la causa del retraso del lenguaje
        </h3>
        <div className="recipe-content">
          <p className="mb-3">
            Una de las funciones más importantes del Tecnólogo Médico es diferenciar el origen de
            la dificultad, determinando si el retraso del lenguaje se debe a:
          </p>
          <div className="row g-3">
            <div className="col-md-6">
              <div className="idea-card" style={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                <i className="bi bi-volume-mute-fill me-2" style={{ color: '#9B59B6' }}></i>
                Falta de estimulación adecuada
              </div>
            </div>
            <div className="col-md-6">
              <div className="idea-card" style={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                <i className="bi bi-tv-fill me-2" style={{ color: '#9B59B6' }}></i>
                Exposición excesiva a pantallas
              </div>
            </div>
            <div className="col-md-6">
              <div className="idea-card" style={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                <i className="bi bi-ear-fill me-2" style={{ color: '#9B59B6' }}></i>
                Dificultades auditivas o sensoriales
              </div>
            </div>
            <div className="col-md-6">
              <div className="idea-card" style={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                <i className="bi bi-diagram-3-fill me-2" style={{ color: '#9B59B6' }}></i>
                Alteraciones en el desarrollo neurológico
              </div>
            </div>
            <div className="col-md-6">
              <div className="idea-card" style={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                <i className="bi bi-puzzle-fill me-2" style={{ color: '#9B59B6' }}></i>
                Posible asociación a un trastorno del neurodesarrollo
              </div>
            </div>
            <div className="col-md-6">
              <div className="idea-card" style={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                <i className="bi bi-heart-pulse-fill me-2" style={{ color: '#9B59B6' }}></i>
                Bajo tono muscular orofacial
              </div>
            </div>
            <div className="col-md-6">
              <div className="idea-card" style={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                <i className="bi bi-hand-index-fill me-2" style={{ color: '#9B59B6' }}></i>
                Incoordinación práxica
              </div>
            </div>
            <div className="col-md-6">
              <div className="idea-card" style={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                <i className="bi bi-emoji-smile-fill me-2" style={{ color: '#9B59B6' }}></i>
                Alteraciones en funciones orales
              </div>
            </div>
          </div>
          <div className="alert-info mt-4">
            <i className="bi bi-lightbulb-fill me-2"></i>
            Esta diferenciación es clave, ya que <strong>no todos los retrasos del lenguaje se
            abordan de la misma manera</strong>.
          </div>
        </div>
      </div>

      {/* Trabajo interdisciplinario */}
      <div className="recipe-section mb-5" data-aos="fade-up" data-aos-delay="200">
        <div className="recipe-number" style={{ background: '#50C878' }}>3</div>
        <h3 className="recipe-title" style={{ color: '#50C878' }}>
          <i className="bi bi-people-fill me-2"></i>
          Coordinar con otros profesionales de la salud
        </h3>
        <div className="recipe-content">
          <p className="mb-3">
            Cuando es necesario, el Tecnólogo Médico en Terapia de Lenguaje trabaja de forma
            articulada con:
          </p>
          <div className="row g-3">
            <div className="col-md-6">
              <div className="benefit-card">
                <div className="benefit-icon" style={{ background: '#d4f4dd', color: '#2d8659', fontSize: '2rem', fontWeight: 'bold' }}>
                  <i className="bi bi-hospital-fill"></i>
                </div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Neuropediatría</h4>
                <p style={{ fontSize: '0.9rem', marginBottom: '0' }}>Evaluación neurológica del desarrollo</p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="benefit-card">
                <div className="benefit-icon" style={{ background: '#d4f4dd', color: '#2d8659', fontSize: '2rem', fontWeight: 'bold' }}>
                  <i className="bi bi-emoji-smile-fill"></i>
                </div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Psicología infantil</h4>
                <p style={{ fontSize: '0.9rem', marginBottom: '0' }}>Apoyo emocional y conductual</p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="benefit-card">
                <div className="benefit-icon" style={{ background: '#d4f4dd', color: '#2d8659', fontSize: '2rem', fontWeight: 'bold' }}>
                  <i className="bi bi-activity"></i>
                </div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Terapia ocupacional</h4>
                <p style={{ fontSize: '0.9rem', marginBottom: '0' }}>Integración sensorial y motricidad</p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="benefit-card">
                <div className="benefit-icon" style={{ background: '#d4f4dd', color: '#2d8659', fontSize: '2rem', fontWeight: 'bold' }}>
                  <i className="bi bi-clipboard2-pulse-fill"></i>
                </div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Pediatría</h4>
                <p style={{ fontSize: '0.9rem', marginBottom: '0' }}>Seguimiento del desarrollo general</p>
              </div>
            </div>
          </div>
          <p className="mt-4">
            <i className="bi bi-shield-check me-2" style={{ color: '#50C878' }}></i>
            Esto garantiza un <strong>abordaje integral del desarrollo infantil</strong>, centrado
            en el bienestar del niño.
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
          <i className="bi bi-award-fill" style={{ fontSize: '2.5rem', color: '#9B59B6', flexShrink: 0 }}></i>
          <div>
            <h3 style={{ color: '#9B59B6', marginBottom: '1rem' }}>Detectar a tiempo marca la diferencia</h3>
            <p style={{ marginBottom: '1rem', lineHeight: '1.8' }}>
              Si tienes dudas sobre el desarrollo del lenguaje de tu hijo, no esperes.
              <strong> Una evaluación temprana puede abrir las puertas a intervenciones oportunas</strong> que
              potencien sus habilidades comunicativas y mejoren su calidad de vida.
            </p>
            <p style={{ marginBottom: '0', lineHeight: '1.8' }}>
              El lenguaje es la llave que abre el mundo social, académico y emocional de los niños.
              Ayúdalo a encontrar su voz.
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
