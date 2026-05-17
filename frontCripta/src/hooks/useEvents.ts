import { useCallback, useEffect, useState } from "react"
import { fetchEventos, type EventoAPI } from "../services/eventosService"

export interface Evento {
  id: string
  titulo: string
  descripcion?: string
  fecha: string
  hora?: string
  label: string
  estado: string
  asistentes: number
  attendeeIds: string[]
}

function mapEvento(e: EventoAPI): Evento {
  return {
    id: e._id,
    titulo: e.title,
    descripcion: e.description,
    fecha: e.date,
    hora: e.time,
    label: e.label,
    estado: e.status,
    asistentes: e.attendees.length,
    attendeeIds: e.attendees.map(a => a.userId),
  }
}

export function useEvents() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    fetchEventos()
      .then(data => setEventos(data.map(mapEvento)))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  return { eventos, loading, error, refresh: load }
}
