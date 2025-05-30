import { serve } from 'https://deno.land/std@0.192.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  // Headers CORS para todas las respuestas
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL'), 
      Deno.env.get('SUPABASE_ANON_KEY'), 
      {
        global: {
          headers: {
            Authorization: req.headers.get('Authorization')
          }
        }
      }
    );

    const body = await req.json();
    const { 
      id_usuario, 
      id_institucion, 
      codigo_institucional, 
      correo_institucional, 
      direccion_de_residencia, 
      rol_institucional 
    } = body;

    // Log para debugging
    console.log('Datos recibidos:', {
      id_usuario,
      id_institucion,
      codigo_institucional,
      correo_institucional,
      direccion_de_residencia,
      rol_institucional
    });

    // Validar rol_institucional
    const rolesValidos = ['Otro', 'Estudiante', 'Profesor', 'Administrativo'];
    if (!rolesValidos.includes(rol_institucional)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Rol institucional inválido. Debe ser uno de: Otro, Estudiante, Profesor, Administrativo'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // Verificar que el usuario exista
    const { data: userData, error: userError } = await supabaseClient
      .from('usuario')
      .select('id_usuario')
      .eq('id_usuario', id_usuario)
      .maybeSingle();

    if (userError || !userData) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Usuario no encontrado'
      }), {
        status: 404,
        headers: corsHeaders
      });
    }

    // Verificar que la institución exista
    const { data: institutionData, error: institutionError } = await supabaseClient
      .from('institucion')
      .select('id_institucion')
      .eq('id_institucion', id_institucion)
      .maybeSingle();

    if (institutionError || !institutionData) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Institución no encontrada'
      }), {
        status: 404,
        headers: corsHeaders
      });
    }

    // Verificar que no exista ya un registro
    const { data: existing, error: checkError } = await supabaseClient
      .from('registro')
      .select('id_usuario')
      .eq('id_usuario', id_usuario)
      .eq('id_institucion', id_institucion);

    if (checkError) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Error verificando existencia previa'
      }), {
        status: 500,
        headers: corsHeaders
      });
    }

    if (existing && existing.length > 0) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Ya existe un registro para este usuario e institución'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // Insertar registro nuevo
    const { error: insertError } = await supabaseClient
      .from('registro')
      .insert([{
        id_usuario,
        id_institucion,
        codigo_institucional,
        correo_institucional,
        direccion_de_residencia,
        rol_institucional,
        validacion: 'pendiente',
        validacion_conductor: null
      }]);

    if (insertError) {
      console.error('Error insertando:', insertError);
      return new Response(JSON.stringify({
        success: false,
        message: 'Error insertando registro',
        debug: insertError.message
      }), {
        status: 500,
        headers: corsHeaders
      });
    }

    return new Response(JSON.stringify({
      success: true,
      data: {
        id_usuario,
        id_institucion
      }
    }), {
      headers: corsHeaders,
      status: 200
    });

  } catch (error) {
    console.error('Error general:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Error interno del servidor',
      debug: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
}); 