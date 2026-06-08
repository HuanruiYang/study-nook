import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const NAV_ITEMS = [
  { to: '/', label: '首页', icon: '⌂', end: true },
  { to: '/shelf', label: '书架', icon: '◫', end: false },
  { to: '/sparks', label: '灵感', icon: '✦', end: false },
  { to: '/year', label: '年度地图', icon: '◎', end: false },
]

export default function Sidebar() {
  const { user, signOut } = useAuth()

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-[220px] bg-[#E8E3D8] border-r border-black/10 z-20">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b border-black/8">
        <div className="flex gap-0.5 mb-2.5">
          {['#C5705A', '#5B7FA3', '#6B8F6A', '#C4A84B'].map(c => (
            <div key={c} className="w-1.5 h-6 rounded-sm" style={{ backgroundColor: c }} />
          ))}
        </div>
        <h1
          className="text-[17px] font-medium text-[#3D3A32] leading-tight"
          style={{ fontFamily: '"Georgia", "Noto Serif SC", serif' }}
        >
          手边书房
        </h1>
        <p className="text-[11px] text-[#7A7468] mt-0.5">阅读生命档案</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-[14px] transition-colors ${
                isActive
                  ? 'bg-[#3D3A32] text-[#F5F2EB]'
                  : 'text-[#7A7468] hover:text-[#3D3A32] hover:bg-black/5'
              }`
            }
          >
            <span className="text-[16px] leading-none">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User + signout */}
      <div className="px-4 py-4 border-t border-black/8">
        <p className="text-[11px] text-[#7A7468] truncate mb-2">{user?.email}</p>
        <button
          onClick={signOut}
          className="text-[12px] text-[#7A7468] hover:text-[#C5705A] transition-colors"
        >
          退出登录
        </button>
      </div>
    </aside>
  )
}
