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
const STAGES: Array<{ key: NonNullable<ReviewLayer['stage']>; label: string; hint: string }> = [
  { key: 'before', label: '读之前', hint: '期待、疑问、为什么想读' },
  { key: 'during', label: '阅读之中', hint: '正在发生的触动和困惑' },
  { key: 'after', label: '读之后', hint: '读完后的回声和改变' },
]

export default function ReviewEditor({ bookId, bookColor, userId, onSave, onCancel }: Props) {
  const [stage, setStage] = useState<NonNullable<ReviewLayer['stage']>>('during')
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
    const stageLabel = STAGES.find(s => s.key === stage)?.label ?? '阅读感受'
    onSave({
      id: uuid(),
      user_id: userId,
      book_id: bookId,
      stage,
      label: label.trim() || stageLabel,
      color,
      content: content.trim(),
      word_count: wordCount,
      created_at: new Date().toISOString(),
    })
  }

  return (
    <div className="bg-[#E8E3D8] border border-black/10 rounded-xl p-5">
      <div className="mb-4">
        <p className="text-[11px] text-[#7A7468] uppercase tracking-wide mb-2">记录阶段</p>
        <div className="grid grid-cols-3 gap-2">
          {STAGES.map(item => (
            <button
              key={item.key}
              type="button"
              onClick={() => setStage(item.key)}
              className={`rounded-xl border px-3 py-2 text-left transition-colors ${
                stage === item.key
                  ? 'border-[#3D3A32] bg-[#F5F2EB] text-[#3D3A32]'
                  : 'border-black/10 text-[#7A7468] hover:border-black/25'
              }`}
            >
              <span className="block text-[13px] font-medium">{item.label}</span>
              <span className="block text-[11px] mt-0.5 leading-snug opacity-80">{item.hint}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 mb-3">
        <input
          value={label}
          onChange={e => setLabel(e.target.value)}
          placeholder="感受标题（选填，如：开始前的期待、读到一半的困惑、合上书后的余味）"
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
          placeholder="写下此刻对这本书的感受……可以记录读之前的期待、阅读之中的触动，或读之后留下的想法。支持 ### 小标题"
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
