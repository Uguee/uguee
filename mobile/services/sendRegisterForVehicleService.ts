export async function sendRegisterForVehicle(vehiculo: any, token?: string) {
  try {
    const response = await fetch(
      "https://ezuujivxstyuziclhvhp.supabase.co/functions/v1/send-register-for-vehicle",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ vehiculo }), // 👈 Importante: la clave debe ser "vehiculo"
      }
    );
    // Log de la respuesta HTTP
    console.log("Status:", response.status);
    console.log("Headers:", response.headers);
    let result;
    try {
      result = await response.json();
      console.log("Respuesta JSON:", result);
    } catch (jsonError) {
      console.log("Error parseando JSON:", jsonError);
      const text = await response.text();
      console.log("Respuesta como texto:", text);
      throw new Error("Respuesta no es JSON válido");
    }
    if (!result.success) throw new Error(result.error);
    return { success: true, data: result.data };
  } catch (error: any) {
    console.log("Error en sendRegisterForVehicle:", error);
    return { success: false, error: error.message || "Error desconocido" };
  }
}
