import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { getCedulaByUUID } from "../services/userDataService";
import { supabase } from "../lib/supabase";

export function useUserVehicles() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [disabledAdd, setDisabledAdd] = useState(false);
  const [checkingPending, setCheckingPending] = useState(true);
  const [search, setSearch] = useState("");

  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      loadVehicles();
    }
  }, [user?.id]);

  const loadVehicles = async () => {
    try {
      setLoadingVehicles(true);
      const id_usuario = await getCedulaByUUID(user!.id);
      if (!id_usuario) {
        console.error("No se pudo obtener el id_usuario");
        return;
      }

      // Obtener vehículos
      const { data: vehiculos, error: errorVehiculos } = await supabase
        .from("vehiculo")
        .select("*")
        .eq("id_usuario", id_usuario);

      if (errorVehiculos) {
        console.error("Error al cargar vehículos:", errorVehiculos);
        return;
      }

      // Contar vehículos pendientes
      const pendientes =
        vehiculos?.filter((v) => v.validacion === "pendiente").length || 0;
      setDisabledAdd(pendientes >= 3);
      setCheckingPending(false);

      // Filtrar vehículos según la búsqueda
      const vehiculosFiltrados = search
        ? vehiculos?.filter(
            (v) =>
              v.placa?.toLowerCase().includes(search.toLowerCase()) ||
              v.modelo.toString().includes(search) ||
              v.color.toLowerCase().includes(search.toLowerCase())
          )
        : vehiculos;

      setVehicles(vehiculosFiltrados || []);
    } catch (error) {
      console.error("Error en loadVehicles:", error);
    } finally {
      setLoadingVehicles(false);
    }
  };

  return {
    vehicles,
    loadingVehicles,
    disabledAdd,
    checkingPending,
    search,
    setSearch,
  };
}
