import { useEffect, useState } from "react"
import "./navbar.scss"
import logo from "../../assets/logo.png"

export const Navbar = () => {

  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {

    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)

    return () => window.removeEventListener("scroll", handleScroll)

  }, [])

  return (
    <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
      <div className="navbar-container">
        <div className="navbar-left">
          <img src={logo} alt="Logo" />
          <span className="brand-text"> LA CRIPTA DE DOGE </span>
        </div>

        <ul className="navbar-links">
          <li><a href="#inicio">Inicio</a></li>
          <li><a href="#eventos">Eventos</a></li>
          <li><a href="#galeria">Galería</a></li>
          <li><a href="#contacto">Contacto</a></li>
        </ul>

        <div className="navbar-buttons">
          <a href="/login" className="btn-outline">
            Iniciar sesión
          </a>
          <a href="/membresia" className="btn-pink">
            Membresía
          </a>
        </div>
      </div>
    </nav>
  )
}