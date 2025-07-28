# Error 401 en Verificación de Identidad - Documentación

## Problema Específico

El error 401 ocurre cuando el usuario presiona "Iniciar verificación" después del registro y se queda en una pantalla de carga diciendo "Obteniendo cédula..." indefinidamente.

### Flujo Problemático

1. **Registro exitoso** → Usuario se crea en Supabase Auth
2. **Redirección** → Se va a pantalla de verificación de identidad
3. **Obtención de cédula** → `getCedulaByUUID(user.id)` falla con 401
4. **Pantalla bloqueada** → Se muestra "Obteniendo cédula..." sin progreso

### Causa Raíz

El problema está en el timing de sincronización:

- El usuario se registra exitosamente
- Inmediatamente se intenta obtener la cédula
- La sincronización con la base de datos aún no está completa
- `getCedulaByUUID` falla con error 401 (No autorizado)

## Soluciones Implementadas

### 1. **Hook Personalizado `useCedula`**

```typescript
// ✅ Manejo de estado completo
export function useCedula() {
  const { user } = useAuth();
  const [cedula, setCedula] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lógica de obtención con reintentos
}
```

### 2. **Función con Reintentos `getCedulaByUUIDWithRetry`**

```typescript
// ✅ Reintentos automáticos con delays progresivos
export async function getCedulaByUUIDWithRetry(
  uuid: string,
  maxRetries: number = 3
): Promise<number | null> {
  for (let i = 0; i < maxRetries; i++) {
    // Intento con delay progresivo: 2s, 4s, 6s
  }
}
```

### 3. **Pantalla de Carga Mejorada**

```typescript
// ✅ Información clara y botón de reintento
case "document-verification":
  if (cedula === null) {
    return (
      <View>
        <ActivityIndicator />
        <Text>{cedulaLoading ? "Obteniendo cédula..." : "Error obteniendo cédula"}</Text>
        <Text>{cedulaLoading ? "Esto puede tomar unos segundos..." : cedulaError}</Text>
        {!cedulaLoading && <TouchableOpacity onPress={refetchCedula}>Reintentar</TouchableOpacity>}
      </View>
    );
  }
```

### 4. **Mejoras en `getUserDataByUUID`**

```typescript
// ✅ Validación de token y reintentos
if (!currentToken) {
  console.warn("[getUserDataByUUID] No hay token disponible");
  return null;
}

if (res.status === 401 && retryCount < 3) {
  console.log(
    `[getUserDataByUUID] Reintentando en ${(retryCount + 1) * 1000}ms...`
  );
  await new Promise((resolve) => setTimeout(resolve, (retryCount + 1) * 1000));
  return getUserDataByUUID(uuid, retryCount + 1);
}
```

## Flujo Mejorado

### Antes (Problemático)

1. Registro → Inmediatamente intenta obtener cédula → Error 401 → Pantalla bloqueada

### Después (Solucionado)

1. **Registro** → Usuario se crea en Supabase Auth
2. **Delay de sincronización** → 2-3 segundos para completar sync
3. **Obtención con reintentos** → `getCedulaByUUIDWithRetry` con 3 intentos
4. **Pantalla informativa** → Muestra progreso y permite reintento manual
5. **Fallback** → Si falla, muestra error claro con opción de reintento

## Beneficios

- ✅ **Eliminación de pantallas bloqueadas** - El usuario siempre puede progresar
- ✅ **Información clara** - Sabe qué está pasando y cuánto tiempo tomará
- ✅ **Reintentos automáticos** - No requiere intervención manual
- ✅ **Reintento manual** - Opción de reintentar si falla
- ✅ **Logs detallados** - Facilita debugging
- ✅ **Manejo de errores** - Muestra mensajes claros al usuario

## Monitoreo

Los logs ahora incluyen:

- `[useCedula]` - Estado del hook de cédula
- `[getCedulaByUUIDWithRetry]` - Progreso de reintentos
- `[getUserDataByUUID]` - Estado de peticiones con reintentos
- `⏳ Esperando sincronización...` - Delays de sincronización

## Próximos Pasos

1. **Monitorear** logs para verificar reducción de errores 401
2. **Ajustar** tiempos de delay si es necesario
3. **Considerar** implementar webhooks para notificar sincronización completa
4. **Evaluar** cache de cédula para evitar peticiones repetidas
