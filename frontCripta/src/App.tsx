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
import { useWebTexts } from "./hooks/useWebTexts";

function App() {
  const path = window.location.pathname;
  const text = useWebTexts("home.hero");

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
            <span className="hero-highlight">{text("home.hero.titlePrefix")}</span> <br /> {text("home.hero.titleSuffix")}
          </h1>
          <p className="hero-subtitle">{text("home.hero.subtitle")}</p>
          <div className="hero-buttons">
            <a href="#membresia" className="btn-pink">{text("home.hero.primaryCta")}</a>
            <a href="#eventos" className="btn-outline">{text("home.hero.secondaryCta")}</a>
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
