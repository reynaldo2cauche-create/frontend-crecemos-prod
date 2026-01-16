import React from 'react'
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import  {initializePageScripts}  from '../../utils/initScripts';



export const AdultoPsicologiaIndividualPage = () => {

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
          <h1 className="section-title text-center">Psicoterapia Individual</h1>
          <p className="page-subtitle">
            Brindamos un espacio seguro y confidencial para que explores tus emociones,
            pensamientos y conductas, fortaleciendo tu bienestar personal y tu capacidad
            de afrontar los retos de la vida con el acompañamiento de psicólogos especializados.
          </p>
          <nav className="breadcrumbs mt-3">
            <ol>
              <li><Link to="/">Inicio</Link></li>
              <li><Link to="/servicios">Servicios</Link></li>
              <li className="current">Psicoterapia Individual</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Features Section */}
      <section id="psicoterapia-individual" className="features section">
        <div className="container">
          <div className="d-flex justify-content-center">
            <ul className="nav nav-tabs" data-aos="fade-up" data-aos-delay="100">
              <li className="nav-item">
                <a className="nav-link active show" data-bs-toggle="tab" data-bs-target="#psico-tab-1">
                  <h4>¿Qué es la Psicoterapia Individual?</h4>
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" data-bs-toggle="tab" data-bs-target="#psico-tab-2">
                  <h4>¿Cuándo acudir?</h4>
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" data-bs-toggle="tab" data-bs-target="#psico-tab-3">
                  <h4>¿Cómo te ayudamos?</h4>
                </a>
              </li>
            </ul>
          </div>

          <div className="tab-content" data-aos="fade-up" data-aos-delay="200">
            {/* Tab 1 */}
            <div className="tab-pane fade active show" id="psico-tab-1">
              <div className="row">
                <div className="col-lg-6 order-2 order-lg-1 mt-3 mt-lg-0 d-flex flex-column justify-content-center">
                  <h3>Psicoterapia Individual</h3>
                  <p className="fst-italic">
                    La psicoterapia individual es un espacio seguro y confidencial donde puedes expresar
                    tus emociones, comprender tus pensamientos y trabajar en tu bienestar emocional.
                  </p>
                  <p>💻 Sesiones <strong>presenciales</strong> y <strong>virtuales</strong> disponibles.</p>
                  <p className="fw-bold fst-italic" style={{ color: "var(--accent-color)" }}>
                    ✨ ¡Prioriza tu bienestar! Agenda tu cita y comienza tu camino hacia el equilibrio emocional. 💙
                  </p>
                </div>
                <div className="col-lg-6 order-1 order-lg-2 text-center">
                  <img src="/assets/img/servicios/queespsicoterapia.png" alt="Psicoterapia Individual" className="img-fluid" />
                </div>
              </div>
            </div>

            {/* Tab 2 */}
            <div className="tab-pane fade" id="psico-tab-2">
              <div className="row">
                <div className="col-lg-6 order-2 order-lg-1 mt-3 mt-lg-0 d-flex flex-column justify-content-center">
                  <h3>¿Cuándo acudir a terapia?</h3>
                  <ul>
                    <li><i className="bi bi-check2-all"></i> Ansiedad, estrés o depresión.</li>
                    <li><i className="bi bi-check2-all"></i> Dificultades en la toma de decisiones.</li>
                    <li><i className="bi bi-check2-all"></i> Problemas de autoestima o inseguridad.</li>
                    <li><i className="bi bi-check2-all"></i> Procesos de duelo o cambios importantes.</li>
                    <li><i className="bi bi-check2-all"></i> Manejo de emociones y relaciones personales.</li>
                  </ul>
                </div>
                <div className="col-lg-6 order-1 order-lg-2 text-center">
                  <img src="/assets/img/servicios/cuandoirapsicoterapia.jpg" alt="Cuándo acudir a terapia" className="img-fluid" />
                </div>
              </div>
            </div>

            {/* Tab 3 */}
            <div className="tab-pane fade" id="psico-tab-3">
              <div className="row">
                <div className="col-lg-6 order-2 order-lg-1 mt-3 mt-lg-0 d-flex flex-column justify-content-center">
                  <h3>¿Cómo te ayudamos?</h3>
                  <ul>
                    <li><i className="bi bi-check2-all"></i> Técnicas para gestionar emociones y pensamientos negativos.</li>
                    <li><i className="bi bi-check2-all"></i> Desarrollo de habilidades para afrontar desafíos personales.</li>
                    <li><i className="bi bi-check2-all"></i> Apoyo en la resolución de conflictos y toma de decisiones.</li>
                    <li><i className="bi bi-check2-all"></i> Acompañamiento en procesos de crecimiento personal.</li>
                  </ul>
                  <div className="mt-4">
                    <p><i className="bi bi-calendar-check-fill"></i> Reserva tu cita ahora mismo y comienza tu proceso de cambio.</p>
                    <a
                      href="https://api.whatsapp.com/send?phone=+51957064401&text=%F0%9F%92%99%20%C2%A1Hola!%20Estoy%20interesado%20en%20la%20psicoterapia%20para%20adultos,%20%C2%BFme%20pueden%20dar%20detalles?"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-warning fw-bold mt-2"
                    >
                      <i className="bi bi-whatsapp"></i> Reservar Cita
                    </a>
                  </div>
                </div>
                <div className="col-lg-6 order-1 order-lg-2 text-center">
                  <img src="/assets/img/servicios/comoloayudamos.jpg" alt="Cómo te ayudamos en Psicoterapia" className="img-fluid" />
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
            <p>Conoce a las especialistas encargadas de brindar las terapias de lenguaje.</p>
          </div>
          <div className="row justify-content-center">
            
          </div>
        </div>
      </section>
    </main>
  );
};
