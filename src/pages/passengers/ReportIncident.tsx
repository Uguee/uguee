import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Car, 
  Ban, 
  XCircle, 
  Shield, 
  Construction, 
  AlertOctagon, 
  Siren, 
  HelpCircle 
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import IncidentMap from '@/components/maps/IncidentMap';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export type TipoIncidente = 'accidente' | 'obstáculo en la vía' | 'vía cerrada' | 'presencia policial' | 'hueco en la vía' | 'robo' | 'emergencia' | 'otro';

export const INCIDENT_ICONS = {
  'accidente': Car,
  'obstáculo en la vía': Ban,
  'vía cerrada': XCircle,
  'presencia policial': Shield,
  'hueco en la vía': Construction,
  'robo': AlertOctagon,
  'emergencia': Siren,
  'otro': HelpCircle
} as const;

const ReportIncident = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [tipo, setTipo] = useState<TipoIncidente | ''>('');
  const [descripcion, setDescripcion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLocationSelect = (lat: number, lng: number) => {
    setLocation({ lat, lng });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Usuario actual:', user);
    const userId = user?.id;
    console.log('ID de usuario:', userId);

    if (!location || !tipo || !descripcion.trim() || !userId) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos o inicia sesión",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const incidentData = {
      coordenada: { type: 'Point', coordinates: [location.lng, location.lat] },
      tipo: tipo as TipoIncidente,
      descripcion: descripcion.trim(),
      id_usuario: parseInt(userId)
    };

    console.log('Datos a enviar:', incidentData);

    try {
      const { error, data } = await supabase
        .from('incidente')
        .insert(incidentData)
        .select();

      console.log('Respuesta de Supabase:', { error, data });

      if (error) throw error;

      toast({
        title: "✅ Incidente reportado",
        description: "Gracias por ayudar a mantener la comunidad informada",
      });

      // Limpiar el formulario
      setLocation(null);
      setTipo('');
      setDescripcion('');
    } catch (error) {
      console.error('Error al reportar incidente:', error);
      toast({
        title: "Error",
        description: "No se pudo reportar el incidente. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <AlertTriangle className="h-6 w-6 text-yellow-500" />
          <h1 className="text-2xl font-bold">Reportar Incidente</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Tipo de Incidente</label>
                <Select 
                  value={tipo} 
                  onValueChange={(value: TipoIncidente) => setTipo(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo de incidente" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(INCIDENT_ICONS) as TipoIncidente[]).map((tipoIncidente) => {
                      const Icon = INCIDENT_ICONS[tipoIncidente];
                      return (
                        <SelectItem key={tipoIncidente} value={tipoIncidente}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span className="capitalize">{tipoIncidente}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Descripción</label>
                <Textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Describe el incidente con más detalle..."
                  className="h-32"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || !location || !tipo || !descripcion.trim()}
              >
                {isSubmitting ? 'Reportando...' : 'Reportar Incidente'}
              </Button>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Ubicación del Incidente</label>
              <div className="h-[500px] rounded-lg overflow-hidden border">
                <IncidentMap 
                  onLocationSelect={handleLocationSelect}
                  selectedType={tipo as TipoIncidente}
                />
              </div>
              {location && (
                <p className="text-sm text-gray-500">
                  Ubicación seleccionada: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </p>
              )}
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default ReportIncident; 