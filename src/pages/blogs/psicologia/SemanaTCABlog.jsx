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
        con impacto significativo en la salud física, emocional y social, y con una de las <strong>tasas de mortalidad
        más altas</strong> dentro de los trastornos psiquiátricos (Arcelus et al., 2011).
      </p>

      <hr className="my-5" />

      {/* Sección 1: Qué son los TCA */}
      <h2 className="section-title" data-aos="fade-up">¿Qué son los Trastornos de la Conducta Alimentaria?</h2>

      <p className="mb-4">
        Los TCA se caracterizan por <strong>alteraciones persistentes en la conducta alimentaria</strong>, acompañadas de
        una preocupación intensa por el peso, la figura corporal y la autoimagen, que afectan el funcionamiento físico y
        psicológico de la persona (American Psychiatric Association [APA], 2022).
      </p>

      <p className="mb-4">Entre los principales TCA reconocidos se encuentran:</p>

      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card" style={{ borderLeft: '4px solid #e74c3c' }}>
            <div className="benefit-icon">
              <i className="bi bi-exclamation-triangle"></i>
            </div>
            <h3>Anorexia nerviosa</h3>
            <p>Restricción extrema de la ingesta, miedo intenso a subir de peso y distorsión de la imagen corporal.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card" style={{ borderLeft: '4px solid #f39c12' }}>
            <div className="benefit-icon">
              <i className="bi bi-arrow-repeat"></i>
            </div>
            <h3>Bulimia nerviosa</h3>
            <p>Episodios recurrentes de atracones seguidos de conductas compensatorias (vómitos, laxantes, ejercicio excesivo).</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card" style={{ borderLeft: '4px solid #e67e22' }}>
            <div className="benefit-icon">
              <i className="bi bi-lightning"></i>
            </div>
            <h3>Trastorno por atracón</h3>
            <p>Episodios de ingesta excesiva con pérdida de control, sin conductas compensatorias regulares.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
          <div className="benefit-card" style={{ borderLeft: '4px solid #3498db' }}>
            <div className="benefit-icon">
              <i className="bi bi-file-medical"></i>
            </div>
            <h3>OSFED</h3>
            <p>Otros trastornos alimentarios especificados: cuadros clínicamente significativos que generan malestar e impacto funcional importantes.</p>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      {/* Sección 2: A quiénes afectan */}
      <h2 className="section-title" data-aos="fade-up">¿A quiénes afectan?</h2>

      <p className="mb-4">
        Aunque tradicionalmente se ha asociado a los TCA con mujeres adolescentes,
        <strong> la evidencia muestra una realidad más amplia</strong>:
      </p>

      <div className="row gy-4 mb-5">
        <div className="col-md-4" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card" style={{ borderLeft: '4px solid #9b59b6', textAlign: 'center' }}>
            <h3 style={{ color: '#8e44ad', fontSize: '1.6rem' }}>Cualquier edad</h3>
            <p>Pueden aparecer en cualquier etapa del ciclo vital.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card" style={{ borderLeft: '4px solid #9b59b6', textAlign: 'center' }}>
            <h3 style={{ color: '#8e44ad', fontSize: '1.6rem' }}>30–40%</h3>
            <p>De los casos pueden corresponder a varones.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card" style={{ borderLeft: '4px solid #9b59b6', textAlign: 'center' }}>
            <h3 style={{ color: '#8e44ad', fontSize: '1.6rem' }}>Todos</h3>
            <p>Se presentan en diversos contextos socioculturales.</p>
          </div>
        </div>
      </div>

      <div className="alert-info mb-5" data-aos="fade-up">
        <i className="bi bi-info-circle-fill me-2"></i>
        <strong>Dato importante:</strong> la adolescencia es un período de especial vulnerabilidad, pero cada vez se
        observan más casos en la adultez. Los varones suelen consultar más tarde debido al estigma
        (Mitchison &amp; Mond, 2014).
      </div>

      <hr className="my-5" />

      {/* Sección 3: Factores de riesgo */}
      <h2 className="section-title" data-aos="fade-up">Factores de riesgo: una mirada integral</h2>

      <p className="mb-4">
        Los TCA tienen un <strong>origen multifactorial</strong>, resultado de la interacción de diversos factores:
      </p>

      {/* Imagen 2 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/tca-semana2.webp"
          alt="Grupo de apoyo en círculo"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <div className="row gy-4 mb-5">
        <div className="col-md-4" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card" style={{ borderLeft: '4px solid #9b59b6' }}>
            <div className="benefit-icon">
              <i className="bi bi-emoji-frown"></i>
            </div>
            <h3>Factores psicológicos</h3>
            <p>Baja autoestima, perfeccionismo rígido, dificultades en la regulación emocional y necesidad de control.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card" style={{ borderLeft: '4px solid #3498db' }}>
            <div className="benefit-icon">
              <i className="bi bi-people-fill"></i>
            </div>
            <h3>Factores familiares y sociales</h3>
            <p>Comentarios sobre el peso o el cuerpo, idealización de la delgadez, presión social y uso intensivo de redes centradas en la imagen corporal.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card" style={{ borderLeft: '4px solid #e74c3c' }}>
            <div className="benefit-icon">
              <i className="bi bi-heart-pulse-fill"></i>
            </div>
            <h3>Factores biológicos</h3>
            <p>Vulnerabilidad genética y alteraciones neurobiológicas relacionadas con el control de impulsos y la recompensa (Treasure et al., 2020).</p>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      {/* Sección 4: Señales de alerta */}
      <h2 className="section-title" data-aos="fade-up">Señales de alerta: lo que no debemos normalizar</h2>

      <p className="mb-4">La detección temprana es clave. Algunas señales de alarma incluyen:</p>

      <div className="tips-box mb-5" data-aos="fade-up" style={{
        background: 'linear-gradient(135deg, #ffe5e5 0%, #ffd4d4 100%)',
        borderLeft: '4px solid #e74c3c',
        padding: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '2rem', color: '#c0392b', flexShrink: 0 }}></i>
          <div>
            <ul className="feature-list mb-3">
              <li><i className="bi bi-check-circle-fill"></i> Cambios bruscos en los hábitos alimentarios</li>
              <li><i className="bi bi-check-circle-fill"></i> Evitar comer en compañía</li>
              <li><i className="bi bi-check-circle-fill"></i> Preocupación excesiva por calorías, peso o ejercicio</li>
              <li><i className="bi bi-check-circle-fill"></i> Cambios de humor, irritabilidad o aislamiento social</li>
              <li><i className="bi bi-check-circle-fill"></i> Uso frecuente del baño después de comer</li>
              <li><i className="bi bi-check-circle-fill"></i> Comentarios negativos constantes sobre el propio cuerpo</li>
            </ul>
            <p style={{ marginBottom: '0', fontWeight: '600', color: '#c0392b' }}>
              Estas conductas no deben minimizarse ni interpretarse como "etapas normales".
            </p>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      {/* Sección 5: Mitos frecuentes */}
      <h2 className="section-title" data-aos="fade-up">Mitos frecuentes sobre los TCA</h2>

      <p className="mb-5">Combatir estos mitos es una tarea fundamental de la concientización:</p>

      <div className="recipe-section mb-5" data-aos="fade-up">
        <div className="recipe-number">1</div>
        <h3 className="recipe-title">Mito: "Es solo falta de voluntad"</h3>
        <div className="recipe-content">
          <p className="mb-0">
            <strong style={{ color: '#27ae60' }}>Verdad:</strong> los TCA no se eligen; son trastornos mentales complejos.
          </p>
        </div>
      </div>

      <div className="recipe-section mb-5" data-aos="fade-up">
        <div className="recipe-number">2</div>
        <h3 className="recipe-title">Mito: "Solo afectan a adolescentes"</h3>
        <div className="recipe-content">
          <p className="mb-0">
            <strong style={{ color: '#27ae60' }}>Verdad:</strong> pueden presentarse a cualquier edad.
          </p>
        </div>
      </div>

      <div className="recipe-section mb-5" data-aos="fade-up">
        <div className="recipe-number">3</div>
        <h3 className="recipe-title">Mito: "Si la persona come, ya está mejor"</h3>
        <div className="recipe-content">
          <p className="mb-0">
            <strong style={{ color: '#27ae60' }}>Verdad:</strong> la recuperación va mucho más allá de la conducta alimentaria.
          </p>
        </div>
      </div>

      <hr className="my-5" />

      {/* Imagen 3 */}
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
        La evidencia científica respalda que el <strong>tratamiento más efectivo es interdisciplinario</strong>,
        integrando:
      </p>

      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card" style={{ borderLeft: '4px solid #27ae60' }}>
            <div className="benefit-icon">
              <i className="bi bi-heart-pulse-fill"></i>
            </div>
            <h3>Psicoterapia especializada</h3>
            <p>Terapia cognitivo-conductual adaptada a TCA.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card" style={{ borderLeft: '4px solid #27ae60' }}>
            <div className="benefit-icon">
              <i className="bi bi-clipboard2-check"></i>
            </div>
            <h3>Seguimiento médico</h3>
            <p>Monitoreo de salud física y complicaciones.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card" style={{ borderLeft: '4px solid #27ae60' }}>
            <div className="benefit-icon">
              <i className="bi bi-basket"></i>
            </div>
            <h3>Intervención nutricional</h3>
            <p>Reeducación alimentaria personalizada.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
          <div className="benefit-card" style={{ borderLeft: '4px solid #27ae60' }}>
            <div className="benefit-icon">
              <i className="bi bi-people-fill"></i>
            </div>
            <h3>Trabajo con la familia</h3>
            <p>Involucrar a la red de apoyo cercana.</p>
          </div>
        </div>
      </div>

      <div className="tips-box mb-5" data-aos="fade-up" style={{
        background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
        borderLeft: '4px solid #9b59b6',
        padding: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <i className="bi bi-heart-fill" style={{ fontSize: '2rem', color: '#8e44ad', flexShrink: 0 }}></i>
          <div>
            <h4 style={{ color: '#8e44ad', marginBottom: '1rem' }}>Mensaje de esperanza</h4>
            <p className="mb-2" style={{ lineHeight: '1.8' }}>
              La recuperación es un proceso, no lineal, que requiere tiempo, acompañamiento y comprensión.
            </p>
            <p className="mb-0" style={{ fontWeight: '600' }}>
              Pedir ayuda a tiempo salva vidas (National Institute for Health and Care Excellence [NICE], 2017).
            </p>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      {/* Sección 7: El rol de la concientización */}
      <h2 className="section-title" data-aos="fade-up">El rol de la concientización</h2>

      <p className="mb-4">Hablar de TCA durante esta semana implica:</p>

      <ul className="feature-list mb-5" data-aos="fade-up">
        <li><i className="bi bi-check-circle-fill"></i> Reducir el estigma</li>
        <li><i className="bi bi-check-circle-fill"></i> Promover información basada en evidencia</li>
        <li><i className="bi bi-check-circle-fill"></i> Fomentar la detección temprana</li>
        <li><i className="bi bi-check-circle-fill"></i> Recordar que la salud mental es salud</li>
      </ul>

      <div className="alert-info mb-5" data-aos="fade-up">
        <i className="bi bi-heart me-2"></i>
        Si usted o alguien cercano está atravesando una situación relacionada con la alimentación y la imagen
        corporal, <strong>buscar ayuda profesional es un acto de cuidado, no de debilidad</strong>.
      </div>

      <hr className="my-5" />

      {/* Sección 8: 5 acciones conscientes */}
      <h2 className="section-title" data-aos="fade-up">5 acciones conscientes para esta semana</h2>

      <p className="mb-4">
        Esta semana proponemos algo simple pero transformador. La prevención comienza en conversaciones cotidianas:
      </p>

      <div className="recipe-section mb-5" data-aos="fade-up">
        <div className="recipe-number">1</div>
        <h3 className="recipe-title">Cambia el foco del peso al bienestar</h3>
        <div className="recipe-content">
          <p className="mb-0">Pregunta cómo se siente la persona, no cuánto ha bajado o subido.</p>
        </div>
      </div>

      <div className="recipe-section mb-5" data-aos="fade-up">
        <div className="recipe-number">2</div>
        <h3 className="recipe-title">Evita comentarios sobre cuerpos ajenos</h3>
        <div className="recipe-content">
          <p className="mb-0">Incluso los "positivos" pueden reforzar la idea de que el valor está en la apariencia.</p>
        </div>
      </div>

      <div className="recipe-section mb-5" data-aos="fade-up">
        <div className="recipe-number">3</div>
        <h3 className="recipe-title">Modela una relación saludable con la comida</h3>
        <div className="recipe-content">
          <p className="mb-0">Comer sin culpa también es un mensaje educativo.</p>
        </div>
      </div>

      <div className="recipe-section mb-5" data-aos="fade-up">
        <div className="recipe-number">4</div>
        <h3 className="recipe-title">Escucha sin minimizar</h3>
        <div className="recipe-content">
          <p className="mb-0">Si alguien expresa malestar con su cuerpo, no lo reduzcas a "es una etapa".</p>
        </div>
      </div>

      <div className="recipe-section mb-5" data-aos="fade-up">
        <div className="recipe-number">5</div>
        <h3 className="recipe-title">Promueve ayuda profesional temprana</h3>
        <div className="recipe-content">
          <p className="mb-0">Detectar a tiempo cambia el pronóstico.</p>
        </div>
      </div>

      <hr className="my-5" />

      {/* Mensaje final */}
      <div className="tips-box mb-5" data-aos="fade-up" style={{
        background: 'linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%)',
        color: '#fff',
        padding: '3rem',
        textAlign: 'center',
        borderLeft: 'none'
      }}>
        <i className="bi bi-heart-fill" style={{ fontSize: '3rem', marginBottom: '1.2rem', display: 'block' }}></i>
        <h2 style={{ fontWeight: '700', marginBottom: '1rem', color: '#242424' }}>
          El cuerpo no es un proyecto estético
        </h2>
        <p style={{ fontSize: '1.2rem', marginBottom: '1.2rem', fontWeight: '600' }}>
          Es el lugar donde vivimos.
        </p>
        <p style={{ fontSize: '1.05rem', marginBottom: '1rem', opacity: 0.95 }}>
          La prevención comienza en conversaciones cotidianas. Hablar de estos temas no induce trastornos;
          <strong> el silencio sí incrementa el sufrimiento</strong>.
        </p>
        <p style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: 0 }}>
          Que esta semana no sea solo informativa, sino transformadora.
        </p>
      </div>

      <hr className="my-5" />

      {/* Referencias */}
      <div className="mb-5" style={{
        background: 'var(--cx-surface)',
        border: '1px solid var(--cx-line)',
        borderRadius: 'var(--cx-r-lg)',
        padding: '2rem'
      }}>
        <h3 style={{ fontWeight: '700', marginBottom: '1.5rem', color: 'var(--cx-ink)' }}>
          Referencias bibliográficas
        </h3>
        <div style={{ fontSize: '0.95rem', lineHeight: '1.8', color: 'var(--cx-ink-2)' }}>
          <p className="mb-3">
            <strong>American Psychiatric Association.</strong> (2022). <em>DSM-5-TR: Diagnostic and statistical
            manual of mental disorders</em> (5th ed., text rev.). American Psychiatric Association Publishing.
          </p>
          <p className="mb-3">
            <strong>Arcelus, J., Mitchell, A. J., Wales, J., &amp; Nielsen, S.</strong> (2011). Mortality rates in
            patients with anorexia nervosa and other eating disorders: A meta-analysis of 36 studies.
            <em> Archives of General Psychiatry, 68</em>(7), 724–731.
          </p>
          <p className="mb-3">
            <strong>Mitchison, D., &amp; Mond, J.</strong> (2014). Epidemiology of eating disorders, eating
            disordered behaviour, and body image disturbance in males: A narrative review.
            <em> Journal of Eating Disorders, 2</em>(1), 20.
          </p>
          <p className="mb-3">
            <strong>National Institute for Health and Care Excellence.</strong> (2017). <em>Eating disorders:
            Recognition and treatment</em> (NICE Guideline NG69).
          </p>
          <p className="mb-0">
            <strong>Treasure, J., Duarte, T. A., &amp; Schmidt, U.</strong> (2020). Eating disorders.
            <em> The Lancet, 395</em>(10227), 899–911.
          </p>
        </div>
      </div>
    </>
  );
}