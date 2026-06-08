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
    <article className="paper-card rounded-[8px] px-5 py-4">
      <p className="text-[15px] leading-relaxed text-[#312F2A]">{spark.content}</p>

      {spark.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {spark.tags.map(tag => (
            <button
              key={tag}
              onClick={() => onTagClick?.(tag)}
              className={`rounded-full bg-[#312F2A]/7 px-2 py-0.5 text-[11px] text-[#746E62] transition-colors ${onTagClick ? 'hover:bg-[#B7963E]/20 hover:text-[#8C6B1D]' : 'cursor-default'}`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-[#312F2A]/10 pt-3">
        <div className="min-w-0 text-[12px] text-[#746E62]">
          <span>{date}</span>
          {bookTitle && <span> · <span className="text-[#496F8E]">《{bookTitle}》</span></span>}
        </div>
        <div className="ml-3 flex flex-shrink-0 items-center gap-2">
          {confirmDelete ? (
            <>
              <button onClick={() => onDelete(spark.id)} className="text-[11px] text-[#BC644E] hover:underline">确认</button>
              <button onClick={() => setConfirmDelete(false)} className="text-[11px] text-[#746E62] hover:text-[#312F2A]">取消</button>
            </>
          ) : (
            <button onClick={() => setConfirmDelete(true)} className="text-[11px] text-[#746E62] transition-colors hover:text-[#BC644E]">删除</button>
          )}
        </div>
      </div>
    </article>
  )
}
