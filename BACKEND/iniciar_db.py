from app import create_app
from database import db
from modelo.barberia import Barberia
from modelo.barbero import Barbero
from modelo.servicio import Servicio
from modelo.cliente import Cliente
from modelo.turno import Turno
from modelo.contabilidad import Contabilidad
from modelo.horario import Horario
from modelo.horario_dia import HorarioDia
from werkzeug.security import generate_password_hash

app = create_app()

with app.app_context():
    db.create_all()
    print("[OK] Base de datos creada correctamente")
    
    if not Barberia.query.first():
        print("[OK] Insertando datos de ejemplo...")
        
        b1 = Barberia(nombre="Barbería Central", direccion="Calle 123", telefono="1234567890", correo="central@barberia.com")
        b2 = Barberia(nombre="Barbería Norte", direccion="Avenida 456", telefono="0987654321", correo="norte@barberia.com")
        
        db.session.add_all([b1, b2])
        db.session.commit()
        
        barbero1 = Barbero(id_barberia=b1.id_barberia, nombre="Juan Pérez", telefono="1111111111", correo="juan@barberia.com", contrasena=generate_password_hash("password123"))
        barbero2 = Barbero(id_barberia=b1.id_barberia, nombre="Carlos López", telefono="2222222222", correo="carlos@barberia.com", contrasena=generate_password_hash("password123"))
        barbero3 = Barbero(id_barberia=b2.id_barberia, nombre="Pedro Gómez", telefono="3333333333", correo="pedro@barberia.com", contrasena=generate_password_hash("password123"))
        
        db.session.add_all([barbero1, barbero2, barbero3])
        db.session.commit()
        
        servicio1 = Servicio(id_barberia=b1.id_barberia, nombre="Corte de cabello", descripcion="Corte clásico", precio=15000, duracion_minutos=30)
        servicio2 = Servicio(id_barberia=b1.id_barberia, nombre="Barba", descripcion="Arreglo de barba", precio=10000, duracion_minutos=20)
        servicio3 = Servicio(id_barberia=b1.id_barberia, nombre="Corte + Barba", descripcion="Paquete completo", precio=22000, duracion_minutos=45)
        servicio4 = Servicio(id_barberia=b2.id_barberia, nombre="Corte moderno", descripcion="Corte a la moda", precio=18000, duracion_minutos=35)
        
        db.session.add_all([servicio1, servicio2, servicio3, servicio4])
        db.session.commit()
        
        print("[OK] Datos de ejemplo insertados")
        print(f"  - Barberias: {Barberia.query.count()}")
        print(f"  - Barberos: {Barbero.query.count()}")
        print(f"  - Servicios: {Servicio.query.count()}")
    
    print("\nEstructura de URLs (Multi-Tenant):")
    print("  GET    /api/barberias                    - Listar barberías")
    print("  GET    /api/barberias/<id>               - Ver barbería")
    print("  GET    /api/barberias/qr/<codigo>        - Buscar por QR")
    print("  GET    /api/barberias/<id>/barberos      - Barberos de barbería")
    print("  GET    /api/barberias/<id>/servicios     - Servicios de barbería")
    print("  GET    /api/barberias/<id>/clientes      - Clientes de barbería")
    print("  GET    /api/barberias/<id>/turnos        - Turnos de barbería")
    print("  GET    /api/barberias/<id>/contabilidad - Contabilidad de barbería")
    print("  GET    /api/barberias/<id>/contabilidad/resumen - Resumen total")
