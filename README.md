# criptadoge-web

Proyecto fullstack con:
- Frontend: React + Vite (`frontCripta`)
- Backend: NestJS (`backCripta`)
- Infra local: PostgreSQL + MongoDB + Nginx (Docker Compose)

## Requisitos

- Docker + Docker Compose
- `make`
- Opcional para correr sin Docker:
  - Node.js 24+
  - Corepack habilitado (`corepack enable`)

## Configuracion inicial

1. Crear archivo de variables:

```bash
make env-init
```

2. Revisar y ajustar `.env`.

Importante: usa formato `CLAVE=valor` sin espacios alrededor del `=`.

Ejemplo:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=backCripta
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1d
VITE_API_URL=http://localhost:3000/api
```

## Levantar el proyecto con Docker

Arranque normal:

```bash
make up
```

Reconstruir imagenes y levantar:

```bash
make up-build
```

Detener servicios:

```bash
make down
```

Limpiar servicios + volumenes:

```bash
make clean
```

## Accesos

- App (Nginx): `http://localhost:8080`
- API por Nginx: `http://localhost:8080/api`
- PostgreSQL: `localhost:5432`
- MongoDB: `localhost:27017`

## Comandos Make mas usados

Ver ayuda completa:

```bash
make help
```

Estado y logs:

```bash
make ps
make logs
make logs-front
make logs-back
make logs-db
make logs-mongo
make logs-nginx
```

Entrar a contenedores:

```bash
make shell-front
make shell-back
make shell-db
make shell-mongo
```

## Desarrollo local (sin Docker para front/back)

Frontend:




uuuuu

```bash
make front-install
make front-dev
```

Backend:

```bash
make back-install
make back-dev
```

Build, lint y tests:

```bash
make front-build
make front-lint
make back-build
make back-lint
make back-test
make back-test-e2e
```

Si corres front/back de forma local, asegúrate de tener PostgreSQL y MongoDB activos (puedes levantarlos con Docker Compose o instalarlos localmente).

## Estructura del repositorio

```text
.
├── backCripta/         # API NestJS
├── frontCripta/        # App React + Vite
├── nginx/              # Config de reverse proxy
├── docker-compose.yml
└── Makefile
```
