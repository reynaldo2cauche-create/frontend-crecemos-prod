import React, { useState, useRef, useEffect } from 'react';
import { CalendarDaysIcon, XMarkIcon } from '@heroicons/react/24/outline';

// Selector de SOLO fecha (formato de value: 'YYYY-MM-DD').
// Dropdown anclado al input (absolute), se mueve con el scroll. Mismo estilo morado de Crecemos.

const MESES_CAL = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

export default function DatePicker({ value, onChange, placeholder = 'Seleccionar fecha', allowClear = true }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const limaHoy = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Lima' }).format(new Date());
  const fechaStr = value || '';

  const [viewYear, setViewYear] = useState(() => (fechaStr ? +fechaStr.slice(0, 4) : new Date().getFullYear()));
  const [viewMonth, setViewMonth] = useState(() => (fechaStr ? +fechaStr.slice(5, 7) - 1 : new Date().getMonth()));
  const [calView, setCalView] = useState('day');

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (wrapRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const primerDia = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
  const diasMes = new Date(viewYear, viewMonth + 1, 0).getDate();

  const selDia = (d) => {
    onChange(`${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
    setOpen(false);
  };

  const prevMes = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); } else setViewMonth((m) => m - 1); };
  const nextMes = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); } else setViewMonth((m) => m + 1); };

  const labelDisplay = fechaStr
    ? new Date(fechaStr + 'T12:00:00').toLocaleDateString('es-PE', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
    : null;

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => { setCalView('day'); setOpen((o) => !o); }}
        className={`w-full flex items-center gap-2.5 border rounded-lg px-3 py-2 text-sm text-left transition-all ${
          open ? 'border-[#7B1FA2] ring-2 ring-purple-50' : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <CalendarDaysIcon className="w-4 h-4 flex-shrink-0 text-gray-400" />
        <span className={`flex-1 ${labelDisplay ? 'text-gray-800' : 'text-gray-400'}`}>
          {labelDisplay || placeholder}
        </span>
        {fechaStr && allowClear && (
          <span
            role="button"
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onChange(''); setOpen(false); }}
            className="text-gray-300 hover:text-gray-500 flex-shrink-0 cursor-pointer"
          >
            <XMarkIcon className="w-3.5 h-3.5" />
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 w-[240px] rounded-xl border border-purple-100 shadow-xl bg-white p-2 select-none z-[99999]">
          {/* Header navegación */}
          <div className="flex items-center justify-between mb-1 px-0.5">
            <button type="button" onClick={() => (calView === 'day' ? prevMes() : setViewYear((y) => y - 1))}
              className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 font-bold">‹</button>
            <button type="button" onClick={() => setCalView((v) => (v === 'day' ? 'month' : 'day'))}
              className="text-xs font-bold text-gray-800 hover:text-[#7B1FA2] transition-colors px-1">
              {calView === 'day' ? `${MESES_CAL[viewMonth]} ${viewYear}` : viewYear}
            </button>
            <button type="button" onClick={() => (calView === 'day' ? nextMes() : setViewYear((y) => y + 1))}
              className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 font-bold">›</button>
          </div>

          {calView === 'month' ? (
            <div className="grid grid-cols-3 gap-1">
              {MESES_CAL.map((m, i) => (
                <button type="button" key={i} onClick={() => { setViewMonth(i); setCalView('day'); }}
                  className={`py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
                    i === viewMonth ? 'bg-[#7B1FA2] text-white' : 'hover:bg-purple-50 text-gray-700'
                  }`}>
                  {m.slice(0, 3)}
                </button>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-7">
                {['L','M','M','J','V','S','D'].map((d, i) => (
                  <div key={i} className="text-center text-[9px] font-semibold text-gray-400 py-0.5">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-px">
                {Array(primerDia).fill(null).map((_, i) => <div key={'e' + i} />)}
                {Array.from({ length: diasMes }, (_, i) => i + 1).map((d) => {
                  const dStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                  const esSel = dStr === fechaStr;
                  const esHoy = dStr === limaHoy;
                  return (
                    <button type="button" key={d} onClick={() => selDia(d)}
                      className={`w-full aspect-square flex items-center justify-center rounded text-[11px] font-medium transition-colors ${
                        esSel ? 'bg-[#7B1FA2] text-white font-bold' :
                        esHoy ? 'bg-purple-50 text-[#7B1FA2] font-bold ring-1 ring-purple-200' :
                        'hover:bg-gray-100 text-gray-700'
                      }`}>
                      {d}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
