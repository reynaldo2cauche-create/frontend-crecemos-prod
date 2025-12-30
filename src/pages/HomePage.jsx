import React, { useEffect } from 'react';
import  {initializePageScripts}  from '../utils/initScripts';
import { useState } from 'react';
import * as popupService from '../services/popupService';
import * as conveniosService from '../services/conveniosService';
import { API_BASE_URL } from '../services/api';
import DialogNotice from '../components/DialogNotice/DialogNotice';


export default function HomePage() {

 const [currentImage, setCurrentImage] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [popupActivo, setPopupActivo] = useState(null);
  const [convenios, setConvenios] = useState([]);
  const [cargandoConvenios, setCargandoConvenios] = useState(true);

  const heroImages = [
    '/assets/img/index/Carrusel servicios.png',
    '/assets/img/index/carrusel psicologia infantil.png',
  ];



 useEffect(() => {
  initializePageScripts();

  const tabs = document.querySelectorAll('.quick-tab');
  const contents = document.querySelectorAll('.area-content');

  // Configurar event listeners para tabs
  const handleTabClick = (tab) => {
    const area = tab.getAttribute('data-area');

    // Remover active de todos
    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));

    // Activar tab seleccionado
    tab.classList.add('active');

    // Activar contenido con delay para la animación
    const targetContent = document.getElementById(`${area}-content`);

    // Remover el atributo data-aos temporalmente
    const cards = targetContent.querySelectorAll('[data-aos]');
    cards.forEach(card => {
      card.classList.remove('aos-animate');
    });

    // Activar el contenido
    targetContent.classList.add('active');

    // Forzar reflow y re-animar
    setTimeout(() => {
      cards.forEach(card => {
        card.classList.add('aos-animate');
      });
    }, 50);
  };

  // Agregar listeners a cada tab
  tabs.forEach(tab => {
    tab.addEventListener('click', () => handleTabClick(tab));
  });

  // Carrusel de imágenes
  const interval = setInterval(() => {
    setCurrentImage((prev) => (prev + 1) % heroImages.length);
  }, 5000);

  // Cleanup function
  return () => {
    clearInterval(interval);
    tabs.forEach(tab => {
      tab.removeEventListener('click', () => handleTabClick(tab));
    });
  };
}, [heroImages.length]);

useEffect(() => {
  const cargarPopup = async () => {
    try {

      const respuesta = await popupService.obtenerPopupActivo();



      if (respuesta.activo && respuesta.popup) {
        const popup = respuesta.popup;

        const ahora = new Date();
        const fechaInicio = new Date(popup.fechaInicio);
        const fechaFin = new Date(popup.fechaFin);


        // Solo mostrar si no hay un popup activo ya visible
        if (!popupActivo) {

          setPopupActivo(popup);
          setTimeout(() => setShowPopup(true), 1000);
        } else {
          console.log('⏭️ Ya hay un popup visible, no mostrar otro');
        }
      } else {
        console.log('❌ No hay popup activo o no cumple condiciones');
      }
    } catch (error) {
      console.error('💥 Error al cargar popup:', error);
    }
  };

  // Solo cargar UNA VEZ al montar el componente
  cargarPopup();
}, []); // Sin intervalo, sin cleanup

// Cargar convenios activos desde la BD
useEffect(() => {
  const cargarConvenios = async () => {
    try {
      setCargandoConvenios(true);
      const conveniosActivos = await conveniosService.getConveniosActivos();
      console.log('Convenios activos obtenidos:', conveniosActivos);
      setConvenios(conveniosActivos);
    } catch (error) {
      console.error('Error al cargar convenios:', error);
      setConvenios([]);
    } finally {
      setCargandoConvenios(false);
    }
  };

  cargarConvenios();
}, []);

const cerrarPopup = () => {
  console.log('🚪 Cerrando popup');
  setShowPopup(false);
  // No guardar en sessionStorage - siempre muestra en cada recarga
  setTimeout(() => setPopupActivo(null), 300);
};
  return (
<main className="main">
{/* Popup Programado - NUEVO DISEÑO MODERNO */}
<DialogNotice
  open={showPopup && !!popupActivo}
  onClose={cerrarPopup}
  popupData={popupActivo ? {
    titulo: popupActivo.titulo,
    imagenUrl: `${API_BASE_URL}/popup/imagen/${popupActivo.imagenUrl}`,
    mensajeWhatsapp: popupActivo.mensajeWhatsapp
  } : null}
/>
  <section id="hero" className="hero section" style={{ paddingTop: '150px' }}>
      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="row align-items-center">
          <div className="col-lg-6">
            <div className="hero-content" data-aos="fade-up" data-aos-delay="200">
              <div className="company-badge mb-4">
                <i className="bi bi-heart-fill me-2"></i>
                Tu bienestar es nuestra prioridad
              </div>

              <h1 className="mb-4">
                Centro de Terapia <br />
                y Desarrollo <br />
                <span className="accent-text">Crecemos</span>
              </h1>

              <p className="mb-4 mb-md-5">
                Brindamos atención especializada en terapia psicológica, desarrollo personal 
                y bienestar emocional. Nuestro equipo de profesionales te acompaña en tu 
                proceso de crecimiento y sanación.
              </p>

              <div className="hero-buttons">
                <a href="/contactanos" className="btn btn-primary me-0 me-sm-2 mx-1">Reservar Cita</a>
                {/* <a href="#" className="btn btn-link mt-2 mt-sm-0 glightbox">
                  <i className="bi bi-play-circle me-1"></i>
                  Conoce Más
                </a> */}
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="hero-image position-relative" data-aos="zoom-out" data-aos-delay="300">
              {/* Carrusel de imágenes */}
<div className="position-relative hero-carousel" style={{ 
  width: '100%',
  aspectRatio: '3/4',
  maxHeight: '600px',
  borderRadius: '16px', 
  overflow: 'hidden'
}}>
  {heroImages.map((img, index) => (
    <img 
      key={index}
      src={img}
      alt={`Terapia y Bienestar ${index + 1}`}
      className="position-absolute top-0 start-0 w-100 h-100 hero-carousel-img"
      style={{
        objectFit: 'cover',
        objectPosition: 'center 50%', // Más abajo para cortar logo
        opacity: index === currentImage ? 1 : 0,
        transition: 'opacity 1s ease-in-out'
      }}
    />
  ))}
  
  {/* Indicadores */}
  <div className="position-absolute bottom-0 end-0 mb-3 me-3 d-flex gap-2">
    {heroImages.map((_, index) => (
      <button
        key={index}
        onClick={() => setCurrentImage(index)}
        className="btn p-0 border-0 rounded-pill"
        style={{
          width: index === currentImage ? '32px' : '8px',
          height: '8px',
          backgroundColor: index === currentImage ? 'white' : 'rgba(255, 255, 255, 0.5)',
          transition: 'all 0.3s ease',
          cursor: 'pointer'
        }}
        aria-label={`Ir a imagen ${index + 1}`}
      />
    ))}
  </div>
</div>
            </div>
          </div>
        </div>

        <div className="row stats-row gy-4 mt-5" data-aos="fade-up" data-aos-delay="500">
          <div className="col-lg-3 col-md-6">
            <div className="stat-item">
              <div className="stat-icon">
                <i className="bi bi-people"></i>
              </div>
              <div className="stat-content">
                <h4>1000+ Pacientes</h4>
                <p className="mb-0">Atendidos exitosamente</p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6">
            <div className="stat-item">
              <div className="stat-icon">
                <i className="bi bi-calendar-check"></i>
              </div>
              <div className="stat-content">
                <h4>8+ Años</h4>
                <p className="mb-0">De experiencia profesional</p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6">
            <div className="stat-item">
              <div className="stat-icon">
                <i className="bi bi-star-fill"></i>
              </div>
              <div className="stat-content">
                <h4>98% Satisfacción</h4>
                <p className="mb-0">De nuestros pacientes</p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6">
            <div className="stat-item">
              <div className="stat-icon">
                <i className="bi bi-chat-heart"></i>
              </div>
              <div className="stat-content">
                <h4>24/7 Apoyo</h4>
                <p className="mb-0">Seguimiento continuo</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

      {/* Services Quick Section */}
      <section className="services-quick">
        <div className="container" data-aos="fade-up">
          <div className="section-header">
            <h2>Servicios Especializados</h2>
            <p>Accede directamente a la información detallada de cada servicio</p>
          </div>

          <div className="quick-tabs">
            <button className="quick-tab active" data-area="infantil">Infantil y Adolescentes</button>
            <button className="quick-tab" data-area="adultos">Adultos</button>
          </div>

          <div className="area-content active" id="infantil-content" data-aos="fade-up">
            <div className="services-mini-grid" data-aos="fade-up">
              <div className="service-mini-card">
                <div className="mini-icon">
                  <i className="bi bi-chat-dots"></i>
                </div>
                <h6>Terapia de Lenguaje</h6>
                <p>Mejora del habla y comunicación</p>
                <a href="/infantil-terapia-lenguaje" className="btn-mini-service">Ver Detalles</a>
              </div>

              <div className="service-mini-card">
                <div className="mini-icon">
                  <i className="bi bi-person-workspace"></i>
                </div>
                <h6>Terapia Ocupacional</h6>
                <p>Desarrollo de habilidades motoras</p>
                <a href="/infantil-terapia-ocupacional" className="btn-mini-service">Ver Detalles</a>
              </div>

              <div className="service-mini-card">
                <div className="mini-icon">
                  <i className="bi bi-book"></i>
                </div>
                <h6>Terapia de Aprendizaje</h6>
                <p>Estrategias de aprendizaje</p>
                <a href="/infantil-terapia-aprendizaje" className="btn-mini-service">Ver Detalles</a>
              </div>

              <div className="service-mini-card">
                <div className="mini-icon">
                  <i className="bi bi-heart"></i>
                </div>
                <h6>Psicología Infantil</h6>
                <p>Apoyo emocional y conductual</p>
                <a href="/infantil-psicologia-infantil" className="btn-mini-service">Ver Detalles</a>
              </div>

              <div className="service-mini-card">
                <div className="mini-icon">
                  <i className="bi bi-clipboard-data"></i>
                </div>
                <h6>Evaluación Psicológica</h6>
                <p>Para colegio e institución</p>
                <a href="/infantil-evaluacion-psicologica-colegio" className="btn-mini-service">Ver Detalles</a>
              </div>

              <div className="service-mini-card">
                <div className="mini-icon">
                  <i className="bi bi-compass"></i>
                </div>
                <h6>Orientación Vocacional</h6>
                <p>Elección de carrera profesional</p>
                <a href="/infantil-orientacion-vocacional" className="btn-mini-service">Ver Detalles</a>
              </div>
            </div>
          </div>

          <div className="area-content" id="adultos-content" >
            <div className="services-mini-grid" data-aos="fade-up">
              <div className="service-mini-card" >
                <div className="mini-icon">
                  <i className="bi bi-person-check"></i>
                </div>
                <h6>Psicoterapia Individual</h6>
                <p>Bienestar personal y emocional</p>
                <a href="/adulto-psicologia-individual" className="btn-mini-service">Ver Detalles</a>
              </div>

              <div className="service-mini-card">
                <div className="mini-icon">
                  <i className="bi bi-heart-fill"></i>
                </div>
                <h6>Terapia de Pareja</h6>
                <p>Fortalecimiento de la relación</p>
                <a href="/adulto-terapia-pareja" className="btn-mini-service">Ver Detalles</a>
              </div>

              <div className="service-mini-card">
                <div className="mini-icon">
                  <i className="bi bi-people-fill"></i>
                </div>
                <h6>Terapia Familiar</h6>
                <p>Convivencia armoniosa familiar</p>
                <a href="/adulto-terapia-familiar" className="btn-mini-service">Ver Detalles</a>
              </div>

              <div className="service-mini-card">
                <div className="mini-icon">
                  <i className="bi bi-mic"></i>
                </div>
                <h6>Terapia de Lenguaje</h6>
                <p>Rehabilitación del habla adultos</p>
                <a href="/adulto-terapia-lenguaje" className="btn-mini-service">Ver Detalles</a>
              </div>

              <div className="service-mini-card">
                <div className="mini-icon">
                  <i className="bi bi-mortarboard"></i>
                </div>
                <h6>Evaluación Universitaria</h6>
                <p>Para ingreso o permanencia</p>
                <a href="/adulto-evaluacion-psicologica-universidad" className="btn-mini-service">Ver Detalles</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recomendaciones Section */}
      <section id="recomendaciones" className="testimonials section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Recomendaciones</h2>
          <p>Contenido educativo y consejos profesionales para padres y pacientes</p>
        </div>

        <div className="container">
          <div className="row g-5">
            <div className="col-lg-4" data-aos="fade-up" data-aos-delay="100">
              <div className="testimonial-item">
                <img src="videologo.png" className="testimonial-img" alt="¿Cuándo llevar al psicólogo?" />
                <h3>¿Cuándo debo llevar a mi hijo al psicólogo?</h3>
                <h4>Psicología Infantil</h4>
                <div className="stars">
                  <i className="bi bi-play-circle"></i>
                  <span className="ms-2">Video educativo</span>
                </div>
                <p>
                  <i className="bi bi-quote quote-icon-left"></i>
                  <span>Nuestra licenciada en psicología infantil te enseña a reconocer cuándo necesitas llevar a tu hijo a consulta psicológica.</span>
                  <i className="bi bi-quote quote-icon-right"></i>
                </p>
                <a className="mt-3 btn-getstarted" href="https://www.youtube.com/watch?v=pwWZEl8m1Go&t=1s" target="_blank" rel="noopener noreferrer">Ver Video</a>
              </div>
            </div>

            <div className="col-lg-4" data-aos="fade-up" data-aos-delay="200">
              <div className="testimonial-item">
                <img src="videologo.png" className="testimonial-img" alt="TEA - Signos de Alerta" />
                <h3>TEA - Signos de Alerta y Tratamiento</h3>
                <h4>Trastorno del Espectro Autista</h4>
                <div className="stars">
                  <i className="bi bi-play-circle"></i>
                  <span className="ms-2">Video educativo</span>
                </div>
                <p>
                  <i className="bi bi-quote quote-icon-left"></i>
                  <span>Conoce cuáles son los SIGNOS DE ALERTA Y TRATAMIENTO en el autismo.</span>
                  <i className="bi bi-quote quote-icon-right"></i>
                </p>
                <a className="mt-3 btn-getstarted" href="https://www.youtube.com/watch?v=37K-l2eBwAk&t=1s" target="_blank" rel="noopener noreferrer">Ver Video</a>
              </div>
            </div>

            <div className="col-lg-4" data-aos="fade-up" data-aos-delay="300">
              <div className="testimonial-item">
                <img src="videologo.png" className="testimonial-img" alt="Desarrollo del Lenguaje" />
                <h3>Signos de Alerta en el Desarrollo del Lenguaje</h3>
                <h4>Lic. Merlin Fernández</h4>
                <div className="stars">
                  <i className="bi bi-play-circle"></i>
                  <span className="ms-2">Video educativo</span>
                </div>
                <p>
                  <i className="bi bi-quote quote-icon-left"></i>
                  <span>Lic.Merlin Fernández te muestra los signos de alerta que debes saber para detectar a tiempo retrasos en el desarrollo del lenguaje de tu niño.</span>
                  <i className="bi bi-quote quote-icon-right"></i>
                </p>
                <a className="mt-3 btn-getstarted" href="https://www.youtube.com/watch?v=iD0CY3QFlp4&t=208s" target="_blank" rel="noopener noreferrer">Ver Video</a>
              </div>
            </div>
          </div>

          <div className="text-center mt-5" data-aos="fade-up" data-aos-delay="400">
            <a href="#" className="me-0 me-sm-2 mx-1">Ver Más Recomendaciones</a>
          </div>
        </div>
      </section>

      {/* Alianzas Section */}
<section id="alianzas" className="clients section">
  <div className="container" data-aos="fade-up" data-aos-delay="100">
    <div className="section-title text-center mb-5">
      <h2>Alianzas y Convenios</h2>
      <p>Gracias a nuestros <strong>convenios con universidades e instituciones</strong>, podemos garantizar una mayor viabilidad en la realización de <strong>prácticas profesionales y especializaciones</strong> enfocadas a mejorar su formación, brindando terapias actualizadas y efectivas. Así mismo nuestras alianzas con otras instituciones nos permite una adecuada derivación de nuestros pacientes.</p>
    </div>

    <div className="swiper init-swiper" style={{ paddingBottom: '60px' }}>
      <script type="application/json" className="swiper-config" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          loop: true,
          speed: 600,
          autoplay: {
            delay: 3000
          },
          slidesPerView: "auto",
          pagination: {
            el: ".swiper-pagination",
            type: "bullets",
            clickable: true
          },
          breakpoints: {
            320: {
              slidesPerView: 1,
              spaceBetween: 40
            },
            480: {
              slidesPerView: 2,
              spaceBetween: 60
            },
            640: {
              slidesPerView: 3,
              spaceBetween: 80
            },
            992: {
              slidesPerView: 4,
              spaceBetween: 100
            },
            1200: {
              slidesPerView: 5,
              spaceBetween: 120
            }
          }
        })
      }} />
          <div className="swiper-wrapper align-items-center" style={{ marginBottom: '50px' }}>
        {convenios.map((convenio) => (
          <div
            key={convenio.id}
            className="swiper-slide text-center"
            style={{
              padding: '20px 10px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div style={{
              height: '180px',
              width: '250px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '15px',
              overflow: 'hidden',
              borderRadius: '20px'
            }}>
              <img
                src={convenio.logo_url ? `${API_BASE_URL.replace('/backend_api', '')}${convenio.logo_url}` : '/assets/img/index/default-logo.png'}
                className="img-fluid"
                alt={convenio.empresa}
                style={{
                  maxHeight: '180px',
                  maxWidth: '250px',
                  minHeight: '120px',
                  objectFit: 'contain',
                  width: 'auto',
                  height: 'auto',
                  borderRadius: '20px'
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/assets/img/index/default-logo.png';
                }}
              />
            </div>
            <h6
              className="mt-2"
              style={{
                fontSize: '0.9rem',
                lineHeight: '1.3',
                margin: '0',
                padding: '0 5px'
              }}
            >
              {convenio.empresa}
            </h6>
          </div>
        ))}
      </div>
      <div  className="mt-2" 
        style={{ 
          fontSize: '0.9rem', 
          lineHeight: '1.3',
          textAlign: 'center',
          marginTop: 'auto'
        }}></div>
          <div className="swiper-pagination"></div>
   
    </div>
  </div>
</section>
    </main>
  );
}