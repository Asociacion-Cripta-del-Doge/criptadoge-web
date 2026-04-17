import { useMemo, useState, useEffect, type CSSProperties } from "react"
import { useEvents, type Evento } from "../../hooks/useEvents"
import "./EventCalendar.scss"

// ─── helpers ────────────────────────────────────────────────────────────────

const MESES_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]

const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

const LABEL_COLORS: Record<string, string> = {
  cartas: "#ec4899",
  rol:    "#3b82f6",
  mesa:   "#eab308",
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

const val = (v?: string | number) =>
  v !== undefined && v !== null && v !== "" ? String(v) : "Vacío"

// ─── Modal ───────────────────────────────────────────────────────────────────

const EventoModal = ({ ev, onClose }: { ev: Evento; onClose: () => void }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onClose])

  return (
    <div className="ec-modal-backdrop" onClick={onClose}>
      <div className="ec-modal" onClick={e => e.stopPropagation()}>
        <button className="ec-modal-close" onClick={onClose} aria-label="Cerrar">✕</button>

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
            <dt>Descripción</dt>
            <dd>{val(ev.descripcion)}</dd>
          </div>
          <div className="ec-modal-field">
            <dt>Fecha</dt>
            <dd>{val(formatFecha(ev.fecha))}</dd>
          </div>
          <div className="ec-modal-field">
            <dt>Hora</dt>
            <dd>{val(ev.hora)}</dd>
          </div>
          <div className="ec-modal-field">
            <dt>Categoría</dt>
            <dd>{val(ev.label)}</dd>
          </div>
          <div className="ec-modal-field">
            <dt>Estado</dt>
            <dd>{val(ev.estado)}</dd>
          </div>
          <div className="ec-modal-field">
            <dt>Asistentes</dt>
            <dd>{ev.asistentes}</dd>
          </div>
        </dl>

        <button className="ec-modal-inscribirse">Inscribirse</button>
      </div>
    </div>
  )
}

// ─── componente ─────────────────────────────────────────────────────────────

export const EventCalendar = () => {
  const today = new Date()
  const [year, setYear]   = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [filterLabel, setFilterLabel] = useState<string | null>(null)
  const [modalEvento, setModalEvento] = useState<Evento | null>(null)

  const { eventos, loading, error } = useEvents()

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
          <span className="ec-title-highlight">Calendario</span> de Eventos
        </h2>
        <p className="ec-subtitle">Descubre todas las actividades que tenemos preparadas para ti</p>
      </div>

      {loading && <p className="ec-status">Cargando eventos...</p>}
      {error && <p className="ec-status ec-status--error">No se pudieron cargar los eventos.</p>}

      <div className="ec-layout">
        {/* ── Calendario ── */}
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
              const isToday    = iso === todayIso
              const isSelected = iso === selectedDate
              const isWeekend  = (idx % 7) >= 5

              return (
                <button
                  key={iso}
                  className={[
                    "ec-cal-cell",
                    isToday    && "ec-cal-cell--today",
                    isSelected && "ec-cal-cell--selected",
                    isWeekend  && "ec-cal-cell--weekend",
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

        {/* ── Panel lateral ── */}
        <div className="ec-panel">
          {!selectedDate ? (
            <div className="ec-panel-empty">
              <div className="ec-panel-empty-icon">📅</div>
              <p>Selecciona un día del calendario<br />para ver los eventos disponibles</p>
            </div>
          ) : (
            <>
              <h3 className="ec-panel-title">Eventos del {titleDate}</h3>

              {eventosDelDia.length === 0 ? (
                <div className="ec-panel-empty">
                  <div className="ec-panel-empty-icon">🎲</div>
                  <p>No hay eventos este día{filterLabel ? ` de la categoría "${filterLabel}"` : ""}</p>
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
                        <span title="Fecha">📅 {formatFecha(ev.fecha)}</span>
                        {ev.hora && <span title="Hora">🕐 {ev.hora}</span>}
                        {ev.asistentes > 0 && (
                          <span className="ec-event-plazas" title="Asistentes">
                            👥 {ev.asistentes} asistente{ev.asistentes !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                      <span className="ec-event-ver-mas">Ver más →</span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>

      {modalEvento && (
        <EventoModal ev={modalEvento} onClose={() => setModalEvento(null)} />
      )}
    </section>
  )
}
