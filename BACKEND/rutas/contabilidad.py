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
