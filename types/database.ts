export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          phone: string | null
          role: 'customer' | 'vendor' | 'admin'
          avatar_url: string | null
          referral_code: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          phone?: string | null
          role?: 'customer' | 'vendor' | 'admin'
          avatar_url?: string | null
          referral_code?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          phone?: string | null
          role?: 'customer' | 'vendor' | 'admin'
          avatar_url?: string | null
          referral_code?: string | null
          created_at?: string
        }
      }
      vendors: {
        Row: {
          id: string
          user_id: string
          store_name: string
          slug: string
          logo_url: string | null
          banner_url: string | null
          bio: string | null
          city: string | null
          category: string | null
          whatsapp: string | null
          is_verified: boolean
          is_active: boolean
          status: 'pending' | 'approved' | 'rejected'
          commission_rate: number
          bank_name: string | null
          iban: string | null
          account_holder: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          store_name: string
          slug: string
          logo_url?: string | null
          banner_url?: string | null
          bio?: string | null
          city?: string | null
          category?: string | null
          whatsapp?: string | null
          is_verified?: boolean
          is_active?: boolean
          status?: 'pending' | 'approved' | 'rejected'
          commission_rate?: number
          bank_name?: string | null
          iban?: string | null
          account_holder?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          store_name?: string
          slug?: string
          logo_url?: string | null
          banner_url?: string | null
          bio?: string | null
          city?: string | null
          category?: string | null
          whatsapp?: string | null
          is_verified?: boolean
          is_active?: boolean
          status?: 'pending' | 'approved' | 'rejected'
          commission_rate?: number
          bank_name?: string | null
          iban?: string | null
          account_holder?: string | null
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          vendor_id: string
          name: string
          slug: string
          description: string | null
          price: number
          compare_price: number | null
          category: string | null
          subcategory: string | null
          images: string[]
          sizes: string[]
          colors: string[]
          stock: number
          is_active: boolean
          is_featured: boolean
          created_at: string
        }
        Insert: {
          id?: string
          vendor_id: string
          name: string
          slug: string
          description?: string | null
          price: number
          compare_price?: number | null
          category?: string | null
          subcategory?: string | null
          images?: string[]
          sizes?: string[]
          colors?: string[]
          stock?: number
          is_active?: boolean
          is_featured?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          vendor_id?: string
          name?: string
          slug?: string
          description?: string | null
          price?: number
          compare_price?: number | null
          category?: string | null
          subcategory?: string | null
          images?: string[]
          sizes?: string[]
          colors?: string[]
          stock?: number
          is_active?: boolean
          is_featured?: boolean
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          customer_id: string | null
          status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
          total: number
          shipping_name: string
          shipping_phone: string
          shipping_address: string
          shipping_city: string
          shipping_notes: string | null
          payment_method: string
          cod_collected: boolean
          coupon_code: string | null
          coupon_discount: number
          loyalty_points_used: number
          loyalty_discount: number
          delivery_fee: number
          created_at: string
        }
        Insert: {
          id?: string
          customer_id?: string | null
          status?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
          total: number
          shipping_name: string
          shipping_phone: string
          shipping_address: string
          shipping_city: string
          shipping_notes?: string | null
          payment_method?: string
          cod_collected?: boolean
          coupon_code?: string | null
          coupon_discount?: number
          loyalty_points_used?: number
          loyalty_discount?: number
          delivery_fee?: number
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string | null
          status?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
          total?: number
          shipping_name?: string
          shipping_phone?: string
          shipping_address?: string
          shipping_city?: string
          shipping_notes?: string | null
          payment_method?: string
          cod_collected?: boolean
          coupon_code?: string | null
          coupon_discount?: number
          loyalty_points_used?: number
          loyalty_discount?: number
          delivery_fee?: number
          created_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          vendor_id: string | null
          quantity: number
          size: string | null
          color: string | null
          price: number
          vendor_commission_due: number | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          vendor_id?: string | null
          quantity: number
          size?: string | null
          color?: string | null
          price: number
          vendor_commission_due?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          vendor_id?: string | null
          quantity?: number
          size?: string | null
          color?: string | null
          price?: number
          vendor_commission_due?: number | null
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          customer_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          customer_id: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          customer_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
        }
      }
      vendor_reviews: {
        Row: {
          id: string
          vendor_id: string
          customer_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          vendor_id: string
          customer_id: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          vendor_id?: string
          customer_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
        }
      }
      wishlists: {
        Row: {
          id: string
          user_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          created_at?: string
        }
      }
      coupons: {
        Row: {
          id: string
          code: string
          discount_type: 'fixed' | 'percent'
          discount_value: number
          min_order: number
          expires_at: string | null
          uses_limit: number | null
          uses_count: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          discount_type: 'fixed' | 'percent'
          discount_value: number
          min_order?: number
          expires_at?: string | null
          uses_limit?: number | null
          uses_count?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          discount_type?: 'fixed' | 'percent'
          discount_value?: number
          min_order?: number
          expires_at?: string | null
          uses_limit?: number | null
          uses_count?: number
          is_active?: boolean
          created_at?: string
        }
      }
      vendor_plans: {
        Row: {
          id: string
          vendor_id: string
          plan: 'free' | 'pro'
          started_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          vendor_id: string
          plan?: 'free' | 'pro'
          started_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          vendor_id?: string
          plan?: 'free' | 'pro'
          started_at?: string | null
          created_at?: string
        }
      }
      featured_slots: {
        Row: {
          id: string
          vendor_id: string
          slot_type: 'homepage' | 'category' | 'top'
          starts_at: string
          ends_at: string
          is_paid: boolean
          created_at: string
        }
        Insert: {
          id?: string
          vendor_id: string
          slot_type: 'homepage' | 'category' | 'top'
          starts_at: string
          ends_at: string
          is_paid?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          vendor_id?: string
          slot_type?: 'homepage' | 'category' | 'top'
          starts_at?: string
          ends_at?: string
          is_paid?: boolean
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          message: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          message: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          message?: string
          read?: boolean
          created_at?: string
        }
      }
      loyalty_points: {
        Row: {
          id: string
          user_id: string
          points: number
          reason: string
          order_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          points: number
          reason: string
          order_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          points?: number
          reason?: string
          order_id?: string | null
          created_at?: string
        }
      }
      commission_ledger: {
        Row: {
          id: string
          vendor_id: string
          order_id: string | null
          amount_owed: number
          amount_paid: number
          status: 'pending' | 'paid'
          due_date: string | null
          paid_at: string | null
          payment_note: string | null
          payment_method: string | null
          created_at: string
        }
        Insert: {
          id?: string
          vendor_id: string
          order_id?: string | null
          amount_owed: number
          amount_paid?: number
          status?: 'pending' | 'paid'
          due_date?: string | null
          paid_at?: string | null
          payment_note?: string | null
          payment_method?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          vendor_id?: string
          order_id?: string | null
          amount_owed?: number
          amount_paid?: number
          status?: 'pending' | 'paid'
          due_date?: string | null
          paid_at?: string | null
          payment_note?: string | null
          payment_method?: string | null
          created_at?: string
        }
      }
      email_subscribers: {
        Row: {
          id: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
        }
      }
      referrals: {
        Row: {
          id: string
          referrer_id: string
          referee_id: string
          status: 'pending' | 'completed'
          created_at: string
        }
        Insert: {
          id?: string
          referrer_id: string
          referee_id: string
          status?: 'pending' | 'completed'
          created_at?: string
        }
        Update: {
          id?: string
          referrer_id?: string
          referee_id?: string
          status?: 'pending' | 'completed'
          created_at?: string
        }
      }
      referral_credits: {
        Row: {
          id: string
          user_id: string
          amount: number
          reason: string
          order_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          reason: string
          order_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          reason?: string
          order_id?: string | null
          created_at?: string
        }
      }
      flash_sales: {
        Row: {
          id: string
          vendor_id: string
          product_id: string
          discount_percent: number
          starts_at: string
          ends_at: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          vendor_id: string
          product_id: string
          discount_percent: number
          starts_at: string
          ends_at: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          vendor_id?: string
          product_id?: string
          discount_percent?: number
          starts_at?: string
          ends_at?: string
          is_active?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_vendor: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      my_vendor_id: {
        Args: Record<PropertyKey, never>
        Returns: string | null
      }
      decrement_stock: {
        Args: { product_id: string; amount: number }
        Returns: undefined
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

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
