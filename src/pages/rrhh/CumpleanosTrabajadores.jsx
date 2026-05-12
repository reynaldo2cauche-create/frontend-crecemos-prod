import React, { useState, useEffect } from 'react';
import { GiftIcon, CakeIcon, CalendarDaysIcon, UserGroupIcon, SparklesIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

export default function CumpleanosTrabajadores() {
  const [trabajadores, setTrabajadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos');

  useEffect(() => {
    api.get('/trabajadores/cumpleanos')
      .then(res => setTrabajadores(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const hoy    = trabajadores.filter(t => t.es_hoy);
  const semana = trabajadores.filter(t => !t.es_hoy && t.dias_restantes <= 7);
  const mes    = trabajadores.filter(t => !t.es_hoy && t.dias_restantes > 7 && t.dias_restantes <= 30);

  const filtrados =
    filtro === 'hoy'   ? hoy :
    filtro === '7dias' ? [...hoy, ...semana] :
    filtro === '30dias'? [...hoy, ...semana, ...mes] :
    trabajadores;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 lg:pt-12">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] rounded-2xl flex items-center justify-center shadow-lg">
              <CakeIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Cumpleaños del Equipo</h1>
              <p className="text-gray-500 text-sm">Próximos cumpleaños y preferencias de regalo</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        {!loading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-600">Hoy</span>
                <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5 text-yellow-500" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900">{hoy.length}</div>
              <div className="text-xs text-gray-400 mt-1">cumpleaños hoy</div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-600">Esta semana</span>
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                  <CalendarDaysIcon className="w-5 h-5 text-red-500" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900">{semana.length}</div>
              <div className="text-xs text-gray-400 mt-1">próximos 7 días</div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-600">Este mes</span>
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                  <CalendarDaysIcon className="w-5 h-5 text-orange-500" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900">{mes.length}</div>
              <div className="text-xs text-gray-400 mt-1">próximos 30 días</div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-600">Total</span>
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                  <UserGroupIcon className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900">{trabajadores.length}</div>
              <div className="text-xs text-gray-400 mt-1">colaboradores</div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'todos',  label: 'Todos' },
            { key: 'hoy',    label: '🎂 Hoy' },
            { key: '7dias',  label: 'Esta semana' },
            { key: '30dias', label: 'Este mes' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFiltro(f.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                filtro === f.key
                  ? 'bg-[#7B1FA2] text-white border-[#7B1FA2]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-[#7B1FA2] hover:text-[#7B1FA2]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Contenido */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-[#7B1FA2]" />
          </div>
        ) : filtrados.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm text-center py-20 text-gray-400">
            <CakeIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-medium">No hay cumpleaños en este período</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtrados.map(t => <TrabajadorCard key={t.id} t={t} />)}
          </div>
        )}

      </div>
    </div>
  );
}

function TrabajadorCard({ t }) {
  const initials = `${t.nombres?.[0] || ''}${t.apellidos?.[0] || ''}`.toUpperCase();

  const regalos = (() => {
    if (!t.opciones_regalo) return [];
    try {
      const p = JSON.parse(t.opciones_regalo);
      return Array.isArray(p) ? p : [];
    } catch {
      return typeof t.opciones_regalo === 'string'
        ? t.opciones_regalo.split(',').map(s => s.trim()).filter(Boolean)
        : [];
    }
  })();

  const diasLabel =
    t.es_hoy ? '¡Hoy!' :
    t.dias_restantes === 1 ? 'Mañana' :
    `en ${t.dias_restantes}d`;

  const diasColor =
    t.es_hoy           ? 'bg-yellow-50 text-yellow-700' :
    t.dias_restantes <= 7  ? 'bg-red-50 text-red-600' :
    t.dias_restantes <= 30 ? 'bg-orange-50 text-orange-600' :
                             'bg-gray-100 text-gray-500';

  return (
    <div className={`bg-white rounded-2xl shadow-sm border transition-all hover:shadow-md ${
      t.es_hoy ? 'border-yellow-300 ring-1 ring-yellow-200' : 'border-gray-200'
    }`}>

      {t.es_hoy && (
        <div className="rounded-t-2xl bg-yellow-50 border-b border-yellow-100 px-4 py-1.5 flex items-center gap-1.5">
          <SparklesIcon className="w-3.5 h-3.5 text-yellow-500" />
          <span className="text-xs font-bold text-yellow-700 uppercase tracking-wide">¡Feliz Cumpleaños!</span>
        </div>
      )}

      <div className="p-5">
        {/* Avatar + nombre */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-900 text-sm truncate">{t.nombres} {t.apellidos}</p>
            <p className="text-xs text-gray-400 truncate">{t.cargo || '—'}</p>
          </div>
        </div>

        {/* Fecha cumpleaños */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
              <CakeIcon className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{t.dia} de {MESES[t.mes - 1]}</p>
              <p className="text-xs text-gray-400">Cumple {t.edad} años</p>
            </div>
          </div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${diasColor}`}>
            {diasLabel}
          </span>
        </div>

        {/* Regalos */}
        {regalos.length > 0 ? (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center">
                <GiftIcon className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <span className="text-xs font-semibold text-gray-500">Le gusta</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {regalos.map((r, i) => (
                <span key={i} className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-100 text-xs rounded-full font-medium">
                  {r}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-gray-300">
            <GiftIcon className="w-3.5 h-3.5" />
            <span className="text-xs">Sin preferencias registradas</span>
          </div>
        )}
      </div>
    </div>
  );
}
