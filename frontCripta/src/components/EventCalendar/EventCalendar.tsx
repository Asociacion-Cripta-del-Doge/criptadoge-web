import { useMemo, useState, useEffect, type CSSProperties } from "react"
import { useEvents, type Evento } from "../../hooks/useEvents"
import { joinEvento, leaveEvento } from "../../services/eventosService"
import { useAuth } from "../../context/AuthContext"
import { useWebTexts } from "../../hooks/useWebTexts"
import type { WebTextKey } from "../../data/webTextDefaults"
import "./EventCalendar.scss"

const MESES_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]

const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

const LABEL_COLORS: Record<string, string> = {
  cartas: "#ec4899",
  rol: "#3b82f6",
  mesa: "#eab308",
}

function getLabelColor(label: string): string {
  return LABEL_COLORS[label.toLowerCase()] ?? "#6b7280"
}

function isoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

function formatFecha(isoStr: string): string {
  const [y, m, d] = isoStr.split("-")
  return `${parseInt(d)} de ${MESES_ES[parseInt(m) - 1]} de ${y}`
}

const val = (v: string | number | undefined, emptyText: string) =>
  v !== undefined && v !== null && v !== "" ? String(v) : emptyText

const EventoModal = ({
  ev,
  onClose,
  onUpdated,
}: {
  ev: Evento
  onClose: () => void
  onUpdated: (updated: Evento) => void
  text: (key: WebTextKey) => string
}) => {
  const { user } = useAuth()
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState<{ msg: string; ok: boolean } | null>(null)

  const isInscrito = !!user && ev.attendeeIds.includes(user.id)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onClose])

  const handleInscripcion = async () => {
    if (!user) {
      setFeedback({ msg: "Debes iniciar sesión para inscribirte.", ok: false })
      return
    }
    setBusy(true)
    setFeedback(null)
    try {
      const updated = isInscrito
        ? await leaveEvento(ev.id)
        : await joinEvento(ev.id)
      const newAttendeeIds = updated.attendees.map(a => a.userId)
      onUpdated({
        ...ev,
        asistentes: updated.attendees.length,
        attendeeIds: newAttendeeIds,
      })
      setFeedback({
        msg: isInscrito ? "Te has dado de baja del evento." : "¡Inscripción confirmada!",
        ok: true,
      })
    } catch (err: unknown) {
      setFeedback({ msg: err instanceof Error ? err.message : "Error inesperado", ok: false })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="ec-modal-backdrop" onClick={onClose}>
      <div className="ec-modal" onClick={e => e.stopPropagation()}>
        <button className="ec-modal-close" onClick={onClose} aria-label={text("home.events.modal.close")}>✕</button>

        <div className="ec-modal-header">
          <span
            className="ec-modal-badge"
            style={{ background: getLabelColor(ev.label) }}
          >
            {ev.label}
          </span>
          <h2 className="ec-modal-title">{ev.titulo}</h2>
        </div>

        <dl className="ec-modal-fields">
          <div className="ec-modal-field">
            <dt>{text("home.events.modal.description")}</dt>
            <dd>{val(ev.descripcion, text("home.events.emptyValue"))}</dd>
          </div>
          <div className="ec-modal-field">
            <dt>{text("home.events.modal.date")}</dt>
            <dd>{val(formatFecha(ev.fecha), text("home.events.emptyValue"))}</dd>
          </div>
          <div className="ec-modal-field">
            <dt>{text("home.events.modal.time")}</dt>
            <dd>{val(ev.hora, text("home.events.emptyValue"))}</dd>
          </div>
          <div className="ec-modal-field">
            <dt>{text("home.events.modal.category")}</dt>
            <dd>{val(ev.label, text("home.events.emptyValue"))}</dd>
          </div>
          <div className="ec-modal-field">
            <dt>{text("home.events.modal.status")}</dt>
            <dd>{val(ev.estado, text("home.events.emptyValue"))}</dd>
          </div>
          <div className="ec-modal-field">
            <dt>{text("home.events.modal.attendees")}</dt>
            <dd>{ev.asistentes}</dd>
          </div>
        </dl>

        {feedback && (
          <p className={`ec-modal-feedback ${feedback.ok ? "ec-modal-feedback--ok" : "ec-modal-feedback--err"}`}>
            {feedback.msg}
          </p>
        )}

        <button
          className={`ec-modal-inscribirse ${isInscrito ? "ec-modal-inscribirse--baja" : ""}`}
          onClick={handleInscripcion}
          disabled={busy}
        >
          {busy ? "..." : isInscrito ? text("home.events.modal.leave") : text("home.events.modal.join")}
        </button>
      </div>
    </div>
  )
}

export const EventCalendar = () => {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [filterLabel, setFilterLabel] = useState<string | null>(null)
  const [modalEvento, setModalEvento] = useState<Evento | null>(null)
  const text = useWebTexts("home.events")

  const { eventos, loading, error, refresh } = useEvents()

  const { cells } = useMemo(() => {
    const firstDay = new Date(year, month, 1)
    let startOffset = firstDay.getDay() - 1
    if (startOffset < 0) startOffset = 6
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const cells: (number | null)[] = [
      ...Array(startOffset).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ]
    return { cells }
  }, [year, month])

  const labels = useMemo(() => [...new Set(eventos.map(e => e.label))], [eventos])

  const eventosPorFecha = useMemo(() => {
    const map: Record<string, Evento[]> = {}
    for (const ev of eventos) {
      if (!map[ev.fecha]) map[ev.fecha] = []
      map[ev.fecha].push(ev)
    }
    return map
  }, [eventos])

  const todayIso = isoDate(today.getFullYear(), today.getMonth(), today.getDate())

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
    setSelectedDate(null)
  }
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
    setSelectedDate(null)
  }

  const eventosDelDia: Evento[] = selectedDate
    ? (eventosPorFecha[selectedDate] ?? []).filter(e => !filterLabel || e.label === filterLabel)
    : []

  const titleDate = selectedDate
    ? (() => {
        const [, m, d] = selectedDate.split("-")
        return `${parseInt(d)} de ${MESES_ES[parseInt(m) - 1]}`
      })()
    : null

  return (
    <section id="eventos" className="ec-section">
      <div className="ec-header">
        <h2 className="ec-title">
          <span className="ec-title-highlight">{text("home.events.titleHighlight")}</span> {text("home.events.titleSuffix")}
        </h2>
        <p className="ec-subtitle">{text("home.events.subtitle")}</p>
      </div>

      {loading && <p className="ec-status">{text("home.events.loading")}</p>}
      {error && <p className="ec-status ec-status--error">{text("home.events.error")}</p>}

      <div className="ec-layout">
        <div className="ec-calendar">
          <div className="ec-cal-nav">
            <button className="ec-nav-btn" onClick={prevMonth} aria-label="Mes anterior">‹</button>
            <span className="ec-cal-month">{MESES_ES[month]} {year}</span>
            <button className="ec-nav-btn" onClick={nextMonth} aria-label="Mes siguiente">›</button>
          </div>

          <div className="ec-cal-grid">
            {DIAS_SEMANA.map(d => (
              <div key={d} className="ec-cal-weekday">{d}</div>
            ))}

            {cells.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} className="ec-cal-cell ec-cal-cell--empty" />

              const iso = isoDate(year, month, day)
              const evs = eventosPorFecha[iso] ?? []
              const isToday = iso === todayIso
              const isSelected = iso === selectedDate
              const isWeekend = (idx % 7) >= 5

              return (
                <button
                  key={iso}
                  className={[
                    "ec-cal-cell",
                    isToday && "ec-cal-cell--today",
                    isSelected && "ec-cal-cell--selected",
                    isWeekend && "ec-cal-cell--weekend",
                    evs.length && "ec-cal-cell--has-events",
                  ].filter(Boolean).join(" ")}
                  onClick={() => setSelectedDate(prev => prev === iso ? null : iso)}
                  aria-label={`${day} de ${MESES_ES[month]}`}
                  aria-pressed={isSelected}
                >
                  <span className="ec-cal-day-num">{day}</span>
                  {evs.length > 0 && (
                    <span className="ec-cal-dots">
                      {[...new Set(evs.map(e => e.label))].slice(0, 3).map(label => (
                        <span
                          key={label}
                          className="ec-cal-dot"
                          style={{ background: getLabelColor(label) }}
                        />
                      ))}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {labels.length > 0 && (
            <div className="ec-legend">
              {labels.map(label => (
                <button
                  key={label}
                  className={`ec-legend-item ${filterLabel === label ? "ec-legend-item--active" : ""}`}
                  onClick={() => setFilterLabel(prev => prev === label ? null : label)}
                  style={{ "--dot-color": getLabelColor(label) } as CSSProperties}
                >
                  <span className="ec-legend-dot" />
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="ec-panel">
          {!selectedDate ? (
            <div className="ec-panel-empty">
              <div className="ec-panel-empty-icon">📅</div>
              <p>{text("home.events.emptySelect").split("\n").map((line, index) => (
                <span key={line}>
                  {index > 0 && <br />}
                  {line}
                </span>
              ))}</p>
            </div>
          ) : (
            <>
              <h3 className="ec-panel-title">{text("home.events.dayEventsPrefix")} {titleDate}</h3>

              {eventosDelDia.length === 0 ? (
                <div className="ec-panel-empty">
                  <div className="ec-panel-empty-icon">🎲</div>
                  <p>
                    {text("home.events.emptyDay")}
                    {filterLabel ? ` ${text("home.events.emptyCategory")} "${filterLabel}"` : ""}
                  </p>
                </div>
              ) : (
                <ul className="ec-events-list">
                  {eventosDelDia.map(ev => (
                    <li
                      key={ev.id}
                      className="ec-event-card ec-event-card--clickable"
                      onClick={() => setModalEvento(ev)}
                    >
                      <div className="ec-event-card-top">
                        <span className="ec-event-title">{ev.titulo}</span>
                        <span
                          className="ec-event-badge"
                          style={{ background: getLabelColor(ev.label) }}
                        >
                          {ev.label}
                        </span>
                      </div>
                      {ev.descripcion && <p className="ec-event-desc">{ev.descripcion}</p>}
                      <div className="ec-event-meta">
                        <span title={text("home.events.modal.date")}>📅 {formatFecha(ev.fecha)}</span>
                        {ev.hora && <span title={text("home.events.modal.time")}>🕐 {ev.hora}</span>}
                        {ev.asistentes > 0 && (
                          <span className="ec-event-plazas" title={text("home.events.modal.attendees")}>
                            👥 {ev.asistentes} asistente{ev.asistentes !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                      <span className="ec-event-ver-mas">{text("home.events.more")}</span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>

      {modalEvento && (
        <EventoModal                                                                                                    
            ev={modalEvento}
            onClose={() => setModalEvento(null)}                                                                          
            onUpdated={updated => { setModalEvento(updated); refresh() }}                                                 
            text={text}
          />
      )}
    </section>
  )
}
