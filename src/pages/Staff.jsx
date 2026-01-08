import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { initializePageScripts } from '../utils/initScripts';
import { getStaffActivos, getStaffDetalleCompleto } from '../services/staffService';
import { getServiciosByTrabajador } from '../services/trabajadorServicioService';
import { API_BASE_URL } from '../services/api';
import PureCounter from '@srexi/purecounterjs';

export const Staff = () => {
  const [specialists, setSpecialists] = useState([]);
  const [filteredSpecialists, setFilteredSpecialists] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedSpecialist, setSelectedSpecialist] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filtroArea, setFiltroArea] = useState('');
  const [filtroEspecialidad, setFiltroEspecialidad] = useState('');
  const [filtroServicio, setFiltroServicio] = useState('');
  const [totalServiciosUnicos, setTotalServiciosUnicos] = useState(0);

  useEffect(() => {
    initializePageScripts();
    cargarStaff();
  }, []);

  // Calcular servicios únicos cuando cambien los specialists
  useEffect(() => {
    if (specialists.length > 0) {
      const serviciosSet = new Set();
      specialists.forEach(s => {
        if (s.services && Array.isArray(s.services)) {
          s.services.forEach(servicio => serviciosSet.add(servicio));
        }
      });
      setTotalServiciosUnicos(serviciosSet.size);
    }
  }, [specialists]);

   useEffect(() => {
    if (!loading && specialists.length > 0 && totalServiciosUnicos > 0) {
      // Pequeño delay para asegurar que el DOM esté actualizado
      setTimeout(() => {
        // Destruir instancias anteriores
        const counters = document.querySelectorAll('.purecounter');
        counters.forEach(counter => {
          counter.textContent = '0';
          // Eliminar atributos de PureCounter para reiniciar
          counter.removeAttribute('data-purecounter-duration');
        });

        // Actualizar el atributo data-purecounter-end con el valor correcto
        const serviciosCounter = document.querySelector('[data-purecounter-end]');
        if (serviciosCounter) {
          serviciosCounter.setAttribute('data-purecounter-end', totalServiciosUnicos);
        }

        // Inicializar PureCounter
        new PureCounter({
          selector: '.purecounter',
          start: 0,
          duration: 2,
          delay: 10,
          once: true,
          legacy: true,
          filesizing: false,
          currency: false,
          separator: false
        });
      }, 300);
    }
  }, [loading, specialists, totalServiciosUnicos]);

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
            staffId: item.id, // ID del registro staff
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
            // Nuevos campos para información detallada
            biografia: item.biografia || '',
            titulo_profesional: item.titulo_profesional || '',
            universidad_principal: item.universidad_principal || '',
            anio_graduacion: item.anio_graduacion || '',
            numero_colegiatura: item.numero_colegiatura || '',
            formaciones: item.formaciones || [],
            cursos: item.cursos || [],
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

      console.log('✅ Staff cargado:', staffFormateado);
      console.log('📊 Staff IDs:', staffFormateado.map(s => ({ name: s.name, staffId: s.staffId, id: s.id })));

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

      console.log('✅ Staff sin duplicados:', staffSinDuplicados);

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

  // Función para cargar detalles completos del staff
  const cargarDetalleCompleto = async (staffId) => {
    try {
      const detalle = await getStaffDetalleCompleto(staffId);
      console.log('Detalle completo cargado:', detalle);
      console.log('Detalle.areas:', detalle.areas);
      console.log('Detalle.servicios:', detalle.servicios);
      console.log('Detalle.cursos:', detalle.cursos);
      console.log('Detalle.formaciones:', detalle.formaciones);
      return detalle;
    } catch (error) {
      console.error('Error al cargar detalle del staff:', error);
      return null;
    }
  };

  // Función para mostrar detalles del terapeuta
  const handleVerDetalle = async (specialist) => {
    try {
      console.log('🔍 Abriendo detalle para:', specialist);
      console.log('📋 staffId:', specialist.staffId);

      // Siempre cargar detalles completos desde el API
      if (specialist.staffId && !isNaN(specialist.staffId)) {
        const detalleCompleto = await cargarDetalleCompleto(specialist.staffId);

        if (detalleCompleto) {
          // Generar URL correcta para la foto
          let imgUrl = specialist.img;
          if (detalleCompleto.foto) {
            const filename = detalleCompleto.foto.split('/').pop();
            imgUrl = `${API_BASE_URL}/staff/foto/${filename}`;
          }

          // ✅ Cargar servicios ACTIVOS del trabajador directamente
          let serviciosActivos = [];
          if (specialist.trabajadorId) {
            serviciosActivos = await cargarServiciosTrabajador(specialist.trabajadorId);
          }

          // Si no hay servicios activos, usar los del detalle como fallback
          let serviciosNormalizados = [];
          if (serviciosActivos.length > 0) {
            serviciosNormalizados = serviciosActivos;
          } else if (detalleCompleto.servicios && Array.isArray(detalleCompleto.servicios)) {
            serviciosNormalizados = detalleCompleto.servicios.map(s =>
              typeof s === 'string' ? s : (s.nombre || JSON.stringify(s))
            );
          } else if (specialist.services) {
            serviciosNormalizados = specialist.services;
          }

          // Normalizar areas: convertir objetos a strings
          let areasNormalizadas = [];
          if (detalleCompleto.areas && Array.isArray(detalleCompleto.areas)) {
            areasNormalizadas = detalleCompleto.areas.map(a =>
              typeof a === 'string' ? a : (a.nombre || JSON.stringify(a))
            );
          } else if (specialist.areas) {
            areasNormalizadas = specialist.areas;
          }

          // Formatear los datos para el modal
          const specialistConDetalle = {
            ...specialist,
            img: imgUrl,
            name: `${detalleCompleto.trabajador?.nombres || ''} ${detalleCompleto.trabajador?.apellidos || ''}`.trim(),
            title: detalleCompleto.trabajador?.especialidad || detalleCompleto.trabajador?.cargo || specialist.title,
            biografia: detalleCompleto.biografia || '',
            titulo_profesional: detalleCompleto.titulo_profesional || '',
            universidad_principal: detalleCompleto.universidad_principal || '',
            anio_graduacion: detalleCompleto.anio_graduacion || '',
            numero_colegiatura: detalleCompleto.numero_colegiatura || '',
            formaciones: detalleCompleto.formaciones || [],
            cursos: detalleCompleto.cursos || [],
            services: serviciosNormalizados,
            areas: areasNormalizadas
          };

          console.log('✅ Specialist con detalle normalizado:', specialistConDetalle);
          setSelectedSpecialist(specialistConDetalle);
        } else {
          // Si no se pudo cargar el detalle, usar los datos básicos
          console.warn('⚠️ No se pudo cargar el detalle completo');
          setSelectedSpecialist(specialist);
        }
      } else {
        console.error('❌ staffId no válido:', specialist.staffId);
        alert('No se puede cargar la información del terapeuta. Por favor, intenta nuevamente.');
        return;
      }

      setShowModal(true);
      // Evitar scroll en el body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    } catch (error) {
      console.error('Error al mostrar detalle:', error);
      // En caso de error, mostrar al menos los datos básicos
      setSelectedSpecialist(specialist);
      setShowModal(true);
      document.body.style.overflow = 'hidden';
    }
  };

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSpecialist(null);
    document.body.style.overflow = 'auto';
  };

  // Función de filtrado combinada
  const aplicarFiltros = () => {
    let filtered = [...specialists];

    // Filtro por búsqueda
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(specialist =>
        specialist.name.toLowerCase().includes(search) ||
        specialist.title.toLowerCase().includes(search) ||
        specialist.services.some(service => service.toLowerCase().includes(search))
      );
    }

    // Filtro por área
    if (filtroArea) {
      filtered = filtered.filter(specialist =>
        Array.isArray(specialist.areas) &&
        specialist.areas.some(area =>
          (typeof area === 'string' ? area : area.nombre) === filtroArea
        )
      );
    }

    // Filtro por especialidad
    if (filtroEspecialidad) {
      filtered = filtered.filter(specialist =>
        specialist.title === filtroEspecialidad
      );
    }

    // Filtro por servicio
    if (filtroServicio) {
      filtered = filtered.filter(specialist =>
        Array.isArray(specialist.services) &&
        specialist.services.some(service =>
          service.toLowerCase().includes(filtroServicio.toLowerCase())
        )
      );
    }

    setFilteredSpecialists(filtered);
  };

  // Aplicar filtros cuando cambien
  useEffect(() => {
    aplicarFiltros();
  }, [searchTerm, filtroArea, filtroEspecialidad, filtroServicio, specialists]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setFiltroArea('');
    setFiltroEspecialidad('');
    setFiltroServicio('');
  };

  // Obtener listas únicas para filtros
  const areasUnicas = [...new Set(specialists.flatMap(s =>
    Array.isArray(s.areas) ? s.areas.map(a => typeof a === 'string' ? a : a.nombre) : []
  ))].filter(Boolean);

  const especialidadesUnicas = [...new Set(specialists.map(s => s.title))].filter(Boolean);

  const serviciosUnicos = [...new Set(specialists.flatMap(s =>
    Array.isArray(s.services) ? s.services : []
  ))].filter(Boolean).sort();

  const handleImageError = (e) => {
    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjhCQkQ5Ii8+CjxjaXJjbGUgY3g9Ijc1IiBjeT0iNjAiIHI9IjI1IiBmaWxsPSIjRTkxRTYzIi8+CjxwYXRoIGQ9Ik0yNSAxMjVDMjUgMTA1IDQ1IDkwIDc1IDkwUzEyNSAxMDUgMTI1IDEyNVYxNTBIMjVWMTI1WiIgZmlsbD0iI0U5MUU2MyIvPgo8L3N2Zz4K';
  };

  // Función para recargar staff manualmente
  const recargarStaff = () => {
    cargarStaff();
  };

  // Función para obtener las iniciales del colegio según la especialidad
  const obtenerInicialesColegio = (especialidad) => {
    if (!especialidad) return '';

    const especialidadLower = (typeof especialidad === 'string' ? especialidad : especialidad.nombre || '').toLowerCase();

    // Mapeo de especialidades a sus colegios profesionales
    const mapeoColegios = {
      // Psicólogos
      'psicólogo': 'CPsP',
      'psicologo': 'CPsP',
      'psicóloga': 'CPsP',
      'psicologa': 'CPsP',
      'psicología': 'CPsP',
      'psicologia': 'CPsP',

      // Tecnólogos Médicos (terapeutas especializados)
      'terapia ocupacional': 'CTMP',
 
      'terapeuta del lenguaje': 'CTMP',
      'terapia de lenguaje': 'CTMP',
      'terapia lenguaje': 'CTMP',
      'estimulación temprana': 'CTMP',
      'estimulacion temprana': 'CTMP',
   

      // Médicos
      'médico': 'CMP',
      'medico': 'CMP',
      'médica': 'CMP',
      'medica': 'CMP',

      // Enfermeros
      'enfermero': 'CEP',
      'enfermera': 'CEP',

      // Nutricionistas
      'nutricionista': 'CNP',

      // Terapeutas físicos (por si hay)
      'terapeuta físico': 'CPTF',
      'terapeuta fisica': 'CPTF',
      'fisioterapeuta': 'CPTF'
    };

    // Buscar coincidencia en el mapeo
    for (const [key, siglas] of Object.entries(mapeoColegios)) {
      if (especialidadLower.includes(key)) {
        return siglas;
      }
    }

    // Si no se encuentra, retornar vacío
    return '';
  };

  // Modal de detalle del terapeuta
  const SpecialistDetailModal = () => {
    if (!selectedSpecialist) return null;

    // Obtener las iniciales del colegio según la especialidad del trabajador
    const inicialesColegio = obtenerInicialesColegio(selectedSpecialist.title);

    return (
      <div className="modal-backdrop" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px'
      }}>
        <div className="modal-content" style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          maxWidth: '900px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative'
        }}>
          {/* Botón cerrar */}
          <button onClick={handleCloseModal} style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            color: '#666',
            cursor: 'pointer',
            zIndex: 10
          }}>
            <i className="bi bi-x-lg"></i>
          </button>

          <div className="modal-body" style={{ padding: '40px' }}>
            {/* Header del modal */}
            <div className="modal-header" style={{
              display: 'flex',
              gap: '40px',
              marginBottom: '40px',
              flexWrap: 'wrap'
            }}>
              <div style={{
                width: '250px',
                height: '300px',
                borderRadius: '15px',
                overflow: 'hidden',
                flexShrink: 0
              }}>
                <img
                  src={selectedSpecialist.img}
                  alt={selectedSpecialist.name}
                  onError={handleImageError}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </div>
              
              <div style={{ flex: 1, minWidth: '300px' }}>
                <h2 style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#2c3e50',
                  marginBottom: '10px'
                }}>
                  Lic. {selectedSpecialist.name}
                </h2>
                
                <p style={{
                  color: 'var(--accent-color)',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  marginBottom: '15px'
                }}>
                  {selectedSpecialist.title}
                </p>

                {selectedSpecialist.titulo_profesional && (
                  <p style={{ color: '#666', marginBottom: '10px' }}>
                    <i className="bi bi-award" style={{ marginRight: '8px' }}></i>
                    {selectedSpecialist.titulo_profesional}
                  </p>
                )}

                {selectedSpecialist.numero_colegiatura && (
                  <p style={{ color: '#666', marginBottom: '20px' }}>
                    <i className="bi bi-shield-check" style={{ marginRight: '8px' }}></i>
                    {inicialesColegio ? `${inicialesColegio}: ${selectedSpecialist.numero_colegiatura}` : `Colegiatura: ${selectedSpecialist.numero_colegiatura}`}
                  </p>
                )}

                {/* Áreas de especialización */}
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#444',
                    marginBottom: '10px'
                  }}>
                    Áreas de Especialización
                  </h4>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}>
                    {selectedSpecialist.areas && Array.isArray(selectedSpecialist.areas) && selectedSpecialist.areas.map((area, idx) => (
                      <span key={idx} style={{
                        background: 'color-mix(in srgb, var(--accent-color), transparent 92%)',
                        color: 'var(--accent-color)',
                        padding: '6px 15px',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: '600'
                      }}>
                        {typeof area === 'string' ? area : area.nombre || JSON.stringify(area)}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Servicios */}
                <div>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#444',
                    marginBottom: '10px'
                  }}>
                    Servicios Ofrecidos
                  </h4>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}>
                    {selectedSpecialist.services.slice(0, 8).map((service, idx) => (
                      <span key={idx} style={{
                        background: '#f8f9fa',
                        color: '#666',
                        padding: '6px 15px',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        border: '1px solid #e9ecef'
                      }}>
                        {service}
                      </span>
                    ))}
                    {selectedSpecialist.services.length > 8 && (
                      <span style={{
                        background: '#f8f9fa',
                        color: '#666',
                        padding: '6px 15px',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        border: '1px solid #e9ecef'
                      }}>
                        +{selectedSpecialist.services.length - 8} más
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Biografía */}
            {selectedSpecialist.biografia && (
              <div style={{ marginBottom: '40px' }}>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#2c3e50',
                  marginBottom: '20px',
                  paddingBottom: '10px',
                  borderBottom: '2px solid var(--accent-color)'
                }}>
                  Biografía Profesional
                </h3>
                <div style={{
                  color: '#555',
                  lineHeight: '1.8',
                  fontSize: '1rem'
                }} dangerouslySetInnerHTML={{ __html: selectedSpecialist.biografia }}>
                </div>
              </div>
            )}

            {/* Formación académica */}
            {(selectedSpecialist.formaciones && selectedSpecialist.formaciones.length > 0) && (
              <div style={{ marginBottom: '40px' }}>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#2c3e50',
                  marginBottom: '20px',
                  paddingBottom: '10px',
                  borderBottom: '2px solid var(--accent-color)'
                }}>
                  Formación Académica
                </h3>
                <div style={{
                  display: 'grid',
                  gap: '20px'
                }}>
                  {selectedSpecialist.formaciones.map((formacion, idx) => (
                    <div key={idx} style={{
                      padding: '20px',
                      background: '#f8f9fa',
                      borderRadius: '10px',
                      borderLeft: '4px solid var(--accent-color)'
                    }}>
                      {formacion.titulo ? (
                        <>
                          <h4 style={{
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            color: '#2c3e50',
                            marginBottom: '8px'
                          }}>
                            {formacion.titulo}
                          </h4>
                          <p style={{ color: '#666', marginBottom: '5px' }}>
                            <i className="bi bi-building" style={{ marginRight: '8px' }}></i>
                            {formacion.institucion}
                          </p>
                          <p style={{ color: '#888', fontSize: '0.9rem' }}>
                            {formacion.anio_inicio} {formacion.anio_fin ? `- ${formacion.anio_fin}` : formacion.en_curso ? '(En curso)' : ''}
                          </p>
                          {formacion.descripcion && (
                            <p style={{ color: '#555', marginTop: '10px', fontSize: '0.95rem' }}>
                              {formacion.descripcion}
                            </p>
                          )}
                        </>
                      ) : (
                        <p style={{ color: '#555', fontSize: '0.95rem', lineHeight: '1.6' }}>
                          {formacion.descripcion || formacion.nombre || 'Sin descripción'}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cursos y certificaciones */}
            {(selectedSpecialist.cursos && selectedSpecialist.cursos.length > 0) && (
              <div style={{ marginBottom: '40px' }}>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#2c3e50',
                  marginBottom: '20px',
                  paddingBottom: '10px',
                  borderBottom: '2px solid var(--accent-color)'
                }}>
                  Formación y Logros
                </h3>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0
                }}>
                  {selectedSpecialist.cursos.map((curso, idx) => (
                    <li key={idx} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      marginBottom: '16px',
                      paddingBottom: '16px',
                      borderBottom: idx < selectedSpecialist.cursos.length - 1 ? '1px solid #e9ecef' : 'none'
                    }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: 'var(--accent-color)',
                        marginTop: '6px',
                        flexShrink: 0
                      }}></div>
                      <p style={{
                        fontSize: '0.95rem',
                        color: '#555',
                        lineHeight: '1.7',
                        margin: 0
                      }}>
                        {curso.descripcion || curso.nombre || 'Sin descripción'}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Botón para agendar cita */}
            <div style={{
              textAlign: 'center',
              marginTop: '40px',
              paddingTop: '30px',
              borderTop: '1px solid #eee'
            }}>
              <a href="contactanos" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                background: 'var(--accent-color)',
                color: 'white',
                padding: '15px 40px',
                borderRadius: '50px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '1rem',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 20px rgba(194, 99, 249, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 6px 25px rgba(194, 99, 249, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(194, 99, 249, 0.3)';
              }}>
                <i className="bi bi-calendar-check" style={{ fontSize: '1.2rem' }}></i>
                Agendar Cita con {selectedSpecialist.name.split(' ')[0]}
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <style>
        {`
          .specialist-card-modern {
            transition: all 0.3s ease;
          }

          .specialist-card-modern:hover {
            transform: translateY(-3px);
          }

          .specialist-card-modern img {
            transition: transform 0.5s ease;
          }

          .specialist-card-modern:hover img {
            transform: scale(1.08);
          }

          /* Grid responsive mejorado */
          @media (max-width: 1400px) {
            .col-lg-3 {
              flex: 0 0 25%;
              max-width: 25%;
            }
          }

          @media (max-width: 1200px) {
            .col-lg-3 {
              flex: 0 0 33.333%;
              max-width: 33.333%;
            }
          }

          @media (max-width: 768px) {
            .specialist-services-inline {
              flex-wrap: wrap !important;
            }
            .modal-header {
              flex-direction: column;
            }
            .modal-header > div:first-child {
              width: 100% !important;
              max-width: 300px;
              margin: 0 auto 30px;
            }
            .col-md-4, .col-sm-6 {
              flex: 0 0 50%;
              max-width: 50%;
            }
          }

          @media (max-width: 576px) {
            .col-12 {
              flex: 0 0 100%;
              max-width: 100%;
            }
          }

          /* Animación de scroll suave */
          html {
            scroll-behavior: smooth;
          }

          /* Mejora de selects en móvil */
          @media (max-width: 768px) {
            select {
              font-size: 16px !important; /* Evita zoom en iOS */
            }

            /* Filtros laterales en móvil */
            .col-lg-3.col-md-4 {
              order: 2;
            }

            .col-lg-9.col-md-8 {
              order: 1;
            }

            /* Tarjetas horizontales en móvil se vuelven verticales */
            .specialist-card-modern {
              flex-direction: column !important;
            }

            .specialist-card-modern > div:first-child {
              width: 100% !important;
              min-width: 100% !important;
              height: 200px !important;
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
            <div className="row text-center justify-content-center">
              <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="100">
                <div style={{ color: 'white' }}>
                  <h2 style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '10px' }}>
                    <span className="purecounter" data-purecounter-start="0" data-purecounter-end={totalServiciosUnicos} data-purecounter-duration="2">0</span>+
                  </h2>
                  <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>Servicios Disponibles</p>
                </div>
              </div>
              <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="200">
                <div style={{ color: 'white' }}>
                  <h2 style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '10px' }}>
                    <span className="purecounter" data-purecounter-start="0" data-purecounter-end="8" data-purecounter-duration="2">0</span>+
                  </h2>
                  <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>Años de Experiencia</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search Section */}
        <section className="search-section" style={{ padding: '30px 0 40px 0', background: '#f8f9fa', marginBottom: 0}}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-10">
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
                    placeholder="Buscar terapeuta por nombre..."
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

        <section className="specialists-section section light-background" style={{ paddingTop: '50px', paddingBottom: '60px' }}>
          <div className="container" style={{ marginTop: '0' }}>
            <div className="row" style={{ marginTop: '0' }}>
              {/* Filtros Laterales */}
              <div className="col-lg-3 col-md-4 mb-4" data-aos="fade-right">
                <div style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 2px 12px rgba(194, 99, 249, 0.08)',
                  position: 'sticky',
                  top: '100px'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '24px',
                    paddingBottom: '16px',
                    borderBottom: '2px solid #f0f0f0'
                  }}>
                    <h3 style={{
                      fontSize: '1.1rem',
                      fontWeight: '700',
                      color: '#2c3e50',
                      margin: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <i className="bi bi-funnel"></i>
                      Filtros
                    </h3>
                    {(filtroArea || filtroServicio) && (
                      <button
                        onClick={clearAllFilters}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--accent-color)',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'color-mix(in srgb, var(--accent-color), transparent 92%)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                      >
                        Limpiar
                      </button>
                    )}
                  </div>

                  {/* Filtro por Área */}
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      color: '#666',
                      marginBottom: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <i className="bi bi-people"></i>
                      Área de Atención
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {areasUnicas.map(area => (
                        <label key={area} style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          background: filtroArea === area ? 'color-mix(in srgb, var(--accent-color), transparent 92%)' : 'transparent',
                          border: filtroArea === area ? '1px solid var(--accent-color)' : '1px solid transparent'
                        }}
                        onMouseEnter={(e) => {
                          if (filtroArea !== area) e.currentTarget.style.background = '#f8f9fa';
                        }}
                        onMouseLeave={(e) => {
                          if (filtroArea !== area) e.currentTarget.style.background = 'transparent';
                        }}>
                          <input
                            type="radio"
                            name="area"
                            value={area}
                            checked={filtroArea === area}
                            onChange={(e) => setFiltroArea(e.target.value)}
                            style={{
                              marginRight: '10px',
                              accentColor: 'var(--accent-color)',
                              cursor: 'pointer'
                            }}
                          />
                          <span style={{
                            fontSize: '0.9rem',
                            color: filtroArea === area ? 'var(--accent-color)' : '#555',
                            fontWeight: filtroArea === area ? '600' : '500'
                          }}>
                            {area}
                          </span>
                        </label>
                      ))}
                      {filtroArea && (
                        <button
                          onClick={() => setFiltroArea('')}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#999',
                            fontSize: '0.85rem',
                            padding: '8px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontWeight: '500'
                          }}
                        >
                          <i className="bi bi-x-circle"></i> Quitar filtro
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Filtro por Servicio */}
                  <div style={{ marginBottom: '12px' }}>
                    <h4 style={{
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      color: '#666',
                      marginBottom: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <i className="bi bi-heart-pulse"></i>
                      Servicios
                    </h4>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      maxHeight: '400px',
                      overflowY: 'auto',
                      paddingRight: '8px'
                    }}>
                      {serviciosUnicos.map(servicio => (
                        <label key={servicio} style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          background: filtroServicio === servicio ? 'color-mix(in srgb, var(--accent-color), transparent 92%)' : 'transparent',
                          border: filtroServicio === servicio ? '1px solid var(--accent-color)' : '1px solid transparent'
                        }}
                        onMouseEnter={(e) => {
                          if (filtroServicio !== servicio) e.currentTarget.style.background = '#f8f9fa';
                        }}
                        onMouseLeave={(e) => {
                          if (filtroServicio !== servicio) e.currentTarget.style.background = 'transparent';
                        }}>
                          <input
                            type="radio"
                            name="servicio"
                            value={servicio}
                            checked={filtroServicio === servicio}
                            onChange={(e) => setFiltroServicio(e.target.value)}
                            style={{
                              marginRight: '10px',
                              accentColor: 'var(--accent-color)',
                              cursor: 'pointer'
                            }}
                          />
                          <span style={{
                            fontSize: '0.85rem',
                            color: filtroServicio === servicio ? 'var(--accent-color)' : '#555',
                            fontWeight: filtroServicio === servicio ? '600' : '500',
                            lineHeight: '1.4'
                          }}>
                            {servicio}
                          </span>
                        </label>
                      ))}
                      {filtroServicio && (
                        <button
                          onClick={() => setFiltroServicio('')}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#999',
                            fontSize: '0.85rem',
                            padding: '8px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontWeight: '500'
                          }}
                        >
                          <i className="bi bi-x-circle"></i> Quitar filtro
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Contador de resultados */}
                  <div style={{
                    marginTop: '24px',
                    paddingTop: '16px',
                    borderTop: '2px solid #f0f0f0',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      color: '#666',
                      fontSize: '0.85rem',
                      fontWeight: '500'
                    }}>
                      {filteredSpecialists.length === specialists.length ? (
                        <span><i className="bi bi-check-circle"></i> {filteredSpecialists.length} especialistas</span>
                      ) : (
                        <span>
                          <i className="bi bi-funnel-fill" style={{ color: 'var(--accent-color)' }}></i> {filteredSpecialists.length} de {specialists.length}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid de Especialistas */}
              <div className="col-lg-9 col-md-8">
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
                    data-aos-delay={(index % 2) * 50 + 50}
                  >
                    {/* Tarjeta según boceto */}
                    <div className="specialist-card-modern" style={{
                      background: 'white',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      boxShadow: '0 2px 12px rgba(194, 99, 249, 0.08)',
                      border: '1px solid #f0f0f0',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                      padding: '20px'
                    }}
                    onClick={() => handleVerDetalle(specialist)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(194, 99, 249, 0.2)';
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.borderColor = 'var(--accent-color)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 2px 12px rgba(194, 99, 249, 0.08)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = '#f0f0f0';
                    }}>

                      {/* Fila superior: Foto + Info (misma altura) */}
                      <div style={{
                        display: 'flex',
                        gap: '16px',
                        marginBottom: '16px',
                        height: '180px'
                      }}>
                        {/* Foto Izquierda */}
                        <div style={{
                          width: '160px',
                          minWidth: '160px',
                          height: '100%',
                          position: 'relative',
                          overflow: 'hidden',
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                        }}>
                          <img
                            src={specialist.img}
                            alt={specialist.name}
                            onError={handleImageError}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              transition: 'transform 0.3s ease'
                            }}
                          />
                        </div>

                        {/* Info Derecha - 3 secciones suaves */}
                        <div style={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                          height: '100%',
                          minWidth: 0,
                          justifyContent: 'space-around'
                        }}>
                          {/* Nombre */}
                          <div>
                            <h3 style={{
                              fontSize: '1.05rem',
                              fontWeight: '700',
                              color: '#2c3e50',
                              margin: 0,
                              lineHeight: '1.3',
                              letterSpacing: '-0.3px'
                            }}>
                              Lic. {specialist.name}
                            </h3>
                          </div>

                          {/* Especialidad */}
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'color-mix(in srgb, var(--accent-color), transparent 92%)',
                            padding: '8px 16px',
                            borderRadius: '50px',
                            alignSelf: 'flex-start',
                            boxShadow: '0 2px 8px rgba(194, 99, 249, 0.12)'
                          }}>
                            <i className="bi bi-patch-check-fill" style={{
                              fontSize: '0.95rem',
                              color: 'var(--accent-color)'
                            }}></i>
                            <p style={{
                              fontSize: '0.85rem',
                              fontWeight: '600',
                              color: 'var(--accent-color)',
                              margin: 0,
                              lineHeight: '1.2'
                            }}>
                              {specialist.title}
                            </p>
                          </div>

                          {/* Áreas */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: 'color-mix(in srgb, var(--accent-color), transparent 92%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              <i className="bi bi-people-fill" style={{
                                fontSize: '0.85rem',
                                color: 'var(--accent-color)'
                              }}></i>
                            </div>
                            <p style={{
                              fontSize: '0.8rem',
                              fontWeight: '500',
                              color: '#666',
                              margin: 0,
                              lineHeight: '1.4'
                            }}>
                              {Array.isArray(specialist.areas)
                                ? specialist.areas.map(a => typeof a === 'string' ? a : a.nombre).join(' • ')
                                : 'Sin área'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Servicios - Ocupan el resto del espacio */}
                      <div style={{
                        flex: 1,
                        marginBottom: '16px',
                        display: 'flex',
                        flexDirection: 'column'
                      }}>
                        <h4 style={{
                          fontSize: '0.7rem',
                          fontWeight: '600',
                          color: '#888',
                          margin: '0 0 10px 0',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          <i className="bi bi-heart-pulse" style={{ marginRight: '4px' }}></i>
                          Servicios ({specialist.services.length})
                        </h4>
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '6px',
                          alignContent: 'flex-start'
                        }}>
                          {specialist.services.length > 0 ? (
                            specialist.services.map((service, idx) => (
                              <span key={idx} style={{
                                background: 'color-mix(in srgb, var(--accent-color), transparent 92%)',
                                color: 'var(--accent-color)',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                fontSize: '0.7rem',
                                fontWeight: '600',
                                lineHeight: '1.3'
                              }}>
                                {service}
                              </span>
                            ))
                          ) : (
                            <span style={{ color: '#999', fontSize: '0.75rem' }}>Sin servicios</span>
                          )}
                        </div>
                      </div>

                      {/* Botón VER PERFIL */}
                      <button
                        style={{
                          width: '100%',
                          background: 'var(--accent-color)',
                          color: 'white',
                          padding: '12px 20px',
                          borderRadius: '50px',
                          border: 'none',
                          fontWeight: '700',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#6A1B9A';
                          e.currentTarget.style.transform = 'scale(1.02)';
                          e.stopPropagation();
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'var(--accent-color)';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}>
                        VER PERFIL
                        <i className="bi bi-arrow-right-circle-fill"></i>
                      </button>
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
            </div>
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

      {/* Modal de detalle del terapeuta */}
      {showModal && <SpecialistDetailModal />}
    </>
  );
}