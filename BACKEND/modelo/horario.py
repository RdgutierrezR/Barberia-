from database import db

class Horario(db.Model):
    __tablename__ = "horarios"

    id_horario = db.Column(db.Integer, primary_key=True, autoincrement=True)
    id_barberia = db.Column(db.Integer, db.ForeignKey("barberias.id_barberia"), nullable=False)
    id_barbero = db.Column(db.Integer, db.ForeignKey("barberos.id_barbero"), nullable=False)
    dia_semana = db.Column(db.Integer, nullable=False)
    hora_inicio = db.Column(db.Time, nullable=False)
    hora_fin = db.Column(db.Time, nullable=False)
    activo = db.Column(db.Boolean, default=True)

    barberia = db.relationship("Barberia", backref="horarios")
    barbero = db.relationship("Barbero", backref="horarios")

    def to_dict(self):
        return {
            "id_horario": self.id_horario,
            "id_barberia": self.id_barberia,
            "id_barbero": self.id_barbero,
            "barbero_nombre": self.barbero.nombre if self.barbero else None,
            "dia_semana": self.dia_semana,
            "hora_inicio": self.hora_inicio.isoformat() if self.hora_inicio else None,
            "hora_fin": self.hora_fin.isoformat() if self.hora_fin else None,
            "activo": self.activo
        }
