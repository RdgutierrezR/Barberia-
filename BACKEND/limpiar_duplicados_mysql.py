from app import create_app
from database import db
from modelo.cliente import Cliente
from modelo.turno import Turno
from modelo.contabilidad import Contabilidad
from sqlalchemy import func, text

app = create_app()

with app.app_context():
    print("=== LIMPIEZA EN MYSQL ===")
    print()
    
    print("1. Verificando duplicados actuales...")
    duplicados = db.session.query(
        Cliente.telefono,
        Cliente.id_barberia,
        func.count(Cliente.id_cliente).label('total')
    ).filter(
        Cliente.activo == True
    ).group_by(
        Cliente.telefono,
        Cliente.id_barberia
    ).having(
        func.count(Cliente.id_cliente) > 1
    ).all()
    
    print(f"   Grupos duplicados: {len(duplicados)}")
    for tel, barberia, total in duplicados:
        print(f"   - Barberia {barberia}, telefono {tel}: {total} registros")
        clientes = Cliente.query.filter_by(telefono=tel, id_barberia=barberia, activo=True).all()
        for c in clientes:
            print(f"      ID {c.id_cliente}: {c.nombre}")
    
    print("\n2. Normalizando telefonos...")
    clientes = Cliente.query.filter_by(activo=True).all()
    normalizados = 0
    for c in clientes:
        if c.telefono:
            numeros = ''.join(car for car in c.telefono if car.isdigit())
            if numeros.startswith('57') and len(numeros) > 10:
                numeros = numeros[2:]
            if numeros.startswith('0'):
                numeros = numeros[1:]
            if numeros != c.telefono:
                c.telefono = numeros
                normalizados += 1
    db.session.commit()
    print(f"   Telefonos normalizados: {normalizados}")
    
    print("\n3. Consolidando duplicados...")
    duplicados = db.session.query(
        Cliente.telefono,
        Cliente.id_barberia
    ).filter(
        Cliente.activo == True
    ).group_by(
        Cliente.telefono,
        Cliente.id_barberia
    ).having(
        func.count(Cliente.id_cliente) > 1
    ).all()
    
    total_consolidados = 0
    total_desactivados = 0
    
    for telefono, id_barberia in duplicados:
        clientes = Cliente.query.filter_by(
            telefono=telefono,
            id_barberia=id_barberia,
            activo=True
        ).order_by(Cliente.id_cliente).all()
        
        if len(clientes) < 2:
            continue
        
        principal = clientes[0]
        
        for duplicado in clientes[1:]:
            turnos_count = Turno.query.filter_by(id_cliente=duplicado.id_cliente).count()
            Turno.query.filter_by(id_cliente=duplicado.id_cliente).update(
                {"id_cliente": principal.id_cliente}
            )
            duplicado.activo = False
            total_desactivados += 1
        
        db.session.commit()
        total_consolidados += 1
    
    print(f"   Barberias procesadas: {total_consolidados}")
    print(f"   Clientes desactivados: {total_desactivados}")
    
    print("\n4. Verificando duplicados restantes...")
    duplicados_f = db.session.query(
        Cliente.telefono,
        Cliente.id_barberia
    ).filter(
        Cliente.activo == True
    ).group_by(
        Cliente.telefono,
        Cliente.id_barberia
    ).having(
        func.count(Cliente.id_cliente) > 1
    ).count()
    print(f"   Duplicados restantes: {duplicados_f}")
    
    print("\n5. Agregando constraint UNIQUE...")
    try:
        db.session.execute(text(
            "ALTER TABLE clientes ADD CONSTRAINT uq_telefono_barberia UNIQUE (telefono, id_barberia)"
        ))
        db.session.commit()
        print("   Constraint agregado correctamente!")
    except Exception as e:
        print(f"   Error: {e}")
        db.session.rollback()
    
    print("\n=== COMPLETADO ===")