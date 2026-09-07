import React from 'react';
import { ClockIcon } from '@heroicons/react/24/outline';

/**
 * Selector de hora (formato 'HH:mm', 24h). Mismo estilo que el bloque de hora
 * del DateTimePicker. value = 'HH:mm' | ''.
 */
export default function HoraPicker({ value, onChange, className = '' }) {
  const [hh, mm] = (value || '').split(':');

  const setHora = (h, m) => {
    const hp = String(Math.min(23, Math.max(0, parseInt(h || '0', 10) || 0))).padStart(2, '0');
    const mp = String(Math.min(59, Math.max(0, parseInt(m || '0', 10) || 0))).padStart(2, '0');
    onChange(`${hp}:${mp}`);
  };

  return (
    <div className={`flex items-center gap-2 border-2 border-gray-200 rounded-lg px-3 py-2 bg-white focus-within:border-[#7B1FA2] transition-colors ${className}`}>
      <ClockIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
      <input
        type="text"
        inputMode="numeric"
        placeholder="--"
        value={value ? parseInt(hh, 10) : ''}
        onChange={(e) => {
          const v = e.target.value.replace(/\D/g, '').slice(0, 2);
          setHora(v, mm);
        }}
        className="w-10 text-sm text-center outline-none bg-transparent placeholder-gray-300"
      />
      <span className="text-gray-400 font-bold">:</span>
      <input
        type="text"
        inputMode="numeric"
        placeholder="--"
        value={value ? parseInt(mm, 10) : ''}
        onChange={(e) => {
          const v = e.target.value.replace(/\D/g, '').slice(0, 2);
          setHora(hh, v);
        }}
        className="w-10 text-sm text-center outline-none bg-transparent placeholder-gray-300"
      />
      <span className="text-[10px] text-gray-400 font-medium ml-auto">24h</span>
    </div>
  );
}
