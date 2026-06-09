import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { isDevMode } from '../hooks/useAuth'
import { getAllSparks, getBooks, getQuotes, getReviewLayers } from '../lib/localStore'
import OpenBookLogo from '../components/OpenBookLogo'

function countBookNotes(bookId: string) {
  return getReviewLayers(bookId).length + getQuotes(bookId).length
}

export default function Account() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const stats = useMemo(() => {
    const books = getBooks()
    const noteCount = books.reduce((sum, book) => sum + countBookNotes(book.id), 0)
    const sparkCount = getAllSparks().length
    return {
      books: books.length,
      notes: noteCount,
      sparks: sparkCount,
      reading: books.filter(book => book.status === 'reading').length,
    }
  }, [])

  async function handleSignOut() {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="page-frame">
      <header className="mb-3 md:mb-8">
        <p className="page-kicker mb-1 md:mb-2">Account</p>
        <h1 className="serif-title page-title">账号</h1>
        <p className="mt-1 text-[12px] text-[#57534B] md:mt-3 md:text-[15px]">管理登录状态和多端同步。</p>
      </header>

      <section className="grid gap-3 md:gap-6 lg:grid-cols-[1fr_320px]">
        <div className="warm-card rounded-[8px] p-4 md:p-6">
          <div className="flex items-start gap-4">
            <OpenBookLogo className="h-14 w-14 shrink-0 shadow-sm" />
            <div className="min-w-0">
              <p className="text-[12px] text-[#6F6A60]">当前账号</p>
              <h2 className="mt-1 truncate text-[18px] font-semibold text-[#26241F] md:text-[22px]">{user?.email}</h2>
              <p className="mt-2 inline-flex rounded-full bg-[#5F8265]/12 px-3 py-1 text-[12px] text-[#3E684D]">
                {isDevMode ? '本机预览模式' : '云端同步已启用'}
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
            {[
              ['书籍', stats.books],
              ['在读', stats.reading],
              ['札记/摘录', stats.notes],
              ['灵感', stats.sparks],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-[8px] border border-[#26241F]/10 bg-white/42 p-3">
                <p className="serif-title text-[24px] font-semibold leading-none text-[#26241F]">{value}</p>
                <p className="mt-2 text-[12px] text-[#6F6A60]">{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-[8px] bg-[#F4EFE4]/72 p-4 text-[13px] leading-relaxed text-[#57534B]">
            同一邮箱和密码登录的设备会使用同一个云端账号。新增、编辑、删除书籍和札记后，会先保存在本机，再同步到 Supabase；另一台设备登录后会自动拉取同一账号的数据。
          </div>
        </div>

        <aside className="warm-card h-fit rounded-[8px] p-4 md:p-6">
          <h2 className="text-[16px] font-semibold text-[#26241F]">切换账号</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-[#6F6A60]">
            退出后会回到登录页。本机缓存会按账号隔离保存，换回同一账号时会继续同步该账号的数据。
          </p>
          <button onClick={handleSignOut} className="mt-5 w-full rounded-[8px] border border-[#BC644E]/24 bg-[#BC644E]/10 py-3 text-[14px] font-medium text-[#A64F3E] hover:bg-[#BC644E]/14">
            退出并切换账号
          </button>
          <button onClick={() => navigate('/shelf/time')} className="ghost-button mt-3 w-full rounded-[8px] py-3 text-[14px]">
            返回阅读札记
          </button>
        </aside>
      </section>
    </div>
  )
}
