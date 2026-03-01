# BarberAPP by Rainer Gutierrez - Sistema de Gestión Multi-Tenant

<p align="center">
  <img src="https://img.shields.io/badge/Stack-Flask%20%2B%20React-blue" alt="Stack">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
  <img src="https://img.shields.io/badge/Version-1.0.0-orange" alt="Version">
</p>

Sistema de gestión integral para barberías con soporte multi-tenant (múltiples barberías en una sola instancia). Permite gestionar barberías, barberos, clientes, turnos, servicios y contabilidad.

## Características Principales

- **Gestión Multi-Tenant**: Multiple barberías en una sola plataforma
- **Sistema de Turnos**: Cola dinámica y citas programadas
- **Gestión de Barberos**: Comisiones, horarios y disponibilidad
- **Control de Acceso**: Autenticación JWT con roles (Owner, Barbero, Cliente)
- **Contabilidad**: Registro de ingresos por servicio
- **Código QR**: Acceso rápido para clientes
- **API RESTful**: Integración fácil con otras aplicaciones

## Tecnologías

### Backend
- **Python 3.11+**
- **Flask** - Framework web
- **SQLAlchemy** - ORM para base de datos
- **Flask-JWT-Extended** - Autenticación JWT
- **Flask-CORS** - Soporte CORS
- **SQLite** - Base de datos (desarrollo)

### Frontend
- **React 19** - Framework UI
- **Vite** - Build tool
- **React Router** - Enrutamiento
- **Axios** - Cliente HTTP

## Estructura del Proyecto

```
Barberia/
├── BACKEND/                    # API REST (Flask)
│   ├── modelo/                 # Modelos de base de datos
│   ├── controlador/            # Lógica de negocio
│   ├── rutas/                   # Endpoints API
│   ├── app.py                  # Aplicación principal
│   ├── database.py             # Configuración de BD
│   └── configuracion.py        # Configuración app
│
├── frontend/                   # Aplicación web (React)
│   ├── src/
│   │   ├── pages/              # Páginas de la app
│   │   ├── api.js              # Cliente API
│   │   └── config.js           # Configuración
│   ├── package.json
│   └── vite.config.js
│
└── docs/                       # Documentación
    ├── INSTALL.md
    ├── API.md
    ├── DATABASE.md
    └── USER_GUIDE.md
```

## Primeros Pasos

### Requisitos Previos

- Python 3.11 o superior
- Node.js 18 o superior
- npm o yarn

### Instalación

#### Backend

```bash
cd BACKEND

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# Instalar dependencias
pip install -r requirements.txt

# Inicializar base de datos
python iniciar_db.py

# Ejecutar servidor
python app.py
```

El backend estará disponible en `http://localhost:5000`

#### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## Usuarios de Prueba

| Rol | Correo | Contraseña |
|-----|--------|------------|
| Owner | owner@barberia.com | password123 |
| Barbero | barbero@barberia.com | password123 |

## Documentación

- [Guía de Instalación](./docs/INSTALL.md)
- [Documentación de API](./docs/API.md)
- [Modelo de Base de Datos](./docs/DATABASE.md)
- [Guía de Usuario](./docs/USER_GUIDE.md)

## Variables de Entorno

### Backend (.env)

```env
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=tu-clave-secreta
DATABASE_URL=sqlite:///barberia.db
JWT_SECRET_KEY=tu-jwt-secret
```

## Estado del Proyecto

> **Nota**: Este proyecto se encuentra en desarrollo activo. Algunas características pueden estar en proceso de implementación.

### Funcionalidades Implementadas
- [x] Autenticación JWT
- [x] Gestión de barberías (CRUD)
- [x] Gestión de barberos
- [x] Sistema de turnos (cola y citas)
- [x] Gestión de servicios
- [x] Sistema de horarios
- [x] Contabilidad básica
- [x] Código QR para barberías
- [x] Invitaciones para crear barberías

### En Desarrollo
- [ ] Panel de administración completo
- [ ] Reportes y estadísticas
- [ ] Notificaciones
- [ ] Aplicación móvil
- [ ] Gestión de clientes

## Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -m 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## Capturas de Pantalla

_(Próximamente)_

---

Desarrollado con ❤️ para la comunidad de barberías
