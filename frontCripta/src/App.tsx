import "./App.scss"
import { Navbar } from "./components/navbar/navbar"

function App() {
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
      </section>
    </>
  )
}

export default App