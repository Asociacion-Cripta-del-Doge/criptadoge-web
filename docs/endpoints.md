# API Endpoints - CriptaDoge Backend

Base URL directa: `http://localhost:3000`

Base URL via Nginx: `http://localhost:8080/api`

> Las rutas documentadas abajo se escriben sin el prefijo `/api`. Si se accede via Nginx, anteponer `/api`.

---

## Root

| Metodo | Ruta | Auth | Descripcion |
| ------ | ---- | ---- | ----------- |
| GET | `/` | No | Health/hello basico del backend |

---

## Auth `/auth`

| Metodo | Ruta | Auth | Body / uso |
| ------ | ---- | ---- | ---------- |
| POST | `/auth/login` | No | `{ email, password }` |
| POST | `/auth/register` | No | `{ name, email, password }` |
| GET | `/auth/me` | JWT | Devuelve el usuario autenticado |
| PATCH | `/auth/profile` | JWT | `{ name }` |
| PATCH | `/auth/avatar` | JWT | `{ base64 }` |
| GET | `/auth/google` | No | Inicia login con Google OAuth |
| GET | `/auth/google/callback` | Google OAuth | Callback de Google; redirige al frontend con token y usuario |
| POST | `/auth/forgot-password` | No | Solicita un enlace de recuperacion de contrasena |
| POST | `/auth/reset-password` | No | Actualiza la contrasena usando un token valido |

**LoginDto:**

```json
{
  "email": "string (requerido, email valido)",
  "password": "string (requerido)"
}
```

**RegisterDto:**

```json
{
  "name": "string (requerido)",
  "email": "string (requerido, email valido)",
  "password": "string (requerido, min. 8 caracteres)"
}
```

**Response de login/register:**

```json
{
  "access_token": "jwt_token",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "ADMIN | MEMBER"
  }
}
```

**Forgot password:**

```json
{
  "email": "string (requerido, email valido)"
}
```

Si el email existe y corresponde a un usuario con contrasena local, se envia un enlace de recuperacion. La respuesta es generica para no revelar si el email esta registrado.

**Reset password:**

```json
{
  "token": "string (requerido)",
  "password": "string (requerido)"
}
```

---

## Usuarios `/usuarios`

> Todos los endpoints requieren JWT + rol **ADMIN**.

| Metodo | Ruta | Body / uso |
| ------ | ---- | ---------- |
| POST | `/usuarios` | `CreateUserDto` |
| GET | `/usuarios` | Lista usuarios |
| GET | `/usuarios/:id` | Detalle de usuario |
| PUT | `/usuarios/:id` | `UpdateUserDto` |
| PUT | `/usuarios/:id/membresia` | Renueva membresia |
| POST | `/usuarios/:id/coins` | Concede monedas a un usuario |
| DELETE | `/usuarios/:id` | Desactiva usuario |

**CreateUserDto:**

```json
{
  "name": "string (requerido)",
  "email": "string (requerido, email valido)",
  "password": "string (requerido, min. 8 caracteres)",
  "dni": "string (opcional)",
  "role": "ADMIN | MEMBER (opcional)",
  "status": "string (opcional)",
  "lastRenewal": "string (opcional)",
  "expirationDate": "string (opcional)"
}
```

**UpdateUserDto:** todos los campos son opcionales.

```json
{
  "name": "string",
  "email": "string",
  "password": "string (min. 8 caracteres)",
  "dni": "string",
  "role": "ADMIN | MEMBER",
  "status": "string",
  "lastRenewal": "string",
  "expirationDate": "string"
}
```

**POST `/usuarios/:id/coins`:**

Concede monedas a un socio concreto y registra una transaccion en el historial. Devuelve el saldo actualizado.

```json
{
  "amount": 100,
  "reason": "premio torneo"
}
```

Respuesta:

```json
{
  "coins": 250
}
```

---

## Eventos `/eventos`

| Metodo | Ruta | Auth | Roles | Body / uso |
| ------ | ---- | ---- | ----- | ---------- |
| GET | `/eventos` | No | Publico | Lista eventos |
| GET | `/eventos/:id` | No | Publico | Detalle de evento |
| POST | `/eventos` | JWT | ADMIN | `CreateEventDto` |
| PUT | `/eventos/:id` | JWT | ADMIN | `UpdateEventDto` |
| DELETE | `/eventos/:id` | JWT | ADMIN | Elimina evento |
| GET | `/eventos/mis-asistencias` | JWT | MEMBER, ADMIN | IDs de eventos en los que participa el usuario autenticado |
| POST | `/eventos/:id/asistentes` | JWT | MEMBER, ADMIN | Unirse al evento |
| DELETE | `/eventos/:id/asistentes` | JWT | MEMBER, ADMIN | Salir del evento |
| GET | `/eventos/:id/asistentes/count` | No | Publico | Numero de asistentes del evento |
| GET | `/eventos/:id/asistentes` | JWT | ADMIN | Lista asistentes del evento |

**CreateEventDto:**

```json
{
  "title": "string (requerido)",
  "date": "string (requerido)",
  "label": "string (requerido)",
  "description": "string (opcional)",
  "time": "string (opcional)",
  "status": "string (opcional)"
}
```

**UpdateEventDto:** todos los campos son opcionales.

```json
{
  "title": "string",
  "date": "string",
  "label": "string",
  "description": "string",
  "time": "string",
  "status": "string"
}
```

**Response GET `/eventos` y `/eventos/:id`:**

```json
{
  "_id": "string",
  "title": "string",
  "date": "string",
  "label": "string",
  "description": "string",
  "time": "string",
  "status": "string",
  "attendeesCount": 3
}
```

**Response GET `/eventos/:id/asistentes/count`:**

```json
{
  "eventId": "string",
  "attendeesCount": 3
}
```

**Response GET `/eventos/:id/asistentes`:**

```json
[
  {
    "userId": "string",
    "joinedAt": "ISO 8601",
    "name": "string",
    "email": "string | null"
  }
]
```

---

## Event Labels `/event-labels`

| Metodo | Ruta | Auth | Roles | Body / uso |
| ------ | ---- | ---- | ----- | ---------- |
| GET | `/event-labels` | No | Publico | Lista etiquetas |
| POST | `/event-labels` | JWT | ADMIN | `{ name, color? }` |
| PATCH | `/event-labels/:id` | JWT | ADMIN | Actualiza etiqueta y propaga el cambio de nombre a los eventos |
| DELETE | `/event-labels/:id` | JWT | ADMIN | Elimina etiqueta si no esta en uso por eventos |

**CreateEventLabelDto:**

```json
{
  "name": "string (requerido)",
  "color": "string (opcional)"
}
```

**UpdateEventLabelDto:** todos los campos son opcionales.

```json
{
  "name": "string",
  "color": "string"
}
```

---

## Contacto `/contacto`

| Metodo | Ruta | Auth | Roles | Body / uso |
| ------ | ---- | ---- | ----- | ---------- |
| POST | `/contacto` | No | Publico | `CreateMessageDto` |
| GET | `/contacto` | JWT | ADMIN | Lista mensajes de contacto |
| PATCH | `/contacto/:id` | JWT | ADMIN | Cambia el estado de un mensaje |
| GET | `/contacto/redes` | No | Publico | Devuelve enlaces sociales |
| GET | `/contacto/twitch` | No | Publico | Devuelve informacion del stream de Twitch |

**CreateMessageDto:**

```json
{
  "nombre": "string (requerido)",
  "email": "string (requerido, email valido)",
  "asunto": "string (requerido)",
  "mensaje": "string (requerido)"
}
```

**UpdateMessageStatusDto:**

```json
{
  "estado": "pendiente | en_proceso | respondido | resuelto | archivado"
}
```

Estados disponibles:

- `pendiente`: Pendiente
- `en_proceso`: En proceso
- `respondido`: Respondido
- `resuelto`: Resuelto
- `archivado`: Archivado

---

## Membership `/membership`

| Metodo | Ruta | Auth | Roles | Body / uso |
| ------ | ---- | ---- | ----- | ---------- |
| GET | `/membership/requests` | JWT | ADMIN | Lista solicitudes de membresia |
| POST | `/membership/request` | No | Publico | Crea una solicitud de membresia |

**CreateMembershipRequestDto:**

```json
{
  "name": "string (requerido, min. 2 caracteres)",
  "email": "string (requerido, email valido)",
  "phone": "string (requerido)",
  "birthdate": "string (requerido)",
  "howDidYouKnow": "string (opcional)"
}
```

La solicitud se guarda con estado inicial `Pendiente` y envia un email de confirmacion al solicitante.

**Response GET `/membership/requests`:**

```json
[
  {
    "_id": "string",
    "name": "string",
    "email": "string",
    "phone": "string",
    "birthdate": "string",
    "howDidYouKnow": "string | undefined",
    "status": "Pendiente | Revisada | Aprobada | Rechazada",
    "createdAt": "ISO 8601",
    "updatedAt": "ISO 8601"
  }
]
```

---

## Admin `/admin`

> Todos los endpoints requieren JWT + rol **ADMIN**.

| Metodo | Ruta | Body / uso |
| ------ | ---- | ---------- |
| GET | `/admin/dashboard` | Resumen rapido para el panel de administracion |
| GET | `/admin/pack-config` | Configuracion activa de sobres; si no existe, crea una por defecto |
| PATCH | `/admin/pack-config` | Actualiza precio, cartas por sobre o estado activo |
| GET | `/admin/cards/stats` | Estadisticas de posesion y distribucion de cartas |

**PATCH `/admin/pack-config`:** todos los campos son opcionales.

```json
{
  "price": 100,
  "cardsPerPack": 2,
  "isActive": true
}
```

**Response GET `/admin/dashboard`:**

```json
{
  "totalCards": 10,
  "totalCollections": 2,
  "totalPacks": 25,
  "totalUsers": 7,
  "packsOpened": 12,
  "packsUnopened": 13
}
```

**Response GET `/admin/cards/stats`:**

```json
[
  {
    "id": 1,
    "name": "Carta ejemplo",
    "rarity": "COMUN | RARA | EPICA | LEGENDARIA",
    "dropWeight": 100,
    "imageUrl": "string | null",
    "collection": {
      "id": 1,
      "name": "Coleccion ejemplo"
    },
    "ownersCount": 3,
    "totalCopies": 8
  }
]
```

---

## Coins `/coins`

> Todos los endpoints requieren JWT. `POST /coins/grant` requiere ademas rol **ADMIN**.

| Metodo | Ruta | Auth | Roles | Body / uso |
| ------ | ---- | ---- | ----- | ---------- |
| GET | `/coins/balance` | JWT | Usuario autenticado | Saldo de monedas del usuario autenticado |
| GET | `/coins/history` | JWT | Usuario autenticado | Ultimas 50 transacciones del usuario autenticado |
| POST | `/coins/grant` | JWT | ADMIN | Concede monedas al admin autenticado |

**POST `/coins/grant`:**

```json
{
  "amount": 500
}
```

Si no se envia `amount`, el backend usa `500`.

**Response GET `/coins/balance` y POST `/coins/grant`:**

```json
{
  "coins": 250
}
```

**Response GET `/coins/history`:**

```json
[
  {
    "id": 1,
    "userId": "uuid",
    "amount": 50,
    "reason": "weekly_reward | manual_grant | pack_purchase",
    "createdAt": "ISO 8601"
  }
]
```

Notas:

- Cada usuario empieza con `100` monedas.
- Un cron semanal concede `50` monedas a los usuarios con `status = "Activo"` cada lunes a las 09:00.
- Las compras de sobres registran una transaccion negativa con `reason = "pack_purchase"`.

---

## Collections `/collections`

| Metodo | Ruta | Auth | Roles | Body / uso |
| ------ | ---- | ---- | ----- | ---------- |
| GET | `/collections` | No | Publico | Lista colecciones con contador de cartas |
| GET | `/collections/:id` | No | Publico | Detalle de coleccion con sus cartas |
| POST | `/collections` | JWT | ADMIN | Crea una coleccion |
| PATCH | `/collections/:id` | JWT | ADMIN | Actualiza una coleccion |
| DELETE | `/collections/:id` | JWT | ADMIN | Borra una coleccion |
| POST | `/collections/:id/image` | JWT | ADMIN | Sube portada de coleccion a Cloudinary |

**CreateCollectionDto:**

```json
{
  "name": "string (requerido)",
  "description": "string (opcional)",
  "isActive": "boolean (opcional)"
}
```

**UpdateCollectionDto:** todos los campos son opcionales.

```json
{
  "name": "string",
  "description": "string",
  "isActive": true
}
```

**POST `/collections/:id/image`:**

```json
{
  "base64": "data:image/png;base64,..."
}
```

---

## Cards `/cards`

| Metodo | Ruta | Auth | Roles | Body / uso |
| ------ | ---- | ---- | ----- | ---------- |
| GET | `/cards` | No | Publico | Lista cartas con su coleccion |
| GET | `/cards/my` | JWT | Usuario autenticado | Cartas del usuario autenticado con cantidad |
| GET | `/cards/:id` | No | Publico | Detalle de una carta |
| POST | `/cards` | JWT | ADMIN | Crea una carta |
| PATCH | `/cards/:id` | JWT | ADMIN | Actualiza una carta |
| DELETE | `/cards/:id` | JWT | ADMIN | Elimina una carta |
| POST | `/cards/:id/image` | JWT | ADMIN | Sube imagen de carta a Cloudinary |

**CreateCardDto:**

```json
{
  "name": "string (requerido)",
  "rarity": "COMUN | RARA | EPICA | LEGENDARIA",
  "dropWeight": "number (requerido, mayor = mas probable)",
  "collectionId": "number (opcional)"
}
```

**UpdateCardDto:** todos los campos son opcionales.

```json
{
  "name": "string",
  "rarity": "COMUN | RARA | EPICA | LEGENDARIA",
  "dropWeight": 100,
  "collectionId": "number | null"
}
```

**POST `/cards/:id/image`:**

```json
{
  "base64": "data:image/png;base64,..."
}
```

**Response GET `/cards/my`:**

```json
[
  {
    "id": 1,
    "userId": "uuid",
    "cardId": 1,
    "quantity": 2,
    "card": {
      "id": 1,
      "name": "Carta ejemplo",
      "rarity": "COMUN",
      "dropWeight": 100,
      "imageUrl": "string | null",
      "collectionId": 1,
      "createdAt": "ISO 8601",
      "collection": {
        "id": 1,
        "name": "Coleccion ejemplo"
      }
    }
  }
]
```

---

## Packs `/packs`

| Metodo | Ruta | Auth | Roles | Body / uso |
| ------ | ---- | ---- | ----- | ---------- |
| GET | `/packs/price` | No | Publico | Precio del sobre y cartas incluidas |
| GET | `/packs/my` | JWT | Usuario autenticado | Sobres del usuario autenticado, abiertos y cerrados |
| POST | `/packs/buy` | JWT | Usuario autenticado | Compra un sobre descontando monedas |
| POST | `/packs/:id/open` | JWT | Propietario del sobre | Abre un sobre y anade cartas a la coleccion del usuario |

**Response GET `/packs/price`:**

```json
{
  "price": 100,
  "cardsPerPack": 2
}
```

**Response POST `/packs/buy`:**

Devuelve el sobre creado con las cartas ya sorteadas, pero todavia sin sumar al album del usuario.

```json
{
  "id": 1,
  "userId": "uuid",
  "openedAt": null,
  "createdAt": "ISO 8601",
  "cards": [
    {
      "id": 1,
      "packId": 1,
      "cardId": 3,
      "card": {
        "id": 3,
        "name": "Carta ejemplo",
        "rarity": "RARA",
        "dropWeight": 25,
        "imageUrl": "string | null",
        "collectionId": 1,
        "createdAt": "ISO 8601"
      }
    }
  ]
}
```

**Response POST `/packs/:id/open`:**

```json
[
  {
    "id": 3,
    "name": "Carta ejemplo",
    "rarity": "RARA",
    "dropWeight": 25,
    "imageUrl": "string | null",
    "collectionId": 1,
    "createdAt": "ISO 8601"
  }
]
```

Notas:

- Solo el propietario puede abrir su sobre.
- Un sobre no se puede abrir dos veces.
- El sorteo es ponderado por `dropWeight` y sin duplicados dentro del mismo sobre.
- Al abrir un sobre, las cartas se insertan o incrementan en `UserCard.quantity`.

---

## Mesas `/mesas`

| Metodo | Ruta | Auth | Roles | Body / uso |
| ------ | ---- | ---- | ----- | ---------- |
| GET | `/mesas` | No | Publico | Lista mesas ordenadas por `orden` |
| GET | `/mesas/:id` | No | Publico | Detalle de mesa |
| POST | `/mesas` | JWT | ADMIN | `CreateMesaDto` |
| PUT | `/mesas/:id` | JWT | ADMIN | `UpdateMesaDto` |
| DELETE | `/mesas/:id` | JWT | ADMIN | Elimina una mesa |

**CreateMesaDto:**

```json
{
  "asientos": "number (requerido, min. 1)",
  "orden": "number (requerido, min. 1, unico)",
  "esDePago": "boolean (opcional)"
}
```

**UpdateMesaDto:** todos los campos son opcionales.

```json
{
  "asientos": "number",
  "orden": "number",
  "esDePago": "boolean"
}
```

---

## Reservas `/reservas`

| Metodo | Ruta | Auth | Roles | Body / uso |
| ------ | ---- | ---- | ----- | ---------- |
| POST | `/reservas` | JWT | Usuario autenticado | `CreateReservaDto` |
| GET | `/reservas/disponibilidad` | JWT | Usuario autenticado | Query de disponibilidad |
| GET | `/reservas/huecos` | JWT | Usuario autenticado | Lista huecos libres por franja horaria |
| GET | `/reservas/huecos/gratis` | JWT | Usuario autenticado | Lista huecos libres solo en mesas gratuitas |
| GET | `/reservas/mis-reservas` | JWT | Usuario autenticado | Lista las reservas propias |
| GET | `/reservas` | JWT | ADMIN | Lista todas las reservas |
| PATCH | `/reservas/:id/cancelar` | JWT | Propietario o ADMIN | Cancela una reserva |

**CreateReservaDto:**

```json
{
  "mesaId": "uuid (requerido)",
  "fechaHoraInicio": "ISO 8601 (requerido)",
  "fechaHoraFin": "ISO 8601 (requerido)",
  "asientosReservados": "number (requerido, min. 2, par)"
}
```

Al crear una reserva se guarda el campo informativo `precio`. Solo se pueden reservar asientos en cantidades pares y la duracion maxima es de `3` horas. En mesas gratuitas queda a `0`. En mesas de pago solo pueden reservar socios con `status = "Activo"`; tienen la primera hora gratis y despues se calcula proporcionalmente a `1.25` euros por asiento reservado y hora facturable. Los usuarios sin membresia activa solo pueden tener una reserva activa (`PENDIENTE` o `CONFIRMADA`) por dia.

**Query GET `/reservas/disponibilidad`:**

```http
/reservas/disponibilidad?mesaId=uuid&fechaHoraInicio=2026-05-10T18:00:00.000Z&fechaHoraFin=2026-05-10T20:00:00.000Z&asientosReservados=2
```

**Response de disponibilidad:**

```json
{
  "mesa": {
    "id": "uuid",
    "orden": 1,
    "asientos": 4,
    "esDePago": false
  },
  "fechaHoraInicio": "ISO 8601",
  "fechaHoraFin": "ISO 8601",
  "asientosTotales": 4,
  "asientosOcupados": 1,
  "asientosDisponibles": 3,
  "asientosSolicitados": 2,
  "disponible": true
}
```

**Query GET `/reservas/huecos`:**

```http
/reservas/huecos?fecha=2026-05-10&asientosReservados=2
```

El servidor aplica por defecto el horario provisional publicado en la web, en franjas de `60` minutos:

| Dia | Horario |
| --- | ------- |
| Lunes | 17:00 - 22:00 |
| Martes | 17:00 - 22:00 |
| Miercoles | 17:00 - 22:00 |
| Jueves | 17:00 - 22:00 |
| Viernes | 17:00 - 00:00 |
| Sabado | 11:00 - 00:00 |
| Domingo | 11:00 - 20:00 |

Opcionalmente se puede ajustar la duracion de franja y acotar el rango dentro del horario de apertura:

```http
/reservas/huecos?fecha=2026-05-10&asientosReservados=2&duracionMinutos=30&desde=2026-05-10T18:00:00.000Z&hasta=2026-05-10T22:00:00.000Z
```

**Query GET `/reservas/huecos/gratis`:**

```http
/reservas/huecos/gratis?fecha=2026-05-10&asientosReservados=2
```

Filtra las mesas con `esDePago = false` antes de calcular los huecos. Los usuarios con membresia caducada o no activa tambien ven solo mesas gratuitas al consultar `/reservas/huecos`.

**Response de huecos:**

```json
{
  "fecha": "2026-05-10",
  "soloGratis": false,
  "horario": {
    "dia": "domingo",
    "horaApertura": "11:00",
    "horaCierre": "20:00",
    "duracionFranjaMinutos": 60
  },
  "slots": [
    {
      "fechaHoraInicio": "2026-05-10T11:00:00.000Z",
      "fechaHoraFin": "2026-05-10T12:00:00.000Z",
      "horaInicio": "11:00",
      "horaFin": "12:00",
      "asientosSolicitados": 2,
      "asientosDisponiblesTotales": 6,
      "mesasDisponibles": [
        {
          "id": "uuid",
          "orden": 1,
          "asientos": 4,
          "esDePago": false,
          "asientosOcupados": 1,
          "asientosDisponibles": 3,
          "disponible": true
        }
      ]
    }
  ]
}
```

**Notas de negocio:**

- Las reservas activas que ocupan disponibilidad son `PENDIENTE` y `CONFIRMADA`.
- Las reservas y consultas con `asientosReservados` solo aceptan cantidades pares.
- Las reservas no pueden superar las `3` horas.
- Los huecos libres se calculan por franja horaria y por asientos disponibles, no bloqueando la mesa completa salvo que los asientos ocupados alcancen su capacidad.
- Los socios con membresia no activa solo pueden consultar y reservar huecos en mesas gratuitas.
- Los usuarios sin membresia activa solo pueden tener una reserva activa por dia natural, segun el dia UTC de `fechaHoraInicio`.
- Los socios activos tienen 1 hora gratis en mesas de pago; el precio de las horas restantes es solo informativo y no activa ningun cobro.
- Cancelar una reserva cambia su estado a `CANCELADA`; no elimina el historico.
- Solo el propietario de la reserva o un usuario `ADMIN` puede cancelarla.
- Al crear o cancelar una reserva, el backend emite por Socket.IO el evento `reservation-changed` para que la pagina de reservas actualice huecos en tiempo real.

---

## Textos web `/web-texts`

> Documentacion funcional completa: [`docs/textos-web.md`](./textos-web.md)

| Metodo | Ruta | Auth | Roles | Body / uso |
| ------ | ---- | ---- | ----- | ---------- |
| GET | `/web-texts` | No | Publico | Lista textos configurables. Acepta `locale` y `section` como query params |
| GET | `/web-texts/admin` | JWT | ADMIN | Lista textos para gestion interna. Acepta `locale` y `section` |
| POST | `/web-texts` | JWT | ADMIN | Crea un texto configurable |
| PATCH | `/web-texts/:id` | JWT | ADMIN | Actualiza valor, seccion, tipo o locale |

**CreateWebTextDto:**

```json
{
  "key": "home.hero.title",
  "value": "Texto editable",
  "section": "home.hero",
  "type": "text | textarea | markdown (opcional)",
  "locale": "es (opcional)"
}
```

**UpdateWebTextDto:** todos los campos son opcionales.

```json
{
  "value": "Texto actualizado",
  "section": "home.hero",
  "type": "text | textarea | markdown",
  "locale": "es"
}
```

Flujo de edicion:

1. La web consulta `/web-texts` por seccion y mezcla esos valores con defaults locales.
2. Si MongoDB no devuelve una key, el frontend usa `frontCripta/src/data/webTextDefaults.ts`.
3. Los admins gestionan textos por endpoints protegidos y el seeder solo crea los valores iniciales.

---

## Autenticacion

Incluir el token en el header de todas las rutas protegidas:

```http
Authorization: Bearer <access_token>
```

---

## Notas

- `/api/auth/` tiene rate limit de **5 req/min** por IP via Nginx.
- `/api/auth/me` tiene una regla especifica en Nginx y no usa ese rate limit.
- El backend acepta JSON y URL encoded con limite de **10 MB**.
- Usuarios, monedas, colecciones, cartas, sobres, mesas y reservas de mesa se almacenan en **PostgreSQL** con Prisma.
- Eventos, etiquetas de eventos y solicitudes de membresia se almacenan en **MongoDB** con Mongoose.
