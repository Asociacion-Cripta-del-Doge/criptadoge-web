import "./App.scss"
import { Navbar } from "./components/navbar/navbar"
import Login from "./components/login/login"
import { Footer } from "./components/footer/footer"
import { CalendarSection } from "./components/calendar/calendar"
import { ContactoSection } from "./components/contact/contacto"

function App() {
  const path = window.location.pathname

  if(path === "/login")
  {
    return <Login />
  }

  return (
    <>
      <Navbar />

      <section id="inicio" className="hero">
        <h1 className="hero-title">
          <span className="hero-highlight">Bienvenido</span> a <br/> La Cripta
        </h1>
        <p className="hero-subtitle">
          Asociación sin ánimo de lucro dedicada al ocio alternativo para jóvenes.
          Juegos de mesa, rol, videojuegos y mucho más.
        </p>

        <div className="hero-buttons">
          <a className="btn-pink">Únete al Club</a>
          <a className="btn-outline">Ver Eventos</a>
        </div>

        {/* #wip */}
        <div className="hero-carousel">
          <img src="" alt="" />
          <img src="" alt="" />
          <img src="" alt="" />
        </div>
      </section>

      <CalendarSection />

      <ContactoSection />

      <Footer />
    </>
  )
}

export default App