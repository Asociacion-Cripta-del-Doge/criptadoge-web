import { createContext, useContext, useEffect, useRef } from "react"
import { io, Socket } from "socket.io-client"

const SocketContext = createContext<Socket | null>(null)

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const socketRef = useRef<Socket | null>(null)

  if (!socketRef.current) {
    const token = localStorage.getItem("access_token")
    socketRef.current = io("/", {
      path: "/socket.io",
      auth: token ? { token } : {},
      transports: ["websocket"],
    })
  }

  useEffect(() => {
    const socket = socketRef.current!
    return () => { socket.disconnect() }
  }, [])

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)
