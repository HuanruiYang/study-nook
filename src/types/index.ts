export interface Book {
  id: string
  user_id: string
  title: string
  author: string
  translator?: string
  cover_color: string
  status: 'want' | 'reading' | 'done'
  started_at?: string
  finished_at?: string
  tags: string[]
  progress?: number
  current_page?: number
  total_pages?: number
  created_at: string
  updated_at: string
}

export interface ReviewLayer {
  id: string
  user_id: string
  book_id: string
  stage?: 'before' | 'during' | 'after'
  label: string
  color: string
  content: string
  word_count: number
  created_at: string
}

export interface Quote {
  id: string
  user_id: string
  book_id: string
  content: string
  reflection?: string
  page?: number
  location?: string
  source: 'manual' | 'kindle'
  highlight_color?: 'yellow' | 'blue' | 'pink' | 'orange'
  created_at: string
}

export interface Spark {
  id: string
  user_id: string
  book_id?: string
  content: string
  tags: string[]
  created_at: string
}
