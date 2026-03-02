from database import db
from modelo.turno import Turno
from modelo.servicio import Servicio
from modelo.contabilidad import Contabilidad
from modelo.bloqueo_agenda import BloqueoAgenda
from modelo.horario import Horario
from datetime import datetime, timedelta, time, date
import random
import string

def listar_turnos(id_barberia, fecha=None, id_barbero=None, estado=None):
    query = Turno.query.filter_by(id_barberia=id_barberia)
    if fecha:
        fecha_inicio = datetime.strptime(fecha, "%Y-%m-%d")
        fecha_fin = fecha_inicio + timedelta(days=1)
        query = query.filter(Turno.fecha_hora >= fecha_inicio, Turno.fecha_hora < fecha_fin)
    if id_barbero:
        query = query.filter_by(id_barbero=id_barbero)
    if estado:
        query = query.filter_by(estado=estado)
    return query.order_by(Turno.fecha_hora).all()

def listar_turnos_por_horario_dia(id_barberia, id_barbero, fecha, estado=None):
    from modelo.horario_dia import HorarioDia
    
    fecha_date = datetime.strptime(fecha, "%Y-%m-%d").date()
    
    horario_dia = HorarioDia.query.filter_by(
        id_barberia=id_barberia,
        id_barbero=id_barbero,
        fecha=fecha_date,
        activo=True
    ).first()
    
    if not horario_dia:
        return []
    
    hora_inicio_dt = datetime.combine(fecha_date, horario_dia.hora_inicio)
    hora_fin_dt = datetime.combine(fecha_date, horario_dia.hora_fin)
    
    query = Turno.query.filter(
        Turno.id_barberia == id_barberia,
        Turno.id_barbero == id_barbero,
        Turno.fecha_hora >= hora_inicio_dt,
        Turno.fecha_hora < hora_fin_dt
    )
    
    if estado:
        query = query.filter_by(estado=estado)
    
    return query.order_by(Turno.fecha_hora).all()

def obtener_turno(id_turno):
    return Turno.query.get(id_turno)

def obtener_turno_por_codigo(codigo, id_barberia):
    return Turno.query.filter_by(codigo_confirmacion=codigo, id_barberia=id_barberia).first()

def obtener_posicion_cola(id_barbero):
    turnos_en_cola = Turno.query.filter(
        Turno.id_barbero == id_barbero,
        Turno.estado.in_(["pendiente", "confirmado"])
    ).order_by(Turno.fecha_creacion).all()
    
    for i, turno in enumerate(turnos_en_cola):
        if turno.estado == "pendiente":
            return i + 1
    return len(turnos_en_cola) + 1

def obtener_posicion_turno(id_barbero, id_turno_actual):
    turnos_en_cola = Turno.query.filter(
        Turno.id_barbero == id_barbero,
        Turno.estado.in_(["pendiente", "confirmado", "en_proceso"])
    ).order_by(Turno.fecha_creacion).all()
    
    posicion = 0
    turnos_adelante = 0
    encuentra_actual = False
    
    for turno in turnos_en_cola:
        if turno.id_turno == id_turno_actual:
            posicion = turnos_adelante + 1
            encuentra_actual = True
            break
        if turno.estado in ["pendiente", "confirmado"]:
            turnos_adelante += 1
    
    if not encuentra_actual:
        return {"posicion": None, "turnos_adelante": 0}
    
    return {"posicion": posicion, "turnos_adelante": turnos_adelante}

def obtener_cola_barbero(id_barberia, id_barbero):
    return Turno.query.filter(
        Turno.id_barberia == id_barberia,
        Turno.id_barbero == id_barbero,
        Turno.estado.in_(["pendiente", "confirmado", "en_proceso"])
    ).order_by(Turno.fecha_creacion).all()

def crear_turno_cola(id_barberia, id_barbero, id_servicio, nombre_cliente, telefono, notas=None):
    from modelo.cliente import Cliente
    import uuid
    
    servicio = Servicio.query.get(id_servicio)
    if not servicio:
        return None, "Servicio no encontrado"
    
    if servicio.id_barberia != id_barberia:
        return None, "El servicio no pertenece a esta barbería"
    
    cliente = Cliente.query.filter_by(telefono=telefono, id_barberia=id_barberia).first()
    if not cliente:
        codigo_qr = str(uuid.uuid4())[:8].upper()
        cliente = Cliente(
            id_barberia=id_barberia,
            nombre=nombre_cliente,
            telefono=telefono,
            codigo_qr=codigo_qr
        )
        db.session.add(cliente)
        db.session.commit()
    else:
        cliente.nombre = nombre_cliente
        db.session.commit()
    
    turnos_activos = Turno.query.filter(
        Turno.id_barberia == id_barberia,
        Turno.id_barbero == id_barbero,
        Turno.estado.in_(["pendiente", "confirmado", "en_proceso"]),
        Turno.tipo_reserva == "cola"
    ).all()
    
    duracion_promedio = servicio.duracion_minutos
    ahora = datetime.now()
    fecha_hora_turno = ahora.replace(second=0, microsecond=0)
    
    codigo = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    
    nuevo = Turno(
        id_barberia=id_barberia,
        id_barbero=id_barbero,
        id_servicio=id_servicio,
        id_cliente=cliente.id_cliente,
        fecha_hora=fecha_hora_turno,
        codigo_confirmacion=codigo,
        notas=notas,
        precio_final=servicio.precio,
        estado="pendiente"
    )
    db.session.add(nuevo)
    db.session.commit()
    
    posicion = len(turnos_activos) + 1
    
    return {"turno": nuevo, "posicion": posicion}, None

def confirmar_turno(id_turno):
    turno = Turno.query.get(id_turno)
    if turno:
        turno.estado = "confirmado"
        db.session.commit()
    return turno

def iniciar_turno(id_turno):
    turno = Turno.query.get(id_turno)
    if turno:
        turno.estado = "en_proceso"
        turno.fecha_inicio_servicio = datetime.now()
        db.session.commit()
    return turno

def completar_turno(id_turno, precio_final=None):
    turno = Turno.query.get(id_turno)
    if turno:
        turno.estado = "completado"
        turno.fecha_fin_servicio = datetime.now()
        
        if turno.fecha_inicio_servicio:
            duracion = turno.fecha_fin_servicio - turno.fecha_inicio_servicio
            turno.duracion_minutos = int(duracion.total_seconds() / 60)
        
        if precio_final:
            turno.precio_final = precio_final
            registrar_contabilidad(turno.id_barberia, turno.id_barbero, turno.id_turno, precio_final, "ingreso", "Corte completado")
        else:
            registrar_contabilidad(turno.id_barberia, turno.id_barbero, turno.id_turno, float(turno.precio_final), "ingreso", "Corte completado")
        db.session.commit()
    return turno

def cancelar_turno(id_turno):
    turno = Turno.query.get(id_turno)
    if turno:
        turno.estado = "cancelado"
        db.session.commit()
    return turno

def registrar_contabilidad(id_barberia, id_barbero, id_turno, monto, tipo, descripcion):
    registro = Contabilidad(
        id_barberia=id_barberia,
        id_barbero=id_barbero,
        id_turno=id_turno,
        monto=monto,
        tipo=tipo,
        descripcion=descripcion
    )
    db.session.add(registro)
    db.session.commit()
    return registro

def verificar_conflicto_simple(id_barbero, fecha_hora_inicio, duracion_minutos, exclude_turno_id=None):
    from modelo.servicio import Servicio
    
    fecha_hora_fin = fecha_hora_inicio + timedelta(minutes=duracion_minutos)
    
    turnos_conflictivos = Turno.query.filter(
        Turno.id_barbero == id_barbero,
        Turno.estado.in_(["pendiente", "confirmado", "en_proceso"]),
        Turno.tipo_reserva == "cita",
        Turno.cita_fecha_hora.isnot(None)
    ).all()
    
    for turno in turnos_conflictivos:
        servicio = Servicio.query.get(turno.id_servicio)
        if not servicio:
            continue
        
        turno_inicio = turno.cita_fecha_hora
        turno_fin = turno_inicio + timedelta(minutes=servicio.duracion_minutos)
        
        if not (fecha_hora_fin <= turno_inicio or fecha_hora_inicio >= turno_fin):
            if exclude_turno_id and turno.id_turno == exclude_turno_id:
                continue
            return True
    
    bloqueos = BloqueoAgenda.query.filter(
        BloqueoAgenda.id_barbero == id_barbero,
        BloqueoAgenda.activo == True,
        db.or_(
            db.and_(BloqueoAgenda.fecha_inicio <= fecha_hora_inicio, BloqueoAgenda.fecha_fin > fecha_hora_inicio),
            db.and_(BloqueoAgenda.fecha_inicio < fecha_hora_fin, BloqueoAgenda.fecha_fin >= fecha_hora_fin),
            db.and_(BloqueoAgenda.fecha_inicio >= fecha_hora_inicio, BloqueoAgenda.fecha_fin <= fecha_hora_fin)
        )
    ).first()
    
    if bloqueos:
        return True
    
    return False

def obtener_horarios_disponibles(id_barberia, id_barbero, fecha, duracion_servicio):
    from modelo.horario import Horario
    from modelo.horario_dia import HorarioDia
    from datetime import time
    
    fecha_date = datetime.strptime(fecha, "%Y-%m-%d").date()
    dia_semana = fecha_date.weekday()
    hoy = date.today()
    es_hoy = fecha_date == hoy
    ahora = datetime.now()
    
    horario_dia = None
    if es_hoy:
        horario_dia = HorarioDia.query.filter_by(
            id_barberia=id_barberia,
            id_barbero=id_barbero,
            fecha=fecha_date,
            activo=True
        ).first()
    
    if horario_dia:
        hora_inicio = horario_dia.hora_inicio
        hora_fin = horario_dia.hora_fin
    else:
        horario = Horario.query.filter_by(
            id_barberia=id_barberia,
            id_barbero=id_barbero,
            dia_semana=dia_semana,
            activo=True
        ).first()
        
        if not horario:
            hora_inicio = time(9, 0)
            hora_fin = time(18, 0)
        else:
            hora_inicio = horario.hora_inicio
            hora_fin = horario.hora_fin
    
    hora_apertura = datetime.combine(fecha_date, hora_inicio)
    hora_cierre = datetime.combine(fecha_date, hora_fin)
    
    # Obtener turnos de cola
    turnos_cola = Turno.query.filter(
        Turno.id_barberia == id_barberia,
        Turno.id_barbero == id_barbero,
        Turno.tipo_reserva == "cola",
        Turno.estado.in_(["pendiente", "confirmado", "en_proceso"])
    ).order_by(Turno.fecha_creacion).all()
    
    # Calcular último horario ocupado por la cola
    if es_hoy and turnos_cola:
        # Usar la fecha_hora del primer turno
        primer_turno = turnos_cola[0]
        if primer_turno.fecha_hora and primer_turno.fecha_hora.date() == hoy:
            hora_inicio_intervalo = primer_turno.fecha_hora.replace(second=0, microsecond=0)
        else:
            hora_inicio_intervalo = ahora.replace(second=0, microsecond=0)
        
        # Sumar duraciones de la cola para encontrar el primer espacio disponible
        for turno in turnos_cola:
            svc = Servicio.query.get(turno.id_servicio)
            dur = svc.duracion_minutos if svc else 30
            hora_inicio_intervalo = hora_inicio_intervalo + timedelta(minutes=dur)
        
        # Redondear a la siguiente media hora
        if hora_inicio_intervalo.minute % 30 != 0:
            hora_inicio_intervalo = hora_inicio_intervalo + timedelta(minutes=30 - hora_inicio_intervalo.minute % 30)
    elif es_hoy:
        # Hoy sin cola: empezar desde ahora + margen de 30 min
        hora_inicio_intervalo = ahora.replace(second=0, microsecond=0) + timedelta(minutes=30)
        if hora_inicio_intervalo.minute % 30 != 0:
            hora_inicio_intervalo = hora_inicio_intervalo + timedelta(minutes=30 - hora_inicio_intervalo.minute % 30)
    else:
        # Otro día: empezar desde hora de apertura
        hora_inicio_intervalo = hora_apertura
    
    # Obtener citas del día
    turnos_cita = Turno.query.filter(
        Turno.id_barberia == id_barberia,
        Turno.id_barbero == id_barbero,
        Turno.tipo_reserva == "cita",
        Turno.cita_fecha_hora.isnot(None),
        Turno.estado.in_(["pendiente", "confirmado", "en_proceso"]),
        db.func.date(Turno.cita_fecha_hora) == fecha_date
    ).all()
    
    # Obtener bloqueos
    bloqueos = BloqueoAgenda.query.filter(
        BloqueoAgenda.id_barberia == id_barberia,
        BloqueoAgenda.id_barbero == id_barbero,
        BloqueoAgenda.activo == True,
        db.or_(
            db.and_(db.func.date(BloqueoAgenda.fecha_inicio) <= fecha_date, db.func.date(BloqueoAgenda.fecha_fin) >= fecha_date)
        )
    ).all()
    
    intervalos = []
    intervalo_minutos = 30
    
    hora_actual = hora_inicio_intervalo
    
    while hora_actual + timedelta(minutes=duracion_servicio) <= hora_cierre:
        hora_fin_slot = hora_actual + timedelta(minutes=duracion_servicio)
        
        conflicto = False
        
        # Verificar conflicto con citas
        for turno in turnos_cita:
            servicio = Servicio.query.get(turno.id_servicio)
            if not servicio:
                continue
            turno_inicio = turno.cita_fecha_hora
            turno_fin = turno_inicio + timedelta(minutes=servicio.duracion_minutos)
            
            if not (hora_fin_slot <= turno_inicio or hora_actual >= turno_fin):
                conflicto = True
                break
        
        # Verificar conflicto con bloqueos
        if not conflicto:
            for bloqueo in bloqueos:
                bloqueo_inicio = bloqueo.fecha_inicio
                bloqueo_fin = bloqueo.fecha_fin
                
                if isinstance(bloqueo_inicio, datetime):
                    bloqueo_inicio = bloqueo_inicio.replace(tzinfo=None)
                if isinstance(bloqueo_fin, datetime):
                    bloqueo_fin = bloqueo_fin.replace(tzinfo=None)
                
                if not (hora_fin_slot <= bloqueo_inicio or hora_actual >= bloqueo_fin):
                    conflicto = True
                    break
        
        if not conflicto:
            intervalos.append(hora_actual.strftime("%H:%M"))
        
        hora_actual = hora_actual + timedelta(minutes=intervalo_minutos)
    
    return intervalos

def crear_turno_cita(id_barberia, id_barbero, id_servicio, cita_fecha_hora, nombre_cliente, telefono, notas=None):
    from modelo.cliente import Cliente
    import uuid
    
    servicio = Servicio.query.get(id_servicio)
    if not servicio:
        return None, "Servicio no encontrado"
    
    if servicio.id_barberia != id_barberia:
        return None, "El servicio no pertenece a esta barbería"
    
    cita_dt = datetime.strptime(cita_fecha_hora, "%Y-%m-%d %H:%M")
    duracion = servicio.duracion_minutos
    
    if verificar_conflicto_simple(id_barbero, cita_dt, duracion):
        return None, "El horario seleccionado no está disponible"
    
    cliente = Cliente.query.filter_by(telefono=telefono, id_barberia=id_barberia).first()
    if not cliente:
        codigo_qr = str(uuid.uuid4())[:8].upper()
        cliente = Cliente(
            id_barberia=id_barberia,
            nombre=nombre_cliente,
            telefono=telefono,
            codigo_qr=codigo_qr
        )
        db.session.add(cliente)
        db.session.commit()
    else:
        cliente.nombre = nombre_cliente
        db.session.commit()
    
    codigo = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    
    nuevo = Turno(
        id_barberia=id_barberia,
        id_barbero=id_barbero,
        id_servicio=id_servicio,
        id_cliente=cliente.id_cliente,
        fecha_hora=cita_dt,
        cita_fecha_hora=cita_dt,
        fecha_cita_original=cita_dt,
        tipo_reserva="cita",
        codigo_confirmacion=codigo,
        notas=notas,
        precio_final=servicio.precio,
        estado="confirmado"
    )
    db.session.add(nuevo)
    db.session.commit()
    
    return {"turno": nuevo, "cita_fecha_hora": cita_dt.isoformat()}, None

def listar_turnos_cita(id_barberia, id_barbero=None, fecha=None):
    query = Turno.query.filter(
        Turno.id_barberia == id_barberia,
        Turno.tipo_reserva == "cita"
    )
    
    if id_barbero:
        query = query.filter(Turno.id_barbero == id_barbero)
    
    if fecha:
        fecha_date = datetime.strptime(fecha, "%Y-%m-%d").date()
        query = query.filter(db.func.date(Turno.cita_fecha_hora) == fecha_date)
    
    return query.order_by(Turno.cita_fecha_hora).all()

def agregar_cita_a_cola(id_turno):
    turno = Turno.query.get(id_turno)
    if not turno:
        return None, "Turno no encontrado"
    
    if turno.tipo_reserva != "cita":
        return None, "Solo se pueden agregar citas a la cola"
    
    ahora = datetime.now()
    
    turno.tipo_reserva = "cola"
    turno.fecha_hora = ahora
    turno.estado = "pendiente"
    
    turnos_cola = Turno.query.filter(
        Turno.id_barberia == turno.id_barberia,
        Turno.id_barbero == turno.id_barbero,
        Turno.tipo_reserva == "cola",
        Turno.estado.in_(["pendiente", "confirmado"])
    ).order_by(Turno.fecha_creacion).all()
    
    for t in turnos_cola:
        t.fecha_creacion = t.fecha_creacion + timedelta(minutes=1)
    
    turno.fecha_creacion = ahora - timedelta(minutes=len(turnos_cola) + 1)
    
    db.session.commit()
    
    return {"mensaje": "Cita agregada a cola", "turno": turno}, None

def crear_bloqueo(id_barberia, id_barbero, fecha_inicio, fecha_fin, motivo=None):
    inicio_dt = datetime.strptime(fecha_inicio, "%Y-%m-%d %H:%M")
    fin_dt = datetime.strptime(fecha_fin, "%Y-%m-%d %H:%M")
    
    bloqueos_existentes = BloqueoAgenda.query.filter(
        BloqueoAgenda.id_barbero == id_barbero,
        BloqueoAgenda.activo == True,
        db.or_(
            db.and_(BloqueoAgenda.fecha_inicio <= inicio_dt, BloqueoAgenda.fecha_fin > inicio_dt),
            db.and_(BloqueoAgenda.fecha_inicio < fin_dt, BloqueoAgenda.fecha_fin >= fin_dt),
            db.and_(BloqueoAgenda.fecha_inicio >= inicio_dt, BloqueoAgenda.fecha_fin <= fin_dt)
        )
    ).first()
    
    if bloqueos_existentes:
        return None, "Ya existe un bloqueo en ese horario"
    
    bloqueo = BloqueoAgenda(
        id_barberia=id_barberia,
        id_barbero=id_barbero,
        fecha_inicio=inicio_dt,
        fecha_fin=fin_dt,
        motivo=motivo
    )
    db.session.add(bloqueo)
    db.session.commit()
    
    return bloqueo, None

def listar_bloqueos(id_barberia, id_barbero=None):
    query = BloqueoAgenda.query.filter_by(id_barberia=id_barberia, activo=True)
    
    if id_barbero:
        query = query.filter_by(id_barbero=id_barbero)
    
    return query.order_by(BloqueoAgenda.fecha_inicio).all()

def eliminar_bloqueo(id_bloqueo):
    bloqueo = BloqueoAgenda.query.get(id_bloqueo)
    if bloqueo:
        bloqueo.activo = False
        db.session.commit()
        return True
    return False

def obtener_cola_diaria(id_barberia, id_barbero):
    from modelo.horario import Horario
    from modelo.horario_dia import HorarioDia
    from datetime import time
    
    hoy = date.today()
    ahora = datetime.now()
    
    horario_dia = HorarioDia.query.filter_by(
        id_barberia=id_barberia,
        id_barbero=id_barbero,
        fecha=hoy,
        activo=True
    ).first()
    
    inicio_dia = datetime.combine(hoy, time(0, 0))
    fin_dia = datetime.combine(hoy, time(23, 59, 59))
    
    turnos = Turno.query.filter(
        Turno.id_barberia == id_barberia,
        Turno.id_barbero == id_barbero,
        Turno.tipo_reserva == "cola",
        Turno.fecha_hora >= inicio_dia,
        Turno.fecha_hora <= fin_dia,
        Turno.estado.in_(["pendiente", "confirmado", "en_proceso"])
    ).order_by(Turno.fecha_creacion).all()
    
    if not turnos:
        return []
    
    # Usar la fecha_hora del primer turno si es de hoy, sino usar hora actual
    primer_turno = turnos[0]
    if primer_turno.fecha_hora and primer_turno.fecha_hora.date() == hoy:
        desde_hora = primer_turno.fecha_hora.replace(second=0, microsecond=0)
    else:
        desde_hora = ahora.replace(second=0, microsecond=0)
    
    resultado = []
    
    for i, turno in enumerate(turnos):
        if not turno.cliente:
            continue
        
        servicio = Servicio.query.get(turno.id_servicio)
        duracion_servicio = servicio.duracion_minutos if servicio else 30
        
        hora_programada = desde_hora.strftime("%H:%M")
        
        resultado.append({
            "id_turno": turno.id_turno,
            "id_cliente": turno.id_cliente,
            "cliente_nombre": turno.cliente.nombre if turno.cliente else "Sin nombre",
            "cliente_telefono": turno.cliente.telefono if turno.cliente else "",
            "servicio_nombre": servicio.nombre if servicio else "Servicio",
            "servicio_duracion": duracion_servicio,
            "servicio_precio": float(servicio.precio) if servicio and servicio.precio else 0,
            "tipo_reserva": "cola",
            "estado": turno.estado,
            "codigo_confirmacion": turno.codigo_confirmacion,
            "posicion_en_cola": i + 1,
            "hora_programada": hora_programada,
            "fecha_hora": turno.fecha_hora.isoformat() if turno.fecha_hora else None,
            "fecha_creacion": turno.fecha_creacion.isoformat() if turno.fecha_creacion else None
        })
        
        desde_hora = desde_hora + timedelta(minutes=duracion_servicio)
    
    return resultado

def obtener_siguiente_para_atender(id_barberia, id_barbero, forzar_cita=False):
    hoy = date.today()
    ahora = datetime.now()
    
    cola = obtener_cola_diaria(id_barberia, id_barbero)
    
    for item in cola:
        if item["estado"] == "en_proceso":
            return item
        
        if item["tipo_reserva"] == "cola":
            return item
        
        if item["tipo_reserva"] == "cita":
            if forzar_cita:
                return item
            
            hora_cita = datetime.strptime(item["hora_programada"], "%H:%M")
            hora_cita = hora_cita.replace(year=hoy.year, month=hoy.month, day=hoy.day)
            
            if hora_cita <= ahora:
                return item
    
    return None

def pasar_siguiente(id_barberia, id_barbero, forzar_cita=False):
    turno_actual = Turno.query.filter(
        Turno.id_barberia == id_barberia,
        Turno.id_barbero == id_barbero,
        Turno.estado == "en_proceso"
    ).first()
    
    if turno_actual:
        turno_actual.estado = "completado"
        turno_actual.fecha_fin_servicio = datetime.now()
        
        if turno_actual.fecha_inicio_servicio:
            duracion = turno_actual.fecha_fin_servicio - turno_actual.fecha_inicio_servicio
            turno_actual.duracion_minutos = int(duracion.total_seconds() / 60)
        
        registrar_contabilidad(
            turno_actual.id_barberia, 
            turno_actual.id_barbero, 
            turno_actual.id_turno, 
            float(turno_actual.precio_final), 
            "ingreso", 
            "Corte completado"
        )
    
    siguiente = obtener_siguiente_para_atender(id_barberia, id_barbero, forzar_cita)
    
    if siguiente:
        turno = Turno.query.get(siguiente["id_turno"])
        if turno:
            turno.estado = "en_proceso"
            turno.fecha_inicio_servicio = datetime.now()
            db.session.commit()
            return {
                "id_turno": turno.id_turno,
                "cliente_nombre": turno.cliente.nombre if turno.cliente else None,
                "servicio_nombre": siguiente["servicio_nombre"]
            }
    
    db.session.commit()
    return None

def reordenar_turno(id_turno, nueva_posicion):
    turno = Turno.query.get(id_turno)
    if not turno:
        return None, "Turno no encontrado"
    
    id_barberia = turno.id_barberia
    id_barbero = turno.id_barbero
    
    todos_turnos = Turno.query.filter(
        Turno.id_barberia == id_barberia,
        Turno.id_barbero == id_barbero,
        Turno.estado.in_(["pendiente", "confirmado"]),
        Turno.tipo_reserva == "cola"
    ).order_by(Turno.fecha_creacion).all()
    
    turnos_lista = [t for t in todos_turnos if t.id_turno != id_turno]
    
    if nueva_posicion <= 0:
        nueva_posicion = 1
    if nueva_posicion > len(turnos_lista) + 1:
        nueva_posicion = len(turnos_lista) + 1
    
    turnos_lista.insert(nueva_posicion - 1, turno)
    
    for i, t in enumerate(turnos_lista):
        t.fecha_creacion = datetime.utcnow() + timedelta(minutes=i)
    
    db.session.commit()
    return {"mensaje": "Turno reordenado", "nueva_posicion": nueva_posicion}

def marcar_llegada_cita(id_turno):
    turno = Turno.query.get(id_turno)
    if turno and turno.tipo_reserva == "cita":
        turno.estado = "confirmado"
        db.session.commit()
        return True
    return False
