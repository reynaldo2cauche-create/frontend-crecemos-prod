import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import archivosOficialesService from '../services/archivosOficialesService';
import Reveal from '../components/public/Reveal';
import RevealText from '../components/public/RevealText';
import Decor from '../components/public/Decor';

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

  // Al terminar la consulta, desplazar suavemente al resultado
  useEffect(() => {
    if (!loading && (documento || error)) {
      const el = resultsRef.current;
      if (el) {
        const y = el.getBoundingClientRect().top + window.pageYOffset - 100;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  }, [loading, documento, error]);

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
            border: 3px solid #8d288f;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #8d288f 0%, #3a2b4a 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-bottom: 4px solid #c263f9;
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
            color: #3a2b4a;
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
            color: #8d288f;
            background: #f7f3fb;
            padding: 12px;
            border-radius: 8px;
            text-align: center;
            margin: 10px 0;
            border: 2px solid #e3d5ef;
          }
          .footer {
            background: #8d288f;
            color: white;
            padding: 25px;
            text-align: center;
            border-top: 4px solid #c263f9;
          }
          .print-controls {
            text-align: center;
            padding: 25px;
            background: #f7fafc;
          }
          .print-button {
            background: #8d288f;
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
      const tipo = documento.tipoDocumento || 'Documento';
      const nombres = documento.destinatario?.nombres || '';
      const apellidos = documento.destinatario?.apellidos || '';
      const nombreArchivo = `${tipo} - ${nombres} ${apellidos}`.trim().replace(/[/\\?%*:|"<>]/g, '-');
      await archivosOficialesService.descargarArchivoValidado(documento.id, documento.codigo, nombreArchivo);
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
    <main className="cx-page vd-page">
      {/* ===================== Hero ===================== */}
      <section className="cx-subhero vd-hero">
        <Decor variant="a" />
        <div className="cx-container">
          <Reveal className="cx-subhero-inner">
            <span className="cx-eyebrow"><i className="bi bi-shield-check" /> Sistema oficial de validación</span>
            <RevealText as="h1" text="Verifica tus documentos" />
            <p>Comprueba la autenticidad de los certificados de Crecemos en segundos.</p>

            <form className={`vd-searchbar ${error && estado === 'error' ? 'is-error' : ''}`} onSubmit={handleValidar}>
              <i className="bi bi-qr-code vd-searchbar-ic" />
              <input
                className="vd-searchbar-input"
                placeholder="Ingresa el código (CTC-XXXXX)"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                autoComplete="off"
                aria-label="Código de validación"
              />
              <button type="submit" className="vd-searchbar-btn" disabled={loading}>
                {loading ? (
                  <><span className="cx-btn-spinner" /> <span className="vd-searchbar-btn-txt">Verificando…</span></>
                ) : (
                  <><span className="vd-searchbar-btn-txt">Verificar</span> <i className="bi bi-arrow-right" /></>
                )}
              </button>
            </form>
            <p className="vd-hint"><i className="bi bi-info-circle-fill" /> El código está en la parte superior de tu documento oficial.</p>

            <div className="vd-trust">
              <span className="vd-chip"><i className="bi bi-patch-check-fill" /> 100% verificable</span>
              <span className="vd-chip"><i className="bi bi-lightning-charge-fill" /> Validación instantánea</span>
              <span className="vd-chip"><i className="bi bi-shield-lock-fill" /> Seguro y oficial</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===================== Cómo funciona + Resultados ===================== */}
      <section className="cx-section cx-section--deco cx-section--soft vd-section">
        <Decor variant="b" />
        <div className="cx-container">
          {/* Cómo funciona (solo antes de validar) */}
          {!documento && !error && (
            <Reveal className="vd-how" y={24}>
              <div className="vd-how-head">
                <span className="cx-eyebrow"><i className="bi bi-stars" /> Cómo funciona</span>
                <RevealText as="h2" text="Valida tu documento en 3 pasos" />
              </div>
              <div className="vd-steps">
                {[
                  { icon: 'bi-search', title: 'Localiza el código', desc: 'Encuentra el código en tu documento oficial (formato CTC-XXXXX).' },
                  { icon: 'bi-keyboard', title: 'Ingresa el código', desc: 'Escríbelo en el buscador superior y presiona verificar.' },
                  { icon: 'bi-patch-check', title: 'Verifica al instante', desc: 'Obtén la validación oficial con todos los datos del documento.' },
                ].map((s, i) => (
                  <div className="vd-step" key={s.title}>
                    <span className="vd-step-n">{i + 1}</span>
                    <i className={`bi ${s.icon} vd-step-ic`} />
                    <h3>{s.title}</h3>
                    <p>{s.desc}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          )}

          {/* Resultados */}
          {(documento || error) && (
            <div className="vd-results" ref={resultsRef}>
              {/* Error */}
              {error && (
                <div className="vd-alert vd-alert--error">
                  <i className="bi bi-x-circle-fill" />
                  <div>
                    <strong>Error de validación. </strong>{error}
                    <br />
                    <small>Código consultado: <strong>{codigo.trim().toUpperCase()}</strong></small>
                  </div>
                </div>
              )}

              {/* Credencial de verificación */}
              {documento && (
                <Reveal className={`vd-cred vd-cred--${estado}`} y={20}>
                  {/* Banda superior: sello animado + estado */}
                  <div className="vd-cred-top">
                    <div className="vd-seal">
                      <svg className="vd-seal-svg" viewBox="0 0 100 100" aria-hidden="true">
                        <circle className="vd-seal-ring" cx="50" cy="50" r="46" />
                        <circle className="vd-seal-disc" cx="50" cy="50" r="37" />
                        {estado === 'success' && <path className="vd-seal-mark" d="M31 51 l13 13 l25 -27" />}
                        {estado === 'warning' && <path className="vd-seal-mark" d="M50 28 L50 56 M50 67 L50 70" />}
                        {estado === 'error' && <path className="vd-seal-mark" d="M36 36 L64 64 M64 36 L36 64" />}
                      </svg>
                    </div>
                    <div className="vd-cred-status">
                      <span className="vd-cred-eyebrow"><i className="bi bi-patch-check-fill" /> Verificación oficial CTC</span>
                      <h3>{estadoTexto}</h3>
                      <p>{documento.tipoDocumento}</p>
                    </div>
                  </div>

                  {/* Cuerpo: talón con código + datos */}
                  <div className="vd-cred-body">
                    <div className="vd-stub">
                      <span className="vd-stub-label"><i className="bi bi-qr-code" /> Código</span>
                      <span className="vd-stub-code">{documento.codigo}</span>
                      <span className="vd-stub-badge"><i className="bi bi-shield-fill-check" /> Oficial</span>
                    </div>

                    <dl className="vd-cred-grid">
                      <div className="vd-field">
                        <dt>Tipo de documento</dt>
                        <dd>{documento.tipoDocumento}</dd>
                      </div>
                      {documento.terapeuta && (
                        <div className="vd-field">
                          <dt>Terapeuta responsable</dt>
                          <dd>Lic. {documento.terapeuta.nombres} {documento.terapeuta.apellidos}</dd>
                        </div>
                      )}
                      <div className="vd-field">
                        <dt>Fecha de emisión</dt>
                        <dd>{formatDate(documento.fechaEmision)}</dd>
                      </div>
                      <div className="vd-field">
                        <dt>Vigencia</dt>
                        <dd className={!documento.vigente ? 'is-danger' : 'is-accent'}>
                          {documento.fechaVigencia
                            ? (documento.vigente
                                ? `Hasta ${formatDate(documento.fechaVigencia)}`
                                : `Expiró ${formatDate(documento.fechaVigencia)}`)
                            : 'Permanente'}
                        </dd>
                      </div>

                      {documento.destinatario && (
                        <>
                          <div className="vd-field-head">
                            <i className="bi bi-person-vcard" />
                            {documento.tipoDestinatario === 'paciente' ? 'Datos del paciente' : 'Datos del trabajador'}
                          </div>
                          <div className="vd-field">
                            <dt>Nombre completo</dt>
                            <dd>{documento.destinatario.nombres} {documento.destinatario.apellidos}</dd>
                          </div>
                          <div className="vd-field">
                            <dt>DNI</dt>
                            <dd>{mostrarDNI(documento.destinatario.dni)}</dd>
                          </div>
                          {documento.tipoDestinatario === 'trabajador' ? (
                            <div className="vd-field">
                              <dt>Especialidad</dt>
                              <dd>{documento.destinatario.especialidad?.nombre || 'No especificada'}</dd>
                            </div>
                          ) : (
                            <div className="vd-field">
                              <dt>Estado</dt>
                              <dd>
                                <span className={`vd-pill ${esDestinatarioActivo(documento.destinatario.estado) ? 'is-active' : 'is-inactive'}`}>
                                  {obtenerTextoEstado(documento.destinatario.estado)}
                                </span>
                              </dd>
                            </div>
                          )}
                        </>
                      )}
                    </dl>
                  </div>

                  {/* Pie: url + acciones */}
                  <div className="vd-cred-foot">
                    {documento.urlVerificacion && (
                      <div className="vd-cred-url no-print">
                        <i className="bi bi-link-45deg" />
                        <code>{documento.urlVerificacion}</code>
                      </div>
                    )}
                    <div className="vd-actions no-print">
                      <button className="cx-btn cx-btn-ghost vd-abtn" onClick={handleImprimirComprobante}>
                        <i className="bi bi-printer" /> Imprimir
                      </button>
                      <button className="cx-btn cx-btn-soft vd-abtn" onClick={handleCompartir}>
                        <i className="bi bi-share" /> Compartir
                      </button>
                      <button className="cx-btn cx-btn-primary vd-abtn" onClick={handleDescargarPDF}>
                        <i className="bi bi-download" /> Descargar PDF
                      </button>
                    </div>
                  </div>
                </Reveal>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ===================== CTA final ===================== */}
      <section className="cx-section">
        <div className="cx-container">
          <Reveal className="cx-cta-band" y={30}>
            <span className="cx-cta-glow" aria-hidden="true" />
            <span className="cx-cta-glow cx-cta-glow--2" aria-hidden="true" />
            <div className="cx-cta-content">
              <span className="cx-cta-eyebrow"><i className="bi bi-shield-check" /> Documentos verificables</span>
              <RevealText as="h2" text="¿Necesitas un certificado oficial?" />
              <p>Los pacientes de Crecemos reciben certificados y constancias con código de validación oficial. Agenda tu cita y accede a documentos 100% verificables.</p>
              <div className="cx-cta-actions">
                <Link to="/contactanos" className="cx-btn cx-cta-btn">
                  <span>Agendar cita</span>
                  <i className="bi bi-arrow-right" />
                </Link>
                <Link to="/verificar-beneficios" className="cx-btn cx-cta-btn-ghost">
                  Consultar beneficios
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <style>{`
        /* ===== Hero ===== */
        .vd-hero { padding-bottom: clamp(40px, 5vw, 60px); }
        .cx-site .vd-hero .cx-subhero-inner { text-align: center; }
        .cx-site .vd-hero .cx-subhero-inner > p,
        .cx-site .vd-hero .vd-hint {
          color: var(--cx-ink-2); font-weight: 500;
          text-align: center; margin-left: auto; margin-right: auto;
        }
        .cx-site .vd-hero .cx-subhero-inner > p { max-width: 600px; }
        .cx-page .vd-section { padding-top: clamp(28px, 3.5vw, 44px); }

        /* Un solo fondo continuo — hero y secciones transparentes, sin franjas duras */
        .cx-site .cx-page.vd-page {
          background:
            radial-gradient(90% 52% at 50% -6%, var(--cx-primary-050) 0%, transparent 56%),
            radial-gradient(70% 44% at 50% 108%, var(--cx-lila-050) 0%, transparent 60%),
            var(--cx-bg);
        }
        .cx-page.vd-page .vd-hero,
        .cx-page.vd-page .vd-section { background: transparent; }
        /* Grano fino sobre todo — textura sutil, quita lo plano */
        .cx-page.vd-page::after {
          content: ''; position: fixed; inset: 0; z-index: 50; pointer-events: none;
          opacity: .05; mix-blend-mode: soft-light;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        /* ===== Barra de búsqueda ===== */
        .vd-searchbar {
          display: flex; align-items: center; gap: 10px;
          width: 100%; max-width: 520px; margin: clamp(26px, 4vw, 38px) auto 0;
          padding: 7px 7px 7px 18px;
          background: rgba(255, 255, 255, .55);
          backdrop-filter: saturate(160%) blur(14px);
          -webkit-backdrop-filter: saturate(160%) blur(14px);
          border: 1px solid rgba(255, 255, 255, .6);
          border-radius: var(--cx-r-pill);
          box-shadow: 0 20px 44px -26px rgba(58, 43, 74, .4), inset 0 1px 0 rgba(255, 255, 255, .5);
          transition: border-color .3s, box-shadow .3s, transform .3s;
        }
        .vd-searchbar:focus-within { border-color: rgba(255, 255, 255, .9); box-shadow: 0 26px 52px -26px rgba(141, 40, 143, .35), inset 0 1px 0 rgba(255, 255, 255, .6); transform: translateY(-2px); }
        .vd-searchbar.is-error { border-color: #e5484d; }
        .vd-searchbar-ic { flex: 0 0 auto; color: #174ea6; font-size: 1.25rem; }
        .vd-searchbar-input {
          flex: 1; min-width: 0; border: 0; background: none; outline: none; text-align: center;
          padding: 12px 4px; color: var(--cx-ink);
          font-family: var(--cx-font); font-size: 1.02rem; font-weight: 700; letter-spacing: .06em;
        }
        .vd-searchbar-input::placeholder { letter-spacing: normal; font-weight: 500; color: var(--cx-muted); }
        .vd-searchbar-btn {
          flex: 0 0 auto; display: inline-flex; align-items: center; gap: 8px; border: 0; cursor: pointer;
          padding: 13px 22px; border-radius: var(--cx-r-pill); color: #fff; font-family: var(--cx-font); font-weight: 700; font-size: .95rem;
          background: linear-gradient(120deg, #4fc08a, #2fa37a);
          box-shadow: 0 12px 24px -12px rgba(47, 163, 122, .6);
          transition: transform .25s, box-shadow .25s;
        }
        .vd-searchbar-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 18px 34px -12px rgba(47, 163, 122, .75); }
        .vd-searchbar-btn:disabled { opacity: .7; cursor: not-allowed; }
        .vd-searchbar-btn i { transition: transform .25s; }
        .vd-searchbar-btn:hover:not(:disabled) i { transform: translateX(3px); }
        .vd-hint { margin-top: 16px; text-align: center; color: var(--cx-ink-2); font-size: .88rem; font-weight: 500; }
        .vd-hint i { color: var(--cx-primary-700); margin-right: 5px; }

        /* Chips de confianza — un toque de vida y color en el hero */
        .vd-trust { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-top: 22px; }
        .vd-chip {
          display: inline-flex; align-items: center; gap: 7px; padding: 9px 16px; border-radius: var(--cx-r-pill);
          background: rgba(255, 255, 255, .55);
          backdrop-filter: saturate(160%) blur(10px); -webkit-backdrop-filter: saturate(160%) blur(10px);
          border: 1px solid rgba(255, 255, 255, .6);
          box-shadow: 0 8px 20px -14px rgba(50, 20, 80, .3), inset 0 1px 0 rgba(255, 255, 255, .5);
          font-size: .82rem; font-weight: 700; color: var(--cx-ink-2);
          transition: transform .25s, box-shadow .25s, border-color .25s;
        }
        .vd-chip:hover { transform: translateY(-2px); border-color: rgba(255, 255, 255, .9); box-shadow: 0 12px 26px -14px rgba(50, 20, 80, .4), inset 0 1px 0 rgba(255, 255, 255, .6); }
        .vd-chip i { font-size: .98rem; }
        .vd-chip:nth-child(1) i { color: #206ad0; }
        .vd-chip:nth-child(2) i { color: #a93ef0; }
        .vd-chip:nth-child(3) i { color: #2b9c6f; }

        @media (max-width: 520px) {
          .vd-searchbar { flex-wrap: wrap; border-radius: var(--cx-r-lg); padding: 14px; gap: 10px; }
          .vd-searchbar-ic { display: none; }
          .vd-searchbar-input { flex: 1 1 100%; padding: 12px 6px; text-align: center; }
          .vd-searchbar-btn { flex: 1 1 100%; justify-content: center; }
        }

        /* ===== Cómo funciona (3 pasos) ===== */
        .vd-how { margin-top: clamp(44px, 6vw, 66px); }
        .vd-how-head { text-align: center; margin-bottom: clamp(26px, 3.4vw, 40px); }
        .cx-site .vd-how-head h2 { font-size: clamp(1.5rem, 3vw, 2.15rem); margin-top: 12px; }
        .vd-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
        .vd-step {
          position: relative; text-align: center; padding: 30px 24px 26px;
          background: rgba(255, 255, 255, .5);
          backdrop-filter: saturate(160%) blur(12px);
          -webkit-backdrop-filter: saturate(160%) blur(12px);
          border: 1px solid rgba(255, 255, 255, .6); border-radius: var(--cx-r-lg);
          box-shadow: 0 1px 2px rgba(50, 20, 80, .05), 0 10px 24px -14px rgba(50, 20, 80, .18), 0 26px 50px -30px rgba(50, 20, 80, .26), inset 0 1px 0 rgba(255, 255, 255, .55);
          transition: transform .3s cubic-bezier(.2,.8,.2,1), box-shadow .3s, border-color .3s;
        }
        .vd-step:hover { transform: translateY(-6px); box-shadow: 0 2px 4px rgba(50, 20, 80, .06), 0 16px 32px -16px rgba(50, 20, 80, .22), 0 40px 70px -34px rgba(50, 20, 80, .36), inset 0 1px 0 rgba(255, 255, 255, .6); border-color: rgba(255, 255, 255, .9); }
        .vd-step-n {
          position: absolute; top: -15px; left: 50%; transform: translateX(-50%);
          width: 36px; height: 36px; border-radius: 50%; display: grid; place-items: center;
          color: #fff; font-weight: 800; font-size: .92rem;
        }
        .vd-step-ic { display: block; font-size: 2rem; margin: 12px 0 12px; transition: transform .3s cubic-bezier(.2,.8,.2,1); }
        .vd-step:hover .vd-step-ic { transform: scale(1.14) rotate(-5deg); }
        .cx-site .vd-step h3 { font-family: var(--cx-font); font-size: 1.06rem; font-weight: 700; color: var(--cx-ink); margin: 0 0 8px; }
        .vd-step p { color: var(--cx-muted); font-size: .9rem; line-height: 1.6; margin: 0; }

        /* Superficie neutra (glass); mismo orden de color que Beneficios: azul → morado → verde */
        .vd-step:nth-child(1) .vd-step-n { background: linear-gradient(135deg, #3d7bd6, #174ea6); box-shadow: 0 10px 20px -8px rgba(23,78,166,.4); }
        .vd-step:nth-child(1) .vd-step-ic { color: #206ad0; }
        .vd-step:nth-child(2) .vd-step-n { background: linear-gradient(135deg, #c263f9, #a93ef0); box-shadow: 0 10px 20px -8px rgba(169,62,240,.45); }
        .vd-step:nth-child(2) .vd-step-ic { color: #a93ef0; }
        .vd-step:nth-child(3) .vd-step-n { background: linear-gradient(135deg, #4fc08a, #2fa37a); box-shadow: 0 10px 20px -8px rgba(47,163,122,.38); }
        .vd-step:nth-child(3) .vd-step-ic { color: #2b9c6f; }

        @media (max-width: 720px) { .vd-steps { grid-template-columns: 1fr; } }

        /* ===== Resultados ===== */
        .vd-results { margin-top: clamp(8px, 1.5vw, 18px); }
        .vd-actions { display: flex; gap: 10px; flex-wrap: wrap; }
        .vd-abtn { padding: 11px 18px; font-size: .9rem; }

        /* ===== Alertas (error de búsqueda) ===== */
        .vd-alert {
          display: flex; gap: 14px; align-items: flex-start;
          padding: 18px 22px; border-radius: var(--cx-r-md);
          font-size: .95rem; line-height: 1.6; margin-bottom: 22px;
        }
        .vd-alert i { font-size: 1.4rem; flex: 0 0 auto; line-height: 1.4; }
        .vd-alert strong { font-weight: 700; }
        .vd-alert--error   { background: #fbe4e4; color: #8a2a28; }
        .vd-alert--error i { color: #d33; }

        /* ============================================================
           CREDENCIAL DE VERIFICACIÓN — color con significado según estado
           ============================================================ */
        .vd-cred {
          --acc: var(--cx-primary-600); --acc-2: var(--cx-primary-700);
          --acc-soft: var(--cx-primary-050); --acc-ink: var(--cx-primary-700); --acc-rgb: 169,62,240;
          position: relative; overflow: hidden;
          background: rgba(255, 255, 255, .55);
          backdrop-filter: saturate(160%) blur(18px);
          -webkit-backdrop-filter: saturate(160%) blur(18px);
          border: 1px solid rgba(255, 255, 255, .6);
          border-radius: var(--cx-r-xl);
          box-shadow: 0 2px 4px rgba(50, 20, 80, .05), 0 14px 30px -16px rgba(50, 20, 80, .16), 0 44px 80px -40px rgba(50, 20, 80, .32), inset 0 1px 0 rgba(255, 255, 255, .6);
          transition: transform .35s cubic-bezier(.2,.8,.2,1), box-shadow .35s;
        }
        .vd-cred:hover { transform: translateY(-4px); box-shadow: 0 3px 6px rgba(50, 20, 80, .06), 0 20px 40px -18px rgba(50, 20, 80, .2), 0 56px 96px -44px rgba(50, 20, 80, .38), inset 0 1px 0 rgba(255, 255, 255, .65); }
        .vd-cred--success { --acc: #2fa37a; --acc-2: #27906b; --acc-soft: #e9f6ef; --acc-ink: #256b4f; --acc-rgb: 47,163,122; }
        .vd-cred--warning { --acc: #e0912a; --acc-2: #c67d1e; --acc-soft: #f8ecd6; --acc-ink: #8a5a1a; --acc-rgb: 224,145,42; }
        .vd-cred--error   { --acc: #e0524f; --acc-2: #c73f3c; --acc-soft: #fbe4e4; --acc-ink: #a3312f; --acc-rgb: 224,82,79; }
        /* Halo de color suave difuminado — ambiente, no bloque duro */
        .vd-cred::before {
          content: ''; position: absolute; top: -40%; left: 50%; transform: translateX(-50%);
          width: 120%; height: 80%; z-index: 0; pointer-events: none;
          background: radial-gradient(50% 60% at 50% 0%, rgba(var(--acc-rgb), .22), transparent 70%);
        }
        .vd-cred > * { position: relative; z-index: 1; }

        /* --- Banda superior: sello + estado --- */
        .vd-cred-top {
          display: flex; align-items: center; gap: 22px;
          padding: 34px 32px 26px;
          background: linear-gradient(180deg, rgba(var(--acc-rgb), .10), transparent 92%);
        }
        .vd-seal { position: relative; flex: 0 0 auto; width: 88px; height: 88px; filter: drop-shadow(0 12px 22px rgba(var(--acc-rgb), .35)); }
        .vd-seal::before {
          content: ''; position: absolute; inset: -10px; border-radius: 50%; z-index: 0;
          background: radial-gradient(circle, rgba(var(--acc-rgb), .3), transparent 68%);
          animation: vd-pulse 2.6s ease-in-out infinite;
        }
        .vd-seal-svg { position: relative; z-index: 1; width: 100%; height: 100%; display: block; }
        @keyframes vd-pulse { 0%, 100% { transform: scale(.9); opacity: .45; } 50% { transform: scale(1.14); opacity: .85; } }
        .vd-seal-ring { fill: none; stroke: var(--acc); stroke-width: 2.5; stroke-dasharray: 5 6; opacity: .55; transform-origin: 50% 50%; animation: vd-spin 16s linear infinite; }
        .vd-seal-disc { fill: var(--acc); }
        .vd-seal-mark { fill: none; stroke: #fff; stroke-width: 7; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 130; stroke-dashoffset: 130; animation: vd-draw .8s .25s cubic-bezier(.2,.8,.2,1) forwards; }
        @keyframes vd-spin { to { transform: rotate(360deg); } }
        @keyframes vd-draw { to { stroke-dashoffset: 0; } }
        @media (prefers-reduced-motion: reduce) { .vd-seal-ring, .vd-seal::before { animation: none; } .vd-seal-mark { animation: none; stroke-dashoffset: 0; } }

        .vd-cred-eyebrow { display: inline-flex; align-items: center; gap: 7px; font-size: .72rem; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: var(--acc-ink); }
        .cx-site .vd-cred-status h3 { font-family: var(--cx-display); font-weight: 400; font-size: clamp(1.5rem, 3.6vw, 2rem); color: var(--cx-ink); margin: 7px 0 3px; line-height: 1.15; }
        .vd-cred-status p { color: var(--cx-ink-2); font-weight: 600; margin: 0; }

        /* --- Cuerpo: talón (ticket) + datos --- */
        .vd-cred-body { position: relative; display: flex; align-items: stretch; }
        .vd-cred-body::before, .vd-cred-body::after {
          content: ''; position: absolute; left: 240px; width: 22px; height: 22px; border-radius: 50%;
          background: var(--cx-bg-soft); border: 1px solid var(--cx-line); transform: translate(-50%, -50%); z-index: 2;
        }
        .vd-cred-body::before { top: 0; }
        .vd-cred-body::after { top: 100%; }

        .vd-stub {
          position: relative; flex: 0 0 240px; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 12px; text-align: center; padding: 30px 22px;
          background:
            repeating-linear-gradient(45deg, rgba(var(--acc-rgb), .05) 0 2px, transparent 2px 10px),
            rgba(var(--acc-rgb), .08);
        }
        .vd-stub::after {
          content: ''; position: absolute; top: 16px; bottom: 16px; right: -1px; width: 2px;
          background-image: linear-gradient(var(--acc) 45%, transparent 0);
          background-size: 2px 12px; background-repeat: repeat-y; opacity: .3;
        }
        .vd-stub-label { display: inline-flex; align-items: center; gap: 6px; font-size: .72rem; font-weight: 800; letter-spacing: .05em; text-transform: uppercase; color: var(--acc-ink); }
        .vd-stub-code { font-family: 'Courier New', monospace; font-weight: 800; font-size: clamp(1.1rem, 4vw, 1.45rem); letter-spacing: .08em; color: var(--cx-ink); word-break: break-all; line-height: 1.2; }
        .vd-stub-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 13px; border-radius: var(--cx-r-pill); background: var(--acc); color: #fff; font-size: .72rem; font-weight: 700; box-shadow: 0 8px 16px -8px rgba(var(--acc-rgb), .7); }

        .vd-cred-grid { flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 2px 30px; margin: 0; padding: 26px 30px; }
        .vd-field { display: flex; flex-direction: column; gap: 3px; padding: 9px 0; }
        .vd-field dt { font-size: .72rem; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; color: var(--cx-muted); margin: 0; }
        .vd-field dd { margin: 0; font-size: .95rem; font-weight: 700; color: var(--cx-ink); }
        .vd-field dd.is-accent { color: var(--acc-ink); }
        .vd-field dd.is-danger { color: #a3312f; }
        .vd-field-head {
          grid-column: 1 / -1; display: flex; align-items: center; gap: 8px;
          margin-top: 12px; padding-top: 15px; border-top: 1px dashed var(--cx-line);
          font-size: .76rem; font-weight: 800; letter-spacing: .05em; text-transform: uppercase; color: var(--acc-ink);
        }
        .vd-field-head i { color: var(--acc); font-size: 1rem; }
        .vd-pill { display: inline-flex; align-items: center; padding: 4px 12px; border-radius: var(--cx-r-pill); font-size: .8rem; font-weight: 700; }
        .vd-pill.is-active { background: var(--cx-mint); color: #2f6a48; }
        .vd-pill.is-inactive { background: var(--cx-bg-soft); color: var(--cx-muted); border: 1px solid var(--cx-line); }

        /* --- Pie: url + acciones --- */
        .vd-cred-foot {
          display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;
          padding: 18px 30px 22px; border-top: 1px solid rgba(255, 255, 255, .55); background: rgba(255, 255, 255, .32);
        }
        .vd-cred-url { display: flex; align-items: center; gap: 9px; min-width: 0; flex: 1; color: var(--cx-muted); font-size: .82rem; }
        .vd-cred-url i { color: var(--acc); font-size: 1.15rem; flex: 0 0 auto; }
        .vd-cred-url code { font-family: 'Courier New', monospace; color: var(--cx-ink-2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        /* ===== Responsive ===== */
        @media (max-width: 720px) {
          .vd-cred-body { flex-direction: column; }
          .vd-cred-body::before, .vd-cred-body::after { display: none; }
          .vd-stub { flex: none; border-bottom: 2px dashed var(--acc); }
          .vd-stub::after { display: none; }
          .vd-cred-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .vd-cred-top { flex-direction: column; text-align: center; gap: 14px; padding: 28px 20px 22px; }
          .vd-cred-grid { padding: 22px 20px; gap: 2px 20px; }
          .vd-stub { padding: 26px 20px; }
          .vd-cred-foot { flex-direction: column; align-items: stretch; padding: 16px 20px 20px; }
          .vd-cred-url { justify-content: center; }
          .vd-actions { width: 100%; }
          .vd-actions .cx-btn { flex: 1; justify-content: center; }
        }
        @media (max-width: 420px) {
          .vd-trust { gap: 8px; }
          .vd-chip { padding: 8px 13px; font-size: .78rem; }
          .vd-cred-url code { font-size: .76rem; }
        }

        @media print {
          .no-print { display: none !important; }
        }
      `}</style>
    </main>
  );
};

export default VerificarDocumentos;
