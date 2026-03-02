from database import db
from modelo.horario_dia import HorarioDia
from modelo.horario import Horario
from datetime import datetime, date, time

def obtener_o_crear_horario_hoy(id_barberia, id_barbero):
    fecha_hoy = date.today()
    
    horario_dia = HorarioDia.query.filter_by(
        id_barberia=id_barberia,
        id_barbero=id_barbero,
        fecha=fecha_hoy,
        activo=True
    ).first()
    
    if horario_dia:
        return horario_dia
    
    dia_semana = fecha_hoy.weekday()
    horario_semanal = Horario.query.filter_by(
        id_barberia=id_barberia,
        id_barbero=id_barbero,
        dia_semana=dia_semana,
        activo=True
    ).first()
    
    if horario_semanal:
        return crear_horario_dia(
            id_barberia,
            id_barbero,
            fecha_hoy,
            horario_semanal.hora_inicio,
            horario_semanal.hora_fin
        )
    
    return None

def obtener_horario_dia(id_barberia, id_barbero, fecha=None):
    if fecha is None:
        fecha = date.today()
    
    return HorarioDia.query.filter_by(
        id_barberia=id_barberia,
        id_barbero=id_barbero,
        fecha=fecha,
        activo=True
    ).first()

def listar_horarios_dia(id_barberia, id_barbero=None, fecha_inicio=None, fecha_fin=None):
    query = HorarioDia.query.filter_by(id_barberia=id_barberia, activo=True)
    
    if id_barbero:
        query = query.filter_by(id_barbero=id_barbero)
    if fecha_inicio:
        query = query.filter(HorarioDia.fecha >= fecha_inicio)
    if fecha_fin:
        query = query.filter(HorarioDia.fecha <= fecha_fin)
    
    return query.order_by(HorarioDia.fecha.desc()).all()

def crear_horario_dia(id_barberia, id_barbero, fecha, hora_inicio, hora_fin):
    existente = HorarioDia.query.filter_by(
        id_barberia=id_barberia,
        id_barbero=id_barbero,
        fecha=fecha
    ).first()
    
    if existente:
        existente.hora_inicio = hora_inicio
        existente.hora_fin = hora_fin
        existente.activo = True
        db.session.commit()
        return existente
    
    nuevo = HorarioDia(
        id_barberia=id_barberia,
        id_barbero=id_barbero,
        fecha=fecha,
        hora_inicio=hora_inicio,
        hora_fin=hora_fin
    )
    db.session.add(nuevo)
    db.session.commit()
    return nuevo

def actualizar_horario_dia(id_horario_dia, hora_inicio=None, hora_fin=None):
    horario = HorarioDia.query.get(id_horario_dia)
    if horario:
        if hora_inicio:
            horario.hora_inicio = hora_inicio
        if hora_fin:
            horario.hora_fin = hora_fin
        db.session.commit()
        return horario
    return None

def eliminar_horario_dia(id_horario_dia):
    horario = HorarioDia.query.get(id_horario_dia)
    if horario:
        horario.activo = False
        db.session.commit()
        return True
    return False

def obtener_horario_trabajo(id_barberia, id_barbero, fecha=None):
    if fecha is None:
        fecha = date.today()
    
    horario_dia = obtener_horario_dia(id_barberia, id_barbero, fecha)
    
    if horario_dia:
        return {
            "hora_inicio": horario_dia.hora_inicio,
            "hora_fin": horario_dia.hora_fin,
            "fuente": "horario_dia"
        }
    
    dia_semana = fecha.weekday()
    horario_semanal = Horario.query.filter_by(
        id_barberia=id_barberia,
        id_barbero=id_barbero,
        dia_semana=dia_semana,
        activo=True
    ).first()
    
    if horario_semanal:
        return {
            "hora_inicio": horario_semanal.hora_inicio,
            "hora_fin": horario_semanal.hora_fin,
            "fuente": "horario_semanal"
        }
    
    return {
        "hora_inicio": time(9, 0),
        "hora_fin": time(18, 0),
        "fuente": "default"
    }
