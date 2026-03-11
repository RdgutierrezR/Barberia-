# Modelo de Base de Datos

Este documento describe la estructura de la base de datos del sistema Barbería Pro.

## Diagrama Entidad-Relación

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   BARBERIAS    │       │    BARBEROS     │       │    CLIENTES    │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id_barberia (PK)│──┐    │ id_barbero (PK) │       │ id_cliente (PK)│
│ nombre          │  │    │ id_barberia (FK)│──┐    │ id_barberia(FK)│
│ direccion       │  │    │ nombre          │  │    │ nombre         │
│ telefono        │  │    │ telefono        │  │    │ telefono       │
│ correo          │  │    │ correo          │  │    │ correo         │
│ codigo_qr       │  │    │ contrasena      │  │    │ codigo_qr      │
│ activa          │  │    │ rol             │  │    │ activo         │
│ fecha_creacion  │  │    │ activo          │  │    └────────┬────────┘
└─────────────────┘  │    │ comision_%     │  │             │
                    │    └────────┬────────┘  │             │
                    │             │         │             │
                    │             │         │             │
┌─────────────────┐  │      ┌─────┴─────┐   │      ┌──────┴──────┐
│    SERVICIOS    │  │      │  TURNOS   │   │      │   TURNOS    │
├─────────────────┤  │      ├───────────┤   │      │  (cliente)   │
│ id_servicio (PK)│  │◄─────│ id_turno  │◄──┼──────│ id_cliente   │
│ id_barberia(FK) │  │      │ id_barberia   │      └──────────────┘
│ nombre          │  │      │ id_barbero    │
│ descripcion     │  │      │ id_cliente    │
│ precio          │  │      │ id_servicio   │
│ duracion_minutos│  │      │ fecha_hora    │
│ activo          │  │      │ tipo_reserva  │
└─────────────────┘  │      │ estado        │
                     │      │ precio_final  │
                     │      └───────────────┘
                     │
┌─────────────────┐  │
│    HORARIOS     │  │
├─────────────────┤  │
│ id_horario (PK) │  │
│ id_barberia(FK) │  │
│ id_barbero (FK) │◄─┘
│ dia_semana      │
│ hora_inicio     │
│ hora_fin        │
│ activo          │
└─────────────────┘

┌─────────────────┐       ┌─────────────────┐
│   BLOQUEOS     │       │  CONTABILIDAD   │
├─────────────────┤       ├─────────────────┤
│ id_bloqueo (PK)│       │ id_registro(PK) │
│ id_barberia(FK)│       │ id_barberia(FK) │
│ id_barbero (FK)│       │ id_barbero (FK) │
│ fecha_inicio   │       │ id_turno   (FK) │
│ fecha_fin      │       │ monto          │
│ motivo         │       │ tipo           │
│ activo         │       │ descripcion    │
└─────────────────┘       │ fecha          │
                          └─────────────────┘
```

---

## Tablas de la Base de Datos

### 1. Barberías (`barberias`)

Almacena la información de las barberías (multi-tenant).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_barberia` | INTEGER (PK) | ID único de la barbería |
| `nombre` | VARCHAR(100) | Nombre de la barbería |
| `direccion` | VARCHAR(255) | Dirección física |
| `telefono` | VARCHAR(20) | Teléfono de contacto |
| `correo` | VARCHAR(100) | Correo electrónico |
| `logo_url` | VARCHAR(255) | URL del logo |
| `codigo_qr_base` | VARCHAR(50) | Código QR único para acceso |
| `activa` | BOOLEAN | Estado de la barbería |
| `fecha_creacion` | DATETIME | Fecha de creación |

**Índices:**
- `codigo_qr_base` (único)

---

### 2. Barberos (`barberos`)

Usuarios que trabajan en las barberías.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_barbero` | INTEGER (PK) | ID único del barbero |
| `id_barberia` | INTEGER (FK) | Barbería a la que pertenece |
| `nombre` | VARCHAR(100) | Nombre completo |
| `telefono` | VARCHAR(20) | Teléfono de contacto |
| `correo` | VARCHAR(100) | Correo electrónico (único por barbería) |
| `contrasena` | VARCHAR(255) | Hash de contraseña |
| `rol` | VARCHAR(20) | Rol: "owner", "barbero" |
| `activo` | BOOLEAN | Estado del barbero |
| `foto_url` | VARCHAR(255) | URL de foto de perfil |
| `comision_porcentaje` | NUMERIC(5,2) | Porcentaje de comisión |

**Relaciones:**
- FK → `barberias(id_barberia)`

---

### 3. Clientes (`clientes`)

Clientes registrados en el sistema.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_cliente` | INTEGER (PK) | ID único del cliente |
| `id_barberia` | INTEGER (FK) | Barbería a la que pertenece |
| `nombre` | VARCHAR(100) | Nombre del cliente |
| `telefono` | VARCHAR(20) | Teléfono (único por barbería) |
| `correo` | VARCHAR(100) | Correo electrónico |
| `codigo_qr` | VARCHAR(50) | Código QR personal |
| `activo` | BOOLEAN | Estado del cliente |

**Relaciones:**
- FK → `barberias(id_barberia)`

---

### 4. Servicios (`servicios`)

Servicios ofrecidos por cada barbería.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_servicio` | INTEGER (PK) | ID único del servicio |
| `id_barberia` | INTEGER (FK) | Barbería a la que pertenece |
| `nombre` | VARCHAR(100) | Nombre del servicio |
| `descripcion` | TEXT | Descripción del servicio |
| `precio` | NUMERIC(10,2) | Precio del servicio |
| `duracion_minutos` | INTEGER | Duración en minutos |
| `activo` | BOOLEAN | Estado del servicio |

**Relaciones:**
- FK → `barberias(id_barberia)`

---

### 5. Turnos (`turnos`)

Sistema de gestión de turnos (cola y citas).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_turno` | INTEGER (PK) | ID único del turno |
| `id_barberia` | INTEGER (FK) | Barbería |
| `id_barbero` | INTEGER (FK) | Barbero asignado |
| `id_cliente` | INTEGER (FK) | Cliente (nullable) |
| `id_servicio` | INTEGER (FK) | Servicio solicitado |
| `fecha_hora` | DATETIME | Fecha/hora del turno |
| `hora_programada` | VARCHAR(5) | Hora fija asignada (HH:MM) - solo para turnos en cola |
| `tipo_reserva` | VARCHAR(20) | "cola" o "cita" |
| `cita_fecha_hora` | DATETIME | Fecha específica para citas |
| `fecha_cita_original` | DATETIME | Fecha original (para contabilidad) |
| `fecha_inicio_servicio` | DATETIME | Cuándo inició el servicio |
| `fecha_fin_servicio` | DATETIME | Cuándo se completó el servicio |
| `duracion_minutos` | INTEGER | Duración real del servicio |
| `estado` | VARCHAR(20) | Estado: pendiente, en_proceso, completado, cancelado |
| `codigo_confirmacion` | VARCHAR(10) | Código único de confirmación |
| `notas` | TEXT | Notas del turno |
| `precio_final` | NUMERIC(10,2) | Precio final cobrado |
| `fecha_creacion` | DATETIME | Fecha de creación |

**Estados de Turno:**
- `pendiente`: En espera
- `en_proceso`: Actualmente atendiéndose
- `completado`: Servicio terminado
- `cancelado`: Turno cancelado

**Nota sobre hora_programada:**
- Este campo guarda la hora fija asignada al turno cuando se crea
- No cambia aunque pase el tiempo
- Solo aplica para turnos en cola
- Formato: "HH:MM" (ej: "14:30", "09:00")

**Relaciones:**
- FK → `barberias(id_barberia)`
- FK → `barberos(id_barbero)`
- FK → `clientes(id_cliente)`
- FK → `servicios(id_servicio)`

---

### 6. Horarios (`horarios`)

Horarios de trabajo de cada barbero.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_horario` | INTEGER (PK) | ID único del horario |
| `id_barberia` | INTEGER (FK) | Barbería |
| `id_barbero` | INTEGER (FK) | Barbero |
| `dia_semana` | INTEGER | Día (0=Domingo, 6=Sábado) |
| `hora_inicio` | TIME | Hora de inicio |
| `hora_fin` | TIME | Hora de fin |
| `activo` | BOOLEAN | Estado del horario |

**Relaciones:**
- FK → `barberias(id_barberia)`
- FK → `barberos(id_barbero)`

---

### 7. Bloqueos de Agenda (`bloqueos_agenda`)

Bloqueos de tiempo para barberos (vacaciones, permisos, etc.).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_bloqueo` | INTEGER (PK) | ID único del bloqueo |
| `id_barberia` | INTEGER (FK) | Barbería |
| `id_barbero` | INTEGER (FK) | Barbero |
| `fecha_inicio` | DATETIME | Inicio del bloqueo |
| `fecha_fin` | DATETIME | Fin del bloqueo |
| `motivo` | VARCHAR(100) | Razón del bloqueo |
| `activo` | BOOLEAN | Estado |
| `fecha_creacion` | DATETIME | Fecha de creación |

**Relaciones:**
- FK → `barberias(id_barberia)`
- FK → `barberos(id_barbero)`

---

### 8. Contabilidad (`contabilidad`)

Registro de ingresos por servicio.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_registro` | INTEGER (PK) | ID único del registro |
| `id_barberia` | INTEGER (FK) | Barbería |
| `id_barbero` | INTEGER (FK) | Barbero que atendió |
| `id_turno` | INTEGER (FK) | Turno relacionado |
| `monto` | NUMERIC(10,2) | Monto del servicio |
| `tipo` | VARCHAR(20) | Tipo de registro |
| `descripcion` | TEXT | Descripción |
| `fecha` | DATETIME | Fecha del registro |

**Relaciones:**
- FK → `barberias(id_barberia)`
- FK → `barberos(id_barbero)`
- FK → `turnos(id_turno)`

---

### 9. Invitaciones (`invitaciones`)

Códigos de invitación para crear nuevas barberías.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INTEGER (PK) | ID único |
| `codigo` | VARCHAR(20) | Código de invitación (único) |
| `tipo` | VARCHAR(30) | Tipo: "crear_barberia" |
| `usada` | BOOLEAN | Si ya fue usada |
| `fecha_creacion` | DATETIME | Fecha de creación |
| `fecha_expiracion` | DATETIME | Fecha de expiración |
| `creador_id` | INTEGER (FK) | Quien creó la invitación |
| `email_usado` | VARCHAR(100) | Email que usó la invitación |

---

## Tecnologías Used

- **ORM**: SQLAlchemy
- **Base de Datos**: SQLite (desarrollo)
- **Migraciones**: Flask-Migrate (configurable)

---

## Consultas Útiles

### Obtener todos los turnos de hoy

```sql
SELECT t.*, b.nombre as barbero, s.nombre as servicio, c.nombre as cliente
FROM turnos t
JOIN barberos b ON t.id_barbero = b.id_barbero
JOIN servicios s ON t.id_servicio = s.id_servicio
LEFT JOIN clientes c ON t.id_cliente = c.id_cliente
WHERE DATE(t.fecha_hora) = DATE('now')
AND t.id_barberia = 1;
```

### Obtener ingresos por barbero

```sql
SELECT b.nombre, SUM(c.monto) as total
FROM contabilidad c
JOIN barberos b ON c.id_barbero = b.id_barbero
WHERE c.id_barberia = 1
AND strftime('%Y-%m', c.fecha) = strftime('%Y-%m', 'now')
GROUP BY b.id_barbero;
```

### Obtener cola actual de un barbero

```sql
SELECT t.*, c.nombre as cliente
FROM turnos t
LEFT JOIN clientes c ON t.id_cliente = c.id_cliente
WHERE t.id_barberia = 1
AND t.id_barbero = 1
AND t.estado = 'pendiente'
AND DATE(t.fecha_hora) = DATE('now')
ORDER BY t.fecha_hora ASC;
```

---

## Notas Adicionales

1. **Multi-Tenant**: Cada barbería tiene sus propios registros aislados
2. **Eliminación Lógica**: Los registros se marcan como `activo = false` en lugar de eliminarse
3. **Fechas**: Todas las fechas usan la timezone configurada en el servidor (`TZ=America/Bogota` para Colombia)
4. **Contraseñas**: Se almacenan hasheadas con werkzeug.security
5. **Hora Programada**: Los turnos en cola guardan `hora_programada` para mostrar una hora fija que no cambia con el tiempo
6. **Limpieza**: Usar `limpiar_turnos_antiguos()` o el endpoint de API para eliminar turnos completados/cancelados antiguos
