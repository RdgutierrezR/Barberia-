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

def obtener_metricas_barbero(id_barberia, id_barbero, fecha_inicio=None, fecha_fin=None):
    from modelo.turno import Turno
    from modelo.servicio import Servicio
    
    hoy = datetime.utcnow()
    
    if fecha_inicio and fecha_fin:
        fecha_inicio_dt = datetime.strptime(fecha_inicio, "%Y-%m-%d")
        fecha_fin_dt = datetime.strptime(fecha_fin, "%Y-%m-%d") + timedelta(days=1)
    else:
        fecha_inicio_dt = hoy.replace(hour=0, minute=0, second=0, microsecond=0)
        fecha_fin_dt = hoy + timedelta(days=1)
    
    turnos_completados = Turno.query.filter(
        Turno.id_barberia == id_barberia,
        Turno.id_barbero == id_barbero,
        Turno.estado == "completado",
        Turno.duracion_minutos.isnot(None),
        Turno.fecha_fin_servicio >= fecha_inicio_dt,
        Turno.fecha_fin_servicio < fecha_fin_dt
    ).all()
    
    if not turnos_completados:
        return {
            "duracion_promedio": 0,
            "total_servicios": 0,
            "servicios_detalle": [],
            "productividad_diaria": []
        }
    
    duraciones = [t.duracion_minutos for t in turnos_completados if t.duracion_minutos]
    duracion_promedio = sum(duraciones) / len(duraciones) if duraciones else 0
    
    servicios_detalle = {}
    for turno in turnos_completados:
        if turno.servicio:
            svc_nombre = turno.servicio.nombre
            if svc_nombre not in servicios_detalle:
                servicios_detalle[svc_nombre] = {"count": 0, "duracion_total": 0}
            servicios_detalle[svc_nombre]["count"] += 1
            servicios_detalle[svc_nombre]["duracion_total"] += turno.duracion_minutos or 0
    
    servicios_list = []
    for nombre, data in servicios_detalle.items():
        servicios_list.append({
            "servicio": nombre,
            "cantidad": data["count"],
            "duracion_promedio": round(data["duracion_total"] / data["count"], 1) if data["count"] > 0 else 0
        })
    
    productividad_diaria = {}
    for turno in turnos_completados:
        if turno.fecha_fin_servicio:
            fecha_key = turno.fecha_fin_servicio.strftime("%Y-%m-%d")
            if fecha_key not in productividad_diaria:
                productividad_diaria[fecha_key] = {"servicios": 0, "duracion_total": 0}
            productividad_diaria[fecha_key]["servicios"] += 1
            productividad_diaria[fecha_key]["duracion_total"] += turno.duracion_minutos or 0
    
    productividad_list = []
    for fecha, data in sorted(productividad_diaria.items()):
        productividad_list.append({
            "fecha": fecha,
            "servicios": data["servicios"],
            "duracion_promedio": round(data["duracion_total"] / data["servicios"], 1) if data["servicios"] > 0 else 0
        })
    
    return {
        "duracion_promedio": round(duracion_promedio, 1),
        "total_servicios": len(turnos_completados),
        "servicios_detalle": servicios_list,
        "productividad_diaria": productividad_list
    }

def obtener_metricas_servicio(id_barberia, id_servicio=None):
    from modelo.turno import Turno
    from modelo.servicio import Servicio
    
    query = Turno.query.filter(
        Turno.id_barberia == id_barberia,
        Turno.estado == "completado",
        Turno.duracion_minutos.isnot(None)
    )
    
    if id_servicio:
        query = query.filter(Turno.id_servicio == id_servicio)
    
    turnos = query.all()
    
    if not turnos:
        return []
    
    servicios_dict = {}
    for turno in turnos:
        if turno.servicio:
            svc_id = turno.servicio.id_servicio
            if svc_id not in servicios_dict:
                servicios_dict[svc_id] = {
                    "id_servicio": svc_id,
                    "servicio": turno.servicio.nombre,
                    "duracion_estimada": turno.servicio.duracion_minutos,
                    "count": 0,
                    "duracion_total": 0
                }
            servicios_dict[svc_id]["count"] += 1
            servicios_dict[svc_id]["duracion_total"] += turno.duracion_minutos or 0
    
    resultados = []
    for svc_id, data in servicios_dict.items():
        duracion_promedio = data["duracion_total"] / data["count"] if data["count"] > 0 else 0
        diferencia = duracion_promedio - data["duracion_estimada"]
        resultados.append({
            "id_servicio": data["id_servicio"],
            "servicio": data["servicio"],
            "duracion_estimada": data["duracion_estimada"],
            "duracion_promedio_real": round(duracion_promedio, 1),
            "diferencia": round(diferencia, 1),
            "total_atenciones": data["count"]
        })
    
    return resultados

def obtener_metricas_barberia(id_barberia, fecha_inicio=None, fecha_fin=None):
    from modelo.turno import Turno
    
    hoy = datetime.utcnow()
    
    if fecha_inicio and fecha_fin:
        fecha_inicio_dt = datetime.strptime(fecha_inicio, "%Y-%m-%d")
        fecha_fin_dt = datetime.strptime(fecha_fin, "%Y-%m-%d") + timedelta(days=1)
    else:
        fecha_inicio_dt = hoy.replace(hour=0, minute=0, second=0, microsecond=0)
        fecha_fin_dt = hoy + timedelta(days=1)
    
    turnos = Turno.query.filter(
        Turno.id_barberia == id_barberia,
        Turno.estado == "completado",
        Turno.duracion_minutos.isnot(None),
        Turno.fecha_fin_servicio >= fecha_inicio_dt,
        Turno.fecha_fin_servicio < fecha_fin_dt
    ).all()
    
    barberos_dict = {}
    for turno in turnos:
        barbero_nombre = turno.barbero.nombre if turno.barbero else "Desconocido"
        barbero_id = turno.id_barbero
        if barbero_id not in barberos_dict:
            barberos_dict[barbero_id] = {
                "id_barbero": barbero_id,
                "barbero": barbero_nombre,
                "servicios": 0,
                "duracion_total": 0
            }
        barberos_dict[barbero_id]["servicios"] += 1
        barberos_dict[barbero_id]["duracion_total"] += turno.duracion_minutos or 0
    
    resultados = []
    for barbero_id, data in barberos_dict.items():
        resultados.append({
            "id_barbero": data["id_barbero"],
            "barbero": data["barbero"],
            "total_servicios": data["servicios"],
            "duracion_promedio": round(data["duracion_total"] / data["servicios"], 1) if data["servicios"] > 0 else 0
        })
    
    return resultados

def obtener_metricas_operacionales(id_barberia, id_barbero, fecha_inicio=None, fecha_fin=None):
    from modelo.turno import Turno
    from modelo.horario_dia import HorarioDia
    from datetime import date, timedelta
    from database import db
    
    hoy = date.today()
    
    if fecha_inicio and fecha_fin:
        fecha_inicio_dt = datetime.strptime(fecha_inicio, "%Y-%m-%d")
        fecha_fin_dt = datetime.strptime(fecha_fin, "%Y-%m-%d") + timedelta(days=1)
        fecha_inicio_date = fecha_inicio_dt.date()
        fecha_fin_date = fecha_fin_dt.date() - timedelta(days=1)
    else:
        fecha_inicio_dt = hoy
        fecha_fin_dt = hoy + timedelta(days=1)
        fecha_inicio_date = hoy
        fecha_fin_date = hoy
    
    turnos_query = Turno.query.filter(
        Turno.id_barberia == id_barberia,
        Turno.id_barbero == id_barbero,
        Turno.fecha_hora >= fecha_inicio_dt,
        Turno.fecha_hora < fecha_fin_dt
    )
    
    turnos_all = turnos_query.all()
    turnos_completados = [t for t in turnos_all if t.estado == "completado"]
    turnos_cancelados = [t for t in turnos_all if t.estado == "cancelado"]
    
    total_turnos = len(turnos_all)
    total_completados = len(turnos_completados)
    total_cancelados = len(turnos_cancelados)
    
    tasa_cancelacion = round((total_cancelados / total_turnos * 100), 1) if total_turnos > 0 else 0
    
    duraciones = [t.duracion_minutos for t in turnos_completados if t.duracion_minutos]
    tiempo_total_minutos = sum(duraciones)
    tiempo_promedio = round(tiempo_total_minutos / len(duraciones), 1) if duraciones else 0
    
    dias = []
    fecha_actual = fecha_inicio_date
    while fecha_actual <= fecha_fin_date:
        dias.append(fecha_actual)
        fecha_actual += timedelta(days=1)
    
    tiempo_disponible_total = 0
    ocupacion_diaria = []
    
    for dia in dias:
        horario_dia = HorarioDia.query.filter_by(
            id_barberia=id_barberia,
            id_barbero=id_barbero,
            fecha=dia,
            activo=True
        ).first()
        
        if horario_dia:
            from datetime import time
            inicio = horario_dia.hora_inicio
            fin = horario_dia.hora_fin
            if isinstance(inicio, time) and isinstance(fin, time):
                minutos_dia = (fin.hour * 60 + fin.minute) - (inicio.hour * 60 + inicio.minute)
            else:
                minutos_dia = 0
        else:
            minutos_dia = 0
        
        tiempo_disponible_total += minutos_dia
        
        turnos_dia = [t for t in turnos_all if t.fecha_hora and t.fecha_hora.date() == dia]
        completados_dia = [t for t in turnos_dia if t.estado == "completado"]
        duraciones_dia = [t.duracion_minutos for t in completados_dia if t.duracion_minutos]
        tiempo_trabajado_dia = sum(duraciones_dia)
        
        ocupacion_pct = round((tiempo_trabajado_dia / minutos_dia * 100), 1) if minutos_dia > 0 else 0
        
        ocupacion_diaria.append({
            "fecha": dia.isoformat(),
            "tiempo_disponible": minutos_dia,
            "tiempo_trabajado": tiempo_trabajado_dia,
            "ocupacion_porcentaje": ocupacion_pct,
            "turnos_completados": len(completados_dia)
        })
    
    porcentaje_ocupacion = round((tiempo_total_minutos / tiempo_disponible_total * 100), 1) if tiempo_disponible_total > 0 else 0
    
    servicios_dict = {}
    for turno in turnos_completados:
        if turno.servicio:
            svc_nombre = turno.servicio.nombre
            if svc_nombre not in servicios_dict:
                servicios_dict[svc_nombre] = {"count": 0, "duracion_total": 0}
            servicios_dict[svc_nombre]["count"] += 1
            servicios_dict[svc_nombre]["duracion_total"] += turno.duracion_minutos or 0
    
    servicios_list = []
    for nombre, data in servicios_dict.items():
        servicios_list.append({
            "servicio": nombre,
            "cantidad": data["count"],
            "duracion_promedio": round(data["duracion_total"] / data["count"], 1) if data["count"] > 0 else 0
        })
    
    return {
        "total_turnos": total_turnos,
        "total_completados": total_completados,
        "total_cancelados": total_cancelados,
        "tasa_cancelacion": tasa_cancelacion,
        "tiempo_total_minutos": tiempo_total_minutos,
        "tiempo_promedio": tiempo_promedio,
        "tiempo_disponible_minutos": tiempo_disponible_total,
        "porcentaje_ocupacion": porcentaje_ocupacion,
        "ocupacion_diaria": ocupacion_diaria,
        "servicios_detalle": servicios_list
    }
