import React from "react";
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import  {initializePageScripts}  from '../../utils/initScripts';
const TerapiaOcupacionalPage = () => {

    useEffect(() => {
      initializePageScripts();
    }, []); 
  
  return (
    <main>
      {/* Título de la página */}
      <div className="page-title page-title-custom" data-aos="fade">
        <span className="bubble bubble1"></span>
        <span className="bubble bubble2"></span>
        <span className="bubble bubble3"></span>

        <div className="container text-center">
          <h1 className="section-title text-center">
            Terapia Ocupacional e Integracion Sensorial
          </h1>
          <p className="page-subtitle">
            Favorecemos la autonomía y el desarrollo de habilidades motoras,
            sociales y de vida diaria en niños, adolescentes y adultos,
            guiados por profesionales especializados.
          </p>
          <nav className="breadcrumbs mt-3">
            <ol>
              <li><Link to="/">Inicio</Link></li>
              <li><Link to="/servicios">Servicios</Link></li>
              <li className="current">Terapia Ocupacional e Integracion Sensorial</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Sección de tratamientos */}
      <section id="features-ocupacional" className="features-cards section">
        <div className="container">
          <div className="section-title text-center mb-5" data-aos="fade-up">
            <h2>
              Principales Tratamientos Realizados por un Terapeuta Ocupacional
            </h2>
            <p>
              Ofrecemos terapias especializadas para favorecer la autonomía,
              habilidades motoras y de adaptación en la vida diaria.
            </p>
          </div>

          <div className="row gy-4 justify-content-center">
            {/* Card 1 */}
            <div
              className="col-xl-6 col-md-6"
              data-aos="zoom-in"
              data-aos-delay="100"
            >
              <div className="feature-box blue text-center">
                <img
                  src="assets/img/servicios/1.webp"
                  alt="Terapia de Integración Sensorial"
                  className="img-fluid mb-3 rounded"
                  style={{ width: "227px" }}
                />
                <h4>Terapia de Integración Sensorial</h4>
                <p>
                  Ayuda a niños con dificultades para procesar estímulos como
                  sonidos, texturas, movimientos o luces, favoreciendo su
                  adaptación al entorno.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div
              className="col-xl-6 col-md-6"
              data-aos="zoom-in"
              data-aos-delay="200"
            >
              <div className="feature-box green text-center">
                <img
                  src="assets/img/servicios/2.webp"
                  alt="Rehabilitación Motriz Fina y Gruesa"
                  className="img-fluid mb-3 rounded"
                  style={{ width: "227px" }}
                />
                <h4>Rehabilitación Motriz Fina y Gruesa</h4>
                <p>
                  Mejora la coordinación necesaria para realizar actividades
                  como escribir, cortar con tijeras, saltar, o mantener el
                  equilibrio.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div
              className="col-xl-6 col-md-6"
              data-aos="zoom-in"
              data-aos-delay="300"
            >
              <div className="feature-box orange text-center">
                <img
                  src="assets/img/servicios/3.webp"
                  alt="Entrenamiento en Habilidades de Vida Diaria"
                  className="img-fluid mb-3 rounded"
                  style={{ width: "227px" }}
                />
                <h4>Entrenamiento en Habilidades de Vida Diaria</h4>
                <p>
                  Enseña y fortalece habilidades básicas como vestirse, comer de
                  forma independiente, y mantener la higiene personal.
                </p>
              </div>
            </div>

            {/* Card 4 */}
            <div
              className="col-xl-6 col-md-6"
              data-aos="zoom-in"
              data-aos-delay="400"
            >
              <div className="feature-box blue text-center">
                <img
                  src="assets/img/servicios/4.webp"
                  alt="Intervención en Habilidades Sociales y Adaptativas"
                  className="img-fluid mb-3 rounded"
                  style={{ width: "227px" }}
                />
                <h4>Intervención en Habilidades Sociales y Adaptativas</h4>
                <p>
                  Promueve interacciones positivas y ayuda a los niños a
                  adaptarse a diferentes contextos sociales y escolares.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de cuándo acudir */}
      <section id="featurestl" className="features section">
        <div className="container">
          <div className="tab-content" data-aos="fade-up" data-aos-delay="200">
            <div className="tab-pane fade active show" id="features-tab-1">
              <div className="row">
                {/* Columna de texto */}
                <div className="col-lg-6 order-2 order-lg-1 mt-3 mt-lg-0 d-flex flex-column justify-content-center">
                  <h3>¿Cuándo pasar por Terapia Ocupacional?</h3>
                  <p className="fst-italic">
                    Considera acudir a Terapia Ocupacional si tu niño:
                  </p>
                  <ul>
                    <li>
                      <i className="bi bi-check2-all"></i> Tiene dificultad para
                      realizar actividades diarias como vestirse, comer o
                      escribir.
                    </li>
                    <li>
                      <i className="bi bi-check2-all"></i> Presenta problemas de
                      coordinación motriz fina o gruesa.
                    </li>
                    <li>
                      <i className="bi bi-check2-all"></i> Muestra sensibilidad
                      extrema o dificultad para procesar estímulos sensoriales
                      (ruidos, texturas, luces, etc.).
                    </li>
                    <li>
                      <i className="bi bi-check2-all"></i> Ha sido diagnosticado
                      con TEA, TDAH, parálisis cerebral, Síndrome de Down u
                      otros trastornos del desarrollo.
                    </li>
                    <li>
                      <i className="bi bi-check2-all"></i> Tiene problemas para
                      mantener la atención o seguir rutinas básicas.
                    </li>
                    <li>
                      <i className="bi bi-check2-all"></i> Experimenta
                      dificultades para interactuar socialmente o adaptarse a su
                      entorno.
                    </li>
                  </ul>

                  <p className="mt-3">
                    La terapia ocupacional ayuda a mejorar estas áreas,
                    promoviendo independencia y desarrollo integral.
                  </p>
                </div>

                {/* Columna de imagen */}
                <div className="col-lg-6 order-1 order-lg-2 text-center">
                  <img
                    src="assets/img/servicios/terapia ocupacional.webp"
                    alt="Terapia Ocupacional"
                    className="img-fluid"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Profesionales */}
      {/*<section
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
          </div>*/}

          {/* <div className="row justify-content-center">
             Lic. Daniela Calle 
            <div className="col-lg-4 col-md-6 col-sm-12">
              <div className="our-team">
                <img
                  src="assets/img/servicios/terapuet-danielac.webp"
                  alt="Lic. Daniela Calle"
                />
                <div className="team-content">
                  <h3 className="title">Lic. Daniela Calle</h3>
                  <span className="post">
                    Terapeuta de Integración Sensorial
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section> */}
    </main>
  );
};

export default TerapiaOcupacionalPage;
