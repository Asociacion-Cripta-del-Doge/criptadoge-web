---
name: criptadoge-repo
description: Contexto rapido para trabajar en el repositorio CriptaDoge Web. Usar cuando haya que implementar, revisar o explicar cambios en este proyecto fullstack con React, Vite, NestJS, Prisma, PostgreSQL, MongoDB, Mongoose, Nginx y Docker Compose.
---

# CriptaDoge Web

## Contexto general

CriptaDoge Web es una aplicacion fullstack para gestionar una comunidad/asociacion con eventos, socios, login, perfil, contacto, redes sociales, etiquetas de eventos y mesas.

El repositorio esta dividido en:

- `frontCripta/`: frontend con React, TypeScript, Vite y Sass.
- `backCripta/`: API con NestJS, TypeScript, Prisma, Mongoose y JWT.
- `nginx/`: reverse proxy local. Sirve el frontend y expone la API bajo `/api`.
- `docs/`: documentacion, wireframes, guia visual y endpoints.
- `docker-compose.yml`: levanta frontend, backend, PostgreSQL, MongoDB y Nginx.

## Tecnologias principales

Frontend:

- React 19
- Vite 7
- TypeScript
- Sass/SCSS
- react-hot-toast

Backend:

- NestJS 11
- TypeScript
- Prisma 7 con PostgreSQL
- Mongoose con MongoDB
- JWT y Passport
- Google OAuth
- bcrypt
- Cloudinary para avatar
- class-validator/class-transformer

Infra local:

- Docker Compose
- Nginx
- PostgreSQL 17
- MongoDB 8

## Comandos utiles

Preferir los comandos del `Makefile`:

- `make env-init`: crea `.env` desde `.env.example`.
- `make up`: levanta todo con Docker.
- `make up-build`: reconstruye imagenes y levanta servicios.
- `make down`: detiene servicios.
- `make logs`, `make logs-front`, `make logs-back`, `make logs-db`, `make logs-mongo`, `make logs-nginx`: logs.
- `make front-dev`: frontend local.
- `make front-build`: build frontend.
- `make front-lint`: lint frontend.
- `make back-dev`: backend local.
- `make back-build`: build backend.
- `make back-lint`: lint backend.
- `make back-test`: tests backend.
- `make back-test-e2e`: tests e2e backend.

Accesos locales habituales:

- App via Nginx: `http://localhost:8080`
- API via Nginx: `http://localhost:8080/api`
- API directa: `http://localhost:3000`
- PostgreSQL: `localhost:5432`
- MongoDB: `localhost:27017`

## API y endpoints

La API NestJS no monta prefijo global. Nginx traduce `/api/...` hacia el backend. En codigo backend las rutas estan sin `/api`.

Endpoints principales:

- `GET /`: health/hello basico.
- `POST /auth/login`: login con email y password.
- `POST /auth/register`: registro.
- `GET /auth/me`: usuario autenticado con JWT.
- `PATCH /auth/profile`: cambia nombre del perfil.
- `PATCH /auth/avatar`: sube avatar en base64 a Cloudinary.
- `GET /auth/google`: inicia Google OAuth.
- `GET /auth/google/callback`: callback OAuth y redireccion al frontend.
- `GET /usuarios`: lista usuarios, solo ADMIN.
- `POST /usuarios`: crea usuario, solo ADMIN.
- `GET /usuarios/:id`: detalle usuario, solo ADMIN.
- `PUT /usuarios/:id`: actualiza usuario, solo ADMIN.
- `PUT /usuarios/:id/membresia`: renueva membresia, solo ADMIN.
- `DELETE /usuarios/:id`: desactiva usuario, solo ADMIN.
- `GET /eventos`: lista eventos publica.
- `GET /eventos/:id`: detalle de evento publico.
- `POST /eventos`: crea evento, solo ADMIN.
- `PUT /eventos/:id`: actualiza evento, solo ADMIN.
- `DELETE /eventos/:id`: elimina evento, solo ADMIN.
- `POST /eventos/:id/asistentes`: unirse a evento, solo MEMBER.
- `DELETE /eventos/:id/asistentes`: salir de evento, solo MEMBER.
- `GET /eventos/:id/asistentes`: lista asistentes, solo ADMIN.
- `GET /event-labels`: lista etiquetas publica.
- `POST /event-labels`: crea etiqueta, solo ADMIN.
- `DELETE /event-labels/:id`: elimina etiqueta, solo ADMIN.
- `POST /contacto`: envia mensaje de contacto publico.
- `GET /contacto`: lista mensajes, solo ADMIN.
- `GET /contacto/redes`: enlaces sociales publicos.
- `GET /contacto/twitch`: informacion del stream de Twitch publica.
- `GET /mesas`: lista mesas, solo ADMIN.
- `POST /mesas`: crea mesa, solo ADMIN.
- `GET /mesas/:id`: detalle mesa, solo ADMIN.
- `PUT /mesas/:id`: actualiza mesa, solo ADMIN.
- `DELETE /mesas/:id`: elimina mesa, solo ADMIN.

Para rutas protegidas usar:

```http
Authorization: Bearer <access_token>
```

Roles actuales:

- `ADMIN`
- `MEMBER`

## Datos y persistencia

PostgreSQL con Prisma guarda:

- `User`: socios/usuarios, rol, estado de membresia, avatar y credenciales.
- `Mesa`: mesas con numero de asientos, orden y si es de pago.

MongoDB con Mongoose guarda:

- Eventos.
- Etiquetas de eventos.
- Mensajes de contacto.
- Enlaces sociales.

Hay seeders en `backCripta/prisma/seeders/`.

## Frontend

El frontend esta en `frontCripta/src`.

Componentes principales:

- `navbar`
- `heroCarousel`
- `aboutUs`
- `EventCalendar`
- `membershipSection`
- `profile`
- `contact`
- `patrocinadores`
- `ubicacion`
- `footer`

El frontend consume la API principalmente a traves de `/api/...` cuando esta detras de Nginx. Revisar `src/context/AuthContext.tsx` y `src/services/eventosService.ts` antes de tocar autenticacion o eventos.

## Reglas de trabajo recomendadas

- Revisar primero `README.md`, `docs/endpoints.md`, `backCripta/src/*/*.controller.ts` y los DTOs afectados.
- Mantener el estilo existente: NestJS por modulos en backend, componentes React con SCSS en frontend.
- No mezclar bases de datos sin necesidad: usuarios/mesas van por Prisma/PostgreSQL; eventos/contacto/etiquetas/redes van por Mongoose/MongoDB.
- Al tocar endpoints protegidos, comprobar guards `JwtAuthGuard`, `RolesGuard` y decorador `@Roles`.
- Al tocar frontend, mantener llamadas relativas a `/api` si la pantalla funciona via Nginx.
- Si se cambia la API, actualizar `docs/endpoints.md`.
- Si se cambia Prisma, revisar `schema.prisma`, migraciones y seeders.
- Validar con el comando mas cercano al cambio: `make front-build`, `make front-lint`, `make back-build`, `make back-lint`, `make back-test` o `make back-test-e2e`.
