import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.46.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  // Manejo de CORS para solicitudes preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    })
  }

  try {
    // Crear cliente de Supabase con la clave de servicio
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase credentials')
    }

    console.log('Inicializando cliente Supabase...')
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)

    // Obtener vehículos con detalles
    console.log('Obteniendo vehículos...')
    const { data: vehicles, error: vehiclesError } = await supabaseClient
      .from('vehiculo')
      .select(`
        *,
        tipo:tipo(tipo)
      `)

    if (vehiclesError) {
      console.error('Error al obtener vehículos:', vehiclesError)
      throw vehiclesError
    }

    // Obtener rutas con detalles
    console.log('Obteniendo rutas...')
    const { data: routes, error: routesError } = await supabaseClient
      .from('ruta')
      .select('*')

    if (routesError) {
      console.error('Error al obtener rutas:', routesError)
      throw routesError
    }

    // Obtener pasajeros con detalles
    console.log('Obteniendo pasajeros...')
    const { data: travelers, error: travelersError } = await supabaseClient
      .from('pasajeros')
      .select(`
        *,
        usuario:usuario(*)
      `)

    if (travelersError) {
      console.error('Error al obtener pasajeros:', travelersError)
      throw travelersError
    }

    // Preparar estadísticas detalladas
    const stats = {
      // Estadísticas básicas
      availableVehicles: vehicles?.length || 0,
      activeRoutes: routes?.length || 0,
      connectedTravelers: travelers?.length || 0,

      // Estadísticas detalladas de vehículos
      vehiclesByType: vehicles?.reduce((acc, vehicle) => {
        const type = vehicle.tipo?.tipo || 'sin_tipo'
        acc[type] = (acc[type] || 0) + 1
        return acc
      }, {} as Record<string, number>),

      // Estadísticas de rutas
      routesByStatus: routes?.reduce((acc, route) => {
        const status = route.estado || 'sin_estado'
        acc[status] = (acc[status] || 0) + 1
        return acc
      }, {} as Record<string, number>),

      // Estadísticas de pasajeros
      travelersByInstitution: travelers?.reduce((acc, traveler) => {
        const institution = traveler.usuario?.institucion || 'sin_institucion'
        acc[institution] = (acc[institution] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }

    console.log('Estadísticas generadas:', stats)

    return new Response(
      JSON.stringify(stats),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error en la función:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.details || null
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
}) 