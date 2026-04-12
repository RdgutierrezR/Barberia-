from database import db
from modelo.cliente import Cliente
from sqlalchemy.exc import IntegrityError
import uuid

def normalizar_telefono(telefono):
    if not telefono:
        return None
    numeros = ''.join(c for c in telefono if c.isdigit())
    if numeros.startswith('57') and len(numeros) > 10:
        numeros = numeros[2:]
    if numeros.startswith('0'):
        numeros = numeros[1:]
    return numeros

def listar_clientes(id_barberia):
    return Cliente.query.filter_by(id_barberia=id_barberia, activo=True).all()

def obtener_cliente(id_cliente):
    return Cliente.query.get(id_cliente)

def obtener_cliente_por_qr(codigo_qr, id_barberia):
    return Cliente.query.filter_by(codigo_qr=codigo_qr, id_barberia=id_barberia).first()

def obtener_cliente_por_telefono(telefono, id_barberia):
    telefono_normalizado = normalizar_telefono(telefono)
    if not telefono_normalizado:
        return None
    return Cliente.query.filter_by(telefono=telefono_normalizado, id_barberia=id_barberia).first()

def crear_cliente(id_barberia, nombre, telefono, correo=None):
    telefono_normalizado = normalizar_telefono(telefono)
    if not telefono_normalizado:
        return None, "Teléfono inválido"
    
    existente = Cliente.query.filter_by(
        telefono=telefono_normalizado, 
        id_barberia=id_barberia
    ).first()
    
    if existente:
        return existente, None
    
    codigo_qr = str(uuid.uuid4())[:8].upper()
    try:
        nuevo = Cliente(
            id_barberia=id_barberia,
            nombre=nombre,
            telefono=telefono_normalizado,
            correo=correo,
            codigo_qr=codigo_qr
        )
        db.session.add(nuevo)
        db.session.commit()
        return nuevo, None
    except IntegrityError:
        db.session.rollback()
        return Cliente.query.filter_by(
            telefono=telefono_normalizado, 
            id_barberia=id_barberia
        ).first(), None

def actualizar_cliente(id_cliente, nombre=None, telefono=None, correo=None):
    cliente = Cliente.query.get(id_cliente)
    if cliente:
        if nombre: 
            cliente.nombre = nombre
        if telefono: 
            telefono_normalizado = normalizar_telefono(telefono)
            if telefono_normalizado:
                cliente.telefono = telefono_normalizado
        if correo: 
            cliente.correo = correo
        db.session.commit()
    return cliente

def buscar_o_crear_cliente(id_barberia, nombre, telefono):
    telefono_normalizado = normalizar_telefono(telefono)
    if not telefono_normalizado:
        return None
    
    cliente = Cliente.query.filter_by(
        telefono=telefono_normalizado, 
        id_barberia=id_barberia
    ).first()
    
    if not cliente:
        codigo_qr = str(uuid.uuid4())[:8].upper()
        try:
            cliente = Cliente(
                id_barberia=id_barberia,
                nombre=nombre,
                telefono=telefono_normalizado,
                codigo_qr=codigo_qr
            )
            db.session.add(cliente)
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            cliente = Cliente.query.filter_by(
                telefono=telefono_normalizado, 
                id_barberia=id_barberia
            ).first()
    
    if cliente and cliente.nombre != nombre:
        cliente.nombre = nombre
        db.session.commit()
    
    return cliente

def eliminar_cliente(id_cliente):
    cliente = Cliente.query.get(id_cliente)
    if cliente:
        cliente.activo = False
        db.session.commit()
        return True
    return False

def consolidar_duplicados():
    from modelo.turno import Turno
    
    duplicados = db.session.query(
        Cliente.telefono,
        Cliente.id_barberia
    ).filter(
        Cliente.activo == True
    ).group_by(
        Cliente.telefono,
        Cliente.id_barberia
    ).having(
        db.func.count(Cliente.id_cliente) > 1
    ).all()
    
    total_consolidados = 0
    total_desactivados = 0
    
    for telefono, id_barberia in duplicados:
        clientes = Cliente.query.filter_by(
            telefono=telefono,
            id_barberia=id_barberia,
            activo=True
        ).order_by(
            Cliente.id_cliente
        ).all()
        
        if len(clientes) < 2:
            continue
        
        principal = clientes[0]
        
        for duplicado in clientes[1:]:
            Turno.query.filter_by(id_cliente=duplicado.id_cliente).update(
                {"id_cliente": principal.id_cliente}
            )
            duplicado.activo = False
            total_desactivados += 1
        
        db.session.commit()
        total_consolidados += 1
    
    return {
        "barberias_procesadas": total_consolidados,
        "clientes_desactivados": total_desactivados
    }
