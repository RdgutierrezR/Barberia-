from flask import Blueprint, request, jsonify
from controlador import contabilidad as ctrl

contabilidad_bp = Blueprint("contabilidad", __name__, url_prefix="/api/barberias/<int:id_barberia>/contabilidad")

@contabilidad_bp.route("/", methods=["GET"])
def listar(id_barberia):
    id_barbero = request.args.get("id_barbero", type=int)
    fecha_inicio = request.args.get("fecha_inicio")
    fecha_fin = request.args.get("fecha_fin")
    lista = ctrl.listar_contabilidad(id_barberia, id_barbero, fecha_inicio, fecha_fin)
    return jsonify([c.to_dict() for c in lista])

@contabilidad_bp.route("/barbero/<int:id_barbero>", methods=["GET"])
def obtener_por_barbero(id_barberia, id_barbero):
    fecha_inicio = request.args.get("fecha_inicio")
    fecha_fin = request.args.get("fecha_fin")
    lista = ctrl.obtener_contabilidad_barbero(id_barberia, id_barbero, fecha_inicio, fecha_fin)
    return jsonify([c.to_dict() for c in lista])

@contabilidad_bp.route("/barbero/<int:id_barbero>/resumen", methods=["GET"])
def resumen_barbero(id_barberia, id_barbero):
    periodo = request.args.get("periodo", "mensual")
    fecha_inicio = request.args.get("fecha_inicio")
    fecha_fin = request.args.get("fecha_fin")
    resumen = ctrl.obtener_resumen_barbero(id_barberia, id_barbero, periodo, fecha_inicio, fecha_fin)
    return jsonify(resumen)

@contabilidad_bp.route("/resumen", methods=["GET"])
def resumen_barberia(id_barberia):
    periodo = request.args.get("periodo", "mensual")
    resumen = ctrl.obtener_resumen_barberia(id_barberia, periodo)
    return jsonify(resumen)

@contabilidad_bp.route("/metricas/barbero/<int:id_barbero>", methods=["GET"])
def metricas_barbero(id_barberia, id_barbero):
    fecha_inicio = request.args.get("fecha_inicio")
    fecha_fin = request.args.get("fecha_fin")
    metricas = ctrl.obtener_metricas_barbero(id_barberia, id_barbero, fecha_inicio, fecha_fin)
    return jsonify(metricas)

@contabilidad_bp.route("/metricas/servicios", methods=["GET"])
def metricas_servicios(id_barberia):
    id_servicio = request.args.get("id_servicio", type=int)
    metricas = ctrl.obtener_metricas_servicio(id_barberia, id_servicio)
    return jsonify(metricas)

@contabilidad_bp.route("/metricas/barberia", methods=["GET"])
def metricas_barberia(id_barberia):
    fecha_inicio = request.args.get("fecha_inicio")
    fecha_fin = request.args.get("fecha_fin")
    metricas = ctrl.obtener_metricas_barberia(id_barberia, fecha_inicio, fecha_fin)
    return jsonify(metricas)

@contabilidad_bp.route("/metricas/operacionales/<int:id_barbero>", methods=["GET"])
def metricas_operacionales(id_barberia, id_barbero):
    fecha_inicio = request.args.get("fecha_inicio")
    fecha_fin = request.args.get("fecha_fin")
    metricas = ctrl.obtener_metricas_operacionales(id_barberia, id_barbero, fecha_inicio, fecha_fin)
    return jsonify(metricas)
