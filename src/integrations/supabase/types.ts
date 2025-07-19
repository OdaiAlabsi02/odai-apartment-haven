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
      apartments: {
        Row: {
          additional_details: string | null
          air_conditioning: boolean | null
          amenities: Json | null
          amenity_details: Json | null
          apartment_number: string | null
          available_from: string | null
          available_until: string | null
          balcony: boolean | null
          bathrooms: number | null
          bbq: boolean | null
          bed_linen: boolean | null
          bedroom_1_bed_types: string[] | null
          bedroom_1_beds: number | null
          bedroom_2_bed_types: string[] | null
          bedroom_2_beds: number | null
          bedroom_3_bed_types: string[] | null
          bedroom_3_beds: number | null
          bedroom_4_bed_types: string[] | null
          bedroom_4_beds: number | null
          bedroom_5_bed_types: string[] | null
          bedroom_5_beds: number | null
          bedrooms: number | null
          building_number: string | null
          coffee_maker: boolean | null
          created_at: string | null
          description: string | null
          dishwasher: boolean | null
          dryer: boolean | null
          elevator: boolean | null
          featured: boolean | null
          fire_extinguisher: boolean | null
          first_aid: boolean | null
          garden: boolean | null
          google_location: string | null
          gym: boolean | null
          hair_dryer: boolean | null
          heating: boolean | null
          id: string
          image_count: number | null
          image_details: Json | null
          image_urls: string[] | null
          images: string[] | null
          iron: boolean | null
          is_active: boolean | null
          is_draft: boolean | null
          kitchen: boolean | null
          latitude: number | null
          location: string | null
          location_details: Json | null
          longitude: number | null
          max_guests: number
          microwave: boolean | null
          name: string
          netflix: boolean | null
          oven: boolean | null
          owner_id: string | null
          parking: boolean | null
          pool: boolean | null
          price_per_night: number
          primary_image: string | null
          refrigerator: boolean | null
          security: boolean | null
          shampoo: boolean | null
          smoke_detector: boolean | null
          soap: boolean | null
          stove: boolean | null
          street_name: string | null
          terrace: boolean | null
          total_beds: number | null
          towels: boolean | null
          tv: boolean | null
          updated_at: string | null
          washer: boolean | null
          wifi: boolean | null
          workspace: boolean | null
        }
        Insert: {
          additional_details?: string | null
          air_conditioning?: boolean | null
          amenities?: Json | null
          amenity_details?: Json | null
          apartment_number?: string | null
          available_from?: string | null
          available_until?: string | null
          balcony?: boolean | null
          bathrooms?: number | null
          bbq?: boolean | null
          bed_linen?: boolean | null
          bedroom_1_bed_types?: string[] | null
          bedroom_1_beds?: number | null
          bedroom_2_bed_types?: string[] | null
          bedroom_2_beds?: number | null
          bedroom_3_bed_types?: string[] | null
          bedroom_3_beds?: number | null
          bedroom_4_bed_types?: string[] | null
          bedroom_4_beds?: number | null
          bedroom_5_bed_types?: string[] | null
          bedroom_5_beds?: number | null
          bedrooms?: number | null
          building_number?: string | null
          coffee_maker?: boolean | null
          created_at?: string | null
          description?: string | null
          dishwasher?: boolean | null
          dryer?: boolean | null
          elevator?: boolean | null
          featured?: boolean | null
          fire_extinguisher?: boolean | null
          first_aid?: boolean | null
          garden?: boolean | null
          google_location?: string | null
          gym?: boolean | null
          hair_dryer?: boolean | null
          heating?: boolean | null
          id?: string
          image_count?: number | null
          image_details?: Json | null
          image_urls?: string[] | null
          images?: string[] | null
          iron?: boolean | null
          is_active?: boolean | null
          is_draft?: boolean | null
          kitchen?: boolean | null
          latitude?: number | null
          location?: string | null
          location_details?: Json | null
          longitude?: number | null
          max_guests: number
          microwave?: boolean | null
          name: string
          netflix?: boolean | null
          oven?: boolean | null
          owner_id?: string | null
          parking?: boolean | null
          pool?: boolean | null
          price_per_night: number
          primary_image?: string | null
          refrigerator?: boolean | null
          security?: boolean | null
          shampoo?: boolean | null
          smoke_detector?: boolean | null
          soap?: boolean | null
          stove?: boolean | null
          street_name?: string | null
          terrace?: boolean | null
          total_beds?: number | null
          towels?: boolean | null
          tv?: boolean | null
          updated_at?: string | null
          washer?: boolean | null
          wifi?: boolean | null
          workspace?: boolean | null
        }
        Update: {
          additional_details?: string | null
          air_conditioning?: boolean | null
          amenities?: Json | null
          amenity_details?: Json | null
          apartment_number?: string | null
          available_from?: string | null
          available_until?: string | null
          balcony?: boolean | null
          bathrooms?: number | null
          bbq?: boolean | null
          bed_linen?: boolean | null
          bedroom_1_bed_types?: string[] | null
          bedroom_1_beds?: number | null
          bedroom_2_bed_types?: string[] | null
          bedroom_2_beds?: number | null
          bedroom_3_bed_types?: string[] | null
          bedroom_3_beds?: number | null
          bedroom_4_bed_types?: string[] | null
          bedroom_4_beds?: number | null
          bedroom_5_bed_types?: string[] | null
          bedroom_5_beds?: number | null
          bedrooms?: number | null
          building_number?: string | null
          coffee_maker?: boolean | null
          created_at?: string | null
          description?: string | null
          dishwasher?: boolean | null
          dryer?: boolean | null
          elevator?: boolean | null
          featured?: boolean | null
          fire_extinguisher?: boolean | null
          first_aid?: boolean | null
          garden?: boolean | null
          google_location?: string | null
          gym?: boolean | null
          hair_dryer?: boolean | null
          heating?: boolean | null
          id?: string
          image_count?: number | null
          image_details?: Json | null
          image_urls?: string[] | null
          images?: string[] | null
          iron?: boolean | null
          is_active?: boolean | null
          is_draft?: boolean | null
          kitchen?: boolean | null
          latitude?: number | null
          location?: string | null
          location_details?: Json | null
          longitude?: number | null
          max_guests?: number
          microwave?: boolean | null
          name?: string
          netflix?: boolean | null
          oven?: boolean | null
          owner_id?: string | null
          parking?: boolean | null
          pool?: boolean | null
          price_per_night?: number
          primary_image?: string | null
          refrigerator?: boolean | null
          security?: boolean | null
          shampoo?: boolean | null
          smoke_detector?: boolean | null
          soap?: boolean | null
          stove?: boolean | null
          street_name?: string | null
          terrace?: boolean | null
          total_beds?: number | null
          towels?: boolean | null
          tv?: boolean | null
          updated_at?: string | null
          washer?: boolean | null
          wifi?: boolean | null
          workspace?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "apartments_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          admin_notes: string | null
          apartment_id: string | null
          check_in: string
          check_out: string
          created_at: string | null
          guest_email: string | null
          guest_name: string | null
          guest_phone: string | null
          guests: number
          id: string
          notes: string | null
          payment_method: string | null
          payment_status: string | null
          status: string | null
          total_amount: number | null
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          apartment_id?: string | null
          check_in: string
          check_out: string
          created_at?: string | null
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          guests: number
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          status?: string | null
          total_amount?: number | null
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          apartment_id?: string | null
          check_in?: string
          check_out?: string
          created_at?: string | null
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          guests?: number
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          status?: string | null
          total_amount?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_apartment_id_fkey"
            columns: ["apartment_id"]
            isOneToOne: false
            referencedRelation: "apartments"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          role: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          role?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_bed_details_text_from_columns: {
        Args: { apartment_uuid: string }
        Returns: string
      }
      get_total_bedrooms: {
        Args: { apartment_uuid: string }
        Returns: number
      }
      get_total_beds_from_columns: {
        Args: { apartment_uuid: string }
        Returns: number
      }
      insert_apartment_with_all_details: {
        Args: {
          p_name: string
          p_location: string
          p_price_per_night: number
          p_max_guests: number
          p_description: string
          p_bedrooms: number
          p_bathrooms: number
          p_street_name: string
          p_building_number: string
          p_apartment_number: string
          p_additional_details: string
          p_google_location: string
          p_latitude: number
          p_longitude: number
          p_primary_image: string
          p_image_urls: string[]
          p_bedroom_1_beds?: number
          p_bedroom_1_bed_types?: string[]
          p_bedroom_2_beds?: number
          p_bedroom_2_bed_types?: string[]
          p_bedroom_3_beds?: number
          p_bedroom_3_bed_types?: string[]
          p_bedroom_4_beds?: number
          p_bedroom_4_bed_types?: string[]
          p_bedroom_5_beds?: number
          p_bedroom_5_bed_types?: string[]
          p_wifi?: boolean
          p_air_conditioning?: boolean
          p_heating?: boolean
          p_kitchen?: boolean
          p_washer?: boolean
          p_dryer?: boolean
          p_parking?: boolean
          p_elevator?: boolean
          p_gym?: boolean
          p_pool?: boolean
          p_balcony?: boolean
          p_terrace?: boolean
          p_tv?: boolean
          p_netflix?: boolean
          p_workspace?: boolean
          p_iron?: boolean
          p_hair_dryer?: boolean
          p_shampoo?: boolean
          p_soap?: boolean
          p_towels?: boolean
          p_bed_linen?: boolean
          p_coffee_maker?: boolean
          p_microwave?: boolean
          p_dishwasher?: boolean
          p_refrigerator?: boolean
          p_oven?: boolean
          p_stove?: boolean
          p_bbq?: boolean
          p_garden?: boolean
          p_security?: boolean
          p_smoke_detector?: boolean
          p_first_aid?: boolean
          p_fire_extinguisher?: boolean
          p_is_draft?: boolean
        }
        Returns: string
      }
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
