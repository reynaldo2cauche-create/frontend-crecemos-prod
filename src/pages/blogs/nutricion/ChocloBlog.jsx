import React from 'react';

export default function ChocloBlog() {
  return (
    <>
      <div className="lead mb-5" style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#555' }}>
        El choclo (maíz tierno) es un alimento tradicional y muy presente en la alimentación familiar. Gracias a su sabor suave, textura blanda cuando está bien cocido y buen aporte de energía, puede incorporarse de manera segura en la alimentación infantil desde el primer año de vida. Para niños neurodivergentes, el choclo puede ser una buena opción cuando se presenta de forma adecuada, respetando las necesidades sensoriales y la etapa de desarrollo.
      </div>

      <hr className="my-5" />

      <h2 className="section-title">¿Por qué el choclo es una buena opción para niños pequeños?</h2>

      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-lightning-charge-fill"></i>
            </div>
            <h3>Energía sostenida</h3>
            <p>Aporta energía sostenida gracias a sus carbohidratos naturales.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-heart-pulse-fill"></i>
            </div>
            <h3>Fibra saludable</h3>
            <p>Contiene fibra que ayuda al tránsito intestinal.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-capsule"></i>
            </div>
            <h3>Vitaminas del complejo B</h3>
            <p>Aporta vitaminas del complejo B importantes para el sistema nervioso.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-emoji-smile-fill"></i>
            </div>
            <h3>Sabor naturalmente dulce</h3>
            <p>Tiene un sabor naturalmente dulce que facilita su aceptación.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="500">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-gear-fill"></i>
            </div>
            <h3>Textura adaptable</h3>
            <p>Puede adaptarse a distintas texturas según la edad y tolerancia.</p>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Cómo ofrecer choclo a niños desde 1 año</h2>

      <div className="alert-info mb-5">
        <i className="bi bi-info-circle-fill me-2"></i>
        Preparación segura y adaptada a la edad del niño
      </div>

      <div className="recipe-section mb-5" data-aos="fade-up">
        <div className="recipe-number">1</div>
        <h3 className="recipe-title">Cocción adecuada</h3>
        <div className="recipe-content">
          <div className="recipe-image-placeholder">
            <img src="/assets/img/blog/choclo-cocido.webp" alt="Choclo bien cocido" onError={(e) => e.target.style.display = 'none'} />
          </div>
          <p className="mt-3">Cocinar el choclo hasta que esté muy suave. Es fundamental que los granos estén lo suficientemente blandos para facilitar la masticación y digestión.</p>
        </div>
      </div>

      <div className="recipe-section mb-5" data-aos="fade-up" data-aos-delay="100">
        <div className="recipe-number">2</div>
        <h3 className="recipe-title">Presentación segura</h3>
        <div className="recipe-content">
          <div className="recipe-image-placeholder">
            <img src="/assets/img/blog/choclo-desmenuzado.webp" alt="Granos de choclo desmenuzados" onError={(e) => e.target.style.display = 'none'} />
          </div>
          <p className="mt-3">Retirar los granos y ofrecerlos desmenuzados para niños pequeños. Esto reduce el riesgo de atragantamiento y facilita la aceptación.</p>
          <div className="alert" style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '8px', padding: '1rem', marginTop: '1rem' }}>
            <i className="bi bi-exclamation-triangle-fill me-2" style={{ color: '#856404' }}></i>
            <strong>Importante:</strong> Evitar ofrecer la mazorca completa hasta que el niño mastique bien.
          </div>
        </div>
      </div>

      <div className="recipe-section mb-5" data-aos="fade-up" data-aos-delay="200">
        <div className="recipe-number">3</div>
        <h3 className="recipe-title">Forma de servir</h3>
        <div className="recipe-content">
          <div className="recipe-image-placeholder">
            <img src="/assets/img/blog/choclo-plato.webp" alt="Choclo servido en plato" onError={(e) => e.target.style.display = 'none'} />
          </div>
          <ul className="mt-3">
            <li>Ofrecerlo solo o acompañado de alimentos suaves</li>
            <li>Sin condimentos fuertes</li>
            <li>Servir tibio o a temperatura ambiente</li>
            <li>En porciones pequeñas adaptadas al niño</li>
          </ul>
        </div>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Choclo en la alimentación diaria</h2>

      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="flip-up" data-aos-delay="100">
          <div className="idea-card">
            <i className="bi bi-sun-fill"></i>
            <h3>Acompañamiento en el almuerzo</h3>
            <p>Como acompañamiento suave junto a proteínas y verduras.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="flip-up" data-aos-delay="200">
          <div className="idea-card">
            <i className="bi bi-basket-fill"></i>
            <h3>Mezclado con verduras</h3>
            <p>Combinado con verduras blandas como zanahoria cocida o zapallo.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="flip-up" data-aos-delay="300">
          <div className="idea-card">
            <i className="bi bi-moisture"></i>
            <h3>Preparaciones trituradas</h3>
            <p>En preparaciones trituradas o desmenuzadas para facilitar la deglución.</p>
          </div>
        </div>

        <div className="col-md-6" data-aos="flip-up" data-aos-delay="400">
          <div className="idea-card">
            <i className="bi bi-bag-fill"></i>
            <h3>En la lonchera</h3>
            <p>En pequeñas porciones y bien cocido para el colegio o estimulación.</p>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Tabla nutricional del choclo</h2>
      <p className="text-muted mb-4">Por cada 100 gramos</p>

      <div className="table-responsive mb-5" data-aos="fade-up">
        <table className="table table-hover" style={{ borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <thead style={{ background: 'linear-gradient(135deg, #c263f9 0%, #d99ffd 100%)', color: 'white' }}>
            <tr>
              <th style={{ padding: '1rem' }}>Nutriente</th>
              <th style={{ padding: '1rem' }}>Cantidad</th>
              <th style={{ padding: '1rem' }}>Beneficio</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '1rem', fontWeight: '600' }}>Energía</td>
              <td style={{ padding: '1rem' }}>96 kcal</td>
              <td style={{ padding: '1rem' }}>Fuente de energía</td>
            </tr>
            <tr style={{ background: '#f8f9fa' }}>
              <td style={{ padding: '1rem', fontWeight: '600' }}>Carbohidratos</td>
              <td style={{ padding: '1rem' }}>21 g</td>
              <td style={{ padding: '1rem' }}>Energía sostenida</td>
            </tr>
            <tr>
              <td style={{ padding: '1rem', fontWeight: '600' }}>Proteína</td>
              <td style={{ padding: '1rem' }}>3.4 g</td>
              <td style={{ padding: '1rem' }}>Crecimiento celular</td>
            </tr>
            <tr style={{ background: '#f8f9fa' }}>
              <td style={{ padding: '1rem', fontWeight: '600' }}>Grasas</td>
              <td style={{ padding: '1rem' }}>1.5 g</td>
              <td style={{ padding: '1rem' }}>Bajo contenido graso</td>
            </tr>
            <tr>
              <td style={{ padding: '1rem', fontWeight: '600' }}>Fibra</td>
              <td style={{ padding: '1rem' }}>2.4 g</td>
              <td style={{ padding: '1rem' }}>Digestión saludable</td>
            </tr>
            <tr style={{ background: '#f8f9fa' }}>
              <td style={{ padding: '1rem', fontWeight: '600' }}>Vitamina B1 (tiamina)</td>
              <td style={{ padding: '1rem' }}>0.2 mg</td>
              <td style={{ padding: '1rem' }}>Función nerviosa</td>
            </tr>
            <tr>
              <td style={{ padding: '1rem', fontWeight: '600' }}>Vitamina B3 (niacina)</td>
              <td style={{ padding: '1rem' }}>1.7 mg</td>
              <td style={{ padding: '1rem' }}>Metabolismo energético</td>
            </tr>
            <tr style={{ background: '#f8f9fa' }}>
              <td style={{ padding: '1rem', fontWeight: '600' }}>Ácido fólico (B9)</td>
              <td style={{ padding: '1rem' }}>42 mcg</td>
              <td style={{ padding: '1rem' }}>Desarrollo cerebral</td>
            </tr>
            <tr>
              <td style={{ padding: '1rem', fontWeight: '600' }}>Potasio</td>
              <td style={{ padding: '1rem' }}>270 mg</td>
              <td style={{ padding: '1rem' }}>Sistema nervioso</td>
            </tr>
          </tbody>
        </table>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Recomendaciones para las familias</h2>

      <div className="tips-box mb-5" data-aos="fade-up">
        <i className="bi bi-lightbulb-fill"></i>
        <ul>
          <li>Introducir el choclo de manera gradual.</li>
          <li>Observar la tolerancia digestiva.</li>
          <li>No forzar su consumo.</li>
          <li>Respetar el ritmo y preferencias sensoriales del niño.</li>
          <li>Asegurarse de que esté bien cocido antes de ofrecer.</li>
          <li>Mantener refrigerado si no se consume de inmediato.</li>
        </ul>
      </div>

      <hr className="my-5" />

      <h2 className="section-title">Nota importante</h2>

      <div className="warning-box mb-5" data-aos="fade-up">
        <i className="bi bi-exclamation-triangle-fill"></i>
        <div>
          <p className="mb-2"><strong>Cada niño es diferente.</strong></p>
          <p className="mb-2">Al introducir el choclo u otro alimento nuevo:</p>
          <ul className="mb-0">
            <li>Hacerlo en pequeñas cantidades.</li>
            <li>Observar la respuesta digestiva y sensorial.</li>
            <li>Si existen antecedentes de alergias o dificultades digestivas, se recomienda consultar con un profesional de salud.</li>
            <li>Estar siempre presente durante las comidas para prevenir atragantamientos.</li>
          </ul>
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