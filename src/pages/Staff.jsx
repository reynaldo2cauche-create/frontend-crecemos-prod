import React from 'react'
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import  {initializePageScripts}  from '../utils/initScripts';
import { useState } from 'react';


export const Staff = () => {


 useEffect(() => {
        initializePageScripts();
      }, []); 
const specialists = [
    {
      id: '1',
      img: 'assets/img/servicios/merlin.jpg',
      name: 'Lic. Merlin Fernandez',
      title: 'Terapeuta de Lenguaje',
      specialties: 'Especialista en trastornos del habla y lenguaje, estimulación temprana del lenguaje, y rehabilitación de la comunicación en niños y adultos.',
      services: [
        'Terapia de Lenguaje Infantil',
        'Intervención en casos de TEA con enfoque comunicativo',
        'Entrenamiento en articulación y pronunciación',
        'Desarrollo de vocabulario y frases funcionales',
        'Orientación a padres para reforzar el lenguaje en casa'
      ],   
      areas: ['Área Infantil y Adolescentes', 'Área Adultos']
    },
    {
      id: '5',
      img: 'assets/img/servicios/terapeutica-cherQui.jpg',
      name: 'Lic. Cherly Quiquia',
      title: 'Psicóloga Infantil y Terapeuta de Aprendizaje',
      specialties: 'Experta en psicología infantil, dificultades de aprendizaje, problemas de atención y concentración, desarrollo de estrategias educativas personalizadas.',
      services: ['Psicología', 'Terapia de Aprendizaje', 'Evaluación Psicológica para Colegio'],
      areas: ['Área Infantil y Adolescentes']
    },
    {
      id: '7',
      img: 'assets/img/servicios/jhoselyn.png',
      name: 'Lic. Jhoselyn Quispe',
      title: 'Psicóloga Infantil y Terapeuta de Aprendizaje',
      specialties: 'Experta en psicología infantil, trastornos del neurodesarrollo, dificultades de aprendizaje y evaluaciones psicológicas para instituciones educativas.',
      services: ['Psicología', 'Terapia de Aprendizaje', 'Evaluación Psicológica para Colegio'],
      areas: ['Área Infantil y Adolescentes']
    },
    {
      id: '10',
      img: 'assets/img/servicios/Lic. Giselle (1).png',
      name: 'Lic. Giselle Burgos',
      title: 'Especialista en Psicología Clínica para Adolescentes y Adultos',
      specialties: 'Enfocada en el abordaje de ansiedad, depresión, autoestima, regulación emocional y dificultades en las relaciones interpersonales. Su acompañamiento busca fortalecer el bienestar emocional, la toma de decisiones y el desarrollo personal.',
      services: [
        'Terapia para adolescentes',
        'Terapia para adultos',
        'Manejo de ansiedad y estrés',
        'Apoyo en duelo y rupturas',
        'Fortalecimiento de autoestima',
        'Test y orientación vocacional'
      ],
      areas: ['Adolescentes y Adultos']
    }
  ];

  const [filteredSpecialists, setFilteredSpecialists] = useState(specialists);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase().trim();
    setSearchTerm(value);
    
    if (value === '') {
      setFilteredSpecialists(specialists);
    } else {
      const filtered = specialists.filter(specialist => 
        specialist.name.toLowerCase().includes(value) ||
        specialist.title.toLowerCase().includes(value) ||
        specialist.services.some(service => service.toLowerCase().includes(value))
      );
      setFilteredSpecialists(filtered);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setFilteredSpecialists(specialists);
  };

  const handleImageError = (e) => {
    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjhCQkQ5Ii8+CjxjaXJjbGUgY3g9Ijc1IiBjeT0iNjAiIHI9IjI1IiBmaWxsPSIjRTkxRTYzIi8+CjxwYXRoIGQ9Ik0yNSAxMjVDMjUgMTA1IDQ1IDkwIDc1IDkwUzEyNSAxMDUgMTI1IDEyNVYxNTBIMjVWMTI1WiIgZmlsbD0iI0U5MUU2MyIvPgo8L3N2Zz4K';
  };


  

  return (
    <main className="main">
      <section className="specialists-hero" data-aos="fade">
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <h1 className="mb-4" id="titulo">Nuestros Especialistas</h1>
              <p className="page-subtitle">
                Conoce a nuestro equipo de profesionales altamente calificados y comprometidos con tu bienestar. 
                Cada especialista aporta años de experiencia y dedicación para brindarte la mejor atención.
              </p>
              <nav className="breadcrumbs">
              <ol>
                <li><a href="/">Inicio</a></li>
                <li className="current">Especialistas</li>
              </ol>
            </nav>
            </div>
          </div>
        </div>
      </section>

      <section className="search-section">
        <div className="container">
          <div className="search-box" data-aos="fade-up">
            <i className="bi bi-search search-icon"></i>
            <input 
              type="text" 
              id="searchInput" 
              className="search-input" 
              placeholder="Buscar por nombre o especialidad..."
              value={searchTerm}
              onChange={handleSearch}
            />
            <button 
              id="clearSearch" 
              className="clear-search" 
              style={{ display: searchTerm ? 'block' : 'none' }}
              onClick={clearSearch}
            >
              <i className="bi bi-x"></i>
            </button>
          </div>
        </div>
      </section>

      <section className="specialists-section section light-background">
        <div className="container">
          <div id="specialistsContainer" className="row g-4">
            {filteredSpecialists.map((specialist, index) => (
              <div 
                key={specialist.id} 
                className="col-lg-4 col-md-6 specialist-item fade-in" 
                data-aos="fade-up" 
                data-aos-delay={(index % 3) * 100 + 100}
              >
                <div className="specialist-card">
                  <div className="specialist-image">
                    <img 
                      src={specialist.img} 
                      alt={specialist.name}
                      onError={handleImageError}
                    />
                  </div>
                  <h4 className="specialist-name">{specialist.name}</h4>
                  <p className="specialist-title">{specialist.title}</p>
                  <p className="specialist-specialties">{specialist.specialties}</p>
                  
                  <div className="specialist-services">
                    <h6>Servicios:</h6>
                    {specialist.services.map((service, idx) => (
                      <span key={idx} className="service-tag">{service}</span>
                    ))}
                  </div>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <h6 style={{ 
                      color: 'var(--accent-color)', 
                      fontWeight: 600, 
                      marginBottom: '8px', 
                      fontSize: '0.9rem' 
                    }}>
                      Áreas de Atención:
                    </h6>
                    <p style={{ 
                      color: 'var(--default-color)', 
                      fontSize: '0.85rem', 
                      margin: 0, 
                      lineHeight: 1.4 
                    }}>
                      {specialist.areas.join(' • ')}
                    </p>
                  </div>
                  
                  <a href="contactanos" className="contact-specialist">
                    <i className="bi bi-calendar-check"></i>
                    Agendar Cita
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div 
            id="noResults" 
            className="no-results" 
            style={{ display: filteredSpecialists.length === 0 ? 'block' : 'none' }}
          >
            <i className="bi bi-search"></i>
            <h4>No se encontraron especialistas</h4>
            <p>Intenta con otros términos de búsqueda</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center" data-aos="fade-up">
              <div className="cta-content">
                <h3 className="mb-4">¿Listo para comenzar tu proceso terapéutico?</h3>
                <p className="mb-4">
                  Nuestro equipo de especialistas está preparado para acompañarte en tu camino hacia el bienestar. 
                  Agenda tu cita hoy mismo y da el primer paso hacia una mejor calidad de vida.
                </p>
                <div className="cta-buttons d-flex justify-content-center gap-3">
                  <a href="contactanos" className="btn-custom">Agendar Cita</a>
                  <a href="servicios" className="btn-custom-outline">Ver Servicios</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
