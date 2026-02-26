from database import db
from modelo.barberia import Barberia

def listar_barberias():
    return Barberia.query.filter_by(activa=True).all()

def obtener_barberia(id_barberia):
    return Barberia.query.get(id_barberia)

def obtener_barberia_por_codigo(codigo_qr):
    return Barberia.query.filter_by(codigo_qr_base=codigo_qr).first()

def crear_barberia(nombre, direccion=None, telefono=None, correo=None, logo_url=None):
    import uuid
    codigo_qr = str(uuid.uuid4())[:8].upper()
    nuevo = Barberia(
        nombre=nombre,
        direccion=direccion,
        telefono=telefono,
        correo=correo,
        logo_url=logo_url,
        codigo_qr_base=codigo_qr
    )
    db.session.add(nuevo)
    db.session.commit()
    return nuevo

def actualizar_barberia(id_barberia, nombre=None, direccion=None, telefono=None, correo=None, logo_url=None):
    barberia = Barberia.query.get(id_barberia)
    if barberia:
        if nombre: barberia.nombre = nombre
        if direccion: barberia.direccion = direccion
        if telefono: barberia.telefono = telefono
        if correo: barberia.correo = correo
        if logo_url: barberia.logo_url = logo_url
        db.session.commit()
    return barberia

def eliminar_barberia(id_barberia):
    barberia = Barberia.query.get(id_barberia)
    if barberia:
        barberia.activa = False
        db.session.commit()
        return True
    return False
