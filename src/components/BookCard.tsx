import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Book } from '../types'
import { textColorForBackground } from '../lib/colors'

interface Props {
  book: Book
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: Book['status']) => void
}

const STATUS_OPTIONS: { key: Book['status']; label: string }[] = [
  { key: 'want', label: '想读' },
  { key: 'reading', label: '在读' },
  { key: 'done', label: '读过' },
]

export default function BookCard({ book, onDelete, onStatusChange }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const textColor = textColorForBackground(book.cover_color)

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
      <div className="h-1.5 w-full" style={{ backgroundColor: book.cover_color }} />

      <div className="px-5 pt-4 pb-3 bg-[#E8E3D8]">
        <div className="flex justify-between items-start mb-1 gap-2">
          <Link
            to={`/book/${book.id}`}
            className="text-[17px] font-medium text-[#3D3A32] hover:text-[#5B7FA3] transition-colors leading-snug flex-1"
            style={{ fontFamily: '"Georgia", "Noto Serif SC", serif' }}
          >
            {book.title}
          </Link>
          <span
            className="text-[11px] px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5"
            style={{ backgroundColor: book.cover_color, color: textColor }}
          >
            {STATUS_OPTIONS.find(s => s.key === book.status)?.label}
          </span>
        </div>

        <p className="text-[13px] text-[#7A7468] mb-2">
          {book.author}
          {book.translator && <span> · 译：{book.translator}</span>}
        </p>

        {book.rating && (
          <div className="flex gap-0.5 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={`text-[13px] ${i < book.rating! ? 'text-[#C4A84B]' : 'text-[#7A7468]/25'}`}>★</span>
            ))}
          </div>
        )}

        {book.status === 'reading' && book.progress !== undefined && (
          <div className="mb-2">
            <div className="flex justify-between text-[11px] text-[#7A7468] mb-1">
              <span>阅读进度</span>
              <span>
                {book.current_page && book.total_pages
                  ? `${book.current_page} / ${book.total_pages} 页`
                  : `${book.progress}%`}
              </span>
            </div>
            <div className="h-1 bg-black/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${book.progress}%`, backgroundColor: book.cover_color }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-black/8">
          <div className="flex gap-0.5">
            {STATUS_OPTIONS.map(s => (
              <button
                key={s.key}
                onClick={() => book.status !== s.key && onStatusChange(book.id, s.key)}
                className={`text-[11px] px-2 py-0.5 rounded transition-colors ${
                  book.status === s.key
                    ? 'font-semibold cursor-default'
                    : 'text-[#7A7468] hover:text-[#3D3A32] hover:bg-black/5'
                }`}
                style={book.status === s.key ? { color: book.cover_color === '#F5F2EB' || book.cover_color === '#E8E3D8' ? '#3D3A32' : book.cover_color } : {}}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {confirmDelete ? (
              <>
                <button onClick={() => onDelete(book.id)} className="text-[11px] text-[#C5705A] hover:underline">确认删除</button>
                <span className="text-[#7A7468]/40 text-[10px]">·</span>
                <button onClick={() => setConfirmDelete(false)} className="text-[11px] text-[#7A7468] hover:text-[#3D3A32]">取消</button>
              </>
            ) : (
              <button onClick={() => setConfirmDelete(true)} className="text-[11px] text-[#7A7468] hover:text-[#C5705A] transition-colors">删除</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
