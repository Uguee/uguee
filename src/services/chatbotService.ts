import { GoogleGenerativeAI } from '@google/generative-ai';
import { EmbeddingService } from './embeddingService';
import { GEMINI_CONFIG } from '@/config/gemini';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatbotResponse {
  message: string;
  sources?: Array<{
    type: string;
    content: string;
    metadata: any;
  }>;
}

export class ChatbotService {
  private genAI: GoogleGenerativeAI;
  private embeddingService: EmbeddingService;
  private embeddings: any[] = [];
  private isInitialized = false;
  private institutionId?: number;

  constructor(apiKey: string, institutionId?: number) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.embeddingService = new EmbeddingService(apiKey);
    this.institutionId = institutionId;
  }

  // Inicializar el servicio generando embeddings filtrados por institución
  async initialize(): Promise<void> {
    try {
      console.log('🤖 Inicializando chatbot institucional...');
      this.embeddings = await this.embeddingService.generateAllEmbeddings(this.institutionId);
      this.isInitialized = true;
      console.log('✅ Chatbot inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando chatbot:', error);
      throw error;
    }
  }

  // Procesar pregunta del usuario
  async processQuestion(question: string, chatHistory: ChatMessage[] = []): Promise<ChatbotResponse> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Generar embedding de la pregunta
      const questionEmbedding = await this.embeddingService.generateEmbedding(question);
      
      // Buscar contexto relevante
      const relevantContext = this.embeddingService.findSimilarEmbeddings(
        questionEmbedding, 
        this.embeddings, 
        10
      );

      // Construir contexto para el modelo
      const context = relevantContext.map(item => item.content).join('\n\n');
      
      // Crear prompt con contexto
      const prompt = this.buildPrompt(question, context, chatHistory);
      
      // Generar respuesta usando el modelo actualizado
      const model = this.genAI.getGenerativeModel({ 
        model: GEMINI_CONFIG.MODELS.GENERATIVE,
        generationConfig: GEMINI_CONFIG.GENERATION_CONFIG,
        safetySettings: GEMINI_CONFIG.SAFETY_SETTINGS
      });
      
      const result = await model.generateContent(prompt);
      const response = result.response.text();

      return {
        message: response,
        sources: relevantContext.map(item => ({
          type: item.metadata.type,
          content: item.content,
          metadata: item.metadata
        }))
      };
    } catch (error) {
      console.error('❌ Error procesando pregunta:', error);
      return {
        message: 'Lo siento, hubo un error procesando tu pregunta. Por favor intenta de nuevo.',
        sources: []
      };
    }
  }

  // Construir prompt contextual
  private buildPrompt(question: string, context: string, chatHistory: ChatMessage[]): string {
    const systemPrompt = `Eres un asistente virtual informativo para UGUEE, una plataforma de transporte universitario en Colombia.

INSTRUCCIONES IMPORTANTES:
- Eres ÚNICAMENTE informativo: proporciona información clara y específica
- Responde ÚNICAMENTE basándote en la información proporcionada en el contexto
- Si no tienes información, dilo claramente: "No tengo información disponible sobre..."
- Sé preciso, directo y profesional
- NO hagas sugerencias ni recomendaciones, solo informa
- Enfócate en: rutas disponibles, ubicaciones específicas, vehículos validados, información institucional
- Responde en español de forma clara y estructurada

FORMATO PARA RUTAS:
- Muestra las rutas exactas con sus coordenadas específicas
- Formato: "Punto de partida: [coordenadas] - Punto de llegada: [coordenadas]"
- Incluye la distancia en metros cuando esté disponible
- Lista todas las rutas disponibles si preguntan por rutas

FORMATO PARA VEHÍCULOS:
- Solo menciona vehículos validados
- Incluye: placa, tipo, color, modelo
- Indica si pertenecen a la institución del usuario

FORMATO PARA INSTITUCIONES:
- Proporciona: nombre oficial, dirección, colores institucionales
- Solo información oficial y verificada

CONTEXTO DISPONIBLE:
${context}

HISTORIAL DE CONVERSACIÓN:
${chatHistory.slice(-3).map(msg => `${msg.role}: ${msg.content}`).join('\n')}

PREGUNTA ACTUAL: ${question}

RESPUESTA (información específica y directa):`;

    return systemPrompt;
  }

  // Generar respuesta de bienvenida
  getWelcomeMessage(): ChatbotResponse {
    return {
      message: `¡Hola! 👋 Soy el asistente virtual de UGUEE. 

Estoy aquí para ayudarte con información sobre:
🚌 Rutas de transporte universitario disponibles
🏫 Instituciones educativas que atendemos
🚗 Vehículos validados para el servicio
🕐 Horarios de viajes programados

¿En qué puedo ayudarte hoy? Puedes preguntarme sobre rutas disponibles, destinos, o cualquier información sobre nuestro servicio de transporte.`,
      sources: []
    };
  }

  // Actualizar embeddings (para llamar periódicamente)
  async refreshEmbeddings(): Promise<void> {
    try {
      console.log('🔄 Actualizando embeddings...');
      this.embeddings = await this.embeddingService.generateAllEmbeddings();
      console.log('✅ Embeddings actualizados');
    } catch (error) {
      console.error('❌ Error actualizando embeddings:', error);
    }
  }

  // Verificar si está inicializado
  isReady(): boolean {
    return this.isInitialized;
  }

  // Obtener estadísticas
  getStats() {
    return {
      totalEmbeddings: this.embeddings.length,
      embeddingsByType: this.embeddings.reduce((acc, item) => {
        acc[item.metadata.type] = (acc[item.metadata.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      isInitialized: this.isInitialized
    };
  }

  // Limpiar recursos
  cleanup(): void {
    this.embeddings = [];
    this.isInitialized = false;
  }
}

// Función helper para crear instancia del chatbot
export const createChatbotService = (apiKey: string, institutionId?: number): ChatbotService => {
  return new ChatbotService(apiKey, institutionId);
};

// Export tipos
export type { ChatMessage, ChatbotResponse }; 