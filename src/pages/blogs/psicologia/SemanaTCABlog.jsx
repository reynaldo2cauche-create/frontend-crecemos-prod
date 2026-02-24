import React from 'react';

export default function SemanaTCABlog() {
  return (
    <>
      {/* Introducción principal */}
      <div className="lead mb-5" style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#555' }}>
        Cada año, durante la <strong>Semana de Concientización sobre los Trastornos de la Conducta Alimentaria (TCA)</strong>,
        se busca visibilizar una problemática de salud mental que afecta a niños, adolescentes y adultos, y que muchas veces
        permanece oculta por el estigma, la desinformación y los mitos. Hablar de los TCA no promueve la enfermedad;
        <strong> promueve la prevención, la detección temprana y el acceso oportuno a ayuda profesional</strong>.
      </div>

      <p className="mb-4">
        Los TCA no son una elección, una moda ni un problema superficial. Son <strong>trastornos mentales graves</strong>,
        con impacto significativo en la salud física, emocional y social, y con una de las <strong>tasas de mortalidad más altas</strong> dentro
        de los trastornos psiquiátricos (Arcelus et al., 2011).
      </p>

      <hr className="my-5" />

      {/* Sección 1: ¿Qué son los TCA? */}
      <h2 className="section-title" data-aos="fade-up">¿Qué son los Trastornos de la Conducta Alimentaria?</h2>

      <p className="mb-4">
        Los TCA se caracterizan por <strong>alteraciones persistentes en la conducta alimentaria</strong>, acompañadas de una
        preocupación intensa por el peso, la figura corporal y la autoimagen, que afectan el funcionamiento físico y psicológico
        de la persona (American Psychiatric Association [APA], 2022).
      </p>

 
      <p className="mb-5">
        Entre los principales TCA reconocidos se encuentran:
      </p>

      {/* Tipos de TCA */}
      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card" style={{ borderLeft: '4px solid #e74c3c' }}>
            <div className="benefit-icon">
              <i className="bi bi-exclamation-triangle"></i>
            </div>
            <h3>Anorexia nerviosa</h3>
            <p>
              Restricción extrema de la ingesta, miedo intenso a subir de peso y distorsión de la imagen corporal.
            </p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card" style={{ borderLeft: '4px solid #f39c12' }}>
            <div className="benefit-icon">
              <i className="bi bi-arrow-repeat"></i>
            </div>
            <h3>Bulimia nerviosa</h3>
            <p>
              Episodios recurrentes de atracones seguidos de conductas compensatorias (vómitos, laxantes, ejercicio excesivo).
            </p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card" style={{ borderLeft: '4px solid #e67e22' }}>
            <div className="benefit-icon">
              <i className="bi bi-lightning"></i>
            </div>
            <h3>Trastorno por atracón</h3>
            <p>
              Episodios de ingesta excesiva con pérdida de control, sin conductas compensatorias regulares.
            </p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
          <div className="benefit-card" style={{ borderLeft: '4px solid #3498db' }}>
            <div className="benefit-icon">
              <i className="bi bi-file-medical"></i>
            </div>
            <h3>OSFED</h3>
            <p>
              Otros trastornos alimentarios especificados: cuadros clínicamente significativos que generan malestar e impacto funcional importantes.
            </p>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      {/* Sección 2: ¿A quiénes afectan? */}
      <h2 className="section-title" data-aos="fade-up">¿A quiénes afectan?</h2>

      <p className="mb-4">
        Aunque tradicionalmente se ha asociado a los TCA con mujeres adolescentes,
        <strong> la evidencia muestra una realidad más amplia</strong>:
      </p>

      <div className="alert-info mb-5" data-aos="fade-up" style={{
        background: 'linear-gradient(135deg, #f8e8ff 0%, #f2d4ff 100%)',
        border: '2px solid #9b59b6',
        padding: '2rem',
        borderRadius: '12px'
      }}>
        <div className="row text-center">
          <div className="col-md-4 mb-4 mb-md-0">
            <div style={{ fontSize: '3rem', fontWeight: '700', color: '#9b59b6' }}>
              Cualquier edad
            </div>
            <p className="mb-0" style={{ fontSize: '1rem', color: '#555' }}>
              Pueden aparecer en cualquier etapa del ciclo vital
            </p>
          </div>
          <div className="col-md-4 mb-4 mb-md-0">
            <div style={{ fontSize: '3rem', fontWeight: '700', color: '#9b59b6' }}>
              30-40%
            </div>
            <p className="mb-0" style={{ fontSize: '1rem', color: '#555' }}>
              De los casos pueden corresponder a varones
            </p>
          </div>
          <div className="col-md-4">
            <div style={{ fontSize: '3rem', fontWeight: '700', color: '#9b59b6' }}>
              Todos
            </div>
            <p className="mb-0" style={{ fontSize: '1rem', color: '#555' }}>
              Se presentan en diversos contextos socioculturales
            </p>
          </div>
        </div>
      </div>

      <div className="alert-warning mb-5" data-aos="fade-up" style={{
        background: '#fff3cd',
        border: '2px solid #f39c12',
        padding: '1.5rem',
        borderRadius: '12px'
      }}>
        <i className="bi bi-info-circle me-2" style={{ color: '#f39c12', fontSize: '1.5rem' }}></i>
        <strong>Dato importante:</strong> La adolescencia es un período de especial vulnerabilidad, pero cada vez se observan más casos en la adultez.
        Los varones suelen consultar más tarde debido al estigma (Mitchison & Mond, 2014).
      </div>

      <hr className="my-5" />

      {/* Sección 3: Factores de riesgo */}
      <h2 className="section-title" data-aos="fade-up">Factores de riesgo: una mirada integral</h2>

      <p className="mb-4">
        Los TCA tienen un <strong>origen multifactorial</strong>, resultado de la interacción de diversos factores:
      </p>

      {/* IMAGEN 2 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/tca-semana2.webp"
          alt="Grupo de apoyo en círculo"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      {/* Factores psicológicos */}
      <div className="mb-5" data-aos="fade-up">
        <h3 style={{ color: '#9b59b6', fontWeight: '700', marginBottom: '1rem' }}>
          <i className="bi bi-emoji-frown me-2"></i>
          Factores psicológicos
        </h3>
        <ul style={{ fontSize: '1.05rem', lineHeight: '1.8' }}>
          <li>Baja autoestima</li>
          <li>Perfeccionismo rígido</li>
          <li>Dificultades en la regulación emocional</li>
          <li>Necesidad de control</li>
        </ul>
      </div>

      {/* Factores familiares y sociales */}
      <div className="mb-5" data-aos="fade-up">
        <h3 style={{ color: '#3498db', fontWeight: '700', marginBottom: '1rem' }}>
          <i className="bi bi-people-fill me-2"></i>
          Factores familiares y sociales
        </h3>
        <ul style={{ fontSize: '1.05rem', lineHeight: '1.8' }}>
          <li>Comentarios frecuentes sobre el peso o el cuerpo</li>
          <li>Idealización de la delgadez</li>
          <li>Presión social y cultural</li>
          <li>Uso intensivo de redes sociales centradas en la imagen corporal</li>
        </ul>
      </div>

      {/* Factores biológicos */}
      <div className="mb-5" data-aos="fade-up">
        <h3 style={{ color: '#e74c3c', fontWeight: '700', marginBottom: '1rem' }}>
          <i className="bi bi-heart-pulse-fill me-2"></i>
          Factores biológicos
        </h3>
        <ul style={{ fontSize: '1.05rem', lineHeight: '1.8' }}>
          <li>Vulnerabilidad genética</li>
          <li>Alteraciones neurobiológicas relacionadas con el control de impulsos y la recompensa (Treasure et al., 2020)</li>
        </ul>
      </div>

      <hr className="my-5" />

      {/* Sección 4: Señales de alerta */}
      <h2 className="section-title" data-aos="fade-up">Señales de alerta: lo que no debemos normalizar</h2>

      <p className="mb-4">
        La detección temprana es clave. Algunas señales de alarma incluyen:
      </p>

      <div className="alert-danger mb-5" data-aos="fade-up" style={{
        background: 'linear-gradient(135deg, #ffe5e5 0%, #ffd4d4 100%)',
        border: '2px solid #e74c3c',
        padding: '2rem',
        borderRadius: '12px'
      }}>
        <div className="row">
          <div className="col-md-6 mb-3">
            <i className="bi bi-exclamation-circle me-2" style={{ color: '#e74c3c' }}></i>
            Cambios bruscos en los hábitos alimentarios
          </div>
          <div className="col-md-6 mb-3">
            <i className="bi bi-exclamation-circle me-2" style={{ color: '#e74c3c' }}></i>
            Evitar comer en compañía
          </div>
          <div className="col-md-6 mb-3">
            <i className="bi bi-exclamation-circle me-2" style={{ color: '#e74c3c' }}></i>
            Preocupación excesiva por calorías, peso o ejercicio
          </div>
          <div className="col-md-6 mb-3">
            <i className="bi bi-exclamation-circle me-2" style={{ color: '#e74c3c' }}></i>
            Cambios de humor, irritabilidad o aislamiento social
          </div>
          <div className="col-md-6 mb-3">
            <i className="bi bi-exclamation-circle me-2" style={{ color: '#e74c3c' }}></i>
            Uso frecuente del baño después de comer
          </div>
          <div className="col-md-6 mb-3">
            <i className="bi bi-exclamation-circle me-2" style={{ color: '#e74c3c' }}></i>
            Comentarios negativos constantes sobre el propio cuerpo
          </div>
        </div>
        <p className="mb-0 mt-3" style={{ fontSize: '1.1rem', fontWeight: '600', color: '#c0392b' }}>
          ⚠️ Estas conductas no deben minimizarse ni interpretarse como "etapas normales".
        </p>
      </div>

      <hr className="my-5" />

      {/* Sección 5: Mitos frecuentes */}
      <h2 className="section-title" data-aos="fade-up">Mitos frecuentes sobre los TCA</h2>

      <p className="mb-5">
        Combatir estos mitos es una tarea fundamental de la concientización:
      </p>

      <div className="row gy-4 mb-5">
        <div className="col-md-12" data-aos="fade-up">
          <div style={{
            background: '#fff',
            border: '2px solid #e74c3c',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
              <div style={{
                background: '#e74c3c',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <i className="bi bi-x-circle" style={{ color: '#fff', fontSize: '1.5rem' }}></i>
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ color: '#e74c3c', marginBottom: '0.5rem' }}>
                  Mito: "Es solo falta de voluntad"
                </h4>
                <p className="mb-0" style={{ fontSize: '1.05rem', color: '#555' }}>
                  <strong style={{ color: '#27ae60' }}>Verdad:</strong> Los TCA no se eligen; son trastornos mentales complejos.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-12" data-aos="fade-up" data-aos-delay="100">
          <div style={{
            background: '#fff',
            border: '2px solid #e74c3c',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
              <div style={{
                background: '#e74c3c',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <i className="bi bi-x-circle" style={{ color: '#fff', fontSize: '1.5rem' }}></i>
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ color: '#e74c3c', marginBottom: '0.5rem' }}>
                  Mito: "Solo afectan a adolescentes"
                </h4>
                <p className="mb-0" style={{ fontSize: '1.05rem', color: '#555' }}>
                  <strong style={{ color: '#27ae60' }}>Verdad:</strong> Pueden presentarse a cualquier edad.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-12" data-aos="fade-up" data-aos-delay="200">
          <div style={{
            background: '#fff',
            border: '2px solid #e74c3c',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
              <div style={{
                background: '#e74c3c',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <i className="bi bi-x-circle" style={{ color: '#fff', fontSize: '1.5rem' }}></i>
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ color: '#e74c3c', marginBottom: '0.5rem' }}>
                  Mito: "Si la persona come, ya está mejor"
                </h4>
                <p className="mb-0" style={{ fontSize: '1.05rem', color: '#555' }}>
                  <strong style={{ color: '#27ae60' }}>Verdad:</strong> La recuperación va mucho más allá de la conducta alimentaria.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      {/* IMAGEN 3 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/tca-semana3.webp"
          alt="Profesional de salud mental en sesión terapéutica"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      {/* Sección 6: Tratamiento y recuperación */}
      <h2 className="section-title" data-aos="fade-up">Tratamiento y recuperación: sí es posible</h2>

      <p className="mb-5">
        La evidencia científica respalda que el <strong>tratamiento más efectivo es interdisciplinario</strong>, integrando:
      </p>

      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card" style={{ borderLeft: '4px solid #27ae60' }}>
            <div className="benefit-icon">
              <i className="bi bi-heart-pulse-fill"></i>
            </div>
            <h3>Psicoterapia especializada</h3>
            <p>
              Terapia cognitivo-conductual adaptada a TCA
            </p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card" style={{ borderLeft: '4px solid #27ae60' }}>
            <div className="benefit-icon">
              <i className="bi bi-clipboard2-check"></i>
            </div>
            <h3>Seguimiento médico</h3>
            <p>
              Monitoreo de salud física y complicaciones
            </p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card" style={{ borderLeft: '4px solid #27ae60' }}>
            <div className="benefit-icon">
              <i className="bi bi-basket"></i>
            </div>
            <h3>Intervención nutricional</h3>
            <p>
              Reeducación alimentaria personalizada
            </p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
          <div className="benefit-card" style={{ borderLeft: '4px solid #27ae60' }}>
            <div className="benefit-icon">
              <i className="bi bi-people-fill"></i>
            </div>
            <h3>Trabajo con la familia</h3>
            <p>
              Involucrar a la red de apoyo cercana
            </p>
          </div>
        </div>
      </div>

      <div className="alert-success mb-5" data-aos="fade-up" style={{
        background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
        border: '2px solid #27ae60',
        padding: '2rem',
        borderRadius: '12px'
      }}>
        <h4 style={{ color: '#27ae60', fontWeight: '700', marginBottom: '1rem' }}>
          💚 Mensaje de esperanza
        </h4>
        <p className="mb-2" style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
          La recuperación es un proceso, no lineal, que requiere tiempo, acompañamiento y comprensión.
        </p>
        <p className="mb-0" style={{ fontSize: '1.05rem', fontWeight: '600', color: '#1e7e34' }}>
          Pedir ayuda a tiempo salva vidas (National Institute for Health and Care Excellence [NICE], 2017).
        </p>
      </div>

      <hr className="my-5" />

      {/* Sección 7: El rol de la concientización */}
      <h2 className="section-title" data-aos="fade-up">El rol de la concientización</h2>

      <p className="mb-5">
        Hablar de TCA durante esta semana implica:
      </p>

      <div className="row gy-3 mb-5">
        <div className="col-md-6" data-aos="fade-up">
          <div style={{
            background: '#f8e8ff',
            border: '2px solid #9b59b6',
            borderRadius: '12px',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <i className="bi bi-check-circle-fill" style={{ fontSize: '2rem', color: '#9b59b6' }}></i>
            <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#555' }}>
              Reducir el estigma
            </span>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
          <div style={{
            background: '#f8e8ff',
            border: '2px solid #9b59b6',
            borderRadius: '12px',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <i className="bi bi-check-circle-fill" style={{ fontSize: '2rem', color: '#9b59b6' }}></i>
            <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#555' }}>
              Promover información basada en evidencia
            </span>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
          <div style={{
            background: '#f8e8ff',
            border: '2px solid #9b59b6',
            borderRadius: '12px',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <i className="bi bi-check-circle-fill" style={{ fontSize: '2rem', color: '#9b59b6' }}></i>
            <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#555' }}>
              Fomentar la detección temprana
            </span>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
          <div style={{
            background: '#f8e8ff',
            border: '2px solid #9b59b6',
            borderRadius: '12px',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <i className="bi bi-check-circle-fill" style={{ fontSize: '2rem', color: '#9b59b6' }}></i>
            <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#555' }}>
              Recordar que la salud mental es salud
            </span>
          </div>
        </div>
      </div>

      <div className="alert-info mb-5" data-aos="fade-up" style={{
        background: '#d9edf7',
        border: '2px solid #5bc0de',
        padding: '1.5rem',
        borderRadius: '12px',
        textAlign: 'center'
      }}>
        <p className="mb-0" style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#31708f' }}>
          Si usted o alguien cercano está atravesando una situación relacionada con la alimentación y la imagen corporal,
          <strong> buscar ayuda profesional es un acto de cuidado, no de debilidad</strong>.
        </p>
      </div>

      <hr className="my-5" />

      {/* Sección 8: 5 acciones conscientes */}
      <h2 className="section-title" data-aos="fade-up">5 acciones conscientes para esta semana</h2>

      <p className="mb-5" style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
        Esta semana proponemos algo simple pero transformador. La prevención comienza en conversaciones cotidianas:
      </p>

      <div className="mb-5" data-aos="fade-up">
        <div style={{
          background: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
          color: '#fff',
          borderRadius: '12px',
          padding: '2rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'start' }}>
            <div style={{
              background: '#fff',
              borderRadius: '50%',
              width: '60px',
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontSize: '2rem',
              fontWeight: '700',
              color: '#9b59b6'
            }}>
              1
            </div>
            <div>
              <h4 style={{ fontWeight: '700', marginBottom: '0.5rem' }}>
                Cambia el foco del peso al bienestar
              </h4>
              <p className="mb-0" style={{ fontSize: '1.05rem', opacity: 0.9 }}>
                Pregunta cómo se siente la persona, no cuánto ha bajado o subido.
              </p>
            </div>
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
          color: '#fff',
          borderRadius: '12px',
          padding: '2rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'start' }}>
            <div style={{
              background: '#fff',
              borderRadius: '50%',
              width: '60px',
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontSize: '2rem',
              fontWeight: '700',
              color: '#9b59b6'
            }}>
              2
            </div>
            <div>
              <h4 style={{ fontWeight: '700', marginBottom: '0.5rem' }}>
                Evita comentarios sobre cuerpos ajenos
              </h4>
              <p className="mb-0" style={{ fontSize: '1.05rem', opacity: 0.9 }}>
                Incluso los "positivos" pueden reforzar la idea de que el valor está en la apariencia.
              </p>
            </div>
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
          color: '#fff',
          borderRadius: '12px',
          padding: '2rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'start' }}>
            <div style={{
              background: '#fff',
              borderRadius: '50%',
              width: '60px',
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontSize: '2rem',
              fontWeight: '700',
              color: '#9b59b6'
            }}>
              3
            </div>
            <div>
              <h4 style={{ fontWeight: '700', marginBottom: '0.5rem' }}>
                Modela una relación saludable con la comida
              </h4>
              <p className="mb-0" style={{ fontSize: '1.05rem', opacity: 0.9 }}>
                Comer sin culpa también es un mensaje educativo.
              </p>
            </div>
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
          color: '#fff',
          borderRadius: '12px',
          padding: '2rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'start' }}>
            <div style={{
              background: '#fff',
              borderRadius: '50%',
              width: '60px',
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontSize: '2rem',
              fontWeight: '700',
              color: '#9b59b6'
            }}>
              4
            </div>
            <div>
              <h4 style={{ fontWeight: '700', marginBottom: '0.5rem' }}>
                Escucha sin minimizar
              </h4>
              <p className="mb-0" style={{ fontSize: '1.05rem', opacity: 0.9 }}>
                Si alguien expresa malestar con su cuerpo, no lo reduzcas a "es una etapa".
              </p>
            </div>
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
          color: '#fff',
          borderRadius: '12px',
          padding: '2rem'
        }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'start' }}>
            <div style={{
              background: '#fff',
              borderRadius: '50%',
              width: '60px',
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontSize: '2rem',
              fontWeight: '700',
              color: '#9b59b6'
            }}>
              5
            </div>
            <div>
              <h4 style={{ fontWeight: '700', marginBottom: '0.5rem' }}>
                Promueve ayuda profesional temprana
              </h4>
              <p className="mb-0" style={{ fontSize: '1.05rem', opacity: 0.9 }}>
                Detectar a tiempo cambia el pronóstico.
              </p>
            </div>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      {/* Mensaje final */}
      <div className="mb-5" data-aos="fade-up" style={{
        background: 'linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%)',
        color: '#fff',
        borderRadius: '12px',
        padding: '3rem',
        textAlign: 'center'
      }}>
        <i className="bi bi-heart-fill" style={{ fontSize: '4rem', marginBottom: '1.5rem', display: 'block' }}></i>
        <h2 style={{ fontWeight: '700', marginBottom: '1rem' }}>
          El cuerpo no es un proyecto estético
        </h2>
        <p style={{ fontSize: '1.3rem', marginBottom: '1.5rem', fontWeight: '600' }}>
          Es el lugar donde vivimos.
        </p>
        <p style={{ fontSize: '1.1rem', marginBottom: '1rem', opacity: 0.95 }}>
          La prevención comienza en conversaciones cotidianas. Hablar de estos temas no induce trastornos;
          <strong> el silencio sí incrementa el sufrimiento</strong>.
        </p>
        <p style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: 0 }}>
          Que esta semana no sea solo informativa, sino transformadora. 🌸
        </p>
      </div>

      <hr className="my-5" />

      {/* Referencias */}
      <div className="mb-5" style={{
        background: '#f8f9fa',
        border: '2px solid #ddd',
        borderRadius: '12px',
        padding: '2rem'
      }}>
        <h3 style={{ fontWeight: '700', marginBottom: '1.5rem', color: '#333' }}>
          Referencias bibliográficas
        </h3>
        <div style={{ fontSize: '0.95rem', lineHeight: '1.8', color: '#555' }}>
          <p className="mb-3">
            <strong>American Psychiatric Association.</strong> (2022). <em>DSM-5-TR: Diagnostic and statistical manual of mental disorders</em> (5th ed., text rev.). APA Publishing.
          </p>
          <p className="mb-3">
            <strong>Arcelus, J., Mitchell, A. J., Wales, J., & Nielsen, S.</strong> (2011). Mortality rates in patients with anorexia nervosa and other eating disorders: A meta-analysis of 36 studies. <em>Archives of General Psychiatry, 68</em>(7), 724–731. https://doi.org/10.1001/archgenpsychiatry.2011.74
          </p>
          <p className="mb-3">
            <strong>Mitchison, D., & Mond, J.</strong> (2014). Epidemiology of eating disorders, eating disordered behaviour, and body image disturbance in males: A narrative review. <em>Journal of Eating Disorders, 2</em>(1), 20. https://doi.org/10.1186/s40337-014-0020-3
          </p>
          <p className="mb-3">
            <strong>National Institute for Health and Care Excellence.</strong> (2017). <em>Eating disorders: Recognition and treatment</em> (NICE Guideline NG69).
          </p>
          <p className="mb-0">
            <strong>Treasure, J., Duarte, T. A., & Schmidt, U.</strong> (2020). Eating disorders. <em>The Lancet, 395</em>(10227), 899–911. https://doi.org/10.1016/S0140-6736(20)30059-3
          </p>
        </div>
      </div>
    </>
  );
}
