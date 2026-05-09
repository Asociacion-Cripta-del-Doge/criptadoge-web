import "./Ubicacion.scss"
import { useWebTexts } from "../../hooks/useWebTexts"

const HORARIO = [
  { dia: "Lunes",     horas: "17:00 - 22:00" },
  { dia: "Martes",    horas: "17:00 - 22:00" },
  { dia: "Miércoles", horas: "17:00 - 22:00" },
  { dia: "Jueves",    horas: "17:00 - 22:00" },
  { dia: "Viernes",   horas: "17:00 - 00:00" },
  { dia: "Sábado",    horas: "11:00 - 00:00" },
  { dia: "Domingo",   horas: "11:00 - 20:00" },
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
              title="Ubicación La Cripta de Doge"
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
              <span className="ub-icon-clock">🕐</span> Horario
            </h3>
            <ul className="ub-horario">
              {HORARIO.map(({ dia, horas }) => (
                <li key={dia} className="ub-horario-row">
                  <span className="ub-horario-dia">{dia}</span>
                  <span className="ub-horario-horas">{horas}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="ub-card">
            <h3 className="ub-card-title">Contacto Rápido</h3>
            <ul className="ub-contacto">
              <li>
                <span className="ub-contacto-icon">📞</span>
                <a href="tel:+34 657 53 84 30">+34 657 53 84 30</a>
              </li>
              <li>
                <span className="ub-contacto-icon">✉️</span>
                <a href="mailto:info@criptadoge.club">info@criptadoge.club</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
