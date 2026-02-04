import React from 'react';

export default function QuinuaBlog() {
  return (
    <>
      <div className="lead mb-5" style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#555' }}>
        La quinua es un pseudocereal andino con un perfil nutricional excepcional que la convierte en un aliado fundamental para el desarrollo de niños neurodivergentes. Su textura suave, fácil digestión y versatilidad la hacen ideal para:
      </div>

      <ul className="feature-list mb-5">
        <li><i className="bi bi-check-circle-fill"></i> Niños con selectividad alimentaria</li>
        <li><i className="bi bi-check-circle-fill"></i> Dificultades de concentración y regulación</li>
        <li><i className="bi bi-check-circle-fill"></i> Necesidad de alimentos energéticos sin azúcares refinados</li>
        <li><i className="bi bi-check-circle-fill"></i> Sensibilidad digestiva o intolerancia al gluten</li>
      </ul>

      <p>Además, su riqueza en proteínas completas, omega 3, hierro y vitaminas del complejo B la posiciona como un superalimento clave para apoyar el neurodesarrollo desde edades tempranas.</p>

      <hr className="my-5" />

      <h2 className="section-title">¿Por qué la quinua es tan beneficiosa para niños neurodivergentes?</h2>

      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-egg-fill"></i>
            </div>
            <h3>Proteína completa</h3>
            <p>Contiene todos los aminoácidos esenciales, fundamentales para el desarrollo cerebral y físico.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-lightning-fill"></i>
            </div>
            <h3>Omega 3 y Omega 6</h3>
            <p>Favorecen la concentración, atención sostenida y regulación emocional.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-heart-pulse-fill"></i>
            </div>
            <h3>Hierro de alta biodisponibilidad</h3>
            <p>Ayuda a prevenir anemia y mejora la energía, vitalidad y función cognitiva.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-capsule"></i>
            </div>
            <h3>Vitaminas del complejo B</h3>
            <p>Esenciales para el sistema nervioso, regulación del estado de ánimo y energía celular.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="500">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-shield-check"></i>
            </div>
            <h3>Sin gluten, baja en FODMAP</h3>
            <p>Ideal para niños con sensibilidad digestiva o celiaquía.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="600">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-graph-up-arrow"></i>
            </div>
            <h3>Bajo índice glucémico</h3>
            <p>Ayuda a mantener niveles estables de energía sin picos de azúcar.</p>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">¿Cómo consumir quinua en casa?</h2>

      <div className="alert-info mb-5">
        <i className="bi bi-info-circle-fill me-2"></i>
        Siempre cocida, bien enjuagada y preferiblemente sin mezclar con harinas refinadas ni azúcares procesados
      </div>

      <p className="mb-5">Después de cocinarla (hasta que esté tierna y haya absorbido el agua), puedes incorporarla de formas suaves y agradables:</p>

      <div className="recipe-section mb-5" data-aos="fade-up">
        <div className="recipe-number">1</div>
        <h3 className="recipe-title">Ensalada fresca de quinua</h3>
        <div className="recipe-content">
          <div className="recipe-image-placeholder">
            <img src="/assets/img/blog/quinua.1.webp" alt="Ensalada con quinua" onError={(e) => e.target.style.display = 'none'} />
          </div>
          <p className="mt-3"><strong>Ingredientes:</strong> Quinua cocida + pepino + tomate + zanahoria rallada + limón.</p>
          <p>Una opción refrescante, colorida y fácil de aceptar por su textura suave.</p>
        </div>
      </div>

      <div className="recipe-section mb-5" data-aos="fade-up" data-aos-delay="100">
        <div className="recipe-number">2</div>
        <h3 className="recipe-title">Bowl dulce de quinua</h3>
        <div className="recipe-content">
          <div className="recipe-image-placeholder">
            <img src="/assets/img/blog/quinua.2.webp" alt="Bowl de quinua con frutas" onError={(e) => e.target.style.display = 'none'} />
          </div>
          <p className="mt-3"><strong>Combinación suave:</strong> Quinua cocida + frutas frescas (plátano, fresas, arándanos) + un toque de canela.</p>
          <p>Ideal para desayuno o merienda sin azúcar añadido.</p>
        </div>
      </div>

      <div className="recipe-section mb-5" data-aos="fade-up" data-aos-delay="200">
        <div className="recipe-number">3</div>
        <h3 className="recipe-title">Guarnición suave</h3>
        <div className="recipe-content">
          <div className="recipe-image-placeholder">
            <img src="/assets/img/blog/qinua.3.webp" alt="Quinua como guarnición" onError={(e) => e.target.style.display = 'none'} />
          </div>
          <ul className="mt-3">
            <li>Quinua cocida al lado de pollo, pescado o huevo</li>
            <li>Mezclada con verduras al vapor</li>
            <li>Como base de un plato tipo bowl nutritivo</li>
          </ul>
          <p className="text-muted">(Sin salsas procesadas ni condimentos fuertes)</p>
        </div>
      </div>

      <div className="recipe-section mb-5" data-aos="fade-up" data-aos-delay="300">
        <div className="recipe-number">4</div>
        <h3 className="recipe-title">Para llevar al colegio o terapia</h3>
        <div className="recipe-content">
          <div className="recipe-image-placeholder">
            <img src="/assets/img/blog/qinua.4.webp" alt="Lonchera con quinua" onError={(e) => e.target.style.display = 'none'} />
          </div>
          <p className="mt-3"><strong>Preparaciones fáciles de transportar:</strong></p>
          <ul>
            <li>Ensalada fría de quinua con verduras suaves</li>
            <li>Bowl de quinua con frutas picadas</li>
            <li>Mini tortitas de quinua (sin harinas refinadas)</li>
          </ul>
        </div>
      </div>

      <div className="recipe-section mb-5" data-aos="fade-up" data-aos-delay="400">
        <div className="recipe-number">5</div>
        <h3 className="recipe-title">Preparaciones creativas</h3>
        <div className="recipe-content">
          <div className="recipe-image-placeholder">
            <img src="/assets/img/blog/quinua.5.webp" alt="Preparaciones creativas con quinua" onError={(e) => e.target.style.display = 'none'} />
          </div>
          <p className="mt-3"><strong>Ideal en:</strong></p>
          <ul>
            <li>Croquetas suaves de quinua + verduras</li>
            <li>Sopa cremosa con quinua</li>
            <li>Relleno de verduras (zapallitos, tomates)</li>
          </ul>
        </div>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Ideas sencillas para incluirla en la lonchera</h2>

      <div className="row gy-4 mb-5">
        <div className="col-md-4" data-aos="flip-up" data-aos-delay="100">
          <div className="idea-card">
            <i className="bi bi-apple"></i>
            <h3>Bowl dulce de quinua</h3>
            <p>Quinua + frutas frescas + canela.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="flip-up" data-aos-delay="200">
          <div className="idea-card">
            <i className="bi bi-cup-straw"></i>
            <h3>Ensalada fresca</h3>
            <p>Quinua + verduras suaves + limón.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="flip-up" data-aos-delay="300">
          <div className="idea-card">
            <i className="bi bi-hand-index"></i>
            <h3>Mini croquetas</h3>
            <p>Quinua + zanahoria + huevo.</p>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Tips importantes para familias</h2>

      <div className="tips-box mb-5" data-aos="fade-up">
        <i className="bi bi-lightbulb-fill"></i>
        <ul>
          <li>Enjuagar muy bien la quinua antes de cocinarla para eliminar las saponinas (compuestos amargos).</li>
          <li>Cocinarla hasta que esté muy tierna y haya absorbido toda el agua.</li>
          <li>Introducir poco a poco para observar tolerancia digestiva y sensorial.</li>
          <li>Ofrecer en contextos tranquilos, sin presión.</li>
          <li>Evitar mezclarla con alimentos procesados, harinas refinadas o azúcares añadidos.</li>
          <li>Guardar en refrigeración hasta por 3 días en recipiente hermético.</li>
        </ul>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Nota importante antes de finalizar</h2>

      <div className="warning-box mb-5" data-aos="fade-up">
        <i className="bi bi-exclamation-triangle-fill"></i>
        <div>
          <p className="mb-2"><strong>Cuando se introduce un alimento nuevo en niños pequeños o neurodivergentes:</strong></p>
          <ul className="mb-0">
            <li>Hacerlo en pequeñas cantidades para observar tolerancia digestiva y sensorial.</li>
            <li>Monitorear posibles reacciones alérgicas (aunque la quinua es hipoalergénica).</li>
            <li>Si hay antecedentes de alergias alimentarias, consultar con un alergólogo antes de ofrecerla.</li>
            <li>Respetar el ritmo del niño y no forzar la aceptación.</li>
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
