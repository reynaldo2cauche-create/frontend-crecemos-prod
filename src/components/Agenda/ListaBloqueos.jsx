import React, { useState, useEffect } from 'react';
import { Ban, Trash2, Calendar, Clock, User, AlertCircle, Plus, Filter } from 'lucide-react';
import { obtenerBloqueosActivos, eliminarBloqueo } from '../../services/bloqueoService';
import ModalBloquearHorario from './ModalBloquearHorario';
import DialogMotivo from '../DialogMotivo/DialogMotivo';

const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const ListaBloqueos = ({ terapeutas, userId }) => {
  const [bloqueos, setBloqueos] = useState([]);
  const [filteredBloqueos, setFilteredBloqueos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [filtroTerapeuta, setFiltroTerapeuta] = useState('');
  const [dialogMotivo, setDialogMotivo] = useState({ open: false, bloqueoId: null });

  useEffect(() => {
    cargarBloqueos();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [bloqueos, filtroTerapeuta]);

  const cargarBloqueos = async () => {
    try {
      setLoading(true);
      const data = await obtenerBloqueosActivos();
      setBloqueos(data);
    } catch (error) {
      console.error('Error al cargar bloqueos:', error);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let filtered = [...bloqueos];

    if (filtroTerapeuta) {
      filtered = filtered.filter(b => b.trabajadorId === parseInt(filtroTerapeuta));
    }

    setFilteredBloqueos(filtered);
  };

  const handleEliminarClick = (bloqueoId) => {
    setDialogMotivo({ open: true, bloqueoId });
  };

  const handleConfirmarEliminar = async (motivo) => {
    try {
      await eliminarBloqueo(dialogMotivo.bloqueoId, userId);
      setDialogMotivo({ open: false, bloqueoId: null });
      cargarBloqueos();
    } catch (error) {
      console.error('Error al eliminar bloqueo:', error);
      alert('Error al eliminar el bloqueo');
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatearHora = (hora) => {
    if (!hora) return null;
    return hora.substring(0, 5);
  };

  const obtenerDescripcionBloqueo = (bloqueo) => {
    if (bloqueo.tipoBloqueo?.codigo === 'PUNTUAL') {
      return `Puntual: ${formatearFecha(bloqueo.fechaInicio)}`;
    } else if (bloqueo.tipoBloqueo?.codigo === 'RECURRENTE') {
      const dia = DIAS_SEMANA[bloqueo.diaSemana];
      return `${dia}s (${formatearFecha(bloqueo.fechaInicio)} - ${formatearFecha(bloqueo.fechaFin)})`;
    }
    return '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <Ban className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Horarios Bloqueados</h2>
              <p className="text-sm text-gray-500">Gestión de bloqueos de horarios</p>
            </div>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all flex items-center gap-2 shadow-lg shadow-red-500/30"
          >
            <Plus className="w-4 h-4" />
            Nuevo Bloqueo
          </button>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Filter className="w-4 h-4" />
            <span className="font-medium">Filtrar:</span>
          </div>

          <select
            value={filtroTerapeuta}
            onChange={(e) => setFiltroTerapeuta(e.target.value)}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">Todos los terapeutas</option>
            {terapeutas?.filter(t => t.estado).map(t => (
              <option key={t.id} value={t.id}>
                {t.nombres} {t.apellidos}
              </option>
            ))}
          </select>

          <div className="ml-auto text-sm text-gray-600">
            <span className="font-semibold">{filteredBloqueos.length}</span> bloqueo{filteredBloqueos.length !== 1 ? 's' : ''} activo{filteredBloqueos.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Lista de Bloqueos */}
      <div className="space-y-4">
        {filteredBloqueos.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ban className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No hay bloqueos activos</p>
            <p className="text-sm text-gray-400 mt-1">Los bloqueos de horarios aparecerán aquí</p>
          </div>
        ) : (
          filteredBloqueos.map(bloqueo => (
            <div key={bloqueo.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  {/* Terapeuta */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold">
                      {bloqueo.trabajador?.nombres?.[0]}{bloqueo.trabajador?.apellidos?.[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {bloqueo.trabajador?.nombres} {bloqueo.trabajador?.apellidos}
                      </div>
                      <div className="text-sm text-gray-500">
                        {bloqueo.trabajador?.especialidad?.nombre || 'Sin especialidad'}
                      </div>
                    </div>
                  </div>

                  {/* Tipo y Fechas */}
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">{obtenerDescripcionBloqueo(bloqueo)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>
                        {bloqueo.todoElDia
                          ? 'Todo el día'
                          : `${formatearHora(bloqueo.horaInicio)} - ${formatearHora(bloqueo.horaFin)}`}
                      </span>
                    </div>
                  </div>

                  {/* Motivo */}
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Motivo</div>
                        <p className="text-sm text-gray-700">{bloqueo.motivo}</p>
                      </div>
                    </div>
                  </div>

                  {/* Info de Creación */}
                  <div className="text-xs text-gray-400">
                    Bloqueado por {bloqueo.userCrea?.nombres} {bloqueo.userCrea?.apellidos} el{' '}
                    {new Date(bloqueo.createdAt).toLocaleDateString('es-PE', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>

                {/* Acciones */}
                <button
                  onClick={() => handleEliminarClick(bloqueo.id)}
                  className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar bloqueo"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Bloqueo */}
      <ModalBloquearHorario
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        terapeutas={terapeutas}
        onBloqueoCreado={cargarBloqueos}
        userId={userId}
      />

      {/* Dialog de Motivo para Eliminar */}
      <DialogMotivo
        open={dialogMotivo.open}
        onClose={() => setDialogMotivo({ open: false, bloqueoId: null })}
        onConfirm={handleConfirmarEliminar}
        title="Eliminar Bloqueo"
        message="¿Está seguro que desea eliminar este bloqueo de horario? Ingrese el motivo de la eliminación:"
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default ListaBloqueos;
