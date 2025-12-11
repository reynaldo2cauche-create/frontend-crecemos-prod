import React from 'react';

export default function DiaDiscapacidadBlog() {
  return (
    <>
      {/* Introducción principal */}
      <div className="lead mb-5" style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#555' }}>
        Hoy conmemoramos el Día Internacional de las Personas con Discapacidad, una fecha de
        suma importancia para visibilizar, promover los derechos y el bienestar de las personas con
        discapacidad en todos los ámbitos de la sociedad.
      </div>

      <hr className="my-5" />

      {/* Sección 1: La Historia */}
      <h2 className="section-title" data-aos="fade-up">La historia</h2>

      <p className="mb-4">
        La declaración del Día Internacional de las Personas con Discapacidad el 3 de diciembre
        de 1992 por la ONU no fue un evento aislado, sino el resultado directo de una década de
        trabajo enfocado en este tema.
      </p>

      <h3 className="mt-5 mb-3" data-aos="fade-up" style={{ color: '#c263f9', fontSize: '1.5rem' }}>
        El Precedente: El Decenio (1983-1992)
      </h3>

      <p className="mb-4">
        La ONU estableció el período de 1983 a 1992 como el "Decenio de las Naciones Unidas
        para los Impedidos". El objetivo principal de este decenio era:
      </p>

      {/* Lista de objetivos del decenio */}
      <div className="row gy-4 mb-5">
        <div className="col-md-4" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-globe"></i>
            </div>
            <h3>Crear conciencia global</h3>
            <p>Aumentar la comprensión internacional sobre los desafíos y la situación de las personas con discapacidad.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-lightning-charge"></i>
            </div>
            <h3>Impulsar acciones</h3>
            <p>Motivar a los gobiernos y a la sociedad civil a implementar programas y políticas específicas para mejorar la vida de este colectivo.</p>
          </div>
        </div>

        <div className="col-md-4" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-people-fill"></i>
            </div>
            <h3>Lograr tres metas</h3>
            <p>El lema central del decenio era alcanzar la "Igualdad, Plena Participación e Integración" de las personas con discapacidad en la sociedad.</p>
          </div>
        </div>
      </div>

      {/* Imagen placeholder 2 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/discapacidad-historia.jpg"
          alt="Historia del Día Internacional de las Personas con Discapacidad"
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <h3 className="mt-5 mb-3" data-aos="fade-up" style={{ color: '#c263f9', fontSize: '1.5rem' }}>
        La Culminación: La Proclamación en 1992
      </h3>

      <p className="mb-4">
        Al llegar el final del decenio en 1992, la ONU buscó una forma de consolidar y dar
        continuidad a los logros y los compromisos adquiridos durante esos diez años.
      </p>

      <div className="alert-info mb-5" data-aos="fade-up">
        <i className="bi bi-calendar-check me-2"></i>
        <strong>¿Por qué el 3 de diciembre?</strong> La fecha se eligió como un recordatorio y un punto de
        inflexión para asegurar que las personas no se olvidaran de los objetivos del decenio
        (igualdad, integración y participación).
      </div>

      <p className="mb-5">
        La celebración del 3 de diciembre se instituyó como el punto de partida de una acción
        global continua. Este día sirve para evaluar lo que se ha hecho y, más importante, para
        seguir impulsando la aplicación de esos principios de inclusión de forma permanente, año
        tras año.
      </p>

      <hr className="my-5" />

      {/* Sección 2: Implicancia */}
      <h2 className="section-title" data-aos="fade-up">¿Qué implicancia tiene este día?</h2>

      <p className="mb-4">
        Esta jornada no es solo una celebración, es un llamado a la acción y a la conciencia:
      </p>

      {/* Lista numerada de implicancias */}
      <div className="recipe-section mb-5" data-aos="fade-up">
        <div className="recipe-number">1</div>
        <h3 className="recipe-title">Visibilización de la Diversidad</h3>
        <div className="recipe-content">
          <p>
            Resalta que la discapacidad es parte de la condición humana. Afecta a más de mil millones
            de personas a nivel mundial.
          </p>
        </div>
      </div>

      <div className="recipe-section mb-5" data-aos="fade-up">
        <div className="recipe-number">2</div>
        <h3 className="recipe-title">Promoción de Derechos</h3>
        <div className="recipe-content">
          <p>
            Sirve para impulsar y garantizar que todas las personas con discapacidad tengan acceso a la
            educación, el empleo, la atención sanitaria y la participación política y social.
          </p>
        </div>
      </div>

      <div className="recipe-section mb-5" data-aos="fade-up">
        <div className="recipe-number">3</div>
        <h3 className="recipe-title">Fomento de la Inclusión</h3>
        <div className="recipe-content">
          <p>
            Incita a gobiernos, organizaciones y a la sociedad en general a eliminar las barreras
            (actitudinales, físicas y comunicacionales) que limitan la vida de estas personas.
          </p>
        </div>
      </div>

      {/* Imagen placeholder 3 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/discapacidad-inclusion.jpg"
          alt="Inclusión de personas con discapacidad"
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <hr className="my-5" />

      {/* Sección 3: Más allá de la conmemoración */}
      <h2 className="section-title" data-aos="fade-up">Más Allá de la Conmemoración</h2>

      <p className="mb-4">
        La verdadera inclusión no se logra con un solo día, sino con acciones diarias.
      </p>

      <div className="warning-box mb-5" data-aos="fade-up">
        <i className="bi bi-exclamation-triangle-fill"></i>
        <div>
          <p className="mb-2"><strong>Cambio de paradigma:</strong></p>
          <p className="mb-0">
            Debemos dejar de apoyar un modelo centrado en la "deficiencia" y buscar un modelo
            basado en los "derechos" y la "diversidad". La discapacidad no reside en el individuo, sino
            en un entorno que no está diseñado para acoger a todas las personas.
          </p>
        </div>
      </div>

      <h3 className="mt-5 mb-4" data-aos="fade-up" style={{ color: '#c263f9', fontSize: '1.5rem' }}>
        Es vital preguntarnos hoy:
      </h3>

      <div className="row gy-4 mb-5">
        <div className="col-md-4" data-aos="fade-up" data-aos-delay="100">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-building"></i>
            </div>
            <h3>Espacios accesibles</h3>
            <p>
              ¿Mis espacios de trabajo o estudio son realmente accesibles?
            </p>
          </div>
        </div>

        <div className="col-md-4" data-aos="fade-up" data-aos-delay="200">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-person-check"></i>
            </div>
            <h3>Cuestionar prejuicios</h3>
            <p>
              ¿Estoy cuestionando mis propios prejuicios sobre lo que una persona con
              discapacidad puede o no puede hacer?
            </p>
          </div>
        </div>

        <div className="col-md-4" data-aos="fade-up" data-aos-delay="300">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="bi bi-megaphone"></i>
            </div>
            <h3>Amplificar voces</h3>
            <p>
              ¿Estoy amplificando las voces de las personas con discapacidad en lugar de hablar por
              ellas?
            </p>
          </div>
        </div>
      </div>

      {/* Imagen placeholder 4 */}
      <div className="recipe-image-placeholder mb-5" data-aos="fade-up">
        <img
          src="/assets/img/blog/discapacidad-accion.jpg"
          alt="Acciones para la inclusión"
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      {/* Mensaje final destacado */}
      <div className="alert-info mb-5 text-center" data-aos="fade-up" style={{
        fontSize: '1.2rem',
        padding: '2rem'
      }}>
        <i className="bi bi-quote me-2"></i>
        <strong>
          "El compromiso con la inclusión es un compromiso con una sociedad más justa,
          equitativa y rica para todos."
        </strong>
      </div>

      <hr className="my-5" />

      {/* Conclusión */}
      <div className="mt-5" data-aos="fade-up">
        <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#555' }}>
          Este 3 de diciembre, recordemos que la inclusión no es un acto de caridad, sino un derecho
          fundamental. Cada acción cuenta, cada barrera que eliminamos acerca a la sociedad hacia la
          equidad y la justicia que todas las personas merecen.
        </p>
      </div>
    </>
  );
}
