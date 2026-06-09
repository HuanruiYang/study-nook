import { useState, useEffect } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { hasSupabaseConfig, supabase } from '../lib/supabase'

const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true' || !hasSupabaseConfig
const DEV_SESSION_KEY = 'shufang_dev_session'

export const isDevMode = DEV_MODE

function getAuthRedirectUrl() {
  const url = new URL(window.location.href)
  url.search = ''
  url.hash = ''
  return url.toString()
}

function cleanAuthRedirectUrl() {
  const cleanUrl = `${window.location.origin}${window.location.pathname}${window.location.hash || '#/'}`
  window.history.replaceState({}, document.title, cleanUrl)
}

function makeDevUser(email: string): User {
  return {
    id: 'dev-user-001',
    email,
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  } as User
}

function makeDevSession(email: string): Session {
  const user = makeDevUser(email)
  return { user, access_token: 'dev', refresh_token: 'dev', expires_in: 999999, token_type: 'bearer' } as Session
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (DEV_MODE) {
      const stored = localStorage.getItem(DEV_SESSION_KEY)
      if (stored) {
        const sess = makeDevSession(stored)
        setSession(sess)
        setUser(sess.user)
      }
      setLoading(false)
      return
    }

    async function loadSession() {
      const code = new URLSearchParams(window.location.search).get('code')
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        cleanAuthRedirectUrl()
        if (error) console.warn('Magic link sign-in failed:', error)
      }

      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }

    void loadSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signInWithMagicLink(email: string) {
    if (DEV_MODE) {
      localStorage.setItem(DEV_SESSION_KEY, email)
      const sess = makeDevSession(email)
      setSession(sess)
      setUser(sess.user)
      return { error: null }
    }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: getAuthRedirectUrl() },
    })
    return { error }
  }

  async function signOut() {
    if (DEV_MODE) {
      localStorage.removeItem(DEV_SESSION_KEY)
      setSession(null)
      setUser(null)
      return
    }
    await supabase.auth.signOut()
  }

  return { user, session, loading, signInWithMagicLink, signOut }
}
