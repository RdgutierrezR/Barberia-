from flask import Blueprint, request, jsonify
from controlador import horario_dia as ctrl
from datetime import date, time

horario_dia_bp = Blueprint("horario_dia", __name__, url_prefix="/api/barberias/<int:id_barberia>/horario-dia")

@horario_dia_bp.route("/", methods=["GET"])
def listar(id_barberia):
    id_barbero = request.args.get("id_barbero", type=int)
    fecha_str = request.args.get("fecha")
    fecha_inicio = request.args.get("fecha_inicio")
    fecha_fin = request.args.get("fecha_fin")
    
    fecha = None
    if fecha_str:
        fecha = date.fromisoformat(fecha_str)
    
    fecha_inicio_date = date.fromisoformat(fecha_inicio) if fecha_inicio else None
    fecha_fin_date = date.fromisoformat(fecha_fin) if fecha_fin else None
    
    if fecha:
        h = ctrl.obtener_horario_dia(id_barberia, id_barbero, fecha)
        if h:
            return jsonify(h.to_dict())
        return jsonify({"mensaje": "No hay horario definido para esta fecha"})
    
    lista = ctrl.listar_horarios_dia(id_barberia, id_barbero, fecha_inicio_date, fecha_fin_date)
    return jsonify([h.to_dict() for h in lista])

@horario_dia_bp.route("/hoy", methods=["GET"])
def obtener_hoy(id_barberia):
    id_barbero = request.args.get("id_barbero", type=int)
    if not id_barbero:
        return jsonify({"error": "Se requiere id_barbero"}), 400
    
    horario = ctrl.obtener_o_crear_horario_hoy(id_barberia, id_barbero)
    if horario:
        return jsonify(horario.to_dict())
    
    horarios = ctrl.obtener_horario_trabajo(id_barberia, id_barbero)
    return jsonify({
        "id_barberia": id_barberia,
        "id_barbero": id_barbero,
        "fecha": date.today().isoformat(),
        "hora_inicio": horarios["hora_inicio"].isoformat() if isinstance(horarios["hora_inicio"], time) else str(horarios["hora_inicio"]),
        "hora_fin": horarios["hora_fin"].isoformat() if isinstance(horarios["hora_fin"], time) else str(horarios["hora_fin"]),
        "fuente": horarios["fuente"],
        "es_hoy": True
    })

@horario_dia_bp.route("/", methods=["POST"])
def crear(id_barberia):
    data = request.get_json()
    fecha = date.fromisoformat(data["fecha"])
    
    nuevo = ctrl.crear_horario_dia(
        id_barberia,
        data["id_barbero"],
        fecha,
        time.fromisoformat(data["hora_inicio"]),
        time.fromisoformat(data["hora_fin"])
    )
    return jsonify(nuevo.to_dict()), 201

@horario_dia_bp.route("/<int:id_horario_dia>", methods=["PUT"])
def actualizar(id_barberia, id_horario_dia):
    data = request.get_json()
    hora_inicio = time.fromisoformat(data["hora_inicio"]) if "hora_inicio" in data else None
    hora_fin = time.fromisoformat(data["hora_fin"]) if "hora_fin" in data else None
    
    horario = ctrl.actualizar_horario_dia(id_horario_dia, hora_inicio, hora_fin)
    if horario:
        return jsonify(horario.to_dict())
    return jsonify({"error": "Horario no encontrado"}), 404

@horario_dia_bp.route("/<int:id_horario_dia>", methods=["DELETE"])
def eliminar(id_barberia, id_horario_dia):
    if ctrl.eliminar_horario_dia(id_horario_dia):
        return jsonify({"mensaje": "Horario eliminado"})
    return jsonify({"error": "Horario no encontrado"}), 404

@horario_dia_bp.route("/trabajo", methods=["GET"])
def obtener_horario_trabajo(id_barberia):
    id_barbero = request.args.get("id_barbero", type=int)
    fecha_str = request.args.get("fecha")
    
    if not id_barbero:
        return jsonify({"error": "Se requiere id_barbero"}), 400
    
    fecha = date.fromisoformat(fecha_str) if fecha_str else date.today()
    
    horarios = ctrl.obtener_horario_trabajo(id_barberia, id_barbero, fecha)
    return jsonify({
        "hora_inicio": horarios["hora_inicio"].isoformat() if isinstance(horarios["hora_inicio"], time) else str(horarios["hora_inicio"]),
        "hora_fin": horarios["hora_fin"].isoformat() if isinstance(horarios["hora_fin"], time) else str(horarios["hora_fin"]),
        "fuente": horarios["fuente"]
    })
