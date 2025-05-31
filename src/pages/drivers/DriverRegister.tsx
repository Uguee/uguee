import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const DriverRegister = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No session found');
      }

      // Call the validation endpoint
      const response = await fetch('https://ezuujivxstyuziclhvhp.supabase.co/functions/v1/request-driver-validation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ 
          id_usuario: user.id,
          email: user.email,
          nombre: `${user.firstName} ${user.lastName}`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit driver registration');
      }

      // Redirect to dashboard on success
      navigate('/passenger/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Registro de Conductor</h1>
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Requisitos para ser conductor</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
                <li>Tener licencia de conducción vigente</li>
                <li>Ser mayor de 18 años</li>
                <li>No tener antecedentes penales</li>
                <li>Tener un vehículo en buen estado</li>
                <li>Contar con seguro vehicular</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
              <h3 className="text-yellow-800 font-semibold mb-2">Importante</h3>
              <p className="text-yellow-700 text-sm">
                Al registrarte como conductor, aceptas que tu información será verificada por nuestro equipo.
                Te notificaremos cuando tu solicitud sea aprobada.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/passenger/dashboard')}
                className="mr-4 px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Enviando...' : 'Registrarme como conductor'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DriverRegister; 