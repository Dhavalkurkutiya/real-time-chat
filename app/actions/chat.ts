"use server"

import { sql } from "@/lib/db"
import { getCurrentUser } from "./auth"
import { revalidatePath } from "next/cache"

export async function sendMessage(formData: FormData) {
  const content = formData.get("content") as string
  const roomId = formData.get("roomId") as string

  const user = await getCurrentUser()
  if (!user) {
    return { error: "Pehle login kariye" }
  }

  if (!content.trim()) {
    return { error: "Message khali nahi ho sakta" }
  }

  try {
    await sql`
      INSERT INTO messages (content, user_id, room_id)
      VALUES (${content}, ${user.id}, ${Number.parseInt(roomId)})
    `

    revalidatePath("/chat")
    return { success: true }
  } catch (error) {
    console.error("Send message error:", error)
    return { error: "Message send nahi hua" }
  }
}

export async function getMessages(roomId: number) {
  try {
    const messages = await sql`
      SELECT m.*, u.username, u.avatar_url
      FROM messages m
      JOIN users u ON m.user_id = u.id
      WHERE m.room_id = ${roomId}
      ORDER BY m.created_at ASC
    `

    return messages
  } catch (error) {
    console.error("Get messages error:", error)
    return []
  }
}

export async function getChatRooms() {
  try {
    const rooms = await sql`
      SELECT cr.*, u.username as created_by_username
      FROM chat_rooms cr
      JOIN users u ON cr.created_by = u.id
      ORDER BY cr.created_at DESC
    `

    return rooms
  } catch (error) {
    console.error("Get rooms error:", error)
    return []
  }
}

export async function createChatRoom(formData: FormData) {
  const name = formData.get("name") as string
  const description = formData.get("description") as string

  const user = await getCurrentUser()
  if (!user) {
    return { error: "Pehle login kariye" }
  }

  if (!name.trim()) {
    return { error: "Room ka naam dalna zaroori hai" }
  }

  try {
    const room = await sql`
      INSERT INTO chat_rooms (name, description, created_by)
      VALUES (${name}, ${description || null}, ${user.id})
      RETURNING *
    `

    // Add creator as member
    await sql`
      INSERT INTO room_members (user_id, room_id)
      VALUES (${user.id}, ${room[0].id})
    `

    revalidatePath("/chat")
    return { success: true, room: room[0] }
  } catch (error) {
    console.error("Create room error:", error)
    return { error: "Room create nahi hua" }
  }
}
