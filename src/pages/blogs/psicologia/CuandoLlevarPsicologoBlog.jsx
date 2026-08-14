import React from 'react';

export default function CuandoLlevarPsicologoBlog() {
  return (
    <>
      {/* Introducción principal */}
      <div className="lead mb-5" style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#555' }}>
        El desarrollo infantil implica cambios a nivel emocional, social, cognitivo y conductual.
        Durante este proceso es esperable que los niños atraviesen momentos de frustración, miedo,
        cambios de humor o dificultades para adaptarse a nuevas situaciones. Sin embargo, en algunos
        casos, ciertas conductas pueden intensificarse hasta interferir con el bienestar del niño y su
        funcionamiento diario, convirtiéndose en <strong>señales de que podría beneficiarse de un
        acompañamiento profesional</strong>.
      </div>

      <div className="alert-info mb-5" data-aos="fade-up">
        <i className="bi bi-info-circle-fill me-2"></i>
        Llevar a un niño al psicólogo no significa necesariamente que exista un trastorno. La evaluación
        psicológica permite comprender qué está ocurriendo, identificar fortalezas, detectar necesidades
        y brindar estrategias adecuadas para favorecer su bienestar.
      </div>

      {/* IMAGEN 1 - PORTADA */}
      {/* PROMPT: "Ilustración cálida y profesional de una psicóloga infantil acompañando a un niño en
          un espacio de juego luminoso con juguetes, cojines y colores suaves (azules, verdes y tonos
          pastel). Ambiente seguro y amable, sin estereotipos clínicos. Estilo ilustración digital moderna,
          empática, luz natural." */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/psicologo-nino-portada.webp"
          alt="¿Cuándo llevar a mi hijo al psicólogo?"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <hr className="my-5" />

      {/* Sección: qué observar */}
      <h2 className="section-title" data-aos="fade-up">¿Qué situaciones pueden indicar la necesidad de una evaluación?</h2>

      <p className="mb-4">
        Es importante no considerar una conducta de forma aislada, sino observar varios aspectos en
        conjunto antes de sacar conclusiones:
      </p>

      <div className="row gy-4 mb-5">
        <div className="col-md-4" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card" style={{ borderLeft: '4px solid #9b59b6' }}>
            <div className="benefit-icon"><i className="bi bi-graph-up-arrow"></i></div>
            <h3>Intensidad</h3>
            <p>Qué tan fuerte es la dificultad cuando aparece.</p>
          </div>
        </div>
        <div className="col-md-4" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card" style={{ borderLeft: '4px solid #9b59b6' }}>
            <div className="benefit-icon"><i className="bi bi-arrow-repeat"></i></div>
            <h3>Frecuencia</h3>
            <p>Con qué regularidad se presenta la conducta.</p>
          </div>
        </div>
        <div className="col-md-4" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card" style={{ borderLeft: '4px solid #9b59b6' }}>
            <div className="benefit-icon"><i className="bi bi-clock-history"></i></div>
            <h3>Tiempo</h3>
            <p>Cuánto lleva presente esa dificultad.</p>
          </div>
        </div>
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
          <div className="benefit-card" style={{ borderLeft: '4px solid #9b59b6' }}>
            <div className="benefit-icon"><i className="bi bi-people"></i></div>
            <h3>Impacto</h3>
            <p>Cómo afecta su vida familiar, escolar o social.</p>
          </div>
        </div>
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="500">
          <div className="benefit-card" style={{ borderLeft: '4px solid #9b59b6' }}>
            <div className="benefit-icon"><i className="bi bi-shuffle"></i></div>
            <h3>Cambio</h3>
            <p>Si representa un cambio respecto a su comportamiento habitual.</p>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      {/* Sección: 0 a 5 años */}
      <h2 className="section-title" data-aos="fade-up">Señales de alerta en niños de 0 a 5 años</h2>

      <p className="mb-4">
        Durante los primeros años se desarrollan habilidades fundamentales como la comunicación, la
        regulación emocional, la interacción social y la autonomía. Algunas señales que pueden justificar
        una consulta son:
      </p>

      {/* IMAGEN 2 - PRIMERA INFANCIA */}
      {/* PROMPT: "Ilustración de un niño pequeño (2-4 años) jugando en el suelo con bloques, mientras un
          adulto intenta interactuar a su lado. Escena tierna que sugiere comunicación temprana. Tonos
          suaves verdes y azules. Estilo ilustración vectorial moderna y cálida." */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/psicologo-0-5.webp"
          alt="Señales de alerta en niños de 0 a 5 años"
          style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <h3 className="mt-5 mb-4" data-aos="fade-up">Dificultades en la comunicación e interacción</h3>

      <div className="row gy-4 mb-5">
        <div className="col-md-4" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card" style={{ borderLeft: '4px solid #c263f9' }}>
            <div className="benefit-icon"><i className="bi bi-chat-heart"></i></div>
            <h3>Poca intención de comunicarse</h3>
            <p>Muestra poco interés por compartir experiencias o actividades con otras personas.</p>
            <p className="text-muted small mb-0"><em>Ej.: encuentra un juguete que le gusta, pero sigue jugando solo sin buscar mostrarlo ni compartir el momento con sus cuidadores.</em></p>
          </div>
        </div>
        <div className="col-md-4" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card" style={{ borderLeft: '4px solid #c263f9' }}>
            <div className="benefit-icon"><i className="bi bi-person-raised-hand"></i></div>
            <h3>Dificultad para responder a la interacción</h3>
            <p>Le cuesta de forma frecuente responder a intentos de comunicación o interacción.</p>
            <p className="text-muted small mb-0"><em>Ej.: el adulto le dice “¡Mira lo que encontré!”, pero continúa con su actividad sin responder ni mostrar interés.</em></p>
          </div>
        </div>
        <div className="col-md-4" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card" style={{ borderLeft: '4px solid #c263f9' }}>
            <div className="benefit-icon"><i className="bi bi-hourglass-split"></i></div>
            <h3>Retrasos significativos para su edad</h3>
            <p>Dificultades importantes en habilidades de comunicación o autonomía esperadas para su etapa.</p>
            <p className="text-muted small mb-0"><em>Ej.: un niño de 3 años presenta dificultades importantes para expresar lo que necesita con palabras o gestos.</em></p>
          </div>
        </div>
      </div>

      <h3 className="mt-5 mb-4" data-aos="fade-up">Dificultades emocionales y conductuales</h3>

      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card" style={{ borderLeft: '4px solid #9b59b6' }}>
            <div className="benefit-icon"><i className="bi bi-emoji-angry"></i></div>
            <h3>Rabietas muy intensas o frecuentes</h3>
            <p>Las rabietas son parte del desarrollo, pero requieren atención cuando son muy intensas, frecuentes o afectan la vida cotidiana.</p>
            <p className="text-muted small mb-0"><em>Ej.: responde con crisis intensas, agresividad, ruptura de objetos o dificultad prolongada para recuperar la calma.</em></p>
          </div>
        </div>
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card" style={{ borderLeft: '4px solid #9b59b6' }}>
            <div className="benefit-icon"><i className="bi bi-emoji-dizzy"></i></div>
            <h3>Dificultad marcada para calmarse</h3>
            <p>Necesita mucho apoyo para recuperar la tranquilidad después de sentirse molesto, triste o frustrado.</p>
            <p className="text-muted small mb-0"><em>Ej.: al apagar la televisión permanece llorando o alterado durante un tiempo prolongado, pese al acompañamiento del adulto.</em></p>
          </div>
        </div>
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card" style={{ borderLeft: '4px solid #9b59b6' }}>
            <div className="benefit-icon"><i className="bi bi-moon-stars"></i></div>
            <h3>Cambios en conducta, sueño o alimentación</h3>
            <p>Modificaciones significativas respecto a su comportamiento habitual.</p>
            <p className="text-muted small mb-0"><em>Ej.: aparecen dificultades para dormir, alteraciones en la alimentación o cambios marcados en su conducta diaria.</em></p>
          </div>
        </div>
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
          <div className="benefit-card" style={{ borderLeft: '4px solid #9b59b6' }}>
            <div className="benefit-icon"><i className="bi bi-exclamation-circle"></i></div>
            <h3>Reacciones desproporcionadas</h3>
            <p>La respuesta emocional es mucho más intensa de lo esperado para la situación.</p>
            <p className="text-muted small mb-0"><em>Ej.: ante pequeños inconvenientes responde tirando objetos, golpeando o abandonando actividades con frecuencia.</em></p>
          </div>
        </div>
      </div>

      <div className="alert-info mb-5" data-aos="fade-up">
        <i className="bi bi-lightbulb-fill me-2"></i>
        Algunas conductas pueden formar parte del desarrollo normal; por eso la evaluación profesional
        analiza cada caso considerando la <strong>edad y el contexto</strong> del niño.
      </div>

      <hr className="my-5" />

      {/* Sección: 6 a 12 años */}
      <h2 className="section-title" data-aos="fade-up">Señales de alerta en niños de 6 a 12 años</h2>

      <p className="mb-4">
        Durante la etapa escolar pueden aparecer dificultades relacionadas con el aprendizaje, las
        emociones, la conducta y las relaciones sociales.
      </p>

      {/* IMAGEN 3 - ETAPA ESCOLAR */}
      {/* PROMPT: "Ilustración de un niño en edad escolar (7-10 años) con mochila y útiles, con expresión
          pensativa, en un entorno de colegio suave y amable. Transmite emociones escolares sin dramatismo.
          Tonos azules y verdes. Estilo ilustración digital moderna y respetuosa." */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/psicologo-6-12.webp"
          alt="Señales de alerta en niños de 6 a 12 años"
          style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <h3 className="mt-5 mb-4" data-aos="fade-up">Área emocional</h3>
      <div className="row gy-4 mb-5">
        <div className="col-md-4" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card" style={{ borderLeft: '4px solid #c263f9' }}>
            <div className="benefit-icon"><i className="bi bi-emoji-neutral"></i></div>
            <h3>Miedos o preocupaciones excesivas</h3>
            <p>Evita exposiciones, separarse de sus padres o actividades nuevas por miedo intenso a equivocarse o a que ocurra algo malo.</p>
          </div>
        </div>
        <div className="col-md-4" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card" style={{ borderLeft: '4px solid #c263f9' }}>
            <div className="benefit-icon"><i className="bi bi-cloud-rain"></i></div>
            <h3>Tristeza frecuente</h3>
            <p>Durante varias semanas se muestra triste, pierde interés por jugar o deja de disfrutar lo que antes le gustaba.</p>
          </div>
        </div>
        <div className="col-md-4" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card" style={{ borderLeft: '4px solid #c263f9' }}>
            <div className="benefit-icon"><i className="bi bi-emoji-frown"></i></div>
            <h3>Baja valoración personal</h3>
            <p>Expresa con frecuencia frases como <em>“soy malo”</em>, <em>“no puedo hacerlo”</em> o <em>“nada me sale bien”</em>.</p>
          </div>
        </div>
      </div>

      <h3 className="mt-5 mb-4" data-aos="fade-up">Área conductual</h3>
      <div className="row gy-4 mb-5">
        <div className="col-md-4" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card" style={{ borderLeft: '4px solid #9b59b6' }}>
            <div className="benefit-icon"><i className="bi bi-lightning-charge"></i></div>
            <h3>Dificultad para controlar impulsos</h3>
            <p>Interrumpe constantemente, actúa sin medir consecuencias o toma objetos sin pedir permiso.</p>
          </div>
        </div>
        <div className="col-md-4" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card" style={{ borderLeft: '4px solid #9b59b6' }}>
            <div className="benefit-icon"><i className="bi bi-sign-stop"></i></div>
            <h3>Problemas para seguir normas</h3>
            <p>Ante un límite como “es hora de guardar los juguetes”, responde con oposición intensa de manera frecuente.</p>
          </div>
        </div>
        <div className="col-md-4" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card" style={{ borderLeft: '4px solid #9b59b6' }}>
            <div className="benefit-icon"><i className="bi bi-x-octagon"></i></div>
            <h3>Conductas agresivas recurrentes</h3>
            <p>Golpea, empuja, insulta o rompe objetos cuando se siente molesto.</p>
          </div>
        </div>
      </div>

      <h3 className="mt-5 mb-4" data-aos="fade-up">Área social y escolar</h3>
      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card" style={{ borderLeft: '4px solid #c263f9' }}>
            <div className="benefit-icon"><i className="bi bi-people"></i></div>
            <h3>Dificultades con compañeros</h3>
            <p>Conflictos frecuentes en los juegos o dificultad para relacionarse y participar con otros niños.</p>
          </div>
        </div>
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card" style={{ borderLeft: '4px solid #c263f9' }}>
            <div className="benefit-icon"><i className="bi bi-person-standing"></i></div>
            <h3>Aislamiento social</h3>
            <p>Prefiere estar solo durante el recreo o evita actividades grupales.</p>
          </div>
        </div>
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card" style={{ borderLeft: '4px solid #c263f9' }}>
            <div className="benefit-icon"><i className="bi bi-graph-down-arrow"></i></div>
            <h3>Descenso del rendimiento</h3>
            <p>Antes hacía sus tareas y comienza a presentar dificultades para concentrarse o completar actividades escolares.</p>
          </div>
        </div>
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
          <div className="benefit-card" style={{ borderLeft: '4px solid #c263f9' }}>
            <div className="benefit-icon"><i className="bi bi-door-closed"></i></div>
            <h3>Rechazo a asistir al colegio</h3>
            <p>Llora, presenta ansiedad o busca evitar asistir a clases de manera repetida.</p>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      {/* Sección: adolescentes */}
      <h2 className="section-title" data-aos="fade-up">Señales de alerta en adolescentes</h2>

      <p className="mb-4">
        La adolescencia se caracteriza por cambios emocionales y búsqueda de autonomía. Algunas
        variaciones del estado de ánimo son esperables; sin embargo, requieren mayor atención cuando son
        <strong> persistentes o afectan el funcionamiento diario</strong>.
      </p>

      {/* IMAGEN 4 - ADOLESCENCIA */}
      {/* PROMPT: "Ilustración de un adolescente pensativo mirando por una ventana, con auriculares,
          ambiente introspectivo pero no sombrío. Luz suave de tarde, tonos azules y morados tenues.
          Estilo ilustración digital moderna, respetuosa y esperanzadora." */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/psicologo-adolescentes.webp"
          alt="Señales de alerta en adolescentes"
          style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card" style={{ borderLeft: '4px solid #9b59b6' }}>
            <div className="benefit-icon"><i className="bi bi-person-x"></i></div>
            <h3>Aislamiento prolongado</h3>
            <p>Antes disfrutaba salir o conversar con su familia y comienza a encerrarse y evitar actividades sociales durante semanas.</p>
          </div>
        </div>
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card" style={{ borderLeft: '4px solid #9b59b6' }}>
            <div className="benefit-icon"><i className="bi bi-battery-half"></i></div>
            <h3>Pérdida de interés</h3>
            <p>Deja de participar en actividades que antes disfrutaba: deportes, amigos o actividades escolares.</p>
          </div>
        </div>
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card" style={{ borderLeft: '4px solid #9b59b6' }}>
            <div className="benefit-icon"><i className="bi bi-moon"></i></div>
            <h3>Cambios en sueño o alimentación</h3>
            <p>Dificultades para dormir, dormir mucho más de lo habitual o cambios importantes en la alimentación.</p>
          </div>
        </div>
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
          <div className="benefit-card" style={{ borderLeft: '4px solid #9b59b6' }}>
            <div className="benefit-icon"><i className="bi bi-cloud-drizzle"></i></div>
            <h3>Sensación de desesperanza</h3>
            <p>Frases como <em>“nada va a mejorar”</em>, <em>“no tiene sentido intentarlo”</em> o <em>“nunca voy a lograr nada”</em>.</p>
          </div>
        </div>
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="500">
          <div className="benefit-card" style={{ borderLeft: '4px solid #9b59b6' }}>
            <div className="benefit-icon"><i className="bi bi-emoji-angry"></i></div>
            <h3>Dificultad para manejar emociones</h3>
            <p>Explosiones frecuentes de ira, llanto intenso, ansiedad elevada o reacciones difíciles de controlar.</p>
          </div>
        </div>
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="600">
          <div className="benefit-card" style={{ borderLeft: '4px solid #9b59b6' }}>
            <div className="benefit-icon"><i className="bi bi-exclamation-triangle"></i></div>
            <h3>Conductas de riesgo</h3>
            <p>Conductas impulsivas frecuentes, exposición a situaciones peligrosas, consumo de sustancias o peleas recurrentes.</p>
          </div>
        </div>
      </div>

      {/* Alerta crítica: autolesiones / suicidio */}
      <div className="warning-box mb-5" data-aos="fade-up">
        <i className="bi bi-exclamation-octagon-fill"></i>
        <div>
          <p className="mb-2"><strong>Señales que requieren ayuda inmediata:</strong></p>
          <p className="mb-2">
            Expresiones relacionadas con hacerse daño o no querer vivir, como <em>“quisiera no despertar”</em>,
            <em> “ya no puedo más”</em> o <em>“sería mejor no estar aquí”</em>, o la presencia de lesiones
            intencionales en su cuerpo.
          </p>
          <p className="mb-0">
            Ante cualquier señal relacionada con autolesiones o ideas suicidas, <strong>busque ayuda
            profesional de manera inmediata</strong>.
          </p>
        </div>
      </div>

      <hr className="my-5" />

      {/* Sección: evaluación psicológica */}
      <h2 className="section-title" data-aos="fade-up">¿Qué ocurre durante una evaluación psicológica infantil?</h2>

      <p className="mb-4">
        La evaluación busca comprender al niño desde una <strong>mirada integral</strong>. Suele incluir:
      </p>

      {/* IMAGEN 5 - EVALUACIÓN */}
      {/* PROMPT: "Ilustración de una sesión de evaluación psicológica infantil: profesional tomando notas
          mientras un niño juega con material didáctico y los padres conversan al lado. Ambiente cálido y
          confidencial. Tonos verdes y crema. Estilo ilustración digital profesional y amable." */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/psicologo-evaluacion.webp"
          alt="Qué ocurre durante una evaluación psicológica infantil"
          style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <div className="row gy-4 mb-5">
        <div className="col-md-4" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card" style={{ borderLeft: '4px solid #c263f9' }}>
            <div className="benefit-icon"><i className="bi bi-chat-square-text"></i></div>
            <h3>Entrevista con los cuidadores</h3>
            <p>Permite conocer la historia del desarrollo, antecedentes familiares, contexto escolar y social, y el motivo de consulta.</p>
          </div>
        </div>
        <div className="col-md-4" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card" style={{ borderLeft: '4px solid #c263f9' }}>
            <div className="benefit-icon"><i className="bi bi-eye"></i></div>
            <h3>Observación clínica</h3>
            <p>Se analiza su forma de comunicarse, la regulación emocional, el juego, la interacción y su respuesta ante distintas situaciones.</p>
          </div>
        </div>
        <div className="col-md-4" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card" style={{ borderLeft: '4px solid #c263f9' }}>
            <div className="benefit-icon"><i className="bi bi-clipboard2-check"></i></div>
            <h3>Instrumentos psicológicos</h3>
            <p>Cuando es necesario, pruebas estandarizadas para evaluar desarrollo cognitivo, atención, conducta, emociones y habilidades adaptativas.</p>
          </div>
        </div>
      </div>

      <div className="alert-info mb-5" data-aos="fade-up">
        <i className="bi bi-clipboard-data-fill me-2"></i>
        Los resultados siempre deben interpretarse <strong>junto con la historia clínica y la observación
        profesional</strong>, nunca de forma aislada.
      </div>

      <hr className="my-5" />

      {/* Conclusión */}
      <h2 className="section-title" data-aos="fade-up">¿Esperar o consultar?</h2>

      <div className="lead mb-4" style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#555' }}>
        Una consulta psicológica <strong>temprana</strong> puede ser una oportunidad para fortalecer
        habilidades emocionales y prevenir que las dificultades se mantengan o aumenten. Buscar orientación
        permite a los padres comprender mejor las necesidades de su hijo y aprender estrategias de
        acompañamiento más efectivas.
      </div>

      <div className="alert-info mb-5" data-aos="fade-up">
        <i className="bi bi-heart-fill me-2"></i>
        La salud mental infantil también forma parte del desarrollo integral del niño.
      </div>

      {/* Referencias */}
      <h4 className="mt-5 mb-3" data-aos="fade-up">Referencias bibliográficas (APA 7.ª edición)</h4>
      <div className="text-muted small mb-5" style={{ lineHeight: '1.9' }} data-aos="fade-up">
        <p className="mb-2">American Psychiatric Association. (2022). <em>Diagnostic and statistical manual of mental disorders</em> (5th ed., text rev.; DSM-5-TR). American Psychiatric Association Publishing.</p>
        <p className="mb-2">Centers for Disease Control and Prevention. (2024). <em>Positive parenting tips: Child development.</em></p>
        <p className="mb-2">World Health Organization. (2022). <em>World mental health report: Transforming mental health for all.</em> World Health Organization.</p>
        <p className="mb-0">Shonkoff, J. P., &amp; Garner, A. S. (2012). The lifelong effects of early childhood adversity and toxic stress. <em>Pediatrics, 129</em>(1), e232–e246.</p>
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

    </>
  );
}
