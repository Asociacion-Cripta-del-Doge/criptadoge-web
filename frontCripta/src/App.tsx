import { useEffect, useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import "./App.scss";
import Login from "./components/login/login";
import { useAuth } from "./context/AuthContext";
import { useWebTexts } from "./hooks/useWebTexts";
import { reservasService } from "./services/reservasService";
import type { HuecoReserva, Mesa } from "./services/reservasService";
import logo from "./assets/logo.png";

const demoMesas: Mesa[] = [
  { id: "demo-1", orden: 1, asientos: 4, esDePago: false },
  { id: "demo-2", orden: 2, asientos: 4, esDePago: false },
  { id: "demo-3", orden: 3, asientos: 4, esDePago: false },
  { id: "demo-4", orden: 4, asientos: 4, esDePago: true },
  { id: "demo-5", orden: 5, asientos: 4, esDePago: true },
  { id: "demo-6", orden: 6, asientos: 6, esDePago: true },
];

const getToday = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

const buildDemoSlot = (
  mesas: Mesa[],
  asientosReservados: number,
  fecha: string,
): HuecoReserva => {
  const demoAvailability = mesas.map((mesa, index) => {
    const occupiedPattern = [0, 2, 0, 2, 4, 2][index] ?? 0;
    const asientosOcupados = Math.min(occupiedPattern, mesa.asientos);
    const asientosDisponibles = mesa.asientos - asientosOcupados;

    return {
      ...mesa,
      asientosOcupados,
      asientosDisponibles,
      disponible: asientosDisponibles >= asientosReservados,
    };
  });

  return {
    fechaHoraInicio: `${fecha}T18:00:00.000Z`,
    fechaHoraFin: `${fecha}T19:00:00.000Z`,
    horaInicio: "18:00",
    horaFin: "19:00",
    asientosSolicitados: asientosReservados,
    asientosDisponiblesTotales: demoAvailability.reduce(
      (total, mesa) => total + (mesa.asientosDisponibles ?? 0),
      0,
    ),
    mesasDisponibles: demoAvailability.filter((mesa) => mesa.disponible),
  };
};

function App() {
  const path = window.location.pathname;
  const { user, loading, logout } = useAuth();
  const text = useWebTexts("booking");
  const [fecha, setFecha] = useState(getToday);
  const [duracionMinutos, setDuracionMinutos] = useState(60);
  const [asientosReservados, setAsientosReservados] = useState(2);
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [slots, setSlots] = useState<HuecoReserva[]>([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [selectedMesaId, setSelectedMesaId] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
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
    if (!user) {
      const fallbackSlot = buildDemoSlot(
        demoMesas,
        asientosReservados,
        fecha,
      );

      setMesas(demoMesas);
      setSlots([fallbackSlot]);
      setSlotIndex(0);
      setSelectedMesaId(null);
      setDemoMode(true);
      return;
    }

    const load = async () => {
      setFetching(true);
      setSelectedMesaId(null);

      try {
        const [mesasData, huecosData] = await Promise.all([
          reservasService.getMesas(),
          reservasService.getHuecos({
            fecha,
            asientosReservados,
            duracionMinutos,
          }),
        ]);

        setMesas(mesasData);
        setSlots(huecosData.slots);
        setSlotIndex(0);
        setDemoMode(false);
      } catch {
        const fallbackSlot = buildDemoSlot(
          demoMesas,
          asientosReservados,
          fecha,
        );

        setMesas(demoMesas);
        setSlots([fallbackSlot]);
        setSlotIndex(0);
        setDemoMode(true);
      } finally {
        setFetching(false);
      }
    };

    load();
  }, [asientosReservados, duracionMinutos, fecha, user]);

  const handleReserve = async () => {
    if (!selectedMesa || !selectedSlot) {
      return;
    }

    if (!user) {
      window.location.href = "/login";
      return;
    }

    if (demoMode) {
      toast(text("booking.toast.demo"));
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

  return (
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

        <div className="booking-user">
          <span>{user?.name ?? text("booking.user.guest")}</span>
          <small>
            {user
              ? user.role === "ADMIN"
                ? text("booking.user.admin")
                : user.status
              : text("booking.user.preview")}
          </small>
          {user ? (
            <button type="button" onClick={logout}>
              {text("booking.user.logout")}
            </button>
          ) : (
            <button type="button" onClick={() => (window.location.href = "/login")}>
              {text("booking.user.login")}
            </button>
          )}
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

      {demoMode && (
        <p className="booking-notice">{text("booking.demoNotice")}</p>
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
                {text("booking.panel.copyPrefix")} {asientosReservados}{" "}
                {text("booking.panel.copySuffix")}
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
}

export default App;
