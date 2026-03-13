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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action_type: string
          created_at: string | null
          created_by: string | null
          follow_up_item_id: string
          id: string
          new_value: string | null
          note: string | null
          old_value: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          created_by?: string | null
          follow_up_item_id: string
          id?: string
          new_value?: string | null
          note?: string | null
          old_value?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          created_by?: string | null
          follow_up_item_id?: string
          id?: string
          new_value?: string | null
          note?: string | null
          old_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_follow_up_item_id_fkey"
            columns: ["follow_up_item_id"]
            isOneToOne: false
            referencedRelation: "follow_up_detail"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_log_follow_up_item_id_fkey"
            columns: ["follow_up_item_id"]
            isOneToOne: false
            referencedRelation: "follow_up_items"
            referencedColumns: ["id"]
          },
        ]
      }
      communications: {
        Row: {
          created_by: string | null
          direction: Database["public"]["Enums"]["comm_direction"]
          follow_up_item_id: string
          id: string
          method: Database["public"]["Enums"]["comm_method"]
          sent_at: string | null
          summary: string | null
        }
        Insert: {
          created_by?: string | null
          direction: Database["public"]["Enums"]["comm_direction"]
          follow_up_item_id: string
          id?: string
          method: Database["public"]["Enums"]["comm_method"]
          sent_at?: string | null
          summary?: string | null
        }
        Update: {
          created_by?: string | null
          direction?: Database["public"]["Enums"]["comm_direction"]
          follow_up_item_id?: string
          id?: string
          method?: Database["public"]["Enums"]["comm_method"]
          sent_at?: string | null
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communications_follow_up_item_id_fkey"
            columns: ["follow_up_item_id"]
            isOneToOne: false
            referencedRelation: "follow_up_detail"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communications_follow_up_item_id_fkey"
            columns: ["follow_up_item_id"]
            isOneToOne: false
            referencedRelation: "follow_up_items"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      follow_up_items: {
        Row: {
          archived_at: string | null
          category: Database["public"]["Enums"]["follow_up_category"]
          closed_at: string | null
          created_at: string | null
          customer_id: string
          description: string | null
          due_date: string | null
          id: string
          job_id: string | null
          next_action: string | null
          owner_user_id: string | null
          priority: Database["public"]["Enums"]["follow_up_priority"]
          requires_part: boolean | null
          requires_scheduling: boolean | null
          status: Database["public"]["Enums"]["follow_up_status"]
          technician_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          archived_at?: string | null
          category: Database["public"]["Enums"]["follow_up_category"]
          closed_at?: string | null
          created_at?: string | null
          customer_id: string
          description?: string | null
          due_date?: string | null
          id?: string
          job_id?: string | null
          next_action?: string | null
          owner_user_id?: string | null
          priority?: Database["public"]["Enums"]["follow_up_priority"]
          requires_part?: boolean | null
          requires_scheduling?: boolean | null
          status?: Database["public"]["Enums"]["follow_up_status"]
          technician_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          archived_at?: string | null
          category?: Database["public"]["Enums"]["follow_up_category"]
          closed_at?: string | null
          created_at?: string | null
          customer_id?: string
          description?: string | null
          due_date?: string | null
          id?: string
          job_id?: string | null
          next_action?: string | null
          owner_user_id?: string | null
          priority?: Database["public"]["Enums"]["follow_up_priority"]
          requires_part?: boolean | null
          requires_scheduling?: boolean | null
          status?: Database["public"]["Enums"]["follow_up_status"]
          technician_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "follow_up_items_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_up_items_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_up_items_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          created_at: string | null
          customer_id: string
          id: string
          job_type: string | null
          notes: string | null
          service_date: string
          status: string | null
          technician_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          id?: string
          job_type?: string | null
          notes?: string | null
          service_date: string
          status?: string | null
          technician_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          id?: string
          job_type?: string | null
          notes?: string | null
          service_date?: string
          status?: string | null
          technician_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      parts_requests: {
        Row: {
          availability_notes: string | null
          cost: number | null
          created_at: string | null
          eta_date: string | null
          follow_up_item_id: string
          id: string
          model_number: string | null
          order_status: Database["public"]["Enums"]["part_order_status"] | null
          ordered_at: string | null
          part_name: string
          part_number: string | null
          quoted_price: number | null
          received_at: string | null
          serial_number: string | null
          vendor: string | null
        }
        Insert: {
          availability_notes?: string | null
          cost?: number | null
          created_at?: string | null
          eta_date?: string | null
          follow_up_item_id: string
          id?: string
          model_number?: string | null
          order_status?: Database["public"]["Enums"]["part_order_status"] | null
          ordered_at?: string | null
          part_name: string
          part_number?: string | null
          quoted_price?: number | null
          received_at?: string | null
          serial_number?: string | null
          vendor?: string | null
        }
        Update: {
          availability_notes?: string | null
          cost?: number | null
          created_at?: string | null
          eta_date?: string | null
          follow_up_item_id?: string
          id?: string
          model_number?: string | null
          order_status?: Database["public"]["Enums"]["part_order_status"] | null
          ordered_at?: string | null
          part_name?: string
          part_number?: string | null
          quoted_price?: number | null
          received_at?: string | null
          serial_number?: string | null
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parts_requests_follow_up_item_id_fkey"
            columns: ["follow_up_item_id"]
            isOneToOne: false
            referencedRelation: "follow_up_detail"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parts_requests_follow_up_item_id_fkey"
            columns: ["follow_up_item_id"]
            isOneToOne: false
            referencedRelation: "follow_up_items"
            referencedColumns: ["id"]
          },
        ]
      }
      technicians: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          name: string
          phone: string | null
          user_id: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          name: string
          phone?: string | null
          user_id?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          name?: string
          phone?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      follow_up_detail: {
        Row: {
          archived_at: string | null
          category: Database["public"]["Enums"]["follow_up_category"] | null
          closed_at: string | null
          created_at: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          description: string | null
          due_date: string | null
          id: string | null
          next_action: string | null
          part_eta: string | null
          part_name: string | null
          part_number: string | null
          priority: Database["public"]["Enums"]["follow_up_priority"] | null
          requires_part: boolean | null
          requires_scheduling: boolean | null
          status: Database["public"]["Enums"]["follow_up_status"] | null
          technician_name: string | null
          title: string | null
          updated_at: string | null
          vendor: string | null
        }
        Relationships: []
      }
      open_follow_ups_summary: {
        Row: {
          overdue: number | null
          status: Database["public"]["Enums"]["follow_up_status"] | null
          total: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      comm_direction: "inbound" | "outbound"
      comm_method: "phone" | "text" | "email" | "in_person" | "other"
      follow_up_category:
        | "part_needed"
        | "callback"
        | "cleanup"
        | "incomplete_work"
        | "billing"
        | "payment"
        | "warranty_registration"
        | "other"
      follow_up_priority: "urgent" | "standard" | "low"
      follow_up_status:
        | "needs_pricing"
        | "waiting_quote_approval"
        | "approved_order_part"
        | "waiting_on_part"
        | "ready_to_schedule"
        | "waiting_on_customer"
        | "scheduled"
        | "billing_followup"
        | "closed"
      part_order_status:
        | "pending"
        | "ordered"
        | "backordered"
        | "received"
        | "cancelled"
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
      comm_direction: ["inbound", "outbound"],
      comm_method: ["phone", "text", "email", "in_person", "other"],
      follow_up_category: [
        "part_needed",
        "callback",
        "cleanup",
        "incomplete_work",
        "billing",
        "payment",
        "warranty_registration",
        "other",
      ],
      follow_up_priority: ["urgent", "standard", "low"],
      follow_up_status: [
        "needs_pricing",
        "waiting_quote_approval",
        "approved_order_part",
        "waiting_on_part",
        "ready_to_schedule",
        "waiting_on_customer",
        "scheduled",
        "billing_followup",
        "closed",
      ],
      part_order_status: [
        "pending",
        "ordered",
        "backordered",
        "received",
        "cancelled",
      ],
    },
  },
} as const
