export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; full_name: string | null; created_at: string; updated_at: string };
        Insert: { id: string; full_name?: string | null; created_at?: string; updated_at?: string };
        Update: { id?: string; full_name?: string | null; created_at?: string; updated_at?: string };
        Relationships: [];
      };
      restaurants: {
        Row: { id: string; name: string; slug: string; description: string | null; logo_url: string | null; cover_image_url: string | null; address: string | null; city: string | null; postal_code: string | null; country: string; phone: string | null; website_url: string | null; google_review_url: string | null; is_active: boolean; created_at: string; updated_at: string };
        Insert: { id?: string; name: string; slug: string; description?: string | null; logo_url?: string | null; cover_image_url?: string | null; address?: string | null; city?: string | null; postal_code?: string | null; country?: string; phone?: string | null; website_url?: string | null; google_review_url?: string | null; is_active?: boolean; created_at?: string; updated_at?: string };
        Update: { id?: string; name?: string; slug?: string; description?: string | null; logo_url?: string | null; cover_image_url?: string | null; address?: string | null; city?: string | null; postal_code?: string | null; country?: string; phone?: string | null; website_url?: string | null; google_review_url?: string | null; is_active?: boolean; created_at?: string; updated_at?: string };
        Relationships: [];
      };
      restaurant_members: {
        Row: { id: string; restaurant_id: string; user_id: string; role: RestaurantRole; created_at: string };
        Insert: { id?: string; restaurant_id: string; user_id: string; role?: RestaurantRole; created_at?: string };
        Update: { id?: string; restaurant_id?: string; user_id?: string; role?: RestaurantRole; created_at?: string };
        Relationships: [];
      };
      menus: {
        Row: { id: string; restaurant_id: string; name: string; slug: string; description: string | null; is_published: boolean; is_default: boolean; created_at: string; updated_at: string };
        Insert: { id?: string; restaurant_id: string; name: string; slug: string; description?: string | null; is_published?: boolean; is_default?: boolean; created_at?: string; updated_at?: string };
        Update: { id?: string; restaurant_id?: string; name?: string; slug?: string; description?: string | null; is_published?: boolean; is_default?: boolean; created_at?: string; updated_at?: string };
        Relationships: [];
      };
      menu_categories: {
        Row: { id: string; menu_id: string; name: string; description: string | null; sort_order: number; is_active: boolean; created_at: string; updated_at: string };
        Insert: { id?: string; menu_id: string; name: string; description?: string | null; sort_order?: number; is_active?: boolean; created_at?: string; updated_at?: string };
        Update: { id?: string; menu_id?: string; name?: string; description?: string | null; sort_order?: number; is_active?: boolean; created_at?: string; updated_at?: string };
        Relationships: [];
      };
      menu_items: {
        Row: { id: string; category_id: string; name: string; description: string | null; price: number; currency: string; image_url: string | null; allergens: string[] | null; tags: string[] | null; sort_order: number; is_available: boolean; is_featured: boolean; created_at: string; updated_at: string };
        Insert: { id?: string; category_id: string; name: string; description?: string | null; price: number; currency?: string; image_url?: string | null; allergens?: string[] | null; tags?: string[] | null; sort_order?: number; is_available?: boolean; is_featured?: boolean; created_at?: string; updated_at?: string };
        Update: { id?: string; category_id?: string; name?: string; description?: string | null; price?: number; currency?: string; image_url?: string | null; allergens?: string[] | null; tags?: string[] | null; sort_order?: number; is_available?: boolean; is_featured?: boolean; created_at?: string; updated_at?: string };
        Relationships: [];
      };
      qr_codes: {
        Row: { id: string; restaurant_id: string; menu_id: string; name: string | null; code: string; type: QrCodeType; is_active: boolean; created_at: string };
        Insert: { id?: string; restaurant_id: string; menu_id: string; name?: string | null; code: string; type?: QrCodeType; is_active?: boolean; created_at?: string };
        Update: { id?: string; restaurant_id?: string; menu_id?: string; name?: string | null; code?: string; type?: QrCodeType; is_active?: boolean; created_at?: string };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
  auth: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type RestaurantRole = "owner" | "admin" | "editor" | "viewer";
export type QrCodeType = "menu" | "table" | "review";
