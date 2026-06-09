import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { isDevMode, useAuth } from '../hooks/useAuth'
import { ensureDemoLibrary, setActiveLibraryUser, syncCloudLibrary } from '../lib/localStore'

export default function RequireAuth() {
  const { user, loading } = useAuth()
  const [syncing, setSyncing] = useState(true)
  const [syncError, setSyncError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function prepareLibrary() {
      if (!user) {
        setActiveLibraryUser(null)
        setSyncing(false)
        return
      }

      setSyncing(true)
      setSyncError('')
      try {
        setActiveLibraryUser(user.id)
        if (isDevMode) {
          ensureDemoLibrary(user.id)
        } else {
          await syncCloudLibrary(user.id)
        }
      } catch {
        if (!cancelled) setSyncError('云同步暂时不可用，已使用本机缓存。')
      } finally {
        if (!cancelled) setSyncing(false)
      }
    }

    if (!loading) void prepareLibrary()
    return () => { cancelled = true }
  }, [loading, user])

  if (loading || syncing) {
    return (
      <div className="min-h-svh bg-[#F5F2EB] flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center gap-1">
            {['#C5705A', '#5B7FA3', '#6B8F6A', '#C4A84B'].map(c => (
              <div key={c} className="w-1.5 h-6 rounded-sm animate-pulse" style={{ backgroundColor: c }} />
            ))}
          </div>
          <p className="mt-3 text-[12px] text-[#746E62]">{loading ? '正在检查登录状态…' : '正在同步书房…'}</p>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return (
    <>
      {syncError && (
        <div className="fixed left-3 right-3 top-3 z-30 rounded-[8px] border border-[#BC644E]/20 bg-[#FFFDF8] px-3 py-2 text-center text-[12px] text-[#BC644E] shadow-sm md:left-auto md:right-4 md:w-fit">
          {syncError}
        </div>
      )}
      <Outlet />
    </>
  )
}
