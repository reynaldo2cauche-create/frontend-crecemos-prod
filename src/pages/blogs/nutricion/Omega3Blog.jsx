import React from 'react';

export default function Omega3Blog() {
  return (
    <>
      <div className="lead mb-5" style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#555' }}>
        El Omega 3 es un nutriente esencial para el desarrollo cerebral, la regulación emocional y el bienestar general. Estos alimentos aportan Omega 3 de forma natural y son útiles en la alimentación infantil, especialmente en niños neurodivergentes.
      </div>

      {/* Imagen placeholder 1 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/omega1.jpg"
          alt="Alimentos ricos en Omega 3"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Pescados ricos en Omega 3</h2>

      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-water"></i>
            </div>
            <h3>Salmón</h3>
            <p>Pescado alto en EPA y DHA, fundamentales para la salud cerebral.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-water"></i>
            </div>
            <h3>Anchoveta</h3>
            <p>Una de las fuentes naturales más concentradas de Omega 3.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-water"></i>
            </div>
            <h3>Sardina</h3>
            <p>Rica en Omega 3 y proteínas de alta calidad.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-water"></i>
            </div>
            <h3>Caballa</h3>
            <p>Aporta grasas saludables que contribuyen a la regulación emocional.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="500">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-water"></i>
            </div>
            <h3>Atún (fresco o en trozos)</h3>
            <p>Buena fuente de Omega 3 que apoya la atención y el desarrollo cognitivo.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="600">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-water"></i>
            </div>
            <h3>Jurel</h3>
            <p>Rico en Omega 3 y nutrientes esenciales para el sistema nervioso.</p>
          </div>
        </div>
      </div>

      {/* Imagen placeholder 2 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/omega2.jpg"
          alt="Pescados ricos en Omega 3"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Semillas y frutos ricos en Omega 3</h2>

      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-egg-fill"></i>
            </div>
            <h3>Sacha Inchi (maní del Inca)</h3>
            <p>Una de las fuentes vegetales con mayor Omega 3.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-egg-fill"></i>
            </div>
            <h3>Chía (remojada)</h3>
            <p>Semilla rica en Omega 3 vegetal que apoya la concentración.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-egg-fill"></i>
            </div>
            <h3>Linaza (molida o remojada)</h3>
            <p>Aporta Omega 3 y fibra suave.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-egg-fill"></i>
            </div>
            <h3>Nueces</h3>
            <p>Ricas en Omega 3 vegetal; favorecen el equilibrio emocional.</p>
          </div>
        </div>
      </div>

      {/* Imagen placeholder 3 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/omega3.jpg"
          alt="Semillas y frutos con Omega 3"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Verduras y alimentos vegetales con Omega 3</h2>

      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-leaf"></i>
            </div>
            <h3>Espinaca</h3>
            <p>Contiene pequeñas cantidades de Omega 3 y antioxidantes.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-leaf"></i>
            </div>
            <h3>Coliflor</h3>
            <p>Aporta Omega 3 vegetal y ayuda a la digestión.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-leaf"></i>
            </div>
            <h3>Brócoli</h3>
            <p>Incluye Omega 3 ligero que apoya el desarrollo cerebral.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-leaf"></i>
            </div>
            <h3>Lechuga</h3>
            <p>Contiene pequeñas cantidades que complementan la dieta.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="500">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-droplet-fill"></i>
            </div>
            <h3>Palta</h3>
            <p>Rica en grasas saludables como Omega 3 y Omega 9.</p>
          </div>
        </div>
      </div>

      {/* Imagen placeholder 4 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/omega4.jpg"
          alt="Verduras con Omega 3"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Alimentos adicionales con Omega 3</h2>

      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-droplet-fill"></i>
            </div>
            <h3>Cushuro (llullucha)</h3>
            <p>Alga andina con alto contenido de Omega 3, ideal para el desarrollo cerebral.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-egg"></i>
            </div>
            <h3>Huevos enriquecidos con Omega 3</h3>
            <p>Provienen de gallinas alimentadas con fuentes naturales de Omega 3.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-droplet"></i>
            </div>
            <h3>Aceite de sacha inchi</h3>
            <p>Aceite vegetal con gran concentración de Omega 3 esencial.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-egg"></i>
            </div>
            <h3>Huevos de codorniz</h3>
            <p>Aportan grasas saludables, incluyendo Omega 3, y son fáciles de digerir.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="500">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-droplet"></i>
            </div>
            <h3>Aceite de oliva extra virgen</h3>
            <p>Contiene grasas saludables como Omega 3 y Omega 9 que favorecen el sistema nervioso.</p>
          </div>
        </div>
      </div>

      {/* Imagen placeholder 5 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/omega5.jpg"
          alt="Alimentos adicionales con Omega 3"
          style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Tips para familias</h2>

      <div className="tips-box mb-5" data-aos="fade-up">
        <i className="bi bi-lightbulb-fill"></i>
        <ul>
          <li>Introducir estos alimentos poco a poco para observar aceptación y tolerancia.</li>
          <li>Priorizar preparaciones simples y frescas.</li>
          <li>Evitar mezclar demasiados alimentos nuevos al mismo tiempo.</li>
          <li>Adaptar las texturas según la sensibilidad oral del niño.</li>
          <li>No ofrecer semillas enteras a niños menores de 3 años.</li>
          <li>Mantener una rutina alimentaria para mejorar la aceptación en niños selectivos.</li>
          <li>Preferir pescados preparados sin exceso de condimentos.</li>
        </ul>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Nota importante antes de finalizar</h2>

      <div className="warning-box mb-5" data-aos="fade-up">
        <i className="bi bi-exclamation-triangle-fill"></i>
        <div>
          <p className="mb-2"><strong>Al incluir alimentos ricos en Omega 3 en niños pequeños o neurodivergentes:</strong></p>
          <ul className="mb-0">
            <li>Ofrecer cantidades pequeñas al inicio.</li>
            <li>Observar tolerancia sensorial, digestiva y emocional.</li>
            <li>Consultar con un alergólogo si existe historial de alergias a pescados, semillas o frutos secos.</li>
            <li>Evitar productos ultra procesados; priorizar siempre alimentos naturales.</li>
          </ul>
        </div>
      </div>

      <hr className="my-5" />

      {/* Créditos */}
      <div className="author-credits mb-5" data-aos="fade-up">
        <div style={{
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          padding: '2rem',
          borderRadius: '12px',
          border: '2px solid #c263f9'
        }}>
          <h4 style={{ marginBottom: '1.5rem', color: '#2d465e', fontWeight: '700', fontSize: '1.1rem' }}>
            Elaborado por:
          </h4>
          <div className="d-flex align-items-start mb-3">
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #c263f9 0%, #d99ffd 100%)',
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
                Leonardo Yactayo Uceda
              </h5>
              <p style={{ marginBottom: '0.75rem', color: '#666', fontSize: '0.95rem', lineHeight: '1.5' }}>
                <i className="bi bi-award-fill me-2" style={{ color: '#c263f9' }}></i>
                Curso en Nutrición y Alimentación Infantil – Universidad Científica del Sur
              </p>
              <a
                href="https://www.crecemos.com.pe"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#c263f9',
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
