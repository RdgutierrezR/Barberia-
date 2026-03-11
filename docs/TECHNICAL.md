# BarberAPP - Documentación Técnica Completa

## Índice

1. [Introducción](#introducción)
2. [Arquitectura](#arquitectura)
3. [Modelos de Base de Datos](#modelos-de-base-de-datos)
4. [API Endpoints](#api-endpoints)
5. [Funcionalidades](#funcionalidades)
6. [Frontend](#frontend)
7. [Configuración](#configuración)
8. [Desarrollo y Producción](#desarrollo-y-producción)

---

## Introducción

BarberAPP es un sistema de gestión multi-tenant para barberías desarrollado con Flask (backend) y React (frontend).

### Características Principales

- **Multi-Tenant**: Múltiples barberías en una sola instancia
- **Sistema de Turnos**: Cola dinámica con hora fija y citas programadas
- **Gestión de Barberos**: Comisiones, horarios, panel individual
- **Contabilidad**: Registro de ingresos, métricas y reportes
- **Código QR**: Acceso rápido para clientes
- **Notificaciones**: WhatsApp via Twilio
- **Timezone**: Configuración automática para Colombia (America/Bogota)
- **UI Responsiva**: Adaptable a dispositivos móviles

---

## Arquitectura

### Stack Tecnológico

| Componente | Tecnología |
|------------|-----------|
| Backend | Python 3.11+, Flask |
| ORM | SQLAlchemy |
| Base de datos | SQLite (dev) / MySQL-PostgreSQL (prod) |
| Autenticación | JWT (Flask-JWT-Extended) |
| Frontend | React 19, Vite |
| Enrutamiento | React Router v6 |
| Estilos | CSS3 con diseño dark |

### Estructura del Proyecto

```
Barberia/
├── BACKEND/
│   ├── modelo/           # Modelos SQLAlchemy
│   │   ├── barberia.py
│   │   ├── barbero.py
│   │   ├── cliente.py
│   │   ├── servicio.py
│   │   ├── turno.py
│   │   ├── horario.py
│   │   ├── horario_dia.py
│   │   ├── bloqueo_agenda.py
│   │   ├── contabilidad.py
│   │   └── invitacion.py
│   ├── controlador/      # Lógica de negocio
│   │   ├── barberia.py
│   │   ├── barbero.py
│   │   ├── cliente.py
│   │   ├── servicio.py
│   │   ├── turno.py
│   │   ├── horario.py
│   │   ├── horario_dia.py
│   │   ├── contabilidad.py
│   │   ├── notificacion.py
│   │   └── invitacion.py
│   ├── rutas/           # Endpoints API (Blueprints)
│   │   ├── barberias.py
│   │   ├── barberos.py
│   │   ├── clientes.py
│   │   ├── servicios.py
│   │   ├── turnos.py
│   │   ├── horarios.py
│   │   ├── horario_dia.py
│   │   ├── contabilidad.py
│   │   ├── auth.py
│   │   └── invitaciones.py
│   ├── app.py          # Aplicación principal
│   ├── database.py    # Configuración BD
│   ├── configuracion.py
│   └── fecha_actual.py # Utilidad de fechas
│
├── frontend/
│   ├── src/
│   │   ├── pages/      # Componentes de página
│   │   ├── api.js     # Cliente API
│   │   ├── config.js
│   │   └── utils/
│   │       └── fecha.js
│   └── package.json
│
└── docs/
```

---

## Modelos de Base de Datos

### 1. Barberías (`barberias`)

Almacena la información de las barberías (multi-tenant).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id_barberia | INTEGER (PK) | ID único |
| nombre | VARCHAR(100) | Nombre |
| direccion | VARCHAR(255) | Dirección |
| telefono | VARCHAR(20) | Teléfono de contacto |
| correo | VARCHAR(100) | Correo |
| logo_url | VARCHAR(255) | URL del logo |
| codigo_qr_base | VARCHAR(50) | Código QR único |
| activa | BOOLEAN | Estado |
| fecha_creacion | DATETIME | Fecha de creación |

---

### 2. Barberos (`barberos`)

Usuarios que trabajan en las barberías.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id_barbero | INTEGER (PK) | ID único |
| id_barberia | INTEGER (FK) | Barbería |
| nombre | VARCHAR(100) | Nombre completo |
| telefono | VARCHAR(20) | Teléfono |
| correo | VARCHAR(100) | Correo |
| contrasena | VARCHAR(255) | Hash de contraseña |
| rol | VARCHAR(20) | "owner" o "barbero" |
| activo | BOOLEAN | Estado |
| foto_url | VARCHAR(255) | URL de foto |
| comision_porcentaje | NUMERIC(5,2) | % de comisión |

---

### 3. Clientes (`clientes`)

Clientes registrados en el sistema.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id_cliente | INTEGER (PK) | ID único |
| id_barberia | INTEGER (FK) | Barbería |
| nombre | VARCHAR(100) | Nombre |
| telefono | VARCHAR(20) | Teléfono |
| correo | VARCHAR(100) | Correo |
| codigo_qr | VARCHAR(50) | Código QR personal |
| activo | BOOLEAN | Estado |

---

### 4. Servicios (`servicios`)

Servicios ofrecidos por cada barbería.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id_servicio | INTEGER (PK) | ID único |
| id_barberia | INTEGER (FK) | Barbería |
| nombre | VARCHAR(100) | Nombre |
| descripcion | TEXT | Descripción |
| precio | NUMERIC(10,2) | Precio |
| duracion_minutos | INTEGER | Duración |
| activo | BOOLEAN | Estado |

---

### 5. Turnos (`turnos`)

Sistema de gestión de turnos (cola y citas).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id_turno | INTEGER (PK) | ID único |
| id_barberia | INTEGER (FK) | Barbería |
| id_barbero | INTEGER (FK) | Barbero |
| id_cliente | INTEGER (FK) | Cliente |
| id_servicio | INTEGER (FK) | Servicio |
| fecha_hora | DATETIME | Fecha/hora del turno |
| hora_programada | VARCHAR(5) | Hora fija (HH:MM) |
| tipo_reserva | VARCHAR(20) | "cola" o "cita" |
| cita_fecha_hora | DATETIME | Fecha para citas |
| fecha_cita_original | DATETIME | Fecha original |
| fecha_inicio_servicio | DATETIME | Inicio del servicio |
| fecha_fin_servicio | DATETIME | Fin del servicio |
| duracion_minutos | INTEGER | Duración real |
| estado | VARCHAR(20) | Estado del turno |
| codigo_confirmacion | VARCHAR(10) | Código de confirmación |
| notas | TEXT | Notas |
| precio_final | NUMERIC(10,2) | Precio cobrado |
| fecha_creacion | DATETIME | Fecha de creación |

**Estados de Turno:**
- `pendiente`: En espera
- `en_proceso`: Siendo atendido
- `completado`: Terminado
- `cancelado`: Cancelado

---

### 6. Horarios (`horarios`)

Horarios semanales de trabajo.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id_horario | INTEGER (PK) | ID único |
| id_barberia | INTEGER (FK) | Barbería |
| id_barbero | INTEGER (FK) | Barbero |
| dia_semana | INTEGER | 0=Domingo, 6=Sábado |
| hora_inicio | TIME | Hora de inicio |
| hora_fin | TIME | Hora de fin |
| activo | BOOLEAN | Estado |

---

### 7. Horarios Día (`horarios_dia`)

Override de horario para día específico.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id_horario_dia | INTEGER (PK) | ID único |
| id_barberia | INTEGER (FK) | Barbería |
| id_barbero | INTEGER (FK) | Barbero |
| fecha | DATE | Fecha específica |
| hora_inicio | TIME | Hora de inicio |
| hora_fin | TIME | Hora de fin |
| activo | BOOLEAN | Estado |

**Prioridad**: HorarioDia > Horario > Default (9:00-18:00)

---

### 8. Bloqueos (`bloqueos_agenda`)

Bloqueos de tiempo (vacaciones, permisos).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id_bloqueo | INTEGER (PK) | ID único |
| id_barberia | INTEGER (FK) | Barbería |
| id_barbero | INTEGER (FK) | Barbero |
| fecha_inicio | DATETIME | Inicio |
| fecha_fin | DATETIME | Fin |
| motivo | VARCHAR(100) | Razón |
| activo | BOOLEAN | Estado |

---

### 9. Contabilidad (`contabilidad`)

Registro de ingresos por servicio.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id_registro | INTEGER (PK) | ID único |
| id_barberia | INTEGER (FK) | Barbería |
| id_barbero | INTEGER (FK) | Barbero |
| id_turno | INTEGER (FK) | Turno |
| monto | NUMERIC(10,2) | Monto |
| tipo | VARCHAR(20) | Tipo (ingreso/gasto) |
| descripcion | TEXT | Descripción |
| fecha | DATETIME | Fecha |

---

### 10. Invitaciones (`invitaciones`)

Códigos para crear barberías.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER (PK) | ID único |
| codigo | VARCHAR(20) | Código único |
| tipo | VARCHAR(30) | Tipo |
| usada | BOOLEAN | Si fue usada |
| fecha_creacion | DATETIME | Fecha de creación |
| fecha_expiracion | DATETIME | Fecha de expiración |
| creador_id | INTEGER | Creador |
| email_usado | VARCHAR(100) | Email usado |

---

## API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /auth/barbero/login | Login de barbero |
| POST | /auth/barbero/registro | Registro de barbero |
| POST | /auth/barberia/registro | Registro con invitación |
| GET | /auth/barbero/verificar | Verificar token |

### Barberías

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /barberias/ | Listar todas |
| GET | /barberias/{id} | Obtener por ID |
| GET | /barberias/qr/{codigo} | Por código QR |
| POST | /barberias/ | Crear |
| PUT | /barberias/{id} | Actualizar |
| DELETE | /barberias/{id} | Eliminar |

### Barberos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /barberias/{id}/barberos/ | Listar |
| GET | /barberias/{id}/barberos/{id} | Obtener |
| POST | /barberias/{id}/barberos/ | Crear |
| PUT | /barberias/{id}/barberos/{id} | Actualizar |
| DELETE | /barberias/{id}/barberos/{id} | Eliminar |

### Clientes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /barberias/{id}/clientes/ | Listar |
| GET | /barberias/{id}/clientes/{id} | Obtener |
| GET | /barberias/{id}/clientes/qr/{codigo} | Por QR |
| GET | /barberias/{id}/clientes/telefono?telefono=... | Por teléfono |
| POST | /barberias/{id}/clientes/ | Crear |
| PUT | /barberias/{id}/clientes/{id} | Actualizar |
| DELETE | /barberias/{id}/clientes/{id} | Eliminar |

### Servicios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /barberias/{id}/servicios/ | Listar |
| GET | /barberias/{id}/servicios/{id} | Obtener |
| POST | /barberias/{id}/servicios/ | Crear |
| PUT | /barberias/{id}/servicios/{id} | Actualizar |
| DELETE | /barberias/{id}/servicios/{id} | Eliminar |

### Turnos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /barberias/{id}/turnos/ | Listar (con filtros) |
| GET | /barberias/{id}/turnos/{id} | Obtener por ID |
| GET | /barberias/{id}/turnos/codigo/{codigo} | Por código |
| GET | /barberias/{id}/turnos/cola/{id_barbero} | Cola de barbero |
| GET | /barberias/{id}/turnos/cola/{id_barbero}/diaria | Cola diaria |
| PUT | /barberias/{id}/turnos/cola/{id_barbero}/siguiente | Pasar siguiente |
| PUT | /barberias/{id}/turnos/cola/{id_barbero}/finalizar | Finalizar sin avanzar |
| PUT | /barberias/{id}/turnos/cola/{id_barbero}/forzar | Forzar siguiente |
| PUT | /barberias/{id}/turnos/cola/reordenar | Reordenar |
| PUT | /barberias/{id}/turnos/{id}/llegada | Marcar llegada |
| PUT | /barberias/{id}/turnos/{id}/cancelar | Cancelar turno |
| PUT | /barberias/{id}/turnos/{id}/agregar-a-cola | Cita a cola |
| POST | /barberias/{id}/turnos/cola | Crear turno en cola |
| POST | /barberias/{id}/turnos/cita | Crear cita |
| POST | /barberias/{id}/turnos/limpiar?dias=30 | Limpiar turnos |
| GET | /barberias/{id}/turnos/citas | Listar citas |
| GET | /barberias/{id}/turnos/disponibilidad/{id_barbero} | Disponibilidad |
| GET | /barberias/{id}/turnos/bloqueos | Listar bloqueos |
| POST | /barberias/{id}/turnos/bloqueos | Crear bloqueo |
| DELETE | /barberias/{id}/turnos/bloqueos/{id} | Eliminar bloqueo |

### Horarios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /barberias/{id}/horarios/ | Listar |
| GET | /barberias/{id}/horarios/{id} | Obtener |
| POST | /barberias/{id}/horarios/ | Crear |
| DELETE | /barberias/{id}/horarios/{id} | Eliminar |

### Horario Día

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /barberias/{id}/horario-dia/ | Listar |
| GET | /barberias/{id}/horario-dia/hoy | Hoy |
| GET | /barberias/{id}/horario-dia/trabajo | Horario de trabajo |
| POST | /barberias/{id}/horario-dia/ | Crear |
| PUT | /barberias/{id}/horario-dia/{id} | Actualizar |
| DELETE | /barberias/{id}/horario-dia/{id} | Eliminar |

### Contabilidad

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /barberias/{id}/contabilidad/ | Listar |
| GET | /barberias/{id}/contabilidad/barbero/{id} | Por barbero |
| GET | /barberias/{id}/contabilidad/barbero/{id}/resumen | Resumen barbero |
| GET | /barberias/{id}/contabilidad/resumen | Resumen barbería |
| GET | /barberias/{id}/contabilidad/metricas/barbero/{id} | Métricas barbero |
| GET | /barberias/{id}/contabilidad/metricas/servicios | Métricas servicios |
| GET | /barberias/{id}/contabilidad/metricas/barberia | Métricas barbería |
| GET | /barberias/{id}/contabilidad/metricas/operacionales/{id} | Métricas operacionales |

### Invitaciones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /invitaciones/ | Listar |
| POST | /invitaciones/ | Crear |
| POST | /invitaciones/usar | Usar invitación |

---

## Funcionalidades

### Sistema de Cola

**Características:**
- Hora fija asignada al crear turno (no cambia con el tiempo)
- Intervalos de 30 minutos entre turnos
- Posición en cola calculada automáticamente
- Mostrar todos los turnos pendientes (sin límite de fecha)

**Botones del panel:**
- **"✓ Finalizar"**: Finaliza turno y llama al siguiente
- **"⏭ Solo fin"**: Finaliza turno SIN avanzar la cola
- **"✕"**: Cancelar turno directamente

### Citas Programadas

- Cliente selecciona fecha y hora específica
- Sistema verifica disponibilidad
- Notificaciones al barbero
- Puede convertirse en turno de cola

### Timezone

**Backend** (`fecha_actual.py`):
```python
from fecha_actual import ahora, fecha_hoy

ahora()       # datetime actual
fecha_hoy()   # date de hoy
```

**Frontend** (`utils/fecha.js`):
```javascript
import { getAhoraColombia, getHoraColombia } from './utils/fecha';

const ahora = getAhoraColombia();  // Date en Colombia
const hora = getHoraColombia();  // "14:30"
```

**Producción**: Configurar `TZ=America/Bogota` en variables de entorno.

### Notificaciones WhatsApp

Integración con Twilio para enviar notificaciones:
- Nuevo turno asignado al barbero
- Turno confirmado al cliente

Configurar en `configuracion.py`:
```python
TWILIO_ACCOUNT_SID = 'your_sid'
TWILIO_AUTH_TOKEN = 'your_token'
TWILIO_WHATSAPP_NUMBER = 'whatsapp:+14155238886'
```

### Métricas

Panel de métricas disponible con:
- Turnos por barbero
- Ingresos por servicio
- Duración promedio
- Comparativos entre barberos

---

## Frontend

### Páginas

| Página | Ruta | Descripción |
|--------|------|-------------|
| Home | / | Página principal |
| Login | /login | Inicio de sesión |
| AdminPanel | /admin | Panel de admin |
| Barberia | /barberia/:id | Info barbería |
| OwnerDashboard | /barberia/:id/dashboard | Panel owner |
| BarberoDashboard | /barbero/:id/:id | Panel barbero |
| TurnoConfirmado | /turno/:codigo | Turno confirmado |
| VistaAgenda | - | Agenda de turnos |
| Contabilidad | - | Reportes contables |
| Metricas | - | Métricas y stats |

### Componentes UI

- **BarberoDashboard**: Panel principal del barbero con cola, agenda, métricas y contabilidad
- **OwnerDashboard**: Gestión de barbería, barberos, servicios
- **VistaAgenda**: Vista de horarios y citas
- **Contabilidad**: Reportes de ingresos

---

## Configuración

### Variables de Entorno

**Backend (.env):**
```env
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=tu-clave-secreta
DATABASE_URL=sqlite:///barberia.db
JWT_SECRET_KEY=tu-jwt-secret
TZ=America/Bogota
```

**Producción (Render/Railway):**
```env
TZ=America/Bogota
DATABASE_URL=postgresql://...
JWT_SECRET_KEY=...
```

### Notificaciones (Opcional)
```env
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_NUMBER=...
```

---

## Desarrollo y Producción

### URLs de Producción

| Componente | Servicio | URL |
|------------|----------|-----|
| Frontend | Vercel | https://barberia-ochre-eta.vercel.app |
| Backend | Render | https://barberapp.onrender.com |
| Base de datos | Railway | MySQL |

### Acceso a Producción

```
Aplicación: https://barberia-ochre-eta.vercel.app/login
API: https://barberapp.onrender.com/api
```

### Desarrollo Local

```bash
# Backend
cd BACKEND
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py

# Frontend
cd frontend
npm install
npm run dev
```

### Configuración de Producción

**Backend (Render):**
```
TZ=America/Bogota
DATABASE_URL=mysql://... (de Railway)
JWT_SECRET_KEY=...
SECRET_KEY=...
FLASK_ENV=production
```

**Frontend (Vercel):**
```
VITE_API_URL=https://barberapp.onrender.com
```

### Limpieza de Datos

```bash
# Limpiar turnos antiguos (30 días)
curl -X POST "https://barberapp.onrender.com/api/barberias/1/turnos/limpiar?dias=30"
```

---

## Glosario

| Término | Descripción |
|---------|-------------|
| Turno | Cita o lugar en la cola |
| Cola | Fila de espera |
| Owner | Dueño de barbería |
| Barbero | Empleado |
| Cliente | Usuario que recibe servicio |
| Comisión | Porcentaje para el barbero |
| Cita | Turno con hora específica |
| hora_programada | Hora fija asignada al turno |

---

## Licencia

MIT
