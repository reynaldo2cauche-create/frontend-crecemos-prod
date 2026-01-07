// src/pages/services-infantil/TerapiaAprendizajePage.jsx

import React from "react";
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import  {initializePageScripts}  from '../../utils/initScripts';

const TerapiaAprendizajePage = () => {

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
          <h1 className="section-title text-center">Terapia de Aprendizaje</h1>
          <p className="page-subtitle">
            Favorecemos la autonomía y el desarrollo de habilidades motoras,
            sociales y de vida diaria en niños, adolescentes y adultos, guiados
            por profesionales especializados.
          </p>
          <nav className="breadcrumbs mt-3">
            <ol>
              <li><Link to="/">Inicio</Link></li>
              <li><Link to="/servicios">Servicios</Link></li>
              <li className="current">Terapia de Aprendizaje</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Features Section */}
      <section id="features-aprendizaje" className="features-cards section">
        <div className="container">
          <div
            className="section-title text-center mb-5"
            data-aos="fade-up"
          >
            <h2>
              Principales Tratamientos Realizados en Terapia de Aprendizaje
            </h2>
            <p>
              Ofrecemos estrategias y actividades para mejorar la comunicación,
              la memoria y las habilidades de aprendizaje.
            </p>
          </div>

          <div className="row gy-4 justify-content-center">
            {/* Card 1 */}
            <div className="col-xl-6 col-md-6" data-aos="zoom-in" data-aos-delay="100">
              <div className="feature-box blue text-center">
                <img
                  src="/assets/img/servicios/1.jpeg"
                  alt="Estrategias para la atención y concentración"
                  className="img-fluid mb-3 rounded"
                  style={{ width: "227px" }}
                />
                <h4>Estrategias para la atención y concentración</h4>
                <p>Técnicas para mejorar el enfoque y reducir distracciones.</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="col-xl-6 col-md-6" data-aos="zoom-in" data-aos-delay="200">
              <div className="feature-box green text-center">
                <img
                  src="/assets/img/servicios/2.jpeg"
                  alt="Estimulación de la memoria y el razonamiento"
                  className="img-fluid mb-3 rounded"
                  style={{ width: "227px" }}
                />
                <h4>Estimulación de la memoria y el razonamiento</h4>
                <p>Actividades para fortalecer la retención y el pensamiento lógico.</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="col-xl-6 col-md-6" data-aos="zoom-in" data-aos-delay="300">
              <div className="feature-box orange text-center">
                <img
                  src="/assets/img/servicios/3.jpeg"
                  alt="Desarrollo de habilidades de lectoescritura"
                  className="img-fluid mb-3 rounded"
                  style={{ width: "227px" }}
                />
                <h4>Desarrollo de habilidades de lectoescritura</h4>
                <p>Apoyo en la lectura, comprensión y escritura.</p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="col-xl-6 col-md-6" data-aos="zoom-in" data-aos-delay="400">
              <div className="feature-box blue text-center">
                <img
                  src="/assets/img/servicios/4.jpeg"
                  alt="Técnicas para el aprendizaje autónomo"
                  className="img-fluid mb-3 rounded"
                  style={{ width: "227px" }}
                />
                <h4>Técnicas para el aprendizaje autónomo</h4>
                <p>Métodos para organizar y gestionar el estudio de manera efectiva.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ¿Cuándo llevar terapia? */}
      <section id="featurestl" className="features section">
        <div className="container">
          <div className="tab-content" data-aos="fade-up" data-aos-delay="200">
            <div className="tab-pane fade active show" id="features-tab-1">
              <div className="row">
                {/* Texto */}
                <div className="col-lg-6 order-2 order-lg-1 mt-3 mt-lg-0 d-flex flex-column justify-content-center">
                  <h3>¿Cuándo llevar Terapia de Aprendizaje?</h3>
                  <p className="fst-italic">
                    Se recomienda llevar terapia de aprendizaje si el niño o adolescente:
                  </p>
                  <ul>
                    <li><i className="bi bi-check2-all"></i> Tiene dificultades para leer, escribir o comprender textos.</li>
                    <li><i className="bi bi-check2-all"></i> Presenta problemas de atención y concentración en clase.</li>
                    <li><i className="bi bi-check2-all"></i> Se le dificulta organizar sus tareas y recordar información.</li>
                    <li><i className="bi bi-check2-all"></i> Muestra bajo rendimiento escolar a pesar del esfuerzo.</li>
                    <li><i className="bi bi-check2-all"></i> Tiene dificultades para seguir instrucciones o resolver problemas matemáticos.</li>
                  </ul>
                  <p className="mt-3">
                    La terapia de aprendizaje ayuda a fortalecer las habilidades cognitivas,
                    académicas y de organización para mejorar el desempeño escolar y la confianza.
                  </p>
                </div>

                {/* Imagen */}
                <div className="col-lg-6 order-1 order-lg-2 text-center">
                  <img
                    src="/assets/img/servicios/terapia de aprendizaje.jpg"
                    alt="Terapia de Aprendizaje"
                    className="img-fluid rounded"
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
            <p>Conoce a las especialistas encargadas de brindar las terapias de aprendizaje.</p>
          </div>

          <div className="row justify-content-center">
            {/* Cherly */}
            <div className="col-lg-4 col-md-6 col-sm-12">
              <div className="our-team">
                <img src="/assets/img/servicios/terapeutica-cherQui.jpg" alt="Lic.Cherly Quiquia" />
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

          

          </div>
        </div>
      </section>
    </main>
  );
};

export default TerapiaAprendizajePage;
