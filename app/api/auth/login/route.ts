import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  
  try {
    // リクエストボディの取得
    const { email, password } = await request.json()
    
    // Supabaseでログイン処理
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    // エラーがあれば throw
    if (error) throw error

    // 成功時のレスポンス
    return NextResponse.json({
      user: data.user,
      session: data.session
    })
  } catch (error) {
    // エラー時のログとレスポンス
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'ログインに失敗しました' },
      { status: 400 }
    )
  }
}