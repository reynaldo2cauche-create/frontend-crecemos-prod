import React from 'react';

export default function EsparragoBlog() {
  return (
    <>
      <div className="lead mb-5" style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#555' }}>
        El espárrago es una verdura natural rica en nutrientes esenciales que puede incorporarse de manera segura en la alimentación infantil a partir del primer año de vida. Cuando se prepara correctamente, su textura es suave, blanda y fácil de manejar, lo que lo convierte en una opción adecuada para niños neurodivergentes, especialmente aquellos que presentan selectividad alimentaria o sensibilidad a ciertas texturas.
      </div>

      <hr className="my-5" />

      <h2 className="section-title">¿Por qué el espárrago es una buena opción para niños pequeños?</h2>

      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card">
            <div className="benefit-icon">
             <i class="bi bi-lightbulb"></i>
            </div>
            <h3>Desarrollo cerebral</h3>
            <p>Contribuye al desarrollo cerebral gracias a su contenido de ácido fólico.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-heart-pulse-fill"></i>
            </div>
            <h3>Digestión saludable</h3>
            <p>Favorece una digestión saludable mediante su fibra suave.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-shield-fill-check"></i>
            </div>
            <h3>Sistema inmunológico</h3>
            <p>Apoya el sistema inmunológico por su aporte de vitaminas A y C.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-lightning-fill"></i>
            </div>
            <h3>Sistema nervioso</h3>
            <p>Contribuye al buen funcionamiento del sistema nervioso.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="500">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-gear-fill"></i>
            </div>
            <h3>Textura adaptable</h3>
            <p>Puede adaptarse fácilmente a diferentes texturas.</p>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Cómo ofrecer espárrago a niños desde 1 año</h2>

      <div className="alert-info mb-5">
        <i className="bi bi-info-circle-fill me-2"></i>
        Preparación segura y adaptada a la edad del niño
      </div>

      <div className="recipe-section mb-5" data-aos="fade-up">
        <div className="recipe-number">1</div>
        <h3 className="recipe-title">Cocción adecuada</h3>
        <div className="recipe-content">
          <div className="recipe-image-placeholder">
            <img src="/assets/img/blog/esparrago-cocido.jpg" alt="Espárragos bien cocidos" onError={(e) => e.target.style.display = 'none'} />
          </div>
          <p className="mt-3">Cocinar el espárrago hasta que esté muy suave. Es fundamental que la textura sea lo suficientemente blanda para facilitar la masticación y digestión.</p>
        </div>
      </div>

      <div className="recipe-section mb-5" data-aos="fade-up" data-aos-delay="100">
        <div className="recipe-number">2</div>
        <h3 className="recipe-title">Preparación segura</h3>
        <div className="recipe-content">
          <div className="recipe-image-placeholder">
            <img src="/assets/img/blog/esparrago-preparado.jpg" alt="Espárragos preparados para niños" onError={(e) => e.target.style.display = 'none'} />
          </div>
          <ul className="mt-3">
            <li>Retirar la parte dura o fibrosa del tallo</li>
            <li>Ofrecerlo en trocitos pequeños, desmenuzado o en puré</li>
            <li>Servirlo tibio o frío según tolerancia sensorial</li>
          </ul>
        </div>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Espárrago en la alimentación diaria</h2>

      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="flip-up" data-aos-delay="100">
          <div className="idea-card">
            <i className="bi bi-sun-fill"></i>
            <h3>Acompañamiento en el almuerzo</h3>
            <p>Como acompañamiento suave junto a proteínas y otras verduras.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="flip-up" data-aos-delay="200">
          <div className="idea-card">
            <i className="bi bi-moisture"></i>
            <h3>En puré</h3>
            <p>Para niños que prefieren texturas cremosas y suaves.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="flip-up" data-aos-delay="300">
          <div className="idea-card">
            <i className="bi bi-snow"></i>
            <h3>Ensaladas frías simples</h3>
            <p>En preparaciones frías y refrescantes, fáciles de digerir.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="flip-up" data-aos-delay="400">
          <div className="idea-card">
            <i className="bi bi-bag-fill"></i>
            <h3>En la lonchera</h3>
            <p>Bien cocido y en pequeñas porciones para llevar.</p>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Tabla nutricional del espárrago</h2>
      <p className="text-muted mb-4">Por cada 100 gramos</p>

      <div className="table-responsive mb-5" data-aos="fade-up">
        <table className="table table-hover" style={{ borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <thead style={{ background: 'linear-gradient(135deg, #c263f9 0%, #d99ffd 100%)', color: 'white' }}>
            <tr>
              <th style={{ padding: '1rem' }}>Nutriente</th>
              <th style={{ padding: '1rem' }}>Cantidad</th>
              <th style={{ padding: '1rem' }}>Beneficio</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '1rem', fontWeight: '600' }}>Energía</td>
              <td style={{ padding: '1rem' }}>20 kcal</td>
              <td style={{ padding: '1rem' }}>Alimento ligero</td>
            </tr>
            <tr style={{ background: '#f8f9fa' }}>
              <td style={{ padding: '1rem', fontWeight: '600' }}>Carbohidratos</td>
              <td style={{ padding: '1rem' }}>3.9 g</td>
              <td style={{ padding: '1rem' }}>Energía suave</td>
            </tr>
            <tr>
              <td style={{ padding: '1rem', fontWeight: '600' }}>Proteína</td>
              <td style={{ padding: '1rem' }}>2.2 g</td>
              <td style={{ padding: '1rem' }}>Crecimiento celular</td>
            </tr>
            <tr style={{ background: '#f8f9fa' }}>
              <td style={{ padding: '1rem', fontWeight: '600' }}>Grasas</td>
              <td style={{ padding: '1rem' }}>0.1 g</td>
              <td style={{ padding: '1rem' }}>Muy bajo en grasa</td>
            </tr>
            <tr>
              <td style={{ padding: '1rem', fontWeight: '600' }}>Fibra</td>
              <td style={{ padding: '1rem' }}>2.1 g</td>
              <td style={{ padding: '1rem' }}>Digestión saludable</td>
            </tr>
            <tr style={{ background: '#f8f9fa' }}>
              <td style={{ padding: '1rem', fontWeight: '600' }}>Ácido fólico (B9)</td>
              <td style={{ padding: '1rem' }}>52 mcg</td>
              <td style={{ padding: '1rem' }}>Desarrollo cerebral</td>
            </tr>
            <tr>
              <td style={{ padding: '1rem', fontWeight: '600' }}>Vitamina C</td>
              <td style={{ padding: '1rem' }}>5.6 mg</td>
              <td style={{ padding: '1rem' }}>Defensas</td>
            </tr>
            <tr style={{ background: '#f8f9fa' }}>
              <td style={{ padding: '1rem', fontWeight: '600' }}>Potasio</td>
              <td style={{ padding: '1rem' }}>202 mg</td>
              <td style={{ padding: '1rem' }}>Sistema nervioso</td>
            </tr>
          </tbody>
        </table>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Recomendaciones para las familias</h2>

      <div className="tips-box mb-5" data-aos="fade-up">
        <i className="bi bi-lightbulb-fill"></i>
        <ul>
          <li>Introducir el espárrago de manera progresiva.</li>
          <li>Evitar forzar su consumo.</li>
          <li>Ofrecerlo en ambientes tranquilos y sin presión.</li>
          <li>Respetar el ritmo y las preferencias sensoriales del niño.</li>
          <li>Asegurarse de retirar las partes fibrosas antes de servir.</li>
        </ul>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Nota importante</h2>

      <div className="warning-box mb-5" data-aos="fade-up">
        <i className="bi bi-exclamation-triangle-fill"></i>
        <div>
          <p className="mb-2"><strong>Cada niño es único.</strong></p>
          <p className="mb-2">Al introducir cualquier alimento nuevo:</p>
          <ul className="mb-0">
            <li>Hacerlo en pequeñas cantidades.</li>
            <li>Observar la tolerancia digestiva y sensorial.</li>
            <li>Si existen antecedentes de alergias alimentarias, se recomienda consultar con un profesional de salud.</li>
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