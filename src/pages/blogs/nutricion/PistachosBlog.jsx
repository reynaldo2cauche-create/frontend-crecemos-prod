import React from 'react';

export default function PistachosBlog() {
  return (
    <>
      <div className="lead mb-5" style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#555' }}>
        Los pistachos son un fruto seco con alto valor nutricional, ricos en proteínas vegetales, grasas saludables, fibra y antioxidantes. Pueden formar parte de la alimentación infantil a partir del primer año, siempre que se presenten bien adaptados en textura, ya que no deben ofrecerse enteros por riesgo de atragantamiento.
      </div>

      <hr className="my-5" />

      <h2 className="section-title">¿Por qué los pistachos pueden ser beneficiosos para niños pequeños?</h2>

      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-star-fill"></i>
            </div>
            <h3>Grasas saludables</h3>
            <p>Importantes para el desarrollo cerebral.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-grid-3x3-gap-fill"></i>
            </div>
            <h3>Proteínas vegetales</h3>
            <p>Necesarias para el crecimiento.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-lightning-charge-fill"></i>
            </div>
            <h3>Vitamina B6</h3>
            <p>Relacionada con la función cerebral.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-shield-fill-check"></i>
            </div>
            <h3>Antioxidantes</h3>
            <p>Protegen las células del cuerpo.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="500">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-clipboard-pulse"></i>
            </div>
            <h3>Fibra</h3>
            <p>Favorece la salud digestiva en pequeñas cantidades.</p>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Cómo ofrecer pistachos de forma segura a niños desde 1 año</h2>

      <div className="warning-box mb-5" data-aos="fade-up" style={{
        background: '#fff3e0',
        borderLeft: '4px solid #ff9800',
        padding: '1.5rem 2rem',
        borderRadius: '8px',
        display: 'flex',
        gap: '1.5rem'
      }}>
        <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '2rem', color: '#ff9800', flexShrink: 0 }}></i>
        <div>
          <ul style={{ marginBottom: 0, paddingLeft: '1.5rem', listStyle: 'disc' }}>
            <li style={{ marginBottom: '0.5rem' }}>Nunca ofrecer pistachos enteros o en trozos grandes.</li>
            <li style={{ marginBottom: '0.5rem' }}>Ofrecerlos molidos finamente o triturados.</li>
            <li style={{ marginBottom: '0.5rem' }}>Utilizar pasta de pistacho natural sin azúcar ni aditivos.</li>
            <li style={{ marginBottom: '0.5rem' }}>Mezclarlos en purés o preparaciones blandas.</li>
          </ul>
        </div>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Pistachos en la alimentación diaria</h2>

      <div className="row gy-4 mb-5">
        <div className="col-md-3" data-aos="flip-up" data-aos-delay="100">
          <div className="idea-card">
            <i className="bi bi-cup-hot-fill"></i>
            <h3>Purés de frutas o verduras</h3>
            <p>Mezclados en preparaciones suaves.</p>
          </div>
        </div>

        <div className="col-md-3" data-aos="flip-up" data-aos-delay="200">
          <div className="idea-card">
            <i className="bi bi-stars"></i>
            <h3>Preparaciones blandas</h3>
            <p>Añadidos a recetas suaves.</p>
          </div>
        </div>

        <div className="col-md-3" data-aos="flip-up" data-aos-delay="300">
          <div className="idea-card">
            <i className="bi bi-egg-fill"></i>
            <h3>Cremas o pastas naturales</h3>
            <p>Parte de preparaciones cremosas.</p>
          </div>
        </div>

        <div className="col-md-3" data-aos="flip-up" data-aos-delay="400">
          <div className="idea-card">
            <i className="bi bi-backpack-fill"></i>
            <h3>En la lonchera</h3>
            <p>Bien molidos y en pequeñas cantidades.</p>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Recomendaciones para las familias</h2>

      <div className="tips-box mb-5" data-aos="fade-up" style={{
        background: '#fff8e1',
        borderLeft: '4px solid #ffc107',
        padding: '1.5rem 2rem',
        borderRadius: '8px',
        display: 'flex',
        gap: '1.5rem'
      }}>
        <i className="bi bi-check-circle-fill" style={{ fontSize: '2rem', color: '#ffc107', flexShrink: 0 }}></i>
        <ul style={{ marginBottom: 0, paddingLeft: '1.5rem', listStyle: 'disc' }}>
          <li style={{ marginBottom: '0.5rem' }}>Introducir los pistachos de forma gradual.</li>
          <li style={{ marginBottom: '0.5rem' }}>Ofrecer cantidades muy pequeñas al inicio.</li>
          <li style={{ marginBottom: '0.5rem' }}>Observar tolerancia digestiva y sensorial.</li>
          <li style={{ marginBottom: '0.5rem' }}>Evitar combinarlos con muchos alimentos nuevos el mismo día.</li>
          <li style={{ marginBottom: '0.5rem' }}>Supervisar siempre el momento de consumo.</li>
        </ul>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Nota importante</h2>

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
          <p className="mb-0">Los frutos secos pueden provocar reacciones alérgicas. Al introducir pistachos por primera vez, hacerlo en cantidades mínimas y durante el día. Consultar con un alergólogo si existen antecedentes familiares de alergias alimentarias.</p>
        </div>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Tabla nutricional de los pistachos (por 100 g)</h2>

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
              <td>560 kcal</td>
              <td>Alta densidad energética</td>
            </tr>
            <tr>
              <td><strong>Grasas totales</strong></td>
              <td>45 g</td>
              <td>Desarrollo cerebral</td>
            </tr>
            <tr>
              <td><strong>Proteína</strong></td>
              <td>20 g</td>
              <td>Crecimiento celular</td>
            </tr>
            <tr>
              <td><strong>Carbohidratos</strong></td>
              <td>28 g</td>
              <td>Energía</td>
            </tr>
            <tr>
              <td><strong>Fibra</strong></td>
              <td>10 g</td>
              <td>Digestión saludable</td>
            </tr>
            <tr>
              <td><strong>Vitamina B6</strong></td>
              <td>1.7 mg</td>
              <td>Función cerebral</td>
            </tr>
            <tr>
              <td><strong>Vitamina E</strong></td>
              <td>2.3 mg</td>
              <td>Antioxidante</td>
            </tr>
            <tr>
              <td><strong>Potasio</strong></td>
              <td>1025 mg</td>
              <td>Función nerviosa</td>
            </tr>
            <tr>
              <td><strong>Magnesio</strong></td>
              <td>121 mg</td>
              <td>Función neuromuscular</td>
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
