import type { Book, ReviewLayer, Quote, Spark } from '../types'

const KEYS = {
  books: 'shufang_books',
  reviews: 'shufang_reviews',
  quotes: 'shufang_quotes',
  sparks: 'shufang_sparks',
}

function load<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '[]')
  } catch {
    return []
  }
}

function save<T>(key: string, items: T[]) {
  localStorage.setItem(key, JSON.stringify(items))
}

// ── Books ──────────────────────────────────────────────────────────────────

export function getBooks(): Book[] {
  return load<Book>(KEYS.books).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

export function getBook(id: string): Book | undefined {
  return load<Book>(KEYS.books).find(b => b.id === id)
}

export function saveBook(book: Book) {
  const books = load<Book>(KEYS.books)
  const idx = books.findIndex(b => b.id === book.id)
  if (idx >= 0) books[idx] = book
  else books.unshift(book)
  save(KEYS.books, books)
}

export function deleteBook(id: string) {
  save(KEYS.books, load<Book>(KEYS.books).filter(b => b.id !== id))
  save(KEYS.reviews, load<ReviewLayer>(KEYS.reviews).filter(r => r.book_id !== id))
  save(KEYS.quotes, load<Quote>(KEYS.quotes).filter(q => q.book_id !== id))
  save(KEYS.sparks, load<Spark>(KEYS.sparks).filter(s => s.book_id !== id))
}

// ── Review Layers ──────────────────────────────────────────────────────────

export function getReviewLayers(bookId: string): ReviewLayer[] {
  return load<ReviewLayer>(KEYS.reviews).filter(r => r.book_id === bookId)
}

export function saveReviewLayer(layer: ReviewLayer) {
  const layers = load<ReviewLayer>(KEYS.reviews)
  const idx = layers.findIndex(l => l.id === layer.id)
  if (idx >= 0) layers[idx] = layer
  else layers.push(layer)
  save(KEYS.reviews, layers)
}

export function deleteReviewLayer(id: string) {
  save(KEYS.reviews, load<ReviewLayer>(KEYS.reviews).filter(r => r.id !== id))
}

// ── Quotes ─────────────────────────────────────────────────────────────────

export function getQuotes(bookId: string): Quote[] {
  return load<Quote>(KEYS.quotes)
    .filter(q => q.book_id === bookId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export function saveQuote(quote: Quote) {
  const quotes = load<Quote>(KEYS.quotes)
  const idx = quotes.findIndex(q => q.id === quote.id)
  if (idx >= 0) quotes[idx] = quote
  else quotes.push(quote)
  save(KEYS.quotes, quotes)
}

export function importQuotes(quotes: Quote[]): { imported: number; skipped: number } {
  const existing = load<Quote>(KEYS.quotes)
  const existingContents = new Set(existing.map(q => q.content))
  let imported = 0
  let skipped = 0
  for (const q of quotes) {
    if (existingContents.has(q.content)) { skipped++; continue }
    existing.push(q)
    existingContents.add(q.content)
    imported++
  }
  save(KEYS.quotes, existing)
  return { imported, skipped }
}

export function deleteQuote(id: string) {
  save(KEYS.quotes, load<Quote>(KEYS.quotes).filter(q => q.id !== id))
}

// ── Sparks ─────────────────────────────────────────────────────────────────

export function getAllSparks(): Spark[] {
  return load<Spark>(KEYS.sparks).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

export function getSparks(bookId: string): Spark[] {
  return load<Spark>(KEYS.sparks)
    .filter(s => s.book_id === bookId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export function saveSpark(spark: Spark) {
  const sparks = load<Spark>(KEYS.sparks)
  const idx = sparks.findIndex(s => s.id === spark.id)
  if (idx >= 0) sparks[idx] = spark
  else sparks.push(spark)
  save(KEYS.sparks, sparks)
}

export function deleteSpark(id: string) {
  save(KEYS.sparks, load<Spark>(KEYS.sparks).filter(s => s.id !== id))
}
