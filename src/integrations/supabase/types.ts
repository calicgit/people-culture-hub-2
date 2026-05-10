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
      association_members: {
        Row: {
          activation_date: string
          address: string | null
          city: string | null
          country: string | null
          created_at: string
          created_by: string
          date_of_birth: string | null
          deactivation_date: string | null
          email: string | null
          first_name: string
          gender: string | null
          id: string
          last_name: string
          membership_type: Database["public"]["Enums"]["membership_type"]
          oib: string | null
          phone: string | null
          postal_code: string | null
          updated_at: string
        }
        Insert: {
          activation_date?: string
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          created_by: string
          date_of_birth?: string | null
          deactivation_date?: string | null
          email?: string | null
          first_name: string
          gender?: string | null
          id?: string
          last_name: string
          membership_type?: Database["public"]["Enums"]["membership_type"]
          oib?: string | null
          phone?: string | null
          postal_code?: string | null
          updated_at?: string
        }
        Update: {
          activation_date?: string
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          created_by?: string
          date_of_birth?: string | null
          deactivation_date?: string | null
          email?: string | null
          first_name?: string
          gender?: string | null
          id?: string
          last_name?: string
          membership_type?: Database["public"]["Enums"]["membership_type"]
          oib?: string | null
          phone?: string | null
          postal_code?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          ends_at: string
          id: string
          location: string | null
          starts_at: string
          title: string
          updated_at: string
          visibility_body:
            | Database["public"]["Enums"]["association_body"]
            | null
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          ends_at: string
          id?: string
          location?: string | null
          starts_at: string
          title: string
          updated_at?: string
          visibility_body?:
            | Database["public"]["Enums"]["association_body"]
            | null
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          ends_at?: string
          id?: string
          location?: string | null
          starts_at?: string
          title?: string
          updated_at?: string
          visibility_body?:
            | Database["public"]["Enums"]["association_body"]
            | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      custom_sections: {
        Row: {
          created_at: string
          created_by: string
          id: string
          label: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          label: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          label?: string
        }
        Relationships: []
      }
      document_comments: {
        Row: {
          author_id: string
          body: string
          created_at: string
          document_id: string
          id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          document_id: string
          id?: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          document_id?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_comments_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_versions: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          document_id: string
          file_name: string
          file_path: string
          file_size_bytes: number | null
          id: string
          mime_type: string | null
          title: string
          version_number: number
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          document_id: string
          file_name: string
          file_path: string
          file_size_bytes?: number | null
          id?: string
          mime_type?: string | null
          title: string
          version_number: number
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          document_id?: string
          file_name?: string
          file_path?: string
          file_size_bytes?: number | null
          id?: string
          mime_type?: string | null
          title?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          description: string | null
          file_name: string
          file_path: string
          file_size_bytes: number | null
          id: string
          mime_type: string | null
          section: string | null
          title: string
          updated_at: string
          uploaded_by: string
          visibility_body:
            | Database["public"]["Enums"]["association_body"]
            | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_name: string
          file_path: string
          file_size_bytes?: number | null
          id?: string
          mime_type?: string | null
          section?: string | null
          title: string
          updated_at?: string
          uploaded_by: string
          visibility_body?:
            | Database["public"]["Enums"]["association_body"]
            | null
        }
        Update: {
          created_at?: string
          description?: string | null
          file_name?: string
          file_path?: string
          file_size_bytes?: number | null
          id?: string
          mime_type?: string | null
          section?: string | null
          title?: string
          updated_at?: string
          uploaded_by?: string
          visibility_body?:
            | Database["public"]["Enums"]["association_body"]
            | null
        }
        Relationships: []
      }
      meetup_applications: {
        Row: {
          city_region: string
          created_at: string
          email: string
          full_name: string
          hr_role: string
          id: string
          motivation: string
          organization: string | null
          preferred_format: string | null
          status: string
        }
        Insert: {
          city_region: string
          created_at?: string
          email: string
          full_name: string
          hr_role: string
          id?: string
          motivation: string
          organization?: string | null
          preferred_format?: string | null
          status?: string
        }
        Update: {
          city_region?: string
          created_at?: string
          email?: string
          full_name?: string
          hr_role?: string
          id?: string
          motivation?: string
          organization?: string | null
          preferred_format?: string | null
          status?: string
        }
        Relationships: []
      }
      membership_applications: {
        Row: {
          applicant_date_of_birth: string | null
          applicant_oib: string | null
          company: string | null
          created_at: string
          email: string
          first_name: string
          how_heard: string | null
          id: string
          invoice_email: string | null
          last_name: string
          membership_tier: string
          paid_by: string
          payer_address: string | null
          payer_company_name: string | null
          payer_full_name: string | null
          payer_oib: string | null
          phone: string
          referrals: string[] | null
          status: string
        }
        Insert: {
          applicant_date_of_birth?: string | null
          applicant_oib?: string | null
          company?: string | null
          created_at?: string
          email: string
          first_name: string
          how_heard?: string | null
          id?: string
          invoice_email?: string | null
          last_name: string
          membership_tier: string
          paid_by: string
          payer_address?: string | null
          payer_company_name?: string | null
          payer_full_name?: string | null
          payer_oib?: string | null
          phone: string
          referrals?: string[] | null
          status?: string
        }
        Update: {
          applicant_date_of_birth?: string | null
          applicant_oib?: string | null
          company?: string | null
          created_at?: string
          email?: string
          first_name?: string
          how_heard?: string | null
          id?: string
          invoice_email?: string | null
          last_name?: string
          membership_tier?: string
          paid_by?: string
          payer_address?: string | null
          payer_company_name?: string | null
          payer_full_name?: string | null
          payer_oib?: string | null
          phone?: string
          referrals?: string[] | null
          status?: string
        }
        Relationships: []
      }
      poll_comments: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          poll_id: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          poll_id: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          poll_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_comments_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_votes: {
        Row: {
          created_at: string
          id: string
          poll_id: string
          selected_option: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          poll_id: string
          selected_option: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          poll_id?: string
          selected_option?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          created_at: string
          created_by: string
          deadline: string | null
          description: string | null
          id: string
          options: Json
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          deadline?: string | null
          description?: string | null
          id?: string
          options?: Json
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          deadline?: string | null
          description?: string | null
          id?: string
          options?: Json
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          membership_status: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          is_active?: boolean
          membership_status?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          membership_status?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_tasks: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string
          deadline: string | null
          description: string | null
          id: string
          project_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by: string
          deadline?: string | null
          description?: string | null
          id?: string
          project_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string
          deadline?: string | null
          description?: string | null
          id?: string
          project_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          bio: string | null
          council: string
          created_at: string
          display_order: number
          full_name: string
          id: string
          photo_url: string | null
          title: string | null
          title_en: string | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          council: string
          created_at?: string
          display_order?: number
          full_name: string
          id?: string
          photo_url?: string | null
          title?: string | null
          title_en?: string | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          council?: string
          created_at?: string
          display_order?: number
          full_name?: string
          id?: string
          photo_url?: string | null
          title?: string | null
          title_en?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_body_memberships: {
        Row: {
          body: Database["public"]["Enums"]["association_body"]
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          body: Database["public"]["Enums"]["association_body"]
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          body?: Database["public"]["Enums"]["association_body"]
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
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
      app_role: "master_admin" | "member"
      association_body:
        | "association_member"
        | "upravno_vijece"
        | "savjetodavno_vijece"
        | "znanstveno_vijece"
      membership_type: "redovni" | "pocasni"
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
      app_role: ["master_admin", "member"],
      association_body: [
        "association_member",
        "upravno_vijece",
        "savjetodavno_vijece",
        "znanstveno_vijece",
      ],
      membership_type: ["redovni", "pocasni"],
    },
  },
} as const
