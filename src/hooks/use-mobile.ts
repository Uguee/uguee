import { useState, useEffect } from 'react';

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Función para verificar si es móvil
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px es el breakpoint común para móviles
    };

    // Verificar al montar el componente
    checkIsMobile();

    // Agregar listener para cambios de tamaño
    window.addEventListener('resize', checkIsMobile);

    // Limpiar listener al desmontar
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
}; 