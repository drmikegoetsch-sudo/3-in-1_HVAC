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
        Relationships: []
      }
      communications: {
        Row: {
          created_by: string | null
          direction: Database['public']['Enums']['comm_direction']
          follow_up_item_id: string
          id: string
          method: Database['public']['Enums']['comm_method']
          sent_at: string | null
          summary: string | null
        }
        Insert: {
          created_by?: string | null
          direction: Database['public']['Enums']['comm_direction']
          follow_up_item_id: string
          id?: string
          method: Database['public']['Enums']['comm_method']
          sent_at?: string | null
          summary?: string | null
        }
        Update: {
          created_by?: string | null
          direction?: Database['public']['Enums']['comm_direction']
          follow_up_item_id?: string
          id?: string
          method?: Database['public']['Enums']['comm_method']
          sent_at?: string | null
          summary?: string | null
        }
        Relationships: []
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
          category: Database['public']['Enums']['follow_up_category']
          closed_at: string | null
          created_at: string | null
          customer_id: string
          description: string | null
          due_date: string | null
          id: string
          job_id: string | null
          next_action: string | null
          owner_user_id: string | null
          priority: Database['public']['Enums']['follow_up_priority']
          requires_part: boolean | null
          requires_scheduling: boolean | null
          status: Database['public']['Enums']['follow_up_status']
          technician_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: Database['public']['Enums']['follow_up_category']
          closed_at?: string | null
          created_at?: string | null
          customer_id: string
          description?: string | null
          due_date?: string | null
          id?: string
          job_id?: string | null
          next_action?: string | null
          owner_user_id?: string | null
          priority?: Database['public']['Enums']['follow_up_priority']
          requires_part?: boolean | null
          requires_scheduling?: boolean | null
          status?: Database['public']['Enums']['follow_up_status']
          technician_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: Database['public']['Enums']['follow_up_category']
          closed_at?: string | null
          created_at?: string | null
          customer_id?: string
          description?: string | null
          due_date?: string | null
          id?: string
          job_id?: string | null
          next_action?: string | null
          owner_user_id?: string | null
          priority?: Database['public']['Enums']['follow_up_priority']
          requires_part?: boolean | null
          requires_scheduling?: boolean | null
          status?: Database['public']['Enums']['follow_up_status']
          technician_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
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
        Relationships: []
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
          order_status: Database['public']['Enums']['part_order_status'] | null
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
          order_status?: Database['public']['Enums']['part_order_status'] | null
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
          order_status?: Database['public']['Enums']['part_order_status'] | null
          ordered_at?: string | null
          part_name?: string
          part_number?: string | null
          quoted_price?: number | null
          received_at?: string | null
          serial_number?: string | null
          vendor?: string | null
        }
        Relationships: []
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
          category: Database['public']['Enums']['follow_up_category'] | null
          created_at: string | null
          customer_name: string | null
          customer_phone: string | null
          description: string | null
          due_date: string | null
          id: string | null
          next_action: string | null
          owner_email: string | null
          part_eta: string | null
          part_name: string | null
          part_order_status: Database['public']['Enums']['part_order_status'] | null
          priority: Database['public']['Enums']['follow_up_priority'] | null
          requires_part: boolean | null
          requires_scheduling: boolean | null
          status: Database['public']['Enums']['follow_up_status'] | null
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
          priority: Database['public']['Enums']['follow_up_priority'] | null
          status: Database['public']['Enums']['follow_up_status'] | null
          total: number | null
        }
        Relationships: []
      }
    }
    Functions: Record<string, never>
    Enums: {
      comm_direction: 'inbound' | 'outbound'
      comm_method: 'phone' | 'text' | 'email' | 'in_person' | 'other'
      follow_up_category:
        | 'part_needed'
        | 'callback'
        | 'cleanup'
        | 'incomplete_work'
        | 'billing'
        | 'payment'
        | 'warranty_registration'
        | 'other'
      follow_up_priority: 'urgent' | 'standard' | 'low'
      follow_up_status:
        | 'needs_pricing'
        | 'waiting_quote_approval'
        | 'approved_order_part'
        | 'waiting_on_part'
        | 'ready_to_schedule'
        | 'waiting_on_customer'
        | 'scheduled'
        | 'billing_followup'
        | 'closed'
      part_order_status: 'pending' | 'ordered' | 'backordered' | 'received' | 'cancelled'
    }
    CompositeTypes: Record<string, never>
  }
}
