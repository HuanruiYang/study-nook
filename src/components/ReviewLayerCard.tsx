import { useState } from 'react'
import type { ReviewLayer } from '../types'

interface Props {
  layer: ReviewLayer
  onDelete: (id: string) => void
}

function renderContent(text: string) {
  return text.split('\n').map((line, i) => {
    if (line.startsWith('### ')) {
      return <p key={i} className="font-semibold text-[#3D3A32] mt-3 mb-1 text-[14px]">{line.slice(4)}</p>
    }
    return <p key={i} className="mb-1">{line || ' '}</p>
  })
}

const STAGE_LABELS: Record<NonNullable<ReviewLayer['stage']>, string> = {
  before: '读之前',
  during: '阅读之中',
  after: '读之后',
}

export default function ReviewLayerCard({ layer, onDelete }: Props) {
  const isLong = layer.word_count > 300
  const [expanded, setExpanded] = useState(!isLong)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const date = new Date(layer.created_at).toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  const preview = layer.content.slice(0, 100)
  const stageLabel = layer.stage ? STAGE_LABELS[layer.stage] : '阅读感受'

  return (
    <div className="bg-[#E8E3D8] border border-black/10 rounded-xl p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: layer.color }} />
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#F5F2EB] text-[#7A7468] border border-black/10">
            {stageLabel}
          </span>
          <span className="text-[13px] font-medium text-[#3D3A32]">{layer.label}</span>
          <span className="text-[12px] text-[#7A7468]">{date}</span>
        </div>
        <div className="flex items-center gap-2">
          {confirmDelete ? (
            <>
              <button onClick={() => onDelete(layer.id)} className="text-[11px] text-[#C5705A] hover:underline">确认删除</button>
              <span className="text-[#7A7468]/40 text-[10px]">·</span>
              <button onClick={() => setConfirmDelete(false)} className="text-[11px] text-[#7A7468] hover:text-[#3D3A32]">取消</button>
            </>
          ) : (
            <button onClick={() => setConfirmDelete(true)} className="text-[11px] text-[#7A7468] hover:text-[#C5705A] transition-colors">删除</button>
          )}
        </div>
      </div>

      <div className="border-l-2 pl-4 text-[15px] leading-relaxed text-[#3D3A32]" style={{ borderColor: layer.color, fontFamily: '"Georgia", "Noto Serif SC", serif' }}>
        {expanded
          ? renderContent(layer.content)
          : <p>{preview}{layer.content.length > 100 ? '…' : ''}</p>
        }
      </div>

      <div className="flex items-center justify-between mt-3">
        <span className="text-[12px] text-[#7A7468]">{layer.word_count} 字</span>
        {isLong && (
          <button onClick={() => setExpanded(v => !v)} className="text-[12px] text-[#5B7FA3] hover:underline">
            {expanded ? '收起' : '展开阅读'}
          </button>
        )}
      </div>
    </div>
  )
}
