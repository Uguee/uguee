// Funciones para trabajar con PostGIS

/**
 * Convierte coordenadas [lat, lng] a formato POINT WKT para PostGIS
 */
export const coordsToPointWKT = (lat: number, lng: number): string => {
  return `POINT(${lng} ${lat})`;
};

/**
 * Convierte un array de coordenadas a formato LINESTRING WKT para PostGIS
 */
export const coordsToLineStringWKT = (coords: [number, number][]): string => {
  const points = coords.map(([lat, lng]) => `${lng} ${lat}`).join(", ");
  return `LINESTRING(${points})`;
};

/**
 * Calcula la distancia aproximada entre dos puntos en kilómetros
 * Usando la fórmula de Haversine
 */
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Calcula la longitud total de una ruta
 */
export const calculateRouteLength = (coords: [number, number][]): number => {
  if (coords.length < 2) return 0;

  let totalDistance = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    const [lat1, lng1] = coords[i];
    const [lat2, lng2] = coords[i + 1];
    totalDistance += calculateDistance(lat1, lng1, lat2, lng2);
  }

  return totalDistance;
};
