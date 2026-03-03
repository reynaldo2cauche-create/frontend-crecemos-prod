import React, { useState, useEffect, useRef } from 'react';
import {
  CalendarIcon,
  UserGroupIcon,
  UserIcon,
  ChartBarIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { obtenerEstadisticasSesiones, obtenerTerapeutas, buscarPacientes } from '../../services/sesionesService';
import * as XLSX from 'xlsx';

/* ──────────────────────────────────────────────────────────
   HELPERS
────────────────────────────────────────────────────────── */
const hoy = new Date();
const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
const fmt = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
};

/* ──────────────────────────────────────────────────────────
   SUBCOMPONENTS
────────────────────────────────────────────────────────── */
const StatCard = ({ icon: Icon, value, label, color }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <div className="text-2xl font-bold text-gray-900 leading-none">{value}</div>
      <div className="text-xs text-gray-500 mt-1 font-medium">{label}</div>
    </div>
  </div>
);

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
      active
        ? 'bg-[#7B1FA2] text-white shadow-sm'
        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
    }`}
  >
    {children}
  </button>
);

/* ──────────────────────────────────────────────────────────
   MODO 1 — GENERAL (todos los terapeutas)
────────────────────────────────────────────────────────── */
const VistaGeneral = ({ datos, fechaDesde, fechaHasta }) => {
  const [tab, setTab] = useState('terapeuta');

  const exportar = () => {
    if (tab === 'terapeuta') {
      const rows = datos.sesiones_por_terapeuta.map(t => ({
        Terapeuta: t.nombre,
        'Total Sesiones': t.total_sesiones,
        '% del Total': `${t.porcentaje}%`,
        'Pacientes Atendidos': t.total_pacientes,
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Por Terapeuta');
      XLSX.writeFile(wb, `Sesiones_Terapeutas_${fechaDesde}_${fechaHasta}.xlsx`);
    } else if (tab === 'paciente') {
      const rows = datos.sesiones_por_paciente.map(p => ({
        Paciente: p.nombre,
        'Total Sesiones': p.total_sesiones,
        'Terapeuta Principal': p.terapeuta_principal,
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Por Paciente');
      XLSX.writeFile(wb, `Sesiones_Pacientes_${fechaDesde}_${fechaHasta}.xlsx`);
    } else {
      const rows = datos.sesiones_por_servicio.map(s => ({
        Servicio: s.nombre,
        'Total Sesiones': s.total_sesiones,
        '% del Total': `${s.porcentaje}%`,
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Por Servicio');
      XLSX.writeFile(wb, `Sesiones_Servicios_${fechaDesde}_${fechaHasta}.xlsx`);
    }
  };

  return (
    <div>
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={CalendarIcon} value={datos.resumen.total_sesiones} label="Total Sesiones" color="bg-purple-50 text-purple-600" />
        <StatCard icon={UserIcon} value={datos.resumen.total_terapeutas} label="Terapeutas activos" color="bg-blue-50 text-blue-600" />
        <StatCard icon={UserGroupIcon} value={datos.resumen.total_pacientes} label="Pacientes atendidos" color="bg-green-50 text-green-600" />
        <StatCard icon={ArrowTrendingUpIcon} value={datos.resumen.promedio_por_dia} label="Sesiones / día" color="bg-orange-50 text-orange-600" />
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex gap-1">
            <TabButton active={tab === 'terapeuta'} onClick={() => setTab('terapeuta')}>Por Terapeuta</TabButton>
            <TabButton active={tab === 'paciente'} onClick={() => setTab('paciente')}>Por Paciente</TabButton>
            <TabButton active={tab === 'servicio'} onClick={() => setTab('servicio')}>Por Servicio</TabButton>
          </div>
          <button
            onClick={exportar}
            className="flex items-center gap-2 px-4 py-2 bg-[#A3C644] hover:bg-[#92B33D] text-white rounded-xl text-sm font-semibold transition-all"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            Excel
          </button>
        </div>

        {tab === 'terapeuta' && (
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Terapeuta</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Sesiones</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">% del total</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Pacientes</th>
                <th className="px-6 py-3 pr-6 text-xs font-semibold text-gray-500 uppercase">Distribución</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {datos.sesiones_por_terapeuta.map((t, i) => (
                <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-400 font-medium">{i + 1}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{t.nombre}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-lg font-bold text-gray-900">{t.total_sesiones}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                      {t.porcentaje}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700">{t.total_pacientes}</td>
                  <td className="px-6 py-4 pr-6">
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-[#7B1FA2] h-2 rounded-full transition-all"
                        style={{ width: `${t.porcentaje}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 border-t-2 border-gray-200">
                <td className="px-6 py-4" colSpan={2}><span className="text-sm font-bold text-gray-900">TOTAL</span></td>
                <td className="px-6 py-4 text-center"><span className="text-sm font-bold text-gray-900">{datos.resumen.total_sesiones}</span></td>
                <td className="px-6 py-4 text-center"><span className="text-sm font-bold text-gray-900">100%</span></td>
                <td className="px-6 py-4 text-center"><span className="text-sm font-bold text-gray-900">{datos.resumen.total_pacientes}</span></td>
                <td />
              </tr>
            </tfoot>
          </table>
        )}

        {tab === 'paciente' && (
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Paciente</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Sesiones</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Terapeuta Principal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {datos.sesiones_por_paciente.map((p, i) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-400">{i + 1}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{p.nombre}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-700">
                      {p.total_sesiones}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{p.terapeuta_principal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'servicio' && (
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Servicio</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Sesiones</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">% del total</th>
                <th className="px-6 py-3 pr-6 text-xs font-semibold text-gray-500 uppercase">Distribución</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(datos.sesiones_por_servicio || []).map((s, i) => (
                <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-400">{i + 1}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{s.nombre}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-lg font-bold text-gray-900">{s.total_sesiones}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                      {s.porcentaje}%
                    </span>
                  </td>
                  <td className="px-6 py-4 pr-6">
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${s.porcentaje}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────
   MODO 2 — POR TERAPEUTA (filtra por 1 terapeuta)
────────────────────────────────────────────────────────── */
const VistaTerapeuta = ({ datos, terapeutaNombre, fechaDesde, fechaHasta }) => {
  const exportar = () => {
    const rows = datos.sesiones_por_paciente.map(p => ({
      Paciente: p.nombre,
      'Total Sesiones': p.total_sesiones,
      Terapeuta: terapeutaNombre,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pacientes');
    XLSX.writeFile(wb, `Sesiones_${terapeutaNombre}_${fechaDesde}_${fechaHasta}.xlsx`);
  };

  return (
    <div>
      {/* KPIs del terapeuta */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard icon={CalendarIcon} value={datos.resumen.total_sesiones} label="Sesiones del terapeuta" color="bg-purple-50 text-purple-600" />
        <StatCard icon={UserGroupIcon} value={datos.resumen.total_pacientes} label="Pacientes atendidos" color="bg-green-50 text-green-600" />
        <StatCard icon={ArrowTrendingUpIcon} value={datos.resumen.promedio_por_dia} label="Sesiones / día" color="bg-orange-50 text-orange-600" />
      </div>

      {/* Tabla de pacientes del terapeuta */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Pacientes de {terapeutaNombre}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{fechaDesde} → {fechaHasta}</p>
          </div>
          <button
            onClick={exportar}
            className="flex items-center gap-2 px-4 py-2 bg-[#A3C644] hover:bg-[#92B33D] text-white rounded-xl text-sm font-semibold transition-all"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            Excel
          </button>
        </div>
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Paciente</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Sesiones</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">% del total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {datos.sesiones_por_paciente.map((p, i) => {
              const total = datos.resumen.total_sesiones || 1;
              const pct = ((p.total_sesiones / total) * 100).toFixed(1);
              return (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-400">{i + 1}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{p.nombre}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex px-3 py-1 rounded-full text-sm font-bold bg-purple-100 text-purple-700">
                      {p.total_sesiones}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm text-gray-600 font-medium">{pct}%</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────
   MODO 3 — POR PACIENTE (ficha completa de 1 paciente)
────────────────────────────────────────────────────────── */
const VistaPaciente = ({ datos, pacienteNombre, fechaDesde, fechaHasta }) => {
  const exportar = () => {
    const rows = datos.sesiones_por_terapeuta.map(t => ({
      Terapeuta: t.nombre,
      'Sesiones con este paciente': t.total_sesiones,
      '% del total del paciente': `${t.porcentaje}%`,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Paciente');
    XLSX.writeFile(wb, `Sesiones_Paciente_${pacienteNombre}_${fechaDesde}_${fechaHasta}.xlsx`);
  };

  const terapeutaPrincipal = datos.sesiones_por_terapeuta[0];

  // Iniciales del paciente para el avatar
  const iniciales = pacienteNombre
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();

  return (
    <div>
      {/* ── Ficha del paciente — diseño formal con borde izquierdo de acento ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-6 overflow-hidden">

        {/* Cabecera: avatar + nombre + periodo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-4">
            {/* Avatar con iniciales */}
            <div className="w-12 h-12 rounded-xl bg-[#7B1FA2] flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm tracking-wide">{iniciales}</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">{pacienteNombre}</h2>
              <div className="flex items-center gap-2 mt-1">
                <CalendarIcon className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-500">
                  {fechaDesde} → {fechaHasta}
                  <span className="ml-1.5 text-gray-400">· {datos.resumen.rango_fechas?.dias || '—'} días</span>
                </span>
              </div>
            </div>
          </div>
          {/* Badge terapeuta principal */}
          {terapeutaPrincipal && (
            <div className="hidden md:flex items-center gap-2 bg-purple-50 border border-purple-100 rounded-xl px-4 py-2.5">
              <UserIcon className="w-4 h-4 text-[#7B1FA2]" />
              <div className="text-right">
                <div className="text-xs text-gray-500 leading-none">Terapeuta principal</div>
                <div className="text-sm font-bold text-gray-900 mt-0.5">{terapeutaPrincipal.nombre}</div>
              </div>
              <span className="ml-2 bg-[#7B1FA2] text-white text-xs font-bold px-2 py-1 rounded-lg">
                {terapeutaPrincipal.total_sesiones} ses.
              </span>
            </div>
          )}
        </div>

        {/* KPIs en fila con separadores */}
        <div className="grid grid-cols-3 divide-x divide-gray-100">
          <div className="flex items-center gap-3 px-6 py-5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
              <CalendarIcon className="w-5 h-5 text-[#7B1FA2]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 leading-none">{datos.resumen.total_sesiones}</div>
              <div className="text-xs text-gray-500 mt-1">Sesiones totales</div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-6 py-5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <UserGroupIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 leading-none">{datos.resumen.total_terapeutas}</div>
              <div className="text-xs text-gray-500 mt-1">Terapeutas distintos</div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-6 py-5">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
              <ArrowTrendingUpIcon className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 leading-none">{datos.resumen.promedio_por_dia}</div>
              <div className="text-xs text-gray-500 mt-1">Sesiones por día</div>
            </div>
          </div>
        </div>

        {/* Terapeuta principal — versión móvil */}
        {terapeutaPrincipal && (
          <div className="md:hidden flex items-center gap-3 px-6 py-4 bg-purple-50 border-t border-purple-100">
            <UserIcon className="w-4 h-4 text-[#7B1FA2] flex-shrink-0" />
            <span className="text-xs text-gray-600">Terapeuta principal:</span>
            <span className="text-xs font-bold text-gray-900">{terapeutaPrincipal.nombre}</span>
            <span className="ml-auto bg-[#7B1FA2] text-white text-xs font-bold px-2 py-0.5 rounded-lg">
              {terapeutaPrincipal.total_sesiones} ses.
            </span>
          </div>
        )}
      </div>

      {/* Desglose por terapeuta */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900">Sesiones por terapeuta</h3>
          <button
            onClick={exportar}
            className="flex items-center gap-2 px-4 py-2 bg-[#A3C644] hover:bg-[#92B33D] text-white rounded-xl text-sm font-semibold transition-all"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            Excel
          </button>
        </div>
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Terapeuta</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Sesiones</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">% del paciente</th>
              <th className="px-6 py-3 pr-6 text-xs font-semibold text-gray-500 uppercase">Distribución</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {datos.sesiones_por_terapeuta.map((t, i) => (
              <tr key={t.id} className={`hover:bg-gray-50/50 transition-colors ${i === 0 ? 'bg-purple-50/30' : ''}`}>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                  {t.nombre}
                  {i === 0 && (
                    <span className="ml-2 text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-medium">
                      Principal
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-lg font-bold text-gray-900">{t.total_sesiones}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                    {t.porcentaje}%
                  </span>
                </td>
                <td className="px-6 py-4 pr-6">
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-[#7B1FA2] h-2 rounded-full"
                      style={{ width: `${t.porcentaje}%` }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────
   COMPONENTE PRINCIPAL
────────────────────────────────────────────────────────── */
const SesionesPage = () => {
  // ── MODO: 'general' | 'terapeuta' | 'paciente'
  const [modo, setModo] = useState('general');

  // ── Rango de fechas
  const [fechaDesde, setFechaDesde] = useState(fmt(primerDiaMes));
  const [fechaHasta, setFechaHasta] = useState(fmt(ultimoDiaMes));

  // ── Selección de terapeuta
  const [terapeutas, setTerapeutas] = useState([]);
  const [terapeutaId, setTerapeutaId] = useState('');
  const [terapeutaNombre, setTerapeutaNombre] = useState('');

  // ── Búsqueda de paciente
  const [searchPaciente, setSearchPaciente] = useState('');
  const [pacientesEncontrados, setPacientesEncontrados] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);

  // ── Resultado
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Cargar terapeutas
  useEffect(() => {
    obtenerTerapeutas()
      .then(setTerapeutas)
      .catch(() => {});
  }, []);

  // ── Búsqueda con debounce
  useEffect(() => {
    const t = setTimeout(async () => {
      if (searchPaciente.trim().length >= 2) {
        try {
          const res = await buscarPacientes(searchPaciente);
          setPacientesEncontrados(res);
          setShowDropdown(true);
        } catch {
          setPacientesEncontrados([]);
        }
      } else {
        setPacientesEncontrados([]);
        setShowDropdown(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [searchPaciente]);

  // ── Cambio de modo → limpiar selecciones anteriores
  const cambiarModo = (nuevoModo) => {
    setModo(nuevoModo);
    setDatos(null);
    setError('');
    if (nuevoModo !== 'terapeuta') { setTerapeutaId(''); setTerapeutaNombre(''); }
    if (nuevoModo !== 'paciente') { setPacienteSeleccionado(null); setSearchPaciente(''); }
  };

  // ── Consultar
  const consultar = async () => {
    if (!fechaDesde || !fechaHasta) { setError('Selecciona un rango de fechas'); return; }
    if (modo === 'terapeuta' && !terapeutaId) { setError('Selecciona un terapeuta'); return; }
    if (modo === 'paciente' && !pacienteSeleccionado) { setError('Selecciona un paciente'); return; }

    setError('');
    setLoading(true);
    try {
      const data = await obtenerEstadisticasSesiones(
        fechaDesde,
        fechaHasta,
        modo === 'terapeuta' ? parseInt(terapeutaId) : null,
        modo === 'paciente' ? pacienteSeleccionado.id : null
      );
      setDatos(data);
    } catch {
      setError('Error al cargar estadísticas. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // ── Auto-consulta al montar
  useEffect(() => { consultar(); }, []);

  // ── Render de controles según modo
  const renderControlesModo = () => {
    if (modo === 'terapeuta') {
      return (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">¿Qué terapeuta?</label>
          <select
            value={terapeutaId}
            onChange={(e) => {
              setTerapeutaId(e.target.value);
              const t = terapeutas.find(t => String(t.id) === e.target.value);
              setTerapeutaNombre(t ? `${t.nombres} ${t.apellidos}` : '');
            }}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] transition-all appearance-none"
          >
            <option value="">— Selecciona un terapeuta —</option>
            {terapeutas.map(t => (
              <option key={t.id} value={t.id}>{t.nombres} {t.apellidos}</option>
            ))}
          </select>
        </div>
      );
    }

    if (modo === 'paciente') {
      return (
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-700 mb-2">¿Qué paciente?</label>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchPaciente}
              onChange={(e) => {
                setSearchPaciente(e.target.value);
                if (pacienteSeleccionado) setPacienteSeleccionado(null);
              }}
              onFocus={() => pacientesEncontrados.length > 0 && setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              placeholder="Buscar por nombre o DNI..."
              className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] transition-all"
            />
            {pacienteSeleccionado && (
              <button
                onClick={() => { setPacienteSeleccionado(null); setSearchPaciente(''); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>
          {pacienteSeleccionado && (
            <div className="mt-1.5 flex items-center gap-2 text-xs text-green-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
              Seleccionado: {pacienteSeleccionado.nombre_completo}
            </div>
          )}
          {showDropdown && pacientesEncontrados.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-56 overflow-y-auto">
              {pacientesEncontrados.map(p => (
                <div
                  key={p.id}
                  onMouseDown={(e) => { e.preventDefault(); setPacienteSeleccionado(p); setSearchPaciente(p.nombre_completo); setShowDropdown(false); }}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 border-b last:border-0 cursor-pointer"
                >
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{p.nombre_completo}</div>
                    <div className="text-xs text-gray-400">DNI: {p.numero_documento}</div>
                  </div>
                  <UserIcon className="w-4 h-4 text-gray-300" />
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return null; // modo general — no necesita filtro extra
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Sesiones</h1>
          <p className="text-gray-500 mt-1">Estadísticas y métricas de citas agendadas</p>
        </div>

        {/* Panel de filtros */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">

          {/* PASO 1: Elegir qué quiero ver */}
          <div className="mb-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">¿Qué quieres ver?</p>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'general',    Icon: ChartBarIcon,   label: 'Vista General',  desc: 'Todos los terapeutas y pacientes' },
                { key: 'terapeuta',  Icon: UserIcon,        label: 'Por Terapeuta',  desc: 'Selecciona un terapeuta y ve sus pacientes' },
                { key: 'paciente',   Icon: UserGroupIcon,   label: 'Por Paciente',   desc: 'Busca un paciente y ve con quién tuvo sesiones' },
              ].map(({ key, Icon, label, desc }) => (
                <button
                  key={key}
                  onClick={() => cambiarModo(key)}
                  className={`flex items-start gap-3 px-5 py-3.5 rounded-xl text-sm font-semibold border-2 transition-all text-left ${
                    modo === key
                      ? 'border-[#7B1FA2] bg-[#7B1FA2]/5 text-[#7B1FA2]'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${modo === key ? 'text-[#7B1FA2]' : 'text-gray-400'}`} />
                  <div>
                    <div>{label}</div>
                    <div className={`text-xs font-normal mt-0.5 ${modo === key ? 'text-purple-400' : 'text-gray-400'}`}>{desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* PASO 2: Rango de fechas + filtro según modo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Desde</label>
              <input
                type="date"
                value={fechaDesde}
                onChange={e => setFechaDesde(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Hasta</label>
              <input
                type="date"
                value={fechaHasta}
                onChange={e => setFechaHasta(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] transition-all"
              />
            </div>

            {/* Control específico del modo (ocupa 1 col o 0) */}
            {modo !== 'general' ? (
              <div>{renderControlesModo()}</div>
            ) : (
              <div /> /* spacer */
            )}

            {/* Botón consultar */}
            <div className="flex gap-2">
              <button
                onClick={consultar}
                disabled={loading}
                className="flex-1 bg-[#7B1FA2] hover:bg-[#6A1B9A] text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all text-sm font-bold shadow-sm"
              >
                {loading
                  ? <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  : <ChartBarIcon className="w-5 h-5" />
                }
                Consultar
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-3 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-xl border border-red-100">
              {error}
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="flex flex-col items-center gap-3">
              <ArrowPathIcon className="w-10 h-10 animate-spin text-[#7B1FA2]" />
              <span className="text-sm text-gray-500">Cargando estadísticas...</span>
            </div>
          </div>
        )}

        {/* Resultados */}
        {!loading && datos && (
          <>
            {modo === 'general' && (
              <VistaGeneral datos={datos} fechaDesde={fechaDesde} fechaHasta={fechaHasta} />
            )}
            {modo === 'terapeuta' && (
              <VistaTerapeuta datos={datos} terapeutaNombre={terapeutaNombre} fechaDesde={fechaDesde} fechaHasta={fechaHasta} />
            )}
            {modo === 'paciente' && (
              <VistaPaciente datos={datos} pacienteNombre={pacienteSeleccionado?.nombre_completo || ''} fechaDesde={fechaDesde} fechaHasta={fechaHasta} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SesionesPage;