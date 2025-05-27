# Uguee - Aplicación Web y Móvil

Este proyecto contiene tanto la versión web como la versión móvil de la aplicación Uguee.

## Estructura del Proyecto

```
uguee/
├── web/          # Aplicación web (React + Vite + TypeScript + Supabase)
├── mobile/       # Aplicación móvil (React Native + Expo + TypeScript)
├── .git/         # Control de versiones compartido
├── .gitignore    # Archivos ignorados globalmente
└── README.md     # Este archivo
```

## Aplicación Web (`/web`)

La aplicación web está construida con:
- **React** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Herramientas de desarrollo y build
- **Tailwind CSS** - Framework de CSS
- **Shadcn/ui** - Componentes de UI
- **Supabase** - Backend completo (autenticación, base de datos, storage)

### Comandos para la Web

```bash
cd web
npm install          # Instalar dependencias
npm run dev          # Ejecutar en modo desarrollo
npm run build        # Construir para producción
npm run preview      # Preview del build de producción
```

## Aplicación Móvil (`/mobile`)

La aplicación móvil está construida con:
- **React Native** - Framework móvil
- **Expo** - Plataforma de desarrollo
- **TypeScript** - Tipado estático

> **Nota**: La aplicación móvil es independiente y no maneja autenticación ni backend directamente. Toda la lógica de Supabase se gestiona desde la aplicación web.

### Comandos para la Aplicación Móvil

```bash
cd mobile
npm install          # Instalar dependencias
npm start            # Iniciar servidor de desarrollo Expo
npm run android      # Ejecutar en Android
npm run ios          # Ejecutar en iOS (requiere macOS)
npm run web          # Ejecutar versión web de Expo
```

### Desarrollo con Expo

1. Instala la aplicación **Expo Go** en tu dispositivo móvil
2. Ejecuta `npm start` en la carpeta `/mobile`
3. Escanea el código QR con la aplicación Expo Go

## Desarrollo

Para trabajar en ambas aplicaciones simultáneamente:

1. **Terminal 1**: `cd web && npm run dev`
2. **Terminal 2**: `cd mobile && npm start`

O desde la raíz del proyecto:
```bash
npm run dev  # Ejecuta ambas aplicaciones simultáneamente
```

## Arquitectura

### Separación de Responsabilidades

- **Aplicación Web**: 
  - Maneja toda la autenticación con Supabase
  - Gestiona la base de datos y storage
  - Interfaz completa de administración
  - APIs y lógica de negocio

- **Aplicación Móvil**:
  - Experiencia móvil nativa optimizada
  - Interfaz de usuario simplificada
  - Navegación móvil intuitiva
  - Funcionalidades específicas móviles (cámara, geolocalización, etc.)

### Próximos Pasos para Mobile

1. **Configurar navegación**: Instalar React Navigation
   ```bash
   cd mobile
   npm install @react-navigation/native @react-navigation/stack
   npx expo install react-native-screens react-native-safe-area-context
   ```

2. **Styling**: NativeWind para usar Tailwind CSS en React Native
   ```bash
   cd mobile
   npm install nativewind
   npm install --save-dev tailwindcss
   ```

3. **Estado local**: Context API o Zustand para manejo de estado
4. **Comunicación con web**: APIs REST o WebSockets para sincronización

## Scripts Disponibles

Desde la raíz del proyecto:

```bash
npm run web:dev          # Solo aplicación web
npm run mobile:start     # Solo aplicación móvil
npm run dev              # Ambas aplicaciones
npm run install:all      # Instalar dependencias de ambas
npm run build:all        # Construir aplicación web
```

## Licencia

[Especifica tu licencia aquí]
