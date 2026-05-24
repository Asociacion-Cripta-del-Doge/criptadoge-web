# criptadoge-web

Proyecto fullstack para la web de La Cripta de Doge.

- Frontend: React + Vite (`frontCripta`)
- Backend: NestJS (`backCripta`)
- Persistencia: PostgreSQL + MongoDB
- Entrada Docker: Nginx

## Requisitos

- Docker + Docker Compose
- `make` opcional
- Opcional para correr sin Docker:
  - Node.js 24+
  - Corepack habilitado (`corepack enable`)

## Configuracion inicial

Crear los archivos de variables locales:

```bash
make env-init-dev
make env-init-prod
```

Sin `make`:

```bash
copy .env.development.example .env.development
copy .env.production.example .env.production
```

Esto crea `.env.development` y `.env.production` desde sus ejemplos. Ambos archivos quedan fuera de git. Revisa y ajusta valores reales, especialmente secretos de produccion. Usa formato `CLAVE=valor`, sin espacios alrededor del `=`.

Ejemplo base de desarrollo:

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

Si ejecutas Docker Compose sin `make`, pasa siempre el env file correspondiente:

```bash
docker compose --env-file .env.development up -d
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
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

En desarrollo el frontend corre con Vite, el backend con `yarn start:dev` y los servicios leen `.env.development`.

### Desarrollo sin Make

Arrancar:

```bash
docker compose --env-file .env.development up -d
```

Reconstruir imagenes y arrancar:

```bash
docker compose --env-file .env.development up -d --build
```

Ver estado y logs:

```bash
docker compose --env-file .env.development ps
docker compose --env-file .env.development logs -f --tail=200
```

Logs por servicio:

```bash
docker compose --env-file .env.development logs -f --tail=200 front
docker compose --env-file .env.development logs -f --tail=200 back
docker compose --env-file .env.development logs -f --tail=200 db
docker compose --env-file .env.development logs -f --tail=200 mongo
docker compose --env-file .env.development logs -f --tail=200 nginx
```

Detener:

```bash
docker compose --env-file .env.development down
```

Limpiar servicios y volumenes:

```bash
docker compose --env-file .env.development down -v --remove-orphans
```

## Docker en produccion

El archivo `docker-compose.prod.yml` esta orientado a produccion:

- Nginx es el unico servicio publicado al host, en los puertos `80` y `443`.
- El frontend ejecuta `npm run build` durante la construccion de imagen y sirve `dist` con Nginx interno.
- El backend se compila con `yarn build` y arranca con `yarn start:prod`.
- Antes de arrancar el backend se ejecuta `prisma migrate deploy` y `seed:prod`.
- PostgreSQL y MongoDB no publican puertos al host.
- Los servicios leen `.env.production`.
- HTTPS se configura con certificados Let's Encrypt montados en `./letsencrypt`.

Antes del primer arranque publico, ajusta `.env.production` con tu dominio real:

```env
PUBLIC_DOMAIN=cripta.example.com
NGINX_SERVER_NAME=cripta.example.com www.cripta.example.com
FRONTEND_URL=https://cripta.example.com
VITE_API_URL=https://cripta.example.com/api
GOOGLE_CALLBACK_URL=https://cripta.example.com/api/auth/google/callback
TLS_CERTIFICATE=/etc/letsencrypt/live/cripta.example.com/fullchain.pem
TLS_CERTIFICATE_KEY=/etc/letsencrypt/live/cripta.example.com/privkey.pem
```

Con los registros DNS apuntando al servidor y el puerto `80` libre, emite los certificados iniciales:

```bash
make certbot-issue-prod CERTBOT_DOMAIN=cripta.example.com CERTBOT_EMAIL=admin@cripta.example.com CERTBOT_EXTRA_DOMAINS="www.cripta.example.com"
```

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

- App: `https://cripta.example.com`
- API via Nginx: `https://cripta.example.com/api`

Renovar certificados:

```bash
make certbot-renew-prod
```

### Produccion local

Para probar las imagenes y el arranque de produccion en local sin dominio ni certificados TLS, usa `docker-compose.prod-local.yml`.

Esta variante:

- Construye frontend y backend con los targets `prod`.
- Sirve el frontend compilado desde Nginx en `http://localhost:8080`.
- Expone solo Nginx al host.
- Ejecuta `prisma migrate deploy` y `seed:prod` antes de arrancar el backend.
- Usa volumenes separados de la produccion real.
- No requiere `NGINX_SERVER_NAME`, `TLS_CERTIFICATE` ni `TLS_CERTIFICATE_KEY`.

Revisa que `.env.production` tenga valores locales para las URLs publicas:

```env
FRONTEND_URL=http://localhost:8080
VITE_API_URL=http://localhost:8080/api
GOOGLE_CALLBACK_URL=http://localhost:8080/api/auth/google/callback
```

Reconstruir imagenes y arrancar:

```bash
make up-prod-local-build
```

Arrancar sin reconstruir:

```bash
make up-prod-local
```

Ver estado y logs:

```bash
make ps-prod-local
make logs-prod-local
```

Detener:

```bash
make down-prod-local
```

Limpiar servicios y volumenes de produccion local:

```bash
make clean-prod-local
```

Accesos:

- App: `http://localhost:8080`
- API via Nginx: `http://localhost:8080/api`

### Produccion sin Make

Arrancar:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d
```

Reconstruir imagenes y arrancar:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

Ver estado y logs:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml ps
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f --tail=200
```

Logs por servicio:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f --tail=200 front
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f --tail=200 back
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f --tail=200 db
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f --tail=200 mongo
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f --tail=200 nginx
```

Detener:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml down
```

Limpiar servicios y volumenes de produccion:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml down -v --remove-orphans
```

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
+-- docker-compose.prod-local.yml # Produccion local sin TLS
`-- Makefile
```
