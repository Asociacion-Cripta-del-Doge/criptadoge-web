export interface RedSocial {
  id: string
  nombre: string
  handle: string
  url: string
  color: string
  icon: "twitch" | "instagram" | "discord" | "whatsapp"
}

export interface TwitchStream {
  titulo: string
  juego: string
  viewers: number
  live: boolean
  url: string
}

export interface InstagramPost {
  id: string
  imagen: string
  likes: number
  url: string
}

export const REDES_MOCK: RedSocial[] = [
  {
    id: "twitch",
    nombre: "Twitch",
    handle: "@criptadogeclub",
    url: "https://twitch.tv/criptadogeclub",
    color: "#9146FF",
    icon: "twitch",
  },
  {
    id: "instagram",
    nombre: "Instagram",
    handle: "@criptadogeclub",
    url: "https://instagram.com/criptadogeclub",
    color: "#E1306C",
    icon: "instagram",
  },
  {
    id: "discord",
    nombre: "Discord",
    handle: "Cripta de Doge",
    url: "https://discord.gg/criptadoge",
    color: "#5865F2",
    icon: "discord",
  },
  {
    id: "whatsapp",
    nombre: "WhatsApp",
    handle: "Grupo Comunidad",
    url: "https://wa.me/grupo",
    color: "#25D366",
    icon: "whatsapp",
  },
]

export const TWITCH_MOCK: TwitchStream = {
  titulo: "Torneo de Magic: The Gathering - Edición Semanal",
  juego: "Jugando a Magic: The Gathering Arena",
  viewers: 127,
  live: true,
  url: "https://twitch.tv/criptadogeclub",
}

export const INSTAGRAM_POSTS_MOCK: InstagramPost[] = [
  { id: "1", imagen: "#ec4899", likes: 42, url: "#" },
  { id: "2", imagen: "#3b82f6", likes: 31, url: "#" },
  { id: "3", imagen: "#eab308", likes: 58, url: "#" },
  { id: "4", imagen: "#8b5cf6", likes: 27, url: "#" },
  { id: "5", imagen: "#10b981", likes: 35, url: "#" },
  { id: "6", imagen: "#f97316", likes: 19, url: "#" },
]
