import { useState } from "react";
import * as Location from "expo-location";
import { registerRoute } from "../services/routeService";
import { getCedulaByUUID } from "../services/userDataService";
import { useAuth } from "../hooks/useAuth";

function haversineDistance(coord1: any, coord2: any) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371e3; // metros
  const dLat = toRad(coord2.latitude - coord1.latitude);
  const dLon = toRad(coord2.longitude - coord1.longitude);
  const lat1 = toRad(coord1.latitude);
  const lat2 = toRad(coord2.latitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function useRegisterRoute() {
  const { user } = useAuth();
  const [points, setPoints] = useState<
    { latitude: number; longitude: number }[]
  >([]);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Obtener ubicación actual
  const getLocation = async () => {
    setLoading(true);
    setError(null);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Permiso de ubicación denegado");
        setLoading(false);
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (e: any) {
      setError(e.message || "Error obteniendo ubicación");
    } finally {
      setLoading(false);
    }
  };

  // Manejar toques en el mapa
  const handleMapPress = (e: any) => {
    if (points.length >= 2) {
      setPoints([
        {
          latitude: e.nativeEvent.coordinate.latitude,
          longitude: e.nativeEvent.coordinate.longitude,
        },
      ]);
    } else {
      setPoints([
        ...points,
        {
          latitude: e.nativeEvent.coordinate.latitude,
          longitude: e.nativeEvent.coordinate.longitude,
        },
      ]);
    }
  };

  // Calcular distancia
  const distance =
    points.length === 2 ? haversineDistance(points[0], points[1]) : 0;

  // Guardar ruta
  const saveRoute = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      if (!user?.id) throw new Error("Usuario no autenticado");
      const id_usuario = await getCedulaByUUID(user.id);
      if (!id_usuario) throw new Error("No se pudo obtener id_usuario");
      if (points.length !== 2) throw new Error("Debes seleccionar dos puntos");
      const res = await registerRoute({
        punto_partida: points[0],
        punto_llegada: points[1],
        trayecto: points,
        longitud: distance,
        id_usuario,
      });
      if (!res.success) throw new Error(res.error || "Error registrando ruta");
      setSuccess(true);
      setPoints([]);
    } catch (e: any) {
      setError(e.message || "Error guardando ruta");
    } finally {
      setLoading(false);
    }
  };

  return {
    points,
    setPoints,
    currentLocation,
    getLocation,
    handleMapPress,
    distance,
    saveRoute,
    loading,
    error,
    success,
  };
}
