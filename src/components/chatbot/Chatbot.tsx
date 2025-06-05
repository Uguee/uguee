import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChatbot } from '@/hooks/useChatbot';
import { getGeminiApiKey } from '@/config/gemini';
import { 
  MessageCircle, 
  Send, 
  Trash2, 
  RefreshCw, 
  Bot, 
  User,
  Minimize2,
  Maximize2,
  AlertCircle,
  Loader2,
  X
} from 'lucide-react';
import { GEMINI_CONFIG } from '../../config/gemini';

interface ChatbotProps {
  institutionId?: number;
  isEmbedded?: boolean;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const Chatbot: React.FC<ChatbotProps> = ({ institutionId, isEmbedded = false }) => {
  const [isMinimized, setIsMinimized] = useState(true);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Inicializar chatbot con manejo de errores
  const [apiKey, setApiKey] = useState<string>('');
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const key = getGeminiApiKey();
      setApiKey(key);
      setInitError(null);
    } catch (error: any) {
      setInitError(error.message);
      console.error('Error obteniendo API key:', error);
    }
  }, []);

  const {
    messages,
    isLoading,
    isInitialized,
    error,
    sendMessage,
    clearChat,
    initialize,
    refreshKnowledge,
    stats
  } = useChatbot({
    apiKey: GEMINI_CONFIG.API_KEY,
    institutionId: institutionId,
    autoInitialize: true
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !isInitialized) return;

    const message = input.trim();
    setInput('');
    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-CO', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Renderizado para modo embebido (flotante)
  if (isEmbedded) {
    return (
      <div className="h-full flex flex-col">
        {/* Área de mensajes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!isInitialized ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-purple-600" />
                <p className="text-sm text-gray-600">Inicializando asistente...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center text-red-600 p-4">
              <p className="mb-2">Error: {error}</p>
              <button
                onClick={initialize}
                className="text-sm bg-red-100 hover:bg-red-200 px-3 py-1 rounded transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      message.role === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-purple-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg px-3 py-2 flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-gray-600">Escribiendo...</span>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input de mensajes */}
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Pregúntame sobre rutas, vehículos o instituciones..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={!isInitialized || isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || !isInitialized || isLoading}
              className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Renderizado para modo independiente (página completa)
  return (
    <div className="max-w-4xl mx-auto h-[600px] bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Asistente Virtual UGUEE</h2>
            <p className="text-purple-100 text-sm">
              Información sobre transporte universitario
              {institutionId && ' • Datos de tu institución'}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={refreshKnowledge}
              disabled={isLoading}
              className="p-2 hover:bg-white/10 rounded-md transition-colors"
              title="Actualizar conocimiento"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={clearChat}
              className="p-2 hover:bg-white/10 rounded-md transition-colors"
              title="Limpiar chat"
            >
              <MessageCircle className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Estado y estadísticas */}
      {isInitialized && stats && (
        <div className="bg-gray-50 px-4 py-2 text-xs text-gray-600 border-b">
          📊 Datos disponibles: {stats.totalEmbeddings} registros 
          • 📍 Rutas: {stats.routes} 
          • 🏫 Instituciones: {stats.institutions} 
          • 🚗 Vehículos: {stats.vehicles}
          {institutionId && ` • Filtrado por institución ID: ${institutionId}`}
        </div>
      )}

      {/* Área de mensajes */}
      <div className="h-[400px] overflow-y-auto p-4 space-y-4">
        {!isInitialized ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
              <p className="text-gray-600">Inicializando asistente virtual...</p>
              <p className="text-sm text-gray-500 mt-2">
                Cargando información de rutas y vehículos
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center text-red-600 p-8">
            <X className="h-12 w-12 mx-auto mb-4" />
            <p className="mb-4">Error inicializando el chatbot: {error}</p>
            <button
              onClick={initialize}
              className="bg-red-100 hover:bg-red-200 px-4 py-2 rounded-md transition-colors"
            >
              Reintentar inicialización
            </button>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-purple-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-3 flex items-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-3" />
                  <span className="text-gray-600">El asistente está escribiendo...</span>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de mensajes */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Pregúntame sobre rutas disponibles, vehículos, horarios o tu institución..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={!isInitialized || isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || !isInitialized || isLoading}
            className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <Send className="h-4 w-4" />
            <span>Enviar</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot; 