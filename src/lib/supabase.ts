import { createClient } from '@supabase/supabase-js'
import type { Book, ReviewLayer, Quote, Spark } from '../types'

export type Database = {
  public: {
    Tables: {
      books: { Row: Book; Insert: Book; Update: Partial<Book> }
      review_layers: { Row: ReviewLayer; Insert: ReviewLayer; Update: Partial<ReviewLayer> }
      quotes: { Row: Quote; Insert: Quote; Update: Partial<Quote> }
      sparks: { Row: Spark; Insert: Spark; Update: Partial<Spark> }
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
