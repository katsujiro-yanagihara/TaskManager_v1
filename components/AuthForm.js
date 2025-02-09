import { useState } from 'react'
import { useRouter } from 'next/router'
import { api } from '../lib/api'
import { useAuth } from '../lib/AuthContext'

export default function AuthForm() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (isLogin) {
        const { user, session } = await api.login(email, password)
        if (session) {
          setSuccess('ログインに成功しました')
          // セッションをローカルストレージに保存
          localStorage.setItem('supabase.auth.token', session.access_token)
          // 少し待ってからリダイレクト
          setTimeout(() => router.push('/'), 1000)
        } else {
          throw new Error('セッションの取得に失敗しました')
        }
      } else {
        const response = await api.signup(email, password)
        if (response.requiresEmailConfirmation) {
          setIsEmailSent(true)
          setSuccess(response.message)
          // フォームをクリア
          setEmail('')
          setPassword('')
        } else {
          setSuccess('アカウントを作成しました。ログインしてください。')
          // フォームをクリア
          setEmail('')
          setPassword('')
          setTimeout(() => setIsLogin(true), 2000)
        }
      }
    } catch (err) {
      console.error('Auth error:', err)
      const errorMessage = err.response?.data?.error || err.message
      setError(
        errorMessage === 'Signup failed' ? 'アカウント作成に失敗しました' :
        errorMessage === 'Login failed' ? 'ログインに失敗しました' :
        'エラーが発生しました。もう一度お試しください。'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-cyan-100">
        <h2 className="text-2xl font-bold text-cyan-900 text-center mb-6">
          {isLogin ? 'ログイン' : '新規登録'}
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm">
            {success}
          </div>
        )}

        {isEmailSent ? (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-blue-800 font-medium mb-2">メール認証が必要です</h3>
              <p className="text-blue-600 text-sm">
                {email} 宛に確認メールを送信しました。<br />
                メール内のリンクをクリックして、アカウントの認証を完了してください。
              </p>
            </div>
            <button
              onClick={() => {
                setIsEmailSent(false)
                setIsLogin(true)
                setSuccess('')
              }}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg px-4 py-2 
                hover:from-cyan-600 hover:to-blue-600 transition-all duration-200"
            >
              ログイン画面へ戻る
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-cyan-900 mb-1">
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-cyan-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-cyan-900 mb-1">
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-cyan-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg px-4 py-2 
              hover:from-cyan-600 hover:to-blue-600 transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '処理中...' : (isLogin ? 'ログイン' : '登録')}
          </button>
          </form>
        )}

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="w-full mt-4 text-cyan-600 hover:text-cyan-700 text-sm"
        >
          {isLogin ? '新規登録はこちら' : 'ログインはこちら'}
        </button>
      </div>
    </div>
  )
}
