"use client"

import { useState } from "react"
import { loginUser } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { MessageCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError("")

    const result = await loginUser(formData)

    if (result.error) {
      setError(result.error)
    } else {
      router.push("/chat")
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <MessageCircle className="w-12 h-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">Muze Chat App</CardTitle>
          <p className="text-gray-600">Apne doston se baat kariye</p>
        </CardHeader>

        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Apna username daliye"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Apna email daliye"
                required
                disabled={isLoading}
              />
            </div>

            {error && <div className="text-red-600 text-sm text-center">{error}</div>}

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
              {isLoading ? "Login ho rahe hain..." : "Login / Sign Up"}
            </Button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-4">Agar account nahi hai toh automatically ban jayega</p>
        </CardContent>
      </Card>
    </div>
  )
}
