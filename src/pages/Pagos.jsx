import React, { useState } from 'react';

/* ─── LOGOS DE BANCOS ─── */
const BcpLogo = () => (
  <img src="assets/img/index/bcp.png" alt="BCP" style={{ width: 90, height: 40, objectFit: "contain" }} />
);

const InterbankLogo = () => (
  <img src="assets/img/index/interbank.png" alt="Interbank" style={{ width: 110, height: 'auto', objectFit: 'contain' }} onError={e => { e.target.style.display='none'; }} />
);

const BbvaLogo = () => (
  <img src="assets/img/index/bbva.png" alt="BBVA" style={{ width: 80, height: 'auto', objectFit: 'contain' }} onError={e => { e.target.style.display='none'; }} />
);

const YapeLogo = () => (
  <img src="assets/img/index/yape.png" alt="Yape" style={{ width: 90, height: 'auto', objectFit: 'contain' }} onError={e => { e.target.style.display='none'; }} />
);

const PlinLogo = () => (
  <img src="assets/img/index/plin.png" alt="Plin" style={{ width: 90, height: 'auto', objectFit: 'contain' }} onError={e => { e.target.style.display='none'; }} />
);

const LukitaLogo = () => (
  <img src="assets/img/index/lukita.png" alt="Lukita" style={{ width: 90, height: 'auto', objectFit: 'contain' }} onError={e => { e.target.style.display='none'; }} />
);

const IconBuilding = ({ color }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M8 10v11M12 10v11M16 10v11M20 10v11" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconCopy = ({ done }) => done ? (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <path d="M20 6L9 17l-5-5" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
) : (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="1.8"/>
  </svg>
);

const IconPhone = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="1.8"/>
    <circle cx="12" cy="17" r="1" fill="currentColor"/>
  </svg>
);

const IconAlert = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
    <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconUser = () => (
  <svg width="21" height="21" viewBox="0 0 24 24" fill="none">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="7" r="4" stroke="white" strokeWidth="2"/>
  </svg>
);

const Pagos = () => {
  const [copied, setCopied] = useState(null);
  const [showToast, setShowToast] = useState(false);

  const copy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setShowToast(true);
    setTimeout(() => {
      setCopied(null);
      setShowToast(false);
    }, 2200);
  };

  const banks = [
    {
      id: 'bcp', Logo: BcpLogo,
      color: '#003087', bg: '#EBF3FF', border: '#C7D9F5',
      label: 'Banco de Crédito del Perú',
      accounts: [
        { label: 'N° de Cuenta', value: '19192289614030', id: 'bcp-c' },
        { label: 'CCI', value: '00219119228961403052', id: 'bcp-cci' },
      ],
    },
    {
      id: 'interbank', Logo: InterbankLogo,
      color: '#006D5B', bg: '#E6F5F2', border: '#B3E0D8',
      label: 'Interbank',
      accounts: [
        { label: 'N° de Cuenta', value: '2823099192010', id: 'inter-c' },
      ],
    },
    {
      id: 'bbva', Logo: BbvaLogo,
      color: '#004B96', bg: '#E8EFF9', border: '#BAD0EF',
      label: 'BBVA Continental',
      accounts: [
        { label: 'N° de Cuenta', value: '0011-0814-0215422939', id: 'bbva-c' },
        { label: 'CCI', value: '011-814-000215422939-13', id: 'bbva-cci' },
      ],
    },
  ];

  const digital = [
    { name: 'Yape', Logo: YapeLogo, color: '#6B21B0', bg: '#F5EEFF', border: '#D4A8F0', sub: 'de BCP' },
    { name: 'Plin', Logo: PlinLogo, color: '#0064CC', bg: '#E0F4FD', border: '#90CDEF', sub: 'Interbank / BBVA' },
    { name: 'Lukita', Logo: LukitaLogo, color: '#0053A0', bg: '#E8EFF9', border: '#BAD0EF', sub: 'de BBVA' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Nunito:wght@400;500;600;700&display=swap');

        .mp * { box-sizing: border-box; }
        .mp { font-family: 'Nunito', sans-serif; background: #EFF3FB; min-height: 100vh; padding-bottom: 72px; }

        .mp-hero {
          background: linear-gradient(135deg, #0B2550 0%, #163A80 55%, #0B2550 100%);
          padding: 108px 20px 50px; text-align: center; position: relative; overflow: hidden;
        }
        .mp-hero::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse at 15% 60%, rgba(99,180,249,.13) 0%, transparent 55%),
                      radial-gradient(ellipse at 85% 15%, rgba(168,85,247,.1) 0%, transparent 55%);
        }
        .mp-bc { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: rgba(255,255,255,.45); margin-bottom: 22px; position: relative; z-index: 1; }
        .mp-bc a { color: rgba(255,255,255,.45); text-decoration: none; transition: color .2s; }
        .mp-bc a:hover { color: #fff; }
        .mp-bc .cur { color: rgba(255,255,255,.9); }
        .mp-hero h1 { font-family: 'Sora', sans-serif; font-size: clamp(26px,5vw,40px); font-weight: 800; color: #fff; position: relative; z-index: 1; margin-bottom: 10px; letter-spacing: -.5px; }
        .mp-hero h1 em { font-style: normal; background: linear-gradient(90deg, #63B4F9, #A78BFA); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .mp-hero p { color: rgba(255,255,255,.6); font-size: 14px; position: relative; z-index: 1; max-width: 430px; margin: 0 auto; line-height: 1.6; }

        .mp-wrap { max-width: 880px; margin: -28px auto 0; padding: 0 16px; position: relative; z-index: 2; }

        .mp-tit { background: #fff; border-radius: 18px; padding: 18px 22px; display: flex; align-items: center; gap: 16px; box-shadow: 0 2px 18px rgba(11,37,80,.09); margin-bottom: 26px; }
        .mp-tit-icon { width: 48px; height: 48px; border-radius: 14px; flex-shrink: 0; background: linear-gradient(135deg, #0B2550, #163A80); display: flex; align-items: center; justify-content: center; }
        .mp-tit-lbl { font-size: 11.5px; color: #9CA3AF; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
        .mp-tit-nm { font-family: 'Sora', sans-serif; font-size: 17px; font-weight: 700; color: #111827; }

        .mp-sh { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
        .mp-sh span { font-family: 'Sora', sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #6B7280; white-space: nowrap; }
        .mp-sh::after { content: ''; flex: 1; height: 1px; background: #E5E7EB; }

        .mp-banks { display: grid; gap: 14px; margin-bottom: 26px; grid-template-columns: repeat(auto-fit, minmax(255px, 1fr)); }
        .mp-bank { background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 1px 14px rgba(11,37,80,.07); transition: transform .22s, box-shadow .22s; border: 1.5px solid; }
        .mp-bank:hover { transform: translateY(-4px); box-shadow: 0 8px 32px rgba(11,37,80,.13); }
        .mp-bank-top { padding: 18px 20px 14px; display: flex; align-items: center; gap: 14px; }
        .mp-bank-logo { width: 56px; height: 48px; border-radius: 12px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; padding: 6px; }
        .mp-bank-meta-lbl { font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .9px; color: #9CA3AF; margin-bottom: 5px; }
        .mp-bank-name-row { display: flex; align-items: center; gap: 6px; }
        .mp-bank-name-txt { font-family: 'Sora', sans-serif; font-weight: 600; font-size: 13px; }
        .mp-div { height: 1px; background: #F3F4F6; margin: 0 20px; }
        .mp-accs { padding: 14px 20px 18px; display: flex; flex-direction: column; gap: 11px; }
        .mp-acc { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
        .mp-acc-lbl { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .8px; color: #9CA3AF; margin-bottom: 3px; }
        .mp-acc-num { font-family: 'Sora', sans-serif; font-size: 14px; font-weight: 600; color: #1F2937; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .mp-cp { width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0; border: 1.5px solid #E5E7EB; background: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #9CA3AF; transition: all .18s; }
        .mp-cp:hover { border-color: #163A80; color: #163A80; background: #EFF4FF; }
        .mp-cp.ok { border-color: #10B981; color: #10B981; background: #ECFDF5; }

        .mp-dig { display: grid; gap: 14px; margin-bottom: 26px; }
        @media(min-width: 580px) { .mp-dig { grid-template-columns: repeat(3, 1fr); } }
        .mp-dc { background: #fff; border-radius: 20px; padding: 22px 16px 18px; text-align: center; box-shadow: 0 1px 14px rgba(11,37,80,.07); border: 2px solid transparent; cursor: pointer; transition: transform .2s, box-shadow .2s, border-color .2s; }
        .mp-dc:hover { transform: translateY(-4px); box-shadow: 0 8px 28px rgba(11,37,80,.13); }
        .mp-dc-logo { display: flex; justify-content: center; margin-bottom: 12px; }
        .mp-dc-name { font-family: 'Sora', sans-serif; font-size: 17px; font-weight: 800; margin-bottom: 2px; }
        .mp-dc-sub { font-size: 11px; color: #9CA3AF; font-weight: 500; margin-bottom: 14px; }
        .mp-dc-num { display: flex; align-items: center; justify-content: center; gap: 7px; padding: 9px 14px; border-radius: 10px; font-family: 'Sora', sans-serif; font-size: 14px; font-weight: 700; color: #1F2937; }
        .mp-dc-tap { font-size: 11px; color: #C4CAD4; margin-top: 9px; display: flex; align-items: center; justify-content: center; gap: 5px; }

        .mp-av { background: linear-gradient(135deg, #0B2550, #163A80); border-radius: 20px; padding: 26px; margin-bottom: 18px; color: #fff; }
        .mp-av-head { font-family: 'Sora', sans-serif; font-weight: 700; font-size: 15px; margin-bottom: 16px; display: flex; align-items: center; gap: 10px; }
        .mp-av-ico { width: 32px; height: 32px; border-radius: 8px; background: rgba(255,255,255,.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .mp-av-list { display: flex; flex-direction: column; gap: 10px; }
        .mp-av-item { display: flex; align-items: flex-start; gap: 10px; font-size: 13.5px; line-height: 1.55; color: rgba(255,255,255,.85); }
        .mp-av-dot { width: 6px; height: 6px; border-radius: 50%; background: #63B4F9; margin-top: 5px; flex-shrink: 0; }
        .mp-av-item strong { color: #fff; }

        .mp-gx { background: #fff; border-radius: 18px; padding: 22px 24px; text-align: center; box-shadow: 0 1px 12px rgba(11,37,80,.07); font-size: 14.5px; color: #6B7280; line-height: 1.65; }
        .mp-gx strong { color: #111827; }

        .mp-toast {
        position: fixed;
        bottom: 28px;
        left: 50%;
        transform: translateX(-50%);
        
        background: #0B2550;
        color: white;

        padding: 10px 18px;
        border-radius: 999px;

        font-size: 14px;
        font-weight: 600;
        font-family: 'Sora', sans-serif;

        box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        z-index: 9999;

        display: inline-flex; /* 🔥 clave */
        align-items: center;
        gap: 10px;
        }


        .mp-toast::before {
        content: '';
        width: 10px;
        height: 10px;
        background: #10B981;
        border-radius: 50%;
        flex-shrink: 0;
        }

   
}
      `}</style>

      <main className="mp">
        <div className="mp-hero">
          <nav className="mp-bc">
            <a href="/">Inicio</a>
            <svg width="10" height="10" viewBox="0 0 10 10"><path d="M3 2l4 3-4 3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
            <span className="cur">Medios de Pago</span>
          </nav>
          <h1>Medios de <em>Pago</em></h1>
          <p>Depósitos bancarios y pagos digitales — rápido, seguro y sin comisiones</p>
        </div>

        <div className="mp-wrap">
          <div className="mp-tit">
            <div className="mp-tit-icon"><IconUser /></div>
            <div>
              <div className="mp-tit-lbl">Titular de las cuentas</div>
              <div className="mp-tit-nm">Merlin Fernández</div>
            </div>
          </div>

          <div className="mp-sh"><span>Depósitos bancarios</span></div>
          <div className="mp-banks">
            {banks.map(b => (
              <div className="mp-bank" key={b.id} style={{ borderColor: b.border }}>
                <div className="mp-bank-top">
                  <div className="mp-bank-logo" style={{ background: b.bg }}><b.Logo /></div>
                  <div>
                    <div className="mp-bank-meta-lbl">Cuenta bancaria</div>
                    <div className="mp-bank-name-row">
                      <IconBuilding color={b.color} />
                      <span className="mp-bank-name-txt" style={{ color: b.color }}>{b.label}</span>
                    </div>
                  </div>
                </div>
                <div className="mp-div" />
                <div className="mp-accs">
                  {b.accounts.map(acc => (
                    <div className="mp-acc" key={acc.id}>
                      <div style={{ minWidth: 0 }}>
                        <div className="mp-acc-lbl">{acc.label}</div>
                        <div className="mp-acc-num">{acc.value}</div>
                      </div>
                      <button className={`mp-cp ${copied === acc.id ? 'ok' : ''}`} onClick={() => copy(acc.value, acc.id)} title="Copiar">
                        <IconCopy done={copied === acc.id} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mp-sh"><span>Pagos digitales</span></div>
          <div className="mp-dig">
            {digital.map(d => (
              <div className="mp-dc" key={d.name} style={{ borderColor: copied === `d-${d.name}` ? d.color : 'transparent' }} onClick={() => copy('957064401', `d-${d.name}`)}>
                <div className="mp-dc-logo"><d.Logo /></div>
                <div className="mp-dc-name" style={{ color: d.color }}>{d.name}</div>
                <div className="mp-dc-sub">{d.sub}</div>
                <div className="mp-dc-num" style={{ background: d.bg }}><IconPhone /> 957 064 401</div>
                <div className="mp-dc-tap"><IconCopy done={copied === `d-${d.name}`} /><span>Toca para copiar</span></div>
              </div>
            ))}
          </div>

          <div className="mp-av">
            <div className="mp-av-head"><div className="mp-av-ico"><IconAlert /></div>Información importante</div>
            <div className="mp-av-list">
              <div className="mp-av-item"><div className="mp-av-dot" /><span>Envía tu comprobante de pago <strong>hasta un día antes de tu cita</strong> para confirmar tu asistencia.</span></div>
              <div className="mp-av-item"><div className="mp-av-dot" /><span>Los horarios elegidos permanecen disponibles <strong>hasta recibir tu pago</strong>. Tu horario puede variar si el pago no llega a tiempo.</span></div>
            </div>
          </div>

          <div className="mp-gx">
            ¡Muchas gracias por confiar en <strong>Centro Crecemos</strong>! 😊<br />
            Estamos comprometidos con tu bienestar y el de tu familia.
          </div>
        </div>
      </main>

      {showToast && (
        <div className="mp-toast">
            ¡Número copiado!
        </div>
        )}
    </>
  );
};

export default Pagos;