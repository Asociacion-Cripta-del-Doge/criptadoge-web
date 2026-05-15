export type TierPatrocinador = "oro" | "plata" | "bronce"

export interface Patrocinador {
  id: number
  nombre: string
  descripcion: string
  tier: TierPatrocinador
  url?: string
}

export const PATROCINADORES_MOCK: Patrocinador[] = [
  {
    id: 1,
    nombre: "Dragón de Papel",
    descripcion: "Tienda de juegos de rol y coleccionables",
    tier: "oro",
    url: "#",
  },
  {
    id: 2,
    nombre: "Nexo Gaming",
    descripcion: "Centro de entretenimiento digital",
    tier: "oro",
    url: "#",
  },
  {
    id: 3,
    nombre: "Cafetería El Dungeon",
    descripcion: "Café temático para jugadores",
    tier: "plata",
    url: "#",
  },
  {
    id: 4,
    nombre: "Imprenta Rúnica",
    descripcion: "Impresión y diseño gráfico local",
    tier: "plata",
  },
  {
    id: 5,
    nombre: "El Dado Negro",
    descripcion: "Tienda especializada en wargames",
    tier: "plata",
    url: "#",
  },
  {
    id: 6,
    nombre: "Librería Arcana",
    descripcion: "Libros y novelas fantásticas",
    tier: "bronce",
  },
  {
    id: 7,
    nombre: "Talleres Mithril",
    descripcion: "Pintura y modelado de miniaturas",
    tier: "bronce",
    url: "#",
  },
  {
    id: 8,
    nombre: "Pixel & Pergamino",
    descripcion: "Diseño web para pequeños negocios",
    tier: "bronce",
    url: "#",
  },
]
