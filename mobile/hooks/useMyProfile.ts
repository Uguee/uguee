import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  getUserDataByUUID,
  getCedulaByUUID,
} from "../services/userDataService";
import { getConductorValidationStatus } from "../services/verificationService";
import { getCurrentToken } from "../services/authService";

export function useMyProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      if (!user?.id) {
        setError("No hay usuario autenticado");
        setLoading(false);
        return;
      }
      const token = getCurrentToken && getCurrentToken();
      if (!token) {
        setError(
          "No se encontró un token de sesión válido. Por favor, vuelve a iniciar sesión."
        );
        setLoading(false);
        return;
      }
      try {
        const data = await getUserDataByUUID(user.id);
        if (!data) {
          setError(
            "No se pudo obtener los datos del usuario. Puede que tu sesión haya expirado o el token sea inválido."
          );
          setLoading(false);
          return;
        }
        let esConductor = false;
        const status = await getConductorValidationStatus(user.id);
        esConductor = status === "validado";
        setProfile({ ...data, esConductor });
      } catch (e: any) {
        setError(e.message || "Error cargando perfil");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  return { profile, loading, error };
}
