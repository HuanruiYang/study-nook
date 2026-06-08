import { useState } from 'react'
import type { Spark } from '../types'

interface Props {
  spark: Spark
  onDelete: (id: string) => void
  bookTitle?: string
  onTagClick?: (tag: string) => void
}

export default function SparkItem({ spark, onDelete, bookTitle, onTagClick }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const date = new Date(spark.created_at).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })

  return (
    <div className="bg-[#E8E3D8] border border-black/10 rounded-xl px-5 py-4 mb-3">
      <p className="text-[15px] text-[#3D3A32] leading-relaxed mb-2">{spark.content}</p>

      {spark.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {spark.tags.map(tag => (
            <button
              key={tag}
              onClick={() => onTagClick?.(tag)}
              className={`text-[11px] px-2 py-0.5 rounded-full bg-[#3D3A32]/8 text-[#7A7468] transition-colors ${onTagClick ? 'hover:bg-[#C4A84B]/20 hover:text-[#C4A84B]' : 'cursor-default'}`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[12px] text-[#7A7468]">
          <span>{date}</span>
          {bookTitle && <span>·<span className="text-[#5B7FA3] ml-1">《{bookTitle}》</span></span>}
        </div>
        <div className="flex items-center gap-2">
          {confirmDelete ? (
            <>
              <button onClick={() => onDelete(spark.id)} className="text-[11px] text-[#C5705A] hover:underline">确认删除</button>
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
