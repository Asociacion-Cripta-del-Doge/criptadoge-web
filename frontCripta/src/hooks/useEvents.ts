import { useCallback, useEffect, useState } from "react"
import { fetchEventos, fetchMisAsistencias, type EventoAPI } from "../services/eventosService"
import { useSocket } from "../context/SocketContext"

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
    asistentes: e.attendeesCount,
    attendeeIds: e.isAttending ? ["me"] : [],
  }
}

export function useEvents() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const socket = useSocket()

  const load = useCallback(() => {
    Promise.all([fetchEventos(), fetchMisAsistencias()])
      .then(([data, myAttendances]) => {
        const myAttendanceSet = new Set(myAttendances)
        setEventos(data.map(event => ({
          ...mapEvento(event),
          attendeeIds: event.isAttending || myAttendanceSet.has(event._id) ? ["me"] : [],
        })))
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (!socket) return

    const onAttendeeUpdate = (data: { eventId: string; attendeesCount: number }) => {
      setEventos(prev =>
        prev.map(ev =>
          ev.id === data.eventId
            ? { ...ev, asistentes: data.attendeesCount }
            : ev
        )
      )
    }

    const onEventCreated = (data: EventoAPI & { _id: string }) => {
      setEventos(prev => {
        if (prev.some(ev => ev.id === data._id)) return prev
        return [...prev, mapEvento(data)]
      })
    }

    const onEventUpdated = (data: EventoAPI & { _id: string }) => {
      setEventos(prev =>
        prev.map(ev =>
          ev.id === data._id
            ? { ...mapEvento(data), attendeeIds: data.isAttending ? ["me"] : ev.attendeeIds }
            : ev
        )
      )
    }

    const onEventDeleted = (data: { eventId: string }) => {
      setEventos(prev => prev.filter(ev => ev.id !== data.eventId))
    }

    socket.on("attendee-update", onAttendeeUpdate)
    socket.on("event-created", onEventCreated)
    socket.on("event-updated", onEventUpdated)
    socket.on("event-deleted", onEventDeleted)

    return () => {
      socket.off("attendee-update", onAttendeeUpdate)
      socket.off("event-created", onEventCreated)
      socket.off("event-updated", onEventUpdated)
      socket.off("event-deleted", onEventDeleted)
    }
  }, [socket])

  return { eventos, loading, error, refresh: load }
  
}


