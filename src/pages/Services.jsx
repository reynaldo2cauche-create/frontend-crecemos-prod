import React, { useState } from 'react';
import { Container, Row, Col, Nav, Tab } from 'react-bootstrap';
import { initializePageScripts } from '../utils/initScripts';

const Servicios = () => {
  const [activeTab, setActiveTab] = useState('infantil-adolescentes');
  useState(() => {
    initializePageScripts();
  }
  ,[]);

  const serviciosInfantil = [
    {
      icon: 'bi-chat-dots',
      titulo: 'Terapia de Lenguaje',
      descripcion: 'Ofrecemos terapias especializadas para mejorar el habla, lenguaje y comunicación en cada etapa de la vida con profesionales altamente calificados.',
      caracteristicas: [
        'Tratamiento de trastornos del habla',
        'Terapia del lenguaje receptivo y expresivo',
        'Rehabilitación de trastornos de comunicación',
        'Estimulación temprana del lenguaje',
        'Apoyo en TEA, TDAH y Síndrome de Down'
      ],
      link: 'infantil-terapia-lenguaje'
    },
    {
      icon: 'bi-person-workspace',
      titulo: 'Terapia Ocupacional',
      descripcion: 'Favorecemos la autonomía y el desarrollo de habilidades motoras, sociales y de vida diaria en niños, adolescentes y adultos, guiados por profesionales especializados.',
      caracteristicas: [
        'Terapia de Integración Sensorial',
        'Rehabilitación Motriz Fina y Gruesa',
        'Entrenamiento en Habilidades de Vida Diaria',
        'Habilidades Sociales y Adaptativas',
        'Apoyo en TEA, TDAH y trastornos del desarrollo'
      ],
      link: 'infantil-terapia-ocupacional'
    },
    {
      icon: 'bi-book',
      titulo: 'Terapia de Aprendizaje',
      descripcion: 'Ofrecemos estrategias y actividades para mejorar la comunicación, la memoria y las habilidades de aprendizaje en niños y adolescentes.',
      caracteristicas: [
        'Estrategias para atención y concentración',
        'Estimulación de memoria y razonamiento',
        'Desarrollo de habilidades de lectoescritura',
        'Técnicas para el aprendizaje autónomo',
        'Apoyo en bajo rendimiento escolar'
      ],
      link: 'infantil-terapia-aprendizaje'
    },
    {
      icon: 'bi-heart',
      titulo: 'Psicología Infantil',
      descripcion: 'Brindamos apoyo emocional y conductual a niños y adolescentes, favoreciendo su desarrollo integral, autoestima y bienestar psicológico, junto a sus familias.',
      caracteristicas: [
        'Terapia Cognitivo-Conductual (TCC)',
        'Terapia de Juego',
        'Intervención en Problemas de Aprendizaje',
        'Orientación y Apoyo Familiar',
        'Apoyo en TEA, TDAH y gestión emocional'
      ],
      link: 'infantil-psicologia-infantil'
    },
    {
      icon: 'bi-clipboard-data',
      titulo: 'Evaluación Psicológica para el Colegio',
      descripcion: 'Ofrecemos evaluaciones integrales del desarrollo cognitivo, emocional, social y escolar de niños y adolescentes para su ingreso o seguimiento académico.',
      caracteristicas: [
        'Perfil Integral del Desarrollo Infantil',
        'Evaluación Cognitiva y Emocional',
        'Aprestamiento Escolar',
        'Informes Detallados',
        'Para niños de 4 a 17 años'
      ],
      link: 'infantil-evaluacion-psicologica-colegio'
    },
    {
      icon: 'bi-compass',
      titulo: 'Orientación Vocacional',
      descripcion: 'Te ayudamos a identificar tus habilidades, intereses y valores personales para elegir la carrera profesional más acorde a tu perfil y metas futuras.',
      caracteristicas: [
        'Evaluaciones psicométricas y test vocacionales',
        'Análisis de intereses y aptitudes',
        'Asesoramiento individualizado',
        'Información del campo laboral',
        'Para estudiantes y cambio de carrera'
      ],
      link: 'infantil-orientacion-vocacional'
    }
  ];

  const serviciosAdultos = [
    {
      icon: 'bi-person-check',
      titulo: 'Psicoterapia Individual',
      descripcion: 'Brindamos un espacio seguro y confidencial para que explores tus emociones, pensamientos y conductas, fortaleciendo tu bienestar personal con psicólogos especializados.',
      caracteristicas: [
        'Manejo de ansiedad, estrés y depresión',
        'Desarrollo de autoestima y confianza',
        'Procesos de duelo y cambios vitales',
        'Sesiones presenciales y virtuales',
        'Acompañamiento en crecimiento personal'
      ],
      link: 'adulto-psicologia-individual'
    },
    {
      icon: 'bi-heart-fill',
      titulo: 'Terapia de Pareja',
      descripcion: 'Acompañamos a las parejas en la mejora de su comunicación, el fortalecimiento de la confianza y la resolución de conflictos, promoviendo relaciones saludables y duraderas.',
      caracteristicas: [
        'Mejora de comunicación y resolución de conflictos',
        'Fortalecimiento de confianza y conexión emocional',
        'Manejo de infidelidad y crisis relacionales',
        'Sesiones presenciales y virtuales',
        'Técnicas efectivas de convivencia saludable'
      ],
      link: 'adulto-terapia-pareja'
    },
    {
      icon: 'bi-people-fill',
      titulo: 'Terapia Familiar',
      descripcion: 'Ofrecemos un espacio seguro para familias con dificultades en la comunicación o conflictos internos. Buscamos fortalecer los lazos y promover una convivencia armoniosa.',
      caracteristicas: [
        'Mejora de comunicación familiar',
        'Resolución de conflictos entre miembros',
        'Apoyo en cambios familiares importantes',
        'Sesiones presenciales y virtuales',
        'Fortalecimiento de lazos y empatía familiar'
      ],
      link: 'adulto-terapia-familiar'
    },
    {
      icon: 'bi-mic',
      titulo: 'Terapia de Lenguaje',
      descripcion: 'Dirigida a personas que presentan dificultades en la comunicación por trastornos neurológicos, accidentes cerebrovasculares, enfermedades degenerativas o problemas adquiridos.',
      caracteristicas: [
        'Rehabilitación del habla y comunicación',
        'Trastornos por ACV o traumatismos',
        'Problemas de deglución y disfagia',
        'Sesiones presenciales y virtuales',
        'Recuperación de fluidez y articulación'
      ],
      link: 'adulto-terapia-lenguaje'
    },
    {
      icon: 'bi-mortarboard',
      titulo: 'Evaluación Psicológica para Universidad',
      descripcion: 'Servicio especializado de evaluación psicológica para ingreso o permanencia universitaria, con informes profesionales que cumplen los requerimientos institucionales.',
      caracteristicas: [
        'Entrevista clínica especializada',
        'Pruebas psicológicas válidas y actualizadas',
        'Informe psicológico con validez oficial',
        'Recomendaciones personalizadas',
        'Acompañamiento durante todo el proceso'
      ],
      link: 'adulto-evaluacion-psicologica-universidad'
    },
    {
      icon: 'bi-heart-pulse',
      titulo: 'Obstetricia',
      descripcion: 'Acompañamiento integral para la mujer, la gestante y el desarrollo temprano del bebé, con énfasis en el embarazo, el posparto y los primeros meses de vida.',
      caracteristicas: [
        'Control y orientación durante el embarazo',
        'Psicoprofilaxis obstétrica y estimulación prenatal',
        'Consejería en lactancia materna',
        'Cuidados del recién nacido y seguimiento del bebé',
        'Consejería en salud sexual y reproductiva'
      ],
      link: 'adulto-obstetricia'
    },
  ];

  const ServiceCard = ({ servicio }) => (
    <Col lg={4} md={6} className="mb-4" data-aos="zoom-in" data-aos-delay="100">
      <div className="service-detail-card">
        <div className="service-icon">
          <i className={`bi ${servicio.icon}`}></i>
        </div>
        <h4>{servicio.titulo}</h4>
        <p>{servicio.descripcion}</p>
        <ul className="service-features">
          {servicio.caracteristicas.map((caracteristica, idx) => (
            <li key={idx}>
              <i className="bi bi-check-circle-fill"></i> {caracteristica}
            </li>
          ))}
        </ul>
        <a href={servicio.link} className="btn-service">Más Información</a>
      </div>
    </Col>
  );

  return (
    <main className="main">
      {/* Page Title */}
      <div className="page-title light-background" data-aos="fade">
        <Container>
          <h1>Nuestros Servicios</h1>
          <p className="page-subtitle">
            Ofrecemos atención especializada y personalizada para cada etapa de la vida con profesionales altamente calificados
          </p>
          <nav className="breadcrumbs">
            <ol>
              <li><a href="index.html">Inicio</a></li>
              <li className="current">Servicios</li>
            </ol>
          </nav>
        </Container>
      </div>

      {/* Services Section */}
      <section id="services" className="section">
        <Container>
          {/* Services Navigation Tabs */}
          <div className="text-center mb-5">
            <Nav variant="tabs" className="services-nav-tabs justify-content-center" data-aos="fade-up" data-aos-delay="100">
              <Nav.Item>
                <Nav.Link 
                  active={activeTab === 'infantil-adolescentes'}
                  onClick={() => setActiveTab('infantil-adolescentes')}
                >
                  <i className="bi bi-people"></i>
                  Área Infantil y Adolescentes
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link 
                  active={activeTab === 'adultos'}
                  onClick={() => setActiveTab('adultos')}
                >
                  <i className="bi bi-person-check"></i>
                  Área Adultos
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </div>

          {/* Tab Content */}
          <Tab.Container activeKey={activeTab}>
            <Tab.Content data-aos="fade-up" data-aos-delay="200">
              {/* Área Infantil y Adolescentes */}
              <Tab.Pane eventKey="infantil-adolescentes">
                <div className="text-center mb-5">
                  <h2>Área Infantil y Adolescentes</h2>
                  <p>Dirigido para personas de 2 a 17 años. Brindamos atención especializada para el desarrollo integral.</p>
                </div>
                
                <Row className="g-4">
                  {serviciosInfantil.map((servicio, idx) => (
                    <ServiceCard key={idx} servicio={servicio} />
                  ))}
                </Row>
              </Tab.Pane>

              {/* Área Adultos */}
              <Tab.Pane eventKey="adultos">
                <div className="text-center mb-5">
                  <h2>Área Adultos</h2>
                  <p>Dirigido para personas de 18 años en adelante. Ofrecemos tratamiento integral para todas las etapas de la vida adulta.</p>
                </div>
                
                <Row className="g-4">
                  {serviciosAdultos.map((servicio, idx) => (
                    <ServiceCard key={idx} servicio={servicio} />
                  ))}
                </Row>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Container>
      </section>
    </main>
  );
};

export default Servicios;