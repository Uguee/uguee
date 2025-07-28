# Nuevo Flujo de Verificación de Email - Documentación

## Problema Identificado

El error 401 ocurría porque el usuario no tenía una sesión válida después del registro, ya que Supabase requiere verificación de email antes de crear una sesión activa.

### Problema Anterior:

```
Registro → verify-identity → permissions → start-verification → document-verification
                                                                        ↓
                                                                 Error 401 (No token válido)
```

## Nueva Solución Implementada

### Nuevo Flujo:

```
Registro → email-verification → verify-identity → permissions → start-verification → document-verification
              ↓                      ↓
    Verificar email          Login automático
    (Supabase Auth)         (Token válido)
```

## Componentes Agregados

### 1. **EmailVerificationScreen**

- **Ubicación**: `uguee/mobile/screens/EmailVerificationScreen.tsx`
- **Propósito**: Guiar al usuario para verificar su email antes de continuar

#### Funcionalidades:

- ✅ **Instrucciones claras** para verificar email
- ✅ **Botón "Ya verifiqué"** que intenta hacer login
- ✅ **Reenvío de email** con countdown de 60 segundos
- ✅ **Manejo de errores** si el email no está verificado
- ✅ **Login automático** después de verificación exitosa

### 2. **Estado de Credenciales**

```typescript
// En App.tsx
const [userCredentials, setUserCredentials] = useState<{
  email: string;
  password: string;
} | null>(null);
```

- **Propósito**: Guardar credenciales durante el proceso de verificación
- **Uso**: Para hacer login automático después de verificar email

### 3. **Modificaciones en AuthService**

```typescript
// NO guardar sesión automáticamente después del registro
if (data.session) {
  console.log(
    "⚠️ Sesión disponible pero no se guardará hasta verificación de email"
  );
  // this.saveSession(data.session, appUser); // ← Comentado
}
```

### 4. **Modificaciones en useAuth**

```typescript
// NO hacer login automático después del registro
if (response.success) {
  console.log("✅ Registro exitoso, usuario debe verificar email");
  setUser(null); // ← Mantener usuario como null hasta verificación
}
```

## Flujo Detallado

### **Paso 1: Registro**

1. Usuario llena formulario en `RegisterScreen`
2. Se guardan credenciales en `userCredentials`
3. Se llama a `AuthService.register()`
4. Usuario se crea en Supabase Auth (sin sesión activa)
5. Se redirige a `email-verification`

### **Paso 2: Verificación de Email**

1. Usuario ve `EmailVerificationScreen`
2. Recibe email de verificación de Supabase
3. Hace clic en enlace de verificación
4. Regresa a la app y presiona "Ya verifiqué"
5. Se intenta hacer login con credenciales guardadas

### **Paso 3: Login Automático**

```typescript
const handleCheckVerification = async () => {
  const loginResult = await login({
    email: userEmail,
    password: userPassword,
  });

  if (loginResult) {
    // Email verificado exitosamente
    onVerificationComplete(); // → verify-identity
  } else {
    // Email aún no verificado
    Alert.alert("Email no verificado");
  }
};
```

### **Paso 4: Continuar con Verificación de Identidad**

1. Usuario ahora tiene sesión válida y token
2. `useCedula` puede obtener la cédula correctamente
3. `handleStartVerificationProcess` tiene token válido
4. `document-verification` funciona sin error 401

## Estado en Supabase

### **Antes de Verificar Email:**

```sql
-- Tabla auth.users
{
  id: "uuid",
  email: "usuario@ejemplo.com",
  email_confirmed_at: null, -- ← NULL
  last_sign_in_at: null      -- ← NULL
}
```

### **Después de Verificar Email:**

```sql
-- Tabla auth.users
{
  id: "uuid",
  email: "usuario@ejemplo.com",
  email_confirmed_at: "2024-01-01T00:00:00Z", -- ← Fecha
  last_sign_in_at: "2024-01-01T00:00:00Z"     -- ← Fecha
}
```

## Beneficios

- ✅ **Token válido garantizado** - Usuario siempre tiene sesión activa
- ✅ **Eliminación del error 401** - No más problemas de autorización
- ✅ **Flujo claro para el usuario** - Sabe exactamente qué hacer
- ✅ **Cumple con mejores prácticas** - Verificación de email obligatoria
- ✅ **Experiencia mejorada** - Proceso guiado paso a paso

## Handlers Agregados

### **En App.tsx:**

```typescript
const handleEmailVerificationComplete = () => {
  console.log("✅ Email verificado, continuando a verify-identity");
  setCurrentScreen("verify-identity");
};

const handleGoBackFromEmailVerification = () => {
  setUserCredentials(null); // Limpiar credenciales
  setCurrentScreen("register");
};
```

## Manejo de Errores

### **Email no verificado:**

```typescript
if (error.message.includes("Email not confirmed")) {
  Alert.alert("Email no verificado", "Tu email aún no ha sido verificado...");
}
```

### **Error de login:**

```typescript
catch (error: any) {
  Alert.alert("Error", "No se pudo verificar el estado del email");
}
```

## Próximos Pasos

1. **Monitorear** que el flujo funcione correctamente
2. **Verificar** que no haya más errores 401
3. **Considerar** agregar indicador visual de estado de verificación
4. **Evaluar** agregar verificación automática periódica
