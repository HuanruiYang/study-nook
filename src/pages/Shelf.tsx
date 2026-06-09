import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { v4 as uuid } from 'uuid'
import type { Book, ReviewLayer } from '../types'
import { assignSpineColor } from '../lib/colors'
import { getBooks, getQuotes, getReviewLayers, saveBook } from '../lib/localStore'
import { useAuth } from '../hooks/useAuth'

const EMPTY_FORM = { title: '', author: '', status: 'want' as Book['status'] }
const STATUS_LABEL: Record<Book['status'], string> = { reading: '在读', want: '想读', done: '读过' }
const STATUS_BG: Record<Book['status'], string> = { reading: '#E7F0E8', want: '#F5EBD8', done: '#E2ECF2' }
const STATUS_FG: Record<Book['status'], string> = { reading: '#3E684D', want: '#B48621', done: '#376D93' }

function noteCount(book: Book) {
  return getReviewLayers(book.id).length + getQuotes(book.id).length
}

function monthTitle(date: string) {
  return new Date(date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })
}

function dayTitle(date: string) {
  return new Date(date).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })
}

export default function Shelf() {
  const { user } = useAuth()
  const location = useLocation()
  const mode = location.pathname.includes('/time') ? 'time' : 'books'
  const [books, setBooks] = useState<Book[]>(() => getBooks())
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | Book['status']>('all')

  const notes = useMemo(() => {
    return books
      .flatMap(book => getReviewLayers(book.id).map(layer => ({ book, layer })))
      .sort((a, b) => new Date(b.layer.created_at).getTime() - new Date(a.layer.created_at).getTime())
  }, [books])

  const filteredBooks = useMemo(() => {
    const q = query.trim().toLowerCase()
    return [...books]
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .filter(book => statusFilter === 'all' || book.status === statusFilter)
      .filter(book => !q || `${book.title} ${book.author}`.toLowerCase().includes(q))
  }, [books, query, statusFilter])

  const filteredNotes = useMemo(() => {
    const q = query.trim().toLowerCase()
    return notes.filter(({ book, layer }) => !q || `${book.title} ${book.author} ${layer.content}`.toLowerCase().includes(q))
  }, [notes, query])

  const noteGroups = useMemo(() => {
    const groups = new Map<string, Array<{ book: Book; layer: ReviewLayer }>>()
    filteredNotes.forEach(item => {
      const key = monthTitle(item.layer.created_at)
      groups.set(key, [...(groups.get(key) ?? []), item])
    })
    return [...groups.entries()]
  }, [filteredNotes])

  const monthNotes = notes.filter(item => item.layer.created_at.slice(0, 7) === new Date().toISOString().slice(0, 7))
  const monthBookCount = new Set(monthNotes.map(item => item.book.id)).size

  function refresh() { setBooks(getBooks()) }

  function addBook() {
    if (!form.title.trim() || !form.author.trim()) return
    const now = new Date().toISOString()
    saveBook({
      id: uuid(),
      user_id: user!.id,
      title: form.title.trim(),
      author: form.author.trim(),
      cover_color: assignSpineColor(books.length),
      status: form.status,
      tags: [],
      started_at: form.status !== 'want' ? now : undefined,
      finished_at: form.status === 'done' ? now : undefined,
      created_at: now,
      updated_at: now,
    })
    setForm(EMPTY_FORM)
    setShowForm(false)
    refresh()
  }

  return (
    <div className="page-frame">
      <header className="mb-3 flex flex-col gap-2.5 md:mb-8 md:gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="serif-title page-title">{mode === 'time' ? '阅读札记' : '书架'}</h1>
          {mode === 'time' && (
            <p className="hidden text-[13px] text-[#57534B] md:mt-3 md:block md:text-[15px]">按时间记录你的阅读思考，所有札记按月、日归档。</p>
          )}
        </div>
        <div className="grid grid-cols-[1fr_auto] gap-2 md:flex md:gap-3">
          <label className="field flex h-9 w-full items-center gap-2 rounded-[8px] px-3 text-[13px] text-[#6F6A60] md:h-11 md:w-[300px] md:text-[14px]">
            <span>⌕</span>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={mode === 'time' ? '搜索札记内容或书名' : '搜索书名、作者或关键词'}
              className="w-full bg-transparent outline-none"
            />
          </label>
          <button onClick={() => setShowForm(v => !v)} className="ink-button h-9 whitespace-nowrap rounded-[8px] px-3 text-[13px] md:h-auto md:px-5 md:text-[14px]">
            + 添加
          </button>
        </div>
      </header>

      {showForm && (
        <div className="warm-card mb-4 rounded-[8px] p-3 md:mb-5 md:p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_130px_auto]">
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="书名" className="field rounded-[7px] px-3 py-2 text-[13px]" />
            <input value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} placeholder="作者" className="field rounded-[7px] px-3 py-2 text-[13px]" />
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Book['status'] }))} className="field rounded-[7px] px-3 py-2 text-[13px]">
              <option value="want">想读</option>
              <option value="reading">在读</option>
              <option value="done">读过</option>
            </select>
            <button onClick={addBook} disabled={!form.title.trim() || !form.author.trim()} className="ink-button rounded-[7px] px-4 py-2 text-[13px] disabled:opacity-40">
              添加
            </button>
          </div>
        </div>
      )}

      {mode === 'books' ? (
        <section>
          <div className="mb-2.5 flex flex-col gap-2.5 md:mb-6 md:gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="mobile-scroll flex gap-2 md:flex-wrap md:gap-4">
              {[
                ['all', '全部'],
                ['reading', '在读'],
                ['want', '想读'],
                ['done', '读过'],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setStatusFilter(key as 'all' | Book['status'])}
                  className={`min-w-[62px] snap-start rounded-[8px] border px-3 py-1.5 text-[12px] transition-colors md:min-w-[86px] md:px-5 md:py-3 md:text-[15px] ${
                    statusFilter === key
                      ? 'border-[#3E684D] text-[#0E6B3C]'
                      : 'border-[#26241F]/10 bg-white/35 text-[#26241F] hover:border-[#26241F]/22'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button className="hidden rounded-[8px] border border-[#26241F]/10 bg-white/35 px-5 py-3 text-[15px] text-[#26241F] md:block">
              ↑↓ 最近更新
            </button>
          </div>

          <div className="warm-card rounded-[8px] p-2.5 md:p-5">
            <div className="mb-2.5 flex items-center gap-2 md:mb-5">
              <span className="h-4 w-1.5 rounded-full bg-[#0E6B3C] md:h-6" />
              <h2 className="text-[15px] font-semibold text-[#26241F] md:text-[18px]">全部书籍</h2>
              <span className="rounded-full bg-[#26241F]/7 px-2.5 py-0.5 text-[12px] text-[#57534B] md:px-3 md:py-1 md:text-[14px]">{filteredBooks.length} 本</span>
            </div>
            <div className="grid gap-2 md:grid-cols-2 md:gap-4 xl:grid-cols-4">
              {filteredBooks.map(book => (
                <Link key={book.id} to={`/book/${book.id}`} className="block rounded-[8px] border border-[#26241F]/10 bg-white/46 p-2.5 transition-colors hover:border-[#26241F]/22 md:p-5">
                  <div className="flex min-h-[50px] gap-2.5 md:min-h-[104px] md:gap-4">
                    <span className="w-1.5 rounded-full" style={{ backgroundColor: book.cover_color }} />
                    <div className="min-w-0 flex-1">
                      <h3 className="serif-title line-clamp-1 text-[16px] font-semibold text-[#26241F] md:text-[20px]">{book.title}</h3>
                      <p className="mt-1 line-clamp-1 text-[11px] text-[#57534B] md:mt-5 md:text-[14px]">{book.author}</p>
                    </div>
                    <span className="self-start rounded-full px-2 py-0.5 text-[10px] md:self-center md:px-3 md:py-1 md:text-[13px]" style={{ backgroundColor: STATUS_BG[book.status], color: STATUS_FG[book.status] }}>
                      {STATUS_LABEL[book.status]}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <div className="grid gap-3 md:gap-8 xl:grid-cols-[1fr_300px]">
          <main className="space-y-4 md:space-y-9">
            {noteGroups.map(([month, items]) => (
              <section key={month}>
                <h2 className="serif-title mb-2.5 text-[18px] font-semibold text-[#26241F] md:mb-5 md:text-[26px]">{month}</h2>
                <div className="space-y-2.5 md:space-y-6">
                  {items.map(({ book, layer }) => (
                    <div key={layer.id} className="grid gap-2 md:grid-cols-[150px_1fr] md:gap-5">
                      <div className="relative flex gap-2 md:gap-4">
                        <span className="mt-1.5 h-2.5 w-2.5 rounded-full border-2 border-[#E8E2D7] bg-[#4E7658] md:mt-3 md:h-4 md:w-4 md:border-4" />
                        <span className="rounded-full bg-[#F0ECE4] px-2.5 py-0.5 text-[11px] text-[#57534B] md:px-4 md:py-2 md:text-[14px]">{dayTitle(layer.created_at)}</span>
                      </div>
                      <Link to={`/book/${book.id}`} className="warm-card block rounded-[8px] p-2.5 md:p-5">
                        <div className="flex gap-2.5 md:gap-5">
                          <div className="w-2 rounded-full" style={{ backgroundColor: book.cover_color }} />
                          <div className="min-w-0 flex-1">
                            <div className="flex justify-between gap-3">
                              <h3 className="serif-title line-clamp-1 text-[16px] font-semibold text-[#26241F] md:text-[22px]">{book.title}</h3>
                              <span className="rounded-full px-2 py-0.5 text-[11px] md:px-3 md:py-1 md:text-[13px]" style={{ backgroundColor: STATUS_BG[book.status], color: STATUS_FG[book.status] }}>
                                {STATUS_LABEL[book.status]}
                              </span>
                            </div>
                            <p className="mt-0.5 text-[11px] text-[#6F6A60] md:mt-2 md:text-[14px]">{book.author}{book.translator && ` · 译：${book.translator}`}</p>
                            <p className="mt-1.5 line-clamp-1 text-[12px] leading-relaxed text-[#57534B] md:mt-4 md:line-clamp-2 md:text-[14px]">{layer.content}</p>
                            <p className="mt-2 text-[11px] text-[#6F6A60] md:mt-5 md:text-[13px]">▤ {noteCount(book)} 条 <span className="mx-2 text-[#26241F]/20 md:mx-4">|</span> {new Date(layer.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </main>

          <aside className="warm-card h-fit rounded-[8px] p-3 md:p-6">
            <h2 className="mb-3 text-[15px] font-semibold text-[#26241F] md:mb-5 md:text-[16px]">本月阅读记录</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[8px] bg-[#EFF4EE] p-3 md:p-4">
                <p className="serif-title text-[28px] font-semibold text-[#3E684D] md:text-[34px]">{monthBookCount}</p>
                <p className="text-[13px] text-[#26241F] md:text-[14px]">在读</p>
                <p className="mt-2 text-[11px] text-[#6F6A60] md:mt-4 md:text-[12px]">较上月 +2 ↑</p>
              </div>
              <div className="rounded-[8px] bg-[#F5EFE4] p-3 md:p-4">
                <p className="serif-title text-[28px] font-semibold text-[#6B4B2B] md:text-[34px]">{monthNotes.length}</p>
                <p className="text-[13px] text-[#26241F] md:text-[14px]">札记</p>
                <p className="mt-2 text-[11px] text-[#6F6A60] md:mt-4 md:text-[12px]">较上月 +2 ↑</p>
              </div>
            </div>
            <div className="mt-4 border-t border-[#26241F]/10 pt-4 md:mt-6 md:pt-5">
              <h3 className="mb-3 text-[14px] font-semibold text-[#26241F] md:mb-4 md:text-[15px]">本月札记分布</h3>
              <div className="grid grid-cols-7 gap-2 text-center text-[11px] text-[#6F6A60] md:gap-3 md:text-[12px]">
                {'一二三四五六日'.split('').map(day => <span key={day}>{day}</span>)}
                {Array.from({ length: 28 }).map((_, i) => (
                  <span key={i} className="mx-auto h-3 w-3 rounded md:h-4 md:w-4" style={{ backgroundColor: i % 9 === 3 ? '#4E7658' : i % 7 === 2 ? '#8FB596' : '#EEEAE2' }} />
                ))}
              </div>
            </div>
            <Link to="/year" className="mt-4 flex items-center gap-2 text-[13px] text-[#26241F] hover:text-[#3E684D] md:mt-7 md:text-[14px]">
              查看统计 <span>›</span>
            </Link>
          </aside>
        </div>
      )}
    </div>
  )
}
