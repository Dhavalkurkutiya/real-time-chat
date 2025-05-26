"use client"

import { useState, useEffect, useRef } from "react"
import { sendMessage, createChatRoom, getMessages } from "@/app/actions/chat"
import { logoutUser } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Send, Plus, LogOut, MessageCircle, Users, Menu } from "lucide-react"
import { useRouter } from "next/navigation"
import type { User, ChatRoom, Message } from "@/lib/types"

interface ChatInterfaceProps {
  user: User
  rooms: ChatRoom[]
  currentRoomId: number | null
  initialMessages: Message[]
}

export default function ChatInterface({ user, rooms, currentRoomId, initialMessages }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [isLoading, setIsLoading] = useState(false)
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const currentRoom = rooms.find((room) => room.id === currentRoomId)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Auto-refresh messages every 3 seconds
  useEffect(() => {
    if (!currentRoomId) return

    const interval = setInterval(async () => {
      const newMessages = await getMessages(currentRoomId)
      setMessages(newMessages)
    }, 3000)

    return () => clearInterval(interval)
  }, [currentRoomId])

  async function handleSendMessage(formData: FormData) {
    if (!currentRoomId) return

    setIsLoading(true)
    formData.append("roomId", currentRoomId.toString())

    const result = await sendMessage(formData)

    if (result.success) {
      // Refresh messages immediately
      const newMessages = await getMessages(currentRoomId)
      setMessages(newMessages)
    }

    setIsLoading(false)
  }

  async function handleCreateRoom(formData: FormData) {
    const result = await createChatRoom(formData)

    if (result.success) {
      setIsCreateRoomOpen(false)
      router.refresh()
    }
  }

  function switchRoom(roomId: number) {
    router.push(`/chat?room=${roomId}`)
    setIsMobileSidebarOpen(false) // Close mobile sidebar when switching rooms
  }

  // Sidebar content component
  const SidebarContent = () => (
    <div className="h-full bg-white flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold">Muze Chat</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={() => logoutUser()} className="text-red-600 hover:text-red-700">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
            <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate">{user.username}</p>
            <p className="text-sm text-gray-600 truncate">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold flex items-center gap-2">
              <Users className="w-4 h-4" />
              Chat Rooms
            </h2>
            <Dialog open={isCreateRoomOpen} onOpenChange={setIsCreateRoomOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="mx-4 max-w-md">
                <DialogHeader>
                  <DialogTitle>Naya Chat Room Banayiye</DialogTitle>
                </DialogHeader>
                <form action={handleCreateRoom} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Room Name</Label>
                    <Input id="name" name="name" placeholder="Room ka naam daliye" required />
                  </div>
                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea id="description" name="description" placeholder="Room ke baare mein batayiye" />
                  </div>
                  <Button type="submit" className="w-full">
                    Room Banayiye
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => switchRoom(room.id)}
                className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${
                  currentRoomId === room.id ? "bg-blue-100 border-blue-200 border" : "hover:bg-gray-50"
                }`}
              >
                <div className="font-medium truncate">{room.name}</div>
                {room.description && <div className="text-sm text-gray-600 truncate">{room.description}</div>}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )

  return (
    <div className="h-screen bg-gray-100 flex overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-80 border-r border-gray-200">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetContent side="left" className="p-0 w-80">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {currentRoom ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white border-b border-gray-200 flex items-center gap-3">
              <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setIsMobileSidebarOpen(true)}>
                <Menu className="w-5 h-5" />
              </Button>

              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-semibold truncate">{currentRoom.name}</h2>
                {currentRoom.description && (
                  <p className="text-gray-600 text-sm truncate hidden sm:block">{currentRoom.description}</p>
                )}
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-2 sm:p-4">
              <div className="space-y-3 sm:space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-2 sm:gap-3 ${
                      message.user_id === user.id ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <Avatar className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0">
                      <AvatarImage src={message.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback className="text-xs">{message.username?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>

                    <div
                      className={`max-w-[85%] sm:max-w-[70%] ${message.user_id === user.id ? "text-right" : "text-left"}`}
                    >
                      <div className="text-xs text-gray-500 mb-1">
                        <span className="hidden sm:inline">{message.username} • </span>
                        {new Date(message.created_at).toLocaleTimeString("hi-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div
                        className={`p-2 sm:p-3 rounded-lg text-sm sm:text-base break-words ${
                          message.user_id === user.id
                            ? "bg-blue-500 text-white rounded-br-sm"
                            : "bg-gray-100 text-gray-800 rounded-bl-sm"
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-3 sm:p-4 bg-white border-t border-gray-200">
              <form action={handleSendMessage} className="flex gap-2">
                <Input
                  name="content"
                  placeholder="Message type kariye..."
                  className="flex-1 text-sm sm:text-base"
                  disabled={isLoading}
                  required
                />
                <Button type="submit" disabled={isLoading} size="sm" className="px-3">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 p-4">
            <div className="text-center max-w-sm">
              <Button variant="ghost" className="lg:hidden mb-4" onClick={() => setIsMobileSidebarOpen(true)}>
                <Menu className="w-5 h-5 mr-2" />
                Chat Rooms
              </Button>

              <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-base sm:text-lg mb-2">Koi chat room select kariye</p>
              <p className="text-sm text-gray-400">Ya phir naya room banayiye</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
