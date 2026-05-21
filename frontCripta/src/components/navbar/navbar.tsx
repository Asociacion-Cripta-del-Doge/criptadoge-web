import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import "./navbar.scss"
import logo from "../../assets/logo.png"
import { useAuth } from "../../context/AuthContext"
import { useWebTexts } from "../../hooks/useWebTexts"
import { ProfileModal } from "../profile/ProfileModal"
import { PackReveal } from "../packReveal/PackReveal"
import { CardAlbum, type CardAlbumHandle } from "../cardAlbum/CardAlbum"

export const Navbar = () => {
  const [scrolled, setScrolled]           = useState(false)
  const [showProfile, setShowProfile]     = useState(false)
  const [showPackReveal, setShowPackReveal] = useState(false)
  const [showAlbum, setShowAlbum]         = useState(false)
  const albumRef = useRef<CardAlbumHandle>(null)
  const { user, loading } = useAuth()

  /* Cuando PackReveal revela una carta, la manda al álbum */
  const handleCardRevealed = (cardId: number) => {
    albumRef.current?.addCard(cardId)
  }
  const text = useWebTexts("nav")

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const isMember = user?.status === "Activo"

  return (
    <>
      <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
        <div className="navbar-container">
          <div className="navbar-left">
            <img src={logo} alt={text("nav.logoAlt")} />
            <span className="brand-text"> {text("nav.brand")} </span>
            <button
              className="btn-pack"
              onClick={() => setShowPackReveal(true)}
              aria-label="Abrir sobre"
            >
              🃏 Mis Sobres
            </button>
            <button
              className="btn-album"
              onClick={() => setShowAlbum(true)}
              aria-label="Ver álbum"
            >
              📖 Colección
            </button>
          </div>
          <ul className="navbar-links">
            <li><a href="/#inicio">{text("nav.links.home")}</a></li>
            <li><a href="/#eventos">{text("nav.links.events")}</a></li>
            <li><a href="/reservas">{text("nav.links.booking")}</a></li>
            <li><a href="/#galeria">{text("nav.links.gallery")}</a></li>
            <li><a href="/#ubicacion">{text("nav.links.location")}</a></li>
            <li><a href="/#patrocinadores">{text("nav.links.sponsors")}</a></li>
            <li><a href="/#contacto">{text("nav.links.contact")}</a></li>
          </ul>
          <div className="navbar-buttons">
            {!loading && (
              user ? (
                <button
                  key={user.name}
                  className="btn-outline navbar-profile-btn"
                  onClick={() => setShowProfile(true)}
                >
                  {user.avatar && (
                    <img src={user.avatar} alt={user.name} className="navbar-avatar" />
                  )}
                  {user.name.split(" ")[0]}
                  {isMember && (
                    <svg className="navbar-member-badge" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                      <rect x="6" y="0" width="4" height="2" fill="#ff2e9a"/>
                      <rect x="4" y="2" width="2" height="2" fill="#ff2e9a"/>
                      <rect x="10" y="2" width="2" height="2" fill="#ff2e9a"/>
                      <rect x="2" y="4" width="2" height="2" fill="#ff2e9a"/>
                      <rect x="12" y="4" width="2" height="2" fill="#ff2e9a"/>
                      <rect x="0" y="6" width="2" height="2" fill="#ff2e9a"/>
                      <rect x="14" y="6" width="2" height="2" fill="#ff2e9a"/>
                      <rect x="0" y="8" width="16" height="2" fill="#ff2e9a"/>
                      <rect x="2" y="10" width="12" height="2" fill="#ff2e9a"/>
                      <rect x="4" y="12" width="8" height="2" fill="#ff2e9a"/>
                      <rect x="6" y="14" width="4" height="2" fill="#ff2e9a"/>
                    </svg>
                  )}
                </button>
              ) : (
                <a href="/login" className="btn-outline">{text("nav.login")}</a>
              )
            )}
            {!isMember && (
              <a href="/#membresia" className="btn-pink">{text("nav.membership")}</a>
            )}
          </div>
        </div>
      </nav>

      {showProfile && createPortal(
        <ProfileModal onClose={() => setShowProfile(false)} />,
        document.body
      )}

      {showPackReveal && createPortal(
        <PackReveal
          onClose={() => setShowPackReveal(false)}
          onCardRevealed={handleCardRevealed}
        />,
        document.body
      )}

      {showAlbum && createPortal(
        <CardAlbum ref={albumRef} onClose={() => setShowAlbum(false)} />,
        document.body
      )}
    </>
  )
}
