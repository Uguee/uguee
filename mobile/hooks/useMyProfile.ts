import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  getUserDataByUUID,
  getCedulaByUUID,
} from "../services/userDataService";
import { getConductorValidationStatus } from "../services/verificationService";

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
      try {
        const data = await getUserDataByUUID(user.id);
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
