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
      adiantamentos: {
        Row: {
          cliente: string | null
          created_at: string
          data: string
          id: string
          observacao: string | null
          os_id: string | null
          periodo: string | null
          recebido: number
          solicitado: number
          status: Database["public"]["Enums"]["adiantamento_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          cliente?: string | null
          created_at?: string
          data?: string
          id?: string
          observacao?: string | null
          os_id?: string | null
          periodo?: string | null
          recebido?: number
          solicitado?: number
          status?: Database["public"]["Enums"]["adiantamento_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          cliente?: string | null
          created_at?: string
          data?: string
          id?: string
          observacao?: string | null
          os_id?: string | null
          periodo?: string | null
          recebido?: number
          solicitado?: number
          status?: Database["public"]["Enums"]["adiantamento_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "adiantamentos_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
        ]
      }
      despesas: {
        Row: {
          categoria: Database["public"]["Enums"]["despesa_categoria"]
          comprovante_url: string | null
          created_at: string
          data: string
          descricao: string
          estabelecimento: string | null
          id: string
          ocr_dados: Json | null
          os_id: string | null
          status: Database["public"]["Enums"]["despesa_status"]
          updated_at: string
          user_id: string
          valor: number
        }
        Insert: {
          categoria?: Database["public"]["Enums"]["despesa_categoria"]
          comprovante_url?: string | null
          created_at?: string
          data?: string
          descricao: string
          estabelecimento?: string | null
          id?: string
          ocr_dados?: Json | null
          os_id?: string | null
          status?: Database["public"]["Enums"]["despesa_status"]
          updated_at?: string
          user_id: string
          valor?: number
        }
        Update: {
          categoria?: Database["public"]["Enums"]["despesa_categoria"]
          comprovante_url?: string | null
          created_at?: string
          data?: string
          descricao?: string
          estabelecimento?: string | null
          id?: string
          ocr_dados?: Json | null
          os_id?: string | null
          status?: Database["public"]["Enums"]["despesa_status"]
          updated_at?: string
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "despesas_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
        ]
      }
      horas_trabalhadas: {
        Row: {
          created_at: string
          data: string
          fim: string
          id: string
          inicio: string
          intervalo_min: number
          observacao: string | null
          os_id: string | null
          tipo: Database["public"]["Enums"]["hora_tipo"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: string
          fim: string
          id?: string
          inicio: string
          intervalo_min?: number
          observacao?: string | null
          os_id?: string | null
          tipo?: Database["public"]["Enums"]["hora_tipo"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: string
          fim?: string
          id?: string
          inicio?: string
          intervalo_min?: number
          observacao?: string | null
          os_id?: string | null
          tipo?: Database["public"]["Enums"]["hora_tipo"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "horas_trabalhadas_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
        ]
      }
      ordens_servico: {
        Row: {
          cidade: string | null
          cliente: string
          created_at: string
          fim_previsto: string | null
          id: string
          inicio: string
          numero: string
          observacoes: string | null
          status: Database["public"]["Enums"]["os_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          cidade?: string | null
          cliente: string
          created_at?: string
          fim_previsto?: string | null
          id?: string
          inicio?: string
          numero: string
          observacoes?: string | null
          status?: Database["public"]["Enums"]["os_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          cidade?: string | null
          cliente?: string
          created_at?: string
          fim_previsto?: string | null
          id?: string
          inicio?: string
          numero?: string
          observacoes?: string | null
          status?: Database["public"]["Enums"]["os_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cargo: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          matricula: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          cargo?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          matricula?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          cargo?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          matricula?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      relatorios_gerados: {
        Row: {
          created_at: string
          id: string
          metadados: Json | null
          os_id: string | null
          periodo_fim: string | null
          periodo_inicio: string | null
          tipo: string
          titulo: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadados?: Json | null
          os_id?: string | null
          periodo_fim?: string | null
          periodo_inicio?: string | null
          tipo?: string
          titulo: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metadados?: Json | null
          os_id?: string | null
          periodo_fim?: string | null
          periodo_inicio?: string | null
          tipo?: string
          titulo?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "relatorios_gerados_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
        ]
      }
      vale_refeicao_config: {
        Row: {
          created_at: string
          id: string
          mes_ref: string
          saldo_mensal: number
          updated_at: string
          user_id: string
          valor_diario: number
        }
        Insert: {
          created_at?: string
          id?: string
          mes_ref: string
          saldo_mensal?: number
          updated_at?: string
          user_id: string
          valor_diario?: number
        }
        Update: {
          created_at?: string
          id?: string
          mes_ref?: string
          saldo_mensal?: number
          updated_at?: string
          user_id?: string
          valor_diario?: number
        }
        Relationships: []
      }
      vale_refeicao_uso: {
        Row: {
          created_at: string
          data: string
          descricao: string | null
          id: string
          user_id: string
          valor: number
        }
        Insert: {
          created_at?: string
          data?: string
          descricao?: string | null
          id?: string
          user_id: string
          valor: number
        }
        Update: {
          created_at?: string
          data?: string
          descricao?: string | null
          id?: string
          user_id?: string
          valor?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      adiantamento_status: "pendente" | "aprovado" | "recebido" | "cancelado"
      despesa_categoria:
        | "combustivel"
        | "almoco"
        | "jantar"
        | "pedagio"
        | "hospedagem"
        | "outras"
      despesa_status: "rascunho" | "enviado" | "aprovado" | "rejeitado"
      hora_tipo: "normal" | "hora_extra" | "deslocamento"
      os_status: "aberta" | "em_andamento" | "encerrada" | "cancelada"
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
      adiantamento_status: ["pendente", "aprovado", "recebido", "cancelado"],
      despesa_categoria: [
        "combustivel",
        "almoco",
        "jantar",
        "pedagio",
        "hospedagem",
        "outras",
      ],
      despesa_status: ["rascunho", "enviado", "aprovado", "rejeitado"],
      hora_tipo: ["normal", "hora_extra", "deslocamento"],
      os_status: ["aberta", "em_andamento", "encerrada", "cancelada"],
    },
  },
} as const
