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
    usar_horario_dia = request.args.get("usar_horario_dia", "false").lower() == "true"
    
    if usar_horario_dia and fecha and id_barbero:
        lista = ctrl.listar_turnos_por_horario_dia(id_barberia, id_barbero, fecha, estado)
    else:
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
    forzar_cita = request.args.get("forzar_cita", "false").lower() == "true"
    resultado = ctrl.pasar_siguiente(id_barberia, id_barbero, forzar_cita)
    if resultado:
        return jsonify(resultado)
    return jsonify({"mensaje": "No hay mas clientes en cola"})

@turnos_bp.route("/cola/<int:id_barbero>/forzar", methods=["PUT"])
@jwt_required()
def forzar_siguiente(id_barberia, id_barbero):
    resultado = ctrl.pasar_siguiente(id_barberia, id_barbero, forzar_cita=True)
    if resultado:
        return jsonify(resultado)
    return jsonify({"mensaje": "No hay mas clientes en cola"})

@turnos_bp.route("/cola/<int:id_barbero>/diaria", methods=["GET"])
@jwt_required()
def cola_diaria(id_barberia, id_barbero):
    lista = ctrl.obtener_cola_diaria(id_barberia, id_barbero)
    return jsonify(lista)

@turnos_bp.route("/cola/reordenar", methods=["PUT"])
@jwt_required()
def reordenar_turno(id_barberia):
    data = request.get_json()
    resultado, error = ctrl.reordenar_turno(
        data["id_turno"],
        data.get("nueva_posicion", 1)
    )
    if error:
        return jsonify({"error": error}), 400
    return jsonify(resultado)

@turnos_bp.route("/<int:id_turno>/llegada", methods=["PUT"])
@jwt_required()
def marcar_llegada(id_barberia, id_turno):
    resultado = ctrl.marcar_llegada_cita(id_turno)
    if resultado:
        return jsonify({"mensaje": "Llegada marcada"})
    return jsonify({"error": "No se pudo marcar la llegada"}), 400

@turnos_bp.route("/<int:id_turno>/cancelar", methods=["PUT"])
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

@turnos_bp.route("/cita", methods=["POST"])
def crear_turno_cita(id_barberia):
    data = request.get_json()
    
    resultado, error = ctrl.crear_turno_cita(
        id_barberia,
        data["id_barbero"],
        data["id_servicio"],
        data["cita_fecha_hora"],
        data["nombre_cliente"],
        data["telefono"],
        data.get("notas")
    )
    
    if error:
        return jsonify({"error": error}), 400
    
    return jsonify({
        "turno": resultado["turno"].to_dict(),
        "cita_fecha_hora": resultado["cita_fecha_hora"]
    }), 201

@turnos_bp.route("/citas", methods=["GET"])
@jwt_required()
def listar_turnos_cita(id_barberia):
    fecha = request.args.get("fecha")
    id_barbero = request.args.get("id_barbero", type=int)
    lista = ctrl.listar_turnos_cita(id_barberia, id_barbero, fecha)
    return jsonify([t.to_dict() for t in lista])

@turnos_bp.route("/disponibilidad/<int:id_barbero>", methods=["GET"])
def obtener_disponibilidad(id_barberia, id_barbero):
    import logging
    logger = logging.getLogger(__name__)
    
    fecha = request.args.get("fecha")
    duracion = request.args.get("duracion", type=int, default=25)
    
    logger.info(f"Ruta disponibilidad - id_barberia: {id_barberia}, id_barbero: {id_barbero}, fecha: {fecha}, duracion: {duracion}")
    
    if not fecha:
        return jsonify({"error": "Fecha requerida"}), 400
    
    try:
        horarios = ctrl.obtener_horarios_disponibles(id_barberia, id_barbero, fecha, duracion)
        logger.info(f"Horarios devueltos: {horarios}")
        return jsonify({"fecha": fecha, "horarios_disponibles": horarios})
    except Exception as e:
        logger.error(f"Error en disponibilidad: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@turnos_bp.route("/bloqueos", methods=["GET"])
@jwt_required()
def listar_bloqueos(id_barberia):
    id_barbero = request.args.get("id_barbero", type=int)
    lista = ctrl.listar_bloqueos(id_barberia, id_barbero)
    return jsonify([b.to_dict() for b in lista])

@turnos_bp.route("/bloqueos", methods=["POST"])
@jwt_required()
def crear_bloqueo(id_barberia):
    data = request.get_json()
    
    resultado, error = ctrl.crear_bloqueo(
        id_barberia,
        data["id_barbero"],
        data["fecha_inicio"],
        data["fecha_fin"],
        data.get("motivo")
    )
    
    if error:
        return jsonify({"error": error}), 400
    
    return jsonify(resultado.to_dict()), 201

@turnos_bp.route("/bloqueos/<int:id_bloqueo>", methods=["DELETE"])
@jwt_required()
def eliminar_bloqueo(id_barberia, id_bloqueo):
    resultado = ctrl.eliminar_bloqueo(id_bloqueo)
    if resultado:
        return jsonify({"mensaje": "Bloqueo eliminado"})
    return jsonify({"error": "Bloqueo no encontrado"}), 404

@turnos_bp.route("/<int:id_turno>/agregar-a-cola", methods=["PUT"])
@jwt_required()
def agregar_cita_a_cola(id_barberia, id_turno):
    resultado, error = ctrl.agregar_cita_a_cola(id_turno)
    if error:
        return jsonify({"error": error}), 400
    return jsonify({"mensaje": "Cita agregada a cola", "turno": resultado["turno"].to_dict()})
