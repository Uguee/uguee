import { useState, useEffect } from "react";
import { getCedulaByUUID } from "../services/userDataService";
import {
  getPendingVehiclesByIdUsuario,
  getVehiclesByIdUsuario,
} from "../services/pendingVehiclesService";
import { useAuth } from "../hooks/useAuth";

export function useUserVehicles() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [disabledAdd, setDisabledAdd] = useState(true);
  const [checkingPending, setCheckingPending] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setCheckingPending(true);
      setLoadingVehicles(true);
      if (!user?.id) {
        setDisabledAdd(true);
        setCheckingPending(false);
        setVehicles([]);
        setLoadingVehicles(false);
        return;
      }
      const id_usuario = await getCedulaByUUID(user.id);
      if (!id_usuario) {
        setDisabledAdd(true);
        setCheckingPending(false);
        setVehicles([]);
        setLoadingVehicles(false);
        return;
      }
      const cantidad = await getPendingVehiclesByIdUsuario(id_usuario);
      setDisabledAdd(cantidad >= 3 ? true : false);
      setCheckingPending(false);
      // Traer vehículos reales
      const vehiculos = await getVehiclesByIdUsuario(id_usuario);
      setVehicles(vehiculos);
      setLoadingVehicles(false);
    };
    fetchData();
  }, [user]);

  const filtered = vehicles.filter(
    (v) =>
      (v.placa && v.placa.toLowerCase().includes(search.toLowerCase())) ||
      (v.color && v.color.toLowerCase().includes(search.toLowerCase())) ||
      (v.modelo &&
        String(v.modelo).toLowerCase().includes(search.toLowerCase()))
  );

  return {
    vehicles: filtered,
    loadingVehicles,
    disabledAdd,
    checkingPending,
    search,
    setSearch,
  };
}
