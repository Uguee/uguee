import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Incident {
  id_incidente: number;
  coordenada: {
    type: string;
    coordinates: [number, number];
  };
  tipo: string;
  descripcion: string;
  id_usuario: number;
  fecha: string;
  estado: 'activo' | 'resuelto';
  fecha_expiracion: string;
}

export function useIncidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      console.log('🔍 Iniciando fetchIncidents');

      const now = new Date().toISOString();
      
      // Actualizar incidentes vencidos
      await supabase
        .from('incidente')
        .update({ estado: 'resuelto' })
        .lt('fecha_expiracion', now)
        .eq('estado', 'activo');

      // Obtener incidentes activos
      const { data: directData, error: directError } = await supabase
        .from('incidente')
        .select('*')
        .eq('estado', 'activo');

      if (directError) throw directError;
      console.log('📊 Datos de consulta directa:', directData);
      setIncidents((directData as Incident[]) || []);
    } catch (err) {
      console.error('❌ Error detallado:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar incidentes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🚀 useEffect en useIncidents ejecutado');
    fetchIncidents();

    // Suscripción a cambios
    const channel = supabase
      .channel('incidentes_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'incidente' 
        }, 
        (payload) => {
          console.log('📡 Cambio en tiempo real recibido:', payload);
          fetchIncidents();
        }
      )
      .subscribe();

    return () => {
      console.log('🔌 Desuscribiendo del canal');
      channel.unsubscribe();
    };
  }, []);

  return { incidents, loading, error, refetch: fetchIncidents };
} 