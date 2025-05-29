// Configuración de endpoints de Supabase Functions
export const SUPABASE_FUNCTIONS = {
  BASE_URL: 'https://ezuujivxstyuziclhvhp.supabase.co/functions/v1',
  
  // Endpoints específicos
  GET_USER_DATA: 'https://ezuujivxstyuziclhvhp.supabase.co/functions/v1/get-user-data',
  SYNC_USER: 'https://ezuujivxstyuziclhvhp.supabase.co/functions/v1/sync-user',
  GET_USER_WITH_VALIDATION: 'https://ezuujivxstyuziclhvhp.supabase.co/functions/v1/get-user-with-validation',
} as const;

// Configuración de la aplicación
export const APP_CONFIG = {
  // Timeouts para requests
  REQUEST_TIMEOUT: 10000, // 10 segundos
  
  // Configuración de retry
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 segundo
} as const; 