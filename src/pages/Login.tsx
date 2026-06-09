import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { hasSupabaseConfig } from '../lib/supabase'
import OpenBookLogo from '../components/OpenBookLogo'

const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true' || !hasSupabaseConfig

export default function Login() {
  const { signInWithPassword, signUpWithPassword } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('reader@example.com')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || password.length < 6) return
    setLoading(true)
    setError('')
    setNotice('')
    const result = mode === 'signIn'
      ? await signInWithPassword(email.trim(), password)
      : await signUpWithPassword(email.trim(), password)
    setLoading(false)

    const { error } = result
    if (error) {
      setError(error.message)
    } else {
      if (mode === 'signUp' && !DEV_MODE) {
        setNotice('账号已创建。如果没有自动进入，请在 Supabase 后台关闭 Confirm email 后再注册/登录。')
      }
      navigate('/')
    }
  }

  function switchMode(nextMode: 'signIn' | 'signUp') {
    setMode(nextMode)
    setError('')
    setNotice('')
  }

  return (
    <div className="login-shell flex min-h-svh items-center justify-center px-4 py-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[8px] border border-[#6B7D6C]/14 bg-[#FFFDF8]/82 shadow-[0_24px_70px_rgba(88,75,55,0.12)] backdrop-blur md:grid-cols-[1.04fr_0.96fr]">
        <section className="relative min-h-[380px] overflow-hidden bg-[#EEF3E8] p-8 text-[#312F2A] md:p-10">
          <div className="absolute inset-x-5 bottom-4 flex justify-center opacity-95 md:bottom-8">
            <svg className="h-56 w-full max-w-[390px]" viewBox="0 0 420 250" role="img" aria-label="摊开的书">
              <path d="M30 76c0-17 13-29 30-27 61 5 105 26 150 63v105c-43-33-88-51-150-56-17-1-30-15-30-32V76Z" fill="#FFFDF8" stroke="#D8CBB8" strokeWidth="3" />
              <path d="M390 76c0-17-13-29-30-27-61 5-105 26-150 63v105c43-33 88-51 150-56 17-1 30-15 30-32V76Z" fill="#F6ECDA" stroke="#D8CBB8" strokeWidth="3" />
              <path d="M210 112v105" stroke="#9E8B6E" strokeWidth="4" strokeLinecap="round" />
              <path d="M72 93c39 4 74 15 105 34M72 124c38 4 72 14 105 31M72 155c33 4 65 12 97 27" stroke="#9B8A72" strokeWidth="6" strokeLinecap="round" opacity=".78" />
              <path d="M348 93c-39 4-74 15-105 34M348 124c-38 4-72 14-105 31M348 155c-33 4-65 12-97 27" stroke="#9B8A72" strokeWidth="6" strokeLinecap="round" opacity=".78" />
              <path d="M44 183c68 2 119 16 166 48 47-32 98-46 166-48" fill="none" stroke="#5F8265" strokeWidth="7" strokeLinecap="round" />
            </svg>
          </div>
          <div className="relative z-10">
            <OpenBookLogo className="mb-5 h-14 w-14 shadow-sm" />
            <h1 className="serif-title text-[34px] font-semibold leading-tight md:text-[44px]">手边书房</h1>
            <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-[#5F6258]">
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
                开发预览 · 任意密码可进入
              </p>
            )}
            {!DEV_MODE && (
              <p className="mt-2 text-[12px] text-[#746E62]">
                使用邮箱和密码登录后，书目和札记会在多台设备间同步。
              </p>
            )}
          </div>

          <div className="mb-5 grid grid-cols-2 rounded-[8px] border border-[#312F2A]/10 bg-[#F4EFE4]/60 p-1">
            <button
              type="button"
              onClick={() => switchMode('signIn')}
              className={`rounded-[7px] py-2 text-[13px] transition-colors ${
                mode === 'signIn' ? 'bg-[#312F2A] text-[#FFFDF8]' : 'text-[#746E62]'
              }`}
            >
              登录
            </button>
            <button
              type="button"
              onClick={() => switchMode('signUp')}
              className={`rounded-[7px] py-2 text-[13px] transition-colors ${
                mode === 'signUp' ? 'bg-[#312F2A] text-[#FFFDF8]' : 'text-[#746E62]'
              }`}
            >
              注册
            </button>
          </div>

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

            <label className="block">
              <span className="mb-2 block text-[12px] font-medium text-[#746E62]">密码</span>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="至少 6 位"
                minLength={6}
                required
                className="field w-full rounded-[8px] px-3 py-3 text-[15px] placeholder-[#746E62]/60"
              />
            </label>

            {notice && <p className="rounded-[8px] bg-[#5F8265]/10 px-3 py-2 text-[12px] leading-relaxed text-[#4F6F52]">{notice}</p>}
            {error && <p className="text-[12px] text-[#BC644E]">{error}</p>}

            <button
              type="submit"
              disabled={loading || !email.trim() || password.length < 6}
              className="ink-button w-full rounded-[8px] py-3 text-[14px] font-medium transition-colors disabled:opacity-40"
            >
              {loading ? '处理中…' : mode === 'signIn' ? '登录书房' : '创建账号'}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}
