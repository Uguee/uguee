import { supabase } from '@/integrations/supabase/client';
import { LogoService } from './logoService';

export interface InstitutionData {
  nombre_oficial: string;
  logo?: string;
  direccion: string;
  colores: string;
}

export interface InstitutionRegistrationResult {
  success: boolean;
  error?: string;
  data?: any;
  message?: string;
}

// Tipo para las respuestas de los servicios
export interface ServiceResponse<T> {
  success: boolean;
  error?: string;
  data?: T;
  message?: string;
}

// Constantes para endpoints
const SUPABASE_FUNCTIONS = {
  GET_USER_DATA: 'https://ezuujivxstyuziclhvhp.supabase.co/functions/v1/get-user-data'
};

export class InstitutionService {
  /**
   * Obtiene los headers de autenticación necesarios
   */
  private static async getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    try {
      const { data: { session }, error } = await Promise.race([
        supabase.auth.getSession(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 5000)
        )
      ]);
      
      if (error) {
        throw new Error(`Session error: ${error.message}`);
      }
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      } else {
        throw new Error('No active session');
      }
    } catch (error: any) {
      throw new Error(`Authentication failed: ${error.message}`);
    }

    return headers;
  }

  /**
   * Registra una nueva institución
   */
  static async registerInstitution(
    institutionData: InstitutionData, 
    userId: string
  ): Promise<InstitutionRegistrationResult> {
    try {
      console.log('🏛️ InstitutionService: Iniciando registro de institución');
      console.log('📄 Datos de institución:', {
        nombre_oficial: institutionData.nombre_oficial,
        direccion: institutionData.direccion,
        colores: institutionData.colores,
        hasLogo: !!institutionData.logo
      });
      console.log('👤 Usuario ID:', userId);

      // Procesar logo si existe
      let logoUrl = '';
      if (institutionData.logo) {
        console.log('🖼️ Procesando logo...');
        
        const logoResult = await LogoService.processLogo(
          institutionData.logo, 
          institutionData.nombre_oficial
        );

        if (!logoResult.success) {
          return {
            success: false,
            error: logoResult.error || "No se pudo procesar el logo."
          };
        }

        logoUrl = logoResult.url || '';
        console.log('✅ Logo procesado exitosamente:', logoUrl);
      }

      // Obtener headers de autenticación
      const headers = await this.getAuthHeaders();

      // Preparar datos para enviar al endpoint
      const requestData = {
        nombre_oficial: institutionData.nombre_oficial,
        logo: logoUrl,
        direccion: institutionData.direccion,
        colores: institutionData.colores
      };

      console.log('📤 Enviando solicitud al endpoint:', requestData);

      // Llamar al endpoint para crear la institución
      const response = await fetch('https://ezuujivxstyuziclhvhp.supabase.co/functions/v1/create-institution', {
        method: 'POST',
        headers,
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error en respuesta del endpoint:', response.status, errorText);
        throw new Error(`Error al crear la institución: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('📥 Respuesta del endpoint:', result);

      if (result.success) {
        // Obtener el ID de la institución creada
        const institutionId = result.data.id_institucion;

        // Obtener el ID del usuario
        const { data: userData, error: userError } = await supabase
          .from('usuario')
          .select('id_usuario')
          .eq('uuid', userId)
          .single();

        if (userError || !userData) {
          throw new Error('No se pudo obtener el ID del usuario');
        }

        // Crear el registro con rol de admin_institucional
        const { error: registroError } = await supabase
          .from('registro')
          .insert({
            id_usuario: userData.id_usuario,
            id_institucion: institutionId,
            correo_institucional: result.data.correo_institucional,
            codigo_institucional: result.data.codigo_institucional,
            rol_institucional: 'admin_institucional',
            validacion: 'aprobado', // Aprobado automáticamente para el admin
            fecha_registro: new Date().toISOString(),
            direccion_de_residencia: institutionData.direccion
          });

        if (registroError) {
          throw new Error(`Error al crear el registro: ${registroError.message}`);
        }

        console.log('🎉 Institución y registro de admin creados exitosamente');
        return {
          success: true,
          data: result.data,
          message: "Institución registrada exitosamente."
        };
      } else {
        return {
          success: false,
          error: result.error || "Error al crear la institución"
        };
      }
    } catch (error: any) {
      console.error('❌ Error en registerInstitution:', error);
      return {
        success: false,
        error: error.message || "Error inesperado al registrar la institución."
      };
    }
  }

  /**
   * Valida los datos de la institución antes del registro
   */
  static validateInstitutionData(data: InstitutionData): Record<string, string> {
    const errors: Record<string, string> = {};
    
    if (!data.nombre_oficial.trim()) {
      errors.nombre_oficial = 'Nombre oficial de la institución es requerido';
    }
    
    if (!data.direccion.trim()) {
      errors.direccion = 'Dirección es requerida';
    }

    if (!data.colores.trim()) {
      errors.colores = 'Color institucional es requerido';
    }
    
    return errors;
  }

  /**
   * Obtiene todas las instituciones disponibles
   */
  static async getAllInstitutions(): Promise<InstitutionRegistrationResult> {
    try {
      console.log('🏛️ InstitutionService: Obteniendo todas las instituciones');
      
      const { data: institutions, error } = await supabase
        .from('institucion')
        .select('id_institucion, nombre_oficial, logo, direccion, colores')
        .order('nombre_oficial');

      if (error) {
        console.error('❌ Error obteniendo instituciones:', error);
        return {
          success: false,
          error: `Error obteniendo instituciones: ${error.message}`
        };
      }

      return {
        success: true,
        data: institutions || []
      };
    } catch (error: any) {
      console.error('❌ Error inesperado en getAllInstitutions:', error);
      return {
        success: false,
        error: `Error inesperado: ${error.message}`
      };
    }
  }

  /**
   * Obtiene la institución que administra un usuario admin_institucional
   */
  static async getInstitutionByAdmin(adminUuid: string): Promise<InstitutionRegistrationResult> {
    try {
      console.log('🏛️ InstitutionService: Obteniendo institución por admin:', adminUuid);
      
      // Primero obtener el id_usuario del UUID
      const { data: userData, error: userError } = await supabase
        .from('usuario')
        .select('id_usuario')
        .eq('uuid', adminUuid)
        .single();

      if (userError || !userData) {
        console.error('❌ Error obteniendo usuario:', userError);
        return {
          success: false,
          error: 'No se encontró el usuario'
        };
      }

      console.log('👤 ID de usuario encontrado:', userData.id_usuario);

      // Obtener la institución a través del registro
      const { data: registro, error: registroError } = await supabase
        .from('registro')
        .select(`
          id_institucion,
          institucion:institucion (
            id_institucion,
            nombre_oficial,
            logo,
            direccion,
            colores
          )
        `)
        .eq('id_usuario', userData.id_usuario)
        .in('rol_institucional', ['admin_institucional', 'administrador'])
        .eq('validacion', 'aprobado')
        .single();

      if (registroError) {
        console.error('❌ Error obteniendo registro:', registroError);
        return {
          success: false,
          error: `Error obteniendo registro: ${registroError.message}`
        };
      }

      if (!registro) {
        console.error('❌ No se encontró registro para el usuario');
        return {
          success: false,
          error: 'No se encontró institución para este administrador'
        };
      }

      console.log('✅ Institución encontrada:', registro.institucion);
      return {
        success: true,
        data: registro.institucion
      };
    } catch (error: any) {
      console.error('❌ Error inesperado en getInstitutionByAdmin:', error);
      return {
        success: false,
        error: `Error inesperado: ${error.message}`
      };
    }
  }

  /**
   * Obtiene usuarios registrados en una institución específica
   */
  static async getUsersByInstitution(institutionId: number): Promise<any> {
    try {
      console.log('👥 InstitutionService: Obteniendo usuarios de institución:', institutionId);
      
      const { data: users, error }: { data: any; error: any } = await supabase
        .from('registro')
        .select(`
          *,
          usuario:id_usuario (
            nombre,
            apellido,
            celular,
            fecha_nacimiento,
            uuid
          )
        `)
        .eq('id_institucion', institutionId);

      if (error) {
        console.error('❌ Error obteniendo usuarios de institución:', error);
        return {
          success: false,
          error: `Error obteniendo usuarios: ${error.message}`
        };
      }

      return {
        success: true,
        data: users || []
      };
    } catch (error: any) {
      console.error('❌ Error inesperado en getUsersByInstitution:', error);
      return {
        success: false,
        error: `Error inesperado: ${error.message}`
      };
    }
  }

  /**
   * Obtiene conductores validados de una institución específica
   */
  static async getDriversByInstitution(institutionId: number): Promise<any> {
    try {
      console.log('🚗 InstitutionService: Obteniendo conductores de institución:', institutionId);
      
      const { data: drivers, error }: { data: any; error: any } = await supabase
        .from('registro')
        .select(`
          *,
          usuario:id_usuario (
            nombre,
            apellido,
            celular,
            fecha_nacimiento,
            uuid
          )
        `)
        .eq('id_institucion', institutionId)
        .eq('validacion_conductor', 'validado');

      if (error) {
        console.error('❌ Error obteniendo conductores de institución:', error);
        return {
          success: false,
          error: `Error obteniendo conductores: ${error.message}`
        };
      }

      return {
        success: true,
        data: drivers || []
      };
    } catch (error: any) {
      console.error('❌ Error inesperado en getDriversByInstitution:', error);
      return {
        success: false,
        error: `Error inesperado: ${error.message}`
      };
    }
  }

  /**
   * Obtiene solicitudes pendientes de una institución específica
   */
  static async getPendingRequestsByInstitution(institutionId: number): Promise<any> {
    try {
      console.log('📋 InstitutionService: Obteniendo solicitudes pendientes de institución:', institutionId);
      
      const { data: requests, error }: { data: any; error: any } = await supabase
        .from('registro')
        .select(`
          *,
          usuario:id_usuario (
            nombre,
            apellido,
            celular,
            fecha_nacimiento,
            uuid
          )
        `)
        .eq('id_institucion', institutionId)
        .eq('validacion', 'pendiente');

      if (error) {
        console.error('❌ Error obteniendo solicitudes pendientes:', error);
        return {
          success: false,
          error: `Error obteniendo solicitudes: ${error.message}`
        };
      }

      return {
        success: true,
        data: requests || []
      };
    } catch (error: any) {
      console.error('❌ Error inesperado en getPendingRequestsByInstitution:', error);
      return {
        success: false,
        error: `Error inesperado: ${error.message}`
      };
    }
  }

  /**
   * Obtiene estadísticas de una institución específica
   */
  static async getInstitutionStats(institutionId: number): Promise<any> {
    try {
      console.log('📊 InstitutionService: Obteniendo estadísticas de institución:', institutionId);
      
      // Obtener estadísticas manualmente usando las funciones existentes
      const [usersResult, driversResult, pendingResult, vehiclesResult, validatedVehiclesResult] = await Promise.all([
        this.getUsersByInstitution(institutionId),
        this.getDriversByInstitution(institutionId),
        this.getPendingRequestsByInstitution(institutionId),
        this.getVehiclesByInstitution(institutionId),
        this.getValidatedVehiclesByInstitution(institutionId)
      ]);

      const stats = {
        total_users: usersResult.success ? usersResult.data?.length || 0 : 0,
        total_drivers: driversResult.success ? driversResult.data?.length || 0 : 0,
        pending_requests: pendingResult.success ? pendingResult.data?.length || 0 : 0,
        total_vehicles: vehiclesResult.success ? vehiclesResult.data?.length || 0 : 0,
        validated_vehicles: validatedVehiclesResult.success ? validatedVehiclesResult.data?.length || 0 : 0,
        students: usersResult.success ? usersResult.data?.filter((u: any) => u.rol_institucional === 'Estudiante').length || 0 : 0,
        teachers: usersResult.success ? usersResult.data?.filter((u: any) => u.rol_institucional === 'Profesor').length || 0 : 0,
        others: usersResult.success ? usersResult.data?.filter((u: any) => u.rol_institucional === 'Otro').length || 0 : 0
      };

      return {
        success: true,
        data: stats
      };
    } catch (error: any) {
      console.error('❌ Error inesperado en getInstitutionStats:', error);
      return {
        success: false,
        error: `Error inesperado: ${error.message}`
      };
    }
  }

  /**
   * Obtiene vehículos de una institución específica
   */
  static async getVehiclesByInstitution(institutionId: number): Promise<any> {
    try {
      console.log('🚗 InstitutionService: Obteniendo vehículos de institución:', institutionId);
      
      // Primero obtener los IDs de usuarios de la institución
      const { data: registros, error: registrosError } = await supabase
        .from('registro')
        .select('id_usuario')
        .eq('id_institucion', institutionId);

      if (registrosError) {
        console.error('❌ Error obteniendo usuarios de institución:', registrosError);
        return {
          success: false,
          error: `Error obteniendo usuarios: ${registrosError.message}`
        };
      }

      if (!registros || registros.length === 0) {
        return {
          success: true,
          data: []
        };
      }

      const userIds = registros.map(r => r.id_usuario);

      // Luego obtener los vehículos de esos usuarios
      const { data: vehicles, error }: { data: any; error: any } = await supabase
        .from('vehiculo')
        .select(`
          *,
          usuario:id_usuario (
            nombre,
            apellido,
            celular,
            uuid
          )
        `)
        .in('id_usuario', userIds);

      if (error) {
        console.error('❌ Error obteniendo vehículos de institución:', error);
        return {
          success: false,
          error: `Error obteniendo vehículos: ${error.message}`
        };
      }

      return {
        success: true,
        data: vehicles || []
      };
    } catch (error: any) {
      console.error('❌ Error inesperado en getVehiclesByInstitution:', error);
      return {
        success: false,
        error: `Error inesperado: ${error.message}`
      };
    }
  }

  /**
   * Obtiene vehículos validados de una institución específica
   */
  static async getValidatedVehiclesByInstitution(institutionId: number): Promise<any> {
    try {
      console.log('✅ InstitutionService: Obteniendo vehículos validados de institución:', institutionId);
      
      // Primero obtener los IDs de usuarios de la institución
      const { data: registros, error: registrosError } = await supabase
        .from('registro')
        .select('id_usuario')
        .eq('id_institucion', institutionId);

      if (registrosError) {
        console.error('❌ Error obteniendo usuarios de institución:', registrosError);
        return {
          success: false,
          error: `Error obteniendo usuarios: ${registrosError.message}`
        };
      }

      if (!registros || registros.length === 0) {
        return {
          success: true,
          data: []
        };
      }

      const userIds = registros.map(r => r.id_usuario);

      // Luego obtener los vehículos validados de esos usuarios
      const { data: vehicles, error }: { data: any; error: any } = await supabase
        .from('vehiculo')
        .select(`
          *,
          usuario:id_usuario (
            nombre,
            apellido,
            celular,
            uuid
          )
        `)
        .in('id_usuario', userIds)
        .eq('validacion', 'validado');

      if (error) {
        console.error('❌ Error obteniendo vehículos validados de institución:', error);
        return {
          success: false,
          error: `Error obteniendo vehículos validados: ${error.message}`
        };
      }

      return {
        success: true,
        data: vehicles || []
      };
    } catch (error: any) {
      console.error('❌ Error inesperado en getValidatedVehiclesByInstitution:', error);
      return {
        success: false,
        error: `Error inesperado: ${error.message}`
      };
    }
  }

  /**
   * Obtiene vehículos pendientes de validación de una institución específica
   */
  static async getPendingVehiclesByInstitution(institutionId: number): Promise<any> {
    try {
      console.log('⏳ InstitutionService: Obteniendo vehículos pendientes de institución:', institutionId);
      
      // Primero obtener los IDs de usuarios de la institución
      const { data: registros, error: registrosError } = await supabase
        .from('registro')
        .select('id_usuario')
        .eq('id_institucion', institutionId);

      if (registrosError) {
        console.error('❌ Error obteniendo usuarios de institución:', registrosError);
        return {
          success: false,
          error: `Error obteniendo usuarios: ${registrosError.message}`
        };
      }

      if (!registros || registros.length === 0) {
        return {
          success: true,
          data: []
        };
      }

      const userIds = registros.map(r => r.id_usuario);

      // Luego obtener los vehículos pendientes de esos usuarios
      const { data: vehicles, error }: { data: any; error: any } = await supabase
        .from('vehiculo')
        .select(`
          *,
          usuario:id_usuario (
            nombre,
            apellido,
            celular,
            uuid
          )
        `)
        .in('id_usuario', userIds)
        .eq('validacion', 'pendiente');

      if (error) {
        console.error('❌ Error obteniendo vehículos pendientes de institución:', error);
        return {
          success: false,
          error: `Error obteniendo vehículos pendientes: ${error.message}`
        };
      }

      return {
        success: true,
        data: vehicles || []
      };
    } catch (error: any) {
      console.error('❌ Error inesperado en getPendingVehiclesByInstitution:', error);
      return {
        success: false,
        error: `Error inesperado: ${error.message}`
      };
    }
  }

  /**
   * Obtiene rutas activas de una institución específica
   * (rutas que tienen viajes programados por conductores de la institución)
   */
  static async getActiveRoutesByInstitution(institutionId: number): Promise<any> {
    try {
      console.log('🛣️ InstitutionService: Obteniendo rutas activas de institución:', institutionId);
      
      // Primero obtener los IDs de usuarios de la institución
      const { data: registros, error: registrosError } = await supabase
        .from('registro')
        .select('id_usuario')
        .eq('id_institucion', institutionId);

      if (registrosError) {
        console.error('❌ Error obteniendo usuarios de institución:', registrosError);
        return {
          success: false,
          error: `Error obteniendo usuarios: ${registrosError.message}`
        };
      }

      if (!registros || registros.length === 0) {
        return {
          success: true,
          data: []
        };
      }

      const userIds = registros.map(r => r.id_usuario);

      // Luego obtener los viajes con sus rutas
      const { data: viajes, error: viajesError }: { data: any; error: any } = await supabase
        .from('viaje')
        .select(`
          id_ruta,
          fecha,
          hora_salida,
          hora_llegada,
          conductor:id_conductor (
            nombre,
            apellido,
            celular,
            uuid
          ),
          vehiculo:id_vehiculo (
            placa,
            color,
            modelo
          )
        `)
        .in('id_conductor', userIds)
        .gte('fecha', new Date().toISOString().split('T')[0]) // Solo viajes de hoy en adelante
        .order('fecha', { ascending: true })
        .order('hora_salida', { ascending: true });

      if (viajesError) {
        console.error('❌ Error obteniendo viajes de institución:', viajesError);
        return {
          success: false,
          error: `Error obteniendo viajes: ${viajesError.message}`
        };
      }

      // Para cada viaje, obtener los detalles de la ruta con coordenadas convertidas
      const viajesConRutas = await Promise.all(
        (viajes || []).map(async (viaje: any) => {
          try {
            // Usar la función RPC para obtener coordenadas convertidas
            const { data: rutaData, error: rutaError } = await supabase.rpc('obtener_ruta_con_coordenadas', {
              p_id_ruta: viaje.id_ruta
            });

            if (rutaError) {
              console.error('❌ Error obteniendo ruta con coordenadas:', rutaError);
              return {
                ...viaje,
                ruta: {
                  id_ruta: viaje.id_ruta,
                  longitud: null,
                  punto_partida: null,
                  punto_llegada: null,
                  trayecto: null
                }
              };
            }

            if (rutaData && rutaData.length > 0) {
              const ruta = rutaData[0];
              return {
                ...viaje,
                ruta: {
                  id_ruta: ruta.id_ruta,
                  longitud: ruta.longitud,
                  punto_partida: ruta.origen_coords,
                  punto_llegada: ruta.destino_coords,
                  trayecto: ruta.trayecto_coords
                }
              };
            } else {
              return {
                ...viaje,
                ruta: {
                  id_ruta: viaje.id_ruta,
                  longitud: null,
                  punto_partida: null,
                  punto_llegada: null,
                  trayecto: null
                }
              };
            }
          } catch (error) {
            console.error('❌ Error procesando ruta:', error);
            return {
              ...viaje,
              ruta: {
                id_ruta: viaje.id_ruta,
                longitud: null,
                punto_partida: null,
                punto_llegada: null,
                trayecto: null
              }
            };
          }
        })
      );

      console.log('🛣️ Rutas activas obtenidas con datos convertidos:', viajesConRutas.length);

      return {
        success: true,
        data: viajesConRutas
      };
    } catch (error: any) {
      console.error('❌ Error inesperado en getActiveRoutesByInstitution:', error);
      return {
        success: false,
        error: `Error inesperado: ${error.message}`
      };
    }
  }

  /**
   * Obtiene todas las rutas disponibles (para selección en mapas)
   */
  static async getAllRoutes(): Promise<any> {
    try {
      console.log('🗺️ InstitutionService: Obteniendo todas las rutas disponibles');
      
      const { data: routes, error }: { data: any; error: any } = await supabase
        .from('ruta')
        .select('*')
        .order('id_ruta', { ascending: true });

      if (error) {
        console.error('❌ Error obteniendo rutas:', error);
        return {
          success: false,
          error: `Error obteniendo rutas: ${error.message}`
        };
      }

      return {
        success: true,
        data: routes || []
      };
    } catch (error: any) {
      console.error('❌ Error inesperado en getAllRoutes:', error);
      return {
        success: false,
        error: `Error inesperado: ${error.message}`
      };
    }
  }

  /**
   * Registra un usuario en una institución específica
   */
  static async registerUserInInstitution(userData: {
    user_uuid: string;
    id_institucion: number;
    rol_institucional: string;
    correo_institucional: string;
    codigo_institucional: string;
    direccion_de_residencia: string;
  }): Promise<InstitutionRegistrationResult> {
    try {
      console.log('👤 InstitutionService: Registrando usuario en institución:', userData);

      // Primero obtener el id_usuario usando el UUID
      const { data: { session } } = await supabase.auth.getSession();
      
      const userResponse = await fetch(`https://ezuujivxstyuziclhvhp.supabase.co/functions/v1/get-user-data?uuid=${userData.user_uuid}`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      
      if (!userResponse.ok) {
        throw new Error('No se pudo obtener el id del usuario');
      }
      
      const userResult = await userResponse.json();
      
      if (!userResult.success || !userResult.data?.id_usuario) {
        throw new Error('Usuario no encontrado en la base de datos');
      }

      // Obtener headers de autenticación
      const headers = await this.getAuthHeaders();

      // Preparar datos para el endpoint existente
      const requestData = {
        id_usuario: userResult.data.id_usuario,
        id_institucion: userData.id_institucion,
        codigo_institucional: parseInt(userData.codigo_institucional.replace(/\D/g, '')) || Math.floor(Math.random() * 1000000),
        correo_institucional: userData.correo_institucional,
        direccion_de_residencia: userData.direccion_de_residencia,
        rol_institucional: userData.rol_institucional
      };

      console.log('📤 Enviando solicitud al endpoint existente:', requestData);

      // Llamar al endpoint existente para registrar el usuario
      const response = await fetch('https://ezuujivxstyuziclhvhp.supabase.co/functions/v1/send-register-to-institution-application', {
        method: 'POST',
        headers,
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error en respuesta del endpoint:', response.status, errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          return {
            success: false,
            error: errorData.message || `Error al registrar usuario: ${response.status}`
          };
        } catch {
          return {
            success: false,
            error: `Error al registrar usuario: ${response.status} ${response.statusText}`
          };
        }
      }

      const result = await response.json();
      console.log('📥 Respuesta del endpoint:', result);

      if (result.success) {
        console.log('🎉 Usuario registrado en institución exitosamente');
        return {
          success: true,
          data: result.data,
          message: "Usuario registrado en institución exitosamente."
        };
      } else {
        return {
          success: false,
          error: result.message || "Error al registrar usuario en institución"
        };
      }
    } catch (error: any) {
      console.error('❌ Error en registerUserInInstitution:', error);
      return {
        success: false,
        error: error.message || "Error inesperado al registrar usuario en institución."
      };
    }
  }

  /**
   * Obtiene las solicitudes de registro pendientes para una institución
   */
  static async getPendingRegistrations(institutionId?: number): Promise<ServiceResponse<any[]>> {
    try {
      console.log('🔍 Obteniendo solicitudes de registro pendientes...');
      
      const headers = await this.getAuthHeaders();
      let url = `${SUPABASE_FUNCTIONS.GET_USER_DATA}?action=get_pending_registrations`;
      
      if (institutionId) {
        url += `&institution_id=${institutionId}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Solicitudes obtenidas:', result.data?.length || 0);
        return {
          success: true,
          data: result.data || []
        };
      } else {
        console.error('❌ Error en respuesta:', result.message);
        return {
          success: false,
          error: result.message || 'Error obteniendo solicitudes'
        };
      }
    } catch (error: any) {
      console.error('❌ Error obteniendo solicitudes:', error);
      return {
        success: false,
        error: error.message || 'Error de conexión'
      };
    }
  }

  /**
   * Aprueba una solicitud de registro
   */
  static async approveRegistration(registrationId: number): Promise<ServiceResponse<any>> {
    try {
      console.log('✅ Aprobando solicitud:', registrationId);
      
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${SUPABASE_FUNCTIONS.GET_USER_DATA}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          action: 'approve_registration',
          registration_id: registrationId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Solicitud aprobada exitosamente');
        return {
          success: true,
          data: result.data
        };
      } else {
        console.error('❌ Error aprobando:', result.message);
        return {
          success: false,
          error: result.message || 'Error aprobando solicitud'
        };
      }
    } catch (error: any) {
      console.error('❌ Error aprobando solicitud:', error);
      return {
        success: false,
        error: error.message || 'Error de conexión'
      };
    }
  }

  /**
   * Rechaza una solicitud de registro
   */
  static async rejectRegistration(registrationId: number): Promise<ServiceResponse<any>> {
    try {
      console.log('❌ Rechazando solicitud:', registrationId);
      
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${SUPABASE_FUNCTIONS.GET_USER_DATA}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          action: 'reject_registration',
          registration_id: registrationId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Solicitud rechazada exitosamente');
        return {
          success: true,
          data: result.data
        };
      } else {
        console.error('❌ Error rechazando:', result.message);
        return {
          success: false,
          error: result.message || 'Error rechazando solicitud'
        };
      }
    } catch (error: any) {
      console.error('❌ Error rechazando solicitud:', error);
      return {
        success: false,
        error: error.message || 'Error de conexión'
      };
    }
  }
} 