import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { initializePageScripts } from '../utils/initScripts';
import * as popupService from '../services/popupService';
import * as conveniosService from '../services/conveniosService';
import { API_BASE_URL, SERVER_BASE_URL } from '../services/api';
import DialogNotice from '../components/DialogNotice/DialogNotice';
import Reveal from '../components/public/Reveal';
import RevealText from '../components/public/RevealText';
import Decor from '../components/public/Decor';

// Fotos del hero: rotan automáticamente cada 5s con transición (crossfade).
// Para agregar más, solo sube los archivos a /public/assets/img/index/ y
// añade su ruta aquí. Con 2+ fotos aparecen los puntos de navegación.
// Recomendado: horizontal 2560×1440 px (16:9), WebP optimizado (<400 KB).
const heroImages = [
  '/assets/img/index/Carrusel servicios.webp',
  // '/assets/img/index/hero-2.webp',
  // '/assets/img/index/hero-3.webp',
];

const stats = [
  { icon: 'bi-people', value: '1000+ Pacientes', label: 'Atendidos exitosamente' },
  { icon: 'bi-calendar-check', value: '8+ Años', label: 'De experiencia profesional' },
  { icon: 'bi-star-fill', value: '98% Satisfacción', label: 'De nuestros pacientes' },
  { icon: 'bi-chat-heart', value: '24/7 Apoyo', label: 'Seguimiento continuo' },
];

const servicios = {
  infantil: [
    { icon: 'bi-chat-dots', title: 'Terapia de Lenguaje', desc: 'Mejora del habla y comunicación', to: '/infantil-terapia-lenguaje' },
    { icon: 'bi-person-workspace', title: 'Terapia Ocupacional', desc: 'Desarrollo de habilidades motoras', to: '/infantil-terapia-ocupacional' },
    { icon: 'bi-book', title: 'Terapia de Aprendizaje', desc: 'Estrategias de aprendizaje', to: '/infantil-terapia-aprendizaje' },
    { icon: 'bi-heart', title: 'Psicología Infantil', desc: 'Apoyo emocional y conductual', to: '/infantil-psicologia-infantil' },
    { icon: 'bi-clipboard-data', title: 'Evaluación Psicológica', desc: 'Para colegio e institución', to: '/infantil-evaluacion-psicologica-colegio' },
    { icon: 'bi-compass', title: 'Orientación Vocacional', desc: 'Elección de carrera profesional', to: '/infantil-orientacion-vocacional' },
  ],
  adultos: [
    { icon: 'bi-person-check', title: 'Psicoterapia Individual', desc: 'Bienestar personal y emocional', to: '/adulto-psicologia-individual' },
    { icon: 'bi-heart-fill', title: 'Terapia de Pareja', desc: 'Fortalecimiento de la relación', to: '/adulto-terapia-pareja' },
    { icon: 'bi-people-fill', title: 'Terapia Familiar', desc: 'Convivencia armoniosa familiar', to: '/adulto-terapia-familiar' },
    { icon: 'bi-mic', title: 'Terapia de Lenguaje', desc: 'Rehabilitación del habla adultos', to: '/adulto-terapia-lenguaje' },
    { icon: 'bi-mortarboard', title: 'Evaluación Universitaria', desc: 'Para ingreso o permanencia', to: '/adulto-evaluacion-psicologica-universidad' },
    { icon: 'bi-heart-pulse', title: 'Obstetricia', desc: 'Cuidado en embarazo y posparto', to: '/adulto-obstetricia' },
  ],
};

const recomendaciones = [
  {
    tag: 'Psicología Infantil',
    title: '¿Cuándo debo llevar a mi hijo al psicólogo?',
    desc: 'Nuestra licenciada en psicología infantil te enseña a reconocer cuándo necesitas llevar a tu hijo a consulta psicológica.',
    url: 'https://www.youtube.com/watch?v=pwWZEl8m1Go&t=1s',
  },
  {
    tag: 'Trastorno del Espectro Autista',
    title: 'TEA - Signos de Alerta y Tratamiento',
    desc: 'Conoce cuáles son los signos de alerta y tratamiento en el autismo.',
    url: 'https://www.youtube.com/watch?v=37K-l2eBwAk&t=1s',
  },
  {
    tag: 'Lic. Merlin Fernández',
    title: 'Signos de Alerta en el Desarrollo del Lenguaje',
    desc: 'La Lic. Merlin Fernández te muestra los signos de alerta que debes saber para detectar a tiempo retrasos en el desarrollo del lenguaje de tu niño.',
    url: 'https://www.youtube.com/watch?v=iD0CY3QFlp4&t=208s',
  },
];

const pilares = [
  { icon: 'bi-heart-pulse', title: 'Atención cálida y humana', desc: 'Te acompañamos con empatía y respeto en cada sesión.' },
  { icon: 'bi-people', title: 'Equipo profesional', desc: 'Especialistas certificados en cada área terapéutica.' },
  { icon: 'bi-clipboard2-pulse', title: 'Plan personalizado', desc: 'Diseñamos la terapia a la medida de cada persona.' },
  { icon: 'bi-shield-check', title: '8+ años de experiencia', desc: 'Miles de familias ya confiaron su bienestar en nosotros.' },
];

const pasos = [
  { n: '01', title: 'Agenda tu cita', desc: 'Escríbenos y reserva tu primera consulta sin complicaciones.' },
  { n: '02', title: 'Evaluación inicial', desc: 'Conocemos tu caso y definimos objetivos juntos.' },
  { n: '03', title: 'Terapia personalizada', desc: 'Iniciamos tu proceso con seguimiento cercano y continuo.' },
];

// Miniatura real del video de YouTube a partir de la URL
const ytThumb = (url) => {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
  return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : 'videologo.png';
};

export default function HomePage() {
  const [currentImage, setCurrentImage] = useState(0);
  const [activeTab, setActiveTab] = useState('infantil');
  const [showPopup, setShowPopup] = useState(false);
  const [popupActivo, setPopupActivo] = useState(null);
  const [convenios, setConvenios] = useState([]);
  const [cargandoConvenios, setCargandoConvenios] = useState(true);

  // Scripts base + rotación automática del hero
  useEffect(() => {
    initializePageScripts();
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Popup programado
  useEffect(() => {
    const cargarPopup = async () => {
      try {
        const respuesta = await popupService.obtenerPopupActivo();
        if (respuesta.activo && respuesta.popup) {
          setPopupActivo(respuesta.popup);
          setTimeout(() => setShowPopup(true), 1000);
        }
      } catch (error) {
        console.error('💥 Error al cargar popup:', error);
      }
    };
    cargarPopup();
  }, []);

  // Convenios activos desde la BD
  useEffect(() => {
    const cargarConvenios = async () => {
      try {
        setCargandoConvenios(true);
        const conveniosActivos = await conveniosService.getConveniosActivos();
        const conveniosFiltrados = conveniosActivos.filter((c) => c.id !== 27);
        setConvenios(conveniosFiltrados);
      } catch (error) {
        console.error('Error al cargar convenios:', error);
        setConvenios([]);
      } finally {
        setCargandoConvenios(false);
      }
    };
    cargarConvenios();
  }, []);

  // Re-inicializar Swiper cuando los convenios se cargan
  useEffect(() => {
    if (!cargandoConvenios && convenios.length > 0) {
      setTimeout(() => {
        const swiperElement = document.querySelector('.init-swiper');
        if (swiperElement) {
          const configElement = swiperElement.querySelector('.swiper-config');
          if (configElement) {
            try {
              import('swiper').then(({ default: Swiper }) => {
                import('swiper/modules').then(({ Autoplay, Pagination }) => {
                  const config = JSON.parse(configElement.innerHTML.trim());
                  new Swiper(swiperElement, { ...config, modules: [Autoplay, Pagination] });
                });
              });
            } catch (error) {
              console.error('Error al re-inicializar Swiper:', error);
            }
          }
        }
      }, 100);
    }
  }, [convenios, cargandoConvenios]);

  const cerrarPopup = () => {
    setShowPopup(false);
    setTimeout(() => setPopupActivo(null), 300);
  };

  return (
    <main className="cx-page">
      <DialogNotice
        open={showPopup && !!popupActivo}
        onClose={cerrarPopup}
        popupData={popupActivo ? {
          titulo: popupActivo.titulo,
          imagenUrl: `${API_BASE_URL}/popup/imagen/${popupActivo.imagenUrl}`,
          mensajeWhatsapp: popupActivo.mensajeWhatsapp,
        } : null}
      />

      {/* ========================= HERO (cine, full-bleed) ========================= */}
      <section className="cx-hero cx-hero--cine">
        <div className="cx-hero-bg">
          {heroImages.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Terapia y bienestar ${index + 1}`}
              onError={(e) => {
                if (!e.target.src.endsWith('/assets/img/index/hero.webp')) {
                  e.target.onerror = null;
                  e.target.src = '/assets/img/index/hero.webp';
                }
              }}
              style={{
                opacity: index === currentImage ? 1 : 0,
                zIndex: index === currentImage ? 2 : 1,
              }}
            />
          ))}
        </div>
        <div className="cx-hero-overlay" />
        {heroImages.length > 1 && (
          <div className="cx-hero-dots">
            {heroImages.map((_, index) => (
              <button
                key={index}
                className={index === currentImage ? 'on' : ''}
                onClick={() => setCurrentImage(index)}
                aria-label={`Ir a imagen ${index + 1}`}
              />
            ))}
          </div>
        )}
        <div className="cx-container cx-hero-cine-inner">
          <Reveal className="cx-hero-copy" y={26}>
            <span className="cx-badge cx-anim-1">
              <i className="bi bi-heart-fill" />
              Tu bienestar es nuestra prioridad
            </span>
            <RevealText
              as="h1"
              delay={0.28}
              stagger={0.06}
              amount={0.4}
              parts={[
                { t: 'Centro' }, { t: 'de' }, { t: 'Terapia' }, { t: 'y' },
                { t: 'Desarrollo' }, { t: 'Crecemos', className: 'cx-grad' },
              ]}
            />
            <p className="cx-anim-3">
              Atención especializada en terapia psicológica, desarrollo personal
              y bienestar emocional. Un equipo humano que te acompaña en tu
              proceso de crecimiento.
            </p>
            <div className="cx-hero-cta cx-anim-4">
              <Link to="/contactanos" className="cx-btn cx-btn-primary">
                Reservar cita <i className="bi bi-arrow-right" />
              </Link>
              <Link
                to="/servicios"
                className="cx-btn cx-btn-ghost cx-btn-circle"
                aria-label="Conoce nuestros servicios"
              >
                <i className="bi bi-arrow-up-right" />
              </Link>
            </div>

            <div className="cx-trust cx-anim-5">
              <span className="cx-trust-ic"><i className="bi bi-emoji-smile-fill" /></span>
              <div>
                <b>+1000 pacientes felices</b>
                <div>
                  <span className="stars">★★★★★</span>{' '}
                  <small>4.9/5 en satisfacción</small>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* =========================== STATS BAND ======================== */}
      <section className="cx-statsband">
        <div className="cx-container">
          <div className="cx-stats">
            {stats.map((s, i) => (
              <Reveal className="cx-stat" key={s.value} delay={0.08 * i}>
                <span className="ic"><i className={`bi ${s.icon}`} /></span>
                <div>
                  <h4>{s.value}</h4>
                  <p>{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ PILARES =========================== */}
      <section className="cx-section cx-section--deco">
        <Decor variant="a" />
        <div className="cx-container">
          <Reveal className="cx-section-head">
            <span className="cx-eyebrow"><i className="bi bi-heart" /> Por qué elegirnos</span>
            <RevealText as="h2" text="Un espacio seguro para tu bienestar" />
            <p>Cuidamos cada detalle para que te sientas acompañado en todo tu proceso.</p>
          </Reveal>
          <div className="cx-features cx-features--tint">
            {pilares.map((f, i) => (
              <Reveal className="cx-feature" key={f.title} delay={0.07 * i} y={18}>
                <span className="ic"><i className={`bi ${f.icon}`} /></span>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ========================== SERVICIOS ========================== */}
      <section className="cx-section cx-section--soft">
        <Decor variant="b" />
        <div className="cx-container">
          <Reveal className="cx-section-head">
            <span className="cx-eyebrow"><i className="bi bi-stars" /> Nuestros servicios</span>
            <RevealText as="h2" text="Servicios Especializados" />
            <p>Accede directamente a la información detallada de cada servicio.</p>
          </Reveal>

          <div className="cx-tabs">
            <div className="cx-tabs-inner">
              <button
                className={`cx-tab ${activeTab === 'infantil' ? 'on' : ''}`}
                onClick={() => setActiveTab('infantil')}
              >
                Infantil y Adolescentes
              </button>
              <button
                className={`cx-tab ${activeTab === 'adultos' ? 'on' : ''}`}
                onClick={() => setActiveTab('adultos')}
              >
                Adultos
              </button>
            </div>
          </div>

          <div className="cx-cards cx-cards--tint" key={activeTab}>
            {servicios[activeTab].map((srv, i) => (
              <Reveal className="cx-card" key={srv.title} delay={0.06 * i} y={18}>
                <span className="ic"><i className={`bi ${srv.icon}`} /></span>
                <h3>{srv.title}</h3>
                <p>{srv.desc}</p>
                <Link to={srv.to} className="cx-card-link">
                  Ver detalles <i className="bi bi-arrow-right" />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ========================= CÓMO FUNCIONA ======================= */}
      <section className="cx-section cx-section--deco cx-section--deco-r">
        <Decor variant="c" />
        <div className="cx-container">
          <Reveal className="cx-section-head">
            <span className="cx-eyebrow"><i className="bi bi-signpost-2" /> Fácil y cercano</span>
            <RevealText as="h2" text="¿Cómo empezamos?" />
            <p>Tres pasos simples para dar el primer paso hacia tu bienestar.</p>
          </Reveal>
          <div className="cx-steps">
            {pasos.map((s, i) => (
              <Reveal className="cx-step" key={s.n} delay={0.08 * i} y={18}>
                <span className="num">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ======================= RECOMENDACIONES ======================= */}
      <section className="cx-section cx-section--deco">
        <Decor variant="a" />
        <div className="cx-container">
          <Reveal className="cx-section-head">
            <span className="cx-eyebrow"><i className="bi bi-play-btn" /> Contenido educativo</span>
            <RevealText as="h2" text="Recomendaciones" />
            <p>Contenido educativo y consejos profesionales para padres y pacientes.</p>
          </Reveal>

          <div className="cx-cards">
            {recomendaciones.map((v, i) => (
              <Reveal key={v.title} delay={0.08 * i} y={20}>
                <a className="cx-vid" href={v.url} target="_blank" rel="noopener noreferrer">
                  <div className="cx-vid-thumb">
                    <img
                      src={ytThumb(v.url)}
                      alt={v.title}
                      loading="lazy"
                      onError={(e) => { e.target.onerror = null; e.target.src = 'videologo.png'; }}
                    />
                    <span className="cx-vid-play"><span><i className="bi bi-play-fill" /></span></span>
                  </div>
                  <div className="cx-vid-body">
                    <span className="cx-vid-tag">{v.tag}</span>
                    <h3>{v.title}</h3>
                    <p>{v.desc}</p>
                    <span className="cx-card-link">
                      Ver video <i className="bi bi-arrow-right" />
                    </span>
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* =========================== ALIANZAS =========================== */}
      <section className="cx-section cx-section--alt cx-alianzas">
        <div className="cx-container">
          <Reveal className="cx-section-head">
            <span className="cx-eyebrow"><i className="bi bi-patch-check-fill" /> Confían en nosotros</span>
            <RevealText as="h2" text="Alianzas y Convenios" />
            <p>
              Gracias a nuestros <strong>convenios con universidades e instituciones</strong>,
              garantizamos <strong>prácticas profesionales y especializaciones</strong> que mejoran
              la formación de nuestro equipo, brindando terapias actualizadas y efectivas. Nuestras
              alianzas también permiten una adecuada derivación de nuestros pacientes.
            </p>
          </Reveal>

          <div className="swiper init-swiper" style={{ paddingBottom: '60px' }}>
            <script
              type="application/json"
              className="swiper-config"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  loop: true,
                  speed: 600,
                  autoplay: { delay: 3000 },
                  slidesPerView: 'auto',
                  pagination: { el: '.swiper-pagination', type: 'bullets', clickable: true },
                  breakpoints: {
                    320: { slidesPerView: 1, spaceBetween: 30 },
                    480: { slidesPerView: 2, spaceBetween: 40 },
                    640: { slidesPerView: 3, spaceBetween: 50 },
                    992: { slidesPerView: 4, spaceBetween: 60 },
                    1200: { slidesPerView: 5, spaceBetween: 60 },
                  },
                }),
              }}
            />
            <div className="swiper-wrapper align-items-center" style={{ marginBottom: '40px' }}>
              {convenios.map((convenio) => (
                <div key={convenio.id} className="swiper-slide text-center" style={{ padding: '16px 8px' }}>
                  <div className="cx-logo-card">
                    <img
                      src={convenio.logo_url
                        ? (convenio.logo_url.startsWith('/')
                          ? `${API_BASE_URL}/convenios/logo/${convenio.logo_url.split('/').pop()}`
                          : `${API_BASE_URL}/convenios/logo/${convenio.logo_url}`)
                        : '/assets/img/index/default-logo.webp'}
                      alt={convenio.empresa}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/assets/img/index/default-logo.webp';
                      }}
                    />
                  </div>
                  <h6 style={{ fontSize: '0.9rem', lineHeight: 1.3, margin: '12px 0 0' }}>
                    {convenio.empresa}
                  </h6>
                </div>
              ))}
            </div>
            <div className="swiper-pagination" />
          </div>
        </div>
      </section>

      {/* =========================== CTA FINAL ========================== */}
      <section className="cx-section">
        <div className="cx-container">
          <Reveal className="cx-cta-band" y={30}>
            <span className="cx-cta-glow" aria-hidden="true" />
            <span className="cx-cta-glow cx-cta-glow--2" aria-hidden="true" />
            <div className="cx-cta-content">
              <span className="cx-cta-eyebrow"><i className="bi bi-stars" /> Empieza hoy</span>
              <RevealText as="h2" text="Da el primer paso hacia tu bienestar" />
              <p>Estamos listos para acompañarte. Reserva tu cita hoy y comencemos juntos este camino.</p>
              <div className="cx-cta-actions">
                <Link to="/contactanos" className="cx-btn cx-cta-btn">
                  <span>Reservar cita</span>
                  <i className="bi bi-arrow-right" />
                </Link>
                <Link to="/servicios" className="cx-btn cx-cta-btn-ghost">
                  Conoce los servicios
                </Link>
              </div>
              <div className="cx-cta-note">
                <span><i className="bi bi-shield-check" /> Atención cálida y profesional</span>
                <span><i className="bi bi-clock-history" /> Respuesta rápida</span>
                <span><i className="bi bi-emoji-smile" /> Sin compromiso</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
