from database import db
from modelo.contabilidad import Contabilidad
from sqlalchemy import func
from datetime import datetime, timedelta

def listar_contabilidad(id_barberia, id_barbero=None, fecha_inicio=None, fecha_fin=None):
    query = Contabilidad.query.filter_by(id_barberia=id_barberia)
    if id_barbero:
        query = query.filter_by(id_barbero=id_barbero)
    if fecha_inicio:
        query = query.filter(Contabilidad.fecha >= datetime.strptime(fecha_inicio, "%Y-%m-%d"))
    if fecha_fin:
        query = query.filter(Contabilidad.fecha <= datetime.strptime(fecha_fin, "%Y-%m-%d") + timedelta(days=1))
    return query.order_by(Contabilidad.fecha.desc()).all()

def obtener_contabilidad_barbero(id_barberia, id_barbero, fecha_inicio=None, fecha_fin=None):
    query = Contabilidad.query.filter_by(id_barberia=id_barberia, id_barbero=id_barbero)
    if fecha_inicio:
        query = query.filter(Contabilidad.fecha >= datetime.strptime(fecha_inicio, "%Y-%m-%d"))
    if fecha_fin:
        query = query.filter(Contabilidad.fecha <= datetime.strptime(fecha_fin, "%Y-%m-%d") + timedelta(days=1))
    return query.all()

def obtener_resumen_barbero(id_barberia, id_barbero, periodo="mensual", fecha_inicio=None, fecha_fin=None):
    hoy = datetime.utcnow()
    
    if fecha_inicio and fecha_fin:
        fecha_inicio_dt = datetime.strptime(fecha_inicio, "%Y-%m-%d")
        fecha_fin_dt = datetime.strptime(fecha_fin, "%Y-%m-%d") + timedelta(days=1)
    elif periodo == "diario":
        fecha_inicio = hoy.replace(hour=0, minute=0, second=0, microsecond=0)
        fecha_fin_dt = hoy + timedelta(days=1)
    elif periodo == "semanal":
        fecha_inicio = hoy - timedelta(days=7)
        fecha_fin_dt = hoy + timedelta(days=1)
    else:
        fecha_inicio = hoy.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        fecha_fin_dt = hoy + timedelta(days=1)
    
    query_filter = [
        Contabilidad.id_barberia == id_barberia,
        Contabilidad.id_barbero == id_barbero,
    ]
    
    if fecha_inicio and fecha_fin:
        query_filter.append(Contabilidad.fecha >= fecha_inicio_dt)
        query_filter.append(Contabilidad.fecha < fecha_fin_dt)
    else:
        query_filter.append(Contabilidad.fecha >= fecha_inicio)
    
    resultados = db.session.query(
        Contabilidad.tipo,
        func.sum(Contabilidad.monto).label("total")
    ).filter(*query_filter).group_by(Contabilidad.tipo).all()
    
    resumen = {"ingresos": 0, "egresos": 0, "cortes": 0}
    for tipo, total in resultados:
        if tipo == "ingreso":
            resumen["ingresos"] = float(total) if total else 0
            resumen["cortes"] = Contabilidad.query.filter(
                Contabilidad.id_barberia == id_barberia,
                Contabilidad.id_barbero == id_barbero,
                Contabilidad.tipo == "ingreso",
                Contabilidad.fecha >= (fecha_inicio_dt if (fecha_inicio and fecha_fin) else fecha_inicio)
            ).count()
        elif tipo == "egreso":
            resumen["egresos"] = float(total) if total else 0
    
    resumen["balance"] = resumen["ingresos"] - resumen["egresos"]
    return resumen

def obtener_resumen_barberia(id_barberia, periodo="mensual"):
    hoy = datetime.utcnow()
    if periodo == "diario":
        fecha_inicio = hoy.replace(hour=0, minute=0, second=0, microsecond=0)
    elif periodo == "semanal":
        fecha_inicio = hoy - timedelta(days=7)
    else:
        fecha_inicio = hoy.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    resultados = db.session.query(
        Contabilidad.tipo,
        func.sum(Contabilidad.monto).label("total")
    ).filter(
        Contabilidad.id_barberia == id_barberia,
        Contabilidad.fecha >= fecha_inicio
    ).group_by(Contabilidad.tipo).all()
    
    resumen = {"ingresos": 0, "egresos": 0}
    for tipo, total in resultados:
        if tipo == "ingreso":
            resumen["ingresos"] = float(total)
        elif tipo == "egreso":
            resumen["egresos"] = float(total)
    
    resumen["balance"] = resumen["ingresos"] - resumen["egresos"]
    return resumen
