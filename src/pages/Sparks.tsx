import { useMemo, useState } from 'react'
import { v4 as uuid } from 'uuid'
import type { Spark } from '../types'
import { deleteSpark, getAllSparks, saveSpark } from '../lib/localStore'
import { useAuth } from '../hooks/useAuth'

const COLUMNS = [
  { tag: '待补充', title: '需补充' },
  { tag: '待修改', title: '需修改' },
  { tag: '升级记录', title: '升级记录' },
]

export default function Sparks() {
  const { user } = useAuth()
  const [items, setItems] = useState<Spark[]>(() => getAllSparks())
  const [content, setContent] = useState('')
  const [tag, setTag] = useState(COLUMNS[0].tag)

  const grouped = useMemo(() => {
    return COLUMNS.map(column => ({
      ...column,
      items: items.filter(item => item.tags.includes(column.tag) || (column.tag === '待补充' && item.tags.length === 0)),
    }))
  }, [items])

  function refresh() { setItems(getAllSparks()) }

  function addMemo() {
    if (!content.trim()) return
    saveSpark({
      id: uuid(),
      user_id: user!.id,
      content: content.trim(),
      tags: [tag],
      created_at: new Date().toISOString(),
    })
    setContent('')
    refresh()
  }

  return (
    <div className="page-frame">
      <header className="mb-3 md:mb-8">
        <p className="page-kicker mb-1 md:mb-2">Dev notes</p>
        <h1 className="serif-title page-title">开发笔记</h1>
      </header>

      <section className="surface mb-3 rounded-[8px] p-2.5 md:mb-5 md:p-5">
        <h2 className="serif-title section-title mb-2 md:mb-3">备忘录</h2>
        <div className="grid gap-2 md:grid-cols-[140px_1fr_auto] md:gap-3">
          <select value={tag} onChange={e => setTag(e.target.value)} className="field rounded-[7px] px-3 py-1.5 text-[12px] md:py-2 md:text-[13px]">
            {COLUMNS.map(column => <option key={column.tag}>{column.tag}</option>)}
          </select>
          <input
            value={content}
            onChange={e => setContent(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addMemo() }}
            placeholder="记录需补充、修改的功能，或本次升级内容"
            className="field rounded-[7px] px-3 py-1.5 text-[12px] md:py-2 md:text-[13px]"
          />
          <button onClick={addMemo} disabled={!content.trim()} className="ink-button rounded-[7px] px-4 py-1.5 text-[12px] disabled:opacity-40 md:py-2 md:text-[13px]">
            记录
          </button>
        </div>
      </section>

      <section className="grid gap-2.5 md:gap-4 lg:grid-cols-3">
        {grouped.map(column => (
          <div key={column.tag} className="surface rounded-[8px] p-2.5 md:p-5">
            <h2 className="serif-title section-title mb-2.5 md:mb-4">{column.title}</h2>
            <div className="space-y-2.5 md:space-y-3">
              {column.items.length === 0 ? (
                <p className="text-[13px] text-[#746E62]">暂无记录。</p>
              ) : (
                column.items.map(item => (
                  <article key={item.id} className="rounded-[7px] border border-[#312F2A]/10 bg-white/36 p-2.5 md:p-3">
                    <p className="text-[12px] leading-relaxed text-[#312F2A] md:text-[13px]">{item.content}</p>
                    <div className="mt-2 flex items-center justify-between md:mt-3">
                      <span className="text-[11px] text-[#746E62]">
                        {new Date(item.created_at).toLocaleDateString('zh-CN')}
                      </span>
                      <button onClick={() => { deleteSpark(item.id); refresh() }} className="text-[11px] text-[#746E62] hover:text-[#BC644E]">
                        删除
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
