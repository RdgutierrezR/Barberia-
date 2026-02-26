from flask import Blueprint, request, jsonify
from controlador import horario as ctrl
from datetime import time

horarios_bp = Blueprint("horarios", __name__, url_prefix="/api/barberias/<int:id_barberia>/horarios")

@horarios_bp.route("/", methods=["GET"])
def listar(id_barberia):
    id_barbero = request.args.get("id_barbero", type=int)
    lista = ctrl.listar_horarios(id_barberia, id_barbero)
    return jsonify([h.to_dict() for h in lista])

@horarios_bp.route("/<int:id_horario>", methods=["GET"])
def obtener(id_barberia, id_horario):
    h = ctrl.obtener_horario(id_horario)
    if h and h.id_barberia == id_barberia:
        return jsonify(h.to_dict())
    return jsonify({"error": "Horario no encontrado"}), 404

@horarios_bp.route("/", methods=["POST"])
def crear(id_barberia):
    data = request.get_json()
    nuevo = ctrl.crear_horario(
        id_barberia,
        data["id_barbero"],
        data["dia_semana"],
        time.fromisoformat(data["hora_inicio"]),
        time.fromisoformat(data["hora_fin"])
    )
    return jsonify(nuevo.to_dict()), 201

@horarios_bp.route("/<int:id_horario>", methods=["DELETE"])
def eliminar(id_barberia, id_horario):
    if ctrl.eliminar_horario(id_horario):
        return jsonify({"mensaje": "Horario eliminado"})
    return jsonify({"error": "Horario no encontrado"}), 404
