"use server"

import { sql } from "@/lib/db"
import { cookies } from "next/headers"

export async function loginUser(formData: FormData) {
  const username = formData.get("username") as string
  const email = formData.get("email") as string

  if (!username || !email) {
    return { error: "Username aur email dalna zaroori hai" }
  }

  try {
    // Check if user exists
    const existingUser = await sql`
      SELECT * FROM users WHERE username = ${username} OR email = ${email}
    `

    let user
    if (existingUser.length > 0) {
      user = existingUser[0]
    } else {
      // Create new user
      const newUser = await sql`
        INSERT INTO users (username, email, avatar_url)
        VALUES (${username}, ${email}, ${`https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`})
        RETURNING *
      `
      user = newUser[0]
    }

    // Set user session
    const cookieStore = await cookies()
    cookieStore.set("user_id", user.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return { success: true, user }
  } catch (error) {
    console.error("Login error:", error)
    return { error: "Login mein problem hui hai" }
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value

    if (!userId) return null

    const user = await sql`
      SELECT * FROM users WHERE id = ${Number.parseInt(userId)}
    `

    return user[0] || null
  } catch (error) {
    console.error("Get user error:", error)
    return null
  }
}

export async function logoutUser() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete("user_id")
    return { success: true }
  } catch (error) {
    console.error("Logout error:", error)
    return { error: "Logout mein problem hui hai" }
  }
}
