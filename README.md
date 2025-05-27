# Ugüee - Aplicación Web y Móvil

Plataforma para viajar seguro y económico. Este proyecto contiene tanto la versión web como la versión móvil de la aplicación Ugüee.

## 🏗️ Estructura del Proyecto

```
uguee/
├── src/              # Código fuente de la aplicación web
├── public/           # Archivos públicos de la web
├── mobile/           # Aplicación móvil (React Native + Expo)
├── package.json      # Dependencias y scripts principales
├── vite.config.ts    # Configuración de Vite
├── index.html        # Punto de entrada HTML
└── README.md         # Este archivo
```

## 🌐 Aplicación Web

La aplicación web está construida con:
- **React 18** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Herramientas de desarrollo y build
- **Tailwind CSS** - Framework de CSS
- **Shadcn/ui** - Componentes de UI
- **Supabase** - Backend completo (autenticación, base de datos, storage)

### Comandos para la Web

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para desarrollo
npm run build:dev

# Construir para producción
npm run build

# Preview del build
npm run preview
```

## 📱 Aplicación Móvil

La aplicación móvil está construida con:
- **React Native** - Framework móvil
- **Expo SDK 53** - Plataforma de desarrollo
- **TypeScript** - Tipado estático
- **React 19** - Última versión de React

### Funcionalidades Móviles Implementadas

- ✅ Pantalla de bienvenida
- ✅ Sistema de autenticación (Login/Registro)
- ✅ Formulario de registro completo con validación
- ✅ Flujo de verificación de identidad
- ✅ Pantallas de permisos (cámara, video, ubicación)
- ✅ Navegación entre pantallas
- ✅ ScrollView para formularios largos

### Comandos para la Aplicación Móvil

```bash
# Navegar a la carpeta móvil
cd mobile

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo Expo
npx expo start

# Ejecutar en Android
npx expo run:android

# Ejecutar en iOS (requiere macOS)
npx expo run:ios
```

## 🚀 Instalación en un Nuevo PC

### 1. Requisitos Previos

```bash
# Node.js (versión 18 o superior)
# Descargar desde: https://nodejs.org/

# Expo CLI (para desarrollo móvil)
npm install -g @expo/cli

# Git (opcional, para control de versiones)
# Descargar desde: https://git-scm.com/
```

### 2. Configuración del Proyecto

```bash
# 1. Clonar o copiar el proyecto
git clone [URL_DEL_REPOSITORIO]
# o copiar la carpeta completa

# 2. Instalar dependencias de la aplicación web
npm install

# 3. Instalar dependencias de la aplicación móvil
cd mobile
npm install
cd ..
```

### 3. Ejecutar las Aplicaciones

**Aplicación Web:**
```bash
# Desde la raíz del proyecto
npm run dev
# Se abrirá en http://localhost:5173
```

**Aplicación Móvil:**
```bash
# Desde la carpeta mobile
cd mobile
npx expo start

# Opciones:
# - Escanear QR con Expo Go en tu teléfono
# - Presionar 'a' para Android emulator
# - Presionar 'i' para iOS simulator (solo Mac)
# - Presionar 'w' para abrir en navegador web
```

### 4. Para Dispositivos Físicos

1. Instala **Expo Go** desde:
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) (Android)
   - [App Store](https://apps.apple.com/app/expo-go/id982107779) (iOS)

2. Ejecuta `npx expo start` en la carpeta `mobile`
3. Escanea el código QR con Expo Go

## 🛠️ Desarrollo

### Trabajar en Ambas Aplicaciones

```bash
# Terminal 1 - Aplicación Web
npm run dev

# Terminal 2 - Aplicación Móvil
cd mobile && npx expo start
```

### Scripts Disponibles desde la Raíz

```bash
npm run dev              # Aplicación web en desarrollo
npm run build:dev        # Build de desarrollo
npm run build            # Build de producción
npm run preview          # Preview del build
```

## 📋 Variables de Entorno

### Para la Aplicación Web
Crear archivo `.env` en la raíz:
```env
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

### Para la Aplicación Móvil
La aplicación móvil actualmente funciona de forma independiente sin variables de entorno.

## 🎨 Pantallas Móviles Implementadas

1. **WelcomeScreen** - Pantalla inicial con logo y opciones
2. **LoginScreen** - Inicio de sesión
3. **RegisterScreen** - Registro con campos completos
4. **VerifyIdentityScreen** - Confirmación de verificación
5. **CameraPermissionsScreen** - Solicitud de permisos
6. **StartVerificationScreen** - Inicio del proceso de verificación

## 🔧 Tecnologías Utilizadas

### Frontend Web
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Shadcn/ui
- React Router
- Lucide React (iconos)

### Backend
- Supabase (autenticación, base de datos, storage)

### Mobile
- React Native
- Expo SDK 53
- TypeScript
- React Navigation (pendiente)

## 📝 Próximos Pasos

### Para la Aplicación Móvil
1. **Integración con backend**: Conectar con APIs o Supabase
2. **Navegación avanzada**: Implementar React Navigation completo
3. **Funcionalidades nativas**: Cámara, geolocalización, notificaciones
4. **Optimización**: Mejoras de rendimiento y UX

### Para la Aplicación Web
1. **Funcionalidades completas**: Dashboard, gestión de viajes
2. **Optimizaciones**: SEO, performance, accesibilidad

## 📄 Licencia

[Especifica tu licencia aquí]

---

**¡Ugüee - Viaja seguro y económico!** 🚗✈️
