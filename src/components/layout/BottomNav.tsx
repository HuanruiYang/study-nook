import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', label: '随感', end: true },
  { to: '/shelf/time', label: '札记', end: true },
  { to: '/shelf/books', label: '书架', end: true },
  { to: '/year', label: '统计', end: true },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 md:hidden">
      <div className="surface grid grid-cols-4 rounded-t-[8px] border-x-0 border-b-0 px-1.5 pb-[calc(4px+env(safe-area-inset-bottom))] pt-1">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `rounded-[7px] py-1 text-center text-[11px] leading-5 transition-colors ${
                isActive ? 'bg-[#312F2A] text-[#FBF8F1]' : 'text-[#746E62]'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
