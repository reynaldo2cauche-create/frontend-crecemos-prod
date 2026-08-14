import React from 'react';
import { Link } from 'react-router-dom';
import Reveal from '../components/public/Reveal';
import RevealText from '../components/public/RevealText';
import Decor from '../components/public/Decor';

const LibroReclamaciones: React.FC = () => {
  return (
    <main className="cx-page lr-page">
      {/* ===== Hero ===== */}
      <section className="cx-subhero lr-hero">
        <Decor variant="a" />
        <div className="cx-container">
          <Reveal className="cx-subhero-inner">
            <span className="cx-eyebrow"><i className="bi bi-journal-text" /> Atención al consumidor</span>
            <RevealText as="h1" text="Libro de Reclamaciones" />
            <p>Crecemos – Centro Integral de Terapias. Tu reclamo o queja será atendido en un plazo máximo de 15 días hábiles.</p>
          </Reveal>
        </div>
      </section>

      {/* ===== Contenido ===== */}
      <section className="cx-section lr-body">
        <Decor variant="b" />
        <div className="cx-container lr-wrap">

          {/* Nota legal */}
          <Reveal className="lr-note" y={16}>
            <i className="bi bi-info-circle-fill" />
            <p>
              De acuerdo con el <strong>Código de Protección y Defensa del Consumidor (Ley N° 29571)</strong>,
              todos los establecimientos deben contar con un Libro de Reclamaciones. Tu reclamo o queja será
              atendido en un plazo no mayor a <strong>quince (15) días hábiles</strong>, improrrogable.
            </p>
          </Reveal>

          {/* Acciones principales */}
          <div className="lr-actions">
            <Reveal className="lr-action" y={20}>
              <span className="lr-action-ic lr-action-ic--a"><i className="bi bi-pencil-square" /></span>
              <h3>Registrar un reclamo o queja</h3>
              <p>Completa el formulario oficial con tus datos y el detalle de tu disconformidad. Recibirás un código de seguimiento al finalizar.</p>
              <Link to="/libro-reclamaciones/registrar" className="cx-btn cx-btn-primary">
                Registrar reclamo <i className="bi bi-arrow-right" />
              </Link>
            </Reveal>

            <Reveal className="lr-action" y={20} delay={0.08}>
              <span className="lr-action-ic lr-action-ic--b"><i className="bi bi-search" /></span>
              <h3>Consultar el estado</h3>
              <p>Ingresa tu código de reclamo y número de documento para ver el estado y la respuesta del proveedor.</p>
              <Link to="/libro-reclamaciones/consultar" className="cx-btn cx-btn-ghost">
                Consultar estado <i className="bi bi-arrow-right" />
              </Link>
            </Reveal>
          </div>

          {/* Info */}
          <div className="lr-cards">
            <Reveal className="lr-card" y={18}>
              <div className="lr-card-head">
                <span className="lr-card-ic"><i className="bi bi-building" /></span>
                <h3>Datos del proveedor</h3>
              </div>
              <ul className="lr-list">
                <li><strong>Razón Social:</strong> CONTIGO CRECEMOS E.I.R.L.</li>
                <li><strong>RUC:</strong> 20601074380</li>
                <li><strong>Domicilio:</strong> Calle 48 Nro. 234, Urb. El Pinar, Comas 15316, Lima, Perú</li>
              </ul>
            </Reveal>

            <Reveal className="lr-card" y={18} delay={0.06}>
              <div className="lr-card-head">
                <span className="lr-card-ic"><i className="bi bi-question-circle" /></span>
                <h3>¿Reclamo o queja?</h3>
              </div>
              <ul className="lr-list">
                <li><strong>Reclamo:</strong> Disconformidad relacionada con los productos o servicios prestados por el proveedor.</li>
                <li><strong>Queja:</strong> Malestar respecto a la atención al público, no relacionada directamente con los servicios.</li>
              </ul>
              <p className="lr-fine">
                La formulación del reclamo no impide acudir a otras vías de solución de controversias
                ni es requisito previo para denunciar ante el INDECOPI.
              </p>
            </Reveal>

            <Reveal className="lr-card" y={18} delay={0.12}>
              <div className="lr-card-head">
                <span className="lr-card-ic"><i className="bi bi-bank" /></span>
                <h3>Marco legal</h3>
              </div>
              <ul className="lr-list">
                <li>Ley N° 29571 – Código de Protección y Defensa del Consumidor.</li>
                <li>Ley N° 29733 – Protección de Datos Personales (D.S. N° 003-2013-JUS).</li>
                <li>D.S. N° 011-2011-PCM – Reglamento del Libro de Reclamaciones.</li>
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      <style>{`
        /* ===== Fondo continuo tintado + grano ===== */
        .cx-site .cx-page.lr-page {
          position: relative;
          background:
            radial-gradient(96% 54% at 50% -8%, rgba(194, 99, 249, .13) 0%, transparent 58%),
            radial-gradient(80% 46% at 50% 108%, rgba(61, 123, 214, .10) 0%, transparent 60%),
            var(--cx-bg);
        }
        .cx-page.lr-page::after {
          content: ''; position: fixed; inset: 0; z-index: 50; pointer-events: none;
          opacity: .05; mix-blend-mode: soft-light;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }
        .cx-page.lr-page .lr-body { background: transparent; }

        /* ===== Hero ===== */
        .lr-hero { padding-bottom: clamp(18px, 3vw, 30px); }
        .cx-site .lr-hero .cx-subhero-inner { text-align: center; }
        .cx-site .lr-hero .cx-subhero-inner > p {
          color: var(--cx-ink-2); text-align: center; max-width: 640px; margin-left: auto; margin-right: auto;
        }

        /* ===== Cuerpo ===== */
        .cx-page .lr-body { position: relative; z-index: 1; padding-top: clamp(24px, 3vw, 40px); padding-bottom: clamp(48px, 7vw, 88px); }
        .lr-wrap { max-width: 1000px; }

        /* Nota legal */
        .lr-note {
          display: flex; gap: 14px; align-items: flex-start;
          padding: 18px 22px; border-radius: var(--cx-r-md);
          background: var(--cx-primary-050); border: 1px solid var(--cx-primary-100);
          margin-bottom: clamp(26px, 3.5vw, 40px);
        }
        .lr-note i { color: var(--cx-primary-700); font-size: 1.4rem; flex: 0 0 auto; line-height: 1.4; }
        .lr-note p { margin: 0; color: var(--cx-ink-2); font-size: .95rem; line-height: 1.65; }
        .lr-note strong { color: var(--cx-ink); font-weight: 700; }

        /* Acciones principales */
        .lr-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: clamp(28px, 3.5vw, 44px); }
        .lr-action {
          display: flex; flex-direction: column; align-items: flex-start;
          padding: 30px 28px; border-radius: var(--cx-r-lg);
          background: rgba(255, 255, 255, .5);
          backdrop-filter: saturate(160%) blur(14px); -webkit-backdrop-filter: saturate(160%) blur(14px);
          border: 1px solid rgba(255, 255, 255, .6);
          box-shadow: 0 1px 2px rgba(50, 20, 80, .05), 0 12px 28px -18px rgba(50, 20, 80, .2), inset 0 1px 0 rgba(255, 255, 255, .5);
          transition: transform .3s cubic-bezier(.2,.8,.2,1), box-shadow .3s, border-color .3s;
        }
        .lr-action:hover { transform: translateY(-5px); border-color: rgba(255, 255, 255, .9); box-shadow: 0 2px 4px rgba(50, 20, 80, .06), 0 26px 50px -24px rgba(50, 20, 80, .4), inset 0 1px 0 rgba(255, 255, 255, .6); }
        .lr-action-ic { display: grid; place-items: center; width: 56px; height: 56px; border-radius: 16px; margin-bottom: 16px; color: #fff; font-size: 1.55rem; box-shadow: 0 12px 24px -10px rgba(50, 20, 80, .5); }
        .lr-action-ic--a { background: linear-gradient(135deg, var(--cx-primary), var(--cx-primary-600)); }
        .lr-action-ic--b { background: linear-gradient(135deg, #3d7bd6, #174ea6); }
        .cx-site .lr-action h3 { font-family: var(--cx-font); font-size: 1.16rem; font-weight: 700; color: var(--cx-ink); margin: 0 0 8px; }
        .lr-action p { color: var(--cx-muted); font-size: .92rem; line-height: 1.6; margin: 0 0 20px; }
        .lr-action .cx-btn { margin-top: auto; }

        /* Info cards */
        .lr-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 18px; align-items: start; }
        .lr-card {
          padding: 24px; border-radius: var(--cx-r-lg);
          background: rgba(255, 255, 255, .5);
          backdrop-filter: saturate(160%) blur(12px); -webkit-backdrop-filter: saturate(160%) blur(12px);
          border: 1px solid rgba(255, 255, 255, .6);
          box-shadow: 0 1px 2px rgba(50, 20, 80, .05), 0 12px 28px -18px rgba(50, 20, 80, .2), inset 0 1px 0 rgba(255, 255, 255, .5);
          transition: transform .3s cubic-bezier(.2,.8,.2,1), box-shadow .3s, border-color .3s;
        }
        .lr-card:hover { transform: translateY(-4px); border-color: rgba(255, 255, 255, .9); box-shadow: 0 2px 4px rgba(50, 20, 80, .06), 0 22px 44px -22px rgba(50, 20, 80, .38), inset 0 1px 0 rgba(255, 255, 255, .6); }
        .lr-card-head { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
        .lr-card-ic { flex: 0 0 auto; width: 44px; height: 44px; border-radius: 12px; display: grid; place-items: center; color: #fff; font-size: 1.2rem; box-shadow: 0 10px 20px -10px rgba(50, 20, 80, .5); }
        .lr-cards .lr-card:nth-child(1) .lr-card-ic { background: linear-gradient(135deg, #3d7bd6, #174ea6); }
        .lr-cards .lr-card:nth-child(2) .lr-card-ic { background: linear-gradient(135deg, #c263f9, #a93ef0); }
        .lr-cards .lr-card:nth-child(3) .lr-card-ic { background: linear-gradient(135deg, #4fc08a, #2fa37a); }
        .cx-site .lr-card-head h3 { font-family: var(--cx-font); font-size: 1.05rem; font-weight: 700; color: var(--cx-ink); margin: 0; }
        .lr-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 9px; }
        .lr-list li { position: relative; padding-left: 18px; color: var(--cx-ink-2); font-size: .92rem; line-height: 1.55; }
        .lr-list li::before { content: ''; position: absolute; left: 0; top: 8px; width: 7px; height: 7px; border-radius: 50%; background: linear-gradient(135deg, var(--cx-primary), var(--cx-peach)); }
        .lr-list strong { color: var(--cx-ink); font-weight: 700; }
        .lr-fine { margin: 14px 0 0; padding-left: 14px; border-left: 2px solid var(--cx-primary-200); font-style: italic; color: var(--cx-muted); font-size: .85rem; line-height: 1.5; }

        @media (max-width: 720px) { .lr-actions { grid-template-columns: 1fr; } }
      `}</style>
    </main>
  );
};

export default LibroReclamaciones;
