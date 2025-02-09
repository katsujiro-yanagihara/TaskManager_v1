import { supabase } from './supabase'

export async function validateUser(req) {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    throw new Error('No authorization header')
  }

  const token = authHeader.split(' ')[1]
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error) {
    throw new Error('Invalid token')
  }

  return user
}

export function withAuth(handler) {
  return async (req, res) => {
    try {
      const user = await validateUser(req)
      req.user = user
      return handler(req, res)
    } catch (error) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
  }
}
