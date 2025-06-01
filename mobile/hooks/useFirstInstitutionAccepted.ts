import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { getCedulaByUUID } from "../services/userDataService";
import { getFirstInstitutionAcceptedByUser } from "../services/institutionService";

interface UseFirstInstitutionAcceptedResult {
  idInstitucion: number | null;
  loading: boolean;
  error: string | null;
}

export function useFirstInstitutionAccepted(): UseFirstInstitutionAcceptedResult {
  const { user } = useAuth();
  const [state, setState] = useState<UseFirstInstitutionAcceptedResult>({
    idInstitucion: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    async function fetchInstitution() {
      if (!user) {
        setState({ idInstitucion: null, loading: false, error: null });
        return;
      }
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const id_usuario = await getCedulaByUUID(user.id);
        if (!id_usuario) {
          setState({
            idInstitucion: null,
            loading: false,
            error: "No se pudo obtener el id_usuario del usuario.",
          });
          return;
        }
        const idInstitucion = await getFirstInstitutionAcceptedByUser(
          id_usuario
        );
        if (!cancelled) {
          setState({ idInstitucion, loading: false, error: null });
        }
      } catch (err: any) {
        if (!cancelled) {
          setState({
            idInstitucion: null,
            loading: false,
            error: err?.message || "Error desconocido",
          });
        }
      }
    }
    fetchInstitution();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return state;
}
