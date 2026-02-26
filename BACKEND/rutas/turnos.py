from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from controlador import turno as ctrl

turnos_bp = Blueprint("turnos", __name__, url_prefix="/api/barberias/<int:id_barberia>/turnos")

@turnos_bp.route("/", methods=["GET"])
@jwt_required()
def listar(id_barberia):
    fecha = request.args.get("fecha")
    id_barbero = request.args.get("id_barbero", type=int)
    estado = request.args.get("estado")
    lista = ctrl.listar_turnos(id_barberia, fecha, id_barbero, estado)
    return jsonify([t.to_dict() for t in lista])

@turnos_bp.route("/<int:id_turno>", methods=["GET"])
@jwt_required()
def obtener(id_barberia, id_turno):
    t = ctrl.obtener_turno(id_turno)
    if t and t.id_barberia == id_barberia:
        return jsonify(t.to_dict())
    return jsonify({"error": "Turno no encontrado"}), 404

@turnos_bp.route("/codigo/<codigo>", methods=["GET"])
def obtener_por_codigo(id_barberia, codigo):
    t = ctrl.obtener_turno_por_codigo(codigo, id_barberia)
    if t:
        result = t.to_dict()
        posicion = ctrl.obtener_posicion_turno(t.id_barbero, t.id_turno)
        result["posicion"] = posicion["posicion"]
        result["turnos_adelante"] = posicion["turnos_adelante"]
        return jsonify(result)
    return jsonify({"error": "Turno no encontrado"}), 404

@turnos_bp.route("/cola/<int:id_barbero>", methods=["GET"])
@jwt_required()
def cola_barbero(id_barberia, id_barbero):
    lista = ctrl.obtener_cola_barbero(id_barberia, id_barbero)
    return jsonify([t.to_dict() for t in lista])

@turnos_bp.route("/cola/<int:id_barbero>/siguiente", methods=["PUT"])
@jwt_required()
def pasar_siguiente(id_barberia, id_barbero):
    resultado = ctrl.pasar_siguiente(id_barberia, id_barbero)
    if resultado:
        return jsonify(resultado.to_dict())
    return jsonify({"mensaje": "No hay mas clientes en cola"})

@turnos_bp.route("/<int:id_turno>/cancelar", methods=["PUT"])
@jwt_required()
def cancelar_turno(id_barberia, id_turno):
    t = ctrl.cancelar_turno(id_turno)
    if t:
        return jsonify({"mensaje": "Turno cancelado", "turno": t.to_dict()})
    return jsonify({"error": "Turno no encontrado"}), 404

@turnos_bp.route("/cola", methods=["POST"])
def crear_turno_cola(id_barberia):
    data = request.get_json()
    
    resultado, error = ctrl.crear_turno_cola(
        id_barberia,
        data["id_barbero"],
        data["id_servicio"],
        data["nombre_cliente"],
        data["telefono"],
        data.get("notas")
    )
    
    if error:
        return jsonify({"error": error}), 400
    
    return jsonify({
        "turno": resultado["turno"].to_dict(),
        "posicion": resultado["posicion"]
    }), 201
