from database import db
from modelo.horario import Horario

def listar_horarios(id_barberia, id_barbero=None):
    query = Horario.query.filter_by(id_barberia=id_barberia, activo=True)
    if id_barbero:
        query = query.filter_by(id_barbero=id_barbero)
    return query.all()

def obtener_horario(id_horario):
    return Horario.query.get(id_horario)

def crear_horario(id_barberia, id_barbero, dia_semana, hora_inicio, hora_fin):
    existente = Horario.query.filter_by(
        id_barberia=id_barberia,
        id_barbero=id_barbero,
        dia_semana=dia_semana
    ).first()
    
    if existente:
        existente.hora_inicio = hora_inicio
        existente.hora_fin = hora_fin
        db.session.commit()
        return existente
    
    nuevo = Horario(
        id_barberia=id_barberia,
        id_barbero=id_barbero,
        dia_semana=dia_semana,
        hora_inicio=hora_inicio,
        hora_fin=hora_fin
    )
    db.session.add(nuevo)
    db.session.commit()
    return nuevo

def eliminar_horario(id_horario):
    horario = Horario.query.get(id_horario)
    if horario:
        horario.activo = False
        db.session.commit()
        return True
    return False

def obtener_horarios_dia(id_barberia, id_barbero, dia_semana):
    return Horario.query.filter_by(
        id_barberia=id_barberia,
        id_barbero=id_barbero,
        dia_semana=dia_semana,
        activo=True
    ).all()
