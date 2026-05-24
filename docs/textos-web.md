# Textos configurables de la web

Este documento describe la solucion del issue 76: gestionar desde la app los textos visibles de la web sin dejar de tener valores por defecto seguros en frontend.

## Objetivo

La fuente editable principal de los textos es MongoDB. Los archivos del frontend y los seeders solo sirven para inicializar datos y para mantener la web estable si falta una key en base de datos.

Esto permite que un ADMIN pueda modificar textos como titulares, subtitulos, CTAs o textos legales sin desplegar codigo.

## Modelo de datos

Coleccion: `webtexts`

Schema backend: `backCripta/src/web-texts/schemas/web-text.schema.ts`

| Campo | Tipo | Uso |
| ----- | ---- | --- |
| `key` | `string` | Identificador estable del texto. Ejemplo: `home.hero.subtitle` |
| `value` | `string` | Contenido editable |
| `section` | `string` | Agrupacion para consultar por bloques. Ejemplo: `home.hero` |
| `type` | `text \| textarea \| markdown` | Tipo de control recomendado para futura UI admin |
| `locale` | `string` | Idioma del texto. Por defecto `es` |
| `createdAt` | `Date` | Generado por Mongoose |
| `updatedAt` | `Date` | Generado por Mongoose |

Hay un indice unico por `{ key, locale }`, asi que una misma key puede existir en varios idiomas, pero no duplicada dentro del mismo idioma.

## Convencion de keys

Usar keys estables, legibles y agrupadas por seccion:

```text
nav.links.home
home.hero.titlePrefix
home.hero.subtitle
home.about.body
home.membership.ctaButton
auth.submit.login
footer.copyright
```

Reglas recomendadas:

- No cambiar una key si ya esta en uso en frontend; editar `value`.
- Si se elimina una key de MongoDB, el frontend usara el fallback local.
- Si se anade una key nueva, anadirla tambien a `frontCripta/src/data/webTextDefaults.ts`.
- Mantener `section` alineado con el prefijo logico de la key para poder consultar bloques completos.

## Endpoints

Base directa: `http://localhost:3000`

Base via Nginx: `http://localhost:8080/api`

| Metodo | Ruta | Auth | Descripcion |
| ------ | ---- | ---- | ----------- |
| `GET` | `/web-texts` | Publico | Lista textos. Acepta `locale` y `section` |
| `GET` | `/web-texts/admin` | ADMIN | Lista textos para gestion interna |
| `POST` | `/web-texts` | ADMIN | Crea un texto |
| `PATCH` | `/web-texts/:id` | ADMIN | Actualiza un texto |

Ejemplo publico por seccion:

```http
GET /web-texts?locale=es&section=home.hero
```

Ejemplo de creacion:

```json
{
  "key": "home.hero.subtitle",
  "value": "Asociacion sin animo de lucro dedicada al ocio alternativo.",
  "section": "home.hero",
  "type": "textarea",
  "locale": "es"
}
```

Ejemplo de edicion:

```json
{
  "value": "Nuevo texto visible en la web"
}
```

## Seeder inicial

Seeder: `backCripta/prisma/seeders/web-texts.cjs`

El comando general del backend ya lo ejecuta:

```bash
npm run seed
```

El seeder usa `$setOnInsert`, por lo que solo crea textos que no existen. Esto evita sobrescribir cambios hechos por ADMIN desde la app.

Cuando se anadan textos nuevos:

1. Anadir la key al array `TEXTOS` del seeder.
2. Anadir la misma key a `frontCripta/src/data/webTextDefaults.ts`.
3. Usar la key desde el componente con `useWebTexts`.
4. Documentar la nueva seccion si introduce un bloque nuevo.

## Frontend y fallback

Defaults locales: `frontCripta/src/data/webTextDefaults.ts`

Servicio API: `frontCripta/src/services/webTextsService.ts`

Hook: `frontCripta/src/hooks/useWebTexts.ts`

Uso recomendado:

```tsx
const text = useWebTexts("home.hero");

return <p>{text("home.hero.subtitle")}</p>;
```

Flujo:

1. El componente carga textos remotos con `GET /web-texts?section=...&locale=es`.
2. El hook mezcla respuesta remota con `WEB_TEXT_DEFAULTS`.
3. Si falla la API o falta una key, se muestra el default local.

Esto evita pantallas vacias si MongoDB no tiene datos, si el seeder no se ha ejecutado o si una key se borra por error.

## Secciones disponibles en el seeder

El seeder inicial cubre el inventario completo de textos visibles actuales de la web:

- `nav`: marca, enlaces principales y botones de sesion/membresia.
- `home.hero`: titular, subtitulo y CTAs del hero.
- `home.about`: bloque informativo, actividades, pilares y estadisticas.
- `home.membership`: cabecera, beneficios, CTA y modal de interes.
- `home.events`: cabecera del calendario, estados, vacios, modal y acciones.
- `home.location`: cabecera, direccion, horario y contacto rapido.
- `home.sponsors`: cabecera, tiers, CTA y textos de patrocinadores mock.
- `home.contact`: cabecera, formulario, estados, redes sociales, Twitch e Instagram.
- `cards`: album, rarezas, compra y apertura de sobres.
- `footer`: marca, columnas, legales, contacto, copyright y vuelta arriba.
- `auth`: pantalla de login/registro, placeholders, CTAs, errores y mensajes.
- `profile`: modal de perfil, estados, membresia, errores y logout.

Actualmente los componentes ya consumen una parte de estas keys mediante `useWebTexts`; el resto queda sembrado como inventario editable y fallback preparado para migrar los textos hardcodeados progresivamente.

## Seguridad y contenido

Por defecto se priorizan `text` y `textarea`.

`markdown` queda reservado para textos que realmente lo necesiten. Si en el futuro se renderiza Markdown en frontend, debe sanitizarse antes de pintar HTML.

No usar HTML libre como `value` salvo que se implemente una sanitizacion explicita.

## Multiidioma

La estructura ya permite evolucionar a multiidioma:

- Misma `key`.
- Distinto `locale`.
- Indice unico `{ key, locale }`.

Ejemplo:

```json
{
  "key": "home.hero.subtitle",
  "value": "Alternative leisure association...",
  "section": "home.hero",
  "type": "textarea",
  "locale": "en"
}
```

El frontend acepta `locale` en `useWebTexts(section, locale)`, aunque actualmente se usa `es` por defecto.
