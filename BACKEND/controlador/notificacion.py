from twilio.rest import Client
from configuracion import Config
import logging

logger = logging.getLogger(__name__)

def get_twilio_client():
    if not Config.TWILIO_ACCOUNT_SID or not Config.TWILIO_AUTH_TOKEN:
        logger.warning("Twilio no configurado: credentials vacías")
        return None
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
        logger.error("enviar_whatsapp: número vacío")
        return False
    
    client = get_twilio_client()
    if not client:
        logger.error("enviar_whatsapp: client Twilio es None")
        return False
    
    try:
        telefono = formatear_telefono(to_number)
        logger.info(f"Enviando WhatsApp a {telefono}: {mensaje[:50]}...")
        message = client.messages.create(
            body=mensaje,
            from_=Config.TWILIO_WHATSAPP_NUMBER,
            to=f"whatsapp:{telefono}"
        )
        logger.info(f"WhatsApp enviado exitosamente: SID={message.sid}")
        return True
    except Exception as e:
        logger.error(f"Error al enviar WhatsApp: {str(e)}")
        return False

def notificar_nuevo_turno_barbero(barbero, nombre_cliente, nombre_servicio, precio, fecha_hora, telefono_cliente):
    if not barbero.telefono:
        return False
    
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
