import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { getCedulaByUUID } from "../services/userDataService";
import { getFirstInstitutionAcceptedByUser } from "../services/institutionService";
import { getTripsByInstitution } from "../services/tripServices";

export function useUserInstitutionTrips() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [howTrips, setHowTrips] = useState(1); // 1 = Hoy por defecto

  useEffect(() => {
    const fetchTrips = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const cedula = await getCedulaByUUID(user.id);
        if (!cedula)
          throw new Error("No se pudo obtener la cédula del usuario");
        const id_institucion = await getFirstInstitutionAcceptedByUser(cedula);
        if (!id_institucion)
          throw new Error("No se encontró institución aceptada");
        const data = await getTripsByInstitution(id_institucion, howTrips);
        setTrips(data.viajes || []);
      } catch (e: any) {
        setError(e.message || "Error al obtener viajes");
        setTrips([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, [user, howTrips]);

  return { trips, loading, error, howTrips, setHowTrips };
}
