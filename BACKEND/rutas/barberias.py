from flask import Blueprint, request, jsonify
from controlador import barberia as ctrl

barberias_bp = Blueprint("barberias", __name__, url_prefix="/api/barberias")

@barberias_bp.route("/", methods=["GET"])
def listar():
    lista = ctrl.listar_barberias()
    return jsonify([b.to_dict() for b in lista])

@barberias_bp.route("/<int:id_barberia>", methods=["GET"])
def obtener(id_barberia):
    b = ctrl.obtener_barberia(id_barberia)
    if b:
        return jsonify(b.to_dict())
    return jsonify({"error": "Barbería no encontrada"}), 404

@barberias_bp.route("/qr/<codigo_qr>", methods=["GET"])
def obtener_por_qr(codigo_qr):
    b = ctrl.obtener_barberia_por_codigo(codigo_qr)
    if b:
        return jsonify(b.to_dict())
    return jsonify({"error": "Barbería no encontrada"}), 404

@barberias_bp.route("/", methods=["POST"])
def crear():
    data = request.get_json()
    nuevo = ctrl.crear_barberia(
        data["nombre"],
        data.get("direccion"),
        data.get("telefono"),
        data.get("correo"),
        data.get("logo_url")
    )
    return jsonify(nuevo.to_dict()), 201

@barberias_bp.route("/<int:id_barberia>", methods=["PUT"])
def actualizar(id_barberia):
    data = request.get_json()
    b = ctrl.actualizar_barberia(
        id_barberia,
        data.get("nombre"),
        data.get("direccion"),
        data.get("telefono"),
        data.get("correo"),
        data.get("logo_url")
    )
    if b:
        return jsonify(b.to_dict())
    return jsonify({"error": "Barbería no encontrada"}), 404

@barberias_bp.route("/<int:id_barberia>", methods=["DELETE"])
def eliminar(id_barberia):
    if ctrl.eliminar_barberia(id_barberia):
        return jsonify({"mensaje": "Barbería eliminada"})
    return jsonify({"error": "Barbería no encontrada"}), 404
