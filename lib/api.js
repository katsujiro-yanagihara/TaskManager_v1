import { supabase } from './supabase'

const getAuthHeader = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return {
    Authorization: `Bearer ${session?.access_token || ''}`
  }
}

export const api = {
  // Auth
  async signup(email, password) {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    if (!response.ok) throw new Error('Signup failed')
    return response.json()
  },

  async login(email, password) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    if (!response.ok) throw new Error('Login failed')
    return response.json()
  },

  async logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Tasks
  async getTasks() {
    try {
      const response = await fetch('/api/tasks')
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'タスクの取得に失敗しました')
      }
      return response.json()
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
      throw error
    }
  },

  async createTask(taskData) {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'タスクの作成に失敗しました')
      }
      return response.json()
    } catch (error) {
      console.error('Failed to create task:', error)
      throw error
    }
  },

  async updateTask(id, taskData) {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'タスクの更新に失敗しました')
      }
      return response.json()
    } catch (error) {
      console.error('Failed to update task:', error)
      throw error
    }
  },

  async deleteTask(id) {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'タスクの削除に失敗しました')
      }
      return response.json()
    } catch (error) {
      console.error('Failed to delete task:', error)
      throw error
    }
  }
}
