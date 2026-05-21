# criptadoge-web

Proyecto fullstack para la web de La Cripta de Doge.

- Frontend: React + Vite (`frontCripta`)
- Backend: NestJS (`backCripta`)
- Persistencia: PostgreSQL + MongoDB
- Entrada Docker: Nginx

## Requisitos

- Docker + Docker Compose
- `make`
- Opcional para correr sin Docker:
  - Node.js 24+
  - Corepack habilitado (`corepack enable`)

## Configuracion inicial

Crear el archivo de variables:

```bash
make env-init
```

Revisar y ajustar `.env`. Usa formato `CLAVE=valor`, sin espacios alrededor del `=`.

Ejemplo base:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=backCripta
POSTGRES_HOST=db
POSTGRES_PORT=5432
DATABASE_URL=postgresql://postgres:postgres@db:5432/backCripta
MONGO_URL=mongodb://mongo:27017/cripta-db
PORT=3000
FRONTEND_URL=http://localhost:8080
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1d
VITE_API_URL=http://localhost:8080/api
```

## Docker en desarrollo

El archivo `docker-compose.yml` esta orientado a desarrollo. Solo publica Nginx al host; frontend, backend, PostgreSQL y MongoDB se comunican por la red interna de Docker usando los nombres de servicio (`front`, `back`, `db`, `mongo`).

Arrancar:

```bash
make up
```

Reconstruir imagenes y arrancar:

```bash
make up-build
```

Detener:

```bash
make down
```

Limpiar servicios y volumenes:

```bash
make clean
```

Accesos:

- App: `http://localhost:8080`
- API via Nginx: `http://localhost:8080/api`

En desarrollo el frontend corre con Vite y el backend con `yarn start:dev`.

## Docker en produccion

El archivo `docker-compose.prod.yml` esta orientado a produccion:

- Nginx es el unico servicio publicado al host.
- El frontend ejecuta `npm run build` durante la construccion de imagen y sirve `dist` con Nginx interno.
- El backend se compila con `yarn build` y arranca con `yarn start:prod`.
- Antes de arrancar el backend se ejecuta `prisma migrate deploy`.
- PostgreSQL y MongoDB no publican puertos al host.

Arrancar:

```bash
make up-prod
```

Reconstruir imagenes y arrancar:

```bash
make up-prod-build
```

Ver estado y logs:

```bash
make ps-prod
make logs-prod
```

Detener:

```bash
make down-prod
```

Limpiar servicios y volumenes de produccion:

```bash
make clean-prod
```

Accesos:

- App: `http://localhost:8080`
- API via Nginx: `http://localhost:8080/api`

## Comandos Make mas usados

Ver ayuda completa:

```bash
make help
```

Estado y logs de desarrollo:

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

## Desarrollo local sin Docker para front/back

Frontend:

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

Si corres front/back de forma local, asegurate de tener PostgreSQL y MongoDB activos y de ajustar las variables de entorno a esos hosts.

## Estructura del repositorio

```text
.
+-- backCripta/              # API NestJS
+-- frontCripta/             # App React + Vite
+-- nginx/                   # Config de reverse proxy
+-- docker-compose.yml       # Desarrollo
+-- docker-compose.prod.yml  # Produccion
`-- Makefile
```
