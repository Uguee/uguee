const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Actualiza el estado de validación del conductor a 'pendiente' para un usuario e institución dados.
 * @param id_usuario número de usuario (cédula)
 * @param id_institucion número de institución
 * @returns mensaje de éxito o lanza error
 */
export async function updateDriverValidationStatus({
  id_usuario,
  id_institucion,
}: {
  id_usuario: number;
  id_institucion: number;
}): Promise<string> {
  const response = await fetch(
    "https://ezuujivxstyuziclhvhp.supabase.co/functions/v1/update-driver-validation-status",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify({ id_usuario, id_institucion }),
    }
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Error actualizando validación de conductor");
  }
  return data.message;
}
