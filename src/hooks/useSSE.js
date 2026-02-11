import { useEffect, useRef, useState } from 'react';
import { API_BASE_URL } from '../services/api';

/**
 * Hook personalizado para manejar Server-Sent Events (SSE)
 *
 * ¿Qué es SSE?
 * Server-Sent Events es una tecnología que permite que el servidor envíe
 * actualizaciones automáticas al cliente a través de una conexión HTTP.
 *
 * Ventajas sobre WebSocket:
 * - Funciona en cPanel y hosting compartido
 * - Usa HTTP estándar (no requiere protocolo especial)
 * - Reconexión automática
 * - Más simple de implementar
 *
 * @param {string} url - URL del endpoint SSE
 * @param {object} options - Opciones de configuración
 * @returns {object} - { data, error, isConnected }
 */
export const useSSE = (url, options = {}) => {
  const {
    enabled = true,
    onMessage = null,
    onError = null,
    onOpen = null,
  } = options;

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef(null);

  // Usar refs para los callbacks para evitar recrear la conexión SSE
  const onMessageRef = useRef(onMessage);
  const onErrorRef = useRef(onError);
  const onOpenRef = useRef(onOpen);

  // Actualizar refs cuando cambien los callbacks
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    onOpenRef.current = onOpen;
  }, [onOpen]);

  useEffect(() => {
    if (!enabled) return;

    const token = localStorage.getItem('access_token');
    if (!token) {
      console.warn('No hay token de autenticación para SSE');
      return;
    }

    // Construir URL completa con el token como query parameter
    const fullUrl = `${API_BASE_URL}${url}?token=${token}`;

    console.log('🔌 Conectando a SSE:', fullUrl);

    // Crear conexión SSE
    const eventSource = new EventSource(fullUrl);
    eventSourceRef.current = eventSource;

    // Manejar conexión abierta
    eventSource.onopen = () => {
      console.log('✅ SSE conectado');
      setIsConnected(true);
      setError(null);
      if (onOpenRef.current) onOpenRef.current();
    };

    // Manejar mensajes
    eventSource.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        console.log('📨 SSE mensaje recibido:', parsedData);
        setData(parsedData);
        if (onMessageRef.current) onMessageRef.current(parsedData);
      } catch (err) {
        console.error('Error al parsear mensaje SSE:', err);
      }
    };

    // Manejar errores
    eventSource.onerror = (err) => {
      console.error('❌ SSE error:', err);
      setIsConnected(false);
      setError(err);
      if (onErrorRef.current) onErrorRef.current(err);

      // EventSource se reconecta automáticamente, pero cerramos si hay problemas persistentes
      if (eventSource.readyState === EventSource.CLOSED) {
        console.log('🔴 SSE cerrado, intentando reconectar...');
      }
    };

    // Cleanup al desmontar
    return () => {
      console.log('🔌 Cerrando conexión SSE');
      eventSource.close();
    };
  }, [url, enabled]);

  // Método para cerrar manualmente la conexión
  const close = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      setIsConnected(false);
    }
  };

  return { data, error, isConnected, close };
};

export default useSSE;
