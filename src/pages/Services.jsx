import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { initializePageScripts } from '../utils/initScripts';
import Reveal from '../components/public/Reveal';
import RevealText from '../components/public/RevealText';
import Decor from '../components/public/Decor';

const serviciosInfantil = [
  {
    icon: 'bi-chat-dots',
    titulo: 'Terapia de Lenguaje',
    descripcion: 'Terapias especializadas para mejorar el habla, lenguaje y comunicación en cada etapa, con profesionales altamente calificados.',
    caracteristicas: [
      'Tratamiento de trastornos del habla',
      'Terapia del lenguaje receptivo y expresivo',
      'Rehabilitación de trastornos de comunicación',
      'Estimulación temprana del lenguaje',
      'Apoyo en TEA, TDAH y Síndrome de Down',
    ],
    link: 'infantil-terapia-lenguaje',
  },
  {
    icon: 'bi-person-workspace',
    titulo: 'Terapia Ocupacional',
    descripcion: 'Favorecemos la autonomía y el desarrollo de habilidades motoras, sociales y de vida diaria en niños y adolescentes.',
    caracteristicas: [
      'Terapia de Integración Sensorial',
      'Rehabilitación motriz fina y gruesa',
      'Entrenamiento en habilidades de vida diaria',
      'Habilidades sociales y adaptativas',
      'Apoyo en TEA, TDAH y trastornos del desarrollo',
    ],
    link: 'infantil-terapia-ocupacional',
  },
  {
    icon: 'bi-book',
    titulo: 'Terapia de Aprendizaje',
    descripcion: 'Estrategias y actividades para mejorar la comunicación, la memoria y las habilidades de aprendizaje en niños y adolescentes.',
    caracteristicas: [
      'Estrategias para atención y concentración',
      'Estimulación de memoria y razonamiento',
      'Desarrollo de habilidades de lectoescritura',
      'Técnicas para el aprendizaje autónomo',
      'Apoyo en bajo rendimiento escolar',
    ],
    link: 'infantil-terapia-aprendizaje',
  },
  {
    icon: 'bi-heart',
    titulo: 'Psicología Infantil',
    descripcion: 'Apoyo emocional y conductual a niños y adolescentes, favoreciendo su desarrollo integral, autoestima y bienestar.',
    caracteristicas: [
      'Terapia Cognitivo-Conductual (TCC)',
      'Terapia de juego',
      'Intervención en problemas de aprendizaje',
      'Orientación y apoyo familiar',
      'Apoyo en TEA, TDAH y gestión emocional',
    ],
    link: 'infantil-psicologia-infantil',
  },
  {
    icon: 'bi-clipboard-data',
    titulo: 'Evaluación Psicológica para el Colegio',
    descripcion: 'Evaluaciones integrales del desarrollo cognitivo, emocional, social y escolar para el ingreso o seguimiento académico.',
    caracteristicas: [
      'Perfil integral del desarrollo infantil',
      'Evaluación cognitiva y emocional',
      'Aprestamiento escolar',
      'Informes detallados',
      'Para niños de 4 a 17 años',
    ],
    link: 'infantil-evaluacion-psicologica-colegio',
  },
  {
    icon: 'bi-compass',
    titulo: 'Orientación Vocacional',
    descripcion: 'Te ayudamos a identificar tus habilidades, intereses y valores para elegir la carrera más acorde a tu perfil y metas.',
    caracteristicas: [
      'Evaluaciones psicométricas y test vocacionales',
      'Análisis de intereses y aptitudes',
      'Asesoramiento individualizado',
      'Información del campo laboral',
      'Para estudiantes y cambio de carrera',
    ],
    link: 'infantil-orientacion-vocacional',
  },
];

const serviciosAdultos = [
  {
    icon: 'bi-person-check',
    titulo: 'Psicoterapia Individual',
    descripcion: 'Un espacio seguro y confidencial para explorar tus emociones, pensamientos y conductas, fortaleciendo tu bienestar.',
    caracteristicas: [
      'Manejo de ansiedad, estrés y depresión',
      'Desarrollo de autoestima y confianza',
      'Procesos de duelo y cambios vitales',
      'Sesiones presenciales y virtuales',
      'Acompañamiento en crecimiento personal',
    ],
    link: 'adulto-psicologia-individual',
  },
  {
    icon: 'bi-heart-fill',
    titulo: 'Terapia de Pareja',
    descripcion: 'Acompañamos a las parejas a mejorar su comunicación, fortalecer la confianza y resolver conflictos.',
    caracteristicas: [
      'Mejora de comunicación y resolución de conflictos',
      'Fortalecimiento de confianza y conexión',
      'Manejo de infidelidad y crisis',
      'Sesiones presenciales y virtuales',
      'Técnicas de convivencia saludable',
    ],
    link: 'adulto-terapia-pareja',
  },
  {
    icon: 'bi-people-fill',
    titulo: 'Terapia Familiar',
    descripcion: 'Un espacio seguro para familias con dificultades en la comunicación o conflictos internos, para fortalecer los lazos.',
    caracteristicas: [
      'Mejora de comunicación familiar',
      'Resolución de conflictos entre miembros',
      'Apoyo en cambios familiares importantes',
      'Sesiones presenciales y virtuales',
      'Fortalecimiento de lazos y empatía',
    ],
    link: 'adulto-terapia-familiar',
  },
  {
    icon: 'bi-mic',
    titulo: 'Terapia de Lenguaje',
    descripcion: 'Para personas con dificultades de comunicación por trastornos neurológicos, ACV o enfermedades degenerativas.',
    caracteristicas: [
      'Rehabilitación del habla y comunicación',
      'Trastornos por ACV o traumatismos',
      'Problemas de deglución y disfagia',
      'Sesiones presenciales y virtuales',
      'Recuperación de fluidez y articulación',
    ],
    link: 'adulto-terapia-lenguaje',
  },
  {
    icon: 'bi-mortarboard',
    titulo: 'Evaluación Psicológica para Universidad',
    descripcion: 'Evaluación psicológica para ingreso o permanencia universitaria, con informes que cumplen los requisitos institucionales.',
    caracteristicas: [
      'Entrevista clínica especializada',
      'Pruebas psicológicas válidas y actualizadas',
      'Informe con validez oficial',
      'Recomendaciones personalizadas',
      'Acompañamiento durante todo el proceso',
    ],
    link: 'adulto-evaluacion-psicologica-universidad',
  },
  {
    icon: 'bi-heart-pulse',
    titulo: 'Obstetricia',
    descripcion: 'Acompañamiento integral para la mujer, la gestante y el desarrollo temprano del bebé, en embarazo y posparto.',
    caracteristicas: [
      'Control y orientación durante el embarazo',
      'Psicoprofilaxis y estimulación prenatal',
      'Consejería en lactancia materna',
      'Cuidados y seguimiento del recién nacido',
      'Consejería en salud sexual y reproductiva',
    ],
    link: 'adulto-obstetricia',
  },
];

const procesoPasos = [
  { n: '01', title: 'Agenda tu cita', desc: 'Escríbenos y reserva tu primera consulta sin complicaciones.' },
  { n: '02', title: 'Evaluación inicial', desc: 'Conocemos tu caso y definimos objetivos claros contigo.' },
  { n: '03', title: 'Plan personalizado', desc: 'Diseñamos la terapia a la medida de tu necesidad.' },
  { n: '04', title: 'Terapia y seguimiento', desc: 'Iniciamos el proceso con acompañamiento cercano y continuo.' },
];

const faqs = [
  { q: '¿Cómo agendo una cita?', a: 'Puedes escribirnos por WhatsApp o desde la sección Contacto. Te responderemos para coordinar día, hora y modalidad según tu disponibilidad.' },
  { q: '¿Atienden de forma virtual?', a: 'Sí. Varias de nuestras terapias se realizan por videollamada con la misma calidad profesional. Coordinamos contigo la plataforma y el horario.' },
  { q: '¿Desde qué edad atienden?', a: 'Atendemos desde los 2 años en el área infantil y adolescente, y desde los 18 años en el área de adultos.' },
  { q: '¿Tienen convenios o descuentos?', a: 'Contamos con convenios con distintas instituciones. Escríbenos y con gusto te informamos los beneficios vigentes para tu caso.' },
  { q: '¿Cuánto dura cada sesión?', a: 'La duración depende del tipo de terapia, pero en general cada sesión dura entre 45 y 60 minutos. En la evaluación inicial te damos el detalle.' },
];

const AREAS = {
  'infantil-adolescentes': {
    titulo: 'Área Infantil y Adolescentes',
    intro: 'Dirigido a personas de 2 a 17 años. Atención especializada para un desarrollo integral.',
    data: serviciosInfantil,
  },
  adultos: {
    titulo: 'Área Adultos',
    intro: 'Dirigido a personas de 18 años en adelante. Tratamiento integral para cada etapa de la vida adulta.',
    data: serviciosAdultos,
  },
};

const Servicios = () => {
  const [activeTab, setActiveTab] = useState('infantil-adolescentes');
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    initializePageScripts();
  }, []);

  const area = AREAS[activeTab];

  return (
    <main className="cx-page">
      {/* ============================ ENCABEZADO =========================== */}
      <section className="cx-subhero">
        <Decor variant="a" />
        <div className="cx-container">
          <Reveal className="cx-subhero-inner">
            <span className="cx-eyebrow"><i className="bi bi-stars" /> Lo que ofrecemos</span>
            <RevealText as="h1" text="Nuestros Servicios" />
            <p>Atención especializada y personalizada para cada etapa de la vida, con profesionales altamente calificados.</p>
            <nav className="cx-breadcrumb">
              <Link to="/">Inicio</Link>
              <i className="bi bi-chevron-right" />
              <span>Servicios</span>
            </nav>
          </Reveal>
        </div>
      </section>

      {/* ============================= SERVICIOS =========================== */}
      <section className="cx-section cx-section--deco">
        <Decor variant="b" />
        <div className="cx-container">
          {/* Tabs de área */}
          <div className="cx-tabs">
            <div className="cx-tabs-inner">
              <button
                className={`cx-tab ${activeTab === 'infantil-adolescentes' ? 'on' : ''}`}
                onClick={() => setActiveTab('infantil-adolescentes')}
              >
                <i className="bi bi-people" /> Infantil y Adolescentes
              </button>
              <button
                className={`cx-tab ${activeTab === 'adultos' ? 'on' : ''}`}
                onClick={() => setActiveTab('adultos')}
              >
                <i className="bi bi-person-check" /> Adultos
              </button>
            </div>
          </div>

          {/* Intro del área */}
          <Reveal className="cx-section-head" key={`${activeTab}-head`}>
            <RevealText as="h2" text={area.titulo} />
            <p>{area.intro}</p>
          </Reveal>

          {/* Tarjetas de servicio */}
          <div className="cx-cards cx-cards--tint" key={activeTab}>
            {area.data.map((srv, i) => (
              <Reveal className="cx-card cx-scard" key={srv.titulo} delay={0.05 * i} y={20}>
                <span className="ic"><i className={`bi ${srv.icon}`} /></span>
                <h3>{srv.titulo}</h3>
                <p>{srv.descripcion}</p>
                <ul className="cx-slist">
                  {srv.caracteristicas.map((c) => (
                    <li key={c}><i className="bi bi-check-circle-fill" /><span>{c}</span></li>
                  ))}
                </ul>
                <Link to={`/${srv.link}`} className="cx-card-link">
                  Más información <i className="bi bi-arrow-right" />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== PROCESO =========================== */}
      <section className="cx-section cx-section--brand">
        <Decor variant="a" />
        <div className="cx-container">
          <Reveal className="cx-section-head">
            <span className="cx-eyebrow"><i className="bi bi-signpost-2" /> Paso a paso</span>
            <RevealText as="h2" text="Cómo trabajamos contigo" />
            <p>Un proceso claro y humano, desde tu primer mensaje hasta tu progreso.</p>
          </Reveal>
          <div className="cx-steps">
            {procesoPasos.map((s, i) => (
              <Reveal className="cx-step" key={s.n} delay={0.08 * i} y={18}>
                <span className="num">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================================ FAQ ============================= */}
      <section className="cx-section cx-section--deco cx-section--deco-r">
        <Decor variant="b" />
        <div className="cx-container">
          <Reveal className="cx-section-head">
            <span className="cx-eyebrow"><i className="bi bi-patch-question" /> Dudas frecuentes</span>
            <RevealText as="h2" text="Preguntas frecuentes" />
          </Reveal>
          <div className="cx-faq">
            {faqs.map((f, i) => (
              <Reveal className={`cx-faq-item ${openFaq === i ? 'on' : ''}`} key={f.q} delay={0.05 * i} y={14}>
                <button
                  className="cx-faq-q"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
                  <span>{f.q}</span>
                  <i className="bi bi-chevron-down" />
                </button>
                <div className="cx-faq-a"><p>{f.a}</p></div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== CTA FINAL ========================= */}
      <section className="cx-section">
        <div className="cx-container">
          <Reveal className="cx-cta-band" y={30}>
            <span className="cx-cta-glow" aria-hidden="true" />
            <span className="cx-cta-glow cx-cta-glow--2" aria-hidden="true" />
            <div className="cx-cta-content">
              <span className="cx-cta-eyebrow"><i className="bi bi-stars" /> ¿No sabes cuál elegir?</span>
              <RevealText as="h2" text="Te ayudamos a encontrar la terapia ideal" />
              <p>Escríbenos y un profesional te orientará según tu caso, sin compromiso.</p>
              <div className="cx-cta-actions">
                <Link to="/contactanos" className="cx-btn cx-cta-btn">
                  <span>Reservar cita</span>
                  <i className="bi bi-arrow-right" />
                </Link>
                <Link to="/nosotros" className="cx-btn cx-cta-btn-ghost">
                  Conócenos
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
};

export default Servicios;
