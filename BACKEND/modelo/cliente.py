from database import db

class Cliente(db.Model):
    __tablename__ = "clientes"

    id_cliente = db.Column(db.Integer, primary_key=True, autoincrement=True)
    id_barberia = db.Column(db.Integer, db.ForeignKey("barberias.id_barberia"), nullable=False)
    nombre = db.Column(db.String(100), nullable=False)
    telefono = db.Column(db.String(20), nullable=False)
    correo = db.Column(db.String(100), nullable=True)
    codigo_qr = db.Column(db.String(50), nullable=True)
    activo = db.Column(db.Boolean, default=True)

    barberia = db.relationship("Barberia", backref="clientes")

    def to_dict(self):
        return {
            "id_cliente": self.id_cliente,
            "id_barberia": self.id_barberia,
            "nombre": self.nombre,
            "telefono": self.telefono,
            "correo": self.correo,
            "codigo_qr": self.codigo_qr,
            "activo": self.activo
        }
