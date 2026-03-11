# AGENTS.md - Guía para Agentes de Código

Este documento contiene las pautas y convenciones para trabajar en el proyecto BarberAPP.

## Estructura del Proyecto

```
Barberia/
├── BACKEND/                    # API REST (Flask + SQLAlchemy)
│   ├── modelo/                 # 10 modelos de base de datos
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
│   ├── controlador/           # Lógica de negocio
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
│   ├── rutas/                 # 11 Blueprints
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
│   ├── app.py                 # Aplicación principal
│   ├── database.py            # Configuración de BD
│   ├── configuracion.py       # Configuración
│   └── fecha_actual.py        # Utilidad de fechas
│
├── frontend/                   # Aplicación web (React 19 + Vite)
│   ├── src/
│   │   ├── pages/             # 10 páginas
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── AdminPanel.jsx
│   │   │   ├── Barberia.jsx
│   │   │   ├── OwnerDashboard.jsx
│   │   │   ├── BarberoDashboard.jsx
│   │   │   ├── TurnoConfirmado.jsx
│   │   │   ├── VistaAgenda.jsx
│   │   │   ├── Contabilidad.jsx
│   │   │   └── Metricas.jsx
│   │   ├── api.js             # Cliente API centralizado
│   │   ├── config.js
│   │   ├── App.jsx
│   │   └── utils/
│   │       └── fecha.js       # Utilidad de fechas
│   └── package.json
│
└── docs/                       # Documentación
```

---

## Comandos de Build, Lint y Test

### Frontend (React + Vite)

```bash
cd frontend

# Desarrollo
npm run dev

# Build de producción
npm run build

# Linting (ESLint)
npm run lint

# Preview del build
npm run preview
```

### Backend (Flask)

```bash
cd BACKEND

# Instalar dependencias
pip install -r requirements.txt

# Inicializar base de datos
python iniciar_db.py

# Ejecutar servidor (puerto 5000)
python app.py

# Con entorno virtual
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
python app.py
```

---

## Convenciones de Código

### General

- **Idioma**: Español para código (variables, funciones, comentarios, mensajes)
- **Encoding**: UTF-8
- **Líneas**: Máximo 100-120 caracteres por línea

---

### Backend (Python/Flask)

#### Imports

Orden recomendado:
1. stdlib
2. third-party
3. local modules

```python
from flask import Blueprint, request, jsonify
from modelo.barberia import Barberia
from controlador import barberia as ctrl
```

#### Nomenclatura

- **Modelos**: `PascalCase` (e.g., `Barberia`, `Turno`)
- **Tablas**: `snake_case` (e.g., `id_barberia`, `fecha_creacion`)
- **Funciones/Variables**: `snake_case` (e.g., `listar_barberias()`, `obtener_barberia`)
- **Blueprints**: `snake_case` con sufijo `_bp` (e.g., `barberias_bp`)
- **Rutas**: `snake_case` (e.g., `/api/barberias/cola`)
- **Controladores**: `snake_case`, nombre del módulo sin sufijos (e.g., `barberia.py`)

#### Estructura de Rutas

```python
from flask import Blueprint, request, jsonify

nombre_bp = Blueprint("nombre", __name__, url_prefix="/api/recurso")

@nombre_bp.route("/", methods=["GET"])
def listar():
    # listar recursos
    return jsonify([r.to_dict() for r in lista])

@nombre_bp.route("/<int:id_recurso>", methods=["GET"])
def obtener(id_recurso):
    # obtener por ID
    return jsonify(recurso.to_dict())

@nombre_bp.route("/", methods=["POST"])
def crear():
    data = request.get_json()
    nuevo = ctrl.crear_recurso(...)
    return jsonify(nuevo.to_dict()), 201
```

#### Modelos SQLAlchemy

```python
from database import db

class NombreModelo(db.Model):
    __tablename__ = "nombre_tabla"

    id_recurso = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(100), nullable=False)
    fecha_creacion = db.Column(db.DateTime, server_default=db.func.now())

    def to_dict(self):
        return {
            "id_recurso": self.id_recurso,
            "nombre": self.nombre,
            "fecha_creacion": self.fecha_creacion.isoformat() if self.fecha_creacion else None
        }
```

#### Error Handling

```python
@nombre_bp.route("/<int:id>", methods=["GET"])
def obtener(id):
    recurso = ctrl.obtener_recurso(id)
    if recurso:
        return jsonify(recurso.to_dict())
    return jsonify({"error": "Recurso no encontrado"}), 404
```

- Usar códigos de estado HTTP apropiados: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 404 (Not Found), 500 (Server Error)
- Devolver mensajes de error en español

#### Autenticación JWT

```python
from flask_jwt_extended import jwt_required, get_jwt_identity

@nombre_bp.route("/", methods=["POST"])
@jwt_required()
def crear():
    identidad = get_jwt_identity()
    # usar identidad para obtener id_barberia del contexto
```

---

### Frontend (React)

#### Estructura de Componentes

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

function NombreComponente() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    campo1: '',
    campo2: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.name });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await api.metodoApi(formData);
      navigate('/ruta/destino');
    } catch (err) {
      setError(err.message || 'Error al procesar');
    }
    
    setLoading(false);
  };

  return (
    <div className="componente">
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        {/* form fields */}
      </form>
    </div>
  );
}

export default NombreComponente;
```

#### Nomenclatura

- **Componentes**: `PascalCase` (e.g., `Login.jsx`, `BarberoDashboard.jsx`)
- **Funciones/Variables**: `camelCase` (e.g., `handleSubmit`, `formData`)
- **Constantes**: `UPPER_SNAKE_CASE` para configuraciones
- **Archivos JS**: `camelCase` (e.g., `api.js`, `config.js`)
- **Clases CSS**: `kebab-case` (e.g., `login-container`, `error-message`)

#### API Client (api.js)

Todos los endpoints HTTP deben centralizarse en `frontend/src/api.js`:

```javascript
import { API_URL } from './config';

const headers = () => {
  const token = localStorage.getItem('barbero_token');
  const h = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
};

export const api = {
  metodo: async (parametros) => {
    const res = await fetch(`${API_URL}/recurso`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(parametros)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Error: ${res.status}`);
    return data;
  }
};
```

#### State Management

- Usar `useState` para estado local de componentes
- Usar `useEffect` para side effects (fetching de datos)
- Token JWT se almacena en `localStorage` como `barbero_token`
- Otros datos de sesión: `barbero_id`, `barberia_id`, `barbero_rol`, `barbero_nombre`

---

## Patrones Comunes

### Rutas con ID en URL

```
/api/barberias/:id_barberia/barberos/:id_barbero/turnos
/api/barberias/:id_barberia/turnos/cola/:id_barbero/diaria
```

### Manejo de Fechas

- Backend: `datetime` con `isoformat()` para serialización
- Frontend: strings en formato ISO o Dates de JavaScript
- **Timezone**: El sistema usa `America/Bogota` como timezone predeterminada
- Backend: función `ahora()` en `fecha_actual.py` (respetar variable `TZ` del sistema)
- Frontend: funciones en `utils/fecha.js` usan `timeZone: 'America/Bogota'`

### Funciones de Fecha

```python
# Backend - fecha_actual.py
from fecha_actual import ahora, fecha_hoy

def crear_turno():
    ahora()          # Retorna datetime actual
    fecha_hoy()      # Retorna date de hoy
```

```javascript
// Frontend - utils/fecha.js
import { getAhoraColombia, getHoraColombia, formatFechaColombia } from './utils/fecha';

const ahora = getAhoraColombia();  // Date actual en Colombia
const hora = getHoraColombia();   // "14:30" formato HH:MM
```

### Autenticación

- JWT con `Authorization: Bearer <token>` header
- Roles: `admin`, `owner`, `barbero`

---

## Variables de Entorno

### Backend (.env)

```env
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=tu-clave-secreta
DATABASE_URL=sqlite:///barberia.db
JWT_SECRET_KEY=tu-jwt-secret
TZ=America/Bogota
```

### Producción (Render/Railway/etc)

```env
# Configurar en el dashboard del hosting
TZ=America/Bogota
DATABASE_URL=postgresql://...
JWT_SECRET_KEY=...
```

### Frontend (src/config.js)

```javascript
export const API_URL = 'http://localhost:5000';
// En producción: URL del servidor deployed
```

---

## Notas Importantes

1. **Multi-Tenant**: El sistema soporta múltiples barberías. Siempre incluir `id_barberia` en las consultas relevantes.

2. **Roles**: 
   - `owner`: Dueño de barbería (puede crear barberos)
   - `barbero`: Empleado
   - `admin`: Administrador del sistema

3. **Errores**: Siempre mostrar mensajes de error en español al usuario.

4. **CORS**: Configurado para permitir todos los origins en desarrollo (`resources={r"/api/*": {"origins": "*"}}`)

5. **Base de datos**: SQLite para desarrollo. En producción configurar MySQL/PostgreSQL.

6. **Timezone**: Configurar `TZ=America/Bogota` en el servidor de producción.

7. **Limpieza de turnos**: Usar endpoint `POST /api/barberias/:id/turnos/limpiar?dias=30` periódicamente para eliminar turnos completados/cancelados antiguos.

8. **Hora_programada**: El modelo Turno tiene un campo `hora_programada` (VARCHAR 5) que guarda la hora fija asignada al turno cuando se crea. Esta hora no cambia aunque pase el tiempo.

9. **Notificaciones**: Twilio configurado en `configuracion.py` para enviar WhatsApp. Para habilitar, agregar credenciales.

---

## Páginas del Frontend

| Página | Ruta | Descripción |
|--------|------|-------------|
| Home | / | Página principal |
| Login | /login | Inicio de sesión |
| AdminPanel | /admin | Panel de admin |
| Barberia | /barberia/:id | Info barbería |
| OwnerDashboard | /barberia/:id/dashboard | Panel owner |
| BarberoDashboard | /barbero/:id_barberia/:id | Panel barbero |
| TurnoConfirmado | /turno/:codigo | Turno confirmado |
| VistaAgenda | - | Agenda de turnos |
| Contabilidad | - | Reportes contables |
| Metricas | - | Métricas y stats |

---

## Modelos de Base de Datos

| Modelo | Tabla | Descripción |
|--------|-------|-------------|
| Barberia | barberias | Barberías del sistema |
| Barbero | barberos | Usuarios barberos |
| Cliente | clientes | Clientes registrados |
| Servicio | servicios | Servicios ofrecidos |
| Turno | turnos | Turnos y citas |
| Horario | horarios | Horarios semanales |
| HorarioDia | horarios_dia | Horarios por día |
| BloqueoAgenda | bloqueos_agenda | Bloqueos de tiempo |
| Contabilidad | contabilidad | Registro de ingresos |
| Invitacion | invitaciones | Códigos de invitación |
