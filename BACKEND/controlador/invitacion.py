from database import db
from modelo.invitacion import Invitacion
from modelo.barberia import Barberia
from modelo.barbero import Barbero
from werkzeug.security import generate_password_hash
from fecha_actual import ahora
import uuid

def crear_invitacion(tipo="crear_barberia", creador_id=None):
    codigo = str(uuid.uuid4()).replace("-", "").upper()[:12]
    
    while Invitacion.query.filter_by(codigo=codigo).first():
        codigo = str(uuid.uuid4()).replace("-", "").upper()[:12]
    
    from datetime import timedelta
    invitacion = Invitacion(
        codigo=codigo,
        tipo=tipo,
        creador_id=creador_id,
        fecha_expiracion=ahora() + timedelta(days=30)
    )
    
    db.session.add(invitacion)
    db.session.commit()
    return invitacion

def validar_invitacion(codigo):
    invitacion = Invitacion.query.filter_by(codigo=codigo).first()
    if not invitacion:
        return None, "Código no encontrado"
    if not invitacion.esta_activa():
        return None, "Código expirado o ya usado"
    return invitacion, None

def usar_invitacion(codigo, email):
    invitacion, error = validar_invitacion(codigo)
    if error:
        return None, error
    
    invitacion.usada = True
    invitacion.email_usado = email
    db.session.commit()
    return invitacion, None

def registrar_barberia_con_invitacion(codigo_inv, nombre_barberia, nombre_barbero, telefono, correo, contrasena, direccion=None, telefono_barberia=None):
    invitacion, error = validar_invitacion(codigo_inv)
    if error:
        return None, None, error
    
    if invitacion.tipo != "crear_barberia":
        return None, None, "Este código no es para crear barberías"
    
    existente_barberia = Barberia.query.filter_by(correo=correo).first()
    if existente_barberia:
        return None, None, "Ya existe una barbería con este correo"
    
    codigo_qr = str(uuid.uuid4())[:8].upper()
    barberia = Barberia(
        nombre=nombre_barberia,
        direccion=direccion,
        telefono=telefono_barberia,
        correo=correo,
        codigo_qr_base=codigo_qr
    )
    db.session.add(barberia)
    db.session.flush()
    
    contrasena_hash = generate_password_hash(contrasena)
    barbero = Barbero(
        id_barberia=barberia.id_barberia,
        nombre=nombre_barbero,
        telefono=telefono,
        correo=correo,
        contrasena=contrasena_hash,
        rol="owner",
        activo=True
    )
    db.session.add(barbero)
    
    invitacion.usada = True
    invitacion.email_usado = correo
    
    db.session.commit()
    return barberia, barbero, None
