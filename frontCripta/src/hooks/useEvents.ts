import { useEffect, useState } from "react"
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
  }
}

export function useEvents() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEventos()
      .then(data => setEventos(data.map(mapEvento)))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return { eventos, loading, error }
}
