import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import OpenBookLogo from '../OpenBookLogo'

const MAIN_ITEMS = [
  { to: '/', label: '阅读随感', icon: '⌂', end: true },
  { to: '/shelf/time', label: '阅读札记', icon: '▣', end: true },
  { to: '/shelf/books', label: '书架', icon: '▤', end: true },
  { to: '/year', label: '统计', icon: '▥', end: true },
  { to: '/sparks', label: '开发笔记', icon: '</>', end: true },
]

export default function Sidebar() {
  const { user, signOut } = useAuth()

  return (
    <aside className="hidden md:flex fixed left-0 top-0 z-20 h-full w-[260px] flex-col border-r border-[#26241F]/10 bg-[#FFFDF8]/72 backdrop-blur-xl">
      <div className="px-7 pb-9 pt-8">
        <div className="flex items-center gap-3">
          <OpenBookLogo className="h-10 w-10 shadow-sm" />
          <h1 className="serif-title text-[24px] font-semibold tracking-wide text-[#26241F]">手边书房</h1>
        </div>
      </div>

      <nav className="flex-1 px-5">
        {MAIN_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `mb-2 flex items-center gap-3 rounded-[8px] px-4 py-3 text-[15px] transition-colors ${
                isActive
                  ? 'dark-button text-[#FFFDF8]'
                  : 'text-[#57534B] hover:bg-[#26241F]/5 hover:text-[#26241F]'
              }`
            }
          >
            <span className="w-5 text-center text-[18px] leading-none">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-5 pb-6">
        <div className="rounded-[8px] border border-[#26241F]/10 bg-white/45 px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#26241F]/16 text-[#FFFDF8]">●</span>
            <p className="truncate text-[13px] text-[#6F6A60]">{user?.email}</p>
          </div>
          <button onClick={signOut} className="mt-4 flex items-center gap-2 text-[14px] text-[#6F6A60] hover:text-[#BC644E]">
            <span>↪</span>
            退出
          </button>
        </div>
      </div>
    </aside>
  )
}
