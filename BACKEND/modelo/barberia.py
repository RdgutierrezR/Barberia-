from database import db

class Barberia(db.Model):
    __tablename__ = "barberias"

    id_barberia = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(100), nullable=False)
    direccion = db.Column(db.String(255), nullable=True)
    telefono = db.Column(db.String(20), nullable=True)
    correo = db.Column(db.String(100), nullable=True)
    logo_url = db.Column(db.String(255), nullable=True)
    codigo_qr_base = db.Column(db.String(50), unique=True, nullable=True)
    hora_apertura = db.Column(db.Time, nullable=True)
    hora_cierre = db.Column(db.Time, nullable=True)
    activa = db.Column(db.Boolean, default=True)
    fecha_creacion = db.Column(db.DateTime, server_default=db.func.now())

    def to_dict(self):
        return {
            "id_barberia": self.id_barberia,
            "nombre": self.nombre,
            "direccion": self.direccion,
            "telefono": self.telefono,
            "correo": self.correo,
            "logo_url": self.logo_url,
            "codigo_qr_base": self.codigo_qr_base,
            "hora_apertura": self.hora_apertura.isoformat() if self.hora_apertura else None,
            "hora_cierre": self.hora_cierre.isoformat() if self.hora_cierre else None,
            "activa": self.activa,
            "fecha_creacion": self.fecha_creacion.isoformat() if self.fecha_creacion else None
        }
