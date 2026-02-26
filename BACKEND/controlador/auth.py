from database import db
from modelo.barbero import Barbero
from werkzeug.security import generate_password_hash, check_password_hash

def registrar_barbero(id_barberia, nombre, telefono, correo, contrasena, foto_url=None, comision_porcentaje=50):
    existente = Barbero.query.filter_by(correo=correo, id_barberia=id_barberia).first()
    if existente:
        return None, "Ya existe un barbero registrado con este correo en esta barbería"
    
    contrasena_hash = generate_password_hash(contrasena)
    
    nuevo = Barbero(
        id_barberia=id_barberia,
        nombre=nombre,
        telefono=telefono,
        correo=correo,
        contrasena=contrasena_hash,
        foto_url=foto_url,
        comision_porcentaje=comision_porcentaje,
        activo=True
    )
    db.session.add(nuevo)
    db.session.commit()
    return nuevo, None

def login_barbero(correo, contrasena, id_barberia=None):
    query = Barbero.query.filter_by(correo=correo, activo=True)
    
    if id_barberia:
        query = query.filter_by(id_barberia=id_barberia)
    
    barbero = query.first()
    
    if not barbero:
        return None, "Barbero no encontrado"
    
    if not check_password_hash(barbero.contrasena, contrasena):
        return None, "Contraseña incorrecta"
    
    return barbero, None

def obtener_barbero_por_id(id_barbero):
    return Barbero.query.get(id_barbero)

def listar_barberos_por_barberia(id_barberia):
    return Barbero.query.filter_by(id_barberia=id_barberia, activo=True).all()
