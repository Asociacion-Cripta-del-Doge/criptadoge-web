import { createContext, useContext, useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"

const SocketContext = createContext<Socket | null>(null)

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    let activeSocket: Socket | null = null
    const connectTimer = window.setTimeout(() => {
      const token = sessionStorage.getItem("access_token")
      activeSocket = io("/", {
        path: "/socket.io",
        auth: token ? { token } : {},
        transports: ["websocket"],
      })
      setSocket(activeSocket)
    }, 0)

    return () => {
      window.clearTimeout(connectTimer)
      activeSocket?.disconnect()
      setSocket(null)
    }
  }, [])

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)
