import React from 'react'
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import  {initializePageScripts}  from '../../utils/initScripts';


 const AdultoObstetriciaPage = () => {


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
            Obstetricia
          </h1>
          <p className="page-subtitle">
            Acompañamiento integral para la mujer, la gestante y el desarrollo
            temprano del bebé. En el Centro de Terapias CRECEMOS promovemos la
            salud integral de la mujer durante el embarazo, el posparto y los
            primeros meses de vida del bebé.
          </p>
         <nav className="breadcrumbs mt-3">
          <ol>
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/servicios">Servicios</Link></li>
            <li className="current">Obstetricia</li>
          </ol>
        </nav>
        </div>
      </div>

      {/* Features Section */}
      <section
        id="obstetricia"
        className="features section"
      >
        <div className="container">
          <div className="d-flex justify-content-center">
            <ul
              className="nav nav-tabs"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              <li className="nav-item">
                <a
                  className="nav-link active show"
                  data-bs-toggle="tab"
                  data-bs-target="#obst-tab-1"
                >
                  <h4>¿Qué es?</h4>
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link"
                  data-bs-toggle="tab"
                  data-bs-target="#obst-tab-2"
                >
                  <h4>¿A quién está dirigido?</h4>
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link"
                  data-bs-toggle="tab"
                  data-bs-target="#obst-tab-3"
                >
                  <h4>¿Qué incluye?</h4>
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link"
                  data-bs-toggle="tab"
                  data-bs-target="#obst-tab-4"
                >
                  <h4>Beneficios</h4>
                </a>
              </li>
            </ul>
          </div>

          <div
            className="tab-content"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            {/* Qué es */}
            <div className="tab-pane fade active show" id="obst-tab-1">
              <div className="row">
                <div className="col-lg-6 d-flex flex-column justify-content-center">
                  <h3>Obstetricia</h3>
                  <p className="fst-italic">
                    Brindamos un servicio de Obstetricia orientado a promover
                    la salud integral de la mujer durante las diferentes etapas
                    de su vida, con especial énfasis en el embarazo, el
                    posparto y los primeros meses de vida del bebé. Nuestra
                    atención está enfocada en la prevención, educación y
                    acompañamiento profesional, trabajando de manera
                    interdisciplinaria con las áreas de Psicología, Terapia de
                    Lenguaje y Terapia Ocupacional para favorecer el bienestar
                    de la madre, el bebé y toda la familia.
                  </p>
                  <p
                    className="fw-bold fst-italic"
                    style={{ color: "var(--accent-color)" }}
                  >
                    🤰 Crecemos contigo desde el inicio de la vida.
                  </p>
                </div>
                <div className="col-lg-6 text-center">
                  <img
                    src="/assets/img/servicios/queesobstetricia.webp"
                    alt="Obstetricia"
                    className="img-fluid"
                  />
                </div>
              </div>
            </div>

            {/* A quién está dirigido */}
            <div className="tab-pane fade" id="obst-tab-2">
              <div className="row">
                <div className="col-lg-6 d-flex flex-column justify-content-center">
                  <h3>¿A quién está dirigido?</h3>
                  <ul>
                    <li>
                      <i className="bi bi-check2-all"></i> Mujeres que desean
                      planificar un embarazo.
                    </li>
                    <li>
                      <i className="bi bi-check2-all"></i> Gestantes en
                      cualquier etapa del embarazo.
                    </li>
                    <li>
                      <i className="bi bi-check2-all"></i> Madres en el
                      periodo posparto.
                    </li>
                    <li>
                      <i className="bi bi-check2-all"></i> Familias que buscan
                      orientación en los cuidados del recién nacido.
                    </li>
                    <li>
                      <i className="bi bi-check2-all"></i> Mujeres que
                      requieren consejería en salud sexual y reproductiva.
                    </li>
                  </ul>
                </div>
                <div className="col-lg-6 text-center">
                  <img
                    src="/assets/img/servicios/dirigidoobstetricia.webp"
                    alt="A quién está dirigido Obstetricia"
                    className="img-fluid"
                  />
                </div>
              </div>
            </div>

            {/* Qué incluye */}
            <div className="tab-pane fade" id="obst-tab-3">
              <div className="row">
                <div className="col-lg-6 d-flex flex-column justify-content-center">
                  <h3>Nuestros servicios</h3>
                  <ul>
                    <li><i className="bi bi-check2-all"></i> Control y orientación durante el embarazo.</li>
                    <li><i className="bi bi-check2-all"></i> Psicoprofilaxis obstétrica (preparación para el parto).</li>
                    <li><i className="bi bi-check2-all"></i> Estimulación prenatal.</li>
                    <li><i className="bi bi-check2-all"></i> Consejería en lactancia materna.</li>
                    <li><i className="bi bi-check2-all"></i> Preparación para la maternidad y paternidad.</li>
                    <li><i className="bi bi-check2-all"></i> Educación sobre cuidados del recién nacido.</li>
                    <li><i className="bi bi-check2-all"></i> Seguimiento del desarrollo del bebé durante sus primeros meses.</li>
                    <li><i className="bi bi-check2-all"></i> Consejería en salud sexual y reproductiva.</li>
                    <li><i className="bi bi-check2-all"></i> Planificación familiar.</li>
                    <li><i className="bi bi-check2-all"></i> Orientación durante el puerperio y recuperación posparto.</li>
                    <li><i className="bi bi-check2-all"></i> Tamizaje y orientación para la detección temprana de depresión posparto, con derivación al área de Psicología cuando sea necesario.</li>
                  </ul>
                </div>
                <div className="col-lg-6 text-center">
                  <img
                    src="/assets/img/servicios/incluyeobstetricia.webp"
                    alt="Qué incluye Obstetricia"
                    className="img-fluid"
                  />
                </div>
              </div>
            </div>

            {/* Beneficios */}
            <div className="tab-pane fade" id="obst-tab-4">
              <div className="row">
                <div className="col-lg-6 d-flex flex-column justify-content-center">
                  <h3>Beneficios de una atención temprana</h3>
                  <ul>
                    <li><i className="bi bi-check2-all"></i> Favorece un embarazo saludable.</li>
                    <li><i className="bi bi-check2-all"></i> Fortalece el vínculo entre la madre y el bebé desde la gestación.</li>
                    <li><i className="bi bi-check2-all"></i> Promueve una lactancia materna exitosa.</li>
                    <li><i className="bi bi-check2-all"></i> Brinda herramientas para afrontar con seguridad el parto y el posparto.</li>
                    <li><i className="bi bi-check2-all"></i> Permite detectar oportunamente factores de riesgo y realizar derivaciones a otras especialidades cuando corresponda.</li>
                    <li><i className="bi bi-check2-all"></i> Contribuye al adecuado desarrollo físico, emocional y neuroevolutivo del bebé desde sus primeros meses de vida.</li>
                  </ul>
                  <div className="mt-4">
                    <p>
                      <i className="bi bi-calendar-check-fill"></i> 📍 Crecemos
                      contigo desde el inicio de la vida: agenda tu cita.
                    </p>
                    <a
                      href="https://api.whatsapp.com/send?phone=+51957064401&text=Hola.%20Deseo%20información%20sobre%20el%20servicio%20de%20Obstetricia."
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
                    src="/assets/img/servicios/beneficiosobstetricia.webp"
                    alt="Beneficios de Obstetricia"
                    className="img-fluid"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Profesionales
      <section id="team" className="team-area section-padding" data-aos="fade-up">
        <div className="container">
          <div className="section-title text-center">
            <h2>Profesionales</h2>
            <p>Conoce a la especialista encargada del área de Obstetricia.</p>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-4 col-md-6 col-sm-12">
              <div className="our-team">
                <img
                  src="/assets/img/servicios/Lic-Obstetra.webp"
                  alt="Nombre de la Obstetra"
                  style={{ height: "300px" }}
                />
                <div className="team-content">
                  <h3 className="title">Nombre de la Obstetra</h3>
                  <span className="post">Obstetricia</span>
                  <div className="credential-info">
                    <i className="bi bi-award-fill"></i>
                    <span className="credential-label">COP:</span>
                    <span className="credential-number">00000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section> */}
    </main>
  );
};
export default AdultoObstetriciaPage;