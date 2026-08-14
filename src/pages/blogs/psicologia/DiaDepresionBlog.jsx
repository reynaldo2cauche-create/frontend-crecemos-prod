import React from 'react';

export default function DiaDepresionBlog() {
  return (
    <>
      {/* Introducción principal */}
      <div className="lead mb-5" style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#555' }}>
        En este día resulta fundamental reconocer la lucha que atraviesan las personas que viven con
        depresión. En muchos casos, esta condición se presenta en silencio, en personas que continúan
        cumpliendo con sus responsabilidades, trabajando, estudiando y sonriendo.
      </div>

      <p className="mb-4">
        Personas que escuchan frases como <em>"no parece que estés mal"</em>, mientras internamente
        sienten que todo les resulta más pesado de lo habitual. La Organización Mundial de la Salud
        señala que la depresión no siempre es visible externamente, pero sí genera un impacto profundo
        en el funcionamiento emocional y cotidiano.
      </p>

      {/* Frases que se escuchan en consulta */}
      <div className="alert-info mb-5" data-aos="fade-up" style={{
        background: 'linear-gradient(135deg, #e8f4f8 0%, #d4e9f2 100%)',
        border: '2px solid #5ba3c1',
        padding: '2rem',
        borderRadius: '12px'
      }}>
        <h4 style={{ color: '#2d465e', fontWeight: '700', marginBottom: '1.5rem' }}>
          Expresiones que aparecen con frecuencia en la consulta psicológica:
        </h4>
        <ul style={{ listStyle: 'none', paddingLeft: '0' }}>
          <li className="mb-3" style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>
            <i className="bi bi-quote me-2" style={{ color: '#5ba3c1' }}></i>
            <em>"No sé cómo explicar lo que me pasa."</em>
          </li>
          <li className="mb-3" style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>
            <i className="bi bi-quote me-2" style={{ color: '#5ba3c1' }}></i>
            <em>"Estoy cansado, pero no es solo físico."</em>
          </li>
          <li className="mb-3" style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>
            <i className="bi bi-quote me-2" style={{ color: '#5ba3c1' }}></i>
            <em>"Tengo todo para estar bien y aun así no lo estoy."</em>
          </li>
          <li style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>
            <i className="bi bi-quote me-2" style={{ color: '#5ba3c1' }}></i>
            <em>"No quiero levantarme de mi cama ni hacer nada; mi familia dice que solo es flojera."</em>
          </li>
        </ul>
        <p className="mb-0 mt-3" style={{ fontSize: '1rem', fontStyle: 'italic', color: '#555' }}>
          Estas expresiones no buscan llamar la atención, sino ser comprendidas.
        </p>
      </div>

      <hr className="my-5" />

      {/* Sección 1: Más que tristeza */}
      <h2 className="section-title" data-aos="fade-up">Más que tristeza</h2>

      <p className="mb-4">
        Desde la psicología clínica, la depresión no se entiende únicamente como tristeza. Implica una
        alteración significativa en la manera en que la persona se percibe a sí misma, interpreta lo que
        le ocurre y se relaciona con su entorno.
      </p>

      {/* Imagen placeholder 2 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/depresion1.webp"
          alt="La depresión afecta múltiples áreas"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <p className="mb-4">
        Afecta el estado de ánimo, pero también el cuerpo, los pensamientos y la energía necesaria para
        afrontar la vida diaria, interfiriendo en distintas áreas del funcionamiento personal y social.
      </p>

      <div className="tips-box mb-5" data-aos="fade-up" style={{
        background: 'linear-gradient(135deg, #fff9e6 0%, #fff0cc 100%)',
        borderLeft: '4px solid #5ba3c1'
      }}>
        <i className="bi bi-lightbulb-fill"></i>
        <div>
          <p className="mb-0">
            <strong>Importante recordar:</strong> Cada persona experimenta la depresión de forma diferente.
            Por ello, al hablar de esta condición, se habla de procesos individuales y no de experiencias
            uniformes.
          </p>
        </div>
      </div>

      <hr className="my-5" />

      {/* Sección 2: Lo que se ve y lo que no */}
      <h2 className="section-title" data-aos="fade-up">Lo que se ve y lo que no</h2>

      <p className="mb-4">
        Existen manifestaciones más visibles, como el aislamiento, el llanto frecuente, la irritabilidad
        o la pérdida de interés. Sin embargo, gran parte del malestar suele permanecer oculto incluso
        para el entorno cercano.
      </p>

      {/* Imagen placeholder 3 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/depresion2.webp"
          alt="El malestar interno de la depresión"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <p className="mb-4">
        A nivel interno, muchas personas experimentan pensamientos autocríticos, sentimientos de culpa
        persistentes y un agotamiento emocional constante.
      </p>

      {/* Lista de experiencias internas */}
      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card" style={{ borderLeft: '4px solid #5ba3c1' }}>
            <div className="benefit-icon">
              <i className="bi bi-moon-stars"></i>
            </div>
            <h3>Agotamiento constante</h3>
            <p>Se levantan cada día sintiéndose agotadas, sin importar las horas de sueño.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card" style={{ borderLeft: '4px solid #5ba3c1' }}>
            <div className="benefit-icon">
              <i className="bi bi-arrow-up-circle"></i>
            </div>
            <h3>Autoexigencia excesiva</h3>
            <p>Se exigen más de lo que pueden sostener, empujándose más allá de sus límites.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card" style={{ borderLeft: '4px solid #5ba3c1' }}>
            <div className="benefit-icon">
              <i className="bi bi-chat-left-dots"></i>
            </div>
            <h3>Diálogo interno duro</h3>
            <p>Se hablan con dureza, aun cuando hacen lo mejor que pueden.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
          <div className="benefit-card" style={{ borderLeft: '4px solid #5ba3c1' }}>
            <div className="benefit-icon">
              <i className="bi bi-heart-half"></i>
            </div>
            <h3>Culpa por no estar bien</h3>
            <p>Sienten culpa por no "estar bien", aunque no sea su responsabilidad.</p>
          </div>
        </div>

        <div className="col-md-12" data-aos="fade-up" data-aos-delay="500">
          <div className="benefit-card" style={{ borderLeft: '4px solid #5ba3c1' }}>
            <div className="benefit-icon">
              <i className="bi bi-calendar-check"></i>
            </div>
            <h3>Rutina sin disfrute</h3>
            <p>Continúan con su rutina diaria, pero sin experimentar disfrute o satisfacción en lo que hacen.</p>
          </div>
        </div>
      </div>

      <div className="warning-box mb-5" data-aos="fade-up">
        <i className="bi bi-info-circle-fill"></i>
        <div>
          <p className="mb-0">
            La depresión no siempre se manifiesta de forma evidente, pero se vive con gran intensidad
            a nivel interno.
          </p>
        </div>
      </div>

      <hr className="my-5" />

      {/* Sección 3: Cuidar las palabras y los diagnósticos */}
      <h2 className="section-title" data-aos="fade-up">Cuidar las palabras y los diagnósticos</h2>

      <p className="mb-4">
        Es importante señalar que no toda tristeza corresponde a una depresión, ni todo momento difícil
        requiere un diagnóstico o una intervención clínica. Nombrar una condición sin una evaluación
        adecuada puede generar confusión, temor o estigmatización innecesaria.
      </p>

      {/* Imagen placeholder 4 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/depresion3.webp"
          alt="La importancia del diagnóstico profesional"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <div className="tips-box mb-5" data-aos="fade-up" style={{
        background: 'linear-gradient(135deg, #f0f8ff 0%, #e0f0ff 100%)',
        borderLeft: '4px solid #5ba3c1'
      }}>
        <i className="bi bi-clipboard2-pulse"></i>
        <div>
          <p className="mb-0">
            <strong>El diagnóstico implica:</strong> Observar, escuchar y evaluar la duración, la intensidad
            y el impacto del malestar en la vida de la persona. Se trata de un proceso que requiere
            responsabilidad profesional y cuyo objetivo no es etiquetar, sino comprender qué está ocurriendo
            y qué tipo de acompañamiento resulta más adecuado.
          </p>
        </div>
      </div>

      <hr className="my-5" />

      {/* Sección 4: Para quienes atraviesan un cuadro depresivo */}
      <h2 className="section-title" data-aos="fade-up">Para quienes atraviesan un cuadro depresivo</h2>

      <p className="mb-4">
        Cuando una persona se identifica con estas experiencias, es importante recordar que su malestar
        es válido. No se trata de falta de carácter ni de debilidad personal. Pedir ayuda no resta valor;
        por el contrario, puede convertirse en un factor protector clave.
      </p>

      {/* Imagen placeholder 5 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/depresion4.webp"
          alt="Pedir ayuda es un acto de valentía"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <div className="alert-info mb-5" data-aos="fade-up" style={{
        background: 'linear-gradient(135deg, #e8f8f5 0%, #d4f1e8 100%)',
        border: '2px solid #5ba3c1',
        padding: '2rem',
        borderRadius: '12px'
      }}>
        <i className="bi bi-heart-fill me-3" style={{ fontSize: '2rem', color: '#5ba3c1' }}></i>
        <div>
          <h4 style={{ color: '#2d465e', fontWeight: '700', marginBottom: '1rem' }}>
            Un mensaje de esperanza
          </h4>
          <p className="mb-0" style={{ fontSize: '1.05rem', lineHeight: '1.7' }}>
            La depresión es una condición que puede abordarse. Aunque el proceso no siempre es lineal
            y puede incluir avances y retrocesos, el acompañamiento psicológico y el apoyo adecuado
            favorecen la recuperación del equilibrio emocional y del sentido personal.
          </p>
        </div>
      </div>

      <hr className="my-5" />

      {/* Sección 5: Para quienes acompañan desde cerca */}
      <h2 className="section-title" data-aos="fade-up">Para quienes acompañan desde cerca</h2>

      <p className="mb-4">
        Acompañar a una persona con depresión es un proceso que requiere constancia, paciencia y
        comprensión. No se trata de ofrecer soluciones inmediatas ni de mantener un ánimo permanente,
        sino de estar disponibles, escuchar sin juzgar y respetar los tiempos emocionales.
      </p>

      {/* Imagen placeholder 6 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/depresion5.webp"
          alt="Acompañar con presencia y respeto"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <div className="tips-box mb-5" data-aos="fade-up" style={{
        background: 'linear-gradient(135deg, #fff5f5 0%, #ffe6e6 100%)',
        borderLeft: '4px solid #5ba3c1'
      }}>
        <i className="bi bi-people-fill"></i>
        <div>
          <p className="mb-3">
            <strong>La validación emocional,</strong> junto con la orientación adecuada, contribuye de
            manera significativa al proceso de recuperación.
          </p>
          <p className="mb-0" style={{ fontStyle: 'italic', fontSize: '1.05rem' }}>
            Acompañar no es obligar a alguien a salir del dolor, es caminar a su lado, respetar su ritmo
            y, cuando es posible, ayudarle a encontrar pequeñas formas de avanzar sin sentirse solo.
          </p>
        </div>
      </div>

      <hr className="my-5" />

      {/* Mensaje de cierre */}
      <div className="alert-info mb-5" data-aos="fade-up" style={{
        background: 'linear-gradient(135deg, #e8f4f8 0%, #d4e9f2 100%)',
        border: '2px solid #5ba3c1',
        padding: '2.5rem',
        borderRadius: '12px'
      }}>
        <div className="text-center">
          <i className="bi bi-calendar-heart mb-3" style={{ fontSize: '3rem', color: '#5ba3c1' }}></i>
          <h3 style={{ color: '#2d465e', fontWeight: '700', marginBottom: '1.5rem' }}>
            13 de Enero: Día de la Lucha contra la Depresión
          </h3>
          <p className="mb-0" style={{ fontSize: '1.15rem', lineHeight: '1.8', maxWidth: '800px', margin: '0 auto' }}>
            Recordemos que hablar con respeto, comprender con profundidad y acompañar con presencia
            también es una forma de cuidado.
          </p>
        </div>
      </div>

      {/* Recursos de ayuda */}
      <h3 className="mb-4" style={{ color: '#2d465e', fontWeight: '700' }}>
        ¿Necesitas ayuda profesional?
      </h3>

      <div className="tips-box mb-5" data-aos="fade-up">
        <i className="bi bi-telephone-fill"></i>
        <div>
          <p className="mb-4">En Perú existen recursos gratuitos disponibles las 24 horas:</p>

          <div className="row">
            <div className="col-md-6">
              <ul style={{ listStyle: 'none', paddingLeft: '0' }}>
                <li className="mb-3">
                  <strong><i className="bi bi-telephone-fill me-2" style={{ color: '#5ba3c1' }}></i>Línea 113 (Salud Mental):</strong>{' '}
                  Atención de salud mental gratuita.{' '}
                  <a
                    href="https://www.gob.pe/institucion/minsa/noticias/767395-minsa-pone-en-funcionamiento-linea-113-opcion-5-de-atencion-en-salud-mental"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#0d6efd', fontSize: '0.9rem', textDecoration: 'none' }}
                  >
                    [Más información]
                  </a>
                </li>
              </ul>
            </div>
            <div className="col-md-6">
              <ul style={{ listStyle: 'none', paddingLeft: '0' }}>
                <li className="mb-3">
                  <strong><i className="bi bi-building me-2" style={{ color: '#5ba3c1' }}></i>Centros de Salud Mental Comunitarios:</strong>{' '}
                  Atención psicológica especializada.{' '}
                  <a
                    href="https://www.gob.pe/institucion/minsa/colecciones/1772-centros-de-salud-mental-comunitaria"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#0d6efd', fontSize: '0.9rem', textDecoration: 'none' }}
                  >
                    [Ubicar un centro]
                  </a>
                </li>
              </ul>
            </div>
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
            <strong>American Psychiatric Association.</strong> (2022). <em>DSM-5-TR. Manual diagnóstico y
            estadístico de los trastornos mentales</em> (5.ª ed., texto revisado).
          </p>
          <p className="mb-3">
            <strong>Beck, A. T., Rush, A. J., Shaw, B. F., &amp; Emery, G.</strong> (1979). <em>Terapia cognitiva de
            la depresión</em>.
          </p>
          <p className="mb-3">
            <strong>Linehan, M. M.</strong> (2015). <em>Manual de habilidades de terapia dialéctico-conductual</em>.
          </p>
          <p className="mb-3">
            <strong>Organización Mundial de la Salud.</strong> (2017). <em>Depresión y otros trastornos mentales
            comunes</em>.
          </p>
          <p className="mb-3">
            <strong>Organización Mundial de la Salud.</strong> (2023). <em>Depresión: datos y cifras</em>.
          </p>
          <p className="mb-0">
            <strong>Rogers, C. R.</strong> (1957). <em>Las condiciones necesarias y suficientes del cambio
            terapéutico</em>.
          </p>
        </div>
      </div>

      {/* Autor */}
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