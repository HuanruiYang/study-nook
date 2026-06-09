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
