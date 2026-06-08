import { useState, useRef, useEffect } from 'react'
import { v4 as uuid } from 'uuid'
import type { ReviewLayer } from '../types'

interface Props {
  bookId: string
  bookColor: string
  userId: string
  onSave: (layer: ReviewLayer) => void
  onCancel: () => void
}

const LAYER_COLORS = ['#C5705A', '#5B7FA3', '#6B8F6A', '#C4A84B', '#7A7468', '#3D3A32']

export default function ReviewEditor({ bookId, bookColor, userId, onSave, onCancel }: Props) {
  const [label, setLabel] = useState('')
  const [content, setContent] = useState('')
  const [color, setColor] = useState(bookColor)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }, [content])

  const wordCount = (content.match(/[一-龥]/g) ?? []).length

  function handleSave() {
    if (!content.trim()) return
    onSave({
      id: uuid(),
      user_id: userId,
      book_id: bookId,
      label: label.trim() || '初读完',
      color,
      content: content.trim(),
      word_count: wordCount,
      created_at: new Date().toISOString(),
    })
  }

  return (
    <div className="bg-[#E8E3D8] border border-black/10 rounded-xl p-5">
      <div className="flex gap-3 mb-3">
        <input
          value={label}
          onChange={e => setLabel(e.target.value)}
          placeholder="层次名称（如：初读完、半年后重读）"
          className="flex-1 bg-transparent border-b border-black/20 pb-1 text-[14px] text-[#3D3A32] outline-none placeholder-[#7A7468]"
        />
        <div className="flex gap-1.5 items-center">
          {LAYER_COLORS.map(c => (
            <button key={c} onClick={() => setColor(c)}
              className="w-4 h-4 rounded-full border-2 transition-all"
              style={{ backgroundColor: c, borderColor: color === c ? '#3D3A32' : 'rgba(0,0,0,0.1)' }} />
          ))}
        </div>
      </div>

      <div className="border-l-2 pl-4" style={{ borderColor: color }}>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="写下这次阅读的感受……支持 ### 小标题"
          rows={6}
          className="w-full bg-transparent resize-none outline-none text-[15px] leading-relaxed text-[#3D3A32] placeholder-[#7A7468] overflow-hidden"
          style={{ fontFamily: '"Georgia", "Noto Serif SC", serif' }}
        />
      </div>

      <div className="flex items-center justify-between mt-3">
        <span className="text-[12px] text-[#7A7468]">{wordCount} 字</span>
        <div className="flex gap-2">
          <button onClick={onCancel} className="px-4 py-1.5 text-sm text-[#7A7468] hover:text-[#3D3A32] transition-colors">取消</button>
          <button onClick={handleSave} disabled={!content.trim()}
            className="px-5 py-1.5 text-sm bg-[#3D3A32] text-[#F5F2EB] rounded-lg disabled:opacity-40 hover:bg-[#5a564d] transition-colors">
            保存
          </button>
        </div>
      </div>
    </div>
  )
}
