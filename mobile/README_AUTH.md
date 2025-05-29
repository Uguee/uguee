# Sistema de Autenticación Móvil - Ugüee

## Implementación Óptima para Versión Móvil

Este sistema replica la funcionalidad de autenticación de la versión web pero adaptado para React Native, utilizando APIs REST en lugar del cliente Supabase local.

## 🏗️ Arquitectura

### Componentes Principales

1. **AuthService** (`services/authService.ts`)
   - Maneja todas las llamadas a las APIs de Supabase
   - Gestiona tokens y sesiones con AsyncStorage
   - Incluye refresh automático de tokens

2. **useAuth Hook** (`hooks/useAuth.tsx`)
   - Context Provider para estado global de autenticación
   - Funciones de login, register, logout
   - Verificación automática de sesión existente

3. **ProtectedRoute** (`components/ProtectedRoute.tsx`)
   - Componente para proteger pantallas por roles
   - Validación de autenticación y autorización
   - Pantallas de loading y acceso denegado

## 🚀 Instalación

### 1. Instalar Dependencias

```bash
npm install @react-native-async-storage/async-storage
```

### 2. Configurar API Key

En `services/authService.ts`, actualiza la API key:

```typescript
private static apiKey = 'TU_SUPABASE_ANON_KEY_AQUI';
```

### 3. Configurar Endpoints

Verifica que los endpoints en `authService.ts` apunten a tu instancia de Supabase:

```typescript
const API_BASE_URL = 'https://ezuujivxstyuziclhvhp.supabase.co';
```

## 📱 Uso

### 1. Envolver la App con AuthProvider

```tsx
import { AuthProvider } from './hooks/useAuth';

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
```

### 2. Usar el Hook de Autenticación

```tsx
import { useAuth } from './hooks/useAuth';

const LoginScreen = () => {
  const { login, isLoading, error } = useAuth();

  const handleLogin = async () => {
    try {
      const user = await login({ email, password });
      // Redirigir según el rol del usuario
    } catch (error) {
      // Manejar error
    }
  };
};
```

### 3. Proteger Pantallas por Roles

```tsx
import { ProtectedRoute } from './components/ProtectedRoute';

const PassengerDashboard = () => (
  <ProtectedRoute allowedRoles={['pasajero']}>
    <DashboardContent />
  </ProtectedRoute>
);
```

### 4. Verificar Permisos

```tsx
import { usePermissions } from './components/ProtectedRoute';

const SomeComponent = () => {
  const { isPassenger, canAccess, hasRole } = usePermissions();

  if (!canAccess(['pasajero', 'conductor'])) {
    return <AccessDenied />;
  }

  return <Content />;
};
```

## 🔐 Flujo de Autenticación

### Login
1. Usuario ingresa credenciales
2. `AuthService.login()` llama a la API de Supabase
3. Si es exitoso, obtiene datos completos del usuario desde el endpoint
4. Guarda tokens y datos de usuario en AsyncStorage
5. Actualiza el estado global de autenticación

### Verificación de Sesión
1. Al iniciar la app, `useAuth` verifica si hay una sesión guardada
2. Valida si el token ha expirado
3. Si está expirado, intenta refrescarlo automáticamente
4. Si no puede refrescar, limpia la sesión

### Protección de Rutas
1. `ProtectedRoute` verifica si el usuario está autenticado
2. Si no está autenticado, muestra pantalla de login
3. Si está autenticado pero no tiene el rol correcto, muestra acceso denegado
4. Si todo está correcto, renderiza el contenido

## 🎯 Ventajas de esta Implementación

### ✅ **Sin Cliente Supabase Local**
- Usa APIs REST directamente
- Menor tamaño de bundle
- Mayor control sobre las peticiones

### ✅ **Persistencia Robusta**
- AsyncStorage para datos de sesión
- Refresh automático de tokens
- Manejo de expiración

### ✅ **Validación por Roles**
- Sistema granular de permisos
- Componentes reutilizables
- Fácil extensión para nuevos roles

### ✅ **Experiencia de Usuario**
- Loading states apropiados
- Manejo de errores
- Navegación automática según rol

### ✅ **Compatibilidad**
- Misma lógica que la versión web
- Tipos compartidos
- Fácil mantenimiento

## 🔧 Configuración Avanzada

### Personalizar Endpoints

```typescript
const ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/v1/token?grant_type=password`,
  REGISTER: `${API_BASE_URL}/auth/v1/signup`,
  USER_DATA: `${API_BASE_URL}/functions/v1/get-user-data`,
  // Agregar más endpoints según necesidad
};
```

### Personalizar Almacenamiento

```typescript
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth_access_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  USER_DATA: 'auth_user_data',
  // Personalizar claves según necesidad
};
```

### Manejo de Errores Personalizado

```typescript
const { error, clearError } = useAuth();

useEffect(() => {
  if (error) {
    // Mostrar toast, modal, etc.
    Alert.alert('Error', error);
    clearError();
  }
}, [error]);
```

## 🚨 Consideraciones de Seguridad

1. **Tokens**: Se almacenan de forma segura en AsyncStorage
2. **Refresh Automático**: Evita que el usuario tenga que reloguearse constantemente
3. **Validación de Roles**: Se verifica tanto en frontend como backend
4. **Limpieza de Sesión**: Se limpia automáticamente en caso de errores

## 🔄 Migración desde Versión Web

Si ya tienes la versión web funcionando, la migración es directa:

1. Los tipos `User` y `UserRole` son compatibles
2. La lógica de validación es idéntica
3. Solo cambia la implementación del transporte (REST vs Supabase client)

## 📝 Próximos Pasos

1. Implementar pantallas específicas para cada rol
2. Agregar funcionalidad de "Recordarme"
3. Implementar recuperación de contraseña
4. Agregar biometría para autenticación rápida

## 🛠️ Troubleshooting

### Error: npm ERESOLVE dependency conflict

Si ves errores como:
```
npm error ERESOLVE could not resolve
npm error While resolving: react-native@0.79.2
npm error Found: @types/react@18.2.79
npm error Conflicting peer dependency: @types/react@19.1.6
```

**Soluciones en orden de prioridad:**

#### Solución 1: Usar las flags de npm
```bash
# Limpiar caché de npm
npm cache clean --force

# Instalar con legacy peer deps
npm install --legacy-peer-deps
```

#### Solución 2: Usar el archivo .npmrc (ya incluido)
El proyecto ya incluye un archivo `.npmrc` que debería resolver automáticamente estos conflictos:
```
legacy-peer-deps=true
auto-install-peers=true
```

#### Solución 3: Forzar la instalación
```bash
# Si persiste el problema
npm install --force
```

#### Solución 4: Limpiar completamente y reinstalar
```bash
# Eliminar node_modules y package-lock.json
rm -rf node_modules package-lock.json

# Reinstalar con legacy peer deps
npm install --legacy-peer-deps
```

### Error: TurboModuleRegistry.getEnforcing(...) PlatformConstants could not be found

Este error es común después de actualizar Expo SDK. **Soluciones en orden de prioridad:**

#### Solución 1: Limpiar caché completo
```bash
# Detener el servidor si está corriendo
# Luego ejecutar:
npx expo start --clear
```

#### Solución 2: Reinstalar dependencias
```bash
# Eliminar node_modules y reinstalar
rm -rf node_modules
npm install --legacy-peer-deps
npx expo start --clear
```

#### Solución 3: Actualizar Expo CLI
```bash
npm install -g @expo/cli@latest
npx expo install --fix
```

#### Solución 4: Verificar compatibilidad de AsyncStorage
```bash
# Asegurarse de usar la versión correcta para SDK 53
npm install @react-native-async-storage/async-storage@2.1.0 --legacy-peer-deps
```

#### Solución 5: Reiniciar completamente
```bash
# Cerrar Expo Go completamente
# Reiniciar el dispositivo/simulador
# Volver a abrir Expo Go
npx expo start --clear
```

### Error: Project is incompatible with this version of Expo Go

Si ves el error de incompatibilidad de SDK:

1. **Verificar versiones en package.json**:
   ```json
   {
     "dependencies": {
       "expo": "~53.0.0"
     }
   }
   ```

2. **Verificar app.json**:
   ```json
   {
     "expo": {
       "sdkVersion": "53.0.0"
     }
   }
   ```

3. **Reinstalar y limpiar**:
   ```bash
   npm install --legacy-peer-deps
   npx expo start --clear
   ```

### Error de AsyncStorage en React Native 0.79+

Si encuentras errores relacionados con AsyncStorage:

1. **Usar la versión correcta**:
   ```bash
   npm install @react-native-async-storage/async-storage@2.1.0 --legacy-peer-deps
   ```

2. **En iOS, ejecutar**:
   ```bash
   cd ios && pod install
   ```

### Error de conexión a Supabase

1. Verifica que la URL de Supabase sea correcta
2. Confirma que la API key sea válida y tenga los permisos necesarios
3. Revisa que tu proyecto Supabase esté activo

### Error: Metro bundler issues

Si tienes problemas con el bundler:

```bash
# Limpiar caché de Metro
npx expo start --clear
# O alternativamente:
npx react-native start --reset-cache
```

### Problemas persistentes

Si ninguna solución funciona:

1. **Crear un nuevo proyecto Expo** y migrar el código
2. **Verificar que Expo Go esté actualizado** en tu dispositivo
3. **Usar el simulador/emulador** en lugar de Expo Go temporalmente

### Comandos de emergencia

Si todo falla, usa esta secuencia completa:

```bash
# 1. Limpiar todo
rm -rf node_modules package-lock.json
npm cache clean --force

# 2. Reinstalar con configuración legacy
npm install --legacy-peer-deps

# 3. Limpiar caché de Expo
npx expo start --clear

# 4. Si aún falla, actualizar Expo CLI
npm install -g @expo/cli@latest
npx expo install --fix
``` 