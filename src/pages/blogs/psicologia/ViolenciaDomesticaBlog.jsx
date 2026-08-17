import React from 'react';

export default function ViolenciaDomesticaBlog() {
  return (
    <>
      {/* Introducción principal */}
      <div className="lead mb-5" style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#555' }}>
        A muchos adultos mayores la vida no les pesa por los años, sino por las historias que han
        cargado desde la infancia: silencios impuestos, miedos aprendidos, sacrificios exigidos y una
        forma de amar marcada por el deber. La violencia familiar rara vez desaparece con el tiempo.
        No se disuelve ni se elimina; por el contrario, se integra en la forma de pensar, de sentir y de
        relacionarse.
      </div>

      {/* Imagen placeholder 1 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/violencia 1.webp"
          alt="Adultos mayores reflexionando sobre su historia"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <p className="mb-5">
        En la adultez mayor, cuando la persona debería encontrar calma, estas huellas se hacen más evidentes:
        límites difusos, culpa, alerta constante y un cansancio emocional que no proviene de la edad, sino de
        una vida entera de adaptación y supervivencia. Lo que no recibió nombre ni atención en su momento,
        se ha transformado en un estilo de vida, que acompañan a estas personas en un momento donde necesitan
        sentir descanso y protección.
      </p>

      <div className="alert-info mb-5" data-aos="fade-up">
        <i className="bi bi-info-circle-fill me-2"></i>
        Se puede decir que la violencia se transforma en una herencia invisible que sigue
        acompañando y perpetuándose en la vida de nuestros adultos mayores y es importante hablar de ello.
      </div>

      <hr className="my-5" />

      {/* Sección 1: La herencia invisible del miedo */}
      <h2 className="section-title" data-aos="fade-up">La herencia invisible del miedo</h2>

      <p className="mb-4">
        La cara oculta de la violencia deja marcas profundas: patrones de miedo, alerta constante,
        desconfianza y una forma de amar basada en la obediencia y el deber.
      </p>

      <p className="mb-5">
        Lo que para algunos resulta inaceptable, para otros fue la única opción posible. Hogares inseguros,
        control excesivo, indiferencia, palabras que humillan y golpes que dejan cicatrices. Experiencias
        que moldearon la manera de sentir, pensar y vincularse, incluso décadas después.
      </p>

      {/* Imagen placeholder 2 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/violencia2.webp"
          alt="La herencia invisible del miedo - Memoria emocional en adultos mayores"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <p className="mb-5">
        Pero esta herencia no siempre es evidente, sobre todo para quienes pasaron tantos años inmersos en
        esa realidad que terminó volviéndose parte de lo "normal". No solo la víctima; también los hijos,
        nietos, toda la familia termina incorporando, sin querer, esa forma de relacionarse.
      </p>

      {/* Testimonio destacado */}
      <div className="tips-box mb-5" data-aos="fade-up" style={{ background: 'linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%)', borderLeft: '4px solid #c263f9', padding: '2rem' }}>
        <i className="bi bi-quote" style={{ fontSize: '2rem', color: '#c263f9', display: 'block', marginBottom: '1rem' }}></i>
        <div style={{ display: 'block', width: '100%' }}>
          <p style={{ fontStyle: 'italic', color: '#555', margin: '0 0 1.5rem 0', fontSize: '1.05rem', lineHeight: '1.7' }}>
            "A veces estoy conversando con mis nietos y, sin darme cuenta, me quedo callada.
            Siento como si estuviera interrumpiendo o haciendo algo mal. Sé que ya no vivo aquellas
            épocas de miedo, pero mi cuerpo todavía reacciona así."
          </p>
          <p className="mb-0" style={{ fontSize: '0.9rem', color: '#666', textAlign: 'right', marginTop: '1rem', display: 'block', clear: 'both' }}>
            <strong>— Testimonio anónimo, mujer de 68 años</strong>
          </p>
        </div>
      </div>

      <p className="mb-5">
        Varios adultos mayores mencionan que, incluso cuando ya no conviven con el agresor, su cuerpo sigue
        reaccionando como si el peligro todavía estuviera presente. Esa es la cara silenciosa de la violencia:
        recuerdos que no se nombran, pero que viven en los hábitos, en las tensiones musculares, en la forma
        de respirar, de esperar, de mirar el mundo. Es una memoria que el cuerpo conserva, aun cuando la mente
        intenta dejarla atrás.
      </p>

      <hr className="my-5" />

      {/* Sección 2: Una infancia dura */}
      <h2 className="section-title" data-aos="fade-up">Una infancia dura: el origen de la violencia</h2>

      <p className="mb-4">
        Bandura (1977) sostiene que los niños aprenden no solo conductas, sino también la forma en que se
        resuelve el conflicto, se expresa el poder o se maneja el afecto. Cuando un niño crece viendo
        desigualdad, gritos, control o humillación, su cerebro interpreta ese entorno como "normal" y lo
        internaliza como parte del funcionamiento familiar esperado.
      </p>

      {/* Imagen placeholder 3 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/violencia3.webp"
          alt="El impacto de la infancia en los patrones de violencia"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <p className="mb-5">
        Esto explica por qué al crecer, muchas personas mayores siguen justificando o tolerando dinámicas
        violentas. De pronto se preguntan por qué se sienten mal y empiezan a experimentar ansiedad,
        hipervigilancia y estrés corporal. Estos síntomas no surgen de la nada. Son respuestas aprendidas
        desde la infancia, mecanismos que permitieron sobrevivir cuando el entorno no era seguro.
      </p>

      <div className="warning-box mb-5" data-aos="fade-up">
        <i className="bi bi-heart-pulse-fill"></i>
        <div>
          <p className="mb-2"><strong>El cuerpo recuerda...</strong></p>
          <p className="mb-0">
            Aunque hoy la vida haya cambiado, un gesto, un silencio o un tono de voz pueden despertar
            miedos que se creían superados. La memoria emocional es persistente, y muchas personas
            mayores lo describen como vivir en un cuerpo que sigue reaccionando a peligros pasados.
          </p>
        </div>
      </div>

      {/* Testimonio 2 */}
      <div className="tips-box mb-5" data-aos="fade-up" style={{ background: 'linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%)', borderLeft: '4px solid #c263f9', padding: '2rem' }}>
        <i className="bi bi-quote" style={{ fontSize: '2rem', color: '#c263f9', display: 'block', marginBottom: '1rem' }}></i>
        <div style={{ display: 'block', width: '100%' }}>
          <p style={{ fontStyle: 'italic', color: '#555', margin: '0 0 1.5rem 0', fontSize: '1.05rem', lineHeight: '1.7' }}>
            "A veces miro con nostalgia mi vida y me pregunto: ¿cómo pude aguantar tanto? Desde pequeña
            mi mamá me dijo que tenía que obedecer a mi esposo en todo. Eso se quedó en mí, y a pesar de
            los maltratos, yo seguía pendiente de hacerle sus cosas. Incluso hoy, cada vez que escucho la
            puerta abrirse, aunque no pase nada, mi cuerpo tiembla."
          </p>
          <p className="mb-0" style={{ fontSize: '0.9rem', color: '#666', textAlign: 'right', marginTop: '1rem', display: 'block', clear: 'both' }}>
            <strong>— Testimonio anónimo, mujer de 74 años</strong>
          </p>
        </div>
      </div>

      <hr className="my-5" />

      {/* Sección 3: Una deuda social */}
      <h2 className="section-title" data-aos="fade-up">Una deuda social: la violencia hacia nuestras generaciones mayores</h2>

      <p className="mb-4">
        Hablar de violencia doméstica implica reconocer también una responsabilidad social pendiente.
        Por décadas, la sociedad normalizó y aún en distintos lugares, sigue normalizando formas de maltrato:
      </p>

      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card" style={{ borderLeft: '4px solid #c263f9' }}>
            <div className="benefit-icon">
              <i className="bi bi-gender-ambiguous"></i>
            </div>
            <h3>Roles de género rígidos</h3>
            <p>Expectativas inflexibles sobre cómo deben comportarse hombres y mujeres en la familia.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card" style={{ borderLeft: '4px solid #c263f9' }}>
            <div className="benefit-icon">
              <i className="bi bi-heartbreak"></i>
            </div>
            <h3>Matrimonios forzados</h3>
            <p>Uniones impuestas por presión familiar y social, sin considerar el deseo de la persona.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card" style={{ borderLeft: '4px solid #c263f9' }}>
            <div className="benefit-icon">
              <i className="bi bi-basket"></i>
            </div>
            <h3>Cargas domésticas excesivas</h3>
            <p>Responsabilidades abrumadoras para niños, niñas y mujeres jóvenes en el hogar.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
          <div className="benefit-card" style={{ borderLeft: '4px solid #c263f9' }}>
            <div className="benefit-icon">
              <i className="bi bi-person-raised-hand"></i>
            </div>
            <h3>Expectativas de obediencia</h3>
            <p>Comentarios que justifican el sacrificio y minimizan el dolor emocional.</p>
          </div>
        </div>
      </div>

      {/* Imagen placeholder 4 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/violencia4.webp"
          alt="La responsabilidad social con los adultos mayores"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      {/* Testimonio 3 */}
      <div className="tips-box mb-5" data-aos="fade-up" style={{ background: 'linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%)', borderLeft: '4px solid #c263f9', padding: '2rem' }}>
        <i className="bi bi-quote" style={{ fontSize: '2rem', color: '#c263f9', display: 'block', marginBottom: '1rem' }}></i>
        <div style={{ display: 'block', width: '100%' }}>
          <p style={{ fontStyle: 'italic', color: '#555', margin: '0 0 1.5rem 0', fontSize: '1.05rem', lineHeight: '1.7' }}>
            "Cuando a los quince años vi que estaba condenada a lavar todos los días kilos de ropa de la
            familia de mi marido, todas en el río, agachada y con dolor de espalda, sin recibir un gracias,
            me llené de miedo y me pregunté: '¿En qué me he metido?'. Intenté huir, regresé donde mi abuela,
            pero ella me dijo: 'Tú ya conviviste con tu esposo, tu vida ahora es junto a tu esposo, no puedes
            abandonarlo'. Tuve que volver, fue duro. Y desde ese día hasta hoy… sigo aquí."
          </p>
          <p className="mb-0" style={{ fontSize: '0.9rem', color: '#666', textAlign: 'right', marginTop: '1rem', display: 'block', clear: 'both' }}>
            <strong>— Testimonio anónimo, mujer de 64 años</strong>
          </p>
        </div>
      </div>

      <hr className="my-5" />

      {/* Sección 4: ¿Qué normalizamos aún sin querer? */}
      <h2 className="section-title" data-aos="fade-up">¿Qué normalizamos aún sin querer?</h2>

      <p className="mb-4">
        Estas historias pueden sonar lejanas para quienes no crecieron en esa realidad. Sin embargo,
        seguimos repitiendo la indiferencia cuando minimizamos el dolor de los adultos mayores con frases como:
      </p>

      <div className="row gy-3 mb-5">
        <div className="col-md-6" data-aos="zoom-in" data-aos-delay="100">
          <div className="alert" style={{ background: '#fff3cd', border: '1px solid #ffc107', padding: '1rem', borderRadius: '8px' }}>
            <i className="bi bi-x-circle me-2" style={{ color: '#856404' }}></i>
            <strong>"En esa época era normal."</strong>
          </div>
        </div>
        <div className="col-md-6" data-aos="zoom-in" data-aos-delay="200">
          <div className="alert" style={{ background: '#fff3cd', border: '1px solid #ffc107', padding: '1rem', borderRadius: '8px' }}>
            <i className="bi bi-x-circle me-2" style={{ color: '#856404' }}></i>
            <strong>"Todos vivían así."</strong>
          </div>
        </div>
        <div className="col-md-6" data-aos="zoom-in" data-aos-delay="300">
          <div className="alert" style={{ background: '#fff3cd', border: '1px solid #ffc107', padding: '1rem', borderRadius: '8px' }}>
            <i className="bi bi-x-circle me-2" style={{ color: '#856404' }}></i>
            <strong>"Ya pasó, es parte del pasado."</strong>
          </div>
        </div>
        <div className="col-md-6" data-aos="zoom-in" data-aos-delay="400">
          <div className="alert" style={{ background: '#fff3cd', border: '1px solid #ffc107', padding: '1rem', borderRadius: '8px' }}>
            <i className="bi bi-x-circle me-2" style={{ color: '#856404' }}></i>
            <strong>"Así es mi padre/madre, no va a cambiar."</strong>
          </div>
        </div>
      </div>

      <div className="warning-box mb-5" data-aos="fade-up">
        <i className="bi bi-exclamation-triangle-fill"></i>
        <div>
          <p className="mb-2"><strong>Reflexión importante:</strong></p>
          <p className="mb-0">
            Estas respuestas reducen una realidad compleja a explicaciones simples y, al hacerlo, borran
            décadas de dolor y experiencias silenciadas. Nadie puede defender lo que no conoce o comprende.
            El impacto de la violencia no desaparece con el tiempo ni con la costumbre.
          </p>
        </div>
      </div>

      <hr className="my-5" />

      {/* Sección 5: Mirar de frente su historia */}
      <h2 className="section-title" data-aos="fade-up">Mirar de frente su historia: comprender las huellas de la violencia doméstica</h2>

      <p className="mb-5">
        Validar la historia de los adultos mayores no es solo un gesto de empatía, sino una forma de
        reconocer con dignidad todo lo que tuvieron que atravesar; es, en el fondo, un acto de justicia.
        Entender que muchas de las emociones que hoy cargan —ansiedad, miedo, tristeza o resignación— no
        nacen de la nada, sino de una vida entera sin protección ni apoyo.
      </p>

      {/* Imagen placeholder 5 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/violencia5.webp"
          alt="Comprendiendo las huellas de la violencia"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      {/* Subsección A: Efectos neuropsicológicos */}
      <h3 className="mb-4" style={{ color: '#c263f9', fontWeight: '700' }}>
        A. Entender los efectos neuropsicológicos: el cuerpo y el cerebro no olvidan
      </h3>

      <p className="mb-4">
        Estudios de neurociencia, realizado por autores como McEwen (2007) y Duval et al. (2010) han
        mostrado evidencias de que el estrés crónico asociado a la violencia, activa el eje
        hipotálamo–hipófisis–adrenal (HPA), generando un estado de alerta prolongado.
      </p>

      <div className="recipe-section mb-5" data-aos="fade-up">
        <div className="recipe-number">1</div>
        <h4 className="recipe-title">Cambios estructurales en el cerebro</h4>
        <div className="recipe-content">
          <p>
            Para adaptarse a un entorno de estrés, el cerebro segrega neurotransmisores que pueden
            modificar su estructura y funcionamiento, lo que puede promover la aparición de trastornos
            psiquiátricos, depresión y estrés postraumático.
          </p>
        </div>
      </div>

      <div className="recipe-section mb-5" data-aos="fade-up">
        <div className="recipe-number">2</div>
        <h4 className="recipe-title">Hipervigilancia permanente</h4>
        <div className="recipe-content">
          <ul>
            <li>Sobresaltarse ante ruidos mínimos: una puerta que se cierra, pasos en el pasillo, un objeto que cae</li>
            <li>Revisar constantemente el entorno: mirar repetidamente la ventana, la hora, el celular, la puerta</li>
            <li>Anticipar problemas en situaciones cotidianas: "Seguro se molestará si digo algo… mejor me quedo callada"</li>
            <li>Dormir ligero y despertarse ante cualquier sonido, como si algo malo estuviera por ocurrir</li>
            <li>Sentir tensión corporal constante: hombros tensos, mandíbula apretada, dificultad para respirar y dolores musculares</li>
          </ul>
        </div>
      </div>

      <div className="recipe-section mb-5" data-aos="fade-up">
        <div className="recipe-number">3</div>
        <h4 className="recipe-title">Dificultad para regular emociones</h4>
        <div className="recipe-content">
          <ul>
            <li>Llorar repentinamente sin entender del todo qué lo detonó</li>
            <li>Reaccionar con enojo o frustración rápida ante pequeñas contrariedades</li>
            <li>Sentir vergüenza extrema cuando cometen un error mínimo, como si fuera algo grave</li>
            <li>Quedarse paralizados o mudos durante discusiones, sin poder expresar lo que sienten</li>
            <li>Guardar emociones por días hasta explotar en silencio, en llanto o somatización</li>
            <li>Sentir una melancolía profunda y un sentimiento de culpa por el pasado</li>
          </ul>
        </div>
      </div>

      <div className="recipe-section mb-5" data-aos="fade-up">
        <div className="recipe-number">4</div>
        <h4 className="recipe-title">Mayor sensibilidad al rechazo</h4>
        <div className="recipe-content">
          <ul>
            <li>Pensar que alguien está molesto solo porque habló más corto o no respondió rápido</li>
            <li>Sentirse "una carga" cuando piden ayuda, incluso en cosas pequeñas</li>
            <li>Vivir con miedo a "molestar" o "decepcionar" a los demás</li>
            <li>Sobreanalizar gestos, silencios o miradas, buscando si hicieron algo mal</li>
            <li>Evitar conversaciones difíciles porque temen ser abandonados, criticados o ridiculizados</li>
          </ul>
        </div>
      </div>

      {/* Imagen placeholder 6 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/violencia6.webp"
          alt="Los efectos neuropsicológicos de la violencia"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <div className="alert-info mb-5" data-aos="fade-up">
        <i className="bi bi-info-circle-fill me-2"></i>
        Por eso en el adulto mayor encontramos síntomas como temblores, dolores físicos sin explicación
        médica, sobresaltos, miedo automático, culpa o retraimiento emocional: no es debilidad, es
        memoria corporal acumulada.
      </div>

      <hr className="my-5" />

      {/* Subsección B: Efectos inter e intrapersonales */}
      <h3 className="mb-4" style={{ color: '#c263f9', fontWeight: '700' }}>
        B. Entender los efectos a nivel inter e intrapersonal: vínculos deteriorados
      </h3>

      <p className="mb-4">
        La violencia doméstica opera y perjudica a nivel interpersonal no como un acto individual
        (Dutton, 2006 y Walker, 2016). Dentro los efectos negativos encontramos:
      </p>

      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="fade-up">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-person-dash"></i>
            </div>
            <h3>Degradación progresiva de la autoestima</h3>
            <p>La persona pierde poco a poco la confianza en sí misma y en sus capacidades.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-people-fill"></i>
            </div>
            <h3>Aislamiento social</h3>
            <p>Alejamiento de amistades, familiares y espacios de socialización.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-link-45deg"></i>
            </div>
            <h3>Dependencia emocional</h3>
            <p>Sentir que no pueden vivir sin la otra persona, a pesar del maltrato.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-shield-exclamation"></i>
            </div>
            <h3>Control a través del miedo o la culpa</h3>
            <p>Manipulación emocional que limita la libertad y autonomía de la persona.</p>
          </div>
        </div>
      </div>

      {/* Testimonios adicionales */}
      <div className="tips-box mb-5" data-aos="fade-up" style={{ background: 'linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%)', borderLeft: '4px solid #c263f9', padding: '2rem' }}>
        <i className="bi bi-quote" style={{ fontSize: '2rem', color: '#c263f9', display: 'block', marginBottom: '1rem' }}></i>
        <div style={{ display: 'block', width: '100%' }}>
          <p style={{ fontStyle: 'italic', color: '#555', margin: '0 0 1.5rem 0', fontSize: '1.05rem', lineHeight: '1.7' }}>
            "No me puedo ir de este lugar, necesito cuidar de mi nieta, si me voy, mis hijos que trabajan,
            se le complicaría poder cuidarlos, solo tengo que evitar estar cerca de mi esposo, para que no
            me moleste. (...) No disponía de mi propio dinero, si quería algo tenía que pedírselo a él,
            si quería comprar carnes, leche, pan etc, tenía que pedírselo y sabía que me gritaría diciendo
            que no necesito tanto dinero."
          </p>
          <p className="mb-0" style={{ fontSize: '0.9rem', color: '#666', textAlign: 'right', marginTop: '1rem', display: 'block', clear: 'both' }}>
            <strong>— Adulta mayor, 73 años</strong>
          </p>
        </div>
      </div>

      <div className="tips-box mb-5" data-aos="fade-up" style={{ background: 'linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%)', borderLeft: '4px solid #c263f9', padding: '2rem' }}>
        <i className="bi bi-quote" style={{ fontSize: '2rem', color: '#c263f9', display: 'block', marginBottom: '1rem' }}></i>
        <div style={{ display: 'block', width: '100%' }}>
          <p style={{ fontStyle: 'italic', color: '#555', margin: '0 0 1.5rem 0', fontSize: '1.05rem', lineHeight: '1.7' }}>
            "Mis hijos y yo no podíamos comer primero, sin antes esperar que llegara su papá. A veces
            seguíamos esperando, y cuando al fin volvía estaba borracho y de mal humor. Un día un familiar
            me dijo 'Por qué no alimentas a tus hijos, tienen hambre', me dolió mi corazón, era verdad,
            desde ese día les daba de comer aunque no llegase su padre."
          </p>
          <p className="mb-0" style={{ fontSize: '0.9rem', color: '#666', textAlign: 'right', marginTop: '1rem', display: 'block', clear: 'both' }}>
            <strong>— Adulta mayor, 68 años</strong>
          </p>
        </div>
      </div>

      <hr className="my-5" />

      {/* Subsección C: Violencia emocional invisible */}
      <h3 className="mb-4" style={{ color: '#c263f9', fontWeight: '700' }}>
        C. Entender la violencia emocional invisible: la forma más silenciosa y dañina
      </h3>

      <p className="mb-5">
        La violencia silenciosa es de las más peligrosas y que generan mayores estragos en la vida de
        los adultos mayores, muchas veces pasan inadvertidas porque son normalizadas tanto por la víctima
        como por los integrantes de la familia. Rodríguez-Carballeira (2014) describen que las formas
        más persistentes en adultos mayores suelen ser:
      </p>

      {/* Imagen placeholder 7 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/violencia7.webp"
          alt="La violencia emocional invisible"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <div className="accordion mb-5" id="violenciaAccordion">
        <div className="accordion-item" data-aos="fade-up">
          <h2 className="accordion-header">
            <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#descalificacion">
              <i className="bi bi-chat-left-text me-2"></i>
              Descalificación constante
            </button>
          </h2>
          <div id="descalificacion" className="accordion-collapse collapse show" data-bs-parent="#violenciaAccordion">
            <div className="accordion-body">
              <ul>
                <li>"No sé para qué opinas si siempre te equivocas"</li>
                <li>Corregir cada acción cotidiana: "mira cómo corta la comida, quítate que no sabes", "mira cómo caminas, mira cómo hablas por teléfono, habla bien"</li>
                <li>Minimizar logros: "Te felicitan porque no te conocen, si no, otra historia sería"</li>
                <li>Comentarios irónicos disfrazados de humor: "Ay, sí, la/el experta/o… si tú no puedes ni manejar tu propia vida"</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="accordion-item" data-aos="fade-up" data-aos-delay="100">
          <h2 className="accordion-header">
            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#humillacion">
              <i className="bi bi-emoji-frown me-2"></i>
              Humillación sutil
            </button>
          </h2>
          <div id="humillacion" className="accordion-collapse collapse" data-bs-parent="#violenciaAccordion">
            <div className="accordion-body">
              <ul>
                <li>Hacer comentarios sobre su peso, edad o apariencia frente a otros y luego decir: "Solo estoy bromeando"</li>
                <li>Burlarse de sus nervios o torpeza: "Ahí va otra vez, como siempre"</li>
                <li>Hacer gestos de burla, levantar cejas, suspirar con desprecio cuando la persona habla</li>
                <li>Mostrar vergüenza de la persona en público: "No hables, que luego dices tonterías"</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="accordion-item" data-aos="fade-up" data-aos-delay="200">
          <h2 className="accordion-header">
            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#indiferencia">
              <i className="bi bi-dash-circle me-2"></i>
              Indiferencia afectiva
            </button>
          </h2>
          <div id="indiferencia" className="accordion-collapse collapse" data-bs-parent="#violenciaAccordion">
            <div className="accordion-body">
              <ul>
                <li>No responder cuando la persona habla, ni siquiera con gestos mínimos</li>
                <li>Evitar contacto visual o físico como castigo silencioso</li>
                <li>Ignorar expresiones de dolor o cansancio: "Ya vas a empezar otra vez"</li>
                <li>No incluir a la persona en decisiones familiares o excluirla de actividades intencionalmente</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="accordion-item" data-aos="fade-up" data-aos-delay="300">
          <h2 className="accordion-header">
            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#control">
              <i className="bi bi-lock me-2"></i>
              Control del tiempo, dinero o decisiones
            </button>
          </h2>
          <div id="control" className="accordion-collapse collapse" data-bs-parent="#violenciaAccordion">
            <div className="accordion-body">
              <ul>
                <li>Decidir a qué hora la persona puede salir o regresar</li>
                <li>Revisar gastos, exigir comprobantes, restringir el acceso a la cuenta bancaria</li>
                <li>Impedir visitas a amigos o familiares porque "ahí te llenan la cabeza"</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="accordion-item" data-aos="fade-up" data-aos-delay="400">
          <h2 className="accordion-header">
            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#roles">
              <i className="bi bi-person-workspace me-2"></i>
              Imposición de roles tradicionales rígidos
            </button>
          </h2>
          <div id="roles" className="accordion-collapse collapse" data-bs-parent="#violenciaAccordion">
            <div className="accordion-body">
              <ul>
                <li>"Tu obligación es atenderme, mientras vivas aquí siempre será así"</li>
                <li>Asumir que la persona debe encargarse de todo el cuidado doméstico sin apoyo</li>
                <li>Criticar cualquier comportamiento que no encaje en expectativas de género: "Una mujer decente no habla así", "Un hombre de verdad no siente miedo"</li>
                <li>Imponer que la persona pida permiso para cualquier decisión básica porque "es lo correcto"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      {/* Subsección D: Consecuencias psicológicas */}
      <h3 className="mb-4" style={{ color: '#c263f9', fontWeight: '700' }}>
        D. Consecuencias psicológicas en la adultez mayor
      </h3>

      <p className="mb-4">
        Según la OMS (2021) y estudios longitudinales, la violencia genera:
      </p>

      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="zoom-in">
          <div className="benefit-card" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
            <div className="benefit-icon" style={{ background: '#6c757d' }}>
              <i className="bi bi-cloud-drizzle"></i>
            </div>
            <h3>Depresión moderada y grave</h3>
            <p>"Antes de venir a terapia, no podía dejar de llorar, recordaba todo mi pasado... me echaba en el sillón y por días no comía, no tenía sentido seguir viviendo."</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="zoom-in" data-aos-delay="100">
          <div className="benefit-card" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
            <div className="benefit-icon" style={{ background: '#6c757d' }}>
              <i className="bi bi-exclamation-circle"></i>
            </div>
            <h3>Trastornos de ansiedad</h3>
            <p>Miedo anticipatorio constante que interfiere con la vida cotidiana.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="zoom-in" data-aos-delay="200">
          <div className="benefit-card" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
            <div className="benefit-icon" style={{ background: '#6c757d' }}>
              <i className="bi bi-heart-pulse"></i>
            </div>
            <h3>Somatizaciones crónicas</h3>
            <p>Dolores musculares, problemas gastrointestinales y otros síntomas físicos sin causa médica clara.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="zoom-in" data-aos-delay="300">
          <div className="benefit-card" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
            <div className="benefit-icon" style={{ background: '#6c757d' }}>
              <i className="bi bi-people"></i>
            </div>
            <h3>Aislamiento social</h3>
            <p>Retraimiento progresivo de las relaciones sociales y familiares.</p>
          </div>
        </div>
      </div>

      {/* Imagen placeholder 8 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/violencia8.webp"
          alt="Consecuencias psicológicas en adultos mayores"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <hr className="my-5" />

      {/* Sección 6: ¿Qué necesitan los adultos mayores? */}
      <h2 className="section-title" data-aos="fade-up">Qué necesitan los adultos mayores que viven o vivieron en violencia</h2>

      <p className="mb-5">
        Luego de observar la profundidad de la violencia en nuestros adultos mayores y las huellas
        físicas, psicológicas, sociales y estructurales que deja, surge una cuestión importante: ¿qué
        podemos hacer? Por ello, se ha organizado una lista de criterios que podemos tomar en cuenta
        para identificar necesidades relevantes en nuestros adultos mayores.
      </p>

      {/* Subsección A: Reducir interacción con el agresor */}
      <div className="recipe-section mb-5" data-aos="fade-up">
        <div className="recipe-number">A</div>
        <h3 className="recipe-title">Reducir interacción con el agresor</h3>
        <div className="recipe-content">
          <p className="mb-3">
            Uno de los primeros pasos para comenzar a recuperar la estabilidad física y emocional es
            procurar tomar distancia del agresor. Esto puede implicar:
          </p>
          <ul>
            <li><strong>Procedimientos legales:</strong> Denuncias, medidas de protección, asesoría legal</li>
            <li><strong>Cambios en el estilo de vida:</strong> Modificar rutinas, horarios o espacios compartidos que aumentan el riesgo</li>
            <li><strong>Barreras físicas y psicológicas:</strong> No responder mensajes, llamadas, establecer límites y planificar rutas seguras</li>
            <li><strong>Buscar aliados:</strong> Familiares, amigos o vecinos que puedan ayudarnos a enfrentar mejor la situación</li>
          </ul>
          <p className="mb-0" style={{ fontStyle: 'italic', color: '#666' }}>
            El objetivo es que la persona pueda tomar sus propias decisiones en cuanto al tiempo,
            espacio, sin la presión o crítica de la persona que nos ha hecho daño.
          </p>
        </div>
      </div>

      {/* Subsección B: Fortalecer factores protectores */}
      <div className="recipe-section mb-5" data-aos="fade-up">
        <div className="recipe-number">B</div>
        <h3 className="recipe-title">Fortalecer los factores protectores</h3>
        <div className="recipe-content">
          <p className="mb-3">
            Cada persona tiene factores que los protegen y funcionan como un "lugar seguro" que
            disminuyen el impacto de las adversidades en su vida. Es importante identificar algunos
            de ellos en las personas adultos mayores:
          </p>

          <div className="row gy-3">
            <div className="col-md-4">
              <div className="idea-card">
                <i className="bi bi-house-heart"></i>
                <h4>La familia</h4>
                <p>Recordar a algún integrante que en el pasado ofreció ayuda, escuchó sin juzgar o brindó apoyo emocional.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="idea-card">
                <i className="bi bi-people"></i>
                <h4>Amigos o vecinos</h4>
                <p>A veces, quienes menos imaginamos pueden ser un soporte real. Animarse a conversar con ellos puede marcar una diferencia.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="idea-card">
                <i className="bi bi-building"></i>
                <h4>Organizaciones</h4>
                <p>Existen instituciones especializadas que brindan orientación psicológica, acompañamiento legal y protección.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recursos de ayuda */}
      <h3 className="mb-4" style={{ color: '#2d465e', fontWeight: '700' }}>Recursos de apoyo disponibles en Perú</h3>

      <div className="tips-box mb-5" data-aos="fade-up">
        <i className="bi bi-info-circle-fill"></i>
        <div>
          <p className="mb-4">Existen diferentes instancias y programas que pueden ayudar:</p>

          <div className="row">
            <div className="col-md-6">
              <ul style={{ listStyle: 'none', paddingLeft: '0' }}>
                <li className="mb-3">
                  <strong><i className="bi bi-telephone-fill me-2" style={{ color: '#c263f9' }}></i>Línea 100 (MIMP):</strong> Atención gratuita y confidencial las 24 horas para casos de violencia.{' '}
                  <a href="https://www.gob.pe/institucion/mimp/campañas/23869-buscas-ayuda-llama-a-la-linea-100" target="_blank" rel="noopener noreferrer" style={{ color: '#0d6efd', fontSize: '0.9rem', textDecoration: 'none' }}>
                    [Más información]
                  </a>
                </li>
                <li className="mb-3">
                  <strong><i className="bi bi-chat-dots-fill me-2" style={{ color: '#c263f9' }}></i>Chat 100:</strong> Orientación online sobre situaciones de violencia.{' '}
                  <a href="https://www.gob.pe/institucion/mimp/noticias/1244703-mimp-recuerda-que-la-linea-100-brinda-atencion-gratuita-y-confidencial-las-24-horas" target="_blank" rel="noopener noreferrer" style={{ color: '#0d6efd', fontSize: '0.9rem', textDecoration: 'none' }}>
                    [Iniciar chat]
                  </a>
                </li>
                <li className="mb-3">
                  <strong><i className="bi bi-house-heart-fill me-2" style={{ color: '#c263f9' }}></i>Centros Emergencia Mujer (CEM):</strong> Atención integral especializada en violencia.{' '}
                  <a href="https://www.gob.pe/51970-red-de-servicios" target="_blank" rel="noopener noreferrer" style={{ color: '#0d6efd', fontSize: '0.9rem', textDecoration: 'none' }}>
                    [Ubicar un CEM]
                  </a>
                </li>
                <li className="mb-3">
                  <strong><i className="bi bi-people-fill me-2" style={{ color: '#c263f9' }}></i>Centro Integral de Atención al Adulto Mayor (CIAM):</strong> Servicios sociales, legales y psicológicos gratuitos.{' '}
                  <a href="https://www.gob.pe/21665-centro-integral-de-atencion-al-adulto-mayor-ciam" target="_blank" rel="noopener noreferrer" style={{ color: '#0d6efd', fontSize: '0.9rem', textDecoration: 'none' }}>
                    [Más información]
                  </a>
                </li>
              </ul>
            </div>
            <div className="col-md-6">
              <ul style={{ listStyle: 'none', paddingLeft: '0' }}>
                <li className="mb-3">
                  <strong><i className="bi bi-cash-coin me-2" style={{ color: '#c263f9' }}></i>Pensión 65:</strong> Programa de apoyo económico para adultos mayores.{' '}
                  <a href="https://evidencia.midis.gob.pe/pension-65/" target="_blank" rel="noopener noreferrer" style={{ color: '#0d6efd', fontSize: '0.9rem', textDecoration: 'none' }}>
                    [Ver programa]
                  </a>
                </li>
                <li className="mb-3">
                  <strong><i className="bi bi-building me-2" style={{ color: '#c263f9' }}></i>INABIF:</strong> Programa Integral Nacional para el Bienestar Familiar.{' '}
                  <a href="https://www.gob.pe/inabif" target="_blank" rel="noopener noreferrer" style={{ color: '#0d6efd', fontSize: '0.9rem', textDecoration: 'none' }}>
                    [Más información]
                  </a>
                </li>
                <li className="mb-3">
                  <strong><i className="bi bi-mortarboard-fill me-2" style={{ color: '#c263f9' }}></i>Pronabec - Beca Repared:</strong> Becas técnicas productivas para capacitación.{' '}
                  <a href="https://www.pronabec.gob.pe/beca-tecnico-productiva-repared/" target="_blank" rel="noopener noreferrer" style={{ color: '#0d6efd', fontSize: '0.9rem', textDecoration: 'none' }}>
                    [Ver becas]
                  </a>
                </li>
                <li className="mb-3">
                  <strong><i className="bi bi-award-fill me-2" style={{ color: '#c263f9' }}></i>Becas Generación Plateada:</strong> Programa de becas para adultos mayores - Grupo Romero.{' '}
                  <a href="https://www.becasgruporomero.pe/convenio/generacion-plateada/" target="_blank" rel="noopener noreferrer" style={{ color: '#0d6efd', fontSize: '0.9rem', textDecoration: 'none' }}>
                    [Ver becas]
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Imagen placeholder 9 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/violencia9.webp"
          alt="Recursos de apoyo para adultos mayores"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      {/* Subsección C: Apoyo económico */}
      <div className="recipe-section mb-5" data-aos="fade-up">
        <div className="recipe-number">C</div>
        <h3 className="recipe-title">Apoyo económico y desarrollo personal</h3>
        <div className="recipe-content">
          <p className="mb-3">
            Cuando hablamos de reforzar recursos personales e incentivamos a las personas adultos mayores
            a poder ser más independientes y tomar mejores decisiones, es imprescindible abordar el
            aspecto económico y el crecimiento personal.
          </p>
          <p className="mb-3">
            La libertad financiera es un pilar elemental para reducir patrones de violencia. Dentro del
            apoyo que podemos darle a nuestros familiares se encuentran los siguientes puntos:
          </p>
          <ul>
            <li>Acceder a programas de apoyo económico (Pensión 65, becas técnicas, etc.)</li>
            <li>Organización financiera familiar para cubrir necesidades básicas</li>
            <li>Participar en cursos, oficios, talleres o actividades que mejoren habilidades y empleabilidad</li>
            <li>Espacios grupales que permitan conectar con personas en situaciones similares</li>
          </ul>
        </div>
      </div>

      {/* Subsección D: Terapia emocional */}
      <div className="recipe-section mb-5" data-aos="fade-up">
        <div className="recipe-number">D</div>
        <h3 className="recipe-title">Terapia emocional-conductual</h3>
        <div className="recipe-content">
          <p className="mb-3">
            La Terapia Emocional individual es crucial para observar cambios graduales en una persona
            víctima de violencia. En el caso de los adultos mayores, el acceso a terapias psicológicas
            suele ser limitado, especialmente por el sesgo y porque no se considera una prioridad dentro
            de las decisiones familiares. Sin embargo, constituye uno de los factores imprescindibles
            para ver mejoras reales.
          </p>

          <h5 className="mt-4 mb-3">La terapia puede ayudar a:</h5>
          <ul>
            <li>Evaluar e identificar las dificultades o problemas psicológicos subyacentes</li>
            <li>Regular emociones intensas y desbordantes como miedo, culpa, frustración, ira, ansiedad o tristeza</li>
            <li>Fortalecer recursos internos como autoestima, límites y autoeficacia</li>
            <li>Trabajar la tolerancia al malestar y flexibilizar creencias disfuncionales</li>
            <li>Explorar valores personales y acciones comprometidas</li>
            <li>Activación conductual para retomar rutinas y salir del aislamiento</li>
            <li>Incluir orientación familiar cuando es necesario reorganizar roles y dinámicas</li>
          </ul>

          <div className="alert-info mt-4">
            <i className="bi bi-heart-pulse-fill me-2"></i>
            <strong>La terapia no es un lujo o un aprendizaje irrelevante: es una herramienta de
            reconstrucción, fortaleza y esperanza.</strong>
          </div>
        </div>
      </div>

      {/* Imagen placeholder 10 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/violencia10.webp"
          alt="La importancia de la terapia en adultos mayores"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      {/* Testimonios de esperanza */}
      <h3 className="mb-4" style={{ color: '#c263f9', fontWeight: '700' }}>
        Testimonios de esperanza y recuperación
      </h3>

      <div className="tips-box mb-4" data-aos="fade-up" style={{ background: 'linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%)', borderLeft: '4px solid #28a745', padding: '2rem' }}>
        <i className="bi bi-quote" style={{ fontSize: '2rem', color: '#28a745', display: 'block', marginBottom: '1rem' }}></i>
        <div style={{ display: 'block', width: '100%' }}>
          <p style={{ fontStyle: 'italic', color: '#555', margin: '0 0 1.5rem 0', fontSize: '1.05rem', lineHeight: '1.7' }}>
            "Gracias a las sesiones que llevo, señorita, he podido darme cuenta de todo lo que había
            dejado pasar. Solía dormir en el sillón de la sala con una manta de bebé, porque cada vez
            que me acercaba al dormitorio, mi esposo no me dejaba espacio y si me movía me gritaba (...).
            Hoy he decidido mudarme de ambiente y duermo tranquila en mi propia habitación."
          </p>
          <p className="mb-0" style={{ fontSize: '0.9rem', color: '#666', textAlign: 'right', marginTop: '1rem', display: 'block', clear: 'both' }}>
            <strong>— Adulta mayor, 74 años</strong>
          </p>
        </div>
      </div>

      <div className="tips-box mb-4" data-aos="fade-up" style={{ background: 'linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%)', borderLeft: '4px solid #28a745', padding: '2rem' }}>
        <i className="bi bi-quote" style={{ fontSize: '2rem', color: '#28a745', display: 'block', marginBottom: '1rem' }}></i>
        <div style={{ display: 'block', width: '100%' }}>
          <p style={{ fontStyle: 'italic', color: '#555', margin: '0 0 1.5rem 0', fontSize: '1.05rem', lineHeight: '1.7' }}>
            "Nunca había tomado decisiones en mi vida. Gracias a mis terapias, he podido confrontar con
            ayuda de mis hijos a mi esposo; he establecido límites físicos y verbales. Ahora confío más
            en mí, en la forma en cómo me defiendo y en las decisiones que tomo(...) Estoy planeando
            hacer un viaje con mi hermana que me emociona, fue difícil, pero esta vez no tuve que dar
            explicaciones o tener miedo de lo que pase, esta vez lo haré."
          </p>
          <p className="mb-0" style={{ fontSize: '0.9rem', color: '#666', textAlign: 'right', marginTop: '1rem', display: 'block', clear: 'both' }}>
            <strong>— Adulta mayor, 65 años</strong>
          </p>
        </div>
      </div>

      <div className="tips-box mb-5" data-aos="fade-up" style={{ background: 'linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%)', borderLeft: '4px solid #28a745', padding: '2rem' }}>
        <i className="bi bi-quote" style={{ fontSize: '2rem', color: '#28a745', display: 'block', marginBottom: '1rem' }}></i>
        <div style={{ display: 'block', width: '100%' }}>
          <p style={{ fontStyle: 'italic', color: '#555', margin: '0 0 1.5rem 0', fontSize: '1.05rem', lineHeight: '1.7' }}>
            "Antes no podía dejar de llorar y cada vez que lo veía me entraba una cólera y ganas de
            gritarle. No dormía ni comía, pero ahora tengo más esperanza. Tengo mi rutina, tomo el sol,
            salgo con mi nieta a pasear y he hablado recientemente con una vecina. Me siento mejor…"
          </p>
          <p className="mb-0" style={{ fontSize: '0.9rem', color: '#666', textAlign: 'right', marginTop: '1rem', display: 'block', clear: 'both' }}>
            <strong>— Adulta mayor, 70 años</strong>
          </p>
        </div>
      </div>

      <hr className="my-5" />

      {/* Reflexión final */}
      <div className="alert-info mb-5" data-aos="fade-up" style={{ background: 'linear-gradient(135deg, #fff9c4 0%, #fff59d 100%)', border: '2px solid #fbc02d' }}>
        <i className="bi bi-heart-fill me-2" style={{ color: '#f57f17' }}></i>
        <p className="mb-0" style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
          Con estos testimonios de mujeres valientes, esmeradas, que han dedicado toda su vida al
          servicio de su familia, podemos observar que aún cuando el tiempo ha pasado, sus vidas poco
          a poco han cobrado sentido, son más conscientes de sus límites, de sus recursos y limitaciones,
          se permiten sentir, alzar su voz, decidir y poco a poco están procurando retomar el control
          de sus vidas.
        </p>
      </div>

      <p className="mb-5" style={{ fontSize: '1.1rem', textAlign: 'center', fontWeight: '600', color: '#2d465e' }}>
        A usted estimado lector, le animamos a seguir informándose de este tema, esperamos que esta
        lectura genere nuevas ideas y le motive a realizar ese cambio que necesite para su bienestar.
        Nunca es tarde y no está solo.
      </p>

      <hr className="my-5" />

      {/* Créditos - Autora */}
      {/* Autor */}
      <div className="author-credits" data-aos="fade-up">
        <div className="d-flex align-items-center gap-3">
          <div className="author-avatar">
            <i className="bi bi-person-circle" style={{ fontSize: '4rem', color: 'var(--cx-primary)' }}></i>
          </div>
          <div>
            <h4 style={{ marginBottom: '0.25rem' }}>Lic. Giselle Burgos Del Rosario</h4>
            <p style={{ marginBottom: '0.4rem', color: 'var(--cx-muted)', fontSize: '0.95rem' }}>
              <strong>Psicóloga Clínica - Centro Crecemos</strong>
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

      {/* Referencias bibliográficas */}
      <hr className="my-5" />

      <h3 className="mb-4" style={{ color: '#2d465e', fontWeight: '700' }}>Referencias Bibliográficas</h3>

      <div className="tips-box mb-5" data-aos="fade-up">
        <i className="bi bi-journal-text"></i>
        <div>
          <ol style={{ fontSize: '0.9rem', lineHeight: '1.8', color: '#495057', paddingLeft: '1.5rem', marginBottom: '0' }}>
            <li className="mb-2">Bandura, A. (1977). <em>Social Learning Theory.</em> Prentice Hall.</li>
            <li className="mb-2">Dutton, D. (2006). <em>Rethinking Domestic Violence.</em> UBC Press.</li>
            <li className="mb-2">
              Duval, Fabrice, González, Félix, & Rabia, Hassen. (2010). Neurobiología del estrés. <em>Revista chilena de neuro-psiquiatría, 48</em>(4), 307-318.
              <a href="https://dx.doi.org/10.4067/S0717-92272010000500006" target="_blank" rel="noopener noreferrer" style={{ color: '#0d6efd', textDecoration: 'none', marginLeft: '0.5rem', fontSize: '0.85rem' }}>
                [DOI]
              </a>
            </li>
            <li className="mb-2">
              Gobierno del Perú. (s.f.). <em>Centro Integral de Atención al Adulto Mayor (CIAM).</em> Gobierno del Perú.
              <a href="https://www.gob.pe/21665-centro-integral-de-atencion-al-adulto-mayor-ciam" target="_blank" rel="noopener noreferrer" style={{ color: '#0d6efd', textDecoration: 'none', marginLeft: '0.5rem', fontSize: '0.85rem' }}>
                [Enlace]
              </a>
            </li>
            <li className="mb-2">
              Grupo Romero. (s.f.). <em>Generación Plateada – Becas Grupo Romero.</em>
              <a href="https://www.becasgruporomero.pe/convenio/generacion-plateada/" target="_blank" rel="noopener noreferrer" style={{ color: '#0d6efd', textDecoration: 'none', marginLeft: '0.5rem', fontSize: '0.85rem' }}>
                [Enlace]
              </a>
            </li>
            <li className="mb-2">
              Instituto Nacional de Bienestar Familiar. (s.f.). <em>INABIF.</em> Gobierno del Perú.
              <a href="https://www.gob.pe/inabif" target="_blank" rel="noopener noreferrer" style={{ color: '#0d6efd', textDecoration: 'none', marginLeft: '0.5rem', fontSize: '0.85rem' }}>
                [Enlace]
              </a>
            </li>
            <li className="mb-2">
              McEwen, B. (2007). Physiology and neurobiology of stress and adaptation: Central role of the brain. <em>Physiological Reviews, 87</em>(3), 873–904.
              <a href="https://doi.org/10.1152/physrev.00041.2006" target="_blank" rel="noopener noreferrer" style={{ color: '#0d6efd', textDecoration: 'none', marginLeft: '0.5rem', fontSize: '0.85rem' }}>
                [DOI]
              </a>
            </li>
            <li className="mb-2">McEwen, B. (2012). The ever-changing brain: Stress and resilience in brain structure and function. <em>Neurobiology of Stress, 1</em>(1), 1–11.</li>
            <li className="mb-2">
              Ministerio de Desarrollo e Inclusión Social. (s.f.). <em>Pensión 65.</em> Evidencia MIDIS.
              <a href="https://evidencia.midis.gob.pe/pension-65/" target="_blank" rel="noopener noreferrer" style={{ color: '#0d6efd', textDecoration: 'none', marginLeft: '0.5rem', fontSize: '0.85rem' }}>
                [Enlace]
              </a>
            </li>
            <li className="mb-2">
              Ministerio de la Mujer y Poblaciones Vulnerables. (s.f.). <em>Centros de Emergencia Mujer (CEM): Red de servicios.</em> Gobierno del Perú.
              <a href="https://www.gob.pe/51970-red-de-servicios" target="_blank" rel="noopener noreferrer" style={{ color: '#0d6efd', textDecoration: 'none', marginLeft: '0.5rem', fontSize: '0.85rem' }}>
                [Enlace]
              </a>
            </li>
            <li className="mb-2">
              Ministerio de la Mujer y Poblaciones Vulnerables. (s.f.). <em>Línea 100.</em> Gobierno del Perú.
              <a href="https://www.gob.pe/institucion/mimp/campañas/23869-buscas-ayuda-llama-a-la-linea-100" target="_blank" rel="noopener noreferrer" style={{ color: '#0d6efd', textDecoration: 'none', marginLeft: '0.5rem', fontSize: '0.85rem' }}>
                [Enlace]
              </a>
            </li>
            <li className="mb-2">
              Ministerio de la Mujer y Poblaciones Vulnerables. (s.f.). <em>Programa Presupuestal de Reducción de Violencia contra las Mujeres (PPoR – RVcM).</em> Gobierno del Perú.
              <a href="https://www.gob.pe/55831-programa-presupuestal-orientado-a-resultados-ppor-de-reduccion-de-violencia-contra-las-mujeres-rvcm" target="_blank" rel="noopener noreferrer" style={{ color: '#0d6efd', textDecoration: 'none', marginLeft: '0.5rem', fontSize: '0.85rem' }}>
                [Enlace]
              </a>
            </li>
            <li className="mb-2">
              Ministerio de la Mujer y Poblaciones Vulnerables. (2023). <em>La Línea 100 brinda atención gratuita y confidencial las 24 horas.</em> Gobierno del Perú.
              <a href="https://www.gob.pe/institucion/mimp/noticias/1244703-mimp-recuerda-que-la-linea-100-brinda-atencion-gratuita-y-confidencial-las-24-horas" target="_blank" rel="noopener noreferrer" style={{ color: '#0d6efd', textDecoration: 'none', marginLeft: '0.5rem', fontSize: '0.85rem' }}>
                [Enlace]
              </a>
            </li>
            <li className="mb-2">Organización Mundial de la Salud. (2021). <em>Violencia contra las personas mayores: Informe mundial.</em> OMS.</li>
            <li className="mb-2">
              Programa Nacional de Becas y Crédito Educativo. (s.f.). <em>Beca Técnico Productiva Repared.</em> Gobierno del Perú.
              <a href="https://www.pronabec.gob.pe/beca-tecnico-productiva-repared/" target="_blank" rel="noopener noreferrer" style={{ color: '#0d6efd', textDecoration: 'none', marginLeft: '0.5rem', fontSize: '0.85rem' }}>
                [Enlace]
              </a>
            </li>
            <li className="mb-2">
              Rodríguez-Carballeira, Á., Escartín, J., Porrúa, C., & Martín-Peña, J. (2014). Categorization and hierarchy of abusive behaviors in intimate partner relationships. <em>The Spanish Journal of Psychology, 17</em>, e26.
              <a href="https://doi.org/10.1017/sjp.2014.27" target="_blank" rel="noopener noreferrer" style={{ color: '#0d6efd', textDecoration: 'none', marginLeft: '0.5rem', fontSize: '0.85rem' }}>
                [DOI]
              </a>
            </li>
            <li>Walker, L. (2016). <em>The Battered Woman Syndrome</em> (4th ed.). Springer Publishing Company.</li>
          </ol>
        </div>
      </div>
    </>
  );
}
