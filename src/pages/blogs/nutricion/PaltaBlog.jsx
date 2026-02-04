// nutricion/PaltaBlog.jsx
import React from 'react';

export default function PaltaBlog() {
  return (
    <>
      <div className="lead mb-5" style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#555' }}>
        La palta es uno de los alimentos más completos y versátiles para la alimentación infantil. Gracias a su textura naturalmente cremosa, sabor suave y alto contenido de grasas saludables, puede incorporarse con seguridad en la dieta de los niños desde el primer año de vida. En niños neurodivergentes, suele ser muy bien aceptada por su consistencia y sabor.
      </div>

      <hr className="my-5" />

      <h2 className="section-title">¿Por qué la palta es una excelente opción para niños pequeños?</h2>

      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-brain"></i>
            </div>
            <h3>Grasas saludables</h3>
            <p>Apoyan el desarrollo cerebral y cognitivo.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-lightning-fill"></i>
            </div>
            <h3>Omega 3 y Omega 9</h3>
            <p>Beneficiosos para el sistema nervioso.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-battery-charging"></i>
            </div>
            <h3>Vitaminas del complejo B</h3>
            <p>Importantes para la energía y concentración.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-shield-check"></i>
            </div>
            <h3>Vitamina E</h3>
            <p>Con efecto antioxidante protector.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="500">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-heart-pulse-fill"></i>
            </div>
            <h3>Fibra suave</h3>
            <p>Contribuye a una digestión saludable.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="600">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-check-circle-fill"></i>
            </div>
            <h3>Saciedad y regulación</h3>
            <p>Ayuda a regular el apetito de manera natural.</p>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Cómo ofrecer palta a niños desde 1 año</h2>

      <div className="alert mb-5" style={{
        background: '#e7f3ff',
        border: '1px solid #4a90e2',
        borderRadius: '8px',
        padding: '1rem',
        display: 'flex',
        alignItems: 'center'
      }}>
        <i className="bi bi-info-circle-fill me-2" style={{ color: '#2563eb' }}></i>
        <strong>Adaptada según el desarrollo y preferencias del niño</strong>
      </div>

      <div className="recipe-section mb-5" data-aos="fade-up">
        <div className="recipe-number">1</div>
        <h3 className="recipe-title">Puré de palta</h3>
        <div className="recipe-content">
          <div className="recipe-image-placeholder">
            <img src="/assets/img/blog/palta-pure.webp" alt="Puré de palta suave" onError={(e) => e.target.style.display = 'none'} />
          </div>
          <p className="mt-3">Aplastar la palta hasta obtener un puré suave y cremoso. Esta es la forma más segura y fácil de digerir para niños pequeños.</p>
        </div>
      </div>

      <div className="recipe-section mb-5" data-aos="fade-up" data-aos-delay="100">
        <div className="recipe-number">2</div>
        <h3 className="recipe-title">Trocitos blandos</h3>
        <div className="recipe-content">
          <div className="recipe-image-placeholder">
            <img src="/assets/img/blog/palta-trozos.webp" alt="Palta en trocitos blandos" onError={(e) => e.target.style.display = 'none'} />
          </div>
          <p className="mt-3">Ofrecerla en trocitos blandos cuando el niño ya mastica mejor. Cortar en cubos pequeños y suaves.</p>
        </div>
      </div>

      <div className="recipe-section mb-5" data-aos="fade-up" data-aos-delay="200">
        <div className="recipe-number">3</div>
        <h3 className="recipe-title">Mezclada con otros alimentos</h3>
        <div className="recipe-content">
          <div className="recipe-image-placeholder">
            <img src="/assets/img/blog/palta-mezclada.webp" alt="Palta mezclada con otros alimentos" onError={(e) => e.target.style.display = 'none'} />
          </div>
          <p className="mt-3">Mezclarla con otros alimentos suaves si el niño lo tolera: arroz, quinua, verduras cocidas, plátano.</p>
        </div>
      </div>

      <div className="recipe-section mb-5" data-aos="fade-up" data-aos-delay="300">
        <div className="recipe-number">4</div>
        <h3 className="recipe-title">Palta sola</h3>
        <div className="recipe-content">
          <div className="recipe-image-placeholder">
            <img src="/assets/img/blog/palta-sola.webp" alt="Palta servida sola" onError={(e) => e.target.style.display = 'none'} />
          </div>
          <p className="mt-3">Servirla sola en casos de alta selectividad alimentaria. La palta es uno de los alimentos mejor tolerados.</p>
        </div>
      </div>

      <div className="alert mb-5" style={{
        background: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: '8px',
        padding: '1rem',
        display: 'flex',
        alignItems: 'start'
      }}>
        <i className="bi bi-thermometer-half me-2" style={{ color: '#856404', marginTop: '0.25rem' }}></i>
        <div>
          <strong>Temperatura:</strong> Mantener la palta a temperatura ambiente para mejor tolerancia sensorial.
        </div>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Palta en la alimentación diaria</h2>

      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-sunrise-fill"></i>
            </div>
            <h3>Desayuno o media mañana</h3>
            <p>Ideal para comenzar el día con energía saludable.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-sun-fill"></i>
            </div>
            <h3>Almuerzo</h3>
            <p>Como acompañamiento nutritivo del plato principal.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-backpack-fill"></i>
            </div>
            <h3>Lonchera</h3>
            <p>Bien aplastada o en trocitos suaves, en recipiente hermético.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-plus-circle-fill"></i>
            </div>
            <h3>Complemento</h3>
            <p>Con verduras o cereales blandos para mayor variedad.</p>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Tabla nutricional de la palta</h2>
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
              <td>160 kcal</td>
              <td>Energía saludable</td>
            </tr>
            <tr>
              <td><strong>Grasas totales</strong></td>
              <td>15 g</td>
              <td>Desarrollo cerebral</td>
            </tr>
            <tr>
              <td><strong>Omega 3</strong></td>
              <td>0.11 g</td>
              <td>Sistema nervioso</td>
            </tr>
            <tr>
              <td><strong>Omega 9</strong></td>
              <td>9.8 g</td>
              <td>Salud neurológica</td>
            </tr>
            <tr>
              <td><strong>Carbohidratos</strong></td>
              <td>8.5 g</td>
              <td>Energía</td>
            </tr>
            <tr>
              <td><strong>Fibra</strong></td>
              <td>6.7 g</td>
              <td>Digestión saludable</td>
            </tr>
            <tr>
              <td><strong>Proteína</strong></td>
              <td>2 g</td>
              <td>Crecimiento celular</td>
            </tr>
            <tr>
              <td><strong>Vitamina E</strong></td>
              <td>2.1 mg</td>
              <td>Antioxidante</td>
            </tr>
            <tr>
              <td><strong>Ácido fólico (B9)</strong></td>
              <td>81 mcg</td>
              <td>Desarrollo cerebral</td>
            </tr>
            <tr>
              <td><strong>Potasio</strong></td>
              <td>485 mg</td>
              <td>Función nerviosa</td>
            </tr>
          </tbody>
        </table>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Recomendaciones para las familias</h2>

      <ul className="feature-list mb-5">
        <li><i className="bi bi-check-circle-fill"></i> <strong>Introducción progresiva:</strong> Introducir la palta de manera gradual, observando tolerancia.</li>
        <li><i className="bi bi-check-circle-fill"></i> <strong>Porciones pequeñas:</strong> Ofrecer porciones pequeñas al inicio y aumentar según aceptación.</li>
        <li><i className="bi bi-check-circle-fill"></i> <strong>Observar tolerancia:</strong> Observar la tolerancia digestiva, especialmente las primeras veces.</li>
        <li><i className="bi bi-check-circle-fill"></i> <strong>Evitar ultraprocesados:</strong> Evitar combinarla con alimentos ultraprocesados o muy condimentados.</li>
        <li><i className="bi bi-check-circle-fill"></i> <strong>Respetar preferencias:</strong> Respetar el ritmo y preferencias sensoriales del niño.</li>
        <li><i className="bi bi-check-circle-fill"></i> <strong>Palta fresca:</strong> Elegir paltas maduras pero firmes, sin partes oscuras o muy blandas.</li>
      </ul>

      <hr className="my-5" />

      <h2 className="section-title">Nota importante</h2>

      <div className="alert mb-5" style={{
        background: '#e7f3ff',
        border: '1px solid #4a90e2',
        borderRadius: '8px',
        padding: '1rem',
        display: 'flex',
        alignItems: 'start'
      }}>
        <i className="bi bi-info-circle-fill me-2" style={{ color: '#2563eb', marginTop: '0.25rem' }}></i>
        <div>
          <p className="mb-2"><strong>Cada niño es diferente.</strong> Al introducir la palta por primera vez, hacerlo en pequeñas cantidades y observar la respuesta digestiva y sensorial.</p>
          <p className="mb-0">Ante cualquier duda o antecedente de alergias, consultar con un profesional de salud.</p>
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
              Curso en Nutrición y Alimentación Infantil – Universidad Científica del Sur
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