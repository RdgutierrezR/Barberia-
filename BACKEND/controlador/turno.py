from database import db
from modelo.turno import Turno
from modelo.servicio import Servicio
from modelo.contabilidad import Contabilidad
from datetime import datetime, timedelta
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

def obtener_turno(id_turno):
    return Turno.query.get(id_turno)

def obtener_turno_por_codigo(codigo, id_barberia):
    return Turno.query.filter_by(codigo_confirmacion=codigo, id_barberia=id_barberia).first()

def verificar_disponibilidad(id_barbero, fecha_hora, duracion_servicio):
    hora_fin_estimada = fecha_hora + timedelta(minutes=duracion_servicio)
    turnos_conflictivos = Turno.query.filter(
        Turno.id_barbero == id_barbero,
        Turno.estado.in_(["pendiente", "confirmado", "en_proceso"]),
        Turno.fecha_hora < hora_fin_estimada,
        db.or_(
            Turno.fecha_hora + timedelta(minutes=30) > fecha_hora
        )
    ).count()
    return turnos_conflictivos == 0

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

def obtener_siguiente_turno(id_barberia, id_barbero):
    turno = Turno.query.filter(
        Turno.id_barberia == id_barberia,
        Turno.id_barbero == id_barbero,
        Turno.estado == "pendiente"
    ).order_by(Turno.fecha_creacion).first()
    return turno

def pasar_siguiente(id_barberia, id_barbero):
    turno_actual = Turno.query.filter(
        Turno.id_barberia == id_barberia,
        Turno.id_barbero == id_barbero,
        Turno.estado == "en_proceso"
    ).first()
    
    if turno_actual:
        turno_actual.estado = "completado"
        registrar_contabilidad(
            turno_actual.id_barberia, 
            turno_actual.id_barbero, 
            turno_actual.id_turno, 
            float(turno_actual.precio_final), 
            "ingreso", 
            "Corte completado"
        )
    
    siguiente = Turno.query.filter(
        Turno.id_barberia == id_barberia,
        Turno.id_barbero == id_barbero,
        Turno.estado == "pendiente"
    ).order_by(Turno.fecha_creacion).first()
    
    if siguiente:
        siguiente.estado = "en_proceso"
        db.session.commit()
        return siguiente
    
    db.session.commit()
    return None

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
    
    codigo = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    
    nuevo = Turno(
        id_barberia=id_barberia,
        id_barbero=id_barbero,
        id_servicio=id_servicio,
        id_cliente=cliente.id_cliente,
        fecha_hora=datetime.utcnow(),
        codigo_confirmacion=codigo,
        notas=notas,
        precio_final=servicio.precio,
        estado="pendiente"
    )
    db.session.add(nuevo)
    db.session.commit()
    
    posicion = obtener_posicion_cola(id_barbero)
    
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
        db.session.commit()
    return turno

def completar_turno(id_turno, precio_final=None):
    turno = Turno.query.get(id_turno)
    if turno:
        turno.estado = "completado"
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
