import React from 'react';

export default function RabietaRegulacionEmocionalBlog() {
  return (
    <>
      {/* Introducción principal */}
      <div className="lead mb-5" style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#555' }}>
        Durante la infancia, los niños se encuentran en un proceso constante de aprendizaje para
        <strong> identificar, expresar y regular sus emociones</strong>. Sentir enojo, frustración, tristeza o
        molestia forma parte del desarrollo emocional y no significa necesariamente que exista una dificultad.
      </div>

      <p className="mb-4">
        En los primeros años de vida, las rabietas son manifestaciones frecuentes dentro del desarrollo esperado,
        debido a que el niño aún se encuentra desarrollando habilidades como la comunicación, la tolerancia a la
        frustración y el control de impulsos.
      </p>

      <p className="mb-5">
        Sin embargo, en algunos casos, las reacciones emocionales pueden ser más intensas, frecuentes o difíciles de
        manejar, llegando a <strong>interferir con la vida cotidiana</strong> del niño y su entorno. En estas
        situaciones es importante comprender qué está ocurriendo y considerar una orientación profesional.
      </p>

      {/* Imagen hero 1 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/rabieta-1.webp"
          alt="Niño pequeño expresando una rabieta acompañado por su madre"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <hr className="my-5" />

      {/* Sección 1: Qué es una rabieta */}
      <h2 className="section-title" data-aos="fade-up">¿Qué es una rabieta?</h2>

      <p className="mb-4">
        Una rabieta es una <strong>expresión intensa de una emoción</strong>, generalmente relacionada con
        frustración, enojo, cansancio o dificultad para aceptar un límite. Las rabietas forman parte del desarrollo
        emocional infantil, ya que los niños todavía están adquiriendo habilidades para manejar la frustración y
        regular sus respuestas emocionales (Eisenberg et al., 2010).
      </p>

      <p className="mb-4">En los niños pequeños puede aparecer cuando:</p>

      <div className="row gy-4 mb-5">
        <div className="col-md-4" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card" style={{ borderLeft: '4px solid #9b59b6' }}>
            <div className="benefit-icon">
              <i className="bi bi-x-circle"></i>
            </div>
            <h3>No obtienen lo que desean</h3>
            <p>No consiguen algo que querían en ese momento.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card" style={{ borderLeft: '4px solid #9b59b6' }}>
            <div className="benefit-icon">
              <i className="bi bi-stopwatch"></i>
            </div>
            <h3>Deben terminar o esperar</h3>
            <p>Tienen que terminar una actividad que disfrutan o esperar su turno.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card" style={{ borderLeft: '4px solid #9b59b6' }}>
            <div className="benefit-icon">
              <i className="bi bi-hand-index-thumb"></i>
            </div>
            <h3>Reciben un límite</h3>
            <p>Reciben una negativa o un límite que les cuesta aceptar.</p>
          </div>
        </div>

        <div className="col-md-12" data-aos="fade-up" data-aos-delay="400">
          <div className="benefit-card" style={{ borderLeft: '4px solid #9b59b6' }}>
            <div className="benefit-icon">
              <i className="bi bi-chat-square-text"></i>
            </div>
            <h3>Les cuesta expresar lo que sienten</h3>
            <p>Aún no logran poner en palabras lo que están sintiendo.</p>
          </div>
        </div>
      </div>

      <p className="mb-4">
        Durante una rabieta, el niño puede llorar, gritar, protestar, tirarse al suelo o negarse a realizar una
        actividad. Estas conductas <strong>no siempre representan una dificultad emocional</strong>; forman parte del
        aprendizaje progresivo de la autorregulación.
      </p>

      <div className="tips-box mb-5" data-aos="fade-up" style={{
        background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
        borderLeft: '4px solid #9b59b6',
        padding: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <i className="bi bi-lightbulb-fill" style={{ fontSize: '2rem', color: '#8e44ad', flexShrink: 0 }}></i>
          <div>
            <h4 style={{ color: '#8e44ad', marginBottom: '1rem' }}>Ejemplo</h4>
            <p style={{ marginBottom: '0', lineHeight: '1.8' }}>
              Un niño quiere seguir jugando, pero es momento de irse a casa. Puede molestarse, llorar o protestar
              porque le cuesta aceptar el cambio de actividad. <strong>Con acompañamiento del adulto, logra calmarse
              y continuar con la rutina.</strong>
            </p>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      {/* Sección 2: Qué es la regulación emocional */}
      <h2 className="section-title" data-aos="fade-up">¿Qué es la regulación emocional?</h2>

      <p className="mb-4">
        La regulación emocional es la <strong>capacidad que desarrolla el niño para reconocer, comprender y manejar
        progresivamente sus emociones</strong>, modulando sus respuestas ante diferentes situaciones (Gross, 2015).
      </p>

      <p className="mb-4">
        Durante la infancia, esta habilidad todavía está en desarrollo. Por ello, los niños necesitan del
        acompañamiento de los adultos para aprender a:
      </p>

      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card" style={{ borderLeft: '4px solid #3498db' }}>
            <div className="benefit-icon">
              <i className="bi bi-emoji-neutral"></i>
            </div>
            <h3>Identificar lo que sienten</h3>
            <p>Reconocer sus emociones y las sensaciones corporales que las acompañan.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card" style={{ borderLeft: '4px solid #3498db' }}>
            <div className="benefit-icon">
              <i className="bi bi-chat-heart"></i>
            </div>
            <h3>Expresar sus emociones</h3>
            <p>Comunicar lo que sienten y lo que necesitan de forma adecuada.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card" style={{ borderLeft: '4px solid #3498db' }}>
            <div className="benefit-icon">
              <i className="bi bi-hourglass-split"></i>
            </div>
            <h3>Tolerar la frustración</h3>
            <p>Sostener situaciones difíciles, esperar y adaptarse a los cambios.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
          <div className="benefit-card" style={{ borderLeft: '4px solid #3498db' }}>
            <div className="benefit-icon">
              <i className="bi bi-peace"></i>
            </div>
            <h3>Recuperar la calma</h3>
            <p>Utilizar estrategias para calmarse y comprender lo que ocurre en su entorno.</p>
          </div>
        </div>
      </div>

      <div className="alert-info mb-5" data-aos="fade-up">
        <i className="bi bi-info-circle-fill me-2"></i>
        Un niño pequeño <strong>no nace sabiendo controlar sus emociones</strong>; esta habilidad se construye
        mediante experiencias repetidas de acompañamiento, límites consistentes y enseñanza emocional.
      </div>

      <hr className="my-5" />

      {/* Sección 3: Cuándo indica dificultad */}
      <h2 className="section-title" data-aos="fade-up">
        ¿Cuándo una rabieta puede indicar una dificultad en la regulación emocional?
      </h2>

      <p className="mb-4">
        No es la presencia de una rabieta aislada lo que determina una dificultad. Es importante observar
        características como la <strong>intensidad, frecuencia, duración y el impacto</strong> que tiene en la vida del
        niño. Algunas señales de alerta son:
      </p>

      {/* Imagen 2 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/rabieta-2.webp"
          alt="Padre acompañando con calma a su hijo durante una emoción intensa"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card" style={{ borderLeft: '4px solid #27ae60', height: '100%' }}>
            <div className="benefit-icon" style={{ background: '#43a047', color: '#ffffff' }}>
              <i className="bi bi-check2-circle"></i>
            </div>
            <h3>Rabieta esperable del desarrollo</h3>
            <p className="mb-2">Aparece ante una frustración concreta (no obtener algo, esperar, terminar una actividad).</p>
            <p className="mb-2">Progresivamente recupera la calma con el acompañamiento del adulto.</p>
            <p className="mb-2">Disminuye conforme adquiere nuevas habilidades para expresar emociones.</p>
            <p className="mb-2">Puede aceptar límites después de un periodo de acompañamiento.</p>
            <p className="mb-2">No afecta significativamente sus relaciones, aprendizaje o actividades.</p>
            <p className="mb-0">Aprende nuevas estrategias cuando se le enseñan y practica en calma.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card" style={{ borderLeft: '4px solid #e74c3c', height: '100%' }}>
            <div className="benefit-icon" style={{ background: '#e53935', color: '#ffffff' }}>
              <i className="bi bi-exclamation-triangle"></i>
            </div>
            <h3>Dificultad en la regulación emocional</h3>
            <p className="mb-2">Aparece ante situaciones pequeñas o difíciles de identificar, con respuestas desproporcionadas.</p>
            <p className="mb-2">Mucha dificultad para volver a la calma, incluso con apoyo, durante periodos prolongados.</p>
            <p className="mb-2">Las dificultades se mantienen en el tiempo y afectan casa, colegio y actividades sociales.</p>
            <p className="mb-2">Dificultad frecuente para aceptar límites, cambios o frustración.</p>
            <p className="mb-2">Las reacciones interfieren con la convivencia, la escuela y las relaciones.</p>
            <p className="mb-0">Requiere apoyo específico para desarrollar identificación emocional y control de impulsos.</p>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      {/* Sección 4: Por qué algunos niños */}
      <h2 className="section-title" data-aos="fade-up">
        ¿Por qué algunos niños tienen más dificultades para regular sus emociones?
      </h2>

      <p className="mb-4">
        La regulación emocional se desarrolla de manera diferente en cada niño. Algunas dificultades pueden
        relacionarse con diversos factores, como:
      </p>

      <div className="row gy-4 mb-5">
        <div className="col-md-4" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card" style={{ borderLeft: '4px solid #9b59b6' }}>
            <div className="benefit-icon">
              <i className="bi bi-person-heart"></i>
            </div>
            <h3>Temperamento</h3>
            <p>Características propias del temperamento de cada niño.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card" style={{ borderLeft: '4px solid #9b59b6' }}>
            <div className="benefit-icon">
              <i className="bi bi-chat-dots"></i>
            </div>
            <h3>Comunicación</h3>
            <p>Nivel de desarrollo de sus habilidades de comunicación.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card" style={{ borderLeft: '4px solid #9b59b6' }}>
            <div className="benefit-icon">
              <i className="bi bi-lightning-charge"></i>
            </div>
            <h3>Control de impulsos</h3>
            <p>Dificultades para controlar impulsos ante la frustración.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="fade-up" data-aos-delay="400">
          <div className="benefit-card" style={{ borderLeft: '4px solid #9b59b6' }}>
            <div className="benefit-icon">
              <i className="bi bi-arrow-repeat"></i>
            </div>
            <h3>Atención y flexibilidad</h3>
            <p>Dificultades de atención o de flexibilidad cognitiva.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="fade-up" data-aos-delay="500">
          <div className="benefit-card" style={{ borderLeft: '4px solid #9b59b6' }}>
            <div className="benefit-icon">
              <i className="bi bi-house-exclamation"></i>
            </div>
            <h3>Estrés o cambios</h3>
            <p>Estrés o cambios importantes en el entorno del niño.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="fade-up" data-aos-delay="600">
          <div className="benefit-card" style={{ borderLeft: '4px solid #9b59b6' }}>
            <div className="benefit-icon">
              <i className="bi bi-puzzle"></i>
            </div>
            <h3>Necesidades del desarrollo</h3>
            <p>Necesidades específicas propias de su desarrollo.</p>
          </div>
        </div>
      </div>

      <div className="alert-info mb-5" data-aos="fade-up">
        <i className="bi bi-search me-2"></i>
        Comprender la causa permite <strong>elegir estrategias de apoyo más adecuadas.</strong>
      </div>

      <hr className="my-5" />

      {/* Sección 5: Cómo ayudar los padres */}
      <h2 className="section-title" data-aos="fade-up">¿Cómo pueden ayudar los padres?</h2>

      {/* Imagen 3 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/rabieta-3.webp"
          alt="Madre validando la emoción de su hijo con calma"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <div className="recipe-section mb-5" data-aos="fade-up">
        <div className="recipe-number">1</div>
        <h3 className="recipe-title">Validar la emoción sin reforzar conductas inadecuadas</h3>
        <div className="recipe-content">
          <p className="mb-3">
            Validar significa reconocer lo que el niño siente, sin permitir conductas que puedan dañarlo o afectar a otros.
          </p>
          <p className="mb-0" style={{ fontStyle: 'italic', color: '#8e44ad' }}>
            "Entiendo que estás molesto porque querías seguir jugando, pero no podemos golpear".
          </p>
        </div>
      </div>

      <div className="recipe-section mb-5" data-aos="fade-up">
        <div className="recipe-number">2</div>
        <h3 className="recipe-title">Enseñar alternativas para expresar emociones</h3>
        <div className="recipe-content">
          <p className="mb-3">
            Los niños necesitan aprender qué pueden hacer cuando sienten enojo o frustración. Se recomienda utilizar
            apoyo visual para los más pequeños. Algunas alternativas pueden ser:
          </p>
          <ul className="feature-list mb-0">
            <li><i className="bi bi-check-circle-fill"></i> Pedir ayuda</li>
            <li><i className="bi bi-check-circle-fill"></i> Usar palabras para expresar lo que sienten</li>
            <li><i className="bi bi-check-circle-fill"></i> Tomar un descanso</li>
            <li><i className="bi bi-check-circle-fill"></i> Utilizar estrategias de calma</li>
          </ul>
        </div>
      </div>

      <div className="recipe-section mb-5" data-aos="fade-up">
        <div className="recipe-number">3</div>
        <h3 className="recipe-title">Establecer límites claros y consistentes</h3>
        <div className="recipe-content">
          <p className="mb-3">
            Los límites ayudan al niño a sentirse seguro y aprender qué conductas son adecuadas. Un límite puede ser
            firme y, al mismo tiempo, respetuoso:
          </p>
          <p className="mb-0" style={{ fontStyle: 'italic', color: '#8e44ad' }}>
            "Puedes estar enojado, pero no puedes lastimar a otros".
          </p>
        </div>
      </div>

      <div className="recipe-section mb-5" data-aos="fade-up">
        <div className="recipe-number">4</div>
        <h3 className="recipe-title">Enseñar estrategias cuando el niño está tranquilo</h3>
        <div className="recipe-content">
          <p className="mb-0">
            Durante una crisis emocional, el niño tiene mayor dificultad para aprender nuevas habilidades. Por ello,
            las estrategias de regulación deben <strong>practicarse en momentos de calma</strong>.
          </p>
        </div>
      </div>

      <hr className="my-5" />

      {/* Sección 6: Cuándo buscar apoyo */}
      <h2 className="section-title" data-aos="fade-up">¿Cuándo buscar apoyo psicológico?</h2>

      <p className="mb-4">
        Puede ser recomendable solicitar orientación profesional cuando:
      </p>

      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card" style={{ borderLeft: '4px solid #e74c3c' }}>
            <div className="benefit-icon" style={{ background: '#e53935', color: '#ffffff' }}>
              <i className="bi bi-activity"></i>
            </div>
            <h3>Crisis muy frecuentes o intensas</h3>
            <p>Explosiones emocionales varias veces por semana, con llanto intenso, gritos o dificultad para calmarse incluso ante situaciones pequeñas.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card" style={{ borderLeft: '4px solid #e74c3c' }}>
            <div className="benefit-icon" style={{ background: '#e53935', color: '#ffffff' }}>
              <i className="bi bi-house-heart"></i>
            </div>
            <h3>Afectan la dinámica familiar o escolar</h3>
            <p>La familia evita actividades por temor a su reacción, o en el colegio le cuesta participar en clase, juegos o actividades grupales.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card" style={{ borderLeft: '4px solid #e74c3c' }}>
            <div className="benefit-icon" style={{ background: '#e53935', color: '#ffffff' }}>
              <i className="bi bi-lightning-charge"></i>
            </div>
            <h3>Dificultad para controlar impulsos</h3>
            <p>Ante la frustración empuja, lanza objetos o interrumpe constantemente, sin lograr detenerse aunque reciba indicaciones.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
          <div className="benefit-card" style={{ borderLeft: '4px solid #e74c3c' }}>
            <div className="benefit-icon" style={{ background: '#e53935', color: '#ffffff' }}>
              <i className="bi bi-shield-exclamation"></i>
            </div>
            <h3>Conductas agresivas recurrentes</h3>
            <p>Durante momentos de frustración golpea, muerde, empuja, rompe objetos o utiliza amenazas de manera frecuente.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="500">
          <div className="benefit-card" style={{ borderLeft: '4px solid #e74c3c' }}>
            <div className="benefit-icon" style={{ background: '#e53935', color: '#ffffff' }}>
              <i className="bi bi-emoji-tear"></i>
            </div>
            <h3>Las estrategias ya no funcionan</h3>
            <p>Los padres han puesto límites, dialogado y anticipado situaciones, pero las crisis continúan afectando la convivencia.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="600">
          <div className="benefit-card" style={{ borderLeft: '4px solid #e74c3c' }}>
            <div className="benefit-icon" style={{ background: '#e53935', color: '#ffffff' }}>
              <i className="bi bi-emoji-frown"></i>
            </div>
            <h3>Malestar emocional que afecta su bienestar</h3>
            <p>Evita actividades que antes disfrutaba, se muestra preocupado, frustrado o triste, o le cuesta relacionarse con otros.</p>
          </div>
        </div>
      </div>

      <div className="tips-box mb-5" data-aos="fade-up" style={{
        background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
        borderLeft: '4px solid #9b59b6',
        padding: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <i className="bi bi-clipboard2-pulse-fill" style={{ fontSize: '2rem', color: '#8e44ad', flexShrink: 0 }}></i>
          <div>
            <p style={{ marginBottom: '0', lineHeight: '1.8' }}>
              La <strong>evaluación psicológica</strong> permite comprender qué factores están influyendo en la
              conducta del niño y desarrollar estrategias adaptadas a sus necesidades.
            </p>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      {/* Autor */}
      <div className="mb-5">
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
              background: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
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
              >
                <i className="bi bi-globe me-2"></i>
                www.crecemos.com.pe
              </a>
            </div>
          </div>
        </div>
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
            <strong>American Psychiatric Association.</strong> (2022). <em>Diagnostic and statistical manual of mental
            disorders</em> (5th ed., text rev.; DSM-5-TR). American Psychiatric Association Publishing.
          </p>
          <p className="mb-3">
            <strong>Eisenberg, N., Spinrad, T., &amp; Eggum, N.</strong> (2010). Emotion-related self-regulation and its
            relation to children's maladjustment. <em>Annual Review of Clinical Psychology, 6</em>, 495–525.
          </p>
          <p className="mb-3">
            <strong>Gross, J.</strong> (2015). Emotion regulation: Current status and future prospects.
            <em> Psychological Inquiry, 26</em>(1), 1–26.
          </p>
          <p className="mb-0">
            <strong>Morris, A., Criss, M., Silk, J., &amp; Houltberg, B.</strong> (2017). The impact of parenting on
            emotion regulation during childhood and adolescence. <em>Child Development Perspectives, 11</em>(4), 233–238.
          </p>
        </div>
      </div>
    </>
  );
}
