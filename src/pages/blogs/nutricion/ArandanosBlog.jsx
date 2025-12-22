import React from 'react';

export default function ArandanosBlog() {
  return (
    <>
      <div className="lead mb-5" style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#555' }}>
        Los arándanos son una fruta pequeña con alto valor nutricional, rica en antioxidantes y vitaminas. Pueden incorporarse en la alimentación infantil desde el primer año, adaptando su textura para garantizar una ingesta segura y nutritiva.
      </div>

      <hr className="my-5" />

      <h2 className="section-title">¿Por qué son una buena opción para niños pequeños?</h2>

      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-shield-fill-check"></i>
            </div>
            <h3>Ricos en antioxidantes naturales</h3>
            <p>Protegen las células del daño oxidativo.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-star-fill"></i>
            </div>
            <h3>Favorecen la salud cerebral</h3>
            <p>Apoyan el desarrollo cognitivo y neuronal.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-heart-pulse-fill"></i>
            </div>
            <h3>Aportan vitamina C</h3>
            <p>Fortalecen el sistema inmunológico.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-diagram-3-fill"></i>
            </div>
            <h3>Apoyan la digestión</h3>
            <p>Gracias a su contenido de fibra natural.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="500">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-lightning-charge-fill"></i>
            </div>
            <h3>Contribuyen a la memoria y concentración</h3>
            <p>Benefician las funciones cognitivas.</p>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Cómo ofrecerlos desde 1 año</h2>

      <div className="tips-box mb-5" data-aos="fade-up" style={{
        background: '#fff8e1',
        borderLeft: '4px solid #ffc107',
        padding: '1.5rem 2rem',
        borderRadius: '8px',
        display: 'flex',
        gap: '1.5rem'
      }}>
        <i className="bi bi-lightbulb-fill" style={{ fontSize: '2rem', color: '#ffc107', flexShrink: 0 }}></i>
        <ul style={{ marginBottom: 0, paddingLeft: '1.5rem', listStyle: 'disc' }}>
          <li style={{ marginBottom: '0.5rem' }}>Lavar muy bien antes de ofrecer.</li>
          <li style={{ marginBottom: '0.5rem' }}>Aplastar o triturar para niños pequeños (1-2 años).</li>
          <li style={{ marginBottom: '0.5rem' }}>Partir por la mitad cuando ya mastican mejor (2+ años).</li>
          <li style={{ marginBottom: '0.5rem' }}>Ofrecer en pequeñas cantidades al inicio.</li>
          <li style={{ marginBottom: '0.5rem' }}>Supervisar siempre durante el consumo.</li>
        </ul>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Formas de incluirlos en la alimentación</h2>

      <div className="row gy-4 mb-5">
        <div className="col-md-4" data-aos="flip-up" data-aos-delay="100">
          <div className="idea-card">
            <i className="bi bi-cup-straw"></i>
            <h3>En smoothies</h3>
            <p>Mezclados con plátano y yogur natural.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="flip-up" data-aos-delay="200">
          <div className="idea-card">
            <i className="bi bi-sun-fill"></i>
            <h3>En el desayuno</h3>
            <p>Sobre avena, quinua o papillas.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="flip-up" data-aos-delay="300">
          <div className="idea-card">
            <i className="bi bi-egg-fried"></i>
            <h3>Como snack</h3>
            <p>Aplastados o cortados por la mitad.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="flip-up" data-aos-delay="400">
          <div className="idea-card">
            <i className="bi bi-snow"></i>
            <h3>Congelados</h3>
            <p>Para aliviar molestias dentales.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="flip-up" data-aos-delay="500">
          <div className="idea-card">
            <i className="bi bi-water"></i>
            <h3>En compotas</h3>
            <p>Cocidos sin azúcar añadida.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="flip-up" data-aos-delay="600">
          <div className="idea-card">
            <i className="bi bi-backpack-fill"></i>
            <h3>En la lonchera</h3>
            <p>Frescos en un recipiente pequeño.</p>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Recomendaciones importantes</h2>

      <div className="alert-info mb-4">
        <i className="bi bi-info-circle-fill me-2"></i>
        Los arándanos deben ofrecerse en textura segura para evitar riesgo de atragantamiento
      </div>

      <div className="warning-box mb-5" data-aos="fade-up" style={{
        background: '#ffebee',
        borderLeft: '4px solid #f44336',
        padding: '1.5rem 2rem',
        borderRadius: '8px',
        display: 'flex',
        gap: '1.5rem'
      }}>
        <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '2rem', color: '#f44336', flexShrink: 0 }}></i>
        <div>
          <ul style={{ marginBottom: 0, paddingLeft: '1.5rem', listStyle: 'disc' }}>
            <li style={{ marginBottom: '0.5rem' }}>No ofrecer arándanos enteros a niños menores de 2 años sin supervisión.</li>
            <li style={{ marginBottom: '0.5rem' }}>Aplastar, partir o triturar según la edad y capacidad de masticación.</li>
            <li style={{ marginBottom: '0.5rem' }}>Observar posibles reacciones alérgicas al introducirlos por primera vez.</li>
            <li style={{ marginBottom: '0.5rem' }}>Preferir arándanos frescos o congelados sin azúcar añadida.</li>
            <li style={{ marginBottom: '0.5rem' }}>Evitar arándanos deshidratados azucarados para niños pequeños.</li>
          </ul>
        </div>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Tabla nutricional de los arándanos (por 100 g)</h2>

      <div className="table-responsive mb-5" data-aos="fade-up">
        <table className="table table-hover" style={{
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <thead style={{ background: 'linear-gradient(135deg, #c263f9 0%, #d99ffd 100%)', color: 'white' }}>
            <tr>
              <th>Nutriente</th>
              <th>Cantidad</th>
              <th>Beneficio</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Energía</strong></td>
              <td>57 kcal</td>
              <td>Energía ligera</td>
            </tr>
            <tr>
              <td><strong>Carbohidratos</strong></td>
              <td>14 g</td>
              <td>Fuente de energía</td>
            </tr>
            <tr>
              <td><strong>Fibra</strong></td>
              <td>2.4 g</td>
              <td>Digestión saludable</td>
            </tr>
            <tr>
              <td><strong>Vitamina C</strong></td>
              <td>9.7 mg</td>
              <td>Sistema inmune</td>
            </tr>
            <tr>
              <td><strong>Vitamina K</strong></td>
              <td>19.3 mcg</td>
              <td>Coagulación sanguínea</td>
            </tr>
            <tr>
              <td><strong>Manganeso</strong></td>
              <td>0.3 mg</td>
              <td>Metabolismo y huesos</td>
            </tr>
            <tr>
              <td><strong>Antioxidantes</strong></td>
              <td>Alto contenido</td>
              <td>Protección celular</td>
            </tr>
          </tbody>
        </table>
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
