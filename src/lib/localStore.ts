import type { Book, ReviewLayer, Quote, Spark } from '../types'
import { hasSupabaseConfig, supabase, type Database } from './supabase'

const KEYS = {
  books: 'shufang_books',
  reviews: 'shufang_reviews',
  quotes: 'shufang_quotes',
  sparks: 'shufang_sparks',
}

const ACTIVE_USER_KEY = 'shufang_active_user'
const LEGACY_MIGRATED_KEY = 'shufang_legacy_migrated'
const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true' || !hasSupabaseConfig

type TableName = keyof Database['public']['Tables']
type TableRow<T extends TableName> = Database['public']['Tables'][T]['Row']

function activeUserId() {
  return localStorage.getItem(ACTIVE_USER_KEY)
}

function scopedKey(key: string) {
  const userId = activeUserId()
  return userId ? `${key}:${userId}` : key
}

function rawLoad<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '[]')
  } catch {
    return []
  }
}

function rawSave<T>(key: string, items: T[]) {
  localStorage.setItem(key, JSON.stringify(items))
}

function load<T>(key: string): T[] {
  return rawLoad<T>(scopedKey(key))
}

function save<T>(key: string, items: T[]) {
  rawSave(scopedKey(key), items)
}

function cloudEnabled() {
  return Boolean(activeUserId() && hasSupabaseConfig && !DEV_MODE)
}

async function upsertRemote<T extends TableName>(table: T, item: TableRow<T>) {
  if (!cloudEnabled()) return
  const { error } = await supabase.from(table).upsert(item as never)
  if (error) console.warn(`[sync] Failed to upsert ${table}`, error)
}

async function upsertRemoteMany<T extends TableName>(table: T, items: TableRow<T>[]) {
  if (!cloudEnabled() || items.length === 0) return
  const { error } = await supabase.from(table).upsert(items as never)
  if (error) console.warn(`[sync] Failed to upsert ${table}`, error)
}

async function deleteRemote(table: TableName, id: string) {
  if (!cloudEnabled()) return
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) console.warn(`[sync] Failed to delete ${table}`, error)
}

async function deleteRemoteWhere(table: TableName, field: string, value: string) {
  if (!cloudEnabled()) return
  const { error } = await supabase.from(table).delete().eq(field, value)
  if (error) console.warn(`[sync] Failed to delete ${table}`, error)
}

function mergeById<T extends { id: string }>(
  localItems: T[],
  remoteItems: T[],
  newerValue?: (item: T) => string | undefined
) {
  const map = new Map<string, T>()
  for (const item of localItems) map.set(item.id, item)
  for (const item of remoteItems) {
    const existing = map.get(item.id)
    if (!existing) {
      map.set(item.id, item)
      continue
    }
    if (!newerValue) {
      map.set(item.id, item)
      continue
    }
    const existingTime = new Date(newerValue(existing) ?? 0).getTime()
    const remoteTime = new Date(newerValue(item) ?? 0).getTime()
    map.set(item.id, remoteTime >= existingTime ? item : existing)
  }
  return [...map.values()]
}

function assignUserId<T extends { user_id: string }>(items: T[], userId: string): T[] {
  return items.map(item => item.user_id === userId ? item : { ...item, user_id: userId })
}

function migrateLegacyData(userId: string) {
  if (localStorage.getItem(LEGACY_MIGRATED_KEY)) return
  for (const key of Object.values(KEYS)) {
    const legacyItems = rawLoad<unknown>(key)
    const nextKey = `${key}:${userId}`
    if (legacyItems.length > 0 && rawLoad<unknown>(nextKey).length === 0) {
      rawSave(nextKey, legacyItems)
    }
  }
  localStorage.setItem(LEGACY_MIGRATED_KEY, userId)
}

export function setActiveLibraryUser(userId: string | null) {
  if (userId) {
    localStorage.setItem(ACTIVE_USER_KEY, userId)
    migrateLegacyData(userId)
  } else {
    localStorage.removeItem(ACTIVE_USER_KEY)
  }
}

export async function syncCloudLibrary(userId: string) {
  setActiveLibraryUser(userId)
  if (!cloudEnabled()) return

  try {
    const [booksRes, reviewsRes, quotesRes, sparksRes] = await Promise.all([
      supabase.from('books').select('*').eq('user_id', userId),
      supabase.from('review_layers').select('*').eq('user_id', userId),
      supabase.from('quotes').select('*').eq('user_id', userId),
      supabase.from('sparks').select('*').eq('user_id', userId),
    ])

    const results = [booksRes, reviewsRes, quotesRes, sparksRes]
    const firstError = results.find(res => res.error)?.error
    if (firstError) throw firstError

    const localBooks = assignUserId(load<Book>(KEYS.books), userId)
    const localReviews = assignUserId(load<ReviewLayer>(KEYS.reviews), userId)
    const localQuotes = assignUserId(load<Quote>(KEYS.quotes), userId)
    const localSparks = assignUserId(load<Spark>(KEYS.sparks), userId)

    const mergedBooks = mergeById(localBooks, booksRes.data ?? [], item => item.updated_at)
    const mergedReviews = mergeById(localReviews, reviewsRes.data ?? [], item => item.created_at)
    const mergedQuotes = mergeById(localQuotes, quotesRes.data ?? [], item => item.created_at)
    const mergedSparks = mergeById(localSparks, sparksRes.data ?? [], item => item.created_at)

    save(KEYS.books, mergedBooks)
    save(KEYS.reviews, mergedReviews)
    save(KEYS.quotes, mergedQuotes)
    save(KEYS.sparks, mergedSparks)

    await Promise.all([
      upsertRemoteMany('books', mergedBooks),
      upsertRemoteMany('review_layers', mergedReviews),
      upsertRemoteMany('quotes', mergedQuotes),
      upsertRemoteMany('sparks', mergedSparks),
    ])
  } catch (error) {
    console.warn('[sync] Failed to sync cloud library', error)
    throw error
  }
}

// ── Books ──────────────────────────────────────────────────────────────────

export function getBooks(): Book[] {
  return load<Book>(KEYS.books).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

export function ensureDemoLibrary(userId: string) {
  const now = new Date()
  const iso = (daysAgo: number) => {
    const d = new Date(now)
    d.setDate(d.getDate() - daysAgo)
    return d.toISOString()
  }

  const existingSparks = load<Spark>(KEYS.sparks)
  const hasDevMemo = existingSparks.some(s => s.tags.some(t => ['待补充', '待修改', '升级记录'].includes(t)))
  if (!hasDevMemo) {
    save(KEYS.sparks, [
      {
        id: 'demo-spark-dev-1',
        user_id: userId,
        content: '首页需要保持简单：正在读、想读、读过三条路径，每条都能进入记录感受。',
        tags: ['升级记录'],
        created_at: iso(1),
      },
      {
        id: 'demo-spark-dev-2',
        user_id: userId,
        content: '补充 Kindle 导入后的批量整理入口。',
        tags: ['待补充'],
        created_at: iso(4),
      },
      {
        id: 'demo-spark-dev-3',
        user_id: userId,
        content: '书籍详情页的记录入口可以更靠近标题区，减少来回切换。',
        tags: ['待修改'],
        created_at: iso(10),
      },
      ...existingSparks,
    ])
  }

  if (load<Book>(KEYS.books).length > 0) return

  const books: Book[] = [
    {
      id: 'demo-book-1',
      user_id: userId,
      title: '悉达多',
      author: '赫尔曼·黑塞',
      translator: '姜乙',
      cover_color: '#BC644E',
      status: 'reading',
      tags: ['小说', '自我'],
      progress: 64,
      current_page: 168,
      total_pages: 264,
      started_at: iso(18),
      created_at: iso(26),
      updated_at: iso(1),
    },
    {
      id: 'demo-book-2',
      user_id: userId,
      title: '置身事内',
      author: '兰小欢',
      cover_color: '#496F8E',
      status: 'done',
      tags: ['经济', '社会'],
      progress: 100,
      total_pages: 340,
      started_at: iso(42),
      finished_at: iso(8),
      created_at: iso(48),
      updated_at: iso(8),
    },
    {
      id: 'demo-book-3',
      user_id: userId,
      title: '始于极限',
      author: '上野千鹤子 / 铃木凉美',
      cover_color: '#5F8265',
      status: 'want',
      tags: ['访谈', '女性'],
      created_at: iso(3),
      updated_at: iso(3),
    },
    {
      id: 'demo-book-4',
      user_id: userId,
      title: '夜晚的潜水艇',
      author: '陈春成',
      cover_color: '#B7963E',
      status: 'done',
      tags: ['短篇', '想象'],
      progress: 100,
      started_at: iso(80),
      finished_at: iso(63),
      created_at: iso(92),
      updated_at: iso(63),
    },
  ]

  const reviews: ReviewLayer[] = [
    {
      id: 'demo-review-1',
      user_id: userId,
      book_id: 'demo-book-1',
      stage: 'during',
      label: '读到河边',
      color: '#BC644E',
      content: '最打动我的是他没有急着获得答案，而是慢慢让自己变成能够听见答案的人。',
      word_count: 35,
      created_at: iso(2),
    },
    {
      id: 'demo-review-2',
      user_id: userId,
      book_id: 'demo-book-2',
      stage: 'after',
      label: '读后回声',
      color: '#496F8E',
      content: '把宏观问题拆回到地方财政、土地、产业和人，很多抽象判断突然有了具体的重量。',
      word_count: 38,
      created_at: iso(8),
    },
  ]

  const quotes: Quote[] = [
    {
      id: 'demo-quote-1',
      user_id: userId,
      book_id: 'demo-book-1',
      content: '智慧是不能传授的。一个智者试图传授给人的智慧，在别人听来总像愚蠢。',
      reflection: '也许阅读真正留下的是语气，不是结论。',
      page: 119,
      source: 'manual',
      highlight_color: 'yellow',
      created_at: iso(5),
    },
    {
      id: 'demo-quote-2',
      user_id: userId,
      book_id: 'demo-book-2',
      content: '理解现实运行的逻辑，比单纯评价现实更重要。',
      reflection: '这条可以放进以后写政策分析的开头。',
      source: 'manual',
      highlight_color: 'blue',
      created_at: iso(11),
    },
  ]

  const sparks: Spark[] = [
    {
      id: 'demo-spark-1',
      user_id: userId,
      content: '首页需要保持简单：正在读、想读、读过三条路径，每条都能进入记录感受。',
      tags: ['升级记录'],
      created_at: iso(1),
    },
    {
      id: 'demo-spark-2',
      user_id: userId,
      content: '补充 Kindle 导入后的批量整理入口。',
      tags: ['待补充'],
      created_at: iso(4),
    },
    {
      id: 'demo-spark-3',
      user_id: userId,
      content: '书籍详情页的记录入口可以更靠近标题区，减少来回切换。',
      tags: ['待修改'],
      created_at: iso(10),
    },
  ]

  save(KEYS.books, books)
  save(KEYS.reviews, reviews)
  save(KEYS.quotes, quotes)
  save(KEYS.sparks, sparks)
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
  void upsertRemote('books', book)
}

export function deleteBook(id: string) {
  save(KEYS.books, load<Book>(KEYS.books).filter(b => b.id !== id))
  save(KEYS.reviews, load<ReviewLayer>(KEYS.reviews).filter(r => r.book_id !== id))
  save(KEYS.quotes, load<Quote>(KEYS.quotes).filter(q => q.book_id !== id))
  save(KEYS.sparks, load<Spark>(KEYS.sparks).filter(s => s.book_id !== id))
  void Promise.all([
    deleteRemoteWhere('review_layers', 'book_id', id),
    deleteRemoteWhere('quotes', 'book_id', id),
    deleteRemoteWhere('sparks', 'book_id', id),
    deleteRemote('books', id),
  ])
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
  void upsertRemote('review_layers', layer)
}

export function deleteReviewLayer(id: string) {
  save(KEYS.reviews, load<ReviewLayer>(KEYS.reviews).filter(r => r.id !== id))
  void deleteRemote('review_layers', id)
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
  void upsertRemote('quotes', quote)
}

export function importQuotes(quotes: Quote[]): { imported: number; skipped: number } {
  const existing = load<Quote>(KEYS.quotes)
  const existingContents = new Set(existing.map(q => q.content))
  const importedQuotes: Quote[] = []
  let imported = 0
  let skipped = 0
  for (const q of quotes) {
    if (existingContents.has(q.content)) { skipped++; continue }
    existing.push(q)
    existingContents.add(q.content)
    importedQuotes.push(q)
    imported++
  }
  save(KEYS.quotes, existing)
  void upsertRemoteMany('quotes', importedQuotes)
  return { imported, skipped }
}

export function deleteQuote(id: string) {
  save(KEYS.quotes, load<Quote>(KEYS.quotes).filter(q => q.id !== id))
  void deleteRemote('quotes', id)
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
  void upsertRemote('sparks', spark)
}

export function deleteSpark(id: string) {
  save(KEYS.sparks, load<Spark>(KEYS.sparks).filter(s => s.id !== id))
  void deleteRemote('sparks', id)
}
