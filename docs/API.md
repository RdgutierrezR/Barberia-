# Documentación de API

API RESTful para el sistema de gestión de barberías. Todos los endpoints requieren autenticación JWT excepto donde se indique explícitamente.

## Base URL

```
http://localhost:5000/api
```

## Autenticación

La API utiliza **JWT (JSON Web Tokens)** para autenticación.

### Header de Autorización

```http
Authorization: Bearer <token_jwt>
```

### Endpoints de Autenticación

#### Login de Barbero

```http
POST /auth/barbero/login
Content-Type: application/json

{
  "correo": "barbero@barberia.com",
  "contrasena": "password123",
  "id_barberia": 1
}
```

**Respuesta:**
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "barbero": {
    "id_barbero": 1,
    "nombre": "Juan Pérez",
    "rol": "owner"
  }
}
```

#### Registro de Barbero

```http
POST /auth/barbero/registro
Content-Type: application/json

{
  "id_barberia": 1,
  "nombre": "Nuevo Barbero",
  "telefono": "1234567890",
  "correo": "nuevo@barberia.com",
  "contrasena": "password123",
  "comision_porcentaje": 50
}
```

#### Registro de Barbería con Invitación

```http
POST /auth/barberia/registro
Content-Type: application/json

{
  "codigo_invitacion": "ABC123",
  "nombre_barberia": "Barbería El Corte",
  "nombre_barbero": "Carlos Owner",
  "telefono": "1234567890",
  "correo": "carlos@barberia.com",
  "contrasena": "password123",
  "direccion": "Calle Principal 123",
  "telefono_barberia": "9876543210"
}
```

#### Verificar Token

```http
GET /auth/barbero/verificar
Authorization: Bearer <token>
```

---

## Barberías

### Listar Barberías

```http
GET /barberias/
```

**Respuesta:**
```json
[
  {
    "id_barberia": 1,
    "nombre": "Barbería El Corte",
    "direccion": "Calle Principal 123",
    "telefono": "1234567890",
    "correo": "info@barberia.com",
    "activa": true
  }
]
```

### Obtener Barbería por ID

```http
GET /barberias/{id_barberia}
```

### Obtener Barbería por Código QR

```http
GET /barberias/qr/{codigo_qr}
```

### Crear Barbería

```http
POST /barberias/
Content-Type: application/json

{
  "nombre": "Nueva Barbería",
  "direccion": "Dirección",
  "telefono": "1234567890",
  "correo": "correo@barberia.com",
  "logo_url": "https://..."
}
```

### Actualizar Barbería

```http
PUT /barberias/{id_barberia}
Content-Type: application/json

{
  "nombre": "Barbería Actualizada"
}
```

### Eliminar Barbería

```http
DELETE /barberias/{id_barberia}
```

---

## Barberos

### Listar Barberos

```http
GET /barberias/{id_barberia}/barberos/
```

### Obtener Barbero

```http
GET /barberias/{id_barberia}/barberos/{id_barbero}
```

### Crear Barbero

```http
POST /barberias/{id_barberia}/barberos/
Authorization: Bearer <token>
Content-Type: application/json

{
  "nombre": "Juan Pérez",
  "telefono": "1234567890",
  "correo": "juan@barberia.com",
  "contrasena": "password123",
  "comision_porcentaje": 50,
  "rol": "barbero"
}
```

### Actualizar Barbero

```http
PUT /barberias/{id_barberia}/barberos/{id_barbero}
Authorization: Bearer <token>
Content-Type: application/json

{
  "nombre": "Juan Actualizado",
  "comision_porcentaje": 60
}
```

### Eliminar Barbero

```http
DELETE /barberias/{id_barberia}/barberos/{id_barbero}
Authorization: Bearer <token>
```

---

## Clientes

### Listar Clientes

```http
GET /barberias/{id_barberia}/clientes/
```

### Obtener Cliente

```http
GET /barberias/{id_barberia}/clientes/{id_cliente}
```

### Obtener Cliente por QR

```http
GET /barberias/{id_barberia}/clientes/qr/{codigo_qr}
```

### Obtener Cliente por Teléfono

```http
GET /barberias/{id_barberia}/clientes/telefono?telefono=1234567890
```

### Crear Cliente

```http
POST /barberias/{id_barberia}/clientes/
Content-Type: application/json

{
  "nombre": "Cliente Nuevo",
  "telefono": "1234567890",
  "correo": "cliente@email.com"
}
```

### Actualizar Cliente

```http
PUT /barberias/{id_barberia}/clientes/{id_cliente}
Content-Type: application/json

{
  "nombre": "Cliente Actualizado"
}
```

### Eliminar Cliente

```http
DELETE /barberias/{id_barberia}/clientes/{id_cliente}
```

---

## Servicios

### Listar Servicios

```http
GET /barberias/{id_barberia}/servicios/
```

### Obtener Servicio

```http
GET /barberias/{id_barberia}/servicios/{id_servicio}
```

### Crear Servicio

```http
POST /barberias/{id_barberia}/servicios/
Content-Type: application/json

{
  "nombre": "Corte de Cabello",
  "descripcion": "Corte classic",
  "precio": 150.00,
  "duracion_minutos": 30
}
```

### Actualizar Servicio

```http
PUT /barberias/{id_barberia}/servicios/{id_servicio}
Content-Type: application/json

{
  "precio": 180.00
}
```

### Eliminar Servicio

```http
DELETE /barberias/{id_barberia}/servicios/{id_servicio}
```

---

## Turnos

### Listar Turnos

```http
GET /barberias/{id_barberia}/turnos/
Authorization: Bearer <token>

Query Parameters:
- fecha: Filter por fecha (YYYY-MM-DD)
- id_barbero: Filter por barbero
- estado: Filter por estado (pendiente, en_servicio, completado, cancelado)
```

### Obtener Turno por Código

```http
GET /barberias/{id_barberia}/turnos/codigo/{codigo}
```

### Obtener Cola de Barbero

```http
GET /barberias/{id_barberia}/turnos/cola/{id_barbero}
Authorization: Bearer <token>
```

### Obtener Cola Diaria

```http
GET /barberias/{id_barberia}/turnos/cola/{id_barbero}/diaria
Authorization: Bearer <token>
```

### Pasar al Siguiente (Siguiente Cliente)

```http
PUT /barberias/{id_barberia}/turnos/cola/{id_barbero}/siguiente
Authorization: Bearer <token>

Query Parameters:
- forzar_cita: true/false (forzar atender cita programada)
```

### Reordenar Turno

```http
PUT /barberias/{id_barberia}/turnos/cola/reordenar
Authorization: Bearer <token>
Content-Type: application/json

{
  "id_turno": 1,
  "nueva_posicion": 2
}
```

### Marcar Llegada

```http
PUT /barberias/{id_barberia}/turnos/{id_turno}/llegada
Authorization: Bearer <token>
```

### Cancelar Turno

```http
PUT /barberias/{id_barberia}/turnos/{id_turno}/cancelar
```

### Crear Turno (Cola)

```http
POST /barberias/{id_barberia}/turnos/cola
Content-Type: application/json

{
  "id_barbero": 1,
  "id_servicio": 1,
  "nombre_cliente": "Cliente",
  "telefono": "1234567890",
  "notas": "Nota opcional"
}
```

### Crear Turno (Cita Programada)

```http
POST /barberias/{id_barberia}/turnos/cita
Content-Type: application/json

{
  "id_barbero": 1,
  "id_servicio": 1,
  "cita_fecha_hora": "2024-01-15T14:00:00",
  "nombre_cliente": "Cliente",
  "telefono": "1234567890",
  "notas": "Nota opcional"
}
```

### Listar Citas

```http
GET /barberias/{id_barberia}/turnos/citas
Authorization: Bearer <token>

Query Parameters:
- fecha: Filter por fecha
- id_barbero: Filter por barbero
```

### Obtener Disponibilidad

```http
GET /barberias/{id_barberia}/turnos/disponibilidad/{id_barbero}?fecha=2024-01-15&duracion=30
```

### Gestión de Bloqueos

#### Listar Bloqueos

```http
GET /barberias/{id_barberia}/turnos/bloqueos
Authorization: Bearer <token>

Query Parameters:
- id_barbero: Filter por barbero
```

#### Crear Bloqueo

```http
POST /barberias/{id_barberia}/turnos/bloqueos
Authorization: Bearer <token>
Content-Type: application/json

{
  "id_barbero": 1,
  "fecha_inicio": "2024-01-20T10:00:00",
  "fecha_fin": "2024-01-20T14:00:00",
  "motivo": "Vacaciones"
}
```

#### Eliminar Bloqueo

```http
DELETE /barberias/{id_barberia}/turnos/bloqueos/{id_bloqueo}
Authorization: Bearer <token>
```

---

## Horarios

### Listar Horarios

```http
GET /barberias/{id_barberia}/horarios/

Query Parameters:
- id_barbero: Filter por barbero
```

### Obtener Horario

```http
GET /barberias/{id_barberia}/horarios/{id_horario}
```

### Crear Horario

```http
POST /barberias/{id_barberia}/horarios/
Content-Type: application/json

{
  "id_barbero": 1,
  "dia_semana": 1,
  "hora_inicio": "09:00",
  "hora_fin": "18:00"
}
```

**Días de la semana:**
- 0: Domingo
- 1: Lunes
- 2: Martes
- 3: Miércoles
- 4: Jueves
- 5: Viernes
- 6: Sábado

### Eliminar Horario

```http
DELETE /barberias/{id_barberia}/horarios/{id_horario}
```

---

## Contabilidad

### Listar Registros

```http
GET /barberias/{id_barberia}/contabilidad/
Authorization: Bearer <token>

Query Parameters:
- id_barbero: Filter por barbero
- fecha_inicio: Fecha inicio (YYYY-MM-DD)
- fecha_fin: Fecha fin (YYYY-MM-DD)
```

### Contabilidad por Barbero

```http
GET /barberias/{id_barberia}/contabilidad/barbero/{id_barbero}
Authorization: Bearer <token>
```

### Resumen por Barbero

```http
GET /barberias/{id_barberia}/contabilidad/barbero/{id_barbero}/resumen
Authorization: Bearer <token>

Query Parameters:
- periodo: semanal/mensual
- fecha_inicio: (opcional)
- fecha_fin: (opcional)
```

### Resumen de Barbería

```http
GET /barberias/{id_barberia}/contabilidad/resumen
Authorization: Bearer <token>

Query Parameters:
- periodo: semanal/mensual
```

---

## Invitaciones

### Listar Invitaciones

```http
GET /invitaciones/
Authorization: Bearer <token>
```

### Crear Invitación

```http
POST /invitaciones/
Authorization: Bearer <token>
Content-Type: application/json

{
  "tipo": "crear_barberia",
  "dias_expiracion": 7
}
```

### Usar Invitación

```http
POST /invitaciones/usar
Content-Type: application/json

{
  "codigo": "ABC123",
  "email": "nuevo@email.com"
}
```

---

## Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| 200 | OK - Solicitud exitosa |
| 201 | Created - Recurso creado |
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - No autenticado |
| 403 | Forbidden - No autorizado |
| 404 | Not Found - Recurso no encontrado |
| 500 | Internal Server Error - Error del servidor |

---

## Formato de Fechas

Todos los endpoints que aceptan o devuelven fechas utilizan el formato ISO 8601:

- Fecha: `YYYY-MM-DD`
- Fecha-Hora: `YYYY-MM-DDTHH:MM:SS`

---

## Ejemplo de Uso con cURL

### Login

```bash
curl -X POST http://localhost:5000/api/auth/barbero/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"owner@barberia.com","contrasena":"password123","id_barberia":1}'
```

### Obtener Barberías

```bash
curl -X GET http://localhost:5000/api/barberias/
```

### Crear Cliente

```bash
curl -X POST http://localhost:5000/api/barberias/1/clientes/ \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Juan","telefono":"1234567890"}'
```

---

¿Necesitas más detalles sobre algún endpoint específico?
