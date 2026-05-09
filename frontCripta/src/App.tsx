import { useEffect, useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import "./App.scss";
import Login from "./components/login/login";
import { useAuth } from "./context/AuthContext";
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
      toast("Modo demo: conecta el backend de reservas para guardar.");
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

      toast.success("Reserva creada");
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
        error instanceof Error ? error.message : "No se ha podido reservar",
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
    return <div className="app-loading">Preparando la sala...</div>;
  }

  return (
    <main className="booking-app">
      <Toaster position="top-right" />

      <header className="booking-header">
        <div className="booking-brand">
          <img src={logo} alt="La Cripta de Doge" />
          <div>
            <span>La Cripta de Doge</span>
            <strong>Reservas de mesas</strong>
          </div>
        </div>

        <div className="booking-user">
          <span>{user?.name ?? "Invitado"}</span>
          <small>
            {user ? (user.role === "ADMIN" ? "Admin" : user.status) : "Vista previa"}
          </small>
          {user ? (
            <button type="button" onClick={logout}>
              Salir
            </button>
          ) : (
            <button type="button" onClick={() => (window.location.href = "/login")}>
              Entrar
            </button>
          )}
        </div>
      </header>

      <section className="booking-toolbar" aria-label="Filtros de reserva">
        <label>
          Fecha
          <input
            type="date"
            value={fecha}
            onChange={(event) => setFecha(event.target.value)}
          />
        </label>

        <label>
          Duracion
          <select
            value={duracionMinutos}
            onChange={(event) => setDuracionMinutos(Number(event.target.value))}
          >
            <option value={60}>1 hora</option>
            <option value={120}>2 horas</option>
            <option value={180}>3 horas</option>
          </select>
        </label>

        <label>
          Huecos
          <select
            value={asientosReservados}
            onChange={(event) =>
              setAsientosReservados(Number(event.target.value))
            }
          >
            <option value={2}>2 asientos</option>
            <option value={4}>4 asientos</option>
            <option value={6}>6 asientos</option>
          </select>
        </label>

        <label>
          Franja
          <select
            value={slotIndex}
            onChange={(event) => {
              setSlotIndex(Number(event.target.value));
              setSelectedMesaId(null);
            }}
          >
            {slots.length === 0 ? (
              <option value={0}>Sin huecos</option>
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
        <p className="booking-notice">
          Vista demo activa. Cuando el backend de mesas responda, el plano usara
          disponibilidad real.
        </p>
      )}

      <section className="booking-layout">
        <div className="table-map-shell">
          <div className="room-stage">Mostrador</div>

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
                aria-label={`Mesa ${mesa.orden}`}
              >
                <span className="table-top">
                  <strong>M{mesa.orden}</strong>
                  <small>{mesa.esDePago ? "Pago" : "Gratis"}</small>
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
              <i className="legend-free" /> Gratuita
            </span>
            <span>
              <i className="legend-paid" /> De pago
            </span>
            <span>
              <i className="legend-busy" /> Ocupado
            </span>
            <span>
              <i className="legend-picked" /> Seleccionado
            </span>
          </div>
        </div>

        <aside className="booking-panel">
          <span className="panel-kicker">Seleccion actual</span>
          <h1>{selectedMesa ? `Mesa ${selectedMesa.orden}` : "Elige una mesa"}</h1>

          {selectedMesa && selectedSlot ? (
            <>
              <dl className="panel-facts">
                <div>
                  <dt>Tipo</dt>
                  <dd>{selectedMesa.esDePago ? "De pago" : "Gratuita"}</dd>
                </div>
                <div>
                  <dt>Capacidad</dt>
                  <dd>{selectedMesa.asientos} asientos</dd>
                </div>
                <div>
                  <dt>Libres</dt>
                  <dd>{selectedMesa.asientosDisponibles} huecos</dd>
                </div>
                <div>
                  <dt>Franja</dt>
                  <dd>
                    {selectedSlot.horaInicio} - {selectedSlot.horaFin}
                  </dd>
                </div>
              </dl>

              <p className="panel-copy">
                Reservaras {asientosReservados} huecos. Si la mesa es de pago,
                el backend aplicara la primera hora gratis a socios activos y
                calculara el precio proporcional.
              </p>

              <button
                type="button"
                className="reserve-button"
                onClick={handleReserve}
                disabled={booking}
              >
                {!user
                  ? "Inicia sesion para reservar"
                  : booking
                    ? "Reservando..."
                    : "Reservar huecos"}
              </button>

              {user?.role === "ADMIN" && (
                <p className="admin-hint">
                  Modo admin: la edicion de mesas puede abrirse desde este panel
                  usando los endpoints `/api/mesas`.
                </p>
              )}
            </>
          ) : (
            <p className="panel-empty">
              Selecciona fecha, franja y una mesa disponible para ver el detalle
              de la reserva.
            </p>
          )}
        </aside>
      </section>
    </main>
  );
}

export default App;
