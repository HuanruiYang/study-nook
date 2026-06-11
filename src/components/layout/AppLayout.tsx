import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import { LIBRARY_SYNC_EVENT } from '../../lib/localStore'

export default function AppLayout() {
  const [syncVersion, setSyncVersion] = useState(0)

  useEffect(() => {
    function handleLibrarySync() {
      setSyncVersion(version => version + 1)
    }

    window.addEventListener(LIBRARY_SYNC_EVENT, handleLibrarySync)
    return () => window.removeEventListener(LIBRARY_SYNC_EVENT, handleLibrarySync)
  }, [])

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="md:ml-[260px] min-h-svh">
        <Outlet key={syncVersion} />
      </main>

      <BottomNav />
    </div>
  )
}
