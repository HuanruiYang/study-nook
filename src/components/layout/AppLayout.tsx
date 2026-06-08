import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'

export default function AppLayout() {
  return (
    <div className="min-h-svh bg-[#F5F2EB]">
      <Sidebar />

      {/* Main content — offset for desktop sidebar, add bottom padding for mobile nav */}
      <main className="md:ml-[220px] pb-[72px] md:pb-0 min-h-svh">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  )
}
