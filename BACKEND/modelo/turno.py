from database import db
from datetime import datetime

class Turno(db.Model):
    __tablename__ = "turnos"

    id_turno = db.Column(db.Integer, primary_key=True, autoincrement=True)
    id_barberia = db.Column(db.Integer, db.ForeignKey("barberias.id_barberia"), nullable=False)
    id_barbero = db.Column(db.Integer, db.ForeignKey("barberos.id_barbero"), nullable=False)
    id_cliente = db.Column(db.Integer, db.ForeignKey("clientes.id_cliente"), nullable=True)
    id_servicio = db.Column(db.Integer, db.ForeignKey("servicios.id_servicio"), nullable=False)
    fecha_hora = db.Column(db.DateTime, nullable=False)
    estado = db.Column(db.String(20), default="pendiente")
    codigo_confirmacion = db.Column(db.String(10), unique=True, nullable=True)
    notas = db.Column(db.Text, nullable=True)
    precio_final = db.Column(db.Numeric(10, 2), nullable=True)
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)

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
            "fecha_hora": self.fecha_hora.isoformat() if self.fecha_hora else None,
            "estado": self.estado,
            "codigo_confirmacion": self.codigo_confirmacion,
            "notas": self.notas,
            "precio_final": float(self.precio_final) if self.precio_final else None,
            "fecha_creacion": self.fecha_creacion.isoformat() if self.fecha_creacion else None
        }
