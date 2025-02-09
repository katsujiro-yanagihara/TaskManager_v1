import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    // URLからエラーパラメータを確認
    const error = router.query.error
    const errorDescription = router.query.error_description

    if (error) {
      console.error('認証エラー:', error, errorDescription)
      router.push('/?error=auth_callback_error')
      return
    }

    // 認証成功時の処理
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // セッションが有効な場合はホームページへリダイレクト
        router.push('/')
      } else {
        // セッションが無効な場合はログインページへリダイレクト
        router.push('/?error=session_error')
      }
    })
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-cyan-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-cyan-900 mb-4">認証処理中</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-4 text-cyan-600">認証を確認しています...</p>
        </div>
      </div>
    </div>
  )
}
