"""
Migración para cambiar comision_porcentaje a comision_monto en la tabla barberos
"""
import sys
sys.path.insert(0, '.')

from database import db
from sqlalchemy import text

def migrate():
    print("Iniciando migración de comisión...")
    
    try:
        # Verificar si existe la columna comision_porcentaje
        result = db.session.execute(text("SHOW COLUMNS FROM barberos LIKE 'comision_porcentaje'"))
        if result.fetchone():
            print("Encontrado comision_porcentaje, creando comision_monto...")
            
            # Agregar nueva columna
            db.session.execute(text("ALTER TABLE barberos ADD COLUMN comision_monto DECIMAL(10,2) DEFAULT 0"))
            
            # Copiar valores (convertir porcentaje a monto fijo, valor por defecto 0)
            db.session.execute(text("UPDATE barberos SET comision_monto = 0 WHERE comision_porcentaje IS NULL OR comision_porcentaje = 50"))
            db.session.execute(text("UPDATE barberos SET comision_monto = 0 WHERE comision_porcentaje != 50"))
            
            # Eliminar columna vieja (opcional, descomenta si quieres eliminar)
            # db.session.execute(text("ALTER TABLE barberos DROP COLUMN comision_porcentaje"))
            
            db.session.commit()
            print("Migración completada exitosamente!")
        else:
            # Verificar si ya existe comision_monto
            result2 = db.session.execute(text("SHOW COLUMNS FROM barberos LIKE 'comision_monto'"))
            if result2.fetchone():
                print("La columna comision_monto ya existe, no hay nada que migrar.")
            else:
                print("No se encontró ni comision_porcentaje ni comision_monto")
                
    except Exception as e:
        print(f"Error en migración: {e}")
        db.session.rollback()

if __name__ == "__main__":
    from app import app
    with app.app_context():
        migrate()