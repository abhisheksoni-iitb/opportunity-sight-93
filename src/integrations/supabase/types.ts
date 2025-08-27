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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      explore: {
        Row: {
          data_source: string | null
          main_mission: string | null
          meta: string | null
          mission_type: string | null
          raw_data: string | null
          title: string | null
          uuid: string
        }
        Insert: {
          data_source?: string | null
          main_mission?: string | null
          meta?: string | null
          mission_type?: string | null
          raw_data?: string | null
          title?: string | null
          uuid?: string
        }
        Update: {
          data_source?: string | null
          main_mission?: string | null
          meta?: string | null
          mission_type?: string | null
          raw_data?: string | null
          title?: string | null
          uuid?: string
        }
        Relationships: []
      }
      explore_data: {
        Row: {
          created_at: string
          data_source: string
          id: string
          main_mission: string
          meta: Json | null
          mission_date: string | null
          mission_type: string | null
          raw_data: string
          secondary_missions: Json | null
          title: string
          updated_at: string
          urgency: string | null
        }
        Insert: {
          created_at?: string
          data_source: string
          id?: string
          main_mission: string
          meta?: Json | null
          mission_date?: string | null
          mission_type?: string | null
          raw_data: string
          secondary_missions?: Json | null
          title: string
          updated_at?: string
          urgency?: string | null
        }
        Update: {
          created_at?: string
          data_source?: string
          id?: string
          main_mission?: string
          meta?: Json | null
          mission_date?: string | null
          mission_type?: string | null
          raw_data?: string
          secondary_missions?: Json | null
          title?: string
          updated_at?: string
          urgency?: string | null
        }
        Relationships: []
      }
      ongoing_mission: {
        Row: {
          end_time: string | null
          last_updated: string | null
          main_mission: string | null
          meta: string | null
          mission_id: number
          mission_type: string | null
          progress: string | null
          secondary_missions: string | null
          start_time: string | null
          status: string | null
          title: string | null
          urgency: string | null
          user_id: string | null
        }
        Insert: {
          end_time?: string | null
          last_updated?: string | null
          main_mission?: string | null
          meta?: string | null
          mission_id: number
          mission_type?: string | null
          progress?: string | null
          secondary_missions?: string | null
          start_time?: string | null
          status?: string | null
          title?: string | null
          urgency?: string | null
          user_id?: string | null
        }
        Update: {
          end_time?: string | null
          last_updated?: string | null
          main_mission?: string | null
          meta?: string | null
          mission_id?: number
          mission_type?: string | null
          progress?: string | null
          secondary_missions?: string | null
          start_time?: string | null
          status?: string | null
          title?: string | null
          urgency?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      use_cases: {
        Row: {
          created_at: string
          data_source: string
          id: string
          main_mission: string
          meta: Json | null
          mission_date: string | null
          mission_type: string | null
          raw_data: string
          secondary_missions: Json | null
          title: string
          updated_at: string
          urgency: string | null
        }
        Insert: {
          created_at?: string
          data_source: string
          id?: string
          main_mission: string
          meta?: Json | null
          mission_date?: string | null
          mission_type?: string | null
          raw_data: string
          secondary_missions?: Json | null
          title: string
          updated_at?: string
          urgency?: string | null
        }
        Update: {
          created_at?: string
          data_source?: string
          id?: string
          main_mission?: string
          meta?: Json | null
          mission_date?: string | null
          mission_type?: string | null
          raw_data?: string
          secondary_missions?: Json | null
          title?: string
          updated_at?: string
          urgency?: string | null
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
    Enums: {},
  },
} as const
