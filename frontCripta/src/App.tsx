import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
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
import type { HuecoReserva, Mesa, ReservaMesa } from "./services/reservasService";
import logo from "./assets/logo.png";

const BOOKING_PAID_NOTE =
  "En mesas de pago, la primera hora es gratis para socios activos y el resto se calcula automaticamente.";
const ACTIVE_USER_STATUS = "Activo";
const CANCELLABLE_RESERVATION_STATES = ["PENDIENTE", "CONFIRMADA"];

const getToday = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

const parseLocalDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const toLocalDateValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatCalendarTitle = (date: Date) =>
  new Intl.DateTimeFormat("es-ES", {
    month: "long",
    year: "numeric",
  }).format(date);

const formatSelectedDate = (value: string) =>
  new Intl.DateTimeFormat("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(parseLocalDate(value));

const formatReservationDateTime = (value: string) =>
  new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

const buildCalendarDays = (visibleMonth: Date) => {
  const firstDay = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth(),
    1,
  );
  const calendarStart = new Date(firstDay);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  calendarStart.setDate(firstDay.getDate() - mondayOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(calendarStart);
    day.setDate(calendarStart.getDate() + index);
    return day;
  });
};

function App() {
  const path = window.location.pathname;
  const { user, loading } = useAuth();
  const text = useWebTexts("booking");
  const heroText = useWebTexts("home.hero");
  const [fecha, setFecha] = useState(getToday);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => parseLocalDate(getToday()));
  const [duracionMinutos, setDuracionMinutos] = useState(60);
  const [asientosReservados, setAsientosReservados] = useState(2);
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [slots, setSlots] = useState<HuecoReserva[]>([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [selectedMesaId, setSelectedMesaId] = useState<string | null>(null);
  const [ownReservations, setOwnReservations] = useState<ReservaMesa[]>([]);
  const [ownReservationsLoading, setOwnReservationsLoading] = useState(false);
  const [cancelingReservationId, setCancelingReservationId] = useState<
    string | null
  >(null);
  const [fetching, setFetching] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);

  const selectedSlot = slots[slotIndex];
  const today = getToday();
  const calendarDays = buildCalendarDays(visibleMonth);
  const currentMonth = parseLocalDate(today);
  currentMonth.setDate(1);
  const canGoToPreviousMonth = visibleMonth > currentMonth;

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
  const sortedOwnReservations = [...ownReservations].sort(
    (left, right) =>
      new Date(right.fechaHoraInicio).getTime() -
      new Date(left.fechaHoraInicio).getTime(),
  );

  const getUnavailableMesaReason = (mesa: Mesa) => {
    if (mesa.disponible) {
      return "";
    }

    if (!user) {
      return "Inicia sesion para ver huecos disponibles y reservar.";
    }

    if (mesa.esDePago && user.status !== ACTIVE_USER_STATUS) {
      return "Las mesas de pago solo estan disponibles para socios activos.";
    }

    if (!selectedSlot) {
      return "No hay franjas disponibles para la fecha, duracion y huecos seleccionados.";
    }

    const asientosDisponibles = mesa.asientosDisponibles ?? 0;

    if (asientosDisponibles > 0) {
      return `Solo quedan ${asientosDisponibles} huecos libres en esta franja.`;
    }

    return "Esta mesa no tiene huecos libres en la franja seleccionada.";
  };

  const handleSelectDate = (dateValue: string) => {
    if (dateValue < today) {
      return;
    }

    setFecha(dateValue);
    setCalendarOpen(false);
    setSelectedMesaId(null);
  };

  const moveVisibleMonth = (direction: number) => {
    setVisibleMonth((current) => {
      const next = new Date(current);
      next.setMonth(current.getMonth() + direction, 1);
      return next < currentMonth ? currentMonth : next;
    });
  };

  const refreshOwnReservations = async () => {
    if (!user) {
      setOwnReservations([]);
      return;
    }

    setOwnReservationsLoading(true);

    try {
      const reservas = await reservasService.getMisReservas();
      setOwnReservations(reservas);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : text("booking.toast.error"),
      );
    } finally {
      setOwnReservationsLoading(false);
    }
  };

  const refreshSlots = async () => {
    const huecosData = await reservasService.getHuecos({
      fecha,
      asientosReservados,
      duracionMinutos,
    });
    setSlots(huecosData.slots);
    setSlotIndex(0);
  };

  const handleCancelReservation = async (reservaId: string) => {
    setCancelingReservationId(reservaId);

    try {
      await reservasService.cancelReserva(reservaId);
      toast.success(text("booking.toast.cancelled"));
      await refreshOwnReservations();

      if (user) {
        await refreshSlots();
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : text("booking.toast.error"),
      );
    } finally {
      setCancelingReservationId(null);
    }
  };

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
          setOwnReservations([]);
          return;
        }

        const [huecosData, reservasData] = await Promise.all([
          reservasService.getHuecos({
            fecha,
            asientosReservados,
            duracionMinutos,
          }),
          reservasService.getMisReservas(),
        ]);

        setSlots(huecosData.slots);
        setOwnReservations(reservasData);
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
      await refreshSlots();
      await refreshOwnReservations();
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
        <label className="booking-date-control">
          {text("booking.controls.date")}
          <button
            type="button"
            className="booking-date-trigger"
            onClick={() => setCalendarOpen((isOpen) => !isOpen)}
            aria-expanded={calendarOpen}
          >
            {formatSelectedDate(fecha)}
          </button>

          {calendarOpen && (
            <div
              className="booking-calendar"
              role="dialog"
              aria-label="Calendario de reservas"
            >
              <div className="booking-calendar__header">
                <button
                  type="button"
                  onClick={() => moveVisibleMonth(-1)}
                  disabled={!canGoToPreviousMonth}
                  aria-label="Mes anterior"
                >
                  ‹
                </button>
                <strong>{formatCalendarTitle(visibleMonth)}</strong>
                <button
                  type="button"
                  onClick={() => moveVisibleMonth(1)}
                  aria-label="Mes siguiente"
                >
                  ›
                </button>
              </div>

              <div className="booking-calendar__weekdays" aria-hidden="true">
                {["L", "M", "X", "J", "V", "S", "D"].map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>

              <div className="booking-calendar__grid">
                {calendarDays.map((day) => {
                  const dateValue = toLocalDateValue(day);
                  const isPast = dateValue < today;
                  const isOutsideMonth =
                    day.getMonth() !== visibleMonth.getMonth();
                  const isSelected = dateValue === fecha;

                  return (
                    <button
                      type="button"
                      key={dateValue}
                      className={[
                        "booking-calendar__day",
                        isPast ? "is-past" : "",
                        isOutsideMonth ? "is-outside-month" : "",
                        isSelected ? "is-selected" : "",
                      ].join(" ")}
                      onClick={() => handleSelectDate(dateValue)}
                      disabled={isPast}
                      aria-label={new Intl.DateTimeFormat("es-ES", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }).format(day)}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
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
            {mesasConDisponibilidad.map((mesa) => {
              const unavailableReason = getUnavailableMesaReason(mesa);
              const isLargeTable = mesa.asientos > 8;
              const seatColumns = Math.max(4, Math.ceil(mesa.asientos / 2));

              return (
                <div
                  key={mesa.id}
                  className={[
                    "room-table-tooltip",
                    isLargeTable ? "is-large-table" : "",
                  ].join(" ")}
                  data-tooltip={unavailableReason}
                  title={unavailableReason}
                >
                  <button
                    type="button"
                    className={[
                      "room-table",
                      mesa.esDePago ? "is-paid" : "is-free",
                      mesa.disponible ? "is-available" : "is-unavailable",
                      selectedMesaId === mesa.id ? "is-selected" : "",
                      isLargeTable ? "is-large-table" : "",
                    ].join(" ")}
                    style={
                      {
                        "--seat-columns": seatColumns,
                      } as CSSProperties
                    }
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
                          index <
                            (mesa.asientosOcupados ?? 0) + asientosReservados;

                        return (
                          <span
                            key={`${mesa.id}-seat-${index}`}
                            className={[
                              "seat-dot",
                              index < seatColumns
                                ? "is-top-seat"
                                : "is-bottom-seat",
                              occupied ? "is-occupied" : "",
                              selected ? "is-picked" : "",
                            ].join(" ")}
                          />
                        );
                      })}
                    </span>
                  </button>
                </div>
              );
            })}
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

          {user && (
            <details className="own-reservations">
              <summary>
                <span>{text("booking.own.title")}</span>
                <small>{sortedOwnReservations.length}</small>
              </summary>

              {ownReservationsLoading ? (
                <p>{text("booking.own.loading")}</p>
              ) : sortedOwnReservations.length === 0 ? (
                <p>{text("booking.own.empty")}</p>
              ) : (
                <ul>
                  {sortedOwnReservations.map((reserva) => {
                    const canCancel = CANCELLABLE_RESERVATION_STATES.includes(
                      reserva.estado,
                    );
                    const isCanceling = cancelingReservationId === reserva.id;
                    const precio = Number(reserva.precio);

                    return (
                      <li key={reserva.id}>
                        <div>
                          <strong>
                            {text("booking.table.prefix")} {reserva.mesa.orden}
                          </strong>
                          <span>
                            {formatReservationDateTime(reserva.fechaHoraInicio)} -{" "}
                            {formatReservationDateTime(reserva.fechaHoraFin)}
                          </span>
                          <small>
                            {reserva.asientosReservados}{" "}
                            {text("booking.own.seats")} · {reserva.estado} ·{" "}
                            {precio > 0
                              ? `${precio.toFixed(2)} €`
                              : text("booking.own.free")}
                          </small>
                        </div>

                        {canCancel && (
                          <button
                            type="button"
                            onClick={() => handleCancelReservation(reserva.id)}
                            disabled={Boolean(cancelingReservationId)}
                          >
                            {isCanceling
                              ? text("booking.own.canceling")
                              : text("booking.own.cancel")}
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </details>
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
