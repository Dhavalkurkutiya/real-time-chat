export interface User {
  id: number
  username: string
  email: string
  avatar_url?: string
  created_at: string
}

export interface ChatRoom {
  id: number
  name: string
  description?: string
  created_by: number
  created_at: string
}

export interface Message {
  id: number
  content: string
  user_id: number
  room_id: number
  created_at: string
  username?: string
  avatar_url?: string
}
