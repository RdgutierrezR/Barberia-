from database import db
from datetime import date

def _ahora():
    from fecha_actual import ahora as _ahora_fn
    return _ahora_fn()

class HorarioDia(db.Model):
    __tablename__ = "horarios_dia"

    id_horario_dia = db.Column(db.Integer, primary_key=True, autoincrement=True)
    id_barberia = db.Column(db.Integer, db.ForeignKey("barberias.id_barberia"), nullable=False)
    id_barbero = db.Column(db.Integer, db.ForeignKey("barberos.id_barbero"), nullable=False)
    fecha = db.Column(db.Date, nullable=False)
    hora_inicio = db.Column(db.Time, nullable=False)
    hora_fin = db.Column(db.Time, nullable=False)
    activo = db.Column(db.Boolean, default=True)
    fecha_creacion = db.Column(db.DateTime, default=_ahora)

    barberia = db.relationship("Barberia", backref="horarios_dia")
    barbero = db.relationship("Barbero", backref="horarios_dia")

    __table_args__ = (
        db.UniqueConstraint('id_barbero', 'fecha', name='uix_barbero_fecha'),
    )

    def to_dict(self):
        return {
            "id_horario_dia": self.id_horario_dia,
            "id_barberia": self.id_barberia,
            "id_barbero": self.id_barbero,
            "barbero_nombre": self.barbero.nombre if self.barbero else None,
            "fecha": self.fecha.isoformat() if self.fecha else None,
            "hora_inicio": self.hora_inicio.isoformat() if self.hora_inicio else None,
            "hora_fin": self.hora_fin.isoformat() if self.hora_fin else None,
            "activo": self.activo,
            "es_hoy": self.fecha == date.today() if self.fecha else False
        }
