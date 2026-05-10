import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import "./navbar.scss"
import logo from "../../assets/logo.png"
import { useAuth } from "../../context/AuthContext"
import { useWebTexts } from "../../hooks/useWebTexts"
import { ProfileModal } from "../profile/ProfileModal"

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const { user, loading } = useAuth()
  const text = useWebTexts("nav")

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
        <div className="navbar-container">
          <div className="navbar-left">
            <img src={logo} alt="Logo" />
            <span className="brand-text"> {text("nav.brand")} </span>
          </div>
          <ul className="navbar-links">
            <li><a href="#inicio">{text("nav.links.home")}</a></li>
            <li><a href="#eventos">{text("nav.links.events")}</a></li>
            <li><a href="#galeria">{text("nav.links.gallery")}</a></li>
            <li><a href="#ubicacion">{text("nav.links.location")}</a></li>
            <li><a href="#patrocinadores">{text("nav.links.sponsors")}</a></li>
            <li><a href="#contacto">{text("nav.links.contact")}</a></li>
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
                </button>
              ) : (
                <a href="/login" className="btn-outline">{text("nav.login")}</a>
              )
            )}
            <a href="#membresia" className="btn-pink">{text("nav.membership")}</a>
          </div>
        </div>
      </nav>

      {showProfile && createPortal(
        <ProfileModal onClose={() => setShowProfile(false)} />,
        document.body
      )}
    </>
  )
}
