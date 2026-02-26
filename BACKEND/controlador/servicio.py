from database import db
from modelo.servicio import Servicio

def listar_servicios(id_barberia):
    return Servicio.query.filter_by(id_barberia=id_barberia, activo=True).all()

def obtener_servicio(id_servicio):
    return Servicio.query.get(id_servicio)

def crear_servicio(id_barberia, nombre, descripcion, precio, duracion_minutos):
    nuevo = Servicio(
        id_barberia=id_barberia,
        nombre=nombre,
        descripcion=descripcion,
        precio=precio,
        duracion_minutos=duracion_minutos
    )
    db.session.add(nuevo)
    db.session.commit()
    return nuevo

def actualizar_servicio(id_servicio, nombre=None, descripcion=None, precio=None, duracion_minutos=None):
    servicio = Servicio.query.get(id_servicio)
    if servicio:
        if nombre: servicio.nombre = nombre
        if descripcion: servicio.descripcion = descripcion
        if precio: servicio.precio = precio
        if duracion_minutos: servicio.duracion_minutos = duracion_minutos
        db.session.commit()
    return servicio

def eliminar_servicio(id_servicio):
    servicio = Servicio.query.get(id_servicio)
    if servicio:
        servicio.activo = False
        db.session.commit()
        return True
    return False
