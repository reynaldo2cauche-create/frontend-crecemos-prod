import React from 'react';
import FormularioTrabaja from '../components/FormularioTrabaja/FormularioTrabaja';
import Reveal from '../components/public/Reveal';
import RevealText from '../components/public/RevealText';
import Decor from '../components/public/Decor';

const TrabajaNosotros = () => {
  const beneficios = [
    { icon: 'bi-graph-up-arrow', title: 'Desarrollo Profesional', desc: 'Oportunidades de crecimiento y capacitación continua en tu área de especialización.' },
    { icon: 'bi-people-fill', title: 'Ambiente Colaborativo', desc: 'Trabajo en equipo con profesionales comprometidos y apoyo mutuo.' },
    { icon: 'bi-heart-pulse-fill', title: 'Impacto Social', desc: 'Contribuye al bienestar emocional de nuestra comunidad.' },
  ];

  return (
    <main className="cx-page tn-page">
      {/* ===== Hero ===== */}
      <section className="cx-subhero tn-hero">
        <Decor variant="a" />
        <div className="cx-container">
          <Reveal className="cx-subhero-inner">
            <span className="cx-eyebrow"><i className="bi bi-briefcase-fill" /> Trabaja con nosotros</span>
            <RevealText as="h1" text="Únete a nuestro equipo" />
            <p>Forma parte de un equipo comprometido con el bienestar emocional y psicológico de nuestros pacientes.</p>
            <div className="cx-contact-chips">
              <span><i className="bi bi-briefcase" /> Psicólogos</span>
              <span><i className="bi bi-heart-pulse" /> Terapeutas</span>
              <span><i className="bi bi-person-check" /> Especialistas</span>
              <span><i className="bi bi-building" /> Administrativos</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== Beneficios ===== */}
      <section className="cx-section tn-benefits">
        <Decor variant="b" />
        <div className="cx-container">
          <Reveal className="tn-benefits-head">
            <span className="cx-eyebrow"><i className="bi bi-stars" /> Por qué Crecemos</span>
            <RevealText as="h2" text="¿Por qué trabajar con nosotros?" />
            <p>Ofrecemos un ambiente de crecimiento profesional y personal.</p>
          </Reveal>

          <div className="tn-benefits-grid">
            {beneficios.map((b, i) => (
              <Reveal className="tn-benefit" key={b.title} y={20} delay={(i % 3) * 0.06}>
                <span className="tn-benefit-ic"><i className={`bi ${b.icon}`} /></span>
                <h3>{b.title}</h3>
                <p>{b.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Formulario ===== */}
      <FormularioTrabaja />

      <style>{`
        /* ===== Fondo continuo tintado + grano ===== */
        .cx-site .cx-page.tn-page {
          position: relative;
          background:
            radial-gradient(96% 54% at 50% -8%, rgba(194, 99, 249, .13) 0%, transparent 58%),
            radial-gradient(80% 46% at 50% 108%, rgba(61, 123, 214, .10) 0%, transparent 60%),
            var(--cx-bg);
        }
        .cx-page.tn-page::after {
          content: ''; position: fixed; inset: 0; z-index: 50; pointer-events: none;
          opacity: .05; mix-blend-mode: soft-light;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }
        .cx-page.tn-page .tn-benefits,
        .cx-page.tn-page .formulario-trabaja-section { background: transparent; }

        /* ===== Hero ===== */
        .tn-hero { padding-bottom: clamp(20px, 3vw, 34px); }
        .cx-site .tn-hero .cx-subhero-inner { text-align: center; }
        .cx-site .tn-hero .cx-subhero-inner > p {
          color: var(--cx-ink-2); text-align: center; max-width: 620px; margin-left: auto; margin-right: auto;
        }

        /* ===== Beneficios ===== */
        .cx-page .tn-benefits { padding-top: clamp(30px, 4vw, 52px); padding-bottom: clamp(30px, 4vw, 52px); }
        .tn-benefits-head { text-align: center; max-width: 640px; margin: 0 auto clamp(30px, 4vw, 48px); }
        .cx-site .tn-benefits-head h2 { font-size: clamp(1.6rem, 3vw, 2.3rem); margin: 12px 0 10px; }
        .cx-site .tn-benefits-head .cx-eyebrow { justify-content: center; }
        .tn-benefits-head p { color: var(--cx-muted); }
        .tn-benefits-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .tn-benefit {
          text-align: center; padding: 32px 26px;
          background: rgba(255, 255, 255, .5);
          backdrop-filter: saturate(160%) blur(12px); -webkit-backdrop-filter: saturate(160%) blur(12px);
          border: 1px solid rgba(255, 255, 255, .6); border-radius: var(--cx-r-lg);
          box-shadow: 0 1px 2px rgba(50, 20, 80, .05), 0 12px 28px -18px rgba(50, 20, 80, .2), inset 0 1px 0 rgba(255, 255, 255, .5);
          transition: transform .3s cubic-bezier(.2,.8,.2,1), box-shadow .3s, border-color .3s;
        }
        .tn-benefit:hover { transform: translateY(-6px); border-color: rgba(255, 255, 255, .9); box-shadow: 0 2px 4px rgba(50, 20, 80, .06), 0 26px 50px -24px rgba(50, 20, 80, .4), inset 0 1px 0 rgba(255, 255, 255, .6); }
        .tn-benefit-ic {
          display: inline-grid; place-items: center; width: 62px; height: 62px; border-radius: 18px;
          margin-bottom: 18px; color: #fff; font-size: 1.7rem; box-shadow: 0 12px 24px -10px rgba(50, 20, 80, .5);
          transition: transform .3s cubic-bezier(.2,.8,.2,1);
        }
        .tn-benefit:hover .tn-benefit-ic { transform: scale(1.08) rotate(-5deg); }
        .tn-benefit:nth-child(1) .tn-benefit-ic { background: linear-gradient(135deg, #3d7bd6, #174ea6); }
        .tn-benefit:nth-child(2) .tn-benefit-ic { background: linear-gradient(135deg, #c263f9, #a93ef0); }
        .tn-benefit:nth-child(3) .tn-benefit-ic { background: linear-gradient(135deg, #4fc08a, #2fa37a); }
        .cx-site .tn-benefit h3 { font-family: var(--cx-font); font-size: 1.12rem; font-weight: 700; color: var(--cx-ink); margin: 0 0 8px; }
        .tn-benefit p { color: var(--cx-muted); font-size: .92rem; line-height: 1.6; margin: 0; }
        @media (max-width: 800px) { .tn-benefits-grid { grid-template-columns: 1fr; } }

        /* ============================================================
           Renovación del formulario (estética de Contacto) — scopeado
           ============================================================ */
        .cx-site .tn-page .formulario-card {
          position: relative; overflow: hidden;
          max-width: 760px; margin-left: auto; margin-right: auto;
          background:
            radial-gradient(120% 62% at 50% -8%, rgba(194, 99, 249, .18), transparent 62%),
            radial-gradient(120% 80% at 0% 100%, rgba(61, 123, 214, .13), transparent 60%),
            linear-gradient(180deg, rgba(255, 255, 255, .4), rgba(247, 243, 251, .5));
          backdrop-filter: saturate(180%) blur(22px); -webkit-backdrop-filter: saturate(180%) blur(22px);
          border: 1px solid rgba(255, 255, 255, .6); border-radius: var(--cx-r-xl);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, .7), 0 40px 84px -36px rgba(90, 70, 110, .3);
        }
        .cx-site .tn-page .formulario-card-body { padding: clamp(24px, 3vw, 42px); position: relative; z-index: 1; }
        .cx-site .tn-page .form-title { font-family: var(--cx-font); font-weight: 700; color: var(--cx-ink); font-size: clamp(1.4rem, 2.4vw, 1.7rem); }
        .cx-site .tn-page .form-subtitle { color: var(--cx-muted); }

        .cx-site .tn-page .form-label-trabaja {
          display: block; font-family: var(--cx-font); font-size: .84rem; font-weight: 600; color: var(--cx-ink); margin-bottom: 7px;
        }
        .cx-site .tn-page .form-control-trabaja,
        .cx-site .tn-page .form-select-trabaja {
          width: 100%; background: rgba(255, 255, 255, .7); border: 1.5px solid rgba(236, 227, 216, .9);
          border-radius: var(--cx-r-sm); padding: 12px 15px; font-size: .95rem; font-family: var(--cx-font); color: var(--cx-ink);
          transition: border-color .2s, box-shadow .2s, background-color .2s;
        }
        .cx-site .tn-page .form-control-trabaja::placeholder { color: var(--cx-muted); }
        .cx-site .tn-page .form-control-trabaja:focus,
        .cx-site .tn-page .form-select-trabaja:focus {
          border-color: var(--cx-primary); background-color: #fff; box-shadow: var(--cx-ring); outline: 0;
        }
        .cx-site .tn-page .form-select-trabaja {
          appearance: none; -webkit-appearance: none; cursor: pointer;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%238d288f'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 14px center; background-size: 14px; padding-right: 40px;
        }
        .cx-site .tn-page .form-control-trabaja[type="file"] { padding: 10px 15px; cursor: pointer; }
        .cx-site .tn-page .form-text-trabaja { color: var(--cx-muted); font-size: .82rem; margin-top: 6px; }
        .cx-site .tn-page .file-selected-trabaja { color: #2f6a48; font-size: .88rem; font-weight: 600; }

        .cx-site .tn-page .btn-submit-trabaja {
          width: 100%; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          border: 0; border-radius: var(--cx-r-pill); padding: 14px 26px; margin-top: 6px;
          background: linear-gradient(120deg, var(--cx-primary), var(--cx-primary-600)); color: #fff;
          font-family: var(--cx-font); font-weight: 700; font-size: 1rem; cursor: pointer;
          box-shadow: 0 14px 28px -12px rgba(169, 62, 240, .6); transition: transform .25s, box-shadow .25s;
        }
        .cx-site .tn-page .btn-submit-trabaja:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 20px 38px -12px rgba(169, 62, 240, .72); }
        .cx-site .tn-page .btn-submit-trabaja:disabled { opacity: .7; cursor: not-allowed; }
      `}</style>
    </main>
  );
};

export default TrabajaNosotros;
