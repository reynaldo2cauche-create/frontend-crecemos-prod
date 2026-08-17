import React from 'react';

export default function PasasBlog() {
  return (
    <>
      <div className="lead mb-5" style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#555' }}>
        Las pasas son uvas deshidratadas de sabor dulce natural y alta concentración de nutrientes. Aportan energía, fibra y minerales, por lo que pueden incorporarse en la alimentación infantil a partir del primer año, siempre que se ofrezcan en pequeñas cantidades y con la textura adaptada.
      </div>

      <hr className="my-5" />

      <h2 className="section-title">¿Por qué las pasas pueden ser beneficiosas para niños pequeños?</h2>

      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-lightning-charge-fill"></i>
            </div>
            <h3>Fuente natural de energía</h3>
            <p>Por su contenido de azúcares naturales.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-clipboard-pulse"></i>
            </div>
            <h3>Aportan fibra</h3>
            <p>Favorece el tránsito intestinal.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-heart-pulse-fill"></i>
            </div>
            <h3>Contienen hierro</h3>
            <p>Importante para el transporte de oxígeno.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-activity"></i>
            </div>
            <h3>Aportan potasio</h3>
            <p>Contribuye a la función muscular y nerviosa.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="500">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-check-circle-fill"></i>
            </div>
            <h3>Sin grasas ni colesterol</h3>
            <p>Alimento naturalmente bajo en grasa.</p>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Cómo ofrecer pasas de forma segura a niños desde 1 año</h2>

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
            <li style={{ marginBottom: '0.5rem' }}>No ofrecer pasas enteras por riesgo de atragantamiento.</li>
            <li style={{ marginBottom: '0.5rem' }}>Hidratarlas en agua para ablandarlas.</li>
            <li style={{ marginBottom: '0.5rem' }}>Picarlas muy finamente.</li>
            <li style={{ marginBottom: '0.5rem' }}>Aplastarlas o triturarlas antes de ofrecer.</li>
            <li style={{ marginBottom: '0.5rem' }}>Mezclarlas con preparaciones blandas.</li>
          </ul>
        </div>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Pasas en la alimentación diaria</h2>

      <div className="row gy-4 mb-5">
        <div className="col-md-3" data-aos="flip-up" data-aos-delay="100">
          <div className="idea-card">
            <i className="bi bi-cup-hot-fill"></i>
            <h3>Mezcladas con alimentos suaves</h3>
            <p>En pequeñas cantidades.</p>
          </div>
        </div>

        <div className="col-md-3" data-aos="flip-up" data-aos-delay="200">
          <div className="idea-card">
            <i className="bi bi-stars"></i>
            <h3>Preparaciones blandas</h3>
            <p>Parte de recetas suaves.</p>
          </div>
        </div>

        <div className="col-md-3" data-aos="flip-up" data-aos-delay="300">
          <div className="idea-card">
            <i className="bi bi-backpack-fill"></i>
            <h3>En la lonchera</h3>
            <p>Siempre bien adaptadas en textura.</p>
          </div>
        </div>

        <div className="col-md-3" data-aos="flip-up" data-aos-delay="400">
          <div className="idea-card">
            <i className="bi bi-x-circle-fill"></i>
            <h3>No solas como snack</h3>
            <p>Evitar ofrecerlas enteras.</p>
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
          <li style={{ marginBottom: '0.5rem' }}>Introducir las pasas de forma gradual.</li>
          <li style={{ marginBottom: '0.5rem' }}>Ofrecer cantidades muy pequeñas.</li>
          <li style={{ marginBottom: '0.5rem' }}>Observar tolerancia digestiva.</li>
          <li style={{ marginBottom: '0.5rem' }}>Evitar combinarlas con otros alimentos muy azucarados.</li>
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
          <p className="mb-0">Las pasas son un alimento concentrado en azúcares naturales. No deben ofrecerse en exceso ni de forma diaria en niños pequeños. Ante antecedentes de caries, estreñimiento o dificultades de masticación, consultar con un profesional de salud.</p>
        </div>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Tabla nutricional de las pasas (por 100 g)</h2>

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
              <td>299 kcal</td>
              <td>Alta densidad energética</td>
            </tr>
            <tr>
              <td><strong>Carbohidratos</strong></td>
              <td>79 g</td>
              <td>Energía rápida</td>
            </tr>
            <tr>
              <td><strong>Azúcares naturales</strong></td>
              <td>59 g</td>
              <td>Sabor dulce natural</td>
            </tr>
            <tr>
              <td><strong>Fibra</strong></td>
              <td>3.7 g</td>
              <td>Digestión saludable</td>
            </tr>
            <tr>
              <td><strong>Proteína</strong></td>
              <td>3.1 g</td>
              <td>Crecimiento celular</td>
            </tr>
            <tr>
              <td><strong>Grasas</strong></td>
              <td>0.5 g</td>
              <td>Muy bajo en grasa</td>
            </tr>
            <tr>
              <td><strong>Hierro</strong></td>
              <td>1.9 mg</td>
              <td>Transporte de oxígeno</td>
            </tr>
            <tr>
              <td><strong>Potasio</strong></td>
              <td>749 mg</td>
              <td>Función nerviosa</td>
            </tr>
            <tr>
              <td><strong>Calcio</strong></td>
              <td>50 mg</td>
              <td>Salud ósea</td>
            </tr>
            <tr>
              <td><strong>Magnesio</strong></td>
              <td>32 mg</td>
              <td>Función neuromuscular</td>
            </tr>
          </tbody>
        </table>
      </div>

      <hr className="my-5" />

      {/* Autor */}
      <div className="author-credits" data-aos="fade-up">
        <div className="d-flex align-items-center gap-3">
          <div className="author-avatar">
            <i className="bi bi-person-circle" style={{ fontSize: '4rem', color: 'var(--cx-primary)' }}></i>
          </div>
          <div>
            <h4 style={{ marginBottom: '0.25rem' }}>Leonardo Yactayo Uceda</h4>
            <p style={{ marginBottom: '0.4rem', color: 'var(--cx-muted)', fontSize: '0.95rem' }}>
              <strong>Curso en Nutrición y Alimentación Infantil – Universidad Científica del Sur</strong>
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
