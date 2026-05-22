# Despliegue publico con Docker, DNS y HTTPS

Este documento explica como sacar CriptaDoge Web fuera de la red local y dejarlo accesible desde Internet usando Docker Compose, DNS, Nginx y HTTPS.

Si el despliegue se hara desde una maquina local, revisar tambien `docs/pendientes-despliegue-local.md` para ver la lista concreta de tareas pendientes de red, router, DNS y certificados.

## Objetivo

La aplicacion debe poder ejecutarse en un servidor y estar disponible desde un dominio, por ejemplo:

```text
https://criptadoge.com
https://www.criptadoge.com
```

El usuario solo debe entrar por HTTP/HTTPS. Los servicios internos, como backend, PostgreSQL, MongoDB y frontend, deben comunicarse entre contenedores por la red interna de Docker y no exponerse directamente a Internet.

## Arquitectura recomendada

```text
Internet
   |
   | DNS: cripta.example.com -> IP publica del servidor
   |
Firewall / router / proveedor cloud
   |
   | Puertos publicos: 80 y 443
   |
Nginx publico
   |
   +-- front:80       frontend compilado
   +-- back:3000      API NestJS
   +-- db:5432        PostgreSQL interno
   +-- mongo:27017    MongoDB interno
```

En produccion, Nginx es el unico punto de entrada. El resto de contenedores usan `expose`, no `ports`.

## Piezas necesarias

Para salir a Internet hacen falta cuatro piezas:

- Un servidor encendido y accesible desde Internet.
- Una IP publica.
- Un dominio o subdominio apuntando a esa IP.
- Un reverse proxy con HTTPS escuchando en los puertos 80 y 443.

## Servidor recomendado

La forma mas limpia para produccion es desplegar en un VPS o servidor cloud.

Ventajas:

- Tiene IP publica estable.
- No depende del router de casa o del aula.
- Evita problemas de CG-NAT.
- Permite abrir solo los puertos necesarios.
- Es mas parecido a un entorno real de produccion.

En ese servidor se instala:

```bash
docker
docker compose
git
```

Despues se clona el repositorio, se configura `.env.production` y se levanta `docker-compose.prod.yml`.

## DNS

En el proveedor del dominio se deben crear registros DNS apuntando a la IP publica del servidor.

Ejemplo para IPv4:

```text
Tipo: A
Nombre: @
Valor: 123.123.123.123
TTL: automatico
```

Ejemplo para `www`:

```text
Tipo: CNAME
Nombre: www
Valor: cripta.example.com
TTL: automatico
```

No hay que apuntar el dominio a los contenedores. El DNS apunta siempre a la IP publica del servidor. Dentro del servidor, Docker y Nginx enrutan hacia cada servicio.

## Puertos publicos

En produccion solo deberian estar abiertos:

```text
80/tcp   HTTP, necesario para redireccion y certificados
443/tcp  HTTPS, trafico real de la aplicacion
```

Opcionalmente:

```text
22/tcp   SSH, solo para administracion del servidor
```

No se deben publicar estos puertos hacia Internet:

```text
3000   backend NestJS
5173   Vite dev server
5432   PostgreSQL
27017  MongoDB
```

En Docker Compose esto significa usar `expose` para servicios internos y `ports` solo en Nginx o en el proxy publico.

## Docker Compose de produccion

El archivo `docker-compose.prod.yml` debe publicar solo Nginx:

```yaml
services:
  front:
    build:
      context: ./frontCripta
      target: prod
    expose:
      - "80"

  back:
    build:
      context: ./backCripta
      target: prod
    expose:
      - "3000"

  db:
    image: postgres:17-alpine
    expose:
      - "5432"

  mongo:
    image: mongo:8
    expose:
      - "27017"

  nginx:
    image: nginx:1.27-alpine
    ports:
      - "80:80"
      - "443:443"
```

El archivo real del proyecto ya sigue esta estrategia: `front`, `back`, `db` y `mongo` usan `expose`, y solo `nginx` publica puertos al host.

## HTTPS

Hay dos enfoques razonables.

### Opcion A: Nginx del proyecto gestiona HTTPS

Esta es la opcion configurada en el repositorio. El contenedor `nginx` publica `80` y `443`, monta certificados desde `./letsencrypt` y define:

- Un `server` en puerto `80` para redirigir a HTTPS.
- Un `server` en puerto `443 ssl` para servir la aplicacion.
- Un webroot en `./certbot/www` para renovaciones ACME.

La configuracion vive en `nginx/nginx.prod.conf` y se monta como template de la imagen oficial de Nginx. Las variables se toman de `.env.production`:

```env
NGINX_SERVER_NAME=cripta.example.com www.cripta.example.com
TLS_CERTIFICATE=/etc/letsencrypt/live/cripta.example.com/fullchain.pem
TLS_CERTIFICATE_KEY=/etc/letsencrypt/live/cripta.example.com/privkey.pem
```

Los certificados se generan con Let's Encrypt y Certbot. Para la primera emision, el puerto `80` debe estar libre y el DNS ya debe apuntar al servidor:

```bash
make certbot-issue-prod CERTBOT_DOMAIN=cripta.example.com CERTBOT_EMAIL=admin@cripta.example.com CERTBOT_EXTRA_DOMAINS="www.cripta.example.com"
```

Despues se arranca la aplicacion:

```bash
make up-prod-build
```

Para renovar certificados con la aplicacion ya levantada:

```bash
make certbot-renew-prod
```

### Opcion B: proxy externo para HTTPS

Otra opcion es poner delante un proxy dedicado como Caddy, Traefik o Nginx Proxy Manager.

En ese caso:

- El proxy externo publica `80` y `443`.
- Ese proxy genera y renueva certificados.
- El Nginx interno del proyecto queda sin exponer publicamente o se publica solo dentro de una red Docker compartida.

Esta opcion suele ser mas comoda si en el mismo servidor van a convivir varias aplicaciones.

## Nginx del proyecto

En `nginx/nginx.prod.conf` no se escribe el dominio directamente. Se usa:

```nginx
server_name ${NGINX_SERVER_NAME};
```

Y en `.env.production` se define el dominio real:

```env
NGINX_SERVER_NAME=cripta.example.com www.cripta.example.com
```

La configuracion mantiene estas cabeceras hacia el backend:

```nginx
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
```

## Variables de entorno de produccion

El archivo `.env.production` debe tener valores pensados para el dominio publico.

Ejemplo:

```env
FRONTEND_URL=https://cripta.example.com
VITE_API_URL=https://cripta.example.com/api
GOOGLE_CALLBACK_URL=https://cripta.example.com/api/auth/google/callback
DATABASE_URL=postgresql://usuario:password@db:5432/backCripta
MONGO_URL=mongodb://mongo:27017/cripta-db
JWT_SECRET=un_secreto_largo_y_privado
JWT_EXPIRES_IN=1d
NGINX_SERVER_NAME=cripta.example.com www.cripta.example.com
TLS_CERTIFICATE=/etc/letsencrypt/live/cripta.example.com/fullchain.pem
TLS_CERTIFICATE_KEY=/etc/letsencrypt/live/cripta.example.com/privkey.pem
```

Importante:

- No usar `localhost` dentro de contenedores para conectar con otros servicios.
- Usar nombres de servicio Docker: `db`, `mongo`, `back`, `front`.
- No subir `.env.production` real al repositorio.

## Prisma en produccion

En desarrollo puede tener sentido usar `prisma db push`, pero en produccion se debe usar:

```bash
prisma migrate deploy
```

Esto aplica migraciones versionadas sin borrar datos.

No se debe usar en produccion:

```bash
prisma db push --force-reset --accept-data-loss
```

Ese comando puede destruir datos.

## Alternativa desde red domestica o aula

Tambien se podria sacar desde una maquina local, pero es menos recomendable.

Harian falta estos pasos:

- La maquina debe estar siempre encendida.
- El router debe tener port forwarding hacia esa maquina.
- Se deben abrir los puertos `80` y `443`.
- El dominio debe apuntar a la IP publica del router.
- Si la IP publica cambia, hay que usar DNS dinamico.
- Si el proveedor usa CG-NAT, no se podra abrir directamente desde Internet.

En ese caso, una alternativa es usar un tunel como Cloudflare Tunnel o Tailscale Funnel, pero para una entrega de despliegue suele ser mas claro usar un VPS.

## Comandos de arranque

Emitir certificados iniciales:

```bash
make certbot-issue-prod CERTBOT_DOMAIN=cripta.example.com CERTBOT_EMAIL=admin@cripta.example.com CERTBOT_EXTRA_DOMAINS="www.cripta.example.com"
```

Produccion:

```bash
make up-prod-build
```

Ver logs:

```bash
make logs-prod
```

Parar:

```bash
make down-prod
```

Renovar certificados:

```bash
make certbot-renew-prod
```

## Checklist

- [ ] El dominio resuelve a la IP publica del servidor.
- [ ] El firewall solo permite `80`, `443` y, si hace falta, `22`.
- [ ] Nginx es el unico servicio publicado al host.
- [ ] Backend, frontend, PostgreSQL y MongoDB no exponen puertos publicos.
- [ ] El frontend se sirve desde build estatico.
- [ ] El backend arranca en modo produccion.
- [ ] Prisma usa `migrate deploy`.
- [ ] La API responde bajo `/api`.
- [ ] La web carga con HTTPS.
- [ ] Las variables `FRONTEND_URL` y `VITE_API_URL` usan el dominio publico.
- [ ] Los secretos reales no estan subidos al repositorio.
