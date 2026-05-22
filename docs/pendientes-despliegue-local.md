# Pendientes para despliegue publico desde maquina local

Este documento resume lo que falta fuera del codigo para poder publicar CriptaDoge Web desde una maquina local usando Docker, DNS, Nginx y HTTPS.

## 1. Preparar la maquina local

- Elegir la maquina que estara encendida para servir la web.
- Instalar Docker y Docker Compose.
- Clonar el repositorio en esa maquina.
- Asegurar que los puertos locales `80` y `443` no estan ocupados por otro servicio.
- Asignar una IP local fija a la maquina desde el router, por ejemplo `192.168.1.50`.

## 2. Confirmar si hay IP publica real

Antes de configurar el dominio hay que comprobar si el router tiene una IP publica real.

Pasos:

- Mirar la IP WAN en el panel del router.
- Compararla con la IP que aparece en una web de consulta de IP publica.
- Si no coinciden, probablemente hay CG-NAT.

Senales de CG-NAT:

- La IP WAN del router empieza por `100.64.x.x`.
- La IP WAN empieza por `10.x.x.x`, `172.16.x.x` a `172.31.x.x`, o `192.168.x.x`.
- La IP WAN del router no coincide con la IP publica vista desde Internet.

Si hay CG-NAT, el despliegue directo con port forwarding no funcionara. Opciones:

- Pedir al proveedor una IP publica.
- Usar Cloudflare Tunnel u otro tunel publico.
- Desplegar en un VPS/cloud.

## 3. Abrir puertos en el router

Configurar port forwarding hacia la IP local fija de la maquina:

```text
TCP 80  -> IP_LOCAL_MAQUINA:80
TCP 443 -> IP_LOCAL_MAQUINA:443
```

No abrir estos puertos a Internet:

```text
3000   backend NestJS
5173   Vite dev server
5432   PostgreSQL
27017  MongoDB
```

## 4. Configurar DNS del dominio

En el proveedor del dominio, crear o ajustar:

```text
A     @     IP_PUBLICA_DEL_ROUTER
CNAME www   dominio.com
```

Si se usa subdominio:

```text
A     app   IP_PUBLICA_DEL_ROUTER
```

Si la IP publica cambia con el tiempo, hara falta:

- Actualizar el registro DNS manualmente cada vez que cambie.
- O configurar DNS dinamico.

## 5. Configurar `.env.production`

En la maquina local:

```bash
cp .env.production.example .env.production
```

Editar `.env.production` con el dominio real:

```env
PUBLIC_DOMAIN=dominio.com
NGINX_SERVER_NAME=dominio.com www.dominio.com
FRONTEND_URL=https://dominio.com
VITE_API_URL=https://dominio.com/api
GOOGLE_CALLBACK_URL=https://dominio.com/api/auth/google/callback
TLS_CERTIFICATE=/etc/letsencrypt/live/dominio.com/fullchain.pem
TLS_CERTIFICATE_KEY=/etc/letsencrypt/live/dominio.com/privkey.pem
```

Tambien hay que cambiar los secretos de produccion:

- `POSTGRES_PASSWORD`
- `DATABASE_URL`
- `ADMIN_PASSWORD`
- `JWT_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `TWITCH_CLIENT_ID`
- `TWITCH_CLIENT_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

No subir `.env.production` real al repositorio.

## 6. Emitir certificados HTTPS

Antes de este paso deben cumplirse estas condiciones:

- El DNS ya apunta a la IP publica del router.
- El router redirige el puerto `80` hacia la maquina local.
- El puerto `80` esta libre en la maquina local.

Comando:

```bash
make certbot-issue-prod CERTBOT_DOMAIN=dominio.com CERTBOT_EMAIL=admin@dominio.com CERTBOT_EXTRA_DOMAINS="www.dominio.com"
```

Si solo se usa un subdominio, por ejemplo `app.dominio.com`:

```bash
make certbot-issue-prod CERTBOT_DOMAIN=app.dominio.com CERTBOT_EMAIL=admin@dominio.com
```

## 7. Levantar produccion

```bash
make up-prod-build
```

Comprobar estado:

```bash
make ps-prod
```

Ver logs:

```bash
make logs-prod
```

## 8. Validar desde fuera de la red

Probar desde una red externa, por ejemplo usando datos moviles:

```text
https://dominio.com
https://dominio.com/api
```

Comprobaciones esperadas:

- La web carga por HTTPS.
- La API responde bajo `/api`.
- HTTP redirige a HTTPS.
- No son accesibles publicamente `3000`, `5173`, `5432` ni `27017`.

## Checklist final

- [ ] Maquina local elegida y siempre encendida.
- [ ] Docker y Docker Compose instalados.
- [ ] IP local fija configurada en el router.
- [ ] Confirmado que no hay CG-NAT, o elegida alternativa.
- [ ] Puertos `80` y `443` redirigidos hacia la maquina local.
- [ ] DNS del dominio apuntando a la IP publica del router.
- [ ] `.env.production` creado con dominio y secretos reales.
- [ ] Certificados Let's Encrypt emitidos.
- [ ] Produccion levantada con `make up-prod-build`.
- [ ] Web validada desde una red externa.
