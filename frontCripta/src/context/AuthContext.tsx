import React, { createContext, useContext, useEffect, useState } from "react";

interface User 
{
    id: string
    name: string 
    email: string 
    role: "MEMBER" | "ADMIN"
    status: string 
    lastRenewal: string | null 
    expirationDate: string | null 
    createdAt: string
    avatar: string | null
}

interface AuthContextType 
{
    user: User | null 
    loading: boolean 
    logout: () => void 
    refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children } : { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchMe = async () => {
        const token = localStorage.getItem("access_token")
        console.log("1. TOKEN:", token)
        if(!token) { setLoading(false); return }

        try {
            const res = await fetch("/api/auth/me", {
                headers: { Authorization: `Bearer ${token}`},
            })
            console.log("2. STATUS:", res.status)
            const data = await res.json()
            console.log("3. DATA:", data)
            if(!res.ok) throw new Error()
            setUser(data)
        }catch(e){
            console.log("4. ERROR:", e)
            localStorage.removeItem("access_token")
            setUser(null)
        }finally {
            setLoading(false)
        }
    }
    
    useEffect(() => { fetchMe() }, [])

    const logout = () => {
        localStorage.removeItem("access_token")
        setUser(null)
        window.location.href= "/"
    }

    const refreshUser = async() => { await fetchMe () }

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