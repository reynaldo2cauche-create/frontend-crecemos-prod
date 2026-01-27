import React, { useState, useEffect } from 'react';
import archivosOficialesService from '../services/archivosOficialesService';


const VerificarDocumentos = () => {
  const [codigo, setCodigo] = useState('');
  const [documento, setDocumento] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [estado, setEstado] = useState('idle');
  const [estadoTexto, setEstadoTexto] = useState('Esperando código…');

  const mostrarDNI = (dni) => dni || '********';

  const esDestinatarioActivo = (estado) => {
    if (!estado) return false;
    const id = estado.id || estado;
    const idNum = parseInt(id);
    return idNum >= 1 && idNum <= 4;
  };

  const obtenerTextoEstado = (estado) => {
    const activo = esDestinatarioActivo(estado);
    return activo ? 'Activo' : 'Inactivo';
  };

  const validarDocumentoHandler = async (codigoValidar) => {
    setLoading(true);
    setError('');
    setDocumento(null);
    setEstado('idle');
    setEstadoTexto('Validando...');

    try {
      const response = await archivosOficialesService.validarDocumento(codigoValidar);
      const data = response.data;

      if (!data.valido) {
        setEstado('error');
        setEstadoTexto('Documento inválido');
      } else if (!data.vigente) {
        setEstado('warning');
        setEstadoTexto('Documento expirado');
      } else {
        setEstado('success');
        setEstadoTexto('Documento válido');
      }

      setDocumento(data);
    } catch (err) {
      console.error('Error completo:', err);
      
      let errorMessage = 'Documento no encontrado. Verifique el código e intente nuevamente.';
      
      if (err.response) {
        const status = err.response.status;
        if (status === 404) {
          errorMessage = 'Documento no encontrado. Verifique el código.';
        } else if (status === 500) {
          errorMessage = 'Error del servidor. Intente más tarde.';
        } else if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        errorMessage = 'Error de conexión. Verifique su internet.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setEstado('error');
      setEstadoTexto('Error en validación');
      setDocumento(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'No especificado';
    
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const meses = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
      ];
      return `${day} de ${meses[month - 1]} de ${year}`;
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return dateStr;
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codigoUrl = params.get('code');
    if (codigoUrl) {
      setCodigo(codigoUrl);
      validarDocumentoHandler(codigoUrl);
    }
  }, []);

  const handleValidar = (e) => {
    e.preventDefault();
    
    setDocumento(null);
    setError('');
    setEstado('idle');
    setEstadoTexto('Validando...');
    
    const codigoNormalizado = codigo.trim().toUpperCase();

    if (!/^CTC-[A-Z0-9]{3,50}$/.test(codigoNormalizado)) {
      setError('Formato de código inválido. Use: CTC-XXXXX');
      setEstado('error');
      setEstadoTexto('Código inválido');
      return;
    }

    validarDocumentoHandler(codigoNormalizado);
  };

  const handleImprimirComprobante = () => {
    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    
    const printContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <title>Comprobante de Validación - CTC</title>
        <meta charset="utf-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.4;
            color: #1a1a1a;
            background: #ffffff;
            padding: 30px;
            max-width: 900px;
            margin: 0 auto;
          }
          .comprobante-container {
            border: 3px solid #174ea6;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #174ea6 0%, #2d3748 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-bottom: 4px solid #A3C644;
          }
          .status-banner {
            text-align: center;
            padding: 20px;
            margin: 25px;
            border-radius: 10px;
            font-weight: 700;
            font-size: 22px;
            border: 3px solid;
            background: ${estado === 'success' ? '#f0fdf4' : estado === 'warning' ? '#fffbeb' : '#fef2f2'};
            border-color: ${estado === 'success' ? '#22c55e' : estado === 'warning' ? '#f59e0b' : '#dc2626'};
            color: ${estado === 'success' ? '#166534' : estado === 'warning' ? '#92400e' : '#dc2626'};
          }
          .document-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 25px;
            padding: 30px;
          }
          .document-section {
            padding: 25px;
            border: 2px solid #e2e8f0;
            border-radius: 10px;
            background: #f8fafc;
          }
          .section-title {
            font-size: 16px;
            font-weight: 700;
            color: #2d3748;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #cbd5e0;
          }
          .field {
            margin-bottom: 15px;
          }
          .field-label {
            font-size: 13px;
            font-weight: 600;
            color: #4a5568;
            display: block;
            margin-bottom: 5px;
          }
          .field-value {
            font-size: 15px;
            font-weight: 600;
            color: #1a202c;
          }
          .code-highlight {
            font-family: 'Courier New', monospace;
            font-size: 20px;
            font-weight: 800;
            letter-spacing: 2px;
            color: #174ea6;
            background: #edf2f7;
            padding: 12px;
            border-radius: 8px;
            text-align: center;
            margin: 10px 0;
            border: 2px solid #cbd5e0;
          }
          .footer {
            background: #174ea6;
            color: white;
            padding: 25px;
            text-align: center;
            border-top: 4px solid #A3C644;
          }
          .print-controls {
            text-align: center;
            padding: 25px;
            background: #f7fafc;
          }
          .print-button {
            background: #174ea6;
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            margin: 0 10px;
          }
          @media print {
            .print-controls { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="comprobante-container">
          <div class="header">
            <div style="font-size: 28px; font-weight: 700; margin-bottom: 8px;">CENTRO DE TERAPIAS CRECEMOS</div>
            <div style="font-size: 16px;">COMPROBANTE DE VALIDACIÓN OFICIAL</div>
          </div>
          
          <div class="status-banner">${estadoTexto.toUpperCase()}</div>
          
          <div class="document-grid">
            <div class="document-section">
              <div class="section-title">INFORMACIÓN DEL DOCUMENTO</div>
              <div class="field">
                <span class="field-label">Código de Validación</span>
                <div class="code-highlight">${documento.codigo}</div>
              </div>
              <div class="field">
                <span class="field-label">Tipo de Documento</span>
                <div class="field-value">${documento.tipoDocumento}</div>
              </div>
              ${documento.terapeuta ? `
              <div class="field">
                <span class="field-label">Terapeuta Responsable</span>
                <div class="field-value">${documento.terapeuta.nombres} ${documento.terapeuta.apellidos}</div>
              </div>` : ''}
              <div class="field">
                <span class="field-label">Fecha de Emisión</span>
                <div class="field-value">${formatDate(documento.fechaEmision)}</div>
              </div>
            </div>
            
            <div class="document-section">
              <div class="section-title">${documento.tipoDestinatario === 'paciente' ? 'INFORMACIÓN DEL PACIENTE' : 'INFORMACIÓN DEL TRABAJADOR'}</div>
              <div class="field">
                <span class="field-label">Nombre Completo</span>
                <div class="field-value"><strong>${documento.destinatario?.nombres || 'N/A'} ${documento.destinatario?.apellidos || ''}</strong></div>
              </div>
              <div class="field">
                <span class="field-label">DNI</span>
                <div class="field-value">${documento.destinatario?.dni || '****'}</div>
              </div>
              <div class="field">
                <span class="field-label">Estado</span>
                <div class="field-value">${documento.destinatario?.activo ? 'ACTIVO' : 'INACTIVO'}</div>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <div>Centro de Terapias Crecemos</div>
            <div>Sistema de Validación Oficial</div>
          </div>
        </div>
        
        <div class="print-controls">
          <button class="print-button" onclick="window.print()">🖨️ Imprimir</button>
          <button class="print-button" onclick="window.close()">Cerrar</button>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const handleDescargarPDF = async () => {
    if (!documento || !documento.id) return;
    try {
      await archivosOficialesService.descargarArchivoValidado(documento.id, documento.codigo);
    } catch (error) {
      console.error('Error al descargar:', error);
      alert('No se pudo descargar el documento.');
    }
  };

  const handleCompartir = async () => {
    if (!documento) return;
    const url = `${window.location.origin}${window.location.pathname}?code=${encodeURIComponent(documento.codigo)}`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Validador CTC', text: 'Verificación de documento', url });
      } catch (err) {
        console.log('Error al compartir:', err);
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      alert('Enlace copiado al portapapeles');
    }
  };

  return (
    <div className="verificador-container">
      {/* Partículas decorativas de fondo */}
      <div className="floating-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
      </div>

      {/* Hero Section */}
      <section className="hero-verificador">
        <div className="hero-content">
          {/* Badge ULTRA VISIBLE con fondo blanco sólido */}
          <div className="company-badge p-2">
            <i className="bi bi-shield-check"></i>
            <span>Sistema Oficial de Validación</span>
          </div>

          <h1 className="hero-title">
            Verificador de <br />
            <span className="accent-text">
              Documentos
              <svg className="title-underline" viewBox="0 0 200 12">
                <path d="M0,6 Q50,0 100,6 T200,6" stroke="url(#gradient)" strokeWidth="3" fill="none"/>
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#174ea6" />
                    <stop offset="100%" stopColor="#A3C644" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h1>

          <p className="hero-description">
            Valida la autenticidad de certificados y constancias emitidos por el
            Centro de Terapias Crecemos de forma rápida y segura
          </p>

          {/* Stats rápidos */}
          <div className="hero-stats">
            <div className="stat-badge">
              <i className="bi bi-file-earmark-check"></i>
              <span>100% Verificable</span>
            </div>
            <div className="stat-badge">
              <i className="bi bi-lightning-charge"></i>
              <span>Validación Instantánea</span>
            </div>
            <div className="stat-badge">
              <i className="bi bi-shield-lock"></i>
              <span>Sistema Seguro</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section - SIN ICONO QUE TAPE EL PLACEHOLDER */}
      <section className="search-section">
        <div className="search-container">
          <form onSubmit={handleValidar} className="search-form">
            <div className="search-box">
              <input
                type="text"
                className="search-input"
                placeholder="Ingrese el código de validación"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                autoComplete="off"
              />
              <button type="submit" className="search-button" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    <span>Verificando</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-search"></i>
                    <span>Verificar</span>
                  </>
                )}
              </button>
            </div>
            <p className="search-hint">
              <i className="bi bi-info-circle"></i>
              El código se encuentra en la parte superior de su documento oficial
            </p>
          </form>
        </div>
      </section>

      {/* Results Section */}
      {(documento || error) && (
        <section className="results-section">
          <div className="results-container">
            
            {/* Status Alert */}
            <div className={`status-alert status-${estado}`}>
              <div className="status-icon-wrapper">
                <div className="status-icon">
                  {estado === 'success' && <i className="bi bi-check-circle-fill"></i>}
                  {estado === 'error' && <i className="bi bi-x-circle-fill"></i>}
                  {estado === 'warning' && <i className="bi bi-exclamation-triangle-fill"></i>}
                </div>
              </div>
              <div className="status-content">
                <h3>{estadoTexto}</h3>
                {documento && <p>{documento.tipoDocumento}</p>}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="error-message">
                <div className="error-icon">
                  <i className="bi bi-exclamation-circle"></i>
                </div>
                <div className="error-content">
                  <strong>Error de validación</strong>
                  <p>{error}</p>
                  <code>Código: {codigo.trim().toUpperCase()}</code>
                </div>
              </div>
            )}

            {/* Document Info */}
            {documento && (
              <>
                <div className="document-info">
                  
                  {/* Código Principal */}
                  <div className="codigo-principal">
                    <div className="codigo-header">
                      <div className="codigo-icon">
                        <i className="bi bi-qr-code"></i>
                      </div>
                      <span className="codigo-label">Código de Validación</span>
                    </div>
                    <div className="codigo-value">{documento.codigo}</div>
                    <div className="codigo-badge">
                      <i className="bi bi-shield-check"></i>
                      <span>Código Oficial CTC</span>
                    </div>
                  </div>

                  {/* Info Cards Grid */}
                  <div className="info-cards-grid">
                    <div className="info-card">
                      <div className="card-header">
                        <div className="card-icon">
                          <div className="icon-bg"></div>
                          <i className="bi bi-file-text"></i>
                        </div>
                        <h4>Información del Documento</h4>
                      </div>
                      <div className="card-body">
                        <div className="info-item">
                          <span className="info-label">Tipo</span>
                          <strong className="info-value">{documento.tipoDocumento}</strong>
                        </div>
                        {documento.terapeuta && (
                          <div className="info-item">
                            <span className="info-label">Terapeuta</span>
                            <strong className="info-value">
                              {documento.terapeuta.nombres} {documento.terapeuta.apellidos}
                            </strong>
                          </div>
                        )}
                        <div className="info-item">
                          <span className="info-label">Emisión</span>
                          <strong className="info-value">{formatDate(documento.fechaEmision)}</strong>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Vigencia</span>
                          <strong className={`info-value ${!documento.vigente ? 'text-danger' : 'text-success'}`}>
                            {documento.fechaVigencia
                              ? (documento.vigente
                                  ? `Hasta ${formatDate(documento.fechaVigencia)}`
                                  : `Expiró ${formatDate(documento.fechaVigencia)}`)
                              : 'Permanente'
                            }
                          </strong>
                        </div>
                      </div>
                    </div>

                    {documento.destinatario && (
                      <div className="info-card">
                        <div className="card-header">
                          <div className="card-icon">
                            <div className="icon-bg"></div>
                            <i className="bi bi-person"></i>
                          </div>
                          <h4>
                            {documento.tipoDestinatario === 'paciente' ? 'Datos del Paciente' : 'Datos del Trabajador'}
                          </h4>
                        </div>
                        <div className="card-body">
                          <div className="info-item">
                            <span className="info-label">Nombre</span>
                            <strong className="info-value">
                              {documento.destinatario.nombres} {documento.destinatario.apellidos}
                            </strong>
                          </div>
                          <div className="info-item">
                            <span className="info-label">DNI</span>
                            <strong className="info-value">{mostrarDNI(documento.destinatario.dni)}</strong>
                          </div>
                          {documento.tipoDestinatario === 'trabajador' ? (
                            <div className="info-item">
                              <span className="info-label">Especialidad</span>
                              <strong className="info-value">
                                {documento.destinatario.especialidad?.nombre || 'No especificada'}
                              </strong>
                            </div>
                          ) : (
                            <div className="info-item">
                              <span className="info-label">Estado</span>
                              <strong className="info-value">
                                <span className={`badge ${esDestinatarioActivo(documento.destinatario.estado) ? 'badge-active' : 'badge-inactive'}`}>
                                  {obtenerTextoEstado(documento.destinatario.estado)}
                                </span>
                              </strong>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* URL Verificación */}
                  <div className="url-verificacion">
                    <div className="url-header">
                      <div className="url-icon">
                        <i className="bi bi-link-45deg"></i>
                      </div>
                      <h4>URL de Verificación</h4>
                    </div>
                    <code className="url-code">{documento.urlVerificacion}</code>
                    <p className="url-description">
                      <i className="bi bi-info-circle"></i>
                      Utilice este enlace para validar la autenticidad del documento
                    </p>
                  </div>

                  {/* Warnings */}
                  {!documento.vigente && (
                    <div className="warning-box warning">
                      <div className="warning-icon">
                        <i className="bi bi-exclamation-triangle"></i>
                      </div>
                      <div className="warning-content">
                        <strong>Documento Expirado</strong>
                        <span>Ha superado su fecha de vigencia</span>
                      </div>
                    </div>
                  )}

                  {!documento.valido && (
                    <div className="warning-box danger">
                      <div className="warning-icon">
                        <i className="bi bi-x-circle"></i>
                      </div>
                      <div className="warning-content">
                        <strong>Documento Inválido</strong>
                        <span>No es válido en el sistema</span>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="action-buttons">
                    <button className="btn-action btn-primary" onClick={handleDescargarPDF}>
                      <i className="bi bi-download"></i>
                      <span>Descargar PDF</span>
                    </button>
                    <button className="btn-action btn-secondary" onClick={handleImprimirComprobante}>
                      <i className="bi bi-printer"></i>
                      <span>Imprimir</span>
                    </button>
                    <button className="btn-action btn-secondary" onClick={handleCompartir}>
                      <i className="bi bi-share"></i>
                      <span>Compartir</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* Info Section */}
      <section className="info-section">
        <div className="info-container">
          <div className="section-header-info">
            <h3>¿Cómo funciona?</h3>
            <p>Sigue estos sencillos pasos para verificar tu documento</p>
          </div>
          
          <div className="steps-grid">
            <div className="step-item">
              <div className="step-number-badge">1</div>
              <div className="step-content">
                <div className="step-icon">
                  <i className="bi bi-search"></i>
                </div>
                <h4>Localiza el código</h4>
                <p>Encuentra el código en tu documento oficial (formato: CTC-XXXXX)</p>
              </div>
            </div>

            <div className="step-item">
              <div className="step-number-badge">2</div>
              <div className="step-content">
                <div className="step-icon">
                  <i className="bi bi-keyboard"></i>
                </div>
                <h4>Ingresa el código</h4>
                <p>Escribe el código en el campo de búsqueda superior</p>
              </div>
            </div>

            <div className="step-item">
              <div className="step-number-badge">3</div>
              <div className="step-content">
                <div className="step-icon">
                  <i className="bi bi-check-circle"></i>
                </div>
                <h4>Verifica</h4>
                <p>Obtén la validación instantánea de tu documento</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default VerificarDocumentos;