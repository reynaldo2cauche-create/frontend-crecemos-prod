import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Sube al inicio de la página cada vez que cambia la ruta (pathname).
// Evita quedar en la posición de scroll de la página anterior al navegar.
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
