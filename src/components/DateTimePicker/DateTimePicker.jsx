import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ClockIcon, CalendarDaysIcon, XMarkIcon } from '@heroicons/react/24/outline';

// Selector de fecha + hora (formato de value: 'YYYY-MM-DDTHH:mm').
// Reutilizable: mismo selector que usa el módulo de tareas (Centro Operativo).

const MESES_CAL = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

export default function DateTimePicker({ value, onChange, placeholder = 'Seleccionar fecha y hora', allowClear = true }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const pickerRef  = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

  const limaHoy  = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Lima' }).format(new Date());
  const fechaStr = value ? value.slice(0, 10) : '';
  const timeStr  = value ? value.slice(11, 16) : '09:00';
  const [hh, mm] = timeStr.split(':');

  const [viewYear,  setViewYear]  = useState(() => fechaStr ? +fechaStr.slice(0, 4)     : new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => fechaStr ? +fechaStr.slice(5, 7) - 1 : new Date().getMonth());
  const [calView, setCalView] = useState('day');

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (triggerRef.current?.contains(e.target) || pickerRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleOpen = () => {
    if (triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      const calW = 220;
      const calH = 270;
      const left = r.left + calW > window.innerWidth - 8 ? r.right - calW : r.left;
      const openUp = r.bottom + 6 + calH > window.innerHeight - 8;
      const top = openUp ? r.top - calH - 6 : r.bottom + 6;
      setPos({ top: Math.max(8, top), left: Math.max(8, left), width: r.width });
    }
    setCalView('day');
    setOpen(o => !o);
  };

  const primerDia = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
  const diasMes   = new Date(viewYear, viewMonth + 1, 0).getDate();

  const selDia = (d) => {
    const s = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    onChange(`${s}T${timeStr}`);
    setOpen(false);
  };

  const prevMes = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const nextMes = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };

  const labelDisplay = fechaStr
    ? `${new Date(fechaStr + 'T12:00:00').toLocaleDateString('es-PE', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })} · ${timeStr}`
    : null;

  const calendarPortal = open && createPortal(
    <div ref={pickerRef} style={{ position: 'fixed', top: pos.top, left: pos.left, width: 220, zIndex: 99999 }}
      className="rounded-xl border border-purple-100 shadow-xl bg-white p-1.5 select-none">

      {/* Header navegación */}
      <div className="flex items-center justify-between mb-1 px-0.5">
        <button type="button" onClick={() => calView === 'day' ? prevMes() : setViewYear(y => y - 1)}
          className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 font-bold">‹</button>
        <button type="button" onClick={() => setCalView(v => v === 'day' ? 'month' : 'day')}
          className="text-xs font-bold text-gray-800 hover:text-[#7B1FA2] transition-colors px-1">
          {calView === 'day' ? `${MESES_CAL[viewMonth]} ${viewYear}` : viewYear}
        </button>
        <button type="button" onClick={() => calView === 'day' ? nextMes() : setViewYear(y => y + 1)}
          className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 font-bold">›</button>
      </div>

      {calView === 'month' ? (
        /* Vista meses */
        <div className="grid grid-cols-3 gap-1 mb-2">
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
        /* Vista días */
        <>
          <div className="grid grid-cols-7">
            {['L','M','M','J','V','S','D'].map((d, i) => (
              <div key={i} className="text-center text-[9px] font-semibold text-gray-400 py-0.5">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px mb-2">
            {Array(primerDia).fill(null).map((_, i) => <div key={'e' + i} />)}
            {Array.from({ length: diasMes }, (_, i) => i + 1).map(d => {
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

      <div className="flex items-center gap-2 border-t border-gray-100 pt-2">
        <ClockIcon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        <span className="text-xs text-gray-500 font-semibold flex-shrink-0">Hora</span>
        <input type="text" inputMode="numeric" placeholder="--"
          value={fechaStr ? parseInt(hh, 10) : ''}
          onChange={e => {
            if (!fechaStr) return;
            const v = e.target.value.replace(/\D/g, '').slice(0, 2);
            const h = String(Math.min(23, parseInt(v) || 0)).padStart(2, '0');
            onChange(`${fechaStr}T${h}:${mm}`);
          }}
          className="w-12 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center outline-none focus:border-[#7B1FA2] bg-white placeholder-gray-300" />
        <span className="text-gray-400 font-bold text-base">:</span>
        <input type="text" inputMode="numeric" placeholder="--"
          value={fechaStr ? parseInt(mm, 10) : ''}
          onChange={e => {
            if (!fechaStr) return;
            const v = e.target.value.replace(/\D/g, '').slice(0, 2);
            const m = String(Math.min(59, parseInt(v) || 0)).padStart(2, '0');
            onChange(`${fechaStr}T${hh}:${m}`);
          }}
          className="w-12 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center outline-none focus:border-[#7B1FA2] bg-white placeholder-gray-300" />
        <span className="text-[10px] text-gray-400 font-medium ml-auto">24h</span>
      </div>
    </div>,
    document.body
  );

  return (
    <div>
      <button ref={triggerRef} type="button" onClick={handleOpen}
        className={`w-full flex items-center gap-2.5 border rounded-xl px-3.5 py-2.5 text-sm text-left transition-all ${
          open ? 'border-[#7B1FA2] ring-2 ring-purple-50' : 'border-gray-200 hover:border-gray-300'
        }`}>
        <CalendarDaysIcon className="w-4 h-4 flex-shrink-0 text-gray-400" />
        <span className={`flex-1 ${labelDisplay ? 'text-gray-800' : 'text-gray-400'}`}>
          {labelDisplay || placeholder}
        </span>
        {fechaStr && allowClear && (
          <span role="button"
            onMouseDown={e => { e.preventDefault(); e.stopPropagation(); onChange(''); setOpen(false); }}
            className="text-gray-300 hover:text-gray-500 flex-shrink-0 cursor-pointer">
            <XMarkIcon className="w-3.5 h-3.5" />
          </span>
        )}
      </button>
      {calendarPortal}
    </div>
  );
}
