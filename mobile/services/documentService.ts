// Configuración de Supabase
export const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
export const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export interface DocumentData {
  id_usuario: number;
  tipo: string;
  lugar_expedicion: string;
  fecha_expedicion: string;
  fecha_vencimiento: string;
  imagen_front?: string;
  imagen_back?: string;
  numero?: string;
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
   * Sube una imagen al bucket de documentos usando la API REST de Supabase
   */
  static async uploadImage(
    imageUri: string,
    fileName: string,
    userId: number
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      // Crear un nombre único para el archivo
      const fileExtension = imageUri.split(".").pop() || "jpg";
      const uniqueFileName = `${userId}/${fileName}_${Date.now()}.${fileExtension}`;

      // Preparar FormData
      const formData = new FormData();
      formData.append("file", {
        uri: imageUri,
        type: "image/jpeg",
        name: uniqueFileName,
      } as any);

      // Subir archivo usando la API REST de Supabase Storage
      const uploadResponse = await fetch(
        `${supabaseUrl}/storage/v1/object/documentos/${uniqueFileName}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${supabaseAnonKey}`,
            "Content-Type": "multipart/form-data",
          },
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error("❌ Error uploading image:", errorText);
        return { success: false, error: `Error uploading: ${errorText}` };
      }

      // Construir URL pública
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/documentos/${uniqueFileName}`;

      return {
        success: true,
        url: publicUrl,
      };
    } catch (error: any) {
      console.error("❌ Error in uploadImage:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Guarda los datos del documento en la tabla usando la API REST de Supabase
   */
  static async saveDocumentData(
    documentData: DocumentData
  ): Promise<UploadResponse> {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/documento`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseAnonKey}`,
          apikey: supabaseAnonKey,
          Prefer: "return=representation",
        },
        body: JSON.stringify(documentData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Error saving document data:", errorText);
        return { success: false, error: `Error saving: ${errorText}` };
      }

      const data = await response.json();
      const documentId = Array.isArray(data) ? data[0]?.numero : data?.numero;

      return {
        success: true,
        data: {
          documentId,
        },
      };
    } catch (error: any) {
      console.error("❌ Error in saveDocumentData:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Proceso completo: sube imágenes y guarda metadata
   */
  static async uploadDocument(
    frontImageUri: string | null,
    backImageUri: string | null,
    documentData: Omit<DocumentData, "imagen_front" | "imagen_back">
  ): Promise<UploadResponse> {
    try {
      let frontUrl = "";
      let backUrl = "";

      // Subir imagen frontal
      if (frontImageUri) {
        const frontResult = await this.uploadImage(
          frontImageUri,
          "front",
          documentData.id_usuario
        );

        if (!frontResult.success) {
          return {
            success: false,
            error: `Error subiendo imagen frontal: ${frontResult.error}`,
          };
        }
        frontUrl = frontResult.url || "";
      }

      // Subir imagen trasera
      if (backImageUri) {
        const backResult = await this.uploadImage(
          backImageUri,
          "back",
          documentData.id_usuario
        );

        if (!backResult.success) {
          return {
            success: false,
            error: `Error subiendo imagen trasera: ${backResult.error}`,
          };
        }
        backUrl = backResult.url || "";
      }

      // Guardar metadata en la tabla
      const completeDocumentData: DocumentData = {
        ...documentData,
        imagen_front: frontUrl,
        imagen_back: backUrl,
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
          documentId: saveResult.data?.documentId,
        },
      };
    } catch (error: any) {
      console.error("❌ Error in uploadDocument:", error);
      return { success: false, error: error.message };
    }
  }
}
