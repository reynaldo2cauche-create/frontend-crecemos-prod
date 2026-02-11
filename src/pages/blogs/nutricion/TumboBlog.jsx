import React from 'react';

export default function TumboBlog() {
  return (
    <>
      <div className="lead mb-5" style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#555' }}>
        El tumbo, también llamado curuba o parcha andina, es una fruta originaria de los Andes. Su pulpa suave y jugosa, junto con su sabor ligeramente ácido, la convierten en una opción muy adecuada para niños neurodivergentes, especialmente aquellos que presentan:
      </div>

      <ul className="feature-list mb-5">
        <li><i className="bi bi-check-circle-fill"></i> Selectividad alimentaria</li>
        <li><i className="bi bi-check-circle-fill"></i> Sensibilidad a sabores fuertes</li>
        <li><i className="bi bi-check-circle-fill"></i> Dificultades de masticación</li>
        <li><i className="bi bi-check-circle-fill"></i> Rechazo a texturas duras o secas</li>
        <li><i className="bi bi-check-circle-fill"></i> Necesidad de alimentos frescos y naturales</li>
      </ul>

      <p>El tumbo puede ofrecerse desde el primer año de vida, siempre de manera gradual y observando tolerancia.</p>

      <hr className="my-5" />

      <h2 className="section-title">¿Por qué el tumbo es beneficioso para niños neurodivergentes?</h2>

      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-droplet-fill"></i>
            </div>
            <h3>Textura suave y húmeda</h3>
            <p>Ideal para niños con hipersensibilidad oral o preferencia por alimentos fáciles de masticar.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-emoji-smile-fill"></i>
            </div>
            <h3>Sabor suave y ligeramente ácido</h3>
            <p>Puede estimular el apetito y facilitar la aceptación de nuevos alimentos.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-shield-fill-check"></i>
            </div>
            <h3>Alto en vitamina C</h3>
            <p>Fortalece el sistema inmunológico y mejora la absorción del hierro.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-star-fill"></i>
            </div>
            <h3>Rico en antioxidantes naturales</h3>
            <p>Ayuda a proteger las células y favorece el bienestar general.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="500">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-heart-pulse-fill"></i>
            </div>
            <h3>Aporta fibra suave</h3>
            <p>Contribuye a una digestión saludable.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="600">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-water"></i>
            </div>
            <h3>Muy hidratante</h3>
            <p>Perfecto para niños que consumen poca agua o rechazan alimentos secos.</p>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">¿Cómo ofrecer tumbo en casa?</h2>

      <div className="alert-info mb-5">
        <i className="bi bi-info-circle-fill me-2"></i>
        Preparaciones frescas, naturales y sin términos extranjeros
      </div>

      <div className="recipe-section mb-5" data-aos="fade-up">
        <div className="recipe-number">1</div>
        <h3 className="recipe-title">Pulpa fresca de tumbo (sin semillas para los más pequeños)</h3>
        <div className="recipe-content">
          <div className="recipe-image-placeholder">
            <img src="/assets/img/blog/tumbo1.webp" alt="Pulpa fresca de tumbo" onError={(e) => e.target.style.display = 'none'} />
          </div>
          <p className="mt-3">La forma más segura y sencilla de ofrecerlo.</p>
          <p>Suave, jugosa y fácil de aceptar.</p>
        </div>
      </div>

      <div className="recipe-section mb-5" data-aos="fade-up" data-aos-delay="100">
        <div className="recipe-number">2</div>
        <h3 className="recipe-title">Tumbo en puré o machacado</h3>
        <div className="recipe-content">
          <div className="recipe-image-placeholder">
            <img src="/assets/img/blog/tumbo2.webp" alt="Tumbo en puré" onError={(e) => e.target.style.display = 'none'} />
          </div>
          <p className="mt-3">Retirar semillas y aplastarlo ligeramente.</p>
          <p>Ideal para niños con dificultades de masticación o sensibilidad sensorial.</p>
        </div>
      </div>

      <div className="recipe-section mb-5" data-aos="fade-up" data-aos-delay="200">
        <div className="recipe-number">3</div>
        <h3 className="recipe-title">Tumbo combinado con frutas suaves</h3>
        <div className="recipe-content">
          <div className="recipe-image-placeholder">
            <img src="/assets/img/blog/tumbo3.webp" alt="Tumbo con frutas" onError={(e) => e.target.style.display = 'none'} />
          </div>
          <p className="mt-3">Para mejorar la aceptación y balancear la acidez:</p>
          <ul>
            <li>Papaya</li>
            <li>Plátano</li>
            <li>Pera cocida (fría)</li>
          </ul>
          <p className="text-muted">(Evitar mezclarlo con lácteos si causa molestias.)</p>
        </div>
      </div>

      <div className="recipe-section mb-5" data-aos="fade-up" data-aos-delay="300">
        <div className="recipe-number">4</div>
        <h3 className="recipe-title">Para llevar en la lonchera</h3>
        <div className="recipe-content">
          <div className="recipe-image-placeholder">
            <img src="/assets/img/blog/tumbo4.webp" alt="Tumbo en lonchera" onError={(e) => e.target.style.display = 'none'} />
          </div>
          <p className="mt-3"><strong>Presentaciones prácticas:</strong></p>
          <ul>
            <li>Pulpa fresca en un envase pequeño</li>
            <li>Tumbo con frutas suaves en trocitos</li>
            <li>Tumbo como acompañamiento de alimentos fríos</li>
          </ul>
        </div>
      </div>

      <div className="recipe-section mb-5" data-aos="fade-up" data-aos-delay="400">
        <div className="recipe-number">5</div>
        <h3 className="recipe-title">Actividad sensorial controlada</h3>
        <div className="recipe-content">
          <div className="recipe-image-placeholder">
            <img src="/assets/img/blog/tumbo5.webp" alt="Actividad sensorial con tumbo" onError={(e) => e.target.style.display = 'none'} />
          </div>
          <p className="mt-3">La pulpa gelatinosa del tumbo ayuda a que muchos niños acepten el alimento después de explorarlo con los dedos.</p>
        </div>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Ideas prácticas de presentación para niños neurodivergentes</h2>

      <div className="row gy-4 mb-5">
        <div className="col-md-4" data-aos="flip-up" data-aos-delay="100">
          <div className="idea-card">
            <i className="bi bi-palette-fill"></i>
            <h3>Bowl suave "2 colores"</h3>
            <p>Pulpa de tumbo + papaya o plátano.</p>
            <p className="text-muted">Texturas fáciles y colores agradables.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="flip-up" data-aos-delay="200">
          <div className="idea-card">
            <i className="bi bi-cup-straw"></i>
            <h3>Porción pequeña en vasito transparente</h3>
            <p>Presentación visualmente clara, ideal para niños selectivos.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="flip-up" data-aos-delay="300">
          <div className="idea-card">
            <i className="bi bi-snow"></i>
            <h3>Como complemento de platos fríos</h3>
            <p>Añade un toque fresco y suave sin sobrecargar sabores.</p>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Tips para familias</h2>

      <div className="tips-box mb-5" data-aos="fade-up">
        <i className="bi bi-lightbulb-fill"></i>
        <ul>
          <li>Lavar bien el tumbo y retirar la cáscara.</li>
          <li>Para iniciar, ofrecer sin semillas.</li>
          <li>Servir frío si el niño prefiere alimentos frescos.</li>
          <li>Evitar mezclar con alimentos muy ácidos o muy dulces.</li>
          <li>Comenzar con porciones pequeñas.</li>
          <li>Mantenerlo refrigerado para conservar su frescura.</li>
        </ul>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Nota importante antes de finalizar</h2>

      <div className="warning-box mb-5" data-aos="fade-up">
        <i className="bi bi-exclamation-triangle-fill"></i>
        <div>
          <p className="mb-2"><strong>Al introducir un alimento nuevo en niños pequeños o neurodivergentes:</strong></p>
          <ul className="mb-0">
            <li>Hacerlo en pequeñas cantidades.</li>
            <li>Evaluar tolerancia sensorial, digestiva y emocional.</li>
            <li>Consultar con un alergólogo si existen antecedentes de alergias alimentarias.</li>
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
