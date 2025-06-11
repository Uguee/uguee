import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { UserService } from '@/services/userService';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, FileText, Upload, CheckCircle } from 'lucide-react';
import { LicenseService } from '@/services/licenseService';

const DriverRegister = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    cedula: '',
    driverLicense: '',
    licensePhoto: null as File | null
  });

  const handleLicensePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, licensePhoto: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!user?.id) {
        throw new Error('No se pudo obtener el usuario autenticado');
      }

      // Get user data to get id_usuario
      const userData = await UserService.getUserDataFromUsuarios(user.id);
      if (!userData?.id_usuario) {
        throw new Error('No se pudo obtener el ID de usuario');
      }

      // Upload license photo if provided
      if (formData.licensePhoto) {
        // Convert File to data URI
        const dataURI = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(formData.licensePhoto!);
        });

        // Upload using LicenseService
        const uploadResult = await LicenseService.uploadLicense(
          dataURI,
          userData.id_usuario
        );

        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Error al subir la foto de la licencia');
        }

        console.log('File uploaded successfully:', uploadResult);
      }

      // Update the registro table
      const { error: updateError } = await supabase
        .from('registro')
        .update({ validacion_conductor: 'pendiente' })
        .eq('id_usuario', userData.id_usuario);

      if (updateError) {
        throw new Error('Error al actualizar el estado del conductor');
      }

      // Redirect to dashboard on success
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Error in handleSubmit:', err);
      setError(err.message || 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Registro como Conductor</CardTitle>
          <CardDescription>
            Complete el formulario para solicitar ser conductor
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="cedula">Cédula</Label>
              <Input
                id="cedula"
                type="text"
                value={formData.cedula}
                onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                placeholder="Ingrese su número de cédula"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="driverLicense">Licencia de Conducción</Label>
              <Input
                id="driverLicense"
                type="text"
                value={formData.driverLicense}
                onChange={(e) => setFormData({ ...formData, driverLicense: e.target.value })}
                placeholder="Ingrese su número de licencia"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Foto de la Licencia
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLicensePhotoChange}
                  className="hidden"
                  id="license-photo"
                />
                <label htmlFor="license-photo" className="cursor-pointer">
                  {formData.licensePhoto ? (
                    <div className="space-y-2">
                      <CheckCircle className="w-8 h-8 text-green-600 mx-auto" />
                      <p className="text-green-600 font-medium">{formData.licensePhoto.name}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                      <p className="text-gray-600">Haz clic para subir la foto de tu licencia</p>
                      <p className="text-sm text-gray-400">PNG, JPG hasta 5MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Procesando...' : 'Enviar Solicitud'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverRegister; 