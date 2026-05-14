const API_BASE = "/api"

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

function getToken(): string | null {
  return localStorage.getItem("access_token")
}

export async function fetchEventos(): Promise<EventoAPI[]> {
  const res = await fetch(`${API_BASE}/eventos`)
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}

export async function joinEvento(id: string): Promise<EventoAPI> {
  const res = await fetch(`${API_BASE}/eventos/${id}/asistentes`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message ?? `Error ${res.status}`)
  }
  return res.json()
}

export async function leaveEvento(id: string): Promise<EventoAPI> {
  const res = await fetch(`${API_BASE}/eventos/${id}/asistentes`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message ?? `Error ${res.status}`)
  }
  return res.json()
}
