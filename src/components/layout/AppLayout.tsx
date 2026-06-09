import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'

export default function AppLayout() {
  return (
    <div className="app-shell">
      <Sidebar />

      <main className="md:ml-[260px] min-h-svh">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  )
}
