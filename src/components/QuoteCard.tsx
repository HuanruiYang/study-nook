import { useState } from 'react'
import type { Quote } from '../types'

interface Props {
  quote: Quote
  onDelete: (id: string) => void
}

const COLOR_MAP: Record<string, string> = {
  yellow: '#C4A84B',
  blue: '#5B7FA3',
  pink: '#C5705A',
  orange: '#C5705A',
}

const SOURCE_LABEL: Record<string, string> = { manual: '手动', kindle: 'Kindle' }

export default function QuoteCard({ quote, onDelete }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const borderColor = COLOR_MAP[quote.highlight_color ?? 'yellow'] ?? '#C4A84B'
  const date = new Date(quote.created_at).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })

  return (
    <div className="mb-2 rounded-[8px] border border-black/10 bg-[#E8E3D8] p-2.5 md:mb-3 md:p-5">
      <div
        className="mb-2 border-l-2 pl-2.5 text-[13px] leading-[1.65] text-[#3D3A32] md:mb-3 md:pl-3.5 md:text-[15px] md:leading-[1.85]"
        style={{ borderColor, fontFamily: '"Georgia", "Noto Serif SC", serif', fontStyle: 'italic' }}
      >
        {quote.content}
      </div>

      {quote.reflection && (
        <p className="mb-2 pl-2.5 text-[12px] leading-relaxed text-[#3D3A32] md:mb-3 md:pl-3.5 md:text-[14px]">{quote.reflection}</p>
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5 text-[11px] text-[#7A7468] md:gap-2 md:text-[12px]">
          <span>{date}</span>
          {quote.page && <span>· 第 {quote.page} 页</span>}
          {quote.location && <span>· {quote.location}</span>}
          <span className="px-1.5 py-0.5 bg-black/8 rounded text-[10px]">{SOURCE_LABEL[quote.source]}</span>
        </div>
        <div className="flex items-center gap-2">
          {confirmDelete ? (
            <>
              <button onClick={() => onDelete(quote.id)} className="text-[11px] text-[#C5705A] hover:underline">确认删除</button>
              <span className="text-[#7A7468]/40 text-[10px]">·</span>
              <button onClick={() => setConfirmDelete(false)} className="text-[11px] text-[#7A7468] hover:text-[#3D3A32]">取消</button>
            </>
          ) : (
            <button onClick={() => setConfirmDelete(true)} className="text-[11px] text-[#7A7468] hover:text-[#C5705A] transition-colors">删除</button>
          )}
        </div>
      </div>
    </div>
  )
}
