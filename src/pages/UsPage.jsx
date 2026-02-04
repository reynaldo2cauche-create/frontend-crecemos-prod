import React, { useEffect } from 'react';


import  {initializePageScripts}  from '../utils/initScripts';
const UsPage = () => {
  useEffect(() => {
    initializePageScripts();
  }, []); 

  return (
    <>
     

      <main className="main">
        {/* Page Title */}
        <div className="page-title light-background" data-aos="fade">
          <div className="container">
            <h1>Conoce Nuestra Institución</h1>
            <p className="page-subtitle">Más de 8 años transformando vidas a través de terapias especializadas</p>
            <nav className="breadcrumbs">
              <ol>
                <li><a href="/">Inicio</a></li>
                <li className="current">Nosotros</li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Historia Section */}
        <section className="about-history-section">
          <div className="container">
            <div className="row align-items-center">
              
              <div className="col-lg-6" data-aos="fade-right" data-aos-delay="100">
                <img src="/assets/img/nosotros/historia.webp" alt="Centro de Terapias Crecemos" className="img-fluid rounded" />
              </div>

              <div className="col-lg-6" data-aos="fade-left" data-aos-delay="200">
                <div className="section-title">
                  <h2>Nuestra Historia</h2>
                </div>
                
                <div className="history-content">
                  <p>
                    Somos una institución que desde su fundación en el <strong>2016</strong> ha logrado una trayectoria exitosa con progreso en beneficio de todos sus pacientes.
                  </p>
                  
                  <p>
                    Nos hemos especializado en brindar terapias de rehabilitación para niños, adolescentes y adultos, teniendo hasta el momento más de <strong>2,000 pacientes atendidos y más de 30 mil sesiones de terapia realizadas.</strong>
                  </p>
                  
                  <p>
                    Nos caracteriza una atención confiable con <strong>profesionales capacitados y actualizados</strong> en cada área que te brindan una <strong>terapia efectiva y sobre todo un trato humano y cálido.</strong>
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Stats Highlight Section */}
        <section className="stats-highlight" id="stats-section">
          <div className="container">
            <div className="row">
              
              <div className="col-lg-3 col-md-6 col-sm-6" data-aos="fade-up" data-aos-delay="100">
                <div className="stat-item-custom">
                  <div className="stat-wrapper">
                    <span className="stat-number purecounter" 
                          data-purecounter-start="0" 
                          data-purecounter-end="1000" 
                          data-purecounter-duration="2"
                          data-purecounter-separator="true">0</span>
                    <span className="stat-symbol">+</span>
                  </div>
                  <p className="stat-text">Pacientes Atendidos</p>
                </div>
              </div>

              <div className="col-lg-3 col-md-6 col-sm-6" data-aos="fade-up" data-aos-delay="200">
                <div className="stat-item-custom">
                  <div className="stat-wrapper">
                    <span className="stat-number purecounter" 
                          data-purecounter-start="0" 
                          data-purecounter-end="30000" 
                          data-purecounter-duration="2"
                          data-purecounter-separator="true">0</span>
                    <span className="stat-symbol">+</span>
                  </div>
                  <p className="stat-text">Sesiones de Terapia</p>
                </div>
              </div>

              <div className="col-lg-3 col-md-6 col-sm-6" data-aos="fade-up" data-aos-delay="300">
                <div className="stat-item-custom">
                  <div className="stat-wrapper">
                    <span className="stat-number purecounter" 
                          data-purecounter-start="0" 
                          data-purecounter-end="8" 
                          data-purecounter-duration="2">0</span>
                    <span className="stat-symbol">+</span>
                  </div>
                  <p className="stat-text">Años de Experiencia</p>
                </div>
              </div>

              <div className="col-lg-3 col-md-6 col-sm-6" data-aos="fade-up" data-aos-delay="400">
                <div className="stat-item-custom">
                  <div className="stat-wrapper">
                    <span className="stat-number purecounter" 
                          data-purecounter-start="0" 
                          data-purecounter-end="100" 
                          data-purecounter-duration="2">0</span>
                    <span className="stat-symbol">%</span>
                  </div>
                  <p className="stat-text">Compromiso con la Excelencia</p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Misión y Visión Section */}
        <section className="mission-vision-section">
          <div className="container">
            
            <div className="row gy-4">
              
              <div className="col-lg-6" data-aos="fade-up" data-aos-delay="100">
                <div className="mission-vision-card">
                  <div className="card-icon">
                    <img src="/assets/img/nosotros/mision.webp" alt="Misión - Centro Crecemos" />
                  </div>
                  <h3>Misión</h3>
                  <p>
                    Brindar rehabilitación terapéutica integral a niños y adultos mediante terapias efectivas con profesionales actualizados en cada área.
                  </p>
                </div>
              </div>

              <div className="col-lg-6" data-aos="fade-up" data-aos-delay="200">
                <div className="mission-vision-card">
                  <div className="card-icon">
                    <img src="/assets/img/nosotros/vision.webp" alt="Visión - Centro Crecemos" />
                  </div>
                  <h3>Visión</h3>
                  <p>
                    Ser la institución líder e innovadora que logre brindar tratamiento terapéutico a niños y adultos en Lima Norte.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Valores Section */}
        <section className="section light-background">
          <div className="container">
            
            <div className="section-title text-center" data-aos="fade-up">
              <h2>Nuestros Valores</h2>
              <p>Los principios que guían nuestro trabajo diario y nos comprometen con la excelencia en el cuidado de nuestros pacientes.</p>
            </div>

            <div className="row gy-4">
              
              <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="100">
                <div className="feature-box text-center h-100">
                  <div className="icon mb-3">
                    <i className="bi bi-heart-fill" style={{ fontSize: '3rem', color: 'var(--accent-color)' }}></i>
                  </div>
                  <h4>Compromiso</h4>
                  <p>Nos dedicamos completamente al bienestar y progreso de cada uno de nuestros pacientes, brindando atención personalizada y de calidad.</p>
                </div>
              </div>

              <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="200">
                <div className="feature-box text-center h-100">
                  <div className="icon mb-3">
                    <i className="bi bi-people-fill" style={{ fontSize: '3rem', color: 'var(--accent-color)' }}></i>
                  </div>
                  <h4>Profesionalismo</h4>
                  <p>Contamos con un equipo de profesionales altamente capacitados y en constante actualización para ofrecer las mejores terapias.</p>
                </div>
              </div>

              <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="300">
                <div className="feature-box text-center h-100">
                  <div className="icon mb-3">
                    <i className="bi bi-shield-fill-check" style={{ fontSize: '3rem', color: 'var(--accent-color)' }}></i>
                  </div>
                  <h4>Confianza</h4>
                  <p>Construimos relaciones sólidas basadas en la transparencia, la honestidad y el respeto mutuo con nuestros pacientes y familias.</p>
                </div>
              </div>

              <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="400">
                <div className="feature-box text-center h-100">
                  <div className="icon mb-3">
                    <i className="bi bi-lightbulb-fill" style={{ fontSize: '3rem', color: 'var(--accent-color)' }}></i>
                  </div>
                  <h4>Innovación</h4>
                  <p>Incorporamos constantemente nuevas metodologías y tecnologías para mejorar la efectividad de nuestros tratamientos.</p>
                </div>
              </div>

              <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="500">
                <div className="feature-box text-center h-100">
                  <div className="icon mb-3">
                    <i className="bi bi-hand-thumbs-up-fill" style={{ fontSize: '3rem', color: 'var(--accent-color)' }}></i>
                  </div>
                  <h4>Excelencia</h4>
                  <p>Nos esforzamos por superar las expectativas en cada servicio que brindamos, manteniendo los más altos estándares de calidad.</p>
                </div>
              </div>

              <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="600">
                <div className="feature-box text-center h-100">
                  <div className="icon mb-3">
                    <i className="bi bi-emoji-smile-fill" style={{ fontSize: '3rem', color: 'var(--accent-color)' }}></i>
                  </div>
                  <h4>Calidez Humana</h4>
                  <p>Tratamos a cada paciente con el cariño, respeto y comprensión que merecen, creando un ambiente acogedor y seguro.</p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8 text-center" data-aos="fade-up" data-aos-delay="100">
                <h3>¿Listo para comenzar tu proceso de rehabilitación?</h3>
                <p>Nos sentimos comprometidos con nuestros pacientes, trabajadores, proveedores y la sociedad. Este modelo de atención integral es el que vivimos cada día.</p>
                <a href="contactanos" className="btn-custom">Contáctanos</a>
              </div>
            </div>
          </div>
        </section>

      </main>
    </>
  );
};

export default UsPage;