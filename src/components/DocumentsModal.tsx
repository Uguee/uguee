import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUserDocuments } from '@/hooks/useUserDocuments';
import { FileText, Calendar, MapPin, ExternalLink, Loader2 } from 'lucide-react';

interface DocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  userName: string;
}

export const DocumentsModal: React.FC<DocumentsModalProps> = ({
  isOpen,
  onClose,
  userId,
  userName
}) => {
  const { documents, isLoading, error } = useUserDocuments(userId);

  const openImageInNewTab = (imageUrl: string) => {
    window.open(imageUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Documentos de {userName}
          </DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Cargando documentos...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-red-600">Error: {error}</p>
          </div>
        )}

        {!isLoading && !error && documents.length === 0 && (
          <div className="text-center py-8">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Este usuario no ha subido documentos.</p>
          </div>
        )}

        {!isLoading && !error && documents.length > 0 && (
          <div className="space-y-4">
            {documents.map((document) => (
              <Card key={document.numero} className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Documento #{document.numero}
                    </CardTitle>
                    <Badge variant="outline" className="capitalize">
                      {document.tipo}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Información del documento */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="font-semibold">Lugar de expedición:</span>
                        <span>{document.lugar_expedicion}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="font-semibold">Fecha de expedición:</span>
                        <span>{new Date(document.fecha_expedicion).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="font-semibold">Fecha de vencimiento:</span>
                        <span>{new Date(document.fecha_vencimiento).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Imágenes del documento */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Imágenes del documento:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Imagen frontal */}
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Documento (frente)</p>
                        <div className="relative group">
                          <img
                            src={document.imagen_front}
                            alt="Documento frontal"
                            className="w-full h-48 object-cover rounded-lg border shadow-sm cursor-pointer transition-transform group-hover:scale-105"
                            onClick={() => openImageInNewTab(document.imagen_front)}
                          />
                          <Button
                            size="sm"
                            variant="secondary"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => openImageInNewTab(document.imagen_front)}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Imagen trasera */}
                      {document.imagen_back && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">Selfie con documento</p>
                          <div className="relative group">
                            <img
                              src={document.imagen_back}
                              alt="Selfie con documento"
                              className="w-full h-48 object-cover rounded-lg border shadow-sm cursor-pointer transition-transform group-hover:scale-105"
                              onClick={() => openImageInNewTab(document.imagen_back)}
                            />
                            <Button
                              size="sm"
                              variant="secondary"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => openImageInNewTab(document.imagen_back)}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 