import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// タスクの更新
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies })
  
  try {
    const taskData = await request.json()
    
    // バリデーション
    if (taskData.title && typeof taskData.title !== 'string') {
      return NextResponse.json(
        { error: 'タイトルが不正です' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('tasks')
      .update({
        ...taskData,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json(
      { error: 'タスクの更新に失敗しました' },
      { status: 500 }
    )
  }
}

// タスクの削除
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies })
  
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', params.id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json(
      { error: 'タスクの削除に失敗しました' },
      { status: 500 }
    )
  }
}

// タスクの取得
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies })
  
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) throw error
    if (!data) {
      return NextResponse.json(
        { error: 'タスクが見つかりません' },
        { status: 404 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json(
      { error: 'タスクの取得に失敗しました' },
      { status: 500 }
    )
  }
}
