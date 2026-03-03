from app import create_app
from database import db
from sqlalchemy import text

app = create_app()

with app.app_context():
    try:
        db.session.execute(text("ALTER TABLE contabilidad ADD COLUMN barbero_nombre VARCHAR(100)"))
        print("Columna barbero_nombre agregada")
    except Exception as e:
        print(f"barbero_nombre: {e}")
    
    try:
        db.session.execute(text("ALTER TABLE contabilidad ADD COLUMN cliente_nombre VARCHAR(100)"))
        print("Columna cliente_nombre agregada")
    except Exception as e:
        print(f"cliente_nombre: {e}")
    
    try:
        db.session.execute(text("ALTER TABLE contabilidad ADD COLUMN servicio_nombre VARCHAR(100)"))
        print("Columna servicio_nombre agregada")
    except Exception as e:
        print(f"servicio_nombre: {e}")
    
    db.session.commit()
    print("Migración completada")