const ENDPOINT =
  "https://ezuujivxstyuziclhvhp.supabase.co/functions/v1/get-routes-by-user";

export interface UserRoute {
  id_ruta: number;
  punto_partida_geojson: { type: string; coordinates: [number, number] };
  punto_llegada_geojson: { type: string; coordinates: [number, number] };
  trayecto_geojson: { type: string; coordinates: [number, number][] };
  longitud: number;
  nombre_partida: string | null;
  nombre_llegada: string | null;
}

export interface GetRoutesByUserResponse {
  success: boolean;
  data: UserRoute[];
  error?: string;
}

export async function getRoutesByUser({
  id_usuario,
  anonKey,
  accessToken,
}: {
  id_usuario: number;
  anonKey: string;
  accessToken: string;
}): Promise<GetRoutesByUserResponse> {
  console.log("[getRoutesByUser] called with:", {
    id_usuario,
    anonKey: !!anonKey,
    accessToken: !!accessToken,
  });
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: anonKey,
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ id_usuario }),
  });
  const json = await res.json();
  console.log("[getRoutesByUser] response:", json);
  return json;
}
