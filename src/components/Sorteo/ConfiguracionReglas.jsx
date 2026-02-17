import React, { useState, useEffect } from 'react';
import { Plus, X, Package, ShoppingCart } from 'lucide-react';
import { obtenerPaquetes, obtenerTiposCompra } from '../../services/sorteoService';

const ConfiguracionReglas = ({ reglas = [], onChange }) => {
  const [paquetes, setPaquetes] = useState([]);
  const [tiposCompra, setTiposCompra] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [paquetesData, tiposData] = await Promise.all([
        obtenerPaquetes(),
        obtenerTiposCompra()
      ]);
      setPaquetes(paquetesData);
      setTiposCompra(tiposData);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const agregarRegla = () => {
    onChange([
      ...reglas,
      {
        tipo_compra_id: '',
        paquete_id: null,
        opciones_por_unidad: 1
      }
    ]);
  };

  const eliminarRegla = (index) => {
    onChange(reglas.filter((_, i) => i !== index));
  };

  const actualizarRegla = (index, campo, valor) => {
    const nuevasReglas = [...reglas];
    nuevasReglas[index] = {
      ...nuevasReglas[index],
      [campo]: valor
    };
    onChange(nuevasReglas);
  };

  const getTipoCompraNombre = (id) => {
    const tipo = tiposCompra.find(t => t.id === parseInt(id));
    return tipo?.nombre || '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-[#7B1FA2] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Reglas de Elegibilidad</h3>
        <button
          onClick={agregarRegla}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          Agregar Regla
        </button>
      </div>

      {reglas.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
          <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-2">No hay reglas configuradas</p>
          <p className="text-sm text-gray-500">Agrega al menos una regla para definir quién participa en el sorteo</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reglas.map((regla, index) => (
            <div
              key={index}
              className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-[#7B1FA2] transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] rounded-xl flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>

                <div className="flex-1 space-y-4">
                  {/* Tipo de Compra */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tipo de Compra *
                    </label>
                    <select
                      value={regla.tipo_compra_id || ''}
                      onChange={(e) => {
                        actualizarRegla(index, 'tipo_compra_id', parseInt(e.target.value));
                        // Si cambia a INDIVIDUAL, resetear paquete_id
                        if (getTipoCompraNombre(e.target.value) === 'INDIVIDUAL') {
                          actualizarRegla(index, 'paquete_id', null);
                        }
                      }}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all"
                    >
                      <option value="">Seleccione tipo</option>
                      {tiposCompra.map(tipo => (
                        <option key={tipo.id} value={tipo.id}>
                          {tipo.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Paquete (solo si es tipo PAQUETE) */}
                    {getTipoCompraNombre(regla.tipo_compra_id) === 'PAQUETE' && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Paquete Específico (opcional)
                        </label>
                        <select
                          value={regla.paquete_id || ''}
                          onChange={(e) => actualizarRegla(index, 'paquete_id', e.target.value ? parseInt(e.target.value) : null)}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all"
                        >
                          <option value="">Todos los paquetes</option>
                          {paquetes.map(paq => (
                            <option key={paq.id} value={paq.id}>
                              {paq.nombre} ({paq.cantidadSesiones} sesiones)
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Opciones por Unidad */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Opciones por Unidad *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={regla.opciones_por_unidad}
                        onChange={(e) => actualizarRegla(index, 'opciones_por_unidad', Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C644] focus:border-transparent transition-all"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {getTipoCompraNombre(regla.tipo_compra_id) === 'INDIVIDUAL'
                          ? 'Individual: 1 entrada por paciente/mes sin importar cantidad de compras'
                          : 'Paquetes: opciones × cantidad de paquetes comprados'}
                      </p>
                    </div>
                  </div>

                  {/* Resumen de la regla */}
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3 border border-purple-200">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Resumen:</span> {' '}
                      {getTipoCompraNombre(regla.tipo_compra_id) === 'INDIVIDUAL' ? (
                        <>Pacientes con compras <strong>INDIVIDUALES</strong> tendrán <strong>{regla.opciones_por_unidad} opción{regla.opciones_por_unidad > 1 ? 'es' : ''}</strong> en total (agrupadas)</>
                      ) : getTipoCompraNombre(regla.tipo_compra_id) === 'PAQUETE' ? (
                        <>
                          Pacientes con {regla.paquete_id ? <>paquete <strong>{paquetes.find(p => p.id === regla.paquete_id)?.nombre}</strong></> : <strong>cualquier paquete</strong>} tendrán <strong>{regla.opciones_por_unidad} opción{regla.opciones_por_unidad > 1 ? 'es' : ''} por cada paquete</strong> comprado
                        </>
                      ) : (
                        'Seleccione un tipo de compra para ver el resumen'
                      )}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => eliminarRegla(index)}
                  className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title="Eliminar regla"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Información adicional */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Package className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">💡 Información importante</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• El sistema buscará compras realizadas dentro del período del sorteo</li>
              <li>• También incluirá compras de fin del mes anterior si se usaron sesiones en el mes del evento</li>
              <li>• Los pacientes que ya ganaron anteriormente NO participarán</li>
              <li>• Para Individual: aunque compre varias veces, solo cuenta como 1 entrada</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracionReglas;
