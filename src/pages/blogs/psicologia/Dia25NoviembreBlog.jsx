import React from 'react';

export default function Dia25NoviembreBlog() {
  return (
    <>
      {/* Introducción principal */}
      <div className="lead mb-5" style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#555' }}>
        Se ha podido observar en las calles, redes sociales e incluso compañeros de trabajo, el distintivo
        que están usando algunas personas: el color naranja. La razón detrás de su uso es muy importante:
        se conmemoró el Día Internacional de la Eliminación de la Violencia contra la Mujer.
      </div>

      {/* Imagen principal - placeholder 1 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/25nov-portada.webp"
          alt="Día Internacional de la Eliminación de la Violencia contra la Mujer"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <p className="mb-5">
        Aunque la fecha es una conmemoración global promovida por la ONU, su significado es profundamente
        personal y urgente. Este es un día de reflexión, denuncia y, sobre todo, de un compromiso rotundo
        a dejar de mirar hacia otro lado. Precisamente por esto, el color naranja tiene un origen y
        propósito muy concretos.
      </p>

      <hr className="my-5" />

      {/* Sección 1: El porqué del color naranja */}
      <h2 className="section-title" data-aos="fade-up">El porqué del color Naranja</h2>

      <p className="mb-4">
        El 25 de noviembre se eligió en honor a las valientes <strong>Hermanas Mirabal</strong> de República
        Dominicana, quienes fueron brutalmente asesinadas en 1960 por oponerse a un régimen dictatorial.
        Ellas son el símbolo de todas las mujeres silenciadas por la violencia.
      </p>

      {/* Imagen placeholder 2 - Hermanas Mirabal */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/25nov1.webp"
          alt="Hermanas Mirabal - Símbolo de resistencia"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <div className="alert-info mb-5" data-aos="fade-up">
        <i className="bi bi-info-circle-fill me-2"></i>
        Hoy, el color naranja recuerda a cada persona el valor de la esperanza, de un futuro sin violencia.
        Nos ayuda a reflexionar que cada voz que pide auxilio, cada historia que escuchamos, no es una
        simple estadística, sino el valor de una vida, lo que debe impulsarnos a actuar.
      </div>

      <p className="mb-5">
        Esta urgencia por actuar se fundamenta en realidades que, aunque duelen, debemos dar a conocer.
      </p>

      <hr className="my-5" />

      {/* Sección 2: Realidades que duelen */}
      <h2 className="section-title" data-aos="fade-up">Realidades que duelen, pero que se deben dar a conocer</h2>

      <p className="mb-4">
        El número de cifras de mujeres que sufren violencia es el espejo de una realidad que no podemos
        ignorar. No hablamos solo de las formas más extremas de violencia (el feminicidio), sino también
        de la violencia que se esconde en el día a día, en sus diversas manifestaciones:
      </p>

      {/* Imagen placeholder 3 - Estadísticas */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/25nov2.webp"
          alt="Realidades de la violencia contra la mujer"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      {/* Tipos de violencia */}
      <div className="row gy-4 mb-5">
        <div className="col-md-4" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card" style={{ borderLeft: '4px solid #ff6b35' }}>
            <div className="benefit-icon">
              <i className="bi bi-chat-left-text"></i>
            </div>
            <h3>Violencia Psicológica</h3>
            <p>La burla, el control, el menosprecio que deterioran la autoestima y el bienestar emocional.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card" style={{ borderLeft: '4px solid #ff6b35' }}>
            <div className="benefit-icon">
              <i className="bi bi-cash-coin"></i>
            </div>
            <h3>Violencia Económica</h3>
            <p>Impedir que una mujer trabaje o maneje su propio dinero, generando dependencia forzada.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card" style={{ borderLeft: '4px solid #ff6b35' }}>
            <div className="benefit-icon">
              <i className="bi bi-shield-exclamation"></i>
            </div>
            <h3>Violencia Sexual</h3>
            <p>El acoso, la intimidación y cualquier acto que vulnere la dignidad y autonomía de la mujer.</p>
          </div>
        </div>
      </div>

      <div className="warning-box mb-5" data-aos="fade-up">
        <i className="bi bi-exclamation-triangle-fill"></i>
        <div>
          <p className="mb-2"><strong>Una realidad que nos involucra a todos:</strong></p>
          <p className="mb-0">
            La violencia contra la mujer es un problema estructural que nos toca a todos, independientemente
            de nuestro género. Es un problema de la comunidad, de las empresas y de las familias. Por ello,
            es vital entender que el compromiso no termina con el día de la conmemoración.
          </p>
        </div>
      </div>

      {/* Imagen placeholder 4 - Compromiso colectivo */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/25nov3.webp"
          alt="Compromiso colectivo contra la violencia"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <hr className="my-5" />

      {/* Sección 3: El compromiso no termina */}
      <h2 className="section-title" data-aos="fade-up">El Compromiso No Termina</h2>

      <p className="mb-5">
        El Día Internacional ya pasó, pero el compromiso debe durar los 365 días del año. ¿Qué se puede
        hacer hoy para mantener viva esta lucha?
      </p>

      {/* Acciones concretas */}
      <div className="recipe-section mb-5" data-aos="fade-up">
        <div className="recipe-number">1</div>
        <h3 className="recipe-title">Educar la Escucha</h3>
        <div className="recipe-content">
          <p className="mb-3">
            Si una amiga, compañera o familiar te confía su experiencia, cree en su palabra. Evita juzgar
            o culpabilizar.
          </p>
          <div className="tips-box" style={{ background: 'linear-gradient(135deg, #fff5e6 0%, #ffe6cc 100%)', borderLeft: '4px solid #ff6b35' }}>
            <i className="bi bi-ear-fill"></i>
            <div>
              <p className="mb-0">
                <strong>Consejo:</strong> Escuchar activamente sin interrumpir, validar sus emociones y
                ofrecer apoyo incondicional puede marcar una diferencia enorme en la vida de quien sufre
                violencia.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="recipe-section mb-5" data-aos="fade-up">
        <div className="recipe-number">2</div>
        <h3 className="recipe-title">Señalar lo Invisible</h3>
        <div className="recipe-content">
          <p className="mb-3">
            No dejar pasar los comentarios machistas o los chistes que degradan. La violencia comienza en
            las palabras que normalizamos.
          </p>
          <ul>
            <li>Identifica micromachismos en el lenguaje cotidiano</li>
            <li>Cuestiona roles de género tradicionales y estereotipos</li>
            <li>Habla cuando presencies situaciones de violencia o discriminación</li>
            <li>Edúcate constantemente sobre igualdad de género</li>
          </ul>
        </div>
      </div>

      {/* Imagen placeholder 5 - Ser aliados */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/25nov4.webp"
          alt="Ser aliados en la lucha contra la violencia"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <div className="recipe-section mb-5" data-aos="fade-up">
        <div className="recipe-number">3</div>
        <h3 className="recipe-title">Ser Aliados</h3>
        <div className="recipe-content">
          <p className="mb-3">
            La responsabilidad de construir espacios seguros no recae solo en las mujeres. Los hombres
            tienen un rol fundamental en educarse y detener la violencia entre sus pares.
          </p>

          <div className="row gy-3">
            <div className="col-md-6">
              <div className="idea-card">
                <i className="bi bi-people-fill"></i>
                <h4>En la familia</h4>
                <p>Promover la igualdad, el respeto mutuo y educar con el ejemplo desde casa.</p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="idea-card">
                <i className="bi bi-building"></i>
                <h4>En el trabajo</h4>
                <p>Crear ambientes laborales seguros, libres de acoso y con políticas de igualdad.</p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="idea-card">
                <i className="bi bi-chat-square-heart"></i>
                <h4>En las amistades</h4>
                <p>Cuestionar actitudes violentas y apoyar activamente a quienes lo necesitan.</p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="idea-card">
                <i className="bi bi-megaphone"></i>
                <h4>En la comunidad</h4>
                <p>Participar en iniciativas locales y alzar la voz contra la violencia de género.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      {/* Mensaje de cierre */}
      <div className="alert-info mb-5" data-aos="fade-up" style={{
        background: 'linear-gradient(135deg, #fff5e6 0%, #ffe6cc 100%)',
        border: '2px solid #ff6b35',
        padding: '2rem'
      }}>
        <div className="d-flex align-items-start">
          <i className="bi bi-heart-fill me-3" style={{ fontSize: '2rem', color: '#ff6b35' }}></i>
          <div>
            <h4 style={{ color: '#ff6b35', fontWeight: '700', marginBottom: '1rem' }}>
              Un compromiso que trasciende fechas
            </h4>
            <p className="mb-3" style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
              Que la energía y la conciencia generadas ayer no se disipen. Que cada acción, por pequeña
              que parezca, nos acerque al futuro que queremos: uno donde el 25 de noviembre sea solo una
              fecha histórica, y no un llamado urgente a la acción.
            </p>
            <p className="mb-0" style={{ fontWeight: '600', fontSize: '1.05rem' }}>
              La lucha continúa. Y continúa con cada uno de nosotros.
            </p>
          </div>
        </div>
      </div>

      {/* Imagen placeholder 6 - Esperanza */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/25nov5.webp"
          alt="Un futuro sin violencia es posible"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      {/* Recursos de ayuda */}
      <h3 className="mb-4" style={{ color: '#2d465e', fontWeight: '700' }}>
        ¿Necesitas ayuda o conoces a alguien que la necesita?
      </h3>

      <div className="tips-box mb-5" data-aos="fade-up">
        <i className="bi bi-telephone-fill"></i>
        <div>
          <p className="mb-4">En Perú existen recursos gratuitos y confidenciales disponibles las 24 horas:</p>

          <div className="row">
            <div className="col-md-6">
              <ul style={{ listStyle: 'none', paddingLeft: '0' }}>
                <li className="mb-3">
                  <strong><i className="bi bi-telephone-fill me-2" style={{ color: '#ff6b35' }}></i>Línea 100 (MIMP):</strong>
                  Atención gratuita las 24 horas para casos de violencia.{' '}
                  <a href="https://www.gob.pe/institucion/mimp/campañas/23869-buscas-ayuda-llama-a-la-linea-100"
                     target="_blank"
                     rel="noopener noreferrer"
                     style={{ color: '#0d6efd', fontSize: '0.9rem', textDecoration: 'none' }}>
                    [Más información]
                  </a>
                </li>
                <li className="mb-3">
                  <strong><i className="bi bi-chat-dots-fill me-2" style={{ color: '#ff6b35' }}></i>Chat 100:</strong>
                  Orientación online sobre situaciones de violencia.{' '}
                  <a href="https://www.gob.pe/institucion/mimp/noticias/1244703-mimp-recuerda-que-la-linea-100-brinda-atencion-gratuita-y-confidencial-las-24-horas"
                     target="_blank"
                     rel="noopener noreferrer"
                     style={{ color: '#0d6efd', fontSize: '0.9rem', textDecoration: 'none' }}>
                    [Iniciar chat]
                  </a>
                </li>
              </ul>
            </div>
            <div className="col-md-6">
              <ul style={{ listStyle: 'none', paddingLeft: '0' }}>
                <li className="mb-3">
                  <strong><i className="bi bi-house-heart-fill me-2" style={{ color: '#ff6b35' }}></i>Centros Emergencia Mujer (CEM):</strong>
                  Atención integral especializada.{' '}
                  <a href="https://www.gob.pe/51970-red-de-servicios"
                     target="_blank"
                     rel="noopener noreferrer"
                     style={{ color: '#0d6efd', fontSize: '0.9rem', textDecoration: 'none' }}>
                    [Ubicar un CEM]
                  </a>
                </li>
                <li className="mb-3">
                  <strong><i className="bi bi-shield-fill-check me-2" style={{ color: '#ff6b35' }}></i>Comisarías:</strong>
                  Denuncia y medidas de protección inmediatas.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

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
    </>
  );
}
