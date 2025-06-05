import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { AuthFlowService } from '@/services/authFlowService';
import { CheckCircle, Circle, AlertCircle } from 'lucide-react';

interface Stage {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

const RegistrationProgress = () => {
  const { user } = useAuth();
  const [stages, setStages] = useState<Stage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserStatus = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const status = await AuthFlowService.getUserStatus(user.id);
        
        const updatedStages: Stage[] = [
          {
            id: 'signup',
            title: 'Registro',
            description: 'Crear tu cuenta en Ugüee',
            isCompleted: true,
            isCurrent: !status.hasDocuments && !status.hasInstitution
          },
          {
            id: 'documents',
            title: 'Verificación de documentos',
            description: 'Subir tus documentos de identidad',
            isCompleted: status.hasDocuments,
            isCurrent: status.hasDocuments && !status.hasInstitution
          },
          {
            id: 'institution',
            title: 'Registro institucional',
            description: 'Registrarte en tu institución',
            isCompleted: status.hasInstitution,
            isCurrent: status.hasInstitution && status.isPending
          },
          {
            id: 'complete',
            title: '¡Listo!',
            description: 'Acceso completo a Ugüee',
            isCompleted: status.hasDocuments && status.hasInstitution && !status.isPending,
            isCurrent: status.hasDocuments && status.hasInstitution && !status.isPending
          }
        ];

        setStages(updatedStages);
      } catch (error) {
        console.error('Error loading user status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserStatus();
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="relative">
        {/* Progress bar */}
        <div className="absolute top-8 left-0 w-full h-1 bg-gray-200">
          <div 
            className="h-full bg-primary transition-all duration-500"
            style={{ 
              width: `${(stages.filter(s => s.isCompleted).length / (stages.length - 1)) * 100}%` 
            }}
          />
        </div>

        {/* Stages */}
        <div className="relative flex justify-between">
          {stages.map((stage, index) => (
            <div key={stage.id} className="flex flex-col items-center">
              <div className={`
                w-16 h-16 rounded-full flex items-center justify-center mb-4
                ${stage.isCompleted ? 'bg-primary text-white' : 
                  stage.isCurrent ? 'bg-primary/20 text-primary' : 'bg-gray-200 text-gray-400'}
              `}>
                {stage.isCompleted ? (
                  <CheckCircle className="w-8 h-8" />
                ) : stage.isCurrent ? (
                  <AlertCircle className="w-8 h-8" />
                ) : (
                  <Circle className="w-8 h-8" />
                )}
              </div>
              <div className="text-center">
                <h3 className={`
                  font-semibold mb-1
                  ${stage.isCurrent ? 'text-primary' : 
                    stage.isCompleted ? 'text-gray-900' : 'text-gray-500'}
                `}>
                  {stage.title}
                </h3>
                <p className="text-sm text-gray-500 max-w-[150px]">
                  {stage.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RegistrationProgress; 