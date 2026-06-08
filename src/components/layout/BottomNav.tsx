import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', label: '随感', end: true },
  { to: '/shelf/time', label: '札记', end: true },
  { to: '/shelf/books', label: '书架', end: true },
  { to: '/year', label: '统计', end: true },
]

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-3 left-3 right-3 z-20">
      <div className="surface grid grid-cols-4 rounded-[8px] p-1">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `rounded-[7px] py-2 text-center text-[12px] transition-colors ${
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
