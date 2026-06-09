import { useState } from 'react'
import type { Book } from '../types'
import { SPINE_COLORS } from '../lib/colors'

interface Props {
  book: Book
  onSave: (updated: Book) => void
  onCancel: () => void
}

type Status = Book['status']

const STATUS_OPTIONS: { key: Status; label: string }[] = [
  { key: 'want', label: '想读' },
  { key: 'reading', label: '在读' },
  { key: 'done', label: '读过' },
]

function toDateInput(iso?: string) { return iso ? iso.slice(0, 10) : '' }
function fromDateInput(val: string) { return val ? new Date(val).toISOString() : undefined }

export default function BookEditForm({ book, onSave, onCancel }: Props) {
  const [title, setTitle] = useState(book.title)
  const [author, setAuthor] = useState(book.author)
  const [translator, setTranslator] = useState(book.translator ?? '')
  const [status, setStatus] = useState<Status>(book.status)
  const [coverColor, setCoverColor] = useState(book.cover_color)
  const [currentPage, setCurrentPage] = useState(String(book.current_page ?? ''))
  const [totalPages, setTotalPages] = useState(String(book.total_pages ?? ''))
  const [startedAt, setStartedAt] = useState(toDateInput(book.started_at))
  const [finishedAt, setFinishedAt] = useState(toDateInput(book.finished_at))

  function handleStatusChange(next: Status) {
    setStatus(next)
    const today = new Date().toISOString().slice(0, 10)
    if (next !== 'want' && !startedAt) setStartedAt(today)
    if (next === 'done' && !finishedAt) setFinishedAt(today)
    if (next !== 'done') setFinishedAt('')
    if (next === 'want') setStartedAt('')
  }

  function calcProgress() {
    const cur = parseInt(currentPage)
    const tot = parseInt(totalPages)
    if (cur > 0 && tot > 0) return Math.min(100, Math.round((cur / tot) * 100))
    return status === 'done' ? 100 : undefined
  }

  function handleSave() {
    if (!title.trim() || !author.trim()) return
    const now = new Date().toISOString()
    const updated: Book = {
      ...book,
      title: title.trim(),
      author: author.trim(),
      translator: translator.trim() || undefined,
      status,
      cover_color: coverColor,
      current_page: currentPage ? parseInt(currentPage) : undefined,
      total_pages: totalPages ? parseInt(totalPages) : undefined,
      progress: calcProgress(),
      started_at: fromDateInput(startedAt),
      finished_at: fromDateInput(finishedAt),
      updated_at: now,
    }
    onSave(updated)
  }

  return (
    <div className="mb-4 rounded-[8px] border border-black/10 bg-[#E8E3D8] p-3 md:mb-6 md:p-5">
      <h2 className="mb-3 text-[12px] font-medium uppercase tracking-wider text-[#7A7468] md:mb-4 md:text-[13px]">编辑书目</h2>

      <div className="mb-3 grid grid-cols-2 gap-x-3 gap-y-2.5 md:mb-4 md:gap-x-4 md:gap-y-3">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="书名 *"
          className="col-span-2 bg-transparent border-b border-black/20 pb-1.5 text-[15px] text-[#3D3A32] outline-none placeholder-[#7A7468]"
          style={{ fontFamily: '"Georgia", "Noto Serif SC", serif' }} />
        <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="作者 *"
          className="bg-transparent border-b border-black/20 pb-1.5 text-sm text-[#3D3A32] outline-none placeholder-[#7A7468]" />
        <input value={translator} onChange={e => setTranslator(e.target.value)} placeholder="译者（选填）"
          className="bg-transparent border-b border-black/20 pb-1.5 text-sm text-[#3D3A32] outline-none placeholder-[#7A7468]" />
      </div>

      {/* Status */}
      <div className="mb-3 md:mb-4">
        <p className="text-[11px] text-[#7A7468] uppercase tracking-wide mb-2">阅读状态</p>
        <div className="flex gap-3 md:gap-4">
          {STATUS_OPTIONS.map(s => (
            <label key={s.key} className="flex items-center gap-1.5 text-sm text-[#3D3A32] cursor-pointer">
              <input type="radio" name="edit-status" value={s.key} checked={status === s.key}
                onChange={() => handleStatusChange(s.key)} className="accent-[#3D3A32]" />
              {s.label}
            </label>
          ))}
        </div>
      </div>

      {/* Dates */}
      {status !== 'want' && (
        <div className="mb-3 grid grid-cols-2 gap-3 md:mb-4 md:gap-4">
          <div>
            <p className="text-[11px] text-[#7A7468] mb-1">开始阅读</p>
            <input type="date" value={startedAt} onChange={e => setStartedAt(e.target.value)}
              className="w-full bg-transparent border-b border-black/20 pb-1 text-sm text-[#3D3A32] outline-none" />
          </div>
          {status === 'done' && (
            <div>
              <p className="text-[11px] text-[#7A7468] mb-1">读完日期</p>
              <input type="date" value={finishedAt} onChange={e => setFinishedAt(e.target.value)}
                className="w-full bg-transparent border-b border-black/20 pb-1 text-sm text-[#3D3A32] outline-none" />
            </div>
          )}
        </div>
      )}

      {/* Progress (reading) */}
      {status === 'reading' && (
        <div className="mb-3 md:mb-4">
          <p className="text-[11px] text-[#7A7468] uppercase tracking-wide mb-2">阅读进度</p>
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <div className="flex items-center gap-1.5">
              <input type="number" placeholder="当前页" value={currentPage} onChange={e => setCurrentPage(e.target.value)} min={0}
                className="w-20 bg-transparent border-b border-black/20 pb-1 text-sm text-[#3D3A32] outline-none placeholder-[#7A7468] text-center" />
              <span className="text-[#7A7468] text-sm">/</span>
              <input type="number" placeholder="总页数" value={totalPages} onChange={e => setTotalPages(e.target.value)} min={1}
                className="w-20 bg-transparent border-b border-black/20 pb-1 text-sm text-[#3D3A32] outline-none placeholder-[#7A7468] text-center" />
              <span className="text-[#7A7468] text-sm">页</span>
            </div>
            {calcProgress() !== undefined && <span className="text-[13px] text-[#7A7468]">{calcProgress()}%</span>}
          </div>
          {calcProgress() !== undefined && (
            <div className="mt-2 h-1 bg-black/10 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${calcProgress()}%`, backgroundColor: coverColor }} />
            </div>
          )}
        </div>
      )}

      {/* Total pages (want / done) */}
      {status !== 'reading' && (
        <div className="mb-3 md:mb-4">
          <p className="text-[11px] text-[#7A7468] uppercase tracking-wide mb-2">总页数（选填）</p>
          <input type="number" placeholder="—" value={totalPages} onChange={e => setTotalPages(e.target.value)} min={1}
            className="w-24 bg-transparent border-b border-black/20 pb-1 text-sm text-[#3D3A32] outline-none placeholder-[#7A7468]" />
        </div>
      )}

      {/* Color */}
      <div className="mb-4 md:mb-5">
        <p className="text-[11px] text-[#7A7468] uppercase tracking-wide mb-2">书脊颜色</p>
        <div className="flex gap-2 flex-wrap">
          {SPINE_COLORS.map(c => (
            <button key={c} onClick={() => setCoverColor(c)}
              className="h-7 w-7 rounded-full border-2 transition-all md:h-6 md:w-6"
              style={{ backgroundColor: c, borderColor: coverColor === c ? '#3D3A32' : 'rgba(0,0,0,0.12)' }} />
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="px-4 py-1.5 text-sm text-[#7A7468] hover:text-[#3D3A32] transition-colors">取消</button>
        <button onClick={handleSave} disabled={!title.trim() || !author.trim()}
          className="px-5 py-1.5 text-sm bg-[#3D3A32] text-[#F5F2EB] rounded-lg disabled:opacity-40 hover:bg-[#5a564d] transition-colors">
          保存修改
        </button>
      </div>
    </div>
  )
}
