export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      documento: {
        Row: {
          fecha_expedicion: string | null
          fecha_vencimiento: string | null
          id: number
          imagen: string
          lugar_expedi: string | null
          tipo: string | null
        }
        Insert: {
          fecha_expedicion?: string | null
          fecha_vencimiento?: string | null
          id?: number
          imagen: string
          lugar_expedi?: string | null
          tipo?: string | null
        }
        Update: {
          fecha_expedicion?: string | null
          fecha_vencimiento?: string | null
          id?: number
          imagen?: string
          lugar_expedi?: string | null
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documento_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "usuario"
            referencedColumns: ["id"]
          },
        ]
      }
      documento_vehicular: {
        Row: {
          fecha_vencimiento: string | null
          id_placa: string | null
          imagen: string | null
          numero: number
          tipo: string
        }
        Insert: {
          fecha_vencimiento?: string | null
          id_placa?: string | null
          imagen?: string | null
          numero?: number
          tipo: string
        }
        Update: {
          fecha_vencimiento?: string | null
          id_placa?: string | null
          imagen?: string | null
          numero?: number
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "documento_vehicular_id_placa_fkey"
            columns: ["id_placa"]
            isOneToOne: false
            referencedRelation: "vehiculo"
            referencedColumns: ["placa"]
          },
        ]
      }
      institucion: {
        Row: {
          colores: string | null
          direccion: string | null
          id: string
          logo: string | null
          nombre_oficial: string
        }
        Insert: {
          colores?: string | null
          direccion?: string | null
          id: string
          logo?: string | null
          nombre_oficial: string
        }
        Update: {
          colores?: string | null
          direccion?: string | null
          id?: string
          logo?: string | null
          nombre_oficial?: string
        }
        Relationships: []
      }
      pasajeros: {
        Row: {
          id: number
          id_PK: number
        }
        Insert: {
          id?: number
          id_PK: number
        }
        Update: {
          id?: number
          id_PK?: number
        }
        Relationships: [
          {
            foreignKeyName: "pasajeros_id_fkey"
            columns: ["id"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["id"]
          },
        ]
      }
      registro: {
        Row: {
          celular: string | null
          codigo_de_estudiante: string | null
          contrasena: string | null
          correo_institucional: string | null
          direccion_de_residencia: string | null
          documentos: string | null
          es_conductor: boolean | null
          es_pasajero: boolean | null
          id_institucion: string
          id_usuario: number
        }
        Insert: {
          celular?: string | null
          codigo_de_estudiante?: string | null
          contrasena?: string | null
          correo_institucional?: string | null
          direccion_de_residencia?: string | null
          documentos?: string | null
          es_conductor?: boolean | null
          es_pasajero?: boolean | null
          id_institucion: string
          id_usuario: number
        }
        Update: {
          celular?: string | null
          codigo_de_estudiante?: string | null
          contrasena?: string | null
          correo_institucional?: string | null
          direccion_de_residencia?: string | null
          documentos?: string | null
          es_conductor?: boolean | null
          es_pasajero?: boolean | null
          id_institucion?: string
          id_usuario?: number
        }
        Relationships: [
          {
            foreignKeyName: "registro_id_institucion_fkey"
            columns: ["id_institucion"]
            isOneToOne: false
            referencedRelation: "institucion"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registro_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["id"]
          },
        ]
      }
      rol: {
        Row: {
          rol: string
        }
        Insert: {
          rol: string
        }
        Update: {
          rol?: string
        }
        Relationships: []
      }
      ruta: {
        Row: {
          id: string
          longitud: number | null
          punto_llegada: number | null
          punto_partida: number | null
          trayecto: string | null
        }
        Insert: {
          id: string
          longitud?: number | null
          punto_llegada?: number | null
          punto_partida?: number | null
          trayecto?: string | null
        }
        Update: {
          id?: string
          longitud?: number | null
          punto_llegada?: number | null
          punto_partida?: number | null
          trayecto?: string | null
        }
        Relationships: []
      }
      ruta_usuario: {
        Row: {
          id_ruta: string
          id_usuario: number
        }
        Insert: {
          id_ruta: string
          id_usuario: number
        }
        Update: {
          id_ruta?: string
          id_usuario?: number
        }
        Relationships: [
          {
            foreignKeyName: "ruta_usuario_id_ruta_fkey"
            columns: ["id_ruta"]
            isOneToOne: false
            referencedRelation: "ruta"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ruta_usuario_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["id"]
          },
        ]
      }
      tipo: {
        Row: {
          tipo: string
        }
        Insert: {
          tipo: string
        }
        Update: {
          tipo?: string
        }
        Relationships: []
      }
      usuario: {
        Row: {
          contrasena: string
          edad: number | null
          id: number
          nombre: string
        }
        Insert: {
          contrasena: string
          edad?: number | null
          id?: number
          nombre: string
        }
        Update: {
          contrasena?: string
          edad?: number | null
          id?: number
          nombre?: string
        }
        Relationships: []
      }
      usuario_rol: {
        Row: {
          id_rol: string
          id_usuario: number
        }
        Insert: {
          id_rol: string
          id_usuario: number
        }
        Update: {
          id_rol?: string
          id_usuario?: number
        }
        Relationships: [
          {
            foreignKeyName: "usuario_rol_id_rol_fkey"
            columns: ["id_rol"]
            isOneToOne: false
            referencedRelation: "rol"
            referencedColumns: ["rol"]
          },
          {
            foreignKeyName: "usuario_rol_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["id"]
          },
        ]
      }
      vehiculo: {
        Row: {
          color: string | null
          fecha_tecnomecanica: string | null
          id_tipo: string | null
          id_usuario: number | null
          modelo: string | null
          placa: string
          qr: number | null
          vigencia_del_soat: string | null
        }
        Insert: {
          color?: string | null
          fecha_tecnomecanica?: string | null
          id_tipo?: string | null
          id_usuario?: number | null
          modelo?: string | null
          placa: string
          qr?: number | null
          vigencia_del_soat?: string | null
        }
        Update: {
          color?: string | null
          fecha_tecnomecanica?: string | null
          id_tipo?: string | null
          id_usuario?: number | null
          modelo?: string | null
          placa?: string
          qr?: number | null
          vigencia_del_soat?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehiculo_id_tipo_fkey"
            columns: ["id_tipo"]
            isOneToOne: false
            referencedRelation: "tipo"
            referencedColumns: ["tipo"]
          },
          {
            foreignKeyName: "vehiculo_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["id"]
          },
        ]
      }
      viaje: {
        Row: {
          calificacion: number | null
          descripcion: string | null
          duracion: number | null
          fecha: string
          hora_llegada: string | null
          hora_salida: string
          id_conductor: string
          id_pasajero: number | null
          id_usuario: number
          id_vehiculo: string | null
          numero_votos: number | null
        }
        Insert: {
          calificacion?: number | null
          descripcion?: string | null
          duracion?: number | null
          fecha: string
          hora_llegada?: string | null
          hora_salida: string
          id_conductor: string
          id_pasajero?: number | null
          id_usuario: number
          id_vehiculo?: string | null
          numero_votos?: number | null
        }
        Update: {
          calificacion?: number | null
          descripcion?: string | null
          duracion?: number | null
          fecha?: string
          hora_llegada?: string | null
          hora_salida?: string
          id_conductor?: string
          id_pasajero?: number | null
          id_usuario?: number
          id_vehiculo?: string | null
          numero_votos?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "viaje_id_pasajero_fkey"
            columns: ["id_pasajero"]
            isOneToOne: false
            referencedRelation: "pasajeros"
            referencedColumns: ["id_PK"]
          },
          {
            foreignKeyName: "viaje_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viaje_id_vehiculo_fkey"
            columns: ["id_vehiculo"]
            isOneToOne: false
            referencedRelation: "vehiculo"
            referencedColumns: ["placa"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
