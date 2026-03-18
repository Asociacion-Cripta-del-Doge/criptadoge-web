import { useMemo, useState, type CSSProperties } from "react"
import { EVENTOS_MOCK } from "../../data/eventos.mock"
import type { CategoriaEvento, Evento } from "../../data/eventos.mock"
import "./EventCalendar.scss"

// ─── helpers ────────────────────────────────────────────────────────────────

const MESES_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]

const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

const CATEGORIA_COLOR: Record<CategoriaEvento, string> = {
  cartas: "#ec4899",
  rol:    "#3b82f6",
  mesa:   "#eab308",
}

const CATEGORIA_LABEL: Record<CategoriaEvento, string> = {
  cartas: "Cartas",
  rol:    "Rol",
  mesa:   "Mesa",
}

function isoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

function formatFecha(isoStr: string): string {
  const [, m, d] = isoStr.split("-")
  return `${parseInt(d)} ${MESES_ES[parseInt(m) - 1].slice(0, 3).toLowerCase()}`
}

function plazasLabel(e: Evento): string | null {
  if (e.plazas == null) return null
  const libres = e.plazas - (e.plazasOcupadas ?? 0)
  if (libres === 0) return "Completo"
  return `${libres} plazas libres`
}

// ─── componente ─────────────────────────────────────────────────────────────

export const EventCalendar = () => {
  const today = new Date()
  const [year, setYear]   = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [filterCat, setFilterCat] = useState<CategoriaEvento | null>(null)

  // días del mes
  const { cells } = useMemo(() => {
    const firstDay = new Date(year, month, 1)
    // lunes = 0 … domingo = 6
    let startOffset = firstDay.getDay() - 1
    if (startOffset < 0) startOffset = 6
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const cells: (number | null)[] = [
      ...Array(startOffset).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ]
    return { cells }
  }, [year, month])

  // índice eventos por fecha
  const eventosPorFecha = useMemo(() => {
    const map: Record<string, Evento[]> = {}
    for (const ev of EVENTOS_MOCK) {
      if (!map[ev.fecha]) map[ev.fecha] = []
      map[ev.fecha].push(ev)
    }
    return map
  }, [])

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
    ? (eventosPorFecha[selectedDate] ?? []).filter(e => !filterCat || e.categoria === filterCat)
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

      <div className="ec-layout">
        {/* ── Calendario ── */}
        <div className="ec-calendar">
          <div className="ec-cal-nav">
            <button className="ec-nav-btn" onClick={prevMonth} aria-label="Mes anterior">‹</button>
            <span className="ec-cal-month">
              {MESES_ES[month]} {year}
            </span>
            <button className="ec-nav-btn" onClick={nextMonth} aria-label="Mes siguiente">›</button>
          </div>

          <div className="ec-cal-grid">
            {DIAS_SEMANA.map(d => (
              <div key={d} className="ec-cal-weekday">{d}</div>
            ))}

            {cells.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} className="ec-cal-cell ec-cal-cell--empty" />

              const iso = isoDate(year, month, day)
              const eventos = eventosPorFecha[iso] ?? []
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
                    eventos.length && "ec-cal-cell--has-events",
                  ].filter(Boolean).join(" ")}
                  onClick={() => setSelectedDate(prev => prev === iso ? null : iso)}
                  aria-label={`${day} de ${MESES_ES[month]}`}
                  aria-pressed={isSelected}
                >
                  <span className="ec-cal-day-num">{day}</span>
                  {eventos.length > 0 && (
                    <span className="ec-cal-dots">
                      {/* máximo 3 puntos, uno por categoría presente */}
                      {[...new Set(eventos.map(e => e.categoria))].slice(0, 3).map(cat => (
                        <span
                          key={cat}
                          className="ec-cal-dot"
                          style={{ background: CATEGORIA_COLOR[cat] }}
                        />
                      ))}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* leyenda */}
          <div className="ec-legend">
            {(["cartas", "rol", "mesa"] as CategoriaEvento[]).map(cat => (
              <button
                key={cat}
                className={`ec-legend-item ${filterCat === cat ? "ec-legend-item--active" : ""}`}
                onClick={() => setFilterCat(prev => prev === cat ? null : cat)}
                style={{ "--dot-color": CATEGORIA_COLOR[cat] } as CSSProperties}
              >
                <span className="ec-legend-dot" />
                {CATEGORIA_LABEL[cat]}
              </button>
            ))}
          </div>
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
                  <p>No hay eventos este día{filterCat ? ` de la categoría "${CATEGORIA_LABEL[filterCat]}"` : ""}</p>
                </div>
              ) : (
                <ul className="ec-events-list">
                  {eventosDelDia.map(ev => {
                    const libre = plazasLabel(ev)
                    const completo = libre === "Completo"
                    return (
                      <li key={ev.id} className="ec-event-card">
                        <div className="ec-event-card-top">
                          <span className="ec-event-title">{ev.titulo}</span>
                          <span
                            className="ec-event-badge"
                            style={{ background: CATEGORIA_COLOR[ev.categoria] }}
                          >
                            {CATEGORIA_LABEL[ev.categoria]}
                          </span>
                        </div>
                        <p className="ec-event-desc">{ev.descripcion}</p>
                        <div className="ec-event-meta">
                          <span title="Fecha">📅 {formatFecha(ev.fecha)}</span>
                          <span title="Hora">🕐 {ev.hora}</span>
                          <span title="Lugar">📍 {ev.lugar}</span>
                          {libre && (
                            <span
                              className={`ec-event-plazas ${completo ? "ec-event-plazas--full" : ""}`}
                              title="Plazas"
                            >
                              {completo ? "🔴" : "🟢"} {libre}
                            </span>
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  )
}
