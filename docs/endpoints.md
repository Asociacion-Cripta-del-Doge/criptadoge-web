# API Endpoints — CriptaDoge Backend

Base URL: `http://localhost:3000` (directo) | `http://localhost:8080/api` (via Nginx)

---

## Auth

| Método | Ruta          | Auth | Body                  |
| ------ | ------------- | ---- | --------------------- |
| POST   | `/auth/login` | No   | `{ email, password }` |

**Response:**

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

> Todos los endpoints requieren JWT + rol **ADMIN**

| Método | Ruta                      | Body                        |
| ------ | ------------------------- | --------------------------- |
| POST   | `/usuarios`               | `CreateUserDto`             |
| GET    | `/usuarios`               | —                           |
| GET    | `/usuarios/:id`           | —                           |
| PUT    | `/usuarios/:id`           | `UpdateUserDto`             |
| PUT    | `/usuarios/:id/membresia` | — (renueva membresía 1 mes) |
| DELETE | `/usuarios/:id`           | —                           |

**CreateUserDto:**

```json
{
  "name": "string (requerido)",
  "email": "string (requerido, email válido)",
  "password": "string (requerido, mín. 8 caracteres)",
  "dni": "string (opcional)",
  "role": "ADMIN | MEMBER (opcional)",
  "status": "string (opcional)",
  "lastRenewal": "string (opcional)",
  "expirationDate": "string (opcional)"
}
```

**UpdateUserDto:** (todos los campos opcionales)

```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "dni": "string",
  "role": "ADMIN | MEMBER",
  "status": "string",
  "lastRenewal": "string",
  "expirationDate": "string"
}
```

---

## Eventos `/eventos`

> Todos los endpoints requieren JWT

| Método | Ruta                      | Roles         | Body                 |
| ------ | ------------------------- | ------------- | -------------------- |
| POST   | `/eventos`                | ADMIN         | `CreateEventDto`     |
| GET    | `/eventos`                | ADMIN, MEMBER | —                    |
| GET    | `/eventos/:id`            | ADMIN, MEMBER | —                    |
| PUT    | `/eventos/:id`            | ADMIN         | `UpdateEventDto`     |
| DELETE | `/eventos/:id`            | ADMIN         | —                    |
| POST   | `/eventos/:id/asistentes` | MEMBER        | — (unirse al evento) |
| DELETE | `/eventos/:id/asistentes` | MEMBER        | — (salir del evento) |
| GET    | `/eventos/:id/asistentes` | ADMIN         | —                    |

**CreateEventDto:**

```json
{
  "title": "string (requerido)",
  "date": "string (requerido)",
  "label": "string (requerido)",
  "description": "string (opcional)",
  "time": "string (opcional)",
  "status": "Próximo | En curso | Finalizado (opcional)"
}
```

**UpdateEventDto:** (todos los campos opcionales)

```json
{
  "title": "string",
  "date": "string",
  "label": "string",
  "description": "string",
  "time": "string",
  "status": "Próximo | En curso | Finalizado"
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

| Método | Ruta                | Auth        | Body                               |
| ------ | ------------------- | ----------- | ---------------------------------- |
| GET    | `/event-labels`     | No          | —                                  |
| POST   | `/event-labels`     | JWT + ADMIN | `{ name: string, color?: string }` |
| DELETE | `/event-labels/:id` | JWT + ADMIN | —                                  |

---

## Autenticación

Incluir el token en el header de todas las rutas protegidas:

```
Authorization: Bearer <access_token>
```

---

## Notas

- `/api/auth/` tiene **rate limit de 5 req/min** por IP via Nginx (HTTP 429 al superarlo)
- Users almacenados en **PostgreSQL** (Prisma)
- Events y EventLabels en **MongoDB** (Mongoose)
