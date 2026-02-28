from database import db

class Barbero(db.Model):
    __tablename__ = "barberos"

    id_barbero = db.Column(db.Integer, primary_key=True, autoincrement=True)
    id_barberia = db.Column(db.Integer, db.ForeignKey("barberias.id_barberia"), nullable=False)
    nombre = db.Column(db.String(100), nullable=False)
    telefono = db.Column(db.String(20), nullable=False)
    correo = db.Column(db.String(100), nullable=False)
    contrasena = db.Column(db.String(255), nullable=False)
    rol = db.Column(db.String(20), default="barbero")
    activo = db.Column(db.Boolean, default=True)
    foto_url = db.Column(db.String(255), nullable=True)
    comision_porcentaje = db.Column(db.Numeric(5, 2), default=50)

    barberia = db.relationship("Barberia", backref="barberos")

    def to_dict(self):
        return {
            "id_barbero": self.id_barbero,
            "id_barberia": self.id_barberia,
            "nombre": self.nombre,
            "telefono": self.telefono,
            "correo": self.correo,
            "rol": self.rol,
            "activo": self.activo,
            "foto_url": self.foto_url,
            "comision_porcentaje": float(self.comision_porcentaje) if self.comision_porcentaje else 50
        }
