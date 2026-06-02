import { useState, useEffect, useCallback } from 'react';
import * as pacienteService from '../services/pacienteService';

export const useBusquedaPacientes = (query, delay = 400) => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función para buscar pacientes
  const buscarPacientesLocal = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 2) {
      setPacientes([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await pacienteService.buscarPacientes(searchQuery);
      setPacientes(data || []);
    } catch (err) {
      console.error('Error al buscar pacientes:', err);
      setError('Error al buscar pacientes');
      setPacientes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      buscarPacientesLocal(query);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [query, delay, buscarPacientesLocal]);

  return {
    pacientes,
    loading,
    error
  };
};
