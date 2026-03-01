# Guía de Instalación

Esta guía te ayudará a configurar el entorno de desarrollo para Barbería Pro en tu máquina local.

## Requisitos del Sistema

| Requisito | Versión Mínima | Versión Recomendada |
|-----------|----------------|---------------------|
| Python    | 3.11           | 3.12                |
| Node.js   | 18             | 20                  |
| npm       | 9              | 10                  |
| SQLite    | 3.x            | -                   |

### Sistemas Operativos Soportados
- Windows 10/11
- macOS 12+
- Linux (Ubuntu 20.04+, Debian 11+)

---

## Instalación del Backend

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd Barberia
```

### 2. Configurar Python

#### Windows

```powershell
# Verificar Python
python --version

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
.\venv\Scripts\activate
```

#### macOS / Linux

```bash
# Verificar Python
python3 --version

# Crear entorno virtual
python3 -m venv venv

# Activar entorno virtual
source venv/bin/activate
```

### 3. Instalar Dependencias

```bash
cd BACKEND
pip install -r requirements.txt
```

**Dependencias principales:**
- Flask==3.0.0
- Flask-SQLAlchemy==3.1.1
- Flask-JWT-Extended==4.6.0
- Flask-CORS==4.0.0
- SQLAlchemy==2.0.23

### 4. Configurar Variables de Entorno

Crea un archivo `.env` en la carpeta `BACKEND`:

```env
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=tu-clave-secreta-aqui-cambiala
DATABASE_URL=sqlite:///barberia.db
JWT_SECRET_KEY=tu-jwt-secret-key-aqui
```

### 5. Inicializar la Base de Datos

```bash
python iniciar_db.py
```

Esto creará:
- El archivo de base de datos `barberia.db`
- Las tablas necesarias
- Datos de ejemplo (si están configurados)

### 6. Ejecutar el Servidor

```bash
python app.py
```

Deberías ver:
```
* Running on http://0.0.0.0:5000
* Running on http://127.0.0.1:5000
```

---

## Instalación del Frontend

### 1. Instalar Node.js

Descarga Node.js desde [nodejs.org](https://nodejs.org/) (versión LTS recomendada).

```bash
# Verificar instalación
node --version  # v20.x.x
npm --version  # v10.x.x
```

### 2. Instalar Dependencias

```bash
cd frontend
npm install
```

### 3. Configurar API

Edita `frontend/src/config.js`:

```javascript
export const API_URL = "http://localhost:5000/api";
```

### 4. Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación se abrirá en `http://localhost:5173`

---

## Construcción para Producción

### Backend

```bash
# Instalar dependencias de producción
pip install gunicorn

# Ejecutar con Gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Frontend

```bash
# Construir
npm run build

# Los archivos se generarán en frontend/dist/
```

---

## Solución de Problemas

### Error: "Module not found"

```bash
# Reinstalar dependencias
pip install -r requirements.txt
# o
npm install
```

### Error: "Port already in use"

Cambia el puerto en:
- Backend: `app.py` (línea 50)
- Frontend: `vite.config.js`

### Error de CORS

Asegúrate de que el frontend pueda comunicarse con el backend. Edita `BACKEND/app.py`:

```python
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})
```

### Error de Base de Datos

Elimina el archivo `barberia.db` y vuelve a inicializar:

```bash
rm barberia.db
python iniciar_db.py
```

---

## Siguientes Pasos

1. [Documentación de API](./API.md)
2. [Modelo de Base de Datos](./DATABASE.md)
3. [Guía de Usuario](./USER_GUIDE.md)

---

¿Necesitas ayuda? Abre un issue en el repositorio.
