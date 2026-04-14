from app import create_app
from database import db
from modelo.cliente import Cliente
from modelo.turno import Turno

app = create_app()

def normalizar_telefono(tel):
    if not tel:
        return None
    nums = ''.join(c for c in tel if c.isdigit())
    # Dejar siempre los últimos 10 dígitos para formato local
    return nums[-10:] if len(nums) >= 10 else nums

with app.app_context():
    print("=== NORMALIZANDO TELÉFONOS ===")
    clientes = Cliente.query.filter_by(activo=True).all()
    for c in clientes:
        c.telefono = normalizar_telefono(c.telefono)
    db.session.commit()
    print(f"Normalizados {len(clientes)} teléfonos")

    print("\n=== CONSOLIDANDO DUPLICADOS ===")
    from sqlalchemy import func

    duplicados = db.session.query(
        Cliente.telefono,
        Cliente.id_barberia
    ).filter(
        Cliente.activo == True
    ).group_by(
        Cliente.telefono, Cliente.id_barberia
    ).having(
        func.count(Cliente.id_cliente) > 1
    ).all()

    total_desactivados = 0
    for telefono, id_barberia in duplicados:
        clientes_grupo = Cliente.query.filter_by(
            telefono=telefono,
            id_barberia=id_barberia,
            activo=True
        ).all()
        if len(clientes_grupo) < 2:
            continue

        # Elegimos cliente principal: con más turnos, si empatan el de menor id_cliente
        principal = max(
            clientes_grupo,
            key=lambda c: (Turno.query.filter_by(id_cliente=c.id_cliente).count(), -c.id_cliente)
        )

        print(f"Consolidando {len(clientes_grupo)} clientes con teléfono {telefono} en barbería {id_barberia} -> principal {principal.id_cliente}")

        for dup in clientes_grupo:
            if dup.id_cliente == principal.id_cliente:
                continue
            # Reasignar turnos al principal
            Turno.query.filter_by(id_cliente=dup.id_cliente).update({"id_cliente": principal.id_cliente})
            # Desactivar duplicado
            dup.activo = False
            total_desactivados += 1

        db.session.commit()

    print(f"\nClientes desactivados: {total_desactivados}")

    # Verificación final
    duplicados_final = db.session.query(
        Cliente.telefono,
        Cliente.id_barberia
    ).filter(
        Cliente.activo == True
    ).group_by(
        Cliente.telefono, Cliente.id_barberia
    ).having(func.count(Cliente.id_cliente) > 1).count()

    print(f"Duplicados restantes: {duplicados_final}")
    print("✓ Limpieza completada!")