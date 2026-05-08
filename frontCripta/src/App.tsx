import "./App.scss";
import { Navbar } from "./components/navbar/navbar";
import Login from "./components/login/login";
import { Footer } from "./components/footer/footer";
//import { CalendarSection } from "./components/calendar/calendar"
import { Toaster } from "react-hot-toast";
import { EventCalendar } from "./components/EventCalendar/EventCalendar";
import { ContactoSection } from "./components/contact/contacto";
import { UbicacionSection } from "./components/ubicacion/Ubicacion";
import AboutUs from "./components/aboutUs/aboutUs";
import SectionDivider from "./components/sectionDivider/SectionDivider";
import { HeroCarousel } from "./components/heroCarousel/HeroCarousel";
import MembershipSection from "./components/membershipSection/MembershipSection";
import { PatrocinadoresSection } from "./components/patrocinadores/patrocinadores";

function App() {
  const path = window.location.pathname;

  if (path === "/auth/callback") {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const user = params.get("user");

    if (token && user) {
      localStorage.setItem("access_token", token);
      localStorage.setItem("user", user);
    }
    window.location.href = "/";
  }

  if (path === "/login") {
    return (
      <>
        <Toaster position="top-right" />
        <Login />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <section id="inicio" className="hero">
        <div className="hero-left">
          <h1 className="hero-title">
            <span className="hero-highlight">Bienvenido</span> a <br /> La Cripta
          </h1>
          <p className="hero-subtitle">
            Asociación sin ánimo de lucro dedicada al ocio alternativo para
            jóvenes. Juegos de mesa, rol, videojuegos y mucho más.
          </p>
          <div className="hero-buttons">
            <a href="#membresia" className="btn-pink">Únete al Club</a>
            <a href="#eventos" className="btn-outline">Ver Eventos</a>
          </div>
        </div>
        <HeroCarousel />
      </section>

      <SectionDivider />

      <AboutUs />

      <SectionDivider />

      <MembershipSection />

      <SectionDivider />

      <section id="eventos">
        <EventCalendar />
      </section>

      <SectionDivider />

      <UbicacionSection />

      <SectionDivider />

      <PatrocinadoresSection />

      <SectionDivider />

      <ContactoSection />

      <Footer />
    </>
  );
}

export default App;
