import React from 'react';

export default function GolosinasBlog() {
  return (
    <>
      <div className="lead mb-5" style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#555' }}>
        Las golosinas como caramelos, chupetines, gomitas y chocolates azucarados son productos ultraprocesados con alto contenido de azúcar, colorantes y aditivos, y bajo o nulo valor nutricional. Su consumo frecuente no es recomendable en la infancia, ya que interfiere con el desarrollo de hábitos alimentarios saludables.
      </div>

      <hr className="my-5" />

      <h2 className="section-title">¿Por qué las golosinas no son adecuadas para los niños?</h2>

      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-graph-up-arrow"></i>
            </div>
            <h3>Exceso de azúcar</h3>
            <p>Aumenta el riesgo de sobrepeso y obesidad.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-emoji-frown-fill"></i>
            </div>
            <h3>Mayor riesgo de caries dentales</h3>
            <p>Desde edades tempranas.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-arrow-down-circle-fill"></i>
            </div>
            <h3>Alteraciones en el apetito</h3>
            <p>Rechazo de alimentos nutritivos.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-lightning-fill"></i>
            </div>
            <h3>Cambios bruscos de energía</h3>
            <p>Picos y caídas de energía.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="500">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-palette-fill"></i>
            </div>
            <h3>Preferencia por sabores artificiales</h3>
            <p>Sabores intensos que afectan las preferencias.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="600">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-dash-circle-fill"></i>
            </div>
            <h3>Pobre aporte nutricional</h3>
            <p>Sin vitaminas, minerales ni fibra.</p>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Impacto del consumo de golosinas en niños neurodivergentes</h2>

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
            <li style={{ marginBottom: '0.5rem' }}>Incremento de hiperactividad o irritabilidad.</li>
            <li style={{ marginBottom: '0.5rem' }}>Mayor selectividad alimentaria.</li>
            <li style={{ marginBottom: '0.5rem' }}>Hipersensibilidad sensorial por colores y sabores intensos.</li>
            <li style={{ marginBottom: '0.5rem' }}>Molestias digestivas como gases o dolor abdominal.</li>
            <li style={{ marginBottom: '0.5rem' }}>Conductas de búsqueda de recompensa basada en azúcar.</li>
          </ul>
        </div>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">¿Qué ofrecer en lugar de golosinas?</h2>

      <div className="row gy-4 mb-5">
        <div className="col-md-4" data-aos="flip-up" data-aos-delay="100">
          <div className="idea-card">
            <i className="bi bi-apple"></i>
            <h3>Frutas frescas</h3>
            <p>Naturales y nutritivas.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="flip-up" data-aos-delay="200">
          <div className="idea-card">
            <i className="bi bi-sun-fill"></i>
            <h3>Frutas deshidratadas</h3>
            <p>Naturales en pequeñas cantidades.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="flip-up" data-aos-delay="300">
          <div className="idea-card">
            <i className="bi bi-nut-fill"></i>
            <h3>Frutos secos</h3>
            <p>Adaptados a edad y textura.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="flip-up" data-aos-delay="400">
          <div className="idea-card">
            <i className="bi bi-cup-straw"></i>
            <h3>Yogur natural</h3>
            <p>Sin azúcares añadidos.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="flip-up" data-aos-delay="500">
          <div className="idea-card">
            <i className="bi bi-house-heart-fill"></i>
            <h3>Preparaciones caseras</h3>
            <p>Sin azúcar añadida.</p>
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
          <li style={{ marginBottom: '0.5rem' }}>Evitar ofrecer golosinas como premio o castigo.</li>
          <li style={{ marginBottom: '0.5rem' }}>No normalizar su consumo en celebraciones.</li>
          <li style={{ marginBottom: '0.5rem' }}>Leer etiquetas y evitar productos con alto contenido de azúcar.</li>
          <li style={{ marginBottom: '0.5rem' }}>Dar el ejemplo en casa con elecciones saludables.</li>
          <li style={{ marginBottom: '0.5rem' }}>Establecer rutinas claras de alimentación.</li>
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
          <p className="mb-0">Aunque algunas golosinas se presenten como sin azúcar o naturales, siguen siendo productos procesados con aditivos no recomendables para niños pequeños. La evitación temprana favorece mejores hábitos alimentarios a largo plazo.</p>
        </div>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Tabla nutricional de una golosina tipo (por 100 g)</h2>

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
              <td>350-400 kcal</td>
              <td>Calorías vacías</td>
            </tr>
            <tr>
              <td><strong>Azúcares</strong></td>
              <td>70-80 g</td>
              <td>Exceso para niños</td>
            </tr>
            <tr>
              <td><strong>Proteína</strong></td>
              <td>0-2 g</td>
              <td>Aporte mínimo</td>
            </tr>
            <tr>
              <td><strong>Grasas</strong></td>
              <td>0-5 g</td>
              <td>Baja calidad</td>
            </tr>
            <tr>
              <td><strong>Fibra</strong></td>
              <td>0 g</td>
              <td>No aporta</td>
            </tr>
            <tr>
              <td><strong>Sodio</strong></td>
              <td>10-40 mg</td>
              <td>Innecesario</td>
            </tr>
            <tr>
              <td><strong>Colorantes y aditivos</strong></td>
              <td>Elevado</td>
              <td>No recomendables</td>
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
