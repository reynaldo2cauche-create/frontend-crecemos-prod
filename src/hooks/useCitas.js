import { useEffect, useState } from 'react';
import * as citaService from '../services/citaService';

export const useCitas = () => {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const listarCitas = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const data = await citaService.listarCitas(params);
      setCitas(data || []);
      return data;
    } catch (err) {
      setError('Error al listar citas');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const crearCita = async (citaData) => {
    const nueva = await citaService.crearCita(citaData);
    setCitas(prev => [...prev, nueva]);
    return nueva;
  };

  const crearMultiplesCitas = async (citasData) => {
    try {
      const result = await citaService.crearMultiplesCitas(citasData);
      // El backend devuelve { message, total, citas: [] }
      const nuevas = Array.isArray(result) ? result : (result?.citas || []);
      setCitas(prev => [...prev, ...nuevas]);
      return { success: true, citas: nuevas };
    } catch (err) {
      // Capturar errores de conflicto (409) y otros errores
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Error al crear citas';
      const conflictos = err.response?.data?.conflictos || [];

      console.error('Error al crear citas:', {
        status: err.response?.status,
        message: errorMessage,
        conflictos: conflictos
      });

      throw {
        status: err.response?.status,
        message: errorMessage,
        conflictos: conflictos
      };
    }
  };

  const actualizarCita = async (id, citaData) => {
    try {
      const actualizada = await citaService.actualizarCita(id, citaData);
      setCitas(prev => prev.map(c => c.id === id ? actualizada : c));
      return actualizada;
    } catch (err) {
      // Capturar errores de validación (400), conflicto (409) y otros errores
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Error al actualizar cita';
      const conflictos = err.response?.data?.conflictos || [];

      console.error('Error al actualizar cita:', {
        status: err.response?.status,
        message: errorMessage,
        conflictos: conflictos
      });

      throw {
        status: err.response?.status,
        message: errorMessage,
        conflictos: conflictos
      };
    }
  };

  const eliminarCita = async (id, userId) => {
    const resultado = await citaService.eliminarCita(id, userId);
    setCitas(prev => prev.filter(c => c.id !== id));
    return resultado;
  };

  return { citas, loading, error, listarCitas, crearCita, crearMultiplesCitas, actualizarCita, eliminarCita };
};
