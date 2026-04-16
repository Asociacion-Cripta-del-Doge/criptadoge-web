export type CategoriaEvento = "cartas" | "rol" | "mesa";

export interface Evento {
  id: number;
  titulo: string;
  descripcion: string;
  fecha: string; 
  hora: string;  
  lugar: string;
  categoria: CategoriaEvento;
  plazas?: number;
  plazasOcupadas?: number;
}

export const EVENTOS_MOCK: Evento[] = [
  {
    id: 1,
    titulo: "Torneo de Magic: The Gathering",
    descripcion: "Torneo formato Commander con premios para los 3 primeros",
    fecha: "2026-03-07",
    hora: "17:00",
    lugar: "Sala Principal",
    categoria: "cartas",
    plazas: 16,
    plazasOcupadas: 12,
  },
  {
    id: 2,
    titulo: "Campaña de D&D: La Cripta Olvidada",
    descripcion: "Sesión semanal de Dungeons & Dragons, capítulo 4",
    fecha: "2026-03-08",
    hora: "16:00",
    lugar: "Sala de Rol",
    categoria: "rol",
    plazas: 6,
    plazasOcupadas: 6,
  },
  {
    id: 3,
    titulo: "Tarde de Catan",
    descripcion: "Partidas abiertas de Catan y expansiones. ¡Ven y aprende!",
    fecha: "2026-03-08",
    hora: "18:30",
    lugar: "Sala Principal",
    categoria: "mesa",
    plazas: 20,
    plazasOcupadas: 8,
  },
  {
    id: 4,
    titulo: "Torneo Pokémon TCG",
    descripcion: "Formato Estándar. Trae tu mazo y compite por el título",
    fecha: "2026-03-09",
    hora: "11:00",
    lugar: "Sala Principal",
    categoria: "cartas",
    plazas: 32,
    plazasOcupadas: 20,
  },
  {
    id: 5,
    titulo: "One Shot de Vampiro: La Mascarada",
    descripcion: "Historia autoconclusiva ambientada en Madrid nocturno",
    fecha: "2026-03-14",
    hora: "17:00",
    lugar: "Sala de Rol",
    categoria: "rol",
    plazas: 5,
    plazasOcupadas: 3,
  },
  {
    id: 6,
    titulo: "Noche de Eurogames",
    descripcion: "Partidas a Wingspan, Brass Birmingham y Terraforming Mars",
    fecha: "2026-03-14",
    hora: "19:00",
    lugar: "Sala Principal",
    categoria: "mesa",
    plazas: 16,
    plazasOcupadas: 10,
  },
  {
    id: 7,
    titulo: "Draft de Magic: Dominaria",
    descripcion: "Draft de booster con sobre de regalo para participantes",
    fecha: "2026-03-15",
    hora: "16:30",
    lugar: "Sala Principal",
    categoria: "cartas",
    plazas: 8,
    plazasOcupadas: 5,
  },
  {
    id: 8,
    titulo: "Warhammer 40K: Batallas Abiertas",
    descripcion: "Jornada de batallas 1v1 con ejércitos de la asociación disponibles",
    fecha: "2026-03-21",
    hora: "10:00",
    lugar: "Sala Grande",
    categoria: "mesa",
    plazas: 12,
    plazasOcupadas: 7,
  },
  {
    id: 9,
    titulo: "Rolemaster: Inicio de Campaña",
    descripcion: "Sesión de introducción y creación de personajes",
    fecha: "2026-03-22",
    hora: "17:00",
    lugar: "Sala de Rol",
    categoria: "rol",
    plazas: 6,
    plazasOcupadas: 2,
  },
];
