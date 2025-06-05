import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { getCedulaByUUID } from "../services/userDataService";
import {
  getFirstInstitutionAcceptedByUser,
  getInstitutionData,
} from "../services/institutionService";

export function useInstitutionProfile() {
  const { user } = useAuth();
  const [institution, setInstitution] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInstitution = async () => {
      setLoading(true);
      setError(null);
      if (!user?.id) {
        setError("No hay usuario autenticado");
        setLoading(false);
        return;
      }
      try {
        const id_usuario = await getCedulaByUUID(user.id);
        if (!id_usuario) throw new Error("No se pudo obtener el id_usuario");
        const id_institucion = await getFirstInstitutionAcceptedByUser(
          id_usuario
        );
        if (!id_institucion)
          throw new Error("No se encontró institución aceptada");
        const data = await getInstitutionData(id_institucion);
        setInstitution(data);
      } catch (e: any) {
        setError(e.message || "Error cargando institución");
      } finally {
        setLoading(false);
      }
    };
    fetchInstitution();
  }, [user]);

  return { institution, loading, error };
}
