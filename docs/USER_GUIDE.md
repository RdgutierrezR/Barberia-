# Guía de Usuario

Esta guía te ayudará a utilizar el sistema de gestión de barberías Barbería Pro.

---

## Introducción

Barbería Pro es un sistema integral para gestionar barberías que incluye:

- **Gestión de clientes**: Registro y seguimiento de clientes
- **Sistema de turnos**: Cola dinámica y citas programadas
- **Control de barberos**: Comisiones, horarios y disponibilidad
- **Contabilidad**: Registro de ingresos y reportes
- **Acceso rápido**: Código QR para clientes

---

## Roles de Usuario

### 1. Owner (Dueño)

Tiene acceso completo a todas las funcionalidades de su barbería:
- Gestionar barbería (configuración)
- Gestionar barberos
- Gestionar clientes
- Gestionar servicios
- Ver contabilidad
- Gestionar horarios
- Configurar invitaciones

### 2. Barbero

Acceso limitado a funcionalidades relacionadas con su trabajo:
- Ver su agenda y turnos
- Gestionar su cola de clientes
- Atender turnos
- Ver su propia contabilidad

### 3. Cliente

Acceso público/limitado:
- Sacar turno en cola
- Reservar cita programada
- Consultar estado de su turno

---

## Primeros Pasos

### 1. Configuración Inicial (Owner)

Al crear tu barbería, configura:

1. **Datos de la Barbería**
   - Nombre
   - Dirección
   - Teléfono
   - Correo
   - Logo (opcional)

2. **Servicios**
   - Agrega los servicios que ofreces
   - Define precio y duración de cada uno

3. **Horarios**
   - Configura los horarios de trabajo de cada barbero

4. **Barberos**
   - Agrega a tus barberos
   - Define su porcentaje de comisión

---

## Gestión de Turnos

### Sistema de Cola

El sistema de cola funciona como una fila virtual:

1. Un cliente llega y pide un turno
2. Se registra en la cola indicando el servicio
3. El barbero atiende en orden FIFO (primero en llegar, primero en atendido)
4. Al terminar, pasa al siguiente

**Pasos para usar la cola:**

1. Barbero/Owner crea un turno en cola:
   - Seleccionar barbero
   - Seleccionar servicio
   - Ingresar nombre y teléfono del cliente
   - El sistema muestra la posición en cola

2. El barbero marca "Siguiente" para atender al próximo cliente

3. El sistema mueve automáticamente al cliente a "en servicio"

4. Al terminar, el sistema registra el servicio en contabilidad

### Citas Programadas

Para clientes que desean hora específica:

1. Seleccionar barbero
2. Seleccionar servicio
3. Elegir fecha y hora
4. El sistema verifica disponibilidad
5. El cliente recibe código de confirmación

**Estados de un Turno:**
- `pendiente`: Esperando ser atendido
- `en_servicio`: Actualmente en servicio
- `completado`: Servicio terminado y pagado
- `cancelado`: Turno cancelado

---

## Gestión de Clientes

### Registro de Clientes

Puedes registrar clientes de dos formas:

1. **Manual**: Desde el panel de administración
2. **Automático**: Cuando sacan un turno en cola o cita

### Código QR

Cada cliente puede tener un código QR único que:
- Permite identificarlo rápidamente
- Su teléfono queda registrado para futuras visitas
- Facilita el check-in

### Búsqueda

- Por código QR
- Por número de teléfono
- Por nombre

---

## Gestión de Barberos

### Comisiones

Cada barbero tiene un porcentaje de comisión configurado:

- Ejemplo: 50% significa que del ingreso del servicio, el barbero recibe 50%
- Se calcula automáticamente al completar un turno

### Estados

- **Activo**: Puede atender clientes
- **Inactivo**: No aparece en la agenda

### Horarios

Configura los días y horarios de trabajo de cada barbero:

| Día | Código |
|-----|--------|
| Domingo | 0 |
| Lunes | 1 |
| Martes | 2 |
| Miércoles | 3 |
| Jueves | 4 |
| Viernes | 5 |
| Sábado | 6 |

---

## Contabilidad

### Registro de Ingresos

Cada vez que se completa un servicio:
1. Se registra el monto
2. Se asocia al barbero
3. Se guarda la fecha

### Reportes

#### Por Barbero
- Total de servicios
- Ingresos totales
- Comisión del barbero
- Período: semanal/mensual

#### Por Barbería
- Ingresos totales
- Servicios realizados
- Comparativo entre barberos

---

## Código QR

### Barbería
El código QR de la barbería permite:
- Clientes acceder rápidamente a la app
- Compartir en redes sociales
- Printing en materiales promocionales

### Cliente
El código QR del cliente:
- Identificación rápida
- Historial de servicios
- Acumular visitas

---

## Invitaciones

### Crear Invitación

El Owner puede crear códigos de invitación para:
- Invitar a nuevos Owners a crear barberías
- расширение de la plataforma

### Usar Invitación

1. Ir a la página de registro
2. Ingresar código de invitación
3. Completar datos de la nueva barbería

---

## Flujo de Trabajo Diario

### Apertura (Morning)

1. Iniciar sesión como Owner/Barbero
2. Revisar agenda del día
3. Verificar horarios de barberos

### Durante el Día

1. **Nuevo cliente llega:**
   - Preguntar qué servicio desea
   - Crear turno en cola
   
2. **Atender cliente:**
   - Marcar "Siguiente"
   - Realizar servicio
   - Al terminar, marcar como completado
   - Registrar precio final (opcional)

3. **Cita programada:**
   - Verificar disponibilidad
   - El cliente puede llegar y se marca "llegada"

### Cierre (Evening)

1. Revisar turnos del día
2. Ver resumen de contabilidad
3. Analizar reportes

---

## Consejos

### Para Owners

- Configura bien las comisiones de tus barberos
- Mantén actualizados los horarios
- Revisa la contabilidad regularmente
- Usa el código QR para atraer clientes

### Para Barberos

- Mantén tu agenda actualizada
- Comunica retrasos o problemas
- Registra los servicios correctamente

### Para Clientes

- Llega a tiempo tu cita programada
- Cancelar con anticipación si no puedes asistir
- Pide tu código QR para rápido check-in

---

## Preguntas Frecuentes

### ¿Cómo creo un nuevo servicio?

1. Ve a Servicios
2. Click en "Nuevo Servicio"
3. Ingresa nombre, descripción, precio y duración
4. Guarda

### ¿Cómo cancelo un turno?

1. Busca el turno
2. Click en "Cancelar"
3. Confirma la cancelación

### ¿Cómo veo la cola de un barbero específico?

1. Ve a Turnos
2. Filtra por barbero
3. Verás la cola actual

### ¿Qué pasa si un cliente no llega a su cita?

El turno queda en estado "pendiente" hasta que:
- El cliente llegue y se marque llegada
- Se cancele manualmente

### ¿Cómo calculo las comisiones?

Ejemplo:
- Servicio: $150
- Comisión barbero (50%): $75
- Barbería: $75

---

## Soporte

¿Tienes problemas o preguntas?

1. Revisa la documentación técnica en `docs/`
2. Consulta la API en `docs/API.md`
3. Abre un issue en el repositorio

---

## Glosario

| Término | Descripción |
|---------|-------------|
| **Turno** | Cita o lugar en la cola |
| **Cola** | Fila de espera de clientes |
| **Owner** | Dueño de la barbería |
| **Barbero** | Empleado que atiende |
| **Cliente** | Usuario que recibe servicio |
| **Comisión** | Porcentaje del ingreso para el barbero |
| **Cita** | Turno con hora específica |
