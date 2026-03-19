import { useState, useMemo } from "react";
import "./calendar.scss"

interface Event
{
    id: string
    title: string
    date: Date
    category: string 
    color: "blue" | "pink" | "yellow"
}

const events: Event[] = [
    { id: "1", title: "Magic", date: new Date(2026, 1, 7), category: "cartas", color: "pink"},
    { id: "2", title: "Rol", date: new Date(2026, 1, 8), category: "rol", color: "blue"},
    { id: "3", title: "Mesa", date: new Date(2026, 1, 9), category: "mesa", color: "yellow"},
]

const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sab", "Dom"]
const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]

export const CalendarSection = () => {
    const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 1))
    const [selectedDay, setSelectedDay] = useState<number | null>(null)

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const days = useMemo(() => {
        const firstDay = new Date(year, month, 1)
        const start = (firstDay.getDay() + 6) % 7
        const total = new Date(year, month + 1, 0).getDate()

        const arr = []

        for (let i = 0; i < start; i++) arr.push(null)
            for (let d = 1; d <= total; d++) arr.push(d)

                return arr
    }, [year, month])

    const getEvents = (day: number) => events.filter(e => e.date.getDate() === day && e.date.getMonth() === month)

    return(
        <section className="calendar">
            <h2 className="calendar-title">
                <span>Calendario</span> de Eventos
            </h2>

            <div className="calendar-content">
                <div className="calendar-box">
                    <div className="calendar-header">
                        <button onClick={() => setCurrentDate(new Date(year, month -1, 1))}>{"<"}</button>
                        <h3>{MONTHS[month]} {year}</h3>
                        <button onClick={() => setCurrentDate(new Date(year, month +1, 1))}>{">"}</button>
                    </div>

                    <div className="calendar-grid">
                        {DAYS.map(d => <span key={d}>{d}</span>)}
                    </div>

                    <div className="calendar-days">
                        {days.map((day, i) => (
                            <div
                                key={i}
                                className={`day ${selectedDay === day ? "activo" : ""}`}
                                onClick={() => day && setSelectedDay(day)}>
                                    {day}
                                    {day && getEvents(day).length > 0 && (
                                        <div className="dot"/>
                                    )}
                                </div>
                        ))}
                    </div>
                </div>

                <div className="calendar-events">
                    {selectedDay ? (
                        getEvents(selectedDay).map(e => (
                            <div key={e.id} className={`event $(e.color)`}>
                                <h4>{e.title}</h4>
                                <span>{e.category}</span>
                            </div>
                        ))
                    ): (
                        <div className="no-events">Selecciona un día</div>
                    )}
                </div>
            </div>
        </section>
    )
}