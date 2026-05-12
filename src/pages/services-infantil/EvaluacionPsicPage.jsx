import React from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import { initializePageScripts } from '../../utils/initScripts';

const EvaluacionPsicologicaColegioPage = () => {
  useEffect(() => {
    initializePageScripts();
  }, []);

  const headerStyle = {
    backgroundImage: 'url("/assets/img/evaluacionpsico.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    position: 'relative'
  };

  const overlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1
  };

  const contentStyle = {
    position: 'relative',
    zIndex: 2,
    color: 'white'
  };

  const titleStyle = {
    color: 'white'
  };

  const subtitleStyle = {
    color: 'white'
  };

  const breadcrumbStyle = {
    color: 'white'
  };

  return (
    <main>
      {/* Page Title */}
      <div className="page-title page-title-custom" data-aos="fade" style={headerStyle}>
        <div style={overlayStyle}></div>
        <div className="container text-center" style={contentStyle}>
          <h1 className="section-title text-center" style={titleStyle}>
            Evaluación Psicológica para el Colegio
          </h1>
          <p className="page-subtitle" style={subtitleStyle}>
            Favorecemos la autonomía y el desarrollo de habilidades motoras,
            sociales y de vida diaria en niños, adolescentes y adultos, guiados
            por profesionales especializados.
          </p>
          <nav className="breadcrumbs mt-3" style={breadcrumbStyle}>
            <ol>
              <li><Link to="/" style={{ color: 'white' }}>Inicio</Link></li>
              <li><Link to="/servicios" style={{ color: 'white' }}>Servicios</Link></li>
              <li className="current" style={{ color: 'white' }}>Evaluación Psicológica para el Colegio</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Pricing Section */}
      <section id="pricing" className="pricing section light-background">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row g-4 justify-content-center">
            {/* Perfil Integral */}
            <div className="col-lg-6" data-aos="fade-up" data-aos-delay="100">
              <div className="pricing-card">
                <h3>Perfil Integral del Desarrollo Infantil</h3>
                <div className="price">
                  <span
                    className="original-price"
                    style={{ textDecoration: "line-through", color: "gray" }}
                  >
                    S/. 400.00
                  </span>
                  <br />
                  <span className="currency">S/.</span>
                  <span className="amount">370.00</span>
                </div>
                <p className="description">
                  Ideal para niños y adolescentes de 4 a 17 años. Evaluación completa del desarrollo cognitivo, emocional y social.
                </p>

                <h4>Incluye 6 citas:</h4>
                <ul className="features-list">
                  <li>
                    <i className="bi bi-check-circle-fill"></i> 1 Entrevista inicial (solo padres)
                  </li>
                  <li>
                    <i className="bi bi-check-circle-fill"></i> 4 Sesiones evaluativas:
                  </li>
                  <li style={{ marginLeft: "30px" }}>
                    <i className="bi bi-dot"></i> Cognitiva
                  </li>
                  <li style={{ marginLeft: "30px" }}>
                    <i className="bi bi-dot"></i> Emocional
                  </li>
                  <li style={{ marginLeft: "30px" }}>
                    <i className="bi bi-dot"></i> Social
                  </li>
                  <li>
                    <i className="bi bi-check-circle-fill"></i> 1 Sesión de entrega de informe verbal (solo padres), donde se explican los resultados obtenidos.
                  </li>
                  <li>
                    <i className="bi bi-gift-fill"></i> Informe físico y digital sin costo adicional, ideal para presentar en el colegio.
                  </li>
                </ul>

                <a href="#" className="btn btn-primary">
                  4 a 17 años <i className="bi bi-arrow-right"></i>
                </a>
              </div>
            </div>

            {/* Perfil Integral + Escolar */}
            <div className="col-lg-6" data-aos="fade-up" data-aos-delay="200">
              <div className="pricing-card popular">
                <div className="popular-badge">Más Completo</div>
                <h3>
                  Perfil Integral y Escolar del Desarrollo Infantil
                </h3>
                <div className="price">
                  <span
                    className="original-price"
                    style={{ textDecoration: "line-through", color: "white" }}
                  >
                    S/. 460.00
                  </span>
                  <br />
                  <span className="currency">S/.</span>
                  <span className="amount">420.00</span>
                </div>
                <p className="description">
                  Recomendado para niños y adolescentes de 5 a 17 años. Evaluación integral incluyendo preparación escolar y habilidades académicas.
                </p>

                <h4>Incluye 7 citas:</h4>
                <ul className="features-list">
                  <li>
                    <i className="bi bi-check-circle-fill"></i> 1 Entrevista inicial (solo padres)
                  </li>
                  <li>
                    <i className="bi bi-check-circle-fill"></i> 5 Sesiones evaluativas:
                  </li>
                  <li style={{ marginLeft: "30px" }}>
                    <i className="bi bi-dot"></i> Cognitiva
                  </li>
                  <li style={{ marginLeft: "30px" }}>
                    <i className="bi bi-dot"></i> Emocional
                  </li>
                  <li style={{ marginLeft: "30px" }}>
                    <i className="bi bi-dot"></i> Social
                  </li>
                  <li style={{ marginLeft: "30px" }}>
                    <i className="bi bi-dot"></i> Aprestamiento escolar
                  </li>
                  <li>
                    <i className="bi bi-check-circle-fill"></i> 1 Sesión de entrega de informe verbal (solo padres), donde se explican los resultados obtenidos.
                  </li>
                  <li>
                    <i className="bi bi-gift-fill"></i> Informe físico y digital sin costo adicional, ideal para presentar en el colegio.
                  </li>
                </ul>

                <a href="#" className="btn btn-light">
                  5 a 17 años <i className="bi bi-arrow-right"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Profesionales */}
      <section
        id="team"
        className="team-area section-padding"
        data-aos="fade-up"
      >
        <div className="container">
          <div className="section-title text-center">
            <h2>Profesionales</h2>
            <p>
              Conoce a las especialistas encargadas de brindar las terapias de
              lenguaje.
            </p>
          </div>

          <div className="row justify-content-center">
            {/* Lic. Cherly Quiquia */}
            <div className="col-lg-4 col-md-6 col-sm-12">
              <div className="our-team">
                <img
                  src="/assets/img/servicios/terapeutica-cherQui.webp"
                  alt="Lic.Cherly Quiquia"
                />
                <div className="team-content">
                  <h3 className="title">Lic. Cherly Quiquia</h3>
                  <span className="post">Psicología</span>
                  <div className="credential-info">
                    <i className="bi bi-award-fill"></i>
                    <span className="credential-label">CPsP:</span>
                    <span className="credential-number">34980</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Lic. Giselle Burgos */}
            <div className="col-lg-4 col-md-6 col-sm-12">
              <div className="our-team">
                <img
                  src="/assets/img/servicios/Lic. Giselle (1).webp"
                  alt="Lic. Giselle Burgos"
                  style={{ height: "300px" }}
                />
                <div className="team-content">
                  <h3 className="title">Lic. Giselle Burgos</h3>
                  <span className="post">Psicología</span>
                  <div className="credential-info">
                    <i className="bi bi-award-fill"></i>
                    <span className="credential-label">CPsP:</span>
                    <span className="credential-number">66683</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default EvaluacionPsicologicaColegioPage;