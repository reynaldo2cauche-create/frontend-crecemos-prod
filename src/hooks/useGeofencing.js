import { useState, useEffect } from 'react';
import { verificarPerimetro } from '../services/geolocationService';

// Estado global a nivel de módulo — persiste aunque el componente se desmonte/remonte
let _cache = null;       // último resultado conocido
let _intervalId = null;  // intervalo global único
let _listeners = [];     // componentes suscritos
let _verificando = false; // evita llamadas simultáneas

const notificar = () => {
  _listeners.forEach(fn => fn({ ..._cache }));
};

const verificar = async () => {
  if (_verificando) return;
  _verificando = true;
  try {
    const resultado = await verificarPerimetro();
    _cache = {
      cargando: false,
      dentroDelPerimetro: resultado.dentroDelPerimetro,
      distancia: resultado.distancia,
      ubicacion: resultado.ubicacion,
      error: null,
      ultimaVerificacion: new Date()
    };
  } catch (error) {
    // Si ya teníamos un resultado previo, mantener el último estado conocido
    if (_cache) {
      _cache = { ..._cache, ultimaVerificacion: new Date() };
    } else {
      _cache = {
        cargando: false,
        dentroDelPerimetro: true, // permitir acceso si no hay resultado previo
        distancia: null,
        ubicacion: null,
        error: error.message,
        ultimaVerificacion: new Date()
      };
    }
  } finally {
    _verificando = false;
    notificar();
  }
};

const iniciarMonitoreoGlobal = (intervalo) => {
  if (_intervalId) return; // ya corriendo
  verificar(); // primera vez
  _intervalId = setInterval(verificar, intervalo);
};

export const useGeofencing = (activar = true, intervalo = 60000) => {
  const [estado, setEstado] = useState(() =>
    _cache || {
      cargando: true,
      dentroDelPerimetro: true,
      distancia: null,
      ubicacion: null,
      error: null,
      ultimaVerificacion: null
    }
  );

  useEffect(() => {
    if (!activar) {
      setEstado(prev => ({ ...prev, cargando: false, dentroDelPerimetro: true }));
      return;
    }

    // Suscribir este componente a las actualizaciones globales
    _listeners.push(setEstado);

    // Si ya hay un resultado cacheado, aplicarlo de inmediato (sin loading)
    if (_cache) {
      setEstado({ ..._cache });
    }

    // Arrancar el intervalo global (solo arranca una vez aunque haya varios componentes)
    iniciarMonitoreoGlobal(intervalo);

    return () => {
      _listeners = _listeners.filter(fn => fn !== setEstado);
    };
  }, [activar, intervalo]);

  return { ...estado, verificar };
};

export const useGeofencingContinuo = useGeofencing;

export default useGeofencing;
