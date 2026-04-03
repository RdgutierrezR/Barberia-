from flask import Blueprint, request, jsonify
from modelo.push_subscription import PushSubscription
from database import db
import json
import logging
from flask_jwt_extended import jwt_required, get_jwt_identity
from dotenv import load_dotenv
import os

load_dotenv()

push_bp = Blueprint("push", __name__, url_prefix="/api/push")

VAPID_PUBLIC_KEY = os.getenv("VAPID_PUBLIC_KEY", "")
VAPID_PRIVATE_KEY = os.getenv("VAPID_PRIVATE_KEY", "")

@push_bp.route("/public-key", methods=["GET"])
def get_public_key():
    if not VAPID_PUBLIC_KEY:
        return jsonify({"error": "Clave VAPID no configurada"}), 500
    return jsonify({"publicKey": VAPID_PUBLIC_KEY})

@push_bp.route("/subscribe", methods=["POST"])
@jwt_required()
def subscribe():
    identidad = get_jwt_identity()
    id_barberia = identidad.get("id_barberia")
    id_barbero = identidad.get("id_barbero")
    
    data = request.get_json()
    subscription = data.get("subscription")
    
    if not subscription:
        logging.warning("[PUSH] Suscripción requerida pero no recibida")
        return jsonify({"error": "Suscripción requerida"}), 400
    
    logging.info(f"[PUSH] Recibida suscripción para barbería {id_barberia}, barbero {id_barbero}")
    logging.info(f"[PUSH] Subscription keys: {subscription.get('keys', {})}")
    
    sub = PushSubscription(
        barberia_id=id_barberia,
        barbero_id=id_barbero,
        subscription=subscription
    )
    db.session.add(sub)
    db.session.commit()
    
    logging.info(f"[PUSH] Nueva suscripción guardada con ID: {sub.id}")
    
    return jsonify({"mensaje": "Suscripción guardada", "id": sub.id}), 201

@push_bp.route("/unsubscribe", methods=["POST"])
@jwt_required()
def unsubscribe():
    identidad = get_jwt_identity()
    id_barberia = identidad.get("id_barberia")
    id_barbero = identidad.get("id_barbero")
    
    data = request.get_json()
    subscription = data.get("subscription")
    
    if not subscription:
        return jsonify({"error": "Suscripción requerida"}), 400
    
    sub = PushSubscription.query.filter_by(
        barberia_id=id_barberia,
        barbero_id=id_barbero
    ).first()
    
    if sub:
        db.session.delete(sub)
        db.session.commit()
    
    return jsonify({"mensaje": "Suscripción eliminada"})

@push_bp.route("/send", methods=["POST"])
@jwt_required()
def send_notification():
    identidad = get_jwt_identity()
    id_barberia = identidad.get("id_barberia")
    id_barbero = identidad.get("id_barbero")
    
    data = request.get_json()
    titulo = data.get("title", "Nuevo Turno")
    mensaje = data.get("message", "")
    
    subs = PushSubscription.query.filter_by(
        barberia_id=id_barberia,
        barbero_id=id_barbero
    ).all()
    
    if not subs:
        return jsonify({"mensaje": "No hay suscripciones para este barbero"})
    
    from pywebpush import webpush
    
    body = json.dumps({
        "title": titulo,
        "body": mensaje,
        "icon": "/pwa-192x192.png",
        "badge": "/pwa-192x192.png"
    })
    
    enviados = 0
    for sub in subs:
        try:
            webpush(
                sub.subscription,
                data=body,
                vapid_private_key=VAPID_PRIVATE_KEY,
                vapid_public_key=VAPID_PUBLIC_KEY,
                ttl=3600
            )
            enviados += 1
        except Exception as e:
            logging.error(f"Error enviando push: {e}")
    
    return jsonify({"mensaje": f"Notificación enviada a {enviados} dispositivos"})
