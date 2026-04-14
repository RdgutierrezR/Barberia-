from database import db
from app import app

def migrar_push_subscriptions():
    """Agregar columnas id_turno y codigo_confirmacion a push_subscriptions"""
    with app.app_context():
        from sqlalchemy import text
        try:
            db.session.execute(text("ALTER TABLE push_subscriptions ADD COLUMN id_turno INTEGER REFERENCES turnos(id_turno)"))
            db.session.commit()
            print("Columna id_turno agregada")
        except Exception as e:
            if "duplicate column" in str(e).lower():
                print("Columna id_turno ya existe")
            else:
                print(f"Error id_turno: {e}")
        
        try:
            db.session.execute(text("ALTER TABLE push_subscriptions ADD COLUMN codigo_confirmacion VARCHAR(20)"))
            db.session.commit()
            print("Columna codigo_confirmacion agregada")
        except Exception as e:
            if "duplicate column" in str(e).lower():
                print("Columna codigo_confirmacion ya existe")
            else:
                print(f"Error codigo_confirmacion: {e}")
        
        print("Migracion completada")

if __name__ == "__main__":
    migrar_push_subscriptions()