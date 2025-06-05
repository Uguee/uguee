import { supabase } from "../lib/supabase";

interface DocumentoVehicular {
  placa_vehiculo: string;
  imagen: string;
  tipo: "SOAT" | "tecnomecanica" | "tarjeta_propiedad";
  fecha_vencimiento: string;
}

export const registrarDocumentoVehicular = async (
  documento: DocumentoVehicular
) => {
  try {
    const { data, error } = await supabase.functions.invoke(
      "register-vehicle-document",
      {
        body: documento,
      }
    );

    if (error) {
      console.error("Error al registrar documento vehicular:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error("Error en registrarDocumentoVehicular:", error);
    return {
      success: false,
      error:
        error.message || "Error desconocido al registrar documento vehicular",
    };
  }
};
