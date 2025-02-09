import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'
import { useRouter } from 'next/router'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // ローカルストレージからトークンを確認
    const token = localStorage.getItem('supabase.auth.token')
    if (token) {
      supabase.auth.getUser(token).then(({ data: { user: currentUser } }) => {
        if (currentUser) {
          setUser(currentUser)
        } else {
          localStorage.removeItem('supabase.auth.token')
        }
      })
    }

    // 現在のセッションを取得
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession)
      setUser(currentSession?.user ?? null)
      setLoading(false)
    })

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      // セッションが無効になった場合
      if (!session) {
        localStorage.removeItem('supabase.auth.token')
        if (router.pathname !== '/') {
          router.push('/')
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const value = {
    user,
    session,
    loading,
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}
