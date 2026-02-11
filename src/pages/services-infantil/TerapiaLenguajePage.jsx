import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { useEffect } from 'react';


import  {initializePageScripts}  from '../../utils/initScripts';

const TerapiaLenguajePage = () => {

 
    useEffect(() => {
      initializePageScripts();
    }, []); 

  const tratamientos = [
    {
      imagen: '/assets/img/servicios/1.webp',
      titulo: 'Tratamiento de trastornos del habla',
      descripcion: 'Intervención para corregir dificultades en la pronunciación, fluidez o producción de sonidos.',
      colorClass: 'blue',
      delay: '100'
    },
    {
      imagen: '/assets/img/servicios/2.webp',
      titulo: 'Terapia del lenguaje receptivo y expresivo',
      descripcion: 'Mejora de la comprensión y expresión verbal en casos de retrasos del lenguaje.',
      colorClass: 'green',
      delay: '200'
    },
    {
      imagen: '/assets/img/servicios/3.webp',
      titulo: 'Rehabilitación de trastornos de la comunicación',
      descripcion: 'Ayuda en casos de afasia, apraxia o disartria, como resultado de condiciones neurológicas.',
      colorClass: 'orange',
      delay: '300'
    },
    {
      imagen: '/assets/img/servicios/4.webp',
      titulo: 'Estimulación del lenguaje en niños pequeños',
      descripcion: 'Fomento del desarrollo del lenguaje desde edades tempranas para prevenir retrasos.',
      colorClass: 'blue',
      delay: '400'
    }
  ];

  const indicadores = [
    'Tiene dificultad en la comunicación verbal o gestual',
    'Ha sido diagnosticado Trastorno del espectro autismo (TEA)',
    'Ha sido diagnosticado Trastorno por déficit de atención e hiperactividad (TDHA)',
    'Presenta Síndrome de Down',
    'Tiene 2 años y aun no habla',
    'Tiene 3 años, habla y no se le entiende',
    'Tiene 4 años y no estructura oraciones largas',
    'Tiene 5 años y aún presenta muchos problemas de articulación'
  ];

  const profesionales = [
    {
      nombre: 'Lic. Merlín Fernandez',
      cargo: 'Terapeuta de Lenguaje',
      ctmp: '12937',
      imagen: '/assets/img/servicios/merlin.webp'
    }
  ];

  return (
    <main>
      {/* Page Title */}
      <div className="page-title page-title-custom" data-aos="fade">
        <span className="bubble bubble1"></span>
        <span className="bubble bubble2"></span>
        <span className="bubble bubble3"></span>

        <Container className="text-center">
          <h1 className="section-title text-center">Terapia de Lenguaje</h1>
          <p className="page-subtitle">
            Ofrecemos terapias especializadas para mejorar el habla, lenguaje y comunicación
            en cada etapa de la vida con profesionales altamente calificados.
          </p>
          <nav className="breadcrumbs mt-3">
            <ol>
              <li><Link to="/">Inicio</Link></li>
              <li><Link to="/servicios">Servicios</Link></li>
              <li className="current">Terapia de Lenguaje</li>
            </ol>
          </nav>
        </Container>
      </div>

      {/* Tratamientos Section */}
      <section id="features-cardsser" className="features-cards section">
        <Container>
          <div className="section-title text-center mb-5" data-aos="fade-up">
            <h2>Principales Tratamientos Realizados por un Terapeuta de Lenguaje</h2>
            <p>Ofrecemos terapias especializadas para mejorar el habla, lenguaje y comunicación.</p>
          </div>

          <Row className="gy-4 justify-content-center">
            {tratamientos.map((tratamiento, index) => (
              <Col 
                xl={6} 
                md={6} 
                key={index}
                data-aos="zoom-in" 
                data-aos-delay={tratamiento.delay}
              >
                <div className={`feature-box ${tratamiento.colorClass} text-center`}>
                  <img 
                    src={tratamiento.imagen} 
                    alt={tratamiento.titulo} 
                    className="img-fluid mb-3 rounded" 
                    style={{ width: '227px' }}
                  />
                  <h4>{tratamiento.titulo}</h4>
                  <p>{tratamiento.descripcion}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Cuándo pasar por terapia */}
      <section id="featurestl" className="features section">
        <Container>
          <div className="tab-content" data-aos="fade-up" data-aos-delay="200">
            <div className="tab-pane fade active show" id="features-tab-1">
              <Row>
                {/* Columna de texto principal */}
                <Col 
                  lg={6} 
                  className="order-2 order-lg-1 mt-3 mt-lg-0 d-flex flex-column justify-content-center"
                >
                  <h3>¿Cuándo pasar por terapia de lenguaje?</h3>
                  <p className="fst-italic">Si tu niño:</p>
                  <ul>
                    {indicadores.map((indicador, index) => (
                      <li key={index}>
                        <i className="bi bi-check2-all"></i>
                        {indicador}
                      </li>
                    ))}
                  </ul>
                </Col>

                {/* Columna de imagen */}
                <Col lg={6} className="order-1 order-lg-2 text-center">
                  <img 
                    src="/assets/img/servicios/terapia de lenguaje.webp" 
                    alt="Terapia Infantil" 
                    className="img-fluid"
                  />
                </Col>
              </Row>
            </div>
          </div>
        </Container>
      </section>

      {/* Profesionales Section */}
      <section id="team" className="team-area section-padding" data-aos="fade-up">
        <Container>
          <div className="section-title text-center">
            <h2>Profesionales</h2>
            <p>Conoce a las especialistas encargadas de brindar las terapias de lenguaje.</p>
          </div>

          <Row className="justify-content-center">
            {profesionales.map((profesional, index) => (
              <Col lg={4} md={6} sm={12} key={index}>
                <div className="our-team">
                  <img src={profesional.imagen} alt={profesional.nombre} />
                  <div className="team-content">
                    <h3 className="title">{profesional.nombre}</h3>
                    <span className="post">{profesional.cargo}</span>
                    <div className="credential-info">
                      <i className="bi bi-award-fill"></i>
                      <span className="credential-label">CTMP</span>
                      <span className="credential-number">{profesional.ctmp}</span>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>
    </main>
  );
};

export default TerapiaLenguajePage;