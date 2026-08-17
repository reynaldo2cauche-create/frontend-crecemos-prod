import React from 'react';

export default function GaseosasBlog() {
  return (
    <>
      <div className="lead mb-5" style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#555' }}>
        Las gaseosas son bebidas ultraprocesadas que contienen altas cantidades de azúcar, aditivos, colorantes y gas. No aportan beneficios nutricionales reales para el crecimiento infantil y su consumo no es recomendado en ninguna etapa de la infancia, especialmente antes de los 5 años.
      </div>

      <hr className="my-5" />

      <h2 className="section-title">¿Por qué las gaseosas no son adecuadas para los niños?</h2>

      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-graph-up-arrow"></i>
            </div>
            <h3>Exceso de azúcares</h3>
            <p>Aumentan el riesgo de sobrepeso y obesidad infantil.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-emoji-frown-fill"></i>
            </div>
            <h3>Caries dentales</h3>
            <p>Favorecen la aparición de problemas en la salud dental.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-dash-circle-fill"></i>
            </div>
            <h3>Sin aporte nutricional</h3>
            <p>No aportan vitaminas, minerales ni fibra.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-exclamation-triangle-fill"></i>
            </div>
            <h3>Irritación gástrica</h3>
            <p>El gas y la acidez pueden causar molestias digestivas.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="500">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-box-arrow-down"></i>
            </div>
            <h3>Desplazan alimentos nutritivos</h3>
            <p>Alteran la saciedad y reducen el consumo de comida saludable.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="600">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-lightning-fill"></i>
            </div>
            <h3>Hiperactividad o irritabilidad</h3>
            <p>Pueden aumentar estos comportamientos en algunos niños.</p>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Impacto del consumo de gaseosas en niños neurodivergentes</h2>

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
            <li style={{ marginBottom: '0.5rem' }}>Incremento de la sensibilidad sensorial.</li>
            <li style={{ marginBottom: '0.5rem' }}>Mayor irritabilidad o desregulación conductual.</li>
            <li style={{ marginBottom: '0.5rem' }}>Molestias digestivas como gases o distensión abdominal.</li>
            <li style={{ marginBottom: '0.5rem' }}>Preferencia por sabores artificiales que dificulta aceptar alimentos naturales.</li>
          </ul>
        </div>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">¿Qué ofrecer en lugar de gaseosas?</h2>

      <div className="row gy-4 mb-5">
        <div className="col-md-3" data-aos="flip-up" data-aos-delay="100">
          <div className="idea-card">
            <i className="bi bi-droplet-fill"></i>
            <h3>Agua</h3>
            <p>La mejor opción de hidratación.</p>
          </div>
        </div>

        <div className="col-md-3" data-aos="flip-up" data-aos-delay="200">
          <div className="idea-card">
            <i className="bi bi-cup-straw"></i>
            <h3>Agua de coco natural</h3>
            <p>En pequeñas cantidades ocasionales.</p>
          </div>
        </div>

        <div className="col-md-3" data-aos="flip-up" data-aos-delay="300">
          <div className="idea-card">
            <i className="bi bi-apple"></i>
            <h3>Frutas frescas</h3>
            <p>Naturales y nutritivas.</p>
          </div>
        </div>

        <div className="col-md-3" data-aos="flip-up" data-aos-delay="400">
          <div className="idea-card">
            <i className="bi bi-cup-hot-fill"></i>
            <h3>Infusiones naturales</h3>
            <p>Suaves, según edad y recomendación.</p>
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
          <li style={{ marginBottom: '0.5rem' }}>Evitar introducir gaseosas solo por probar.</li>
          <li style={{ marginBottom: '0.5rem' }}>No ofrecerlas como premio o parte de celebraciones.</li>
          <li style={{ marginBottom: '0.5rem' }}>Dar el ejemplo como adultos.</li>
          <li style={{ marginBottom: '0.5rem' }}>Explicar con lenguaje simple por qué no son saludables.</li>
          <li style={{ marginBottom: '0.5rem' }}>Mantenerlas fuera del alcance en casa.</li>
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
          <p className="mb-0"><strong>Las gaseosas sin azúcar o "light" también contienen aditivos y ácidos no recomendables para niños.</strong> El consumo ocasional no debe normalizarse en la infancia.</p>
        </div>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Tabla nutricional de una gaseosa regular (por 100 ml)</h2>

      <div className="table-responsive mb-5" data-aos="fade-up">
        <table className="table table-hover" style={{
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <thead style={{ background: 'linear-gradient(135deg, #c263f9 0%, #d99ffd 100%)', color: 'white' }}>
            <tr>
              <th>Componente</th>
              <th>Cantidad</th>
              <th>Observación</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Energía</strong></td>
              <td>42 kcal</td>
              <td>Calorías vacías</td>
            </tr>
            <tr>
              <td><strong>Azúcares</strong></td>
              <td>10.6 g</td>
              <td>Exceso para niños</td>
            </tr>
            <tr>
              <td><strong>Proteína</strong></td>
              <td>0 g</td>
              <td>Sin aporte</td>
            </tr>
            <tr>
              <td><strong>Grasas</strong></td>
              <td>0 g</td>
              <td>Sin aporte</td>
            </tr>
            <tr>
              <td><strong>Fibra</strong></td>
              <td>0 g</td>
              <td>No aporta</td>
            </tr>
            <tr>
              <td><strong>Sodio</strong></td>
              <td>7 mg</td>
              <td>Innecesario</td>
            </tr>
            <tr>
              <td><strong>Cafeína (algunas)</strong></td>
              <td>Variable</td>
              <td>No recomendada</td>
            </tr>
            <tr>
              <td><strong>Vitaminas/minerales</strong></td>
              <td>0</td>
              <td>No aporta</td>
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
