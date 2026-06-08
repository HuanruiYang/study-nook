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
    <div className="overflow-hidden rounded-[8px] border border-[#312F2A]/10 bg-[#EDE4D3]">
      <div className="h-1.5 w-full" style={{ backgroundColor: book.cover_color }} />

      <div className="px-4 pb-3 pt-3.5">
        <div className="mb-1 flex items-start justify-between gap-2">
          <Link
            to={`/book/${book.id}`}
            className="serif-title flex-1 text-[16px] font-semibold leading-snug text-[#312F2A] transition-colors hover:text-[#496F8E]"
          >
            {book.title}
          </Link>
          <span
            className="mt-0.5 flex-shrink-0 rounded-full px-2 py-0.5 text-[11px]"
            style={{ backgroundColor: book.cover_color, color: textColor }}
          >
            {STATUS_OPTIONS.find(s => s.key === book.status)?.label}
          </span>
        </div>

        <p className="mb-2 text-[12px] text-[#746E62]">
          {book.author}
          {book.translator && <span> · 译：{book.translator}</span>}
        </p>

        {book.status === 'reading' && book.progress !== undefined && (
          <div className="mb-2">
            <div className="mb-1 flex justify-between text-[11px] text-[#746E62]">
              <span>阅读进度</span>
              <span>
                {book.current_page && book.total_pages
                  ? `${book.current_page} / ${book.total_pages} 页`
                  : `${book.progress}%`}
              </span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-[#312F2A]/10">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${book.progress}%`, backgroundColor: book.cover_color }}
              />
            </div>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between border-t border-[#312F2A]/8 pt-2.5">
          <div className="flex gap-0.5">
            {STATUS_OPTIONS.map(s => (
              <button
                key={s.key}
                onClick={() => book.status !== s.key && onStatusChange(book.id, s.key)}
                className={`rounded px-2 py-0.5 text-[11px] transition-colors ${
                  book.status === s.key
                    ? 'font-semibold'
                    : 'text-[#746E62] hover:bg-[#312F2A]/5 hover:text-[#312F2A]'
                }`}
                style={book.status === s.key ? { color: book.cover_color === '#F5F2EB' || book.cover_color === '#E8E3D8' ? '#312F2A' : book.cover_color } : {}}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {confirmDelete ? (
              <>
                <button onClick={() => onDelete(book.id)} className="text-[11px] text-[#BC644E] hover:underline">确认删除</button>
                <button onClick={() => setConfirmDelete(false)} className="text-[11px] text-[#746E62] hover:text-[#312F2A]">取消</button>
              </>
            ) : (
              <button onClick={() => setConfirmDelete(true)} className="text-[11px] text-[#746E62] transition-colors hover:text-[#BC644E]">
                删除
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
