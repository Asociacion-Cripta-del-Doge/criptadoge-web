import "./Ubicacion.scss"
import { useWebTexts } from "../../hooks/useWebTexts"
import type { WebTextKey } from "../../data/webTextDefaults"

const HORARIO: { diaKey: WebTextKey; horasKey: WebTextKey }[] = [
  { diaKey: "home.location.days.monday", horasKey: "home.location.hours.weekday" },
  { diaKey: "home.location.days.tuesday", horasKey: "home.location.hours.weekday" },
  { diaKey: "home.location.days.wednesday", horasKey: "home.location.hours.weekday" },
  { diaKey: "home.location.days.thursday", horasKey: "home.location.hours.weekday" },
  { diaKey: "home.location.days.friday", horasKey: "home.location.hours.friday" },
  { diaKey: "home.location.days.saturday", horasKey: "home.location.hours.saturday" },
  { diaKey: "home.location.days.sunday", horasKey: "home.location.hours.sunday" },
]

export const UbicacionSection = () => {
  const text = useWebTexts("home.location")

  return (
    <section id="ubicacion" className="ub-section">
      <div className="ub-header">
        <span className="ub-tag">{text("home.location.badge")}</span>
        <h2 className="ub-title">{text("home.location.title")}</h2>
        <p className="ub-subtitle">{text("home.location.subtitle")}</p>
      </div>

      <div className="ub-layout">
        <div className="ub-map-card">
          <div className="ub-map">
            <iframe
              title={text("home.location.mapTitle")}
              src="https://www.google.com/maps?q=38.6829072,-4.0973216&output=embed"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className="ub-address">
            <span className="ub-address-icon">📍</span>
            <div>
              <p className="ub-address-name">{text("home.location.addressName")}</p>
              <p className="ub-address-line">{text("home.location.addressLine1")}</p>
              <p className="ub-address-line">{text("home.location.addressLine2")}</p>
            </div>
          </div>
        </div>

        <div className="ub-info">
          <div className="ub-card">
            <h3 className="ub-card-title">
              <span className="ub-icon-clock">🕐</span> {text("home.location.scheduleTitle")}
            </h3>
            <ul className="ub-horario">
              {HORARIO.map(({ diaKey, horasKey }) => (
                <li key={diaKey} className="ub-horario-row">
                  <span className="ub-horario-dia">{text(diaKey)}</span>
                  <span className="ub-horario-horas">{text(horasKey)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="ub-card">
            <h3 className="ub-card-title">{text("home.location.quickContactTitle")}</h3>
            <ul className="ub-contacto">
              <li>
                <span className="ub-contacto-icon">📞</span>
                <a href={`tel:${text("home.location.phone")}`}>{text("home.location.phone")}</a>
              </li>
              <li>
                <span className="ub-contacto-icon">✉️</span>
                <a href={`mailto:${text("home.location.email")}`}>{text("home.location.email")}</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
