export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      sales_integration_secrets: {
        Row: {
          created_at: string
          integration_id: string
          provider_secret: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          integration_id: string
          provider_secret?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          integration_id?: string
          provider_secret?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_integration_secrets_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: true
            referencedRelation: "sales_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_integrations: {
        Row: {
          amount_format: string
          created_at: string
          currency: string
          display_name: string
          endpoint_token_hash: string | null
          fixed_fee_minor: number
          id: string
          provider: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_format?: string
          created_at?: string
          currency: string
          display_name: string
          endpoint_token_hash?: string | null
          fixed_fee_minor?: number
          id?: string
          provider: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_format?: string
          created_at?: string
          currency?: string
          display_name?: string
          endpoint_token_hash?: string | null
          fixed_fee_minor?: number
          id?: string
          provider?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sales_transactions: {
        Row: {
          created_at: string
          currency: string
          fee_minor: number
          gross_minor: number
          id: string
          integration_id: string
          net_minor: number
          occurred_at: string | null
          product_name: string | null
          provider_event_id: string
          provider_order_id: string | null
          status: string
          user_id: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          created_at?: string
          currency: string
          fee_minor?: number
          gross_minor: number
          id?: string
          integration_id: string
          net_minor: number
          occurred_at?: string | null
          product_name?: string | null
          provider_event_id: string
          provider_order_id?: string | null
          status: string
          user_id: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          created_at?: string
          currency?: string
          fee_minor?: number
          gross_minor?: number
          id?: string
          integration_id?: string
          net_minor?: number
          occurred_at?: string | null
          product_name?: string | null
          provider_event_id?: string
          provider_order_id?: string | null
          status?: string
          user_id?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_transactions_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "sales_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      scripts: {
        Row: {
          conteudo: string
          created_at: string
          estilo: string | null
          id: string
          monetizacao: string | null
          nome_app: string | null
          o_que_faz: string | null
          objetivo: string | null
          publico: string | null
          script_completo: string | null
          tipo: string
          titulo: string
          user_id: string
        }
        Insert: {
          conteudo?: string
          created_at?: string
          estilo?: string | null
          id?: string
          monetizacao?: string | null
          nome_app?: string | null
          o_que_faz?: string | null
          objetivo?: string | null
          publico?: string | null
          script_completo?: string | null
          tipo?: string
          titulo?: string
          user_id?: string
        }
        Update: {
          conteudo?: string
          created_at?: string
          estilo?: string | null
          id?: string
          monetizacao?: string | null
          nome_app?: string | null
          o_que_faz?: string | null
          objetivo?: string | null
          publico?: string | null
          script_completo?: string | null
          tipo?: string
          titulo?: string
          user_id?: string
        }
        Relationships: []
      }
      user_access: {
        Row: {
          created_at: string
          revoked_at: string | null
          user_id: string
          valid_until: string | null
        }
        Insert: {
          created_at?: string
          revoked_at?: string | null
          user_id: string
          valid_until?: string | null
        }
        Update: {
          created_at?: string
          revoked_at?: string | null
          user_id?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: string
          user_id: string
        }
        Insert: {
          id?: string
          role: string
          user_id: string
        }
        Update: {
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_valid_access: { Args: { check_user_id: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
