export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      box_sizes: {
        Row: {
          base_price: number
          created_at: string
          description: string | null
          display_name: string
          id: string
          is_active: boolean
          item_count_range: string | null
          name: string
          serves_text: string | null
          updated_at: string
        }
        Insert: {
          base_price: number
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          is_active?: boolean
          item_count_range?: string | null
          name: string
          serves_text?: string | null
          updated_at?: string
        }
        Update: {
          base_price?: number
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean
          item_count_range?: string | null
          name?: string
          serves_text?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      box_templates: {
        Row: {
          box_size: string
          created_at: string
          id: string
          product_id: string
          quantity: number
          updated_at: string
          week_start_date: string
        }
        Insert: {
          box_size: string
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          updated_at?: string
          week_start_date: string
        }
        Update: {
          box_size?: string
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          updated_at?: string
          week_start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "box_templates_box_size_fkey"
            columns: ["box_size"]
            isOneToOne: false
            referencedRelation: "box_sizes"
            referencedColumns: ["name"]
          },
          {
            foreignKeyName: "box_templates_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      current_bag: {
        Row: {
          id: string
          product_id: string
          quantity: number
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          product_id: string
          quantity?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          product_id?: string
          quantity?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "current_bag_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_addresses: {
        Row: {
          apartment: string | null
          city: string
          created_at: string
          delivery_instructions: string | null
          id: string
          is_primary: boolean
          state: string
          street_address: string
          updated_at: string
          user_id: string
          zip_code: string
        }
        Insert: {
          apartment?: string | null
          city: string
          created_at?: string
          delivery_instructions?: string | null
          id?: string
          is_primary?: boolean
          state: string
          street_address: string
          updated_at?: string
          user_id: string
          zip_code: string
        }
        Update: {
          apartment?: string | null
          city?: string
          created_at?: string
          delivery_instructions?: string | null
          id?: string
          is_primary?: boolean
          state?: string
          street_address?: string
          updated_at?: string
          user_id?: string
          zip_code?: string
        }
        Relationships: []
      }
      driver_assignments: {
        Row: {
          created_at: string | null
          current_lat: number | null
          current_lng: number | null
          current_stop_index: number | null
          driver_user_id: string
          end_lat: number | null
          end_lng: number | null
          id: string
          route_batch_id: string
          start_lat: number | null
          start_lng: number | null
          total_distance_km: number | null
          total_duration_min: number | null
          updated_at: string | null
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_lat?: number | null
          current_lng?: number | null
          current_stop_index?: number | null
          driver_user_id: string
          end_lat?: number | null
          end_lng?: number | null
          id?: string
          route_batch_id: string
          start_lat?: number | null
          start_lng?: number | null
          total_distance_km?: number | null
          total_duration_min?: number | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_lat?: number | null
          current_lng?: number | null
          current_stop_index?: number | null
          driver_user_id?: string
          end_lat?: number | null
          end_lng?: number | null
          id?: string
          route_batch_id?: string
          start_lat?: number | null
          start_lng?: number | null
          total_distance_km?: number | null
          total_duration_min?: number | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_assignments_route_batch_id_fkey"
            columns: ["route_batch_id"]
            isOneToOne: false
            referencedRelation: "route_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_assignments_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      fresh_catch_announcements: {
        Row: {
          created_at: string
          description: string | null
          fish_name: string
          fisherman_name: string | null
          id: string
          image_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          fish_name: string
          fisherman_name?: string | null
          id?: string
          image_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          fish_name?: string
          fisherman_name?: string | null
          id?: string
          image_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      fresh_fish_alerts: {
        Row: {
          created_at: string
          id: string
          name: string
          phone_number: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          phone_number: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          phone_number?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          price: number
          product_id: string
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          price: number
          product_id: string
          quantity?: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          price?: number
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          delivery_date: string | null
          id: string
          order_date: string
          order_type: string
          status: string
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delivery_date?: string | null
          id?: string
          order_date?: string
          order_type?: string
          status?: string
          total_amount?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          delivery_date?: string | null
          id?: string
          order_date?: string
          order_type?: string
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      partner_applications: {
        Row: {
          business_name: string
          business_type: string
          created_at: string
          email: string
          full_name: string
          id: string
          message: string | null
          phone_number: string
          status: string
          updated_at: string
        }
        Insert: {
          business_name: string
          business_type: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          message?: string | null
          phone_number: string
          status?: string
          updated_at?: string
        }
        Update: {
          business_name?: string
          business_type?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          message?: string | null
          phone_number?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      partner_products: {
        Row: {
          created_at: string
          id: string
          is_featured: boolean
          partner_id: string
          product_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_featured?: boolean
          partner_id: string
          product_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_featured?: boolean
          partner_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_products_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          bio: string | null
          category: string
          created_at: string
          description: string | null
          header_image_url: string | null
          id: string
          image_url: string | null
          is_active: boolean
          location: string | null
          name: string
          partnership_duration: string | null
          rating: number | null
          slug: string
          specialties: string[] | null
          story: string | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          category: string
          created_at?: string
          description?: string | null
          header_image_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          location?: string | null
          name: string
          partnership_duration?: string | null
          rating?: number | null
          slug: string
          specialties?: string[] | null
          story?: string | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          category?: string
          created_at?: string
          description?: string | null
          header_image_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          location?: string | null
          name?: string
          partnership_duration?: string | null
          rating?: number | null
          slug?: string
          specialties?: string[] | null
          story?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          image: string | null
          inventory_count: number | null
          is_available: boolean | null
          name: string
          price: number
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          inventory_count?: number | null
          is_available?: boolean | null
          name: string
          price: number
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          inventory_count?: number | null
          is_available?: boolean | null
          name?: string
          price?: number
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email_newsletter: boolean
          first_name: string | null
          home_base_address: string | null
          id: string
          last_name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          sms_notifications: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_newsletter?: boolean
          first_name?: string | null
          home_base_address?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          sms_notifications?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_newsletter?: boolean
          first_name?: string | null
          home_base_address?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          sms_notifications?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      route_batches: {
        Row: {
          batch_name: string
          created_at: string | null
          dispatcher_user_id: string
          id: string
          optimization_settings_json: Json | null
          optimization_status:
            | Database["public"]["Enums"]["optimization_status"]
            | null
          scheduled_date: string
          updated_at: string | null
        }
        Insert: {
          batch_name: string
          created_at?: string | null
          dispatcher_user_id: string
          id?: string
          optimization_settings_json?: Json | null
          optimization_status?:
            | Database["public"]["Enums"]["optimization_status"]
            | null
          scheduled_date: string
          updated_at?: string | null
        }
        Update: {
          batch_name?: string
          created_at?: string | null
          dispatcher_user_id?: string
          id?: string
          optimization_settings_json?: Json | null
          optimization_status?:
            | Database["public"]["Enums"]["optimization_status"]
            | null
          scheduled_date?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      stop_assignments: {
        Row: {
          created_at: string | null
          driver_assignment_id: string
          id: string
          sequence_index: number
          stop_id: string
        }
        Insert: {
          created_at?: string | null
          driver_assignment_id: string
          id?: string
          sequence_index: number
          stop_id: string
        }
        Update: {
          created_at?: string | null
          driver_assignment_id?: string
          id?: string
          sequence_index?: number
          stop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stop_assignments_driver_assignment_id_fkey"
            columns: ["driver_assignment_id"]
            isOneToOne: false
            referencedRelation: "driver_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stop_assignments_stop_id_fkey"
            columns: ["stop_id"]
            isOneToOne: false
            referencedRelation: "stops"
            referencedColumns: ["id"]
          },
        ]
      }
      stops: {
        Row: {
          address_geocoded_lat: number | null
          address_geocoded_lng: number | null
          address_raw: string
          completed_at: string | null
          created_at: string | null
          customer_name: string
          driver_notes: string | null
          id: string
          load_units: number | null
          notes: string | null
          order_sequence: number | null
          proof_photo_url: string | null
          route_batch_id: string
          service_time_minutes: number | null
          status: Database["public"]["Enums"]["stop_status"] | null
          time_window_end: string | null
          time_window_start: string | null
          updated_at: string | null
        }
        Insert: {
          address_geocoded_lat?: number | null
          address_geocoded_lng?: number | null
          address_raw: string
          completed_at?: string | null
          created_at?: string | null
          customer_name: string
          driver_notes?: string | null
          id?: string
          load_units?: number | null
          notes?: string | null
          order_sequence?: number | null
          proof_photo_url?: string | null
          route_batch_id: string
          service_time_minutes?: number | null
          status?: Database["public"]["Enums"]["stop_status"] | null
          time_window_end?: string | null
          time_window_start?: string | null
          updated_at?: string | null
        }
        Update: {
          address_geocoded_lat?: number | null
          address_geocoded_lng?: number | null
          address_raw?: string
          completed_at?: string | null
          created_at?: string | null
          customer_name?: string
          driver_notes?: string | null
          id?: string
          load_units?: number | null
          notes?: string | null
          order_sequence?: number | null
          proof_photo_url?: string | null
          route_batch_id?: string
          service_time_minutes?: number | null
          status?: Database["public"]["Enums"]["stop_status"] | null
          time_window_end?: string | null
          time_window_start?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stops_route_batch_id_fkey"
            columns: ["route_batch_id"]
            isOneToOne: false
            referencedRelation: "route_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          boxes_per_week: number
          created_at: string
          gluten_free: boolean
          id: string
          local_only: boolean
          no_fish: boolean
          organic: boolean
          updated_at: string
          user_id: string
          vegetarian: boolean
        }
        Insert: {
          boxes_per_week?: number
          created_at?: string
          gluten_free?: boolean
          id?: string
          local_only?: boolean
          no_fish?: boolean
          organic?: boolean
          updated_at?: string
          user_id: string
          vegetarian?: boolean
        }
        Update: {
          boxes_per_week?: number
          created_at?: string
          gluten_free?: boolean
          id?: string
          local_only?: boolean
          no_fish?: boolean
          organic?: boolean
          updated_at?: string
          user_id?: string
          vegetarian?: boolean
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
      user_subscriptions: {
        Row: {
          auto_resume_date: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string
          id: string
          pause_reason: string | null
          paused_at: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          subscription_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_resume_date?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          id?: string
          pause_reason?: string | null
          paused_at?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          subscription_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_resume_date?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          id?: string
          pause_reason?: string | null
          paused_at?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          subscription_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          capacity_units: number | null
          created_at: string | null
          driver_user_id: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          capacity_units?: number | null
          created_at?: string | null
          driver_user_id?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          capacity_units?: number | null
          created_at?: string | null
          driver_user_id?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      weekly_bag_items: {
        Row: {
          created_at: string
          id: string
          item_type: string
          price_at_time: number
          product_id: string
          quantity: number
          updated_at: string
          weekly_bag_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_type?: string
          price_at_time: number
          product_id: string
          quantity?: number
          updated_at?: string
          weekly_bag_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_type?: string
          price_at_time?: number
          product_id?: string
          quantity?: number
          updated_at?: string
          weekly_bag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_bag_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_bag_items_weekly_bag_id_fkey"
            columns: ["weekly_bag_id"]
            isOneToOne: false
            referencedRelation: "weekly_bags"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_bags: {
        Row: {
          addons_total: number | null
          box_price: number | null
          box_size: string | null
          confirmed_at: string | null
          created_at: string
          cutoff_time: string
          delivery_fee: number | null
          id: string
          is_confirmed: boolean
          subtotal: number | null
          total_amount: number | null
          updated_at: string
          user_id: string
          week_end_date: string
          week_start_date: string
        }
        Insert: {
          addons_total?: number | null
          box_price?: number | null
          box_size?: string | null
          confirmed_at?: string | null
          created_at?: string
          cutoff_time: string
          delivery_fee?: number | null
          id?: string
          is_confirmed?: boolean
          subtotal?: number | null
          total_amount?: number | null
          updated_at?: string
          user_id: string
          week_end_date: string
          week_start_date: string
        }
        Update: {
          addons_total?: number | null
          box_price?: number | null
          box_size?: string | null
          confirmed_at?: string | null
          created_at?: string
          cutoff_time?: string
          delivery_fee?: number | null
          id?: string
          is_confirmed?: boolean
          subtotal?: number | null
          total_amount?: number | null
          updated_at?: string
          user_id?: string
          week_end_date?: string
          week_start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_bags_box_size_fkey"
            columns: ["box_size"]
            isOneToOne: false
            referencedRelation: "box_sizes"
            referencedColumns: ["name"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_next_cutoff_time: {
        Args: { input_date?: string }
        Returns: string
      }
      get_or_create_current_week_bag: {
        Args: { user_uuid: string }
        Returns: string
      }
      get_or_create_current_week_bag_with_size: {
        Args: { user_uuid: string; box_size_name?: string }
        Returns: string
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      populate_weekly_bag_from_template: {
        Args: { bag_id: string; box_size_name: string; week_start: string }
        Returns: undefined
      }
      update_weekly_bag_totals: {
        Args: { bag_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
      optimization_status: "pending" | "optimized" | "error"
      stop_status: "pending" | "in_progress" | "done" | "skipped"
      subscription_status: "active" | "paused" | "cancelled" | "suspended"
      user_role: "dispatcher" | "driver"
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
      app_role: ["admin", "user"],
      optimization_status: ["pending", "optimized", "error"],
      stop_status: ["pending", "in_progress", "done", "skipped"],
      subscription_status: ["active", "paused", "cancelled", "suspended"],
      user_role: ["dispatcher", "driver"],
    },
  },
} as const
