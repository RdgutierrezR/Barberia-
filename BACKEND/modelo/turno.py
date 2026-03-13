from database import db

def _ahora():
    from fecha_actual import ahora as _ahora_fn
    return _ahora_fn()

def _agregar_timezone(fecha):
    if not fecha:
        return None
    fecha_iso = fecha.isoformat()
    if '+' not in fecha_iso and fecha_iso[-3:] != '-05':
        fecha_iso = fecha_iso + '-05:00'
    return fecha_iso

class Turno(db.Model):
    __tablename__ = "turnos"

    id_turno = db.Column(db.Integer, primary_key=True, autoincrement=True)
    id_barberia = db.Column(db.Integer, db.ForeignKey("barberias.id_barberia"), nullable=False)
    id_barbero = db.Column(db.Integer, db.ForeignKey("barberos.id_barbero"), nullable=False)
    id_cliente = db.Column(db.Integer, db.ForeignKey("clientes.id_cliente"), nullable=True)
    id_servicio = db.Column(db.Integer, db.ForeignKey("servicios.id_servicio"), nullable=False)
    fecha_hora = db.Column(db.DateTime, nullable=False)
    hora_programada = db.Column(db.String(5), nullable=True)  # Hora fijada cuando se creó el turno (HH:MM)
    tipo_reserva = db.Column(db.String(20), default="cola")  # "cola" o "cita"
    cita_fecha_hora = db.Column(db.DateTime, nullable=True)  # Fecha/hora específica para citas
    fecha_cita_original = db.Column(db.DateTime, nullable=True)  # Fecha/hora original de la cita para contabilidad
    fecha_fin_servicio = db.Column(db.DateTime, nullable=True)  # Fecha/hora cuando se completó el servicio
    fecha_inicio_servicio = db.Column(db.DateTime, nullable=True)  # Fecha/hora cuando inició el servicio
    duracion_minutos = db.Column(db.Integer, nullable=True)  # Duración real del servicio en minutos
    estado = db.Column(db.String(20), default="pendiente")
    codigo_confirmacion = db.Column(db.String(10), unique=True, nullable=True)
    notas = db.Column(db.Text, nullable=True)
    precio_final = db.Column(db.Numeric(10, 2), nullable=True)
    fecha_creacion = db.Column(db.DateTime, default=_ahora)

    barberia = db.relationship("Barberia", backref="turnos")
    barbero = db.relationship("Barbero", backref="turnos")
    cliente = db.relationship("Cliente", backref="turnos")
    servicio = db.relationship("Servicio", backref="turnos")

    def to_dict(self):
        return {
            "id_turno": self.id_turno,
            "id_barberia": self.id_barberia,
            "id_barbero": self.id_barbero,
            "barbero_nombre": self.barbero.nombre if self.barbero else None,
            "id_cliente": self.id_cliente,
            "cliente_nombre": self.cliente.nombre if self.cliente else None,
            "cliente_telefono": self.cliente.telefono if self.cliente else None,
            "id_servicio": self.id_servicio,
            "servicio_nombre": self.servicio.nombre if self.servicio else None,
            "servicio_precio": float(self.servicio.precio) if self.servicio else None,
            "servicio_duracion": self.servicio.duracion_minutos if self.servicio else None,
            "hora_programada": self.hora_programada,
            "tipo_reserva": self.tipo_reserva,
            "cita_fecha_hora": _agregar_timezone(self.cita_fecha_hora),
            "fecha_cita_original": _agregar_timezone(self.fecha_cita_original),
            "fecha_fin_servicio": _agregar_timezone(self.fecha_fin_servicio),
            "fecha_inicio_servicio": _agregar_timezone(self.fecha_inicio_servicio),
            "duracion_minutos": self.duracion_minutos,
            "fecha_hora": _agregar_timezone(self.fecha_hora),
            "estado": self.estado,
            "codigo_confirmacion": self.codigo_confirmacion,
            "notas": self.notas,
            "precio_final": float(self.precio_final) if self.precio_final else None,
            "fecha_creacion": _agregar_timezone(self.fecha_creacion)
        }
