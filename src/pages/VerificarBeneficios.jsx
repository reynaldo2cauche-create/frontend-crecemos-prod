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

  const getCategoriaIcono = (categoria) => {
    const iconos = {
      'Salud Visual': '👁️',
      'Salud': '🏥',
      'Actividad Física': '💪',
      'Fitness': '🏋️',
      'Educación': '📚',
      'Salud Dental': '🦷',
      'Bienestar': '🌟',
      'Entretenimiento': '🎭',
      'Gastronomía': '🍽️',
      'Tecnología': '💻'
    };
    return iconos[categoria] || '🎁';
  };

  return (
    <div style={styles.wrapper}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.brand}>
            <div style={styles.logo}>CTC</div>
            <div style={styles.brandText}>
              <h1 style={styles.brandTitle}>Consulta de Beneficios</h1>
              <p style={styles.brandSubtitle}>Verifica beneficios disponibles para pacientes activos</p>
            </div>
          </div>
          <a style={styles.linkWeb} href="https://www.crecemos.com.pe" target="_blank" rel="noreferrer">
            www.crecemos.com.pe
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.mainContent}>
        <div style={styles.gridLayout}>
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
                También puedes abrir esta página con <strong>?dni=12345678</strong> y consultará automáticamente.
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
            <div style={styles.resultHeader}>
              <div style={{
                ...styles.statusBadge,
                ...(estado === 'success' ? styles.statusSuccess : 
                    estado === 'warning' ? styles.statusWarning : 
                    estado === 'error' ? styles.statusError : 
                    styles.statusIdle)
              }}>
                {estadoTexto}
              </div>
              {paciente && (
                <span style={styles.tipoBadge}>
                  {paciente.activo ? 'Paciente Activo' : 'Paciente Inactivo'}
                </span>
              )}
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

              {paciente && (
                <>
                  {/* Información del paciente */}
                  <div style={styles.infoCards}>
                    <div style={styles.infoCard}>
                      <div style={styles.cardLabel}>Paciente</div>
                      <div style={styles.cardValue}>
                        <strong>
                          {`${paciente.nombres} ${paciente.apellido_paterno} ${paciente.apellido_materno}`}
                        </strong>
                      </div>
                      <div style={styles.cardLabel}>Documento de Identidad</div>
                      <div style={styles.cardValue}>
                        DNI {paciente.numero_documento}
                      </div>
                      <div style={styles.cardLabel}>Estado</div>
                      <div style={styles.cardValue}>
                        <span style={paciente.activo ? styles.estadoActivo : styles.estadoInactivo}>
                          ● {paciente.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Lista de beneficios */}
                  {beneficios.length > 0 ? (
                    <div style={styles.beneficiosContainer}>
                      <h3 style={styles.beneficiosTitulo}>
                        Beneficios Disponibles ({totalBeneficios})
                      </h3>
                      
                      {beneficios.map((beneficio) => (
                        <div key={beneficio.id} style={styles.beneficioCard}>
                          <div style={styles.beneficioHeader}>
                            <div style={styles.beneficioIcono}>
                              {getCategoriaIcono(beneficio.categoria)}
                            </div>
                            <div style={styles.beneficioTitleSection}>
                              <h4 style={styles.beneficioEmpresa}>{beneficio.empresa}</h4>
                              <span style={styles.beneficioCategoria}>
                                {beneficio.categoria} {beneficio.subcategoria && `• ${beneficio.subcategoria}`}
                              </span>
                            </div>
                            <div style={styles.beneficioDescuento}>{beneficio.descuento}</div>
                          </div>

                          <div style={styles.beneficioBody}>
                            <p style={styles.beneficioDescripcion}>{beneficio.descripcion}</p>
                            
                            <div style={styles.beneficioGrid}>
                              <div>
                                <div style={styles.beneficioLabel}>Cómo canjear</div>
                                <div style={styles.beneficioTexto}>{beneficio.como_canjear}</div>
                              </div>
                              <div>
                                <div style={styles.beneficioLabel}>Vigencia</div>
                                <div style={styles.beneficioTexto}>{beneficio.vigencia}</div>
                              </div>
                            </div>

                            <div style={styles.beneficioCodigo}>
                              <div style={styles.beneficioLabel}>Código</div>
                              <div style={styles.codigoHighlight}>{beneficio.codigo}</div>
                              <button 
                                style={styles.btnCopiar} 
                                onClick={() => copiarCodigo(beneficio.codigo)}
                              >
                                📋 Copiar código
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{...styles.alert, ...styles.alertInfo}}>
                      No hay beneficios disponibles en este momento.
                    </div>
                  )}

                  <div style={{...styles.alert, ...styles.alertInfo}}>
                    <strong>Nota:</strong> Presenta tu DNI junto con el código del beneficio para canjearlo en el establecimiento correspondiente.
                  </div>
                </>
              )}
            </div>

            {paciente && beneficios.length > 0 && (
              <div style={styles.actionsBar}>
                <button style={styles.btnSecondary} onClick={handleImprimirBeneficios}>
                  🖨️ Imprimir
                </button>
                <button style={styles.btnSecondary} onClick={handleCompartir}>
                  📤 Compartir
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

// Estilos en línea siguiendo el diseño del verificador de documentos
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
    position: 'relative',
    overflow: 'hidden',
  },
  headerInner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1.5rem',
    position: 'relative',
    zIndex: 2,
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
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
    fontSize: '1.75rem',
    fontWeight: '700',
    marginBottom: '0.25rem',
    color: 'white',
    margin: 0,
  },
  brandSubtitle: {
    fontSize: '0.95rem',
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
    padding: '3rem 20px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
  },
  gridLayout: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '2rem',
  },
  panel: {
    background: 'white',
    borderRadius: '20px',
    padding: '2.5rem',
    boxShadow: '0 5px 25px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e9ecef',
  },
  panelTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1.75rem',
    color: '#2563eb',
  },
  panelTitleText: {
    fontSize: '1.5rem',
    fontWeight: '700',
    margin: 0,
    color: '#2d465e',
  },
  formLabel: {
    display: 'block',
    fontWeight: '600',
    marginBottom: '0.75rem',
    color: '#2d465e',
    fontSize: '1rem',
  },
  input: {
    width: '100%',
    padding: '1rem 1.25rem',
    border: '2px solid #e9ecef',
    borderRadius: '12px',
    fontSize: '1.05rem',
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
    fontSize: '0.875rem',
    color: '#6c757d',
    marginTop: '0.75rem',
    marginBottom: '1.5rem',
    lineHeight: '1.6',
  },
  btnValidar: {
    width: '100%',
    padding: '1rem 1.5rem',
    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1.05rem',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)',
    transition: 'all 0.3s',
  },
  btnValidarDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  infoNote: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1.75rem',
    padding: '1.5rem',
    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
    borderRadius: '12px',
    fontSize: '0.9rem',
    color: '#212529',
    border: '1px solid #dee2e6',
  },
  infoNoteText: {
    margin: 0,
  },
  resultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
    marginBottom: '2rem',
  },
  statusBadge: {
    padding: '0.75rem 1.5rem',
    borderRadius: '10px',
    fontWeight: '700',
    fontSize: '1rem',
    letterSpacing: '0.3px',
  },
  statusSuccess: {
    background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
    color: '#155724',
    border: '1px solid #c3e6cb',
  },
  statusWarning: {
    background: 'linear-gradient(135deg, #fff3cd 0%, #ffe8a1 100%)',
    color: '#856404',
    border: '1px solid #ffeeba',
  },
  statusError: {
    background: 'linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)',
    color: '#721c24',
    border: '1px solid #f5c6cb',
  },
  statusIdle: {
    background: '#e9ecef',
    color: '#6c757d',
    border: '1px solid #dee2e6',
  },
  tipoBadge: {
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%)',
    borderRadius: '10px',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#2d465e',
    border: '1px solid #dee2e6',
  },
  resultContent: {
    minHeight: '250px',
  },
  alert: {
    padding: '1.5rem',
    borderRadius: '12px',
    marginBottom: '1.5rem',
    lineHeight: '1.7',
    fontSize: '1rem',
  },
  alertInfo: {
    background: 'linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%)',
    color: '#0c5460',
    borderLeft: '5px solid #17a2b8',
  },
  alertWarning: {
    background: 'linear-gradient(135deg, #fff3cd 0%, #ffe8a1 100%)',
    color: '#856404',
    borderLeft: '5px solid #ffc107',
  },
  alertError: {
    background: 'linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)',
    color: '#721c24',
    borderLeft: '5px solid #dc3545',
  },
  alertCode: {
    background: 'rgba(0, 0, 0, 0.1)',
    padding: '0.25rem 0.75rem',
    borderRadius: '6px',
    fontFamily: "'Courier New', monospace",
    fontWeight: '700',
    fontSize: '1.05rem',
  },
  infoCards: {
    display: 'grid',
    gap: '1.25rem',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    marginBottom: '1.5rem',
  },
  infoCard: {
    padding: '1.75rem',
    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
    borderRadius: '12px',
    border: '1px solid #dee2e6',
  },
  cardLabel: {
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    color: '#6c757d',
    fontWeight: '700',
    marginBottom: '0.5rem',
    marginTop: '1rem',
  },
  cardValue: {
    fontSize: '1rem',
    color: '#212529',
    lineHeight: '1.6',
    fontWeight: '500',
  },
  estadoActivo: {
    color: '#28a745',
    fontWeight: '700',
    fontSize: '1.05rem',
  },
  estadoInactivo: {
    color: '#dc3545',
    fontWeight: '700',
    fontSize: '1.05rem',
  },
  beneficiosContainer: {
    marginTop: '2rem',
  },
  beneficiosTitulo: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#2d465e',
    marginBottom: '1.5rem',
  },
  beneficioCard: {
    background: 'white',
    border: '2px solid #e9ecef',
    borderRadius: '16px',
    marginBottom: '1.5rem',
    overflow: 'hidden',
    transition: 'all 0.3s',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  beneficioHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1.5rem',
    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
    borderBottom: '1px solid #bfdbfe',
  },
  beneficioIcono: {
    fontSize: '2rem',
    width: '50px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    flexShrink: 0,
  },
  beneficioTitleSection: {
    flex: 1,
    minWidth: 0,
  },
  beneficioEmpresa: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1e40af',
    margin: '0 0 0.25rem 0',
  },
  beneficioCategoria: {
    fontSize: '0.875rem',
    color: '#6b7280',
    fontWeight: '600',
  },
  beneficioDescuento: {
    padding: '0.5rem 1rem',
    background: '#2563eb',
    color: 'white',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '0.95rem',
    flexShrink: 0,
  },
  beneficioBody: {
    padding: '1.5rem',
  },
  beneficioDescripcion: {
    fontSize: '1rem',
    color: '#4b5563',
    marginBottom: '1.5rem',
    lineHeight: '1.6',
  },
  beneficioGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  beneficioLabel: {
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    color: '#6c757d',
    fontWeight: '700',
    marginBottom: '0.5rem',
  },
  beneficioTexto: {
    fontSize: '0.95rem',
    color: '#212529',
    fontWeight: '500',
  },
  beneficioCodigo: {
    background: '#f8f9fa',
    padding: '1rem',
    borderRadius: '10px',
    border: '2px dashed #dee2e6',
  },
  codigoHighlight: {
    fontFamily: "'Courier New', monospace",
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#2563eb',
    letterSpacing: '2px',
    padding: '0.5rem',
    textAlign: 'center',
    background: 'white',
    borderRadius: '8px',
    margin: '0.5rem 0',
  },
  btnCopiar: {
    width: '100%',
    padding: '0.75rem',
    background: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '0.5rem',
    transition: 'all 0.3s',
  },
  actionsBar: {
    display: 'flex',
    gap: '1rem',
    marginTop: '2rem',
    paddingTop: '2rem',
    borderTop: '2px solid #dee2e6',
  },
  btnSecondary: {
    flex: 1,
    padding: '0.875rem 1.5rem',
    background: 'white',
    border: '2px solid #dee2e6',
    borderRadius: '10px',
    color: '#2d465e',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'all 0.3s',
  },
};

export default VerificarBeneficios;