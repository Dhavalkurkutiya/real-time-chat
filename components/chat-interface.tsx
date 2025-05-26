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
import { Badge } from "@/components/ui/badge"
import {
  Send,
  Plus,
  Search,
  MoreHorizontal,
  Bell,
  LogOut,
  MessageSquare,
  Mail,
  Phone,
  Globe,
  FileText,
  ExternalLink,
  Menu,
  X,
  ArrowLeft,
  Paperclip,
  Smile,
  Mic,
} from "lucide-react"
import { useRouter } from "next/navigation"
import type { User as UserType, ChatRoom, Message } from "@/lib/types"

interface ModernChatInterfaceProps {
  user: UserType
  rooms: ChatRoom[]
  currentRoomId: number | null
  initialMessages: Message[]
}

export default function ModernChatInterface({ user, rooms, currentRoomId, initialMessages }: ModernChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [isLoading, setIsLoading] = useState(false)
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false)
  const [showChatList, setShowChatList] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const currentRoom = rooms.find((room) => room.id === currentRoomId)
  const onlineUsers = rooms.slice(0, 4)
  const filteredRooms = rooms.filter((room) => room.name.toLowerCase().includes(searchQuery.toLowerCase()))

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

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

  async function handleLogout() {
    setIsLoggingOut(true)
    try {
      const result = await logoutUser()
      if (result.success) {
        router.push("/login")
        router.refresh()
      }
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  function switchRoom(roomId: number) {
    router.push(`/chat?room=${roomId}`)
    setIsMobileSidebarOpen(false)
    setShowChatList(false) // Hide chat list on mobile when room is selected
  }

  const mockSharedFiles = [
    { name: "PhotoDenver.jpg", size: "175 KB", time: "10:30 AM" },
    { name: "Document.pdf", size: "2.1 MB", time: "09:15 AM" },
    { name: "Presentation.pptx", size: "5.3 MB", time: "Yesterday" },
    { name: "Screenshot.png", size: "890 KB", time: "Yesterday" },
  ]

  const mockSharedLinks = [
    { name: "Dribbble.com", time: "10:30am" },
    { name: "Awwwards.com", time: "10:30am" },
    { name: "GitHub.com", time: "Yesterday" },
  ]

  // Chat List Sidebar Component
  const ChatListSidebar = () => (
    <div className="flex-1 bg-white border-r border-gray-100 flex flex-col">
      {/* User Profile */}
      <div className="p-4 lg:p-6 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="relative">
            <Avatar className="w-12 h-12">
              <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
              <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-gray-900 truncate">{user.username}</h2>
            <div className="flex items-center gap-2 text-gray-400">
              <Globe className="w-3 h-3" />
              <Mail className="w-3 h-3" />
              <Phone className="w-3 h-3" />
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            {isLoggingOut ? (
              <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Friends Online */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900">Friends Online</h3>
            <Badge variant="secondary" className="text-xs">
              {onlineUsers.length}
            </Badge>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {onlineUsers.map((room) => (
              <div key={room.id} className="relative flex-shrink-0">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={`/placeholder.svg?height=40&width=40&text=${room.name[0]}`} />
                  <AvatarFallback>{room.name[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chats Section */}
      <div className="flex-1 flex flex-col p-4 lg:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Chats</h3>
          <Dialog open={isCreateRoomOpen} onOpenChange={setIsCreateRoomOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                <Plus className="w-4 h-4 text-gray-400" />
              </Button>
            </DialogTrigger>
            <DialogContent className="mx-4 max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Chat Room</DialogTitle>
              </DialogHeader>
              <form action={handleCreateRoom} className="space-y-4">
                <div>
                  <Label htmlFor="name">Room Name</Label>
                  <Input id="name" name="name" placeholder="Enter room name" required />
                </div>
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea id="description" name="description" placeholder="Room description" />
                </div>
                <Button type="submit" className="w-full">
                  Create Room
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-50 border-0 focus:bg-white focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Chat List */}
        <ScrollArea className="flex-1">
          <div className="space-y-1">
            {filteredRooms.map((room) => (
              <button
                key={room.id}
                onClick={() => switchRoom(room.id)}
                className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
                  currentRoomId === room.id ? "bg-blue-50 border border-blue-200 shadow-sm" : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={`/placeholder.svg?height=48&width=48&text=${room.name[0]}`} />
                      <AvatarFallback>{room.name[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-900 truncate">{room.name}</h4>
                      <span className="text-xs text-gray-500">
                        {new Date().toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{room.description || "Start a conversation..."}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )

  // Right Sidebar Component
  const RightSidebar = () => (
    <div className="w-full lg:w-80 bg-white border-l border-gray-100 p-4 lg:p-6">
      {/* Profile Section */}
      <div className="text-center mb-8">
        <div className="relative inline-block mb-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src={`/placeholder.svg?height=80&width=80&text=${currentRoom?.name[0]}`} />
            <AvatarFallback className="text-2xl">{currentRoom?.name[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{currentRoom?.name}</h3>
        <div className="flex items-center justify-center gap-4 text-gray-400">
          <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
            <Globe className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
            <Mail className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
            <Phone className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Shared Files */}
      {/* <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">Shared Files</h4>
          <Button variant="ghost" size="sm" className="text-blue-500 text-sm hover:text-blue-600">
            see all
          </Button>
        </div>
        <div className="space-y-2">
          {mockSharedFiles.map((file, index) => (
            <div key={index} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {file.time} • {file.size}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div> */}

      {/* Shared Links */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">Shared Links</h4>
          <Button variant="ghost" size="sm" className="text-blue-500 text-sm hover:text-blue-600">
            see all
          </Button>
        </div>
        <div className="space-y-2">
          {mockSharedLinks.map((link, index) => (
            <div key={index} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <ExternalLink className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{link.name}</p>
                <p className="text-xs text-gray-500">{link.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Mobile/Desktop Chat List Sidebar */}
      <div className={`${showChatList ? "block" : "hidden"} lg:block w-full lg:w-80`}>
        <ChatListSidebar />
      </div>

      {/* Mobile Sidebar Sheet */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetContent side="left" className="p-0 w-80">
          <ChatListSidebar />
        </SheetContent>
      </Sheet>

      {/* Main Chat Area */}
      <div className={`${!showChatList || currentRoom ? "flex" : "hidden"} lg:flex flex-1 flex-col bg-white min-w-0`}>
        {currentRoom ? (
          <>
            {/* Mobile Chat Header */}
            <div className="lg:hidden p-4 border-b border-gray-100 flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setShowChatList(true)} className="w-8 h-8 p-0">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Avatar className="w-10 h-10">
                <AvatarImage src={`/placeholder.svg?height=40&width=40&text=${currentRoom.name[0]}`} />
                <AvatarFallback>{currentRoom.name[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-gray-900 truncate">{currentRoom.name}</h2>
                <p className="text-sm text-green-500">Online</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsRightSidebarOpen(true)}
                className="w-8 h-8 p-0 lg:hidden"
              >
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </div>

            {/* Desktop Chat Header */}
            <div className="hidden lg:block p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search friends"
                      className="pl-10 w-80 bg-gray-50 border-0 focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">
                    {new Date().toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                    <Bell className="w-4 h-4 text-gray-400" />
                  </Button>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">Chat with</div>
                <h1 className="text-xl font-semibold text-gray-900">{currentRoom.name}</h1>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4 lg:p-6">
              <div className="space-y-6 max-w-4xl mx-auto">
                {messages.map((message, index) => (
                  <div key={message.id} className="space-y-4">
                    {/* Time separator */}
                    {(index === 0 ||
                      new Date(message.created_at).getTime() - new Date(messages[index - 1]?.created_at).getTime() >
                        300000) && (
                      <div className="text-center">
                        <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                          {new Date(message.created_at).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}
                        </span>
                      </div>
                    )}

                    <div className={`flex gap-3 ${message.user_id === user.id ? "justify-end" : "justify-start"}`}>
                      {message.user_id !== user.id && (
                        <Avatar className="w-8 h-8 mt-1 flex-shrink-0">
                          <AvatarImage src={message.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback>{message.username?.[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                      )}

                      <div
                        className={`max-w-xs sm:max-w-md lg:max-w-lg ${message.user_id === user.id ? "order-first" : ""}`}
                      >
                        <div
                          className={`p-3 lg:p-4 rounded-2xl break-words ${
                            message.user_id === user.id
                              ? "bg-blue-500 text-white rounded-br-md"
                              : "bg-gray-100 text-gray-900 rounded-bl-md"
                          }`}
                        >
                          {message.content}
                        </div>

                        {/* Message status */}
                        {message.user_id === user.id && (
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-xs text-white font-bold">✓</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {message.user_id === user.id && (
                        <Avatar className="w-8 h-8 mt-1 flex-shrink-0">
                          <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 lg:p-6 border-t border-gray-100 bg-white">
              <form action={handleSendMessage} className="flex items-center gap-3">
                <Avatar className="w-10 h-10 hidden sm:block">
                  <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 relative">
                  <Input
                    name="content"
                    placeholder="Type your message..."
                    className="pr-24 bg-gray-50 border-0 rounded-full h-12 focus:bg-white focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                    required
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                      <Paperclip className="w-4 h-4 text-gray-400" />
                    </Button>
                    <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                      <Smile className="w-4 h-4 text-gray-400" />
                    </Button>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="w-10 h-10 p-0 sm:hidden">
                  <Mic className="w-5 h-5 text-gray-400" />
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-full w-12 h-12 p-0 bg-blue-500 hover:bg-blue-600 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center max-w-sm">
              <Button variant="ghost" className="lg:hidden mb-4" onClick={() => setIsMobileSidebarOpen(true)}>
                <Menu className="w-5 h-5 mr-2" />
                Open Chats
              </Button>
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No chat selected</h3>
              <p className="text-gray-500">Choose a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Right Sidebar */}
      {currentRoom && (
        <div className="hidden xl:block w-80">
          <RightSidebar />
        </div>
      )}

      {/* Mobile Right Sidebar Sheet */}
      <Sheet open={isRightSidebarOpen} onOpenChange={setIsRightSidebarOpen}>
        <SheetContent side="right" className="p-0 w-80">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="font-semibold">Chat Info</h3>
            <Button variant="ghost" size="sm" onClick={() => setIsRightSidebarOpen(false)} className="w-8 h-8 p-0">
              <X className="w-4 h-4" />
            </Button>
          </div>
          <RightSidebar />
        </SheetContent>
      </Sheet>
    </div>
  )
}
