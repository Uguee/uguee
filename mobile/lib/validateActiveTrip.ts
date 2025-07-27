// Centraliza la lógica de validación de viaje activo para escaneo de QR
// Recibe: userId (uuid), idViajeActual (opcional), getCedulaByUUID, getActivePassengerTrip, getCurrentToken
// Devuelve: { estado: 'no-activo' | 'mismo-viaje' | 'otro-viaje', mensaje: string }

export async function validateActiveTripQR({
  userId,
  idViajeActual,
  getCedulaByUUID,
  getActivePassengerTrip,
  getCurrentToken,
}: {
  userId: string;
  idViajeActual?: number | string;
  getCedulaByUUID: (uuid: string) => Promise<number | null>;
  getActivePassengerTrip: (cedula: number, jwt: string) => Promise<any>;
  getCurrentToken: () => string | null;
}): Promise<{
  estado: "no-activo" | "mismo-viaje" | "otro-viaje";
  mensaje: string;
}> {
  if (!userId) {
    return {
      estado: "no-activo",
      mensaje: "",
    };
  }
  const cedula = await getCedulaByUUID(userId);
  if (!cedula) {
    return {
      estado: "no-activo",
      mensaje: "",
    };
  }
  const jwt = getCurrentToken();
  if (!jwt) {
    return {
      estado: "no-activo",
      mensaje: "",
    };
  }
  const res = await getActivePassengerTrip(cedula, jwt);
  if (res.success && res.viajes && res.viajes.length > 0) {
    const viajeActivo = res.viajes[0];
    if (
      idViajeActual &&
      Number(viajeActivo.id_viaje) === Number(idViajeActual)
    ) {
      return {
        estado: "mismo-viaje",
        mensaje:
          "Ya eres pasajero de este viaje. Debes esperar a que el conductor inicie el viaje para poder participar.",
      };
    } else {
      return {
        estado: "otro-viaje",
        mensaje:
          "Actualmente ya formas parte de un viaje en curso o pendiente. No puedes ingresar a otro viaje hasta finalizar el actual.",
      };
    }
  }
  return {
    estado: "no-activo",
    mensaje: "",
  };
}
