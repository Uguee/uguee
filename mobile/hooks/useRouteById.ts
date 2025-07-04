import { useState, useEffect } from "react";
import { getRouteById, RouteData } from "../services/routeService";

interface UseRouteByIdResult {
  route: RouteData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useRouteById(
  id_ruta: number | null,
  full_data: 0 | 1 = 1
): UseRouteByIdResult {
  const [route, setRoute] = useState<RouteData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoute = async () => {
    if (!id_ruta) {
      setRoute(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getRouteById(id_ruta, full_data);
      if (response.success && response.data) {
        setRoute(response.data);
      } else {
        setError(response.error || "Error al obtener la ruta");
        setRoute(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al obtener la ruta");
      setRoute(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoute();
  }, [id_ruta, full_data]);

  return {
    route,
    loading,
    error,
    refetch: fetchRoute,
  };
}
