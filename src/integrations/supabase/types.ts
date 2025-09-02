export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      amenity_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string | null
          created_at?: string
        }
        Relationships: []
      }
      amenities: {
        Row: {
          id: string
          name: string
          category_id: string | null
          icon: string | null
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category_id?: string | null
          icon?: string | null
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category_id?: string | null
          icon?: string | null
          description?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "amenities_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "amenity_categories"
            referencedColumns: ["id"]
          }
        ]
      }
      apartment_amenities: {
        Row: {
          id: string
          apartment_id: string
          amenity_id: string
          created_at: string
        }
        Insert: {
          id?: string
          apartment_id: string
          amenity_id: string
          created_at?: string
        }
        Update: {
          id?: string
          apartment_id?: string
          amenity_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "apartment_amenities_apartment_id_fkey"
            columns: ["apartment_id"]
            isOneToOne: false
            referencedRelation: "apartments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apartment_amenities_amenity_id_fkey"
            columns: ["amenity_id"]
            isOneToOne: false
            referencedRelation: "amenities"
            referencedColumns: ["id"]
          }
        ]
      }
      apartment_availability: {
        Row: {
          id: string
          apartment_id: string
          date: string
          is_available: boolean
          price_override: number | null
          minimum_stay: number
          maximum_stay: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          apartment_id: string
          date: string
          is_available?: boolean
          price_override?: number | null
          minimum_stay?: number
          maximum_stay?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          apartment_id?: string
          date?: string
          is_available?: boolean
          price_override?: number | null
          minimum_stay?: number
          maximum_stay?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "apartment_availability_apartment_id_fkey"
            columns: ["apartment_id"]
            isOneToOne: false
            referencedRelation: "apartments"
            referencedColumns: ["id"]
          }
        ]
      }
      apartment_images: {
        Row: {
          id: string
          apartment_id: string
          image_url: string
          image_order: number
          category: string | null
          is_primary: boolean
          alt_text: string | null
          created_at: string
        }
        Insert: {
          id?: string
          apartment_id: string
          image_url: string
          image_order?: number
          category?: string | null
          is_primary?: boolean
          alt_text?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          apartment_id?: string
          image_url?: string
          image_order?: number
          category?: string | null
          is_primary?: boolean
          alt_text?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "apartment_images_apartment_id_fkey"
            columns: ["apartment_id"]
            isOneToOne: false
            referencedRelation: "apartments"
            referencedColumns: ["id"]
          }
        ]
      }
      apartment_pricing: {
        Row: {
          id: string
          apartment_id: string
          base_price: number
          weekend_price: number | null
          holiday_price: number | null
          weekly_discount: number
          monthly_discount: number
          cleaning_fee: number
          service_fee: number
          security_deposit: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          apartment_id: string
          base_price: number
          weekend_price?: number | null
          holiday_price?: number | null
          weekly_discount?: number
          monthly_discount?: number
          cleaning_fee?: number
          service_fee?: number
          security_deposit?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          apartment_id?: string
          base_price?: number
          weekend_price?: number | null
          holiday_price?: number | null
          weekly_discount?: number
          monthly_discount?: number
          cleaning_fee?: number
          service_fee?: number
          security_deposit?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "apartment_pricing_apartment_id_fkey"
            columns: ["apartment_id"]
            isOneToOne: false
            referencedRelation: "apartments"
            referencedColumns: ["id"]
          }
        ]
      }
      apartments: {
        Row: {
          id: string
          name: string
          description: string | null
          location: string | null
          price_per_night: number
          max_guests: number
          images: string[] | null
          created_at: string
          owner_id: string | null
          bathrooms: number | null
          bedrooms: number | null
          featured: boolean
          updated_at: string
          street_name: string | null
          building_number: string | null
          apartment_number: string | null
          additional_details: string | null
          google_location: string | null
          latitude: number | null
          longitude: number | null
          is_draft: boolean
          total_beds: number | null
          location_details: Json | null
          image_details: Json | null
          primary_image: string | null
          image_count: number
          image_urls: string[] | null
          bedroom_1_beds: number
          bedroom_1_bed_types: string[] | null
          bedroom_2_beds: number
          bedroom_2_bed_types: string[] | null
          bedroom_3_beds: number
          bedroom_3_bed_types: string[] | null
          bedroom_4_beds: number
          bedroom_4_bed_types: string[] | null
          bedroom_5_beds: number
          bedroom_5_bed_types: string[] | null
          available_from: string | null
          available_until: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          location?: string | null
          price_per_night: number
          max_guests: number
          images?: string[] | null
          created_at?: string
          owner_id?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          featured?: boolean
          updated_at?: string
          street_name?: string | null
          building_number?: string | null
          apartment_number?: string | null
          additional_details?: string | null
          google_location?: string | null
          latitude?: number | null
          longitude?: number | null
          is_draft?: boolean
          total_beds?: number | null
          location_details?: Json | null
          image_details?: Json | null
          primary_image?: string | null
          image_count?: number
          image_urls?: string[] | null
          bedroom_1_beds?: number
          bedroom_1_bed_types?: string[] | null
          bedroom_2_beds?: number
          bedroom_2_bed_types?: string[] | null
          bedroom_3_beds?: number
          bedroom_3_bed_types?: string[] | null
          bedroom_4_beds?: number
          bedroom_4_bed_types?: string[] | null
          bedroom_5_beds?: number
          bedroom_5_bed_types?: string[] | null
          available_from?: string | null
          available_until?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          location?: string | null
          price_per_night?: number
          max_guests?: number
          images?: string[] | null
          created_at?: string
          owner_id?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          featured?: boolean
          updated_at?: string
          street_name?: string | null
          building_number?: string | null
          apartment_number?: string | null
          additional_details?: string | null
          google_location?: string | null
          latitude?: number | null
          longitude?: number | null
          is_draft?: boolean
          total_beds?: number | null
          location_details?: Json | null
          image_details?: Json | null
          primary_image?: string | null
          image_count?: number
          image_urls?: string[] | null
          bedroom_1_beds?: number
          bedroom_1_bed_types?: string[] | null
          bedroom_2_beds?: number
          bedroom_2_bed_types?: string[] | null
          bedroom_3_beds?: number
          bedroom_3_bed_types?: string[] | null
          bedroom_4_beds?: number
          bedroom_4_bed_types?: string[] | null
          bedroom_5_beds?: number
          bedroom_5_bed_types?: string[] | null
          available_from?: string | null
          available_until?: string | null
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "apartments_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      bookings: {
        Row: {
          id: string
          user_id: string | null
          apartment_id: string | null
          check_in: string
          check_out: string
          guests: number
          guest_name: string | null
          guest_email: string | null
          guest_phone: string | null
          status: string
          created_at: string
          payment_method: string | null
          total_amount: number | null
          payment_status: string
          notes: string | null
          admin_notes: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          apartment_id?: string | null
          check_in: string
          check_out: string
          guests: number
          guest_name?: string | null
          guest_email?: string | null
          guest_phone?: string | null
          status?: string
          created_at?: string
          payment_method?: string | null
          total_amount?: number | null
          payment_status?: string
          notes?: string | null
          admin_notes?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          apartment_id?: string | null
          check_in?: string
          check_out?: string
          guests?: number
          guest_name?: string | null
          guest_email?: string | null
          guest_phone?: string | null
          status?: string
          created_at?: string
          payment_method?: string | null
          total_amount?: number | null
          payment_status?: string
          notes?: string | null
          admin_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_apartment_id_fkey"
            columns: ["apartment_id"]
            isOneToOne: false
            referencedRelation: "apartments"
            referencedColumns: ["id"]
          }
        ]
      }
      host_settings: {
        Row: {
          id: string
          user_id: string
          instant_book: boolean
          manual_approval: boolean
          auto_accept_booking: boolean
          min_stay_nights: number
          max_stay_nights: number | null
          check_in_time: string
          check_out_time: string
          self_check_in: boolean
          late_check_out: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          instant_book?: boolean
          manual_approval?: boolean
          auto_accept_booking?: boolean
          min_stay_nights?: number
          max_stay_nights?: number | null
          check_in_time?: string
          check_out_time?: string
          self_check_in?: boolean
          late_check_out?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          instant_book?: boolean
          manual_approval?: boolean
          auto_accept_booking?: boolean
          min_stay_nights?: number
          max_stay_nights?: number | null
          check_in_time?: string
          check_out_time?: string
          self_check_in?: boolean
          late_check_out?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "host_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          apartment_id: string | null
          booking_id: string | null
          message: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          apartment_id?: string | null
          booking_id?: string | null
          message: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          apartment_id?: string | null
          booking_id?: string | null
          message?: string
          is_read?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_apartment_id_fkey"
            columns: ["apartment_id"]
            isOneToOne: false
            referencedRelation: "apartments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          is_read: boolean
          related_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: string
          is_read?: boolean
          related_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          is_read?: boolean
          related_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          email: string | null
          role: string
          created_at: string
          first_name: string | null
          last_name: string | null
          phone: string | null
        }
        Insert: {
          id: string
          email?: string | null
          role?: string
          created_at?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
        }
        Update: {
          id?: string
          email?: string | null
          role?: string
          created_at?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      reviews: {
        Row: {
          id: string
          apartment_id: string
          user_id: string
          booking_id: string | null
          rating: number
          cleanliness_rating: number | null
          communication_rating: number | null
          check_in_rating: number | null
          accuracy_rating: number | null
          location_rating: number | null
          value_rating: number | null
          comment: string | null
          host_response: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          apartment_id: string
          user_id: string
          booking_id?: string | null
          rating: number
          cleanliness_rating?: number | null
          communication_rating?: number | null
          check_in_rating?: number | null
          accuracy_rating?: number | null
          location_rating?: number | null
          value_rating?: number | null
          comment?: string | null
          host_response?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          apartment_id?: string
          user_id?: string
          booking_id?: string | null
          rating?: number
          cleanliness_rating?: number | null
          communication_rating?: number | null
          check_in_rating?: number | null
          accuracy_rating?: number | null
          location_rating?: number | null
          value_rating?: number | null
          comment?: string | null
          host_response?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_apartment_id_fkey"
            columns: ["apartment_id"]
            isOneToOne: false
            referencedRelation: "apartments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      apartment_amenities_view: {
        Row: {
          apartment_id: string | null
          apartment_name: string | null
          amenity_name: string | null
          amenity_icon: string | null
          category_name: string | null
          category_icon: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_apartment_amenities: {
        Args: {
          apartment_uuid: string
        }
        Returns: {
          amenity_name: string
          amenity_icon: string
          category_name: string
          category_icon: string
        }[]
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

// Type aliases for easier use
export type Apartment = Database['public']['Tables']['apartments']['Row'];
export type ApartmentInsert = Database['public']['Tables']['apartments']['Insert'];
export type ApartmentUpdate = Database['public']['Tables']['apartments']['Update'];

export type Booking = Database['public']['Tables']['bookings']['Row'];
export type BookingInsert = Database['public']['Tables']['bookings']['Insert'];
export type BookingUpdate = Database['public']['Tables']['bookings']['Update'];

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type Review = Database['public']['Tables']['reviews']['Row'];
export type ReviewInsert = Database['public']['Tables']['reviews']['Insert'];
export type ReviewUpdate = Database['public']['Tables']['reviews']['Update'];

export type Message = Database['public']['Tables']['messages']['Row'];
export type MessageInsert = Database['public']['Tables']['messages']['Insert'];
export type MessageUpdate = Database['public']['Tables']['messages']['Update'];

export type ApartmentImage = Database['public']['Tables']['apartment_images']['Row'];
export type ApartmentImageInsert = Database['public']['Tables']['apartment_images']['Insert'];
export type ApartmentImageUpdate = Database['public']['Tables']['apartment_images']['Update'];

export type ApartmentAvailability = Database['public']['Tables']['apartment_availability']['Row'];
export type ApartmentAvailabilityInsert = Database['public']['Tables']['apartment_availability']['Insert'];
export type ApartmentAvailabilityUpdate = Database['public']['Tables']['apartment_availability']['Update'];

export type Notification = Database['public']['Tables']['notifications']['Row'];
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];
export type NotificationUpdate = Database['public']['Tables']['notifications']['Update'];

export type AmenityCategory = Database['public']['Tables']['amenity_categories']['Row'];
export type AmenityCategoryInsert = Database['public']['Tables']['amenity_categories']['Insert'];
export type AmenityCategoryUpdate = Database['public']['Tables']['amenity_categories']['Update'];

export type Amenity = Database['public']['Tables']['amenities']['Row'];
export type AmenityInsert = Database['public']['Tables']['amenities']['Insert'];
export type AmenityUpdate = Database['public']['Tables']['amenities']['Update'];

export type ApartmentAmenity = Database['public']['Tables']['apartment_amenities']['Row'];
export type ApartmentAmenityInsert = Database['public']['Tables']['apartment_amenities']['Insert'];
export type ApartmentAmenityUpdate = Database['public']['Tables']['apartment_amenities']['Update'];

export type HostSettings = Database['public']['Tables']['host_settings']['Row'];
export type HostSettingsInsert = Database['public']['Tables']['host_settings']['Insert'];
export type HostSettingsUpdate = Database['public']['Tables']['host_settings']['Update'];

export type ApartmentPricing = Database['public']['Tables']['apartment_pricing']['Row'];
export type ApartmentPricingInsert = Database['public']['Tables']['apartment_pricing']['Insert'];
export type ApartmentPricingUpdate = Database['public']['Tables']['apartment_pricing']['Update'];
