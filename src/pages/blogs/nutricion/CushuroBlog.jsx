import React from 'react';
import Reveal from '../../../components/public/Reveal';
import RevealText from '../../../components/public/RevealText';
import Decor from '../../../components/public/Decor';

export default function CushuroBlog() {

  const beneficios = [
    { icon: 'bi-droplet-fill', title: 'Textura suave y fácil de aceptar', text: 'Ideal para niños con rechazo a alimentos crocantes o muy duros.' },
    { icon: 'bi-egg-fill', title: 'Rico en proteínas naturales', text: 'Apoya el crecimiento, la energía y el desarrollo físico.' },
    { icon: 'bi-lightning-fill', title: 'Fuente natural de Omega 3', text: 'Favorece la atención, regulación emocional y funciones cognitivas.' },
    { icon: 'bi-heart-pulse-fill', title: 'Hierro de buena absorción', text: 'Ayuda a prevenir anemia y mejora la vitalidad diaria.' },
    { icon: 'bi-water', title: 'Muy hidratante', text: 'Perfecto para niños que suelen comer poca cantidad o rechazan alimentos secos.' },
  ];

  const recetas = [
    {
      numero: 1,
      titulo: 'Ensalada de verduras frescas',
      img: '/assets/img/blog/blog.webp',
      alt: 'Ensalada con cushuro',
      body: (
        <>
          <p className="mt-3"><strong>Ingredientes:</strong> Cushuro entero + tomate + pepino + unas gotas de limón.</p>
          <p>Una opción refrescante y fácil de adaptar a la tolerancia sensorial del niño.</p>
        </>
      ),
    },
    {
      numero: 2,
      titulo: 'Ensalada de frutas',
      img: '/assets/img/blog/2.ensaladadefruta.webp',
      alt: 'Cushuro con frutas',
      body: (
        <>
          <p className="mt-3"><strong>Combinación suave:</strong> Papaya, manzana, plátano o fresas.</p>
          <p>El cushuro entero se mezcla de forma natural gracias a su textura gelatinosa.</p>
        </>
      ),
    },
    {
      numero: 3,
      titulo: 'Desayuno fresco tipo bowl',
      img: '/assets/img/blog/3.desayunobowl.webp',
      alt: 'Bowl con cushuro',
      hideImgOnError: true,
      body: (
        <>
          <ul className="mt-3">
            <li>Frutas frescas picadas</li>
            <li>Cushuro sin procesar</li>
            <li>Opcional: un poquito de yogur natural si el niño lo tolera</li>
          </ul>
          <p className="text-muted">(Sin harinas, sin pan, sin procesados)</p>
        </>
      ),
    },
    {
      numero: 4,
      titulo: 'Para llevar al colegio o estimulación temprana',
      img: '/assets/img/blog/4.parallevarcolegio.webp',
      alt: 'Lonchera con cushuro',
      body: (
        <>
          <p className="mt-3"><strong>Preparaciones fáciles de transportar:</strong></p>
          <ul>
            <li>Ensaladita fría de cushuro con verduras suaves</li>
            <li>Fruta picada + cushuro</li>
            <li>Cushuro con palta suave en un envase pequeño</li>
          </ul>
        </>
      ),
    },
    {
      numero: 5,
      titulo: 'Añadir cushuro entero a platos fríos',
      body: (
        <>
          <p><strong>Ideal en:</strong></p>
          <ul>
            <li>Palta rellena</li>
            <li>Verduras frías</li>
            <li>Platos servidos a temperatura ambiente</li>
          </ul>
        </>
      ),
    },
  ];

  const loncheraIdeas = [
    { icon: 'bi-apple', title: 'Fruta fresca con cushuro', text: 'Una mezcla muy fácil de aceptar.' },
    { icon: 'bi-cup-straw', title: 'Mini bowl frío', text: 'Palta + cushuro + gotas de limón.' },
    { icon: 'bi-hand-index', title: 'Verduras suaves para dedos', text: 'Pepino, tomate cherry, cushuro entero.' },
  ];

  return (
    <>
      <Reveal y={18}>
        <div className="lead mb-5" style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#555' }}>
          El cushuro, también conocido como llullucha, es una alga andina que crece en lagunas de altura.
          Su textura suave, fresca y gelatinosa lo convierte en un alimento muy interesante para niños
          neurodivergentes, especialmente aquellos con:
        </div>
      </Reveal>

      <Reveal y={18} delay={0.05}>
        <ul className="feature-list mb-5">
          <li><i className="bi bi-check-circle-fill"></i> Sensibilidad a texturas</li>
          <li><i className="bi bi-check-circle-fill"></i> Selectividad alimentaria</li>
          <li><i className="bi bi-check-circle-fill"></i> Baja tolerancia a alimentos duros o muy fibrosos</li>
          <li><i className="bi bi-check-circle-fill"></i> Necesidad de alimentos frescos y fáciles de masticar</li>
        </ul>
      </Reveal>

      <Reveal y={18} delay={0.1}>
        <p>Además, su perfil nutricional lo hace un excelente complemento natural en la alimentación desde el año de edad en adelante, siempre con introducción gradual.</p>
      </Reveal>

      <hr className="my-5" />

      <Reveal y={18}>
        <h2 className="section-title">¿Por qué el cushuro es tan beneficioso para niños neurodivergentes?</h2>
      </Reveal>

      <div className="row gy-4 mb-5">
        {beneficios.map((b, idx) => (
          <Reveal as="div" className="col-md-6" key={b.title} y={22} delay={idx * 0.1}>
            <div className="benefit-card">
              <div className="benefit-icon">
                <i className={`bi ${b.icon}`}></i>
              </div>
              <h3>{b.title}</h3>
              <p>{b.text}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <hr className="my-5" />

      <Reveal y={18}>
        <h2 className="section-title">¿Cómo consumir cushuro en casa?</h2>
      </Reveal>

      <Reveal y={16} delay={0.05}>
        <div className="alert-info mb-5">
          <i className="bi bi-info-circle-fill me-2"></i>
          Solo preparaciones frescas, naturales, sin cocción y sin alimentos procesados
        </div>
      </Reveal>

      <Reveal y={16} delay={0.08}>
        <p className="mb-5">Después de lavarlo bien, puedes incorporarlo de formas suaves y agradables:</p>
      </Reveal>

      {recetas.map((r, idx) => (
        <Reveal key={r.numero} className="recipe-section mb-5" y={22} delay={(idx % 3) * 0.08}>
          <div className="recipe-number">{r.numero}</div>
          <h3 className="recipe-title">{r.titulo}</h3>
          <div className="recipe-content">
            {r.img && (
              <div className="recipe-image-placeholder">
                <img
                  src={r.img}
                  alt={r.alt}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (r.hideImgOnError) e.target.parentElement.style.display = 'none';
                  }}
                />
              </div>
            )}
            {r.body}
          </div>
        </Reveal>
      ))}

      <hr className="my-5" />

      <Reveal y={18}>
        <h2 className="section-title">Ideas sencillas para incluirlo en la lonchera</h2>
      </Reveal>

      <div className="row gy-4 mb-5">
        {loncheraIdeas.map((idea, idx) => (
          <Reveal as="div" className="col-md-4" key={idea.title} y={22} delay={idx * 0.1}>
            <div className="idea-card">
              <i className={`bi ${idea.icon}`}></i>
              <h3>{idea.title}</h3>
              <p>{idea.text}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <hr className="my-5" />

      <Reveal y={18}>
        <h2 className="section-title">Tips importantes para familias</h2>
      </Reveal>

      <Reveal y={18} delay={0.05}>
        <div className="tips-box mb-5">
          <i className="bi bi-lightbulb-fill"></i>
          <ul>
            <li>Lavar con abundante agua antes de usar.</li>
            <li>Mantener siempre refrigerado.</li>
            <li>Introducir poco a poco para observar tolerancia sensorial y digestiva.</li>
            <li>Ofrecer en contextos tranquilos y sin presión.</li>
            <li>Evitar mezclarlo con alimentos procesados o harinas, para mantener su aporte natural.</li>
          </ul>
        </div>
      </Reveal>

      <hr className="my-5" />

      <Reveal y={18}>
        <h2 className="section-title">Nota importante antes de finalizar</h2>
      </Reveal>

      <Reveal y={18} delay={0.05}>
        <div className="warning-box mb-5">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <div>
            <p className="mb-2"><strong>Cuando se introduce un alimento nuevo en niños pequeños o neurodivergentes:</strong></p>
            <ul className="mb-0">
              <li>Hazlo en pequeñas cantidades.</li>
              <li>Observa la tolerancia sensorial, digestiva y conductual.</li>
              <li>Si hay antecedentes de alergias, es recomendable consultar con un alergólogo antes de ofrecerlo.</li>
            </ul>
          </div>
        </div>
      </Reveal>

      <hr className="my-5" />

      {/* Autor */}
      <Reveal y={20} className="author-credits">
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
      </Reveal>
    </>
  );
}