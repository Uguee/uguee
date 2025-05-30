// Configuración de Supabase
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type InstitutionInsert = Database['public']['Tables']['institucion']['Insert'];
type InstitutionRow = Database['public']['Tables']['institucion']['Row'];

export interface LogoUploadResponse {
  success: boolean;
  url?: string;
  error?: string;
}

export class LogoService {
  /**
   * Convierte data URI (base64) a File para web
   */
  static dataURItoFile(dataURI: string, fileName: string): File {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new File([ab], fileName, { type: mimeString });
  }

  /**
   * Sube un logo al bucket 'logo' usando Supabase Storage
   */
  static async uploadLogo(
    logoUri: string, 
    institutionName: string
  ): Promise<LogoUploadResponse> {
    try {
      // Crear un nombre único para el archivo
      const fileExtension = logoUri.includes('data:image/jpeg') ? 'jpg' : 
                          logoUri.includes('data:image/png') ? 'png' : 
                          logoUri.includes('data:image/webp') ? 'webp' :
                          logoUri.includes('data:image/svg') ? 'svg' : 'jpg';
      
      // Limpiar el nombre de la institución para crear un nombre de archivo válido
      const cleanInstitutionName = institutionName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .substring(0, 50); // Limitar longitud
      
      const uniqueFileName = `${cleanInstitutionName}_logo_${Date.now()}.${fileExtension}`;
      
      // Convertir data URI a File
      const file = this.dataURItoFile(logoUri, uniqueFileName);

      // Subir archivo usando Supabase Storage client al bucket 'logo'
      const { data, error } = await supabase.storage
        .from('logo')
        .upload(uniqueFileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('❌ Error uploading logo:', error);
        return { success: false, error: `Error subiendo logo: ${error.message}` };
      }

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('logo')
        .getPublicUrl(uniqueFileName);

      console.log('✅ Logo uploaded successfully:', {
        fileName: uniqueFileName,
        url: urlData.publicUrl
      });

      return { 
        success: true, 
        url: urlData.publicUrl
      };
    } catch (error: any) {
      console.error('❌ Error in uploadLogo:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Elimina un logo anterior del bucket cuando se actualiza
   */
  static async deleteLogo(logoUrl: string): Promise<boolean> {
    try {
      // Extraer el nombre del archivo de la URL
      const fileName = logoUrl.split('/').pop();
      if (!fileName) return false;

      const { error } = await supabase.storage
        .from('logo')
        .remove([fileName]);

      if (error) {
        console.error('❌ Error deleting logo:', error);
        return false;
      }

      console.log('✅ Logo deleted successfully:', fileName);
      return true;
    } catch (error: any) {
      console.error('❌ Error in deleteLogo:', error);
      return false;
    }
  }

  /**
   * Proceso completo: sube el logo y retorna la URL para guardar en la tabla institución
   * Esta función está diseñada para ser usada antes de guardar los datos de la institución
   */
  static async processLogo(
    logoUri: string | null,
    institutionName: string
  ): Promise<LogoUploadResponse> {
    try {
      // Si no hay logo, retornar éxito con URL vacía
      if (!logoUri) {
        return { success: true, url: '' };
      }

      // Subir logo y obtener URL
      const uploadResult = await this.uploadLogo(logoUri, institutionName);
      
      if (!uploadResult.success) {
        return { 
          success: false, 
          error: `Error procesando logo: ${uploadResult.error}` 
        };
      }

      return {
        success: true,
        url: uploadResult.url
      };
    } catch (error: any) {
      console.error('❌ Error in processLogo:', error);
      return { success: false, error: error.message };
    }
  }
} 