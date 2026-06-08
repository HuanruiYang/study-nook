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
    <div className="bg-[#E8E3D8] border border-black/10 rounded-xl p-5 mb-3">
      <div
        className="text-[15px] leading-[1.85] text-[#3D3A32] border-l-2 pl-3.5 mb-3"
        style={{ borderColor, fontFamily: '"Georgia", "Noto Serif SC", serif', fontStyle: 'italic' }}
      >
        {quote.content}
      </div>

      {quote.reflection && (
        <p className="text-[14px] text-[#3D3A32] leading-relaxed mb-3 pl-3.5">{quote.reflection}</p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[12px] text-[#7A7468]">
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
