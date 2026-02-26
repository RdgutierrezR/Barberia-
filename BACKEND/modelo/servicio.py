from database import db

class Servicio(db.Model):
    __tablename__ = "servicios"

    id_servicio = db.Column(db.Integer, primary_key=True, autoincrement=True)
    id_barberia = db.Column(db.Integer, db.ForeignKey("barberias.id_barberia"), nullable=False)
    nombre = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.Text, nullable=True)
    precio = db.Column(db.Numeric(10, 2), nullable=False)
    duracion_minutos = db.Column(db.Integer, nullable=False)
    activo = db.Column(db.Boolean, default=True)

    barberia = db.relationship("Barberia", backref="servicios")

    def to_dict(self):
        return {
            "id_servicio": self.id_servicio,
            "id_barberia": self.id_barberia,
            "nombre": self.nombre,
            "descripcion": self.descripcion,
            "precio": float(self.precio),
            "duracion_minutos": self.duracion_minutos,
            "activo": self.activo
        }
