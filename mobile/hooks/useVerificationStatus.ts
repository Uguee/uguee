import { useEffect, useState } from "react";
import {
  getInstitutionValidationStatus,
  getConductorValidationStatus,
  InstitutionValidationStatus,
} from "../services/verificationService";
import { useAuth } from "./useAuth";
import { getCedulaByUUID } from "../services/userDataService";

interface VerificationStatus {
  institutionStatus: InstitutionValidationStatus | null;
  conductorStatus: InstitutionValidationStatus | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook que consulta, a partir de la cédula del usuario autenticado,
 * si está registrado a una institución y si es conductor.
 * Devuelve flags booleanos, loading y error.
 */
export function useVerificationStatus(): VerificationStatus {
  const { user } = useAuth();
  const [state, setState] = useState<VerificationStatus>({
    institutionStatus: null,
    conductorStatus: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    const fetchStatus = async () => {
      // Si no hay usuario, no hay nada que verificar
      if (!user) {
        setState({
          institutionStatus: null,
          conductorStatus: null,
          loading: false,
          error: null,
        });
        return;
      }

      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        const cedula = await getCedulaByUUID(user.id);
        console.log("[useVerificationStatus] cedula:", cedula);
        console.log("[useVerificationStatus] user.id (uuid):", user.id);

        // cedula es solo para logs, no bloquea el flujo

        const [institutionStatus, conductorStatus] = await Promise.all([
          getInstitutionValidationStatus(user.id),
          getConductorValidationStatus(user.id),
        ]);

        console.log(
          "[useVerificationStatus] institutionStatus:",
          institutionStatus
        );
        console.log(
          "[useVerificationStatus] conductorStatus:",
          conductorStatus
        );

        if (!cancelled) {
          setState({
            institutionStatus,
            conductorStatus,
            loading: false,
            error: null,
          });
        }
      } catch (err: any) {
        if (!cancelled) {
          setState({
            institutionStatus: null,
            conductorStatus: null,
            loading: false,
            error: err?.message || "Error desconocido",
          });
        }
      }
    };

    fetchStatus();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return state;
}
