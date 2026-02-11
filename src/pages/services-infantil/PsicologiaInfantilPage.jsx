import React from "react";
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import  {initializePageScripts}  from '../../utils/initScripts';
const PsicologiaInfantilPage = () => {
  
  useEffect(() => {
    initializePageScripts();
  }, []); 


  return (
    <main>
      {/* Título de página */}
      <div className="page-title page-title-custom" data-aos="fade">
        <span className="bubble bubble1"></span>
        <span className="bubble bubble2"></span>
        <span className="bubble bubble3"></span>

        <div className="container text-center">
          <h1 className="section-title text-center">Psicología Infantil</h1>
          <p className="page-subtitle">
            Brindamos apoyo emocional y conductual a niños y adolescentes, favoreciendo su desarrollo
            integral, autoestima y bienestar psicológico, junto a sus familias.
          </p>
          <nav className="breadcrumbs mt-3">
            <ol>
              <li><Link to="/">Inicio</Link></li>
              <li><Link to="/servicios">Servicios</Link></li>
              <li className="current">Psicología Infantil</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Tratamientos */}
      <section id="features-psicologia" className="features-cards section">
        <div className="container">
          <div className="section-title text-center mb-5" data-aos="fade-up">
            <h2>Principales Tratamientos en Psicología Infantil</h2>
            <p>
              Ofrecemos terapias especializadas para el manejo emocional, el desarrollo de habilidades
              sociales y el fortalecimiento familiar.
            </p>
          </div>

          <div className="row gy-4 justify-content-center">
            {/* Card 1 */}
            <div className="col-xl-6 col-md-6" data-aos="zoom-in" data-aos-delay="100">
              <div className="feature-box blue text-center">
                <img src="/assets/img/servicios/1.webp" alt="Terapia Cognitivo-Conductual (TCC)" className="img-fluid mb-3 rounded" style={{ width: "227px" }} />
                <h4>Terapia Cognitivo-Conductual (TCC)</h4>
                <p>
                  Ayuda a modificar patrones de pensamiento y comportamiento en niños con ansiedad, depresión,
                  o problemas de conducta.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="col-xl-6 col-md-6" data-aos="zoom-in" data-aos-delay="200">
              <div className="feature-box green text-center">
                <img src="/assets/img/servicios/2.webp" alt="Terapia de Juego" className="img-fluid mb-3 rounded" style={{ width: "227px" }} />
                <h4>Terapia de Juego</h4>
                <p>
                  Utiliza el juego como herramienta para que los niños expresen emociones, superen traumas y
                  desarrollen habilidades sociales.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="col-xl-6 col-md-6" data-aos="zoom-in" data-aos-delay="300">
              <div className="feature-box orange text-center">
                <img src="/assets/img/servicios/3.webp" alt="Intervención en Problemas de Aprendizaje" className="img-fluid mb-3 rounded" style={{ width: "227px" }} />
                <h4>Intervención en Problemas de Aprendizaje</h4>
                <p>
                  Ofrece estrategias para superar dificultades académicas como dislexia, déficit de atención
                  o problemas de memoria.
                </p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="col-xl-6 col-md-6" data-aos="zoom-in" data-aos-delay="400">
              <div className="feature-box blue text-center">
                <img src="/assets/img/servicios/4.webp" alt="Orientación y Apoyo Familiar" className="img-fluid mb-3 rounded" style={{ width: "227px" }} />
                <h4>Orientación y Apoyo Familiar</h4>
                <p>
                  Brinda herramientas a los padres para entender y manejar de manera efectiva las necesidades
                  emocionales y conductuales de sus hijos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ¿Cuándo acudir? */}
      <section id="featurestl" className="features section">
        <div className="container">
          <div className="tab-content" data-aos="fade-up" data-aos-delay="200">
            <div className="tab-pane fade active show" id="features-tab-1">
              <div className="row">
                {/* Texto */}
                <div className="col-lg-6 order-2 order-lg-1 mt-3 mt-lg-0 d-flex flex-column justify-content-center">
                  <h3>¿Cuándo acudir a Psicología Infantil?</h3>
                  <p className="fst-italic">Considera acudir a Psicología Infantil si tu niño:</p>
                  <ul>
                    <li><i className="bi bi-check2-all"></i> Tiene dificultades para gestionar emociones como tristeza, ira o ansiedad.</li>
                    <li><i className="bi bi-check2-all"></i> Presenta problemas de conducta, como agresividad, desobediencia o aislamiento.</li>
                    <li><i className="bi bi-check2-all"></i> Enfrenta desafíos sociales, como dificultad para relacionarse con otros niños o expresar sus pensamientos.</li>
                    <li><i className="bi bi-check2-all"></i> Ha pasado por cambios significativos en su vida, como separación de los padres, pérdida de un ser querido o mudanzas.</li>
                    <li><i className="bi bi-check2-all"></i> Tiene diagnósticos como TEA, TDAH o problemas de aprendizaje, o señales de baja autoestima o inseguridad.</li>
                    <li><i className="bi bi-check2-all"></i> Muestra miedos excesivos o recurrentes que afectan su día a día.</li>
                  </ul>
                  <p className="mt-3">
                    La psicología infantil brinda apoyo emocional, herramientas de afrontamiento y estrategias para mejorar la conducta,
                    fortalecer la autoestima y favorecer un desarrollo emocional saludable.
                  </p>
                </div>

                {/* Imagen */}
                <div className="col-lg-6 order-1 order-lg-2 text-center">
                  <img src="/assets/img/servicios/psicologia.webp" alt="Psicología Infantil" className="img-fluid rounded" />
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
            <p>Conoce a las especialistas encargadas de brindar la psicología infantil.</p>
          </div>

          <div className="row justify-content-center">
            {/* Lic. Cherly Quiquia */}
            <div className="col-lg-4 col-md-6 col-sm-12">
              <div className="our-team">
                <img src="/assets/img/servicios/terapeutica-cherQui.webp" alt="Lic.Cherly Quiquia" />
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

            <div className="col-lg-4 col-md-6 col-sm-12">
              <div className="our-team">
                <img src="/assets/img/servicios/Lic. Giselle (1).webp" alt="Lic. Giselle Burgos" style={{ height: "300px" }} />
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

export default PsicologiaInfantilPage;
