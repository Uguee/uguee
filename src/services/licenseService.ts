import { supabase } from '@/integrations/supabase/client';

export interface LicenseUploadResponse {
  success: boolean;
  url?: string;
  error?: string;
}

export class LicenseService {
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
   * Sube una imagen de licencia al bucket 'licencia' usando Supabase Storage
   */
  static async uploadLicense(
    imageUri: string, 
    userId: number
  ): Promise<LicenseUploadResponse> {
    try {
      // Crear un nombre único para el archivo
      const fileExtension = imageUri.includes('data:image/jpeg') ? 'jpg' : 
                          imageUri.includes('data:image/png') ? 'png' : 'jpg';
      
      // Use id_usuario as folder name
      const uniqueFileName = `${userId}/license_${Date.now()}.${fileExtension}`;
      
      // Convertir data URI a File
      const file = this.dataURItoFile(imageUri, uniqueFileName);

      // Subir archivo usando Supabase Storage client al bucket 'licencia'
      const { data, error } = await supabase.storage
        .from('licencia')
        .upload(uniqueFileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('❌ Error uploading license:', error);
        return { success: false, error: `Error uploading: ${error.message}` };
      }

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('licencia')
        .getPublicUrl(uniqueFileName);

      console.log('✅ License uploaded successfully:', {
        fileName: uniqueFileName,
        url: urlData.publicUrl
      });

      return { 
        success: true, 
        url: urlData.publicUrl
      };
    } catch (error: any) {
      console.error('❌ Error in uploadLicense:', error);
      return { success: false, error: error.message };
    }
  }
} 