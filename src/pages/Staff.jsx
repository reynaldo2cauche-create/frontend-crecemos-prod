import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { initializePageScripts } from '../utils/initScripts';
import { getStaffActivos, getStaffDetalleCompleto } from '../services/staffService';
import { getServiciosByTrabajador } from '../services/trabajadorServicioService';
import { API_BASE_URL } from '../services/api';
import PureCounter from '@srexi/purecounterjs';
import Reveal from '../components/public/Reveal';
import RevealText from '../components/public/RevealText';
import Decor from '../components/public/Decor';

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
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

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
          let imgUrl = 'assets/img/servicios/default-avatar.webp';
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
            orden: item.orden || 999, // ✅ Campo orden para el ordenamiento
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
              serviciosTrabajador: serviciosTrabajador,
              ordenRecibido: item.orden
            }
          };
        })
      );

      console.log('✅ Staff cargado:', staffFormateado);
      console.log('📊 Staff IDs y ORDEN:', staffFormateado.map(s => ({
        name: s.name,
        staffId: s.staffId,
        id: s.id,
        orden: s.orden
      })));

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

      console.log('✅ Staff sin duplicados:', staffSinDuplicados.map(s => ({
        name: s.name,
        orden: s.orden
      })));

      // ✅ Ordenar por el campo "orden" de forma ascendente
      const staffOrdenado = staffSinDuplicados.sort((a, b) => {
        const ordenA = a.orden || 999; // Si no tiene orden, ponerlo al final
        const ordenB = b.orden || 999;
        return ordenA - ordenB;
      });

      console.log('✅ Staff FINAL ordenado por campo "orden":', staffOrdenado.map(s => ({
        name: s.name,
        orden: s.orden
      })));

      setSpecialists(staffOrdenado);
      setFilteredSpecialists(staffOrdenado);
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
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
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

  const toggleFiltersMobile = () => {
    setShowFiltersMobile(!showFiltersMobile);
    if (!showFiltersMobile) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
  };

  const closeFiltersMobile = () => {
    setShowFiltersMobile(false);
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
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

      <div className="cx-modal-backdrop" onClick={handleCloseModal}>
        <div className="cx-modal" onClick={(e) => e.stopPropagation()}>
          <button className="cx-modal-close" onClick={handleCloseModal} aria-label="Cerrar">
            <i className="bi bi-x-lg" />
          </button>

          <div className="cx-modal-body">
            {/* Cabecera */}
            <div className="cx-modal-head">
              <div className="cx-modal-photo">
                <img src={selectedSpecialist.img} alt={selectedSpecialist.name} onError={handleImageError} />
              </div>
              <div className="cx-modal-headinfo">
                <h2>Lic. {selectedSpecialist.name}</h2>
                <span className="cx-modal-role">{selectedSpecialist.title}</span>

                {selectedSpecialist.titulo_profesional && (
                  <p className="cx-modal-line"><i className="bi bi-award" /> {selectedSpecialist.titulo_profesional}</p>
                )}
                {selectedSpecialist.numero_colegiatura && (
                  <p className="cx-modal-line">
                    <i className="bi bi-shield-check" />
                    {inicialesColegio ? ` ${inicialesColegio}: ${selectedSpecialist.numero_colegiatura}` : ` Colegiatura: ${selectedSpecialist.numero_colegiatura}`}
                  </p>
                )}

                <div className="cx-modal-block">
                  <h4>Áreas de especialización</h4>
                  <div className="cx-modal-tags">
                    {selectedSpecialist.areas && Array.isArray(selectedSpecialist.areas) && selectedSpecialist.areas.map((area, idx) => (
                      <span key={idx} className="cx-tag-primary">
                        {typeof area === 'string' ? area : area.nombre || JSON.stringify(area)}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="cx-modal-block">
                  <h4>Servicios ofrecidos</h4>
                  <div className="cx-modal-tags">
                    {selectedSpecialist.services.slice(0, 8).map((service, idx) => (
                      <span key={idx} className="cx-tag-soft">{service}</span>
                    ))}
                    {selectedSpecialist.services.length > 8 && (
                      <span className="cx-tag-soft">+{selectedSpecialist.services.length - 8} más</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Biografía */}
            {selectedSpecialist.biografia && (
              <div className="cx-modal-section">
                <h3>Biografía profesional</h3>
                <div className="cx-modal-bio" dangerouslySetInnerHTML={{ __html: selectedSpecialist.biografia }} />
              </div>
            )}

            {/* Formación académica */}
            {(selectedSpecialist.formaciones && selectedSpecialist.formaciones.length > 0) && (
              <div className="cx-modal-section">
                <h3>Formación académica</h3>
                <div className="cx-modal-formaciones">
                  {selectedSpecialist.formaciones.map((formacion, idx) => (
                    <div key={idx} className="cx-modal-formacion">
                      {formacion.titulo ? (
                        <>
                          <h4>{formacion.titulo}</h4>
                          <p className="cx-modal-line"><i className="bi bi-building" /> {formacion.institucion}</p>
                          <p className="cx-modal-muted">{formacion.anio_inicio} {formacion.anio_fin ? `- ${formacion.anio_fin}` : formacion.en_curso ? '(En curso)' : ''}</p>
                          {formacion.descripcion && <p className="cx-modal-desc">{formacion.descripcion}</p>}
                        </>
                      ) : (
                        <p className="cx-modal-desc">{formacion.descripcion || formacion.nombre || 'Sin descripción'}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cursos y logros */}
            {(selectedSpecialist.cursos && selectedSpecialist.cursos.length > 0) && (
              <div className="cx-modal-section">
                <h3>Formación y logros</h3>
                <ul className="cx-modal-cursos">
                  {selectedSpecialist.cursos.map((curso, idx) => (
                    <li key={idx}>
                      <span className="cx-modal-dot" />
                      <p>{curso.descripcion || curso.nombre || 'Sin descripción'}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* CTA */}
            <div className="cx-modal-cta">
              <Link to="/contactanos" className="cx-btn cx-btn-primary">
                <i className="bi bi-calendar-check" /> Agendar cita con {selectedSpecialist.name.split(' ')[0]}
              </Link>
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

          /* Animación de scroll suave */
          html {
            scroll-behavior: smooth;
          }

          /* Botón toggle filtros móvil */
          .filter-toggle-mobile {
            display: none;
            width: 100%;
            padding: 14px 24px;
            background: var(--accent-color);
            color: white;
            border: none;
            border-radius: 12px;
            font-weight: 600;
            font-size: 1rem;
            cursor: pointer;
            margin-bottom: 16px;
            box-shadow: 0 4px 12px rgba(194, 99, 249, 0.3);
            transition: all 0.3s ease;
          }

          .filter-toggle-mobile:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(194, 99, 249, 0.4);
          }

          .filter-toggle-mobile:active {
            transform: translateY(0);
          }

          /* Responsividad mejorada para tablets - SOLO para specialists-section */
          @media (max-width: 1200px) {
            .specialists-section .col-lg-3 {
              flex: 0 0 33.333%;
              max-width: 33.333%;
            }
          }

          /* Responsividad para tablets pequeños */
          @media (max-width: 992px) {
            /* Filtros en móvil - se convierten en modal/collapse */
            .filter-toggle-mobile {
              display: flex !important;
              align-items: center;
              justify-content: center;
              gap: 10px;
            }

            .filters-sidebar {
              position: fixed !important;
              top: 0 !important;
              left: -100% !important;
              width: 85% !important;
              max-width: 380px !important;
              height: 100vh !important;
              height: 100dvh !important; /* Para móviles modernos */
              background: white !important;
              z-index: 10000 !important;
              transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
              overflow-y: auto !important;
              overflow-x: hidden !important;
              box-shadow: 2px 0 24px rgba(0,0,0,0.3) !important;
              margin: 0 !important;
              padding: 0 !important;
              -webkit-overflow-scrolling: touch !important;
            }

            .filters-sidebar.active {
              left: 0 !important;
            }

            .filter-backdrop {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0,0,0,0.6);
              z-index: 9999;
              opacity: 0;
              visibility: hidden;
              transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              -webkit-tap-highlight-color: transparent;
            }

            .filter-backdrop.active {
              opacity: 1;
              visibility: visible;
            }

            .filters-sidebar > div {
              position: static !important;
              border-radius: 0 !important;
              min-height: 100vh !important;
              box-shadow: none !important;
              padding: 20px !important;
            }

            /* Mostrar botón de cerrar en móvil */
            .close-filters-mobile {
              display: block !important;
            }
          }

          /* Responsividad para móviles */
          @media (max-width: 768px) {
            .specialist-services-inline {
              flex-wrap: wrap !important;
            }

            /* Modal responsivo */
            .modal-backdrop {
              padding: 0 !important;
              align-items: flex-start !important;
            }

            .modal-content {
              margin: 0 !important;
              max-height: 100vh !important;
              min-height: 100vh !important;
              border-radius: 0 !important;
              overflow-y: auto !important;
            }

            .modal-header {
              flex-direction: column !important;
              gap: 20px !important;
            }

            .modal-header > div:first-child {
              width: 100% !important;
              max-width: 100% !important;
              height: 300px !important;
              margin: 0 !important;
            }

            .modal-header > div:last-child {
              min-width: 100% !important;
            }

            .modal-body {
              padding: 20px 16px 30px 16px !important;
            }

            /* Botón cerrar en móvil - a la derecha y sticky */
            .modal-close-btn {
              position: sticky !important;
            //   top: 10px !important;
              // left: auto !important;
              // right: 10px !important;
              margin-left: auto !important;
              // float: right !important;
              // width: 40px !important;
              // height: 40px !important;
              // background: rgba(255, 255, 255, 0.98) !important;
              // backdrop-filter: blur(8px) !important;
              -webkit-backdrop-filter: blur(8px) !important;
              box-shadow: 0 4px 20px rgba(0,0,0,0.25) !important;
              font-size: 20px !important;
            }

            .modal-close-btn:active {
              transform: scale(0.95) !important;
            }

            /* Cards responsive en móvil */
            .specialist-card-modern > div:first-child {
              flex-direction: column !important;
              height: auto !important;
            }

            .specialist-card-modern > div:first-child > div:first-child {
              width: 100% !important;
              min-width: 100% !important;
              height: 280px !important;
            }

            .specialist-card-modern > div:first-child > div:last-child,
            .specialist-info-section {
              width: 100% !important;
              min-width: 100% !important;
            }
          }

          /* Desktop - botón cerrar sticky */
          @media (min-width: 769px) {
            .modal-close-btn {
              position: sticky !important;
              // top: 40px !important;
              // left: auto !important;
              // right: 20px !important;
              margin-left: auto !important;
              margin-right: 20px !important;
              float: right !important;
          //     background: white !important;
              backdrop-filter: none !important;
          //     -webkit-backdrop-filter: none !important;
          //     box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
            }
          }

          /* Móviles pequeños */
          @media (max-width: 576px) {
            .specialist-card-modern > div:first-child > div:first-child {
              height: 250px !important;
            }
          }

        `}
      </style>
      
      <main className="cx-page">
        {/* Encabezado premium */}
        <section className="cx-subhero">
          <Decor variant="a" />
          <div className="cx-container">
            <Reveal className="cx-subhero-inner">
              <span className="cx-eyebrow"><i className="bi bi-people-fill" /> Nuestro equipo</span>
              <RevealText as="h1" text="Nuestros Especialistas" />
              <p>Conoce a nuestro equipo de profesionales altamente calificados y comprometidos con tu bienestar.</p>
              <nav className="cx-breadcrumb">
                <Link to="/">Inicio</Link>
                <i className="bi bi-chevron-right" />
                <span>Especialistas</span>
              </nav>
            </Reveal>
          </div>
        </section>



        {/* Buscador */}
        <section className="cx-spec-searchband">
          <div className="cx-container">
            <div className="cx-search">
              <i className="bi bi-search" />
              <input
                type="text"
                placeholder="Buscar terapeuta por nombre..."
                value={searchTerm}
                onChange={handleSearch}
              />
              {searchTerm && (
                <button className="cx-search-clear" onClick={clearSearch} aria-label="Limpiar búsqueda">
                  <i className="bi bi-x-lg" />
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="cx-section cx-section--deco cx-spec-section">
          <Decor variant="b" />
          <div className="cx-container">
            {/* Botón filtros (móvil) */}
            <button className="cx-filter-toggle" onClick={toggleFiltersMobile}>
              <i className="bi bi-funnel-fill" /> Filtrar especialistas
              {(filtroArea || filtroServicio) && (
                <span className="cx-filter-count">{[filtroArea, filtroServicio].filter(Boolean).length}</span>
              )}
            </button>

            <div className="cx-spec-layout">
              {/* Backdrop móvil */}
              <div
                className={`cx-filter-backdrop ${showFiltersMobile ? 'on' : ''}`}
                onClick={closeFiltersMobile}
              />

              {/* Filtros */}
              <aside className={`cx-filters ${showFiltersMobile ? 'on' : ''}`}>
                <div className="cx-filters-inner">
                  <div className="cx-filters-head">
                    <h3><i className="bi bi-funnel" /> Filtros</h3>
                    <div className="cx-filters-actions">
                      {(filtroArea || filtroServicio) && (
                        <button className="cx-filters-clear" onClick={clearAllFilters}>Limpiar</button>
                      )}
                      <button className="cx-filters-x" onClick={closeFiltersMobile} aria-label="Cerrar">
                        <i className="bi bi-x-lg" />
                      </button>
                    </div>
                  </div>

                  <div className="cx-filter-group">
                    <h4><i className="bi bi-people" /> Área de atención</h4>
                    <div className="cx-filter-opts">
                      {areasUnicas.map(area => (
                        <label key={area} className={`cx-filter-opt ${filtroArea === area ? 'on' : ''}`}>
                          <input
                            type="radio" name="area" value={area}
                            checked={filtroArea === area}
                            onChange={(e) => setFiltroArea(e.target.value)}
                          />
                          <span>{area}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="cx-filter-group">
                    <h4><i className="bi bi-heart-pulse" /> Servicios</h4>
                    <div className="cx-filter-opts cx-filter-opts--scroll">
                      {serviciosUnicos.map(servicio => (
                        <label key={servicio} className={`cx-filter-opt ${filtroServicio === servicio ? 'on' : ''}`}>
                          <input
                            type="radio" name="servicio" value={servicio}
                            checked={filtroServicio === servicio}
                            onChange={(e) => setFiltroServicio(e.target.value)}
                          />
                          <span>{servicio}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="cx-filters-result">
                    {filteredSpecialists.length === specialists.length ? (
                      <span><i className="bi bi-check-circle" /> {filteredSpecialists.length} especialistas</span>
                    ) : (
                      <span><i className="bi bi-funnel-fill" /> {filteredSpecialists.length} de {specialists.length}</span>
                    )}
                  </div>
                </div>
              </aside>

              {/* Grid de Especialistas */}
              <div className="cx-spec-main">
            {loading ? (
              <div className="cx-spec-loading">
                <span className="cx-spinner" />
                <p>Cargando terapeutas...</p>
              </div>
            ) : (
              <div id="specialistsContainer" className="cx-spec-grid">
                {filteredSpecialists.map((specialist, index) => (
                  <Reveal
                    key={specialist.id}
                    className="cx-spec-card"
                    delay={(index % 2) * 0.06}
                    y={20}
                    onClick={() => handleVerDetalle(specialist)}
                  >
                    <div className="cx-spec-top">
                      <div className="cx-spec-photo">
                        <img src={specialist.img} alt={specialist.name} onError={handleImageError} />
                      </div>
                      <div className="cx-spec-meta">
                        <h3>Lic. {specialist.name}</h3>
                        <span className="cx-spec-title">
                          <i className="bi bi-patch-check-fill" /> {specialist.title}
                        </span>
                        <span className="cx-spec-areas">
                          <i className="bi bi-people-fill" />
                          {Array.isArray(specialist.areas)
                            ? specialist.areas.map(a => typeof a === 'string' ? a : a.nombre).join(' • ')
                            : 'Sin área'}
                        </span>
                      </div>
                    </div>

                    <div className="cx-spec-services">
                      <h4><i className="bi bi-heart-pulse" /> Servicios ({specialist.services.length})</h4>
                      <div className="cx-spec-tags">
                        {specialist.services.length > 0 ? (
                          specialist.services.map((service, idx) => (
                            <span key={idx}>{service}</span>
                          ))
                        ) : (
                          <span className="cx-spec-tag-empty">Sin servicios</span>
                        )}
                      </div>
                    </div>

                    <span className="cx-spec-btn">
                      Ver perfil <i className="bi bi-arrow-right" />
                    </span>
                  </Reveal>
                ))}
              </div>
            )}

            {!loading && filteredSpecialists.length === 0 && (
              <div className="cx-spec-empty">
                <i className="bi bi-search" />
                <h4>No se encontraron especialistas</h4>
                <p>Intenta con otros términos o quita los filtros.</p>
              </div>
            )}
              </div>
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="cx-section">
          <div className="cx-container">
            <Reveal className="cx-cta-band" y={30}>
              <span className="cx-cta-glow" aria-hidden="true" />
              <span className="cx-cta-glow cx-cta-glow--2" aria-hidden="true" />
              <div className="cx-cta-content">
                <span className="cx-cta-eyebrow"><i className="bi bi-heart-pulse" /> Estamos para ti</span>
                <RevealText as="h2" text="¿Listo para comenzar tu proceso terapéutico?" />
                <p>Nuestro equipo está preparado para acompañarte en tu camino hacia el bienestar. Agenda tu cita hoy y da el primer paso.</p>
                <div className="cx-cta-actions">
                  <Link to="/contactanos" className="cx-btn cx-cta-btn">
                    <span>Agendar cita</span>
                    <i className="bi bi-arrow-right" />
                  </Link>
                  <Link to="/servicios" className="cx-btn cx-cta-btn-ghost">
                    Ver servicios
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* Modal de detalle del terapeuta */}
      {showModal && <SpecialistDetailModal />}
    </>
  );
}