from database import db
from datetime import datetime

class Contabilidad(db.Model):
    __tablename__ = "contabilidad"

    id_registro = db.Column(db.Integer, primary_key=True, autoincrement=True)
    id_barberia = db.Column(db.Integer, db.ForeignKey("barberias.id_barberia"), nullable=False)
    id_barbero = db.Column(db.Integer, db.ForeignKey("barberos.id_barbero"), nullable=False)
    id_turno = db.Column(db.Integer, db.ForeignKey("turnos.id_turno"), nullable=False)
    monto = db.Column(db.Numeric(10, 2), nullable=False)
    tipo = db.Column(db.String(20), nullable=False)
    descripcion = db.Column(db.Text, nullable=True)
    fecha = db.Column(db.DateTime, default=datetime.utcnow)

    barberia = db.relationship("Barberia", backref="contabilidad")
    barbero = db.relationship("Barbero", backref="contabilidad")
    turno = db.relationship("Turno", backref="contabilidad")

    def to_dict(self):
        return {
            "id_registro": self.id_registro,
            "id_barberia": self.id_barberia,
            "id_barbero": self.id_barbero,
            "barbero_nombre": self.barbero.nombre if self.barbero else None,
            "id_turno": self.id_turno,
            "monto": float(self.monto),
            "tipo": self.tipo,
            "descripcion": self.descripcion,
            "fecha": self.fecha.isoformat() if self.fecha else None
        }
