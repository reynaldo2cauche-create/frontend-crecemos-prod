import { useState, useEffect } from 'react';
import { getMotivosCita } from '../services/citaService';

export const useMotivosCita = () => {
  const [motivos, setMotivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMotivos = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMotivosCita();
        setMotivos(data);
      } catch (err) {
        console.error('Error al cargar motivos de cita:', err);
        setError('Error al cargar los motivos de cita');
      } finally {
        setLoading(false);
      }
    };

    fetchMotivos();
  }, []);

  return { motivos, loading, error };
};
