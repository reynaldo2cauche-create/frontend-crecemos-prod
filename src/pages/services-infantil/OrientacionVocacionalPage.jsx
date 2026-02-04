// src/pages/services-infantil/OrientacionVocacionalPage.jsx
import React from "react";
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import  {initializePageScripts}  from '../../utils/initScripts';

const OrientacionVocacionalPage = () => {


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
          <h1 className="section-title text-center">Orientación Vocacional</h1>
          <p className="page-subtitle">
            Te ayudamos a descubrir tu vocación, intereses y habilidades para
            tomar decisiones acertadas sobre tu futuro académico y profesional
            con especialistas calificados.
          </p>
          <nav className="breadcrumbs mt-3">
            <ol>
              <li><Link to="/">Inicio</Link></li>
              <li><Link to="/servicios">Servicios</Link></li>
              <li className="current">Orientación Vocacional</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Features Section */}
      <section id="orientacion-vocacional" className="features section">
        <div className="container">
          <div className="d-flex justify-content-center">
            <ul className="nav nav-tabs" data-aos="fade-up" data-aos-delay="100">
              <li className="nav-item">
                <a
                  className="nav-link active show"
                  data-bs-toggle="tab"
                  data-bs-target="#orientacion-tab-1"
                >
                  <h4>¿Por qué es importante?</h4>
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link"
                  data-bs-toggle="tab"
                  data-bs-target="#orientacion-tab-2"
                >
                  <h4>¿A quién va dirigido?</h4>
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link"
                  data-bs-toggle="tab"
                  data-bs-target="#orientacion-tab-3"
                >
                  <h4>¿Cómo es el proceso?</h4>
                </a>
              </li>
            </ul>
          </div>

          <div className="tab-content" data-aos="fade-up" data-aos-delay="200">
            {/* Tab 1 */}
            <div
              className="tab-pane fade active show"
              id="orientacion-tab-1"
            >
              <div className="row">
                <div className="col-lg-6 order-2 order-lg-1 mt-3 mt-lg-0 d-flex flex-column justify-content-center">
                  <h3>¿Por qué es importante?</h3>
                  <p className="fst-italic">
                    Elegir una carrera es una de las decisiones más importantes
                    en la vida. Contar con una adecuada orientación vocacional
                    permite:
                  </p>
                  <ul>
                    <li>
                      <i className="bi bi-check2-all"></i>{" "}
                      <span>
                        Identificar habilidades, intereses y valores personales.
                      </span>
                    </li>
                    <li>
                      <i className="bi bi-check2-all"></i>{" "}
                      <span>
                        Explorar opciones de estudio y profesiones acorde al
                        perfil del estudiante.
                      </span>
                    </li>
                    <li>
                      <i className="bi bi-check2-all"></i>{" "}
                      <span>
                        Evitar frustraciones y cambios de carrera innecesarios.
                      </span>
                    </li>
                    <li>
                      <i className="bi bi-check2-all"></i>{" "}
                      <span>
                        Fomentar la motivación y seguridad en la elección
                        profesional.
                      </span>
                    </li>
                  </ul>
                </div>
                <div className="col-lg-6 order-1 order-lg-2 text-center">
                  <img
                    src="/assets/img/servicios/porqueelegircarrera.webp"
                    alt="Por qué es importante la Orientación Vocacional"
                    className="img-fluid"
                  />
                </div>
              </div>
            </div>

            {/* Tab 2 */}
            <div className="tab-pane fade" id="orientacion-tab-2">
              <div className="row">
                <div className="col-lg-6 order-2 order-lg-1 mt-3 mt-lg-0 d-flex flex-column justify-content-center">
                  <h3>¿A quién está dirigido?</h3>
                  <p className="fst-italic">
                    Nuestro servicio de orientación vocacional está diseñado
                    para diferentes perfiles de personas:
                  </p>
                  <ul>
                    <li>
                      <i className="bi bi-check2-all"></i>{" "}
                      <span>
                        Estudiantes de secundaria que aún no han decidido qué
                        carrera seguir.
                      </span>
                    </li>
                    <li>
                      <i className="bi bi-check2-all"></i>{" "}
                      <span>
                        Jóvenes que desean confirmar si su elección es la
                        adecuada.
                      </span>
                    </li>
                    <li>
                      <i className="bi bi-check2-all"></i>{" "}
                      <span>
                        Personas que buscan cambiar de profesión o especializarse
                        en otro ámbito.
                      </span>
                    </li>
                  </ul>
                </div>
                <div className="col-lg-6 order-1 order-lg-2 text-center">
                  <img
                    src="/assets/img/servicios/aquienorientacion.webp"
                    alt="A quién va dirigida la Orientación Vocacional"
                    className="img-fluid"
                  />
                </div>
              </div>
            </div>

            {/* Tab 3 */}
            <div className="tab-pane fade" id="orientacion-tab-3">
              <div className="row">
                <div className="col-lg-6 order-2 order-lg-1 mt-3 mt-lg-0 d-flex flex-column justify-content-center">
                  <h3>¿Cómo es el proceso?</h3>
                  <p className="fst-italic">
                    En nuestro centro ofrecemos un proceso integral y
                    personalizado que incluye:
                  </p>
                  <ul>
                    <li>
                      <i className="bi bi-check2-all"></i>{" "}
                      <span>
                        Evaluaciones psicométricas y test vocacionales.
                      </span>
                    </li>
                    <li>
                      <i className="bi bi-check2-all"></i>{" "}
                      <span>
                        Análisis de intereses, habilidades y aptitudes.
                      </span>
                    </li>
                    <li>
                      <i className="bi bi-check2-all"></i>{" "}
                      <span>
                        Asesoramiento individualizado con un especialista.
                      </span>
                    </li>
                    <li>
                      <i className="bi bi-check2-all"></i>{" "}
                      <span>
                        Información sobre el campo laboral y tendencias del
                        mercado.
                      </span>
                    </li>
                  </ul>
                  <div className="mt-4">
                    <p>
                      <i className="bi bi-lightbulb-fill"></i> Toma una decisión
                      informada y construye tu futuro con confianza.
                    </p>
                    <p>
                      <i className="bi bi-calendar-check-fill"></i> ¡Agenda tu
                      evaluación vocacional hoy mismo!
                    </p>
                  </div>
                </div>
                <div className="col-lg-6 order-1 order-lg-2 text-center">
                  <img
                    src="/assets/img/servicios/procesoorientacion.webp"
                    alt="Proceso de Orientación Vocacional"
                    className="img-fluid"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section
        id="team"
        className="team-area section-padding"
        data-aos="fade-up"
      >
        <div className="container">
          <div className="section-title text-center">
            <h2>Profesionales</h2>
            <p>
              Conoce a las especialistas encargadas de brindar la orientación
              vocacional.
            </p>
          </div>

          <div className="row justify-content-center">
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

export default OrientacionVocacionalPage;
