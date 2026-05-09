# Reservas de mesas

Este documento recoge las reglas de negocio actuales para consultar huecos y
crear reservas de mesas en CriptaDoge.

## Modelo de datos

Las mesas y reservas se guardan en PostgreSQL mediante Prisma.

### Mesa

Campos principales:

- `id`: identificador UUID.
- `orden`: posicion visible de la mesa, unica.
- `asientos`: capacidad total de la mesa.
- `esDePago`: indica si la mesa genera precio informativo.

### ReservaMesa

Campos principales:

- `mesaId`: mesa reservada.
- `userId`: usuario que hace la reserva.
- `fechaHoraInicio`: inicio de la reserva.
- `fechaHoraFin`: fin de la reserva.
- `asientosReservados`: numero de asientos bloqueados.
- `precio`: importe informativo calculado al crear la reserva.
- `estado`: estado de la reserva.

Estados posibles:

- `PENDIENTE`
- `CONFIRMADA`
- `CANCELADA`
- `COMPLETADA`

Solo las reservas `PENDIENTE` y `CONFIRMADA` ocupan disponibilidad.

## Autenticacion y membresia

Todas las rutas de reservas requieren JWT. El `JwtAuthGuard` valida que el
usuario tenga una sesion autentica, pero la regla de membresia se aplica en
`ReservasService`, consultando siempre el `User.status` actual en base de
datos.

Estados relevantes:

- `Activo`: socio con membresia activa.
- `Inactivo`, `Pendiente` u otros estados no activos: pueden usar solo huecos
  gratuitos.
- `Desactivado`: no puede reservar mesas.

## Regla de acceso

La membresia determina que mesas puede reservar cada usuario:

| Estado del usuario | Mesas gratuitas | Mesas de pago |
| --- | --- | --- |
| `Activo` | Permitidas | Permitidas |
| No activo | Permitidas | Bloqueadas |
| `Desactivado` | Bloqueadas | Bloqueadas |

Si un usuario no activo intenta reservar una mesa de pago, la API responde con
`403 Forbidden`.

## Huecos disponibles

`GET /reservas/huecos` devuelve franjas disponibles segun el estado del usuario
autenticado:

- Si el usuario esta `Activo`, incluye mesas gratuitas y mesas de pago.
- Si el usuario no esta activo, filtra automaticamente a mesas gratuitas.

`GET /reservas/huecos/gratis` siempre filtra a mesas gratuitas.

La disponibilidad se calcula por asientos, no por mesa completa. Una reserva de
2 asientos en una mesa de 4 deja otros 2 asientos disponibles en el mismo rango.

## Validacion de asientos

Las reservas y consultas de disponibilidad solo aceptan cantidades pares de
asientos.

Reglas:

- Minimo: `2` asientos.
- El numero debe ser divisible entre `2`.
- No se puede solicitar mas que la capacidad total de la mesa.

## Calculo de precio

El precio es informativo. Se guarda en la reserva, pero no activa ningun cobro.

Mesas gratuitas:

- Siempre `0`.

Mesas de pago:

- Solo las pueden reservar socios con `status = "Activo"`.
- La primera hora es gratis para socios activos.
- A partir de ahi se cobra proporcionalmente a `1.25` euros por asiento y hora
  facturable.

Formula:

```text
horas_facturables = max(0, duracion_en_horas - 1)
precio = asientosReservados * 1.25 * horas_facturables
```

El resultado se redondea a dos decimales.

Ejemplos:

| Duracion | Asientos | Mesa | Estado usuario | Precio |
| --- | --- | --- | --- | --- |
| 1 hora | 2 | De pago | `Activo` | `0.00` |
| 2 horas | 2 | De pago | `Activo` | `2.50` |
| 2 horas | 4 | De pago | `Activo` | `5.00` |
| 2 horas | 2 | Gratuita | `Activo` | `0.00` |
| 2 horas | 2 | Gratuita | `Inactivo` | `0.00` |
| 2 horas | 2 | De pago | `Inactivo` | `403 Forbidden` |

## Horario de huecos

El servidor usa un horario provisional para generar franjas si el cliente no
envia un rango personalizado.

| Dia | Horario |
| --- | --- |
| Lunes | 17:00 - 22:00 |
| Martes | 17:00 - 22:00 |
| Miercoles | 17:00 - 22:00 |
| Jueves | 17:00 - 22:00 |
| Viernes | 17:00 - 00:00 |
| Sabado | 11:00 - 00:00 |
| Domingo | 11:00 - 20:00 |

La duracion por defecto de una franja es de `60` minutos. El cliente puede
enviar `duracionMinutos`, `desde` y `hasta`, siempre que el rango quede dentro
del horario oficial del dia.

## Endpoints relacionados

| Metodo | Ruta | Uso |
| --- | --- | --- |
| `POST` | `/reservas` | Crea una reserva aplicando reglas de membresia y precio |
| `GET` | `/reservas/disponibilidad` | Consulta disponibilidad de una mesa y rango |
| `GET` | `/reservas/huecos` | Lista huecos filtrados por estado de membresia |
| `GET` | `/reservas/huecos/gratis` | Lista solo huecos gratuitos |
| `GET` | `/reservas/mis-reservas` | Lista reservas del usuario autenticado |
| `GET` | `/reservas` | Lista todas las reservas, solo `ADMIN` |
| `PATCH` | `/reservas/:id/cancelar` | Cancela una reserva |

## Casos de negocio

### Socio activo reserva mesa de pago durante una hora

1. El usuario se autentica con JWT.
2. La API consulta `User.status`.
3. Como el estado es `Activo`, permite la mesa de pago.
4. Como la duracion es de una hora, el precio queda en `0`.

### Socio activo reserva mesa de pago durante dos horas

1. La primera hora queda bonificada.
2. La segunda hora es facturable.
3. Para 2 asientos, el precio es `2 * 1.25 * 1 = 2.50`.

### Usuario caducado consulta huecos

1. El usuario se autentica con JWT.
2. La API consulta `User.status`.
3. Como no esta `Activo`, `/reservas/huecos` devuelve solo mesas gratuitas.

### Usuario caducado intenta reservar mesa de pago

1. El usuario se autentica con JWT.
2. La API encuentra que la mesa tiene `esDePago = true`.
3. Como `User.status` no es `Activo`, se rechaza con `403 Forbidden`.

## Implementacion actual

La logica principal esta en:

- `backCripta/src/reservas/reservas.service.ts`
- `backCripta/src/reservas/reservas.controller.ts`
- `backCripta/src/reservas/reservas.service.spec.ts`

`ReservasService.create` es el punto que valida membresia al crear reserva y
calcula el precio final. `ReservasService.findAvailableSlots` filtra las mesas
visibles para el usuario segun su estado de membresia.
