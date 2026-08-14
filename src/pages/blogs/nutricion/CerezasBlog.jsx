import React from 'react';

export default function CerezasBlog() {
  return (
    <>
      <div className="lead mb-5" style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#555' }}>
        Las cerezas son una fruta de sabor suave que aporta vitaminas y antioxidantes. Pueden ofrecerse
        desde el primer año siempre sin pepa y con textura adecuada para garantizar una ingesta segura.
      </div>

      <hr className="my-5" />

      <h2 className="section-title">¿Por qué son una buena opción para niños pequeños?</h2>

      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-shield-fill-check"></i>
            </div>
            <h3>Ricas en antioxidantes</h3>
            <p>Protegen las células del daño oxidativo.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-heart-pulse-fill"></i>
            </div>
            <h3>Aportan vitamina C</h3>
            <p>Fortalecen el sistema inmunológico.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-moon-stars-fill"></i>
            </div>
            <h3>Contribuyen al descanso</h3>
            <p>Por su contenido de melatonina natural.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-diagram-3-fill"></i>
            </div>
            <h3>Favorecen la digestión</h3>
            <p>Gracias a su contenido de fibra natural.</p>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Cómo ofrecerlas desde 1 año</h2>

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
          <li style={{ marginBottom: '0.5rem' }}>Retirar siempre la pepa antes de ofrecer.</li>
          <li style={{ marginBottom: '0.5rem' }}>Cortar en trozos pequeños y seguros.</li>
          <li style={{ marginBottom: '0.5rem' }}>Aplastar o cocer suavemente si es necesario.</li>
          <li style={{ marginBottom: '0.5rem' }}>Supervisar siempre durante el consumo.</li>
          <li style={{ marginBottom: '0.5rem' }}>Lavar muy bien antes de ofrecer.</li>
        </ul>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Formas de incluirlas en la alimentación</h2>

      <div className="row gy-4 mb-5">
        <div className="col-md-4" data-aos="flip-up" data-aos-delay="100">
          <div className="idea-card">
            <i className="bi bi-cup-straw"></i>
            <h3>Como snack</h3>
            <p>Frescas, sin pepa y cortadas.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="flip-up" data-aos-delay="200">
          <div className="idea-card">
            <i className="bi bi-droplet-fill"></i>
            <h3>En purés</h3>
            <p>Cocidas y mezcladas con otras frutas.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="flip-up" data-aos-delay="300">
          <div className="idea-card">
            <i className="bi bi-sun-fill"></i>
            <h3>En el desayuno</h3>
            <p>Sobre yogur natural o avena.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="flip-up" data-aos-delay="400">
          <div className="idea-card">
            <i className="bi bi-snow"></i>
            <h3>Congeladas</h3>
            <p>Para aliviar molestias dentales.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="flip-up" data-aos-delay="500">
          <div className="idea-card">
            <i className="bi bi-water"></i>
            <h3>En compotas</h3>
            <p>Cocidas sin azúcar añadida.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="flip-up" data-aos-delay="600">
          <div className="idea-card">
            <i className="bi bi-backpack-fill"></i>
            <h3>En la lonchera</h3>
            <p>Frescas y bien preparadas.</p>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Recomendaciones importantes</h2>

      <div className="alert-info mb-4">
        <i className="bi bi-info-circle-fill me-2"></i>
        Siempre retirar la pepa para evitar riesgo de atragantamiento
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
            <li style={{ marginBottom: '0.5rem' }}>Nunca ofrecer cerezas con pepa a niños pequeños.</li>
            <li style={{ marginBottom: '0.5rem' }}>Cortar en tamaño adecuado según la edad del niño.</li>
            <li style={{ marginBottom: '0.5rem' }}>Observar posibles reacciones alérgicas al introducirlas.</li>
            <li style={{ marginBottom: '0.5rem' }}>Preferir cerezas frescas y de temporada.</li>
            <li style={{ marginBottom: '0.5rem' }}>Evitar cerezas en almíbar o con azúcar añadida.</li>
          </ul>
        </div>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Tabla nutricional de las cerezas (por 100 g)</h2>

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
              <td>63 kcal</td>
              <td>Energía ligera</td>
            </tr>
            <tr>
              <td><strong>Carbohidratos</strong></td>
              <td>16 g</td>
              <td>Fuente de energía</td>
            </tr>
            <tr>
              <td><strong>Fibra</strong></td>
              <td>2.1 g</td>
              <td>Digestión saludable</td>
            </tr>
            <tr>
              <td><strong>Vitamina C</strong></td>
              <td>7 mg</td>
              <td>Sistema inmune</td>
            </tr>
            <tr>
              <td><strong>Potasio</strong></td>
              <td>222 mg</td>
              <td>Función nerviosa</td>
            </tr>
            <tr>
              <td><strong>Antioxidantes</strong></td>
              <td>Alto contenido</td>
              <td>Protección celular</td>
            </tr>
            <tr>
              <td><strong>Melatonina</strong></td>
              <td>Presente</td>
              <td>Favorece el descanso</td>
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