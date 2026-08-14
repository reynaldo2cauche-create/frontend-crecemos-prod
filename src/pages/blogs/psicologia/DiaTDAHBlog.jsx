import React from 'react';

export default function DiaTDAHBlog() {
  return (
    <>
      {/* Introducción principal */}
      <div className="lead mb-5" style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#555' }}>
        Cada <strong>13 de julio</strong> se conmemora el <strong>Día Internacional del Trastorno por Déficit de
        Atención e Hiperactividad (TDAH)</strong>, una oportunidad para dejar de lado los mitos y comprender que no se
        trata de conductas intencionales, falta de interés o ausencia de límites, sino de una
        <strong> condición del neurodesarrollo</strong> que influye en la forma en que una persona regula su atención,
        controla sus impulsos y organiza su comportamiento.
      </div>

      <p className="mb-4">
        Detrás de muchas de las conductas que observamos existe una <strong>función y una necesidad que merece ser
        comprendida</strong>. Cambiar la mirada es el primer paso para acompañar mejor.
      </p>

      <hr className="my-5" />

      {/* Sección 1: ¿Qué es el TDAH? */}
      <h2 className="section-title" data-aos="fade-up">¿Qué es el TDAH?</h2>

      <p className="mb-4">
        El Trastorno por Déficit de Atención e Hiperactividad es un <strong>trastorno del neurodesarrollo </strong>
        caracterizado por dificultades de inatención, hiperactividad y/o impulsividad que interfiere de manera
        significativa en el funcionamiento académico, familiar, social o emocional.
      </p>

      <p className="mb-5">
        Los síntomas suelen aparecer durante la infancia y manifestarse en diferentes contextos, como el hogar y la
        escuela. No todos los niños presentan las mismas características (American Psychiatric Association, 2022):
      </p>

      <div className="row gy-4 mb-5">
        <div className="col-md-4" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card" style={{ borderLeft: '4px solid #9b59b6' }}>
            <div className="benefit-icon">
              <i className="bi bi-eye"></i>
            </div>
            <h3>Predominio inatento</h3>
            <p>Dificultades principalmente para mantener y sostener la atención.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card" style={{ borderLeft: '4px solid #e67e22' }}>
            <div className="benefit-icon">
              <i className="bi bi-lightning-charge"></i>
            </div>
            <h3>Predominio hiperactivo-impulsivo</h3>
            <p>Mayor inquietud motora, impulsividad y dificultad para esperar.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card" style={{ borderLeft: '4px solid #3498db' }}>
            <div className="benefit-icon">
              <i className="bi bi-arrow-repeat"></i>
            </div>
            <h3>Presentación combinada</h3>
            <p>Coexisten dificultades de atención junto con hiperactividad e impulsividad.</p>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      {/* Sección 2: ¿Por qué ocurre? */}
      <h2 className="section-title" data-aos="fade-up">¿Por qué ocurre?</h2>

      <p className="mb-4">
        Durante muchos años se creyó que el TDAH era consecuencia de una mala crianza. Hoy sabemos que
        <strong> la evidencia científica muestra algo diferente</strong>. El TDAH tiene un importante componente
        genético y está relacionado con diferencias en el desarrollo y funcionamiento de las redes cerebrales
        encargadas de las <strong>funciones ejecutivas</strong>: planificar, inhibir respuestas, mantener la atención
        y regular las emociones (Faraone et al., 2021).
      </p>

      <div className="alert-warning mb-5" data-aos="fade-up" style={{
        background: '#fff3cd',
        border: '2px solid #f39c12',
        padding: '1.5rem',
        borderRadius: '12px'
      }}>
        <i className="bi bi-info-circle me-2" style={{ color: '#f39c12', fontSize: '1.5rem' }}></i>
        <strong>Dato importante:</strong> Antecedentes familiares, nacimiento prematuro, bajo peso al nacer o algunas
        complicaciones durante el embarazo pueden aumentar el riesgo. Sin embargo, el estilo de crianza
        <strong> no causa</strong> el TDAH, aunque sí puede influir en cómo se expresan los síntomas y en el pronóstico
        del niño (Faraone et al., 2021; Cortese et al., 2021).
      </div>

      <hr className="my-5" />

      {/* Sección 3: Impacto en la vida diaria */}
      <h2 className="section-title" data-aos="fade-up">Más allá de la atención: ¿cómo impacta en la vida diaria?</h2>

      <p className="mb-4">
        El TDAH no afecta únicamente el rendimiento escolar. Su impacto suele extenderse a
        <strong> diferentes áreas del desarrollo</strong>.
      </p>

      {/* IMAGEN 2 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/tdah-2.webp"
          alt="Niño concentrándose en una tarea escolar con apoyo"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      {/* Aprendizaje y funciones ejecutivas */}
      <div className="mb-5" data-aos="fade-up">
        <h3 style={{ color: 'var(--cx-primary-700)', fontWeight: '700', marginBottom: '1rem' }}>
          <i className="bi bi-mortarboard-fill me-2"></i>
          Aprendizaje y funciones ejecutivas
        </h3>
        <p style={{ fontSize: '1.05rem', lineHeight: '1.8' }}>
          Muchos niños presentan dificultades para organizar materiales, seguir instrucciones de varios pasos, iniciar
          tareas, administrar el tiempo, terminar actividades y recordar lo que deben hacer. Esto
          <strong> no significa que tengan poca capacidad intelectual</strong>: muchos poseen un potencial adecuado,
          pero encuentran dificultades para gestionar sus recursos cognitivos.
        </p>
      </div>

      {/* Regulación emocional */}
      <div className="mb-5" data-aos="fade-up">
        <h3 style={{ color: 'var(--cx-primary-700)', fontWeight: '700', marginBottom: '1rem' }}>
          <i className="bi bi-heart-pulse-fill me-2"></i>
          Regulación emocional
        </h3>
        <p style={{ fontSize: '1.05rem', lineHeight: '1.8' }}>
          Una gran parte de los niños con TDAH experimentan dificultades para regular sus emociones. Pueden frustrarse
          con facilidad, reaccionar impulsivamente, tener cambios emocionales intensos o necesitar más tiempo para
          recuperar la calma después de una situación estresante (Shaw et al., 2014; Faraone et al., 2021). Fortalecer
          esta habilidad es fundamental, ya que influye directamente en cómo el niño se relaciona con los demás y
          consigo mismo.
        </p>
      </div>

      {/* Relaciones sociales */}
      <div className="mb-5" data-aos="fade-up">
        <h3 style={{ color: 'var(--cx-primary-700)', fontWeight: '700', marginBottom: '1rem' }}>
          <i className="bi bi-people-fill me-2"></i>
          Relaciones sociales
        </h3>
        <p style={{ fontSize: '1.05rem', lineHeight: '1.8' }}>
          La impulsividad, las interrupciones frecuentes, la dificultad para esperar turnos o interpretar algunas
          situaciones sociales pueden generar conflictos con compañeros y afectar la autoestima. Con el tiempo esto
          puede incrementar el riesgo de ansiedad, desmotivación o síntomas depresivos. Prestar atención a la forma en
          que el niño interactúa con sus pares permite identificar las habilidades sociales que requieren mayor
          fortalecimiento y diseñar, junto con la escuela, estrategias que favorezcan su integración y sus vínculos
          positivos dentro del grupo.
        </p>
      </div>

      {/* Autoestima */}
      <div className="mb-5" data-aos="fade-up">
        <h3 style={{ color: 'var(--cx-primary-700)', fontWeight: '700', marginBottom: '1rem' }}>
          <i className="bi bi-emoji-smile-fill me-2"></i>
          Autoestima
        </h3>
        <p style={{ fontSize: '1.05rem', lineHeight: '1.8' }}>
          Recibir constantes llamados de atención, comparaciones o críticas puede afectar profundamente la imagen que
          el niño construye de sí mismo. Por ello es fundamental que el entorno también
          <strong> reconozca sus fortalezas, intereses y esfuerzos</strong>, y no solo aquello que necesita mejorar.
        </p>
      </div>

      <hr className="my-5" />

      {/* Sección 4: Diagnóstico */}
      <h2 className="section-title" data-aos="fade-up">¿Cómo se realiza el diagnóstico?</h2>

      <p className="mb-4">
        El diagnóstico del TDAH <strong>no puede establecerse únicamente mediante un test o una prueba psicológica</strong>.
        Requiere una evaluación clínica integral y multidisciplinaria, realizada por profesionales capacitados y
        habilitados, como neuropsicólogos y neuropediatras.
      </p>

      <div className="alert-info mb-5" data-aos="fade-up" style={{
        background: 'linear-gradient(135deg, #f8e8ff 0%, #f2d4ff 100%)',
        border: '2px solid #9b59b6',
        padding: '2rem',
        borderRadius: '12px'
      }}>
        <h4 style={{ color: '#9b59b6', fontWeight: '700', marginBottom: '1rem' }}>
          <i className="bi bi-clipboard2-pulse me-2"></i>
          La evaluación integral suele incluir
        </h4>
        <div className="row">
          <div className="col-md-6 mb-2">
            <i className="bi bi-check-circle-fill me-2" style={{ color: '#9b59b6' }}></i>
            Entrevistas con la familia
          </div>
          <div className="col-md-6 mb-2">
            <i className="bi bi-check-circle-fill me-2" style={{ color: '#9b59b6' }}></i>
            Información del contexto escolar
          </div>
          <div className="col-md-6 mb-2">
            <i className="bi bi-check-circle-fill me-2" style={{ color: '#9b59b6' }}></i>
            Observación clínica
          </div>
          <div className="col-md-6 mb-2">
            <i className="bi bi-check-circle-fill me-2" style={{ color: '#9b59b6' }}></i>
            Uso de instrumentos validados
          </div>
        </div>
        <p className="mb-0 mt-3" style={{ color: '#555' }}>
          Además, es necesario <strong>descartar otras condiciones</strong> que puedan explicar los síntomas o
          presentarse junto con el TDAH, como trastornos del aprendizaje, ansiedad, alteraciones del sueño,
          dificultades emocionales u otros trastornos del neurodesarrollo.
        </p>
      </div>

      <p className="mb-4">
        Es recomendable <strong>actualizar las evaluaciones de manera periódica</strong>, especialmente cuando la
        evolución del niño, los cambios en las demandas de su entorno o el tiempo transcurrido lo hagan necesario.
        Contar con una evaluación reciente permite conocer su perfil de funcionamiento actual, identificar las
        habilidades que aún requieren fortalecimiento y ajustar los objetivos terapéuticos y educativos.
      </p>

      <p className="mb-5">
        De igual manera, es importante mantener <strong>controles periódicos con el neuropediatra</strong>, quien
        realiza el seguimiento del desarrollo neurológico, la evolución de los síntomas, las posibles condiciones
        asociadas y la respuesta al tratamiento. Cuando el niño recibe medicación, también supervisa su eficacia,
        los posibles efectos secundarios, el crecimiento, el peso, la presión arterial y la necesidad de ajustes. La
        comunicación entre la familia, el colegio y los profesionales favorece un abordaje integral centrado en las
        necesidades del niño.
      </p>

      <hr className="my-5" />

      {/* IMAGEN 3 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/tdah-3.webp"
          alt="Familia acompañando y comprendiendo a un niño en casa"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      {/* Sección 5: El papel de la familia */}
      <h2 className="section-title" data-aos="fade-up">El papel de la familia: acompañar desde la comprensión</h2>

      <p className="mb-4">
        La familia constituye uno de los <strong>factores protectores más importantes</strong> para el desarrollo del
        niño con TDAH. Más que buscar eliminar de inmediato las conductas difíciles, el objetivo es enseñar habilidades
        que favorezcan su autonomía y autorregulación.
      </p>

      <p className="mb-4">Algunas estrategias respaldadas por la evidencia incluyen:</p>

      <div className="row gy-3 mb-5">
        {[
          'Mantener rutinas estables y predecibles.',
          'Dar instrucciones breves, claras y una a la vez.',
          'Dividir las tareas largas en pequeños objetivos.',
          'Reforzar el esfuerzo y los avances, no únicamente los resultados.',
          'Utilizar consecuencias consistentes y evitar castigos excesivos.',
          'Anticipar los cambios de rutina para disminuir la impulsividad.',
          'Favorecer espacios de movimiento físico y descanso.',
          'Validar las emociones antes de corregir la conducta.',
        ].map((estrategia, i) => (
          <div className="col-md-6" data-aos="fade-up" data-aos-delay={i * 50} key={i}>
            <div style={{
              background: '#fff',
              border: '1px solid var(--cx-line)',
              borderLeft: '4px solid var(--cx-primary)',
              borderRadius: 'var(--cx-r-md)',
              padding: '1.25rem 1.4rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              height: '100%',
              boxShadow: 'var(--cx-shadow-sm)'
            }}>
              <i className="bi bi-check-circle-fill" style={{ fontSize: '1.5rem', color: 'var(--cx-primary)', flexShrink: 0 }}></i>
              <span style={{ fontSize: '1.02rem', fontWeight: '600', color: 'var(--cx-ink-2)' }}>{estrategia}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="alert-success mb-5" data-aos="fade-up" style={{
        background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
        border: '2px solid #27ae60',
        padding: '1.5rem',
        borderRadius: '12px'
      }}>
        <i className="bi bi-lightbulb-fill me-2" style={{ color: '#27ae60', fontSize: '1.5rem' }}></i>
        Estas prácticas contribuyen a disminuir el estrés familiar y favorecen el desarrollo de habilidades de
        autorregulación y funcionamiento ejecutivo (AAP, 2019; NICE, 2018).
      </div>

      <hr className="my-5" />

      {/* Sección 6: Cuándo buscar apoyo */}
      <h2 className="section-title" data-aos="fade-up">¿Cuándo buscar apoyo psicológico?</h2>

      <p className="mb-4">
        Es recomendable solicitar una evaluación psicológica cuando las dificultades de atención, impulsividad o
        hiperactividad <strong>interfieren de forma persistente</strong> en el desempeño escolar, las relaciones
        familiares, la convivencia con sus pares o el bienestar emocional del niño.
      </p>

      <p className="mb-4">
        La intervención psicológica basada en evidencia puede ayudar a desarrollar estrategias de organización,
        regulación emocional, resolución de problemas, habilidades sociales y entrenamiento para padres. Cuando el
        caso lo requiere, el trabajo interdisciplinario con neuropediatría o psiquiatría infantil permite ofrecer una
        atención integral e individualizada.
      </p>

      <div className="alert-info mb-5" data-aos="fade-up" style={{
        background: '#d9edf7',
        border: '2px solid #5bc0de',
        padding: '1.5rem',
        borderRadius: '12px',
        textAlign: 'center'
      }}>
        <p className="mb-0" style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#31708f' }}>
          Mientras más temprano se detecten las dificultades y se inicie el acompañamiento,
          <strong> mayores serán las oportunidades de potenciar el desarrollo y prevenir complicaciones futuras</strong>.
        </p>
      </div>

      <hr className="my-5" />

      {/* Mensaje final */}
      <div className="mb-5 cx-blog-msgband" data-aos="fade-up" style={{
        background: 'linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%)',
        color: '#fff',
        borderRadius: '12px',
        padding: '3rem',
        textAlign: 'center'
      }}>
        <i className="bi bi-heart-fill" style={{ fontSize: '4rem', marginBottom: '1.5rem', display: 'block' }}></i>
        <h2 style={{ fontWeight: '700', marginBottom: '1rem' }}>
          Un mensaje en este día
        </h2>
        <p style={{ fontSize: '1.2rem', marginBottom: '1rem', opacity: 0.95 }}>
          El TDAH no define quién es un niño ni determina todo aquello que podrá lograr.
        </p>
        <p style={{ fontSize: '1.05rem', marginBottom: '1.5rem', opacity: 0.95 }}>
          Con comprensión, intervenciones oportunas, una familia que acompañe desde el respeto y una escuela que adapte
          sus estrategias, estos niños pueden desarrollar plenamente sus capacidades y construir una autoestima
          saludable.
        </p>
        <p style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: 0 }}>
          Detrás de cada conducta hay una necesidad por comprender. Cambiar la mirada puede marcar una diferencia
          significativa en su desarrollo. 🌸
        </p>
      </div>

      <hr className="my-5" />

      {/* Bloque de autora */}
      <div className="author-credits" data-aos="fade-up">
        <div className="d-flex align-items-center gap-3">
          <div className="author-avatar">
            <i className="bi bi-person-circle" style={{ fontSize: '4rem', color: 'var(--cx-primary)' }}></i>
          </div>
          <div>
            <h4 style={{ marginBottom: '0.25rem' }}>Lic. Giselle Burgos Del Rosario</h4>
            <p style={{ marginBottom: '0.4rem', color: 'var(--cx-muted)', fontSize: '0.95rem' }}>
              <strong>Psicóloga Clínica – Centro Crecemos</strong>
            </p>
            <a
              href="https://www.crecemos.com.pe"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--cx-primary-700)', fontWeight: 600, fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center' }}
            >
              <i className="bi bi-globe me-2"></i> www.crecemos.com.pe
            </a>
          </div>
        </div>
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
            <strong>American Academy of Pediatrics.</strong> (2019). Clinical Practice Guideline for the Diagnosis,
            Evaluation, and Treatment of ADHD in Children and Adolescents. <em>Pediatrics, 144</em>(4), e20192528.
          </p>
          <p className="mb-3">
            <strong>American Psychiatric Association.</strong> (2022). <em>Diagnostic and Statistical Manual of Mental
            Disorders</em> (5th ed., text rev.; DSM-5-TR).
          </p>
          <p className="mb-3">
            <strong>Cortese, S., et al.</strong> (2021). Association between ADHD and obesity: A systematic review and
            meta-analysis. <em>Neuroscience &amp; Biobehavioral Reviews</em>.
          </p>
          <p className="mb-3">
            <strong>Faraone, S. V., et al.</strong> (2021). The World Federation of ADHD International Consensus
            Statement: 208 evidence-based conclusions about the disorder. <em>Neuroscience &amp; Biobehavioral
            Reviews, 128</em>, 789–818.
          </p>
          <p className="mb-3">
            <strong>National Institute for Health and Care Excellence.</strong> (2018). <em>Attention deficit
            hyperactivity disorder: Diagnosis and management</em> (NG87).
          </p>
          <p className="mb-0">
            <strong>Shaw, P., Stringaris, A., Nigg, J., &amp; Leibenluft, E.</strong> (2014). Emotion dysregulation in
            attention deficit hyperactivity disorder. <em>American Journal of Psychiatry, 171</em>(3), 276–293.
          </p>
        </div>
      </div>
    </>
  );
}
