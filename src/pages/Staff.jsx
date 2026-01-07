import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { initializePageScripts } from '../utils/initScripts';
import { getStaffActivos } from '../services/staffService';
import { getServiciosByTrabajador } from '../services/trabajadorServicioService';
import { API_BASE_URL } from '../services/api';

export const Staff = () => {  
  const [specialists, setSpecialists] = useState([]);
  const [filteredSpecialists, setFilteredSpecialists] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializePageScripts();
    cargarStaff();
  }, []);

  // ✅ Función para cargar SOLO servicios ACTIVOS del trabajador
  const cargarServiciosTrabajador = async (trabajadorId) => {
    try {
      const servicios = await getServiciosByTrabajador(trabajadorId);
      // ✅ Agrupar por nombre para evitar duplicados (mismo servicio en diferentes áreas)
      const serviciosUnicos = new Map();
      servicios.forEach(s => {
        if (!serviciosUnicos.has(s.nombre)) {
          serviciosUnicos.set(s.nombre, s.nombre);
        }
      });
      return Array.from(serviciosUnicos.values());
    } catch (error) {
      console.error(`Error al cargar servicios del trabajador ${trabajadorId}:`, error);
      return [];
    }
  };

  const cargarStaff = async () => {
    try {
      setLoading(true);
      const data = await getStaffActivos();

      // Transformar los datos del backend al formato esperado por el componente
      const staffFormateado = await Promise.all(
        data.map(async (item) => {
          // Generar URL correcta para la foto
          let imgUrl = 'assets/img/servicios/default-avatar.jpg';
          if (item.foto) {
            const filename = item.foto.split('/').pop();
            imgUrl = `${API_BASE_URL}/staff/foto/${filename}`;
          }

          // ✅ Cargar servicios ACTIVOS específicos de este trabajador
          let serviciosTrabajador = [];
          if (item.trabajador?.id) {
            serviciosTrabajador = await cargarServiciosTrabajador(item.trabajador.id);
          }

          // Si no hay servicios específicos, usar los del staff
          const serviciosMostrar = serviciosTrabajador.length > 0
            ? serviciosTrabajador
            : item.servicios || [];

          // Determinar áreas basadas en los servicios
          const areasSet = new Set();
          serviciosMostrar.forEach(servicio => {
            // Clasificar por nombre del servicio
            if (servicio.toLowerCase().includes('infantil') || 
                servicio.toLowerCase().includes('niño') ||
                servicio.toLowerCase().includes('adolescente')) {
              areasSet.add('Infantil y Adolescentes');
            } else if (servicio.toLowerCase().includes('adulto') ||
                      servicio.toLowerCase().includes('mayores')) {
              areasSet.add('Adultos');
            }
          });

          // Si no se detectaron áreas, usar las del staff o un valor por defecto
          const areas = areasSet.size > 0 
            ? Array.from(areasSet) 
            : item.areas || ['Sin área asignada'];

          return {
            id: item.trabajador?.id?.toString() || item.id.toString(),
            trabajadorId: item.trabajador?.id,
            img: imgUrl,
            name: `${item.trabajador?.nombres || ''} ${item.trabajador?.apellidos || ''}`.trim(),
            title: item.trabajador?.especialidad?.nombre || 
                   item.trabajador?.cargo?.nombre || 
                   item.descripcion_especialidad || 
                   'Terapeuta',
            specialties: item.descripcion_especialidad || 'Profesional de la salud dedicado al bienestar de nuestros pacientes.',
            services: serviciosMostrar,
            areas: areas,
            // Datos adicionales para debug
            _debug: {
              tieneTrabajador: !!item.trabajador,
              trabajadorId: item.trabajador?.id,
              serviciosOriginales: item.servicios,
              serviciosTrabajador: serviciosTrabajador
            }
          };
        })
      );

      console.log('Staff cargado:', staffFormateado);

      // ✅ Eliminar duplicados por trabajadorId (por si acaso el backend no lo hizo)
      const trabajadoresVistos = new Map();
      const staffSinDuplicados = staffFormateado.filter(staff => {
        if (!trabajadoresVistos.has(staff.trabajadorId)) {
          trabajadoresVistos.set(staff.trabajadorId, true);
          return true;
        }
        console.warn('⚠️ Trabajador duplicado detectado:', staff.name, staff.trabajadorId);
        return false;
      });

      console.log('Staff sin duplicados:', staffSinDuplicados);

      setSpecialists(staffSinDuplicados);
      setFilteredSpecialists(staffSinDuplicados);
    } catch (error) {
      console.error('Error al cargar staff:', error);
      setSpecialists([]);
      setFilteredSpecialists([]);
    } finally {
      setLoading(false);
    }
  };

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

  // Función para recargar staff manualmente
  const recargarStaff = () => {
    cargarStaff();
  };

  return (
    <>
       <style>
        {`
          .specialist-card-modern {
            transition: all 0.3s ease;
          }
          .specialist-card-modern:hover {
            transform: translateY(-5px);
          }
          @media (max-width: 768px) {
            .specialist-services-inline {
              flex-wrap: wrap !important;
            }
          }
        `}
      </style>
      
    <main className="main">
      {/* Hero Section Mejorado */}
      <div className="page-title light-background" data-aos="fade">
        <div className="container">
          <h1>Nuestros Especialistas</h1>
          <p className="page-subtitle">
            Conoce a nuestro equipo de profesionales altamente calificados y comprometidos con tu bienestar
          </p>
          <nav className="breadcrumbs">
            <ol>
              <li><a href="/">Inicio</a></li>
              <li className="current">Especialistas</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Stats Section */}
      <section className="stats-section" style={{ padding: '60px 0', background: 'var(--accent-color)' }}>
        <div className="container">
          <div className="row text-center">
            <div className="col-lg-4 col-md-4" data-aos="fade-up" data-aos-delay="100">
              <div style={{ color: 'white' }}>
                <h2 style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '10px' }}>
                  {filteredSpecialists.length}+
                </h2>
                <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>Terapeutas Especializados</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-4" data-aos="fade-up" data-aos-delay="200">
              <div style={{ color: 'white' }}>
                <h2 style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '10px' }}>
                  {specialists.reduce((acc, s) => acc + s.services.length, 0)}+
                </h2>
                <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>Servicios Disponibles</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-4" data-aos="fade-up" data-aos-delay="300">
              <div style={{ color: 'white' }}>
                <h2 style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '10px' }}>8+</h2>
                <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>Años de Experiencia</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section Mejorada */}
      <section className="search-section" style={{ padding: '40px 0', background: '#f8f9fa' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="search-box" data-aos="fade-up" style={{
                background: 'white',
                borderRadius: '50px',
                padding: '8px 24px',
                boxShadow: '0 4px 20px rgba(194, 99, 249, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <i className="bi bi-search" style={{ fontSize: '1.2rem', color: 'var(--accent-color)' }}></i>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Buscar terapeuta por nombre, especialidad o servicio..."
                  value={searchTerm}
                  onChange={handleSearch}
                  style={{
                    border: 'none',
                    outline: 'none',
                    flex: 1,
                    fontSize: '1rem',
                    padding: '12px 0'
                  }}
                />
                {searchTerm && (
                  <button
                    className="clear-search"
                    onClick={clearSearch}
                    style={{
                      background: '#f0f0f0',
                      border: 'none',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#e0e0e0'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#f0f0f0'}
                  >
                    <i className="bi bi-x" style={{ fontSize: '1.5rem' }}></i>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="specialists-section section light-background">
        <div className="container">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem', color: 'var(--accent-color)' }}>
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="mt-3" style={{ color: '#666' }}>Cargando terapeutas...</p>
            </div>
          ) : (
            <div id="specialistsContainer" className="row g-4">
              {filteredSpecialists.map((specialist, index) => (
                <div
                  key={specialist.id}
                  className="col-lg-6 col-md-6 col-12 specialist-item fade-in"
                  data-aos="fade-up"
                  data-aos-delay={(index % 2) * 100 + 100}
                >
                  {/* Tarjeta Moderna y Compacta */}
                  <div className="specialist-card-modern" style={{
                    background: 'white',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 3px 15px rgba(0,0,0,0.08)',
                    border: '1px solid #f0f0f0',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(194, 99, 249, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 3px 15px rgba(0,0,0,0.08)';
                  }}>

                    {/* Imagen con Badge */}
                    <div style={{ position: 'relative', overflow: 'hidden' }}>
                      <div style={{
                        width: '100%',
                        height: '220px',
                        overflow: 'hidden',
                        background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%)'
                      }}>
                        <img
                          src={specialist.img}
                          alt={specialist.name}
                          onError={handleImageError}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      </div>
                      {/* Badge superior derecha */}
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'var(--accent-color)',
                        color: 'white',
                        padding: '5px 12px',
                        borderRadius: '20px',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                      }}>
                        {specialist.services.length} {specialist.services.length === 1 ? 'Servicio' : 'Servicios'}
                      </div>
                    </div>

                    {/* Contenido */}
                    <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>

                      {/* Nombre y Título */}
                      <div style={{ marginBottom: '12px' }}>
                        <h4 style={{
                          fontSize: '1.15rem',
                          fontWeight: '700',
                          color: '#2c3e50',
                          marginBottom: '4px',
                          lineHeight: '1.3'
                        }}>
                          {specialist.name}
                        </h4>
                        <p style={{
                          color: 'var(--accent-color)',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          margin: 0
                        }}>
                          {specialist.title}
                        </p>
                      </div>

                      {/* Áreas de Atención */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '14px',
                        paddingBottom: '14px',
                        borderBottom: '1px solid #f0f0f0'
                      }}>
                        <i className="bi bi-people-fill" style={{ color: 'var(--accent-color)', fontSize: '0.9rem' }}></i>
                        <span style={{
                          color: '#666',
                          fontSize: '0.8rem',
                          fontWeight: '500'
                        }}>
                          {specialist.areas.join(' • ')}
                        </span>
                      </div>

                      {/* Servicios - Todos visibles */}
                      <div style={{ marginBottom: '16px', flex: 1 }}>
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '6px'
                        }} className="specialist-services-inline">
                          {specialist.services.length > 0 ? (
                            specialist.services.map((service, idx) => (
                              <span key={idx} style={{
                                background: 'color-mix(in srgb, var(--accent-color), transparent 92%)',
                                color: 'var(--accent-color)',
                                padding: '5px 12px',
                                borderRadius: '10px',
                                fontSize: '0.72rem',
                                fontWeight: '600',
                                display: 'inline-block',
                                lineHeight: '1.3'
                              }}>
                                {service}
                              </span>
                            ))
                          ) : (
                            <span style={{ color: '#999', fontSize: '0.8rem' }}>Sin servicios asignados</span>
                          )}
                        </div>
                      </div>

                      {/* Botón CTA */}
                      <a href="contactanos" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        background: 'var(--accent-color)',
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: '50px',
                        textDecoration: 'none',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 3px 12px rgba(194, 99, 249, 0.3)',
                        marginTop: 'auto'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.03)';
                        e.currentTarget.style.boxShadow = '0 5px 20px rgba(194, 99, 249, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 3px 12px rgba(194, 99, 249, 0.3)';
                      }}>
                        <i className="bi bi-calendar-check" style={{ fontSize: '1rem' }}></i>
                        Agendar Cita
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredSpecialists.length === 0 && (
            <div id="noResults" className="no-results">
              <i className="bi bi-search"></i>
              <h4>No se encontraron especialistas</h4>
              <p>Intenta con otros términos de búsqueda</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section Mejorado */}
      <section style={{
        padding: '80px 0',
        background: 'var(--accent-color)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative circles */}
        <div style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
          top: '-200px',
          right: '-100px'
        }}></div>
        <div style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
          bottom: '-150px',
          left: '-50px'
        }}></div>

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center" data-aos="fade-up">
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '24px',
                padding: '50px 40px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <i className="bi bi-heart-pulse" style={{
                  fontSize: '3.5rem',
                  color: 'white',
                  marginBottom: '20px',
                  display: 'block'
                }}></i>
                <h2 style={{
                  color: 'white',
                  fontSize: '2.2rem',
                  fontWeight: '700',
                  marginBottom: '20px'
                }}>
                  ¿Listo para comenzar tu proceso terapéutico?
                </h2>
                <p style={{
                  color: 'rgba(255, 255, 255, 0.95)',
                  fontSize: '1.1rem',
                  lineHeight: '1.8',
                  marginBottom: '35px'
                }}>
                  Nuestro equipo de especialistas está preparado para acompañarte en tu camino hacia el bienestar.
                  Agenda tu cita hoy mismo y da el primer paso hacia una mejor calidad de vida.
                </p>
                <div style={{
                  display: 'flex',
                  gap: '15px',
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}>
                  <a href="contactanos" style={{
                    background: 'white',
                    color: 'var(--accent-color)',
                    padding: '16px 40px',
                    borderRadius: '50px',
                    textDecoration: 'none',
                    fontWeight: '700',
                    fontSize: '1rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 6px 30px rgba(0, 0, 0, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2)';
                  }}>
                    <i className="bi bi-calendar-check" style={{ fontSize: '1.2rem' }}></i>
                    Agendar Cita
                  </a>
                  <a href="servicios" style={{
                    background: 'transparent',
                    color: 'white',
                    padding: '16px 40px',
                    borderRadius: '50px',
                    textDecoration: 'none',
                    fontWeight: '700',
                    fontSize: '1rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.3s ease',
                    border: '2px solid white'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}>
                    <i className="bi bi-grid-3x3-gap" style={{ fontSize: '1.2rem' }}></i>
                    Ver Servicios
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </>
  );
}
