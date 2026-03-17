from database import db
from app import app
from modelo.barbero import Barbero
from werkzeug.security import generate_password_hash

with app.app_context():
    # Buscar usuario con id 5
    usuario = db.session.get(Barbero, 5)
    if usuario:
        print(f"Usuario encontrado: {usuario.nombre}")
        print(f"Rol actual: {usuario.rol}")
        
        # Cambiar contraseña con hash
        nueva_contrasena = "admin123"
        usuario.contrasena = generate_password_hash(nueva_contrasena)
        
        db.session.commit()
        print(f"Contraseña cambiada a: {nueva_contrasena}")
    else:
        print("Usuario con id 5 no encontrado")
        
    # Listar todos los usuarios
    print("\nTodos los usuarios:")
    usuarios = Barbero.query.all()
    for u in usuarios:
        print(f"  ID: {u.id_barbero}, Nombre: {u.nombre}, Correo: {u.correo}, Rol: {u.rol}")
