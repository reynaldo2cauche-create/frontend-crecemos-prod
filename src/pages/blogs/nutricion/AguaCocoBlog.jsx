import React from 'react';

export default function AguaCocoBlog() {
  return (
    <>
      <div className="lead mb-5" style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#555' }}>
        El agua de coco es una bebida natural obtenida del interior del coco verde. Destaca por su alto
        contenido de agua, minerales y electrolitos naturales, lo que la convierte en una opción
        hidratante cuando se ofrece de manera adecuada. Puede incorporarse en la alimentación de los
        niños a partir del primer año, siempre en pequeñas cantidades y como complemento, no como
        reemplazo del agua.
      </div>

      <hr className="my-5" />

      <h2 className="section-title">¿Por qué el agua de coco puede ser beneficiosa para niños pequeños?</h2>

      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-droplet-fill"></i>
            </div>
            <h3>Favorece la hidratación</h3>
            <p>Por su alto contenido de agua natural.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-lightning-fill"></i>
            </div>
            <h3>Aporta electrolitos naturales</h3>
            <p>Como potasio y sodio, importantes para la función celular.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-emoji-smile-fill"></i>
            </div>
            <h3>Sabor suave y naturalmente dulce</h3>
            <p>Sin azúcares añadidos, agradable para los niños.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-thermometer-sun"></i>
            </div>
            <h3>Recuperación de líquidos</h3>
            <p>Contribuye a la hidratación en climas calurosos.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="500">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-speedometer2"></i>
            </div>
            <h3>Baja en calorías</h3>
            <p>En comparación con bebidas procesadas y azucaradas.</p>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Cómo ofrecer agua de coco a niños desde 1 año</h2>

      <div className="tips-box mb-5" data-aos="fade-up">
        <i className="bi bi-lightbulb-fill"></i>
        <ul>
          <li>Ofrecer agua de coco natural, sin azúcar ni aditivos.</li>
          <li>Servir a temperatura ambiente.</li>
          <li>Dar pequeñas cantidades y no de forma diaria.</li>
          <li>No reemplazar el consumo habitual de agua.</li>
          <li>Introducir de forma gradual para observar tolerancia.</li>
        </ul>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Agua de coco en la alimentación diaria</h2>

      <div className="row gy-4 mb-5">
        <div className="col-md-3" data-aos="flip-up" data-aos-delay="100">
          <div className="idea-card">
            <i className="bi bi-sun-fill"></i>
            <h3>En días calurosos</h3>
            <p>Como bebida refrescante natural.</p>
          </div>
        </div>

        <div className="col-md-3" data-aos="flip-up" data-aos-delay="200">
          <div className="idea-card">
            <i className="bi bi-cup-straw"></i>
            <h3>Bebida ocasional</h3>
            <p>De hidratación complementaria.</p>
          </div>
        </div>

        <div className="col-md-3" data-aos="flip-up" data-aos-delay="300">
          <div className="idea-card">
            <i className="bi bi-activity"></i>
            <h3>Después de actividad física</h3>
            <p>Para recuperar líquidos.</p>
          </div>
        </div>

        <div className="col-md-3" data-aos="flip-up" data-aos-delay="400">
          <div className="idea-card">
            <i className="bi bi-backpack-fill"></i>
            <h3>En la lonchera</h3>
            <p>En pequeñas cantidades.</p>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Recomendaciones para las familias</h2>

      <div className="alert-info mb-4">
        <i className="bi bi-info-circle-fill me-2"></i>
        Priorizar siempre el consumo de agua como bebida principal
      </div>

      <div className="tips-box mb-5" data-aos="fade-up">
        <i className="bi bi-check-circle-fill"></i>
        <ul>
          <li>Evitar el consumo excesivo por su contenido de minerales.</li>
          <li>No ofrecer en casos de diarrea sin indicación médica.</li>
          <li>Evitar presentaciones comerciales con azúcar añadida.</li>
          <li>Observar la respuesta digestiva del niño.</li>
        </ul>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Nota importante</h2>

      <div className="warning-box mb-5" data-aos="fade-up">
        <i className="bi bi-exclamation-triangle-fill"></i>
        <div>
          <p className="mb-2">
            <strong>El agua de coco no sustituye al agua ni a las soluciones de rehidratación oral cuando
            estas son necesarias.</strong>
          </p>
          <p className="mb-0">
            En niños con enfermedades renales, diarrea persistente o restricciones médicas, consultar con
            un profesional de salud.
          </p>
        </div>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Tabla nutricional del agua de coco (por 100 ml)</h2>

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
              <td>19 kcal</td>
              <td>Hidratación ligera</td>
            </tr>
            <tr>
              <td><strong>Agua</strong></td>
              <td>95 g</td>
              <td>Hidratación</td>
            </tr>
            <tr>
              <td><strong>Carbohidratos</strong></td>
              <td>3.7 g</td>
              <td>Energía suave</td>
            </tr>
            <tr>
              <td><strong>Azúcares naturales</strong></td>
              <td>2.6 g</td>
              <td>Sabor natural</td>
            </tr>
            <tr>
              <td><strong>Proteína</strong></td>
              <td>0.7 g</td>
              <td>Aporte mínimo</td>
            </tr>
            <tr>
              <td><strong>Grasas</strong></td>
              <td>0.2 g</td>
              <td>Muy bajo en grasa</td>
            </tr>
            <tr>
              <td><strong>Potasio</strong></td>
              <td>250 mg</td>
              <td>Función nerviosa</td>
            </tr>
            <tr>
              <td><strong>Sodio</strong></td>
              <td>105 mg</td>
              <td>Equilibrio electrolítico</td>
            </tr>
            <tr>
              <td><strong>Magnesio</strong></td>
              <td>25 mg</td>
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