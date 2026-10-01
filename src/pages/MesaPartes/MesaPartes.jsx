import React, { useState, useEffect, useCallback } from 'react';
import {
  Inbox, Plus, Search, FileText, CheckCircle2, XCircle, AlertCircle,
  Loader2, Eye, RefreshCw,
} from 'lucide-react';
import {
  getCatalogos, getEstadisticas, listarSolicitudes,
} from '../../services/mesaPartesService';
import NuevaSolicitudModal from './NuevaSolicitudModal';
import ExpedienteModal from './ExpedienteModal';
import { EstadoBadge, fmtFecha } from './shared';

const PURPLE = '#7B1FA2';

const nombrePaciente = (p) =>
  p ? [p.nombres, p.apellido_paterno, p.apellido_materno].filter(Boolean).join(' ') : '—';

const StatCard = ({ label, valor, color }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
    <p className="text-2xl font-bold text-gray-900">{valor}</p>
    <p className={`text-xs font-medium mt-0.5 ${color}`}>{label}</p>
  </div>
);

const MesaPartes = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user?.rol?.id === 1;      // Administrador: responde (atiende/rechaza/observa)
  const isAdmision = user?.rol?.id === 2;   // Admisión (recepción): registra, notifica, entrega

  const [catalogos, setCatalogos] = useState({ estados: [], tipos: [], tiposEvento: [] });
  const [stats, setStats] = useState({ total: 0, porEstado: [] });
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({ busqueda: '', estado_id: '', tipo_id: '' });

  const [showNueva, setShowNueva] = useState(false);
  const [expedienteId, setExpedienteId] = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (filtros.busqueda) params.busqueda = filtros.busqueda;
      if (filtros.estado_id) params.estado_id = filtros.estado_id;
      if (filtros.tipo_id) params.tipo_id = filtros.tipo_id;
      const [lista, est] = await Promise.all([listarSolicitudes(params), getEstadisticas()]);
      setSolicitudes(lista.data || []);
      setStats(est || { total: 0, porEstado: [] });
    } catch (e) {
      console.error('Error al cargar mesa de partes:', e);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    getCatalogos().then(setCatalogos).catch((e) => console.error('catalogos', e));
  }, []);

  useEffect(() => {
    const t = setTimeout(cargar, 300);
    return () => clearTimeout(t);
  }, [cargar]);

  const countEstado = (nombre) =>
    stats.porEstado?.find((p) => p.estado === nombre)?.cantidad || 0;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: PURPLE }}>
            <Inbox className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Mesa de Partes</h1>
            <p className="text-sm text-gray-500">Recepción y seguimiento de solicitudes</p>
          </div>
        </div>
        <button
          onClick={() => setShowNueva(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold shadow-md transition hover:opacity-90"
          style={{ background: PURPLE }}
        >
          <Plus className="w-5 h-5" /> Nueva solicitud
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        <StatCard label="Total" valor={stats.total || 0} color="text-gray-500" />
        <StatCard label="Recepcionadas" valor={countEstado('Recepcionada')} color="text-blue-600" />
        <StatCard label="Observadas" valor={countEstado('Observada')} color="text-amber-600" />
        <StatCard label="Atendidas" valor={countEstado('Atendida')} color="text-green-600" />
        <StatCard label="Notificadas" valor={countEstado('Notificada')} color="text-teal-600" />
        <StatCard label="Cerradas" valor={countEstado('Cerrada')} color="text-gray-500" />
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-gray-100 p-3 mb-4 flex flex-wrap items-center gap-3 shadow-sm">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={filtros.busqueda}
            onChange={(e) => setFiltros((p) => ({ ...p, busqueda: e.target.value }))}
            placeholder="Buscar por expediente, nombre o documento…"
            className="w-full text-sm pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-200"
          />
        </div>
        <select
          value={filtros.estado_id}
          onChange={(e) => setFiltros((p) => ({ ...p, estado_id: e.target.value }))}
          className="text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-200"
        >
          <option value="">Todos los estados</option>
          {catalogos.estados.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
        </select>
        <select
          value={filtros.tipo_id}
          onChange={(e) => setFiltros((p) => ({ ...p, tipo_id: e.target.value }))}
          className="text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-200"
        >
          <option value="">Todos los tipos</option>
          {catalogos.tipos.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
        </select>
        <button onClick={cargar} className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50" title="Actualizar">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" /> Cargando…
          </div>
        ) : solicitudes.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            No hay solicitudes
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-100 bg-gray-50/60">
                  <th className="px-4 py-3 font-semibold">Expediente</th>
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                  <th className="px-4 py-3 font-semibold">Tipo</th>
                  <th className="px-4 py-3 font-semibold">Entregado por</th>
                  <th className="px-4 py-3 font-semibold">Paciente</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold text-right">Acción</th>
                </tr>
              </thead>
              <tbody>
                {solicitudes.map((s) => (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-purple-50/30 transition">
                    <td className="px-4 py-3 font-mono font-semibold text-gray-800">{s.numero_expediente}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmtFecha(s.created_at)}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {s.tipo?.nombre || '—'}
                      {s.asunto && <span className="block text-xs text-gray-400 truncate max-w-[200px]">{s.asunto}</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{s.entregado_por_nombre}</td>
                    <td className="px-4 py-3 text-gray-500">{nombrePaciente(s.paciente)}</td>
                    <td className="px-4 py-3"><EstadoBadge estado={s.estado} /></td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setExpedienteId(s.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 transition"
                      >
                        <Eye className="w-3.5 h-3.5" /> Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modales */}
      {showNueva && (
        <NuevaSolicitudModal
          catalogos={catalogos}
          userId={user.id}
          onClose={() => setShowNueva(false)}
          onCreated={() => { setShowNueva(false); cargar(); }}
        />
      )}
      {expedienteId && (
        <ExpedienteModal
          id={expedienteId}
          isAdmin={isAdmin}
          isAdmision={isAdmision}
          userId={user.id}
          onClose={() => setExpedienteId(null)}
          onChanged={cargar}
        />
      )}
    </div>
  );
};

export default MesaPartes;
