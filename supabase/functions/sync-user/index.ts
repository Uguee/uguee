
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.46.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Manejo de CORS para solicitudes preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Inicializar el cliente de Supabase con la clave de servicio para acceso administrativo
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { user, action } = await req.json();
    console.log(`Processing ${action} for user:`, user);

    if (!user || !user.id) {
      throw new Error("No se proporcionó información de usuario válida");
    }

    if (action === "register") {
      // Crear entrada en tabla usuario
      const { data: usuarioData, error: usuarioError } = await supabase
        .from("usuario")
        .insert({
          id: parseInt(user.id, 10), // Convertimos a entero si tu tabla usuario usa enteros
          nombre: `${user.firstName} ${user.lastName}`,
          contrasena: "autenticado-via-supabase" // Nota: las contraseñas reales son manejadas por Auth
        })
        .select();

      if (usuarioError) {
        console.error("Error al crear usuario:", usuarioError);
        throw usuarioError;
      }

      console.log("Usuario creado con éxito:", usuarioData);

      // Crear registro en tabla registro
      if (user.role) {
        const registroData = {
          id_usuario: parseInt(user.id, 10),
          id_institucion: user.institutionId || "default", // Usa un valor predeterminado si no hay ID de institución
          correo_institucional: user.institutionalEmail,
          codigo_de_estudiante: user.institutionalCode,
          celular: user.phoneNumber,
          direccion_de_residencia: user.address,
          es_conductor: user.role === "driver",
          es_pasajero: user.role === "student"
        };

        const { data: registro, error: registroError } = await supabase
          .from("registro")
          .insert(registroData)
          .select();

        if (registroError) {
          console.error("Error al crear registro:", registroError);
          throw registroError;
        }

        console.log("Registro creado con éxito:", registro);

        // Crear relación en tabla usuario_rol
        if (user.role) {
          let rolName;
          switch (user.role) {
            case "student":
              rolName = "estudiante";
              break;
            case "driver":
              rolName = "conductor";
              break;
            case "institution-admin":
              rolName = "admin_institucion";
              break;
            case "site-admin":
              rolName = "admin_sitio";
              break;
            default:
              rolName = "estudiante";
          }

          const { error: rolError } = await supabase
            .from("usuario_rol")
            .insert({
              id_usuario: parseInt(user.id, 10),
              id_rol: rolName
            });

          if (rolError) {
            console.error("Error al asignar rol:", rolError);
            throw rolError;
          }

          console.log(`Rol ${rolName} asignado al usuario`);
        }
      }

      return new Response(
        JSON.stringify({ success: true, message: "Usuario registrado exitosamente en todas las tablas" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    } else {
      throw new Error(`Acción no soportada: ${action}`);
    }
  } catch (error) {
    console.error("Error en la sincronización de usuario:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
