// Configuración de Supabase
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type DocumentInsert = Database['public']['Tables']['documento']['Insert'];
type DocumentRow = Database['public']['Tables']['documento']['Row'];

export interface DocumentData {
  id_usuario: number;
  tipo: string;
  lugar_expedicion: string;
  fecha_expedicion: string;
  fecha_vencimiento: string;
  imagen_front: string; // URL de la imagen frontal
  imagen_back?: string; // URL de la imagen trasera (opcional)
}

export interface UploadResponse {
  success: boolean;
  data?: {
    frontUrl?: string;
    backUrl?: string;
    documentId?: number;
  };
  error?: string;
}

export class DocumentService {
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
   * Sube una imagen al bucket de documentos usando Supabase Storage
   */
  static async uploadImage(
    imageUri: string, 
    fileName: string, 
    userId: number
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      // Crear un nombre único para el archivo
      const fileExtension = imageUri.includes('data:image/jpeg') ? 'jpg' : 
                          imageUri.includes('data:image/png') ? 'png' : 'jpg';
      const uniqueFileName = `${userId}/${fileName}_${Date.now()}.${fileExtension}`;
      
      // Convertir data URI a File
      const file = this.dataURItoFile(imageUri, uniqueFileName);

      // Subir archivo usando Supabase Storage client
      const { data, error } = await supabase.storage
        .from('documentos')
        .upload(uniqueFileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('❌ Error uploading image:', error);
        return { success: false, error: `Error uploading: ${error.message}` };
      }

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('documentos')
        .getPublicUrl(uniqueFileName);

      return { 
        success: true, 
        url: urlData.publicUrl
      };
    } catch (error: any) {
      console.error('❌ Error in uploadImage:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Guarda los datos del documento en la tabla usando Supabase client
   */
  static async saveDocumentData(documentData: DocumentData): Promise<UploadResponse> {
    try {
      // Generar número secuencial consultando la tabla
      const { count, error: countError } = await supabase
        .from('documento')
        .select('numero', { count: 'exact', head: true });
      
      const numeroDocumento = countError 
        ? Math.floor(Date.now() / 1000) // Fallback
        : (count || 0) + 1;
      
      // Crear el objeto para insertar
      const documentInsert = {
        numero: numeroDocumento,
        id_usuario: documentData.id_usuario,
        tipo: documentData.tipo,
        lugar_expedicion: documentData.lugar_expedicion,
        fecha_expedicion: documentData.fecha_expedicion,
        fecha_vencimiento: documentData.fecha_vencimiento,
        imagen_front: documentData.imagen_front,
        imagen_back: documentData.imagen_back || null
      };

      const { data, error } = await supabase
        .from('documento')
        .insert(documentInsert as any)
        .select();

      if (error) {
        console.error('❌ Error saving document data:', error);
        return { success: false, error: `Error saving: ${error.message}` };
      }

      const documentId = Array.isArray(data) && data.length > 0 ? data[0]?.numero : undefined;

      return {
        success: true,
        data: {
          documentId
        }
      };
    } catch (error: any) {
      console.error('❌ Error in saveDocumentData:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Proceso completo: sube imágenes y guarda metadata
   * Maneja imagen frontal e imagen trasera por separado
   */
  static async uploadDocument(
    frontImageUri: string | null,
    backImageUri: string | null,
    documentData: Omit<DocumentData, 'imagen_front' | 'imagen_back'>
  ): Promise<UploadResponse> {
    try {
      let frontUrl = '';
      let backUrl: string | undefined = undefined;

      // Subir imagen frontal (obligatoria)
      if (frontImageUri) {
        const frontResult = await this.uploadImage(
          frontImageUri, 
          'front', 
          documentData.id_usuario
        );
        
        if (!frontResult.success) {
          return { success: false, error: `Error subiendo imagen frontal: ${frontResult.error}` };
        }
        frontUrl = frontResult.url || '';
      } else {
        return { success: false, error: 'La imagen frontal es requerida' };
      }

      // Subir imagen trasera (opcional)
      if (backImageUri) {
        const backResult = await this.uploadImage(
          backImageUri, 
          'back', 
          documentData.id_usuario
        );
        
        if (backResult.success) {
          backUrl = backResult.url;
        }
      }

      // Guardar metadata en la tabla con ambas URLs
      const completeDocumentData: DocumentData = {
        ...documentData,
        imagen_front: frontUrl,
        imagen_back: backUrl
      };

      const saveResult = await this.saveDocumentData(completeDocumentData);
      
      if (!saveResult.success) {
        return { success: false, error: saveResult.error };
      }

      return {
        success: true,
        data: {
          frontUrl,
          backUrl,
          documentId: saveResult.data?.documentId
        }
      };
    } catch (error: any) {
      console.error('❌ Error in uploadDocument:', error);
      return { success: false, error: error.message };
    }
  }
} 