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
      <header className="mb-8">
        <h1 className="serif-title page-title">阅读随感</h1>
      </header>

      <section className="warm-card rounded-[8px] p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[#0E6B3C] text-[18px] text-[#FFFDF8]">▱</span>
          <h2 className="serif-title text-[24px] font-semibold text-[#26241F]">正在读</h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          {visibleBooks.map(book => {
            const active = selected?.id === book.id
            return (
              <button
                key={book.id}
                onClick={() => setSelectedId(book.id)}
                className={`rounded-[8px] border bg-white/42 p-5 text-left transition-colors ${
                  active ? 'border-[#0E6B3C]' : 'border-[#26241F]/10 hover:border-[#26241F]/22'
                }`}
              >
                <div className="flex min-h-[88px] gap-4">
                  <span className="w-1.5 rounded-full" style={{ backgroundColor: book.cover_color }} />
                  <span>
                    <span className="serif-title block text-[21px] font-semibold text-[#26241F]">{book.title}</span>
                    <span className="mt-4 block text-[14px] text-[#57534B]">{book.author}{book.translator && ` / ${book.translator}`}</span>
                  </span>
                </div>
              </button>
            )
          })}
          <Link to="/shelf/books" className="grid min-h-[130px] place-items-center rounded-[8px] border border-[#26241F]/10 bg-white/30 text-center text-[14px] text-[#57534B] hover:border-[#26241F]/22">
            <span>
              <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full border border-dashed border-[#26241F]/28 text-[24px]">＋</span>
              添加正在读的书
            </span>
          </Link>
        </div>

        {selected && (
          <div className="mt-5 rounded-[8px] border border-[#26241F]/10 bg-white/38 p-5">
            <div className="mb-5 flex gap-5">
              <span className="w-1.5 rounded-full" style={{ backgroundColor: selected.cover_color }} />
              <div>
                <h3 className="serif-title text-[27px] font-semibold text-[#26241F]">{selected.title}</h3>
                <p className="mt-3 text-[15px] text-[#57534B]">{selected.author}{selected.translator && ` / ${selected.translator}`}</p>
              </div>
            </div>
            <div className="border-t border-[#26241F]/10 pt-5">
              <Link to={`/book/${selected.id}`} className="ink-button flex h-11 items-center rounded-[8px] px-6 text-[15px]">
                记录
              </Link>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Link to={`/book/${selected.id}`} className="rounded-[8px] border border-[#26241F]/10 bg-[#FFFDF8]/72 px-6 py-4 text-[16px] text-[#26241F]">
                  书摘
                </Link>
                <Link to={`/book/${selected.id}`} className="rounded-[8px] border border-[#26241F]/10 bg-[#FFFDF8]/72 px-6 py-4 text-[16px] text-[#26241F]">
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
