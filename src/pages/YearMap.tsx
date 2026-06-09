import { useMemo } from 'react'
import { getBooks, getQuotes, getReviewLayers } from '../lib/localStore'

function textLength(text?: string) {
  return text?.replace(/\s/g, '').length ?? 0
}

export default function YearMap() {
  const books = useMemo(() => getBooks(), [])
  const thisMonth = new Date().toISOString().slice(0, 7)

  const bookStats = useMemo(() => {
    return books.map(book => {
      const reviews = getReviewLayers(book.id)
      const quotes = getQuotes(book.id)
      const noteCount = reviews.length + quotes.length
      const wordCount =
        reviews.reduce((sum, r) => sum + r.word_count, 0) +
        quotes.reduce((sum, q) => sum + textLength(q.content) + textLength(q.reflection), 0)
      return { book, noteCount, wordCount }
    }).sort((a, b) => b.noteCount - a.noteCount || b.wordCount - a.wordCount)
  }, [books])

  const monthStats = useMemo(() => {
    const map = new Map<string, number>()
    books.forEach(book => {
      const date = book.finished_at ?? book.started_at ?? book.created_at
      const key = date.slice(0, 7)
      map.set(key, (map.get(key) ?? 0) + 1)
    })
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-6)
  }, [books])

  const totalNotes = bookStats.reduce((sum, item) => sum + item.noteCount, 0)
  const totalWords = bookStats.reduce((sum, item) => sum + item.wordCount, 0)
  const monthBooks = books.filter(book => {
    const date = book.finished_at ?? book.started_at ?? book.created_at
    return date.slice(0, 7) === thisMonth
  }).length
  const maxMonth = Math.max(1, ...monthStats.map(([, count]) => count))
  const maxNotes = Math.max(1, ...bookStats.map(item => item.noteCount))

  return (
    <div className="page-frame">
      <header className="mb-3 md:mb-8">
        <p className="page-kicker mb-1 md:mb-2">Stats</p>
        <h1 className="serif-title page-title">统计</h1>
        <p className="mt-1 text-[12px] text-[#57534B] md:mt-3 md:text-[15px]">用更清晰的方式回看阅读进度与札记输出。</p>
      </header>

      <section className="mb-3 grid grid-cols-2 gap-2 md:mb-6 md:gap-4 lg:grid-cols-4">
        {[
          { icon: '▱', label: '累计阅读', value: books.length, unit: '本', color: '#4E7658' },
          { icon: '▣', label: '本月阅读', value: monthBooks, unit: '本', color: '#C49A2B' },
          { icon: '✎', label: '札记', value: totalNotes, unit: '条', color: '#C85F4C' },
          { icon: 'T', label: '总字数', value: totalWords, unit: '字', color: '#376D93' },
        ].map(card => (
          <div key={card.label} className="warm-card flex items-center gap-2 rounded-[8px] px-2.5 py-2.5 md:gap-4 md:px-5 md:py-4">
            <span className="grid h-7 w-7 place-items-center rounded-[8px] text-[15px] text-[#FFFDF8] md:h-10 md:w-10 md:text-[20px]" style={{ backgroundColor: card.color }}>{card.icon}</span>
            <div>
              <p className="text-[11px] text-[#57534B] md:text-[14px]">{card.label}</p>
              <p className="serif-title mt-0.5 text-[20px] font-semibold leading-none text-[#26241F] md:mt-1 md:text-[27px]">
                {card.value} <span className="text-[12px] font-normal md:text-[14px]">{card.unit}</span>
              </p>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-3 md:gap-6 lg:grid-cols-2">
        <div className="warm-card rounded-[8px] p-2.5 md:p-6">
          <h2 className="serif-title mb-3 text-[17px] font-semibold text-[#26241F] md:mb-7 md:text-[23px]">时间 · 阅读书目（月）</h2>
          <div className="space-y-3 md:space-y-6">
            {monthStats.map(([month, count]) => (
              <div key={month} className="grid grid-cols-[72px_1fr_36px] items-center gap-3 text-[12px] md:grid-cols-[88px_1fr_42px] md:gap-6 md:text-[15px]">
                <span className="text-[#57534B]">{month}</span>
                <div className="h-1 rounded-full bg-[#E9E5DC]">
                  <div className="h-full rounded-full bg-[#4E7658]" style={{ width: `${(count / maxMonth) * 100}%` }} />
                </div>
                <span className="text-right text-[#26241F]">{count} 本</span>
              </div>
            ))}
          </div>
          <p className="mt-4 border-t border-dashed border-[#26241F]/14 pt-2.5 text-[11px] text-[#6F6A60] md:mt-20 md:pt-5 md:text-[13px]">
            ⓘ 按书目看札记条数和字数，回顾阅读与输出情况。
          </p>
        </div>

        <div className="warm-card rounded-[8px] p-2.5 md:p-6">
          <h2 className="serif-title mb-3 text-[17px] font-semibold text-[#26241F] md:mb-7 md:text-[23px]">书目 · 笔记条数、字数</h2>
          <div className="space-y-3 md:space-y-6">
            {bookStats.map(({ book, noteCount, wordCount }) => (
              <div key={book.id}>
                <div className="mb-2 flex items-center justify-between gap-3 md:mb-2.5 md:gap-4">
                  <span className="serif-title truncate text-[14px] font-semibold text-[#26241F] md:text-[16px]">{book.title}</span>
                  <span className="flex-shrink-0 text-[12px] text-[#57534B] md:text-[14px]">{noteCount} 条 · {wordCount} 字</span>
                </div>
                <div className="h-1 rounded-full bg-[#E9E5DC]">
                  <div className="h-full rounded-full" style={{ width: `${(noteCount / maxNotes) * 100}%`, backgroundColor: noteCount ? book.cover_color : '#DCD7CE' }} />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 border-t border-dashed border-[#26241F]/14 pt-2.5 text-[11px] text-[#6F6A60] md:mt-14 md:pt-5 md:text-[13px]">
            ⓘ 条数为札记记录数，字数为全部札记累计字数。
          </p>
        </div>
      </section>
    </div>
  )
}
