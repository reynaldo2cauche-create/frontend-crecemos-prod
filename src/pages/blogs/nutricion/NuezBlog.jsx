// nutricion/NuezBlog.jsx
import React from 'react';

export default function NuezBlog() {
  return (
    <>
      <div className="lead mb-5" style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#555' }}>
        La nuez es un fruto seco con un alto valor nutricional, especialmente por su contenido de grasas saludables y Omega 3. Puede formar parte de la alimentación infantil desde el primer año, siempre que se ofrezca de manera segura y adaptada, ya que su textura dura representa un riesgo si se consume entera.
      </div>

      <div className="alert mb-5" style={{
        background: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: '8px',
        padding: '1rem',
        display: 'flex',
        alignItems: 'start'
      }}>
        <i className="bi bi-exclamation-triangle-fill me-2" style={{ color: '#856404', marginTop: '0.25rem' }}></i>
        <div>
          <strong>Importante:</strong> Nunca ofrecer nueces enteras a niños menores de 5 años. Siempre deben estar molidas, trituradas o en forma de pasta natural.
        </div>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">¿Por qué la nuez puede ser beneficiosa para niños pequeños?</h2>

      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-lightning-fill"></i>
            </div>
            <h3>Rica en Omega 3</h3>
            <p>Importante para el desarrollo cerebral y el sistema nervioso.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-heart-pulse-fill"></i>
            </div>
            <h3>Grasas saludables</h3>
            <p>Apoyan la función cognitiva y la regulación emocional.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-egg-fill"></i>
            </div>
            <h3>Proteínas vegetales</h3>
            <p>Necesarias para el crecimiento y desarrollo físico.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-shield-check"></i>
            </div>
            <h3>Vitamina E</h3>
            <p>Acción antioxidante que protege las células.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="500">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-capsule"></i>
            </div>
            <h3>Minerales esenciales</h3>
            <p>Magnesio y fósforo para función neuromuscular y salud ósea.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="600">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-graph-up-arrow"></i>
            </div>
            <h3>Alta densidad energética</h3>
            <p>Ideal para niños con alta demanda calórica.</p>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Cómo ofrecer nuez de forma segura a niños desde 1 año</h2>

      <div className="alert mb-5" style={{
        background: '#e7f3ff',
        border: '1px solid #4a90e2',
        borderRadius: '8px',
        padding: '1rem',
        display: 'flex',
        alignItems: 'center'
      }}>
        <i className="bi bi-info-circle-fill me-2" style={{ color: '#2563eb' }}></i>
        <strong>Preparación segura y adaptada a la edad del niño</strong>
      </div>

      <div className="recipe-section mb-5" data-aos="fade-up">
        <div className="recipe-number">1</div>
        <h3 className="recipe-title">Nuez molida finamente</h3>
        <div className="recipe-content">
          <div className="recipe-image-placeholder">
            <img src="/assets/img/blog/nuez-molida.jpg" alt="Nuez molida finamente" onError={(e) => e.target.style.display = 'none'} />
          </div>
          <p className="mt-3"><strong>Regla de seguridad:</strong> Nunca ofrecer nueces enteras o en trozos grandes.</p>
          <p>Ofrecerla molida finamente o triturada hasta obtener una consistencia similar a polvo o harina fina.</p>
        </div>
      </div>

      <div className="recipe-section mb-5" data-aos="fade-up" data-aos-delay="100">
        <div className="recipe-number">2</div>
        <h3 className="recipe-title">Mezclada en purés</h3>
        <div className="recipe-content">
          <div className="recipe-image-placeholder">
            <img src="/assets/img/blog/nuez-pure.jpg" alt="Puré con nuez molida" onError={(e) => e.target.style.display = 'none'} />
          </div>
          <ul className="mt-3">
            <li>Mezclarla en purés de frutas (plátano, manzana, pera)</li>
            <li>Incorporarla en purés de verduras suaves</li>
            <li>Añadirla a preparaciones blandas y cremosas</li>
          </ul>
        </div>
      </div>

      <div className="recipe-section mb-5" data-aos="fade-up" data-aos-delay="200">
        <div className="recipe-number">3</div>
        <h3 className="recipe-title">Pasta de nuez natural</h3>
        <div className="recipe-content">
          <div className="recipe-image-placeholder">
            <img src="/assets/img/blog/nuez-pasta.jpg" alt="Pasta de nuez natural" onError={(e) => e.target.style.display = 'none'} />
          </div>
          <p className="mt-3"><strong>Preparaciones con pasta de nuez:</strong></p>
          <ul>
            <li>Untada en pan o galletas de manera muy fina</li>
            <li>Mezclada en batidos o smoothies</li>
            <li>Como base para salsas suaves</li>
          </ul>
          <p className="text-muted">(Solo pasta natural, sin azúcar, sal ni aceites añadidos)</p>
        </div>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Tabla nutricional de la nuez</h2>
      <p className="text-muted mb-4">Por cada 100 gramos</p>

      <div className="table-responsive mb-5" data-aos="fade-up">
        <table className="table table-hover table-bordered">
          <thead className="table-header">
            <tr>
              <th>Nutriente</th>
              <th>Cantidad</th>
              <th>Beneficio</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Energía</strong></td>
              <td>654 kcal</td>
              <td>Alta densidad energética</td>
            </tr>
            <tr>
              <td><strong>Grasas totales</strong></td>
              <td>65 g</td>
              <td>Desarrollo cerebral</td>
            </tr>
            <tr>
              <td><strong>Omega 3</strong></td>
              <td>9 g</td>
              <td>Sistema nervioso</td>
            </tr>
            <tr>
              <td><strong>Proteína</strong></td>
              <td>15 g</td>
              <td>Crecimiento celular</td>
            </tr>
            <tr>
              <td><strong>Carbohidratos</strong></td>
              <td>14 g</td>
              <td>Energía</td>
            </tr>
            <tr>
              <td><strong>Fibra</strong></td>
              <td>6.7 g</td>
              <td>Digestión saludable</td>
            </tr>
            <tr>
              <td><strong>Vitamina E</strong></td>
              <td>0.7 mg</td>
              <td>Antioxidante</td>
            </tr>
            <tr>
              <td><strong>Magnesio</strong></td>
              <td>158 mg</td>
              <td>Función neuromuscular</td>
            </tr>
            <tr>
              <td><strong>Fósforo</strong></td>
              <td>346 mg</td>
              <td>Salud ósea</td>
            </tr>
            <tr>
              <td><strong>Zinc</strong></td>
              <td>3.1 mg</td>
              <td>Sistema inmune</td>
            </tr>
          </tbody>
        </table>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Recomendaciones para las familias</h2>

      <ul className="feature-list mb-5">
        <li><i className="bi bi-check-circle-fill"></i> <strong>Introducción gradual:</strong> Introducir la nuez de forma gradual y en pequeñas cantidades, observando tolerancia.</li>
        <li><i className="bi bi-check-circle-fill"></i> <strong>Observar reacciones:</strong> Observar posibles reacciones digestivas o sensoriales después del consumo.</li>
        <li><i className="bi bi-check-circle-fill"></i> <strong>Supervisión constante:</strong> Supervisar siempre el consumo, incluso cuando está molida finamente.</li>
        <li><i className="bi bi-check-circle-fill"></i> <strong>Nueces naturales:</strong> Preferir nueces naturales sin sal, azúcar ni tostado excesivo.</li>
        <li><i className="bi bi-check-circle-fill"></i> <strong>Un alimento a la vez:</strong> No combinarla con muchos alimentos nuevos al mismo tiempo.</li>
        <li><i className="bi bi-check-circle-fill"></i> <strong>Almacenamiento adecuado:</strong> Guardar en recipiente hermético en lugar fresco y seco.</li>
      </ul>

      <hr className="my-5" />

      <h2 className="section-title">Nota importante sobre alergias</h2>

      <div className="warning-box mb-5" data-aos="fade-up">
        <i className="bi bi-exclamation-triangle-fill"></i>
        <div>
          <h4 className="mb-3" style={{ color: '#2d465e', fontWeight: '700' }}>Los frutos secos pueden provocar reacciones alérgicas</h4>
          <p className="mb-2"><strong>Al introducir la nuez por primera vez, es fundamental seguir estas precauciones:</strong></p>
          <ul className="mb-3" style={{ paddingLeft: '1.5rem' }}>
            <li style={{ marginBottom: '0.5rem' }}><strong>Cantidad mínima:</strong> Hacerlo en cantidades muy pequeñas al inicio.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Momento del día:</strong> Ofrecer durante el día para poder observar reacciones.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Síntomas de alerta:</strong> Estar atento a: sarpullido, hinchazón, dificultad respiratoria o malestar digestivo.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Consulta profesional:</strong> Si existen antecedentes de alergias, consultar con un profesional de salud.</li>
          </ul>
          <div style={{
            background: '#e7f3ff',
            border: '1px solid #4a90e2',
            borderRadius: '8px',
            padding: '1rem',
            marginTop: '1rem'
          }}>
            <i className="bi bi-info-circle-fill me-2" style={{ color: '#2563eb' }}></i>
            <strong>Si observas cualquier síntoma de reacción alérgica, suspende el consumo inmediatamente y busca atención médica.</strong>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      {/* Créditos */}
      <div className="mb-5" data-aos="fade-up" style={{
        background: 'linear-gradient(135deg, #f5f0ff 0%, #fff5f5 100%)',
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
              Curso en Nutrición y Alimentación Infantil – Científica del Sur
            </p>
            <a href="https://www.crecemos.com.pe" target="_blank" rel="noopener noreferrer" style={{
              color: '#c263f9',
              textDecoration: 'none',
              fontSize: '0.95rem',
              fontWeight: '600',
              transition: 'color 0.3s ease'
            }}>
              <i className="bi bi-globe me-2"></i>
              www.crecemos.com.pe
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
