const API_BASE = "http://localhost:8080/api"

export interface EventoAPI {
  _id: string
  title: string
  description?: string
  date: string
  time?: string
  label: string
  status: string
  attendees: { userId: string; joinedAt: string }[]
}

export function getToken(): string | null {
  return localStorage.getItem("token")
}

export async function fetchEventos(): Promise<EventoAPI[]> {
  const res = await fetch(`${API_BASE}/eventos`)
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}
