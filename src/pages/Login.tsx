import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { hasSupabaseConfig } from '../lib/supabase'

const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true' || !hasSupabaseConfig

export default function Login() {
  const { signInWithMagicLink } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('reader@example.com')
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
    <div className="app-shell flex min-h-svh items-center justify-center px-4 py-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[8px] border border-[#312F2A]/12 bg-[#FBF8F1]/74 shadow-[0_24px_70px_rgba(49,47,42,0.14)] backdrop-blur md:grid-cols-[1.08fr_0.92fr]">
        <section className="relative min-h-[420px] overflow-hidden bg-[#312F2A] p-8 text-[#FBF8F1] md:p-10">
          <div className="absolute inset-x-10 bottom-0 top-28 flex items-end justify-center opacity-95">
            <div className="flex items-end gap-3">
              {[
                ['#BC644E', 190, '札记'],
                ['#496F8E', 250, '阅读'],
                ['#5F8265', 215, '灵感'],
                ['#B7963E', 178, '回声'],
              ].map(([color, height, label]) => (
                <div
                  key={String(color)}
                  className="book-shadow flex w-14 items-end rounded-t-[7px] px-2 pb-4 text-center"
                  style={{ height: Number(height), backgroundColor: String(color) }}
                >
                  <span className="serif-title w-full text-[13px] leading-tight">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative z-10">
            <div className="mb-5 flex gap-1">
              {['#BC644E', '#496F8E', '#5F8265', '#B7963E'].map(c => (
                <div key={c} className="h-8 w-2 rounded-sm" style={{ backgroundColor: c }} />
              ))}
            </div>
            <h1 className="serif-title text-[34px] font-semibold leading-tight md:text-[44px]">手边书房</h1>
            <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-[#FBF8F1]/72">
              把书目、书摘、感受和一闪而过的想法，收进同一个可同步的阅读档案。
            </p>
          </div>
        </section>

        <section className="p-6 md:p-10">
          <div className="mb-8">
            <p className="page-kicker mb-2">Login</p>
            <h2 className="serif-title text-[28px] font-semibold text-[#312F2A]">进入你的书房</h2>
            {DEV_MODE && (
              <p className="mt-2 inline-flex rounded-full bg-[#B7963E]/12 px-3 py-1 text-[11px] text-[#8C6B1D]">
                开发预览 · 默认邮箱可直接进入
              </p>
            )}
            {!DEV_MODE && (
              <p className="mt-2 text-[12px] text-[#746E62]">
                使用邮箱登录后，书目和札记会在多台设备间同步。
              </p>
            )}
          </div>

          {sent ? (
            <div className="paper-card rounded-[8px] p-6 text-center">
              <p className="serif-title text-[20px] font-semibold text-[#312F2A]">邮件已发送</p>
              <p className="mt-2 text-[13px] text-[#746E62]">点击邮件中的链接即可登录。</p>
              <button onClick={() => setSent(false)} className="ghost-button mt-5 rounded-[8px] px-4 py-2 text-[13px]">
                重新发送
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-[12px] font-medium text-[#746E62]">邮箱地址</span>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="field w-full rounded-[8px] px-3 py-3 text-[15px] placeholder-[#746E62]/60"
                />
              </label>
              {error && <p className="text-[12px] text-[#BC644E]">{error}</p>}
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="ink-button w-full rounded-[8px] py-3 text-[14px] font-medium transition-colors disabled:opacity-40"
              >
                {loading ? '登录中…' : DEV_MODE ? '进入书房' : '发送登录链接'}
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  )
}
