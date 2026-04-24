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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      homepage_avisos: {
        Row: {
          ativo: boolean
          created_at: string
          data_fim: string | null
          id: string
          mensagem: string
          titulo: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          data_fim?: string | null
          id?: string
          mensagem: string
          titulo: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          data_fim?: string | null
          id?: string
          mensagem?: string
          titulo?: string
        }
        Relationships: []
      }
      homepage_contactos: {
        Row: {
          email: string | null
          horario: string | null
          id: string
          morada: string | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          email?: string | null
          horario?: string | null
          id?: string
          morada?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          email?: string | null
          horario?: string | null
          id?: string
          morada?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      homepage_datasets_destaque: {
        Row: {
          ativo: boolean
          categoria: string | null
          created_at: string
          descricao: string
          id: string
          nome: string
          ordem: number
        }
        Insert: {
          ativo?: boolean
          categoria?: string | null
          created_at?: string
          descricao: string
          id?: string
          nome: string
          ordem?: number
        }
        Update: {
          ativo?: boolean
          categoria?: string | null
          created_at?: string
          descricao?: string
          id?: string
          nome?: string
          ordem?: number
        }
        Relationships: []
      }
      homepage_hero: {
        Row: {
          id: string
          subtitulo: string
          titulo: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          subtitulo: string
          titulo: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          subtitulo?: string
          titulo?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      pedidos_dataset: {
        Row: {
          created_at: string
          dados_pretendidos: string
          descricao: string
          finalidade: string
          id: string
          status: Database["public"]["Enums"]["pedido_status"]
          titulo_estudo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dados_pretendidos: string
          descricao: string
          finalidade: string
          id?: string
          status?: Database["public"]["Enums"]["pedido_status"]
          titulo_estudo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dados_pretendidos?: string
          descricao?: string
          finalidade?: string
          id?: string
          status?: Database["public"]["Enums"]["pedido_status"]
          titulo_estudo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pedidos_historico: {
        Row: {
          alterado_por: string
          created_at: string
          id: string
          nota: string | null
          pedido_id: string
          status_anterior: Database["public"]["Enums"]["pedido_status"] | null
          status_novo: Database["public"]["Enums"]["pedido_status"]
        }
        Insert: {
          alterado_por: string
          created_at?: string
          id?: string
          nota?: string | null
          pedido_id: string
          status_anterior?: Database["public"]["Enums"]["pedido_status"] | null
          status_novo: Database["public"]["Enums"]["pedido_status"]
        }
        Update: {
          alterado_por?: string
          created_at?: string
          id?: string
          nota?: string | null
          pedido_id?: string
          status_anterior?: Database["public"]["Enums"]["pedido_status"] | null
          status_novo?: Database["public"]["Enums"]["pedido_status"]
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_historico_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos_dataset"
            referencedColumns: ["id"]
          },
        ]
      }
      postos: {
        Row: {
          available: boolean
          code: string
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          available?: boolean
          code: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          available?: boolean
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_status: Database["public"]["Enums"]["account_status"]
          approved_at: string | null
          approved_by: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          institution: string | null
          motivo_rejeicao: string | null
          position: string | null
          updated_at: string
        }
        Insert: {
          account_status?: Database["public"]["Enums"]["account_status"]
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          email: string
          full_name?: string
          id: string
          institution?: string | null
          motivo_rejeicao?: string | null
          position?: string | null
          updated_at?: string
        }
        Update: {
          account_status?: Database["public"]["Enums"]["account_status"]
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          institution?: string | null
          motivo_rejeicao?: string | null
          position?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reservas: {
        Row: {
          created_at: string
          end_time: string
          id: string
          notes: string | null
          posto_id: string
          reserva_date: string
          start_time: string
          status: Database["public"]["Enums"]["reserva_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          notes?: string | null
          posto_id: string
          reserva_date: string
          start_time: string
          status?: Database["public"]["Enums"]["reserva_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          notes?: string | null
          posto_id?: string
          reserva_date?: string
          start_time?: string
          status?: Database["public"]["Enums"]["reserva_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservas_posto_id_fkey"
            columns: ["posto_id"]
            isOneToOne: false
            referencedRelation: "postos"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      account_status: "pendente" | "aprovado" | "rejeitado"
      app_role: "admin" | "investigador"
      pedido_status:
        | "submetido"
        | "em_analise"
        | "pedido_esclarecimento"
        | "aprovado"
        | "rejeitado"
        | "em_anonimizacao"
        | "concluido"
      reserva_status: "confirmada" | "cancelada" | "concluida"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_status: ["pendente", "aprovado", "rejeitado"],
      app_role: ["admin", "investigador"],
      pedido_status: [
        "submetido",
        "em_analise",
        "pedido_esclarecimento",
        "aprovado",
        "rejeitado",
        "em_anonimizacao",
        "concluido",
      ],
      reserva_status: ["confirmada", "cancelada", "concluida"],
    },
  },
} as const
