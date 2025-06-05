import { supabase } from '@/integrations/supabase/client';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_CONFIG } from '@/config/gemini';

interface EmbeddingData {
  id: string;
  content: string;
  metadata: {
    type: 'route' | 'institution' | 'vehicle' | 'trip';
    [key: string]: any;
  };
  embedding?: number[];
}

export class EmbeddingService {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  // Generar embeddings usando Gemini
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const model = this.genAI.getGenerativeModel({ 
        model: GEMINI_CONFIG.MODELS.EMBEDDING 
      });
      const result = await model.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      console.error('Error generating embedding:', error);
      // Si el modelo de embeddings no funciona, devolver un vector simple como fallback
      return Array(768).fill(0).map(() => Math.random());
    }
  }

  // Convertir coordenadas a dirección simple y directa
  private async coordinatesToAddress(lat: number, lng: number): Promise<string> {
    // Mostrar coordenadas de forma clara para que el usuario entienda la ubicación específica
    return `Ubicación: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }

  // Extraer coordenadas de GeoJSON
  private extractCoordinatesFromGeoJSON(geojson: any): { lat: number, lng: number } | null {
    try {
      if (geojson && geojson.coordinates && Array.isArray(geojson.coordinates)) {
        // GeoJSON format: [longitude, latitude]
        const [lng, lat] = geojson.coordinates;
        const coordinates = { lat: parseFloat(lat), lng: parseFloat(lng) };
        return coordinates;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error extrayendo coordenadas:', error);
      return null;
    }
  }

  // Formatear distancia en unidades apropiadas
  private formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)} metros`;
    } else {
      return `${(meters / 1000).toFixed(2)} kilómetros`;
    }
  }

  // Obtener datos de rutas filtradas por institución del usuario
  async getRoutesDataByInstitution(institutionId?: number): Promise<EmbeddingData[]> {
    try {
      console.log('🔍 Obteniendo rutas de la vista ruta_geojson...');
      
      // Usar consulta directa a la vista ruta_geojson
      const { data: routes, error } = await (supabase as any)
        .from('ruta_geojson')
        .select(`
          id_ruta,
          punto_partida_geojson,
          punto_llegada_geojson,
          trayecto_geojson,
          longitud
        `);

      if (error) {
        console.warn('⚠️ Vista ruta_geojson no disponible:', error);
        return [];
      }

      console.log(`✅ Encontradas ${routes?.length || 0} rutas en total`);

      // Procesar rutas en paralelo
      const routesWithAddresses = await Promise.all((routes || []).map(async (route: any) => {
        // Extraer coordenadas
        const startCoords = this.extractCoordinatesFromGeoJSON(route.punto_partida_geojson);
        const endCoords = this.extractCoordinatesFromGeoJSON(route.punto_llegada_geojson);

        // Convertir a información de ubicación específica
        const startAddress = startCoords 
          ? await this.coordinatesToAddress(startCoords.lat, startCoords.lng)
          : 'Ubicación no disponible';
          
        const endAddress = endCoords 
          ? await this.coordinatesToAddress(endCoords.lat, endCoords.lng)
          : 'Ubicación no disponible';

        const content = `Ruta de transporte universitario
Punto de partida: ${startAddress}
Punto de llegada: ${endAddress}
Distancia: ${route.longitud} metros
Disponible en UGUEE`;

        return {
          id: `route_${route.id_ruta}`,
          content,
          metadata: {
            type: 'route' as const,
            routeId: route.id_ruta,
            startAddress,
            endAddress,
            startCoords,
            endCoords,
            length: route.longitud,
            institutionId: institutionId || null
          },
          embedding: await this.generateEmbedding(content)
        };
      }));

      return routesWithAddresses;
    } catch (error) {
      console.error('❌ Error fetching routes data:', error);
      return [];
    }
  }

  // Obtener datos de instituciones específicas
  async getInstitutionsDataByUser(institutionId?: number): Promise<EmbeddingData[]> {
    try {
      let query = supabase
        .from('institucion')
        .select(`
          id_institucion,
          nombre_oficial,
          direccion,
          colores
        `);

      // Si hay institutionId, filtrar solo esa institución
      if (institutionId) {
        query = query.eq('id_institucion', institutionId);
      }

      const { data: institutions, error } = await query;

      if (error) throw error;

      return Promise.all(institutions?.map(async (institution: any) => {
        const content = `Institución educativa: ${institution.nombre_oficial}
Dirección: ${institution.direccion}
Colores institucionales: ${institution.colores}
Servicio de transporte universitario disponible`;

        return {
          id: `institution_${institution.id_institucion}`,
          content,
          metadata: {
            type: 'institution' as const,
            institutionId: institution.id_institucion,
            name: institution.nombre_oficial,
            address: institution.direccion,
            colors: institution.colores
          },
          embedding: await this.generateEmbedding(content)
        };
      }) || []);
    } catch (error) {
      console.error('❌ Error fetching institutions data:', error);
      return [];
    }
  }

  // Obtener datos de vehículos validados filtrados por institución
  async getVehiclesDataByInstitution(institutionId?: number): Promise<EmbeddingData[]> {
    try {
      // Si no hay institutionId, obtener todos los vehículos validados
      if (!institutionId) {
        const { data: vehicles, error } = await supabase
          .from('vehiculo')
          .select(`
            placa,
            color,
            modelo,
            tipo_vehiculo!inner(tipo)
          `)
          .eq('validacion', 'validado');

        if (error) throw error;

        return Promise.all(vehicles?.map(async (vehicle: any) => {
          const content = `Vehículo validado para transporte universitario
Placa: ${vehicle.placa}
Tipo: ${vehicle.tipo_vehiculo?.tipo || 'No especificado'}
Color: ${vehicle.color}
Modelo: ${vehicle.modelo}
Estado: Validado y disponible`;

          return {
            id: `vehicle_${vehicle.placa}`,
            content,
            metadata: {
              type: 'vehicle' as const,
              plate: vehicle.placa,
              vehicleType: vehicle.tipo_vehiculo?.tipo,
              color: vehicle.color,
              model: vehicle.modelo
            },
            embedding: await this.generateEmbedding(content)
          };
        }) || []);
      }

      // Si hay institutionId, obtener vehículos de usuarios de esa institución
      // Primero obtener usuarios de la institución
      const { data: institutionUsers, error: usersError } = await supabase
        .from('registro')
        .select('id_usuario')
        .eq('id_institucion', institutionId);

      if (usersError) throw usersError;

      if (!institutionUsers || institutionUsers.length === 0) {
        return [];
      }

      const userIds = institutionUsers.map(reg => reg.id_usuario);

      // Luego obtener vehículos validados de esos usuarios
      const { data: vehicles, error } = await supabase
        .from('vehiculo')
        .select(`
          placa,
          color,
          modelo,
          tipo_vehiculo!inner(tipo)
        `)
        .eq('validacion', 'validado')
        .in('id_usuario', userIds);

      if (error) throw error;

      return Promise.all(vehicles?.map(async (vehicle: any) => {
        const content = `Vehículo validado de nuestra institución
Placa: ${vehicle.placa}
Tipo: ${vehicle.tipo_vehiculo?.tipo || 'No especificado'}
Color: ${vehicle.color}
Modelo: ${vehicle.modelo}
Estado: Validado y disponible para transporte universitario`;

        return {
          id: `vehicle_${vehicle.placa}`,
          content,
          metadata: {
            type: 'vehicle' as const,
            plate: vehicle.placa,
            vehicleType: vehicle.tipo_vehiculo?.tipo,
            color: vehicle.color,
            model: vehicle.modelo,
            institutionId: institutionId
          },
          embedding: await this.generateEmbedding(content)
        };
      }) || []);
    } catch (error) {
      console.error('❌ Error fetching vehicles data:', error);
      return [];
    }
  }

  // Obtener datos de viajes para embeddings (sin información personal)
  async getTripsData(): Promise<EmbeddingData[]> {
    try {
      const { data: trips, error } = await supabase
        .from('viaje')
        .select(`
          id_viaje,
          id_ruta,
          fecha,
          hora_salida,
          hora_llegada,
          created_at
        `);

      if (error) throw error;

      return Promise.all(trips?.map(async (trip: any) => {
        const content = `Viaje programado
Fecha: ${new Date(trip.fecha).toLocaleDateString('es-CO')}
Hora de salida: ${trip.hora_salida}
Hora de llegada: ${trip.hora_llegada || 'No especificada'}
Disponible en UGUEE`;

        return {
          id: `trip_${trip.id_viaje}`,
          content,
          metadata: {
            type: 'trip' as const,
            tripId: trip.id_viaje,
            routeId: trip.id_ruta,
            date: trip.fecha,
            departureTime: trip.hora_salida,
            arrivalTime: trip.hora_llegada
          },
          embedding: await this.generateEmbedding(content)
        };
      }) || []);
    } catch (error) {
      console.error('❌ Error fetching trips data:', error);
      return [];
    }
  }

  // Generar todos los embeddings filtrados por institución
  async generateAllEmbeddings(institutionId?: number): Promise<EmbeddingData[]> {
    console.log('🔄 Generando embeddings de datos institucionales...');
    
    const [routes, institutions, vehicles, trips] = await Promise.all([
      this.getRoutesDataByInstitution(institutionId),
      this.getInstitutionsDataByUser(institutionId),
      this.getVehiclesDataByInstitution(institutionId),
      this.getTripsData()
    ]);

    const allEmbeddings = [...routes, ...institutions, ...vehicles, ...trips];
    console.log(`✅ Se generaron ${allEmbeddings.length} embeddings`);
    console.log(`📍 Rutas: ${routes.length}`);
    console.log(`🏫 Instituciones: ${institutions.length}`);
    console.log(`🚗 Vehículos validados: ${vehicles.length}`);
    console.log(`✈️ Viajes programados: ${trips.length}`);
    
    if (institutionId) {
      console.log(`🏛️ Datos filtrados para institución ID: ${institutionId}`);
    }
    
    return allEmbeddings;
  }

  // Buscar similitudes usando producto punto
  findSimilarEmbeddings(queryEmbedding: number[], embeddings: EmbeddingData[], topK: number = 5): EmbeddingData[] {
    const similarities = embeddings.map(item => ({
      ...item,
      similarity: this.cosineSimilarity(queryEmbedding, item.embedding || [])
    }));

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  // Calcular similitud coseno
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    
    return dotProduct / (magnitudeA * magnitudeB);
  }
}

export type { EmbeddingData }; 