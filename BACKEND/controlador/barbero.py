from database import db
from modelo.barbero import Barbero
from werkzeug.security import generate_password_hash

def listar_barberos(id_barberia):
    return Barbero.query.filter_by(id_barberia=id_barberia, activo=True).all()

def obtener_barbero(id_barbero):
    return Barbero.query.get(id_barbero)

def obtener_barbero_por_correo(correo):
    return Barbero.query.filter_by(correo=correo).first()

def crear_barbero(id_barberia, nombre, telefono, correo, contrasena, foto_url=None, comision_porcentaje=50):
    contrasena_hash = generate_password_hash(contrasena)
    nuevo = Barbero(
        id_barberia=id_barberia,
        nombre=nombre,
        telefono=telefono,
        correo=correo,
        contrasena=contrasena_hash,
        foto_url=foto_url,
        comision_porcentaje=comision_porcentaje
    )
    db.session.add(nuevo)
    db.session.commit()
    return nuevo

def actualizar_barbero(id_barbero, nombre=None, telefono=None, correo=None, foto_url=None, comision_porcentaje=None):
    barbero = Barbero.query.get(id_barbero)
    if barbero:
        if nombre: barbero.nombre = nombre
        if telefono: barbero.telefono = telefono
        if correo: barbero.correo = correo
        if foto_url: barbero.foto_url = foto_url
        if comision_porcentaje: barbero.comision_porcentaje = comision_porcentaje
        db.session.commit()
    return barbero

def eliminar_barbero(id_barbero):
    barbero = Barbero.query.get(id_barbero)
    if barbero:
        barbero.activo = False
        db.session.commit()
        return True
    return False
