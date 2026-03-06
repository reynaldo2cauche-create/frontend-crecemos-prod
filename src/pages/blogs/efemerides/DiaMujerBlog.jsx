import React from 'react';

export default function DiaMujerBlog() {
  return (
    <>
      {/* Introducción principal */}
      <div className="lead mb-5" style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#555' }}>
        ¿Cuántas veces se ha aplaudido la fortaleza de una mujer sin preguntar cómo se siente realmente?
        ¿Cuántas veces se ha normalizado su cansancio bajo la idea de que "mamá siempre puede con todo"?
        ¿Cuántas emociones han quedado en silencio por priorizar el bienestar de otros?
      </div>

      <p className="mb-5">
        Detrás de cada logro, de cada rol asumido y de cada responsabilidad cumplida, existe también una
        vida emocional que merece ser escuchada. Hoy se conmemora la historia, la fuerza y la lucha de
        millones de mujeres que han abierto camino a lo largo de distintas generaciones. No es solo una
        fecha simbólica. Es memoria, reconocimiento y conciencia social.
      </p>

      <hr className="my-5" />

      {/* Sección 1: ¿Qué se celebra? */}
      <h2 className="section-title" data-aos="fade-up">¿Qué se celebra el 8 de marzo?</h2>

      <p className="mb-4">
        Se celebra la resiliencia. La capacidad de transformar el dolor en crecimiento. El liderazgo,
        la creatividad y la sensibilidad que sostienen familias, comunidades y generaciones enteras.
      </p>

      {/* Imagen placeholder 1 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/dia-mujer-portada.webp"
          alt="Día Internacional de la Mujer"
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <p className="mb-5">
        Sin embargo, en un día como hoy también es necesario recordar que la salud mental de las mujeres
        importa. Hablar de bienestar emocional femenino no es exageración, es reconocer una realidad.
      </p>

      <div className="alert-info mb-5" data-aos="fade-up">
        <i className="bi bi-info-circle-fill me-2"></i>
        La Organización Mundial de la Salud señala que las mujeres presentan casi el doble de probabilidad
        de desarrollar depresión y trastornos de ansiedad en comparación con los hombres.
      </div>

      <hr className="my-5" />

      {/* Sección 2: La realidad que enfrentan las mujeres */}
      <h2 className="section-title" data-aos="fade-up">La realidad que enfrentan las mujeres</h2>

      <p className="mb-4">
        No se trata únicamente de biología. Se trata de contexto. Se trata de expectativas sociales,
        desigualdad estructural y silencios aprendidos.
      </p>

      {/* Imagen placeholder 2 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/dia-mujer-realidad.webp"
          alt="Realidad de la salud mental femenina"
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <div className="row gy-4 mb-5">
        <div className="col-md-4" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-exclamation-triangle"></i>
            </div>
            <h3>Violencia de género</h3>
            <p>
              En América Latina, la violencia de género continúa siendo una problemática relevante,
              con consecuencias psicológicas que pueden mantenerse durante años.
            </p>
          </div>
        </div>

        <div className="col-md-4" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-briefcase"></i>
            </div>
            <h3>Doble jornada</h3>
            <p>
              La carga del trabajo no remunerado y de cuidado recae mayoritariamente en ellas,
              generando altos niveles de agotamiento y sobrecarga emocional.
            </p>
          </div>
        </div>

        <div className="col-md-4" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-heart-half"></i>
            </div>
            <h3>Roles de género</h3>
            <p>
              Muchas mujeres han sido socializadas para priorizar el cuidado de otros por encima de
              sus propias necesidades, dificultando la expresión del malestar emocional.
            </p>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      {/* Sección 3: Perspectivas teóricas */}
      <h2 className="section-title" data-aos="fade-up">Comprendiendo el contexto: perspectivas teóricas</h2>

      <p className="mb-4">
        Cuando se habla de salud mental femenina, no se habla de fragilidad. Se habla de condiciones
        sociales, históricas y culturales que influyen en la manera en que se vive y se afronta la
        vida diaria.
      </p>

      {/* Imagen placeholder 3 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/dia-mujer-perspectivas.webp"
          alt="Perspectivas teóricas sobre género"
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      {/* Teorías */}
      <div className="recipe-section mb-5" data-aos="fade-up">
        <div className="recipe-number">1</div>
        <h3 className="recipe-title">Teoría de los roles de género - Alice Eagly</h3>
        <div className="recipe-content">
          <p>
            Explica cómo las expectativas sociales influyen en la identidad y en la carga psicológica
            asumida por las mujeres. Los roles tradicionales de género crean presiones específicas
            que impactan directamente en el bienestar emocional.
          </p>
        </div>
      </div>

      <div className="recipe-section mb-5" data-aos="fade-up">
        <div className="recipe-number">2</div>
        <h3 className="recipe-title">La "segunda jornada" - Arlie Hochschild</h3>
        <div className="recipe-content">
          <p>
            Se refiere al trabajo doméstico y de cuidado que se suma al empleo formal y que incrementa
            el desgaste físico y emocional. Esta doble carga es una realidad invisible pero constante
            en la vida de muchas mujeres.
          </p>
        </div>
      </div>

      <div className="recipe-section mb-5" data-aos="fade-up">
        <div className="recipe-number">3</div>
        <h3 className="recipe-title">Teoría del género - Judith Butler</h3>
        <div className="recipe-content">
          <p>
            Señala cómo las estructuras sociales moldean la experiencia individual del género y sus
            implicancias en la vida cotidiana. El género no es solo biológico, es una construcción
            social con consecuencias reales.
          </p>
        </div>
      </div>

      <div className="recipe-section mb-5" data-aos="fade-up">
        <div className="recipe-number">4</div>
        <h3 className="recipe-title">Una voz diferente - Carol Gilligan</h3>
        <div className="recipe-content">
          <p>
            Plantea que muchas mujeres han sido socializadas para priorizar el cuidado de otros por
            encima de sus propias necesidades, lo que puede dificultar la expresión del malestar
            emocional y el autocuidado.
          </p>
        </div>
      </div>

      <div className="alert-info mb-5 text-center" data-aos="fade-up" style={{
        fontSize: '1.2rem',
        padding: '2rem'
      }}>
        <i className="bi bi-quote me-2"></i>
        <strong>
          Desde la psicología, la salud mental es entendida como un indicador de calidad de vida y
          bienestar integral. Este día no solo invita a celebrar la fortaleza, también invita a
          reconocer el cansancio y a promover el autocuidado.
        </strong>
      </div>

      <hr className="my-5" />

      {/* Sección 4: Pautas para el autocuidado */}
      <h2 className="section-title" data-aos="fade-up">Pautas para el autocuidado y la consideración hacia las mujeres</h2>

      <p className="mb-4">
        Una sociedad que cuida la salud mental de sus mujeres fortalece su presente y su futuro.
        Estas son acciones concretas que podemos implementar:
      </p>

      {/* Imagen placeholder 4 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/dia-mujer-autocuidado.webp"
          alt="Autocuidado y bienestar emocional"
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <div className="row gy-4 mb-5">
        <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-people"></i>
            </div>
            <h3>Distribuir responsabilidades</h3>
            <p>
              Promover la distribución equitativa de las responsabilidades domésticas y de cuidado
              entre todos los miembros del hogar.
            </p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-chat-heart"></i>
            </div>
            <h3>Validar emociones</h3>
            <p>
              Validar la expresión emocional sin minimizar el malestar. Escuchar activamente y
              reconocer las emociones como válidas y legítimas.
            </p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-diagram-3"></i>
            </div>
            <h3>Fomentar redes de apoyo</h3>
            <p>
              Crear y fortalecer redes de apoyo formales e informales que brinden contención
              emocional y social.
            </p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-shield-check"></i>
            </div>
            <h3>Respetar límites</h3>
            <p>
              Respetar y reforzar el establecimiento de límites personales sin juzgar ni presionar.
            </p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="500">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-moon-stars"></i>
            </div>
            <h3>Normalizar el descanso</h3>
            <p>
              Normalizar el descanso como parte del bienestar, no como señal de debilidad. El
              autocuidado no es egoísmo, es necesidad.
            </p>
          </div>
        </div>

        <div className="col-md-6" data-aos="fade-up" data-aos-delay="600">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-hospital"></i>
            </div>
            <h3>Facilitar acceso a salud mental</h3>
            <p>
              Facilitar el acceso oportuno a atención en salud mental sin estigmatización ni barreras.
            </p>
          </div>
        </div>
      </div>

      <div className="warning-box mb-5" data-aos="fade-up">
        <i className="bi bi-lightbulb-fill"></i>
        <div>
          <p className="mb-2"><strong>Reflexión importante:</strong></p>
          <p className="mb-0">
            Educar en corresponsabilidad y equidad desde edades tempranas es fundamental para
            construir una sociedad más justa. ¿Qué acciones concretas puedes tomar hoy para
            contribuir al bienestar emocional de las mujeres en tu entorno?
          </p>
        </div>
      </div>

      <hr className="my-5" />

      {/* Mensaje final destacado */}
      <div className="alert-info mb-5 text-center" data-aos="fade-up" style={{
        fontSize: '1.3rem',
        padding: '2.5rem'
      }}>
        <i className="bi bi-megaphone me-2"></i>
        <strong>
          "Que este 8 de marzo sea también un llamado a la reflexión y al compromiso con el bienestar
          psicológico de las mujeres. Una sociedad que cuida la salud mental de sus mujeres fortalece
          su presente y su futuro."
        </strong>
      </div>

      {/* Conclusión */}
      <div className="mt-5" data-aos="fade-up">
        <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#555' }}>
          Este 8 de marzo, comprometámonos no solo a celebrar los logros de las mujeres, sino también
          a reconocer y atender su bienestar emocional. Conmemorar también es cuidar.
        </p>
      </div>

      {/* Referencias */}
      <hr className="my-5" />

      <div className="references-section" data-aos="fade-up">
        <h3 className="mb-4" style={{ color: '#2c3e50', fontSize: '1.4rem' }}>Referencias</h3>
        <ul style={{ lineHeight: '2', color: '#555' }}>
          <li>
            Eagly, A. H. (1987). <em>Sex differences in social behavior: A social-role interpretation.</em> Erlbaum.
          </li>
          <li>
            Hochschild, A. R., & Machung, A. (1989). <em>The second shift: Working families and the revolution at home.</em> Viking.
          </li>
          <li>
            Butler, J. (1990). <em>Gender trouble: Feminism and the subversion of identity.</em> Routledge.
          </li>
          <li>
            Gilligan, C. (1982). <em>In a different voice: Psychological theory and women's development.</em> Harvard University Press.
          </li>
          <li>
            Organización Mundial de la Salud. (2022). Depression.
            <a href="https://www.who.int/news-room/fact-sheets/detail/depression" target="_blank" rel="noopener noreferrer">
              https://www.who.int/news-room/fact-sheets/detail/depression
            </a>
          </li>
          <li>
            Organización Mundial de la Salud. (2023). Gender and women's mental health.
            <a href="https://www.who.int/teams/mental-health-and-substance-use/gender-and-women-s-mental-health" target="_blank" rel="noopener noreferrer">
              https://www.who.int/teams/mental-health-and-substance-use/gender-and-women-s-mental-health
            </a>
          </li>
        </ul>
      </div>
    </>
  );
}
