from flask import Blueprint, request, jsonify
from modelo.push_subscription import PushSubscription
from database import db
import json
import logging
from flask_jwt_extended import jwt_required, get_jwt_identity
from dotenv import load_dotenv
import os
from controlador.notificacion_push import get_vapid_public_key_base64url, enviar_notificacion_push

load_dotenv()

push_bp = Blueprint("push", __name__, url_prefix="/api/push")

@push_bp.route("/public-key", methods=["GET"])
def get_public_key():
    logging.info("[PUSH] ===== SOLICITUD /public-key =====")
    try:
        public_key = get_vapid_public_key_base64url()
        return jsonify({"publicKey": public_key})
    except Exception as e:
        logging.error(f"[PUSH] ERROR: {e}")
        return jsonify({"error": "Error generando clave VAPID"}), 500

@push_bp.route("/subscribe", methods=["POST"])
@jwt_required()
def subscribe():
    logging.info("[PUSH] ===== SOLICITUD /subscribe =====")
    identidad = get_jwt_identity()
    
    id_barberia = None
    id_barbero = None
    
    if isinstance(identidad, dict):
        id_barberia = identidad.get("id_barberia")
        id_barbero = identidad.get("id_barbero")
    else:
        from modelo.barbero import Barbero
        try:
            # Intentar como ID numérico
            id_barbero = int(identidad)
            barbero = Barbero.query.get(id_barbero)
            if barbero:
                id_barberia = barbero.id_barberia
            else:
                return jsonify({"error": f"Barbero no encontrado con ID: {id_barbero}"}), 404
        except (ValueError, TypeError):
            # Intentar como correo
            barbero = Barbero.query.filter_by(correo=identidad).first()
            if barbero:
                id_barberia = barbero.id_barberia
                id_barbero = barbero.id_barbero
            else:
                return jsonify({"error": f"Barbero no encontrado: {identidad}"}), 404
    
    if not id_barberia or not id_barbero:
        return jsonify({"error": "No se pudo identificar barbería/barbero"}), 400
    
    logging.info(f"[PUSH] Barbería: {id_barberia}, Barbero: {id_barbero}")
    
    data = request.get_json()
    subscription = data.get("subscription")
    
    if not subscription:
        return jsonify({"error": "Suscripción requerida"}), 400
    
    try:
        PushSubscription.query.filter_by(
            barberia_id=id_barberia,
            barbero_id=id_barbero
        ).delete()
        
        sub = PushSubscription(
            barberia_id=id_barberia,
            barbero_id=id_barbero,
            subscription=subscription
        )
        db.session.add(sub)
        db.session.commit()
        logging.info(f"[PUSH] ✓ Suscripción guardada ID: {sub.id} (suscripciones anteriores eliminadas)")
        return jsonify({"mensaje": "Suscripción guardada", "id": sub.id}), 201
    except Exception as e:
        logging.error(f"[PUSH] Error BD: {e}")
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@push_bp.route("/subscribe-cliente", methods=["POST"])
def subscribe_cliente():
    logging.info("[PUSH CLIENTE] ===== SOLICITUD /subscribe-cliente =====")
    
    data = request.get_json()
    subscription = data.get("subscription")
    codigo_confirmacion = data.get("codigo_confirmacion")
    id_barberia = data.get("id_barberia")
    id_turno = data.get("id_turno")
    
    if not subscription or not codigo_confirmacion or not id_barberia:
        return jsonify({"error": "Faltan datos: subscription, codigo_confirmacion, id_barberia"}), 400
    
    from modelo.turno import Turno
    turno = Turno.query.filter_by(
        codigo_confirmacion=codigo_confirmacion,
        id_barberia=id_barberia
    ).first()
    
    if not turno:
        return jsonify({"error": "Turno no encontrado"}), 404
    
    id_turno_real = id_turno or turno.id_turno
    logging.info(f"[PUSH CLIENTE] Turno: {id_turno_real}, Código: {codigo_confirmacion}")
    
    try:
        endpoint = subscription.get('endpoint')
        
        PushSubscription.query.filter(
            PushSubscription.id_turno == id_turno_real
        ).delete()
        
        sub = PushSubscription(
            barberia_id=id_barberia,
            barbero_id=None,
            id_turno=id_turno_real,
            codigo_confirmacion=codigo_confirmacion,
            subscription=subscription
        )
        db.session.add(sub)
        db.session.commit()
        logging.info(f"[PUSH CLIENTE] ✓ Suscripción guardada ID: {sub.id}")
        
        try:
            from controlador.notificacion_push import enviar_notificacion_cliente
            titulo = "Notificaciones Activadas!"
            mensaje = "Recibirás alertas cuando sea tu turno. Te avisaremos cuando sea tu momento."
            enviar_notificacion_cliente(id_turno=id_turno_real, titulo=titulo, mensaje=mensaje)
            logging.info(f"[PUSH CLIENTE] ✓ Notificación de confirmación enviada")
        except Exception as e:
            logging.error(f"[PUSH CLIENTE] Error enviando notificación de confirmación: {e}")
        
        return jsonify({"mensaje": "Suscripción guardada", "id": sub.id}), 201
    except Exception as e:
        logging.error(f"[PUSH CLIENTE] Error BD: {e}")
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@push_bp.route("/unsubscribe", methods=["POST"])
@jwt_required()
def unsubscribe():
    logging.info("[PUSH UNSUBSCRIBE] ===== SOLICITUD /unsubscribe =====")
    identidad = get_jwt_identity()
    
    id_barberia = None
    id_barbero = None
    id_turno = None
    tipo_usuario = None
    
    if isinstance(identidad, dict):
        id_barberia = identidad.get("id_barberia")
        id_barbero = identidad.get("id_barbero")
        tipo_usuario = "barbero"
    else:
        from modelo.barbero import Barbero
        try:
            id_barbero = int(identidad)
            barbero = Barbero.query.get(id_barbero)
            if barbero:
                id_barberia = barbero.id_barberia
                tipo_usuario = "barbero"
            else:
                return jsonify({"error": f"Barbero no encontrado: {id_barbero}"}), 404
        except (ValueError, TypeError):
            barbero = Barbero.query.filter_by(correo=identidad).first()
            if barbero:
                id_barberia = barbero.id_barberia
                id_barbero = barbero.id_barbero
                tipo_usuario = "barbero"
            else:
                logging.warning(f"[PUSH UNSUBSCRIBE] Identidad no reconocida: {identidad}")
                return jsonify({"mensaje": "Suscripción eliminada"}), 200
    
    data = request.get_json()
    subscription = data.get("subscription")
    
    if not subscription:
        logging.warning("[PUSH UNSUBSCRIBE] Suscripción no proporcionada")
        return jsonify({"mensaje": "Suscripción eliminada"}), 200
    
    endpoint = subscription.get("endpoint") if isinstance(subscription, dict) else None
    
    if not endpoint:
        logging.warning("[PUSH UNSUBSCRIBE] Endpoint no encontrado en suscripción")
        return jsonify({"mensaje": "Suscripción eliminada"}), 200
    
    logging.info(f"[PUSH UNSUBSCRIBE] Tipo: {tipo_usuario}, Barbería: {id_barberia}, Barbero: {id_barbero}")
    logging.info(f"[PUSH UNSUBSCRIBE] Endpoint recibido: {endpoint}")
    
    try:
        query = PushSubscription.query.filter(
            PushSubscription.barberia_id == id_barberia,
            PushSubscription.barbero_id == id_barbero,
            PushSubscription.barbero_id.isnot(None)
        )
        
        logging.info(f"[PUSH UNSUBSCRIBE] Total suscripciones para barbero_id={id_barbero}: {query.count()}")
        
        eliminados = 0
        for sub in query.all():
            sub_endpoint = sub.subscription.get("endpoint") if sub.subscription else None
            logging.info(f"[PUSH UNSUBSCRIBE] Comparando: BD={sub_endpoint[:50] if sub_endpoint else 'None'}... vs RECIBIDO={endpoint[:50]}...")
            if sub_endpoint == endpoint:
                db.session.delete(sub)
                eliminados += 1
                logging.info(f"[PUSH UNSUBSCRIBE] ✓ Eliminando suscripción ID: {sub.id}")
        
        db.session.commit()
        
        if eliminados > 0:
            logging.info(f"[PUSH UNSUBSCRIBE] ✓ {eliminados} suscripción(es) eliminada(s)")
        else:
            logging.warning(f"[PUSH UNSUBSCRIBE] No se encontró suscripción con ese endpoint")
        
        return jsonify({"mensaje": "Suscripción eliminada", "eliminados": eliminados}), 200
        
    except Exception as e:
        logging.error(f"[PUSH UNSUBSCRIBE] Error: {e}")
        db.session.rollback()
        return jsonify({"mensaje": "Suscripción eliminada"}), 200