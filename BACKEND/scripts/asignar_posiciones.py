"""
Script para asignar posiciones a turnos existentes que no la tengan.
Ejecutar una vez después de actualizar el código.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app
from database import db
from modelo.turno import Turno

def asignar_posiciones():
    with app.app_context():
        # Obtener todas las barberías y barberos con turnos activos
        turnos_activos = Turno.query.filter(
            Turno.estado.in_(["pendiente", "confirmado", "en_proceso"]),
            Turno.tipo_reserva == "cola"
        ).all()
        
        # Agrupar por barbería y barbero
        grupos = {}
        for turno in turnos_activos:
            key = (turno.id_barberia, turno.id_barbero)
            if key not in grupos:
                grupos[key] = []
            grupos[key].append(turno)
        
        # Asignar posiciones a cada grupo
        for (id_barberia, id_barbero), turnos in grupos.items():
            # Ordenar por fecha_creacion
            turnos_ordenados = sorted(turnos, key=lambda t: t.fecha_creacion or t.id_turno)
            
            print(f"Barbería {id_barberia}, Barbero {id_barbero}: {len(turnos_ordenados)} turnos")
            
            for i, turno in enumerate(turnos_ordenados, 1):
                if turno.posicion is None:
                    turno.posicion = i
                    print(f"  Turno {turno.id_turno}: posicion={i}")
        
        db.session.commit()
        print("Posiciones asignadas correctamente")

if __name__ == "__main__":
    asignar_posiciones()
