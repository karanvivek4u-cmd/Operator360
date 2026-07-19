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
      customers: {
        Row: {
          customer_id: string
          customer_code: string
          company_name: string
          contact_person: string
          email: string
          phone: string | null
          address: string | null
          city: string | null
          state: string | null
          pincode: string | null
          gst_number: string | null
          category: Database["public"]["Enums"]["customer_category"]
          status: Database["public"]["Enums"]["active_status"]
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          customer_id?: string
          customer_code: string
          company_name: string
          contact_person: string
          email: string
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          pincode?: string | null
          gst_number?: string | null
          category: Database["public"]["Enums"]["customer_category"]
          status?: Database["public"]["Enums"]["active_status"]
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          customer_id?: string
          customer_code?: string
          company_name?: string
          contact_person?: string
          email?: string
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          pincode?: string | null
          gst_number?: string | null
          category?: Database["public"]["Enums"]["customer_category"]
          status?: Database["public"]["Enums"]["active_status"]
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          user_id: string
          auth_user_id: string | null
          customer_id: string | null
          operator_id: string | null
          full_name: string
          email: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          is_active: boolean | null
          last_login: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          user_id?: string
          auth_user_id?: string | null
          customer_id?: string | null
          operator_id?: string | null
          full_name: string
          email: string
          phone?: string | null
          role: Database["public"]["Enums"]["user_role"]
          is_active?: boolean | null
          last_login?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          user_id?: string
          auth_user_id?: string | null
          customer_id?: string | null
          operator_id?: string | null
          full_name?: string
          email?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          is_active?: boolean | null
          last_login?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_customer"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "fk_user_operator"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["operator_id"]
          }
        ]
      }
      machines: {
        Row: {
          machine_id: string
          customer_id: string
          serial_number: string
          model_number: string | null
          engine_number: string | null
          purchase_date: string | null
          warranty_end_date: string | null
          status: Database["public"]["Enums"]["machine_status"]
          remarks: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          machine_id?: string
          customer_id: string
          serial_number: string
          model_number?: string | null
          engine_number?: string | null
          purchase_date?: string | null
          warranty_end_date?: string | null
          status?: Database["public"]["Enums"]["machine_status"]
          remarks?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          machine_id?: string
          customer_id?: string
          serial_number?: string
          model_number?: string | null
          engine_number?: string | null
          purchase_date?: string | null
          warranty_end_date?: string | null
          status?: Database["public"]["Enums"]["machine_status"]
          remarks?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_machine_customer"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["customer_id"]
          }
        ]
      }
      operators: {
        Row: {
          operator_id: string
          customer_id: string
          operator_code: string
          first_name: string
          last_name: string | null
          mobile: string | null
          email: string | null
          aadhaar_number: string | null
          dob: string | null
          gender: string | null
          joining_date: string | null
          address: string | null
          emergency_contact: string | null
          status: Database["public"]["Enums"]["active_status"]
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          operator_id?: string
          customer_id: string
          operator_code: string
          first_name: string
          last_name?: string | null
          mobile?: string | null
          email?: string | null
          aadhaar_number?: string | null
          dob?: string | null
          gender?: string | null
          joining_date?: string | null
          address?: string | null
          emergency_contact?: string | null
          status?: Database["public"]["Enums"]["active_status"]
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          operator_id?: string
          customer_id?: string
          operator_code?: string
          first_name?: string
          last_name?: string | null
          mobile?: string | null
          email?: string | null
          aadhaar_number?: string | null
          dob?: string | null
          gender?: string | null
          joining_date?: string | null
          address?: string | null
          emergency_contact?: string | null
          status?: Database["public"]["Enums"]["active_status"]
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_operator_customer"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["customer_id"]
          }
        ]
      }
      operator_assignments: {
        Row: {
          assignment_id: string
          machine_id: string
          operator_id: string
          assignment_start_date: string
          assignment_end_date: string | null
          status: Database["public"]["Enums"]["assignment_status"]
          assignment_reason: string | null
          remarks: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          assignment_id?: string
          machine_id: string
          operator_id: string
          assignment_start_date: string
          assignment_end_date?: string | null
          status?: Database["public"]["Enums"]["assignment_status"]
          assignment_reason?: string | null
          remarks?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          assignment_id?: string
          machine_id?: string
          operator_id?: string
          assignment_start_date?: string
          assignment_end_date?: string | null
          status?: Database["public"]["Enums"]["assignment_status"]
          assignment_reason?: string | null
          remarks?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_assignment_machine"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["machine_id"]
          },
          {
            foreignKeyName: "fk_assignment_operator"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["operator_id"]
          }
        ]
      }

      service_requests: {
        Row: {
          request_id: string
          request_number: string
          request_type: string
          customer_id: string
          machine_id: string
          old_operator_id: string | null
          new_operator_id: string | null
          requested_by: string
          customer_comments: string | null
          insurance_status: Database["public"]["Enums"]["request_status"]
          insurance_approved_by: string | null
          insurance_approved_at: string | null
          admin_status: Database["public"]["Enums"]["request_status"]
          admin_approved_by: string | null
          admin_approved_at: string | null
          overall_status: Database["public"]["Enums"]["request_status"]
          rejection_reason: string | null
          closed_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          request_id?: string
          request_number: string
          request_type: string
          customer_id: string
          machine_id: string
          old_operator_id?: string | null
          new_operator_id?: string | null
          requested_by: string
          customer_comments?: string | null
          insurance_status?: Database["public"]["Enums"]["request_status"]
          insurance_approved_by?: string | null
          insurance_approved_at?: string | null
          admin_status?: Database["public"]["Enums"]["request_status"]
          admin_approved_by?: string | null
          admin_approved_at?: string | null
          overall_status?: Database["public"]["Enums"]["request_status"]
          rejection_reason?: string | null
          closed_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          request_id?: string
          request_number?: string
          request_type?: string
          customer_id?: string
          machine_id?: string
          old_operator_id?: string | null
          new_operator_id?: string | null
          requested_by?: string
          customer_comments?: string | null
          insurance_status?: Database["public"]["Enums"]["request_status"]
          insurance_approved_by?: string | null
          insurance_approved_at?: string | null
          admin_status?: Database["public"]["Enums"]["request_status"]
          admin_approved_by?: string | null
          admin_approved_at?: string | null
          overall_status?: Database["public"]["Enums"]["request_status"]
          rejection_reason?: string | null
          closed_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_sr_customer"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "fk_sr_machine"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["machine_id"]
          }
        ]
      }
      notifications: {
        Row: {
          notification_id: string
          user_id: string
          title: string
          message: string
          notification_type: string | null
          is_read: boolean | null
          sent_email: boolean | null
          sent_sms: boolean | null
          link: string | null
          created_at: string | null
        }
        Insert: {
          notification_id?: string
          user_id: string
          title: string
          message: string
          notification_type?: string | null
          is_read?: boolean | null
          sent_email?: boolean | null
          sent_sms?: boolean | null
          link?: string | null
          created_at?: string | null
        }
        Update: {
          notification_id?: string
          user_id?: string
          title?: string
          message?: string
          notification_type?: string | null
          is_read?: boolean | null
          sent_email?: boolean | null
          sent_sms?: boolean | null
          link?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: number
          user_id: string | null
          role: string | null
        }
        Insert: {
          id?: number
          user_id?: string | null
          role?: string | null
        }
        Update: {
          id?: number
          user_id?: string | null
          role?: string | null
        }
        Relationships: []
      }
      category_master: {
        Row: {
          category_code: Database["public"]["Enums"]["customer_category"]
          category_name: string
          loyalty_points: number
          description: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          category_code: Database["public"]["Enums"]["customer_category"]
          category_name: string
          loyalty_points: number
          description?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          category_code?: Database["public"]["Enums"]["customer_category"]
          category_name?: string
          loyalty_points?: number
          description?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      benefits_master: {
        Row: {
          benefit_id: string
          benefit_name: string
          description: string | null
          created_at: string | null
          coverage_amount: number | null
        }
        Insert: {
          benefit_id?: string
          benefit_name: string
          description?: string | null
          created_at?: string | null
          coverage_amount?: number | null
        }
        Update: {
          benefit_id?: string
          benefit_name?: string
          description?: string | null
          created_at?: string | null
          coverage_amount?: number | null
        }
        Relationships: []
      }
      category_benefits: {
        Row: {
          id: string
          category_code: Database["public"]["Enums"]["customer_category"]
          benefit_id: string
          created_at: string | null
        }
        Insert: {
          id?: string
          category_code: Database["public"]["Enums"]["customer_category"]
          benefit_id: string
          created_at?: string | null
        }
        Update: {
          id?: string
          category_code?: Database["public"]["Enums"]["customer_category"]
          benefit_id?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "category_benefits_benefit_id_fkey"
            columns: ["benefit_id"]
            isOneToOne: false
            referencedRelation: "benefits_master"
            referencedColumns: ["benefit_id"]
          }
        ]
      }
    }
    Views: {}
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      active_status: "ACTIVE" | "INACTIVE"
      assignment_status: "ACTIVE" | "INACTIVE" | "COMPLETED"
      machine_status: "UNASSIGNED" | "ASSIGNED" | "UNDER_MAINTENANCE" | "RETIRED"
      request_status: "PENDING" | "APPROVED" | "REJECTED"
      user_role: "ADMIN" | "CUSTOMER" | "OPERATOR" | "INSURANCE"
      customer_category: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM"
    }
    CompositeTypes: {}
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
