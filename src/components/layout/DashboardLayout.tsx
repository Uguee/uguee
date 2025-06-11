import React, { useState, useEffect } from 'react';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from './AppSidebar'
import Navbar from './Navbar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useLocation } from 'react-router-dom';

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
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen && ChatbotComponent && (
        <div className="mb-4">
          <ChatbotComponent institutionId={institutionId} />
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-primary text-white rounded-full p-4 shadow-lg hover:bg-primary/90 transition-colors"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        )}
      </button>
    </div>
  );
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const { currentUserId } = useCurrentUser();
  const [institutionId, setInstitutionId] = useState<number | undefined>();
  const location = useLocation();

  // Obtener la institución del usuario
  useEffect(() => {
    const fetchUserInstitution = async () => {
      if (!currentUserId) return;

      try {
        const { data: registro } = await supabase
          .from('registro')
          .select('id_institucion')
          .eq('id_usuario', currentUserId)
          .single();

        if (registro) {
          setInstitutionId(registro.id_institucion);
        }
      } catch (error) {
        console.error('Error fetching user institution:', error);
      }
    };

    fetchUserInstitution();
  }, [currentUserId]);

  // Determinar si se debe mostrar el sidebar
  const shouldShowSidebar = !location.pathname.startsWith('/admin') && !location.pathname.startsWith('/institution');

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <SidebarProvider>
        <div className="flex-1 flex">
          {shouldShowSidebar && <AppSidebar />}
          <main className="flex-1 flex flex-col">
            {shouldShowSidebar && (
              <div className="p-4">
                <SidebarTrigger />
              </div>
            )}
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
