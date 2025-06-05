import { HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Configuración para la API de Gemini
export const GEMINI_CONFIG = {
  // API Key - debería venir de variables de entorno
  API_KEY: import.meta.env.VITE_GEMINI_API_KEY || '',
  
  // Modelos disponibles (actualizados a las versiones más recientes)
  MODELS: {
    GENERATIVE: 'gemini-1.5-flash',  // Actualizado desde gemini-pro
    EMBEDDING: 'text-embedding-004', // Actualizado desde embedding-001
    VISION: 'gemini-1.5-flash'         // Para uso futuro con imágenes
  },
  
  // Configuración del modelo generativo
  GENERATION_CONFIG: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 1024,
  },
  
  // Configuración de seguridad
  SAFETY_SETTINGS: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ],
  
  // Configuración del chatbot
  CHATBOT_CONFIG: {
    MAX_HISTORY_LENGTH: 10,
    MAX_EMBEDDING_RESULTS: 5,
    SIMILARITY_THRESHOLD: 0.7,
    AUTO_REFRESH_INTERVAL: 30 * 60 * 1000, // 30 minutos
  }
};

// Validar configuración
export const validateGeminiConfig = (): boolean => {
  if (!GEMINI_CONFIG.API_KEY) {
    console.error('⚠️ VITE_GEMINI_API_KEY no está configurado en las variables de entorno');
    return false;
  }
  
  return true;
};

// Helper para obtener la API key
export const getGeminiApiKey = (): string => {
  if (!GEMINI_CONFIG.API_KEY) {
    throw new Error('Gemini API key no configurado. Agrega VITE_GEMINI_API_KEY a tu archivo .env');
  }
  
  return GEMINI_CONFIG.API_KEY;
}; 