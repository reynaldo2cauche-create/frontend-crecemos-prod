import React from 'react';

export default function TCABlog() {
  return (
    <>
      {/* Introducción principal */}
      <div className="lead mb-5" style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#555' }}>
        Imaginemos un lugar pequeño, una cárcel que no tiene barrotes, pero que a pesar de que intentamos
        salir, existe un carcelero, la voz interna, que constantemente nos dice, "no salgas de aquí",
        "aún no es suficiente", que "necesitamos ser disciplinados", que "unos gramos menos no son nada"
        o que "tenemos que controlarlo".
      </div>

      {/* IMAGEN 1 - PORTADA */}
      {/* PROMPT: "Una imagen metafórica y artística que muestre una persona mirándose en un espejo,
          con la reflexión mostrando cadenas invisibles alrededor de su cuerpo. Ambiente emocional
          con tonos azules y púrpuras, luz suave, estilo minimalista. La persona se ve pensativa
          y en conflicto interno. Ilustración digital profesional, mood emotivo y reflexivo." */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/tca-portada.webp"
          alt="Día Internacional de la lucha contra los TCA"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <p className="mb-4">
        Este 30 de noviembre, alzamos la voz contra esta cárcel y esta voz prisionera pero silenciosa:
        los <strong>Trastornos de la Conducta Alimentaria (TCA)</strong>. Es el momento de dejar de verlos
        como "dietas extremas" y reconocerlos como lo que son: enfermedades mentales graves y complejas.
      </p>

      <p className="mb-5">
        Esta fecha es un acto de amor y visibilidad para quienes luchan en silencio.
      </p>

      <hr className="my-5" />

      {/* Sección 1: La verdad y el dolor */}
      <h2 className="section-title" data-aos="fade-up">La Verdad y el Dolor</h2>

      <p className="mb-4">
        Los TCA son, en esencia, afecciones psiquiátricas que alteran la relación que tiene la persona
        con la comida. Esta alteración produce un deterioro significativo tanto de la salud física, como
        del bienestar emocional y social de la persona.
      </p>

      <div className="alert-info mb-5" data-aos="fade-up">
        <i className="bi bi-info-circle-fill me-2"></i>
        Es muy importante entender que estos trastornos no nacen de la vanidad o la debilidad. Detrás
        de la angustia por comer, se puede notar la interacción de factores, dolores y presiones.
      </div>

      {/* IMAGEN 2 - FACTORES INTERCONECTADOS */}
      {/* PROMPT: "Ilustración conceptual mostrando tres elementos interconectados: cerebro (biología),
          corazón (psicología), y sociedad (influencias sociales). Conexiones en forma de red entre
          los tres elementos. Colores cálidos: naranjas, rosas y amarillos. Estilo moderno y limpio,
          ilustración vectorial profesional. Fondo blanco o gradiente suave." */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/tca1.webp"
          alt="Factores que influyen en los TCA"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      {/* Factores que influyen */}
      <div className="row gy-4 mb-5">
        <div className="col-md-4" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card" style={{ borderLeft: '4px solid #9b59b6' }}>
            <div className="benefit-icon">
              <i className="bi bi-heart-pulse"></i>
            </div>
            <h3>Bases Psicológicas</h3>
            <p>
              Son el terreno donde se desarrolla el TCA: baja autoestima, poca gestión emocional,
              un perfeccionismo-autoexigencia elevada o eventos traumáticos pasados.
            </p>
          </div>
        </div>

        <div className="col-md-4" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card" style={{ borderLeft: '4px solid #9b59b6' }}>
            <div className="benefit-icon">
              <i className="bi bi-people"></i>
            </div>
            <h3>Influencias Sociales</h3>
            <p>
              La presión estética se siente en casi todos los aspectos de la vida. Una cultura que
              promueve la delgadez extrema como si fuera el éxito, sumado al acoso relacionado con
              el cuerpo.
            </p>
          </div>
        </div>

        <div className="col-md-4" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card" style={{ borderLeft: '4px solid #9b59b6' }}>
            <div className="benefit-icon">
              <i className="bi bi-node-plus"></i>
            </div>
            <h3>Factores Biológicos</h3>
            <p>
              La biología también influye en el desarrollo de los TCA, genera una predisposición
              neuroquímica que hacen a algunas personas más vulnerables.
            </p>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      {/* Sección 2: Consecuencias en la salud */}
      <h2 className="section-title" data-aos="fade-up">Consecuencias en la Salud</h2>

      <p className="mb-4">
        Las implicaciones físicas son alarmantes: el TCA no solo afecta la mente, sino que daña
        silenciosamente al corazón, el sistema digestivo, los riñones y los huesos, robando la
        vitalidad de quien lo padece.
      </p>

      {/* IMAGEN 3 - SALUD INTEGRAL */}
      {/* PROMPT: "Ilustración médica artística de una silueta humana transparente mostrando diferentes
          órganos afectados: corazón, sistema digestivo, cerebro, huesos. Elementos visuales que indiquen
          fragilidad o debilidad. Colores azules y morados, estilo semi-realista con toques artísticos.
          Fondo oscuro o degradado. Ilustración médica profesional con sensibilidad artística." */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/tca2.webp"
          alt="Impacto en la salud física y mental"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <div className="row gy-3 mb-5">
        <div className="col-md-4" data-aos="fade-up">
          <div className="idea-card">
            <i class="bi bi-person-heart"></i>
            <h4>A nivel psicológico</h4>
            <p>
              El trastorno distorsiona la imagen que la persona tiene de sí misma y la relación
              fundamental con la comida. Esto crea la dolorosa sensación de que los estándares
              autoimpuestos son inalcanzables.
            </p>
          </div>
        </div>
        <div className="col-md-4" data-aos="fade-up">
          <div className="idea-card">
            <i className="bi bi-activity"></i>
            <h4>A nivel físico</h4>
            <p>
              Daño al corazón, sistema digestivo, riñones y huesos. Desnutrición, pérdida de masa
              muscular, irregularidades menstruales, problemas dentales y deterioro general de la salud.
            </p>
          </div>
        </div>
        <div className="col-md-4" data-aos="fade-up">
          <div className="idea-card">
            <i className="bi bi-people-fill"></i>
            <h4>A nivel social</h4>
            <p>
              El TCA genera un profundo aislamiento. La interacción con amigos y familiares se limita,
              especialmente en situaciones sociales que giran en torno a la comida.
            </p>
          </div>
        </div>
      </div>

      <div className="warning-box mb-5" data-aos="fade-up">
        <i className="bi bi-exclamation-triangle-fill"></i>
        <div>
          <p className="mb-2"><strong>Una avalancha de emociones:</strong></p>
          <p className="mb-0">
            Se desata una avalancha de miedo, ansiedad y culpa, ya sea por el castigo autoimpuesto
            o por la impotencia de no poder controlar el ciclo destructivo. Esta angustia consume
            la atención del individuo, robándole la posibilidad de disfrutar de la compañía y conexión
            con su entorno.
          </p>
        </div>
      </div>

      <hr className="my-5" />

      {/* Sección 3: Los Tipos más Comunes */}
      <h2 className="section-title" data-aos="fade-up">Los Tipos más Comunes</h2>

      <p className="mb-4">
        Cada trastorno tiene características específicas, pero todos comparten el mismo dolor:
        una relación rota con la comida y con uno mismo.
      </p>

      {/* IMAGEN 4 - TIPOS DE TCA */}
      {/* PROMPT: "Ilustración conceptual con tres paneles mostrando diferentes representaciones abstractas
          de los TCA: un plato vacío con cadenas (anorexia), un ciclo repetitivo de platos (bulimia),
          y comida desbordándose (atracón). Estilo minimalista y artístico, colores suaves: lavanda,
          menta y durazno. Ilustración digital profesional, composición simétrica." */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/tca3.webp"
          alt="Tipos de Trastornos de Conducta Alimentaria"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      {/* Tabla de tipos de TCA */}
      <div className="table-responsive mb-5" data-aos="fade-up">
        <table className="table table-bordered" style={{
          border: '2px solid #9b59b6',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <thead style={{ background: 'linear-gradient(135deg, #9b59b6 0%, #b180c7 100%)', color: 'white' }}>
            <tr>
              <th style={{ width: '30%', padding: '1rem' }}>Trastorno</th>
              <th style={{ padding: '1rem' }}>Características</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ fontWeight: '700', color: '#9b59b6', verticalAlign: 'top', padding: '1rem' }}>
                Anorexia Nerviosa (AN)
              </td>
              <td style={{ padding: '1rem' }}>
                Es la restricción extrema impulsada por un miedo intenso a subir de peso, acompañado
                de una imagen corporal que el espejo nunca acepta, por el contrario critica.
              </td>
            </tr>
            <tr style={{ background: '#f8f9fa' }}>
              <td style={{ fontWeight: '700', color: '#9b59b6', verticalAlign: 'top', padding: '1rem' }}>
                Bulimia Nerviosa (BN)
              </td>
              <td style={{ padding: '1rem' }}>
                Es caracterizada por episodios de atracones de comida incontrolables, seguidos por una
                culpa devastadora que lleva a la persona a buscar formas de compensación, como el vómito
                o tomar laxantes.
              </td>
            </tr>
            <tr>
              <td style={{ fontWeight: '700', color: '#9b59b6', verticalAlign: 'top', padding: '1rem' }}>
                Trastorno por Atracón (TA)
              </td>
              <td style={{ padding: '1rem' }}>
                Se manifiesta en episodios de ingesta excesiva, donde la comida se usa como un escape
                temporal, seguido por una profunda tristeza y sensación de pérdida de control.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <hr className="my-5" />

      {/* Sección 4: Señales importantes */}
      <h2 className="section-title" data-aos="fade-up">Señales Importantes</h2>

      <p className="mb-5">
        La detección temprana es un acto de amor urgente. Hay cambios que no pueden ignorarse:
      </p>

      {/* IMAGEN 5 - SEÑALES DE ALERTA */}
      {/* PROMPT: "Ilustración de señales de advertencia con íconos sutiles: báscula, calendario menstrual,
          persona haciendo ejercicio compulsivo, plato con porciones pequeñas, persona aislada. Diseño
          infográfico moderno con colores coral y turquesa. Estilo limpio y profesional, ilustración
          vectorial. Composición balanceada y clara." */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/tca4.webp"
          alt="Señales de alerta de los TCA"
          style={{ width: '100%', height: '650px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <div className="recipe-section mb-5" data-aos="fade-up">
        <div className="recipe-number">1</div>
        <h3 className="recipe-title">Cambios Físicos</h3>
        <div className="recipe-content">
          <ul>
            <li>Variaciones de peso notorias y rápidas</li>
            <li>Mareos constantes o sensación de frío persistente</li>
            <li>En el caso de las mujeres, pérdida de los ciclos menstruales</li>
            <li>Fatiga crónica y debilidad general</li>
            <li>Problemas digestivos frecuentes</li>
          </ul>
        </div>
      </div>

      <div className="recipe-section mb-5" data-aos="fade-up">
        <div className="recipe-number">2</div>
        <h3 className="recipe-title">Comportamiento con la Comida</h3>
        <div className="recipe-content">
          <ul>
            <li>Obsesión por contar calorías o investigar la comida</li>
            <li>Evitar comer en reuniones sociales</li>
            <li>Esconder alimentos o limitar las porciones al extremo</li>
            <li>Rituales rígidos alrededor de la comida</li>
            <li>Visitas frecuentes al baño después de comer</li>
          </ul>
        </div>
      </div>

      <div className="recipe-section mb-5" data-aos="fade-up">
        <div className="recipe-number">3</div>
        <h3 className="recipe-title">Ejercicio Forzado</h3>
        <div className="recipe-content">
          <p className="mb-3">
            La práctica de ejercicio físico se vuelve una obligación compulsiva, sin importar la
            enfermedad o lesión.
          </p>
          <div className="tips-box" style={{ background: 'linear-gradient(135deg, #fff5f7 0%, #ffe6f0 100%)', borderLeft: '4px solid #9b59b6' }}>
            <i className="bi bi-exclamation-triangle-fill"></i>
            <div>
              <p className="mb-0">
                <strong>Atención:</strong> El ejercicio compulsivo es un mecanismo de compensación
                que puede causar lesiones graves y agotamiento extremo.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="recipe-section mb-5" data-aos="fade-up">
        <div className="recipe-number">4</div>
        <h3 className="recipe-title">Aspectos Emocionales</h3>
        <div className="recipe-content">
          <ul>
            <li>Aislamiento progresivo de amigos y familiares</li>
            <li>Irritabilidad constante y cambios de humor</li>
            <li>Crítica cruel e incesante hacia el propio cuerpo</li>
            <li>Ansiedad y depresión relacionadas con la comida o el peso</li>
            <li>Perfeccionismo extremo y miedo al fracaso</li>
          </ul>
        </div>
      </div>

      <hr className="my-5" />

      {/* Sección 5: Cómo Ofrecer un Refugio de Apoyo */}
      <h2 className="section-title" data-aos="fade-up">Cómo Ofrecer un Refugio de Apoyo</h2>

      <p className="mb-5">
        Ayudar a alguien con un TCA requiere que cada día recordemos tener paciencia, ternura y comprensión.
      </p>

      {/* IMAGEN 6 - APOYO Y COMPASIÓN */}
      {/* PROMPT: "Ilustración emocional de dos personas en un abrazo de apoyo, una consolando a la otra.
          Ambiente cálido y acogedor, luz suave dorada. Colores pasteles: amarillo suave, rosa claro,
          azul cielo. Estilo ilustración digital emotiva y tierna. Sentimiento de esperanza y compañía.
          Fondo con elementos abstractos que sugieren apoyo y seguridad." */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/tca5.webp"
          alt="Ofreciendo apoyo a personas con TCA"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <div className="recipe-section mb-5" data-aos="fade-up">
        <div className="recipe-number">1</div>
        <h3 className="recipe-title">Hablar y Escuchar con Apertura</h3>
        <div className="recipe-content">
          <p className="mb-3">
            La conversación debe centrarse siempre en la preocupación por su salud y bienestar,
            nunca en juzgar su peso o sus hábitos. La crítica solo añade más culpa y sensación de
            descontrol en la persona.
          </p>
          <div className="tips-box" style={{ background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)', borderLeft: '4px solid #4caf50' }}>
            <i className="bi bi-chat-heart-fill"></i>
            <div>
              <p className="mb-0">
                <strong>Consejo:</strong> En lugar de "¿Por qué no comes?" prueba con "Me preocupa
                tu bienestar, ¿cómo puedo apoyarte?"
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="recipe-section mb-5" data-aos="fade-up">
        <div className="recipe-number">2</div>
        <h3 className="recipe-title">Evitar el Juicio (Siempre)</h3>
        <div className="recipe-content">
          <p className="mb-3">
            Frases como "Deberías comer más" o "Ahora te ves mejor" incrementa el sufrimiento y el miedo.
            El apoyo debe ser incondicional y sin reproches.
          </p>
          <div className="warning-box" style={{ background: '#fff3cd', border: '1px solid #856404', padding: '1rem', borderRadius: '8px' }}>
            <i className="bi bi-x-circle-fill" style={{ color: '#856404' }}></i>
            <div>
              <p className="mb-2"><strong>Evita decir:</strong></p>
              <ul style={{ marginBottom: '0', paddingLeft: '1.5rem' }}>
                <li>"Simplemente come"</li>
                <li>"Te ves muy delgado/a"</li>
                <li>"Es solo cuestión de voluntad"</li>
                <li>"Otros tienen problemas peores"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="recipe-section mb-5" data-aos="fade-up">
        <div className="recipe-number">3</div>
        <h3 className="recipe-title">Fomentar la Ayuda Profesional</h3>
        <div className="recipe-content">
          <p className="mb-3">
            El tratamiento es un equipo de vida: médico, psicológico y nutricional. El rol del familiar
            o amigo es acompañar y facilitar el acceso a este apoyo especializado.
          </p>
          <div className="row gy-3">
            <div className="col-md-4">
              <div className="idea-card" style={{ borderLeft: '4px solid #2196f3' }}>
                <i className="bi bi-hospital"></i>
                <h4>Médico</h4>
                <p>Evaluación física y tratamiento de complicaciones de salud.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="idea-card" style={{ borderLeft: '4px solid #2196f3' }}>
                <i className="bi bi-heart-pulse"></i>
                <h4>Psicológico</h4>
                <p>Terapia individual y familiar para abordar las causas emocionales.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="idea-card" style={{ borderLeft: '4px solid #2196f3' }}>
                <i className="bi bi-egg-fried"></i>
                <h4>Nutricional</h4>
                <p>Plan alimenticio personalizado y reeducación nutricional.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="recipe-section mb-5" data-aos="fade-up">
        <div className="recipe-number">4</div>
        <h3 className="recipe-title">Ser un Refugio</h3>
        <div className="recipe-content">
          <p className="mb-3">
            El proceso es largo y complejo. La tarea es ofrecer un hombro y un lugar seguro, recordando
            que la paciencia es la mayor prueba de amor en este camino.
          </p>
          <div className="alert-info" data-aos="fade-up" style={{
            background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
            border: '2px solid #2196f3',
            padding: '1.5rem',
            borderRadius: '8px'
          }}>
            <i className="bi bi-heart-fill me-2" style={{ color: '#2196f3' }}></i>
            <strong>Recuerda:</strong> La recuperación no es lineal. Habrá días buenos y días difíciles.
            Tu presencia constante y tu amor incondicional son el mayor regalo que puedes ofrecer.
          </div>
        </div>
      </div>

      <hr className="my-5" />

      {/* IMAGEN 7 - ESPERANZA Y RECUPERACIÓN */}
      {/* PROMPT: "Ilustración inspiradora mostrando una persona saliendo de la oscuridad hacia la luz,
          con mariposas representando la transformación y libertad. Colores que transicionan de azul
          oscuro a amarillo dorado brillante. Estilo artístico digital emotivo. Sentimiento de esperanza,
          superación y nueva vida. Composición vertical ascendente." */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/tca6.webp"
          alt="Esperanza y recuperación de los TCA"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      {/* Mensaje de cierre */}
      <div className="alert-info mb-5" data-aos="fade-up" style={{
        background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
        border: '2px solid #9b59b6',
        padding: '2rem'
      }}>
        <div className="d-flex align-items-start">
          <i className="bi bi-heart-fill me-3" style={{ fontSize: '2rem', color: '#9b59b6' }}></i>
          <div>
            <h4 style={{ color: '#9b59b6', fontWeight: '700', marginBottom: '1rem' }}>
              No Están Solos
            </h4>
            <p className="mb-3" style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
              El 30 de noviembre es un recordatorio de que no están solos. Se promueve una cultura
              donde la salud mental y la aceptación corporal sean prioridades absolutas.
            </p>
            <p className="mb-0" style={{ fontWeight: '600', fontSize: '1.2rem', fontStyle: 'italic', color: '#7b1fa2' }}>
              "El amor y la compasión hacia uno mismo son las pruebas más poderosas para lograr la recuperación."
            </p>
          </div>
        </div>
      </div>

      {/* Recursos de ayuda */}
      <h3 className="mb-4" style={{ color: '#2d465e', fontWeight: '700' }}>
        ¿Necesitas ayuda o conoces a alguien que la necesita?
      </h3>

      <div className="tips-box mb-5" data-aos="fade-up">
        <i className="bi bi-telephone-fill"></i>
        <div>
          <p className="mb-4">En Perú existen recursos de apoyo para personas con TCA:</p>

          <div className="row">
            <div className="col-md-6">
              <ul style={{ listStyle: 'none', paddingLeft: '0' }}>
                <li className="mb-3">
                  <strong><i className="bi bi-hospital-fill me-2" style={{ color: '#9b59b6' }}></i>Instituto Nacional de Salud Mental:</strong>
                  {' '}Atención especializada en trastornos alimentarios.{' '}
                  <a href="https://www.insm.gob.pe"
                     target="_blank"
                     rel="noopener noreferrer"
                     style={{ color: '#0d6efd', fontSize: '0.9rem', textDecoration: 'none' }}>
                    [Más información]
                  </a>
                </li>
                <li className="mb-3">
                  <strong><i className="bi bi-heart-pulse-fill me-2" style={{ color: '#9b59b6' }}></i>Centro Crecemos:</strong>
                  {' '}Apoyo psicológico y nutricional especializado.{' '}
                  <a href="https://www.crecemos.com.pe"
                     target="_blank"
                     rel="noopener noreferrer"
                     style={{ color: '#0d6efd', fontSize: '0.9rem', textDecoration: 'none' }}>
                    [Contactar]
                  </a>
                </li>
              </ul>
            </div>
            <div className="col-md-6">
              <ul style={{ listStyle: 'none', paddingLeft: '0' }}>
                <li className="mb-3">
                  <strong><i className="bi bi-telephone-fill me-2" style={{ color: '#9b59b6' }}></i>Línea 113 - Salud:</strong>
                  {' '}Orientación en salud mental gratuita.
                </li>
                <li className="mb-3">
                  <strong><i className="bi bi-chat-dots-fill me-2" style={{ color: '#9b59b6' }}></i>Grupos de Apoyo:</strong>
                  {' '}Comunidades de personas en recuperación que se apoyan mutuamente.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      {/* Créditos - Autora */}
      <div className="author-credits mb-5" data-aos="fade-up">
        <div style={{
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          padding: '2rem',
          borderRadius: '12px',
          border: '2px solid #9b59b6'
        }}>
          <h4 style={{ marginBottom: '1.5rem', color: '#2d465e', fontWeight: '700', fontSize: '1.1rem' }}>
            Elaborado por:
          </h4>
          <div className="d-flex align-items-start mb-3">
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #9b59b6 0%, #b180c7 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '1rem',
              flexShrink: '0'
            }}>
              <i className="bi bi-person-circle" style={{ fontSize: '2rem', color: 'white' }}></i>
            </div>
            <div style={{ flex: '1' }}>
              <h5 style={{ marginBottom: '0.5rem', color: '#2d465e', fontWeight: '700', fontSize: '1.15rem' }}>
                Lic. Giselle Burgos Del Rosario
              </h5>
              <p style={{ marginBottom: '0.75rem', color: '#666', fontSize: '0.95rem', lineHeight: '1.5' }}>
                <i className="bi bi-award-fill me-2" style={{ color: '#9b59b6' }}></i>
                Psicóloga Clínica - Centro Crecemos
              </p>
              <a
                href="https://www.crecemos.com.pe"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#9b59b6',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '0.95rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                onMouseOut={(e) => e.target.style.textDecoration = 'none'}
              >
                <i className="bi bi-globe me-2"></i>
                www.crecemos.com.pe
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
