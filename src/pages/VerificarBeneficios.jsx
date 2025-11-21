import React, { useState, useEffect } from 'react';
import { verificarPacienteYObtenerBeneficios } from '../services/pacienteService';

const VerificarBeneficios = () => {
  const [dni, setDni] = useState('');
  const [paciente, setPaciente] = useState(null);
  const [beneficios, setBeneficios] = useState([]);
  const [totalBeneficios, setTotalBeneficios] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [estado, setEstado] = useState('idle');
  const [estadoTexto, setEstadoTexto] = useState('Esperando DNI…');

  // Validar y obtener beneficios desde la API real
  const validarBeneficiosHandler = async (dniValidar) => {
    setLoading(true);
    setError('');
    setPaciente(null);
    setBeneficios([]);
    setEstado('idle');
    setEstadoTexto('Validando...');

    try {
      const data = await verificarPacienteYObtenerBeneficios(dniValidar);

      setPaciente(data.paciente);
      setBeneficios(data.beneficios);
      setTotalBeneficios(data.total_beneficios);
      setEstado('success');
      setEstadoTexto(`${data.total_beneficios} Beneficio${data.total_beneficios !== 1 ? 's' : ''} disponible${data.total_beneficios !== 1 ? 's' : ''}`);

    } catch (err) {
      console.error('Error completo:', err);
      
      let errorMessage = 'No se pudo verificar el paciente. Intente nuevamente.';
      
      if (err.response) {
        const status = err.response.status;
        if (status === 404) {
          errorMessage = 'No se encontró ningún paciente registrado con el número de documento proporcionado.';
          setEstado('error');
        } else if (status === 403) {
          errorMessage = 'El paciente se encuentra inactivo en el sistema y actualmente no cuenta con acceso a beneficios. Por favor, comuníquese con el área de atención al cliente para más información.';
          setEstado('warning');
        } else if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
          setEstado('error');
        }
      } else if (err.request) {
        errorMessage = 'Error de conexión. Verifique su internet.';
        setEstado('error');
      }
      
      setError(errorMessage);
      setEstadoTexto('Error en verificación');
      setPaciente(null);
      setBeneficios([]);
    } finally {
      setLoading(false);
    }
  };

  // Validar desde URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dniUrl = params.get('dni');
    if (dniUrl && /^\d{8}$/.test(dniUrl)) {
      setDni(dniUrl);
      validarBeneficiosHandler(dniUrl);
    }
  }, []);

  const handleValidar = (e) => {
    e.preventDefault();
    
    setPaciente(null);
    setBeneficios([]);
    setError('');
    setEstado('idle');
    setEstadoTexto('Validando...');
    
    const dniNormalizado = dni.trim();

    if (!/^\d{8}$/.test(dniNormalizado)) {
      setError('El DNI debe tener exactamente 8 dígitos numéricos.');
      setEstado('error');
      setEstadoTexto('DNI inválido');
      return;
    }

    validarBeneficiosHandler(dniNormalizado);
  };

  const handleCompartir = async () => {
    if (!paciente) return;
    
    const url = `${window.location.origin}${window.location.pathname}?dni=${encodeURIComponent(paciente.numero_documento)}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Beneficios – CTC',
          text: 'Consulta de beneficios disponibles',
          url: url
        });
      } catch (err) {
        console.log('Error al compartir:', err);
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      alert('Enlace copiado al portapapeles');
    }
  };

  const handleImprimirBeneficios = () => {
    window.print();
  };

  const copiarCodigo = async (codigo) => {
    try {
      await navigator.clipboard.writeText(codigo);
      alert(`Código ${codigo} copiado al portapapeles`);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin vencimiento';
    const date = new Date(fecha);
    const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('es-PE', opciones);
  };

  return (
    <div style={styles.wrapper}>
      {/* Media queries con style tag */}
      <style>{`
        @media (max-width: 968px) {
          .grid-layout {
            grid-template-columns: 1fr !important;
          }
        }
        
        @media (max-width: 768px) {
          .header-inner {
            flex-direction: column;
            text-align: center;
          }
          
          .brand {
            flex-direction: column;
            text-align: center;
          }
          
          .action-buttons {
            flex-wrap: wrap;
            justify-content: center;
            width: 100%;
          }
          
          .result-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .beneficio-card-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .beneficio-footer {
            flex-direction: column;
            gap: 0.75rem;
            align-items: stretch;
          }
        }
        
        @media print {
          .no-print {
            display: none !important;
          }
        }
        
        @media (min-width: 1400px) {
          .beneficios-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        
        @media (min-width: 1000px) and (max-width: 1399px) {
          .beneficios-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        
        @media (max-width: 999px) {
          .beneficios-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerInner} className="header-inner">
          <div style={styles.brand} className="brand">
           
            <div style={styles.brandText}>
              <h1 style={styles.brandTitle}>Consulta de Beneficios</h1>
              <p style={styles.brandSubtitle}>Verifica beneficios disponibles para pacientes activos</p>
            </div>
          </div>
          
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.mainContent}>
        <div style={styles.gridLayout} className="grid-layout">
          {/* Panel de búsqueda */}
          <div style={styles.panel}>
            <div style={styles.panelTitle}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <h2 style={styles.panelTitleText}>Consulta por DNI</h2>
            </div>

            <div>
              <label htmlFor="dni" style={styles.formLabel}>DNI del paciente</label>
              <input
                id="dni"
                style={{
                  ...styles.input,
                  ...(error && estado === 'error' ? styles.inputInvalid : {})
                }}
                placeholder="Ingresa 8 dígitos"
                value={dni}
                onChange={(e) => setDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
                autoComplete="off"
                maxLength="8"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleValidar(e);
                  }
                }}
              />
              <div style={styles.helperText}>
                Prueba con: <strong>12345678</strong> o <strong>87654321</strong> (mock).
              </div>

              <button 
                onClick={handleValidar} 
                style={{
                  ...styles.btnValidar,
                  ...(loading ? styles.btnValidarDisabled : {})
                }} 
                disabled={loading}
              >
                {loading ? 'Consultando...' : 'Consultar beneficios'}
              </button>
            </div>

            <div style={styles.infoNote}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 3l7 3v5c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-3Z" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              <p style={styles.infoNoteText}>
                Sistema de consulta oficial del <strong>Centro de Terapias Crecemos</strong>. 
                Verifica los beneficios disponibles para pacientes activos.
              </p>
            </div>
          </div>

          {/* Panel de resultado */}
          <div style={styles.panel}>
            <div style={styles.resultHeader} className="result-header">
              <div style={{
                ...styles.statusBadge,
                ...(estado === 'success' ? styles.statusSuccess : 
                    estado === 'warning' ? styles.statusWarning : 
                    estado === 'error' ? styles.statusError : 
                    styles.statusIdle)
              }}>
                {estadoTexto}
              </div>
              <div style={styles.actionButtons} className="action-buttons no-print">
                
                <button style={styles.btnAction} onClick={handleImprimirBeneficios}>Imprimir</button>
                <button style={styles.btnActionPrimary} onClick={handleCompartir}>Compartir</button>
              </div>
            </div>

            <div style={styles.resultContent}>
              {!paciente && !error && (
                <div style={{...styles.alert, ...styles.alertInfo}}>
                  Ingrese un DNI válido de 8 dígitos para consultar beneficios disponibles.
                </div>
              )}

              {error && (
                <div style={{...styles.alert, ...(estado === 'warning' ? styles.alertWarning : styles.alertError)}}>
                  <strong>{estado === 'warning' ? 'Advertencia:' : 'Error:'}</strong> {error}
                  <br />
                  <small>DNI: <code style={styles.alertCode}>{dni}</code></small>
                </div>
              )}

              {paciente && beneficios.length > 0 && (
                <>
                  <div style={styles.vistaEjemplo}>Vista de ejemplo activa.</div>

                  {/* Grid de beneficios - responsive */}
                  <div style={styles.beneficiosGrid} className="beneficios-grid">
                    {beneficios.map((beneficio) => (
                      <div key={beneficio.id} style={styles.beneficioCard}>
                        {/* Header con icono y título */}
                        <div style={styles.beneficioCardHeader} className="beneficio-card-header">
                          <div style={styles.beneficioIconContainer}>
                            <span style={styles.beneficioIcono}>{beneficio.icono}</span>
                          </div>
                          <div style={styles.beneficioTitleArea}>
                            <h4 style={styles.beneficioNombre}>{beneficio.nombre}</h4>
                            <div style={styles.beneficioMeta}>
                              <span style={styles.beneficioProveedor}>{beneficio.proveedor}</span>
                            </div>
                          </div>
                          <div style={styles.beneficioDescuentoBadge}>{beneficio.descuento}</div>
                        </div>

                        {/* Descripción */}
                        <p style={styles.beneficioDescripcion}>{beneficio.descripcion}</p>

                        {/* Tags de categoría */}
                        <div style={styles.beneficioTags}>
                          <span style={styles.tagCategoria}>{beneficio.categoria}</span>
                          {beneficio.etiqueta && (
                            <span style={styles.tagEtiqueta}>{beneficio.etiqueta}</span>
                          )}
                        </div>

                        {/* Info grid */}
                        <div style={styles.beneficioInfoGrid}>
                          <div>
                            <div style={styles.infoLabel}>Cómo canjear</div>
                            <div style={styles.infoTexto}>{beneficio.como_canjear}</div>
                          </div>
                          <div>
                            <div style={styles.infoLabel}>Vigencia</div>
                            <div style={styles.infoTexto}>{formatearFecha(beneficio.fecha_vigencia)}</div>
                          </div>
                        </div>

                        {/* Código y botón */}
                        <div style={styles.beneficioFooter} className="beneficio-footer">
                          <div>
                            <div style={styles.codigoLabel}>Código: <strong style={styles.codigoTexto}>{beneficio.codigo_beneficio}</strong></div>
                          </div>
                          <button 
                            style={styles.btnCopiar} 
                            onClick={() => copiarCodigo(beneficio.codigo_beneficio)}
                          >
                            Copiar
                          </button>
                        </div>

                        {/* Link términos */}
                        <a href="#" style={styles.linkTerminos}>Ver términos y condiciones</a>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {paciente && beneficios.length === 0 && (
                <div style={{...styles.alert, ...styles.alertInfo}}>
                  No hay beneficios disponibles en este momento para este paciente.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Estilos siguiendo el diseño de la imagen - RESPONSIVE
const styles = {
  wrapper: {
    fontFamily: "'Roboto', system-ui, sans-serif",
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
  },
  header: {
    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    color: 'white',
    padding: '2.5rem 0',
    boxShadow: '0 4px 20px rgba(37, 99, 235, 0.3)',
  },
  headerInner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1.5rem',
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 20px',
    paddingTop:'100px',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
  },
  logo: {
    width: '60px',
    height: '60px',
    background: 'rgba(255, 255, 255, 0.25)',
    borderRadius: '15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '1.5rem',
    backdropFilter: 'blur(10px)',
    border: '2px solid rgba(255, 255, 255, 0.4)',
  },
  brandText: {
    display: 'flex',
    flexDirection: 'column',
  },
  brandTitle: {
    fontSize: 'clamp(1.25rem, 4vw, 1.75rem)',
    fontWeight: '700',
    marginBottom: '0.25rem',
    color: 'white',
    margin: 0,
  },
  brandSubtitle: {
    fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
    opacity: 0.95,
    fontWeight: '300',
    margin: 0,
  },
  linkWeb: {
    color: 'white',
    textDecoration: 'none',
    fontWeight: '500',
    opacity: 0.95,
    fontSize: '0.95rem',
    padding: '8px 16px',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
  },
  mainContent: {
    flex: 1,
    padding: 'clamp(1.5rem, 4vw, 3rem) 20px',
    maxWidth: '1400px',
    margin: '0 auto',
    width: '100%',
  },
  gridLayout: {
    display: 'grid',
    gridTemplateColumns: 'minmax(300px, 350px) 1fr',
    gap: '2rem',
  },
  panel: {
    background: 'white',
    borderRadius: '20px',
    padding: 'clamp(1.25rem, 3vw, 2rem)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e9ecef',
  },
  panelTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1.5rem',
    color: '#2563eb',
  },
  panelTitleText: {
    fontSize: 'clamp(1.1rem, 3vw, 1.3rem)',
    fontWeight: '700',
    margin: 0,
    color: '#2d465e',
  },
  formLabel: {
    display: 'block',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#2d465e',
    fontSize: '0.95rem',
  },
  input: {
    width: '100%',
    padding: '0.875rem 1rem',
    border: '2px solid #e9ecef',
    borderRadius: '10px',
    fontSize: '1rem',
    fontFamily: "'Courier New', monospace",
    background: '#f8f9fa',
    color: '#212529',
    fontWeight: '500',
    boxSizing: 'border-box',
    transition: 'all 0.3s',
  },
  inputInvalid: {
    borderColor: '#dc3545',
    background: '#fff5f5',
  },
  helperText: {
    fontSize: '0.8rem',
    color: '#6c757d',
    marginTop: '0.5rem',
    marginBottom: '1rem',
  },
  btnValidar: {
    width: '100%',
    padding: '0.875rem 1.25rem',
    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 2px 10px rgba(37, 99, 235, 0.3)',
    transition: 'all 0.3s',
  },
  btnValidarDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  infoNote: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '1.5rem',
    padding: '1rem',
    background: '#f8f9fa',
    borderRadius: '10px',
    fontSize: '0.85rem',
    color: '#212529',
    border: '1px solid #dee2e6',
  },
  infoNoteText: {
    margin: 0,
    lineHeight: 1.5,
  },
  resultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  statusBadge: {
    padding: '0.625rem 1.25rem',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '0.95rem',
  },
  statusSuccess: {
    background: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb',
  },
  statusWarning: {
    background: '#fff3cd',
    color: '#856404',
    border: '1px solid #ffeeba',
  },
  statusError: {
    background: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb',
  },
  statusIdle: {
    background: '#e9ecef',
    color: '#6c757d',
    border: '1px solid #dee2e6',
  },
  actionButtons: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  btnAction: {
    padding: '0.5rem 1rem',
    background: 'white',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
    color: '#495057',
    transition: 'all 0.2s',
  },
  btnActionPrimary: {
    padding: '0.5rem 1rem',
    background: '#212529',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    color: 'white',
    transition: 'all 0.2s',
  },
  resultContent: {
    minHeight: '200px',
  },
  alert: {
    padding: '1rem',
    borderRadius: '10px',
    marginBottom: '1rem',
    fontSize: '0.95rem',
  },
  alertInfo: {
    background: '#d1ecf1',
    color: '#0c5460',
    borderLeft: '4px solid #17a2b8',
  },
  alertWarning: {
    background: '#fff3cd',
    color: '#856404',
    borderLeft: '4px solid #ffc107',
  },
  alertError: {
    background: '#f8d7da',
    color: '#721c24',
    borderLeft: '4px solid #dc3545',
  },
  alertCode: {
    background: 'rgba(0, 0, 0, 0.1)',
    padding: '0.125rem 0.5rem',
    borderRadius: '4px',
    fontFamily: "'Courier New', monospace",
    fontWeight: '600',
  },
  vistaEjemplo: {
    padding: '0.75rem',
    background: '#e7f3ff',
    borderRadius: '8px',
    fontSize: '0.9rem',
    color: '#004085',
    marginBottom: '1.5rem',
    textAlign: 'center',
    fontWeight: '500',
  },
  beneficiosGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1.5rem',
  },
  beneficioCard: {
    background: 'white',
    border: '1px solid #e9ecef',
    borderRadius: '12px',
    padding: 'clamp(1rem, 2.5vw, 1.5rem)',
    transition: 'all 0.3s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    height: 'fit-content',
  },
  beneficioCardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    marginBottom: '1rem',
    flexWrap: 'wrap',
  },
  beneficioIconContainer: {
    width: '50px',
    height: '50px',
    background: '#f8f9fa',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    border: '2px solid #e9ecef',
  },
  beneficioIcono: {
    fontSize: '1.75rem',
  },
  beneficioTitleArea: {
    flex: 1,
    minWidth: 0,
  },
  beneficioNombre: {
    fontSize: 'clamp(1rem, 2.5vw, 1.1rem)',
    fontWeight: '700',
    color: '#1e40af',
    margin: '0 0 0.25rem 0',
    lineHeight: 1.3,
  },
  beneficioMeta: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  beneficioProveedor: {
    fontSize: '0.85rem',
    color: '#6c757d',
    fontWeight: '500',
  },
  beneficioDescuentoBadge: {
    padding: '0.375rem 0.75rem',
    background: '#2563eb',
    color: 'white',
    borderRadius: '6px',
    fontSize: '0.85rem',
    fontWeight: '700',
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  beneficioDescripcion: {
    fontSize: '0.9rem',
    color: '#495057',
    marginBottom: '1rem',
    lineHeight: 1.5,
  },
  beneficioTags: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1rem',
    flexWrap: 'wrap',
  },
  tagCategoria: {
    padding: '0.25rem 0.625rem',
    background: '#e9ecef',
    borderRadius: '4px',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#495057',
  },
  tagEtiqueta: {
    padding: '0.25rem 0.625rem',
    background: '#d4edda',
    borderRadius: '4px',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#155724',
  },
  beneficioInfoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '1rem',
    marginBottom: '1rem',
    padding: '1rem',
    background: '#f8f9fa',
    borderRadius: '8px',
  },
  infoLabel: {
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    color: '#6c757d',
    fontWeight: '700',
    marginBottom: '0.25rem',
    letterSpacing: '0.5px',
  },
  infoTexto: {
    fontSize: '0.875rem',
    color: '#212529',
    fontWeight: '500',
    lineHeight: 1.4,
  },
  beneficioFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem',
    background: '#f8f9fa',
    borderRadius: '8px',
    marginBottom: '0.75rem',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  codigoLabel: {
    fontSize: '0.85rem',
    color: '#495057',
  },
  codigoTexto: {
    fontFamily: "'Courier New', monospace",
    color: '#2563eb',
    fontSize: '0.95rem',
    letterSpacing: '0.5px',
  },
  btnCopiar: {
    padding: '0.5rem 1rem',
    background: '#212529',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  linkTerminos: {
    fontSize: '0.85rem',
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: '500',
    display: 'block',
    textAlign: 'center',
  },
};

export default VerificarBeneficios;