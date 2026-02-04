import React from 'react';

export default function CushuroBlog() {
  return (
    <>
      <div className="lead mb-5" style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#555' }}>
        El cushuro, también conocido como llullucha, es una alga andina que crece en lagunas de altura. Su textura suave, fresca y gelatinosa lo convierte en un alimento muy interesante para niños neurodivergentes, especialmente aquellos con:
      </div>

      <ul className="feature-list mb-5">
        <li><i className="bi bi-check-circle-fill"></i> Sensibilidad a texturas</li>
        <li><i className="bi bi-check-circle-fill"></i> Selectividad alimentaria</li>
        <li><i className="bi bi-check-circle-fill"></i> Baja tolerancia a alimentos duros o muy fibrosos</li>
        <li><i className="bi bi-check-circle-fill"></i> Necesidad de alimentos frescos y fáciles de masticar</li>
      </ul>

      <p>Además, su perfil nutricional lo hace un excelente complemento natural en la alimentación desde el año de edad en adelante, siempre con introducción gradual.</p>

      <hr className="my-5" />

      <h2 className="section-title">¿Por qué el cushuro es tan beneficioso para niños neurodivergentes?</h2>

      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-droplet-fill"></i>
            </div>
            <h3>Textura suave y fácil de aceptar</h3>
            <p>Ideal para niños con rechazo a alimentos crocantes o muy duros.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-egg-fill"></i>
            </div>
            <h3>Rico en proteínas naturales</h3>
            <p>Apoya el crecimiento, la energía y el desarrollo físico.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-lightning-fill"></i>
            </div>
            <h3>Fuente natural de Omega 3</h3>
            <p>Favorece la atención, regulación emocional y funciones cognitivas.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-heart-pulse-fill"></i>
            </div>
            <h3>Hierro de buena absorción</h3>
            <p>Ayuda a prevenir anemia y mejora la vitalidad diaria.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="500">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-water"></i>
            </div>
            <h3>Muy hidratante</h3>
            <p>Perfecto para niños que suelen comer poca cantidad o rechazan alimentos secos.</p>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">¿Cómo consumir cushuro en casa?</h2>

      <div className="alert-info mb-5">
        <i className="bi bi-info-circle-fill me-2"></i>
        Solo preparaciones frescas, naturales, sin cocción y sin alimentos procesados
      </div>

      <p className="mb-5">Después de lavarlo bien, puedes incorporarlo de formas suaves y agradables:</p>

      <div className="recipe-section mb-5" data-aos="fade-up">
        <div className="recipe-number">1</div>
        <h3 className="recipe-title">Ensalada de verduras frescas</h3>
        <div className="recipe-content">
          <div className="recipe-image-placeholder">
            <img src="/assets/img/blog/blog.webp" alt="Ensalada con cushuro" onError={(e) => e.target.style.display = 'none'} />
          </div>
          <p className="mt-3"><strong>Ingredientes:</strong> Cushuro entero + tomate + pepino + unas gotas de limón.</p>
          <p>Una opción refrescante y fácil de adaptar a la tolerancia sensorial del niño.</p>
        </div>
      </div>

      <div className="recipe-section mb-5" data-aos="fade-up" data-aos-delay="100">
        <div className="recipe-number">2</div>
        <h3 className="recipe-title">Ensalada de frutas</h3>
        <div className="recipe-content">
          <div className="recipe-image-placeholder">
            <img src="/assets/img/blog/2.ensaladadefruta.webp" alt="Cushuro con frutas" onError={(e) => e.target.style.display = 'none'} />
          </div>
          <p className="mt-3"><strong>Combinación suave:</strong> Papaya, manzana, plátano o fresas.</p>
          <p>El cushuro entero se mezcla de forma natural gracias a su textura gelatinosa.</p>
        </div>
      </div>

      <div className="recipe-section mb-5" data-aos="fade-up" data-aos-delay="200">
        <div className="recipe-number">3</div>
        <h3 className="recipe-title">Desayuno fresco tipo bowl</h3>
        <div className="recipe-content">
          <div className="recipe-image-placeholder">
            <img src="/assets/img/blog/3.desayunobowl.webp" alt="Bowl con cushuro" onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.style.display = 'none'; }} />
          </div>
          <ul className="mt-3">
            <li>Frutas frescas picadas</li>
            <li>Cushuro sin procesar</li>
            <li>Opcional: un poquito de yogur natural si el niño lo tolera</li>
          </ul>
          <p className="text-muted">(Sin harinas, sin pan, sin procesados)</p>
        </div>
      </div>

      <div className="recipe-section mb-5" data-aos="fade-up" data-aos-delay="300">
        <div className="recipe-number">4</div>
        <h3 className="recipe-title">Para llevar al colegio o estimulación temprana</h3>
        <div className="recipe-content">
          <div className="recipe-image-placeholder">
            <img src="/assets/img/blog/4.parallevarcolegio.webp" alt="Lonchera con cushuro" onError={(e) => e.target.style.display = 'none'} />
          </div>
          <p className="mt-3"><strong>Preparaciones fáciles de transportar:</strong></p>
          <ul>
            <li>Ensaladita fría de cushuro con verduras suaves</li>
            <li>Fruta picada + cushuro</li>
            <li>Cushuro con palta suave en un envase pequeño</li>
          </ul>
        </div>
      </div>

      <div className="recipe-section mb-5" data-aos="fade-up" data-aos-delay="400">
        <div className="recipe-number">5</div>
        <h3 className="recipe-title">Añadir cushuro entero a platos fríos</h3>
        <div className="recipe-content">
          <p><strong>Ideal en:</strong></p>
          <ul>
            <li>Palta rellena</li>
            <li>Verduras frías</li>
            <li>Platos servidos a temperatura ambiente</li>
          </ul>
        </div>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Ideas sencillas para incluirlo en la lonchera</h2>

      <div className="row gy-4 mb-5">
        <div className="col-md-4" data-aos="flip-up" data-aos-delay="100">
          <div className="idea-card">
            <i className="bi bi-apple"></i>
            <h3>Fruta fresca con cushuro</h3>
            <p>Una mezcla muy fácil de aceptar.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="flip-up" data-aos-delay="200">
          <div className="idea-card">
            <i className="bi bi-cup-straw"></i>
            <h3>Mini bowl frío</h3>
            <p>Palta + cushuro + gotas de limón.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="flip-up" data-aos-delay="300">
          <div className="idea-card">
            <i className="bi bi-hand-index"></i>
            <h3>Verduras suaves para dedos</h3>
            <p>Pepino, tomate cherry, cushuro entero.</p>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Tips importantes para familias</h2>

      <div className="tips-box mb-5" data-aos="fade-up">
        <i className="bi bi-lightbulb-fill"></i>
        <ul>
          <li>Lavar con abundante agua antes de usar.</li>
          <li>Mantener siempre refrigerado.</li>
          <li>Introducir poco a poco para observar tolerancia sensorial y digestiva.</li>
          <li>Ofrecer en contextos tranquilos y sin presión.</li>
          <li>Evitar mezclarlo con alimentos procesados o harinas, para mantener su aporte natural.</li>
        </ul>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Nota importante antes de finalizar</h2>

      <div className="warning-box mb-5" data-aos="fade-up">
        <i className="bi bi-exclamation-triangle-fill"></i>
        <div>
          <p className="mb-2"><strong>Cuando se introduce un alimento nuevo en niños pequeños o neurodivergentes:</strong></p>
          <ul className="mb-0">
            <li>Hazlo en pequeñas cantidades.</li>
            <li>Observa la tolerancia sensorial, digestiva y conductual.</li>
            <li>Si hay antecedentes de alergias, es recomendable consultar con un alergólogo antes de ofrecerlo.</li>
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
