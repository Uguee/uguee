import { DocumentService } from './documentService';
import { UserService } from './userService';
import { supabase } from '@/integrations/supabase/client';

export interface DocumentFormData {
  documentNumber: string;
  documentType: string;
  placeOfIssue: string;
  issueDate: string;
  expirationDate: string;
  documentPhoto: File | null;
  selfiePhoto: File | null;
}

export interface DocumentVerificationResult {
  success: boolean;
  error?: string;
  data?: any;
}

export class DocumentVerificationService {
  /**
   * Convierte File a data URI
   */
  static fileToDataURI(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Obtiene el id_usuario del usuario actual
   */
  static async getUserId(userUuid: string): Promise<number | null> {
    try {
      if (!userUuid) return null;
      
      // Si el ID es numérico, usarlo directamente
      if (/^\d+$/.test(userUuid)) {
        return parseInt(userUuid);
      }
      
      // Si es un UUID, buscar en la tabla usuario
      const { data: userData, error } = await supabase
        .from('usuario')
        .select('id_usuario')
        .eq('uuid', userUuid)
        .single();
      
      if (error) {
        console.error('Error getting user ID:', error);
        return null;
      }
      
      return userData?.id_usuario || null;
    } catch (error) {
      console.error('Error getting user ID:', error);
      return null;
    }
  }

  /**
   * Valida los datos del formulario de documentos
   */
  static validateDocumentForm(formData: DocumentFormData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!formData.documentNumber?.trim()) {
      errors.push('Número de documento es requerido');
    }

    if (!formData.placeOfIssue?.trim()) {
      errors.push('Lugar de expedición es requerido');
    }

    if (!formData.issueDate) {
      errors.push('Fecha de expedición es requerida');
    }

    if (!formData.expirationDate) {
      errors.push('Fecha de vencimiento es requerida');
    }

    if (!formData.documentPhoto) {
      errors.push('Foto del documento es requerida');
    }

    if (!formData.selfiePhoto) {
      errors.push('Foto selfie es requerida');
    }

    // Validar que la fecha de expedición sea anterior a la de vencimiento
    if (formData.issueDate && formData.expirationDate) {
      const issueDate = new Date(formData.issueDate);
      const expirationDate = new Date(formData.expirationDate);
      
      if (issueDate >= expirationDate) {
        errors.push('La fecha de expedición debe ser anterior a la fecha de vencimiento');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Mapea el tipo de documento del formulario al tipo de la base de datos
   */
  static mapDocumentType(documentType: string): string {
    switch (documentType) {
      case 'cedula':
      case 'cedula_extranjera':
      case 'pasaporte':
      case 'tarjeta_identidad':
        return 'identidad';
      default:
        return 'identidad';
    }
  }

  /**
   * Procesa y sube los documentos del usuario
   */
  static async processDocuments(formData: DocumentFormData, userUuid: string): Promise<DocumentVerificationResult> {
    try {
      console.log('📄 Iniciando verificación de documentos...');

      // Validar formulario
      const validation = this.validateDocumentForm(formData);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      // Obtener el id_usuario del usuario actual
      const userId = await this.getUserId(userUuid);
      if (!userId) {
        return {
          success: false,
          error: 'No se pudo obtener el ID del usuario'
        };
      }

      console.log('👤 ID de usuario obtenido:', userId);

      // Convertir archivos a data URI
      const frontImageURI = await this.fileToDataURI(formData.documentPhoto!);
      const backImageURI = await this.fileToDataURI(formData.selfiePhoto!);

      console.log('🖼️ Imágenes convertidas a data URI');

      // Preparar datos del documento
      const documentData = {
        id_usuario: userId,
        tipo: this.mapDocumentType(formData.documentType),
        lugar_expedicion: formData.placeOfIssue,
        fecha_expedicion: formData.issueDate,
        fecha_vencimiento: formData.expirationDate
      };

      console.log('📋 Datos del documento preparados:', documentData);

      // Subir documento usando el servicio
      const result = await DocumentService.uploadDocument(
        frontImageURI,
        backImageURI,
        documentData
      );

      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Error subiendo documentos'
        };
      }

      console.log('✅ Documentos subidos exitosamente:', result.data);

      return {
        success: true,
        data: result.data
      };

    } catch (error: any) {
      console.error('❌ Error en verificación:', error);
      return {
        success: false,
        error: error.message || 'Error inesperado al procesar documentos'
      };
    }
  }

  /**
   * Verifica si el usuario ya completó la verificación de documentos
   */
  static async checkUserDocumentStatus(userUuid: string): Promise<{
    hasDocuments: boolean;
    userId?: number;
  }> {
    try {
      const userId = await this.getUserId(userUuid);
      if (!userId) {
        return { hasDocuments: false };
      }

      const hasDocuments = await UserService.hasCompletedDocumentVerification(userId);
      
      return {
        hasDocuments,
        userId
      };
    } catch (error) {
      console.error('Error checking document status:', error);
      return { hasDocuments: false };
    }
  }
} 