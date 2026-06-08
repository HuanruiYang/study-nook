import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { hasSupabaseConfig } from '../lib/supabase'

const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true' || !hasSupabaseConfig

export default function Login() {
  const { signInWithMagicLink } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError('')
    const { error } = await signInWithMagicLink(email.trim())
    setLoading(false)
    if (error) {
      setError(error.message)
    } else if (DEV_MODE) {
      navigate('/')
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-svh bg-[#F5F2EB] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="flex justify-center gap-1 mb-3">
            {['#C5705A', '#5B7FA3', '#6B8F6A', '#C4A84B'].map(c => (
              <div key={c} className="w-2 h-8 rounded-sm" style={{ backgroundColor: c }} />
            ))}
          </div>
          <h1
            className="text-[24px] font-medium text-[#3D3A32] tracking-wide"
            style={{ fontFamily: '"Georgia", "Noto Serif SC", serif' }}
          >
            手边书房
          </h1>
          <p className="text-[13px] text-[#7A7468] mt-1">你的阅读生命档案</p>
          {DEV_MODE && (
            <p className="text-[11px] text-[#C4A84B] mt-2 bg-[#C4A84B]/10 rounded-full px-3 py-1 inline-block">
              开发模式 · 输入任意邮箱直接进入
            </p>
          )}
        </div>

        {sent ? (
          <div className="text-center bg-[#E8E3D8] rounded-xl p-6 border border-black/10">
            <p className="text-[32px] mb-2">✉️</p>
            <p className="text-[15px] text-[#3D3A32] font-medium mb-1">已发送，请查收邮件</p>
            <p className="text-[13px] text-[#7A7468]">点击邮件中的链接即可登录</p>
            <button
              onClick={() => setSent(false)}
              className="mt-4 text-[12px] text-[#7A7468] hover:text-[#3D3A32] transition-colors"
            >
              重新发送
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-[#E8E3D8] rounded-xl p-6 border border-black/10">
            <label className="block text-[11px] text-[#7A7468] uppercase tracking-wider mb-2">
              邮箱地址
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full bg-[#F5F2EB] border border-black/15 rounded-lg px-3 py-2.5 text-[15px] text-[#3D3A32] placeholder-[#7A7468]/60 outline-none focus:border-[#3D3A32] transition-colors mb-4"
            />
            {error && (
              <p className="text-[12px] text-[#C5705A] mb-3">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full py-2.5 bg-[#3D3A32] text-[#F5F2EB] rounded-lg text-[14px] font-medium disabled:opacity-40 hover:bg-[#5a564d] transition-colors"
            >
              {loading ? '登录中…' : DEV_MODE ? '进入书房' : '发送登录链接'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
