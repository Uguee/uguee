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
        colores: institutionData.colores,
        admin_institucional: userId,
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
        console.log('🎉 Institución registrada exitosamente');
        return {
          success: true,
          data: result.data,
          message: result.message || "Institución registrada exitosamente."
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
   * Obtiene todas las instituciones (para uso administrativo)
   */
  static async getAllInstitutions(): Promise<InstitutionRegistrationResult> {
    try {
      console.log('🏛️ InstitutionService: Obteniendo todas las instituciones');
      
      const { data: institutions, error } = await supabase
        .from('institucion')
        .select('*')
        .order('nombre_oficial', { ascending: true });

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
} 