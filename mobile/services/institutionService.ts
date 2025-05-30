const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export async function getInstitutions() {
  const response = await fetch(
    "https://ezuujivxstyuziclhvhp.supabase.co/functions/v1/get-institutions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error("Error al obtener las instituciones");
  }
  return await response.json();
}

export async function sendRegisterToInstitutionApplication({
  id_usuario,
  id_institucion,
  correo_institucional,
  codigo_institucional,
  direccion_de_residencia,
}: {
  id_usuario: number;
  id_institucion: number;
  correo_institucional: string;
  codigo_institucional: string | number;
  direccion_de_residencia: string;
}) {
  const response = await fetch(
    "https://ezuujivxstyuziclhvhp.supabase.co/functions/v1/send-register-to-institution-application",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify({
        id_usuario,
        id_institucion,
        correo_institucional,
        codigo_institucional,
        direccion_de_residencia,
      }),
    }
  );
  const data = await response.json();
  return data;
}

/*
export async function getInstitutionById(id: number) {
  const response = await fetch(
    `https://ezuujivxstyuziclhvhp.supabase.co/functions/v1/get-institution-by-id?id=${id}`
  );
}
*/
