import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

// レート制限のための簡易的なメモリストア
const rateLimit = new Map()

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // セッションの確認
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // APIエンドポイントへのアクセス制御
  if (req.nextUrl.pathname.startsWith('/api/')) {
    // CSRF対策
    const origin = req.headers.get('origin')
    if (origin && new URL(origin).host !== req.headers.get('host')) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'セキュリティチェックに失敗しました',
          details: 'クロスサイトリクエストが検出されました'
        }),
        { status: 403 }
      )
    }

    // レート制限
    const ip = req.ip || 'unknown'
    const now = Date.now()
    const windowMs = 60 * 1000 // 1分間
    const maxRequests = 100 // 1分間に100リクエストまで

    const userRequests = rateLimit.get(ip) || []
    const recentRequests = userRequests.filter(time => now - time < windowMs)

    if (recentRequests.length >= maxRequests) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'リクエスト制限を超えました',
          details: '短時間に多くのリクエストが検出されました。しばらく待ってから再度お試しください'
        }),
        { status: 429 }
      )
    }

    recentRequests.push(now)
    rateLimit.set(ip, recentRequests)

    // 認証が必要なAPIエンドポイントの保護
    if (
      req.nextUrl.pathname.startsWith('/api/tasks') &&
      !session
    ) {
      return new NextResponse(
        JSON.stringify({ 
          error: '認証が必要です',
          details: 'このリソースにアクセスするにはログインが必要です'
        }),
        { status: 401 }
      )
    }
  }

  // 古いレート制限データのクリーンアップ
  const cleanupTime = Date.now() - 60 * 60 * 1000 // 1時間前のデータを削除
  for (const [ip, requests] of rateLimit.entries()) {
    const validRequests = requests.filter(time => time > cleanupTime)
    if (validRequests.length === 0) {
      rateLimit.delete(ip)
    } else {
      rateLimit.set(ip, validRequests)
    }
  }

  return res
}

// ミドルウェアを適用するパス
export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
