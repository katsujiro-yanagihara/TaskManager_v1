import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// タスク一覧を取得
export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })
  
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'タスクの取得に失敗しました' },
      { status: 500 }
    )
  }
}

// 新規タスクを作成
export async function POST(request: Request) {
    const supabase = createRouteHandlerClient({ cookies })
    
    try {
      // セッションの確認を追加
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        return NextResponse.json(
          { error: '認証が必要です' },
          { status: 401 }
        )
      }
  
      const taskData = await request.json()
      
      // user_id を追加
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
          user_id: session.user.id
        })
        .select()
        .single()
  
      if (error) throw error
      return NextResponse.json(data)
    } catch (error) {
      console.error('Error creating task:', error)
      return NextResponse.json(
        { error: 'タスクの作成に失敗しました' },
        { status: 500 }
      )
    }
  }