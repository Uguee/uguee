import { supabase } from '../integrations/supabase/client';

export async function testAllEdgeFunctions() {
  console.log('🔍 Probando todas las Edge Functions...');
  
  try {
    const { data, error } = await supabase.functions.invoke('admin-dashboard-stats');
    
    if (error) {
      console.error('❌ Error en Edge Function:', error);
      return { success: false, error };
    }
    
    console.log('✅ Edge Function respondió correctamente');
    console.log('📊 Datos recibidos:', data);
    
    // Diagnóstico detallado
    console.log('\n🔍 DIAGNÓSTICO DETALLADO:');
    diagnosticarDatos(data.data);
    
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error al probar Edge Functions:', error);
    return { success: false, error };
  }
}

function diagnosticarDatos(data: any) {
  console.log('\n📋 ANÁLISIS DE DATOS:');
  
  // Instituciones
  console.log('\n🏢 INSTITUCIONES:');
  console.log(`  Total registradas: ${data.instituciones?.total_registradas || 'undefined'}`);
  console.log(`  Activas: ${data.instituciones?.activas || 'undefined'}`);
  console.log(`  Pendientes: ${data.instituciones?.pendientes || 'undefined'}`);
  console.log(`  Rechazadas: ${data.instituciones?.rechazadas || 'undefined'}`);
  
  if (data.instituciones?.activas === 0 && data.instituciones?.total_registradas > 0) {
    console.warn('⚠️  PROBLEMA: Hay instituciones registradas pero ninguna activa');
  }
  
  // Usuarios
  console.log('\n👥 USUARIOS:');
  console.log(`  Total registrados: ${data.usuarios?.total_registrados || 'undefined'}`);
  console.log(`  Estudiantes: ${data.usuarios?.estudiantes || 'undefined'}`);
  console.log(`  Profesores: ${data.usuarios?.profesores || 'undefined'}`);
  console.log(`  Administrativos: ${data.usuarios?.administrativos || 'undefined'}`);
  console.log(`  Conductores: ${data.usuarios?.conductores || 'undefined'}`);
  
  const totalTipos = (data.usuarios?.estudiantes || 0) + (data.usuarios?.profesores || 0) + 
                     (data.usuarios?.administrativos || 0) + (data.usuarios?.conductores || 0);
  
  if (totalTipos !== data.usuarios?.total_registrados) {
    console.warn(`⚠️  PROBLEMA: Total de tipos (${totalTipos}) no coincide con total registrados (${data.usuarios?.total_registrados})`);
  }
  
  // Vehículos
  console.log('\n🚗 VEHÍCULOS:');
  console.log(`  Total registrados: ${data.vehiculos?.total_registrados || 'undefined'}`);
  console.log(`  Automóviles: ${data.vehiculos?.automoviles || 'undefined'}`);
  console.log(`  Motocicletas: ${data.vehiculos?.motocicletas || 'undefined'}`);
  console.log(`  Otros: ${data.vehiculos?.otros || 'undefined'}`);
  
  const totalVehiculos = (data.vehiculos?.automoviles || 0) + (data.vehiculos?.motocicletas || 0) + 
                         (data.vehiculos?.otros || 0);
  
  if (totalVehiculos !== data.vehiculos?.total_registrados) {
    console.warn(`⚠️  PROBLEMA: Total de tipos de vehículos (${totalVehiculos}) no coincide con total registrados (${data.vehiculos?.total_registrados})`);
  }
  
  if (data.vehiculos?.automoviles === 0 && data.vehiculos?.motocicletas === 0 && data.vehiculos?.otros === data.vehiculos?.total_registrados) {
    console.warn('⚠️  PROBLEMA: Todos los vehículos están clasificados como "otros" - revisar consulta de tipos');
  }
  
  // Actividad
  console.log('\n📈 ACTIVIDAD:');
  console.log(`  Usuarios activos hoy: ${data.actividad?.usuarios_activos_hoy || 'undefined'}`);
  console.log(`  Nuevos registros 7 días: ${data.actividad?.nuevos_registros_7_dias || 'undefined'}`);
  console.log(`  Documentos validados: ${data.actividad?.documentos_validados || 'undefined'}`);
  
  if (data.actividad?.usuarios_activos_hoy === 0) {
    console.warn('⚠️  PROBLEMA: Usuarios activos hoy es 0 - revisar consulta de actividad');
  }
  
  // Rutas y viajes
  console.log('\n🛣️ RUTAS Y VIAJES:');
  console.log(`  Rutas activas: ${data.rutas_y_viajes?.rutas_activas || 'undefined'}`);
  console.log(`  Viajes realizados: ${data.rutas_y_viajes?.viajes_realizados || 'undefined'}`);
  console.log(`  Viajes hoy: ${data.rutas_y_viajes?.viajes_hoy || 'undefined'}`);
  console.log(`  Promedio pasajeros: ${data.rutas_y_viajes?.promedio_pasajeros || 'undefined'}`);
  
  // Calidad
  console.log('\n⭐ CALIDAD:');
  console.log(`  Calificación promedio: ${data.calidad?.calificacion_promedio || 'undefined'}`);
  console.log(`  Total reseñas: ${data.calidad?.total_reseñas || 'undefined'}`);
  console.log(`  Reseñas este mes: ${data.calidad?.reseñas_este_mes || 'undefined'}`);
  
  // Resumen de problemas
  console.log('\n🚨 RESUMEN DE PROBLEMAS DETECTADOS:');
  
  const problemas = [];
  
  if (data.instituciones?.activas === 0 && data.instituciones?.total_registradas > 0) {
    problemas.push('- Instituciones: No hay activas pero sí registradas');
  }
  
  if (data.vehiculos?.automoviles === 0 && data.vehiculos?.motocicletas === 0) {
    problemas.push('- Vehículos: Todos clasificados como "otros" (problema de tipos)');
  }
  
  if (data.actividad?.usuarios_activos_hoy === 0) {
    problemas.push('- Actividad: Usuarios activos hoy es 0');
  }
  
  if (data.actividad?.nuevos_registros_7_dias === 0) {
    problemas.push('- Actividad: Nuevos registros 7 días es 0');
  }
  
  if (problemas.length === 0) {
    console.log('✅ No se detectaron problemas obvios en los datos');
  } else {
    problemas.forEach(problema => console.warn(problema));
  }
}

// Función para probar consultas específicas manualmente
export async function testSpecificQueries() {
  console.log('🔍 Probando consultas específicas en la base de datos...');
  
  try {
    // Consulta instituciones
    console.log('\n🏢 Consultando instituciones...');
    const { data: instituciones, error: errorInst } = await supabase
      .from('institucion')
      .select('*');
    
    if (errorInst) {
      console.error('❌ Error consultando instituciones:', errorInst);
    } else {
      console.log(`✅ Instituciones encontradas: ${instituciones?.length || 0}`);
      instituciones?.forEach(inst => {
        console.log(`  - ${inst.nombre_institucion} (Estado: ${inst.estado_validacion})`);
      });
    }
    
    // Consulta vehículos
    console.log('\n🚗 Consultando vehículos...');
    const { data: vehiculos, error: errorVeh } = await supabase
      .from('vehiculo')
      .select('*');
    
    if (errorVeh) {
      console.error('❌ Error consultando vehículos:', errorVeh);
    } else {
      console.log(`✅ Vehículos encontrados: ${vehiculos?.length || 0}`);
      const tiposCuenta = vehiculos?.reduce((acc, veh) => {
        acc[veh.tipo_vehiculo] = (acc[veh.tipo_vehiculo] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      console.log('  Tipos de vehículos:', tiposCuenta);
    }
    
    // Consulta usuarios
    console.log('\n👥 Consultando usuarios...');
    const { data: usuarios, error: errorUsuarios } = await supabase
      .from('usuario')
      .select('*');
    
    if (errorUsuarios) {
      console.error('❌ Error consultando usuarios:', errorUsuarios);
    } else {
      console.log(`✅ Usuarios encontrados: ${usuarios?.length || 0}`);
      const tiposUsuario = usuarios?.reduce((acc, user) => {
        acc[user.tipo_usuario] = (acc[user.tipo_usuario] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      console.log('  Tipos de usuarios:', tiposUsuario);
    }
    
  } catch (error) {
    console.error('❌ Error al probar consultas específicas:', error);
  }
} 