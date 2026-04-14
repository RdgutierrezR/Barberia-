from database import db

class PushSubscription(db.Model):
    __tablename__ = "push_subscriptions"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    barberia_id = db.Column(db.Integer, db.ForeignKey("barberias.id_barberia"), nullable=False)
    barbero_id = db.Column(db.Integer, db.ForeignKey("barberos.id_barbero"), nullable=True)
    id_turno = db.Column(db.Integer, db.ForeignKey("turnos.id_turno"), nullable=True)
    codigo_confirmacion = db.Column(db.String(20), nullable=True)
    subscription = db.Column(db.JSON, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "barberia_id": self.barberia_id,
            "barbero_id": self.barbero_id,
            "id_turno": self.id_turno,
            "codigo_confirmacion": self.codigo_confirmacion,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
