import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { getCedulaByUUIDWithRetry } from "../services/userDataService";

export function useCedula() {
  const { user } = useAuth();
  const [cedula, setCedula] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      console.log("❌ [useCedula] No hay user.id, limpiando estado");
      setCedula(null);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchCedula = async () => {
      console.log(
        "🔄 [useCedula] Iniciando obtención de cédula para user.id:",
        user.id
      );
      setLoading(true);
      setError(null);

      try {
        console.log("📞 [useCedula] Llamando getCedulaByUUIDWithRetry...");
        const cedulaResult = await getCedulaByUUIDWithRetry(user.id);
        console.log(
          "✅ [useCedula] Resultado getCedulaByUUIDWithRetry:",
          cedulaResult
        );
        setCedula(cedulaResult);
      } catch (err: any) {
        console.error("❌ [useCedula] Error obteniendo cédula:", err);
        setError(err.message || "Error obteniendo cédula");
        setCedula(null);
      } finally {
        console.log(
          "🏁 [useCedula] Finalizando obtención de cédula, loading:",
          false
        );
        setLoading(false);
      }
    };

    fetchCedula();
  }, [user?.id]);

  const refetch = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const cedulaResult = await getCedulaByUUIDWithRetry(user.id);
      setCedula(cedulaResult);
    } catch (err: any) {
      setError(err.message || "Error obteniendo cédula");
      setCedula(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    cedula,
    loading,
    error,
    refetch,
  };
}
