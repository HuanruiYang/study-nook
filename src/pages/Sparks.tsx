import { useState, useMemo } from 'react'
import { v4 as uuid } from 'uuid'
import type { Spark } from '../types'
import { getAllSparks, saveSpark, deleteSpark, getBooks } from '../lib/localStore'
import { useAuth } from '../hooks/useAuth'
import SparkItem from '../components/SparkItem'
import TagInput from '../components/TagInput'

export default function Sparks() {
  const { user } = useAuth()
  const [sparks, setSparks] = useState<Spark[]>(() => getAllSparks())
  const [input, setInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const books = useMemo(() => getBooks(), [])
  const bookMap = useMemo(() => new Map(books.map(b => [b.id, b.title])), [books])

  const allTags = useMemo(() => {
    const set = new Set<string>()
    sparks.forEach(s => s.tags.forEach(t => set.add(t)))
    return [...set]
  }, [sparks])

  const filtered = activeTag ? sparks.filter(s => s.tags.includes(activeTag)) : sparks

  function refresh() { setSparks(getAllSparks()) }

  function handleAdd() {
    if (!input.trim()) return
    saveSpark({
      id: uuid(), user_id: user!.id,
      content: input.trim(), tags,
      created_at: new Date().toISOString(),
    } as Spark)
    setInput(''); setTags([])
    refresh()
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-[22px] font-medium text-[#3D3A32] mb-6" style={{ fontFamily: '"Georgia", "Noto Serif SC", serif' }}>
        灵感碎片
      </h1>

      {/* Quick add */}
      <div className="bg-[#E8E3D8] border border-black/10 rounded-xl p-4 mb-6">
        <div className="flex gap-2 mb-3">
          <input type="text" placeholder="记录一条灵感……" value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAdd() } }}
            className="flex-1 bg-[#F5F2EB] border border-black/10 rounded-lg px-3 py-2 text-[14px] text-[#3D3A32] placeholder-[#7A7468] outline-none focus:border-[#3D3A32] transition-colors" />
          <button onClick={handleAdd} disabled={!input.trim()}
            className="px-4 py-2 text-sm bg-[#3D3A32] text-[#F5F2EB] rounded-lg disabled:opacity-40 hover:bg-[#5a564d] flex-shrink-0">
            记录
          </button>
        </div>
        <TagInput tags={tags} onChange={setTags} placeholder="打标签：输入后按 Enter 或逗号确认" />
      </div>

      {/* Tag filter */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {allTags.map(tag => (
            <button key={tag} onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`text-[12px] px-3 py-1 rounded-full border transition-colors ${
                activeTag === tag
                  ? 'bg-[#C4A84B] border-[#C4A84B] text-white'
                  : 'border-black/15 text-[#7A7468] hover:border-[#3D3A32] hover:text-[#3D3A32]'
              }`}>
              #{tag}
            </button>
          ))}
          {activeTag && (
            <button onClick={() => setActiveTag(null)} className="text-[12px] px-3 py-1 text-[#7A7468] hover:text-[#3D3A32]">
              清除筛选
            </button>
          )}
        </div>
      )}

      {filtered.length === 0 && (
        <p className="text-[14px] text-[#7A7468] py-8 text-center">还没有灵感碎片。</p>
      )}

      <div className="columns-1 md:columns-2 gap-3">
        {filtered.map(s => (
          <div key={s.id} className="break-inside-avoid mb-3">
            <SparkItem spark={s} bookTitle={s.book_id ? bookMap.get(s.book_id) : undefined}
              onDelete={id => { deleteSpark(id); refresh() }}
              onTagClick={tag => setActiveTag(activeTag === tag ? null : tag)} />
          </div>
        ))}
      </div>
    </div>
  )
}
