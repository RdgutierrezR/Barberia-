from flask import Blueprint, request, jsonify
from controlador import servicio as ctrl

servicios_bp = Blueprint("servicios", __name__, url_prefix="/api/barberias/<int:id_barberia>/servicios")

@servicios_bp.route("/", methods=["GET"])
def listar(id_barberia):
    lista = ctrl.listar_servicios(id_barberia)
    return jsonify([s.to_dict() for s in lista])

@servicios_bp.route("/<int:id_servicio>", methods=["GET"])
def obtener(id_barberia, id_servicio):
    s = ctrl.obtener_servicio(id_servicio)
    if s and s.id_barberia == id_barberia:
        return jsonify(s.to_dict())
    return jsonify({"error": "Servicio no encontrado"}), 404

@servicios_bp.route("/", methods=["POST"])
def crear(id_barberia):
    data = request.get_json()
    nuevo = ctrl.crear_servicio(
        id_barberia,
        data["nombre"],
        data.get("descripcion"),
        data["precio"],
        data["duracion_minutos"]
    )
    return jsonify(nuevo.to_dict()), 201

@servicios_bp.route("/<int:id_servicio>", methods=["PUT"])
def actualizar(id_barberia, id_servicio):
    data = request.get_json()
    s = ctrl.actualizar_servicio(
        id_servicio,
        data.get("nombre"),
        data.get("descripcion"),
        data.get("precio"),
        data.get("duracion_minutos")
    )
    if s and s.id_barberia == id_barberia:
        return jsonify(s.to_dict())
    return jsonify({"error": "Servicio no encontrado"}), 404

@servicios_bp.route("/<int:id_servicio>", methods=["DELETE"])
def eliminar(id_barberia, id_servicio):
    if ctrl.eliminar_servicio(id_servicio):
        return jsonify({"mensaje": "Servicio eliminado"})
    return jsonify({"error": "Servicio no encontrado"}), 404
