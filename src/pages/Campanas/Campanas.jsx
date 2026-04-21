import React, { useEffect, useState } from 'react';
import { initializePageScripts } from '../../utils/initScripts';
import { getCampanasActivas } from '../../services/campanasService';

const formatearContenido = (texto) => {
  if (!texto) return '';
  if (/<[a-z][\s\S]*>/i.test(texto)) return texto;
  return texto.split('\n').map(l => l.trim()).join('<br/>');
};

const formatFecha = (fecha) =>
  new Date(fecha + 'T00:00:00').toLocaleDateString('es-PE', {
    day: '2-digit', month: 'long', year: 'numeric'
  });

export const Campanas = () => {
  useEffect(() => { initializePageScripts(); }, []);

  const [campanas, setCampanas]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [openId, setOpenId]         = useState(null);
  const [anioFiltro, setAnioFiltro] = useState(new Date().getFullYear());

  useEffect(() => {
    getCampanasActivas()
      .then(data => {
        const ordenadas = [...data].sort(
          (a, b) => new Date(b.fecha_inicio) - new Date(a.fecha_inicio)
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
    campanas.map(c => new Date(c.fecha_inicio).getFullYear())
  )].sort((a, b) => b - a);

  const campanasFiltradas = campanas.filter(
    c => new Date(c.fecha_inicio).getFullYear() === anioFiltro
  );

  return (
    <>
      <style>{`
        .page-header-custom {
          position: relative;
         
            background: linear-gradient(135deg, rgba(45,70,94,0.5), rgba(13,131,253,0.9)),
            url('/assets/img/campanas.jpg') center/cover no-repeat;


          padding: 150px 20px 80px; color: #fff; overflow: hidden;
        }
        .page-header-custom::before {
          content: ''; position: absolute; inset: 0;
          background: rgba(0,0,0,0.2); z-index: 1;
        }
        .page-header-custom .container { position: relative; z-index: 2; max-width: 1100px; }
        .page-header-custom h1 {
          font-size: 2.5rem; font-weight: 700;
          margin-bottom: 10px; color: #fff; line-height: 1.2;
        }
        .page-header-custom .subtitle { font-size: 1rem; color: #fff; opacity: 0.95; }

        .campanas-section { padding: 40px 0; background: #fff; }
        .content-wrapper  { max-width: 1100px; margin: 0 auto; }

        .intro-text {
          font-size: 0.95rem; line-height: 1.6; color: #333;
          margin-bottom: 25px; padding-bottom: 15px;
          border-bottom: 1px solid #e0e0e0;
        }

        .anio-tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 28px; }
        .anio-tab {
          padding: 6px 18px; border-radius: 20px; font-size: 0.88rem;
          font-weight: 600; cursor: pointer; border: 2px solid #000;
          background: none; color: #000; transition: all 0.2s ease;
        }
        .anio-tab:hover, .anio-tab.active { background: #000; color: #fff; }

        .accordion-item  { margin-bottom: 14px; }
        .accordion-header {
          display: flex; justify-content: space-between; align-items: flex-start;
          width: 100%; background: none; border: none;
          padding: 0; cursor: pointer; text-align: left; gap: 12px;
        }
        .accordion-header-left { flex: 1; min-width: 0; }
        .accordion-header h3 {
          color: #000; font-size: 1.15rem; font-weight: 700;
          margin: 0 0 4px 0; line-height: 1.3;
        }
        .accordion-header h3::before { content: attr(data-numero) ". "; }

        .campana-vigencia { font-size: 0.82rem; color: #666; margin: 0; }
        .campana-vigencia span { font-weight: 600; color: #333; }

        .accordion-icon {
          flex-shrink: 0; width: 22px; height: 22px;
          border: 2px solid #000; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin-top: 2px; font-size: 0.95rem; font-weight: 700; color: #000;
          transition: transform 0.25s ease;
        }
        .accordion-icon.open { transform: rotate(45deg); }

        .accordion-body {
          overflow: hidden; max-height: 0;
          transition: max-height 0.35s ease, padding 0.25s ease;
        }
        .accordion-body.open { max-height: 2000px; padding: 12px 0 8px; }

        .seccion-item    { margin-bottom: 18px; }
        .seccion-item h4 { color: #000; font-size: 1rem; font-weight: 700; margin-bottom: 6px; }
        .seccion-contenido { color: #333; font-size: 0.95rem; line-height: 1.7; }
        .seccion-contenido p { margin: 0 0 6px 0; }

        .separator { border: none; border-top: 1px solid #e0e0e0; margin: 6px 0 14px; }
        .empty-state { text-align: center; padding: 50px 20px; color: #666; font-size: 0.95rem; }

        @media (max-width: 768px) {
          .page-header-custom { padding: 120px 20px 60px; }
          .page-header-custom h1 { font-size: 1.8rem; }
          .accordion-header h3  { font-size: 1.1rem; }
        }
      `}</style>

      <main className="main">
        <div className="page-header-custom">
          <div className="container text-center">
            <h1 data-aos="fade-down">Campañas</h1>
            <p className="subtitle" data-aos="fade-up" data-aos-delay="100">
              Crecemos – Centro Integral de Terapias
            </p>
          </div>
        </div>

        <section className="campanas-section">
          <div className="container">
            <div className="content-wrapper">

              <div className="intro-text" data-aos="fade-up">
                <p>Aquí encontrarás nuestras campañas vigentes. Haz clic en cada una para ver el detalle.</p>
              </div>

              {loading && <p className="empty-state">Cargando campañas...</p>}
              {error   && <p className="empty-state">{error}</p>}

              {!loading && !error && (
                <>
                  {aniosDisponibles.length > 1 && (
                    <div className="anio-tabs" data-aos="fade-up">
                      {aniosDisponibles.map(anio => (
                        <button
                          key={anio}
                          className={`anio-tab ${anio === anioFiltro ? 'active' : ''}`}
                          onClick={() => { setAnioFiltro(anio); setOpenId(null); }}
                        >
                          {anio}
                        </button>
                      ))}
                    </div>
                  )}

                  {campanasFiltradas.length === 0 && (
                    <p className="empty-state">No hay campañas para el año {anioFiltro}.</p>
                  )}

                  {campanasFiltradas.map((campana, index) => (
                    <div key={campana.id} className="accordion-item" data-aos="fade-up" data-aos-delay={100 + index * 20}>
                      {index > 0 && <hr className="separator" />}

                      <button
                        className="accordion-header"
                        onClick={() => toggle(campana.id)}
                        aria-expanded={openId === campana.id}
                      >
                        <div className="accordion-header-left">
                          <h3 data-numero={index + 1}>{campana.titulo}</h3>
                          <p className="campana-vigencia">
                            Vigencia:&nbsp;
                            <span>{formatFecha(campana.fecha_inicio)}</span>
                            {' — '}
                            <span>{formatFecha(campana.fecha_fin)}</span>
                          </p>
                        </div>
                        <span className={`accordion-icon ${openId === campana.id ? 'open' : ''}`}>+</span>
                      </button>

                      <div className={`accordion-body ${openId === campana.id ? 'open' : ''}`}>
                        {campana.descripcion_corta && (
                          <p style={{ color: '#555', fontSize: '0.95rem', marginBottom: '14px', lineHeight: 1.6 }}>
                            {campana.descripcion_corta}
                          </p>
                        )}
                        {campana.secciones?.length > 0 &&
                          [...campana.secciones]
                            .sort((a, b) => a.orden - b.orden)
                            .map(sec => (
                              <div key={sec.id} className="seccion-item">
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
                  ))}
                </>
              )}

            </div>
          </div>
        </section>
      </main>
    </>
  );
};