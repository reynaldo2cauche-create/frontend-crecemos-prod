import React from 'react';

const PRIMARY = '#7B1FA2';
const GREEN = '#A3C644';

const imgStyle = { width: '100%', height: '460px', objectFit: 'cover', borderRadius: '12px' };
const hideOnError = (e) => { e.target.style.display = 'none'; };

export default function IdeacionSuicidaBlog() {
  return (
    <>
      {/* Introducción */}
      <div className="lead mb-5" style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#555' }}>
        No siempre el malestar emocional se expresa de manera tan directa como <em>"quiero morir"</em>.
        A veces aparece en frases cotidianas que preocupan, pero que no sabemos cómo interpretar.
        Hablar de suicidio no es solo reconocer señales de alerta: también implica aprender a
        <strong> preguntar, escuchar, evaluar y actuar</strong>.
      </div>

   

      {/* Frases que pueden aparecer */}
      <div className="alert-info mb-5" style={{ background: 'linear-gradient(135deg, #f3e9f7 0%, #e9dcf0 100%)', border: `2px solid ${PRIMARY}`, padding: '2rem', borderRadius: '12px' }}>
        <h4 style={{ color: PRIMARY, fontWeight: 700, marginBottom: '1.5rem' }}>
          El malestar a veces suena así:
        </h4>
        <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
          {[
            'Ya no puedo más.',
            'Estoy cansado/a de todo.',
            'Quisiera desaparecer.',
            'Soy un problema para todos.',
            'No tiene sentido seguir intentando.',
            'Ojalá pudiera dormir y no despertar.',
          ].map((f) => (
            <li key={f} className="mb-3" style={{ fontSize: '1.05rem', lineHeight: 1.6 }}>
              <i className="bi bi-quote me-2" style={{ color: PRIMARY }}></i><em>{f}</em>
            </li>
          ))}
        </ul>
        <p className="mb-0 mt-3" style={{ fontSize: '1rem', fontStyle: 'italic', color: '#555' }}>
          Estas frases no significan automáticamente que exista riesgo suicida, pero tampoco deberían
          descartarse sin explorar qué hay detrás de ellas.
        </p>
      </div>

      <hr className="my-5" />

      {/* Cuando una frase merece una segunda pregunta */}
      <h2 className="section-title">Cuando una frase merece una segunda pregunta</h2>
      <p className="mb-4">
        Imaginemos que un adolescente llega a casa después de un día difícil y dice:
        <em> "Ya no quiero seguir con nada."</em> Es natural responder <em>"no digas eso, mañana será
        otro día"</em>. La intención es buena, pero puede ser más útil detenerse y preguntar:
      </p>
      <div className="tips-box mb-5" style={{ background: 'linear-gradient(135deg, #f3f8e8 0%, #eaf2d4 100%)', borderLeft: `4px solid ${GREEN}` }}>
        <i className="bi bi-chat-heart-fill"></i>
        <div>
          <p className="mb-0" style={{ fontSize: '1.05rem' }}>
            "Cuando dices que ya no quieres seguir, ¿te refieres a que estás cansado de esta situación
            o has estado pensando en morir?"
          </p>
        </div>
      </div>

      <div className="recipe-image-placeholder mb-5">
        <img src="/assets/img/blog/ideacion1.webp" alt="Conversar con calma y sin juzgar" style={imgStyle} onError={hideOnError} />
      </div>

      <div className="warning-box mb-5">
        <i className="bi bi-info-circle-fill"></i>
        <div>
          <p className="mb-0">
            El <strong>NIMH</strong> señala que preguntar directamente sobre pensamientos suicidas
            <strong> no aumenta el riesgo</strong> y ayuda a identificar a quienes necesitan una
            evaluación posterior.
          </p>
        </div>
      </div>

      <hr className="my-5" />

      {/* Algunas formas de preguntar */}
      <h2 className="section-title">Algunas formas de preguntar</h2>
      <p className="mb-4">En lugar de interpretar, podemos preguntar:</p>
      <div className="row gy-3 mb-5">
        {[
          '"Cuando dices que quisieras desaparecer, ¿a qué te refieres exactamente?"',
          '"¿Has tenido pensamientos de hacerte daño o de quitarte la vida?"',
          '"¿Estos pensamientos aparecen ahora o fueron en otro momento?"',
          '"¿Con qué frecuencia aparecen?"',
          '"¿Sientes que podrías mantenerte seguro/a en este momento?"',
        ].map((q, i) => (
          <div className="col-md-6" key={i}>
            <div className="benefit-card" style={{ borderLeft: `4px solid ${PRIMARY}` }}>
              <div className="benefit-icon"><i className="bi bi-question-circle"></i></div>
              <p className="mb-0" style={{ fontSize: '1.02rem' }}>{q}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mb-4" style={{ fontStyle: 'italic', color: '#555' }}>
        Su objetivo no es asustar ni obtener una respuesta rápida, sino comprender el nivel de riesgo
        y decidir qué tipo de ayuda se necesita.
      </p>

      <hr className="my-5" />

      {/* No todo tiene el mismo nivel de riesgo */}
      <h2 className="section-title">No todo tiene el mismo nivel de riesgo</h2>
      <p className="mb-4">
        Una dificultad frecuente es pensar en términos de "tiene" o "no tiene" ideación suicida. La
        realidad clínica requiere mayor precisión: una persona puede expresar pensamientos de muerte
        sin intención inmediata de actuar, mientras que otra puede estar en una crisis de riesgo
        considerablemente mayor.
      </p>

      <div className="recipe-image-placeholder mb-5">
        <img src="/assets/img/blog/ideacion2.webp" alt="Distintos niveles de riesgo" style={imgStyle} onError={hideOnError} />
      </div>

      <div className="alert-info mb-5" style={{ background: 'linear-gradient(135deg, #f3e9f7 0%, #e9dcf0 100%)', border: `2px solid ${PRIMARY}`, padding: '2rem', borderRadius: '12px' }}>
        <h4 style={{ color: PRIMARY, fontWeight: 700, marginBottom: '1rem' }}>Una evaluación adecuada considera:</h4>
        <ul style={{ lineHeight: 1.9, marginBottom: 0 }}>
          <li>La presencia actual de pensamientos suicidas, su frecuencia y evolución.</li>
          <li>Cuándo aparecieron por última vez y si existe intención.</li>
          <li>La existencia de un plan y el acceso a elementos potencialmente peligrosos.</li>
          <li>Antecedentes de intentos o conductas autolesivas y cambios recientes importantes.</li>
          <li>Factores de vulnerabilidad y personas disponibles para brindar apoyo.</li>
          <li>Razones personales para continuar viviendo y la capacidad actual de mantenerse seguro/a.</li>
        </ul>
      </div>

      <hr className="my-5" />

      {/* Qué hacer al escuchar una frase preocupante */}
      <h2 className="section-title">¿Qué hacer al escuchar una frase preocupante?</h2>
      <p className="mb-4">
        El primer objetivo no es encontrar la frase perfecta, sino <strong>mantener abierta la
        comunicación</strong>. Una respuesta útil puede ser:
      </p>
      <div className="tips-box mb-4" style={{ background: 'linear-gradient(135deg, #f3f8e8 0%, #eaf2d4 100%)', borderLeft: `4px solid ${GREEN}` }}>
        <i className="bi bi-heart-fill"></i>
        <div>
          <p className="mb-2">"Gracias por decírmelo. Quiero entender qué estás viviendo y no voy a juzgarte."</p>
          <p className="mb-0">Y si hay preocupación: "Quiero asegurarme de que estés a salvo. Vamos a buscar ayuda juntos."</p>
        </div>
      </div>

      <div className="recipe-image-placeholder mb-5">
        <img src="/assets/img/blog/ideacion3.webp" alt="Acompañar y sostener" style={imgStyle} onError={hideOnError} />
      </div>

      {/* Lo que decimos con buena intención */}
      <h3 className="mb-4" style={{ color: PRIMARY, fontWeight: 700 }}>Con buena intención… pero puede no ayudar</h3>
      <div className="row gy-4 mb-5">
        <div className="col-md-6">
          <div className="benefit-card" style={{ borderLeft: '4px solid #b0b0b0' }}>
            <h3 style={{ color: '#777' }}>Mejor evitar</h3>
            <ul style={{ lineHeight: 1.8, marginBottom: 0 }}>
              <li>"Tienes muchas cosas buenas en tu vida."</li>
              <li>"Piensa en tu familia."</li>
              <li>"Tienes que ser fuerte."</li>
              <li>"Eso se te va a pasar."</li>
              <li>"Hay personas que están peor."</li>
            </ul>
          </div>
        </div>
        <div className="col-md-6">
          <div className="benefit-card" style={{ borderLeft: `4px solid ${GREEN}` }}>
            <h3 style={{ color: PRIMARY }}>Mejor decir</h3>
            <ul style={{ lineHeight: 1.8, marginBottom: 0 }}>
              <li>"Quiero entender qué te está haciendo sentir así."</li>
              <li>"Puedes contarme lo que pasa, aunque sea difícil."</li>
              <li>"No tienes que resolver todo ahora. Primero vamos a ocuparnos de tu seguridad."</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Promesa vs plan */}
      <div className="warning-box mb-5">
        <i className="bi bi-shield-exclamation"></i>
        <div>
          <p className="mb-2">
            <strong>Una promesa no sustituye un plan de seguridad.</strong> El NIMH señala que los
            "contratos de seguridad" no son efectivos y pueden generar una falsa sensación de seguridad.
          </p>
          <p className="mb-0">
            Cambia <em>"¿Me prometes que no harás nada?"</em> por
            <strong> "¿Qué podemos hacer juntos para mantenerte seguro/a si estos pensamientos vuelven?"</strong>
          </p>
        </div>
      </div>

      <hr className="my-5" />

      {/* PLAN DE ACTUACIÓN */}
      <h2 className="section-title">Plan de actuación ante una crisis</h2>
      <p className="mb-4">
        El siguiente esquema se basa en el <strong>NIMH ASQ Toolkit</strong> y en los principios de
        planificación de seguridad de <strong>Stanley y Brown</strong> (recogidos por SAMHSA). No
        sustituye la valoración de un profesional ni los protocolos locales de emergencia.
      </p>

      <div className="recipe-image-placeholder mb-5">
        <img src="/assets/img/blog/ideacion4.webp" alt="Pasos para acompañar en una crisis" style={imgStyle} onError={hideOnError} />
      </div>

      <div className="row gy-4 mb-5">
        <div className="col-md-4">
          <div className="benefit-card" style={{ borderLeft: `4px solid ${PRIMARY}` }}>
            <div className="benefit-icon"><i className="bi bi-1-circle-fill"></i></div>
            <h3>Preguntar directamente</h3>
            <p>Con calma: "¿Has pensado en hacerte daño o en quitarte la vida? ¿Están presentes ahora? ¿Puedes mantenerte seguro/a?"</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="benefit-card" style={{ borderLeft: `4px solid ${PRIMARY}` }}>
            <div className="benefit-icon"><i className="bi bi-2-circle-fill"></i></div>
            <h3>Determinar si es emergencia</h3>
            <p>Pensamientos actuales con intención o que comprometen la seguridad requieren valoración urgente. No dejar sola a la persona.</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="benefit-card" style={{ borderLeft: `4px solid ${PRIMARY}` }}>
            <div className="benefit-icon"><i className="bi bi-3-circle-fill"></i></div>
            <h3>Construir un plan de seguridad</h3>
            <p>Si no hay riesgo inmediato, se elabora un plan concreto para afrontar posibles crisis futuras.</p>
          </div>
        </div>
      </div>

      {/* Plan de seguridad 6 componentes */}
      <h3 className="mb-4" style={{ color: PRIMARY, fontWeight: 700 }}>Plan de seguridad: 6 componentes (SAMHSA / Stanley y Brown)</h3>
      <div className="row gy-4 mb-5">
        {[
          ['bi-activity', 'Reconocer mis señales de crisis', 'Aislarme, dejar de comunicarme, desesperanza intensa, sentirme una carga.'],
          ['bi-tools', 'Estrategias que puedo hacer solo/a', 'Alejarme de lo que aumenta el malestar, música, respiración, una actividad que requiera concentración.'],
          ['bi-people', 'Personas y espacios que reducen el aislamiento', 'No tiene que ser con quien hable del problema; lo importante es no estar solo/a.'],
          ['bi-telephone', 'A quién pedir ayuda directamente', 'Registrar personas específicas: "Si estoy peor, puedo llamar a ______".'],
          ['bi-hospital', 'Profesionales y servicios', 'Profesional tratante, servicio de salud mental, atención urgente y emergencias locales.'],
          ['bi-shield-check', 'Hacer más seguro el entorno', 'Reducir el acceso a elementos potencialmente peligrosos durante la crisis, con la red de apoyo.'],
        ].map(([icon, title, text], i) => (
          <div className="col-md-6" key={i}>
            <div className="benefit-card" style={{ borderLeft: `4px solid ${GREEN}` }}>
              <div className="benefit-icon"><i className={`bi ${icon}`}></i></div>
              <h3>{i + 1}. {title}</h3>
              <p>{text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="recipe-image-placeholder mb-5">
        <img src="/assets/img/blog/ideacion5.webp" alt="Un plan de seguridad y una red de apoyo" style={imgStyle} onError={hideOnError} />
      </div>

      <hr className="my-5" />

      {/* Riesgo inmediato - Perú */}
      <div className="alert-info mb-5" style={{ background: 'linear-gradient(135deg, #fdeaea 0%, #f9d6d6 100%)', border: '2px solid #d9534f', padding: '2rem', borderRadius: '12px' }}>
        <div className="d-flex align-items-start gap-3">
          <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '2rem', color: '#d9534f' }}></i>
          <div>
            <h4 style={{ color: '#b52b27', fontWeight: 700, marginBottom: '1rem' }}>
              Si la situación requiere atención inmediata (Perú)
            </h4>
            <p className="mb-3">
              No deje sola a la persona, mantenga un ambiente tranquilo y busque atención profesional
              urgente. La orientación telefónica no sustituye una evaluación presencial.
            </p>
            <ul style={{ lineHeight: 1.9, marginBottom: 0 }}>
              <li><strong>SAMU – 106:</strong> atención médica de urgencia.</li>
              <li><strong>PNP – 105:</strong> emergencias.</li>
              <li><strong>Bomberos – 116:</strong> emergencias.</li>
              <li><strong>Línea 113 del MINSA – opción 5:</strong> orientación en salud mental.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Cierre para familias */}
      <h2 className="section-title">Para las familias: qué recordar</h2>
      <div className="recipe-image-placeholder mb-5">
        <img src="/assets/img/blog/ideacion6.webp" alt="Proteger, acompañar y conectar con ayuda" style={imgStyle} onError={hideOnError} />
      </div>
      <div className="tips-box mb-5" style={{ background: 'linear-gradient(135deg, #f3e9f7 0%, #eaf2d4 100%)', borderLeft: `4px solid ${PRIMARY}` }}>
        <i className="bi bi-heart-pulse-fill"></i>
        <div>
          <p className="mb-2">No necesitas diagnosticar para escuchar.</p>
          <p className="mb-2">No necesitas tener todas las respuestas para acompañar.</p>
          <p className="mb-0">
            Tu tarea es <strong>preguntar, proteger, acompañar y conectar con ayuda profesional</strong>.
            Cuando existe riesgo, la tarea tampoco es resolverlo todo en casa.
          </p>
        </div>
      </div>

      <hr className="my-5" />

      {/* Referencias */}
      <div className="mb-5" style={{ background: 'var(--cx-surface)', border: '1px solid var(--cx-line)', borderRadius: 'var(--cx-r-lg)', padding: '2rem' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '1.5rem', color: 'var(--cx-ink)' }}>Referencias</h3>
        <div style={{ fontSize: '0.95rem', lineHeight: 1.8, color: 'var(--cx-ink-2)' }}>
          <p className="mb-3"><strong>National Institute of Mental Health (NIMH).</strong> <em>Ask Suicide-Screening Questions (ASQ) Toolkit</em> y <em>Brief Suicide Safety Assessment</em>.</p>
          <p className="mb-3"><strong>SAMHSA.</strong> <em>Safety Plan</em>, basado en el modelo de Stanley y Brown (versión actualizada, 2025).</p>
          <p className="mb-3"><strong>World Health Organization (WHO).</strong> <em>LIVE LIFE: An implementation guide for suicide prevention in countries</em>.</p>
          <p className="mb-0"><strong>World Health Organization (WHO).</strong> <em>Suicide – Fact sheet</em> y recursos mhGAP.</p>
        </div>
      </div>

      {/* Autor */}
      <div className="author-credits">
        <div className="d-flex align-items-center gap-3">
          <div className="author-avatar">
            <i className="bi bi-person-circle" style={{ fontSize: '4rem', color: 'var(--cx-primary)' }}></i>
          </div>
          <div>
            <h4 style={{ marginBottom: '0.25rem' }}>Centro Crecemos</h4>
            <p style={{ marginBottom: '0.4rem', color: 'var(--cx-muted)', fontSize: '0.95rem' }}>
              <strong>Centro Integral de Terapias</strong>
            </p>
            <a href="https://www.crecemos.com.pe" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--cx-primary-700)', fontWeight: 600, fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center' }}>
              <i className="bi bi-globe me-2"></i> www.crecemos.com.pe
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
