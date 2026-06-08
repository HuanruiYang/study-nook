import { useState } from 'react'
import { v4 as uuid } from 'uuid'
import type { Book } from '../types'
import { getBooks, saveBook, deleteBook } from '../lib/localStore'
import { assignSpineColor, SPINE_COLORS } from '../lib/colors'
import { useAuth } from '../hooks/useAuth'
import BookCard from '../components/BookCard'

const STATUS_GROUPS: Array<{ key: Book['status']; label: string }> = [
  { key: 'reading', label: '在读' },
  { key: 'want', label: '想读' },
  { key: 'done', label: '读过' },
]

const EMPTY_FORM = { title: '', author: '', translator: '', status: 'want' as Book['status'], totalPages: '', coverColor: '' }

export default function Shelf() {
  const { user } = useAuth()
  const [books, setBooks] = useState<Book[]>(() => getBooks())
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  function refresh() { setBooks(getBooks()) }

  function handleAdd() {
    if (!form.title.trim() || !form.author.trim()) return
    const now = new Date().toISOString()
    const color = form.coverColor || assignSpineColor(books.length)
    const book: Book = {
      id: uuid(),
      user_id: user!.id,
      title: form.title.trim(),
      author: form.author.trim(),
      translator: form.translator.trim() || undefined,
      cover_color: color,
      status: form.status,
      tags: [],
      total_pages: form.totalPages ? parseInt(form.totalPages) : undefined,
      started_at: form.status !== 'want' ? now : undefined,
      finished_at: form.status === 'done' ? now : undefined,
      created_at: now,
      updated_at: now,
    }
    saveBook(book)
    setForm(EMPTY_FORM)
    setShowForm(false)
    refresh()
  }

  function handleDelete(id: string) {
    deleteBook(id)
    refresh()
  }

  function handleStatusChange(id: string, status: Book['status']) {
    const book = books.find(b => b.id === id)
    if (!book) return
    const now = new Date().toISOString()
    saveBook({
      ...book,
      status,
      updated_at: now,
      started_at: status !== 'want' && !book.started_at ? now : book.started_at,
      finished_at: status === 'done' && !book.finished_at ? now : book.finished_at,
      progress: status === 'done' ? 100 : status === 'reading' ? book.progress : undefined,
    })
    refresh()
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-medium text-[#3D3A32]" style={{ fontFamily: '"Georgia", "Noto Serif SC", serif' }}>
          书架
        </h1>
        <button onClick={() => setShowForm(v => !v)}
          className="px-4 py-1.5 text-sm bg-[#3D3A32] text-[#F5F2EB] rounded-lg hover:bg-[#5a564d] transition-colors">
          + 添加书目
        </button>
      </div>

      {showForm && (
        <div className="bg-[#E8E3D8] border border-black/10 rounded-xl p-5 mb-6">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-4">
            <input placeholder="书名 *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="col-span-2 bg-transparent border-b border-black/20 pb-1.5 text-[15px] text-[#3D3A32] outline-none placeholder-[#7A7468]" />
            <input placeholder="作者 *" value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
              className="bg-transparent border-b border-black/20 pb-1.5 text-sm text-[#3D3A32] outline-none placeholder-[#7A7468]" />
            <input placeholder="译者（选填）" value={form.translator} onChange={e => setForm(f => ({ ...f, translator: e.target.value }))}
              className="bg-transparent border-b border-black/20 pb-1.5 text-sm text-[#3D3A32] outline-none placeholder-[#7A7468]" />
            <input type="number" placeholder="总页数（选填）" value={form.totalPages} onChange={e => setForm(f => ({ ...f, totalPages: e.target.value }))}
              className="bg-transparent border-b border-black/20 pb-1.5 text-sm text-[#3D3A32] outline-none placeholder-[#7A7468]" />
          </div>

          <div className="flex gap-4 mb-4">
            {STATUS_GROUPS.map(s => (
              <label key={s.key} className="flex items-center gap-1.5 text-sm text-[#3D3A32] cursor-pointer">
                <input type="radio" name="add-status" value={s.key} checked={form.status === s.key}
                  onChange={() => setForm(f => ({ ...f, status: s.key }))} className="accent-[#3D3A32]" />
                {s.label}
              </label>
            ))}
          </div>

          <div className="mb-4">
            <p className="text-[11px] text-[#7A7468] mb-2 uppercase tracking-wide">书脊颜色（留空自动分配）</p>
            <div className="flex gap-2 flex-wrap">
              {SPINE_COLORS.map(c => (
                <button key={c} onClick={() => setForm(f => ({ ...f, coverColor: f.coverColor === c ? '' : c }))}
                  className="w-6 h-6 rounded-full border-2 transition-all"
                  style={{ backgroundColor: c, borderColor: form.coverColor === c ? '#3D3A32' : 'rgba(0,0,0,0.12)' }} />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={() => { setShowForm(false); setForm(EMPTY_FORM) }}
              className="px-4 py-1.5 text-sm text-[#7A7468] hover:text-[#3D3A32] transition-colors">取消</button>
            <button onClick={handleAdd} disabled={!form.title.trim() || !form.author.trim()}
              className="px-4 py-1.5 text-sm bg-[#3D3A32] text-[#F5F2EB] rounded-lg disabled:opacity-40 hover:bg-[#5a564d] transition-colors">
              添加
            </button>
          </div>
        </div>
      )}

      {STATUS_GROUPS.map(({ key, label }) => {
        const group = books.filter(b => b.status === key)
        if (group.length === 0) return null
        return (
          <section key={key} className="mb-8">
            <h2 className="text-[13px] font-medium text-[#7A7468] uppercase tracking-wider mb-3">
              {label} · {group.length}
            </h2>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {group.map(b => (
                <BookCard key={b.id} book={b} onDelete={handleDelete} onStatusChange={handleStatusChange} />
              ))}
            </div>
          </section>
        )
      })}

      {books.length === 0 && !showForm && (
        <div className="text-center py-16 text-[#7A7468]">
          <p className="text-lg mb-2">书架还是空的</p>
          <p className="text-sm">点击「添加书目」开始记录你的阅读吧</p>
        </div>
      )}
    </div>
  )
}
