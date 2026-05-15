import "./patrocinadores.scss"
import { PATROCINADORES_MOCK, type Patrocinador, type TierPatrocinador } from "../../data/patrocinadores.mock"
import { useWebTexts } from "../../hooks/useWebTexts"
import type { WebTextKey } from "../../data/webTextDefaults"

const TIER_LABEL_KEY: Record<TierPatrocinador, WebTextKey> = {
  oro: "home.sponsors.tiers.gold",
  plata: "home.sponsors.tiers.silver",
  bronce: "home.sponsors.tiers.bronze",
}

const TIER_GROUP_KEY: Record<TierPatrocinador, WebTextKey> = {
  oro: "home.sponsors.group.gold",
  plata: "home.sponsors.group.silver",
  bronce: "home.sponsors.group.bronze",
}

const SPONSOR_TEXT_KEYS: Record<number, { name: WebTextKey; description: WebTextKey }> = {
  1: {
    name: "home.sponsors.mock.dragon.name",
    description: "home.sponsors.mock.dragon.description",
  },
  2: {
    name: "home.sponsors.mock.nexo.name",
    description: "home.sponsors.mock.nexo.description",
  },
  3: {
    name: "home.sponsors.mock.dungeon.name",
    description: "home.sponsors.mock.dungeon.description",
  },
  4: {
    name: "home.sponsors.mock.runica.name",
    description: "home.sponsors.mock.runica.description",
  },
  5: {
    name: "home.sponsors.mock.dado.name",
    description: "home.sponsors.mock.dado.description",
  },
  6: {
    name: "home.sponsors.mock.arcana.name",
    description: "home.sponsors.mock.arcana.description",
  },
  7: {
    name: "home.sponsors.mock.mithril.name",
    description: "home.sponsors.mock.mithril.description",
  },
  8: {
    name: "home.sponsors.mock.pixel.name",
    description: "home.sponsors.mock.pixel.description",
  },
}

const PatrocinadorCard = ({
  patrocinador,
  text,
}: {
  patrocinador: Patrocinador
  text: (key: WebTextKey) => string
}) => {
  const sponsorKeys = SPONSOR_TEXT_KEYS[patrocinador.id]
  const nombre = sponsorKeys ? text(sponsorKeys.name) : patrocinador.nombre
  const descripcion = sponsorKeys ? text(sponsorKeys.description) : patrocinador.descripcion
  const iniciales = nombre
    .split(" ")
    .slice(0, 2)
    .map(w => w[0])
    .join("")
    .toUpperCase()

  const inner = (
    <div className={`sp-card sp-card--${patrocinador.tier}`}>
      <div className="sp-card-avatar">{iniciales}</div>
      <div className="sp-card-info">
        <span className="sp-card-nombre">{nombre}</span>
        <span className="sp-card-descripcion">{descripcion}</span>
      </div>
      <span className={`sp-tier-badge sp-tier-badge--${patrocinador.tier}`}>
        {text(TIER_LABEL_KEY[patrocinador.tier])}
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
  const text = useWebTexts("home.sponsors")
  const oro = PATROCINADORES_MOCK.filter(p => p.tier === "oro")
  const plata = PATROCINADORES_MOCK.filter(p => p.tier === "plata")
  const bronce = PATROCINADORES_MOCK.filter(p => p.tier === "bronce")

  return (
    <section id="patrocinadores" className="sp-section">
      <div className="sp-header">
        <span className="sp-tag">{text("home.sponsors.badge")}</span>
        <h2 className="sp-title">{text("home.sponsors.title")}</h2>
        <p className="sp-subtitle">{text("home.sponsors.subtitle")}</p>
      </div>

      <div className="sp-tier-group">
        <div className="sp-tier-label sp-tier-label--oro">{text(TIER_GROUP_KEY.oro)}</div>
        <div className="sp-grid sp-grid--oro">
          {oro.map(p => <PatrocinadorCard key={p.id} patrocinador={p} text={text} />)}
        </div>
      </div>

      <div className="sp-tier-group">
        <div className="sp-tier-label sp-tier-label--plata">{text(TIER_GROUP_KEY.plata)}</div>
        <div className="sp-grid">
          {plata.map(p => <PatrocinadorCard key={p.id} patrocinador={p} text={text} />)}
        </div>
      </div>

      <div className="sp-tier-group">
        <div className="sp-tier-label sp-tier-label--bronce">{text(TIER_GROUP_KEY.bronce)}</div>
        <div className="sp-grid">
          {bronce.map(p => <PatrocinadorCard key={p.id} patrocinador={p} text={text} />)}
        </div>
      </div>

      <p className="sp-cta">
        {text("home.sponsors.cta")}{" "}
        <a href="#contacto">{text("home.sponsors.ctaLink")}</a>
      </p>
    </section>
  )
}
