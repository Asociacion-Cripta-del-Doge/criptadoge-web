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
- Eventos y etiquetas de eventos se almacenan en **MongoDB** con Mongoose.
