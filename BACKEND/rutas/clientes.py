from flask import Blueprint, request, jsonify
from controlador import cliente as ctrl

clientes_bp = Blueprint("clientes", __name__, url_prefix="/api/barberias/<int:id_barberia>/clientes")

@clientes_bp.route("/", methods=["GET"])
def listar(id_barberia):
    lista = ctrl.listar_clientes(id_barberia)
    return jsonify([c.to_dict() for c in lista])

@clientes_bp.route("/<int:id_cliente>", methods=["GET"])
def obtener(id_barberia, id_cliente):
    c = ctrl.obtener_cliente(id_cliente)
    if c and c.id_barberia == id_barberia:
        return jsonify(c.to_dict())
    return jsonify({"error": "Cliente no encontrado"}), 404

@clientes_bp.route("/qr/<codigo_qr>", methods=["GET"])
def obtener_por_qr(id_barberia, codigo_qr):
    c = ctrl.obtener_cliente_por_qr(codigo_qr, id_barberia)
    if c:
        return jsonify(c.to_dict())
    return jsonify({"error": "Cliente no encontrado"}), 404

@clientes_bp.route("/telefono", methods=["GET"])
def obtener_por_telefono(id_barberia):
    telefono = request.args.get("telefono")
    if not telefono:
        return jsonify({"error": "Teléfono requerido"}), 400
    c = ctrl.obtener_cliente_por_telefono(telefono, id_barberia)
    if c:
        return jsonify(c.to_dict())
    return jsonify({"error": "Cliente no encontrado"}), 404

@clientes_bp.route("/", methods=["POST"])
def crear(id_barberia):
    data = request.get_json()
    nuevo = ctrl.crear_cliente(
        id_barberia,
        data["nombre"],
        data["telefono"],
        data.get("correo")
    )
    return jsonify(nuevo.to_dict()), 201

@clientes_bp.route("/<int:id_cliente>", methods=["PUT"])
def actualizar(id_barberia, id_cliente):
    data = request.get_json()
    c = ctrl.actualizar_cliente(
        id_cliente,
        data.get("nombre"),
        data.get("telefono"),
        data.get("correo")
    )
    if c and c.id_barberia == id_barberia:
        return jsonify(c.to_dict())
    return jsonify({"error": "Cliente no encontrado"}), 404

@clientes_bp.route("/<int:id_cliente>", methods=["DELETE"])
def eliminar(id_barberia, id_cliente):
    if ctrl.eliminar_cliente(id_cliente):
        return jsonify({"mensaje": "Cliente eliminado"})
    return jsonify({"error": "Cliente no encontrado"}), 404
