from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from controlador import barbero as ctrl

barberos_bp = Blueprint("barberos", __name__, url_prefix="/api/barberias/<int:id_barberia>/barberos")

@barberos_bp.route("/", methods=["GET"])
def listar(id_barberia):
    lista = ctrl.listar_barberos(id_barberia)
    return jsonify([b.to_dict() for b in lista])

@barberos_bp.route("/<int:id_barbero>", methods=["GET"])
def obtener(id_barberia, id_barbero):
    b = ctrl.obtener_barbero(id_barbero)
    if b and b.id_barberia == id_barberia:
        return jsonify(b.to_dict())
    return jsonify({"error": "Barbero no encontrado"}), 404

@barberos_bp.route("/", methods=["POST"])
@jwt_required()
def crear(id_barberia):
    data = request.get_json()
    nuevo = ctrl.crear_barbero(
        id_barberia,
        data["nombre"],
        data["telefono"],
        data["correo"],
        data["contrasena"],
        data.get("foto_url"),
        data.get("comision_porcentaje", 50)
    )
    return jsonify(nuevo.to_dict()), 201

@barberos_bp.route("/<int:id_barbero>", methods=["PUT"])
@jwt_required()
def actualizar(id_barberia, id_barbero):
    data = request.get_json()
    b = ctrl.actualizar_barbero(
        id_barbero,
        data.get("nombre"),
        data.get("telefono"),
        data.get("correo"),
        data.get("foto_url"),
        data.get("comision_porcentaje")
    )
    if b and b.id_barberia == id_barberia:
        return jsonify(b.to_dict())
    return jsonify({"error": "Barbero no encontrado"}), 404

@barberos_bp.route("/<int:id_barbero>", methods=["DELETE"])
@jwt_required()
def eliminar(id_barberia, id_barbero):
    if ctrl.eliminar_barbero(id_barbero):
        return jsonify({"mensaje": "Barbero eliminado"})
    return jsonify({"error": "Barbero no encontrado"}), 404
