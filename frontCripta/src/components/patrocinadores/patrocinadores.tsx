import "./patrocinadores.scss"
import { PATROCINADORES_MOCK, type Patrocinador, type TierPatrocinador } from "../../data/patrocinadores.mock"

const TIER_LABEL: Record<TierPatrocinador, string> = {
  oro: "Oro",
  plata: "Plata",
  bronce: "Bronce",
}

const PatrocinadorCard = ({ patrocinador }: { patrocinador: Patrocinador }) => {
  const iniciales = patrocinador.nombre
    .split(" ")
    .slice(0, 2)
    .map(w => w[0])
    .join("")
    .toUpperCase()

  const inner = (
    <div className={`sp-card sp-card--${patrocinador.tier}`}>
      <div className="sp-card-avatar">{iniciales}</div>
      <div className="sp-card-info">
        <span className="sp-card-nombre">{patrocinador.nombre}</span>
        <span className="sp-card-descripcion">{patrocinador.descripcion}</span>
      </div>
      <span className={`sp-tier-badge sp-tier-badge--${patrocinador.tier}`}>
        {TIER_LABEL[patrocinador.tier]}
      </span>
    </div>
  )

  if (patrocinador.url) {
    return (
      <a href={patrocinador.url} className="sp-card-link" target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    )
  }

  return <div className="sp-card-link">{inner}</div>
}

export const PatrocinadoresSection = () => {
  const oro = PATROCINADORES_MOCK.filter(p => p.tier === "oro")
  const plata = PATROCINADORES_MOCK.filter(p => p.tier === "plata")
  const bronce = PATROCINADORES_MOCK.filter(p => p.tier === "bronce")

  return (
    <section id="patrocinadores" className="sp-section">
      <div className="sp-header">
        <span className="sp-tag">Patrocinadores</span>
        <h2 className="sp-title">
          Quienes nos <span className="sp-title-highlight">Apoyan</span>
        </h2>
        <p className="sp-subtitle">
          Gracias a estas empresas y negocios locales por hacer posible nuestra asociación.
        </p>
      </div>

      <div className="sp-tier-group">
        <div className="sp-tier-label sp-tier-label--oro">Patrocinadores Oro</div>
        <div className="sp-grid sp-grid--oro">
          {oro.map(p => <PatrocinadorCard key={p.id} patrocinador={p} />)}
        </div>
      </div>

      <div className="sp-tier-group">
        <div className="sp-tier-label sp-tier-label--plata">Patrocinadores Plata</div>
        <div className="sp-grid">
          {plata.map(p => <PatrocinadorCard key={p.id} patrocinador={p} />)}
        </div>
      </div>

      <div className="sp-tier-group">
        <div className="sp-tier-label sp-tier-label--bronce">Patrocinadores Bronce</div>
        <div className="sp-grid">
          {bronce.map(p => <PatrocinadorCard key={p.id} patrocinador={p} />)}
        </div>
      </div>

      <p className="sp-cta">
        ¿Quieres patrocinar la asociación?{" "}
        <a href="#contacto">Contáctanos</a>
      </p>
    </section>
  )
}
