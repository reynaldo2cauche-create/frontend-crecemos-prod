import React, { useState, useEffect } from 'react';
import { consultarReclamoPublico } from '../../services/libroReclamacionesService';
import { libroReclamacionesStyles } from './sharedStyles';
import { initializePageScripts } from '../../utils/initScripts';
import { generarPDFReclamo } from '../../utils/generarPDFReclamo';
import { Download } from 'lucide-react';

const ESTADO_ESTILOS = {
  'Registrado': { color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
  'En proceso': { color: '#92400e', bg: '#fffbeb', border: '#fde68a' },
  'Respondido': { color: '#166534', bg: '#f0fdf4', border: '#bbf7d0' },
  'Cerrado':    { color: '#374151', bg: '#f9fafb', border: '#e5e7eb' },
};

const ConsultarReclamo = () => {
  console.log('🔍 ConsultarReclamo component rendering...');

  const [codigo, setCodigo] = useState('');

  useEffect(() => {
    initializePageScripts();
  }, []);
  const [documento, setDocumento] = useState('');
  const [reclamo, setReclamo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConsultar = async (e) => {
    e.preventDefault();
    setError('');
    setReclamo(null);
    setLoading(true);
    try {
      const response = await consultarReclamoPublico(codigo, documento);
      setReclamo(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Reclamo no encontrado o documento incorrecto.');
    } finally {
      setLoading(false);
    }
  };

  const estadoEstilo = reclamo
    ? (ESTADO_ESTILOS[reclamo.estado?.nombre] || ESTADO_ESTILOS['Cerrado'])
    : null;

  return (
    <>
      <style>{libroReclamacionesStyles}</style>
      <main className="main">

        <div className="lr-page-header">
          <div className="container text-center">
            <h1 data-aos="fade-down">Consultar Estado del Reclamo</h1>
            <p className="subtitle" data-aos="fade-up" data-aos-delay="100">
              Crecemos – Centro Integral de Terapias
            </p>
          </div>
        </div>

        <section className="lr-section">
          <div className="container">
            <div className="lr-wrapper">

              <div className="lr-intro" data-aos="fade-up">
                <p>
                  Ingrese el <strong>código de reclamo</strong> recibido al momento del registro y su{' '}
                  <strong>número de documento de identidad</strong>. Ambos datos son requeridos para
                  verificar su identidad y proteger la confidencialidad de su solicitud.
                </p>
              </div>

              {/* Formulario de consulta */}
              <div className="lr-item" data-aos="fade-up" data-aos-delay="60">
                <h3 data-numero="1">Datos de Consulta</h3>

                <form onSubmit={handleConsultar}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="lr-label">Código de Reclamo <span className="lr-req">*</span></label>
                      <input className="lr-input" type="text" value={codigo}
                        onChange={(e) => setCodigo(e.target.value)} required placeholder="REC-2026-00001" />
                    </div>
                    <div className="col-md-6">
                      <label className="lr-label">Número de Documento <span className="lr-req">*</span></label>
                      <input className="lr-input" type="text" value={documento}
                        onChange={(e) => setDocumento(e.target.value)} required placeholder="12345678" />
                    </div>
                  </div>

                  <div className="lr-submit mt-4">
                    <button type="submit" className="btn-custom" disabled={loading}>
                      {loading
                        ? <><span className="spinner-border spinner-border-sm me-2" role="status" />Consultando...</>
                        : 'Consultar Estado'
                      }
                    </button>
                  </div>

                  {error && <div className="lr-error mt-3">{error}</div>}
                </form>
              </div>

              {/* Resultado */}
              {reclamo && (
                <>
                  {/* Encabezado resultado */}
                  <div className="lr-resultado-header" data-aos="fade-up">
                    <h3 data-numero="2">Resultado de la Consulta</h3>
                  </div>

                  {/* Información del reclamo en tarjeta */}
                  <div className="lr-info-card" data-aos="fade-up" data-aos-delay="40">
                    <div className="lr-info-header">
                      <div>
                        <span className="lr-info-label">Código de Reclamo</span>
                        <h2 className="lr-codigo-grande">{reclamo.codigo_reclamo}</h2>
                      </div>
                      <div className="lr-estado-badge-grande" style={{
                        color: estadoEstilo.color,
                        background: estadoEstilo.bg,
                        border: `2px solid ${estadoEstilo.border}`,
                      }}>
                        {reclamo.estado?.nombre}
                      </div>
                    </div>

                    <div className="lr-info-grid">
                      <div className="lr-info-item">
                        <span className="lr-info-label">Fecha de Registro</span>
                        <span className="lr-info-value">
                          {new Date(reclamo.fecha_registro).toLocaleDateString('es-PE', {
                            day: '2-digit', month: 'long', year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="lr-info-item">
                        <span className="lr-info-label">Tipo de Solicitud</span>
                        <span className="lr-info-value">{reclamo.tipoSolicitud?.nombre}</span>
                      </div>
                    </div>
                  </div>

                  {/* Línea de tiempo del estado */}
                  <div className="lr-item" data-aos="fade-up" data-aos-delay="60">
                    <h3 data-numero="1">Estado de su Reclamo</h3>
                    <div className="lr-timeline">
                      <div className={`lr-timeline-step ${['Registrado', 'En proceso', 'Respondido', 'Cerrado'].includes(reclamo.estado?.nombre) ? 'active' : ''}`}>
                        <div className="lr-timeline-marker"></div>
                        <div className="lr-timeline-content">
                          <h4>Registrado</h4>
                          <p>Su reclamo ha sido recibido</p>
                        </div>
                      </div>

                      <div className={`lr-timeline-step ${['En proceso', 'Respondido', 'Cerrado'].includes(reclamo.estado?.nombre) ? 'active' : ''}`}>
                        <div className="lr-timeline-marker"></div>
                        <div className="lr-timeline-content">
                          <h4>En Proceso</h4>
                          <p>Estamos revisando su caso</p>
                        </div>
                      </div>

                      <div className={`lr-timeline-step ${['Respondido', 'Cerrado'].includes(reclamo.estado?.nombre) ? 'active' : ''}`}>
                        <div className="lr-timeline-marker"></div>
                        <div className="lr-timeline-content">
                          <h4>Respondido</h4>
                          <p>Hemos dado respuesta a su solicitud</p>
                        </div>
                      </div>

                      <div className={`lr-timeline-step ${reclamo.estado?.nombre === 'Cerrado' ? 'active' : ''}`}>
                        <div className="lr-timeline-marker"></div>
                        <div className="lr-timeline-content">
                          <h4>Cerrado</h4>
                          <p>Caso finalizado</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Respuesta del Proveedor */}
                  <div className="lr-item" data-aos="fade-up" data-aos-delay="80">
                    <h3 data-numero="2">Respuesta del Proveedor</h3>

                    {reclamo.respuesta_proveedor ? (
                      <>
                        <ul className="lr-list">
                          <li>
                            <strong>Fecha de comunicación:</strong>{' '}
                            {new Date(reclamo.fecha_respuesta).toLocaleString('es-PE', {
                              day: '2-digit', month: 'long', year: 'numeric',
                              hour: '2-digit', minute: '2-digit',
                            })}
                          </li>
                        </ul>
                        <p className="lr-texto-largo">{reclamo.respuesta_proveedor}</p>
                      </>
                    ) : (
                      <div className="lr-pending-box">
                        <p>
                          <strong>Su reclamo se encuentra en atención.</strong>
                        </p>
                        <p>
                          El proveedor cuenta con un plazo máximo de <strong>15 días hábiles</strong> para
                          responder, el cual es improrrogable según lo establecido por INDECOPI.
                        </p>
                        <p>
                          Puede consultar el estado de su reclamo en cualquier momento ingresando
                          el código y su número de documento.
                        </p>
                      </div>
                    )}

                    <div className="lr-nota mt-3">
                      <strong>Nota importante:</strong> La formulación del reclamo no impide acudir a otras vías de solución de
                      controversias ni es requisito previo para interponer una denuncia ante el INDECOPI.
                    </div>
                  </div>

                  {/* Información adicional */}
                  <div className="lr-item" data-aos="fade-up" data-aos-delay="100">
                    <h3 data-numero="3">Información Adicional</h3>
                    <p>
                      Para cualquier consulta adicional o si requiere más información sobre su reclamo,
                      puede comunicarse con nosotros a través de nuestros canales de atención oficiales.
                    </p>
                    <p style={{ marginTop: '10px' }}>
                      <strong>Recuerde:</strong> Toda la información detallada de su reclamo se encuentra
                      disponible en nuestras oficinas administrativas previa identificación.
                    </p>

                    {/* Botón para descargar PDF */}
                    <div style={{ marginTop: '20px' }}>
                      <button
                        className="btn-custom"
                        onClick={async () => await generarPDFReclamo(reclamo)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                      >
                        <Download size={18} />
                        Descargar Constancia PDF
                      </button>
                    </div>
                  </div>
                </>
              )}

            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default ConsultarReclamo;