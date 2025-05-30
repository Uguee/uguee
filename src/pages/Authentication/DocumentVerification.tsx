import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { DocumentService } from '@/services/documentService';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  AlertCircle,
  User,
  Camera,
  Shield
} from 'lucide-react';

interface DocumentData {
  tipo: string;
  lugar_expedicion: string;
  fecha_expedicion: string;
  fecha_vencimiento: string;
}

const DocumentVerification = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [documentNumber, setDocumentNumber] = useState('');
  const [documentType, setDocumentType] = useState('cedula');
  const [documentPhoto, setDocumentPhoto] = useState<File | null>(null);
  const [selfiePhoto, setSelfiePhoto] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [placeOfIssue, setPlaceOfIssue] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expirationDate, setExpirationDate] = useState('');

  // Función para convertir File a data URI
  const fileToDataURI = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Función para obtener el id_usuario del usuario actual
  const getUserId = async (): Promise<number | null> => {
    try {
      if (!user?.id) return null;
      
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`https://ezuujivxstyuziclhvhp.supabase.co/functions/v1/get-user-data?uuid=${user.id}`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      
      if (!response.ok) return null;
      
      const result = await response.json();
      return result.success && result.data?.id_usuario ? result.data.id_usuario : null;
    } catch (error) {
      console.error('Error getting user ID:', error);
      return null;
    }
  };

  const handleDocumentPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocumentPhoto(e.target.files[0]);
    }
  };

  const handleSelfiePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelfiePhoto(e.target.files[0]);
    }
  };

  const handleVerifyDocuments = async () => {
    if (!documentNumber || !documentPhoto || !selfiePhoto || !placeOfIssue || !issueDate || !expirationDate) {
      toast({
        title: "❌ Campos requeridos",
        description: "Por favor completa todos los campos y sube las fotos requeridas",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('📄 Iniciando verificación de documentos...');
      
      // Obtener el id_usuario del usuario actual
      const userId = await getUserId();
      if (!userId) {
        throw new Error('No se pudo obtener el ID del usuario');
      }

      console.log('👤 ID de usuario obtenido:', userId);

      // Convertir archivos a data URI
      const frontImageURI = await fileToDataURI(documentPhoto);
      const backImageURI = await fileToDataURI(selfiePhoto); // Usar selfie como imagen trasera

      console.log('🖼️ Imágenes convertidas a data URI');

      // Mapear tipo de documento a los valores esperados por la tabla
      const tipoDocumento = documentType === 'cedula' ? 'identidad' : 
                           documentType === 'cedula_extranjera' ? 'identidad' : 
                           documentType === 'pasaporte' ? 'identidad' : 
                           documentType === 'tarjeta_identidad' ? 'identidad' : 'identidad';

      // Preparar datos del documento
      const documentData = {
        id_usuario: userId,
        tipo: tipoDocumento,
        lugar_expedicion: placeOfIssue,
        fecha_expedicion: issueDate,
        fecha_vencimiento: expirationDate
      };

      console.log('📋 Datos del documento preparados:', documentData);

      // Subir documento usando el servicio
      const result = await DocumentService.uploadDocument(
        frontImageURI,
        backImageURI,
        documentData
      );

      if (!result.success) {
        throw new Error(result.error || 'Error subiendo documentos');
      }

      console.log('✅ Documentos subidos exitosamente:', result.data);
      
      setIsVerified(true);
      
      toast({
        title: "✅ Documentos verificados",
        description: "Tu identidad ha sido verificada y documentos guardados exitosamente",
      });

      // Redirigir a selección de institución después de un momento
      setTimeout(() => {
        navigate('/select-institution');
      }, 1500);
      
    } catch (error: any) {
      console.error('❌ Error en verificación:', error);
      toast({
        title: "❌ Error en verificación",
        description: error.message || "No se pudieron verificar los documentos. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
              <h2 className="text-2xl font-bold text-green-600">¡Verificación Exitosa!</h2>
              <p className="text-gray-600">
                Tu identidad ha sido verificada. Serás redirigido para seleccionar tu institución.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            <div>
              <CardTitle className="text-2xl">Verificación de Identidad</CardTitle>
              <p className="text-gray-600 mt-1">
                Para continuar, necesitamos verificar tu identidad
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Información del usuario */}
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
            <User className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium">Hola, {user?.email?.split('@')[0]}</p>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
          </div>

          {/* Tipo de documento */}
          <div className="space-y-2">
            <Label htmlFor="documentType">Tipo de Documento</Label>
            <select
              id="documentType"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="cedula">Cédula de Ciudadanía</option>
              <option value="cedula_extranjera">Cédula de Extranjería</option>
              <option value="pasaporte">Pasaporte</option>
              <option value="tarjeta_identidad">Tarjeta de Identidad</option>
            </select>
          </div>

          {/* Número de documento */}
          <div className="space-y-2">
            <Label htmlFor="documentNumber">Número de Documento</Label>
            <Input
              id="documentNumber"
              type="text"
              placeholder="Ingresa tu número de documento"
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Lugar de expedición */}
          <div className="space-y-2">
            <Label htmlFor="placeOfIssue">Lugar de Expedición</Label>
            <Input
              id="placeOfIssue"
              type="text"
              placeholder="Ciudad o lugar de expedición"
              value={placeOfIssue}
              onChange={(e) => setPlaceOfIssue(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Fechas del documento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issueDate">Fecha de Expedición</Label>
              <Input
                id="issueDate"
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expirationDate">Fecha de Vencimiento</Label>
              <Input
                id="expirationDate"
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {/* Foto del documento */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Foto del Documento (Frente)
            </Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleDocumentPhotoChange}
                className="hidden"
                id="document-photo"
              />
              <label htmlFor="document-photo" className="cursor-pointer">
                {documentPhoto ? (
                  <div className="space-y-2">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto" />
                    <p className="text-green-600 font-medium">{documentPhoto.name}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                    <p className="text-gray-600">Haz clic para subir la foto de tu documento</p>
                    <p className="text-sm text-gray-400">PNG, JPG hasta 5MB</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Selfie */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Foto Selfie con el Documento
            </Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleSelfiePhotoChange}
                className="hidden"
                id="selfie-photo"
              />
              <label htmlFor="selfie-photo" className="cursor-pointer">
                {selfiePhoto ? (
                  <div className="space-y-2">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto" />
                    <p className="text-green-600 font-medium">{selfiePhoto.name}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Camera className="w-8 h-8 text-gray-400 mx-auto" />
                    <p className="text-gray-600">Toma una selfie sosteniendo tu documento</p>
                    <p className="text-sm text-gray-400">Asegúrate de que se vea claramente tu rostro y el documento</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Aviso de seguridad */}
          <div className="flex gap-3 p-4 bg-amber-50 rounded-lg">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-800">Información de Seguridad</p>
              <p className="text-amber-700 mt-1">
                Tus documentos se utilizan únicamente para verificación de identidad y no se almacenan permanentemente.
              </p>
            </div>
          </div>

          {/* Botón de verificación */}
          <Button 
            onClick={handleVerifyDocuments}
            disabled={isLoading || !documentNumber || !documentPhoto || !selfiePhoto || !placeOfIssue || !issueDate || !expirationDate}
            className="w-full h-12"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Verificando documentos...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Verificar Identidad
              </div>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentVerification; 