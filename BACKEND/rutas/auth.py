from flask import Blueprint, request, jsonify
from controlador import auth as ctrl
from controlador import invitacion as ctrl_inv
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@auth_bp.route("/barbero/login", methods=["POST"])
def login_barbero():
    data = request.get_json()
    correo = data.get("correo")
    contrasena = data.get("contrasena")
    id_barberia = data.get("id_barberia")
    
    barbero, error = ctrl.login_barbero(correo, contrasena, id_barberia)
    
    if error:
        return jsonify({"error": error}), 401
    
    token = create_access_token(
        identity=str(barbero.id_barbero),
        additional_claims={"id_barberia": barbero.id_barberia, "nombre": barbero.nombre, "rol": barbero.rol}
    )
    
    return jsonify({
        "token": token,
        "barbero": barbero.to_dict()
    }), 200

@auth_bp.route("/barbero/registro", methods=["POST"])
def registro_barbero():
    data = request.get_json()
    
    nuevo, error = ctrl.registrar_barbero(
        id_barberia=data["id_barberia"],
        nombre=data["nombre"],
        telefono=data["telefono"],
        correo=data["correo"],
        contrasena=data["contrasena"],
        foto_url=data.get("foto_url"),
        comision_porcentaje=data.get("comision_porcentaje", 50)
    )
    
    if error:
        return jsonify({"error": error}), 400
    
    token = create_access_token(
        identity=str(nuevo.id_barbero),
        additional_claims={"id_barberia": nuevo.id_barberia, "nombre": nuevo.nombre, "rol": nuevo.rol}
    )
    
    return jsonify({
        "token": token,
        "barbero": nuevo.to_dict()
    }), 201

@auth_bp.route("/barberia/registro", methods=["POST"])
def registro_barberia():
    data = request.get_json()
    
    codigo_inv = data.get("codigo_invitacion")
    nombre_barberia = data.get("nombre_barberia")
    nombre_barbero = data.get("nombre_barbero")
    telefono = data.get("telefono")
    correo = data.get("correo")
    contrasena = data.get("contrasena")
    direccion = data.get("direccion")
    telefono_barberia = data.get("telefono_barberia")
    
    if not all([codigo_inv, nombre_barberia, nombre_barbero, telefono, correo, contrasena]):
        return jsonify({"error": "Todos los campos son obligatorios"}), 400
    
    barberia, barbero, error = ctrl_inv.registrar_barberia_con_invitacion(
        codigo_inv,
        nombre_barberia,
        nombre_barbero,
        telefono,
        correo,
        contrasena,
        direccion,
        telefono_barberia
    )
    
    if error:
        return jsonify({"error": error}), 400
    
    token = create_access_token(
        identity=str(barbero.id_barbero),
        additional_claims={"id_barberia": barbero.id_barberia, "nombre": barbero.nombre, "rol": barbero.rol}
    )
    
    return jsonify({
        "token": token,
        "barbero": barbero.to_dict(),
        "barberia": barberia.to_dict()
    }), 201

@auth_bp.route("/barbero/verificar", methods=["GET"])
def verificar_token():
    from flask_jwt_extended import get_jwt_identity, jwt_required
    from modelo.barbero import Barbero
    
    @jwt_required()
    def verificar():
        id_barbero = get_jwt_identity()
        barbero = Barbero.query.get(id_barbero)
        if barbero and barbero.activo:
            return jsonify({"valido": True, "barbero": barbero.to_dict()})
        return jsonify({"valido": False}), 401
    
    return verificar()

@auth_bp.route("/barberias", methods=["GET"])
def listar_barberias():
    from modelo.barberia import Barberia
    barberias = Barberia.query.filter_by(activa=True).all()
    return jsonify([b.to_dict() for b in barberias])
