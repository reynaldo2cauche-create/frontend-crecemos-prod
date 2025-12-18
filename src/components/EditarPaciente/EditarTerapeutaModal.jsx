import React, { useState, useEffect } from 'react';
import { X, UserCheck, Loader2, Briefcase, User, AlertCircle } from 'lucide-react';
import { ROLES } from '../../constants/roles';
import { getTrabajadoresByServicio } from '../../services/trabajadorServicioService';

const EditarTerapeutaModal = ({ open, onClose, servicio, nuevoTerapeuta, setNuevoTerapeuta, terapeutas, onGuardar }) => {
  const [saving, setSaving] = useState(false);
  const [terapeutasFiltrados, setTerapeutasFiltrados] = useState([]);
  const [loadingTerapeutas, setLoadingTerapeutas] = useState(false);
  const [terapeutaActual, setTerapeutaActual] = useState(null);

  // Cargar terapeutas filtrados cuando se abre el modal
  useEffect(() => {
    const cargarTerapeutasFiltrados = async () => {
      if (open && servicio?.servicio?.id) {
        setLoadingTerapeutas(true);
        try {
          const trabajadoresDelServicio = await getTrabajadoresByServicio(servicio.servicio.id);
          const terapeutasDelServicio = trabajadoresDelServicio.filter(
            t => t.estado === true && t.rol?.id === ROLES.TERAPEUTA
          );
          
          // Guardar terapeuta actual
          const actual = servicio?.asignaciones?.[0]?.terapeuta;
          setTerapeutaActual(actual);
          
          // Si hay terapeuta actual y no está en la lista, agregarlo
          if (actual && !terapeutasDelServicio.some(t => t.id === actual.id)) {
            terapeutasDelServicio.push(actual);
          }
          
          setTerapeutasFiltrados(terapeutasDelServicio);
          
          // Si no hay nuevoTerapeuta seleccionado, establecer el actual como predeterminado
          if (!nuevoTerapeuta && actual) {
            setNuevoTerapeuta(String(actual.id));
          }
        } catch (error) {
          console.error('Error al cargar terapeutas del servicio:', error);
          const todosLosTerapeutas = terapeutas.filter(t => t.estado === true && t.rol?.id === ROLES.TERAPEUTA);
          setTerapeutasFiltrados(todosLosTerapeutas);
          
          const actual = servicio?.asignaciones?.[0]?.terapeuta;
          setTerapeutaActual(actual);
          
          if (!nuevoTerapeuta && actual) {
            setNuevoTerapeuta(String(actual.id));
          }
        } finally {
          setLoadingTerapeutas(false);
        }
      }
    };

    cargarTerapeutasFiltrados();
  }, [open, servicio, terapeutas]);

  const handleGuardar = async () => {
    setSaving(true);
    try {
      await onGuardar();
    } finally {
      setSaving(false);
    }
  };

  // Si no está abierto, no renderizar nada
  if (!open) {
    return null;
  }

  return (
    <>
      {/* OVERLAY */}
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* MODAL */}
        <div 
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'relative',
            backgroundColor: 'white',
            borderRadius: '1rem',
            width: '90%',
            maxWidth: '32rem',
            maxHeight: '90vh',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            zIndex: 100000
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.5rem',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: '#7B1FA2'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                padding: '0.5rem',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '0.75rem'
              }}>
                <UserCheck style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', margin: 0 }}>
                Editar Terapeuta
              </h2>
            </div>
            <button
              onClick={onClose}
              style={{
                padding: '0.5rem',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
            </button>
          </div>

          {/* Content */}
          <div style={{ 
            padding: '1.5rem', 
            maxHeight: 'calc(90vh - 140px)',
            overflowY: 'auto'
          }}>
            {/* Servicio (readonly) */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                <Briefcase style={{ width: '1rem', height: '1rem' }} />
                Servicio
              </label>
              <div style={{
                padding: '0.625rem 1rem',
                backgroundColor: '#f9fafb',
                border: '2px solid #e5e7eb',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
                color: '#374151',
                fontWeight: 500
              }}>
                {servicio?.servicio?.nombre || 'Sin nombre'}
              </div>
              <p style={{
                fontSize: '0.75rem',
                color: '#6b7280',
                marginTop: '0.375rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.375rem',
                margin: '0.375rem 0 0 0'
              }}>
                <AlertCircle style={{ width: '0.875rem', height: '0.875rem', marginTop: '0.125rem', flexShrink: 0 }} />
                El servicio no se puede cambiar, solo el terapeuta asignado
              </p>
            </div>

            {/* Terapeuta actual (si existe) */}
            {terapeutaActual && (
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  <User style={{ width: '1rem', height: '1rem' }} />
                  Terapeuta Actual
                </label>
                <div style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#f3e8ff',
                  border: '2px solid #d8b4fe',
                  borderRadius: '0.75rem'
                }}>
                  <p style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#111827',
                    margin: 0
                  }}>
                    {terapeutaActual.nombres} {terapeutaActual.apellidos}
                  </p>
                  {terapeutaActual.especialidad && (
                    <p style={{
                      fontSize: '0.75rem',
                      color: '#4b5563',
                      marginTop: '0.25rem',
                      margin: '0.25rem 0 0 0'
                    }}>
                      {terapeutaActual.especialidad.nombre}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Terapeuta Select */}
            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                <User style={{ width: '1rem', height: '1rem' }} />
                Terapeuta *
                {loadingTerapeutas && (
                  <Loader2 style={{ width: '1rem', height: '1rem', color: '#7B1FA2' }} className="animate-spin" />
                )}
              </label>
              <select
                value={nuevoTerapeuta || ""}
                onChange={(e) => setNuevoTerapeuta(e.target.value)}
                disabled={loadingTerapeutas}
                style={{
                  width: '100%',
                  padding: '0.625rem 1rem',
                  fontSize: '0.875rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  outline: 'none',
                  backgroundColor: loadingTerapeutas ? '#f9fafb' : 'white',
                  cursor: loadingTerapeutas ? 'not-allowed' : 'pointer'
                }}
              >
                <option value="">
                  {loadingTerapeutas 
                    ? 'Cargando terapeutas...' 
                    : terapeutasFiltrados.length === 0 
                      ? 'No hay terapeutas para este servicio'
                      : 'Selecciona un terapeuta'
                  }
                </option>
                {/* Mostrar todos los terapeutas sin filtros adicionales */}
                {terapeutasFiltrados.map(t => (
                  <option key={t.id} value={String(t.id)}>
                    {t.nombres} {t.apellidos}{t.especialidad ? ` — ${t.especialidad.nombre}` : ''}
                    {terapeutaActual && t.id === terapeutaActual.id ? ' (Actual)' : ''}
                  </option>
                ))}
              </select>
              {terapeutasFiltrados.length > 0 && !loadingTerapeutas && (
                <p style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  marginTop: '0.375rem',
                  margin: '0.375rem 0 0 0'
                }}>
                  {terapeutasFiltrados.length} terapeuta
                  {terapeutasFiltrados.length !== 1 ? 's' : ''} disponible
                  {terapeutasFiltrados.length !== 1 ? 's' : ''} para este servicio
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            padding: '1.5rem',
            borderTop: '1px solid #e5e7eb',
            backgroundColor: '#f9fafb'
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              style={{
                flex: 1,
                padding: '0.625rem 1rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#374151',
                backgroundColor: 'white',
                border: '2px solid #e5e7eb',
                borderRadius: '0.75rem',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.5 : 1
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleGuardar}
              disabled={!nuevoTerapeuta || saving}
              style={{
                flex: 1,
                padding: '0.625rem 1rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'white',
                backgroundColor: '#7B1FA2',
                border: 'none',
                borderRadius: '0.75rem',
                cursor: (!nuevoTerapeuta || saving) ? 'not-allowed' : 'pointer',
                opacity: (!nuevoTerapeuta || saving) ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {saving ? (
                <>
                  <Loader2 style={{ width: '1rem', height: '1rem' }} className="animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <UserCheck style={{ width: '1rem', height: '1rem' }} />
                  {terapeutaActual && nuevoTerapeuta === String(terapeutaActual.id) ? 'Mantener' : 'Asignar'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditarTerapeutaModal;