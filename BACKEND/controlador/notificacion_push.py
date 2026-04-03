import json
import logging
from pywebpush import webpush
from modelo.push_subscription import PushSubscription
from database import db
from dotenv import load_dotenv
import os
import time

load_dotenv()

VAPID_PUBLIC_KEY = os.getenv("VAPID_PUBLIC_KEY", "")
VAPID_PRIVATE_KEY = os.getenv("VAPID_PRIVATE_KEY", "")

logger = logging.getLogger(__name__)

def enviar_notificacion_push(barberia_id, barbero_id, titulo, mensaje):
    if not VAPID_PUBLIC_KEY or not VAPID_PRIVATE_KEY:
        logger.warning("VAPID keys no configuradas, saltando notificación push")
        return 0
    
    subs = PushSubscription.query.filter_by(
        barberia_id=barberia_id,
        barbero_id=barbero_id
    ).all()
    
    if not subs:
        logger.info(f"No hay suscripciones push para barbero {barbero_id}")
        return 0
    
    timestamp = int(time.time())
    body = json.dumps({
        "title": titulo,
        "body": mensaje,
        "icon": "/pwa-192x192.png",
        "badge": "/pwa-192x192.png",
        "tag": f"turno-{timestamp}",
        "timestamp": timestamp
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
            logger.info(f"Notificación push enviada a subscripción {sub.id}")
            enviados += 1
        except Exception as e:
            logger.error(f"Error enviando push a subscripción {sub.id}: {e}")
    
    return enviados

def notificar_nuevo_turno(barberia_id, barbero_id, nombre_cliente, nombre_servicio):
    titulo = "Nuevo Turno!"
    mensaje = f"{nombre_cliente} - {nombre_servicio}"
    return enviar_notificacion_push(barberia_id, barbero_id, titulo, mensaje)
