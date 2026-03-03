from app import create_app
from database import db
from sqlalchemy import text

app = create_app()

with app.app_context():
    try:
        db.session.execute(text("DELETE FROM contabilidad"))
    except Exception as e:
        print(f"contabilidad: {e}")
    
    try:
        db.session.execute(text("DELETE FROM turnos"))
    except Exception as e:
        print(f"turnos: {e}")
    
    try:
        db.session.execute(text("DELETE FROM horarios_dia"))
    except Exception as e:
        print(f"horarios_dia: {e}")
    
    try:
        db.session.execute(text("DELETE FROM bloqueo_agenda"))
    except Exception as e:
        print(f"bloqueo_agenda: {e}")
    
    db.session.commit()
    print("Limpieza completada")
