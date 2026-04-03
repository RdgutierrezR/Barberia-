from app import create_app
from database import db
from modelo.push_subscription import PushSubscription

app = create_app()

with app.app_context():
    db.create_all()
    print("Tabla push_subscriptions creada correctamente")
