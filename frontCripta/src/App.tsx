import { useEffect, useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import "./App.scss";
import Login from "./components/login/login";
import { Navbar } from "./components/navbar/navbar";
import { Footer } from "./components/footer/footer";
import { EventCalendar } from "./components/EventCalendar/EventCalendar";
import { ContactoSection } from "./components/contact/contacto";
import { UbicacionSection } from "./components/ubicacion/Ubicacion";
import AboutUs from "./components/aboutUs/aboutUs";
import SectionDivider from "./components/sectionDivider/SectionDivider";
import { HeroCarousel } from "./components/heroCarousel/HeroCarousel";
import MembershipSection from "./components/membershipSection/MembershipSection";
import { PatrocinadoresSection } from "./components/patrocinadores/patrocinadores";
import { useAuth } from "./context/AuthContext";
import { useWebTexts } from "./hooks/useWebTexts";
import { reservasService } from "./services/reservasService";
import type { HuecoReserva, Mesa } from "./services/reservasService";
import logo from "./assets/logo.png";

const BOOKING_PAID_NOTE =
  "En mesas de pago, la primera hora es gratis para socios activos y el resto se calcula automaticamente.";

const getToday = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

function App() {
  const path = window.location.pathname;
  const { user, loading } = useAuth();
  const text = useWebTexts("booking");
  const heroText = useWebTexts("home.hero");
  const [fecha, setFecha] = useState(getToday);
  const [duracionMinutos, setDuracionMinutos] = useState(60);
  const [asientosReservados, setAsientosReservados] = useState(2);
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [slots, setSlots] = useState<HuecoReserva[]>([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [selectedMesaId, setSelectedMesaId] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);

  const selectedSlot = slots[slotIndex];

  const mesasConDisponibilidad = useMemo(() => {
    const disponibilidad = new Map(
      selectedSlot?.mesasDisponibles.map((mesa) => [mesa.id, mesa]) ?? [],
    );

    return mesas.map((mesa) => {
      const disponible = disponibilidad.get(mesa.id);

      return {
        ...mesa,
        asientosOcupados:
          disponible?.asientosOcupados ?? (selectedSlot ? mesa.asientos : 0),
        asientosDisponibles:
          disponible?.asientosDisponibles ?? (selectedSlot ? 0 : mesa.asientos),
        disponible: Boolean(disponible),
      };
    });
  }, [mesas, selectedSlot]);

  const selectedMesa = mesasConDisponibilidad.find(
    (mesa) => mesa.id === selectedMesaId,
  );

  useEffect(() => {
    const load = async () => {
      setFetching(true);
      setSelectedMesaId(null);
      setBookingError(null);

      try {
        const mesasData = await reservasService.getMesas();
        setMesas(mesasData);

        if (!user) {
          setSlots([]);
          setSlotIndex(0);
          return;
        }

        const huecosData = await reservasService.getHuecos({
            fecha,
            asientosReservados,
            duracionMinutos,
        });

        setSlots(huecosData.slots);
        setSlotIndex(0);
      } catch (error) {
        setSlots([]);
        setSlotIndex(0);
        setBookingError(
          error instanceof Error ? error.message : text("booking.toast.error"),
        );
      } finally {
        setFetching(false);
      }
    };

    load();
  }, [asientosReservados, duracionMinutos, fecha, text, user]);

  const handleReserve = async () => {
    if (!selectedMesa || !selectedSlot) {
      return;
    }

    if (!user) {
      window.location.href = "/login";
      return;
    }

    setBooking(true);

    try {
      await reservasService.createReserva({
        mesaId: selectedMesa.id,
        fechaHoraInicio: selectedSlot.fechaHoraInicio,
        fechaHoraFin: selectedSlot.fechaHoraFin,
        asientosReservados,
      });

      toast.success(text("booking.toast.created"));
      setSelectedMesaId(null);
      const huecosData = await reservasService.getHuecos({
        fecha,
        asientosReservados,
        duracionMinutos,
      });
      setSlots(huecosData.slots);
      setSlotIndex(0);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : text("booking.toast.error"),
      );
    } finally {
      setBooking(false);
    }
  };

  if (path === "/auth/callback") {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const oauthUser = params.get("user");

    if (token && oauthUser) {
      localStorage.setItem("access_token", token);
      localStorage.setItem("user", oauthUser);
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

  if (loading) {
    return <div className="app-loading">{text("booking.loading")}</div>;
  }

  const bookingPage = (
    <main className="booking-app">
      <Toaster position="top-right" />

      <header className="booking-header">
        <div className="booking-brand">
          <img src={logo} alt={text("booking.brand")} />
          <div>
            <span>{text("booking.brand")}</span>
            <strong>{text("booking.title")}</strong>
          </div>
        </div>
      </header>

      <section className="booking-toolbar" aria-label="Filtros de reserva">
        <label>
          {text("booking.controls.date")}
          <input
            type="date"
            value={fecha}
            onChange={(event) => setFecha(event.target.value)}
          />
        </label>

        <label>
          {text("booking.controls.duration")}
          <select
            value={duracionMinutos}
            onChange={(event) => setDuracionMinutos(Number(event.target.value))}
          >
            <option value={60}>{text("booking.controls.duration.oneHour")}</option>
            <option value={120}>{text("booking.controls.duration.twoHours")}</option>
            <option value={180}>{text("booking.controls.duration.threeHours")}</option>
          </select>
        </label>

        <label>
          {text("booking.controls.seats")}
          <select
            value={asientosReservados}
            onChange={(event) =>
              setAsientosReservados(Number(event.target.value))
            }
          >
            <option value={2}>2 {text("booking.controls.seatsUnit")}</option>
            <option value={4}>4 {text("booking.controls.seatsUnit")}</option>
            <option value={6}>6 {text("booking.controls.seatsUnit")}</option>
          </select>
        </label>

        <label>
          {text("booking.controls.slot")}
          <select
            value={slotIndex}
            onChange={(event) => {
              setSlotIndex(Number(event.target.value));
              setSelectedMesaId(null);
            }}
          >
            {slots.length === 0 ? (
              <option value={0}>{text("booking.controls.noSlots")}</option>
            ) : (
              slots.map((slot, index) => (
                <option
                  key={`${slot.fechaHoraInicio}-${slot.fechaHoraFin}`}
                  value={index}
                >
                  {slot.horaInicio} - {slot.horaFin}
                </option>
              ))
            )}
          </select>
        </label>
      </section>

      {bookingError && (
        <p className="booking-notice">{bookingError}</p>
      )}

      <section className="booking-layout">
        <div className="table-map-shell">
          <div className="room-stage">{text("booking.stage")}</div>

          <div className={`table-map ${fetching ? "is-loading" : ""}`}>
            {mesasConDisponibilidad.map((mesa) => (
              <button
                type="button"
                key={mesa.id}
                className={[
                  "room-table",
                  mesa.esDePago ? "is-paid" : "is-free",
                  mesa.disponible ? "is-available" : "is-unavailable",
                  selectedMesaId === mesa.id ? "is-selected" : "",
                ].join(" ")}
                onClick={() => setSelectedMesaId(mesa.id)}
                disabled={!mesa.disponible}
                aria-label={`${text("booking.table.prefix")} ${mesa.orden}`}
              >
                <span className="table-top">
                  <strong>
                    {text("booking.table.shortPrefix")}
                    {mesa.orden}
                  </strong>
                  <small>
                    {mesa.esDePago
                      ? text("booking.table.paid")
                      : text("booking.table.free")}
                  </small>
                </span>

                <span className="table-seats">
                  {Array.from({ length: mesa.asientos }).map((_, index) => {
                    const occupied = index < (mesa.asientosOcupados ?? 0);
                    const selected =
                      selectedMesaId === mesa.id &&
                      !occupied &&
                      index < (mesa.asientosOcupados ?? 0) + asientosReservados;

                    return (
                      <span
                        key={`${mesa.id}-seat-${index}`}
                        className={[
                          "seat-dot",
                          occupied ? "is-occupied" : "",
                          selected ? "is-picked" : "",
                        ].join(" ")}
                      />
                    );
                  })}
                </span>
              </button>
            ))}
          </div>

          <div className="booking-legend" aria-label="Leyenda">
            <span>
              <i className="legend-free" /> {text("booking.legend.free")}
            </span>
            <span>
              <i className="legend-paid" /> {text("booking.legend.paid")}
            </span>
            <span>
              <i className="legend-busy" /> {text("booking.legend.busy")}
            </span>
            <span>
              <i className="legend-picked" /> {text("booking.legend.selected")}
            </span>
          </div>
        </div>

        <aside className="booking-panel">
          <span className="panel-kicker">{text("booking.panel.kicker")}</span>
          <h1>
            {selectedMesa
              ? `${text("booking.table.prefix")} ${selectedMesa.orden}`
              : text("booking.panel.emptyTitle")}
          </h1>

          {selectedMesa && selectedSlot ? (
            <>
              <dl className="panel-facts">
                <div>
                  <dt>{text("booking.panel.type")}</dt>
                  <dd>
                    {selectedMesa.esDePago
                      ? text("booking.table.paidLong")
                      : text("booking.legend.free")}
                  </dd>
                </div>
                <div>
                  <dt>{text("booking.panel.capacity")}</dt>
                  <dd>
                    {selectedMesa.asientos} {text("booking.panel.seatsWord")}
                  </dd>
                </div>
                <div>
                  <dt>{text("booking.panel.available")}</dt>
                  <dd>
                    {selectedMesa.asientosDisponibles}{" "}
                    {text("booking.panel.spacesWord")}
                  </dd>
                </div>
                <div>
                  <dt>{text("booking.panel.slot")}</dt>
                  <dd>
                    {selectedSlot.horaInicio} - {selectedSlot.horaFin}
                  </dd>
                </div>
              </dl>

              <p className="panel-copy">
                Vas a reservar {asientosReservados}{" "}
                {text("booking.panel.spacesWord")}.
                <br />
                {BOOKING_PAID_NOTE}
              </p>

              <button
                type="button"
                className="reserve-button"
                onClick={handleReserve}
                disabled={booking}
              >
                {!user
                  ? text("booking.actions.loginToReserve")
                  : booking
                    ? text("booking.actions.reserving")
                    : text("booking.actions.reserve")}
              </button>

              {user?.role === "ADMIN" && (
                <p className="admin-hint">
                  {text("booking.admin.hint")}
                </p>
              )}
            </>
          ) : (
            <p className="panel-empty">
              {text("booking.panel.empty")}
            </p>
          )}
        </aside>
      </section>
    </main>
  );

  if (path === "/reservas") {
    return (
      <>
        <Navbar />
        {bookingPage}
        <Footer />
      </>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <Navbar />

      <section id="inicio" className="hero">
        <div className="hero-left">
          <h1 className="hero-title">
            <span className="hero-highlight">
              {heroText("home.hero.titlePrefix")}
            </span>{" "}
            <br /> {heroText("home.hero.titleSuffix")}
          </h1>
          <p className="hero-subtitle">{heroText("home.hero.subtitle")}</p>
          <div className="hero-buttons">
            <a href="#membresia" className="btn-pink">
              {heroText("home.hero.primaryCta")}
            </a>
            <a href="/reservas" className="btn-outline">
              {text("booking.title")}
            </a>
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
