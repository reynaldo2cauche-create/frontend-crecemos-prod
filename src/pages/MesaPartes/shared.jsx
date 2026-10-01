import React from 'react';

// Colores de cada estado por su código
export const ESTADO_STYLE = {
  RECEPCIONADA: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', ring: 'ring-blue-200' },
  OBSERVADA:    { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', ring: 'ring-amber-200' },
  RECHAZADA:    { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', ring: 'ring-red-200' },
  ATENDIDA:     { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500', ring: 'ring-green-200' },
  NOTIFICADA:   { bg: 'bg-teal-50', text: 'text-teal-700', dot: 'bg-teal-500', ring: 'ring-teal-200' },
  CERRADA:      { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400', ring: 'ring-gray-200' },
};

export const EstadoBadge = ({ estado }) => {
  const s = ESTADO_STYLE[estado?.codigo] || ESTADO_STYLE.CERRADA;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text} ring-1 ${s.ring}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {estado?.nombre || '—'}
    </span>
  );
};

export const fmtFecha = (f) => {
  if (!f) return '—';
  const d = new Date(f);
  if (isNaN(d.getTime())) return String(f);
  return d.toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const nombrePacienteCargo = (p) =>
  p ? [p.nombres, p.apellido_paterno, p.apellido_materno].filter(Boolean).join(' ') : '';

// Genera e imprime el CARGO de recepción (comprobante para el apoderado)
export const imprimirCargo = (sol) => {
  if (!sol) return;
  const paciente = nombrePacienteCargo(sol.paciente);
  const esRechazo = sol.estado?.codigo === 'RECHAZADA';
  const respondida = !!sol.respuesta || ['ATENDIDA', 'RECHAZADA', 'NOTIFICADA', 'CERRADA'].includes(sol.estado?.codigo);
  const recibidoPor = sol.usuarioCrea ? [sol.usuarioCrea.nombres, sol.usuarioCrea.apellidos].filter(Boolean).join(' ') : '';
  const respondidoPor = sol.responde ? [sol.responde.nombres, sol.responde.apellidos].filter(Boolean).join(' ') : '';
  const logoUrl = `${window.location.origin}/logo-text-short.png`;
  const win = window.open('', '_blank', 'width=800,height=900');
  if (!win) { alert('Habilite las ventanas emergentes para imprimir el cargo.'); return; }
  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
  <title>Cargo ${sol.numero_expediente}</title>
  <style>
    *{box-sizing:border-box;font-family:'Segoe UI',Arial,sans-serif}
    body{margin:0;padding:32px;color:#1e293b}
    .barra{height:6px;background:linear-gradient(90deg,#7B1FA2,#A3C644);border-radius:4px;margin-bottom:20px}
    .cab{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #eee;padding-bottom:14px;margin-bottom:18px}
    .marca{font-size:22px;font-weight:800;color:#7B1FA2}
    .sub{font-size:12px;color:#64748b}
    h1{font-size:16px;margin:0 0 14px;color:#0f172a;text-transform:uppercase;letter-spacing:.5px}
    .exp{background:#f6f2fb;border:1px solid #e6dcf3;border-radius:12px;padding:14px 18px;margin-bottom:18px;display:flex;justify-content:space-between;align-items:center}
    .exp b{font-size:26px;color:#7B1FA2;letter-spacing:1px}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:10px 24px;margin-bottom:16px}
    .campo{font-size:13px}
    .campo span{display:block;font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:#94a3b8;font-weight:700}
    .desc{font-size:13px;background:#fafafa;border:1px solid #eee;border-radius:8px;padding:10px;margin-bottom:22px}
    .nota{font-size:11px;color:#64748b;border-left:3px solid #A3C644;padding-left:10px;margin-bottom:34px}
    .firmas{display:flex;justify-content:space-around;margin-top:48px}
    .firma{text-align:center;width:40%}
    .linea{border-top:1px solid #333;margin-bottom:6px}
    .firma small{font-size:11px;color:#475569}
    @media print{.noprint{display:none}}
  </style></head><body>
    <div class="barra"></div>
    <div class="cab">
      <div><img src="${logoUrl}" alt="Crecemos" style="height:44px;object-fit:contain" onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<div class=\\'marca\\'>CRECEMOS</div>')"/><div class="sub">Centro de Terapias</div></div>
      <div class="sub" style="text-align:right">Fecha de recepción<br><b>${fmtFecha(sol.created_at)}</b></div>
    </div>
    <h1>Cargo de recepción — Mesa de Partes</h1>
    <div class="exp"><span class="sub">N.° de expediente</span><b>${sol.numero_expediente || ''}</b></div>
    <div class="grid">
      <div class="campo"><span>Tipo de solicitud</span>${sol.tipo?.nombre || '—'}</div>
      <div class="campo"><span>Asunto</span>${sol.asunto || '—'}</div>
      <div class="campo"><span>Entregado por</span>${sol.entregado_por_nombre || '—'}</div>
      <div class="campo"><span>Documento</span>${sol.entregado_por_doc || '—'}</div>
      <div class="campo"><span>Teléfono</span>${sol.entregado_por_telefono || '—'}</div>
      <div class="campo"><span>Paciente</span>${paciente || '—'}</div>
    </div>
    <div class="campo" style="margin-bottom:6px"><span>Descripción</span></div>
    <div class="desc">${(sol.descripcion || '').replace(/</g, '&lt;')}</div>
    ${respondida ? `
    <div style="border-top:2px dashed #e5e7eb;margin:18px 0 16px"></div>
    <h1 style="color:${esRechazo ? '#b91c1c' : '#15803d'}">${esRechazo ? 'Solicitud rechazada' : 'Respuesta'}</h1>
    <div class="campo" style="margin-bottom:6px"><span>${esRechazo ? 'Motivo del rechazo' : 'Respuesta de la institución'}</span></div>
    <div class="desc" style="border-color:${esRechazo ? '#fecaca' : '#bbf7d0'};background:${esRechazo ? '#fef2f2' : '#f0fdf4'}">${(sol.respuesta || '').replace(/</g, '&lt;')}</div>
    <div class="grid">
      <div class="campo"><span>Estado</span>${sol.estado?.nombre || '—'}</div>
      <div class="campo"><span>Fecha de respuesta</span>${sol.fecha_respuesta ? fmtFecha(sol.fecha_respuesta) : '—'}</div>
    </div>
    ` : ''}
    <div class="nota">Este cargo acredita la recepción del documento. Conserve el número de expediente para hacer el seguimiento de su solicitud.</div>
    ${respondida ? `
    <div class="firmas" style="margin-top:40px">
      <div class="firma"><div class="linea"></div><small><b>${respondidoPor || ''}</b><br>Administrador (responsable de la respuesta)</small></div>
    </div>` : ''}
    <div class="firmas" style="margin-top:${respondida ? '26px' : '48px'}">
      <div class="firma"><div class="linea"></div><small><b>${recibidoPor || ''}</b><br>Recepción (recibí conforme)</small></div>
      <div class="firma"><div class="linea"></div><small><b>${(sol.entregado_por_nombre || '').replace(/</g, '&lt;')}</b><br>Apoderado (entregué conforme)</small></div>
    </div>
    <div class="noprint" style="text-align:center;margin-top:30px">
      <button onclick="window.print()" style="padding:10px 24px;background:#7B1FA2;color:#fff;border:0;border-radius:8px;font-weight:600;cursor:pointer">Imprimir</button>
    </div>
  </body></html>`;
  win.document.write(html);
  win.document.close();
  setTimeout(() => { try { win.focus(); win.print(); } catch (e) {} }, 400);
};
