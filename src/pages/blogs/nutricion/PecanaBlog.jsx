// nutricion/PecanaBlog.jsx
import React from 'react';

export default function PecanaBlog() {
  return (
    <>
      <div className="lead mb-5" style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#555' }}>
        La pecana es un fruto seco rico en grasas saludables, vitaminas y minerales que puede aportar importantes beneficios a la alimentación infantil. Sin embargo, por su textura dura, su introducción debe hacerse con precaución, especialmente en niños pequeños y en niños neurodivergentes con dificultades de masticación o sensibilidad oral.
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
          <strong>Importante:</strong> Nunca ofrecer pecanas enteras o en trozos grandes a niños menores de 5 años. Siempre deben estar molidas, trituradas o en forma de pasta natural.
        </div>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">¿Por qué la pecana puede ser beneficiosa en la alimentación infantil?</h2>

      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i class="bi bi-egg-fried"></i>
            </div>
            <h3>Grasas saludables</h3>
            <p>Importantes para el desarrollo cerebral.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-lightning-fill"></i>
            </div>
            <h3>Omega 3 y Omega 9</h3>
            <p>Apoyan el sistema nervioso y desarrollo cognitivo.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-shield-check"></i>
            </div>
            <h3>Vitamina E</h3>
            <p>Con efecto antioxidante protector.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-capsule"></i>
            </div>
            <h3>Minerales esenciales</h3>
            <p>Magnesio y zinc para función neuromuscular e inmune.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="500">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-battery-charging"></i>
            </div>
            <h3>Energía sostenida</h3>
            <p>Brinda energía duradera y sensación de saciedad.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="600">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-graph-up-arrow"></i>
            </div>
            <h3>Alta densidad nutricional</h3>
            <p>Gran aporte de nutrientes en pequeñas porciones.</p>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Cómo ofrecer pecana de forma segura a niños desde 1 año</h2>

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
        <h3 className="recipe-title">Pecana molida finamente</h3>
        <div className="recipe-content">
          <div className="recipe-image-placeholder">
            <img src="/assets/img/blog/pecana-molida.webp" alt="Pecana molida finamente" onError={(e) => e.target.style.display = 'none'} />
          </div>
          <p className="mt-3"><strong>Regla de seguridad:</strong> Nunca ofrecer pecanas enteras o en trozos grandes.</p>
          <p>Ofrecerla molida finamente o triturada hasta obtener una consistencia similar a polvo o harina fina. Esta es la forma más segura para niños pequeños.</p>
        </div>
      </div>

      <div className="recipe-section mb-5" data-aos="fade-up" data-aos-delay="100">
        <div className="recipe-number">2</div>
        <h3 className="recipe-title">Mezclada en purés</h3>
        <div className="recipe-content">
          <div className="recipe-image-placeholder">
            <img src="/assets/img/blog/pecana-pure.webp" alt="Pecana en purés" onError={(e) => e.target.style.display = 'none'} />
          </div>
          <ul className="mt-3">
            <li>Mezclarla en purés de frutas (plátano, manzana, pera)</li>
            <li>Incorporarla en purés de verduras suaves</li>
            <li>Añadirla a preparaciones blandas como avena o quinua</li>
          </ul>
        </div>
      </div>

      <div className="recipe-section mb-5" data-aos="fade-up" data-aos-delay="200">
        <div className="recipe-number">3</div>
        <h3 className="recipe-title">Pasta de pecana natural</h3>
        <div className="recipe-content">
          <div className="recipe-image-placeholder">
            <img src="/assets/img/blog/pecana-pasta.webp" alt="Pasta de pecana natural" onError={(e) => e.target.style.display = 'none'} />
          </div>
          <p className="mt-3"><strong>Preparaciones con pasta de pecana:</strong></p>
          <ul>
            <li>Untada muy finamente en pan o galletas suaves</li>
            <li>Mezclada en batidos o smoothies</li>
            <li>Como base para cremas o salsas suaves</li>
          </ul>
          <p className="text-muted">(Solo pasta natural, sin azúcar, sal ni aceites añadidos)</p>
        </div>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Pecana en la alimentación diaria</h2>

      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-cup-hot-fill"></i>
            </div>
            <h3>En purés</h3>
            <p>Mezclada en purés de frutas o verduras suaves.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-egg-fried"></i>
            </div>
            <h3>Preparaciones blandas</h3>
            <p>Añadida a preparaciones suaves como avena o papillas.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-droplet-fill"></i>
            </div>
            <h3>Cremas naturales</h3>
            <p>Como parte de cremas o pastas naturales sin aditivos.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-backpack-fill"></i>
            </div>
            <h3>En la lonchera</h3>
            <p>Siempre bien molida y en pequeñas cantidades seguras.</p>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Tabla nutricional de la pecana</h2>
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
              <td>691 kcal</td>
              <td>Alta densidad energética</td>
            </tr>
            <tr>
              <td><strong>Grasas totales</strong></td>
              <td>72 g</td>
              <td>Desarrollo cerebral</td>
            </tr>
            <tr>
              <td><strong>Omega 3</strong></td>
              <td>1 g</td>
              <td>Sistema nervioso</td>
            </tr>
            <tr>
              <td><strong>Omega 9</strong></td>
              <td>40 g</td>
              <td>Salud cardiovascular</td>
            </tr>
            <tr>
              <td><strong>Proteína</strong></td>
              <td>9 g</td>
              <td>Crecimiento celular</td>
            </tr>
            <tr>
              <td><strong>Carbohidratos</strong></td>
              <td>14 g</td>
              <td>Energía</td>
            </tr>
            <tr>
              <td><strong>Fibra</strong></td>
              <td>10 g</td>
              <td>Digestión saludable</td>
            </tr>
            <tr>
              <td><strong>Vitamina E</strong></td>
              <td>1.4 mg</td>
              <td>Antioxidante</td>
            </tr>
            <tr>
              <td><strong>Magnesio</strong></td>
              <td>121 mg</td>
              <td>Función neuromuscular</td>
            </tr>
            <tr>
              <td><strong>Zinc</strong></td>
              <td>4.5 mg</td>
              <td>Sistema inmune</td>
            </tr>
          </tbody>
        </table>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Recomendaciones para las familias</h2>

      <ul className="feature-list mb-5">
        <li><i className="bi bi-check-circle-fill"></i> <strong>Introducción gradual:</strong> Introducir la pecana de manera progresiva y en pequeñas cantidades.</li>
        <li><i className="bi bi-check-circle-fill"></i> <strong>Cantidades mínimas:</strong> Ofrecer cantidades muy pequeñas al inicio, observando tolerancia.</li>
        <li><i className="bi bi-check-circle-fill"></i> <strong>Observar reacciones:</strong> Observar la tolerancia digestiva y sensorial después del consumo.</li>
        <li><i className="bi bi-check-circle-fill"></i> <strong>Un alimento a la vez:</strong> Evitar combinarla con muchos alimentos nuevos el mismo día.</li>
        <li><i className="bi bi-check-circle-fill"></i> <strong>Supervisión constante:</strong> Supervisar siempre el momento de consumo, incluso molida.</li>
        <li><i className="bi bi-check-circle-fill"></i> <strong>Pecanas naturales:</strong> Preferir pecanas naturales sin sal, azúcar ni tostado excesivo.</li>
      </ul>

      <hr className="my-5" />

      <h2 className="section-title">Nota importante sobre alergias</h2>

      <div className="warning-box mb-5" data-aos="fade-up">
        <i className="bi bi-exclamation-triangle-fill"></i>
        <div>
          <h4 className="mb-3" style={{ color: '#2d465e', fontWeight: '700' }}>Los frutos secos pueden provocar reacciones alérgicas</h4>
          <p className="mb-2"><strong>Al introducir la pecana por primera vez, es fundamental seguir estas precauciones:</strong></p>
          <ul className="mb-3" style={{ paddingLeft: '1.5rem' }}>
            <li style={{ marginBottom: '0.5rem' }}><strong>Cantidad mínima:</strong> Hacerlo en cantidades muy pequeñas al inicio.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Momento del día:</strong> Ofrecer durante el día para poder observar reacciones.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Síntomas de alerta:</strong> Estar atento a: sarpullido, hinchazón, dificultad respiratoria o malestar digestivo.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Consulta profesional:</strong> Si existen antecedentes familiares de alergias, consultar con un alergólogo.</li>
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