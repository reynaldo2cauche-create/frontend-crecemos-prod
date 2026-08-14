import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { verificarPacienteYObtenerBeneficios } from '../services/pacienteService';
import { getTerminosPorBeneficio } from '../services/conveniosService';
import { API_BASE_URL, SERVER_BASE_URL } from '../services/api';
import Reveal from '../components/public/Reveal';
import RevealText from '../components/public/RevealText';
import Decor from '../components/public/Decor';

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
  const [expandedIds, setExpandedIds] = useState(() => new Set());

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const resultsRef = useRef(null);

  // Al terminar una consulta (éxito o error), desplazar suavemente al resultado
  useEffect(() => {
    if (!loading && (paciente || error)) {
      const el = resultsRef.current;
      if (el) {
        const y = el.getBoundingClientRect().top + window.pageYOffset - 100;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  }, [loading, paciente, error]);
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

  const iconoEstado = {
    success: 'bi-check-circle-fill',
    error: 'bi-x-circle-fill',
    warning: 'bi-exclamation-triangle-fill',
    idle: 'bi-clock-history',
  };

  return (
    <main className="cx-page vb-page">
      {/* ===================== Hero ===================== */}
      <section className="cx-subhero vb-hero">
        <Decor variant="a" />
        <div className="cx-container">
          <Reveal className="cx-subhero-inner">
            <span className="cx-eyebrow"><i className="bi bi-gift-fill" /> Beneficios para pacientes</span>
            <RevealText as="h1" text="Consulta tus beneficios" />
            <p>Convenios y descuentos exclusivos para pacientes activos de Crecemos.</p>

            <form className={`vb-searchbar ${error && estado === 'error' ? 'is-error' : ''}`} onSubmit={handleValidar}>
              <i className="bi bi-person-vcard vb-searchbar-ic" />
              <input
                className="vb-searchbar-input"
                placeholder="Ingresa el DNI (8 dígitos)"
                value={dni}
                onChange={(e) => setDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
                autoComplete="off"
                maxLength="8"
                inputMode="numeric"
                aria-label="DNI del paciente"
              />
              <button type="submit" className="vb-searchbar-btn" disabled={loading}>
                {loading ? (
                  <><span className="cx-btn-spinner" /> <span className="vb-searchbar-btn-txt">Consultando…</span></>
                ) : (
                  <><span className="vb-searchbar-btn-txt">Consultar</span> <i className="bi bi-arrow-right" /></>
                )}
              </button>
            </form>
            <p className="vb-hint"><i className="bi bi-shield-lock-fill" /> Solo pacientes activos acceden a los beneficios vigentes.</p>
          </Reveal>
        </div>
      </section>

      {/* ===================== Buscador + Resultados ===================== */}
      <section className="cx-section cx-section--deco cx-section--soft vb-section">
        <Decor variant="b" />
        <div className="cx-container">
          {/* Cómo funciona (solo antes de consultar) */}
          {!paciente && (
            <Reveal className="vb-how" y={24}>
              <div className="vb-how-head">
                <span className="cx-eyebrow"><i className="bi bi-stars" /> Cómo funciona</span>
                <RevealText as="h2" text="Tus beneficios en 3 pasos" />
              </div>
              <div className="vb-steps">
                {[
                  { icon: 'bi-credit-card-2-front', title: 'Ingresa tu DNI', desc: 'Escribe el número de documento del paciente en el buscador.' },
                  { icon: 'bi-search-heart', title: 'Consulta al instante', desc: 'Verificamos que estés activo y buscamos todos tus beneficios vigentes.' },
                  { icon: 'bi-gift', title: 'Presenta y ahorra', desc: 'Muestra tu beneficio en el convenio y disfruta el descuento.' },
                ].map((s, i) => (
                  <div className="vb-step" key={s.title}>
                    <span className="vb-step-n">{i + 1}</span>
                    <i className={`bi ${s.icon} vb-step-ic`} />
                    <h3>{s.title}</h3>
                    <p>{s.desc}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          )}

          {/* Resultados */}
          <div className="vb-results" ref={resultsRef}>
            <div className="vb-results-head no-print">
              <span className={`vb-status vb-status--${estado}`}>
                <i className={`bi ${iconoEstado[estado] || 'bi-clock-history'}`} />
                {estadoTexto}
              </span>

              {paciente && beneficios.length > 0 && (
                <div className="vb-actions">
                  <button className="cx-btn cx-btn-ghost vb-abtn" onClick={handleImprimirBeneficios}>
                    <i className="bi bi-printer" /> Imprimir
                  </button>
                  <button className="cx-btn cx-btn-soft vb-abtn" onClick={handleCompartir}>
                    <i className="bi bi-share" /> Compartir
                  </button>
                </div>
              )}
            </div>

            {!paciente && !error && (
              <Reveal className="vb-alert vb-alert--info" y={16}>
                <i className="bi bi-info-circle-fill" />
                <div>
                  <strong>Bienvenido.</strong> Ingresa un DNI válido de 8 dígitos para consultar
                  los beneficios disponibles.
                </div>
              </Reveal>
            )}

            {error && (
              <div className={`vb-alert ${estado === 'warning' ? 'vb-alert--warning' : 'vb-alert--error'}`}>
                <i className={`bi ${estado === 'warning' ? 'bi-exclamation-triangle-fill' : 'bi-x-circle-fill'}`} />
                <div>
                  <strong>{estado === 'warning' ? 'Aviso: ' : 'Error: '}</strong>{error}
                  <br />
                  <small>DNI consultado: <strong>{dni}</strong></small>
                </div>
              </div>
            )}

            {paciente && beneficios.length > 0 && (
              <div className="vb-list">
                {beneficios.map((beneficio, index) => {
                  const logoUrl = beneficio.convenio?.logo_url
                    ? (beneficio.convenio.logo_url.startsWith('/')
                      ? `${API_BASE_URL}/convenios/logo/${beneficio.convenio.logo_url.split('/').pop()}`
                      : `${API_BASE_URL}/convenios/logo/${beneficio.convenio.logo_url}`)
                    : null;

                  const nombreEmpresa = beneficio.convenio?.empresa || beneficio.convenio?.nombre || beneficio.proveedor || 'Empresa';
                  const open = expandedIds.has(beneficio.id);

                  return (
                    <Reveal as="div" className={`vb-item ${open ? 'is-open' : ''}`} key={beneficio.id} y={16} delay={(index % 4) * 0.04}>
                      <button className="vb-item-head" onClick={() => toggleExpand(beneficio.id)} aria-expanded={open}>
                        <div className="vb-logo">
                          {logoUrl && (
                            <img src={logoUrl} alt={nombreEmpresa} onError={(e) => { e.target.style.display = 'none'; }} />
                          )}
                          <i className="bi bi-building vb-logo-fallback" />
                        </div>
                        <div className="vb-item-txt">
                          <h3 className="vb-name">{beneficio.nombre}</h3>
                          <span className="vb-empresa"><i className="bi bi-building" /> {nombreEmpresa}</span>
                        </div>
                        {beneficio.descuento && <span className="vb-disc">{beneficio.descuento}</span>}
                        <i className="bi bi-chevron-down vb-chevron" />
                      </button>

                      <div className="vb-item-panel">
                        <div className="vb-item-panel-in">
                          <p className="vb-desc">{beneficio.descripcion}</p>
                          <div className="vb-foot">
                            {beneficio.categoria?.nombre && (
                              <span className="vb-cat"><i className="bi bi-tag-fill" /> {beneficio.categoria.nombre}</span>
                            )}
                            <button className="vb-terminos no-print" onClick={() => handleAbrirTerminos(beneficio)}>
                              Términos y condiciones <i className="bi bi-arrow-right" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            )}

            {paciente && beneficios.length === 0 && (
              <div className="vb-alert vb-alert--info">
                <i className="bi bi-inbox" />
                <div>
                  <strong>Sin beneficios.</strong> No hay beneficios disponibles en este momento
                  para este paciente.
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===================== CTA final ===================== */}
      <section className="cx-section">
        <div className="cx-container">
          <Reveal className="cx-cta-band" y={30}>
            <span className="cx-cta-glow" aria-hidden="true" />
            <span className="cx-cta-glow cx-cta-glow--2" aria-hidden="true" />
            <div className="cx-cta-content">
              <span className="cx-cta-eyebrow"><i className="bi bi-gift-fill" /> Aprovecha tus convenios</span>
              <RevealText as="h2" text="¿Aún no eres paciente de Crecemos?" />
              <p>Únete a nuestra comunidad y accede a descuentos exclusivos en convenios de salud, educación y bienestar. Agenda tu primera cita hoy.</p>
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

      {/* ===================== Modal de términos ===================== */}
      {modalTerminos && beneficioSeleccionado && (
        <div className="vb-modal-backdrop" onClick={handleCerrarTerminos}>
          <div className="vb-modal" onClick={(e) => e.stopPropagation()}>
            <div className="vb-modal-head">
              <div className="vb-modal-head-txt">
                <span className="vb-modal-eyebrow"><i className="bi bi-file-earmark-text-fill" /> Términos y condiciones</span>
                <h3>{beneficioSeleccionado.nombre}</h3>
              </div>
              <button className="vb-modal-close" onClick={handleCerrarTerminos} aria-label="Cerrar">
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <div className="vb-modal-body">
              {loadingTerminos ? (
                <div className="vb-modal-loading">
                  <span className="cx-spinner" />
                  <p>Cargando términos…</p>
                </div>
              ) : terminos.length === 0 ? (
                <div className="vb-modal-empty">
                  <i className="bi bi-file-earmark-x" />
                  <h4>Sin términos disponibles</h4>
                  <p>Este beneficio no tiene términos registrados.</p>
                </div>
              ) : (
                <ul className="vb-terminos-list">
                  {terminos.map((termino) => (
                    <li key={termino.id}>
                      <span className="vb-dot" />
                      <p>{termino.descripcion}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* ===== Hero ===== */
        .vb-hero { padding-bottom: clamp(40px, 5vw, 60px); }
        .cx-site .vb-hero .cx-subhero-inner { text-align: center; }
        .cx-site .vb-hero .cx-subhero-inner > p,
        .cx-site .vb-hero .vb-hint {
          color: var(--cx-ink-2); font-weight: 500;
          text-align: center; margin-left: auto; margin-right: auto;
        }
        .cx-site .vb-hero .cx-subhero-inner > p { max-width: 600px; }
        /* menos espacio entre buscador y resultados */
        .cx-page .vb-section { padding-top: clamp(28px, 3.5vw, 44px); }

        /* Un solo fondo continuo — hero y secciones transparentes, sin franjas duras */
        .cx-site .cx-page.vb-page {
          background:
            radial-gradient(90% 52% at 50% -6%, var(--cx-primary-050) 0%, transparent 56%),
            radial-gradient(70% 44% at 50% 108%, var(--cx-lila-050) 0%, transparent 60%),
            var(--cx-bg);
        }
        .cx-page.vb-page .vb-hero,
        .cx-page.vb-page .vb-section { background: transparent; }
        /* Grano fino sobre todo — textura sutil, quita lo plano */
        .cx-page.vb-page::after {
          content: ''; position: fixed; inset: 0; z-index: 50; pointer-events: none;
          opacity: .05; mix-blend-mode: soft-light;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        /* ===== Barra de búsqueda protagonista (estilo Webflow) ===== */
        .vb-searchbar {
          display: flex; align-items: center; gap: 10px;
          width: 100%; max-width: 480px; margin: clamp(26px, 4vw, 38px) auto 0;
          padding: 7px 7px 7px 18px;
          background: rgba(255, 255, 255, .55);
          backdrop-filter: saturate(160%) blur(14px);
          -webkit-backdrop-filter: saturate(160%) blur(14px);
          border: 1px solid rgba(255, 255, 255, .6);
          border-radius: var(--cx-r-pill);
          box-shadow: 0 20px 44px -26px rgba(58, 43, 74, .4), inset 0 1px 0 rgba(255, 255, 255, .5);
          transition: border-color .3s, box-shadow .3s, transform .3s;
        }
        .vb-searchbar:focus-within { border-color: rgba(255, 255, 255, .9); box-shadow: 0 26px 52px -26px rgba(141, 40, 143, .35), inset 0 1px 0 rgba(255, 255, 255, .6); transform: translateY(-2px); }
        .vb-searchbar.is-error { border-color: #e5484d; }
        .vb-searchbar-ic { flex: 0 0 auto; color: var(--cx-primary-700); font-size: 1.25rem; }
        .vb-searchbar-input {
          flex: 1; min-width: 0; border: 0; background: none; outline: none; text-align: center;
          padding: 12px 4px; color: var(--cx-ink);
          font-family: var(--cx-font); font-size: 1.05rem; font-weight: 700; letter-spacing: .1em;
        }
        .vb-searchbar-input::placeholder { letter-spacing: normal; font-weight: 500; color: var(--cx-muted); }
        .vb-searchbar-btn {
          flex: 0 0 auto; display: inline-flex; align-items: center; gap: 8px; border: 0; cursor: pointer;
          padding: 13px 22px; border-radius: var(--cx-r-pill); color: #fff; font-family: var(--cx-font); font-weight: 700; font-size: .95rem;
          background: linear-gradient(120deg, var(--cx-primary), var(--cx-primary-600));
          box-shadow: 0 12px 24px -12px rgba(169, 62, 240, .6);
          transition: transform .25s, box-shadow .25s;
        }
        .vb-searchbar-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 18px 34px -12px rgba(169, 62, 240, .7); }
        .vb-searchbar-btn:disabled { opacity: .7; cursor: not-allowed; }
        .vb-searchbar-btn i { transition: transform .25s; }
        .vb-searchbar-btn:hover:not(:disabled) i { transform: translateX(3px); }
        .vb-hint { margin-top: 16px; text-align: center; color: var(--cx-ink-2); font-size: .88rem; font-weight: 500; }
        .vb-hint i { color: var(--cx-primary-700); margin-right: 5px; }

        @media (max-width: 520px) {
          .vb-searchbar { flex-wrap: wrap; border-radius: var(--cx-r-lg); padding: 14px; gap: 10px; }
          .vb-searchbar-ic { display: none; }
          .vb-searchbar-input { flex: 1 1 100%; padding: 12px 6px; text-align: center; }
          .vb-searchbar-btn { flex: 1 1 100%; justify-content: center; }
        }

        /* ===== Cómo funciona (3 pasos) ===== */
        .vb-how { margin-top: clamp(44px, 6vw, 66px); }
        .vb-how-head { text-align: center; margin-bottom: clamp(26px, 3.4vw, 40px); }
        .cx-site .vb-how-head h2 { font-size: clamp(1.5rem, 3vw, 2.15rem); margin-top: 12px; }
        .vb-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
        .vb-step {
          position: relative; text-align: center; padding: 30px 24px 26px;
          background: rgba(255, 255, 255, .5);
          backdrop-filter: saturate(160%) blur(12px);
          -webkit-backdrop-filter: saturate(160%) blur(12px);
          border: 1px solid rgba(255, 255, 255, .6); border-radius: var(--cx-r-lg);
          box-shadow: 0 1px 2px rgba(50, 20, 80, .05), 0 10px 24px -14px rgba(50, 20, 80, .18), 0 26px 50px -30px rgba(50, 20, 80, .26), inset 0 1px 0 rgba(255, 255, 255, .55);
          transition: transform .3s cubic-bezier(.2,.8,.2,1), box-shadow .3s, border-color .3s;
        }
        .vb-step:hover { transform: translateY(-6px); box-shadow: 0 2px 4px rgba(50, 20, 80, .06), 0 16px 32px -16px rgba(50, 20, 80, .22), 0 40px 70px -34px rgba(50, 20, 80, .36), inset 0 1px 0 rgba(255, 255, 255, .6); border-color: rgba(255, 255, 255, .9); }
        .vb-step-n {
          position: absolute; top: -15px; left: 50%; transform: translateX(-50%);
          width: 36px; height: 36px; border-radius: 50%; display: grid; place-items: center;
          color: #fff; font-weight: 800; font-size: .92rem;
        }
        .vb-step-ic { display: block; font-size: 2rem; margin: 12px 0 12px; transition: transform .3s cubic-bezier(.2,.8,.2,1); }
        .vb-step:hover .vb-step-ic { transform: scale(1.14) rotate(-5deg); }
        .cx-site .vb-step h3 { font-family: var(--cx-font); font-size: 1.06rem; font-weight: 700; color: var(--cx-ink); margin: 0 0 8px; }
        .vb-step p { color: var(--cx-muted); font-size: .9rem; line-height: 1.6; margin: 0; }

        /* Superficie neutra (glass); el color vive solo en el número e ícono */
        .vb-step:nth-child(1) .vb-step-n { background: linear-gradient(135deg, #3d7bd6, #174ea6); box-shadow: 0 10px 20px -8px rgba(23,78,166,.4); }
        .vb-step:nth-child(1) .vb-step-ic { color: #206ad0; }
        .vb-step:nth-child(2) .vb-step-n { background: linear-gradient(135deg, #c263f9, #a93ef0); box-shadow: 0 10px 20px -8px rgba(169,62,240,.45); }
        .vb-step:nth-child(2) .vb-step-ic { color: #a93ef0; }
        .vb-step:nth-child(3) .vb-step-n { background: linear-gradient(135deg, #4fc08a, #2fa37a); box-shadow: 0 10px 20px -8px rgba(47,163,122,.38); }
        .vb-step:nth-child(3) .vb-step-ic { color: #2b9c6f; }

        @media (max-width: 720px) { .vb-steps { grid-template-columns: 1fr; } }

        /* ===== Resultados ===== */
        .vb-results { margin-top: clamp(18px, 2.5vw, 28px); }
        .vb-results-head { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 26px; }
        .vb-status {
          display: inline-flex; align-items: center; gap: 9px;
          padding: 11px 20px; border-radius: var(--cx-r-pill);
          font-weight: 700; font-size: .95rem;
        }
        .vb-status i { font-size: 1.1rem; }
        .vb-status--success { background: var(--cx-mint); color: #2f6a48; }
        .vb-status--error   { background: #fbe4e4; color: #a3312f; }
        .vb-status--warning { background: #f8ebd0; color: #8a5a1a; }
        .vb-status--idle    { background: var(--cx-primary-100); color: var(--cx-primary-700); }
        .vb-actions { display: flex; gap: 10px; }
        .vb-abtn { padding: 11px 18px; font-size: .9rem; }

        /* ===== Alertas ===== */
        .vb-alert {
          display: flex; gap: 14px; align-items: flex-start;
          padding: 18px 22px; border-radius: var(--cx-r-md);
          font-size: .95rem; line-height: 1.6; margin-bottom: 22px;
        }
        .vb-alert i { font-size: 1.4rem; flex: 0 0 auto; line-height: 1.4; }
        .vb-alert strong { font-weight: 700; }
        .vb-alert--info    { background: var(--cx-primary-050); color: var(--cx-ink-2); border: 1px solid var(--cx-primary-100); }
        .vb-alert--info i  { color: var(--cx-primary-700); }
        .vb-alert--error   { background: #fbe4e4; color: #8a2a28; }
        .vb-alert--error i { color: #d33; }
        .vb-alert--warning   { background: #f8ebd0; color: #7a4f18; }
        .vb-alert--warning i { color: #c78a1e; }

        /* ===== Lista acordeón de beneficios (2 columnas) ===== */
        .vb-list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; align-items: start; }
        .vb-item {
          background: rgba(255, 255, 255, .55);
          backdrop-filter: saturate(160%) blur(12px);
          -webkit-backdrop-filter: saturate(160%) blur(12px);
          border: 1px solid rgba(255, 255, 255, .6);
          border-radius: var(--cx-r-md); overflow: hidden;
          box-shadow: 0 1px 2px rgba(50, 20, 80, .05), 0 12px 28px -18px rgba(50, 20, 80, .2), inset 0 1px 0 rgba(255, 255, 255, .5);
          transition: border-color .25s, box-shadow .25s, transform .25s;
        }
        .vb-item:hover { border-color: var(--cx-primary-200); box-shadow: var(--cx-shadow-sm), inset 3px 0 0 var(--cx-primary-200); }
        .vb-item.is-open { border-color: var(--cx-primary-200); box-shadow: var(--cx-shadow), inset 3px 0 0 var(--cx-primary); }
        .vb-item.is-open .vb-item-head { background: linear-gradient(180deg, var(--cx-primary-050), transparent 92%); }

        .vb-item-head {
          display: flex; align-items: center; gap: 14px; width: 100%;
          padding: 13px 18px; background: none; border: 0; cursor: pointer; text-align: left; font-family: inherit;
        }
        .vb-logo {
          position: relative; flex: 0 0 auto; width: 60px; height: 60px; border-radius: 14px; overflow: hidden;
          display: grid; place-items: center; background: #fff; border: 1px solid var(--cx-line); box-shadow: var(--cx-shadow-sm);
        }
        .vb-logo img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; padding: 7px; z-index: 1; }
        .vb-logo-fallback { z-index: 0; font-size: 1.15rem; color: var(--cx-primary-700); }
        .vb-item-txt { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
        .cx-site .vb-item-txt .vb-name { font-family: var(--cx-font); font-size: 1rem; font-weight: 700; color: var(--cx-ink); line-height: 1.3; margin: 0; }
        .vb-empresa { display: inline-flex; align-items: center; gap: 5px; min-width: 0; font-size: .8rem; font-weight: 600; color: var(--cx-muted); }
        .vb-empresa i { color: var(--cx-lila-600); font-size: .82rem; flex: 0 0 auto; }
        .vb-disc {
          flex: 0 0 auto; padding: 6px 13px; border-radius: var(--cx-r-pill);
          background: var(--cx-mint); color: #2f6a48; font-weight: 800; font-size: .82rem; border: 1px solid rgba(63,138,90,.22);
        }
        .vb-chevron { flex: 0 0 auto; color: var(--cx-muted); font-size: 1rem; transition: transform .3s, color .3s; }
        .vb-item.is-open .vb-chevron { transform: rotate(180deg); color: var(--cx-primary-700); }

        .vb-item-panel { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .35s cubic-bezier(.2,.8,.2,1); }
        .vb-item.is-open .vb-item-panel { grid-template-rows: 1fr; }
        .vb-item-panel-in { overflow: hidden; }
        .vb-item-panel .vb-desc { margin: 0; padding: 4px 18px 0; color: var(--cx-ink-2); font-size: .92rem; line-height: 1.65; }
        .vb-foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin: 14px 18px 0; padding: 14px 0 16px; border-top: 1px solid var(--cx-line); }
        .vb-cat {
          display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: var(--cx-r-pill);
          background: var(--cx-primary-050); border: 1px solid var(--cx-primary-100); color: var(--cx-primary-700); font-size: .76rem; font-weight: 700;
        }
        .vb-terminos {
          display: inline-flex; align-items: center; gap: 7px; padding: 0; border: 0; background: none; cursor: pointer;
          color: var(--cx-primary-700); font-weight: 700; font-size: .85rem; transition: gap .25s, color .25s;
        }
        .vb-terminos i { transition: transform .25s; }
        .vb-terminos:hover { gap: 10px; color: var(--cx-primary); }
        .vb-terminos:hover i { transform: translateX(3px); }

        /* ===== Modal de términos ===== */
        .vb-modal-backdrop {
          position: fixed; inset: 0; z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px;
          background: rgba(24,15,38,.55); -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px);
          animation: vb-fade .25s ease;
        }
        .vb-modal {
          width: 100%; max-width: 560px; max-height: 82vh; display: flex; flex-direction: column; overflow: hidden;
          background: var(--cx-surface); border-radius: var(--cx-r-lg); box-shadow: var(--cx-shadow-lg);
          animation: vb-modal-in .35s cubic-bezier(.2,.8,.2,1);
        }
        .vb-modal-head {
          display: flex; align-items: flex-start; justify-content: space-between; gap: 16px;
          padding: 24px 26px; border-bottom: 1px solid var(--cx-line);
          background: radial-gradient(120% 100% at 0% 0%, var(--cx-primary-050), transparent 60%);
        }
        .vb-modal-eyebrow { display: inline-flex; align-items: center; gap: 7px; font-size: .72rem; font-weight: 700; letter-spacing: .05em; text-transform: uppercase; color: var(--cx-primary-700); }
        .cx-site .vb-modal-head h3 { font-family: var(--cx-display); font-weight: 400; color: var(--cx-ink); font-size: 1.3rem; margin: 8px 0 0; line-height: 1.2; }
        .vb-modal-close {
          flex: 0 0 auto; width: 38px; height: 38px; border: 0; border-radius: 50%; cursor: pointer;
          display: grid; place-items: center; font-size: 1rem; color: var(--cx-ink); background: var(--cx-bg-soft); transition: all .25s;
        }
        .vb-modal-close:hover { background: var(--cx-primary); color: #fff; transform: rotate(90deg); }
        .vb-modal-body { padding: 24px 26px; overflow-y: auto; }
        .vb-modal-body::-webkit-scrollbar { width: 7px; }
        .vb-modal-body::-webkit-scrollbar-thumb { background: var(--cx-primary-200); border-radius: 999px; }

        .vb-terminos-list { list-style: none; padding: 0; margin: 0; }
        .vb-terminos-list li { display: flex; gap: 12px; align-items: flex-start; padding: 12px 0; border-bottom: 1px solid var(--cx-line); }
        .vb-terminos-list li:last-child { border-bottom: 0; }
        .vb-dot { flex: 0 0 auto; width: 10px; height: 10px; border-radius: 50%; margin-top: 6px; background: linear-gradient(135deg, var(--cx-primary), var(--cx-peach)); box-shadow: 0 0 0 4px var(--cx-primary-050); }
        .vb-terminos-list p { margin: 0; color: var(--cx-ink-2); font-size: .93rem; line-height: 1.6; }

        .vb-modal-loading, .vb-modal-empty { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 44px 20px; }
        .vb-modal-loading p { margin: 6px 0 0; color: var(--cx-muted); }
        .vb-modal-empty i { font-size: 2.6rem; color: var(--cx-lila); margin-bottom: 14px; }
        .cx-site .vb-modal-empty h4 { font-size: 1.15rem; color: var(--cx-ink); margin: 0 0 6px; }
        .vb-modal-empty p { color: var(--cx-muted); font-size: .9rem; margin: 0; }

        @keyframes vb-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes vb-modal-in { from { opacity: 0; transform: translateY(22px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }

        /* ===== Responsive ===== */
        @media (max-width: 640px) {
          .vb-results-head { flex-direction: column; align-items: stretch; }
          .vb-actions { width: 100%; }
          .vb-actions .cx-btn { flex: 1; }
        }

        @media (max-width: 720px) {
          .vb-list { grid-template-columns: 1fr; }
        }

        @media print {
          .no-print { display: none !important; }
          .vb-card { break-inside: avoid; page-break-inside: avoid; }
        }
      `}</style>
    </main>
  );
};

export default VerificarBeneficios;
