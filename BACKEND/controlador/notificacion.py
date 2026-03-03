from twilio.rest import Client
from configuracion import Config
import logging

logger = logging.getLogger(__name__)

def get_twilio_client():
    if not Config.TWILIO_ACCOUNT_SID or not Config.TWILIO_AUTH_TOKEN:
        logger.warning("Twilio credentials not configured")
        return None
    logger.info(f"Twilio configured - SID: {Config.TWILIO_ACCOUNT_SID[:10]}..., Phone: {Config.TWILIO_WHATSAPP_NUMBER}")
    return Client(Config.TWILIO_ACCOUNT_SID, Config.TWILIO_AUTH_TOKEN)

def formatear_telefono(telefono):
    if not telefono:
        logger.error("Teléfono vacío o None")
        return None
    telefono = telefono.strip().replace(" ", "").replace("-", "").replace("(", "").replace(")", "")
    if telefono.startswith("+"):
        return telefono
    if telefono.startswith("57"):
        return "+" + telefono
    if telefono.startswith("3"):
        return "+57" + telefono
    if telefono.startswith("0"):
        return "+57" + telefono[1:]
    return "+57" + telefono

def enviar_whatsapp(to_number, mensaje):
    if not to_number:
        logger.error("No se puede enviar WhatsApp: número vacío")
        return False
    
    client = get_twilio_client()
    if not client:
        logger.warning("Twilio not configured, skipping WhatsApp notification")
        return False
    
    try:
        telefono = formatear_telefono(to_number)
        logger.info(f"Enviando WhatsApp al número: {telefono}")
        logger.info(f"Mensaje: {mensaje}")
        message = client.messages.create(
            body=mensaje,
            from_=Config.TWILIO_WHATSAPP_NUMBER,
            to=f"whatsapp:{telefono}"
        )
        logger.info(f"WhatsApp sent to {telefono}: {message.sid}")
        return True
    except Exception as e:
        logger.error(f"Error sending WhatsApp: {str(e)}")
        return False

def notificar_nuevo_turno_barbero(barbero, nombre_cliente, nombre_servicio, precio, fecha_hora, telefono_cliente):
    logger.info(f"Notificando al barbero: {barbero.nombre}, telefono: {barbero.telefono}")
    
    mensaje = f"""🔔 Nuevo Turno Asignado!

Cliente: {nombre_cliente}
Servicio: {nombre_servicio}
Precio: ${precio:,.0f}
Cuando: {fecha_hora}
Cliente tel: {telefono_cliente}"""
    
    return enviar_whatsapp(barbero.telefono, mensaje)

def notificar_turno_cliente(telefono_cliente, nombre_cliente, nombre_barbero, nombre_servicio, precio, fecha_hora, codigo_confirmacion):
    mensaje = f"""✅ Turno Confirmado!

Barbero: {nombre_barbero}
Servicio: {nombre_servicio}
Precio: ${precio:,.0f}
Cuando: {fecha_hora}
Código: {codigo_confirmacion}

¡Te esperamos! 💈"""
    
    return enviar_whatsapp(telefono_cliente, mensaje)
