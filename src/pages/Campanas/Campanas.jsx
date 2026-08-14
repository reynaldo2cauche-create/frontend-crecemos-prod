import React, { useEffect, useState } from 'react';
import { getCampanasActivas } from '../../services/campanasService';
import Reveal from '../../components/public/Reveal';
import RevealText from '../../components/public/RevealText';
import Decor from '../../components/public/Decor';

const formatearContenido = (texto) => {
  if (!texto) return '';
  if (/<[a-z][\s\S]*>/i.test(texto)) return texto;
  return texto.split('\n').map(l => l.trim()).join('<br/>');
};

// Acepta 'YYYY-MM-DD' o datetime 'YYYY-MM-DD HH:mm:ss' (o con 'T'); Date en hora local.
const parseFecha = (f) => new Date(String(f).replace(' ', 'T'));

const formatFecha = (fecha) => {
  const d = parseFecha(fecha);
  return isNaN(d) ? '' : d.toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
};

// Hora 'HH:mm' a partir del datetime (vacía si es medianoche o inválido)
const formatHora = (fecha) => {
  const d = parseFecha(fecha);
  if (isNaN(d)) return '';
  if (d.getHours() === 0 && d.getMinutes() === 0) return '';
  return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
};

export const Campanas = () => {
  const [campanas, setCampanas]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [openId, setOpenId]         = useState(null);
  const [anioFiltro, setAnioFiltro] = useState(new Date().getFullYear());

  useEffect(() => {
    getCampanasActivas()
      .then(data => {
        const ordenadas = [...data].sort(
          (a, b) => parseFecha(b.fecha_inicio) - parseFecha(a.fecha_inicio)
        );
        setCampanas(ordenadas);
        setLoading(false);
      })
      .catch(() => {
        setError('No se pudieron cargar las campañas.');
        setLoading(false);
      });
  }, []);

  const toggle = (id) => setOpenId(prev => prev === id ? null : id);

  const aniosDisponibles = [...new Set(
    campanas.map(c => parseFecha(c.fecha_inicio).getFullYear())
  )].sort((a, b) => b - a);

  const campanasFiltradas = campanas.filter(
    c => parseFecha(c.fecha_inicio).getFullYear() === anioFiltro
  );

  const rangoVigencia = (c) => {
    const i = `${formatFecha(c.fecha_inicio)}${formatHora(c.fecha_inicio) ? ` ${formatHora(c.fecha_inicio)}` : ''}`;
    const f = `${formatFecha(c.fecha_fin)}${formatHora(c.fecha_fin) ? ` ${formatHora(c.fecha_fin)}` : ''}`;
    return `${i} — ${f}`;
  };

  return (
    <main className="cx-page cmp-page">
      {/* ===== Hero ===== */}
      <section className="cx-subhero cmp-hero">
        <Decor variant="a" />
        <div className="cx-container">
          <Reveal className="cx-subhero-inner">
            <span className="cx-eyebrow"><i className="bi bi-megaphone-fill" /> Novedades</span>
            <RevealText as="h1" text="Campañas" />
            <p>Descubre nuestras campañas vigentes. Haz clic en cada una para ver el detalle.</p>
          </Reveal>
        </div>
      </section>

      {/* ===== Contenido ===== */}
      <section className="cx-section cmp-body">
        <Decor variant="b" />
        <div className="cx-container cmp-wrap">

          {loading && <p className="cmp-empty"><span className="cx-btn-spinner cmp-spin" /> Cargando campañas…</p>}
          {error && <p className="cmp-empty"><i className="bi bi-exclamation-circle" /> {error}</p>}

          {!loading && !error && (
            <>
              {aniosDisponibles.length > 1 && (
                <Reveal className="cmp-filter" y={16}>
                  <span className="cmp-filter-label"><i className="bi bi-funnel-fill" /> Filtrar por año</span>
                  <div className="cmp-tabs">
                    {aniosDisponibles.map(anio => (
                      <button
                        key={anio}
                        className={`cmp-tab ${anio === anioFiltro ? 'is-active' : ''}`}
                        onClick={() => { setAnioFiltro(anio); setOpenId(null); }}
                      >
                        {anio}
                      </button>
                    ))}
                  </div>
                </Reveal>
              )}

              {campanasFiltradas.length === 0 && (
                <p className="cmp-empty"><i className="bi bi-inbox" /> No hay campañas para el año {anioFiltro}.</p>
              )}

              <div className="cmp-list">
                {campanasFiltradas.map((campana, index) => {
                  const open = openId === campana.id;
                  return (
                    <Reveal as="div" className={`cmp-item ${open ? 'is-open' : ''}`} key={campana.id} y={16} delay={(index % 5) * 0.04}>
                      <button className="cmp-head" onClick={() => toggle(campana.id)} aria-expanded={open}>
                        <span className="cmp-num">{index + 1}</span>
                        <div className="cmp-head-txt">
                          <h3>{campana.titulo}</h3>
                          <p className="cmp-vig">
                            <i className="bi bi-calendar-event" /> {rangoVigencia(campana)}
                          </p>
                        </div>
                        <i className="bi bi-chevron-down cmp-chevron" />
                      </button>

                      <div className="cmp-panel">
                        <div className="cmp-panel-in">
                          {campana.descripcion_corta && (
                            <p className="cmp-desc">{campana.descripcion_corta}</p>
                          )}
                          {campana.secciones?.length > 0 &&
                            [...campana.secciones]
                              .sort((a, b) => a.orden - b.orden)
                              .map(sec => (
                                <div key={sec.id} className="cmp-sec">
                                  {sec.titulo && <h4>{sec.titulo}</h4>}
                                  <div
                                    className="seccion-contenido"
                                    dangerouslySetInnerHTML={{ __html: formatearContenido(sec.contenido) }}
                                  />
                                </div>
                              ))
                          }
                        </div>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      <style>{`
        /* ===== Fondo continuo tintado + grano ===== */
        .cx-site .cx-page.cmp-page {
          position: relative;
          background:
            radial-gradient(96% 54% at 50% -8%, rgba(194, 99, 249, .13) 0%, transparent 58%),
            radial-gradient(80% 46% at 50% 108%, rgba(61, 123, 214, .10) 0%, transparent 60%),
            var(--cx-bg);
        }
        .cx-page.cmp-page::after {
          content: ''; position: fixed; inset: 0; z-index: 50; pointer-events: none;
          opacity: .05; mix-blend-mode: soft-light;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }
        .cx-page.cmp-page .cmp-body { background: transparent; }

        /* ===== Hero ===== */
        .cmp-hero { padding-bottom: clamp(18px, 3vw, 30px); }
        .cx-site .cmp-hero .cx-subhero-inner { text-align: center; }
        .cx-site .cmp-hero .cx-subhero-inner > p {
          color: var(--cx-ink-2); text-align: center; max-width: 600px; margin-left: auto; margin-right: auto;
        }

        /* ===== Cuerpo ===== */
        .cx-page .cmp-body { position: relative; z-index: 1; padding-top: clamp(24px, 3vw, 40px); padding-bottom: clamp(48px, 7vw, 88px); }
        .cmp-wrap { max-width: 920px; }

        /* Filtro por año */
        .cmp-filter {
          display: flex; align-items: center; gap: 14px; flex-wrap: wrap; margin-bottom: 26px;
          padding: 12px 16px; border-radius: var(--cx-r-md);
          background: rgba(255, 255, 255, .5);
          -webkit-backdrop-filter: saturate(160%) blur(12px); backdrop-filter: saturate(160%) blur(12px);
          border: 1px solid rgba(255, 255, 255, .6);
          box-shadow: 0 1px 2px rgba(50, 20, 80, .05), 0 12px 28px -20px rgba(50, 20, 80, .18), inset 0 1px 0 rgba(255, 255, 255, .5);
        }
        .cmp-filter-label { display: inline-flex; align-items: center; gap: 7px; font-size: .85rem; font-weight: 700; color: var(--cx-ink-2); }
        .cmp-filter-label i { color: var(--cx-primary-700); }
        .cmp-tabs { display: flex; gap: 8px; flex-wrap: wrap; }
        .cmp-tab {
          padding: 9px 18px; border-radius: var(--cx-r-pill); font-size: .88rem; font-weight: 700; cursor: pointer;
          border: 1.5px solid var(--cx-line); background: #fff; color: var(--cx-ink-2);
          transition: transform .2s, border-color .2s, color .2s, background .2s, box-shadow .2s;
        }
        .cmp-tab:hover { border-color: var(--cx-primary-200); color: var(--cx-primary-700); transform: translateY(-1px); }
        .cmp-tab.is-active { background: linear-gradient(120deg, var(--cx-primary), var(--cx-primary-600)); color: #fff; border-color: transparent; box-shadow: 0 10px 20px -10px rgba(169, 62, 240, .55); }

        /* Lista acordeón */
        .cmp-list { display: flex; flex-direction: column; gap: 14px; }
        .cmp-item {
          background: rgba(255, 255, 255, .5);
          -webkit-backdrop-filter: saturate(160%) blur(12px); backdrop-filter: saturate(160%) blur(12px);
          border: 1px solid rgba(255, 255, 255, .6); border-radius: var(--cx-r-md); overflow: hidden;
          box-shadow: 0 1px 2px rgba(50, 20, 80, .05), 0 12px 28px -18px rgba(50, 20, 80, .2), inset 0 1px 0 rgba(255, 255, 255, .5);
          transition: border-color .25s, box-shadow .25s;
        }
        .cmp-item:hover { border-color: rgba(255, 255, 255, .9); }
        .cmp-item.is-open { border-color: var(--cx-primary-200); box-shadow: 0 1px 2px rgba(50, 20, 80, .05), 0 22px 44px -22px rgba(50, 20, 80, .38), inset 3px 0 0 var(--cx-primary); }
        .cmp-item.is-open .cmp-head { background: linear-gradient(180deg, var(--cx-primary-050), transparent 92%); }
        .cmp-head { display: flex; align-items: center; gap: 14px; width: 100%; padding: 16px 20px; background: none; border: 0; cursor: pointer; text-align: left; font-family: inherit; }
        .cmp-num {
          flex: 0 0 auto; width: 34px; height: 34px; border-radius: 10px; display: grid; place-items: center;
          background: linear-gradient(135deg, var(--cx-primary), var(--cx-primary-600)); color: #fff; font-weight: 800; font-size: .92rem;
          box-shadow: 0 8px 16px -8px rgba(169, 62, 240, .5);
        }
        .cmp-head-txt { flex: 1; min-width: 0; }
        .cx-site .cmp-head-txt h3 { font-family: var(--cx-font); font-size: 1.06rem; font-weight: 700; color: var(--cx-ink); margin: 0 0 3px; line-height: 1.3; }
        .cmp-vig { display: flex; align-items: center; gap: 6px; font-size: .82rem; color: var(--cx-muted); margin: 0; }
        .cmp-vig i { color: var(--cx-primary-700); flex: 0 0 auto; }
        .cmp-chevron { flex: 0 0 auto; color: var(--cx-muted); font-size: 1rem; transition: transform .3s, color .3s; }
        .cmp-item.is-open .cmp-chevron { transform: rotate(180deg); color: var(--cx-primary-700); }

        .cmp-panel { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .35s cubic-bezier(.2,.8,.2,1); }
        .cmp-item.is-open .cmp-panel { grid-template-rows: 1fr; }
        .cmp-panel-in { overflow: hidden; }
        .cmp-desc { margin: 0; padding: 2px 20px 0; color: var(--cx-ink-2); font-size: .93rem; line-height: 1.65; }
        .cmp-sec { padding: 14px 20px 0; }
        .cmp-sec:last-child { padding-bottom: 18px; }
        .cx-site .cmp-sec h4 { font-family: var(--cx-font); font-size: 1rem; font-weight: 700; color: var(--cx-ink); margin: 0 0 6px; }
        .cmp-sec .seccion-contenido { color: var(--cx-ink-2); font-size: .93rem; line-height: 1.7; }
        .cmp-sec .seccion-contenido p { margin: 0 0 6px; }
        .cmp-sec .seccion-contenido a { color: var(--cx-primary-700); font-weight: 600; }

        /* Estados */
        .cmp-empty { text-align: center; padding: 50px 20px; color: var(--cx-muted); font-size: .95rem; }
        .cmp-empty i { color: var(--cx-primary-700); margin-right: 6px; }
        .cmp-spin { display: inline-block; vertical-align: -2px; margin-right: 8px; border-color: rgba(169,62,240,.35); border-top-color: var(--cx-primary-600); }
      `}</style>
    </main>
  );
};
