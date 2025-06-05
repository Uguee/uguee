import React, { useState, useEffect } from 'react';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from './AppSidebar'
import Navbar from './Navbar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

// Componente flotante del chatbot
const FloatingChatbot = ({ institutionId }: { institutionId?: number }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Componente del chatbot importado dinámicamente
  const [ChatbotComponent, setChatbotComponent] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    // Importar el componente del chatbot dinámicamente
    const loadChatbot = async () => {
      try {
        setIsLoading(true);
        const { default: Chatbot } = await import('../chatbot/Chatbot');
        setChatbotComponent(() => Chatbot);
      } catch (error) {
        console.error('Error cargando chatbot:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen && !ChatbotComponent) {
      loadChatbot();
    }
  }, [isOpen, ChatbotComponent]);

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 flex items-center justify-center"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-2.4-.328l-3.116 1.04a1 1 0 01-1.27-1.27l1.04-3.116A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
          </svg>
        )}
      </button>

      {/* Modal del chatbot */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-lg shadow-2xl z-50 border border-gray-200">
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Asistente UGUEE</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-purple-100 mt-1">
                Información sobre rutas y transporte universitario
              </p>
            </div>
            
            <div className="flex-1 overflow-hidden">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : ChatbotComponent ? (
                <ChatbotComponent 
                  institutionId={institutionId}
                  isEmbedded={true}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <p>Error cargando el chatbot</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  console.log('Entro al dashboard layout');
  const { user } = useAuth();
  const [institutionId, setInstitutionId] = useState<number | undefined>();

  // Obtener la institución del usuario
  useEffect(() => {
    const fetchUserInstitution = async () => {
      if (!user?.id) return;

      try {
        const { data: registro } = await supabase
          .from('registro')
          .select('id_institucion')
          .eq('id_usuario', user.id)
          .single();

        if (registro) {
          setInstitutionId(registro.id_institucion);
        }
      } catch (error) {
        console.error('Error obteniendo institución del usuario:', error);
      }
    };

    fetchUserInstitution();
  }, [user?.id]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <SidebarProvider>
        <div className="flex-1 flex">
          <AppSidebar />
          <main className="flex-1 flex flex-col">
            <div className="p-4">
              <SidebarTrigger />
            </div>
            <div className="flex-1 px-6 pb-6">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
      
      {/* Chatbot flotante solo para usuarios autenticados */}
      {user && <FloatingChatbot institutionId={institutionId} />}
    </div>
  );
};

export default DashboardLayout;
