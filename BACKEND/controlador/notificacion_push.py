import json
import logging
import os
import time
import base64
from pywebpush import webpush
from modelo.push_subscription import PushSubscription
from database import db
from dotenv import load_dotenv
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import ec

load_dotenv()

logger = logging.getLogger(__name__)

# --- Claves fijas desde variables de entorno ---
VAPID_PUBLIC_KEY = os.environ.get('VAPID_PUBLIC_KEY')
VAPID_PRIVATE_KEY = os.environ.get('VAPID_PRIVATE_KEY')

if not VAPID_PUBLIC_KEY or not VAPID_PRIVATE_KEY:
    logger.warning("[VAPID] No se encontraron claves VAPID en .env. Se generarán claves nuevas, pero NO PERSISTIRÁN.")
    # Generar claves temporales (solo para pruebas)
    from pywebpush import Vapid
    _temp_vapid = Vapid()
    _temp_vapid.generate_keys()
    # Extraer clave pública en base64url
    public_bytes = _temp_vapid.public_key.public_bytes(
        encoding=serialization.Encoding.X962,
        format=serialization.PublicFormat.UncompressedPoint
    )
    VAPID_PUBLIC_KEY = base64.urlsafe_b64encode(public_bytes).decode().rstrip('=')
    # La clave privada de Vapid no es directamente exportable a base64url fácilmente.
    # Es mejor generar claves fijas con 'npx web-push generate-vapid-keys'
    # Por ahora, lanzamos error.
    raise RuntimeError("Faltan VAPID_PUBLIC_KEY o VAPID_PRIVATE_KEY en .env. Genera un par con: npx web-push generate-vapid-keys")

def get_vapid_public_key_base64url():
    """Devuelve la clave pública VAPID fija desde el .env"""
    return VAPID_PUBLIC_KEY

def enviar_notificacion_push(barberia_id, barbero_id, titulo, mensaje):
    logging.info(f"[PUSH] Enviando notificación a barberia={barberia_id}, barbero={barbero_id}, titulo={titulo}")
    
    if not VAPID_PRIVATE_KEY:
        logger.warning("[PUSH] No hay clave privada VAPID, no se puede enviar push")
        return 0
    
    subs = PushSubscription.query.filter_by(
        barberia_id=barberia_id,
        barbero_id=barbero_id
    ).all()
    
    logging.info(f"[PUSH] Suscripciones encontradas: {len(subs)}")
    if not subs:
        logger.warning(f"[PUSH] No hay suscripciones para barbero {barbero_id}")
        return 0
    
    timestamp = int(time.time())
    body = json.dumps({
        "title": titulo,
        "body": mensaje,
        "icon": "/pwa-192x192.png",
        "badge": "/pwa-192x192.png",
        "url": "/",
        "tag": f"turno-{timestamp}",
        "timestamp": timestamp,
        "requireInteraction": True
    })
    
    logging.info(f"[PUSH] Body: {body}")
    
    enviados = 0
    for sub in subs:
        try:
            logging.info(f"[PUSH] Enviando a suscripción {sub.id}, endpoint: {sub.subscription.get('endpoint', 'N/A')[:50]}...")
            logging.info(f"[PUSH] Keys: {sub.subscription.get('keys', {})}")
            
            result = webpush(
                subscription_info=sub.subscription,
                data=body,
                vapid_private_key=VAPID_PRIVATE_KEY,
                vapid_claims={"sub": "mailto:admin@barberapp.com"},
                ttl=3600,
                content_encoding="aes128gcm"
            )
            logger.info(f"[PUSH] Notificación enviada a suscripción {sub.id}, response: {result}")
            enviados += 1
        except Exception as e:
            logger.error(f"[PUSH] Error enviando push a suscripción {sub.id}: {e}")
            import traceback
            logger.error(traceback.format_exc())
    
    return enviados

def notificar_nuevo_turno(barberia_id, barbero_id, nombre_cliente, nombre_servicio):
    titulo = "Nuevo Turno!"
    mensaje = f"{nombre_cliente} - {nombre_servicio}"
    return enviar_notificacion_push(barberia_id, barbero_id, titulo, mensaje)