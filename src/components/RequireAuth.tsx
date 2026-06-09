import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ensureDemoLibrary } from '../lib/localStore'

export default function RequireAuth() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-svh bg-[#F5F2EB] flex items-center justify-center">
        <div className="flex gap-1">
          {['#C5705A', '#5B7FA3', '#6B8F6A', '#C4A84B'].map(c => (
            <div key={c} className="w-1.5 h-6 rounded-sm animate-pulse" style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  ensureDemoLibrary(user.id)

  return <Outlet />
}
