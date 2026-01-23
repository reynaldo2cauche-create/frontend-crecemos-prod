import React, { useState, useEffect } from 'react';
import { verificarPacienteYObtenerBeneficios } from '../services/pacienteService';
import { getTerminosPorBeneficio } from '../services/conveniosService';
import { API_BASE_URL, SERVER_BASE_URL } from '../services/api';

const VerificarBeneficios = () => {
  const [dni, setDni] = useState('');
  const [paciente, setPaciente] = useState(null);
  const [beneficios, setBeneficios] = useState([]);
  const [totalBeneficios, setTotalBeneficios] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [estado, setEstado] = useState('idle');
  const [estadoTexto, setEstadoTexto] = useState('Esperando DNI…');

  // Estados para modal de términos
  const [modalTerminos, setModalTerminos] = useState(false);
  const [beneficioSeleccionado, setBeneficioSeleccionado] = useState(null);
  const [terminos, setTerminos] = useState([]);
  const [loadingTerminos, setLoadingTerminos] = useState(false);

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

  const handleAbrirTerminos = async (beneficio) => {
    setBeneficioSeleccionado(beneficio);
    setModalTerminos(true);
    setLoadingTerminos(true);

    try {
      const data = await getTerminosPorBeneficio(beneficio.id, true);
      setTerminos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar términos:', error);
      setTerminos([]);
    } finally {
      setLoadingTerminos(false);
    }
  };

  const handleCerrarTerminos = () => {
    setModalTerminos(false);
    setBeneficioSeleccionado(null);
    setTerminos([]);
  };


  return (
    <div className="verificar-beneficios-wrapper">
      <style>{`
        .verificar-beneficios-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        /* Header Hero */
        .beneficios-hero {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          padding: 140px 20px 100px;
          position: relative;
          overflow: hidden;
        }

        .beneficios-hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          opacity: 0.3;
        }

        .beneficios-hero-content {
          max-width: 1400px;
          margin: 0 auto;
          text-align: center;
          position: relative;
          z-index: 1;
        }

        .beneficios-hero h1 {
          color: white;
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 800;
          margin-bottom: 16px;
          text-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .beneficios-hero p {
          color: rgba(255,255,255,0.95);
          font-size: clamp(1rem, 2vw, 1.125rem);
          max-width: 600px;
          margin: 0 auto;
        }

        /* Container Principal */
        .beneficios-container {
          max-width: 1400px;
          margin: -60px auto 0;
          padding: 0 20px 60px;
          position: relative;
          z-index: 2;
        }

        /* Panel de Búsqueda - Horizontal */
        .search-panel {
          background: white;
          border-radius: 20px;
          padding: 36px 48px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.08);
          border: 2px solid #dbeafe;
          margin-bottom: 40px;
          transition: all 0.3s ease;
        }

        .search-panel:hover {
          border-color: #93c5fd;
          box-shadow: 0 12px 48px rgba(37,99,235,0.15);
        }

        .search-form-wrapper {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 40px;
          align-items: center;
          max-width: 1100px;
          margin: 0 auto;
        }

        .search-panel-title {
          display: flex;
          align-items: center;
          gap: 16px;
          color: #1e293b;
          font-size: 1.063rem;
          font-weight: 700;
          white-space: nowrap;
          padding-right: 8px;
        }

        .search-panel-icon {
          width: 52px;
          height: 52px;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
          box-shadow: 0 4px 14px rgba(37,99,235,0.3);
        }

        .form-input-wrapper {
          flex: 1;
        }

        .form-input {
          width: 100%;
          padding: 16px 24px;
          border: 2px solid #e2e8f0;
          border-radius: 14px;
          font-size: 1.063rem;
          font-family: 'Courier New', monospace;
          font-weight: 600;
          background: #f8fafc;
          color: #1e293b;
          transition: all 0.3s ease;
          box-sizing: border-box;
        }

        .form-input:focus {
          outline: none;
          border-color: #2563eb;
          background: white;
          box-shadow: 0 0 0 4px rgba(37,99,235,0.1);
        }

        .form-input.error {
          border-color: #ef4444;
          background: #fef2f2;
        }

        .btn-consultar {
          padding: 16px 48px;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: white;
          border: none;
          border-radius: 14px;
          font-size: 1.063rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 16px rgba(37,99,235,0.35);
          white-space: nowrap;
        }

        .btn-consultar:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(37,99,235,0.45);
        }

        .btn-consultar:active {
          transform: translateY(0);
        }

        .btn-consultar:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        /* Panel de Resultados */
        .results-panel {
          background: white;
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.08);
          border: 1px solid rgba(37,99,235,0.1);
          min-height: 500px;
        }

        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .status-badge {
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1rem;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .status-success {
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          color: #065f46;
          border: 2px solid #6ee7b7;
        }

        .status-error {
          background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
          color: #991b1b;
          border: 2px solid #fca5a5;
        }

        .status-warning {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          color: #92400e;
          border: 2px solid #fcd34d;
        }

        .status-idle {
          background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
          color: #475569;
          border: 2px solid #cbd5e1;
        }

        .action-buttons {
          display: flex;
          gap: 12px;
        }

        .btn-action {
          padding: 10px 20px;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.938rem;
          font-weight: 600;
          cursor: pointer;
          color: #475569;
          transition: all 0.2s ease;
        }

        .btn-action:hover {
          border-color: #2563eb;
          color: #2563eb;
          background: #eff6ff;
        }

        .btn-action-primary {
          padding: 10px 20px;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border: none;
          border-radius: 10px;
          font-size: 0.938rem;
          font-weight: 600;
          cursor: pointer;
          color: white;
          transition: all 0.2s ease;
        }

        .btn-action-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        /* Alert Messages */
        .alert {
          padding: 20px;
          border-radius: 16px;
          margin-bottom: 24px;
          font-size: 0.938rem;
          line-height: 1.6;
        }

        .alert-info {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          color: #1e40af;
          border-left: 4px solid #2563eb;
        }

        .alert-error {
          background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
          color: #991b1b;
          border-left: 4px solid #ef4444;
        }

        .alert-warning {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          color: #92400e;
          border-left: 4px solid #f59e0b;
        }

        /* Grid de Beneficios */
        .beneficios-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }

        .beneficio-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          border: 2px solid #dbeafe;
          display: flex;
          flex-direction: column;
        }

        .beneficio-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(37,99,235,0.15);
          border-color: #93c5fd;
        }

        .beneficio-card-header-section {
          background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%);
          padding: 24px 20px 20px;
          position: relative;
          overflow: hidden;
        }

        .beneficio-card-header-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%232563eb' fill-opacity='0.03' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E");
          opacity: 1;
        }

        .beneficio-descuento-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          padding: 8px 16px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border-radius: 10px;
          font-size: 0.938rem;
          font-weight: 800;
          box-shadow: 0 4px 16px rgba(16,185,129,0.3);
          z-index: 2;
          letter-spacing: 0.3px;
        }

        .beneficio-icon-wrapper {
          display: flex;
          justify-content: center;
          margin-bottom: 16px;
          position: relative;
          z-index: 1;
        }

        .beneficio-icon-container {
          width: 80px;
          height: 80px;
          background: white;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 16px rgba(37,99,235,0.12);
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .beneficio-card:hover .beneficio-icon-container {
          transform: scale(1.05) rotate(3deg);
          box-shadow: 0 6px 20px rgba(37,99,235,0.2);
        }

        .beneficio-icon-svg {
          width: 40px;
          height: 40px;
          color: #2563eb;
          padding: 16px;
        }

        .beneficio-icon-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .beneficio-nombre {
          font-size: 1.125rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 10px 0;
          line-height: 1.3;
          text-align: center;
          position: relative;
          z-index: 1;
        }

        .beneficio-empresa-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: white;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.813rem;
          font-weight: 700;
          color: #475569;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .empresa-icon {
          width: 14px;
          height: 14px;
          color: #64748b;
        }

        .beneficio-card-body {
          padding: 20px;
          background: white;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .beneficio-descripcion {
          font-size: 0.875rem;
          color: #475569;
          line-height: 1.6;
          margin: 0;
        }

        .beneficio-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 14px;
          border-top: 1.5px solid #f1f5f9;
          margin-top: auto;
          gap: 8px;
          flex-wrap: wrap;
        }

        .btn-ver-terminos {
          padding: 6px 12px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);
        }

        .btn-ver-terminos:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35);
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
        }

        .btn-ver-terminos:active {
          transform: translateY(0);
        }

        .beneficio-categoria {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          border-radius: 8px;
          font-size: 0.813rem;
          font-weight: 700;
          color: #1e40af;
          border: 1.5px solid #bfdbfe;
        }

        .categoria-icon {
          width: 14px;
          height: 14px;
        }

        /* Responsive */
        @media (max-width: 900px) {
          .search-form-wrapper {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .search-panel {
            padding: 32px 28px;
          }

          .search-panel-title {
            justify-content: center;
          }

          .btn-consultar {
            width: 100%;
          }
        }

        @media (max-width: 768px) {
          .beneficios-grid {
            grid-template-columns: 1fr;
          }

          .beneficio-card-header-section {
            padding: 20px 16px 16px;
          }

          .beneficio-card-body {
            padding: 16px;
          }
        }

        @media (max-width: 640px) {
          .beneficios-hero {
            padding: 120px 20px 80px;
          }

          .beneficios-container {
            padding: 0 16px 40px;
            margin: -50px auto 0;
          }

          .search-panel {
            padding: 20px;
            border-radius: 16px;
          }

          .results-panel {
            padding: 24px 20px;
            border-radius: 16px;
          }

          .results-header {
            flex-direction: column;
            align-items: stretch;
          }

          .action-buttons {
            width: 100%;
          }

          .btn-action, .btn-action-primary {
            flex: 1;
          }
        }

        @media print {
          .no-print {
            display: none !important;
          }

          .beneficio-card {
            break-inside: avoid;
            page-break-inside: avoid;
          }


          
        }

        
      `}</style>

      {/* Hero Header */}
      <div className="beneficios-hero">
        <div className="beneficios-hero-content">
          <h1>Consulta de Beneficios</h1>
          <p>Verifica los beneficios disponibles para pacientes activos del Centro de Terapias Crecemos</p>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="beneficios-container">
        {/* Panel de Búsqueda */}
        <div className="search-panel">
          <form onSubmit={handleValidar}>
            <div className="search-form-wrapper">
              <div className="search-panel-title">
                <div className="search-panel-icon">
                  <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span>Consultar con DNI</span>
              </div>

              <div className="form-input-wrapper">
                <input
                  id="dni"
                  className={`form-input ${error && estado === 'error' ? 'error' : ''}`}
                  placeholder="Ingresa DNI de 8 dígitos"
                  value={dni}
                  onChange={(e) => setDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  autoComplete="off"
                  maxLength="8"
                />
              </div>

              <button
                type="submit"
                className="btn-consultar"
                disabled={loading}
              >
                {loading ? 'Consultando...' : 'Consultar'}
              </button>
            </div>
          </form>
        </div>

        {/* Panel de Resultados */}
        <div className="results-panel">
            <div className="results-header">
              <div className={`status-badge status-${estado}`}>
                {estado === 'success' && (
                  <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {estado === 'error' && (
                  <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {estado === 'warning' && (
                  <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
                {estado === 'idle' && (
                  <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {estadoTexto}
              </div>
              <div className="action-buttons no-print">
                <button className="btn-action" onClick={handleImprimirBeneficios}>
                  <svg style={{ width: '16px', height: '16px', display: 'inline', marginRight: '6px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Imprimir
                </button>
                <button className="btn-action-primary" onClick={handleCompartir}>
                  <svg style={{ width: '16px', height: '16px', display: 'inline', marginRight: '6px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Compartir
                </button>
              </div>
            </div>

            {!paciente && !error && (
              <div className="alert alert-info">
                <strong>Bienvenido</strong><br />
                Ingrese un DNI válido de 8 dígitos para consultar beneficios disponibles.
              </div>
            )}

            {error && (
              <div className={`alert ${estado === 'warning' ? 'alert-warning' : 'alert-error'}`}>
                <strong>{estado === 'warning' ? 'Advertencia:' : 'Error:'}</strong> {error}
                <br />
                <small>DNI: <strong>{dni}</strong></small>
              </div>
            )}

            {paciente && beneficios.length > 0 && (
              <div className="beneficios-grid">
                {beneficios.map((beneficio) => {
                  const logoUrl = beneficio.convenio?.logo_url
                    ? (beneficio.convenio.logo_url.startsWith('/')
                      ? `${API_BASE_URL}/convenios/logo/${beneficio.convenio.logo_url.split('/').pop()}`
                      : `${API_BASE_URL}/convenios/logo/${beneficio.convenio.logo_url}`)
                    : null;

                  const nombreEmpresa = beneficio.convenio?.empresa || beneficio.convenio?.nombre || beneficio.proveedor || 'Empresa';

                  return (
                    <div key={beneficio.id} className="beneficio-card">
                      <div className="beneficio-card-header-section">
                        {beneficio.descuento && (
                          <div className="beneficio-descuento-badge">
                            {beneficio.descuento}
                          </div>
                        )}

                        <div className="beneficio-icon-wrapper">
                          <div className="beneficio-icon-container">
                            {logoUrl ? (
                              <img
                                src={logoUrl}
                                alt={nombreEmpresa}
                                className="beneficio-icon-img"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <svg className="beneficio-icon-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                              </svg>
                            )}
                          </div>
                        </div>

                        <h3 className="beneficio-nombre">{beneficio.nombre}</h3>

                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                          <div className="beneficio-empresa-tag">
                            <svg className="empresa-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            {nombreEmpresa}
                          </div>
                        </div>
                      </div>

                      <div className="beneficio-card-body">
                        <p className="beneficio-descripcion">{beneficio.descripcion}</p>

                        <div className="beneficio-footer">
                          {beneficio.categoria?.nombre && (
                            <div className="beneficio-categoria">
                              <svg className="categoria-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                              {beneficio.categoria.nombre}
                            </div>
                          )}

                          <a
                            onClick={() => handleAbrirTerminos(beneficio)}
                            className="link-ver-terminos no-print"
                            style={{ cursor: 'pointer' }}
                          >
                            Términos y Condiciones
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <style>{`
              .link-ver-terminos {
                color: #174ea6;
                font-size: 0.875rem;
                font-weight: 500;
                text-decoration: underline;
                transition: all 0.2s ease;
              }

              .link-ver-terminos:hover {
                color: #c263f9;
                text-decoration: underline;
              }
            `}</style>
            {paciente && beneficios.length === 0 && (
              <div className="alert alert-info">
                <strong>Sin beneficios</strong><br />
                No hay beneficios disponibles en este momento para este paciente.
              </div>
            )}
        </div>
      </div>

<style>{`
  .link-ver-terminos {
    color: #174ea6;
    font-size: 0.875rem;
    font-weight: 500;
    text-decoration: underline;
    transition: all 0.2s ease;
  }

  .link-ver-terminos:hover {
    color: #c263f9;
    text-decoration: underline;
  }
`}</style>

{/* MODAL DE TÉRMINOS Y CONDICIONES */}
{modalTerminos && beneficioSeleccionado && (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(3px)',
      padding: '20px'
    }}
    onClick={handleCerrarTerminos}
  >
    <style>{`
      @keyframes modalSlideIn {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .terminos-modal {
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(23, 78, 166, 0.12);
        width: 100%;
        max-width: 550px;
        max-height: 75vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        animation: modalSlideIn 0.25s ease-out;
      }

      .terminos-header {
        padding: 24px 28px;
        border-bottom: 1px solid #e8f1ff;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
      }

      .terminos-header-content {
        flex: 1;
      }

      .terminos-title {
        color: #174ea6;
        font-size: 1.25rem;
        font-weight: 600;
        margin: 0 0 6px 0;
        letter-spacing: -0.3px;
      }

      .terminos-subtitle {
        color: #64748b;
        font-size: 0.875rem;
        margin: 0;
        font-weight: 400;
      }

      .terminos-close {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        color: #94a3b8;
        flex-shrink: 0;
      }

      .terminos-close:hover {
        background: #f1f5f9;
        color: #64748b;
      }

      .terminos-body {
        padding: 28px;
        overflow-y: auto;
        flex: 1;
      }

      .terminos-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      
      .terminos-list .termino{
        padding:4px;}

      .termino {
        display: flex;
        gap: 8px;
        padding: 2px 0;
        border-bottom: 1px solid #f1f5f9;
        list-style: none !important;
        align-items: flex-start;
      }

      .termino::before {
        display: none !important;
      }

      .termino::marker {
        display: none !important;
      }

      .termino:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }

      .termino:first-child {
        padding-top: 0;
      }

      .termino-bullet {
        flex-shrink: 0;
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: linear-gradient(135deg, #174ea6 0%, #c263f9 100%);
        margin-top: 9px;
      }

      .termino-text {
        flex: 1;
        color: #475569;
        line-height: 1.1 !important;
        font-size: 0.9rem;
        margin: 0;
        padding: 0;
      }

      .terminos-empty {
        text-align: center;
        padding: 48px 20px;
      }

      .terminos-empty-icon {
        width: 48px;
        height: 48px;
        margin: 0 auto 16px;
        color: #cbd5e1;
      }

      .terminos-empty-title {
        color: #475569;
        font-size: 1rem;
        font-weight: 500;
        margin: 0 0 6px 0;
      }

      .terminos-empty-desc {
        color: #94a3b8;
        font-size: 0.875rem;
        margin: 0;
      }

      .terminos-loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 48px 20px;
        gap: 16px;
      }

      .loading-spinner {
        width: 32px;
        height: 32px;
        border: 3px solid #f1f5f9;
        border-top-color: #174ea6;
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .loading-text {
        color: #64748b;
        font-size: 0.875rem;
      }

      @media (max-width: 640px) {
        .terminos-modal {
          max-width: 100%;
          max-height: 90vh;
        }

        .terminos-header {
          padding: 20px 24px;
        }

        .terminos-title {
          font-size: 1.125rem;
        }

        .terminos-body {
          padding: 24px;
        }

        .termino {
          gap: 6px;
          padding: 1px 0;
        }

        .termino-text {
          font-size: 0.875rem;
          line-height: 1.05 !important;
        }
        
        .termino-bullet {
          margin-top: 8px;
          width: 3px;
          height: 3px;
        }
      }
    `}</style>

    <div className="terminos-modal" onClick={(e) => e.stopPropagation()}>
      <div className="terminos-header">
        <div className="terminos-header-content">
          <h2 className="terminos-title">Términos y Condiciones</h2>
          <p className="terminos-subtitle">{beneficioSeleccionado.nombre}</p>
        </div>
        <button className="terminos-close" onClick={handleCerrarTerminos}>
          <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="terminos-body">
        {loadingTerminos ? (
          <div className="terminos-loading">
            <div className="loading-spinner"></div>
            <p className="loading-text">Cargando términos...</p>
          </div>
        ) : terminos.length === 0 ? (
          <div className="terminos-empty">
            <svg className="terminos-empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="terminos-empty-title">Sin términos disponibles</h3>
            <p className="terminos-empty-desc">Este beneficio no tiene términos registrados</p>
          </div>
        ) : (
          <ul className="terminos-list">
            {terminos.map((termino) => (
              <li key={termino.id} className="termino">
                <span className="termino-bullet"></span>
                <p className="termino-text">{termino.descripcion}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default VerificarBeneficios;
