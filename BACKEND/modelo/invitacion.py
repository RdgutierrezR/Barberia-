from database import db

def _ahora():
    from fecha_actual import ahora as _ahora_fn
    return _ahora_fn()

class Invitacion(db.Model):
    __tablename__ = "invitaciones"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    codigo = db.Column(db.String(20), unique=True, nullable=False)
    tipo = db.Column(db.String(30), default="crear_barberia")
    usada = db.Column(db.Boolean, default=False)
    fecha_creacion = db.Column(db.DateTime, server_default=db.func.now())
    fecha_expiracion = db.Column(db.DateTime, nullable=True)
    creador_id = db.Column(db.Integer, db.ForeignKey("barberos.id_barbero"), nullable=True)
    email_usado = db.Column(db.String(100), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "codigo": self.codigo,
            "tipo": self.tipo,
            "usada": self.usada,
            "fecha_creacion": self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            "fecha_expiracion": self.fecha_expiracion.isoformat() if self.fecha_expiracion else None,
            "email_usado": self.email_usado
        }

    def esta_activa(self):
        if self.usada:
            return False
        if self.fecha_expiracion and self.fecha_expiracion < _ahora():
            return False
        return True
