import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: string
  name: string
  email: string
  role: "MEMBER" | "ADMIN"
  status: string
  lastRenewal: string | null
  expirationDate: string | null
  createdAt: string
  avatar: string | null
}

interface AuthContextType {
  user: User | null
  loading: boolean
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchMe = async () => {
    const token = sessionStorage.getItem("access_token")
    if (!token) { setLoading(false); return }

    try {
      const res = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
        },
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      console.log("fetchMe data:", data)
      setUser(data)
    } catch {
      sessionStorage.removeItem("access_token")
      sessionStorage.removeItem("token")
      sessionStorage.removeItem("user")
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMe() }, [])

  const logout = () => {
    sessionStorage.removeItem("access_token")
    sessionStorage.removeItem("token")
    sessionStorage.removeItem("user")
    setUser(null)
    window.location.href = "/"
  }

  const refreshUser = async () => { await fetchMe() }

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}
