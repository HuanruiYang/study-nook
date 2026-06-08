import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/shelf', label: '书架', icon: '◫' },
  { to: '/', label: '首页', icon: '⌂', end: true },
  { to: '/sparks', label: '灵感', icon: '✦' },
  { to: '/year', label: '我的', icon: '◎' },
]

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-[#E8E3D8]/95 backdrop-blur border-t border-black/10 safe-bottom">
      <div className="flex">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 min-h-[56px] transition-colors ${
                isActive ? 'text-[#3D3A32]' : 'text-[#7A7468]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`text-[20px] leading-none transition-transform ${isActive ? 'scale-110' : ''}`}
                >
                  {item.icon}
                </span>
                <span className={`text-[10px] font-medium ${isActive ? 'text-[#3D3A32]' : 'text-[#7A7468]'}`}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
