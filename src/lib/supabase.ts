import { createClient } from '@supabase/supabase-js'
import type { Book, ReviewLayer, Quote, Spark } from '../types'

export type Database = {
  public: {
    Tables: {
      books: { Row: Book; Insert: Omit<Book, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Book> }
      review_layers: { Row: ReviewLayer; Insert: Omit<ReviewLayer, 'id' | 'created_at'>; Update: Partial<ReviewLayer> }
      quotes: { Row: Quote; Insert: Omit<Quote, 'id' | 'created_at'>; Update: Partial<Quote> }
      sparks: { Row: Spark; Insert: Omit<Spark, 'id' | 'created_at'>; Update: Partial<Spark> }
    }
  }
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://example.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-anon-key'

export const hasSupabaseConfig = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
)

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
)
