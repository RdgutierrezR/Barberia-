from database import db
from modelo.turno import Turno
from modelo.barbero import Barbero
from modelo.cliente import Cliente
from modelo.servicio import Servicio

def migrate():
    # Agregar columna hora_programada si no existe
    from sqlalchemy import inspect
    inspector = inspect(db.engine)
    columnas = [c['name'] for c in inspector.get_columns('turnos')]
    
    if 'hora_programada' not in columnas:
        print("Agregando columna hora_programada...")
        db.session.execute(db.text("ALTER TABLE turnos ADD COLUMN hora_programada VARCHAR(5)"))
        db.session.commit()
        print("Columna agregada exitosamente")
    else:
        print("La columna ya existe")

if __name__ == "__main__":
    from app import app
    with app.app_context():
        migrate()
