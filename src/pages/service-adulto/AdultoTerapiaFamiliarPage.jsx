import React from 'react'
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import  {initializePageScripts}  from '../../utils/initScripts';

 const AdultoTerapiaFamiliarPage = () => {

    useEffect(() => {
          initializePageScripts();
        }, []); 

    return (
    <main>
      {/* Título */}
      <div className="page-title page-title-custom" data-aos="fade">
        <span className="bubble bubble1"></span>
        <span className="bubble bubble2"></span>
        <span className="bubble bubble3"></span>

        <div className="container text-center">
          <h1 className="section-title text-center">Terapia Familiar</h1>
          <p className="page-subtitle">
            Ofrecemos un espacio seguro para familias con dificultades en la
            comunicación o conflictos internos. Buscamos fortalecer los lazos y
            promover una convivencia armoniosa con el apoyo de especialistas.
          </p>
          <nav className="breadcrumbs mt-3">
            <ol>
              <li><Link to="/">Inicio</Link></li>
              <li><Link to="/servicios">Servicios</Link></li>
              <li className="current">Terapia Familiar</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Sección de Tabs */}
      <section id="terapia-familiar" className="features section">
        <div className="container">
          <div className="d-flex justify-content-center">
            <ul className="nav nav-tabs" data-aos="fade-up" data-aos-delay="100">
              <li className="nav-item">
                <a
                  className="nav-link active show"
                  data-bs-toggle="tab"
                  data-bs-target="#familiar-tab-1"
                >
                  <h4>¿Qué es la Terapia Familiar?</h4>
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link"
                  data-bs-toggle="tab"
                  data-bs-target="#familiar-tab-2"
                >
                  <h4>¿Cuándo acudir?</h4>
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link"
                  data-bs-toggle="tab"
                  data-bs-target="#familiar-tab-3"
                >
                  <h4>¿Cómo trabajamos?</h4>
                </a>
              </li>
            </ul>
          </div>

          <div className="tab-content" data-aos="fade-up" data-aos-delay="200">
            {/* Qué es */}
            <div className="tab-pane fade active show" id="familiar-tab-1">
              <div className="row">
                <div className="col-lg-6 d-flex flex-column justify-content-center">
                  <h3>Terapia Familiar</h3>
                  <p className="fst-italic">
                    La terapia de familia ayuda a fortalecer los lazos
                    familiares, mejorar la comunicación y resolver conflictos
                    que afectan la convivencia. Es un espacio seguro donde cada
                    miembro puede expresar sus emociones y trabajar en
                    soluciones conjuntas.
                  </p>
                  <p>
                    💻 Sesiones <strong>presenciales</strong> y{" "}
                    <strong>virtuales</strong> disponibles para mayor comodidad.
                  </p>
                  <p
                    className="fw-bold fst-italic"
                    style={{ color: "var(--accent-color)" }}
                  >
                    ✨ ¡Fortalezcamos juntos los lazos familiares! Agenda tu
                    consulta hoy mismo. 💙
                  </p>
                </div>
                <div className="col-lg-6 text-center">
                  <img
                    src="/assets/img/servicios/queesterapiafamiliar.webp"
                    alt="Terapia Familiar"
                    className="img-fluid"
                  />
                </div>
              </div>
            </div>

            {/* Cuándo acudir */}
            <div className="tab-pane fade" id="familiar-tab-2">
              <div className="row">
                <div className="col-lg-6 d-flex flex-column justify-content-center">
                  <h3>¿Cuándo acudir a terapia de familia?</h3>
                  <ul>
                    <li>
                      <i className="bi bi-check2-all"></i> Problemas de
                      comunicación o discusiones frecuentes.
                    </li>
                    <li>
                      <i className="bi bi-check2-all"></i> Cambios importantes
                      como divorcio, mudanza o pérdida de un ser querido.
                    </li>
                    <li>
                      <i className="bi bi-check2-all"></i> Dificultades en la
                      crianza de los hijos.
                    </li>
                    <li>
                      <i className="bi bi-check2-all"></i> Conflictos entre
                      hermanos o familiares cercanos.
                    </li>
                    <li>
                      <i className="bi bi-check2-all"></i> Situaciones de
                      estrés, ansiedad o depresión en algún miembro de la
                      familia.
                    </li>
                  </ul>
                </div>
                <div className="col-lg-6 text-center">
                  <img
                    src="/assets/img/servicios/cuandoirterapiafamiliar.webp"
                    alt="Cuándo acudir a Terapia Familiar"
                    className="img-fluid"
                  />
                </div>
              </div>
            </div>

            {/* Cómo trabajamos */}
            <div className="tab-pane fade" id="familiar-tab-3">
              <div className="row">
                <div className="col-lg-6 d-flex flex-column justify-content-center">
                  <h3>¿Cómo trabajamos?</h3>
                  <ul>
                    <li>
                      <i className="bi bi-check2-all"></i> Evaluación de la
                      dinámica familiar y sus desafíos.
                    </li>
                    <li>
                      <i className="bi bi-check2-all"></i> Técnicas para mejorar
                      la comunicación y la resolución de conflictos.
                    </li>
                    <li>
                      <i className="bi bi-check2-all"></i> Estrategias para
                      fortalecer la unión y la empatía en la familia.
                    </li>
                    <li>
                      <i className="bi bi-check2-all"></i> Acompañamiento
                      emocional para adaptarse a los cambios.
                    </li>
                  </ul>
                  <div className="mt-4">
                    <p>
                      <i className="bi bi-calendar-check-fill"></i> Reserva tu
                      cita ahora mismo y comienza tu proceso de cambio.
                    </p>
                    <a
                      href="https://api.whatsapp.com/send?phone=+51957064401&text=Hola,%20me%20gustaría%20información%20sobre%20la%20terapia%20familiar."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-warning fw-bold mt-2"
                    >
                      <i className="bi bi-whatsapp"></i> Reservar Cita
                    </a>
                  </div>
                </div>
                <div className="col-lg-6 text-center">
                  <img
                    src="/assets/img/servicios/procesoterapiafamiliar.webp"
                    alt="Cómo trabajamos en Terapia Familiar"
                    className="img-fluid"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Profesionales */}
      <section id="team" className="team-area section-padding" data-aos="fade-up">
        <div className="container">
          <div className="section-title text-center">
            <h2>Profesionales</h2>
            <p>
              Conoce a las especialistas encargadas de brindar las terapias
              familiares.
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

export default AdultoTerapiaFamiliarPage;