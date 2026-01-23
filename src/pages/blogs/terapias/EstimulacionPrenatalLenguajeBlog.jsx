import React from 'react';

export default function EstimulacionPrenatalLenguajeBlog() {
  return (
    <>
      {/* Introducción principal */}
      <div className="lead mb-5" style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#555' }}>
        Soy terapeuta de lenguaje infantil y también madre de dos niños. Desde el momento en que supe
        que existían dentro de mí, les hablé todos los días. Les cantaba, les contaba cómo me sentía,
        usaba un tono melodioso y palabras llenas de afecto.
      </div>

      <p className="mb-4">
        Hoy, con un hijo de 3 años y una hija de 1 año, ambos muestran un desarrollo temprano del
        lenguaje comprensivo, un vocabulario amplio y, en el caso del mayor, frases fluidas y
        conversaciones que incluso nos sorprenden como padres.
      </p>

      <p className="mb-5">
        Esta vivencia personal se une a lo que hoy la ciencia confirma: <strong>la estimulación del
        lenguaje puede comenzar incluso antes del nacimiento</strong>.
      </p>

      {/* Imagen hero 1 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/estimulacion-prenatal-1.jpg"
          alt="Madre embarazada hablando a su bebé"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <hr className="my-5" />

      {/* Sección 1: ¿Puede un bebé escuchar antes de nacer? */}
      <h2 className="section-title" data-aos="fade-up">
        <i className="bi bi-soundwave me-2" style={{ color: '#9B59B6' }}></i>
        ¿Puede un bebé escuchar antes de nacer?
      </h2>

      <div className="alert-info mb-4" data-aos="fade-up">
        <i className="bi bi-check-circle-fill me-2"></i>
        <strong>Sí.</strong> Diversas investigaciones han demostrado que el sistema auditivo del feto
        empieza a funcionar aproximadamente desde la <strong>semana 20 de gestación</strong>.
      </div>

      <p className="mb-4">
        A partir de ese momento, el bebé puede percibir sonidos del entorno, especialmente la voz materna,
        que llega de forma clara y constante.
      </p>

      <div className="tips-box mb-5" data-aos="fade-up" style={{
        background: 'linear-gradient(135deg, #f5f3ff 0%, #e8e0ff 100%)',
        borderLeft: '4px solid #9B59B6',
        padding: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <i className="bi bi-book-fill" style={{ fontSize: '2rem', color: '#9B59B6', flexShrink: 0 }}></i>
          <div>
            <h4 style={{ color: '#9B59B6', marginBottom: '1rem' }}>Evidencia científica</h4>
            <p style={{ marginBottom: '0', lineHeight: '1.8' }}>
              Estudios clásicos de <strong>DeCasper y Fifer (1980)</strong> demostraron que los recién
              nacidos reconocen y prefieren la voz de su madre frente a otras voces, lo que indica que
              ya la habían escuchado y memorizado durante el embarazo.
            </p>
          </div>
        </div>
      </div>

      <p className="mb-5" style={{ fontSize: '1.1rem', fontWeight: '500', color: '#9B59B6' }}>
        <i className="bi bi-lightbulb-fill me-2"></i>
        Esto significa que el cerebro del bebé ya está aprendiendo, incluso antes de nacer.
      </p>

      <hr className="my-5" />

      {/* Sección 2: Evidencia científica */}
      <h2 className="section-title" data-aos="fade-up">
        <i className="bi bi-graph-up-arrow me-2" style={{ color: '#4A90E2' }}></i>
        ¿Qué dice la evidencia científica sobre la estimulación prenatal?
      </h2>

      <p className="mb-4">
        Las investigaciones actuales en neurociencia y desarrollo infantil señalan que:
      </p>

      <div className="row gy-4 mb-5">
        <div className="col-md-4" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card">
            <div className="benefit-icon" style={{ background: '#e3f2fd', color: '#1565c0', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-diagram-3-fill"></i>
            </div>
            <h3 style={{ fontSize: '1.1rem' }}>Organización neuronal</h3>
            <p>La exposición temprana al lenguaje favorece la organización de las redes neuronales relacionadas con la comunicación.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card">
            <div className="benefit-icon" style={{ background: '#e3f2fd', color: '#1565c0', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-globe2"></i>
            </div>
            <h3 style={{ fontSize: '1.1rem' }}>Adaptación al idioma</h3>
            <p>El cerebro del bebé se adapta a los patrones del idioma materno desde la etapa prenatal.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card">
            <div className="benefit-icon" style={{ background: '#e3f2fd', color: '#1565c0', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-heart-fill"></i>
            </div>
            <h3 style={{ fontSize: '1.1rem' }}>Efecto regulador</h3>
            <p>La voz humana, especialmente la de la madre, tiene un efecto regulador y emocional positivo.</p>
          </div>
        </div>
      </div>

      <div className="warning-box mb-5" data-aos="fade-up">
        <i className="bi bi-mortarboard-fill"></i>
        <div>
          <p className="mb-2"><strong>Lo que dice la ciencia:</strong></p>
          <p className="mb-3">
            La investigadora <strong>Patricia Kuhl</strong> ha demostrado que los bebés nacen preparados
            para aprender el lenguaje y que la <strong>interacción humana directa</strong> es clave para
            este proceso, mucho más que cualquier estímulo pasivo.
          </p>
          <p className="mb-0">
            Organismos como la <strong>American Academy of Pediatrics</strong> y la <strong>Organización
            Mundial de la Salud</strong> coinciden en que el desarrollo temprano del lenguaje está
            directamente vinculado a la interacción verbal, el vínculo afectivo y la estimulación temprana,
            desde los primeros momentos de vida… <em>e incluso antes</em>.
          </p>
        </div>
      </div>

      {/* Imagen 2 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/estimulacion-prenatal-2.jpg"
          alt="Desarrollo cerebral prenatal y estimulación auditiva"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <hr className="my-5" />

      {/* Sección 3: Cómo estimular */}
      <h2 className="section-title" data-aos="fade-up">
        <i className="bi bi-chat-heart-fill me-2" style={{ color: '#50C878' }}></i>
        ¿Cómo estimular el lenguaje desde el embarazo?
      </h2>

      <p className="mb-4">
        Diversas investigaciones (DeCasper & Fifer, 1980; Kuhl, 2010; AAP; OMS) han demostrado que
        la voz materna, la prosodia y la interacción afectiva temprana influyen positivamente en la
        base neurológica del lenguaje.
      </p>

      <p className="mb-4">
        Desde la evidencia y la experiencia clínica, estas prácticas son altamente recomendadas:
      </p>

      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card" style={{ borderLeft: '4px solid #50C878' }}>
            <div className="benefit-icon" style={{ background: '#d4f4dd', color: '#2d8659', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-chat-dots-fill"></i>
            </div>
            <h3>Hablarle de forma cotidiana</h3>
            <p>Cuéntale sobre tu día, tus actividades, lo que sientes. Usa un lenguaje natural y cercano.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card" style={{ borderLeft: '4px solid #50C878' }}>
            <div className="benefit-icon" style={{ background: '#d4f4dd', color: '#2d8659', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-volume-up-fill"></i>
            </div>
            <h3>Usar un tono suave y melodioso</h3>
            <p>La prosodia (musicalidad del habla) es fundamental. Habla con afecto y ternura.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card" style={{ borderLeft: '4px solid #50C878' }}>
            <div className="benefit-icon" style={{ background: '#d4f4dd', color: '#2d8659', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-emoji-heart-eyes-fill"></i>
            </div>
            <h3>Compartir tus emociones</h3>
            <p>Cuéntale cómo te sientes, qué esperas con ilusión. El vínculo emocional comienza aquí.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
          <div className="benefit-card" style={{ borderLeft: '4px solid #50C878' }}>
            <div className="benefit-icon" style={{ background: '#d4f4dd', color: '#2d8659', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-music-note-beamed"></i>
            </div>
            <h3>Cantarle canciones</h3>
            <p>Las canciones de cuna, melodías suaves o música clásica estimulan el desarrollo auditivo.</p>
          </div>
        </div>
      </div>

      <div className="alert-info mb-5" data-aos="fade-up">
        <i className="bi bi-info-circle-fill me-2"></i>
        Estas acciones no enseñan palabras de forma directa, pero <strong>sí crean una base neurológica
        y emocional sólida</strong> para el lenguaje futuro.
      </div>

      <hr className="my-5" />

      {/* Sección 4: Experiencia personal */}
      <h2 className="section-title" data-aos="fade-up">
        <i className="bi bi-person-hearts me-2" style={{ color: '#FF6B9D' }}></i>
        Mi experiencia como madre y terapeuta de lenguaje
      </h2>

      <p className="mb-4">
        Como terapeuta de lenguaje, conozco lo que dice la evidencia científica.
      </p>

      <p className="mb-4">
        Como madre, he aprendido a escuchar, observar y confiar en el vínculo.
      </p>

      <p className="mb-5">
        Aún no puedo afirmar, desde un punto de vista estrictamente científico, que cada avance de
        mis hijos se deba únicamente a la estimulación del lenguaje durante el embarazo. Sin embargo,
        sí puedo compartir con honestidad lo que he observado en casa, desde la experiencia diaria
        y el acompañamiento cercano:
      </p>

      <div className="row gy-3 mb-5">
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
          <div className="idea-card" style={{ height: '100%', display: 'flex', alignItems: 'center' }}>
            <i className="bi bi-check2-circle me-2" style={{ color: '#9B59B6', fontSize: '1.5rem' }}></i>
            <strong>Desarrollo temprano del lenguaje comprensivo</strong>
          </div>
        </div>
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
          <div className="idea-card" style={{ height: '100%', display: 'flex', alignItems: 'center' }}>
            <i className="bi bi-check2-circle me-2" style={{ color: '#9B59B6', fontSize: '1.5rem' }}></i>
            <strong>Incremento progresivo y variado del vocabulario</strong>
          </div>
        </div>
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
          <div className="idea-card" style={{ height: '100%', display: 'flex', alignItems: 'center' }}>
            <i className="bi bi-check2-circle me-2" style={{ color: '#9B59B6', fontSize: '1.5rem' }}></i>
            <strong>Frases fluidas y conversaciones espontáneas (hijo mayor)</strong>
          </div>
        </div>
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
          <div className="idea-card" style={{ height: '100%', display: 'flex', alignItems: 'center' }}>
            <i className="bi bi-check2-circle me-2" style={{ color: '#9B59B6', fontSize: '1.5rem' }}></i>
            <strong>Alta intención comunicativa desde edades tempranas</strong>
          </div>
        </div>
      </div>

      {/* Imagen 3 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/estimulacion-prenatal-3.jpg"
          alt="Familia interactuando con niños pequeños"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <p className="mb-4">
        Desde el día de su nacimiento, como padres tomamos decisiones conscientes para acompañar su
        desarrollo. No desde la perfección, sino desde la presencia y la intención. Entre ellas:
      </p>

      <ul className="feature-list mb-5">
        <li><i className="bi bi-book-fill"></i> Lectura interdiaria de cuentos, incluso cuando aún no hablaban</li>
        <li><i className="bi bi-tv" style={{ textDecoration: 'line-through' }}></i> Cero exposición a pantallas en los primeros años</li>
        <li><i className="bi bi-people-fill"></i> Comidas compartidas como espacio de encuentro y conversación</li>
        <li><i className="bi bi-music-note-beamed"></i> Canciones, juegos, baile y diálogo constante</li>
        <li><i className="bi bi-house-heart-fill"></i> Participación activa de los niños en la vida cotidiana, sintiéndose parte de lo que hacemos</li>
      </ul>

      <hr className="my-5" />

      {/* Sección 5: Por qué funciona */}
      <h2 className="section-title" data-aos="fade-up">
        <i className="bi bi-house-heart-fill me-2" style={{ color: '#F39C12' }}></i>
        ¿Por qué la interacción temprana marca la diferencia?
      </h2>

      <p className="mb-4">
        Porque el lenguaje no se aprende solo escuchando palabras, sino:
      </p>

      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card">
            <div className="benefit-icon" style={{ background: '#ffcc80', color: '#e65100', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-heart-pulse-fill"></i>
            </div>
            <h3 style={{ fontSize: '1.1rem' }}>Sintiendo afecto</h3>
            <p>El vínculo emocional es la base de toda comunicación.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card">
            <div className="benefit-icon" style={{ background: '#ffcc80', color: '#e65100', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-eye-fill"></i>
            </div>
            <h3 style={{ fontSize: '1.1rem' }}>Compartiendo miradas</h3>
            <p>El contacto visual fortalece la conexión y la comprensión mutua.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card">
            <div className="benefit-icon" style={{ background: '#ffcc80', color: '#e65100', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-arrow-repeat"></i>
            </div>
            <h3 style={{ fontSize: '1.1rem' }}>Participando en rutinas</h3>
            <p>La repetición y la predictibilidad ayudan al aprendizaje del lenguaje.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
          <div className="benefit-card">
            <div className="benefit-icon" style={{ background: '#ffcc80', color: '#e65100', fontSize: '2rem', fontWeight: 'bold' }}>
              <i className="bi bi-megaphone-fill"></i>
            </div>
            <h3 style={{ fontSize: '1.1rem' }}>Siendo escuchado y respondido</h3>
            <p>La retroalimentación es esencial para que el bebé entienda que comunicarse tiene sentido.</p>
          </div>
        </div>
      </div>

      <div className="tips-box mb-5" data-aos="fade-up" style={{
        background: 'linear-gradient(135deg, #fff9f0 0%, #ffe8d6 100%)',
        borderLeft: '4px solid #F39C12',
        padding: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <i className="bi bi-star-fill" style={{ fontSize: '2.5rem', color: '#F39C12', flexShrink: 0 }}></i>
          <div>
            <h4 style={{ color: '#F39C12', marginBottom: '1rem', fontSize: '1.3rem' }}>
              El embarazo es el primer escenario de ese vínculo comunicativo
            </h4>
            <p style={{ marginBottom: '0', lineHeight: '1.8', fontSize: '1.05rem' }}>
              Todo esto coincide con lo que hoy sabemos: <strong>el lenguaje se construye en relación,
              no en aislamiento</strong>.
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
          <i className="bi bi-chat-heart-fill" style={{ fontSize: '2.5rem', color: '#9B59B6', flexShrink: 0 }}></i>
          <div>
            <h3 style={{ color: '#9B59B6', marginBottom: '1rem' }}>El lenguaje comienza mucho antes de la primera palabra</h3>
            <p style={{ marginBottom: '1rem', lineHeight: '1.8' }}>
              Hablarle a tu bebé desde el embarazo <strong>no es exagerado ni innecesario</strong>.
              Es una forma temprana de vínculo, estimulación y amor.
            </p>
            <p style={{ marginBottom: '0', lineHeight: '1.8' }}>
              La ciencia lo respalda, y muchas madres —como yo— lo hemos vivido en casa.
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
              Coordinadora y Fundadora – Centro Crecemos | Madre de dos niños
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
