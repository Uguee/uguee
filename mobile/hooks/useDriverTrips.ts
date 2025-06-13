import { useEffect, useState } from "react";
import { getDriverTrips } from "../services/tripServices";
import { getCedulaByUUID } from "../services/userDataService";
import { getCurrentToken } from "../services/authService";
import { useAuth } from "./useAuth";
import { getRouteById } from "../services/routeService";

// Función para filtrar y mostrar solo los datos relevantes de la dirección
function filtrarDireccion(direccion: string): string {
  if (!direccion) return "";
  const partes = direccion.split(",").map((p) => p.trim());
  // Palabras clave para identificar los campos relevantes
  const claves = [
    "colegio",
    "escuela",
    "universidad", // nombre propio
    "calle",
    "carrera",
    "avenida",
    "cll",
    "cra", // vías
    "villa",
    "barrio",
    "neighbourhood", // barrios
    "comuna", // comuna
    "cali", // ciudad
    "colombia", // país
  ];
  // Siempre incluye los primeros 1-2 elementos (nombre propio y calle)
  let resultado: string[] = [];
  if (partes.length > 0) resultado.push(partes[0]);
  if (partes.length > 1) resultado.push(partes[1]);
  // Busca y agrega los campos relevantes que no estén ya incluidos
  for (let i = 2; i < partes.length; i++) {
    const parte = partes[i].toLowerCase();
    if (
      claves.some((clave) => parte.includes(clave)) &&
      !resultado.includes(partes[i])
    ) {
      resultado.push(partes[i]);
    }
  }
  // Elimina duplicados y filtra frases no deseadas
  resultado = [...new Set(resultado)].filter(
    (p) =>
      !/comuna 8/i.test(p) && // quita Comuna 8 (insensible a mayúsculas)
      !/perímetro urbano/i.test(p) // quita Perímetro Urbano
  );
  return resultado.join(", ");
}

export function useDriverTrips() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrips = async () => {
      setLoading(true);
      setError(null);
      setTrips([]);
      try {
        if (!user?.id) throw new Error("No hay usuario autenticado");
        const id_usuario = await getCedulaByUUID(user.id);
        if (!id_usuario)
          throw new Error("No se pudo obtener la cédula del usuario");
        const token = getCurrentToken();
        if (!token) throw new Error("No se encontró un token JWT válido");
        const viajes = await getDriverTrips(id_usuario, token);
        // Enriquecer cada viaje con su objeto de ruta y nombre legible
        const viajesConRuta = await Promise.all(
          viajes.map(async (viaje: any) => {
            let ruta = null;
            let ruta_nombre = `${viaje.id_ruta}`;
            try {
              ruta = await getRouteById(viaje.id_ruta);
              if (ruta && ruta.nombre_partida && ruta.nombre_llegada) {
                ruta_nombre = `${filtrarDireccion(
                  ruta.nombre_partida
                )} ➔ ${filtrarDireccion(ruta.nombre_llegada)}`;
              }
            } catch (e) {
              // Si falla, deja el id_ruta como nombre
            }
            return { ...viaje, ruta, ruta_nombre };
          })
        );
        setTrips(viajesConRuta);
      } catch (err: any) {
        setError(err.message || "Error al obtener los viajes");
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchTrips();
  }, [user?.id]);

  return { trips, loading, error };
}
