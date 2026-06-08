import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getBooks, getAllSparks, getQuotes } from '../lib/localStore'

export default function Home() {
  const { user } = useAuth()

  const books = useMemo(() => getBooks(), [])
  const sparks = useMemo(() => getAllSparks(), [])

  const thisYear = new Date().getFullYear()
  const doneThisYear = books.filter(b => b.finished_at && new Date(b.finished_at).getFullYear() === thisYear)
  const reading = books.filter(b => b.status === 'reading')
  const totalQuotes = useMemo(() => {
    return books.reduce((acc, b) => acc + getQuotes(b.id).length, 0)
  }, [books])

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-[22px] font-medium text-[#3D3A32] mb-1" style={{ fontFamily: '"Georgia", "Noto Serif SC", serif' }}>
        书房
      </h1>
      <p className="text-[13px] text-[#7A7468] mb-8">{user?.email}</p>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: '在读', value: reading.length, color: '#5B7FA3' },
          { label: `${thisYear} 年读完`, value: doneThisYear.length, color: '#6B8F6A' },
          { label: '书摘', value: totalQuotes, color: '#C4A84B' },
          { label: '灵感', value: sparks.length, color: '#C5705A' },
        ].map(stat => (
          <div key={stat.label} className="bg-[#E8E3D8] border border-black/10 rounded-xl p-4">
            <p className="text-[28px] font-medium" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-[12px] text-[#7A7468] mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="md:grid md:grid-cols-2 md:gap-6">
        {/* Currently reading */}
        <section className="mb-8 md:mb-0">
          <h2 className="text-[13px] font-medium text-[#7A7468] uppercase tracking-wider mb-3">正在读</h2>
          {reading.length === 0 ? (
            <p className="text-[14px] text-[#7A7468]">没有在读书目 · <Link to="/shelf" className="text-[#5B7FA3]">去书架添加</Link></p>
          ) : (
            <div className="space-y-2">
              {reading.map(b => (
                <Link key={b.id} to={`/book/${b.id}`}
                  className="flex items-center gap-3 bg-[#E8E3D8] border border-black/10 rounded-xl px-4 py-3 hover:border-black/20 transition-colors">
                  <div className="w-1.5 h-10 rounded-sm flex-shrink-0" style={{ backgroundColor: b.cover_color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-[#3D3A32] truncate" style={{ fontFamily: '"Georgia", "Noto Serif SC", serif' }}>
                      {b.title}
                    </p>
                    <p className="text-[12px] text-[#7A7468] truncate">{b.author}</p>
                    {b.progress !== undefined && (
                      <div className="mt-1.5 h-0.5 bg-black/10 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${b.progress}%`, backgroundColor: b.cover_color }} />
                      </div>
                    )}
                  </div>
                  {b.progress !== undefined && (
                    <span className="text-[11px] text-[#7A7468] flex-shrink-0">{b.progress}%</span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Recent sparks */}
        <section>
          <h2 className="text-[13px] font-medium text-[#7A7468] uppercase tracking-wider mb-3">近期灵感</h2>
          {sparks.length === 0 ? (
            <p className="text-[14px] text-[#7A7468]">还没有灵感 · <Link to="/sparks" className="text-[#5B7FA3]">去记录</Link></p>
          ) : (
            <div className="space-y-2">
              {sparks.slice(0, 5).map(s => (
                <div key={s.id} className="bg-[#E8E3D8] border border-black/10 rounded-xl px-4 py-3">
                  <p className="text-[14px] text-[#3D3A32] leading-snug line-clamp-2">{s.content}</p>
                  {s.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {s.tags.map(t => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 bg-black/8 rounded-full text-[#7A7468]">#{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {sparks.length > 5 && (
                <Link to="/sparks" className="block text-[12px] text-[#5B7FA3] text-center py-1">查看全部 {sparks.length} 条 →</Link>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
