# BarberAPP - Sistema de Gestión Multi-Tenant para Barberías

<p align="center">
  <img src="https://img.shields.io/badge/Stack-Flask%20%2B%20React-blue" alt="Stack">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
  <img src="https://img.shields.io/badge/Version-1.2.0-orange" alt="Version">
</p>

<p align="center">
  <img src="./Captures/Princiapl x2.PNG" width="700" alt="Vista principal">
</p>

<p align="center">
  <img src="./Captures/elegir servicio.PNG" width="32%" alt="Selección de servicio">
  <img src="./Captures/elegir barbero x3.PNG" width="32%" alt="Selección de barbero">
  <img src="./Captures/turno confirmado.PNG" width="32%" alt="Turno confirmado">
</p>

<p align="center">
  <img src="./Captures/contabilidad X1.PNG" width="700" alt="Panel de contabilidad">
</p>

Sistema de gestión integral para barberías con soporte multi-tenant. Permite gestionar barberías, barberos, clientes, turnos, servicios, horarios y contabilidad.

## Características Principales

- **Gestión Multi-Tenant**: Múltiples barberías en una sola plataforma
- **Sistema de Turnos**: 
  - Cola dinámica con hora fija (no cambia con el tiempo)
  - Posición en cola (reordenar turnos)
  - Citas programadas
  - Intervalos de 30 minutos
  - Turnos rápidos (botón + en panel barbero) para clientes sin celular/internet
  - Cola diaria pública (sin JWT) para mostrar en pantalla
- **Gestión de Barberos**: 
  - Comisiones configurables
  - Horarios semanales y diarios
  - Panel individual de trabajo
  - Contador de tiempo en servicio
- **Contabilidad**: 
  - Registro automático de ingresos
  - Métricas y reportes
  - Por barbería y por barbero
  - Mapa de calor tipo GitHub (ingresos por día)
- **Código QR**: Acceso rápido para clientes
- **Notificaciones**: 
  - WhatsApp via Twilio (al cliente)
  - Web Push (al barbero cuando llega un turno)
- **PWA**: Aplicación web progresiva instalable
- **Timezone**: Configuración automática America/Bogota
- **UI Responsiva**: Diseño dark adaptativo para móviles
- **Iconos**: Lucide React profesionales

## Tecnologías

### Backend
- Python 3.11+
- Flask
- SQLAlchemy
- Flask-JWT-Extended
- Flask-CORS

### Frontend
- React 19
- Vite
- React Router v6

## Estructura del Proyecto

```
Barberia/
├── BACKEND/
│   ├── modelo/           # Modelos SQLAlchemy (10 modelos)
│   ├── controlador/      # Lógica de negocio
│   ├── rutas/           # Endpoints API (11 blueprints)
│   ├── app.py           # Aplicación principal
│   ├── database.py      # Configuración BD
│   ├── configuracion.py # Configuración
│   └── fecha_actual.py  # Utilidad de fechas
│
├── frontend/
│   ├── src/
│   │   ├── pages/       # 10 páginas React
│   │   ├── api.js      # Cliente API
│   │   ├── config.js
│   │   └── utils/fecha.js
│   └── package.json
│
└── docs/
    ├── TECHNICAL.md     # Documentación técnica
    ├── API.md           # API endpoints
    ├── DATABASE.md      # Modelos BD
    ├── USER_GUIDE.md    # Guía de usuario
    ├── INSTALL.md       # Instalación
    └── AGENTS.md        # Guía para desarrolladores
```

## Instalación

### Requisitos Previos
- Python 3.11+
- Node.js 18+
- npm

### Backend

```bash
cd BACKEND

# Crear entorno virtual
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Instalar dependencias
pip install -r requirements.txt

# Inicializar base de datos
python iniciar_db.py

# Ejecutar servidor
python app.py
```

### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
```

## Configuración de Producción

### Variables de Entorno

```env
# Backend
FLASK_APP=app.py
FLASK_ENV=production
DATABASE_URL=mysql+pymysql://user:pass@host:port/dbname?ssl_ca=/path/to/ca.pem&ssl_verify_cert=true
JWT_SECRET_KEY=tu-secret-key
SECRET_KEY=tu-secret-key
TZ=America/Bogota

# VAPID Keys (Web Push)
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...

# Twilio (opcional)
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
```

### Despliegue Recomendado

| Componente | Hosting recomendado |
|------------|-------------------|
| Backend | Render |
| Frontend | Vercel |
| Base de datos | MySQL Aiven |

## Documentación

- [Documentación Técnica](./docs/TECHNICAL.md) - Arquitectura completa
- [API Reference](./docs/API.md) - Todos los endpoints
- [Modelo de Datos](./docs/DATABASE.md) - Esquema de BD
- [Guía de Usuario](./docs/USER_GUIDE.md) - Cómo usar el sistema
- [Guía de Instalación](./docs/INSTALL.md) - Pasos detallados

## Funcionalidades Implementadas

- [x] Autenticación JWT multi-rol
- [x] Gestión de barberías (CRUD)
- [x] Gestión de barberos con comisiones
- [x] Sistema de turnos en cola
- [x] Hora fija en cola (no cambia)
- [x] Posición en cola (reordenar turnos)
- [x] Finalizar sin avanzar la cola
- [x] Cancelar turnos desde la cola
- [x] Citas programadas
- [x] Turnos rápidos (botón +)
- [x] Contador de tiempo en panel barbero
- [x] Cola diaria pública (sin JWT)
- [x] Gestión de servicios
- [x] Horarios semanales y diarios
- [x] Bloqueos de agenda
- [x] Contabilidad automática
- [x] Métricas y reportes
- [x] Mapa de calor en contabilidad
- [x] Código QR para barberías
- [x] Invitaciones para crear barberías
- [x] Notificaciones WhatsApp al cliente
- [x] Web Push Notifications al barbero
- [x] PWA (Progressive Web App)
- [x] Timezone Colombia
- [x] UI responsiva para móviles
- [x] Iconos Lucide profesionales
- [x] Panel de métricas

## Usuarios de Prueba

| Rol | Correo | Contraseña |
|-----|--------|------------|
| Owner | owner@barberia.com | password123 |
| Barbero | barbero@barberia.com | password123 |

## API Endpoints Principales

```bash
# Autenticación
POST /api/auth/barbero/login

# Barberías
GET    /api/barberias/
POST   /api/barberias/

# Turnos
POST   /api/barberias/1/turnos/cola          # Crear en cola
POST   /api/barberias/1/turnos/cita          # Crear cita
PUT    /api/barberias/1/turnos/cola/1/siguiente
PUT    /api/barberias/1/turnos/cola/1/finalizar

# Contabilidad
GET /api/barberias/1/contabilidad/resumen
GET /api/barberias/1/contabilidad/metricas/barberia
```

## Links de Producción

| Componente | Servicio | URL |
|------------|----------|-----|
| **Frontend** | Vercel | https://barberia-ochre-eta.vercel.app |
| **Backend** | Render | https://barberapp.onrender.com |
| **Base de datos** | Aiven | MySQL |

**Acceso directo:** https://barberia-ochre-eta.vercel.app/login

---

## Configuración de Producción

### Variables de Entorno

```env
# Backend (Render)
TZ=America/Bogota
DATABASE_URL=mysql://... (de Aiven)
JWT_SECRET_KEY=...
SECRET_KEY=...
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
FLASK_ENV=production

# Frontend (Vercel)
VITE_API_URL=https://barberapp.onrender.com
```

## Estado del Proyecto

**Versión 1.2.0** - En producción

El proyecto se encuentra en desarrollo activo con mejoras continuas.

## Licencia

MIT - Desarrollado por Rainer Gutierrez
