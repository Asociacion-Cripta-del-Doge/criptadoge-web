export interface Mesa {
  id: string;
  orden: number;
  asientos: number;
  esDePago: boolean;
  asientosOcupados?: number;
  asientosDisponibles?: number;
  disponible?: boolean;
}

export interface HuecoReserva {
  fechaHoraInicio: string;
  fechaHoraFin: string;
  horaInicio: string;
  horaFin: string;
  asientosSolicitados: number;
  asientosDisponiblesTotales: number;
  mesasDisponibles: Mesa[];
}

export interface HuecosResponse {
  fecha: string;
  soloGratis: boolean;
  horario: {
    dia: string;
    horaApertura: string;
    horaCierre: string;
    duracionFranjaMinutos: number;
  };
  slots: HuecoReserva[];
}

export interface CreateReservaPayload {
  mesaId: string;
  fechaHoraInicio: string;
  fechaHoraFin: string;
  asientosReservados: number;
}

const getToken = () => localStorage.getItem("access_token");

const authHeaders = (): Record<string, string> => {
  const token = getToken();

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

const parseResponse = async <T>(res: Response): Promise<T> => {
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || "No se ha podido completar la solicitud");
  }

  return data as T;
};

export const reservasService = {
  async getMesas() {
    const res = await fetch("/api/mesas", {
      headers: authHeaders(),
    });

    return parseResponse<Mesa[]>(res);
  },

  async getHuecos(params: {
    fecha: string;
    asientosReservados: number;
    duracionMinutos: number;
  }) {
    const query = new URLSearchParams({
      fecha: params.fecha,
      asientosReservados: String(params.asientosReservados),
      duracionMinutos: String(params.duracionMinutos),
    });

    const res = await fetch(`/api/reservas/huecos?${query.toString()}`, {
      headers: authHeaders(),
    });

    return parseResponse<HuecosResponse>(res);
  },

  async createReserva(payload: CreateReservaPayload) {
    const res = await fetch("/api/reservas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify(payload),
    });

    return parseResponse(res);
  },
};
