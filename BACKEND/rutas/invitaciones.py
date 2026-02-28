from flask import Blueprint, request, jsonify
from database import db
from modelo.invitacion import Invitacion
from modelo.barbero import Barbero
import uuid
from datetime import datetime, timedelta

invitaciones_bp = Blueprint("invitaciones", __name__, url_prefix="/api/invitaciones")

def generar_codigo():
    return str(uuid.uuid4()).replace("-", "").upper()[:12]

@invitaciones_bp.route("/generar", methods=["POST"])
def generar_invitacion():
    data = request.get_json()
    tipo = data.get("tipo", "crear_barberia")
    
    creador_id = data.get("creador_id")
    
    codigo = generar_codigo()
    while Invitacion.query.filter_by(codigo=codigo).first():
        codigo = generar_codigo()
    
    invitacion = Invitacion(
        codigo=codigo,
        tipo=tipo,
        creador_id=creador_id,
        fecha_expiracion=datetime.utcnow() + timedelta(days=30)
    )
    
    db.session.add(invitacion)
    db.session.commit()
    
    return jsonify({
        "invitacion": invitacion.to_dict(),
        "mensaje": "Código de invitación generado correctamente"
    }), 201

@invitaciones_bp.route("/validar/<codigo>", methods=["GET"])
def validar_invitacion(codigo):
    invitacion = Invitacion.query.filter_by(codigo=codigo).first()
    
    if not invitacion:
        return jsonify({"valido": False, "error": "Código no encontrado"}), 404
    
    if not invitacion.esta_activa():
        return jsonify({"valido": False, "error": "Código expirado o ya usado"}), 400
    
    return jsonify({
        "valido": True,
        "tipo": invitacion.tipo,
        "invitacion": invitacion.to_dict()
    }), 200

@invitaciones_bp.route("/usar", methods=["POST"])
def usar_invitacion():
    data = request.get_json()
    codigo = data.get("codigo")
    email = data.get("email")
    
    invitacion = Invitacion.query.filter_by(codigo=codigo).first()
    
    if not invitacion:
        return jsonify({"valido": False, "error": "Código no encontrado"}), 404
    
    if not invitacion.esta_activa():
        return jsonify({"error": "Código expirado o ya usado"}), 400
    
    if invitacion.tipo == "crear_barberia":
        existente = Barbero.query.filter_by(correo=email, id_barberia=None).first()
        if existente:
            return jsonify({"error": "Este correo ya está registrado"}), 400
    
    invitacion.usada = True
    invitacion.email_usado = email
    db.session.commit()
    
    return jsonify({
        "valido": True,
        "tipo": invitacion.tipo
    }), 200

@invitaciones_bp.route("/", methods=["GET"])
def listar_invitaciones():
    invitaciones = Invitacion.query.order_by(Invitacion.fecha_creacion.desc()).all()
    return jsonify([i.to_dict() for i in invitaciones]), 200
