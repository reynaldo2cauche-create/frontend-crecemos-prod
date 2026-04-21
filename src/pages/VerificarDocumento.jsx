import React, { useState, useEffect, useRef } from 'react';
import archivosOficialesService from '../services/archivosOficialesService';


const VerificarDocumentos = () => {
  const [codigo, setCodigo] = useState('');
  const [documento, setDocumento] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [estado, setEstado] = useState('idle');
  const [estadoTexto, setEstadoTexto] = useState('Esperando código…');
  const resultsRef = useRef(null);

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

      // Scroll automático hacia los resultados
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
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

      // Scroll automático hacia el error
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
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
                <div class="field-value">Lic. ${documento.terapeuta.nombres} ${documento.terapeuta.apellidos}</div>
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

<>
     <style>{`
      
      

   
  /* ============================================
   VERIFICADOR DE DOCUMENTOS - VERSIÓN FINAL CORREGIDA
   - Badge ultra visible
   - Input sin icono que tape placeholder
   - Números de steps bien posicionados
   ============================================ */

/* Variables CSS */
:root {
  --primary-color: #174ea6;
  --secondary-color: #A3C644;
  --accent-gradient: linear-gradient(135deg, #174ea6 0%, #A3C644 100%);
  --text-dark: #1a202c;
  --text-light: #4a5568;
  --bg-light: #f8fafc;
  --bg-white: #ffffff;
  --border-color: #e2e8f0;
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.12);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.16);
  --transition: all 0.3s ease;
  --success-color: #22c55e;
  --warning-color: #f59e0b;
  --error-color: #dc2626;
}

/* ============================================
   CONTAINER PRINCIPAL
   ============================================ */
.verificador-container {
  min-height: 100vh;
  background: var(--bg-light);
  position: relative;
  overflow-x: hidden;
}

/* ============================================
   FLOATING SHAPES
   ============================================ */
.floating-shapes {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.floating-shapes .shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.03;
  animation: float 20s infinite ease-in-out;
}

.shape-1 {
  width: 250px;
  height: 250px;
  background: var(--primary-color);
  top: 10%;
  left: 5%;
  animation-delay: 0s;
}

.shape-2 {
  width: 180px;
  height: 180px;
  background: var(--secondary-color);
  top: 60%;
  right: 10%;
  animation-delay: 2s;
}

.shape-3 {
  width: 200px;
  height: 200px;
  background: var(--primary-color);
  bottom: 10%;
  left: 15%;
  animation-delay: 4s;
}

.shape-4 {
  width: 130px;
  height: 130px;
  background: var(--secondary-color);
  top: 30%;
  right: 25%;
  animation-delay: 6s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-30px) rotate(180deg);
  }
}

/* ============================================
   HERO SECTION - CON PADDING SUPERIOR AUMENTADO
   ============================================ */
.hero-verificador {
  padding: 140px 20px 60px;
  position: relative;
  z-index: 1;
  text-align: center;
}

.hero-content {
  max-width: 900px;
  margin: 0 auto;
}

/* ============================================
   BADGE - ULTRA VISIBLE, COMPLETAMENTE OPACO, SIN ANIMACIONES
   ============================================ */
.company-badge {
  display: inline-flex !important;
  align-items: center;
  gap: 10px;
  padding: 16px 36px;
  background: #FFFFFF !important;
  border: 2px solid #174ea6 !important;
  border-radius: 50px;
  font-size: 17px;
  font-weight: 900 !important;
  color: #174ea6 !important;
  box-shadow: 0 8px 24px rgba(23, 78, 166, 0.5) !important;
  margin-bottom: 28px;
  position: relative;
  z-index: 9999 !important;
  opacity: 1 !important;
  visibility: visible !important;
  animation: none !important;
  transition: none !important;
}

.company-badge i {
  font-size: 24px !important;
  color: #174ea6 !important;
  font-weight: 900 !important;
  opacity: 1 !important;
}

.company-badge span {
  font-weight: 900 !important;
  letter-spacing: 0.5px;
  color: #174ea6 !important;
  opacity: 1 !important;
}

/* Hero Title */
.hero-title {
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: 800;
  line-height: 1.2;
  color: var(--text-dark);
  margin-bottom: 20px;
  margin-top: 0;
}

.accent-text {
  position: relative;
  display: inline-block;
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title-underline {
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 100%;
  height: 10px;
}

.title-underline path {
  stroke-dasharray: 200;
  stroke-dashoffset: 200;
  animation: drawLine 1.5s ease forwards;
  animation-delay: 0.5s;
}

@keyframes drawLine {
  to {
    stroke-dashoffset: 0;
  }
}

/* Hero Description */
.hero-description {
  font-size: 1rem;
  color: var(--text-light);
  line-height: 1.6;
  max-width: 700px;
  margin: 0 auto 28px;
}

/* Hero Stats */
.hero-stats {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 24px;
}

.stat-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 50px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-dark);
  transition: var(--transition);
}

.stat-badge:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.stat-badge i {
  font-size: 16px;
  color: var(--primary-color);
}

/* ============================================
   SEARCH SECTION - SIN ICONO QUE TAPE PLACEHOLDER
   ============================================ */
.search-section {
  padding: 30px 20px;
  position: relative;
  z-index: 1;
}

.search-container {
  max-width: 800px;
  margin: 0 auto;
}

.search-form {
  animation: fadeIn 0.6s ease;
  animation-delay: 0.2s;
  animation-fill-mode: both;
}

/* Search box - SIN ICONO INTERNO */
.search-box {
  display: flex;
  align-items: center;
  background: white;
  border: 3px solid #174ea6;
  border-radius: 16px;
  padding: 16px 20px;
  box-shadow: 0 6px 20px rgba(23, 78, 166, 0.2);
  transition: var(--transition);
  gap: 16px;
}

.search-box:focus-within {
  border-color: #A3C644;
  box-shadow: 0 8px 24px rgba(23, 78, 166, 0.25);
  transform: translateY(-2px);
}

/* Input - SIN ICONO, PLACEHOLDER COMPLETAMENTE VISIBLE, FONDO TRANSPARENTE */
.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 1.05rem;
  font-weight: 500;
  color: var(--text-dark);
  padding: 0;
  min-width: 0;
  background: transparent !important;
  transition: none;
}

.search-input::placeholder {
  color: #6b7280;
  opacity: 1;
  font-weight: 400;
}

.search-input:focus {
  background: transparent !important;
  outline: none !important;
  border: none !important;
  box-shadow: none !important;
}

.search-input:active {
  background: transparent !important;
}

/* Botón search - bien proporcionado */
.search-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 28px;
  background: linear-gradient(135deg, #A3C644 0%, #8fb53a 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: var(--transition);
  white-space: nowrap;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(163, 198, 68, 0.35);
  height: 48px;
}



.search-button i {
  font-size: 20px;
}

.search-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(163, 198, 68, 0.45);
}

.search-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.search-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
  font-size: 0.875rem;
  color: var(--text-light);
  text-align: center;
}

.search-hint i {
  font-size: 16px;
  color: var(--primary-color);
}

/* ============================================
   RESULTS SECTION
   ============================================ */
.results-section {
  padding: 40px 20px 80px;
  position: relative;
  z-index: 1;
}

.results-container {
  max-width: 1000px;
  margin: 0 auto;
  animation: fadeIn 0.4s ease;
}

/* Status Alert */
.status-alert {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  background: white;
  border-radius: 12px;
  margin-bottom: 28px;
  box-shadow: var(--shadow-md);
  animation: slideInDown 0.4s ease;
}

.status-icon-wrapper {
  flex-shrink: 0;
}

.status-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 24px;
  position: relative;
  animation: bounceIn 0.6s ease;
}

.status-alert.status-success .status-icon {
  background: #f0fdf4;
  color: var(--success-color);
  border: 2px solid var(--success-color);
}

.status-alert.status-warning .status-icon {
  background: #fffbeb;
  color: var(--warning-color);
  border: 2px solid var(--warning-color);
}

.status-alert.status-error .status-icon {
  background: #fef2f2;
  color: var(--error-color);
  border: 2px solid var(--error-color);
}

.status-content h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-dark);
  margin: 0 0 6px 0;
}

.status-content p {
  font-size: 0.95rem;
  color: var(--text-light);
  margin: 0;
}

/* Error Message */
.error-message {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px 24px;
  background: #fef2f2;
  border: 2px solid var(--error-color);
  border-radius: 12px;
  margin-bottom: 28px;
  animation: shake 0.5s ease;
}

.error-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 50%;
  font-size: 20px;
  color: var(--error-color);
  flex-shrink: 0;
}

.error-content strong {
  display: block;
  font-size: 1rem;
  color: var(--text-dark);
  margin-bottom: 6px;
}

.error-content p {
  color: var(--text-light);
  margin-bottom: 10px;
  font-size: 0.95rem;
}

.error-content code {
  display: inline-block;
  padding: 6px 12px;
  background: white;
  border-radius: 6px;
  font-size: 0.875rem;
  color: var(--error-color);
  font-family: 'Courier New', monospace;
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-10px);
  }
  75% {
    transform: translateX(10px);
  }
}

/* ============================================
   DOCUMENT INFO
   ============================================ */
.document-info {
  animation: fadeInUp 0.6s ease;
}

/* Código Principal */
.codigo-principal {
  padding: 24px;
  background: white;
  border: 2px solid var(--border-color);
  border-radius: 16px;
  margin-bottom: 24px;
  text-align: center;
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
}

.codigo-principal::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: var(--accent-gradient);
}

.codigo-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 16px;
}

.codigo-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-gradient);
  border-radius: 10px;
  font-size: 18px;
  color: white;
}

.codigo-label {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-light);
}

.codigo-value {
  font-family: 'Courier New', monospace;
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: 2px;
  color: var(--primary-color);
  background: #f8fafc;
  padding: 16px;
  border-radius: 10px;
  margin: 16px 0;
  border: 2px solid var(--border-color);
}

.codigo-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: rgba(23, 78, 166, 0.08);
  border: 1px solid rgba(23, 78, 166, 0.2);
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--primary-color);
}

/* Info Cards Grid */
.info-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.info-card {
  background: white;
  border: 2px solid var(--border-color);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: var(--transition);
}

.info-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 20px;
  background: #f8fafc;
  border-bottom: 2px solid var(--border-color);
}

.card-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-gradient);
  border-radius: 10px;
  font-size: 20px;
  color: white;
  position: relative;
  flex-shrink: 0;
}

.icon-bg {
  position: absolute;
  width: 100%;
  height: 100%;
  background: inherit;
  border-radius: inherit;
  opacity: 0.3;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.1);
    opacity: 0;
  }
}

.card-header h4 {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-dark);
  margin: 0;
}

.card-body {
  padding: 20px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-light);
}

.info-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-dark);
  text-align: right;
}

.text-success {
  color: var(--success-color) !important;
}

.text-danger {
  color: var(--error-color) !important;
}

/* Badge */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 600;
}

.badge-active {
  background: #f0fdf4;
  color: var(--success-color);
  border: 1px solid var(--success-color);
}

.badge-inactive {
  background: #f8fafc;
  color: var(--text-light);
  border: 1px solid var(--border-color);
}

/* URL Verificación */
.url-verificacion {
  padding: 20px 24px;
  background: white;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: var(--shadow-sm);
}

.url-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.url-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-gradient);
  border-radius: 8px;
  font-size: 16px;
  color: white;
}

.url-header h4 {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-dark);
  margin: 0;
}

.url-code {
  display: block;
  padding: 12px 16px;
  background: #f8fafc;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  color: var(--primary-color);
  word-break: break-all;
  margin-bottom: 10px;
}

.url-description {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: var(--text-light);
  margin: 0;
}

/* Warning Boxes */
.warning-box {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  border-radius: 10px;
  margin-bottom: 20px;
}

.warning-box.warning {
  background: #fffbeb;
  border: 2px solid var(--warning-color);
}

.warning-box.danger {
  background: #fef2f2;
  border: 2px solid var(--error-color);
}

.warning-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 50%;
  font-size: 20px;
  flex-shrink: 0;
}

.warning-box.warning .warning-icon {
  color: var(--warning-color);
}

.warning-box.danger .warning-icon {
  color: var(--error-color);
}

.warning-content strong {
  display: block;
  font-size: 0.95rem;
  color: var(--text-dark);
  margin-bottom: 4px;
}

.warning-content span {
  font-size: 0.875rem;
  color: var(--text-light);
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.btn-action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  border: 2px solid transparent;
}

.btn-action.btn-primary {
  background: var(--accent-gradient);
  color: white;
  box-shadow: var(--shadow-sm);
}

.btn-action.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-action.btn-secondary {
  background: white;
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.btn-action.btn-secondary:hover {
  background: var(--primary-color);
  color: white;
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

/* ============================================
   INFO SECTION - NÚMEROS BIEN POSICIONADOS
   ============================================ */
.info-section {
  padding: 60px 20px;
  background: white;
  position: relative;
  z-index: 1;
}

.info-container {
  max-width: 1100px;
  margin: 0 auto;
}

.section-header-info {
  text-align: center;
  margin-bottom: 48px;
}

.section-header-info h3 {
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-dark);
  margin-bottom: 12px;
}

.section-header-info p {
  font-size: 1rem;
  color: var(--text-light);
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 28px;
}

.step-item {
  text-align: center;
  padding: 32px 20px;
  background: #ffffff;
  border: 2px solid var(--border-color);
  border-radius: 16px;
  transition: var(--transition);
  position: relative;
}

.step-item:hover {
  border-color: var(--primary-color);
  transform: translateY(-6px);
  box-shadow: var(--shadow-md);
}

/* NÚMERO DEL STEP - BIEN POSICIONADO ARRIBA A LA DERECHA */
.step-number-badge {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #A3C644 0%, #8fb53a 100%);
  border-radius: 50%;
  font-size: 1.25rem;
  font-weight: 800;
  color: white;
  box-shadow: 0 4px 12px rgba(163, 198, 68, 0.4);
  z-index: 5;
}

.step-content {
  position: relative;
  z-index: 2;
  margin-top: 10px;
}

/* ICONOS DE STEPS - TAMAÑO CORRECTO */
.step-icon {
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, #174ea6 0%, #2563b5 100%);
  border: 3px solid white;
  border-radius: 18px;
  font-size: 32px;
  color: white;
  position: relative;
  z-index: 10;
  box-shadow: 0 6px 16px rgba(23, 78, 166, 0.25),
              0 0 0 4px rgba(23, 78, 166, 0.1);
  transition: all 0.3s ease;
}

.step-item:hover .step-icon {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 8px 20px rgba(23, 78, 166, 0.35),
              0 0 0 5px rgba(23, 78, 166, 0.15);
}

.step-icon i {
  position: relative;
  z-index: 11;
}

.step-content h4 {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 10px;
}

.step-content p {
  font-size: 0.95rem;
  color: var(--text-light);
  line-height: 1.5;
}

/* ============================================
   ANIMACIONES - SIN FADEINUP EN HERO
   ============================================ */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
  }
}

/* ============================================
   RESPONSIVE
   ============================================ */
@media (max-width: 768px) {
  .hero-verificador {
    padding: 120px 20px 50px;
  }

  .hero-title {
    font-size: 1.875rem;
  }

  .company-badge {
    font-size: 16px !important;
    padding: 14px 30px !important;
    border: 4px solid #174ea6 !important;
    background: #FFFFFF !important;
    opacity: 1 !important;
    font-weight: 900 !important;
  }
  
  .company-badge i {
    font-size: 22px !important;
  }

  .hero-stats {
    flex-direction: column;
    align-items: center;
  }

  .stat-badge {
    width: 100%;
    max-width: 300px;
    justify-content: center;
  }

  .search-box {
    padding: 14px 18px;
    gap: 12px;
  }

  .search-input {
    font-size: 1rem;
  }

  .search-button {
    padding: 10px 24px;
    font-size: 0.95rem;
    height: 44px;
  }

  .status-alert {
    flex-direction: column;
    text-align: center;
  }

  .info-cards-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn-action {
    width: 100%;
    justify-content: center;
  }

  .steps-grid {
    grid-template-columns: 1fr;
  }

  .codigo-value {
    font-size: 1.25rem;
    letter-spacing: 1.5px;
  }

  .step-number-badge {
    top: 16px;
    right: 16px;
    width: 36px;
    height: 36px;
    font-size: 1.125rem;
  }

  .step-icon {
    width: 64px;
    height: 64px;
    font-size: 28px;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 1.625rem;
  }
  
  .hero-verificador {
    padding: 110px 20px 50px;
  }

  .company-badge {
    font-size: 15px !important;
    padding: 12px 26px !important;
    border: 4px solid #174ea6 !important;
    background: #FFFFFF !important;
    opacity: 1 !important;
    font-weight: 900 !important;
  }

  .company-badge i {
    font-size: 20px !important;
  }

  .search-box {
    padding: 12px 16px;
    gap: 10px;
  }

  .search-input {
    font-size: 0.95rem;
  }

  .search-button {
    padding: 8px 20px;
    font-size: 0.9rem;
    height: 40px;
  }

  .codigo-value {
    font-size: 1.125rem;
    padding: 12px;
  }

  .step-number-badge {
    top: 14px;
    right: 14px;
    width: 32px;
    height: 32px;
    font-size: 1rem;
  }

  .step-icon {
    width: 58px;
    height: 58px;
    font-size: 26px;
  }
}

      
      `}</style>
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
        <section className="results-section" ref={resultsRef}>
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
                              Lic. {documento.terapeuta.nombres} {documento.terapeuta.apellidos}
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
    </>
  );
};



export default VerificarDocumentos;