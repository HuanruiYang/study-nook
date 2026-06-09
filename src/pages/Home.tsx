import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getBooks } from '../lib/localStore'

export default function Home() {
  const books = useMemo(() => getBooks(), [])
  const reading = books.filter(book => book.status === 'reading')
  const [selectedId, setSelectedId] = useState(() => reading[0]?.id ?? books[0]?.id ?? '')
  const selected = books.find(book => book.id === selectedId) ?? reading[0] ?? books[0]

  const visibleBooks = reading.length > 0 ? reading : books.slice(0, 3)

  return (
    <div className="page-frame">
      <header className="mb-3 md:mb-8">
        <h1 className="serif-title page-title">阅读随感</h1>
      </header>

      <section className="warm-card rounded-[8px] p-2.5 md:p-6">
        <div className="mb-2.5 flex items-center gap-2 md:mb-5 md:gap-3">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-[#0E6B3C] text-[14px] text-[#FFFDF8] md:h-10 md:w-10 md:text-[18px]">▱</span>
          <h2 className="serif-title text-[18px] font-semibold text-[#26241F] md:text-[24px]">正在读</h2>
        </div>

        <div className="mobile-scroll flex gap-2 pb-1 md:grid md:gap-4 md:overflow-visible md:pb-0 lg:grid-cols-4">
          {visibleBooks.map(book => {
            const active = selected?.id === book.id
            return (
              <button
                key={book.id}
                onClick={() => setSelectedId(book.id)}
                className={`min-w-[150px] snap-start rounded-[8px] border bg-white/42 p-2.5 text-left transition-colors md:min-w-0 md:p-5 ${
                  active ? 'border-[#0E6B3C]' : 'border-[#26241F]/10 hover:border-[#26241F]/22'
                }`}
              >
                <div className="flex min-h-[52px] gap-2.5 md:min-h-[88px] md:gap-4">
                  <span className="w-1.5 rounded-full" style={{ backgroundColor: book.cover_color }} />
                  <span className="min-w-0">
                    <span className="serif-title line-clamp-2 block text-[15px] font-semibold leading-snug text-[#26241F] md:text-[21px]">{book.title}</span>
                    <span className="mt-1.5 line-clamp-1 block text-[11px] text-[#57534B] md:mt-4 md:text-[14px]">{book.author}{book.translator && ` / ${book.translator}`}</span>
                  </span>
                </div>
              </button>
            )
          })}
          <Link to="/shelf/books" className="grid min-h-[72px] min-w-[120px] snap-start place-items-center rounded-[8px] border border-[#26241F]/10 bg-white/30 text-center text-[12px] text-[#57534B] hover:border-[#26241F]/22 md:min-h-[130px] md:min-w-0 md:text-[14px]">
            <span>
              <span className="mx-auto mb-1.5 grid h-7 w-7 place-items-center rounded-full border border-dashed border-[#26241F]/28 text-[16px] md:mb-4 md:h-12 md:w-12 md:text-[24px]">＋</span>
              添加正在读的书
            </span>
          </Link>
        </div>

        {selected && (
          <div className="mt-2.5 rounded-[8px] border border-[#26241F]/10 bg-white/38 p-2.5 md:mt-5 md:p-5">
            <div className="mb-2.5 flex gap-2.5 md:mb-5 md:gap-5">
              <span className="w-1.5 rounded-full" style={{ backgroundColor: selected.cover_color }} />
              <div>
                <h3 className="serif-title text-[19px] font-semibold leading-snug text-[#26241F] md:text-[27px]">{selected.title}</h3>
                <p className="mt-1 text-[12px] text-[#57534B] md:mt-3 md:text-[15px]">{selected.author}{selected.translator && ` / ${selected.translator}`}</p>
              </div>
            </div>
            <div className="border-t border-[#26241F]/10 pt-2.5 md:pt-5">
              <Link to={`/book/${selected.id}`} className="ink-button flex h-8 items-center rounded-[8px] px-3 text-[13px] md:h-11 md:px-6 md:text-[15px]">
                记录
              </Link>
              <div className="mt-2 grid grid-cols-2 gap-2 md:mt-4 md:gap-4">
                <Link to={`/book/${selected.id}`} className="rounded-[8px] border border-[#26241F]/10 bg-[#FFFDF8]/72 px-3 py-2 text-[13px] text-[#26241F] md:px-6 md:py-4 md:text-[16px]">
                  书摘
                </Link>
                <Link to={`/book/${selected.id}`} className="rounded-[8px] border border-[#26241F]/10 bg-[#FFFDF8]/72 px-3 py-2 text-[13px] text-[#26241F] md:px-6 md:py-4 md:text-[16px]">
                  阅读思考
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
