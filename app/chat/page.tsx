import { getCurrentUser } from "@/app/actions/auth"
import { getChatRooms, getMessages } from "@/app/actions/chat"
import { redirect } from "next/navigation"
import ChatInterface from "@/components/chat-interface"

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ room?: string }>
}) {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }

  const rooms = await getChatRooms()
  const params = await searchParams
  const currentRoomId = params.room ? Number.parseInt(params.room) : rooms[0]?.id || null
  const messages = currentRoomId ? await getMessages(currentRoomId) : []

  return <ChatInterface user={user} rooms={rooms} currentRoomId={currentRoomId} initialMessages={messages} />
}
