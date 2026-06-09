import { useState, useMemo } from 'react'
import { v4 as uuid } from 'uuid'
import type { Book, Quote } from '../types'
import { parseKindleClippings, type KindleClipping } from '../lib/kindle'
import { getBooks, saveBook, importQuotes } from '../lib/localStore'
import { assignSpineColor } from '../lib/colors'

interface Props {
  bookId?: string
  userId: string
  onDone?: (result: { imported: number; skipped: number }) => void
}

function normalizeTitle(t: string) {
  return t.replace(/[《》「」【】\s]/g, '').toLowerCase()
}

interface BookGroup {
  bookTitle: string
  author: string
  clippings: KindleClipping[]
  matchedBookId?: string
  createNew: boolean
}

export default function KindleImporter({ bookId, userId, onDone }: Props) {
  const [raw, setRaw] = useState('')
  const [step, setStep] = useState<'input' | 'preview' | 'done'>('input')
  const [groups, setGroups] = useState<BookGroup[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [result, setResult] = useState({ imported: 0, skipped: 0 })

  const existingBooks = useMemo(() => getBooks(), [step])

  function handleParse() {
    const clippings = parseKindleClippings(raw)
    if (!clippings.length) return

    if (bookId) {
      // Book mode: all clippings go to this book
      const group: BookGroup = { bookTitle: '', author: '', clippings, matchedBookId: bookId, createNew: false }
      setGroups([group])
      setSelected(new Set([0]))
    } else {
      // Global mode: group by book title, try to match existing
      const map = new Map<string, KindleClipping[]>()
      for (const c of clippings) {
        const key = c.bookTitle
        if (!map.has(key)) map.set(key, [])
        map.get(key)!.push(c)
      }
      const built: BookGroup[] = []
      for (const [title, clips] of map) {
        const norm = normalizeTitle(title)
        const matched = existingBooks.find(b => normalizeTitle(b.title) === norm)
        built.push({ bookTitle: title, author: clips[0].author, clippings: clips, matchedBookId: matched?.id, createNew: !matched })
      }
      setGroups(built)
      setSelected(new Set(built.map((_, i) => i)))
    }
    setStep('preview')
  }

  function handleImport() {
    const now = new Date().toISOString()
    const books = getBooks()
    const allQuotes: Quote[] = []

    for (const i of selected) {
      const g = groups[i]
      let targetId = g.matchedBookId

      if (g.createNew && !bookId) {
        const newBook: Book = {
          id: uuid(), user_id: userId, title: g.bookTitle, author: g.author,
          cover_color: assignSpineColor(books.length + i),
          status: 'done', tags: [], created_at: now, updated_at: now,
        }
        saveBook(newBook)
        targetId = newBook.id
      }

      if (!targetId) continue

      for (const c of g.clippings) {
        allQuotes.push({
          id: uuid(), user_id: userId, book_id: targetId,
          content: c.content, location: c.location || undefined,
          source: 'kindle', highlight_color: c.highlightColor,
          created_at: new Date(now).toISOString(),
        })
      }
    }

    const res = importQuotes(allQuotes)
    setResult(res)
    setStep('done')
    onDone?.(res)
  }

  const importableCount = bookId
    ? (groups[0]?.clippings.length ?? 0)
    : [...selected].reduce((acc, i) => acc + groups[i].clippings.length, 0)

  if (step === 'done') {
    return (
      <div className="bg-[#E8E3D8] border border-black/10 rounded-xl p-5 text-center">
        <p className="text-[22px] mb-2">✓</p>
        <p className="text-[15px] font-medium text-[#3D3A32]">导入完成</p>
        <p className="text-[13px] text-[#7A7468] mt-1">成功导入 {result.imported} 条，跳过重复 {result.skipped} 条</p>
        <button onClick={() => { setStep('input'); setRaw(''); setGroups([]) }}
          className="mt-4 text-[12px] text-[#7A7468] hover:text-[#3D3A32] transition-colors">
          再次导入
        </button>
      </div>
    )
  }

  if (step === 'preview') {
    return (
      <div className="bg-[#E8E3D8] border border-black/10 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[13px] font-medium text-[#7A7468] uppercase tracking-wider">
            解析结果 · {importableCount} 条书摘
          </h3>
          <button onClick={() => setStep('input')} className="text-[12px] text-[#7A7468] hover:text-[#3D3A32]">← 重新粘贴</button>
        </div>

        {bookId ? (
          <div className="max-h-60 overflow-y-auto space-y-2 mb-4">
            {groups[0]?.clippings.map((c, i) => (
              <div key={i} className="text-[13px] text-[#3D3A32] border-l-2 border-[#C4A84B] pl-3 py-0.5">
                {c.content.slice(0, 80)}{c.content.length > 80 ? '…' : ''}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2 mb-4 max-h-72 overflow-y-auto">
            {groups.map((g, i) => (
              <label key={i} className={`flex items-start gap-3 p-3 rounded-lg border border-black/8 cursor-pointer ${selected.has(i) ? 'bg-[#F5F2EB]' : 'opacity-50'}`}>
                <input type="checkbox" checked={selected.has(i)}
                  onChange={e => setSelected(prev => { const s = new Set(prev); e.target.checked ? s.add(i) : s.delete(i); return s })}
                  className="mt-0.5 accent-[#3D3A32]" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium text-[#3D3A32] truncate">{g.bookTitle}</span>
                    {g.createNew
                      ? <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#C4A84B]/20 text-[#C4A84B] flex-shrink-0">+ 新建书目</span>
                      : <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#6B8F6A]/20 text-[#6B8F6A] flex-shrink-0">已匹配</span>
                    }
                  </div>
                  <p className="text-[12px] text-[#7A7468]">{g.clippings.length} 条书摘</p>
                </div>
              </label>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button onClick={() => setStep('input')} className="px-4 py-1.5 text-sm text-[#7A7468] hover:text-[#3D3A32] transition-colors">取消</button>
          <button onClick={handleImport} disabled={selected.size === 0}
            className="px-5 py-1.5 text-sm bg-[#3D3A32] text-[#F5F2EB] rounded-lg disabled:opacity-40 hover:bg-[#5a564d] transition-colors">
            导入选中（{importableCount} 条）
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#E8E3D8] border border-black/10 rounded-xl p-5">
      <h3 className="text-[13px] font-medium text-[#7A7468] uppercase tracking-wider mb-3">粘贴 My Clippings.txt 内容</h3>
      <textarea
        value={raw}
        onChange={e => setRaw(e.target.value)}
        placeholder="将 My Clippings.txt 的全部内容粘贴至此……"
        className="w-full bg-[#F5F2EB] border border-black/10 rounded-lg p-3 text-[13px] text-[#3D3A32] placeholder-[#7A7468] outline-none resize-none focus:border-[#3D3A32] transition-colors"
        style={{ height: '40vh', minHeight: '160px' }}
      />
      <div className="flex justify-end mt-3">
        <button onClick={handleParse} disabled={!raw.trim()}
          className="px-5 py-1.5 text-sm bg-[#3D3A32] text-[#F5F2EB] rounded-lg disabled:opacity-40 hover:bg-[#5a564d] transition-colors">
          解析
        </button>
      </div>
    </div>
  )
}
