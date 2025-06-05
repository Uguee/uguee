import { useState, useCallback, useRef, useEffect } from 'react';
import { ChatbotService, ChatMessage, ChatbotResponse } from '../services/chatbotService';

interface UseChatbotConfig {
  apiKey: string;
  institutionId?: number;
  autoInitialize?: boolean;
}

interface UseChatbotReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  sendMessage: (message: string) => Promise<void>;
  clearChat: () => void;
  initialize: () => Promise<void>;
  refreshKnowledge: () => Promise<void>;
  stats: any;
}

export const useChatbot = ({ apiKey, institutionId, autoInitialize = true }: UseChatbotConfig): UseChatbotReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>({});
  
  const chatbotServiceRef = useRef<ChatbotService | null>(null);

  // Inicializar el servicio
  const initialize = useCallback(async () => {
    if (!apiKey) {
      setError('API key de Gemini no configurada');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      if (!chatbotServiceRef.current) {
        // Importación dinámica para evitar errores si las dependencias no están instaladas
        const { ChatbotService } = await import('../services/chatbotService');
        chatbotServiceRef.current = new ChatbotService(apiKey, institutionId);
      }

      await chatbotServiceRef.current.initialize();
      setIsInitialized(true);
      
      // Obtener estadísticas
      const serviceStats = chatbotServiceRef.current.getStats();
      setStats(serviceStats);
      
      // Agregar mensaje de bienvenida
      const welcomeMessage = chatbotServiceRef.current.getWelcomeMessage();
      const welcomeChatMessage: ChatMessage = {
        id: `welcome_${Date.now()}`,
        role: 'assistant',
        content: welcomeMessage.message,
        timestamp: new Date()
      };
      
      setMessages([welcomeChatMessage]);
      
    } catch (error: any) {
      console.error('Error inicializando chatbot:', error);
      setError(`Error inicializando chatbot: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, institutionId]);

  // Enviar mensaje
  const sendMessage = useCallback(async (message: string) => {
    if (!chatbotServiceRef.current || !isInitialized) {
      setError('Chatbot no inicializado');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Agregar mensaje del usuario
      const userMessage: ChatMessage = {
        id: `user_${Date.now()}`,
        role: 'user',
        content: message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);

      // Obtener respuesta del chatbot
      const response = await chatbotServiceRef.current.processQuestion(message, messages);
      
      // Agregar respuesta del asistente
      const assistantMessage: ChatMessage = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: response.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error: any) {
      console.error('Error enviando mensaje:', error);
      setError(`Error enviando mensaje: ${error.message}`);
      
      // Agregar mensaje de error
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: 'Lo siento, hubo un error procesando tu mensaje. Por favor intenta de nuevo.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, messages]);

  // Limpiar chat
  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    
    // Agregar mensaje de bienvenida nuevamente
    if (chatbotServiceRef.current && isInitialized) {
      const welcomeMessage = chatbotServiceRef.current.getWelcomeMessage();
      const welcomeChatMessage: ChatMessage = {
        id: `welcome_${Date.now()}`,
        role: 'assistant',
        content: welcomeMessage.message,
        timestamp: new Date()
      };
      
      setMessages([welcomeChatMessage]);
    }
  }, [isInitialized]);

  // Actualizar conocimiento
  const refreshKnowledge = useCallback(async () => {
    if (!chatbotServiceRef.current) return;

    try {
      setIsLoading(true);
      await chatbotServiceRef.current.refreshEmbeddings();
      
      // Actualizar estadísticas
      const serviceStats = chatbotServiceRef.current.getStats();
      setStats(serviceStats);
      
    } catch (error: any) {
      console.error('Error actualizando conocimiento:', error);
      setError(`Error actualizando conocimiento: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-inicializar si está habilitado
  useEffect(() => {
    if (autoInitialize && apiKey && !isInitialized && !chatbotServiceRef.current) {
      initialize();
    }
  }, [autoInitialize, apiKey, isInitialized, initialize]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (chatbotServiceRef.current) {
        chatbotServiceRef.current.cleanup();
      }
    };
  }, []);

  return {
    messages,
    isLoading,
    isInitialized,
    error,
    sendMessage,
    clearChat,
    initialize,
    refreshKnowledge,
    stats
  };
}; 