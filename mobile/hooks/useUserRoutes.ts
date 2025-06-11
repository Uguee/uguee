import { useEffect, useState } from "react";
import { getUserDataByUUID } from "../services/userDataService";
import { getRoutesByUser, UserRoute } from "../services/getRoutesByUserService";
import { useAuth } from "./useAuth";
import Constants from "expo-constants";
import { AuthService } from "../services/authService";

export function useUserRoutes(refreshTrigger?: any) {
  const { user } = useAuth();
  const [routes, setRoutes] = useState<UserRoute[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRoutes() {
      // Obtener access_token desde AuthService
      // @ts-ignore
      const accessToken = AuthService?.currentToken;
      console.log(
        "[useUserRoutes] Triggered. user:",
        user?.id,
        "accessToken:",
        !!accessToken,
        "refreshTrigger:",
        refreshTrigger
      );
      const anonKey =
        process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
        Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY;
      if (!user?.id || !anonKey) return;
      setLoading(true);
      setError(null);
      try {
        // 1. Obtener id_usuario (cédula)
        const userData = await getUserDataByUUID(user.id);
        const id_usuario = userData?.id_usuario;
        console.log(
          "[useUserRoutes] userData:",
          userData,
          "id_usuario:",
          id_usuario
        );
        if (!id_usuario) throw new Error("No se encontró id_usuario");
        // 2. Llamar al service de rutas
        const tokenToUse = anonKey;
        const res = await getRoutesByUser({
          id_usuario,
          anonKey,
          accessToken: tokenToUse,
        });
        console.log("[useUserRoutes] getRoutesByUser response:", res);
        if (!res.success) throw new Error(res.error || "Error desconocido");
        setRoutes(res.data);
      } catch (e: any) {
        console.error("[useUserRoutes] ERROR:", e);
        setError(e.message || "Error desconocido");
      } finally {
        setLoading(false);
      }
    }
    fetchRoutes();
  }, [user?.id, refreshTrigger]);

  return { routes, loading, error };
}
