import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Check } from 'lucide-react';
import { crearReclamoPublico, obtenerCatalogos, enviarCorreoConPDF } from '../../services/libroReclamacionesService';
import { libroReclamacionesStyles } from './sharedStyles';
import { initializePageScripts } from '../../utils/initScripts';
import { generarPDFReclamoBlob } from '../../utils/generarPDFReclamo';

const INITIAL_FORM = {
  nombres: '', apellidos: '', tipo_documento: 'DNI', numero_documento: '',
  telefono: '', email: '', direccion: '',
  menor_edad: false, datos_apoderado: '',
  tipo_solicitud_id: '', tipo_bien_id: '',
  descripcion_bien: '', monto_reclamado: '',
  detalle_reclamo: '', pedido_consumidor: '',
  acepta_terminos: false, autoriza_datos: false,
};

const RegistrarReclamo = () => {
  const navigate = useNavigate();
  const [catalogos, setCatalogos] = useState({ tiposSolicitud: [], tiposBien: [] });
  const [archivos, setArchivos] = useState([]);
  const [formulario, setFormulario] = useState(INITIAL_FORM);
  const [reclamoCreado, setReclamoCreado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    initializePageScripts();
    obtenerCatalogos()
      .then((res) => setCatalogos(res.data))
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormulario(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFileChange = (e) => {
    const nuevos = Array.from(e.target.files);
    if (nuevos.length + archivos.length > 5) {
      setError('Máximo 5 archivos permitidos.');
      return;
    }
    setError('');
    setArchivos(prev => [...prev, ...nuevos]);
  };

  const eliminarArchivo = (index) => {
    setArchivos(prev => prev.filter((_, i) => i !== index));
  };

  const copiarCodigo = () => {
    if (reclamoCreado?.codigo_reclamo) {
      navigator.clipboard.writeText(reclamoCreado.codigo_reclamo)
        .then(() => {
          setCopiado(true);
          setTimeout(() => setCopiado(false), 2000);
        })
        .catch(err => console.error('Error al copiar:', err));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formulario.acepta_terminos || !formulario.autoriza_datos) {
      setError('Debe aceptar ambas declaraciones de consentimiento para continuar.');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(formulario).forEach(([key, val]) => {
        if (val !== null && val !== '') formData.append(key, String(val));
      });

      archivos.forEach(archivo => formData.append('archivos', archivo));
      const response = await crearReclamoPublico(formData);
      const reclamoData = response.data;
      setReclamoCreado(reclamoData);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Generar PDF y enviar correo en segundo plano
      if (reclamoData.codigo_reclamo && formulario.numero_documento) {
        generarPDFReclamoBlob(reclamoData)
          .then(pdfBlob => {
            return enviarCorreoConPDF(reclamoData.codigo_reclamo, formulario.numero_documento, pdfBlob);
          })
          .then(() => {
            console.log('✅ Correo enviado con PDF adjunto');
          })
          .catch(err => {
            console.error('❌ Error al enviar correo con PDF:', err);
          });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al registrar el reclamo.');
    } finally {
      setLoading(false);
    }
  };

  // ── PANTALLA DE ÉXITO ──────────────────────────────────────────────────────
  if (reclamoCreado) {
    return (
      <>
        <style>{libroReclamacionesStyles}</style>
        <main className="main">
          <div className="lr-page-header">
            <div className="container text-center">
              <h1>Libro de Reclamaciones</h1>
              <p className="subtitle">Crecemos – Centro Integral de Terapias</p>
            </div>
          </div>
          <section className="lr-section">
            <div className="container">
              <div className="lr-wrapper">

                <div className="lr-intro" data-aos="fade-up">
                  <p>Su reclamo ha sido registrado correctamente en nuestro sistema.</p>
                </div>

                <div className="lr-item" data-aos="fade-up" data-aos-delay="60">
                  <h3 data-numero="✓">Reclamo Registrado Exitosamente</h3>
                  <p>
                    Su solicitud ha sido recibida y será atendida en un plazo máximo de{' '}
                    <strong>15 días hábiles</strong> conforme a la Ley N° 29571.
                  </p>

                  <div className="lr-codigo-box">
                    <span className="lr-codigo-label">Código de Reclamo</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      <span className="lr-codigo-valor">{reclamoCreado.codigo_reclamo}</span>
                      <button
                        onClick={copiarCodigo}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '10px 20px',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: 'white',
                          backgroundColor: copiado ? '#4CAF50' : '#7B1FA2',
                          border: 'none',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          boxShadow: copiado ? '0 4px 12px rgba(76, 175, 80, 0.3)' : '0 4px 12px rgba(123, 31, 162, 0.3)',
                          transform: copiado ? 'scale(1.05)' : 'scale(1)',
                        }}
                        onMouseEnter={(e) => {
                          if (!copiado) {
                            e.currentTarget.style.backgroundColor = '#6A1B9A';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(123, 31, 162, 0.4)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!copiado) {
                            e.currentTarget.style.backgroundColor = '#7B1FA2';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(123, 31, 162, 0.3)';
                          }
                        }}
                        title="Copiar código al portapapeles"
                      >
                        {copiado ? (
                          <>
                            <Check size={18} strokeWidth={2.5} />
                            <span>¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={18} />
                            <span>Copiar Código</span>
                          </>
                        )}
                      </button>
                    </div>
                    <span className="lr-codigo-hint">Conserve este código para consultar el estado de su reclamo</span>
                  </div>

                  {reclamoCreado.fecha_registro && (
                    <ul className="lr-list mt-3">
                      <li>
                        <strong>Fecha de registro:</strong>{' '}
                        {new Date(reclamoCreado.fecha_registro).toLocaleString('es-PE', {
                          day: '2-digit', month: 'long', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </li>
                    </ul>
                  )}
                </div>

                <div className="lr-item" data-aos="fade-up" data-aos-delay="80">
                  <h3 data-numero="→">Próximos Pasos</h3>
                  <ul className="lr-list">
                    <li>Recibirá una confirmación al correo electrónico proporcionado.</li>
                    <li>El equipo revisará su reclamo y se comunicará con usted a la brevedad.</li>
                    <li>Puede consultar el estado en cualquier momento con su código y número de documento.</li>
                    <li>
                      La formulación del reclamo no impide acudir a otras vías de solución ni es
                      requisito previo para interponer una denuncia ante el INDECOPI.
                    </li>
                  </ul>
                </div>

                <div className="lr-acciones-finales">
                  <button className="btn-custom me-3"
                    onClick={() => navigate('/libro-reclamaciones/consultar')}>
                    Consultar Estado
                  </button>
                  <button className="lr-btn-secundario"
                    onClick={() => { setReclamoCreado(null); setArchivos([]); setFormulario(INITIAL_FORM); }}>
                    Registrar Nuevo Reclamo
                  </button>
                </div>

              </div>
            </div>
          </section>
        </main>
      </>
    );
  }

  // ── FORMULARIO ─────────────────────────────────────────────────────────────
  return (
    <>
      <style>{libroReclamacionesStyles}</style>
      <main className="main">

        <div className="lr-page-header">
          <div className="container text-center">
            <h1 data-aos="fade-down">Registrar Reclamo o Queja</h1>
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
                  Complete el siguiente formulario con sus datos personales y el detalle de su
                  disconformidad. Todos los campos marcados con <strong>*</strong> son obligatorios.
                  Su reclamo será atendido en un plazo no mayor a{' '}
                  <strong>quince (15) días hábiles</strong>.
                </p>
              </div>

              <form onSubmit={handleSubmit}>

                {/* ── 1. CONSUMIDOR ── */}
                <div className="lr-item" data-aos="fade-up" data-aos-delay="60">
                  <h3 data-numero="1">Identificación del Consumidor Reclamante</h3>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="lr-label">Nombres <span className="lr-req">*</span></label>
                      <input className="lr-input" type="text" name="nombres"
                        value={formulario.nombres} onChange={handleChange} required placeholder="Juan Carlos" />
                    </div>
                    <div className="col-md-6">
                      <label className="lr-label">Apellidos <span className="lr-req">*</span></label>
                      <input className="lr-input" type="text" name="apellidos"
                        value={formulario.apellidos} onChange={handleChange} required placeholder="Pérez García" />
                    </div>
                    <div className="col-md-4">
                      <label className="lr-label">Tipo de Documento <span className="lr-req">*</span></label>
                      <select className="lr-input" name="tipo_documento"
                        value={formulario.tipo_documento} onChange={handleChange} required>
                        <option value="DNI">DNI</option>
                        <option value="CE">Carné de Extranjería</option>
                        <option value="PASAPORTE">Pasaporte</option>
                        <option value="RUC">RUC</option>
                      </select>
                    </div>
                    <div className="col-md-8">
                      <label className="lr-label">N° de Documento <span className="lr-req">*</span></label>
                      <input className="lr-input" type="text" name="numero_documento"
                        value={formulario.numero_documento} onChange={handleChange} required placeholder="12345678" />
                    </div>
                    <div className="col-12">
                      <label className="lr-label">Dirección <span className="lr-req">*</span></label>
                      <input className="lr-input" type="text" name="direccion"
                        value={formulario.direccion} onChange={handleChange} required placeholder="Av. Principal 123, Lima" />
                    </div>
                    <div className="col-md-6">
                      <label className="lr-label">Teléfono / Celular <span className="lr-req">*</span></label>
                      <input className="lr-input" type="tel" name="telefono"
                        value={formulario.telefono} onChange={handleChange} required placeholder="987654321" />
                    </div>
                    <div className="col-md-6">
                      <label className="lr-label">Correo Electrónico <span className="lr-req">*</span></label>
                      <input className="lr-input" type="email" name="email"
                        value={formulario.email} onChange={handleChange} required placeholder="ejemplo@correo.com" />
                    </div>
                    <div className="col-12">
                      <label className="lr-check-wrap">
                        <input type="checkbox" name="menor_edad"
                          checked={formulario.menor_edad} onChange={handleChange} />
                        <span>El consumidor es <strong>menor de edad</strong></span>
                      </label>
                    </div>
                    {formulario.menor_edad && (
                      <>
                        <div className="col-12">
                          <p className="lr-hint-text">Complete el nombre del padre, madre o apoderado legal:</p>
                        </div>
                        <div className="col-12">
                          <label className="lr-label">Nombre del Apoderado <span className="lr-req">*</span></label>
                          <input className="lr-input" type="text" name="datos_apoderado"
                            value={formulario.datos_apoderado} onChange={handleChange} required
                            placeholder="Nombre completo del padre, madre o tutor legal" />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* ── 2. BIEN CONTRATADO ── */}
                <div className="lr-item" data-aos="fade-up" data-aos-delay="80">
                  <h3 data-numero="2">Identificación del Bien Contratado</h3>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="lr-label">Tipo de Bien <span className="lr-req">*</span></label>
                      <select className="lr-input" name="tipo_bien_id"
                        value={formulario.tipo_bien_id} onChange={handleChange} required>
                        <option value="">Seleccionar</option>
                        {catalogos.tiposBien.length > 0
                          ? catalogos.tiposBien.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)
                          : <><option value="1">Producto</option><option value="2">Servicio</option></>
                        }
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="lr-label">Monto Reclamado (S/)</label>
                      <input className="lr-input" type="number" name="monto_reclamado"
                        value={formulario.monto_reclamado} onChange={handleChange}
                        step="0.01" min="0" placeholder="0.00" />
                    </div>
                    <div className="col-12">
                      <label className="lr-label">Descripción del Bien o Servicio <span className="lr-req">*</span></label>
                      <textarea className="lr-input" name="descripcion_bien"
                        value={formulario.descripcion_bien} onChange={handleChange} rows={3} required
                        placeholder="Ej: Sesión de terapia ocupacional, paquete de 10 sesiones, etc." />
                    </div>
                  </div>
                </div>

                {/* ── 3. DETALLE ── */}
                <div className="lr-item" data-aos="fade-up" data-aos-delay="100">
                  <h3 data-numero="3">Detalle de la Reclamación y Pedido del Consumidor</h3>

                  <div className="row g-3">
                    <div className="col-12">
                      <label className="lr-label">Tipo de Solicitud <span className="lr-req">*</span></label>
                      <div className="lr-tipo-grupo">
                        {(catalogos.tiposSolicitud.length > 0
                          ? catalogos.tiposSolicitud
                          : [{ id: 1, nombre: 'Reclamo' }, { id: 2, nombre: 'Queja' }]
                        ).map(t => (
                          <label key={t.id}
                            className={`lr-tipo-opcion${formulario.tipo_solicitud_id === String(t.id) ? ' activo' : ''}`}>
                            <input type="radio" name="tipo_solicitud_id" value={t.id}
                              checked={formulario.tipo_solicitud_id === String(t.id)}
                              onChange={handleChange} required />
                            <div>
                              <strong>{t.nombre}</strong>
                              <span>
                                {t.nombre === 'Reclamo'
                                  ? 'Disconformidad con los productos o servicios.'
                                  : 'Malestar respecto a la atención al público.'}
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="col-12">
                      <label className="lr-label">Detalle del Reclamo <span className="lr-req">*</span></label>
                      <textarea className="lr-input" name="detalle_reclamo"
                        value={formulario.detalle_reclamo} onChange={handleChange} rows={6} required
                        placeholder="Describa los hechos: fechas, horarios, personas involucradas y toda información relevante..." />
                    </div>
                    <div className="col-12">
                      <label className="lr-label">Pedido del Consumidor <span className="lr-req">*</span></label>
                      <textarea className="lr-input" name="pedido_consumidor"
                        value={formulario.pedido_consumidor} onChange={handleChange} rows={4} required
                        placeholder="¿Qué solución espera obtener? (devolución, compensación, disculpas, etc.)" />
                    </div>
                  </div>
                </div>

                {/* ── 4. DOCUMENTOS ── */}
                <div className="lr-item" data-aos="fade-up" data-aos-delay="120">
                  <h3 data-numero="4">Documentos Adjuntos</h3>
                  <p>
                    Puede adjuntar documentos que respalden su reclamo (fotos, boletas, contratos,
                    correos electrónicos, etc.). Formatos aceptados: <strong>PDF, JPG, PNG</strong>.
                    Máximo <strong>5 archivos</strong>, 5 MB por archivo.
                  </p>
                  <label className="lr-label">Adjuntar Archivos (opcional)</label>
                  <input className="lr-input" type="file" multiple
                    accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />

                  {archivos.length > 0 && (
                    <ul className="lr-archivos-lista">
                      {archivos.map((file, i) => (
                        <li key={i}>
                          <span>{file.name} <small>({(file.size / 1024 / 1024).toFixed(2)} MB)</small></span>
                          <button type="button" className="lr-quitar" onClick={() => eliminarArchivo(i)}>
                            Quitar
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* ── 5. CONSENTIMIENTO / FIRMA DIGITAL ── */}
                <div className="lr-item" data-aos="fade-up" data-aos-delay="140">
                  <h3 data-numero="5">Declaraciones y Consentimiento</h3>

                  <p>
                    Sus datos personales serán protegidos conforme a la{' '}
                    <strong>Ley N° 29733 – Ley de Protección de Datos Personales</strong> y utilizados
                    exclusivamente para la atención de su reclamo.
                  </p>

                  {/* ✅ FIRMA DIGITAL */}
                  <label className="lr-check-wrap">
                    <input
                      type="checkbox"
                      name="acepta_terminos"
                      checked={formulario.acepta_terminos}
                      onChange={handleChange}
                      required
                    />
                    <span>
                      <strong>Declaro bajo juramento</strong> que la información proporcionada es veraz y exacta.
                      Mediante el envío de este formulario, <strong>manifiesto mi voluntad expresa</strong> y acepto que
                      este registro constituye una <strong>firma digital simple</strong>, conforme a la normativa vigente.
                      <span className="lr-req">*</span>
                    </span>
                  </label>

                  {/* ✅ AUTORIZACIÓN DE DATOS */}
                  <label className="lr-check-wrap mt-3">
                    <input
                      type="checkbox"
                      name="autoriza_datos"
                      checked={formulario.autoriza_datos}
                      onChange={handleChange}
                      required
                    />
                    <span>
                      <strong>Autorizo el tratamiento de mis datos personales</strong> conforme a la Ley N° 29733,
                      para los fines relacionados con la atención del presente reclamo.
                      <span className="lr-req">*</span>
                    </span>
                  </label>

                  {/* ✅ TEXTO LEGAL EXTRA (PRO) */}
                  <div className="lr-nota mt-3">
                    El registro de este reclamo constituye una manifestación de voluntad válida y equivale a una firma digital simple.
                  </div>

                  {/* ⚖️ NOTA LEGAL */}
                  <div className="lr-nota mt-2">
                    La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es
                    requisito previo para interponer una denuncia ante INDECOPI.
                  </div>
                </div>

                {error && (
                  <div className="lr-error" data-aos="fade-up">
                    {error}
                  </div>
                )}

                <div className="lr-submit" data-aos="fade-up">
                  <button type="submit" className="btn-custom me-3" disabled={loading}>
                    {loading
                      ? <><span className="spinner-border spinner-border-sm me-2" role="status" />Enviando...</>
                      : 'Enviar Reclamo'
                    }
                  </button>
                </div>

              </form>

            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default RegistrarReclamo;