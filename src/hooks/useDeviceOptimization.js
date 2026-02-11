import { useState, useEffect } from 'react';

/**
 * Hook para detectar tablets y aplicar optimizaciones
 * Detecta el tipo de dispositivo y retorna configuraciones optimizadas
 */
export const useDeviceOptimization = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    isTablet: false,
    isMobile: false,
    isDesktop: true,
    shouldOptimize: false,
    // Configuraciones optimizadas
    debounceTime: 0,
    cacheEnabled: true,
    imageQuality: 'high'
  });

  useEffect(() => {
    const detectDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const screenWidth = window.innerWidth;

      // Detectar tablets
      const isTablet = (
        /(ipad|tablet|playbook|silk)|(android(?!.*mobile))/i.test(userAgent) ||
        (screenWidth >= 768 && screenWidth <= 1024 && 'ontouchstart' in window)
      );

      // Detectar móviles
      const isMobile = (
        /mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent) &&
        screenWidth < 768
      );

      const isDesktop = !isTablet && !isMobile;

      // Determinar si debe aplicar optimizaciones agresivas
      const shouldOptimize = isTablet || isMobile;

      // Configuraciones optimizadas según dispositivo
      const config = {
        isTablet,
        isMobile,
        isDesktop,
        shouldOptimize,
        // Debounce más largo en tablets para reducir renders
        debounceTime: isTablet ? 300 : (isMobile ? 500 : 0),
        // Caché siempre habilitado
        cacheEnabled: true,
        // Calidad de imagen reducida en tablets/móviles
        imageQuality: shouldOptimize ? 'medium' : 'high',
        // Límite de elementos a renderizar simultáneamente
        virtualScrollThreshold: shouldOptimize ? 20 : 50,
        // Tiempo de animación reducido en tablets
        animationDuration: shouldOptimize ? 150 : 300
      };

      setDeviceInfo(config);

      // Log para debugging
      console.log('📱 Dispositivo detectado:', {
        tipo: isTablet ? 'Tablet' : (isMobile ? 'Móvil' : 'Desktop'),
        optimizaciones: shouldOptimize ? 'ACTIVADAS' : 'Desactivadas',
        ancho: screenWidth,
        userAgent: userAgent.substring(0, 50) + '...'
      });
    };

    detectDevice();

    // Re-detectar en resize (por si rotan el dispositivo)
    window.addEventListener('resize', detectDevice);
    return () => window.removeEventListener('resize', detectDevice);
  }, []);

  return deviceInfo;
};

/**
 * Hook para obtener configuración de performance según dispositivo
 */
export const usePerformanceConfig = () => {
  const device = useDeviceOptimization();

  return {
    // Configuraciones de renderizado
    enableVirtualization: device.shouldOptimize,
    maxRenderItems: device.shouldOptimize ? 50 : 200,

    // Configuraciones de caché
    cacheTimeout: device.shouldOptimize ? 5 * 60 * 1000 : 2 * 60 * 1000, // 5 min vs 2 min

    // Configuraciones de UI
    showLoadingSpinners: true,
    optimisticUpdates: device.shouldOptimize, // Más importante en tablets

    // Configuraciones de red
    retryAttempts: device.shouldOptimize ? 2 : 3,
    requestTimeout: device.shouldOptimize ? 10000 : 5000, // 10s vs 5s

    device
  };
};
