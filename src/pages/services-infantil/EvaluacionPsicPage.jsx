import React from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import  {initializePageScripts}  from '../../utils/initScripts';



  const EvaluacionPsicologicaColegioPage = () => {

  useEffect(() => {
     initializePageScripts();
   }, []); 


  return (
    <main>
      {/* Page Title */}
      <div className="page-title page-title-custom" data-aos="fade">
        <span className="bubble bubble1"></span>
        <span className="bubble bubble2"></span>
        <span className="bubble bubble3"></span>

        <div className="container text-center">
          <h1 className="section-title text-center">
            Evaluación Psicológica para el Colegio
          </h1>
          <p className="page-subtitle">
            Favorecemos la autonomía y el desarrollo de habilidades motoras,
            sociales y de vida diaria en niños, adolescentes y adultos, guiados
            por profesionales especializados.
          </p>
          <nav className="breadcrumbs mt-3">
            <ol>
              <li><Link to="/">Inicio</Link></li>
              <li><Link to="/servicios">Servicios</Link></li>
              <li className="current">Evaluación Psicológica para el Colegio</li>
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
                    S/. 360.00
                  </span>
                  <br />
                  <span className="currency">S/.</span>
                  <span className="amount">320.00</span>
                </div>
                <p className="description">
                  Evaluación completa del desarrollo cognitivo, emocional y
                  social de tu hijo.
                </p>

                <h4>Servicios Incluidos:</h4>
                <ul className="features-list">
                  <li>
                    <i className="bi bi-check-circle-fill"></i> 1 Entrevista
                    (Padres)
                  </li>
                  <li>
                    <i className="bi bi-check-circle-fill"></i> 4 Sesiones
                    evaluativas:
                  </li>
                  <li style={{ marginLeft: "30px" }}>
                    <i className="bi bi-dot"></i> Cognitivas
                  </li>
                  <li style={{ marginLeft: "30px" }}>
                    <i className="bi bi-dot"></i> Emocional
                  </li>
                  <li style={{ marginLeft: "30px" }}>
                    <i className="bi bi-dot"></i> Social
                  </li>
                  <li>
                    <i className="bi bi-check-circle-fill"></i> 1 Informe Verbal
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
                    S/. 400.00
                  </span>
                  <br />
                  <span className="currency">S/.</span>
                  <span className="amount">370.00</span>
                </div>
                <p className="description">
                  Evaluación integral incluyendo preparación escolar y
                  habilidades académicas.
                </p>

                <h4>Servicios Incluidos:</h4>
                <ul className="features-list">
                  <li>
                    <i className="bi bi-check-circle-fill"></i> 1 Entrevista
                    (Padres)
                  </li>
                  <li>
                    <i className="bi bi-check-circle-fill"></i> 5 Sesiones
                    evaluativas:
                  </li>
                  <li style={{ marginLeft: "30px" }}>
                    <i className="bi bi-dot"></i> Cognitivas
                  </li>
                  <li style={{ marginLeft: "30px" }}>
                    <i className="bi bi-dot"></i> Emocional
                  </li>
                  <li style={{ marginLeft: "30px" }}>
                    <i className="bi bi-dot"></i> Social
                  </li>
                  <li style={{ marginLeft: "30px" }}>
                    <i className="bi bi-dot"></i> Aprestamiento Escolar
                  </li>
                  <li>
                    <i className="bi bi-check-circle-fill"></i> 1 Informe Verbal
                  </li>
                </ul>

                <a href="#" className="btn btn-light">
                  4 a 17 años <i className="bi bi-arrow-right"></i>
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
                  src="/assets/img/servicios/terapeutica-cherQui.jpg"
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
                  src="/assets/img/servicios/Lic. Giselle (1).png"
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
