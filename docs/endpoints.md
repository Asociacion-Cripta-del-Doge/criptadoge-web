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

---

## Eventos `/eventos`

| Metodo | Ruta | Auth | Roles | Body / uso |
| ------ | ---- | ---- | ----- | ---------- |
| GET | `/eventos` | No | Publico | Lista eventos |
| GET | `/eventos/:id` | No | Publico | Detalle de evento |
| POST | `/eventos` | JWT | ADMIN | `CreateEventDto` |
| PUT | `/eventos/:id` | JWT | ADMIN | `UpdateEventDto` |
| DELETE | `/eventos/:id` | JWT | ADMIN | Elimina evento |
| POST | `/eventos/:id/asistentes` | JWT | MEMBER | Unirse al evento |
| DELETE | `/eventos/:id/asistentes` | JWT | MEMBER | Salir del evento |
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
| DELETE | `/event-labels/:id` | JWT | ADMIN | Elimina etiqueta |

**CreateEventLabelDto:**

```json
{
  "name": "string (requerido)",
  "color": "string (opcional)"
}
```

---

## Contacto `/contacto`

| Metodo | Ruta | Auth | Roles | Body / uso |
| ------ | ---- | ---- | ----- | ---------- |
| POST | `/contacto` | No | Publico | `CreateMessageDto` |
| GET | `/contacto` | JWT | ADMIN | Lista mensajes de contacto |
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
- Usuarios se almacenan en **PostgreSQL** con Prisma.
- Mesas y reservas de mesa se almacenan en **PostgreSQL** con Prisma.
- Eventos y etiquetas de eventos se almacenan en **MongoDB** con Mongoose.
