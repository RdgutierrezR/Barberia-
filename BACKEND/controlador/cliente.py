from database import db
from modelo.cliente import Cliente
import uuid

def listar_clientes(id_barberia):
    return Cliente.query.filter_by(id_barberia=id_barberia, activo=True).all()

def obtener_cliente(id_cliente):
    return Cliente.query.get(id_cliente)

def obtener_cliente_por_qr(codigo_qr, id_barberia):
    return Cliente.query.filter_by(codigo_qr=codigo_qr, id_barberia=id_barberia).first()

def obtener_cliente_por_telefono(telefono, id_barberia):
    return Cliente.query.filter_by(telefono=telefono, id_barberia=id_barberia).first()

def crear_cliente(id_barberia, nombre, telefono, correo=None):
    codigo_qr = str(uuid.uuid4())[:8].upper()
    nuevo = Cliente(
        id_barberia=id_barberia,
        nombre=nombre,
        telefono=telefono,
        correo=correo,
        codigo_qr=codigo_qr
    )
    db.session.add(nuevo)
    db.session.commit()
    return nuevo

def actualizar_cliente(id_cliente, nombre=None, telefono=None, correo=None):
    cliente = Cliente.query.get(id_cliente)
    if cliente:
        if nombre: cliente.nombre = nombre
        if telefono: cliente.telefono = telefono
        if correo: cliente.correo = correo
        db.session.commit()
    return cliente

def eliminar_cliente(id_cliente):
    cliente = Cliente.query.get(id_cliente)
    if cliente:
        cliente.activo = False
        db.session.commit()
        return True
    return False
