import React from 'react';

export default function PatronesCrianzaBlog() {
  return (
    <>
      {/* Introducción principal */}
      <div className="lead mb-5" style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#555' }}>
        Cuando se habla de patrones de crianza, una imagen suele aparecer en nuestras mentes:
        la "crianza estrictamente tradicional". Muchos adultos recuerdan el miedo que sentían
        al escuchar los gritos de padres autoritarios y sus castigos. En el pasado, la lección,
        a menudo, llegaba con una vara. El daño era físico y el respeto se basaba en el temor.
        Por ello, hoy en día, el objetivo para muchas familias es claro:
        <strong> "es vital que este ciclo termine"</strong>.
      </div>


      <hr className="my-5" />

      {/* Sección 1: El castigo físico */}
      <h2 className="section-title" data-aos="fade-up">El Castigo Físico: Una Forma de Violencia</h2>

      <p className="mb-4">
        Es fundamental establecer que el <strong>castigo físico es una forma de violencia contra
        la niñez y adolescencia</strong>; no es una herramienta válida ni efectiva para la educación,
        al menos no a largo plazo. No se debe, bajo ninguna circunstancia, minimizar su impacto.
      </p>

      <div className="alert-info mb-5" data-aos="fade-up">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        El castigo físico (golpes, nalgadas, tirones de orejas o pellizcos) tiene consecuencias serias
        que afectan el desarrollo integral del niño.
      </div>

      {/* IMAGEN 2 - CONSECUENCIAS DEL CASTIGO */}
      {/* PROMPT: "Ilustración conceptual mostrando tres círculos concéntricos representando capas de daño:
          físico (exterior), emocional (medio), y relacional (centro). Tonos de azul oscuro a violeta.
          Estilo minimalista y profesional. Elementos visuales que sugieren dolor sin mostrar violencia
          explícita. Ilustración vectorial moderna." */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/crianza1.webp"
          alt="Consecuencias del castigo físico"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      {/* Consecuencias del castigo físico */}
      <div className="row gy-4 mb-5">
        <div className="col-md-4" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card" style={{ borderLeft: '4px solid #9b59b6' }}>
            <div className="benefit-icon">
              <i className="bi bi-heart-pulse"></i>
            </div>
            <h3>Daño Físico y Psicológico</h3>
            <p>
              Causa dolor y un profundo daño emocional asociado a la ansiedad, depresión y baja autoestima.
            </p>
          </div>
        </div>

        <div className="col-md-4" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card" style={{ borderLeft: '4px solid #9b59b6' }}>
            <div className="benefit-icon">
              <i className="bi bi-exclamation-circle"></i>
            </div>
            <h3>Aprendizaje de la Violencia</h3>
            <p>
              Enseña que la agresión es una forma aceptable de resolver conflictos.
            </p>
          </div>
        </div>

        <div className="col-md-4" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card" style={{ borderLeft: '4px solid #9b59b6' }}>
            <div className="benefit-icon">
              <i className="bi bi-people"></i>
            </div>
            <h3>Deterioro de la Relación</h3>
            <p>
              Disminuye la confianza y el apego seguro con el cuidador.
            </p>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      {/* Sección 2: La voz correctiva invisible */}
      <h2 className="section-title" data-aos="fade-up">La "Voz Correctiva Invisible"</h2>

      <p className="mb-4">
        Que cada vez más familias busquen eliminar los gritos es un avance que merece ser aplaudido.
        Significa romper un ciclo visible de violencia. Sin embargo, aunque se erradique el golpe,
        también es importante analizar esa <strong>"voz correctiva invisible"</strong> que todavía
        lleva huellas de la herencia autoritaria.
      </p>

      <p className="mb-5">
        A veces, al guiar, se crean patrones inflexibles donde se ignora la individualidad del menor:
      </p>

      {/* IMAGEN 3 - PATRONES INVISIBLES */}
      {/* PROMPT: "Ilustración metafórica mostrando siluetas de padres e hijos conectados por líneas
          invisibles en forma de cadenas sutiles. Tonos grises y azules suaves. Ambiente reflexivo
          y contemplativo. Estilo minimalista moderno. Las cadenas deben verse delicadas pero presentes,
          simbolizando patrones heredados." */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/crianza2.webp"
          alt="Patrones invisibles de crianza"
          style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      {/* Ejemplos de patrones invisibles */}
      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card" style={{ borderLeft: '4px solid #9b59b6' }}>
            <div className="benefit-icon">
              <i className="bi bi-briefcase"></i>
            </div>
            <h3>A. Presión por Seguir un Molde</h3>
            <p>
              <em>"Hijo, por tu futuro, lo mejor es que estudies esta carrera, como tu padre".</em>
            </p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card" style={{ borderLeft: '4px solid #9b59b6' }}>
            <div className="benefit-icon">
              <i className="bi bi-gender-ambiguous"></i>
            </div>
            <h3>B. Limitación por Género</h3>
            <p>
              <em>"Hija, por tu seguridad, ciertas cosas no deberías hacerlas".</em>
            </p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card" style={{ borderLeft: '4px solid #9b59b6' }}>
            <div className="benefit-icon">
              <i className="bi bi-emoji-frown"></i>
            </div>
            <h3>C. Invalidación Emocional</h3>
            <p>
              <em>"No llores por eso, sé fuerte. Hay cosas más serias en el mundo".</em>
            </p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
          <div className="benefit-card" style={{ borderLeft: '4px solid #9b59b6' }}>
            <div className="benefit-icon">
              <i className="bi bi-shield-lock"></i>
            </div>
            <h3>D. Control Absoluto</h3>
            <p>
              <em>"Mientras vivas bajo este techo, debes seguir mis consejos sin cuestionar".</em>
            </p>
          </div>
        </div>
      </div>

      <div className="alert-info mb-5" data-aos="fade-up">
        <i className="bi bi-question-circle-fill me-2"></i>
        Si estas situaciones resultan familiares, el patrón solo ha mutado. Se pasó del moretón
        físico a la herida emocional que perdura en el tiempo.
      </div>

      <p className="mb-5" style={{ fontSize: '1.1rem', fontWeight: '500', color: '#333' }}>
        Por ello, la pregunta es honesta:
      </p>

      <hr className="my-5" />

      {/* Sección 3: Patrones que se repiten */}
      <h2 className="section-title" data-aos="fade-up">1. ¿Qué Patrones Seguimos Repitiendo Sin Darnos Cuenta?</h2>

      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card" style={{ borderLeft: '4px solid #9b59b6' }}>
            <div className="benefit-icon">
              <i className="bi bi-heart"></i>
            </div>
            <h3>El Amor Condicional</h3>
            <p>
              La aceptación, el cariño o la atención se otorgan o se retiran en función del
              comportamiento del niño.
            </p>
            <p className="text-muted small mb-0">
              <em>"Si te portas bien, te quiero/te presto atención."</em>
            </p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card" style={{ borderLeft: '4px solid #9b59b6' }}>
            <div className="benefit-icon">
              <i className="bi bi-emoji-frown"></i>
            </div>
            <h3>La Culpa y la Vergüenza</h3>
            <p>
              Se recurre a frases o actitudes que buscan la obediencia generando culpa o vergüenza.
            </p>
            <p className="text-muted small mb-0">
              <em>"Me pones muy triste con tu comportamiento"</em>,
              <em>"Mira qué vergüenza, todos nos están viendo"</em>.
            </p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card" style={{ borderLeft: '4px solid #9b59b6' }}>
            <div className="benefit-icon">
              <i className="bi bi-ban"></i>
            </div>
            <h3>La Regulación Emocional Ausente</h3>
            <p>
              Se ignoran, invalidan o minimizan las emociones del niño, enseñándole que sus
              sentimientos no son seguros o válidos.
            </p>
            <p className="text-muted small mb-0">
              <em>"No es para tanto"</em>, <em>"Deja de llorar"</em>.
            </p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
          <div className="benefit-card" style={{ borderLeft: '4px solid #9b59b6' }}>
            <div className="benefit-icon">
              <i className="bi bi-hand-index"></i>
            </div>
            <h3>El Control Excesivo</h3>
            <p>
              Se utilizan tácticas de manipulación o microgestión para controlar las decisiones y
              el cuerpo del menor, privándolo de autonomía y capacidad de decisión.
            </p>
          </div>
        </div>

        <div className="col-md-12" data-aos="fade-up" data-aos-delay="500">
          <div className="benefit-card" style={{ borderLeft: '4px solid #9b59b6' }}>
            <div className="benefit-icon">
              <i className="bi bi-exclamation-triangle"></i>
            </div>
            <h3>La Amenaza Velada</h3>
            <p>
              Aunque no es un grito, es una advertencia de consecuencias no deseadas que generan ansiedad.
            </p>
            <p className="text-muted small mb-0">
              <em>"Si no recoges tus juguetes, no podremos ir al parque, y será tu culpa."</em>
            </p>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      {/* Sección 4: Estilos de crianza */}
      <h2 className="section-title" data-aos="fade-up">2. ¿Qué Realmente Hacer Para Ser Una Generación Que Genere el Cambio?</h2>

      <p className="mb-4">
        La respuesta a esta interrogante requiere una doble acción. Primero, un <strong>ejercicio de
        honestidad radical</strong> para identificar el estilo de crianza que hemos heredado. Segundo,
        la valentía de implementar un modelo de crianza que sea contrario a lo que vivimos:
        <strong> la Crianza Positiva</strong>.
      </p>

      <h3 className="mt-5 mb-4" data-aos="fade-up">A. Reconocer Qué Estilo de Crianza Tiene</h3>

      {/* IMAGEN 4 - ESTILOS DE CRIANZA */}
      {/* PROMPT: "Ilustración mostrando cuatro cuadrantes con diferentes estilos de crianza:
          democrático (verde cálido), autoritario (rojo), permisivo (amarillo), negligente (gris).
          Cada cuadrante con iconos representativos: balanza para democrático, regla rígida para
          autoritario, mano abierta para permisivo, figura ausente para negligente. Estilo moderno
          y limpio, colores diferenciados por cuadrante." */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/crianza3.webp"
          alt="Estilos de crianza"
          style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="fade-up">
          <div className="benefit-card" style={{ borderLeft: '4px solid #28a745', background: '#d4edda' }}>
            <h3>1. Democrático (Autorizativo) ⭐</h3>
            <p><strong>Afecto:</strong> ALTO | <strong>Límites:</strong> ALTO</p>
            <p className="small">Niños seguros de sí mismos, con buena autoestima, autonomía y habilidad para resolver problemas.</p>
            <p className="small text-muted"><em>"Entiendo que estés molesto por el límite, pero la regla es clara. Hablemos de cómo te sientes."</em></p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up">
          <div className="benefit-card" style={{ borderLeft: '4px solid #dc3545', background: '#f8d7da' }}>
            <h3>2. Autoritario</h3>
            <p><strong>Afecto:</strong> BAJO | <strong>Límites:</strong> ALTO</p>
            <p className="small">Niños obedientes, pero inseguros, con baja iniciativa y dependencia de la aprobación ajena.</p>
            <p className="small text-muted"><em>"No me interesa tu opinión. Lo haces porque yo lo digo y punto."</em></p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up">
          <div className="benefit-card" style={{ borderLeft: '4px solid #ffc107', background: '#fff3cd' }}>
            <h3>3. Permisivo (Indulgente)</h3>
            <p><strong>Afecto:</strong> ALTO | <strong>Límites:</strong> BAJO</p>
            <p className="small">Niños impulsivos, con baja tolerancia a la frustración y dificultad para seguir normas.</p>
            <p className="small text-muted"><em>"Ay, no te preocupes por el desorden, ya lo recojo yo. Lo importante es que estés tranquilo."</em></p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up">
          <div className="benefit-card" style={{ borderLeft: '4px solid #6c757d', background: '#e2e3e5' }}>
            <h3>4. Negligente (Ausente)</h3>
            <p><strong>Afecto:</strong> BAJO | <strong>Límites:</strong> BAJO</p>
            <p className="small">Niños inseguros que a menudo buscan afecto y atención fuera del hogar, con baja autoestima.</p>
            <p className="small text-muted"><em>"No tengo tiempo para esto ahora. Arréglalo tú solo."</em></p>
          </div>
        </div>
      </div>

      <div className="alert-info mb-5" data-aos="fade-up">
        <i className="bi bi-lightbulb-fill me-2"></i>
        Como se puede observar, el modelo que más se ajusta a las necesidades de los niños y adolescentes
        para su óptimo desarrollo es el <strong>estilo democrático o crianza positiva</strong>.
      </div>

      <hr className="my-5" />

      {/* Sección 5: Mitos vs Verdades */}
      <h4 className="mt-5 mb-4" data-aos="fade-up">Desmontando Mitos Sobre la Crianza Positiva</h4>

      <p className="mb-4">
        Antes de implementar un cambio, es crucial desmantelar las ideas erróneas que a menudo
        confunden a los padres:
      </p>

      {/* IMAGEN 5 - MITOS */}
      {/* PROMPT: "Ilustración conceptual mostrando dos lados: un lado con una X roja (mitos) y otro
          lado con un check verde (verdades). Estilo limpio y moderno. Elementos visuales que representen
          malentendidos vs realidad. Colores: rojo para mitos, verde para verdades. Ilustración
          vectorial profesional con iconos simples." */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/crianza4.webp"
          alt="Mitos y verdades sobre crianza positiva"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <div className="row gy-3 mb-5">
        <div className="col-md-6" data-aos="fade-up">
          <div style={{ background: '#f8d7da', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #dc3545' }}>
            <h4 className="mb-2"><i className="bi bi-x-circle-fill me-2" style={{ color: '#dc3545' }}></i>MITO</h4>
            <p className="mb-0">La Crianza Positiva significa que los niños hacen lo que quieren y no tienen límites.</p>
          </div>
        </div>
        <div className="col-md-6" data-aos="fade-up">
          <div style={{ background: '#d4edda', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #28a745' }}>
            <h4 className="mb-2"><i className="bi bi-check-circle-fill me-2" style={{ color: '#28a745' }}></i>VERDAD</h4>
            <p className="mb-0">La Crianza Positiva se basa en <strong>límites claros y una estructura firme</strong>. La diferencia es que los límites se explican y se establecen con respeto, no con temor.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up">
          <div style={{ background: '#f8d7da', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #dc3545' }}>
            <h4 className="mb-2"><i className="bi bi-x-circle-fill me-2" style={{ color: '#dc3545' }}></i>MITO</h4>
            <p className="mb-0">La Crianza Positiva es demasiado blanda y crea adultos malcriados.</p>
          </div>
        </div>
        <div className="col-md-6" data-aos="fade-up">
          <div style={{ background: '#d4edda', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #28a745' }}>
            <h4 className="mb-2"><i className="bi bi-check-circle-fill me-2" style={{ color: '#28a745' }}></i>VERDAD</h4>
            <p className="mb-0">Los niños criados con firmeza y afecto suelen ser <strong>más competentes, independientes y desarrollan mejores habilidades sociales</strong>, ya que aprenden a regularse internamente.</p>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      {/* Sección 6: Herramientas de crianza positiva */}
      <h3 className="mt-5 mb-4" data-aos="fade-up">B. Implementar Acciones Comprometidas con un Estilo de Crianza Positiva</h3>

      <p className="mb-4">
        El cambio en la crianza no ocurre por leer mucha teoría, sino por <strong>ajustar la forma
        en la que reaccionamos en los momentos de tensión</strong>. Aquí se brindan algunas herramientas
        concretas para aplicar cuando la situación se pone difícil:
      </p>

      {/* IMAGEN 6 - HERRAMIENTAS */}
      {/* PROMPT: "Ilustración mostrando una caja de herramientas abierta con íconos flotando:
          pausa/respiración, diálogo, balanza (consecuencias lógicas), opciones/caminos.
          Colores vibrantes y cálidos: verdes, azules y naranjas. Estilo amigable y accesible.
          Ilustración vectorial moderna que transmita soluciones prácticas." */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/crianza5.webp"
          alt="Herramientas de crianza positiva"
          style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card" style={{ borderLeft: '4px solid #c263f9' }}>
            <div className="benefit-icon">
              <i className="bi bi-pause-circle"></i>
            </div>
            <h3>1. Pausa y Autocontrol</h3>
            <p className="mb-2">
              Antes de que se lance un grito o una amenaza de la que uno se pueda arrepentir,
              procure hacer una pausa.
            </p>
            <p className="mb-2">
              <em>"Ahora mismo estoy muy molesto para resolver esto bien. Voy a tomar aire y en
              unos minutos regresamos al tema".</em>
            </p>
            <p className="text-muted small">
              <strong>Por qué sirve:</strong> Evitamos el sentimiento de culpa posterior y les
              enseña, con hechos a sus hijos, que el enojo no es permiso para agredir.
            </p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card" style={{ borderLeft: '4px solid #c263f9' }}>
            <div className="benefit-icon">
              <i className="bi bi-chat-dots"></i>
            </div>
            <h3>2. La Técnica de la "Descripción"</h3>
            <p className="mb-2">
              Cuando los hijos dejan un desastre o fallan en algo, solemos atacar su personalidad
              (<em>"eres un flojo"</em>, <em>"qué desordenado"</em>). Puede probar con solo describir
              lo que ve:
            </p>
            <ul className="mb-2">
              <li><em>"Veo los platos sucios en la mesa y es hora de dormir".</em></li>
              <li><em>"Veo que la tarea aún no se ha empezado".</em></li>
            </ul>
            <p className="text-muted small">
              <strong>Por qué sirve:</strong> Al no sentirse atacados, hay menos resistencia para
              corregir el error. El problema es la acción, no ellos.
            </p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card" style={{ borderLeft: '4px solid #9b59b6' }}>
            <div className="benefit-icon">
              <i className="bi bi-balance-scale"></i>
            </div>
            <h3>3. Consecuencias con Lógica</h3>
            <p className="mb-2">
              Para que un hijo aprenda, la consecuencia debe tener relación directa con lo que pasó.
            </p>
            <ul className="mb-2">
              <li><strong>Si es niño:</strong> Si tiró el jugo al suelo a propósito, la consecuencia
              no es quitarle la tablet, es que te ayude a limpiar.</li>
              <li><strong>Si es adolescente:</strong> Si llegó tarde y no avisó, la consecuencia es
              que la próxima salida será más corta o bajo supervisión, porque necesita recuperar su
              confianza.</li>
            </ul>
            <p className="text-muted small">
              <strong>Regla de oro:</strong> Si la consecuencia no tiene lógica, el hijo solo siente
              que te estás vengando, no que está aprendiendo.
            </p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
          <div className="benefit-card" style={{ borderLeft: '4px solid #c263f9' }}>
            <div className="benefit-icon">
              <i className="bi bi-signpost-split"></i>
            </div>
            <h3>4. Lenguaje de Opciones y Acuerdos</h3>
            <p className="mb-2">
              A ninguna persona le gusta que lo manden como si fuera un subordinado. Dar opciones
              dentro de tus límites reduce las luchas de poder.
            </p>
            <ul className="mb-2">
              <li><strong>Con niños:</strong> <em>"¿Prefieres bañarte ahora o en 5 minutos? Tú eliges".</em></li>
              <li><strong>Con adolescentes:</strong> <em>"Entiendo que quieres estar en el celular, pero
              tenemos este pendiente. ¿Prefieres hacerlo ahorita o después de cenar? Si es después de
              cenar, el compromiso es que el teléfono se queda fuera de la mesa".</em></li>
            </ul>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      {/* Sección 7: Guía rápida */}
      <h3 className="mt-5 mb-4" data-aos="fade-up">C. Guía Rápida: ¿Qué Decir Cuando Estás a Punto de Estallar?</h3>

      {/* IMAGEN 7 - COMUNICACIÓN */}
      {/* PROMPT: "Ilustración de una familia en conversación calmada: padre/madre arrodillado a la
          altura del niño, manteniendo contacto visual. Ambiente tranquilo con tonos azules suaves
          y verdes. Burbujas de diálogo mostrando comunicación respetuosa. Estilo ilustración digital
          cálida y empática, luz natural suave." */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/crianza6.webp"
          alt="Comunicación efectiva con los hijos"
          style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <div className="row gy-4 mb-5">
        <div className="col-12" data-aos="fade-up">
          <div className="benefit-card">
            <h4 className="mb-3"><i className="bi bi-chat-dots me-2" style={{ color: '#9b59b6' }}></i>Te faltan al respeto</h4>
            <div className="row">
              <div className="col-md-6">
                <div style={{ background: '#d4edda', padding: '1rem', borderRadius: '8px', marginBottom: '0.5rem' }}>
                  <strong><i className="bi bi-check-circle me-1" style={{ color: '#28a745' }}></i>Intenta:</strong>
                  <p className="mb-0 mt-2 small"><em>"No voy a discutir mientras me hables así. Hablamos cuando bajes el tono."</em></p>
                </div>
              </div>
              <div className="col-md-6">
                <div style={{ background: '#f8d7da', padding: '1rem', borderRadius: '8px' }}>
                  <strong><i className="bi bi-x-circle me-1" style={{ color: '#dc3545' }}></i>Evita:</strong>
                  <p className="mb-0 mt-2 small"><em>"¡A mí no me hablas así o te vas a arrepentir!"</em></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12" data-aos="fade-up">
          <div className="benefit-card">
            <h4 className="mb-3"><i className="bi bi-person-x me-2" style={{ color: '#9b59b6' }}></i>No quieren cooperar</h4>
            <div className="row">
              <div className="col-md-6">
                <div style={{ background: '#d4edda', padding: '1rem', borderRadius: '8px', marginBottom: '0.5rem' }}>
                  <strong><i className="bi bi-check-circle me-1" style={{ color: '#28a745' }}></i>Intenta:</strong>
                  <p className="mb-0 mt-2 small"><em>"Necesito tu ayuda con esto. ¿Cómo nos organizamos para que termines rápido?"</em></p>
                </div>
              </div>
              <div className="col-md-6">
                <div style={{ background: '#f8d7da', padding: '1rem', borderRadius: '8px' }}>
                  <strong><i className="bi bi-x-circle me-1" style={{ color: '#dc3545' }}></i>Evita:</strong>
                  <p className="mb-0 mt-2 small"><em>"¡Hazlo porque yo lo digo y punto!"</em></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12" data-aos="fade-up">
          <div className="benefit-card">
            <h4 className="mb-3"><i className="bi bi-emoji-frown me-2" style={{ color: '#9b59b6' }}></i>Están en plena crisis</h4>
            <div className="row">
              <div className="col-md-6">
                <div style={{ background: '#d4edda', padding: '1rem', borderRadius: '8px', marginBottom: '0.5rem' }}>
                  <strong><i className="bi bi-check-circle me-1" style={{ color: '#28a745' }}></i>Intenta:</strong>
                  <p className="mb-0 mt-2 small"><em>"Veo que estás muy enojado. Aquí estoy cerca para cuando estés listo para calmarte."</em></p>
                </div>
              </div>
              <div className="col-md-6">
                <div style={{ background: '#f8d7da', padding: '1rem', borderRadius: '8px' }}>
                  <strong><i className="bi bi-x-circle me-1" style={{ color: '#dc3545' }}></i>Evita:</strong>
                  <p className="mb-0 mt-2 small"><em>"¡Ya deja de llorar por esa tontería!"</em></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      {/* Conclusión */}
      <h2 className="section-title" data-aos="fade-up">La Importancia de Reparar</h2>

      <div className="lead mb-4" style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#555' }}>
        La crianza no es un proceso lineal y la paciencia tiene límites. Habrá días en los que el
        estrés gane la partida y se pierda la calma; en esos momentos, lo más valioso es la
        <strong> capacidad de reparar</strong>.
      </div>

      {/* IMAGEN 8 - REPARACIÓN */}
      {/* PROMPT: "Ilustración emotiva mostrando a un padre/madre abrazando a su hijo después de un
          conflicto, con luz cálida del atardecer entrando por una ventana. Ambiente de reconciliación
          y amor. Tonos dorados, naranjas y rosas suaves. Estilo ilustración digital profesional,
          emotiva y esperanzadora. Expresiones faciales de alivio y conexión." */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/crianza7.webp"
          alt="La importancia de reparar la relación"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <p className="mb-4">
        Acercarse, reconocer el error y pedir una disculpa honesta no resta autoridad a los padres,
        sino que los humaniza. Les enseña a los hijos que los errores se asumen y que
        <strong> proteger el vínculo es siempre más importante que tener la razón</strong>.
      </p>

      <div className="alert-info mb-5" data-aos="fade-up">
        <i className="bi bi-heart-fill me-2"></i>
        Romper el círculo de la crianza autoritaria no significa ser perfecto. Significa ser consciente,
        estar dispuesto a aprender y tener el coraje de hacer las cosas diferente, un día a la vez.
      </div>

      <hr className="my-5" />

     
    </>
  );
}
