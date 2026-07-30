import React from 'react';

export default function ApraxiaHablaTeaPadresBlog() {
  return (
    <>
      {/* Introducción principal */}
      <div className="lead mb-5" style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#555' }}>
        La terapia no termina cuando el niño sale del consultorio. Los <strong>momentos cotidianos en casa</strong>
        son una excelente oportunidad para fortalecer su comunicación.
      </div>

      <p className="mb-4">
        Recuerda que no debes abrumarte con ejercicios y tareas para casa: no se trata de practicar durante horas,
        sino de <strong>aprovechar actividades sencillas del día a día</strong> con paciencia, juego y mucho
        acompañamiento.
      </p>

      {/* Imagen hero 1 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/apraxia-1.webp"
          alt="Madre acompañando a su hijo en casa con paciencia y juego"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <hr className="my-5" />

      {/* Tip 1 */}
      <h2 className="section-title" data-aos="fade-up">
        <i className="bi bi-1-circle-fill me-2" style={{ color: '#1976d2' }}></i>
        Habla despacio y utiliza frases cortas
      </h2>

      <p className="mb-4">
        Cuando hablamos muy rápido o damos varias indicaciones al mismo tiempo, es posible que nuestro hijo no
        alcance a procesar toda la información. Esto no significa que no quiera hacerlo; simplemente necesita que
        las instrucciones sean <strong>más claras y sencillas</strong>.
      </p>

      <div className="tips-box mb-5" data-aos="fade-up" style={{
        background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
        borderLeft: '4px solid #1976d2',
        padding: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <i className="bi bi-lightbulb-fill" style={{ fontSize: '2rem', color: '#0d47a1', flexShrink: 0 }}></i>
          <div>
            <h4 style={{ color: '#0d47a1', marginBottom: '1rem' }}>Ejemplo sencillo</h4>
            <p style={{ marginBottom: '0.75rem', lineHeight: '1.8' }}>
              Si le dices: <em>"Ve a tu cuarto, trae tus zapatos porque ya nos vamos"</em>, es probable que solo haga
              una parte o no sepa por dónde empezar.
            </p>
            <p style={{ marginBottom: '0', lineHeight: '1.8' }}>
              <strong>Prueba con una instrucción a la vez:</strong> <em>"Ve por tus zapatos"</em>. Cuando termine,
              recién le das la siguiente. Así le ayudas a comprender mejor y aumentas sus posibilidades de éxito.
            </p>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      {/* Tip 2 */}
      <h2 className="section-title" data-aos="fade-up">
        <i className="bi bi-2-circle-fill me-2" style={{ color: '#00838f' }}></i>
        Dale tiempo para responder
      </h2>

      <p className="mb-4">
        Muchas veces queremos ayudar tanto a nuestros hijos que terminamos respondiendo por ellos y, sin darnos
        cuenta, les quitamos la oportunidad de comunicarse. Los niños con Apraxia del Habla necesitan
        <strong> unos segundos más</strong> para organizar los movimientos antes de hablar.
      </p>

      <div className="tips-box mb-5" data-aos="fade-up" style={{
        background: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)',
        borderLeft: '4px solid #00838f',
        padding: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <i className="bi bi-hourglass-split" style={{ fontSize: '2rem', color: '#006064', flexShrink: 0 }}></i>
          <div>
            <h4 style={{ color: '#006064', marginBottom: '1rem' }}>Ejemplo sencillo</h4>
            <p style={{ marginBottom: '0.75rem', lineHeight: '1.8' }}>
              Le preguntas <em>"¿Quieres agua o jugo?"</em> y, como pasan dos o tres segundos sin responder, enseguida
              dices <em>"¿Agua? Ya, toma agua"</em>.
            </p>
            <p style={{ marginBottom: '0', lineHeight: '1.8' }}>
              Antes de hacerlo, <strong>espera un poco más</strong>. Tu hijo quizá necesite cinco o diez segundos para
              responder con una palabra, un sonido, un gesto o señalando. Ese tiempo de espera se convierte en una gran
              oportunidad para practicar.
            </p>
          </div>
        </div>
      </div>

      {/* Imagen 2 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/apraxia-2.webp"
          alt="Niño jugando con burbujas junto a su padre"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <hr className="my-5" />

      {/* Tip 3 */}
      <h2 className="section-title" data-aos="fade-up">
        <i className="bi bi-3-circle-fill me-2" style={{ color: '#2e7d32' }}></i>
        Juega con lo que más le gusta
      </h2>

      <p className="mb-4">
        Los niños aprenden mucho mejor cuando disfrutan de una actividad. No hace falta comprar juguetes nuevos ni
        hacer actividades complicadas: lo importante es <strong>aprovechar aquello que llama su atención</strong>.
      </p>

      <div className="tips-box mb-5" data-aos="fade-up" style={{
        background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
        borderLeft: '4px solid #2e7d32',
        padding: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <i className="bi bi-balloon-heart-fill" style={{ fontSize: '2rem', color: '#1b5e20', flexShrink: 0 }}></i>
          <div>
            <h4 style={{ color: '#1b5e20', marginBottom: '1rem' }}>Ejemplo sencillo</h4>
            <p style={{ marginBottom: '0', lineHeight: '1.8' }}>
              Si a tu hijo le encantan las burbujas, <strong>no las soples inmediatamente</strong>. Muestra el frasco,
              míralo y espera unos segundos. Dale la oportunidad de pedirlas con una mirada, un gesto, un sonido o una
              palabra. Así comprenderá que comunicarse tiene un propósito: <strong>conseguir lo que desea</strong>.
            </p>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      {/* Tip 4 */}
      <h2 className="section-title" data-aos="fade-up">
        <i className="bi bi-4-circle-fill me-2" style={{ color: '#6a1b9a' }}></i>
        Valora cada intento de comunicarse
      </h2>

      <p className="mb-4">
        A veces esperamos escuchar la palabra completa para felicitar a nuestro hijo, pero <strong>cada intento
        representa un gran esfuerzo</strong>. Aunque la palabra no salga perfecta, ese intento merece ser reconocido.
      </p>

      <div className="tips-box mb-5" data-aos="fade-up" style={{
        background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
        borderLeft: '4px solid #6a1b9a',
        padding: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <i className="bi bi-hand-thumbs-up-fill" style={{ fontSize: '2rem', color: '#4a148c', flexShrink: 0 }}></i>
          <div>
            <h4 style={{ color: '#4a148c', marginBottom: '1rem' }}>Ejemplo sencillo</h4>
            <p style={{ marginBottom: '0.75rem', lineHeight: '1.8' }}>
              Si quiere decir <em>"papá"</em> y solo logra decir <em>"pa"</em>, evita responder
              <em> "No, así no se dice"</em>.
            </p>
            <p style={{ marginBottom: '0', lineHeight: '1.8' }}>
              En cambio, responde con entusiasmo: <em>"¡Sí! Papá llegó"</em>. Así validas su esfuerzo y, al mismo
              tiempo, le muestras el <strong>modelo correcto sin generar frustración</strong>.
            </p>
          </div>
        </div>
      </div>

      <div className="alert-info mb-5" data-aos="fade-up">
        <i className="bi bi-heart-fill me-2"></i>
        Cada intento es un paso: reconocerlo <strong>motiva a tu hijo a seguir comunicándose.</strong>
      </div>

      <hr className="my-5" />

      {/* Tip 5 */}
      <h2 className="section-title" data-aos="fade-up">
        <i className="bi bi-5-circle-fill me-2" style={{ color: '#e65100' }}></i>
        Reduce el tiempo frente a las pantallas
      </h2>

      <p className="mb-4">
        Las tabletas y los celulares pueden entretener, pero <strong>no reemplazan una conversación</strong> con
        mamá, papá o un familiar. El lenguaje se desarrolla cuando existe interacción con otra persona.
      </p>

      <div className="warning-box mb-5" data-aos="fade-up">
        <i className="bi bi-phone-fill"></i>
        <div>
          <p className="mb-2"><strong>Ejemplo sencillo:</strong></p>
          <p className="mb-0">
            Si normalmente pasa treinta minutos viendo videos después de almorzar, reemplaza parte de ese tiempo por
            un juego sencillo: bloques, burbujas, un cuento o conversar mientras guardan los juguetes. Esos minutos de
            interacción <strong>valen mucho más para su comunicación</strong>.
          </p>
        </div>
      </div>

      {/* Imagen 3 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/apraxia-3.webp"
          alt="Familia jugando con bloques en casa en lugar de usar pantallas"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <hr className="my-5" />

      {/* Tip 6 */}
      <h2 className="section-title" data-aos="fade-up">
        <i className="bi bi-6-circle-fill me-2" style={{ color: '#00838f' }}></i>
        Practica en casa lo que el terapeuta le enseña
      </h2>

      <p className="mb-4">
        La terapia suele durar entre 40 y 50 minutos, pero el aprendizaje continúa durante toda la semana.
        <strong> No necesitas convertirte en terapeuta</strong>: solo acompaña a tu hijo siguiendo las recomendaciones
        que recibes en cada sesión.
      </p>

      <div className="tips-box mb-5" data-aos="fade-up" style={{
        background: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)',
        borderLeft: '4px solid #00838f',
        padding: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <i className="bi bi-house-heart-fill" style={{ fontSize: '2rem', color: '#006064', flexShrink: 0 }}></i>
          <div>
            <h4 style={{ color: '#006064', marginBottom: '1rem' }}>Ejemplo sencillo</h4>
            <p style={{ marginBottom: '0', lineHeight: '1.8' }}>
              Si el objetivo es practicar la palabra <em>"más"</em>, no hace falta sentarlo frente a una mesa.
              Aprovecha cuando quiera más galletas, más jugo, más burbujas o más tiempo de juego. Cada situación
              cotidiana se convierte en una <strong>oportunidad para practicar de forma natural</strong>.
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
          <i className="bi bi-heart-fill" style={{ fontSize: '2.5rem', color: '#6a1b9a', flexShrink: 0 }}></i>
          <div>
            <h3 style={{ color: '#6a1b9a', marginBottom: '1rem' }}>Un último consejo para los padres</h3>
            <p style={{ marginBottom: '1rem', lineHeight: '1.8' }}>
              No busques que tu hijo hable perfecto de un día para otro. <strong>Celebra cada mirada, cada gesto, cada
              sonido y cada palabra nueva.</strong> La comunicación se construye paso a paso, y el apoyo que recibe en
              casa es tan importante como la terapia que realiza con su Tecnólogo Médico en Terapia de Lenguaje.
            </p>
            <p style={{ marginBottom: '0', lineHeight: '1.8', fontWeight: '500' }}>
              Los pequeños momentos que compartes con tu hijo hoy pueden convertirse en los grandes avances que
              celebrarás mañana.
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
